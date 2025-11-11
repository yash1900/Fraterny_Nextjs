import type { Metadata } from 'next';
import Script  from 'next/script';

export const metadata: Metadata = {
  title: "Fraterny - Social Network for Developers",
  description: "Join Fraterny, the professional social network for developers. Connect, collaborate, and grow with fellow software engineers worldwide.",
  keywords: "developers network, software engineering community, professional networking, tech collaboration, coding community",
  
  authors: [{ name: "Fraterny" }],
  creator: "Fraterny",
  publisher: "Fraterny",
  
  metadataBase: new URL('https://fraterny.in'), // Replace with your actual domain
  
  alternates: {
    canonical: '/',
  },
  
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
  
  openGraph: {
    title: "Fraterny - Social Network for Developers",
    description: "Join Fraterny, the professional social network for developers. Connect, collaborate, and grow with fellow software engineers worldwide.",
    type: "website",
    locale: "en_US",
    url: '/',
    siteName: "Fraterny",
    images: [
      {
        url: '/opengraph-image.png', // Place your OG image in public folder
        width: 1200,
        height: 630,
        alt: 'Fraterny - Social Network for Developers',
      },
    ],
  },
  
  twitter: {
    card: "summary_large_image",
    title: "Fraterny - Social Network for Developers",
    description: "Join Fraterny, the professional social network for developers. Connect, collaborate, and grow with fellow software engineers worldwide.",
    images: ['/opengraph-image.png'], // Place your Twitter image in public folder
    creator: '@fraterny', // Add your Twitter handle
  },
  
  verification: {
    google: 'your-google-verification-code', // Add after verifying in Google Search Console
    // yandex: 'your-yandex-verification-code',
    // other: 'your-other-verification-code',
  },
  
  icons: {
    icon: [
      { url: '/opengraph-image.png ' },
      { url: '/opengraph-image.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [
      { url: '/apple-icon.png' },
    ],
    shortcut: '/favicon.ico',
  },
  
  manifest: '/manifest.json',
};

export default function QuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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