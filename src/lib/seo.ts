import type { Metadata } from 'next';

export const siteUrl = 'https://marketing.inkaastudio.com';
export const siteName = 'Inkaa Marketing';
export const defaultTitle = 'Inkaa Marketing | AI-Powered Marketing CRM for Agencies';
export const defaultDescription =
  'Inkaa Marketing is an AI-powered CRM and marketing automation platform for agencies to manage clients, leads, proposals, campaigns, invoices, payments, and team workflows.';
export const defaultKeywords = [
  'AI marketing CRM',
  'marketing agency CRM',
  'agency management software',
  'AI proposal generator',
  'marketing automation platform',
  'client management software',
  'campaign management CRM',
  'digital marketing SaaS',
  'Inkaa Marketing',
];
export const ogImage = '/og-image.svg';

type SeoInput = {
  title?: string;
  description?: string;
  path?: string;
  keywords?: string[];
};

export function createSeoMetadata({
  title = defaultTitle,
  description = defaultDescription,
  path = '/',
  keywords = [],
}: SeoInput = {}): Metadata {
  const url = `${siteUrl}${path}`;
  const mergedKeywords = [...defaultKeywords, ...keywords];

  return {
    title,
    description,
    keywords: mergedKeywords,
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName,
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${siteName} product preview`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteName,
  url: siteUrl,
  logo: `${siteUrl}/favicon.png`,
  sameAs: [siteUrl],
};

export const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteName,
  url: siteUrl,
  description: defaultDescription,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${siteUrl}/features?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export const softwareJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: siteName,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: siteUrl,
  description: defaultDescription,
  offers: {
    '@type': 'Offer',
    priceCurrency: 'INR',
    price: '1999',
    availability: 'https://schema.org/InStock',
  },
  featureList: [
    'AI-powered CRM',
    'Client management',
    'AI proposal generation',
    'Campaign analytics',
    'Invoice and payment tracking',
    'Marketing automation workflows',
  ],
};
