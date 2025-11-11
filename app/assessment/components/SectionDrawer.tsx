// src/components/quest/navigation/SectionDrawer.tsx
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuest } from '../hooks/useQuest';

interface SectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSectionSelect: (sectionId: string) => void;
}

/**
 * Section navigation drawer component
 * Displays all available sections for quick navigation
 */
export function SectionDrawer({
  isOpen,
  onClose,
  onSectionSelect
}: SectionDrawerProps) {
  const { sections, currentSectionId, session, allQuestions, hasAttemptedFinishWithIncomplete } = useQuest();
  
  // Helper function to check if a section has incomplete questions
  const sectionHasIncompleteQuestions = (sectionId: string): boolean => {
    if (!session?.responses || !allQuestions) return false;
    
    const sectionQuestions = allQuestions.filter(q => q.sectionId === sectionId);
    return sectionQuestions.some(question => {
      const response = session?.responses?.[question.id];
      
      // If no response in session, check if current question has DOM value  
      if (!response && question.id === allQuestions?.find(q => q.id === question.id)?.id) {
        // For simplicity, we'll assume no current DOM value for non-current questions
        return true; // No response = incomplete
      }
      
      // If no response in session
      if (!response) {
        return true; // No response = incomplete
      }
      
      // Check if response is just an empty string or whitespace
      const responseText = response.response?.trim();
      if (!responseText || responseText === '') {
        return true; // Empty response = incomplete
      }
      
      // Check if response is the placeholder text (means user didn't actually answer)
      if (responseText === "I preferred not to response for this question") {
        return true; // Placeholder response = incomplete
      }
      
      // Special handling for anonymous questions (q1_1, q1_2) - NOT q1_5
      if (question.allowAnonymous && (question.id === 'q1_1' || question.id === 'q1_2')) {
        try {
          const anonymousData = JSON.parse(responseText);
          // If user chose anonymous mode, the question is considered complete
          if (anonymousData.isAnonymous === true) {
            return false; // Anonymous mode = complete
          }
          // If not anonymous mode, check if the actual field has content
          const fieldName = question.id === 'q1_1' ? 'name' : 'email';
          const fieldValue = anonymousData[fieldName];
          if (!fieldValue || fieldValue.trim() === '') {
            return true; // No field content = incomplete
          }
        } catch (e) {
          // If can't parse as JSON, treat as regular text response
          // Fall through to other validation logic
        }
      }
      
      // Special handling for location question with anonymous mode
      if (question.id === 'q1_5' && question.allowAnonymous && question.enableCityAutocomplete) {
        try {
          const locationData = JSON.parse(responseText);
          
          // Check if user is in anonymous mode
          const isAnonymous = locationData.isAnonymous === true;
          
          if (isAnonymous) {
            // In anonymous mode, only details field is required
            const hasDetails = locationData.details && locationData.details.trim() !== '';
            if (!hasDetails) {
              return true; // No details = incomplete (even in anonymous mode)
            }
          } else {
            // In non-anonymous mode, both city and details are required
            const hasDetails = locationData.details && locationData.details.trim() !== '';
            const hasCity = locationData.selectedCity && locationData.selectedCity.trim() !== '';
            
            if (!hasDetails || !hasCity) {
              return true; // Missing city or details = incomplete
            }
          }
        } catch (e) {
          // If can't parse location data, consider it incomplete
          return true;
        }
      }
      
      // Special handling for ranking questions
      if (question.type === 'ranking') {
        try {
          const rankingData = JSON.parse(responseText);
          
          // Check if user actually ranked items (not just default order)
          const hasRealRanking = rankingData.isUserRanked === true;
          
          // Check if user provided explanation
          const hasExplanation = rankingData.explanation && rankingData.explanation.trim() !== '';
          
          // Ranking question is complete only if user ranked items OR provided explanation
          if (!hasRealRanking && !hasExplanation) {
            return true; // No ranking and no explanation = incomplete
          }
        } catch (e) {
          // If can't parse ranking data, consider it incomplete
          return true;
        }
      }
      
      return false; // Has real response = complete
    });
  };

  // Handle section selection
  const handleSectionClick = (sectionId: string) => {
    onSectionSelect(sectionId);
    onClose(); // Auto-close drawer after selection
  };

  // Handle backdrop click to close drawer
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Color mapping for sections based on Figma design
  const getSectionColor = (index: number): string => {
    const colors = [
      'text-sky-800',    // Section 1
      'text-red-800',    // Section 2  
      'text-purple-900', // Section 3
      'text-lime-700',   // Section 4
      'text-blue-950'    // Section 5
    ];
    return colors[index] || 'text-sky-800'; // Fallback to sky-800
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="absolute top-full left-0 z-50 w-32 mt-1"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {/* Dropdown Container */}
          <div className="w-28 bg-white rounded-[10px] border-[1.50px] border-neutral-400 py-2 shadow-lg">
            {sections.map((section, index) => (
              <div key={section.id}>
                <button
                  onClick={() => handleSectionClick(section.id)}
                  className="relative w-full px-4 py-2 text-center hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className={`text-xl font-normal font-gilroy-bold tracking-[-1.5px] ${getSectionColor(index)}`}>
                    {section.title}
                  </div>
                  
                  {/* Red dot indicator for incomplete sections */}
                  {hasAttemptedFinishWithIncomplete && sectionHasIncompleteQuestions(section.id) && (
                    <div className="absolute top-1 right-1 w-2 h-2 opacity-60 bg-red-600 rounded-full"></div>
                  )}
                </button>
                
                {/* Separator line (except for last item) */}
                {index < sections.length - 1 && (
                  <div className="w-full h-0 outline outline-[0.50px] outline-offset-[-0.25px] outline-neutral-400" />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default SectionDrawer;