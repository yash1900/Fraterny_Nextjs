// AnalyzeSidebar.tsx

'use client';


import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, LayoutDashboard, LogOut, User, X, Luggage} from 'lucide-react';
import { NotepadText, HelpCircle, Mail  } from 'lucide-react';
import { useAuth } from '../../../auth/cotexts/AuthContext';
import { useRouter } from 'next/navigation';
import {useIsMobile} from '../utils/use-mobile';


interface AnalyzeSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'blue' | 'white';
  className?: string;
  onNavigateToSection?: (targetScreen: number, sectionId?: string) => void;
  customMenuItems?: MenuItemConfig[];
  headerTitle?: string;
  showMobileOnly?: boolean;
}

interface MenuItemConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}
const sidebarVariants = {
  closed: {
    x: '100%',
    opacity: 0
  },
  open: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      damping: 25,
      stiffness: 120,
      duration: 0.4
    }
  }
};

const menuContainerVariants = {
  closed: {},
  open: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const menuItemVariants = {
  closed: {
    x: 50,
    opacity: 0
  },
  open: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      damping: 20,
      stiffness: 100
    }
  }
};

const getMenuItems = (isAuthenticated: boolean, user: any): MenuItemConfig[] => {
  const commonItems: MenuItemConfig[] = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home className="w-5 h-5" />,
      action: () => {}, // Will be replaced in component
      variant: 'primary' as const
    },
    // {
    //   id: 'dashboard',
    //   label: 'Dashboard',
    //   icon: <LayoutDashboard className="w-5 h-5" />,
    //   action: () => {}, // Will be replaced in component
    //   variant: 'primary' as const
    // },
    {
      id: 'faq',
      label: 'FAQ',
      icon: <HelpCircle className="w-5 h-5" />,
      action: () => {}, // Will be replaced in component
      variant: 'primary' as const
    },
    // {
    //   id: 'contact',
    //   label: 'Contact',
    //   icon: <Mail className="w-5 h-5" />,
    //   action: () => {}, // Will be replaced in component
    //   variant: 'primary' as const
    // },
    {
      id: 'test',
      label: 'Start Test',
      icon: <NotepadText className="w-5 h-5" />,
      action: () => {}, // Will be replaced in component
      variant: 'primary' as const
    }
  ];

  if (isAuthenticated && user) {
    return [
      ...commonItems,
      {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      action: () => {}, // Will be replaced in component
      variant: 'primary' as const
      },
      {
        id: 'logout',
        label: 'Logout',
        icon: <LogOut className="w-5 h-5" />,
        action: () => {}, // Will be replaced in component
        variant: 'danger' as const
      }
    ];
  } else {
    return [
      ...commonItems,
      {
        id: 'signin',
        label: 'Sign In',
        icon: <User className="w-5 h-5" />,
        action: () => {}, // Will be replaced in component
        variant: 'primary' as const
      }
    ];
  }
};


export const AnalyzeSidebar: React.FC<AnalyzeSidebarProps> = ({
  isOpen,
  onClose,
  theme = 'blue',
  className = '',
  onNavigateToSection,
  customMenuItems,
  headerTitle,
  showMobileOnly = true
}) => {
  // console.log('🔍 AnalyzeSidebar - onNavigateToSection:', onNavigateToSection);
  const { user, isLoading, signOut } = useAuth();
  const useremail  = user?.email;
  const userid = user?.id
  const router = useRouter();
  const { signInWithGoogle } = useAuth();
  
  // Only render on mobile by default, but allow override
  const isMobile = useIsMobile();
  if (showMobileOnly && !isMobile) return null;

  const isAuthenticated = !!user && !isLoading;
  
  const handleDashboard = () => {
    router.push(`/profile?tab=history`);
    onClose();
  };
  
  const handleLogout = async () => {
    // Implement logout logic
    try {
      await signOut(); // Your logout function
      router.push('/quest');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    onClose();
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle(); // Your existing function
      onClose();
    } catch (error) {
      console.error('Google sign-in failed:', error);
    }
  };

  const handleHome = () => {
    router.push('/quest');
    onClose();
  };

  const baseMenuItems = customMenuItems || getMenuItems(isAuthenticated, user);
  const menuItems = customMenuItems ? baseMenuItems : baseMenuItems.map(item => ({
  ...item,
  action: item.id === 'home' ? () => {
            onNavigateToSection?.(0);
            onClose();
          } :
          item.id === 'faq' ? () => {
            onNavigateToSection?.(3, 'faq-section');
            onClose();
          } :
          item.id === 'contact' ? () => {
            onNavigateToSection?.(3, 'contact-section');
            onClose();
          } :
          item.id === 'test' ? () => {
            router.push('/assessment');
            onClose();
          } :
          item.id === 'dashboard' ? () => {
            handleDashboard();
          } :
          item.id === 'logout' ? handleLogout :
          item.id === 'signin' ? handleGoogleSignIn :
          () => {}
}));
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/30 z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Sidebar Panel */}
          {/* Sidebar Panel */}
          <motion.div
            className={`fixed right-0 top-0 h-full w-60 z-[70] ${
              theme === 'blue' ? 'bg-[#004A7F]' : 'bg-white'
            } shadow-2xl ${className}`}
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-white/20">
              <h3 className={`font-gilroy-medium text-2xl ${
                theme === 'blue' ? 'text-white' : 'text-gray-900'
              }`}>
                {headerTitle || 'Hello Stranger'}
              </h3>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'blue' 
                    ? 'hover:bg-white/10 text-white' 
                    : 'hover:bg-gray-100 text-gray-900'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Items */}
            <motion.div
              className="px-4 py-6"
              variants={menuContainerVariants}
              initial="closed"
              animate="open"
            >
              {menuItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  onClick={item.action}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left mb-2 ${
                    theme === 'blue'
                      ? item.variant === 'danger'
                        ? 'text-white hover:bg-red-500/20'
                        : 'text-white hover:bg-white/10'
                      : item.variant === 'danger'
                        ? 'text-white hover:bg-white/10'
                        : 'text-gray-900 hover:bg-white/10'
                  }`}
                  variants={menuItemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {item.icon}
                  <span className="font-gilroy-regular">{item.label}</span>
                </motion.button>
              ))}
            </motion.div>

            <motion.div className="flex justify-between items-center w-full pl-4 pb-4 pt-4 border-t border-white/20 absolute bottom-0">
              <h3 className={`text-xs font-gilroy-medium font-medium ${
                theme === 'blue' ? 'text-white' : 'text-gray-900'
              }`}>
                A Product by Fraterny
              </h3>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};