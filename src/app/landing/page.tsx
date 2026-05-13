'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
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
    price: '₹1,999',
    annual: '₹19,999/year · save ₹3,989',
    period: '/month',
    desc: 'For lean Indian agencies starting with client operations and AI.',
    features: ['5 Clients', '3 Team Members', 'Basic CRM', 'GST Invoicing', 'Razorpay Billing'],
    cta: 'Start Free Trial',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '₹4,999',
    annual: '₹49,999/year · save ₹9,989',
    period: '/month',
    desc: 'For growing Indian agencies managing retainers, campaigns, and teams.',
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
    price: '₹9,999',
    annual: '₹99,999/year · save ₹19,989',
    period: '/month',
    desc: 'For full-service agencies scaling delivery, AI, and reporting.',
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

const navItems = [
  { label: 'Features', href: '#features', id: 'features' },
  { label: 'AI Tools', href: '#ai-tools', id: 'ai-tools' },
  { label: 'Pricing', href: '#pricing', id: 'pricing' },
  { label: 'Contact', href: '/contact', id: 'contact' },
];

const dashboardScreens = [
  {
    title: 'CRM Dashboard',
    eyebrow: 'Pipeline clarity',
    icon: 'FunnelIcon',
    metric: '18',
    metricLabel: 'active opportunities',
    accent: 'from-red-500 to-rose-400',
    copy: 'Track leads, follow-ups, and client status from one focused operating view.',
    rows: ['Discovery call', 'Proposal sent', 'Negotiation', 'Won'],
    bars: [78, 62, 44, 86],
  },
  {
    title: 'AI Proposal Generator',
    eyebrow: 'Proposal workspace',
    icon: 'SparklesIcon',
    metric: '42s',
    metricLabel: 'draft generation',
    accent: 'from-[#d64238] to-[#ef9a8f]',
    copy: 'Turn client inputs into structured SEO, ads, website, and content proposals.',
    rows: ['Scope summary', 'Strategy outline', 'Timeline', 'Investment'],
    bars: [92, 74, 58, 68],
  },
  {
    title: 'Campaign Analytics',
    eyebrow: 'Performance view',
    icon: 'ChartBarIcon',
    metric: '4.8x',
    metricLabel: 'blended ROAS',
    accent: 'from-red-500 to-orange-400',
    copy: 'Monitor spend, leads, conversions, and campaign health across every client.',
    rows: ['Meta Ads', 'Google Ads', 'SEO', 'Email'],
    bars: [83, 71, 52, 64],
  },
  {
    title: 'Client Management',
    eyebrow: 'Account command center',
    icon: 'UserGroupIcon',
    metric: '96%',
    metricLabel: 'retention signals',
    accent: 'from-zinc-900 to-red-500',
    copy: 'Keep contacts, tasks, notes, invoices, and project activity connected.',
    rows: ['Contacts', 'Tasks', 'Projects', 'Files'],
    bars: [68, 82, 59, 76],
  },
  {
    title: 'Invoice & Payments',
    eyebrow: 'Revenue operations',
    icon: 'ReceiptRefundIcon',
    metric: '₹0',
    metricLabel: 'overdue on fresh setup',
    accent: 'from-red-600 to-red-400',
    copy: 'Create GST-ready invoices, collect payments, and track receivables.',
    rows: ['Draft', 'Sent', 'Paid', 'Reconciled'],
    bars: [36, 58, 88, 72],
  },
  {
    title: 'AI Content Generation',
    eyebrow: 'Content studio',
    icon: 'PencilSquareIcon',
    metric: '5',
    metricLabel: 'content formats',
    accent: 'from-[#d64238] to-[#e76655]',
    copy: 'Generate captions, outreach emails, ad copy, and campaign briefs in context.',
    rows: ['Captions', 'Ad copy', 'Email', 'Briefs'],
    bars: [89, 77, 66, 81],
  },
];

