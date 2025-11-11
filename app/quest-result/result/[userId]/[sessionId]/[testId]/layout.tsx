// layout.tsx
import { Metadata } from 'next';

type Props = {
  params: {
    userId: string;
    sessionId: string;
    testId: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {

  return {
    title: 'Your Quest Results | Personality Assessment',
    description: 'View your personalized Quest assessment results with detailed insights into your personality, strengths, and recommendations.',
    openGraph: {
      title: 'Quest Assessment Results',
      description: 'Discover your personalized personality insights',
      type: 'website',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: 'Quest Results',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Quest Assessment Results',
      description: 'Discover your personalized personality insights',
      images: ['/og-image.png'],
    },
    robots: {
      index: false, // Don't index individual result pages for privacy
      follow: true,
    },
  };
}

export default function QuestResultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="">
      {children}
    </div>
  );
}