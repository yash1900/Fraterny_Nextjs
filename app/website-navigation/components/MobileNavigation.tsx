// MobileNavigation.tsx - Centralized Mobile Navigation Component for Next.js
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, LogOut } from 'lucide-react';
import { User as AuthUser } from '@supabase/supabase-js';
import { useAuth } from '../../auth/cotexts/AuthContext';
import { MAIN_NAV_LINKS, ADMIN_NAV_LINKS } from '../constants/constants';
import { Button } from '@/components/ui/button';

interface MobileNavigationProps {
  isOpen: boolean;
  isScrolled: boolean;
  toggleMenu: () => void;
  user: AuthUser | null;
  onSignOut: () => Promise<void>;
  className?: string;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isOpen,
  isScrolled,
  toggleMenu,
  user,
  onSignOut,
  className = '',
}) => {
  const { isAdmin } = useAuth();
  const pathname = usePathname();

  // Animation variants
  const menuVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
        when: 'beforeChildren',
        staggerChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <motion.div
      className={`lg:hidden fixed top-16 left-0 right-0 z-40 m-5 rounded-md ${
        isScrolled 
          ? 'bg-white/95' 
          : 'bg-white/10'
      } shadow-[0_4px_20px_0_rgba(0,0,0,0.1)] backdrop-blur-2xl ${className}`}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={menuVariants}
    >
      <div className="flex flex-col p-4 space-y-2 max-h-[calc(100vh-4rem)] overflow-y-auto">
        {/* Main navigation links */}
        {MAIN_NAV_LINKS.map((link) => (
          <motion.div key={link.name} variants={itemVariants}>
            <Link
              href={link.href}
              className={`block py-4 px-4 rounded-2xl text-lg font-medium tracking-wide ${
                isScrolled
                  ? 'text-navy hover:bg-gray-100'
                  : 'text-white hover:bg-white/10'
              } transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-terracotta focus:ring-offset-2 focus:ring-offset-transparent active:scale-98`}
              onClick={toggleMenu}
            >
              {link.name}
            </Link>
          </motion.div>
        ))}

        <motion.div
          className="border-t border-white/10 my-4"
          variants={itemVariants}
        />

        {/* Profile and Auth section */}
        {user ? (
          <>
            {/* Profile Link */}
            <motion.div variants={itemVariants}>
              <Link
                href="/profile"
                className={`flex items-center py-4 px-4 rounded-2xl text-lg font-medium tracking-wide ${
                  isScrolled
                    ? 'text-navy hover:bg-gray-100'
                    : 'text-white hover:bg-white/10'
                } transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-terracotta focus:ring-offset-2 focus:ring-offset-transparent active:scale-98`}
                onClick={toggleMenu}
              >
                <User className="mr-3" size={20} />
                <span>Your Profile</span>
              </Link>
            </motion.div>
            
            {/* Admin Links - Conditionally rendered */}
            {isAdmin && (
              <div className="space-y-1">
                {ADMIN_NAV_LINKS.map((link) => (
                  <motion.div key={link.name} variants={itemVariants}>
                    <Link
                      href={link.href}
                      className={`flex items-center py-4 px-4 rounded-2xl text-lg font-medium tracking-wide ${
                        isScrolled
                          ? 'text-navy hover:bg-gray-100'
                          : 'text-white hover:bg-white/10'
                      } transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-terracotta focus:ring-offset-2 focus:ring-offset-transparent active:scale-98`}
                      onClick={toggleMenu}
                    >
                      <span>{link.name}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
            
            {/* Sign Out Button */}
            <motion.button
              className={`flex items-center w-full text-left py-4 px-4 rounded-2xl text-lg font-medium tracking-wide ${
                isScrolled
                  ? 'hover:bg-gray-100'
                  : 'hover:bg-white/10'
              } transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent active:scale-98`}
              onClick={() => {
                onSignOut();
                toggleMenu();
              }}
              variants={itemVariants}
            >
              <LogOut className="mr-3" size={20} />
              <span>Sign Out</span>
            </motion.button>
          </>
        ) : (
          <motion.div variants={itemVariants} className="pt-2">
            <Link href="/auth" onClick={toggleMenu}>
              <Button
                className={`w-full py-4 text-lg font-medium tracking-wide rounded-2xl ${
                  isScrolled ? 'bg-black text-white' : 'bg-white text-black'
                } hover:opacity-90 transition-opacity focus:ring-2 focus:ring-terracotta focus:ring-offset-2`}
              >
                Sign In / Register
              </Button>
            </Link>
          </motion.div>
        )}
        
        {/* CTA Section - Apply Now (commented out but available) */}
        <motion.div
          className="border-t border-white/10 my-4"
          variants={itemVariants}
        />
      </div>
    </motion.div>
  );
};

export default MobileNavigation;