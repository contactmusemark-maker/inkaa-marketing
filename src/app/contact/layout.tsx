import type { Metadata } from 'next';
import { createSeoMetadata } from '@/lib/seo';

export const metadata: Metadata = createSeoMetadata({
  title: 'Contact Inkaa Marketing | Sales for Agency CRM and AI Automation',
  description:
    'Contact Inkaa Marketing sales to discuss AI-powered CRM, marketing automation, proposal generation, client management, and agency workflow setup.',
  path: '/contact',
  keywords: ['contact Inkaa Marketing', 'agency CRM sales', 'marketing CRM demo'],
});

export default function ContactLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
