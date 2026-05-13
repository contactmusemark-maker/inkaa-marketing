import type { Metadata } from 'next';
import Link from 'next/link';
import { createSeoMetadata } from '@/lib/seo';

export const metadata: Metadata = createSeoMetadata({
  title: 'Features | Inkaa Marketing AI CRM for Agencies',
  description:
    'Explore Inkaa Marketing features: AI CRM, client management, proposal generation, campaign analytics, invoice tracking, payments, and team workflows for agencies.',
  path: '/features',
  keywords: ['Inkaa Marketing features', 'AI CRM features', 'agency workflow software'],
});

const features = [
  'AI-powered CRM pipeline',
  'Client operating system',
  'AI proposal generator',
  'Campaign analytics',
  'Invoice and payment tracking',
  'Team and project workflows',
];

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-[#f7f5f2] px-4 py-16 text-[#111111] sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl rounded-[2rem] border border-white/75 bg-white/56 p-8 shadow-[0_28px_90px_rgba(17,17,17,0.09)] backdrop-blur-xl sm:p-12">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#d64238]">Features</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">
          AI-powered agency operations, from lead to payment.
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-[#5f5f5f]">
          Inkaa Marketing brings CRM, proposals, campaigns, clients, invoices, payments, and AI
          workflows into one premium SaaS platform for digital marketing agencies.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature}
              className="rounded-3xl border border-white/75 bg-[#f7f5f2]/72 p-5 font-bold shadow-[0_16px_45px_rgba(17,17,17,0.05)]"
            >
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#d64238]" />
              {feature}
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/sign-up-login"
            className="rounded-2xl bg-[#d64238] px-7 py-4 text-center text-sm font-black text-white shadow-[0_20px_50px_rgba(214,66,56,0.24)]"
          >
            Start Free Trial
          </Link>
          <Link
            href="/landing#features"
            className="rounded-2xl border border-white/80 bg-white/64 px-7 py-4 text-center text-sm font-bold text-[#111111]"
          >
            View Feature Story
          </Link>
        </div>
      </section>
    </main>
  );
}
