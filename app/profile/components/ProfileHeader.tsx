'use client'


import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/app/auth/cotexts/AuthContext';

/**
 * Profile header component showing user info and quick stats
 * Redesigned with brand identity
 */
const ProfileHeader = () => {
  const { user } = useAuth();
  
  // Extract user metadata
  const userMetadata = user?.user_metadata || {};
  const firstName = userMetadata.first_name || '';
  const lastName = userMetadata.last_name || '';
  const displayName = firstName && lastName 
    ? `${firstName} ${lastName}` 
    : user?.email?.split('@')[0] || 'User';
    
  // Format join date
  const joinDate = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Recent member';

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    }
  };

  const avatarVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 20,
        delay: 0.2
      }
    },
    hover: {
      scale: 1.05,
      boxShadow: "0 0 20px rgba(255,255,255,0.3)",
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 10
      }
    }
  };
    
  return (
    // In ProfileHeader.tsx, modify the main container div:
      <motion.div 
        className="bg-gradient-to-br from-cyan-700 to-blue-900 text-white py-24"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 max-w-7xl">
            {/* Profile image */}
            <motion.div 
              className="w-24 h-24 font-gilroy-bold rounded-full bg-gray-200 border-4 border-white flex items-center justify-center text-navy text-2xl font-bold shadow-lg"
              variants={avatarVariants}
              whileHover="hover"
            >
              {displayName.charAt(0).toUpperCase()}
            </motion.div>
            
            {/* User info */}
            <div className="flex-1">
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-7xl font-gilroy-bold text-white mb-4"
                variants={itemVariants}
              
              >
                Your Profile
              </motion.h1>
              
              {/* <motion.p 
                className="text-white/80 font-medium"
                variants={itemVariants}
              >
                {user?.email}
              </motion.p> */}
              
              <motion.div 
                className="text-lg md:text-xl lg:text-xl font-gilroy-regular flex items-center mt-2 text-gray-300"
                variants={itemVariants}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 mr-1" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                Member since {joinDate}
              </motion.div>
            </div>
            
          </div>
        </div>
      
      {/* Quick stats section */}
    </motion.div>
  );
};

export default ProfileHeader;