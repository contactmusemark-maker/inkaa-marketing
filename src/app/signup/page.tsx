import type { Metadata } from 'next';
import AuthScreen from '@/app/sign-up-login/components/AuthScreen';
import { createSeoMetadata } from '@/lib/seo';

export const metadata: Metadata = createSeoMetadata({
  title: 'Signup | Start Inkaa Marketing Free Trial',
  description:
    'Create an Inkaa Marketing account and start using AI-powered CRM, proposal generation, client management, and marketing automation for your agency.',
  path: '/signup',
  keywords: ['Inkaa Marketing signup', 'start free trial', 'AI agency CRM signup'],
});

export default function SignupPage() {
  return <AuthScreen initialTab="register" />;
}