const detailedFeatures = [
  {
    icon: 'UserGroupIcon',
    title: 'Client Operating System',
    desc: 'Manage every client relationship from onboarding to renewal with contacts, notes, project history, invoices, payments, and AI-generated assets connected in one account timeline.',
    bullets: ['Client profiles', 'Account health', 'Renewal context'],
    result: 'No more scattered client context',
  },
  {
    icon: 'FunnelIcon',
    title: 'CRM Pipeline',
    desc: 'Move leads through a clear agency sales process: new enquiry, discovery, proposal, negotiation, won, or lost. Managers can see value, owner, next step, and follow-up urgency instantly.',
    bullets: ['Lead stages', 'Deal ownership', 'Follow-up tracking'],
    result: 'Close more proposals with less manual chasing',
  },
  {
    icon: 'ReceiptRefundIcon',
    title: 'GST Invoicing & Payments',
    desc: 'Create professional invoices, track paid and pending amounts, connect payment status to client records, and keep finance visibility inside the same workspace your delivery team uses.',
    bullets: ['GST-ready invoices', 'Payment status', 'Receivable tracking'],
    result: 'Cleaner billing operations',
  },
  {
    icon: 'ChartBarIcon',
    title: 'Campaign Analytics',
    desc: 'Give founders and account managers a fast view of campaign performance across spend, leads, conversions, revenue impact, and client-facing reporting moments.',
    bullets: ['Spend visibility', 'Conversion signals', 'Report-ready metrics'],
    result: 'Better decisions before review calls',
  },
  {
    icon: 'FolderIcon',
    title: 'Project Delivery Boards',
    desc: 'Plan deliverables, assign work, track status, and keep teams aligned around SEO, ads, branding, websites, social content, and monthly retainers.',
    bullets: ['Milestones', 'Team ownership', 'Delivery status'],
    result: 'Every task has a place and owner',
  },
  {
    icon: 'CalculatorIcon',
    title: 'Pricing Estimator',
    desc: 'Build consistent service pricing for SEO, ads, creative, branding, and web work using structured packages, GST, discounts, and agency-specific pricing logic.',
    bullets: ['Package logic', 'GST support', 'Discount control'],
    result: 'Quote faster without underpricing',
  },
];

const storyChapters = [
  {
    step: '01',
    icon: 'Squares2X2Icon',
    eyebrow: 'The old way',
    title: 'Your agency starts the day across too many tabs.',
    desc: 'Leads are in one sheet, client notes in another, tasks in chat, invoices in a billing tool, and proposal drafts somewhere in a document folder.',
    bullets: ['Scattered context', 'Slow handoffs', 'No single source of truth'],
  },
  {
    step: '02',
    icon: 'FunnelIcon',
    eyebrow: 'Lead to proposal',
    title: 'Inkaa turns new enquiries into structured opportunities.',
    desc: 'Capture the lead, assign ownership, track the next step, and generate a proposal brief without losing the context from the first conversation.',
    bullets: ['Pipeline stages', 'Deal ownership', 'Proposal readiness'],
  },
  {
    step: '03',
    icon: 'SparklesIcon',
    eyebrow: 'AI-assisted selling',
    title: 'AI helps draft the first serious version.',
    desc: 'Build client-ready proposals, campaign plans, captions, pricing suggestions, and follow-up emails from one secure AI workspace.',
    bullets: ['Proposal generator', 'Campaign planner', 'Email and content writer'],
  },
  {
    step: '04',
    icon: 'FolderIcon',
    eyebrow: 'Delivery',
    title: 'Once work starts, every deliverable has a home.',
    desc: 'Projects, tasks, campaigns, owners, status, and client context stay connected so the team knows what is active, blocked, due, and done.',
    bullets: ['Project boards', 'Team tasks', 'Client-linked delivery'],
  },
  {
    step: '05',
    icon: 'ReceiptRefundIcon',
    eyebrow: 'Money flow',
    title: 'Invoices and payments stay attached to the client story.',
    desc: 'Track subscriptions, invoices, Razorpay payment status, and outstanding amounts without separating finance from operations.',
    bullets: ['GST invoicing', 'Payment tracking', 'Receivables visibility'],
  },
  {
    step: '06',
    icon: 'ChartBarIcon',
    eyebrow: 'Founder visibility',
    title: 'The full business becomes easier to read.',
    desc: 'Leadership can see pipeline health, active clients, AI usage, delivery flow, and revenue movement from a cleaner operating layer.',
    bullets: ['Operational clarity', 'Usage visibility', 'Better review meetings'],
  },
];

function CinematicBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#f7f5f2]">
      <motion.div
        animate={{ x: [0, 28, -12, 0], y: [0, -18, 16, 0], scale: [1, 1.04, 0.98, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-1/2 top-[-180px] h-[620px] w-[920px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(214,66,56,0.18),rgba(214,66,56,0.08)_35%,transparent_70%)] blur-2xl"
      />
      <motion.div
        animate={{ x: [0, -24, 18, 0], y: [0, 20, -14, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute right-[-220px] top-[32vh] h-[520px] w-[620px] rounded-full bg-[radial-gradient(circle_at_center,rgba(239,235,231,0.95),rgba(214,66,56,0.1)_42%,transparent_72%)] blur-3xl"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(247,245,242,0.35),rgba(239,235,231,0.78))]" />
      <div
        className="absolute inset-0 opacity-[0.055] mix-blend-multiply"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(17,17,17,0.42) 1px, transparent 0)',
          backgroundSize: '18px 18px',
        }}
      />
    </div>
  );
}

