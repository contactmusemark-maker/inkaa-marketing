'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';

type PlanId = 'starter' | 'pro' | 'agency';

const plans = [
  {
    id: 'starter' as const,
    name: 'Starter',
    price: '₹2,999',
    priceNum: 2999,
    period: '/month',
    desc: 'Perfect for solo consultants and small agencies just getting started.',
    features: [
      '5 Clients',
      '3 Team Members',
      'Basic CRM Pipeline',
      'GST Invoicing',
      'Project Management',
      'Email Support',
    ],
    highlight: false,
    badge: null,
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: '₹7,999',
    priceNum: 7999,
    period: '/month',
    desc: 'For growing agencies managing multiple clients and campaigns.',
    features: [
      '25 Clients',
      '10 Team Members',
      'Full CRM + Pipeline',
      'AI Proposal Generator',
      'Campaign Management',
      'Analytics Dashboard',
      'Priority Support',
    ],
    highlight: true,
    badge: 'Most Popular',
  },
  {
    id: 'agency' as const,
    name: 'Agency',
    price: '₹19,999',
    priceNum: 19999,
    period: '/month',
    desc: 'Enterprise-grade for large agencies and white-label resellers.',
    features: [
      'Unlimited Clients',
      'Unlimited Team Members',
      'White Label Branding',
      'Custom Domain',
      'API Access',
      'Dedicated Account Manager',
      '24/7 Phone Support',
    ],
    highlight: false,
    badge: 'Best Value',
  },
];

export default function PlansPage() {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('pro');
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSelectPlan = async () => {
    if (!selectedPlan) {
      setError('Please select a plan');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan, billingCycle: billing }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Unable to activate plan');
      }

      window.location.href = '/dashboard';
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to activate plan');
      setLoading(false);
    }
  };

  const selectedPlanDetails = plans.find((p) => p.id === selectedPlan);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-[#E2E8F0] px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AppLogo src="/assets/images/app_logo_clean.png" size={30} />
            <span className="font-extrabold text-lg text-[#0F172A] tracking-tight">Inkaa.</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                <Icon name="CheckIcon" size={11} className="text-green-600" />
              </div>
              <span>Account created</span>
            </div>
            <Icon name="ChevronRightIcon" size={14} className="text-slate-300" />
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-[#FF2B2B] flex items-center justify-center">
                <span className="text-white text-[9px] font-bold">2</span>
              </div>
              <span className="font-semibold text-[#0F172A]">Choose plan</span>
            </div>
            <Icon name="ChevronRightIcon" size={14} className="text-slate-300" />
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center">
                <span className="text-slate-500 text-[9px] font-bold">3</span>
              </div>
              <span>Dashboard</span>
            </div>
          </div>
          <Link href="/" className="text-sm text-slate-500 hover:text-[#FF2B2B] transition-colors">
            Skip for now →
          </Link>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-[#0F172A]">Choose your plan</h1>
          <p className="text-slate-500 mt-2">
            Start with a 14-day free trial. No credit card required.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 mt-6 bg-white border border-[#E2E8F0] rounded-xl p-1">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${billing === 'monthly' ? 'bg-[#FF2B2B] text-white shadow-sm' : 'text-slate-500 hover:text-[#0F172A]'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${billing === 'annual' ? 'bg-[#FF2B2B] text-white shadow-sm' : 'text-slate-500 hover:text-[#0F172A]'}`}
            >
              Annual
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${billing === 'annual' ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'}`}
              >
                Save 20%
              </span>
            </button>
          </div>
        </div>
        {error && (
          <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {plans?.map((plan) => (
            <button
              key={plan?.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative text-left bg-white rounded-2xl p-6 border-2 transition-all cursor-pointer ${
                selectedPlan === plan?.id
                  ? 'border-[#FF2B2B] ring-2 ring-[#FF2B2B]/15 shadow-lg shadow-red-100'
                  : 'border-[#E2E8F0] hover:border-red-200 hover:shadow-sm'
              }`}
            >
              <input
                type="radio"
                name="plan"
                value={plan.id}
                checked={selectedPlan === plan.id}
                onChange={() => setSelectedPlan(plan.id)}
                className="sr-only"
              />
              {plan?.badge && (
                <div
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 text-xs font-bold rounded-full ${plan?.highlight ? 'bg-[#FF2B2B] text-white' : 'bg-slate-800 text-white'}`}
                >
                  {plan?.badge}
                </div>
              )}

              {/* Selection indicator */}
              <div
                className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedPlan === plan?.id ? 'border-[#FF2B2B] bg-[#FF2B2B]' : 'border-slate-300'}`}
              >
                {selectedPlan === plan?.id && (
                  <Icon name="CheckIcon" size={11} className="text-white" />
                )}
              </div>

              <h3 className="text-lg font-bold text-[#0F172A] mb-1">{plan?.name}</h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">{plan?.desc}</p>
              <div className="mb-5">
                <span className="text-3xl font-extrabold text-[#0F172A]">
                  {billing === 'annual'
                    ? `₹${Math.round(plan?.priceNum * 0.8)?.toLocaleString('en-IN')}`
                    : plan?.price}
                </span>
                <span className="text-sm text-slate-500">{plan?.period}</span>
                {billing === 'annual' && (
                  <p className="text-xs text-green-600 font-medium mt-0.5">
                    Billed annually · Save 20%
                  </p>
                )}
              </div>
              <ul className="space-y-2">
                {plan?.features?.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${selectedPlan === plan?.id ? 'bg-red-50' : 'bg-slate-100'}`}
                    >
                      <Icon
                        name="CheckIcon"
                        size={10}
                        className={selectedPlan === plan?.id ? 'text-[#FF2B2B]' : 'text-slate-400'}
                      />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="max-w-md mx-auto">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-slate-500">Selected plan</span>
              <span className="font-bold text-[#0F172A]">
                {selectedPlanDetails?.name} —{' '}
                {billing === 'annual'
                  ? `₹${Math.round((selectedPlanDetails?.priceNum ?? 0) * 0.8)?.toLocaleString('en-IN')}`
                  : selectedPlanDetails?.price}
                /mo
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Free trial period</span>
              <span className="font-semibold text-green-600">14 days free</span>
            </div>
          </div>

          <button
            onClick={handleSelectPlan}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 py-4 bg-[#FF2B2B] text-white font-bold text-base rounded-2xl hover:bg-[#e02020] transition-all shadow-lg shadow-red-200 disabled:opacity-70"
          >
            {loading ? (
              <>
                <Icon name="ArrowPathIcon" size={18} className="animate-spin" />
                Setting up your workspace...
              </>
            ) : (
              <>
                <Icon name="RocketLaunchIcon" size={18} />
                Start 14-Day Free Trial
              </>
            )}
          </button>
          <p className="text-center text-xs text-slate-400 mt-3">
            No credit card required · Cancel anytime · GST invoice provided
          </p>
        </div>
      </div>
    </div>
  );
}
