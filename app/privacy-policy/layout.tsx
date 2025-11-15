import type { Metadata, Viewport } from 'next';
import Script  from 'next/script';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: 'Quest — Private Introspection',
  description: 'Answer a short set of private prompts. Your file is composed from your words. ~10–15 minutes.',
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
    title: 'Quest — Open-ended Intospection',
    description: 'Private prompts. Your words compose your file.',
    siteName: 'Fraterny',
    images: [
      {
        url: 'https://fraterny.in/favicon-32x32.png',
        width: 1200,
        height: 630,
        alt: 'Quest Self-Awareness by Fraterny',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quest — Open-ended Introspection',
    description: 'Private prompts. Your words compose your file.',
    images: ['https://fraterny.in/favicon-32x32.png'],
    creator: '@frat_erny',
  },
  icons: {
    icon: '/favicon-32x32.png',
    apple: '/favicon-32x32.png',
  },
};
const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Quest — Open-ended Introspection',
    description: 'Private prompt flow that composes a personal fragment from the user’s written answers',
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
      'https://x.com/frat_erny',
      'https://linkedin.com/company/fraterny',
      'https://www.instagram.com/quest.fraterny/',
    ],
  };

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Quest — Open-ended Introspection',
    description: 'Private prompt flow that composes a personal fragment from the user’s written answers',
    url: 'https://fraterny.in',
    logo: 'https://fraterny.in/favicon-32x32.png',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'contact@fraterny.in',
      contactType: 'Customer Service',
    },
    sameAs: [
      'https://x.com/frat_erny',
      'https://linkedin.com/company/fraterny',
      'https://www.instagram.com/quest.fraterny/',
    ],
  };

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <div>
        <Script
          id="website-jsonld"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script
          id="organization-jsonld"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
      </div>
  );
}
