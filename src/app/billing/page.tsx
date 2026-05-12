'use client';

import AppLayout from '@/components/AppLayout';
import Link from 'next/link';
import { BuildingStorefrontIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

const plans = [
  {
    name: 'Starter',
    price: '₹2,999',
    period: '/month',
    features: [
      'Basic CRM',
      '20 AI generations/month',
      'Limited projects',
      'Invoicing',
      'Email Support',
    ],
    current: false,
  },
  {
    name: 'Pro',
    price: '₹7,999',
    period: '/month',
    features: [
      'Advanced CRM',
      '300 AI generations/month',
      'Analytics',
      'Team management',
      'Campaigns',
      'Priority support',
    ],
    current: false,
  },
  {
    name: 'Agency',
    price: '₹19,999',
    period: '/month',
    features: [
      'Unlimited AI usage',
      'White-label',
      'Advanced analytics',
      'Team collaboration',
      'Custom domain',
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

export default function BillingPage() {
  const [usage, setUsage] = useState<AIUsage | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadUsage() {
      const response = await fetch('/api/ai/usage');
      if (!response.ok) return;
      const data = await response.json();
      if (!ignore) setUsage(data.usage);
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
          <Link href="/plans" className="btn-secondary">
            Manage Subscription
          </Link>
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
              <Link href="/plans" className="btn-primary w-full py-2.5">
                {usage?.plan === plan.name ? 'Active' : 'Upgrade'}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
