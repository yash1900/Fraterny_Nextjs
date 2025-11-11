'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IncompleteQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToIncomplete: () => void;
  incompleteCount: number;
  sectionName?: string;
  isDesktop?: boolean;
}

/**
 * Modal that appears when user tries to finish quest with incomplete questions
 * Provides option to navigate to first incomplete question
 */
export function IncompleteQuestionsModal({
  isOpen,
  onClose,
  onGoToIncomplete,
  incompleteCount,
  sectionName,
  isDesktop = false
}: IncompleteQuestionsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-100 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />
          
          {/* Modal Content */}
          <motion.div
            className={`relative bg-white rounded-2xl shadow-xl border w-full mx-4 overflow-hidden ${
              isDesktop 
                ? 'border-sky-200 border-2 max-w-lg lg:max-w-2xl shadow-2xl' 
                : 'border-gray-200 max-w-md'
            }`}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {/* Header */}
            <div className={`border-b border-gray-100 ${isDesktop ? 'px-8 py-8' : 'px-6 py-6'}`}>
              <div className="flex items-center space-x-3">
                  <h3 className={`font-bold text-gray-900 font-gilroy-bold ${isDesktop ? 'text-3xl lg:text-4xl' : 'text-xl'}`}>
                    Assessment Incomplete
                  </h3>
              </div>
            </div>

            {/* Content */}
            <div className={`${isDesktop ? 'px-8 pb-8 pt-4' : 'px-6 pb-6'}`}>
              <div className={`${isDesktop ? 'space-y-6' : 'space-y-4'}`}>
                <p className={`text-gray-700 font-gilroy-regular ${isDesktop ? 'text-2xl lg:text-3xl' : 'text-xl'}`}>
                  You have <span className="font-bold text-amber-600 font-gilroy-bold">{incompleteCount}</span> unanswered questions.
                </p>

                <div className={`text-gray-600 leading-6 font-gilroy-regular ${isDesktop ? 'text-2xl lg:text-3xl mb-8' : 'text-xl mb-4'}`}>
                  To get the most accurate analysis, please answer all questions before submitting your assessment.
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className={`bg-gray-50 ${isDesktop ? 'px-8 py-6' : 'px-6 py-4'}`}>
              <div className={`flex justify-start ${isDesktop ? 'space-x-6' : 'space-x-3'}`}>
                <button
                  onClick={onClose}
                  className={`border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-normal font-gilroy-regular tracking-[-2px] ${
                    isDesktop 
                      ? 'px-8 py-4 text-2xl lg:text-3xl hover:shadow-lg hover:border-gray-400' 
                      : 'px-4 py-2 text-xl'
                  }`}
                >
                  Close
                </button>
                
                <button
                  onClick={onGoToIncomplete}
                  className={`font-normal font-gilroy-bold tracking-[-1px] bg-gradient-to-br from-sky-800 to-sky-400 text-white rounded-lg transition-all duration-200 ${
                    isDesktop 
                      ? 'px-8 py-4 text-2xl lg:text-3xl hover:shadow-xl hover:scale-105 hover:from-sky-700 hover:to-sky-300'
                      : 'px-4 py-2 text-xl hover:opacity-90'
                  }`}
                >
                  Go to Question
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default IncompleteQuestionsModal;