// Logo.tsx - Animated Logo Component for Next.js

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface LogoProps {
  isPastHero: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ isPastHero, className = '' }) => {

  return (
    <Link href="/" className={` ${className}`}>
      {isPastHero ? (
        <Image src='/lovable-uploads/ffcba562-8c6d-44dc-8607-53afc45d3a57.png' alt="Press Logo" width={100} height={80} className="aspect-auto invert" />
      ) : (
        <Image src='/lovable-uploads/ffcba562-8c6d-44dc-8607-53afc45d3a57.png' alt="Press Logo" width={100} height={80} className="aspect-auto" />
      )}
    </Link>
  );
};

export default Logo;