import { supabaseFetch } from '@/lib/supabase';

export type AIPlan = 'Starter' | 'Pro' | 'Agency';
export type BillingCycle = 'monthly' | 'annual';

export type AILimitStatus = {
  subscriptionId: string | null;
  plan: AIPlan;
  status: string;
  billingCycle: BillingCycle;
  used: number;
  limit: number | null;
  remaining: number | null;
  allowed: boolean;
  resetAt: string;
  upgradeRequired: boolean;
};

type SubscriptionRow = {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  billing_cycle: string;
  ai_limit: number | null;
  ai_used: number | null;
  current_period_start: string | null;
  current_period_end: string | null;
};

const MONTHLY_LIMITS: Record<AIPlan, number | null> = {
  Starter: 20,
  Pro: 300,
  Agency: null,
};

export function normalizeAIPlan(plan?: string | null): AIPlan {
  const normalized = plan?.toLowerCase();
  if (normalized === 'agency') return 'Agency';
  if (normalized === 'pro') return 'Pro';
  return 'Starter';
}

export function getPlanAILimit(plan?: string | null) {
  return MONTHLY_LIMITS[normalizeAIPlan(plan)];
}

function toPlanValue(plan: AIPlan) {
  return plan.toLowerCase();
}

function normalizeBillingCycle(cycle?: string | null): BillingCycle {
  return cycle === 'annual' ? 'annual' : 'monthly';
}

function startOfCurrentMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function startOfNextMonth() {
  const now = startOfCurrentMonth();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

function toLimitStatus(row: SubscriptionRow): AILimitStatus {
  const plan = normalizeAIPlan(row.plan);
  const limit = row.ai_limit ?? MONTHLY_LIMITS[plan];
  const used = row.ai_used ?? 0;
  const remaining = limit === null ? null : Math.max(0, limit - used);
  const active = ['active', 'trial'].includes(row.status);

  return {
    subscriptionId: row.id,
    plan,
    status: row.status,
    billingCycle: normalizeBillingCycle(row.billing_cycle),
    used,
    limit,
    remaining,
    allowed: active && (limit === null || used < limit),
    resetAt: row.current_period_end || startOfNextMonth().toISOString(),
    upgradeRequired: active && limit !== null && used >= limit,
  };
}

function starterFallbackStatus(): AILimitStatus {
  const limit = MONTHLY_LIMITS.Starter;

  return {
    subscriptionId: null,
    plan: 'Starter',
    status: 'active',
    billingCycle: 'monthly',
    used: 0,
    limit,
    remaining: limit,
    allowed: true,
    resetAt: startOfNextMonth().toISOString(),
    upgradeRequired: false,
  };
}

async function fetchSubscription(token: string, userId: string) {
  const rows = await supabaseFetch<SubscriptionRow[]>(
    `/rest/v1/subscriptions?user_id=eq.${encodeURIComponent(userId)}&select=*`,
    { token }
  );

  return rows[0] ?? null;
}

async function createSubscription(token: string, userId: string, plan?: string | null) {
  const normalizedPlan = normalizeAIPlan(plan);
  const rows = await supabaseFetch<SubscriptionRow[]>(
    '/rest/v1/subscriptions?on_conflict=user_id&select=*',
    {
      method: 'POST',
      token,
      headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify({
        user_id: userId,
        plan: toPlanValue(normalizedPlan),
        status: 'active',
        billing_cycle: 'monthly',
        ai_limit: MONTHLY_LIMITS[normalizedPlan],
        ai_used: 0,
        current_period_start: startOfCurrentMonth().toISOString(),
        current_period_end: startOfNextMonth().toISOString(),
      }),
    }
  );

  return rows[0];
}

async function resetExpiredSubscription(token: string, row: SubscriptionRow) {
  if (!row.current_period_end || new Date(row.current_period_end).getTime() > Date.now()) {
    return row;
  }

  const plan = normalizeAIPlan(row.plan);
  const rows = await supabaseFetch<SubscriptionRow[]>(
    `/rest/v1/subscriptions?id=eq.${encodeURIComponent(row.id)}&select=*`,
    {
      method: 'PATCH',
      token,
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        ai_used: 0,
        ai_limit: MONTHLY_LIMITS[plan],
        current_period_start: startOfCurrentMonth().toISOString(),
        current_period_end: startOfNextMonth().toISOString(),
        updated_at: new Date().toISOString(),
      }),
    }
  );

  return rows[0] ?? row;
}

export async function getMonthlyAIUsage(token: string, userId: string, plan?: string | null) {
  const existing = await fetchSubscription(token, userId).catch(() => null);
  const created = existing ?? (await createSubscription(token, userId, plan).catch(() => null));
  if (!created) return starterFallbackStatus();

  const row = await resetExpiredSubscription(token, created).catch(() => created);

  return toLimitStatus(row);
}

export async function ensureStarterSubscription(token: string, userId: string) {
  const existing = await fetchSubscription(token, userId).catch(() => null);
  return existing ?? (await createSubscription(token, userId, 'starter'));
}

export async function incrementAIUsage(
  token: string,
  subscriptionId: string | null,
  nextUsed: number
) {
  if (!subscriptionId) return;

  await supabaseFetch(`/rest/v1/subscriptions?id=eq.${encodeURIComponent(subscriptionId)}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({
      ai_used: nextUsed,
      updated_at: new Date().toISOString(),
    }),
  }).catch(() => null);
}
