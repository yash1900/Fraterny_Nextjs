import type { Metadata } from 'next';
import ClientProviders from './ClientProviders';

export const metadata: Metadata = {
  title: 'Blog | FRAT - Insights on Personal Growth & Development',
  description: 'Explore articles on psychology, personal development, and growth insights from the FRAT community.',
  keywords: ['blog', 'personal development', 'personality assessment', 'growth', 'FRAT', 'self-improvement'],
  
  applicationName: 'FRAT',
  authors: [{ name: 'FRAT Team' }],
  creator: 'FRAT Inc.',
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  
  openGraph: {
    title: 'FRAT Blog - Personal Growth & Development',
    description: 'Explore insights on psychology, growth, and self-improvement',
    url: 'https://frat.com/blog',
    siteName: 'FRAT',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://frat.com/og-blog.jpg',
        width: 1200,
        height: 630,
        alt: 'FRAT Blog',
      },
    ],
  },
  
  twitter: {
    card: 'summary_large_image',
    title: 'FRAT Blog - Personal Growth & Development',
    description: 'Explore insights on psychology, growth, and self-improvement',
    creator: '@fratapp',
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientProviders>{children}</ClientProviders>;
}
