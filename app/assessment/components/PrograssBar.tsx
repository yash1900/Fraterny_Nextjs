'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useProgressAnimation } from '../hooks/useProgressAnimation';
import { useQuest } from '../hooks/useQuest';
import { SectionDrawer } from '../components/SectionDrawer';
import { HonestyTag } from '../types/types';

interface ProgressBarProps {
  currentValue: number;
  totalValue: number;
  showLabel?: boolean;
  showMilestones?: boolean;
  animated?: boolean;
  className?: string;
}

/**
 * Progress bar component for tracking quest completion
 * Features animated progress and milestone indicators based on questions in the current section
 */
export function ProgressBar({
  currentValue,
  totalValue,
  showLabel = true,
  showMilestones = true,
  animated = true,
  className = ''
}: ProgressBarProps) {
  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDrawerOpen(false);
      }
    };

    if (isDrawerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDrawerOpen]);

  // Get sections from the quest context
  const { sections, currentSectionId, currentQuestion, session, changeSection, allQuestions, submitResponse, hasAttemptedFinishWithIncomplete } = useQuest();
  
  // Helper function to check if a section has incomplete questions
  const sectionHasIncompleteQuestions = (sectionId: string): boolean => {
    if (!session?.responses || !allQuestions) return false;
    
    const sectionQuestions = allQuestions.filter(q => q.sectionId === sectionId);
    return sectionQuestions.some(question => {
      const response = session?.responses?.[question.id];
      
      // If no response in session, check if current question has DOM value
      if (!response && question.id === currentQuestion?.id) {
        // Check current DOM state for this question with proper type casting
        const currentTextarea = document.querySelector('textarea') as HTMLTextAreaElement;
        const currentInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        const currentRadio = document.querySelector(`input[name="question-${question.id}"]:checked`) as HTMLInputElement;
        
        const hasCurrentValue = (currentTextarea && currentTextarea.value.trim()) || 
                               (currentInput && currentInput.value.trim()) || 
                               currentRadio;
        
        return !hasCurrentValue; // Has current value = not incomplete
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
  
  // Find current section
  const currentSection = sections.find(section => section.id === currentSectionId);
  
  // Count of questions in the current section
  const questionsInSection = currentSection?.questions.length || 0;

  // Add these NEW functions:
const getTotalQuestionsCount = () => {
  return allQuestions?.length || 0;
};

// const getTotalCompletedQuestions = () => {
//   if (!session?.responses || !allQuestions) return 0;
//   return allQuestions.filter(q => session.responses && session.responses[q.id]).length;
// };

// const totalProgressPercentage = getTotalQuestionsCount() > 0 
//   ? (getTotalCompletedQuestions() / getTotalQuestionsCount()) * 100 
//   : 0;
  
  // Index of current question within the section
  const getQuestionIndexInSection = () => {
    if (!currentSection || !currentQuestion) return 0;
    
    return currentSection.questions.findIndex(q => q.id === currentQuestion.id);
  };

  const getCurrentGlobalQuestionIndex = () => {
  if (!currentQuestion || !sections) return 0;
  
  let globalIndex = 0;
  
  // Add questions from previous sections
  for (const section of sections) {
    if (section.id === currentSectionId) {
      // Found current section, add current question index within this section
      globalIndex += getQuestionIndexInSection();
      break;
    }
    // Add all questions from this section
    globalIndex += section.questions.length;
  }
  
  return globalIndex;
};

const totalProgressPercentage = getTotalQuestionsCount() > 0 
  ? ((getCurrentGlobalQuestionIndex() + 1) / getTotalQuestionsCount()) * 100 
  : 0;
  
  const questionIndexInSection = getQuestionIndexInSection();
  
  
  
  // // Generate milestones based on the number of questions in the current section
  // const generateMilestones = (): number[] => {
  //   if (!currentSection || questionsInSection === 0) {
  //     return [20, 40, 60, 80, 100]; // Fallback
  //   }
    
  //   // Create one milestone for each question
  //   return Array.from({ length: questionsInSection }, (_, index) => 
  //     (index / (questionsInSection - 1)) * 100
  //   );
  // };
  
  // const milestones = generateMilestones();
  
  // Use progress animation hook
  const { 
    progressControls, 
  } = useProgressAnimation(getCurrentGlobalQuestionIndex(), getTotalQuestionsCount(), {
    animated,
    // milestones
  });

  // Get section color by index
const getSectionColor = (sectionIndex: number): string => {
  const colors = ['#004A7F', '#CA7D7D', '#84ADDF', '#96C486', '#CECECE'];
  return colors[sectionIndex] || '#004A7F';
};

// Calculate how many sections are completed
const getCompletedSectionsCount = () => {
  const currentSectionIndex = sections.findIndex(s => s.id === currentSectionId);
  return currentSectionIndex;
};

// Calculate progress within current section
const getCurrentSectionProgress = () => {
  if (!currentSection) return 0;
  const questionsInCurrentSection = currentSection.questions.length;
  const answeredInCurrentSection = questionIndexInSection;
  // Add 1 to include the current question as "in progress" or completed
  return ((answeredInCurrentSection + 1) / questionsInCurrentSection) * 100;
};

// Calculate section-aware progress (now that helper functions are defined)
const completedSections = getCompletedSectionsCount();
const currentSectionProgress = getCurrentSectionProgress();
const segmentWidth = 100 / sections.length;
const sectionAwareProgress = (completedSections * segmentWidth) + ((currentSectionProgress / 100) * segmentWidth);
  
  // Determine progress bar color based on percentage
  // const getProgressColor = (): string => {
  //   return 'bg-gradient-to-br from-sky-800 to-sky-400'; // Always blue color
  // };

  const getProgressColor = (): string => {
  switch(currentSectionId) {
    case 'section_1': return '#004A7F';
    case 'section_2': return '#CA7D7D'; 
    case 'section_3': return '#84ADDF';
    case 'section_4': return '#96C486';
    case 'section_5': return '#CECECE';
    default: return '#004A7F';
  }
};
  
  const progressColor = getProgressColor();
  // console.log('🎨 Progress Color:', progressColor);

  // Handle drawer toggle
  const handleDrawerToggle = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  // Handle section selection from drawer
  // const handleSectionSelect = (sectionId: string) => {
  //   changeSection(sectionId);
  //   setIsDrawerOpen(false); // Close drawer after selection
  // };

  const handleSectionSelect = (sectionId: string) => {

//     const getAnonymousModeFromDOM = (): boolean => {
//   const toggleButton = document.querySelector('[data-anonymous-mode]');
//   return toggleButton?.getAttribute('data-anonymous-mode') === 'true';
// };

const getAnonymousModeFromDOM = (): boolean => {
  const allToggles = document.querySelectorAll('[data-anonymous-mode]');
  
  console.log('🔍 [ANON-READ] Found total toggles:', allToggles.length);
  
  if (allToggles.length === 0) {
    return false;
  }
  
  // If only 1 toggle, use it (mobile case)
  if (allToggles.length === 1) {
    const isAnonymous = allToggles[0].getAttribute('data-anonymous-mode') === 'true';
    console.log('🔍 [ANON-READ] Single toggle found:', {
      dataAttribute: allToggles[0].getAttribute('data-anonymous-mode'),
      result: isAnonymous
    });
    return isAnonymous;
  }
  
  // If 2+ toggles, find the VISIBLE one (desktop case)
  let visibleToggle: HTMLElement | null = null;
  allToggles.forEach((toggle, index) => {
    const toggleElement = toggle as HTMLElement;
    const isVisible = toggleElement.offsetParent !== null;
    console.log(`🔍 [ANON-READ] Toggle #${index}: visible=${isVisible}, data=${toggleElement.getAttribute('data-anonymous-mode')}`);
    if (isVisible) {
      visibleToggle = toggleElement;
    }
  });
  
  // log here visibleToggle result
  console.log('🔍 [ANON-READ] Visible toggle selected:', visibleToggle);

  
  const isAnonymous = visibleToggle ? (visibleToggle as any).getAttribute('data-anonymous-mode') === 'true' : false;
  console.log('🔍 [ANON-READ] Selected visible toggle:', {
    found: !!visibleToggle,
    result: isAnonymous
  });
  
  return isAnonymous;
};

  // Save current response before changing section
  if (currentQuestion) {
    const getSelectedTagsFromQuestionCard = (): HonestyTag[] => {
      try {
        const saved = localStorage.getItem(`quest_tags_${currentQuestion.id}`);
        if (saved) {
          const tags = JSON.parse(saved);
          return tags;
        }
      } catch (error) {
        console.error('Failed to load tags from localStorage:', error);
      }
      
      const tagButtons = document.querySelectorAll('[data-tag-selected="true"]');
      const selectedTags: HonestyTag[] = [];
      
      tagButtons.forEach(button => {
        const tagValue = button.getAttribute('data-tag-value') as HonestyTag;
        if (tagValue) {
          selectedTags.push(tagValue);
        }
      });
      
      return selectedTags;
    };

    if (currentQuestion.type === 'text_input') {
  //const currentTextarea = document.querySelector('textarea');
  const currentTextarea = Array.from(document.querySelectorAll('textarea')).find(ta => ta.offsetParent !== null);
  if (currentTextarea) {
    const selectedTags = getSelectedTagsFromQuestionCard();
    
    // Determine field name based on question type
    const getFieldName = () => {
      if (currentQuestion.id === 'q1_1') return 'name';
      if (currentQuestion.id === 'q1_2') return 'email';
      if (currentQuestion.id === 'q1_3') return 'age';
      if (currentQuestion.id === 'q1_5') return 'details';
      return 'details'; // fallback
    };
    
    const fieldName = getFieldName();
    
    if (currentQuestion.allowAnonymous) {
      // All anonymous-enabled questions (name, email, location)
      const isAnonymousMode = getAnonymousModeFromDOM();
      
      if (isAnonymousMode) {
        const anonymousResponse = JSON.stringify({
          isAnonymous: true,
          selectedCity: "",
          [fieldName]: currentTextarea.value  // Keep textarea value even in anonymous mode
        });
        submitResponse(currentQuestion.id, anonymousResponse, selectedTags);
      } else if (currentQuestion.enableCityAutocomplete) {
        // Location question with city
        const cityInput = document.querySelector('input[placeholder*="City, Country"]') as HTMLInputElement;
        const selectedCity = cityInput?.value || '';
        
        const combinedResponse = JSON.stringify({
          selectedCity: selectedCity,
          [fieldName]: currentTextarea.value,
          isAnonymous: false
        });
        submitResponse(currentQuestion.id, combinedResponse, selectedTags);
      } else {
        // Name/email questions without city
        const textOnlyResponse = JSON.stringify({
          selectedCity: "",
          [fieldName]: currentTextarea.value,
          isAnonymous: false
        });
        submitResponse(currentQuestion.id, textOnlyResponse, selectedTags);
      }
    } else if (currentQuestion.enableCityAutocomplete) {
      // Regular city autocomplete without anonymous mode
      const cityInput = document.querySelector('input[placeholder*="City, Country"]') as HTMLInputElement;
      const selectedCity = cityInput?.value || '';
      
      if (selectedCity) {
        const combinedResponse = JSON.stringify({
          selectedCity: selectedCity,
          details: currentTextarea.value
        });
        submitResponse(currentQuestion.id, combinedResponse, selectedTags);
      } else {
        submitResponse(currentQuestion.id, currentTextarea.value, selectedTags);
      }
    } else {
      // Regular text questions without any special features
      submitResponse(currentQuestion.id, currentTextarea.value, selectedTags);
    }
  }
}
else if (currentQuestion.type === 'number_dropdown') {
  const currentSelect = document.querySelector('select') as HTMLSelectElement;
  if (currentSelect && currentSelect.value) {
    const selectedTags = getSelectedTagsFromQuestionCard();
    submitResponse(currentQuestion.id, currentSelect.value, selectedTags);
  }
}
    else if (currentQuestion.type === 'multiple_choice') {
      const selectedRadio = document.querySelector(`input[name="question-${currentQuestion.id}"]:checked`) as HTMLInputElement;
      if (selectedRadio) {
        const selectedTags = getSelectedTagsFromQuestionCard();
        submitResponse(currentQuestion.id, selectedRadio.value, selectedTags);
      }
    }
    else if (currentQuestion.type === 'date_input') {
      const currentDateInput = document.querySelector('input[placeholder*="date of birth"]') as HTMLInputElement ||
                              document.querySelector('.MuiInputBase-input') as HTMLInputElement ||
                              document.querySelector('input[type="date"]') as HTMLInputElement;
      if (currentDateInput && currentDateInput.value) {
        const selectedTags = getSelectedTagsFromQuestionCard();
        submitResponse(currentQuestion.id, currentDateInput.value, selectedTags);
      }
    }
  }
  
  // After saving, change section
  changeSection(sectionId);
  setIsDrawerOpen(false);
};
  
  return (
    <>
      <div className='flex flex-col items-center gap-2'>
        <div className={`w-full ${className}`}>  
          {/* Progress bar */}
          {/* <div className="w-full h-2">
            <motion.div
              className={` h-full`}
              animate={progressControls}
              initial={{ width: '0%' }}
              style={{ width: `${totalProgressPercentage}%`, backgroundColor: progressColor }}
            />
          </div> */}
          {/* Single continuous progress bar */}
          <div className="w-full h-2 lg:h-3 bg-gray-200 rounded-r-full relative overflow-hidden">
            {/* Use pre-calculated section-aware progress */}
            <motion.div
                  className="h-full bg-gradient-to-r from-sky-600 to-sky-400 rounded-r-full relative overflow-hidden"
                  style={{ width: `${sectionAwareProgress}%` }}
                  animate={{ 
                    width: `${sectionAwareProgress}%`,
                    boxShadow: sectionAwareProgress > 0 && sectionAwareProgress < 100
                      ? '0 0 10px rgba(14, 165, 233, 0.4), 0 0 20px rgba(14, 165, 233, 0.2)'
                      : sectionAwareProgress === 100
                      ? '0 2px 4px rgba(0, 0, 0, 0.1)'
                      : 'none'
                  }}
                  initial={{ width: '0%' }}
                  transition={{ 
                    duration: 0.8, 
                    ease: "easeOut",
                    boxShadow: { duration: 0.3 }
                  }}
                >
                  {/* Shimmer effect for active progress */}
                  {sectionAwareProgress > 0 && sectionAwareProgress < 100 && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                      animate={{
                        x: ['-100%', '100%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  )}
                </motion.div>
            
            {/* Section dividers */}
            {sections.map((section, index) => {
              if (index === sections.length - 1) return null; // Don't show divider after last section
              
              const dividerPosition = ((index + 1) / sections.length) * 100;
              
              return (
                <div
                  key={`divider-${index}`}
                  className="absolute top-0 bottom-0 w-px bg-white opacity-50"
                  style={{ left: `${dividerPosition}%` }}
                />
              );
            })}
            
            {/* Completion checkmarks for each section */}
            {/* {sections.map((section, index) => {
              const isCompleted = index < getCompletedSectionsCount();
              const sectionCenterPosition = ((index + 0.5) / sections.length) * 100;
              
              if (!isCompleted) return null;
              
              return (
                <motion.div
                  key={`check-${index}`}
                  className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 cursor-pointer"
                  style={{ left: `${sectionCenterPosition}%` }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                  onClick={() => handleSectionSelect(section.id)}
                >
                  <div className="w-3 h-3 text-white flex items-center justify-center hover:scale-110 transition-transform">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-2.5 h-2.5">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </motion.div>
              );
            })} */}
            
            
          </div>
          
          {/* Milestone indicators */}
          {/* {showMilestones && (
            <div className="relative h-0 p-2">
              {milestones.map((milestone, index) => {
                const isActive = getCompletedResponsesInSection() > index;
                
                return (
                  <motion.div
                    key={index}
                    className={`w-9 h-9 bg-zinc-300 rounded-full absolute top-[-20px] left-[-5px] ${
                      isActive ? progressColor : 'bg-gray-200'
                    }`}
                    style={{ left: `${milestone}%`, marginLeft: '-20px' }}
                    animate={index === questionIndexInSection ? celebrationControls : undefined}
                  />
                );
              })}
            </div>
          )} */}
        </div>

        <div className="w-full px-6">
          {showLabel && (
            <div className="mb-2 text-sm flex justify-between items-center">
              {/* Section Selector Button with Dropdown - Hide on desktop since we have permanent sidebar */}
              <div className="lg:hidden relative" ref={dropdownRef}>
                <button
                  onClick={handleDrawerToggle}
                  className="w-28 min-w-28 h-10 bg-white rounded-[50px] border-[1.50px] border-neutral-400 items-center flex justify-center px-4 hover:bg-gray-50 transition-colors duration-200 group"
                >
                  <div className={`text-center justify-start text-xl font-normal font-gilroy-bold tracking-[-1.5px] mr-2 ${
                    (hasAttemptedFinishWithIncomplete && sectionHasIncompleteQuestions(currentSectionId)) ? 'text-red-600' : 'text-sky-800'
                  }`}>
                    {currentSection?.title || 'Section'}
                  </div>
                  <ChevronDown 
                    className={`w-4 h-4 text-sky-800 transition-transform duration-200 ${
                      isDrawerOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                
                {/* Section Drawer */}
                <SectionDrawer
                  isOpen={isDrawerOpen}
                  onClose={() => setIsDrawerOpen(false)}
                  onSectionSelect={handleSectionSelect}
                />
              </div>
              
              {/* Desktop: Show current section title without dropdown */}
              <div className="hidden lg:block">
                <div className={`text-xl font-normal font-gilroy-bold tracking-[-1.5px] ${
                  (hasAttemptedFinishWithIncomplete && sectionHasIncompleteQuestions(currentSectionId)) ? 'text-red-600' : 'text-sky-800'
                }`}>
                  {currentSection?.title || 'Section'}
                </div>
              </div>
              
              {/* Question Counter */}
              <div className={`text-xl font-normal font-gilroy-regular ${
                (hasAttemptedFinishWithIncomplete && sectionHasIncompleteQuestions(currentSectionId)) ? 'text-red-600' : 'text-neutral-500'
              }`}>
                {questionIndexInSection + 1} / {questionsInSection}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ProgressBar;