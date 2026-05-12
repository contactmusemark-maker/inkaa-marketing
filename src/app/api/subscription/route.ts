import { NextResponse, type NextRequest } from 'next/server';
import { getPlanAILimit } from '@/lib/ai/limits';
import { requireRoles } from '@/lib/rbac';
import { getAuthToken, getCurrentUser, supabaseFetch } from '@/lib/supabase';

const allowedPlans = ['starter', 'pro', 'agency'] as const;
type Plan = (typeof allowedPlans)[number];

function isPlan(value: unknown): value is Plan {
  return typeof value === 'string' && allowedPlans.includes(value as Plan);
}

export async function POST(request: NextRequest) {
  const auth = await requireRoles(request, ['super_admin', 'admin']);
  if (!auth.ok) return auth.response;

  const token = getAuthToken(request);
  if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  try {
    const {
      plan,
      billingCycle = 'monthly',
      razorpayCustomerId,
      razorpaySubscriptionId,
      razorpayPaymentId,
    } = await request.json();
    if (!isPlan(plan)) {
      return NextResponse.json({ error: 'A valid plan is required.' }, { status: 400 });
    }
    const normalizedBillingCycle = billingCycle === 'annual' ? 'annual' : 'monthly';

    const user = await getCurrentUser(token);
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd =
      normalizedBillingCycle === 'annual'
        ? new Date(now.getFullYear() + 1, now.getMonth(), 1)
        : new Date(now.getFullYear(), now.getMonth() + 1, 1);

    await supabaseFetch(`/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({
        plan,
        subscription_status: 'active',
      }),
    });

    await supabaseFetch('/rest/v1/subscriptions?on_conflict=user_id', {
      method: 'POST',
      token,
      headers: { Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify({
        user_id: user.id,
        plan,
        status: 'active',
        billing_cycle: normalizedBillingCycle,
        ai_limit: getPlanAILimit(plan),
        ai_used: 0,
        current_period_start: periodStart.toISOString(),
        current_period_end: periodEnd.toISOString(),
        razorpay_customer_id: razorpayCustomerId || null,
        razorpay_subscription_id: razorpaySubscriptionId || null,
        razorpay_payment_id: razorpayPaymentId || null,
        updated_at: now.toISOString(),
      }),
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set('inkaa_subscription', 'active', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to activate subscription.' },
      { status: 500 }
    );
  }
}
