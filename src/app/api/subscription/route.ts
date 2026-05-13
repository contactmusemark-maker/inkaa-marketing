import { NextResponse, type NextRequest } from 'next/server';
import {
  BILLING_PLANS,
  type BillingPlan,
  canAccessPaidFeatures,
  createRazorpaySubscription,
  getBillingPeriod,
  getPlanAILimit,
  getTrialPeriod,
  isBillingPlan,
  normalizeBillingCycle,
  resolveSubscriptionStatus,
} from '@/lib/billing';
import { requireRoles } from '@/lib/rbac';
import { getAuthToken, getCurrentUser, getProfile, supabaseFetch } from '@/lib/supabase';

type SubscriptionRow = {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  billing_cycle: string;
  ai_limit: number | null;
  ai_used: number;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  razorpay_subscription_id: string | null;
  updated_at: string;
};

async function getSubscription(token: string, userId: string) {
  const rows = await supabaseFetch<SubscriptionRow[]>(
    `/rest/v1/subscriptions?user_id=eq.${encodeURIComponent(userId)}&select=*&limit=1`,
    { token }
  );

  return rows[0] ?? null;
}

async function ensureTrialSubscription(token: string, userId: string, plan = 'starter') {
  const existing = await getSubscription(token, userId).catch(() => null);
  if (existing) return existing;

  const trial = getTrialPeriod();
  const rows = await supabaseFetch<SubscriptionRow[]>(
    '/rest/v1/subscriptions?on_conflict=user_id&select=*',
    {
      method: 'POST',
      token,
      headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify({
        user_id: userId,
        plan,
        status: 'trial',
        billing_cycle: 'monthly',
        ai_limit: getPlanAILimit(plan),
        ai_used: 0,
        trial_started_at: trial.trialStart.toISOString(),
        trial_ends_at: trial.trialEnd.toISOString(),
        current_period_start: trial.trialStart.toISOString(),
        current_period_end: trial.trialEnd.toISOString(),
      }),
    }
  );

  return rows[0];
}

function toPublicSubscription(row: SubscriptionRow) {
  const status = resolveSubscriptionStatus(row.status, row.trial_ends_at);
  const trialEndsAt = row.trial_ends_at ? new Date(row.trial_ends_at) : null;
  const trialDaysRemaining =
    status === 'trial' && trialEndsAt
      ? Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / 86_400_000))
      : 0;

  return {
    ...row,
    status,
    planName: BILLING_PLANS[(row.plan as keyof typeof BILLING_PLANS) || 'starter']?.name,
    trialDaysRemaining,
    accessAllowed: canAccessPaidFeatures(row.status, row.trial_ends_at),
  };
}

export async function GET(request: NextRequest) {
  const auth = await requireRoles(request, ['super_admin', 'admin', 'manager', 'member']);
  if (!auth.ok) return auth.response;

  const token = getAuthToken(request);
  if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  try {
    const user = await getCurrentUser(token);
    const subscription = await ensureTrialSubscription(token, user.id);
    const [payments, invoices] = await Promise.all([
      supabaseFetch(
        `/rest/v1/subscription_payments?user_id=eq.${encodeURIComponent(user.id)}&select=*&order=created_at.desc&limit=20`,
        { token }
      ).catch(() => []),
      supabaseFetch(
        `/rest/v1/billing_invoices?user_id=eq.${encodeURIComponent(user.id)}&select=*&order=created_at.desc&limit=20`,
        { token }
      ).catch(() => []),
    ]);

    return NextResponse.json({
      subscription: toPublicSubscription(subscription),
      payments,
      invoices,
      plans: BILLING_PLANS,
      razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || '',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load subscription.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireRoles(request, ['super_admin', 'admin']);
  if (!auth.ok) return auth.response;

  const token = getAuthToken(request);
  if (!token) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  try {
    const body = await request.json();
    const action = body.action || 'create_checkout';
    const plan: BillingPlan | null = isBillingPlan(body.plan) ? body.plan : null;
    const billingCycle = normalizeBillingCycle(body.billingCycle);

    if (!plan) {
      return NextResponse.json({ error: 'A valid plan is required.' }, { status: 400 });
    }

    const user = await getCurrentUser(token);
    const profile = await getProfile(token, user.id).catch(() => null);

    if (action === 'start_trial') {
      const trial = getTrialPeriod();
      const subscription = await ensureTrialSubscription(token, user.id, plan);

      await supabaseFetch(`/rest/v1/subscriptions?id=eq.${encodeURIComponent(subscription.id)}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({
          plan,
          status: 'trial',
          billing_cycle: 'monthly',
          ai_limit: getPlanAILimit(plan),
          ai_used: 0,
          trial_started_at: subscription.trial_started_at || trial.trialStart.toISOString(),
          trial_ends_at: subscription.trial_ends_at || trial.trialEnd.toISOString(),
          current_period_start: subscription.current_period_start || trial.trialStart.toISOString(),
          current_period_end: subscription.current_period_end || trial.trialEnd.toISOString(),
          updated_at: new Date().toISOString(),
        }),
      });

      await supabaseFetch(`/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({
          plan,
          subscription_status: 'trial',
          updated_at: new Date().toISOString(),
        }),
      }).catch(() => null);

      const response = NextResponse.json({ ok: true, status: 'trial' });
      response.cookies.set('inkaa_subscription', 'trial', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 14,
      });
      return response;
    }

    const checkout = await createRazorpaySubscription({
      userId: user.id,
      email: profile?.email ?? user.email,
      plan,
      billingCycle,
    });
    const period = getBillingPeriod(billingCycle);

    await supabaseFetch('/rest/v1/subscriptions?on_conflict=user_id', {
      method: 'POST',
      token,
      headers: { Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify({
        user_id: user.id,
        plan,
        status: 'created',
        billing_cycle: billingCycle,
        ai_limit: getPlanAILimit(plan),
        ai_used: 0,
        current_period_start: period.periodStart.toISOString(),
        current_period_end: period.periodEnd.toISOString(),
        razorpay_subscription_id: checkout.subscriptionId,
        updated_at: new Date().toISOString(),
      }),
    });

    return NextResponse.json({
      ok: true,
      checkout: {
        keyId: checkout.keyId,
        subscriptionId: checkout.subscriptionId,
        plan,
        billingCycle,
        name: BILLING_PLANS[plan].name,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to start subscription checkout.' },
      { status: 500 }
    );
  }
}
