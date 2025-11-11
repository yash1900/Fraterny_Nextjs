'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { QuestLayout } from '../components/QuestLayout';
import { QuestContainer } from '../components/QuestContainer';

interface QuestErrorProps {
  error?: Error | string;
  onRetry?: () => void;
  className?: string;
}


export function QuestError({ 
  error,
  onRetry,
  className = '' 
}: QuestErrorProps) {
  // Error message
  const errorMessage = error 
    ? typeof error === 'string' 
      ? error 
      : error.message 
    : 'An unexpected error occurred';
  
  // Animation
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring" as const,
        stiffness: 100,
        damping: 20
      }
    }
  };
  
  return (
    <QuestLayout showNavigation={false} className={className}>
      <QuestContainer variant="card">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-xl mx-auto text-center py-8"
        >
          <div className="mb-6">
            <svg className="w-16 h-16 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-playfair text-navy mb-3">
            Something Went Wrong
          </h1>
          
          <p className="text-gray-600 mb-6">
            {errorMessage}
          </p>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 border border-navy text-navy rounded-lg hover:bg-navy/5 transition-colors"
            >
              Refresh Page
            </button>
            
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-6 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta/90 transition-colors"
              >
                Try Again
              </button>
            )}
          </div>
        </motion.div>
      </QuestContainer>
    </QuestLayout>
  );
}

export default QuestError;