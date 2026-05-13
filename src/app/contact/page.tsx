'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';

const contactEmail = 'marketing@inkaastudio.com';

const contactReasons = [
  {
    icon: 'SparklesIcon',
    title: 'Book a product walkthrough',
    description: 'See how Inkaa fits your agency workflows before you start.',
  },
  {
    icon: 'BuildingOfficeIcon',
    title: 'Discuss agency rollout',
    description: 'Plan team access, client migration, billing, and AI usage limits.',
  },
  {
    icon: 'CreditCardIcon',
    title: 'Ask about plans',
    description: 'Get help choosing Starter, Pro, or Agency for your launch stage.',
  },
];

export default function ContactPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f5f2] px-4 py-6 text-[#111111] sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <motion.div
          animate={{ x: [0, 24, -16, 0], y: [0, -18, 14, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute left-1/2 top-[-180px] h-[620px] w-[920px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(214,66,56,0.16),rgba(245,243,241,0.8)_44%,transparent_72%)] blur-3xl"
        />
        <div
          className="absolute inset-0 opacity-[0.05] mix-blend-multiply"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(17,17,17,0.42) 1px, transparent 0)',
            backgroundSize: '18px 18px',
          }}
        />
      </div>

      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-3xl border border-white/75 bg-white/48 px-4 py-3 shadow-[0_12px_40px_rgba(17,17,17,0.05)] backdrop-blur-xl">
        <Link href="/landing" className="flex items-center gap-2.5">
          <AppLogo src="/assets/images/app_logo_clean.png" size={32} />
          <span className="text-xl font-extrabold tracking-tight">Inkaa.</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/landing"
            className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-[#5f5f5f] transition-colors hover:bg-white/70 hover:text-[#d64238] sm:inline-flex"
          >
            Back to home
          </Link>
          <Link
            href="/sign-up-login"
            className="rounded-xl bg-[#d64238] px-4 py-2.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(214,66,56,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#c43830]"
          >
            Start Free Trial
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-6xl gap-8 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="flex flex-col justify-center"
        >
          <p className="mb-4 w-fit rounded-full border border-white/75 bg-white/52 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-[#d64238] shadow-[0_12px_40px_rgba(17,17,17,0.06)] backdrop-blur-xl">
            Contact sales
          </p>
          <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-[#111111] sm:text-5xl lg:text-6xl">
            Let&apos;s shape your agency operating system.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5f5f5f]">
            Talk to the Inkaa team about setup, plans, AI workflows, client migration, or a product
            walkthrough for your digital marketing agency.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href={`mailto:${contactEmail}?subject=Inkaa%20Sales%20Enquiry`}
              className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-[#d64238] px-7 py-4 text-sm font-black text-white shadow-[0_20px_50px_rgba(214,66,56,0.24)] transition-all hover:-translate-y-0.5 hover:bg-[#c43830]"
            >
              <Icon name="EnvelopeIcon" size={18} />
              Email Sales
            </a>
            <Link
              href="/sign-up-login"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/80 bg-white/56 px-7 py-4 text-sm font-bold text-[#111111] shadow-[0_16px_42px_rgba(17,17,17,0.06)] backdrop-blur-xl transition-colors hover:bg-white/78"
            >
              Start Free Trial
              <Icon name="ArrowRightIcon" size={16} />
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: 'easeOut', delay: 0.1 }}
          className="rounded-[2rem] border border-white/75 bg-white/54 p-6 shadow-[0_28px_90px_rgba(17,17,17,0.1)] backdrop-blur-xl sm:p-8"
        >
          <div className="rounded-[1.5rem] border border-white/75 bg-[#f5f3f1]/72 p-5">
            <p className="text-sm font-bold text-[#5f5f5f]">Sales email</p>
            <a
              href={`mailto:${contactEmail}?subject=Inkaa%20Sales%20Enquiry`}
              className="mt-2 block break-words text-2xl font-black text-[#111111] transition-colors hover:text-[#d64238]"
            >
              {contactEmail}
            </a>
            <p className="mt-3 text-sm leading-6 text-[#5f5f5f]">
              Send your agency size, current tools, and what you want to improve. We&apos;ll reply
              with the best next step.
            </p>
          </div>

          <div className="mt-5 grid gap-3">
            {contactReasons.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-white/75 bg-white/58 p-4 shadow-[0_14px_38px_rgba(17,17,17,0.05)] backdrop-blur-xl"
              >
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#d64238]/10">
                    <Icon
                      name={item.icon as Parameters<typeof Icon>[0]['name']}
                      size={19}
                      className="text-[#d64238]"
                    />
                  </div>
                  <div>
                    <h2 className="font-bold text-[#111111]">{item.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-[#5f5f5f]">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </main>
  );
}
