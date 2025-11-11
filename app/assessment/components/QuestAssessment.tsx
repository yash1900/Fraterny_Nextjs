'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuest } from '../hooks/useQuest';
import { QuestLayout } from '../components/QuestLayout';
import { QuestionCard } from '../components/QuestionCard';
// import { MediumQuestionCard } from '../questions/MediumQuestionCard';
// import { HardQuestionCard } from '../questions/HardQuestionCard';
// import { QuestionCardSkeleton } from '../questions/QuestionCardSkeleton';
import { HonestyTag, Question, QuestionResponse, QuestionCardProps, DifficultyQuestionCardProps, QuestionCardSkeletonProps} from '../types/types';

interface QuestAssessmentProps {
  onComplete?: () => void;
  className?: string;
}

export function QuestAssessment({ onComplete, className = '' }: QuestAssessmentProps) {
  const { 
    session, 
    currentQuestion, 
    submitResponse,
    nextQuestion,
    finishSection,
    finishQuest,
    isLoading,
    currentSection
  } = useQuest();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleResponse = async (response: string, tags?: HonestyTag[]) => {
        if (!currentQuestion) {
            console.log('❌ No current question - cannot handle response');
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            await submitResponse(currentQuestion.id, response, tags);
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
            console.error('❌ Error in handleResponse:', error);
        } finally {
            setIsSubmitting(false);
        }
    };


  const handleQuestCompletion = () => {
    // This will trigger QuestCompletion component with our fixed duplicate prevention
    if (onComplete) {
      onComplete();
    }
  };
  
  // Render the appropriate question card based on difficulty
  const renderQuestionCard = () => {
    if (!currentQuestion) return null;
    
    // Get previous response if any
    const previousResponse = session?.responses?.[currentQuestion.id];
    
    switch (currentQuestion.difficulty) {
      case 'easy':
        return (
          <EasyQuestionCard
            question={currentQuestion}
            onResponse={handleResponse}
            isActive={!isSubmitting}
            previousResponse={previousResponse}
          />
        );
        
      default:
        return (
          <EasyQuestionCard
            question={currentQuestion}
            onResponse={handleResponse}
            isActive={!isSubmitting}
            previousResponse={previousResponse}
          />
        );
    }
  };
  
  return (
    <QuestLayout className={className} onFinish={handleQuestCompletion} >
      <AnimatePresence mode="wait">
        {/* {isLoading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <QuestionCardSkeleton difficulty={currentQuestion?.difficulty} />
          </motion.div>
        )} */}
        
        {!isLoading && currentQuestion && (
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {renderQuestionCard()}
          </motion.div>
        )}
        
        {!isLoading && !currentQuestion && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-8"
          >
            <p className="text-lg text-gray-600">No questions available.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy/90 transition-colors"
            >
              Refresh
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </QuestLayout>
  );
}

export default QuestAssessment;



function EasyQuestionCard(props: DifficultyQuestionCardProps) {
  return (
    <QuestionCard
      {...props}
      //key={props.question.id}
      className={`${props.className || ''}`}
    />
  );
}
