// DesktopNavigation.tsx - Centralized Desktop Navigation Component for Next.js
'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../auth/cotexts/AuthContext';
import { MAIN_NAV_LINKS, getSignInLinkWithRedirect } from '../constants/constants';
import UserMenu from './UserMenu';

interface DesktopNavigationProps {
  isScrolled: boolean;
}

const PILL_PADDING_X = 16; // px
const PILL_PADDING_Y = 6;  // px

const DesktopNavigation: React.FC<DesktopNavigationProps> = ({ isScrolled }) => {
  const pathname = usePathname();
  const { user } = useAuth();
  const navContainerRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  
  const [pill, setPill] = useState({
    visible: false,
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    opacity: 0,
  });
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Helper to update pill position/size
  const updatePill = useCallback((idx: number | null) => {
    if (idx === null || !linkRefs.current[idx]) {
      setPill(pill => ({ ...pill, visible: false, opacity: 0 }));
      return;
    }
    const el = linkRefs.current[idx];
    if (el && navContainerRef.current) {
      const navRect = navContainerRef.current.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      setPill({
        visible: true,
        left: elRect.left - navRect.left - PILL_PADDING_X / 2,
        top: elRect.top - navRect.top - PILL_PADDING_Y / 2,
        width: elRect.width + PILL_PADDING_X,
        height: elRect.height + PILL_PADDING_Y,
        opacity: 1,
      });
    }
  }, []);

  // Mouse enter/leave handlers
  const handleNavMouseEnter = () => {
    if (hoveredIdx !== null) updatePill(hoveredIdx);
  };

  const handleNavMouseLeave = () => {
    setHoveredIdx(null);
    setPill(pill => ({ ...pill, visible: false, opacity: 0 }));
  };

  const handleLinkMouseEnter = (idx: number) => {
    setHoveredIdx(idx);
    updatePill(idx);
  };

  const handleLinkMouseLeave = () => {
    setHoveredIdx(null);
    setPill(pill => ({ ...pill, visible: false, opacity: 0 }));
  };

  // Recalculate pill on resize
  useEffect(() => {
    const handleResize = () => {
      if (hoveredIdx !== null) updatePill(hoveredIdx);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [hoveredIdx, updatePill]);

  // Recalculate pill if hoveredIdx changes
  useEffect(() => {
    updatePill(hoveredIdx);
  }, [hoveredIdx, updatePill]);

  const buttonBaseClasses = `
    px-4 py-2
    text-white 
    rounded-lg 
    hover:bg-opacity-90 
    transition-all 
    duration-200 
    inline-flex
    items-center
    min-h-[44px]
  `;

  return (
    <div
      className="hidden lg:flex items-center space-x-12 relative z-10 text-xl"
      ref={navContainerRef}
      onMouseEnter={handleNavMouseEnter}
      onMouseLeave={handleNavMouseLeave}
    >
      {/* Glass Pill Animation - z-0, behind links */}
      <AnimatePresence>
        {pill.visible && (
          <motion.div
            key="glass-pill"
            initial={{
              opacity: 0,
              left: pill.left,
              top: pill.top,
              width: pill.width,
              height: pill.height,
            }}
            animate={{
              opacity: pill.opacity,
              left: pill.left,
              top: pill.top,
              width: pill.width,
              height: pill.height,
            }}
            exit={{ opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 32,
              mass: 1.2,
            }}
            className="absolute pointer-events-none z-0 rounded-full shadow-[0_4px_32px_0_rgba(0,0,0,0.10)] backdrop-blur-md bg-white/[0.18] border border-white/25"
          />
        )}
      </AnimatePresence>

      {/* Navigation Links - ensure z-10 and relative positioning */}
      {MAIN_NAV_LINKS.map((link, idx) => (
        <Link
          key={link.name}
          href={link.href}
          ref={el => void (linkRefs.current[idx] = el)}
          onMouseEnter={() => handleLinkMouseEnter(idx)}
          onMouseLeave={handleLinkMouseLeave}
          className={`
            ${isScrolled ? 'text-navy' : 'text-white'} 
            hover:text-black
            transition-colors duration-200
            px-3 py-2
            inline-flex
            items-center
            min-h-11
            min-w-11
            relative z-10
            font-gilroy-medium
          `}
        >
          {link.name}
        </Link>
      ))}

      {/* User Menu or Sign In Button */}
      {user ? (
        <UserMenu isScrolled={isScrolled} />
      ) : (
        <Link
          href={getSignInLinkWithRedirect(pathname)}
          className={`${buttonBaseClasses} ${isScrolled ? 'text-black' : 'text-white'} bg-neutral-700 flex items-center justify-center shadow-2xl`}>
          Sign In
        </Link>
      )}
    </div>
  );
};

export default DesktopNavigation;