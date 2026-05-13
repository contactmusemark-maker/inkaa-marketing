import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Providers } from '@/components/Providers';
import WhatsAppSupportButton from '@/components/support/WhatsAppSupportButton';
import { createSeoMetadata, organizationJsonLd, softwareJsonLd, websiteJsonLd } from '@/lib/seo';
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
  ...createSeoMetadata(),
  applicationName: 'Inkaa Marketing',
  authors: [{ name: 'Inkaa Studio', url: 'https://marketing.inkaastudio.com' }],
  creator: 'Inkaa Studio',
  publisher: 'Inkaa Studio',
  category: 'Marketing Software',
  icons: {
    icon: [{ url: '/favicon.png', type: 'image/png' }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <body className={plusJakartaSans.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationJsonLd, websiteJsonLd, softwareJsonLd]),
          }}
        />
        <Providers>{children}</Providers>
        <WhatsAppSupportButton />
      </body>
    </html>
  );
}
