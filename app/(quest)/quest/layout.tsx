import type { Metadata } from 'next';
import Script  from 'next/script';

export const metadata: Metadata = {
  title: 'Quest: 15-Minute Self-Awareness Test + Detailed Analysis | Fraterny',
  description: 'Run Quest in 15 minutes. Free test with optional paid PDF. Map thought patterns, get a 35+ page report.',
  keywords: ['self-awareness test', 'personality test', 'psychological assessment', 'mind analysis', 'fraterny quest'],
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
    title: 'Quest: 15-Minute Self-Awareness Test + Detailed Analysis | Fraterny',
    description: 'Run Quest in 15 minutes. Free test with optional paid PDF. Map thought patterns, get a 35+ page report.',
    siteName: 'Fraterny',
    images: [
      {
        url: 'https://fraterny.in/favicon-32x32.png',
        width: 1200,
        height: 630,
        alt: 'Quest Self-Awareness Test by Fraterny',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quest: 15-Minute Self-Awareness Test + Detailed Analysis | Fraterny',
    description: 'Run Quest in 15 minutes. Free test with optional paid PDF. Map thought patterns, get a 35+ page report.',
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
    name: 'Fraterny',
    description: 'Professional social network for developers',
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
    description: 'Social Network for Developers',
    url: 'https://fraterny.in',
    logo: 'https://fraterny.in/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'contact@fraterny.in',
      contactType: 'Customer Service',
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