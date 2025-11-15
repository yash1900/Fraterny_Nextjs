import type { Metadata } from 'next';
import Script  from 'next/script';

export const metadata: Metadata = {
  title: 'Quest Mode — Your Psychological File | Fraterny',
  description: 'Compose a private psychological file from your own words. See a precise fragment free. Access your full edition when ready.',
  keywords: ['psychological file',
    'personal dossier',
    'identity blueprint',
    'self-knowledge',
    'introspection',
    'aesthetic psychology',
    'behavior patterns',
    'personal archetypes',
    'Fraterny Quest'],
  authors: [{ name: 'Fraterny' }],
  creator: 'Fraterny',
  publisher: 'Fraterny',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://fraterny.in/quest',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://fraterny.in/quest',
    title: 'Quest Mode — Your Psychological File | Fraterny',
    description: 'A private, aesthetic psychological file built from your words. Preview a fragment free; keep your full copy if it feels true.',
    siteName: 'Fraterny',
    images: [
      {
        url: 'https://fraterny.in/favicon-32x32.png',
        width: 1200,
        height: 630,
        alt: 'Quest — Private Psychological File by Fraterny',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quest Mode — Your Psychological File | Fraterny',
    description: 'Compose a private psychological file from your words. Preview a precise fragment free; access the full edition when ready.',
    images: ['https://fraterny.in/favicon-32x32.png'],
    creator: '@frat_erny',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  icons: {
    icon: '/favicon-32x32.png',
    apple: '/favicon-32x32.png',
  },
};
const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Fraterny — Quest Mode',
    description: 'Quest composes confidential psychological files from user-written answers. Preview a fragment; access your full edition when ready.',
    url: 'https://fraterny.in',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://fraterny.in/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
    sameAs: [
      'https://twitter.com/fraterny',
      'https://linkedin.com/company/fraterny',
      'https://github.com/fraterny',
    ],
  };

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Fraterny',
    description: 'Quest by Fraterny composes aesthetic intelligence files—private psychological artifacts built from your words.',
    url: 'https://fraterny.in',
    logo: 'https://fraterny.in/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'support@fraterny.com',
      contactType: 'Support Service',
    },
    sameAs: [
      'https://twitter.com/fraterny',
      'https://linkedin.com/company/fraterny',
      'https://github.com/fraterny',
    ],
  };

export default function QuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <div>
        <Script
          id="website-jsonld"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script
          id="organization-jsonld"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
      </div>
  );
}
