'use client';


import { useQuestContext } from '../contexts/QuestContext';

// Re-export the hook for cleaner imports
export function useQuest() {
  return useQuestContext();
}

// Helper hooks for specific functionality
export function useQuestState() {
  const { 
    session, 
    currentQuestion, 
    questions, 
    isLoading, 
    isSubmitting, 
    progress, 
    error 
  } = useQuestContext();
  
  return {
    session,
    currentQuestion,
    questions,
    isLoading,
    isSubmitting,
    progress,
    error,
    
    // Derived state
    isActive: session !== null && session.status === 'in_progress',
    isComplete: session !== null && session.status === 'completed',
    hasError: error !== null,
    questionCount: questions.length,
    currentIndex: session?.currentQuestionIndex || 0,
    responseCount: session?.responses ? Object.keys(session.responses).length : 0,
  };
}

export function useQuestActions() {
  const { 
    startQuest, 
    submitResponse, 
    nextQuestion, 
    previousQuestion, 
    finishQuest, 
    resetQuest 
  } = useQuestContext();
  
  return {
    startQuest,
    submitResponse,
    nextQuestion,
    previousQuestion,
    finishQuest,
    resetQuest,
  };
}