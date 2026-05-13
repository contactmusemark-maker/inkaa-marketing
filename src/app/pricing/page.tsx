import type { Metadata } from 'next';
import Link from 'next/link';
import { createSeoMetadata } from '@/lib/seo';

export const metadata: Metadata = createSeoMetadata({
  title: 'Pricing | Inkaa Marketing AI CRM for Agencies',
  description:
    'Compare Inkaa Marketing pricing plans for agencies. Start with AI CRM, client management, campaign workflows, invoice tracking, and marketing automation.',
  path: '/pricing',
  keywords: ['Inkaa Marketing pricing', 'agency CRM pricing', 'marketing automation pricing'],
});

const plans = [
  [
    'Starter',
    '₹1,999/mo',
    '₹19,999/year · save ₹3,989',
    'CRM, GST invoicing, Razorpay-ready billing, and limited AI for lean Indian agencies.',
  ],
  [
    'Pro',
    '₹4,999/mo',
    '₹49,999/year · save ₹9,989',
    'Advanced CRM, AI tools, campaign analytics, and team management for growing agencies.',
  ],
  [
    'Agency',
    '₹9,999/mo',
    '₹99,999/year · save ₹19,989',
    'Unlimited clients, collaboration, white-label workflows, and scale controls for full-service agencies.',
  ],
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#efebe7] px-4 py-16 text-[#111111] sm:px-6 lg:px-8">
      <section className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#d64238]">Pricing</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">
            Plans for every agency stage.
          </h1>
          <p className="mt-6 text-lg leading-8 text-[#5f5f5f]">
            Choose the Inkaa Marketing plan that matches your client volume, AI usage, reporting
            needs, and team workflow.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {plans.map(([name, monthlyPrice, annualPrice, description]) => (
            <div
              key={name}
              className="rounded-[2rem] border border-white/75 bg-white/56 p-7 shadow-[0_24px_70px_rgba(17,17,17,0.08)] backdrop-blur-xl"
            >
              <h2 className="text-xl font-black">{name}</h2>
              <p className="mt-4 text-4xl font-black">{monthlyPrice}</p>
              <p className="mt-2 text-sm font-bold text-[#d64238]">{annualPrice}</p>
              <p className="mt-4 min-h-20 text-sm leading-7 text-[#5f5f5f]">{description}</p>
              <Link
                href={name === 'Agency' ? 'mailto:marketing@inkaastudio.com' : '/sign-up-login'}
                className="mt-7 block rounded-2xl bg-[#d64238] px-6 py-3 text-center text-sm font-black text-white"
              >
                {name === 'Agency' ? 'Contact Sales' : 'Start Free Trial'}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
