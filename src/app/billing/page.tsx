'use client';

import AppLayout from '@/components/AppLayout';
import {
  BuildingStorefrontIcon,
  CheckIcon,
  ClockIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

const plans = [
  {
    name: 'Starter',
    price: '₹1,999',
    annualPrice: '₹19,999',
    annualSavings: 'Save ₹3,989/year',
    period: '/month',
    features: [
      'CRM for lean Indian agencies',
      '20 AI generations/month',
      'GST invoicing',
      'Razorpay-ready billing',
      'Email support',
    ],
    current: false,
  },
  {
    name: 'Pro',
    price: '₹4,999',
    annualPrice: '₹49,999',
    annualSavings: 'Save ₹9,989/year',
    period: '/month',
    features: [
      'Advanced agency CRM',
      '300 AI generations/month',
      'Campaign analytics',
      'Team workflows',
      'Retainer operations',
      'Priority support',
    ],
    current: false,
  },
  {
    name: 'Agency',
    price: '₹9,999',
    annualPrice: '₹99,999',
    annualSavings: 'Save ₹19,989/year',
    period: '/month',
    features: [
      'Unlimited AI fair usage',
      'White-label',
      'Advanced analytics',
      'Team collaboration',
      'Indian agency scale controls',
      'Dedicated support',
    ],
    current: false,
  },
];

type AIUsage = {
  plan: 'Starter' | 'Pro' | 'Agency';
  status: string;
  billingCycle: 'monthly' | 'annual';
  used: number;
  limit: number | null;
  remaining: number | null;
  resetAt: string;
};

type Subscription = {
  plan: 'starter' | 'pro' | 'agency';
  status: string;
  billing_cycle: 'monthly' | 'annual';
  ai_limit: number | null;
  ai_used: number;
  trial_ends_at: string | null;
  current_period_end: string | null;
  trialDaysRemaining: number;
  accessAllowed: boolean;
};

type BillingRecord = {
  id: string;
  invoice_number?: string;
  plan: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
};

type RazorpayResponse = {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
};

type RazorpayCheckout = new (options: Record<string, unknown>) => { open: () => void };

declare global {
  interface Window {
    Razorpay?: RazorpayCheckout;
  }
}

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function BillingPage() {
  const [usage, setUsage] = useState<AIUsage | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<BillingRecord[]>([]);
  const [payments, setPayments] = useState<BillingRecord[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro' | 'agency'>('pro');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    async function loadUsage() {
      const [usageResponse, subscriptionResponse] = await Promise.all([
        fetch('/api/ai/usage'),
        fetch('/api/subscription'),
      ]);
      if (usageResponse.ok) {
        const data = await usageResponse.json();
        if (!ignore) setUsage(data.usage);
      }
      if (subscriptionResponse.ok) {
        const data = await subscriptionResponse.json();
        if (!ignore) {
          setSubscription(data.subscription);
          setInvoices(data.invoices || []);
          setPayments(data.payments || []);
          setSelectedPlan(data.subscription?.plan === 'agency' ? 'agency' : 'pro');
        }
      }
    }

    loadUsage();
    return () => {
      ignore = true;
    };
  }, []);

  const resetDate = usage?.resetAt
    ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(usage.resetAt))
    : null;
  const usagePercent =
    usage?.limit === null ? 0 : usage?.limit ? Math.min(100, (usage.used / usage.limit) * 100) : 0;
  const trialEndsAt = subscription?.trial_ends_at
    ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(
        new Date(subscription.trial_ends_at)
      )
    : null;

  async function startUpgrade() {
    setCheckoutLoading(true);
    setError('');

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        throw new Error('Unable to load Razorpay checkout. Please try again.');
      }

      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_checkout',
          plan: selectedPlan,
          billingCycle,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Unable to start checkout.');
      }

      const checkout = result.checkout;
      const razorpay = new window.Razorpay({
        key: checkout.keyId,
        subscription_id: checkout.subscriptionId,
        name: 'Inkaa Marketing',
        description: `${checkout.name} ${billingCycle} subscription`,
        theme: { color: '#d64238' },
        handler: async (payment: RazorpayResponse) => {
          const confirmResponse = await fetch('/api/subscription/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              plan: selectedPlan,
              billingCycle,
              razorpayPaymentId: payment.razorpay_payment_id,
              razorpaySubscriptionId: payment.razorpay_subscription_id,
              razorpaySignature: payment.razorpay_signature,
            }),
          });
          const confirmResult = await confirmResponse.json();

          if (!confirmResponse.ok) {
            setError(confirmResult.error || 'Payment verification failed.');
            return;
          }

          window.location.reload();
        },
        modal: {
          ondismiss: () => setCheckoutLoading(false),
        },
      });

      razorpay.open();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to start checkout.');
      setCheckoutLoading(false);
    }
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
            <BuildingStorefrontIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Billing & Plans</h1>
            <p className="text-sm text-muted-foreground">Manage your subscription</p>
          </div>
        </div>

        {subscription?.status === 'trial' && (
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary">
                  <ClockIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {subscription.trialDaysRemaining} days left in your free trial
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Trial ends {trialEndsAt}. Upgrade anytime to keep access after the trial.
                  </p>
                </div>
              </div>
              <button className="btn-primary" onClick={() => setModalOpen(true)}>
                Upgrade now
              </button>
            </div>
          </div>
        )}

        {subscription && !subscription.accessAllowed && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-red-700">Your trial has expired</p>
                <p className="text-sm text-red-600">
                  Upgrade to restore AI tools, billing, CRM workflows, and agency operations.
                </p>
              </div>
              <button className="btn-primary" onClick={() => setModalOpen(true)}>
                Choose plan
              </button>
            </div>
          </div>
        )}

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Current Plan:{' '}
              <span className="text-primary">{usage ? usage.plan : 'Loading...'}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {usage
                ? usage.limit === null
                  ? `${usage.used} AI generations used this month · Unlimited fair usage`
                  : `${usage.used}/${usage.limit} AI generations used · ${usage.remaining} remaining`
                : 'Loading subscription usage...'}
            </p>
            {resetDate && (
              <p className="text-xs text-muted-foreground mt-1">Next billing/reset: {resetDate}</p>
            )}
            {usage?.limit !== null && (
              <div className="mt-3 h-2 max-w-sm overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
            )}
          </div>
          <button className="btn-secondary" onClick={() => setModalOpen(true)}>
            Manage Subscription
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans?.map((plan) => (
            <div
              key={plan?.name}
              className={`bg-card border rounded-2xl p-6 shadow-sm relative ${
                usage?.plan === plan.name
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-border'
              }`}
            >
              {usage?.plan === plan.name && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary text-white text-xs font-semibold rounded-full">
                  Current Plan
                </span>
              )}
              <h3 className="text-lg font-bold text-foreground">{plan?.name}</h3>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-extrabold text-foreground">{plan?.price}</span>
                <span className="text-sm text-muted-foreground">{plan?.period}</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan?.features?.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckIcon className="w-4 h-4 text-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className="btn-primary w-full py-2.5"
                onClick={() => {
                  setSelectedPlan(plan.name.toLowerCase() as 'starter' | 'pro' | 'agency');
                  setModalOpen(true);
                }}
              >
                {usage?.plan === plan.name ? 'Active' : 'Upgrade'}
              </button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-base font-semibold text-foreground">Billing history</h2>
            <div className="mt-4 space-y-3">
              {payments.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Payments will appear here after your first Razorpay subscription charge.
                </p>
              ) : (
                payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium capitalize text-foreground">{payment.plan}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(
                          new Date(payment.created_at)
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ₹{(Number(payment.amount || 0) / 100).toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs capitalize text-muted-foreground">{payment.status}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="text-base font-semibold text-foreground">Invoices</h2>
            <div className="mt-4 space-y-3">
              {invoices.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  GST-ready invoices are generated automatically after successful payments.
                </p>
              ) : (
                invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-foreground">{invoice.invoice_number}</p>
                      <p className="text-xs capitalize text-muted-foreground">{invoice.plan}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        ₹{(Number(invoice.amount || 0) / 100).toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs capitalize text-muted-foreground">{invoice.status}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-3xl border border-border bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">Upgrade subscription</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Recurring billing is processed securely by Razorpay.
                </p>
              </div>
              <button
                className="rounded-full p-2 text-muted-foreground hover:bg-muted"
                onClick={() => setModalOpen(false)}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="mt-5 inline-flex rounded-xl border border-border bg-muted p-1">
              {(['monthly', 'annual'] as const).map((cycle) => (
                <button
                  key={cycle}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize ${
                    billingCycle === cycle
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-muted-foreground'
                  }`}
                  onClick={() => setBillingCycle(cycle)}
                >
                  {cycle}
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {plans.map((plan) => {
                const id = plan.name.toLowerCase() as 'starter' | 'pro' | 'agency';
                return (
                  <button
                    key={plan.name}
                    className={`rounded-2xl border p-4 text-left transition ${
                      selectedPlan === id
                        ? 'border-primary bg-red-50 ring-2 ring-primary/15'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedPlan(id)}
                  >
                    <p className="font-bold text-foreground">{plan.name}</p>
                    <p className="mt-1 text-2xl font-extrabold text-foreground">
                      {billingCycle === 'annual' ? plan.annualPrice : plan.price}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {billingCycle === 'annual'
                        ? `Billed annually in INR · ${plan.annualSavings}`
                        : 'Billed monthly in INR'}
                    </p>
                    <ul className="mt-4 space-y-2">
                      {plan.features.slice(0, 4).map((feature) => (
                        <li key={feature} className="flex gap-2 text-xs text-muted-foreground">
                          <CheckIcon className="h-4 w-4 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>

            <button
              className="btn-primary mt-6 w-full py-3"
              disabled={checkoutLoading}
              onClick={startUpgrade}
            >
              {checkoutLoading ? 'Opening Razorpay...' : 'Continue to secure payment'}
            </button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Payments settle into the Razorpay merchant account configured by your production keys.
            </p>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
