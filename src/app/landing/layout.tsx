import type { Metadata } from 'next';
import { createSeoMetadata } from '@/lib/seo';

export const metadata: Metadata = createSeoMetadata({
  title: 'Inkaa Marketing | AI-Powered CRM and Automation for Agencies',
  description:
    'Discover Inkaa Marketing, an AI-powered marketing CRM for agencies to manage leads, clients, proposals, campaigns, invoices, payments, and team workflows.',
  path: '/',
  keywords: ['agency CRM features', 'AI marketing automation', 'marketing agency software'],
});

export default function LandingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
