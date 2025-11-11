'use client';

import { useEffect, useRef } from 'react';
import { useQuest } from '../hooks/useQuest';

/**
 * Hook to track time spent viewing a question using mount/unmount lifecycle
 * Debug version with detailed logging
 */
export function useQuestionTiming(questionId: string) {
  const { accumulateQuestionTime } = useQuest();
  
  useEffect(() => {
    const startTime = Date.now();
    //console.log(`⏰ Started timing question ${questionId} at ${new Date().toLocaleTimeString()}`);
    
    return () => {
      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);
      //console.log(`⏰ Question ${questionId} ended at ${new Date().toLocaleTimeString()}, duration: ${duration}s`);
      
      if (duration > 0) {
        accumulateQuestionTime(questionId, duration);
      }
    };
  }, [questionId, accumulateQuestionTime]);
}