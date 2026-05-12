import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { getPlanAILimit } from '@/lib/ai/limits';
import { supabaseAdminFetch } from '@/lib/supabase';

export const runtime = 'nodejs';

type RazorpayEntity = {
  id?: string;
  status?: string;
  notes?: Record<string, string | undefined>;
  subscription_id?: string;
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

  if (!userId && !razorpaySubscriptionId) return null;

  const failed = event.includes('failed') || subscription?.status === 'cancelled';

  return {
    userId,
    razorpaySubscriptionId,
    razorpayPaymentId: payment?.id || null,
    plan,
    status: failed ? 'past_due' : 'active',
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

    const body = JSON.stringify({
      plan: update.plan,
      status: update.status,
      ai_limit: getPlanAILimit(update.plan),
      ai_used: update.status === 'active' ? 0 : undefined,
      razorpay_subscription_id: update.razorpaySubscriptionId || null,
      razorpay_payment_id: update.razorpayPaymentId,
      updated_at: new Date().toISOString(),
    });

    const filter = update.userId
      ? `user_id=eq.${encodeURIComponent(update.userId)}`
      : `razorpay_subscription_id=eq.${encodeURIComponent(update.razorpaySubscriptionId || '')}`;

    await supabaseAdminFetch(`/rest/v1/subscriptions?${filter}`, {
      method: 'PATCH',
      body,
    });

    if (update.userId) {
      await supabaseAdminFetch(`/rest/v1/profiles?id=eq.${encodeURIComponent(update.userId)}`, {
        method: 'PATCH',
        body: JSON.stringify({
          plan: update.plan,
          subscription_status: update.status,
          updated_at: new Date().toISOString(),
        }),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to process Razorpay webhook.' },
      { status: 500 }
    );
  }
}
