'use client';


import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useQuestAnimation } from '../hooks/useQuestAnimation';
import { QuestionCardProps } from '../types/types';
import { HonestyTag } from '../types/types';
import { useQuest } from '../hooks/useQuest';
import { AuthenticityTags } from '../components/AuthenticityTags';
import { RankingResponse } from '../responses/RankingResponse';
import { getWordValidationStatus, getWordValidationMessage } from '../utils/questValidation';
import { googleAnalytics } from '@/lib/services/googleAnalytics';
import { useAuth } from '../../auth/cotexts/AuthContext';
import { CityAutocomplete } from '../responses/CityAutocomplete';
import { useQuestionTiming } from '../hooks/useQuestionTiming';
import { X, Info  } from 'lucide-react';
// import './desktop-sidebar.css';
import { NumberDropdownResponse } from '../responses/NumberDropdownResponse';


export function QuestionCard({
  question,
  onResponse,
  isActive = true,
  isAnswered = false,
  previousResponse,
  showTags = true,
  className = ''
}: QuestionCardProps) {


  const [currentSelection, setCurrentSelection] = useState<string>(previousResponse?.response || '');
  const { trackQuestionView, stopQuestionTracking, session, allQuestions, sections, currentSectionId, changeSection, hasAttemptedFinishWithIncomplete } = useQuest();
  const [showInfo, setShowInfo] = useState(false);

   useQuestionTiming(question.id);
  const { user } = useAuth(); // Add this line
  //const [selectedCity, setSelectedCity] = useState<string>('');

// Parse previous response to separate city and text OR handle ranking data
const [response, setResponse] = useState<string>(() => {
  if (previousResponse?.response) {
    // For ranking questions, pass the full JSON response
    if (question.type === 'ranking') {
      console.log('🔄 Restoring ranking response:', previousResponse.response);
      return previousResponse.response;
    }
    
    // For questions with anonymous mode or city autocomplete, parse JSON
    if (question.allowAnonymous || question.enableCityAutocomplete) {
      try {
        // Try to parse as JSON with proper field mapping
        const parsed = JSON.parse(previousResponse.response);
        console.log('🔄 Restoring parsed response:', parsed);
        
        // Determine field name based on question type
        let fieldValue = '';
        if (question.id === 'q1_1') {
          fieldValue = parsed.name || '';
        } else if (question.id === 'q1_2') {
          fieldValue = parsed.email || '';
        } else if (question.id === 'q1_3') {        
          fieldValue = String(parsed.age || '') || '';
        } else if (question.id === 'q1_5') {
          fieldValue = parsed.details || '';
        } else {
          fieldValue = parsed.details || '';
        }
        
        return fieldValue;
      } catch {
        // If JSON parsing fails, return the raw response
        return previousResponse.response;
      }
    } else {
      // For regular text questions without special features, return raw response
      console.log('🔄 Restoring simple text response:', previousResponse.response);
      return previousResponse.response;
    }
  }
  return '';
});

  const [isAnonymousMode, setIsAnonymousMode] = useState<boolean>(() => {
  if (previousResponse?.response) {
    try {
      // Try to parse as JSON to check anonymous state
      const parsed = JSON.parse(previousResponse.response);
      if (parsed.hasOwnProperty('isAnonymous')) {
        return parsed.isAnonymous;
      }
      // FALLBACK: If no isAnonymous field but selectedCity exists, user chose to share
      if (parsed.selectedCity) {
        return false; // Not anonymous
      }
    } catch {
      // If not JSON, check if there's any response content
      if (previousResponse.response.trim()) {
        return false; // User provided some answer, so not anonymous
      }
    }
  }
  // DEFAULT CHANGED: start in non-anonymous mode
  return false;
});


  const [selectedCity, setSelectedCity] = useState<string>(() => {
    if (previousResponse?.response) {
      try {
        // Try to parse as JSON to get city
        const parsed = JSON.parse(previousResponse.response);
        return parsed.selectedCity || '';
      } catch {
        // If not JSON, no previous city selected
        return '';
      }
    }
    return '';
  });
  // Remember previous text when switching to anonymous
const [previousText, setPreviousText] = useState<string>('');

  // Handle data when switching anonymous mode
useEffect(() => {
  console.log('🔄 [ANON-DEBUG] Anonymous mode useEffect triggered:', {
    isAnonymousMode,
    questionId: question.id,
    currentResponse: response
  });
  if (isAnonymousMode) {
    // For name/email questions: save and clear text
    if (response && !question.enableCityAutocomplete) {
      setPreviousText(response);
      setResponse('');
      console.log('🧹 Saved and cleared text due to anonymous mode toggle (name/email)');
    }
    // For location questions: clear city but keep details text
    if (selectedCity) {
      setSelectedCity('');
      console.log('🧹 Cleared city data due to anonymous mode toggle');
    }
    
    // AUTO-SAVE: Immediately save anonymous response when toggling to anonymous
    if (question.allowAnonymous) {
      const getFieldName = () => {
        if (question.id === 'q1_1') return 'name';
        if (question.id === 'q1_2') return 'email';
        if (question.id === 'q1_3') return 'age';
        if (question.id === 'q1_5') return 'details';
        return 'details';
      };
      
      const fieldName = getFieldName();
      const fieldValue = question.enableCityAutocomplete ? response : ""; // Keep details for location, clear for name/email
      console.log('🚀 Auto-saving due to anonymous mode toggle:', fieldValue);
      
      
      const anonymousResponse = JSON.stringify({
        isAnonymous: true,
        selectedCity: "",
        [fieldName]: fieldValue
      });
    
      console.log('💾 [ANON-DEBUG] Calling onResponse with:', anonymousResponse);
      onResponse(anonymousResponse, selectedTags);
      console.log('✅ [ANON-DEBUG] onResponse completed');
    }
  } else {
    console.log('🔄 [ANON-DEBUG] Switched to non-anonymous mode');
    if (previousText && !question.enableCityAutocomplete) {
      setResponse(previousText);
      console.log('🔄 Restored previous text when switching to share mode');
    }
  }
}, [isAnonymousMode]);
  

    // First, create a memoized initial value outside of useState
    const getInitialTags = useMemo(() => {
      if (question?.id) {
        try {
          const savedTags = localStorage.getItem(`quest_tags_${question.id}`);
          if (savedTags) {
            // console.log('📂 Loading from localStorage (memoized):', JSON.parse(savedTags));
            return JSON.parse(savedTags);
          }
        } catch (error) {
          console.error('Failed to load tags from localStorage:', error);
        }
      }
      return previousResponse?.tags || [];
    }, [question?.id, previousResponse?.tags]);

    // Then use simple useState with the memoized value
    const [selectedTags, setSelectedTags] = useState<HonestyTag[]>(getInitialTags);

    useEffect(() => {
  if (question?.type === 'date_input') {
    console.log('📅 Date response stored:', response);
  }
}, [response, question?.id]);

useEffect(() => {
    if (question?.id && isActive) {
      // Existing internal tracking
      trackQuestionView(question.id);
      
      // NEW: GA4 tracking
      const userState = user ? 'logged_in' : 'anonymous';
      const sessionId = session?.id || `temp_${Date.now()}`;
      
      // Calculate question indices safely
      const questionIndex = allQuestions?.findIndex(q => q.id === question.id) + 1 || 1;
      const sectionQuestions = sections?.find(s => s.id === question.sectionId)?.questions || [];
      const sectionQuestionIndex = sectionQuestions.findIndex(q => q.id === question.id) + 1 || 1;
      
      // Only track if we have required data
      if (question.sectionId && question.sectionId.trim() !== '') {
        googleAnalytics.trackQuestionView({
          session_id: sessionId,
          question_id: question.id,
          section_id: question.sectionId,
          user_state: userState,
          question_index: questionIndex,
          section_question_index: sectionQuestionIndex
        });
      }
    }
  }, [question?.id, isActive, session?.id, user, allQuestions, sections]);


// Clear city data when switching to anonymous mode
useEffect(() => {
  if (isAnonymousMode && selectedCity) {
    setSelectedCity('');
  }
}, [isAnonymousMode]);


  const { ref, controls, variants } = useQuestAnimation({
    variant: 'questionCard',
    triggerOnce: true
  });



  // NEW: Word count configuration for text inputs
  const maxWords = 100;
  const wordWarningThreshold = 90;
  const maxLength = 1000; // Character limit

  const handleTagSelect = (tag: HonestyTag) => {
  setSelectedTags(prev => {
    const newTags = prev.includes(tag) 
      ? prev.filter(t => t !== tag)
      : [...prev, tag];

    if (question?.id) {
      localStorage.setItem(`quest_tags_${question.id}`, JSON.stringify(newTags));
      // console.log('💾 QuestionCard saved tags to localStorage:', {
      //   questionId: question.id,
      //   tags: newTags
      // });
    }
    
    return newTags;
  });
};
  
const handleSubmit = (submittedResponse: string) => {
  if (!isActive) return;
  console.log('🚀 handleSubmit called with:', submittedResponse);
  
  // Determine field name based on question type
  const getFieldName = () => {
    if (question.id === 'q1_1') return 'name';
    if (question.id === 'q1_2') return 'email';
    if (question.id === 'q1_3') return 'age';
    if (question.id === 'q1_5') return 'details';
    return 'details'; // fallback
  };
  
  const fieldName = getFieldName();
  
  // Handle different question types with anonymous support
  let finalResponse = submittedResponse;
  
  if (question.allowAnonymous) {
    if (isAnonymousMode) {
      // Save as anonymous response
      finalResponse = JSON.stringify({
        isAnonymous: true,
        selectedCity: "",
        [fieldName]: ""
      });
      console.log('📦 SAVING anonymous response as:', finalResponse);
    } else if (question.enableCityAutocomplete && selectedCity) {
      // Location question with city
      finalResponse = JSON.stringify({
        selectedCity: selectedCity,
        [fieldName]: submittedResponse,
        isAnonymous: false
      });
      console.log('📦 SAVING city+text as:', finalResponse);
    } else {
      // Name/email questions
      finalResponse = JSON.stringify({
        selectedCity: "",
        [fieldName]: submittedResponse,
        isAnonymous: false
      });
      console.log('📦 SAVING name/email response as:', finalResponse);
    }
  } else if (question.enableCityAutocomplete && selectedCity) {
    // Regular city autocomplete without anonymous mode
    finalResponse = JSON.stringify({
      selectedCity: selectedCity,
      [fieldName]: submittedResponse
    });
    console.log('📦 SAVING city+text as:', finalResponse);
  } else {
    // Regular questions without anonymous mode
    console.log('📝 SAVING text only as:', finalResponse);
  }
  
  // Call the onResponse callback with the response and tags
  onResponse(finalResponse, selectedTags);
};

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  const newValue = e.target.value;
  //console.log('⌨️ Input changed:', { newValue, questionId: question.id });
  
  if (question.type === 'text_input' && maxLength && newValue.length > maxLength) {
    setResponse(newValue.substring(0, maxLength));
    return;
  }
  
  setResponse(newValue);
  console.log('✅ Response state updated to:', newValue);
};


  const handleFormSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  console.log('📋 Form submitted! Response:', response, 'QuestionID:', question.id);
  
  if (response.trim()) {
    console.log('✅ Calling handleSubmit with:', response);
    handleSubmit(response);
  } else {
    console.log('⚠️ Response is empty, not calling handleSubmit');
  }
};
  

  const getTextInputValidation = () => {
    if (question.type !== 'text_input') return null;
    
    const characterCount = response.length;
    const wordValidation = getWordValidationStatus(response, maxWords, wordWarningThreshold);
    const wordMessage = getWordValidationMessage(response, maxWords, wordWarningThreshold);
    
    const isCharacterValid = characterCount <= maxLength;
    const isValid = isCharacterValid && wordValidation.isValid && response.trim().length > 0;
    
    return {
      characterCount,
      wordCount: wordValidation.wordCount,
      isValid,
      wordStatus: wordValidation.status,
      wordMessage,
      isEmpty: characterCount === 0
    };
  };
  
  // Render different input types based on question type
  const renderQuestionInput = () => {
    switch (question.type) {
      case 'multiple_choice':
        return (
          <div className={`grid grid-cols-2 mb-6 ${isDesktop ? 'gap-4 lg:gap-6' : 'gap-1'}`}>
            {question.options?.map((option, index) => {
          const isSelected = currentSelection === option;
          
          return (
            <motion.button
              key={index}
              onClick={() => {
                setCurrentSelection(option);
                handleSubmit(option);
              }}
              whileHover={isDesktop ? { scale: 1.02 } : {}}
              whileTap={{ scale: 0.98 }}
              className={`rounded-lg text-left border font-normal font-gilroy-medium transition-all duration-200 ${
                isDesktop 
                  ? 'h-16 lg:h-20 pl-4 lg:pl-6 text-xl lg:text-2xl hover:shadow-lg' 
                  : 'h-14 pl-3 text-xl'
              } ${index === 4 ? 'col-span-2' : ''}`}
              style={{
                // Background Color Logic
                backgroundColor: isSelected 
                  ? (index === 0 ? '#E8F5E8' : (index === 1 ? '#FEE2E2' : (index === 2 ? '#EDE9FE' : (index === 3 ? '#E0F2FE' : '#F3F4F6'))))
                  : '#FEFEFE', // Always gray when not selected
                
                // Border Color Logic  
                borderColor: isSelected 
                  ? (index === 0 ? '#65A30D' : (index === 1 ? '#DC2626' : (index === 2 ? '#7C3AED' : (index === 3 ? '#0284C7' : '#9CA3AF'))))
                  : '#B1B1B1', // Always gray when not selected
                
                // Text Color Logic
                color: isSelected 
                  ? (index === 0 ? '#2A7F00' : (index === 1 ? '#A4080B' : (index === 2 ? '#50007F' : (index === 3 ? '#004A7F' : '#374151'))))
                  : '#B1B1B1' // Always dark gray when not selected
              }}
              disabled={!isActive || isAnswered}
            >
              {option}
            </motion.button>
          );
        })}
            </div>
        );
        
      case 'text_input':
          const textValidation = getTextInputValidation();
          return (
            <div className="mb-6">

              {question.enableCityAutocomplete && question.allowAnonymous && (
                <div className="mb-4">
                  {/* <label>Primary City</label> */}
                  <div className="relative">
                    <CityAutocomplete
                      onCitySelect={(city) => {
                        console.log('🏙️ City selected:', city);
                        setSelectedCity(city);
                      }}
                      placeholder="Start typing..."
                      selectedCity={selectedCity}
                      isAnonymousMode={isAnonymousMode}
                      //onToggleAnonymous={() => setIsAnonymousMode(!isAnonymousMode)}
                    />
                    <motion.div 
                      className={`absolute flex items-center gap-2 ${isDesktop ? 'bottom-4 right-4 lg:bottom-6 lg:right-6' : 'bottom-3 right-3'}`}
                    >
                      <motion.button
                        type="button"
                        onClick={() => setIsAnonymousMode(!isAnonymousMode)}
                        whileHover={isDesktop ? { scale: 1.1 } : {}}
                        whileTap={{ scale: 0.95 }}
                        className={`relative inline-flex items-center rounded-full transition-colors focus:outline-none ${
                          isAnonymousMode ? 'bg-gray-950' : 'bg-gray-300'
                        } ${isDesktop ? 'h-8 w-14 lg:h-10 lg:w-16' : 'h-6 w-11'}`}
                        data-anonymous-mode={isAnonymousMode}
                        animate={{ backgroundColor: isAnonymousMode ? '#374151' : '#D1D5DB' }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.span
                          className={`inline-block transform rounded-full bg-white shadow ${isDesktop ? 'h-6 w-6 lg:h-8 lg:w-8' : 'h-4 w-4'}`}
                          animate={{ x: isAnonymousMode ? (isDesktop ? 26 : 22) : 2 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      </motion.button>
                    </motion.div>
                  </div>
                </div>
              )}

              <form onSubmit={handleFormSubmit}>
                <div className="relative mb-[-15px]">
                  <textarea
                    value={response}
                    onChange={handleInputChange}
                    placeholder={
                      question.allowAnonymous && !question.enableCityAutocomplete
                        ? (isAnonymousMode ? "Anonymous mode" : question.placeholder)
                        : (question.placeholder || "Be as honest as you want to be for the best analysis")
                    }
                    className={`quest-textarea bg-white rounded-lg border border-zinc-400 resize-y w-full justify-start text-black font-normal font-gilroy-medium focus:outline-none ${
                      isDesktop 
                        ? 'p-4 lg:p-6 h-64 lg:h-80 text-xl lg:text-2xl' 
                        : 'p-3 h-52 text-xl'
                    } ${
                      textValidation?.wordStatus === 'error' 
                        ? '' 
                        : 'border-gray-200'
                    }`}
                    disabled={!isActive || isAnswered || (question.allowAnonymous && !question.enableCityAutocomplete && isAnonymousMode)}
                  />

                  {question.allowAnonymous && !question.enableCityAutocomplete && (
                    <motion.div 
                      className={`absolute flex items-center gap-2 ${isDesktop ? 'bottom-4 right-4 lg:bottom-6 lg:right-6' : 'bottom-3 right-3'}`}
                    >
                      <motion.button
                        type="button"
                        onClick={() => setIsAnonymousMode(!isAnonymousMode)}
                        whileHover={isDesktop ? { scale: 1.1 } : {}}
                        whileTap={{ scale: 0.95 }}
                        className={`relative inline-flex items-center rounded-full transition-colors focus:outline-none ${
                          isAnonymousMode ? 'bg-blue-500' : 'bg-gray-300'
                        } ${isDesktop ? 'h-8 w-14 lg:h-10 lg:w-16' : 'h-6 w-11'}`}
                        data-anonymous-mode={isAnonymousMode}
                        animate={{ backgroundColor: isAnonymousMode ? '#374151' : '#D1D5DB' }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.span
                          className={`inline-block transform rounded-full bg-white shadow ${isDesktop ? 'h-6 w-6 lg:h-8 lg:w-8' : 'h-4 w-4'}`}
                          animate={{ x: isAnonymousMode ? (isDesktop ? 26 : 22) : 2 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      </motion.button>
                      {/* <span className="text-xs text-gray-600">
                        {isAnonymousMode ? 'Anonymous' : 'Share'}
                      </span> */}
                    </motion.div>
                  )}
                </div>
                
                {/* Word validation message */}
                {textValidation?.wordMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-2 text-xs ${
                      textValidation.wordStatus === 'warning' ? 'text-amber-600' : 'text-red-600'
                    }`}
                  >
                    {textValidation.wordMessage}
                  </motion.div>
                )}

                {question.allowTags && showTags && (
                  <div className={`mb-3 ${isDesktop ? 'mt-8 mb-6' : 'mt-4'}`}>
                    <p className={`font-gilroy-medium text-gray-600 pb-2 ${isDesktop ? 'text-xl lg:text-2xl pb-4' : ''}`}> Want to tag your answer? </p>
                    <div className={isDesktop ? 'transform scale-110 origin-left' : ''}>
                      <AuthenticityTags 
                        selectedTags={selectedTags}
                        onTagSelect={handleTagSelect}
                        disabled={isAnswered}
                      />
                    </div>
                  </div>
                )}

              </form>
            </div>
          );
        
      case 'scale_rating':
        return (
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-500">
                {question.minScale || 1}
              </span>
              <span className="text-sm text-gray-500">
                {question.maxScale || 10}
              </span>
            </div>
            <input
              type="range"
              min={question.minScale || 1}
              max={question.maxScale || 10}
              value={response || (question.minScale || 1)}
              onChange={handleInputChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
              disabled={!isActive || isAnswered}
            />
            {/* {isActive && !isAnswered && (
              <motion.button
                onClick={() => handleSubmit(response)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-3 px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta/90 transition-colors"
              >
                Submit
              </motion.button>
            )} */}
          </div>
        );
      
      case 'number_dropdown':
        return (
          <NumberDropdownResponse
            question={question}
            onResponse={handleSubmit}
            isActive={isActive}
            isAnswered={isAnswered}
            previousResponse={previousResponse?.response}
            placeholder={question.placeholder || 'Select an option'}
            className="mb-6"
          />
        );

      case 'ranking':
        return (
          <RankingResponse
            options={question.options || []}
            value={response}
            onChange={handleInputChange}
            onResponse={handleSubmit} 
            disabled={!isActive || isAnswered}
            className="mb-6"
            // ← ADD these new props:
            selectedTags={selectedTags}
            onTagSelect={handleTagSelect}
            allowTags={question.allowTags}
            showTags={showTags}
          />
        );
      
      default:
      return (
        <div className="mb-6 text-gray-500 italic">
          This question type is not supported yet.
        </div>
      );
    }
  };

  
  // Detect if we're in desktop layout context - use media query for consistency
  const [isDesktop, setIsDesktop] = useState(false);
  
  useEffect(() => {
    const checkIsDesktop = () => {
      const mediaQuery = window.matchMedia('(min-width: 1024px)');
      setIsDesktop(mediaQuery.matches);
    };
    
    // Check initially
    checkIsDesktop();
    
    // Listen for changes
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handler);
    }
    
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        mediaQuery.removeListener(handler);
      }
    };
  }, []);
  
  
  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={controls}
      className={`${className}`}
    >      
      {/* Question Text */}
      <div className={`${isDesktop ? 'mb-8' : 'mb-4'}`}>
        <div className={`justify-start text-neutral-950 font-normal font-gilroy-bold ${isDesktop ? 'text-3xl lg:text-4xl' : 'text-2xl'}`}>
          {question.text}
          {question.isInfo && !isDesktop && (
          <Info className="inline ml-2 w-4 h-4 text-black cursor-pointer" 
            onClick={() => setShowInfo(true)} />
          )}
        </div>
      </div>
      
      
      {/* Question Input */}
      {renderQuestionInput()}

      
  
      {/* Info Modal - Only show on mobile since desktop has permanent sidebar */}
      {showInfo && !isDesktop && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowInfo(false)}
        >
          <div className="bg-white rounded-lg w-full max-w-sm relative border border-gray-200 shadow-xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setShowInfo(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            {/* Content */}
            <div>
              <p className="text-gray-600 leading-relaxed font-gilroy-regular text-sm">
                {question.infoText || "This question helps us better understand your personality and provide more accurate insights."}
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default QuestionCard;