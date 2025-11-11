'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { QuestLayout } from '../components/QuestLayout';
import { QuestContainer } from '../components/QuestContainer';

interface QuestLoadingProps {
  message?: string;
  className?: string;
}

/**
 * Loading screen for the quest
 * Displays while data is being loaded
 */
export function QuestLoading({ 
  message = 'Preparing your assessment...', 
  className = '' 
}: QuestLoadingProps) {
  // Dot animation
  const dotVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        repeat: Infinity,
        repeatType: 'reverse' as const,
        duration: 0.5
      }
    }
  };
  
  // Staggered dots
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  return (
    <QuestLayout showNavigation={false} className={className}>
      <QuestContainer variant="transparent">
        <div className="flex flex-col items-center justify-center py-16">
          <motion.div 
            className="w-16 h-16 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-full h-full border-4 border-gray-200 border-t-blue-400 rounded-full animate-spin"></div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-navy mb-2 font-gilroy-bold"
          >
            {message}
          </motion.div>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex gap-1"
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                variants={dotVariants}
                className="w-2 h-2 bg-blue-600 rounded-full"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </motion.div>
        </div>
      </QuestContainer>
    </QuestLayout>
  );
}

export default QuestLoading;