'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuest } from '../hooks/useQuest';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getWordValidationStatus } from '../utils/questValidation';
import { HonestyTag } from '../types/types';
import { toast } from 'sonner';
import { useAuth } from '../../auth/cotexts/AuthContext';
import { useRouter } from 'next/navigation';
import IncompleteQuestionsModal from '../components/IncompleteQuestionsModal';

interface QuestNavigationProps {
  showPrevious?: boolean;
  showNext?: boolean;
  showSkip?: boolean;
  showFinish?: boolean;
  onFinish?: () => void;
  className?: string;
}

/**
 * Navigation controls for the quest system
 * Provides buttons for navigating between questions and sections
 */
export function QuestNavigation({
  showPrevious = true,
  showNext = true,
  showSkip = true,
  showFinish = true,
  onFinish,
  className = ''
}: QuestNavigationProps) {
  const {
    session,
    currentQuestion,
    questions,
    allQuestions,
    currentSection,
    nextQuestion,
    previousQuestion,
    submitResponse,
    changeSection,
    sections,           // ADD this
    currentSectionId,
    finishQuest,
    trackQuestionView,
    stopQuestionTracking,
    goToQuestion,
    hasAttemptedFinishWithIncomplete,
    setHasAttemptedFinishWithIncomplete
  } = useQuest();

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hasStartedSubmission, setHasStartedSubmission] = useState(false);
  // Simple delay for Next and Previous buttons (700ms to prevent duplicate answers)
  const [nextButtonDisabled, setNextButtonDisabled] = useState(false);
  const [previousButtonDisabled, setPreviousButtonDisabled] = useState(false);
  // Modal state for incomplete questions
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const [incompleteInfo, setIncompleteInfo] = useState<{ count: number; sectionName?: string; sectionId?: string; indexInSection?: number } | null>(null);
  const [pendingNavigation, setPendingNavigation] = useState<{ sectionId: string; questionIndex: number } | null>(null);
  const auth = useAuth();
  const router = useRouter();

  // Handle pending navigation after section change
  React.useEffect(() => {
    // Only proceed if we have pending navigation and the questions array is not empty
    // (which indicates the section change has completed)
    if (pendingNavigation && questions.length > 0 && currentSectionId === pendingNavigation.sectionId) {
      // Navigate to the target question
      goToQuestion(pendingNavigation.questionIndex);

      // Clear pending navigation
      setPendingNavigation(null);
    }
  }, [pendingNavigation, questions, currentSectionId, goToQuestion]);

  const formatSubmissionData = () => {
    const fallbackSessionId = crypto.getRandomValues(new Uint8Array(16)).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
    const workingSession = {
      id: session?.id || fallbackSessionId,
      userId: auth.user?.id || 'anonymous',
      startedAt: session?.startedAt || new Date().toISOString(),
      responses: session?.responses || {},
      status: 'completed'
    };

    const extractCityFromResponse = () => {
      const q1_5_response = workingSession?.responses?.['q1_5']?.response;
      if (q1_5_response) {
        try {
          const parsed = JSON.parse(q1_5_response);
          return parsed.selectedCity || '';
        } catch {
          return ''; // If not JSON, no city data
        }
      }
      return '';
    };

    const cityFromQuest = extractCityFromResponse();

    const testid = crypto.getRandomValues(new Uint8Array(20)).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

    const userData = auth.user?.id ? {
      user_id: auth.user.id,
      name: auth.user.user_metadata?.first_name
        ? `${auth.user.user_metadata.first_name} ${auth.user.user_metadata.last_name || ''}`
        : 'User',
      email: auth.user.email || 'user@example.com',
      "mobile no": auth.user.user_metadata?.phone || "",
      city: cityFromQuest || auth.user.user_metadata?.city || "",
      DOB: auth.user.user_metadata?.dob || undefined,
      "testid": testid
    } : {
      user_id: `${workingSession?.userId || 'unknown'}`,
      name: 'Anonymous User',
      email: '',
      "mobile no": '',
      city: cityFromQuest || "",
      DOB: undefined,
      "testid": testid
    };

    const startTime = workingSession?.startedAt;
    const completionTime = new Date().toISOString();
    const startTimeValue = startTime || new Date().toISOString();
    const durationMinutes = (new Date().getTime() - new Date(startTimeValue).getTime()) / (1000 * 60);
     

    const responses = allQuestions?.map((question, index) => {
      const response = workingSession?.responses?.[question.id];
      const sectionId = question?.sectionId || '';
      const sectionName = sections?.find(s => s.id === sectionId)?.title || '';

      if (response) {
        // Use accumulated view time from new timing system
        const timeTaken = response.totalViewTimeSeconds && response.totalViewTimeSeconds > 0
          ? `${response.totalViewTimeSeconds}s`
          : (question?.type === 'date_input' ? '30s' : '1s');

        return {
          qno: index + 1,
          question_id: question.id,
          question_text: question?.text || '',
          answer: response.response,
          section_id: sectionId,
          section_name: sectionName,
          metadata: {
            tags: response.tags || [],
            time_taken: timeTaken
          }
        };
      } else {
        return {
          qno: index + 1,
          question_id: question.id,
          question_text: question?.text || '',
          answer: "I preferred not to response for this question",
          section_id: sectionId,
          section_name: sectionName,
          metadata: {
            tags: [],
            time_taken: '1s'
          }
        };
      }
    }) || [];


    const tagCounts: Record<string, number> = {};
    responses.forEach(response => {
      if (response.metadata.tags) {
        response.metadata.tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    const allTags = ['Honest', 'Unsure', 'Sarcastic', 'Avoiding'];
    allTags.forEach(tag => {
      if (!tagCounts[tag]) tagCounts[tag] = 0;
    });

    const detectDeviceType = (): string => {
      const userAgent = navigator.userAgent;
      if (/mobile|android|iphone|ipad|ipod/i.test(userAgent.toLowerCase())) {
        return /ipad/i.test(userAgent.toLowerCase()) ? 'tablet' : 'mobile';
      }
      return 'desktop';
    };

    const detectBrowser = (): string => {
      const userAgent = navigator.userAgent;
      if (userAgent.indexOf('Chrome') > -1) return 'Chrome';
      if (userAgent.indexOf('Safari') > -1) return 'Safari';
      if (userAgent.indexOf('Firefox') > -1) return 'Firefox';
      if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident') > -1) return 'Internet Explorer';
      if (userAgent.indexOf('Edge') > -1) return 'Edge';
      return 'Unknown';
    };

    const detectOS = (): string => {
      const userAgent = navigator.userAgent;
      if (userAgent.indexOf('Windows') > -1) return 'Windows';
      if (userAgent.indexOf('Mac') > -1) return 'Mac';
      if (userAgent.indexOf('Linux') > -1) return 'Linux';
      if (userAgent.indexOf('Android') > -1) return 'Android';
      if (userAgent.indexOf('iOS') > -1) return 'iOS';
      return 'Unknown';
    };

    // Try to get device backup info for fallback recovery (secondary method)
    let deviceBackup = null;
    try {
      const stored = localStorage.getItem('fraterny_device_backup');
      if (stored) {
        deviceBackup = JSON.parse(stored);
      }
    } catch (e) {
      console.log('Could not retrieve device backup (non-critical)');
    }


    // Get referred_by from localStorage
    const referredBy = localStorage.getItem('referred_by') || null;

    return {
      response: responses,
      user_data: userData,
      referred_by: referredBy,
      assessment_metadata: {
        session_id: workingSession?.id || '',
        start_time: startTime,
        completion_time: completionTime,
        duration_minutes: Number(durationMinutes.toFixed(1)),
        completion_percentage: Math.round((Object.keys(workingSession?.responses || {}).length / (allQuestions?.length || 1)) * 100),
        device_info: {
          type: detectDeviceType(),
          browser: detectBrowser(),
          operating_system: detectOS()
        },
        device_identifier: deviceBackup ? {
          ip: deviceBackup.ip,
          deviceHash: deviceBackup.deviceHash
        } : null,
      }
    };
  };

  const isLastQuestionInSection = session &&
    questions.length > 0 &&
    session.currentQuestionIndex === questions.length - 1;

  const isLastQuestionInEntireAssessment = () => {
    if (!session || !currentSection) return false;

    // Check if current section is the last section
    const currentSectionIndex = sections.findIndex(s => s.id === currentSectionId);
    const isLastSection = currentSectionIndex === sections.length - 1;

    // Check if current question is last in this section
    const isLastQuestionInThisSection = session.currentQuestionIndex === questions.length - 1;

    return isLastSection && isLastQuestionInThisSection;
  };

  const isLastQuestion = isLastQuestionInEntireAssessment();

  const isFirstQuestionInEntireAssessment = () => {
    if (!session) return true;

    // Get current section index
    const currentSectionIndex = sections.findIndex(s => s.id === currentSectionId);

    // If we're in the first section AND on the first question of that section
    const isFirstSection = currentSectionIndex === 0;
    const isFirstQuestionInThisSection = session.currentQuestionIndex === 0;

    return isFirstSection && isFirstQuestionInThisSection;
  };

  const isFirstQuestion = isFirstQuestionInEntireAssessment();

  const checkForUnfinishedQuestions = () => {
    const unfinishedQuestions = allQuestions?.filter(question => {
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

        return !hasCurrentValue; // Has current value = not unfinished
      }

      // Check if response exists and is not empty/placeholder
      if (!response) {
        return true; // No response = unfinished
      }

      // Check if response is just an empty string or whitespace
      const responseText = response.response?.trim();
      if (!responseText || responseText === '') {
        return true; // Empty response = unfinished
      }

      // Check if response is the placeholder text (means user didn't actually answer)
      if (responseText === "I preferred not to response for this question") {
        return true; // Placeholder response = unfinished
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
            return true; // No field content = unfinished
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
              return true; // No details = unfinished (even in anonymous mode)
            }
          } else {
            // In non-anonymous mode, both city and details are required
            const hasDetails = locationData.details && locationData.details.trim() !== '';
            const hasCity = locationData.selectedCity && locationData.selectedCity.trim() !== '';

            if (!hasDetails || !hasCity) {
              return true; // Missing city or details = unfinished
            }
          }
        } catch (e) {
          // If can't parse location data, consider it unfinished
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
            return true; // No ranking and no explanation = unfinished
          }
        } catch (e) {
          // If can't parse ranking data, consider it unfinished
          return true;
        }
      }

      return false; // Has real response = finished
    }) || [];

    console.log('🔍 Unfinished questions found:', unfinishedQuestions.map(q => ({ id: q.id, text: q.text?.substring(0, 50) })));

    if (unfinishedQuestions.length > 0) {
      const firstUnfinishedQuestion = unfinishedQuestions[0];
      const sectionId = firstUnfinishedQuestion?.sectionId;
      const sectionName = sections?.find(s => s.id === sectionId)?.title || 'Unknown Section';

      // DEBUG: Log detailed navigation info
      console.log('🎯 Navigation Debug:', {
        firstUnfinishedQuestionId: firstUnfinishedQuestion.id,
        sectionId: sectionId,
        sectionName: sectionName
      });

      // find index within its section
      const targetSection = sections.find(s => s.id === sectionId);
      console.log('🎯 Target section questions:', targetSection?.questions.map(q => q.id));

      const indexInSection = targetSection?.questions.findIndex(q => q.id === firstUnfinishedQuestion.id) ?? 0;
      console.log('🎯 Calculated indexInSection:', indexInSection, 'for question:', firstUnfinishedQuestion.id);

      return {
        hasUnfinished: true,
        sectionName: sectionName,
        count: unfinishedQuestions.length,
        firstSectionId: sectionId,
        firstIndexInSection: indexInSection
      };
    }

    // Return with all properties even when no unfinished questions
    return {
      hasUnfinished: false,
      sectionName: undefined,
      count: 0,
      firstSectionId: undefined,
      firstIndexInSection: undefined
    };
  };

  const handleNext = async () => {

    //console.log('🔍 [DEBUG-1] handleNext called - Screen width:', window.innerWidth, 'innerHeight:', window.innerHeight);
    // Simple 700ms delay to prevent rapid clicking duplicate answers
    if (nextButtonDisabled) {
      console.log('⏱️ Next button is disabled, please wait...');
      return;
    }

    // Disable button for 700ms
    setNextButtonDisabled(true);
    setTimeout(() => {
      setNextButtonDisabled(false);
    }, 700);

    if (currentQuestion) {

      const getSelectedTagsFromQuestionCard = (): HonestyTag[] => {
        try {
          const saved = localStorage.getItem(`quest_tags_${currentQuestion.id}`);
          if (saved) {
            const tags = JSON.parse(saved);
            // console.log('🏷️ Navigation found saved tags in localStorage:', { questionId: currentQuestion.id, tags });
            return tags;
          }
        } catch (error) {
          console.error('Failed to load tags from localStorage:', error);
        }

        // Fallback: Try to read from DOM if localStorage approach doesn't work
        const tagButtons = document.querySelectorAll('[data-tag-selected="true"]');
        const selectedTags: HonestyTag[] = [];

        tagButtons.forEach(button => {
          const tagValue = button.getAttribute('data-tag-value') as HonestyTag;
          if (tagValue) {
            selectedTags.push(tagValue);
          }
        });

        // console.log('🏷️ Navigation found tags from DOM:', { questionId: currentQuestion.id, selectedTags });
        return selectedTags;
      };


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

      if (currentQuestion.type === 'text_input') {
        //const currentTextarea = document.querySelector('textarea');
        const currentTextarea = Array.from(document.querySelectorAll('textarea')).find(ta => ta.offsetParent !== null);
        document.querySelectorAll('textarea').forEach((ta, index) => {
          console.log(`  Textarea #${index}:`, {
            value: ta.value,
            length: ta.value.length,
            className: ta.className,
            placeholder: ta.placeholder,
            isVisible: ta.offsetParent !== null
          });
        });

        
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
              console.log('🔥 [NAV-DEBUG] About to call submitResponse');
                console.log('🔥 [NAV-DEBUG] Question:', currentQuestion.id);
                console.log('🔥 [NAV-DEBUG] Response being saved:', textOnlyResponse);
                console.log('🔥 [NAV-DEBUG] IsAnonymousMode from DOM:', isAnonymousMode);
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
        console.log('🔍 [DEBUG-DROPDOWN] Number dropdown detected - Question ID:', currentQuestion.id);
        const currentSelect = document.querySelector('select') as HTMLSelectElement;
        console.log('🔍 [DEBUG-DROPDOWN] Select element found:', currentSelect);
        console.log('🔍 [DEBUG-DROPDOWN] Selected value:', currentSelect?.value);
        
        if (currentSelect && currentSelect.value) {
          const dropdownValue = currentSelect.value;
          console.log('💾 Saving dropdown value:', dropdownValue);
          
          const selectedTags = getSelectedTagsFromQuestionCard();
          submitResponse(currentQuestion.id, dropdownValue, selectedTags);
        }
      } 
      else if (currentQuestion.type === 'multiple_choice') {
        // Handle multiple choice questions
        const selectedRadio = document.querySelector(`input[name="question-${currentQuestion.id}"]:checked`) as HTMLInputElement;
        if (selectedRadio) {
          const selectedTags = getSelectedTagsFromQuestionCard();

          console.log('💾 Navigation saving multiple choice response with tags:', {
            questionId: currentQuestion.id,
            response: selectedRadio.value,
            tags: selectedTags
          });

          submitResponse(currentQuestion.id, selectedRadio.value, selectedTags);
        }
      }
      else if (currentQuestion.type === 'ranking') {
        // Handle ranking questions - SIMPLE APPROACH
        // Ranking order is already saved on drag, we just need to save explanation
        const rankingContainer = document.querySelector('.ranking-response');
        if (rankingContainer) {
          //const explanationTextarea = rankingContainer.querySelector('textarea');
          const explanationTextarea = Array.from(document.querySelectorAll('textarea'))
  .find(ta => ta.placeholder === 'Write one sentence explaining why...' && ta.offsetParent !== null);
          const explanation = explanationTextarea ? explanationTextarea.value.trim() : '';

          // Get existing response (which has the ranking order from drag events)
          const existingResponse = session?.responses?.[currentQuestion.id]?.response;

          if (existingResponse) {
            try {
              // Parse existing response and update explanation
              const existingData = JSON.parse(existingResponse);

              // Check if this is a real ranking (not just default order)
              const hasRealRanking = existingData.rankings &&
                existingData.rankings.length > 0 &&
                existingData.isUserRanked; // Add this flag when user actually drags

              // Only save if user has actually ranked items OR provided explanation
              if (hasRealRanking || explanation) {
                existingData.explanation = explanation;

                // Get selected tags
                const selectedTags = getSelectedTagsFromQuestionCard();

                console.log('💾 Navigation saving ranking response with tags:', {
                  questionId: currentQuestion.id,
                  data: existingData,
                  tags: selectedTags
                });

                // Save updated response with new explanation and tags
                submitResponse(currentQuestion.id, JSON.stringify(existingData), selectedTags);
                console.log('🔍 [DEBUG-5] Ranking data being saved:', JSON.stringify(existingData, null, 2));
              }
            } catch (e) {
              // Don't create fallback - let user actually provide input
              console.log('⚠️ Ranking response parsing failed, requiring user input');
            }
          } else if (explanation) {
            // Only save if user provided explanation (no default ranking)
            const basicData = JSON.stringify({
              rankings: (currentQuestion.options || []).map((text, index) => ({
                id: `option-${index}`,
                text: text
              })),
              explanation: explanation,
              isUserRanked: false // Mark as not user-ranked
            });

            const selectedTags = getSelectedTagsFromQuestionCard();
            submitResponse(currentQuestion.id, basicData, selectedTags);
          }
          // If no explanation and no existing ranking, don't save anything
        }
      }
      else if (currentQuestion.type === 'date_input') {
        // Try to find MUI DatePicker input first
        const currentDateInput = document.querySelector('input[placeholder*="date of birth"]') as HTMLInputElement ||
          document.querySelector('.MuiInputBase-input') as HTMLInputElement ||
          document.querySelector('input[type="date"]') as HTMLInputElement;
        console.log('💾 Date input value:', currentDateInput?.value);
        console.log('💾 Date input value:', currentDateInput?.value);
        // Add this new one:
        console.log('🔍 All inputs on page:', document.querySelectorAll('input'));
        if (currentDateInput && currentDateInput.value) {
          const selectedTags = getSelectedTagsFromQuestionCard();
          console.log('💾 Navigation saving date response with tags:', {
            questionId: currentQuestion.id,
            response: currentDateInput.value,
            tags: selectedTags
          });
          submitResponse(currentQuestion.id, currentDateInput.value, selectedTags);
        }
      }
      else {
        // For any other question type, still try to save tags if they exist
        const selectedTags = getSelectedTagsFromQuestionCard();
        if (selectedTags.length > 0) {
          console.log('💾 Navigation saving tags for other question type:', {
            questionId: currentQuestion.id,
            type: currentQuestion.type,
            tags: selectedTags
          });

          // Save with empty response but include tags
          submitResponse(currentQuestion.id, '', selectedTags);
        }
      }
    }

    // Check validation for text questions before proceeding
    if (currentQuestion?.type === 'text_input' && session?.responses?.[currentQuestion.id]) {
      const response = session.responses[currentQuestion.id].response;
      const wordValidation = getWordValidationStatus(response, 100, 90);

      if (!wordValidation.isValid) {
        return;
      }
    }

    // without checking of all questions answered
    if (isLastQuestionInSection) {
      // Always move to next section, ignore validation
      const currentSectionIndex = sections.findIndex(s => s.id === currentSectionId);
      const nextSectionIndex = currentSectionIndex + 1;

      if (nextSectionIndex < sections.length) {
        // Move to next section directly
        const nextSection = sections[nextSectionIndex];
        changeSection(nextSection.id);
      } else if (showFinish) {
        if (onFinish) {
          // onFinish();
          // setShowConfirmation(true);
        } else if (showFinish) {
          if (onFinish) {
            const unfinishedCheck = checkForUnfinishedQuestions();
            console.log('🔍 Unfinished questions check:', unfinishedCheck);

            if (unfinishedCheck.hasUnfinished) {
              toast.error(`Please complete all questions in the section "${unfinishedCheck.sectionName}" before finishing. Unfinished questions: ${unfinishedCheck.count}`
                , {
                  position: 'top-center',
                }
              );
              return; // Don't proceed
            }

            setShowConfirmation(true);
          }
        }
        else {
          // finishQuest();
          console.warn('No onFinish callback provided - cannot finish quest without submission data');
        }
      }
    } else {
      nextQuestion();
    }

    // check if user has answered all questions in the section

    // Check if user has answered all questions before proceeding
    if (isLastQuestionInSection) {
      const currentSectionIndex = sections.findIndex(s => s.id === currentSectionId);
      const nextSectionIndex = currentSectionIndex + 1;

      if (nextSectionIndex < sections.length) {
        // Move to next section directly
        const nextSection = sections[nextSectionIndex];
        changeSection(nextSection.id);
      } else if (showFinish) {
        // Last section, check for unfinished questions first
        if (onFinish) {
          const unfinishedCheck = checkForUnfinishedQuestions();
          console.log('🔍 Unfinished questions check:', unfinishedCheck);

          if (unfinishedCheck.hasUnfinished) {
            // Mark that user has attempted to finish with incomplete questions
            setHasAttemptedFinishWithIncomplete(true);
            // Open modal instead of only showing toast
            setIncompleteInfo({
              count: unfinishedCheck.count,
              sectionName: unfinishedCheck.sectionName,
              sectionId: (unfinishedCheck as any).firstSectionId,
              indexInSection: (unfinishedCheck as any).firstIndexInSection,
            });
            setShowIncompleteModal(true);
            return; // Don't proceed
          }

          setShowConfirmation(true); // Only show if all questions are answered
        } else {
          console.warn('No onFinish callback provided - cannot finish quest without submission data');
        }
      }
    } else {
      nextQuestion();
    }
  };

  // Navigate to the first incomplete question captured in state
  const goToFirstIncomplete = () => {
    if (!incompleteInfo?.sectionId || incompleteInfo.indexInSection == null) {
      setShowIncompleteModal(false);
      return;
    }

    const targetSectionId = incompleteInfo.sectionId;
    const targetIndex = incompleteInfo.indexInSection;

    // Close modal first
    setShowIncompleteModal(false);

    // Try to change section and navigate
    if (currentSectionId === targetSectionId) {
      // Already in the right section, navigate directly
      goToQuestion(targetIndex);
    } else {
      // Need to change section first
      // Store the target index in state first so we don't lose it during the section change
      setPendingNavigation({
        sectionId: targetSectionId,
        questionIndex: targetIndex
      });

      // Change section first
      changeSection(targetSectionId);
    }
  };

  const handlePrevious = () => {
    // Simple 700ms delay to prevent rapid clicking duplicate answers
    if (previousButtonDisabled) {
      console.log('⏱️ Previous button is disabled, please wait...');
      return;
    }

    // Disable button for 700ms
    setPreviousButtonDisabled(true);
    setTimeout(() => {
      setPreviousButtonDisabled(false);
    }, 700);

    if (currentQuestion) {
      // Copy the exact same response-saving logic from handleNext()
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

      // Save current response before going back (copy from handleNext)
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
      // Add other question types as needed (copy from handleNext)
    }

    // After saving, navigate to previous question
    previousQuestion();
  };

  const handleConfirmSubmission = async () => {
    if (hasStartedSubmission || isSubmitting || isSubmitted) {
      console.log('Submission already in progress, ignoring click');
      return;
    }

    // Check if submission was already completed (stored in localStorage)
    const existingSessionId = localStorage.getItem('questSessionId');
    const existingTestId = localStorage.getItem('testid');

    if (existingSessionId && existingTestId) {
      console.log('✅ Found existing submission in localStorage!');
      console.log('   SessionId:', existingSessionId);
      console.log('   TestId:', existingTestId);

      // Show success message
      toast.success('Previous submission found, redirecting to processing...', {
        position: 'top-center',
      });

      // Get userId from auth or submission data
      const userId = auth.user?.id || formatSubmissionData()?.user_data?.user_id || 'anonymous';

      // Navigate directly to processing page without calling API
      setTimeout(() => {
        const processingUrl = `/quest-result/processing/${userId}/${existingSessionId}/${existingTestId}`;
        console.log('🧭 Navigating to existing processing:', processingUrl);
        router.push(processingUrl);
      }, 1000);

      return; // Exit early, don't call API again
    }

    setHasStartedSubmission(true);
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      console.log('🚀 Starting quest submission from confirmation...');

      // Format submission data
      const submissionData = formatSubmissionData();
      console.log('📊 Submission data created:', submissionData);

      if (!submissionData) {
        throw new Error('No submission data available');
      }

      const sessionId = submissionData.assessment_metadata.session_id;
      const testid = submissionData?.user_data?.testid || '';

      // Call finishQuest with submission data
      const result = await finishQuest(submissionData);


      console.log('✅ Quest submission completed successfully:', result);

      // Show success state
      setIsSubmitted(true);

      // Show success toast
      toast.success('Quest submission successful', {
        position: 'top-center',
      });

      // Small delay to show success state, then navigate
      setTimeout(() => {
        setShowConfirmation(false);
        if (result?.navigationData?.targetUrl) {
          console.log('🧭 Navigating to:', result.navigationData.targetUrl);
          router.push(result.navigationData.targetUrl);
        }
      }, 1000);

    } catch (error: any) {
      setHasStartedSubmission(false);
      console.error('❌ Submission failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Submission failed';
      setSubmissionError(errorMessage);
      setIsSubmitted(false);
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleCancelSubmission = () => {
    setShowConfirmation(false);
  };

  // Button variants
  const buttonVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    tap: { scale: 0.95 }
  };

  return (
    <>
      <nav className={`${className}`}>
        <div className="flex gap-1">

          {showPrevious && (
            <motion.button
              variants={buttonVariants}
              initial="initial"
              animate="animate"
              whileTap="tap"
              onClick={handlePrevious}
              disabled={isFirstQuestion || previousButtonDisabled}
              className={` ${isFirstQuestion
                ? 'hidden'
                : previousButtonDisabled
                  ? 'w-[70px] h-14 bg-gray-300 rounded-full border-2 border-gray-400 justify-center items-center flex cursor-not-allowed opacity-50'
                  : 'w-[70px] h-14 bg-white rounded-full border-2 border-neutral-400 justify-center items-center flex'
                }`}
            >
              <ChevronLeft className={`w-5 h-5 ${isFirstQuestion ? 'hidden' : 'block'} ${previousButtonDisabled ? 'text-gray-500' : ''}`} />
            </motion.button>
          )}

          {showNext && (
            <motion.button
              variants={buttonVariants}
              initial="initial"
              animate="animate"
              whileTap="tap"
              onClick={handleNext}
              disabled={nextButtonDisabled}
              className={`px-4 py-2 text-white text-sm font-medium transition-colors ${nextButtonDisabled
                ? 'w-full h-14 bg-gray-400 rounded-[36px] border-2 border-gray-500 cursor-not-allowed opacity-50'
                : isLastQuestion && showFinish
                  ? 'w-4/5 h-14 bg-gradient-to-br from-sky-800 to-sky-400 rounded-[36px] border-2 border-blue-950'
                  : 'w-full h-14 bg-gradient-to-br from-sky-800 to-sky-400 rounded-[36px] border-2 border-blue-950'
                }`}
            >
              <div className='flex gap-1 justify-center items-center'>
                <div className="text-white text-2xl font-normal font-gilroy-bold tracking-[-2px]">
                  {nextButtonDisabled
                    ? 'Saving'
                    : isLastQuestion && showFinish
                      ? 'Finish'
                      : 'Next'
                  }
                </div>
                <div className='flex items-center'>
                  <ChevronRight className='w-5 h-5 mt-0.5' />
                </div>
              </div>
            </motion.button>
          )}
        </div>
      </nav>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
          >
            {/* Conditional content based on submission state */}
            {!isSubmitting && !isSubmitted && !submissionError && (
              <>
                <div className="text-gray-600 text-xl leading-6 font-gilroy-regular mb-4">
                  Satisfied with your answers? Press the confirm button to submit your response.
                </div>

                <div className="flex justify-start space-x-3">
                  <button
                    onClick={handleCancelSubmission}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xl font-normal font-gilroy-semibold tracking-[-2px]"
                  >
                    Go Back
                  </button>

                  <button
                    onClick={handleConfirmSubmission}
                    disabled={hasStartedSubmission || isSubmitting || isSubmitted}
                    className="px-4 py-2 text-xl font-normal font-gilroy-bold tracking-[-1px] bg-gradient-to-br from-sky-800 to-sky-400 text-white rounded-lg hover:opacity-90 transition-colors"
                  >
                    Confirm
                  </button>
                </div>
              </>
            )}

            {/* Submitting state */}
            {isSubmitting && (
              <>
                <div className="text-center py-8">
                  <h3 className="text-2xl font-gilroy-bold text-navy mb-2">
                    Submitting...
                  </h3>
                  <p className="text-gray-600 font-gilroy-regular text-xl">
                    We are submitting your responses. Please do not close this window.
                  </p>
                </div>
              </>
            )}

            {/* Success state */}
            {isSubmitted && !submissionError && (
              <>
                <div className="text-center py-8">
                  <h3 className="text-2xl font-gilroy-bold text-green-600 mb-2">
                    Submitted Successfully!
                  </h3>
                  <p className="text-gray-600 font-gilroy-regular">
                    Our AI is reviewing your responses. You will be redirected shortly.
                  </p>
                </div>
              </>
            )}

            {/* Error state */}
            {submissionError && (
              <>
                <div className="text-left py-4">
                  <div className="text-black font-gilroy-regular text-xl mb-4 p-3 rounded-lg">
                    Due to slow network your submission was not successful last time. Please try again.
                  </div>

                  <div className="flex justify-start space-x-3">
                    <button
                      onClick={handleCancelSubmission}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xl font-normal font-gilroy-semibold tracking-[-2px]"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={() => {
                        setSubmissionError(null);
                        setIsSubmitted(false);
                        handleConfirmSubmission();
                      }}
                      className="px-4 py-2 text-xl font-normal font-gilroy-bold tracking-[-1px] bg-gradient-to-br from-sky-800 to-sky-400 text-white rounded-lg hover:opacity-90 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}

      {/* Incomplete questions modal */}
      <IncompleteQuestionsModal
        isOpen={showIncompleteModal}
        onClose={() => setShowIncompleteModal(false)}
        onGoToIncomplete={goToFirstIncomplete}
        incompleteCount={incompleteInfo?.count || 0}
        sectionName={incompleteInfo?.sectionName}
      />
    </>
  );
};

export default QuestNavigation;