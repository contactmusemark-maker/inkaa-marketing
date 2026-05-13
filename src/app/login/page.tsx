import type { Metadata } from 'next';
import AuthScreen from '@/app/sign-up-login/components/AuthScreen';
import { createSeoMetadata } from '@/lib/seo';

export const metadata: Metadata = createSeoMetadata({
  title: 'Login | Inkaa Marketing',
  description:
    'Log in to Inkaa Marketing, the AI-powered CRM and marketing automation platform for agencies.',
  path: '/login',
  keywords: ['Inkaa Marketing login', 'agency CRM login'],
});

export default function LoginPage() {
  return <AuthScreen initialTab="login" />;
}
