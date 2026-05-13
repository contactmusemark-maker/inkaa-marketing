import { NextResponse, type NextRequest } from 'next/server';
import {
  type BillingPlan,
  getBillingPeriod,
  getPlanAmount,
  getPlanAILimit,
  isBillingPlan,
  normalizeBillingCycle,
  verifyRazorpayCheckoutSignature,
} from '@/lib/billing';
import { requireRoles } from '@/lib/rbac';
import { getAuthToken, getCurrentUser, supabaseAdminFetch, supabaseFetch } from '@/lib/supabase';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const auth = await requireRoles(request, ['super_admin', 'admin']);
  if (!auth.ok) return auth.response;

  const token = getAuthToken(request);
  if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  try {
    const body = await request.json();
    const plan: BillingPlan | null = isBillingPlan(body.plan) ? body.plan : null;
    const billingCycle = normalizeBillingCycle(body.billingCycle);
    const paymentId = typeof body.razorpayPaymentId === 'string' ? body.razorpayPaymentId : '';
    const subscriptionId =
      typeof body.razorpaySubscriptionId === 'string' ? body.razorpaySubscriptionId : '';
    const signature = typeof body.razorpaySignature === 'string' ? body.razorpaySignature : '';

    if (!plan || !paymentId || !subscriptionId || !signature) {
      return NextResponse.json({ error: 'Missing payment verification details.' }, { status: 400 });
    }

    const verified = verifyRazorpayCheckoutSignature({
      subscriptionId,
      paymentId,
      signature,
    });

    if (!verified) {
      return NextResponse.json({ error: 'Invalid Razorpay payment signature.' }, { status: 401 });
    }

    const user = await getCurrentUser(token);
    const period = getBillingPeriod(billingCycle);
    const now = new Date();
    const invoiceNumber = `INKAA-${now.getFullYear()}-${paymentId.slice(-8).toUpperCase()}`;
    const amount = getPlanAmount(plan, billingCycle);

    await supabaseFetch('/rest/v1/subscriptions?on_conflict=user_id', {
      method: 'POST',
      token,
      headers: { Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify({
        user_id: user.id,
        plan,
        status: 'active',
        billing_cycle: billingCycle,
        ai_limit: getPlanAILimit(plan),
        ai_used: 0,
        current_period_start: period.periodStart.toISOString(),
        current_period_end: period.periodEnd.toISOString(),
        next_billing_at: period.periodEnd.toISOString(),
        razorpay_subscription_id: subscriptionId,
        razorpay_payment_id: paymentId,
        updated_at: now.toISOString(),
      }),
    });

    await supabaseFetch(`/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({
        plan,
        subscription_status: 'active',
        updated_at: now.toISOString(),
      }),
    }).catch(() => null);

    await supabaseAdminFetch('/rest/v1/subscription_payments', {
      method: 'POST',
      body: JSON.stringify({
        user_id: user.id,
        plan,
        billing_cycle: billingCycle,
        amount,
        currency: 'INR',
        status: 'paid',
        razorpay_subscription_id: subscriptionId,
        razorpay_payment_id: paymentId,
        paid_at: now.toISOString(),
      }),
    }).catch(() => null);

    await supabaseAdminFetch('/rest/v1/billing_invoices', {
      method: 'POST',
      body: JSON.stringify({
        user_id: user.id,
        invoice_number: invoiceNumber,
        plan,
        billing_cycle: billingCycle,
        amount,
        currency: 'INR',
        status: 'paid',
        razorpay_payment_id: paymentId,
        issued_at: now.toISOString(),
        due_at: now.toISOString(),
        paid_at: now.toISOString(),
      }),
    }).catch(() => null);

    const response = NextResponse.json({ ok: true, status: 'active' });
    response.cookies.set('inkaa_subscription', 'active', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to verify subscription payment.' },
      { status: 500 }
    );
  }
}
