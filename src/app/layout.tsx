import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Providers } from '@/components/Providers';
import '../styles/tailwind.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Inkaa — Digital Marketing Agency Platform',
  description:
    'Inkaa helps digital marketing agencies manage clients, projects, invoices, CRM pipeline, and team from one powerful dashboard.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://inkaa.in'),
  openGraph: {
    title: 'Inkaa — Digital Marketing Agency Platform',
    description:
      'Manage clients, projects, invoices, CRM, AI workflows, and teams from one digital marketing agency platform.',
    type: 'website',
    siteName: 'Inkaa',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Inkaa — Digital Marketing Agency Platform',
    description:
      'A SaaS platform for digital marketing agencies to manage operations and AI workflows.',
  },
  icons: {
    icon: [{ url: '/favicon.png', type: 'image/png' }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <body className={plusJakartaSans.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
