import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/features', '/pricing', '/contact', '/login', '/signup'],
        disallow: [
          '/api/',
          '/dashboard/',
          '/client-management/',
          '/crm/',
          '/projects/',
          '/quotations/',
          '/invoices/',
          '/payments/',
          '/analytics/',
          '/ai-tools/',
          '/reports/',
          '/team/',
          '/tasks/',
          '/calendar/',
          '/documents/',
          '/settings/',
          '/billing/',
          '/integrations/',
          '/super-admin/',
          '/auth/',
          '/api/auth/',
          '/sign-up-login?callbackUrl=',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
