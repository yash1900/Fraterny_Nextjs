'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useQuest } from '../hooks/useQuest';
import { ProgressBar } from '../components/PrograssBar';

interface QuestHeaderProps {
  title: string;
  subtitle?: string;
  showProgress?: boolean;
  className?: string;
}


export function QuestHeader({
  title,
  subtitle,
  showProgress = true,
  className = ''
}: QuestHeaderProps) {
  const { 
    session, 
    currentQuestion, 
    questions, 
    progress 
  } = useQuest();

  // Helper function to count responses in current section
  const getResponseCountForCurrentSection = () => {
    if (!session?.responses) return 0;
    return questions.filter(q => session.responses && session.responses[q.id]).length;
  };
  
  return (
    <header className={` ${className}`}>
      <div className="">
        {/* Progress bar - MOVED ABOVE TITLE */}
        {showProgress && session && (
          <div className="mb-4">
            <ProgressBar 
              currentValue={getResponseCountForCurrentSection()}
              totalValue={questions.length}
              showLabel={true}
              showMilestones={true}
            />
          </div>
        )}
      
      </div>
    </header>
  );
}