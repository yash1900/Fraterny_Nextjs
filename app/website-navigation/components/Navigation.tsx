// Navigation.tsx - Main Navigation Component for Next.js
'use client';

import { useState, useMemo } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../auth/cotexts/AuthContext';
import Logo from './Logo';
import DesktopNavigation from './DesktopNavigation';
import MobileNavigation from './MobileNavigation';
import { useScrollEffect } from '../hooks/useScrollEffect';

const Navigation = () => {
  const { signOut, user, authReady } = useAuth();
  const { isScrolled, isPastHero } = useScrollEffect();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  

  const iconColor = useMemo(() => isScrolled ? '#0A1A2F' : '#FFFFFF', [isScrolled]);

  const navClasses = useMemo(
    () =>
      `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isScrolled ? 'bg-white/10 backdrop-filter backdrop-blur-lg shadow-lg py-2' : 'py-4'
      }`,
    [isScrolled]
  );

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Animation variants
  const navVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 20,
        delay: 0.2,
      },
    },
  };

  const logoVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 20,
        delay: 0.4,
      },
    },
  };

  const navItemsVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
    transition: {
        type: 'easeInOut',
        duration: 0.8,
        delay: 0.6, 
    }
  };

  // Only render once auth state is determined to prevent flash of incorrect UI
  if (!authReady) {
    return (
      <motion.nav className={navClasses} initial="hidden" animate="visible">
        <div className="mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <motion.div>
              <Logo isPastHero={isPastHero} />
            </motion.div>
            <div className="w-10 h-10" /> {/* Empty placeholder for loading state */}
          </div>
        </div>
      </motion.nav>
    );
  }

  return (
    <motion.nav className={`${navClasses}`}>
      <div className="px-4 sm:px-6">
        <motion.div className="flex items-center justify-between">
          <motion.div>
                <Logo isPastHero={isPastHero} />
          </motion.div>

          <motion.div key={authReady ? 'ready' : 'loading'} variants={navItemsVariants} initial="hidden" animate="visible">
            <DesktopNavigation isScrolled={isScrolled} />
          </motion.div>

          <motion.button
            variants={navItemsVariants}
            className={`${isScrolled ? 'text-navy' : 'text-black'} lg:hidden md:hidden focus:outline-none`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <X  size={24} className='text-white' />
            ) : (
              <Menu size={24} className='text-white' />
            )}
          </motion.button>

          
         



        <AnimatePresence>
          {isMenuOpen && (
            <MobileNavigation
              isOpen={isMenuOpen}
              isScrolled={isScrolled}
              toggleMenu={toggleMenu}
              user={user}
              onSignOut={handleSignOut}
            />
          )}
        </AnimatePresence>
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Navigation;