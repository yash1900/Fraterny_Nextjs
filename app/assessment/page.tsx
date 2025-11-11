'use client';

import React, { useState } from 'react';
import { QuestProvider } from './provider/QuestProvider';
import { QuestIntro } from './components/QuestIntro';
import { QuestAssessment } from './components/QuestAssessment';
import QuestLoading from './components/QuestLoading';
//import QuestError from '../quest/error';

enum QuestState {
  INTRO = 'intro',
  ASSESSMENT = 'assessment',
  LOADING = 'loading',
  ERROR = 'error'
}

/**
 * Main Quest page component
 * Integrates all quest components into a complete assessment experience
 */
export function QuestPage() {
  const [questState, setQuestState] = useState<QuestState>(QuestState.INTRO);
  const [error, setError] = useState<Error | null>(null);

  const handleStartAssessment = () => {
    setQuestState(QuestState.LOADING);
    
    setTimeout(() => {
      setQuestState(QuestState.ASSESSMENT);
    }, 1500);
  };
  
  return (
    <QuestProvider>
      <div className="max-h-screen">
        {/* Render different views based on state */}
        {questState === QuestState.INTRO && (
          <QuestIntro onStart={handleStartAssessment} />
        )}
        
        {questState === QuestState.LOADING && (
          <QuestLoading />
        )}
        
        {questState === QuestState.ASSESSMENT && (
          <QuestAssessment />
        )}
        
        {/* {questState === QuestState.ERROR && (
          <QuestError 
            error='An error occurred while loading the assessment.'
            onRetry={() => setQuestState(QuestState.INTRO)} 
          />
        )} */}
      </div>
    </QuestProvider>
  );
}

export default QuestPage;