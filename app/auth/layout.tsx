// import Navigation from '@/components/Navigation';
// import Footer from '@/components/Footer';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  // Basic SEO
  title: 'Sign In | FRAT',
  description: 'Sign in to access your personalized assessments and track your growth journey with FRAT.',
  keywords: ['sign in', 'login', 'authentication', 'FRAT', 'personality assessment'],
  
  // Application info
  applicationName: 'FRAT',
  authors: [{ name: 'FRAT Team' }],
  creator: 'FRAT Inc.',
  
  // Robots
  robots: {
    index: false, // Don't index auth pages
    follow: true,
    nocache: true, // Don't cache auth pages
  },
  
  // Open Graph for social sharing
  openGraph: {
    title: 'Sign In to FRAT',
    description: 'Access your personalized assessments',
    url: 'https://frat.com/auth',
    siteName: 'FRAT',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://frat.com/og-auth.jpg',
        width: 1200,
        height: 630,
        alt: 'FRAT Sign In',
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: 'summary',
    title: 'Sign In to FRAT',
    description: 'Access your personalized assessments',
    creator: '@fratapp',
  },
  
  // No caching for auth pages
  other: {
    'cache-control': 'no-cache, no-store, must-revalidate',
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-200 flex flex-col">
      <div className="flex grow items-center justify-center px-4 py-24 sm:px-6 lg:px-8">
        {children}
      </div>

    </div>
  );
}