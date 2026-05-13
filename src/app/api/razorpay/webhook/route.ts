import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import {
  type BillingPlan,
  getBillingPeriod,
  getPlanAmount,
  getPlanAILimit,
  isBillingPlan,
  normalizeBillingCycle,
} from '@/lib/billing';
import { supabaseAdminFetch } from '@/lib/supabase';

export const runtime = 'nodejs';

type RazorpayEntity = {
  id?: string;
  status?: string;
  notes?: Record<string, string | undefined>;
  subscription_id?: string;
  amount?: number;
  currency?: string;
  paid_at?: number;
  created_at?: number;
};

type RazorpayWebhookPayload = {
  event?: string;
  payload?: {
    subscription?: { entity?: RazorpayEntity };
    payment?: { entity?: RazorpayEntity };
  };
};

function isValidSignature(body: string, signature: string | null) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  return (
    expectedBuffer.length === signatureBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
  );
}

function getSubscriptionUpdate(payload: RazorpayWebhookPayload) {
  const event = payload.event || '';
  const subscription = payload.payload?.subscription?.entity;
  const payment = payload.payload?.payment?.entity;
  const notes = subscription?.notes || payment?.notes || {};
  const razorpaySubscriptionId =
    subscription?.id || payment?.subscription_id || notes.subscription_id;
  const userId = notes.user_id;
  const plan = notes.plan || 'starter';
  const billingCycle = normalizeBillingCycle(notes.billing_cycle);
  const billingPlan: BillingPlan = isBillingPlan(plan) ? plan : 'starter';

  if (!userId && !razorpaySubscriptionId) return null;

  const failed =
    event.includes('failed') ||
    subscription?.status === 'cancelled' ||
    subscription?.status === 'expired';
  const cancelled = subscription?.status === 'cancelled';
  const expired = subscription?.status === 'expired';

  return {
    userId,
    razorpaySubscriptionId,
    razorpayPaymentId: payment?.id || null,
    plan,
    billingCycle,
    amount: payment?.amount || getPlanAmount(billingPlan, billingCycle),
    currency: payment?.currency || 'INR',
    status: cancelled ? 'cancelled' : expired ? 'expired' : failed ? 'past_due' : 'active',
  };
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-razorpay-signature');

  if (!isValidSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid Razorpay signature.' }, { status: 401 });
  }

  try {
    const payload = JSON.parse(rawBody) as RazorpayWebhookPayload;
    const update = getSubscriptionUpdate(payload);

    if (!update) return NextResponse.json({ ok: true, ignored: true });
    const now = new Date();
    const period = getBillingPeriod(update.billingCycle, now);
    const existingRows =
      !update.userId && update.razorpaySubscriptionId
        ? await supabaseAdminFetch<{ user_id: string }[]>(
            `/rest/v1/subscriptions?razorpay_subscription_id=eq.${encodeURIComponent(
              update.razorpaySubscriptionId
            )}&select=user_id&limit=1`
          ).catch(() => [])
        : [];
    const effectiveUserId = update.userId || existingRows[0]?.user_id;

    const body = JSON.stringify({
      plan: update.plan,
      status: update.status,
      billing_cycle: update.billingCycle,
      ai_limit: getPlanAILimit(update.plan),
      ai_used: update.status === 'active' ? 0 : undefined,
      current_period_start:
        update.status === 'active' ? period.periodStart.toISOString() : undefined,
      current_period_end: update.status === 'active' ? period.periodEnd.toISOString() : undefined,
      next_billing_at: update.status === 'active' ? period.periodEnd.toISOString() : undefined,
      razorpay_subscription_id: update.razorpaySubscriptionId || null,
      razorpay_payment_id: update.razorpayPaymentId,
      updated_at: now.toISOString(),
    });

    const filter = update.userId
      ? `user_id=eq.${encodeURIComponent(update.userId)}`
      : `razorpay_subscription_id=eq.${encodeURIComponent(update.razorpaySubscriptionId || '')}`;

    await supabaseAdminFetch(`/rest/v1/subscriptions?${filter}`, {
      method: 'PATCH',
      body,
    });

    if (effectiveUserId) {
      await supabaseAdminFetch(`/rest/v1/profiles?id=eq.${encodeURIComponent(effectiveUserId)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          plan: update.plan,
          subscription_status: update.status,
          updated_at: now.toISOString(),
        }),
      });

      if (update.razorpayPaymentId) {
        const invoiceNumber = `INKAA-${now.getFullYear()}-${update.razorpayPaymentId
          .slice(-8)
          .toUpperCase()}`;

        await supabaseAdminFetch('/rest/v1/subscription_payments', {
          method: 'POST',
          body: JSON.stringify({
            user_id: effectiveUserId,
            plan: update.plan,
            billing_cycle: update.billingCycle,
            amount: update.amount || 0,
            currency: update.currency,
            status: update.status === 'active' ? 'paid' : 'failed',
            razorpay_subscription_id: update.razorpaySubscriptionId,
            razorpay_payment_id: update.razorpayPaymentId,
            paid_at: update.status === 'active' ? now.toISOString() : null,
          }),
        }).catch(() => null);

        await supabaseAdminFetch('/rest/v1/billing_invoices', {
          method: 'POST',
          body: JSON.stringify({
            user_id: effectiveUserId,
            invoice_number: invoiceNumber,
            plan: update.plan,
            billing_cycle: update.billingCycle,
            amount: update.amount || 0,
            currency: update.currency,
            status: update.status === 'active' ? 'paid' : 'failed',
            razorpay_payment_id: update.razorpayPaymentId,
            issued_at: now.toISOString(),
            due_at: now.toISOString(),
            paid_at: update.status === 'active' ? now.toISOString() : null,
          }),
        }).catch(() => null);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to process Razorpay webhook.' },
      { status: 500 }
    );
  }
}