function DashboardPreview({
  screen,
  index,
}: {
  screen: (typeof dashboardScreens)[number];
  index: number;
}) {
  return (
    <div className="grid min-h-[440px] gap-5 rounded-[2rem] border border-white/80 bg-white/42 p-3 shadow-[0_30px_90px_rgba(17,17,17,0.11)] backdrop-blur-2xl md:grid-cols-[220px_1fr] md:p-4 lg:min-h-[520px]">
      <div className="rounded-[1.35rem] border border-white/75 bg-[#f5f3f1]/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-xl">
        <div className="flex items-center gap-2 border-b border-[#efebe7] pb-4">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-300" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
        </div>
        <div className="mt-6 space-y-2">
          {dashboardScreens.slice(0, 5).map((item) => (
            <div
              key={item.title}
              className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-xs font-semibold transition-colors ${
                item.title === screen.title ? 'bg-white text-[#111111] shadow-sm' : 'text-[#5f5f5f]'
              }`}
            >
              <Icon
                name={item.icon as Parameters<typeof Icon>[0]['name']}
                size={15}
                className={item.title === screen.title ? 'text-[#d64238]' : 'text-[#5f5f5f]'}
              />
              <span>{item.title.replace(' Generator', '')}</span>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-2xl border border-white/75 bg-white/56 p-4 shadow-[0_14px_38px_rgba(17,17,17,0.06)] backdrop-blur-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5f5f5f]">
            Today
          </p>
          <p className="mt-2 text-2xl font-black text-[#111111]">{screen.metric}</p>
          <p className="text-xs text-[#5f5f5f]">{screen.metricLabel}</p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[1.5rem] bg-[#f7f5f2] p-4 md:p-6">
        <div className="absolute inset-x-12 top-0 h-28 rounded-full bg-[#d64238]/15 blur-3xl" />
        <div className="relative flex flex-col gap-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-bold text-[#d64238] shadow-sm backdrop-blur-xl">
                <Icon name={screen.icon as Parameters<typeof Icon>[0]['name']} size={14} />
                {screen.eyebrow}
              </div>
              <h3 className="mt-4 text-2xl font-black tracking-tight text-[#111111] md:text-3xl">
                {screen.title}
              </h3>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#5f5f5f]">{screen.copy}</p>
            </div>
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: index * 0.2 }}
              className={`rounded-3xl bg-gradient-to-br ${screen.accent} p-4 text-white shadow-xl shadow-red-200/50`}
            >
              <p className="text-3xl font-black">{screen.metric}</p>
              <p className="mt-1 max-w-28 text-xs text-white/75">{screen.metricLabel}</p>
            </motion.div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-3xl border border-white/70 bg-white/68 p-4 shadow-[0_18px_50px_rgba(17,17,17,0.08)] backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <p className="text-sm font-bold text-[#111111]">Workspace flow</p>
                <div className="h-2 w-20 rounded-full bg-slate-100">
                  <motion.div
                    className="h-full rounded-full bg-[#d64238]"
                    initial={{ width: 0 }}
                    animate={{ width: `${screen.bars[0]}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>
              <div className="space-y-3">
                {screen.rows.map((row, rowIndex) => (
                  <motion.div
                    key={row}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: rowIndex * 0.08 }}
                    className="rounded-2xl border border-white/70 bg-white/55 p-3 backdrop-blur"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[#111111]">{row}</span>
                      <span className="text-[#5f5f5f]">{screen.bars[rowIndex]}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-white">
                      <motion.div
                        className="h-full rounded-full bg-[#d64238]"
                        initial={{ width: 0 }}
                        animate={{ width: `${screen.bars[rowIndex]}%` }}
                        transition={{ duration: 0.7, delay: rowIndex * 0.1 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-white/70 bg-white/68 p-4 shadow-[0_18px_50px_rgba(17,17,17,0.08)] backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-[#111111]">Live activity</p>
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                </div>
                <div className="mt-5 flex h-36 items-end gap-2">
                  {screen.bars.concat([54, 72]).map((height, barIndex) => (
                    <motion.div
                      key={`${screen.title}-${barIndex}`}
                      className="flex-1 rounded-t-xl bg-gradient-to-t from-[#d64238] to-red-200"
                      initial={{ height: 12 }}
                      animate={{ height: `${Math.max(18, height)}%` }}
                      transition={{ duration: 0.8, delay: barIndex * 0.07 }}
                    />
                  ))}
                </div>
              </div>
              <div className="rounded-3xl border border-white/70 bg-white/68 p-4 shadow-[0_18px_50px_rgba(17,17,17,0.08)] backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#d64238]/10">
                    <Icon name="CursorArrowRaysIcon" size={18} className="text-[#d64238]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#111111]">Smart action ready</p>
                    <p className="text-xs text-[#5f5f5f]">Review, approve, or send in one click.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardShowcase() {
  const [activeScreen, setActiveScreen] = useState(0);
  const { scrollYProgress } = useScroll();
  const parallaxY = useTransform(scrollYProgress, [0, 0.45], [24, -42]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveScreen((current) => (current + 1) % dashboardScreens.length);
    }, 3600);

    return () => window.clearInterval(timer);
  }, []);

  const screen = dashboardScreens[activeScreen];

  return (
    <section className="relative overflow-hidden bg-[#f7f5f2] px-4 py-24 text-[#111111] sm:px-6 lg:px-8">
      <motion.div
        animate={{ x: [0, 18, -10, 0], y: [0, -16, 12, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-1/2 top-[-120px] h-96 w-[840px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(214,66,56,0.14),rgba(245,243,241,0.72)_46%,transparent_72%)] blur-3xl"
      />
      <div className="absolute bottom-12 right-8 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(214,66,56,0.09),transparent_68%)] blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#d64238]">
            Product experience
          </p>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-[#111111] sm:text-4xl lg:text-5xl">
            A launch-ready agency command center.
          </h2>
          <p className="mt-5 text-base leading-7 text-[#5f5f5f]">
            Preview the workflows your team will use every day: CRM, AI proposals, campaign
            analytics, client operations, invoices, and content generation.
          </p>
        </motion.div>

        <motion.div style={{ y: parallaxY }} className="relative mt-12 hidden lg:block">
          <AnimatePresence mode="wait">
            <motion.div
              key={screen.title}
              initial={{ opacity: 0, scale: 0.98, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -12 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
            >
              <DashboardPreview screen={screen} index={activeScreen} />
            </motion.div>
          </AnimatePresence>

          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -right-4 top-20 rounded-3xl border border-white/80 bg-white/72 p-4 text-[#111111] shadow-[0_24px_70px_rgba(17,17,17,0.1)] backdrop-blur-xl"
          >
            <p className="text-xs font-bold text-slate-500">AI draft</p>
            <div className="mt-3 space-y-2">
              <div className="h-2 w-44 rounded-full bg-slate-200" />
              <motion.div
                className="h-2 rounded-full bg-[#d64238]"
                animate={{ width: ['35%', '86%', '58%'] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <div className="h-2 w-32 rounded-full bg-slate-200" />
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -left-5 bottom-16 rounded-3xl border border-white/80 bg-white/76 p-4 text-[#111111] shadow-[0_24px_70px_rgba(17,17,17,0.1)] backdrop-blur-xl"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#d64238]/10">
                <Icon name="BellAlertIcon" size={17} className="text-[#d64238]" />
              </div>
              <div>
                <p className="text-sm font-black">Workflow updated</p>
                <p className="text-xs text-slate-500">Ready for client review</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <div className="mt-10 flex snap-x gap-4 overflow-x-auto pb-4 lg:hidden">
          {dashboardScreens.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="min-w-[86vw] snap-center sm:min-w-[520px]"
            >
              <DashboardPreview screen={item} index={index} />
            </motion.div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/sign-up-login"
            className="inline-flex items-center gap-2.5 rounded-2xl bg-[#d64238] px-7 py-4 text-sm font-black text-white shadow-[0_20px_50px_rgba(214,66,56,0.24)] transition-all hover:-translate-y-0.5 hover:bg-[#c43830]"
          >
            <Icon name="RocketLaunchIcon" size={18} />
            Start Free Trial
          </Link>
          <a
            href="#features"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/80 bg-white/56 px-7 py-4 text-sm font-bold text-[#111111] shadow-[0_16px_42px_rgba(17,17,17,0.06)] backdrop-blur-xl transition-colors hover:bg-white/78"
          >
            Explore workflows
            <Icon name="ArrowDownIcon" size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}

function StorytellingScroll() {
  const storyScenes = storyChapters.slice(1);

  return (
    <section className="relative overflow-hidden bg-[#f5f3f1] px-4 py-24 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute left-1/2 top-[-120px] h-[520px] w-[920px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(214,66,56,0.12),rgba(247,245,242,0.8)_48%,transparent_72%)] blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          className="mx-auto max-w-3xl text-center"
        >
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#d64238]">
            Operating story
          </p>
          <h2 className="mt-4 text-4xl font-black leading-tight tracking-tight text-[#111111] sm:text-5xl lg:text-6xl">
            Replace agency chaos with one elegant flow.
          </h2>
          <p className="mt-5 text-base leading-8 text-[#5f5f5f]">
            Instead of forcing visitors through long scroll chapters, this view shows the product as
            one cinematic operating system: intake, AI, delivery, billing, and leadership clarity.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-5 lg:grid-cols-[0.88fr_1.24fr_0.88fr] lg:items-stretch">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55 }}
            className="rounded-[2rem] border border-white/75 bg-white/46 p-5 shadow-[0_22px_70px_rgba(17,17,17,0.07)] backdrop-blur-xl"
          >
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#5f5f5f]">
              Before Inkaa
            </p>
            <h3 className="mt-4 text-2xl font-black text-[#111111]">Scattered tools.</h3>
            <div className="mt-6 space-y-3">
              {storyChapters[0].bullets.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/70 bg-[#f7f5f2]/70 px-4 py-3 text-sm font-bold text-[#5f5f5f]"
                >
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            className="relative overflow-hidden rounded-[2.25rem] border border-white/80 bg-white/58 p-5 shadow-[0_34px_100px_rgba(17,17,17,0.12)] backdrop-blur-2xl"
          >
            <div className="absolute inset-x-10 top-0 h-36 rounded-full bg-[#d64238]/12 blur-3xl" />
            <div className="relative rounded-[1.75rem] border border-white/75 bg-[#f7f5f2]/72 p-5">
              <div className="flex items-center justify-between border-b border-white/80 pb-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                </div>
                <span className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#d64238]">
                  Live agency OS
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {storyScenes.slice(0, 4).map((scene, index) => (
                  <motion.div
                    key={scene.title}
                    animate={{ y: [0, index % 2 === 0 ? -5 : 5, 0] }}
                    transition={{
                      duration: 4 + index * 0.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="rounded-3xl border border-white/75 bg-white/62 p-4 shadow-[0_16px_45px_rgba(17,17,17,0.06)]"
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#d64238]/10 text-[#d64238]">
                      <Icon name={scene.icon as Parameters<typeof Icon>[0]['name']} size={18} />
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#d64238]">
                      {scene.eyebrow}
                    </p>
                    <h4 className="mt-2 text-lg font-black leading-tight text-[#111111]">
                      {scene.title}
                    </h4>
                    <div className="mt-4 flex gap-2">
                      <span className="h-2 flex-1 rounded-full bg-[#d64238]/40" />
                      <span className="h-2 flex-[0.7] rounded-full bg-[#efebe7]" />
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-5 rounded-3xl border border-white/75 bg-white/64 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-black text-[#111111]">Unified command center</p>
                  <p className="text-xs font-bold text-[#5f5f5f]">
                    Pipeline → AI → Delivery → Paid
                  </p>
                </div>
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {[72, 88, 64, 96].map((height, index) => (
                    <div key={height} className="flex h-24 items-end rounded-2xl bg-[#f5f3f1] p-2">
                      <motion.div
                        initial={{ height: 8 }}
                        whileInView={{ height: `${height}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: index * 0.08 }}
                        className="w-full rounded-xl bg-gradient-to-t from-[#d64238] to-[#ef9a8f]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.55 }}
            className="rounded-[2rem] border border-white/75 bg-white/46 p-5 shadow-[0_22px_70px_rgba(17,17,17,0.07)] backdrop-blur-xl"
          >
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d64238]">
              After Inkaa
            </p>
            <h3 className="mt-4 text-2xl font-black text-[#111111]">One calm system.</h3>
            <div className="mt-6 space-y-3">
              {['Lead clarity', 'AI speed', 'Delivery ownership', 'Payment visibility'].map(
                (item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/62 px-4 py-3 text-sm font-bold text-[#111111]"
                  >
                    <span className="h-2 w-2 rounded-full bg-[#d64238]" />
                    {item}
                  </div>
                )
              )}
            </div>
          </motion.div>
        </div>

        <div className="mt-6 flex snap-x gap-4 overflow-x-auto pb-2 lg:hidden">
          {storyScenes.map((scene) => (
            <div
              key={scene.title}
              className="min-w-[82vw] snap-center rounded-[1.75rem] border border-white/75 bg-white/58 p-5 shadow-[0_18px_55px_rgba(17,17,17,0.07)] backdrop-blur-xl sm:min-w-[420px]"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#d64238]/10 text-[#d64238]">
                <Icon name={scene.icon as Parameters<typeof Icon>[0]['name']} size={19} />
              </div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#d64238]">
                {scene.eyebrow}
              </p>
              <h3 className="mt-3 text-xl font-black text-[#111111]">{scene.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#5f5f5f]">{scene.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('features');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);

      let currentSection = navItems[0].id;

      for (const item of navItems) {
        const section = document.getElementById(item.id);
        if (section && section.getBoundingClientRect().top <= 120) {
          currentSection = item.id;
        }
      }

      setActiveSection(currentSection);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <div className="relative min-h-screen scroll-smooth bg-[#f7f5f2] text-[#111111]">
      <CinematicBackground />
      {/* Navbar */}
      <nav
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? 'border-white/70 bg-[#f7f5f2]/78 shadow-[0_12px_40px_rgba(17,17,17,0.06)] backdrop-blur-xl'
            : 'border-transparent bg-[#f7f5f2]/50 backdrop-blur-md'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid h-[72px] grid-cols-[1fr_auto] items-center gap-3 lg:grid-cols-[1fr_auto_1fr]">
            <Link
              href="/landing"
              className="flex w-fit items-center gap-2.5 rounded-xl outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#d64238]/30"
              aria-label="Inkaa landing page"
            >
              <AppLogo src="/assets/images/app_logo_clean.png" size={32} />
              <span className="font-extrabold text-xl text-[#111111] tracking-tight">Inkaa.</span>
            </Link>

            <div className="hidden items-center gap-1 rounded-full border border-white/75 bg-white/48 p-1 shadow-[0_12px_40px_rgba(17,17,17,0.05)] backdrop-blur-xl lg:flex">
              {navItems.map((item) => {
                const active = activeSection === item.id;

                return item.href.startsWith('/') ? (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="rounded-full px-4 py-2 text-sm font-semibold text-[#5f5f5f] transition-all duration-200 hover:bg-white/70 hover:text-[#d64238]"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={item.id}
                    href={item.href}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                      active
                        ? 'bg-[#d64238] text-white shadow-sm shadow-red-200'
                        : 'text-[#5f5f5f] hover:bg-white/70 hover:text-[#d64238]'
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 sm:gap-3">
              <Link
                href="/sign-up-login"
                className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-[#5f5f5f] transition-colors hover:bg-white/70 hover:text-[#d64238] md:inline-flex"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up-login"
                className="inline-flex items-center gap-2 rounded-xl bg-[#d64238] px-4 py-2.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(214,66,56,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#c43830] hover:shadow-[0_16px_36px_rgba(214,66,56,0.28)] sm:px-5"
              >
                <Icon name="RocketLaunchIcon" size={15} className="hidden sm:block" />
                <span className="hidden sm:inline">Start Free Trial</span>
                <span className="sm:hidden">Trial</span>
              </Link>
              <button
                className="rounded-xl border border-white/75 bg-white/58 p-2.5 shadow-sm backdrop-blur-xl transition-colors hover:bg-white/80 lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle navigation menu"
              >
                <Icon
                  name={mobileMenuOpen ? 'XMarkIcon' : 'Bars3Icon'}
                  size={21}
                  className="text-slate-600"
                />
              </button>
            </div>
          </div>

          <div
            className={`fixed inset-x-0 top-[72px] z-40 px-4 transition-all duration-300 lg:hidden ${
              mobileMenuOpen
                ? 'pointer-events-auto translate-y-0 opacity-100'
                : 'pointer-events-none -translate-y-4 opacity-0'
            }`}
          >
            <div className="rounded-3xl border border-white/80 bg-[#f7f5f2]/90 p-3 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
              <div className="space-y-1">
                {navItems.map((item) => {
                  const active = activeSection === item.id;

                  return item.href.startsWith('/') ? (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold text-[#5f5f5f] transition-all hover:bg-white/70 hover:text-[#d64238]"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                      <Icon name="ChevronRightIcon" size={15} />
                    </Link>
                  ) : (
                    <a
                      key={item.id}
                      href={item.href}
                      className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                        active
                          ? 'bg-white text-[#d64238] shadow-sm'
                          : 'text-[#5f5f5f] hover:bg-white/70 hover:text-[#d64238]'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                      <Icon name="ChevronRightIcon" size={15} />
                    </a>
                  );
                })}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/70 pt-3">
                <Link
                  href="/sign-up-login"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/80 bg-white/70 px-4 py-3 text-sm font-bold text-[#5f5f5f] transition-colors hover:bg-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up-login"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#d64238] px-4 py-3 text-sm font-bold text-white shadow-sm shadow-red-200 transition-colors hover:bg-[#c43830]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Start Trial
                </Link>
              </div>
            </div>
          </div>

          {mobileMenuOpen && (
            <button
              className="fixed inset-0 top-[72px] z-30 cursor-default bg-[#f7f5f2]/45 backdrop-blur-[1px] lg:hidden"
              aria-label="Close navigation menu"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-24 pt-24 sm:px-6 lg:px-8">
        {/* Background blobs */}
        <motion.div
          animate={{ opacity: [0.72, 0.95, 0.72], y: [0, -14, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[960px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(214,66,56,0.14),rgba(245,243,241,0.85)_46%,transparent_72%)] blur-3xl"
        />

        <div className="relative max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/75 bg-white/50 px-4 py-1.5 text-xs font-semibold text-[#d64238] shadow-[0_12px_40px_rgba(17,17,17,0.06)] backdrop-blur-xl"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#d64238]" />
            Built for Indian Digital Marketing Agencies
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.75, ease: 'easeOut', delay: 0.08 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#111111] leading-tight tracking-tight"
          >
            Run your entire agency
            <br />
            <span className="text-[#d64238]">from one dashboard.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut', delay: 0.18 }}
            className="mt-6 text-lg text-[#5f5f5f] max-w-2xl mx-auto leading-relaxed"
          >
            Clients, CRM, projects, GST invoices, Razorpay payments, AI proposals, and team
            management — all connected. No more juggling 10 tools.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut', delay: 0.28 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/sign-up-login"
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-[#d64238] text-white font-bold text-base rounded-2xl hover:bg-[#c43830] transition-all shadow-[0_20px_50px_rgba(214,66,56,0.26)] hover:shadow-[0_24px_58px_rgba(214,66,56,0.32)] hover:-translate-y-0.5"
            >
              <Icon name="RocketLaunchIcon" size={18} />
              Start Free Trial — 14 Days Free
            </Link>
            <a
              href="mailto:marketing@inkaastudio.com?subject=Inkaa%20Sales%20Enquiry"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/58 border border-white/75 text-[#111111] font-semibold text-base rounded-2xl hover:bg-white/78 transition-all shadow-[0_16px_42px_rgba(17,17,17,0.07)] backdrop-blur-xl"
            >
              <Icon name="PlayCircleIcon" size={18} className="text-[#d64238]" />
              Talk to Sales
            </a>
          </motion.div>
          <p className="mt-4 text-xs text-[#5f5f5f]/75">
            No credit card required · Cancel anytime · GST-compliant billing
          </p>
        </div>
      </section>

      <StorytellingScroll />

      <DashboardShowcase />

      {/* Features Bento */}
      <section
        id="features"
        className="relative scroll-mt-24 overflow-hidden bg-[#f5f3f1]/80 px-4 py-24 sm:px-6 lg:px-8"
      >
        <div className="pointer-events-none absolute left-[-20%] top-12 h-[420px] w-[620px] rounded-full bg-[radial-gradient(circle_at_center,rgba(214,66,56,0.1),transparent_68%)] blur-3xl" />
        <div className="max-w-6xl mx-auto">
          <div className="mb-14 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#d64238]">
                Everything you need
              </p>
              <h2 className="max-w-3xl text-4xl font-extrabold leading-tight text-[#111111] sm:text-5xl lg:text-6xl">
                One platform for sales, delivery, finance, and AI.
              </h2>
            </div>
            <div className="rounded-[1.75rem] border border-white/75 bg-white/50 p-5 shadow-[0_18px_55px_rgba(17,17,17,0.07)] backdrop-blur-xl">
              <p className="text-base leading-8 text-[#5f5f5f]">
                Inkaa is built for digital marketing agencies that need a cleaner operating layer:
                capture leads, manage client work, generate proposals, calculate pricing, track
                invoices, and keep leadership visibility without jumping across disconnected tools.
              </p>
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                {[
                  ['6+', 'core workflows'],
                  ['1', 'connected client record'],
                  ['AI', 'built into proposals'],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/70 bg-white/55 px-3 py-4"
                  >
                    <p className="text-xl font-black text-[#111111]">{value}</p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5f5f5f]">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bento grid */}
          <div
            id="solutions"
            className="scroll-mt-28 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {/* Large card */}
            <div
              id="ai-tools"
              className="scroll-mt-28 lg:col-span-2 bg-gradient-to-br from-[#d64238] to-[#e76655] rounded-[1.65rem] p-7 text-white relative overflow-hidden shadow-[0_24px_70px_rgba(214,66,56,0.22)] transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_8%,rgba(255,255,255,0.26),transparent_36%)]" />
              <div className="relative z-10">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4 backdrop-blur">
                  <Icon name="SparklesIcon" size={20} className="text-white" />
                </div>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-white/70">
                  AI workspace
                </p>
                <h3 className="text-2xl font-black mb-3">AI Proposal Generator</h3>
                <p className="max-w-2xl text-white/82 text-sm leading-7">
                  Turn discovery notes into a structured client proposal with scope, deliverables,
                  timeline, strategy, campaign recommendations, and pricing suggestions for SEO,
                  ads, branding, web design, and retainers.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {['Strategy outline', 'Service scope', 'Client-ready copy'].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/20 bg-white/12 px-4 py-3 text-xs font-bold text-white/88 backdrop-blur"
                    >
                      {item}
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-white/80">
                  <Icon name="ClockIcon" size={13} />
                  Built to save hours on every proposal cycle
                </div>
              </div>
            </div>

            {/* Regular cards */}
            {detailedFeatures.map((feat) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.45 }}
                className="group rounded-[1.65rem] border border-white/75 bg-white/54 p-6 shadow-[0_18px_55px_rgba(17,17,17,0.07)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/72 hover:shadow-[0_26px_70px_rgba(17,17,17,0.1)]"
              >
                <div className="w-9 h-9 rounded-xl bg-[#d64238]/10 flex items-center justify-center mb-4 group-hover:bg-[#d64238]/15 transition-colors">
                  <Icon
                    name={feat.icon as Parameters<typeof Icon>[0]['name']}
                    size={18}
                    className="text-[#d64238]"
                  />
                </div>
                <h3 className="mb-2 text-lg font-black text-[#111111]">{feat.title}</h3>
                <p className="text-sm text-[#5f5f5f] leading-7">{feat.desc}</p>
                <div className="mt-5 space-y-2">
                  {feat.bullets.map((bullet) => (
                    <div
                      key={bullet}
                      className="flex items-center gap-2 text-xs font-bold text-[#111111]"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#d64238]" />
                      {bullet}
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-2xl border border-white/70 bg-white/55 px-4 py-3 text-xs font-semibold text-[#5f5f5f]">
                  {feat.result}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-24 py-24 px-4 sm:px-6 lg:px-8 bg-[#efebe7]/82">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#d64238] mb-3">
              Simple pricing
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111111]">
              Plans that grow with your agency
            </h2>
            <p className="mt-4 text-[#5f5f5f]">
              14-day free trial on all plans. No credit card required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.45 }}
                className={`relative rounded-[1.75rem] p-7 border backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 ${
                  plan.highlight
                    ? 'border-[#d64238]/45 bg-white/72 ring-2 ring-[#d64238]/15 shadow-[0_24px_70px_rgba(214,66,56,0.16)]'
                    : 'border-white/75 bg-white/54 shadow-[0_18px_55px_rgba(17,17,17,0.07)] hover:bg-white/72'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#d64238] text-white text-xs font-bold rounded-full shadow-[0_12px_30px_rgba(214,66,56,0.24)]">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-bold text-[#111111]">{plan.name}</h3>
                <p className="text-xs text-[#5f5f5f] mt-1 mb-4">{plan.desc}</p>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-[#111111]">{plan.price}</span>
                  <span className="text-sm text-[#5f5f5f]">{plan.period}</span>
                  <p className="mt-2 text-xs font-bold text-[#d64238]">{plan.annual}</p>
                </div>
                <ul className="space-y-2.5 mb-7">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-[#5f5f5f]">
                      <div className="w-4 h-4 rounded-full bg-[#d64238]/10 flex items-center justify-center flex-shrink-0">
                        <Icon name="CheckIcon" size={10} className="text-[#d64238]" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={
                    plan.cta === 'Contact Sales'
                      ? 'mailto:marketing@inkaastudio.com?subject=Inkaa%20Agency%20Plan%20Enquiry'
                      : '/sign-up-login'
                  }
                  className={`block w-full text-center py-3 rounded-xl text-sm font-bold transition-all ${
                    plan.highlight
                      ? 'bg-[#d64238] text-white hover:bg-[#c43830] shadow-[0_12px_30px_rgba(214,66,56,0.22)]'
                      : 'bg-white/58 border border-white/80 text-[#111111] hover:bg-white'
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        id="contact"
        className="relative scroll-mt-24 overflow-hidden bg-[#f7f5f2] px-4 py-24 sm:px-6 lg:px-8"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_center,rgba(214,66,56,0.14),transparent_62%)] blur-3xl" />
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55 }}
          className="relative mx-auto max-w-3xl rounded-[2rem] border border-white/75 bg-white/54 p-8 text-center shadow-[0_28px_90px_rgba(17,17,17,0.1)] backdrop-blur-xl sm:p-12"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111111] mb-4">
            Ready to run your agency smarter?
          </h2>
          <p className="text-[#5f5f5f] text-lg mb-10">
            Join 2,400+ agencies already using Inkaa. Start your 14-day free trial today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up-login"
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-[#d64238] text-white font-bold text-base rounded-2xl hover:bg-[#c43830] transition-all shadow-[0_20px_50px_rgba(214,66,56,0.25)]"
            >
              <Icon name="RocketLaunchIcon" size={18} />
              Start Free Trial
            </Link>
            <Link
              href="/sign-up-login"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/58 border border-white/80 text-[#111111] font-semibold text-base rounded-2xl hover:bg-white transition-all"
            >
              Sign In to Dashboard
            </Link>
          </div>
          <p className="mt-5 text-[#5f5f5f] text-xs">
            No credit card required · 14 days free · Cancel anytime
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/75 bg-[#efebe7]/80 px-4 py-10 text-[#5f5f5f] backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <AppLogo src="/assets/images/app_logo_clean.png" size={28} />
            <span className="font-extrabold text-[#111111] text-base">Inkaa.</span>
            <span className="text-[#5f5f5f] text-sm">Digital Marketing Software</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a href="#features" className="hover:text-[#d64238] transition-colors">
              Features
            </a>
            <a href="#pricing" className="hover:text-[#d64238] transition-colors">
              Pricing
            </a>
            <Link href="/sign-up-login" className="hover:text-[#d64238] transition-colors">
              Sign In
            </Link>
          </div>
          <p className="text-xs text-[#5f5f5f]/75">© 2026 Inkaa. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
