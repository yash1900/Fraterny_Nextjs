// ----------------------------------------------------------------------- 

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../auth/cotexts/AuthContext';
import axios from 'axios';
import { QuestContext } from '../contexts/QuestContext';
import { 
  Question, 
  QuestSession, 
  QuestResult, 
  QuestionResponse,
  QuestSessionStatus,
  HonestyTag
} from '../types/types';
import questSections, { getAllQuestions, getQuestionsBySection } from '../questions/questions';
import { googleAnalytics } from '@/lib/services/googleAnalytics';
import { getDeviceIdentifier } from '../../../ip-finder/deviceFingerprint';

interface QuestProviderProps {
  children: React.ReactNode;
  initialSectionId?: string;
}

export function QuestProvider({ children, initialSectionId }: QuestProviderProps) {
  // State
  const [session, setSession] = useState<QuestSession | null>(null);
  const [currentSectionId, setCurrentSectionId] = useState<string>(initialSectionId || questSections[0].id);
  const [allQuestions, setAllQuestions] = useState<Question[]>(getAllQuestions());
  const [sectionQuestions, setSectionQuestions] = useState<Question[]>(
    initialSectionId ? getQuestionsBySection(initialSectionId) : getQuestionsBySection(questSections[0].id)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [allowSkip, setAllowSkip] = useState(true);
  const [visitedQuestions, setVisitedQuestions] = useState<string[]>([]);
  const [currentViewingQuestion, setCurrentViewingQuestion] = useState<string | null>(null);
  const [questionViewTimes, setQuestionViewTimes] = useState<Record<string, number>>({});
  const [deviceIdentifier, setDeviceIdentifier] = useState<any>(null);
  const [hasSubmittedToAPI, setHasSubmittedToAPI] = useState(false);
  const [hasAttemptedFinishWithIncomplete, setHasAttemptedFinishWithIncomplete] = useState(false);


  const router = useRouter();
  const auth = useAuth();


  // Auto-save timer ref
  const autoSaveInterval = useRef<NodeJS.Timeout | null>(null);

  // Auto-save effect - saves session responses every 5 seconds
  useEffect(() => {
    if (session && session.responses && Object.keys(session.responses).length > 0) {
      // Clear existing timer
      if (autoSaveInterval.current) {
        clearInterval(autoSaveInterval.current);
      }
      
      // Start new timer - save every 5 seconds
      autoSaveInterval.current = setInterval(() => {
        localStorage.setItem('fraterny_quest_session', JSON.stringify(session));
      }, 5000);
    }

    // Cleanup timer when session ends or component unmounts
    return () => {
      if (autoSaveInterval.current) {
        clearInterval(autoSaveInterval.current);
      }
    };
  }, [session?.responses]);

  // Immediate save on page unload/browser close + GA4 abandon tracking
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (session && session.responses && Object.keys(session.responses).length > 0) {
        console.log('💾 Browser closing - saving session immediately');
        localStorage.setItem('fraterny_quest_session', JSON.stringify(session));
        
        // NEW: Track quest abandonment in GA4
        if (session.status === 'in_progress') {
          const userState = auth.user ? 'logged_in' : 'anonymous';
          const startTime = session.startedAt ? new Date(session.startedAt).getTime() : Date.now();
          const sessionDuration = (Date.now() - startTime) / 1000;
          const questionsCompleted = Object.keys(session.responses).length;
          const currentQuestionIndex = session.currentQuestionIndex || 0;
          const currentQuestion = sectionQuestions[currentQuestionIndex];
          
          if (currentQuestion) {
            googleAnalytics.trackQuestAbandon({
              session_id: session.id,
              question_id: currentQuestion.id,
              section_id: currentQuestion.sectionId || currentSectionId,
              user_state: userState,
              question_index: currentQuestionIndex + 1,
              session_duration: sessionDuration,
              abandon_reason: 'browser_close'
            });
          }
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && session && session.responses && Object.keys(session.responses).length > 0) {
        // console.log('📱 App backgrounded - saving session immediately');
        localStorage.setItem('fraterny_quest_session', JSON.stringify(session));
        
        // NEW: Track quest abandonment in GA4 (for mobile users backgrounding the app)
        if (session.status === 'in_progress') {
          const userState = auth.user ? 'logged_in' : 'anonymous';
          const startTime = session.startedAt ? new Date(session.startedAt).getTime() : Date.now();
          const sessionDuration = (Date.now() - startTime) / 1000;
          const questionsCompleted = Object.keys(session.responses).length;
          const currentQuestionIndex = session.currentQuestionIndex || 0;
          const currentQuestion = sectionQuestions[currentQuestionIndex];
          
          if (currentQuestion) {
            googleAnalytics.trackQuestAbandon({
              session_id: session.id,
              question_id: currentQuestion.id,
              section_id: currentQuestion.sectionId || currentSectionId,
              user_state: userState,
              question_index: currentQuestionIndex + 1,
              session_duration: sessionDuration,
              abandon_reason: 'app_backgrounded'
            });
          }
        }
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [session, auth.user, currentSectionId, sectionQuestions]);
  
  // Derived state
  const currentQuestionIndex = session?.currentQuestionIndex || 0;
  const currentQuestion = sectionQuestions[currentQuestionIndex] || null;

  // Helper function to count responses in current section
  const getResponseCountForCurrentSection = () => {
    if (!session?.responses) return 0;
    return sectionQuestions.filter(q => session.responses && session.responses[q.id]).length;
  };

  const progress = sectionQuestions.length > 0 
  ? ((getResponseCountForCurrentSection()) / sectionQuestions.length) * 100 
  : 0;
  
  // Update section questions when current section changes  
  useEffect(() => {
    const newSectionQuestions = getQuestionsBySection(currentSectionId);
    setSectionQuestions(newSectionQuestions);
    // Force a re-render by updating session's sectionId if needed
    setSession(prev => {
      if (prev && prev.sectionId !== currentSectionId) {
        return {
          ...prev,
          sectionId: currentSectionId
        };
      }
      return prev;
    });
  }, [currentSectionId]);
    
  // Generate a session ID (temporary - will be from backend)
  const generateSessionId = () => `session_${Date.now()}`;
  
  // Accumulate time spent on a question from mount/unmount tracking
  const accumulateQuestionTime = (questionId: string, durationSeconds: number) => {
    setSession(prev => {
      if (!prev) return null;
      
      const existingResponse = prev.responses?.[questionId];
      if (existingResponse) {
        // Add to existing accumulated time (don't overwrite!)
        const currentTotal = existingResponse.totalViewTimeSeconds || 0;
        const newTotal = currentTotal + durationSeconds;
        return {
          ...prev,
          responses: {
            ...prev.responses,
            [questionId]: {
              ...existingResponse,
              totalViewTimeSeconds: newTotal
            }
          }
        };
      } else {
        // Create a placeholder response for timing-only
        return {
          ...prev,
          responses: {
            ...(prev.responses || {}),
            [questionId]: {
              questionId,
              response: '',
              timestamp: new Date().toISOString(),
              totalViewTimeSeconds: durationSeconds
            }
          }
        };
      }
    });
    
    //console.log(`📊 Question ${questionId} accumulated +${durationSeconds}s (total will be updated)`);
  };



  const startQuest = async (sectionId?: string): Promise<QuestSession | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // Check for saved session first
      const savedSession = localStorage.getItem('fraterny_quest_session');
      if (savedSession) {
        try {
          const parsedSession = JSON.parse(savedSession);
          // console.log('🔄 Found saved session, restoring progress...');
          // console.log('🔍 DEBUG - Saved session found:', parsedSession);
          // console.log('🔍 DEBUG - Session status:', parsedSession.status);
          // console.log('🔍 DEBUG - Session responses:', Object.keys(parsedSession.responses || {}));
          // setSession(parsedSession);
          const resumedSession = {
            ...parsedSession,
            status: 'in_progress',
            completedAt: undefined
          };
          setSession(resumedSession);
          console.log('✅ Session restored:', resumedSession);
          // setCurrentSectionId(parsedSession.sectionId || currentSectionId);
          // setSectionQuestions(getQuestionsBySection(parsedSession.sectionId || currentSectionId));
          // return parsedSession;
          setCurrentSectionId(parsedSession.sectionId || currentSectionId);
          setSectionQuestions(getQuestionsBySection(parsedSession.sectionId || currentSectionId));
          setIsLoading(false);
          return resumedSession;
        } catch (error) {
          localStorage.removeItem('fraterny_quest_session');
        }
      }
      
      // Set section if provided
      if (sectionId) {
        setCurrentSectionId(sectionId);
        setSectionQuestions(getQuestionsBySection(sectionId));
      }
      
      // Clear any old result data when starting fresh assessment
      console.log('🧹 Clearing old result data for fresh assessment');
      localStorage.removeItem('questSessionId');
      localStorage.removeItem('testid');
      
      // Create a new session (will be replaced with API call)
      const newSession: QuestSession = {
        id: generateSessionId(),
        userId: auth.user?.id || 'anonymous', // Will be replaced with actual user ID
        startedAt: new Date().toISOString(),
        status: 'in_progress',
        currentQuestionIndex: 0,
        responses: {},
        sectionId: sectionId || currentSectionId,
        // NEW PROPERTIES
        allowSkip: true,
        visitedQuestions: [],
        questionProgress: {}
      };
      
      setSession(newSession);
      setVisitedQuestions([]);
      
      // Capture device identifier for fallback recovery (secondary method)
      // This runs alongside existing session storage, doesn't replace it
      getDeviceIdentifier().then(identifier => {
        setDeviceIdentifier(identifier);
        // Store in localStorage as additional backup info
        localStorage.setItem('fraterny_device_backup', JSON.stringify({
          ip: identifier.ip,
          deviceHash: identifier.deviceHash,
          sessionId: newSession.id,
          timestamp: new Date().toISOString()
        }));
      }).catch(err => {
        console.log('Device identifier capture failed (non-critical):', err);
      });
      
      // NEW: Track quest start in GA4
      const userState = auth.user ? 'logged_in' : 'anonymous';
      const isResumedSession = !!savedSession;

      googleAnalytics.trackQuestStart({
        session_id: newSession.id,
        user_state: userState,
        total_questions: allQuestions.length,
        is_resumed_session: isResumedSession
      });
      return newSession;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const submitResponse = async (
    questionId: string, 
    response: string, 
    tags?: HonestyTag[]
  ): Promise<void> => {
    console.log('💾 [DESKTOP-DEBUG] submitResponse called:', {
    questionId,
    responsePreview: response.substring(0, 100) + (response.length > 100 ? '...' : ''),
    responseLength: response.length,
    hasTags: !!tags,
    tagsCount: tags?.length || 0
  });
    if (!session) return;
    
    try {
      setIsSubmitting(true);
      
      // Create the response object
      const questionResponse: QuestionResponse = {
        questionId,
        response,
        tags,
        timestamp: new Date().toISOString(),
        viewStartTime: questionViewTimes[questionId] ? new Date(questionViewTimes[questionId]).toISOString() : new Date().toISOString(),
        totalViewTimeSeconds: session.responses?.[questionId]?.totalViewTimeSeconds || 0
      };
      
      // Update session with the new response
      setSession(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          responses: {
            ...(prev.responses || {}),
            [questionId]: questionResponse
          },
          // ✨ NEW - Track question progress
          questionProgress: {
            ...(prev.questionProgress || {}),
            [questionId]: 'answered'
          },
          // ✨ NEW - Track visited questions
          visitedQuestions: [
            ...(prev.visitedQuestions || []),
            questionId
          ]
        };
      });
      
      // NEW: Track successful question completion in GA4
      const userState = auth.user ? 'logged_in' : 'anonymous';
      const sessionId = session?.id || `temp_${Date.now()}`;

      // Find question details for GA4
      const question = sectionQuestions.find(q => q.id === questionId);
      if (question && question.sectionId) {
        const questionIndex = allQuestions.findIndex(q => q.id === questionId) + 1;
        
        googleAnalytics.trackQuestionComplete({
          session_id: sessionId,
          question_id: questionId,
          section_id: question.sectionId,
          user_state: userState,
          question_index: questionIndex,
          response_length: response?.length || 0,
          time_on_question: questionResponse.totalViewTimeSeconds || 0
        });
      }
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const trackQuestionView = (questionId: string) => {
    if (currentViewingQuestion === questionId) return; // Already tracking
    
    // Stop previous tracking
    stopQuestionTracking();
    
    // Start new tracking
    setCurrentViewingQuestion(questionId);
    setQuestionViewTimes(prev => ({
      ...prev,
      [questionId]: Date.now()
    }));
  };

  const stopQuestionTracking = () => {
    if (!currentViewingQuestion) return;
    
    const startTime = questionViewTimes[currentViewingQuestion];
    if (startTime) {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      
      // Update session with accumulated time
      setSession(prev => {
        if (!prev || !prev.responses) return prev;
        
        const existingResponse = prev.responses[currentViewingQuestion];
        if (existingResponse) {
          const currentTotal = existingResponse.totalViewTimeSeconds || 0;
          return {
            ...prev,
            responses: {
              ...prev.responses,
              [currentViewingQuestion]: {
                ...existingResponse,
                totalViewTimeSeconds: currentTotal + timeSpent
              }
            }
          };
        }
        return prev;
      });
    }
    
    setCurrentViewingQuestion(null);
  };
  
  const nextQuestion = () => {
    if (!session) return;
    
    const currentIndex = session.currentQuestionIndex || 0;
    const currentQuestion = sectionQuestions[currentIndex];
    
    if (currentIndex >= sectionQuestions.length - 1) return;
    
    const nextIndex = currentIndex + 1;
    
    setSession(prev => {
      if (!prev) return null;
      
      // Mark current question as visited when moving away
      const updatedVisitedQuestions = currentQuestion && !prev.visitedQuestions?.includes(currentQuestion.id)
        ? [...(prev.visitedQuestions || []), currentQuestion.id]
        : prev.visitedQuestions || [];
      
      return {
        ...prev,
        currentQuestionIndex: nextIndex,
        visitedQuestions: updatedVisitedQuestions
      };
    });
  };

  const previousQuestion = () => {
    if (!session) return;
    
    const currentIndex = session.currentQuestionIndex || 0;
    
    // If we're at the first question of current section, go to previous section
    if (currentIndex === 0) {
      const currentSectionIndex = questSections.findIndex(s => s.id === currentSectionId);
      
      // If there's a previous section, go to its last question
      if (currentSectionIndex > 0) {
        const previousSectionId = questSections[currentSectionIndex - 1].id;
        const previousSectionQuestions = getQuestionsBySection(previousSectionId);
        
        // Change to previous section and go to its last question
        setCurrentSectionId(previousSectionId);
        
        setSession(prev => {
          if (!prev) return null;
          
          return {
            ...prev,
            currentQuestionIndex: previousSectionQuestions.length - 1,
            sectionId: previousSectionId
          };
        });
      }
      // If already in first section, do nothing (already at beginning)
    } else {
      // Move to previous question in current section
      setSession(prev => {
        if (!prev) return null;
        
        const prevIndex = currentIndex - 1;
        
        return {
          ...prev,
          currentQuestionIndex: prevIndex
        };
      });
    }
  };
  
  const skipQuestion = () => {
    if (!session) return;
    
    const currentIndex = session.currentQuestionIndex || 0;
    const currentQuestion = sectionQuestions[currentIndex];
    
    if (currentQuestion) {
      // Mark as skipped in session
      setSession(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          questionProgress: {
            ...(prev.questionProgress || {}),
            [currentQuestion.id]: 'skipped'
          },
          visitedQuestions: [
            ...(prev.visitedQuestions || []),
            currentQuestion.id
          ]
        };
      });
      
      // Move to next question
      nextQuestion();
    }
  };
  
  const goToQuestion = (questionIndex: number) => {
    if (!session) return;
    
    const targetIndex = Math.max(0, Math.min(questionIndex, sectionQuestions.length - 1));
    const currentQuestion = sectionQuestions[session.currentQuestionIndex || 0];
    
    // Mark current question as visited if we're moving away from it
    if (currentQuestion && targetIndex !== (session.currentQuestionIndex || 0)) {
      setSession(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          currentQuestionIndex: targetIndex,
          visitedQuestions: [
            ...(prev.visitedQuestions || []),
            currentQuestion.id
          ]
        };
      });
    } else {
      setSession(prev => {
        if (!prev) return null;
        
        return {
          ...prev,
          currentQuestionIndex: targetIndex
        };
      });
    }
  };
  
  const editResponse = (questionId: string) => {
    const questionIndex = sectionQuestions.findIndex(q => q.id === questionId);
    if (questionIndex >= 0) {
      goToQuestion(questionIndex);
    }
  };

  const finishQuest = async (submissionData: any): Promise<QuestResult | null> => {
  console.log('🚀 Starting quest submission...');

    // Check if already submitted to prevent duplicates
  if (hasSubmittedToAPI) {
    console.log('⚠️ Submission already sent, preventing duplicate');
    // Try to return cached result if available
    const cachedSessionId = localStorage.getItem('questSessionId');
    const cachedTestId = localStorage.getItem('testid');
    if (cachedSessionId && cachedTestId) {
      const navigationData = {
        targetUrl: `/quest-result/processing/${submissionData.user_data.user_id}/${cachedSessionId}/${cachedTestId}`,
        userId: submissionData.user_data.user_id,
        sessionId: cachedSessionId,
        testid: cachedTestId
      };
      return {
        sessionId: cachedSessionId,
        userId: submissionData.user_data.user_id,
        navigationData: navigationData,
        analysisData: {
          summary: "Quest already submitted. Redirecting to results...",
          sections: []
        },
        generatedAt: new Date().toISOString()
      };
    }
    return null;
  }

  
  try {
    setIsSubmitting(true);
    setHasSubmittedToAPI(true); // Mark as submitted immediately
    
    // Extract required IDs
    const sessionId = submissionData.assessment_metadata.session_id;
    const testid = submissionData.user_data.testid;
    const userId = submissionData.user_data.user_id;

    // Track API request start
    const requestStartTime = Date.now();
    console.log('posthog event captured: api_request_started..', requestStartTime);


    const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/agent`, submissionData, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 300000
    });
    console.log('📦 Server response received:', response.data);

    // Validate response status
    if (!response.data || response.data.status !== "Submitted") {
      const errorMessage = response.data?.message || 'Submission failed - unexpected response';
      console.error('❌ Submission failed:', errorMessage);
      throw new Error(errorMessage);
    }

    //console.log('✅ Submission successful:', response.data);
    // Track API request success
    const responseTime = Date.now() - requestStartTime;
    // posthog.capture('api_request_success', {
    //   testid: testid,
    //   endpoint: 'agent_submission',
    //   response_time_ms: responseTime,
    //   timestamp: new Date().toISOString()
    // });


    setSession(prev => {
      if (!prev) return null;
      return {
        ...prev,
        status: 'completed' as QuestSessionStatus,
        completedAt: new Date().toISOString(),
        durationMinutes: prev.startedAt 
          ? (Date.now() - new Date(prev.startedAt).getTime()) / 60000 
          : undefined
      };
    });
    
    // console.log('✅ Analysis completed successfully!');
    // console.log('📦 Server response:', response.data);
    
    // Store data locally for results page access
    localStorage.setItem('questSessionId', sessionId);
    localStorage.setItem('testid', testid);

    // Note: localStorage cleanup moved to results page to prevent data loss on back navigation
    console.log('✅ Quest data preserved for results page');

    const userState = auth.user ? 'logged_in' : 'anonymous';
    const startTime = session?.startedAt ? new Date(session.startedAt).getTime() : Date.now();
    const totalDuration = (Date.now() - startTime) / 1000; // in seconds
    const questionsCompleted = session?.responses ? Object.keys(session.responses).length : 0;

    googleAnalytics.trackQuestComplete({
      session_id: sessionId,
      user_state: userState,
      total_duration: totalDuration,
      questions_completed: questionsCompleted
    });
    
    // Track affiliate questionnaire completion
    const referredBy = submissionData.referred_by;
    if (referredBy) {
      try {
        console.log('📋 Tracking affiliate questionnaire completion:', referredBy);
        await fetch('/api/tracking/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            affiliate_code: referredBy,
            event_type: 'questionnaire_completed',
            user_id: userId,
            session_id: sessionId,
            test_id: testid,
            ip_address: null,
            device_info: null,
            location: null,
            metadata: {
              completion_time: new Date().toISOString(),
              total_duration: totalDuration,
              questions_completed: questionsCompleted
            }
          })
        });
        console.log('✅ Questionnaire completion tracked for affiliate:', referredBy);
      } catch (error) {
        console.error('⚠️ Failed to track questionnaire completion (non-critical):', error);
      }
    }
    
    // const targetUrl = `/quest-result/processing/${userId}/${sessionId}/${testid}`;
    // navigate(targetUrl);

    const navigationData = {
      targetUrl: `/quest-result/processing/${userId}/${sessionId}/${testid}`,
      userId,
      sessionId,
      testid
    };

    return {
      sessionId: sessionId,
      userId: userId,
      navigationData: navigationData,
      analysisData: {
        summary: "Quest submitted successfully.",
        sections: []
      },
      generatedAt: new Date().toISOString()
    };
    
  } catch (error: any) {
    const sessionId = submissionData.assessment_metadata.session_id;
    const testid = submissionData.user_data.testid;
    const userId = submissionData.user_data.user_id;
    console.error('❌ Quest submission failed:', error.message);
    // posthog.capture('api_request_error', {
    //   testid: testid,
    //   endpoint: 'agent_submission',
    //   error_message: error.message || 'Unknown error',
    //   timestamp: new Date().toISOString()
    // });
    
    // Set error in context for UI to show
    // setError(error instanceof Error ? error : new Error('Submission failed'));
    // If it's a network error, check if submission actually succeeded
    if (error.code === 'NETWORK_ERROR' || 
    error.message.includes('timeout') || 
    error.message.includes('Network Error') ||
    error.code === 'ECONNABORTED') {
  
  try {
    console.log('🔍 Network error detected, checking if submission actually succeeded...');

    //let's add posthog event for network error detected
    // posthog.capture('network_error_detected', {
    //   testid: testid,
    //   endpoint: 'agent_submission',
    //   error_message: error.message || 'Network error detected',
    //   timestamp: new Date().toISOString()
    // });

    const statusResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/status/${testid}`);
    const statusData = await statusResponse.json();
    
    if (statusData.status === 'processing' || statusData.status === 'ready') {
      console.log('✅ Submission was actually successful, navigating to processing...');

      //add posthog event for submission confirmed successful after network error
      // posthog.capture('submission_confirmed_successful', {
      //   testid: testid,
      //   endpoint: 'agent_submission',
      //   timestamp: new Date().toISOString()
      // });
      
      // Mark session as completed and do all success cleanup
      setSession(prev => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'completed' as QuestSessionStatus,
          completedAt: new Date().toISOString(),
          durationMinutes: prev.startedAt 
            ? (Date.now() - new Date(prev.startedAt).getTime()) / 60000 
            : undefined
        };
      });
      
      localStorage.setItem('questSessionId', sessionId);
      localStorage.setItem('testid', testid);
      // Note: localStorage cleanup moved to results page
      
      const navigationData = {
        targetUrl: `/quest-result/processing/${userId}/${sessionId}/${testid}`,
        userId,
        sessionId,
        testid
      };

      return {
        sessionId: sessionId,
        userId: userId,
        navigationData: navigationData,
        analysisData: {
          summary: "Quest analysis completed successfully.",
          sections: []
        },
        generatedAt: new Date().toISOString()
      };
    }
  } catch (statusError) {
    console.log('Status check also failed, will show retry option');
    // posthog event for status check failure
    // posthog.capture('status_check_failed_after_submission', {
    //   testid: testid,
    //   endpoint: 'status_check',
    //   error_message: (statusError as Error).message || 'Status check failed',
    //   timestamp: new Date().toISOString()
    // });

  }
}

    throw error;
    
  } finally {
    setIsSubmitting(false);
  }
  };
    
  const resetQuest = () => {
    setSession(null);
    setError(null);
    setCurrentSectionId(initialSectionId || questSections[0].id);
  };
  
  const getCurrentSection = () => {
    return questSections.find(s => s.id === currentSectionId) || questSections[0];
  };

  const getTotalQuestionsInAssessment = () => {
    return questSections.reduce((total, section) => total + section.questions.length, 0);
  };

  const getCurrentGlobalQuestionIndex = () => {
    const currentSectionIndex = questSections.findIndex(s => s.id === currentSectionId);
    const questionsBefore = questSections
      .slice(0, currentSectionIndex)
      .reduce((total, section) => total + section.questions.length, 0);
    
    return questionsBefore + (session?.currentQuestionIndex || 0);
  };

  const isLastQuestionInEntireAssessment = () => {
    const totalQuestions = getTotalQuestionsInAssessment();
    const currentGlobalIndex = getCurrentGlobalQuestionIndex();
    return currentGlobalIndex === totalQuestions - 1;
  };

  const finishSection = (): boolean => {
    console.log('🔄 finishSection called');
    console.log('📍 Session exists:', !!session);
    console.log('📍 Current section:', getCurrentSection()?.id);
    
    if (!session || !getCurrentSection()) {
      console.log('❌ No session or current section - returning false');
      return false;
    }
    
    // Check if all questions in current section are answered
    const currentSectionQuestions = getCurrentSection().questions;
    console.log('📊 Questions in current section:', currentSectionQuestions.length);
    console.log('📝 Session responses:', Object.keys(session.responses || {}));
    
    const allQuestionsAnswered = currentSectionQuestions.every(q => {
      const hasResponse = session.responses && session.responses[q.id];
      console.log(`   Question ${q.id}: ${hasResponse ? '✅' : '❌'} answered`);
      return hasResponse;
    });
    
    console.log('✅ All questions answered:', allQuestionsAnswered);
    
    if (!allQuestionsAnswered) {
      console.log('❌ Not all questions answered - returning false');
      // Don't automatically move to next section if current isn't complete
      return false;
    }
    
    // Find next section
    const currentIndex = questSections.findIndex(s => s.id === currentSectionId);
    console.log('📍 Current section index:', currentIndex);
    console.log('📍 Total sections:', questSections.length);
    
    const nextSectionIndex = currentIndex + 1;
    console.log('📍 Next section index:', nextSectionIndex);
    
    if (nextSectionIndex < questSections.length) {
      // Move to next section
      const nextSection = questSections[nextSectionIndex];
      console.log('➡️ Moving to next section:', nextSection.id, nextSection.title);
      changeSection(nextSection.id);
      console.log('✅ Section change completed - returning true');
      return true;
    }
    
    // No more sections - assessment is complete
    console.log('🏁 No more sections - assessment complete - returning false');
    return false;
  };

  const changeSection = (newSectionId: string) => {
    const targetSection = questSections.find(s => s.id === newSectionId);
    
    if (!targetSection) {
      console.warn(`Section ${newSectionId} not found`);
      return;
    }

    // If already in the target section, do nothing
    if (currentSectionId === newSectionId) {
      return;
    }
    
    // Update the section ID - this should trigger the useEffect
    setCurrentSectionId(newSectionId);
    
    // Also immediately get and set the new questions to avoid any delay
    const newQuestions = getQuestionsBySection(newSectionId);
    setSectionQuestions(newQuestions);
    
    // Update session state
    setSession(prev => {
      if (!prev) {
        return null;
      }
      
      const newState = {
        ...prev,
        currentQuestionIndex: 0, // Always start from first question
        sectionId: newSectionId
      };
      
      return newState;
    });
    
    // Clear any errors
    setError(null);
  };
  
  // Context value
  const value = useMemo(() => ({
    // State
    session,
    currentQuestion,
    questions: sectionQuestions,
    allQuestions,
    isLoading,
    isSubmitting,
    progress,
    error,
    currentSectionId,
    
    // Section data
    sections: questSections,
    currentSection: getCurrentSection(),
    
    // Actions
    startQuest,
    submitResponse,
    nextQuestion,
    previousQuestion,
    changeSection,
    finishSection,
    finishQuest,
    resetQuest,
    skipQuestion,
    goToQuestion,
    editResponse,
    getTotalQuestionsInAssessment,
    getCurrentGlobalQuestionIndex,
    isLastQuestionInEntireAssessment,
    trackQuestionView,     
    stopQuestionTracking,
    hasAttemptedFinishWithIncomplete,
    accumulateQuestionTime,
    setHasAttemptedFinishWithIncomplete,
  }), [
    session,
    currentQuestion,
    sectionQuestions,
    allQuestions,
    isLoading,
    isSubmitting,
    progress,
    error,
    currentSectionId
  ]);
  
  return (
    <QuestContext.Provider value={value}>
      {children}
    </QuestContext.Provider>
  );
}