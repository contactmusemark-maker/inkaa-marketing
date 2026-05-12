'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';

const _features = [
  {
    icon: 'UserGroupIcon',
    title: 'Client Management',
    desc: 'Track every client, note, file, and conversation in one place. No more scattered spreadsheets.',
    span: 'col-span-1 row-span-1',
  },
  {
    icon: 'FunnelIcon',
    title: 'CRM Pipeline',
    desc: 'Drag-and-drop kanban from lead to close. See exactly where every deal stands.',
    span: 'col-span-1 row-span-1',
  },
  {
    icon: 'SparklesIcon',
    title: 'AI Proposal Generator',
    desc: 'Generate winning proposals in 30 seconds using GPT-4. Customised for Indian digital marketing services.',
    span: 'col-span-2 row-span-1',
  },
  {
    icon: 'ReceiptRefundIcon',
    title: 'GST Invoicing',
    desc: 'Create, send, and track GST-compliant invoices. Collect payments via Razorpay instantly.',
    span: 'col-span-1 row-span-1',
  },
  {
    icon: 'ChartBarIcon',
    title: 'Revenue Analytics',
    desc: 'Real-time charts for revenue, ROI, and campaign performance across all clients.',
    span: 'col-span-1 row-span-1',
  },
  {
    icon: 'FolderIcon',
    title: 'Project Boards',
    desc: 'Kanban boards, milestones, deadlines, and team assignments — all connected to your clients.',
    span: 'col-span-1 row-span-1',
  },
  {
    icon: 'CalculatorIcon',
    title: 'Pricing Estimator',
    desc: 'Dynamic pricing calculator for SEO, Ads, Branding, and Web Design with GST and discount rules.',
    span: 'col-span-1 row-span-1',
  },
];

