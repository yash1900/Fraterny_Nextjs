// src/components/profile/sections/VillaApplicationSection.tsx

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '@/app/auth/cotexts/AuthContext';
import VillaApplicationForm from './VillaApplicationForm'

interface VillaApplicationSectionProps {
  className?: string;
}

export function VillaApplicationSection({ className = '' }: VillaApplicationSectionProps) {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [hasSubmittedApplication, setHasSubmittedApplication] = useState(false);

  // Animation variants matching QuestHistory pattern
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  // Get user's first name
  const getUserName = () => {
    return user?.user_metadata?.first_name || user?.user_metadata?.name || 'User';
  };

  // Handle form success
  const handleFormSuccess = () => {
    setHasSubmittedApplication(true);
    setShowForm(false);
  };

  // Handle start application
  const handleStartApplication = () => {
    setShowForm(true);
  };

  // If form is visible, render form component
  if (showForm) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={className}
      >
        <VillaApplicationForm onSuccess={handleFormSuccess} />
      </motion.div>
    );
  }

  return (
    <motion.div
      //variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm overflow-hidden ${className}`}
    >
      {/* Header Section - Matching QuestHistory style */}
      <div className="bg-gradient-to-br from-cyan-600 to-blue-800 p-6 md:p-8 text-white">
        <div className="flex justify-between items-start">
          <motion.div variants={itemVariants} className="flex-1">
            <h2 className="text-2xl md:text-3xl font-gilroy-bold mb-2">
              Villa Application
            </h2>
            <p className="text-sm md:text-base font-gilroy-medium text-white/80">
              Apply for an exclusive stay at Fratvilla
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="flex items-center space-x-2">
              <Home className="h-6 w-6" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <motion.div variants={itemVariants} className="px-6 md:px-8 pt-6 pb-8">
        {hasSubmittedApplication ? (
          // Success State
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="bg-sky-100 border-2 border-sky-400 rounded-xl p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
              >
                <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-900 font-gilroy-bold mb-2">
                Application Submitted Successfully!
              </h3>
              <p className="text-gray-600 font-gilroy-semibold mb-6">
                Thank you for your application. Our team will review it and get back to you within
                2-3 business days.
              </p>
              <div className="bg-white rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 font-gilroy-regular">
                  You'll receive a confirmation email at{' '}
                  <span className="font-medium text-gray-900">{user?.email}</span>
                </p>
              </div>
              {/* <Button
                onClick={() => setHasSubmittedApplication(false)}
                variant="outline"
                className="mx-auto"
              >
                <Edit className="w-4 h-4 mr-2" />
                Submit Another Application
              </Button> */}
            </div>
          </motion.div>
        ) : (
          <VillaApplicationForm />
        )}
      </motion.div>
    </motion.div>
  );
}

export default VillaApplicationSection;