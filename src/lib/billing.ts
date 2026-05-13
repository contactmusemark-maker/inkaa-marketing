import crypto from 'node:crypto';

export type BillingPlan = 'starter' | 'pro' | 'agency';
export type BillingCycle = 'monthly' | 'annual';
export type SubscriptionStatus =
  | 'trial'
  | 'trial_expired'
  | 'active'
  | 'past_due'
  | 'cancelled'
  | 'expired';

export const TRIAL_DAYS = 14;

export const BILLING_PLANS: Record<
  BillingPlan,
  {
    name: string;
    monthlyAmount: number;
    annualAmount: number;
    aiLimit: number | null;
    features: string[];
  }
> = {
  starter: {
    name: 'Starter',
    monthlyAmount: 199900,
    annualAmount: 1999900,
    aiLimit: 20,
    features: [
      'CRM for lean Indian agencies',
      '20 AI generations/month',
      'Client and invoice management',
      'Razorpay-ready billing',
    ],
  },
  pro: {
    name: 'Pro',
    monthlyAmount: 499900,
    annualAmount: 4999900,
    aiLimit: 300,
    features: [
      'Advanced agency CRM',
      '300 AI generations/month',
      'Campaign analytics',
      'Team workflows',
    ],
  },
  agency: {
    name: 'Agency',
    monthlyAmount: 999900,
    annualAmount: 9999900,
    aiLimit: null,
    features: [
      'Unlimited AI fair usage',
      'White-label',
      'Advanced analytics',
      'Team collaboration',
    ],
  },
};

export function getPlanAmount(plan: BillingPlan, cycle: BillingCycle) {
  return cycle === 'annual' ? BILLING_PLANS[plan].annualAmount : BILLING_PLANS[plan].monthlyAmount;
}

export function isBillingPlan(value: unknown): value is BillingPlan {
  return typeof value === 'string' && ['starter', 'pro', 'agency'].includes(value);
}

export function normalizeBillingCycle(value: unknown): BillingCycle {
  return value === 'annual' ? 'annual' : 'monthly';
}

export function getPlanAILimit(plan?: string | null) {
  if (plan === 'agency') return null;
  if (plan === 'pro') return 300;
  return 20;
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function getTrialPeriod(now = new Date()) {
  return {
    trialStart: now,
    trialEnd: addDays(now, TRIAL_DAYS),
  };
}

export function getBillingPeriod(cycle: BillingCycle, now = new Date()) {
  const end = new Date(now);
  if (cycle === 'annual') {
    end.setFullYear(end.getFullYear() + 1);
  } else {
    end.setMonth(end.getMonth() + 1);
  }

  return { periodStart: now, periodEnd: end };
}

export function resolveSubscriptionStatus(status?: string | null, trialEnd?: string | null) {
  if (status === 'trial' && trialEnd && new Date(trialEnd).getTime() < Date.now()) {
    return 'trial_expired' satisfies SubscriptionStatus;
  }

  if (status === 'active') return 'active';
  if (status === 'past_due') return 'past_due';
  if (status === 'cancelled') return 'cancelled';
  if (status === 'expired') return 'expired';
  if (status === 'trial_expired') return 'trial_expired';
  return 'trial';
}

export function canAccessPaidFeatures(status?: string | null, trialEnd?: string | null) {
  const normalized = resolveSubscriptionStatus(status, trialEnd);
  return normalized === 'active' || normalized === 'trial';
}

function getRazorpayAuthHeader() {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay keys are not configured.');
  }

  return {
    keyId,
    authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
  };
}

export function getRazorpayPlanId(plan: BillingPlan, cycle: BillingCycle) {
  const key = `RAZORPAY_PLAN_${plan.toUpperCase()}_${cycle.toUpperCase()}`;
  const value = process.env[key];

  if (!value) {
    throw new Error(`${key} is not configured. Create the recurring plan in Razorpay first.`);
  }

  return value;
}

export async function createRazorpaySubscription(input: {
  userId: string;
  email?: string;
  plan: BillingPlan;
  billingCycle: BillingCycle;
}) {
  const { keyId, authorization } = getRazorpayAuthHeader();
  const planId = getRazorpayPlanId(input.plan, input.billingCycle);

  const response = await fetch('https://api.razorpay.com/v1/subscriptions', {
    method: 'POST',
    headers: {
      Authorization: authorization,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      plan_id: planId,
      total_count: input.billingCycle === 'annual' ? 10 : 120,
      quantity: 1,
      customer_notify: 1,
      notes: {
        user_id: input.userId,
        email: input.email || '',
        plan: input.plan,
        billing_cycle: input.billingCycle,
      },
    }),
    cache: 'no-store',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.description || 'Unable to create Razorpay subscription.');
  }

  return {
    keyId,
    subscriptionId: data.id as string,
    planId,
    status: data.status as string,
  };
}

export function verifyRazorpayCheckoutSignature(input: {
  orderId?: string | null;
  subscriptionId?: string | null;
  paymentId: string;
  signature: string;
}) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) throw new Error('Razorpay key secret is not configured.');

  const base = input.subscriptionId
    ? `${input.paymentId}|${input.subscriptionId}`
    : `${input.orderId}|${input.paymentId}`;
  const expected = crypto.createHmac('sha256', secret).update(base).digest('hex');

  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(input.signature);

  return (
    expectedBuffer.length === signatureBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
  );
}