const plans = [
  {
    name: 'Starter',
    price: '₹2,999',
    period: '/month',
    desc: 'Perfect for solo consultants and small agencies.',
    features: ['5 Clients', '3 Team Members', 'Basic CRM', 'GST Invoicing', 'Email Support'],
    cta: 'Start Free Trial',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '₹7,999',
    period: '/month',
    desc: 'For growing agencies managing multiple clients.',
    features: [
      '25 Clients',
      '10 Team Members',
      'Full CRM + Pipeline',
      'AI Tools',
      'Campaigns',
      'Priority Support',
    ],
    cta: 'Start Free Trial',
    highlight: true,
  },
  {
    name: 'Agency',
    price: '₹19,999',
    period: '/month',
    desc: 'Enterprise-grade for large agencies and white-label.',
    features: [
      'Unlimited Clients',
      'Unlimited Team',
      'White Label',
      'Custom Domain',
      'API Access',
      'Dedicated Manager',
    ],
    cta: 'Contact Sales',
    highlight: false,
  },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <AppLogo src="/assets/images/app_logo_clean.png" size={32} />
              <span className="font-extrabold text-xl text-[#0F172A] tracking-tight">Inkaa.</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-sm font-medium text-slate-600 hover:text-[#FF2B2B] transition-colors"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-sm font-medium text-slate-600 hover:text-[#FF2B2B] transition-colors"
              >
                Pricing
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/sign-up-login"
                className="hidden md:inline-flex text-sm font-semibold text-slate-700 hover:text-[#FF2B2B] transition-colors px-4 py-2"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up-login"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF2B2B] text-white text-sm font-semibold rounded-xl hover:bg-[#e02020] transition-colors shadow-sm"
              >
                <Icon name="RocketLaunchIcon" size={15} />
                Start Free Trial
              </Link>
              <button
                className="md:hidden p-2 rounded-lg hover:bg-slate-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Icon
                  name={mobileMenuOpen ? 'XMarkIcon' : 'Bars3Icon'}
                  size={20}
                  className="text-slate-600"
                />
              </button>
            </div>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden py-3 border-t border-[#E2E8F0] space-y-1">
              <a
                href="#features"
                className="block px-3 py-2 text-sm font-medium text-slate-600 hover:text-[#FF2B2B]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#pricing"
                className="block px-3 py-2 text-sm font-medium text-slate-600 hover:text-[#FF2B2B]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <Link
                href="/sign-up-login"
                className="block px-3 py-2 text-sm font-semibold text-[#FF2B2B]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Background blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-red-50 to-transparent rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute top-20 right-0 w-72 h-72 bg-red-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 border border-red-100 rounded-full text-xs font-semibold text-[#FF2B2B] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF2B2B] animate-pulse" />
            Built for Indian Digital Marketing Agencies
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A] leading-tight tracking-tight">
            Run your entire agency
            <br />
            <span className="text-[#FF2B2B]">from one dashboard.</span>
          </h1>
          <p className="mt-6 text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Clients, CRM, projects, GST invoices, Razorpay payments, AI proposals, and team
            management — all connected. No more juggling 10 tools.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up-login"
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-[#FF2B2B] text-white font-bold text-base rounded-2xl hover:bg-[#e02020] transition-all shadow-lg shadow-red-200 hover:shadow-red-300 hover:-translate-y-0.5"
            >
              <Icon name="RocketLaunchIcon" size={18} />
              Start Free Trial — 14 Days Free
            </Link>
            <Link
              href="/sign-up-login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white border border-[#E2E8F0] text-[#0F172A] font-semibold text-base rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
            >
              <Icon name="PlayCircleIcon" size={18} className="text-[#FF2B2B]" />
              Talk to Sales
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            No credit card required · Cancel anytime · GST-compliant billing
          </p>
        </div>
      </section>

      {/* Features Bento */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#FF2B2B] mb-3">
              Everything you need
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A]">
              One platform. Every workflow.
            </h2>
            <p className="mt-4 text-slate-500 max-w-xl mx-auto">
              Stop paying for 8 different tools. Inkaa replaces your CRM, project manager, invoicing
              software, and AI tools in one.
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Large card */}
            <div className="lg:col-span-2 bg-gradient-to-br from-[#FF2B2B] to-[#FF6B6B] rounded-2xl p-7 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                  <Icon name="SparklesIcon" size={20} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">AI Proposal Generator</h3>
                <p className="text-red-100 text-sm leading-relaxed">
                  Generate winning proposals in 30 seconds using GPT-4. Customised for Indian
                  digital marketing services — SEO, Ads, Branding, Web Design.
                </p>
                <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-white/80">
                  <Icon name="ClockIcon" size={13} />
                  Saves 2+ hours per proposal
                </div>
              </div>
            </div>

            {/* Regular cards */}
            {[
              {
                icon: 'UserGroupIcon',
                title: 'Client Management',
                desc: 'Track every client, note, file, and conversation in one place.',
              },
              {
                icon: 'FunnelIcon',
                title: 'CRM Pipeline',
                desc: 'Drag-and-drop kanban from lead to close. See every deal at a glance.',
              },
              {
                icon: 'ReceiptRefundIcon',
                title: 'GST Invoicing',
                desc: 'Create GST-compliant invoices and collect payments via Razorpay.',
              },
              {
                icon: 'ChartBarIcon',
                title: 'Revenue Analytics',
                desc: 'Real-time charts for revenue, ROI, and campaign performance.',
              },
              {
                icon: 'FolderIcon',
                title: 'Project Boards',
                desc: 'Kanban boards, milestones, and team assignments connected to clients.',
              },
              {
                icon: 'CalculatorIcon',
                title: 'Pricing Estimator',
                desc: 'Dynamic calculator for SEO, Ads, Branding with GST and discounts.',
              },
            ].map((feat) => (
              <div
                key={feat.title}
                className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6 hover:border-red-200 hover:shadow-sm transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center mb-4 group-hover:bg-red-100 transition-colors">
                  <Icon
                    name={feat.icon as Parameters<typeof Icon>[0]['name']}
                    size={18}
                    className="text-[#FF2B2B]"
                  />
                </div>
                <h3 className="font-bold text-[#0F172A] mb-1.5">{feat.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#FF2B2B] mb-3">
              Simple pricing
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A]">
              Plans that grow with your agency
            </h2>
            <p className="mt-4 text-slate-500">
              14-day free trial on all plans. No credit card required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl p-7 border transition-all ${
                  plan.highlight
                    ? 'border-[#FF2B2B] ring-2 ring-[#FF2B2B]/20 shadow-lg shadow-red-100'
                    : 'border-[#E2E8F0] hover:border-red-200 hover:shadow-sm'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#FF2B2B] text-white text-xs font-bold rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-bold text-[#0F172A]">{plan.name}</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">{plan.desc}</p>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-[#0F172A]">{plan.price}</span>
                  <span className="text-sm text-slate-500">{plan.period}</span>
                </div>
                <ul className="space-y-2.5 mb-7">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-slate-600">
                      <div className="w-4 h-4 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                        <Icon name="CheckIcon" size={10} className="text-[#FF2B2B]" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/sign-up-login"
                  className={`block w-full text-center py-3 rounded-xl text-sm font-bold transition-all ${
                    plan.highlight
                      ? 'bg-[#FF2B2B] text-white hover:bg-[#e02020] shadow-sm shadow-red-200'
                      : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] hover:bg-slate-100'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#FF2B2B] to-[#FF6B6B]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Ready to run your agency smarter?
          </h2>
          <p className="text-red-100 text-lg mb-10">
            Join 2,400+ agencies already using Inkaa. Start your 14-day free trial today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up-login"
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-white text-[#FF2B2B] font-bold text-base rounded-2xl hover:bg-red-50 transition-all shadow-lg"
            >
              <Icon name="RocketLaunchIcon" size={18} />
              Start Free Trial
            </Link>
            <Link
              href="/sign-up-login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 border border-white/30 text-white font-semibold text-base rounded-2xl hover:bg-white/20 transition-all"
            >
              Sign In to Dashboard
            </Link>
          </div>
          <p className="mt-5 text-red-200 text-xs">
            No credit card required · 14 days free · Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-slate-400 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <AppLogo src="/assets/images/app_logo_clean.png" size={28} />
            <span className="font-extrabold text-white text-base">Inkaa.</span>
            <span className="text-slate-500 text-sm">Digital Marketing Software</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#pricing" className="hover:text-white transition-colors">
              Pricing
            </a>
            <Link href="/sign-up-login" className="hover:text-white transition-colors">
              Sign In
            </Link>
          </div>
          <p className="text-xs text-slate-600">© 2026 Inkaa. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
