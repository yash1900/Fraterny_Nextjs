'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuest } from '../hooks/useQuest';
import { QuestHeader } from '../components/QuestHeader';
import { QuestContainer } from '../components/QuestContainer';
import { QuestNavigation } from '../components/QuestNavigation';
import { Home, ChevronRight } from 'lucide-react';

interface QuestLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  showNavigation?: boolean;
  showBackground?: boolean;
  className?: string;
  onFinish?: () => void;
}

/**
 * The main layout component for the quest system
 * Provides structure, navigation, and visual effects
 * Enhanced for desktop with better margins and borders
 */
export function QuestLayout({
  children,
  showHeader = true,
  showNavigation = true,
  showBackground = true,
  className = '',
  onFinish 
}: QuestLayoutProps) {
  const { currentSection, session, isLoading, error, currentQuestion, sections, currentSectionId, changeSection, allQuestions, goToQuestion } = useQuest();
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);
  const toggleSection = (sectionId: string) => {
  setExpandedSectionId(prev => prev === sectionId ? null : sectionId);
};

const getSectionProgress = (sectionId: string) => {
  const sectionQuestions = allQuestions?.filter(q => q.sectionId === sectionId) || [];
  const completed = sectionQuestions.filter(q => {
    const response = session?.responses?.[q.id];
    return response && response.response && response.response.trim() !== '';
  }).length;
  
  return { completed, total: sectionQuestions.length };
};

// useEffect(() => {
//   console.log('🔍 [DRAWER-DEBUG] Section states:', {
//     expandedSectionId,
//     currentSectionId,
//     sectionsCount: sections?.length
//   });
// }, [expandedSectionId, currentSectionId, sections]);
  
  return (
    <div className='pt-0'>
      {/* Mobile Layout (unchanged) */}
      <div className={`lg:hidden relative max-h-dvh min-h-dvh w-full flex flex-col ${className}`}>
        
        {/* Header with title and progress */}
        {showHeader && (
          <QuestHeader 
            title={currentSection?.title || 'Psychology Assessment'} 
            subtitle={currentSection?.description}
            className=''
          />
        )}
        
        {/* Main content area */}
        <main className="flex-1 overflow-auto pb-24">
          <QuestContainer className='px-6 min-h-full'>
            {/* Loading state */}
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center p-8"
              >
                <div className="loader w-8 h-8 border-4 border-gray-200 border-t-terracotta rounded-full animate-spin"></div>
                <span className="ml-3 text-gray-600">Loading your assessment...</span>
              </motion.div>
            )}
            
            {/* Error state */}
            {error && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200"
              >
                <h3 className="font-medium">Something went wrong</h3>
                <p className="text-sm mt-1">{error.message}</p>
                <button 
                  className="mt-2 text-sm bg-white px-3 py-1 rounded border border-red-200 hover:bg-red-50 transition-colors"
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </button>
              </motion.div>
            )}
            
            {!isLoading && !error && children}
          </QuestContainer>
        </main>
        <div className='absolute bottom-0 w-full px-2 py-4 bg-white to-transparent'>
        {showNavigation && session && session.status === 'in_progress' && (
          <QuestNavigation 
            showPrevious={true}
            showNext={true}
            showSkip={false}
            showFinish={true}
            onFinish={onFinish}
          />
        )}
        </div>
      
      </div>

      {/* Desktop Layout (enhanced) */}
      <div className={`hidden lg:flex relative max-h-dvh min-h-dvh w-full ${className}`}>
        

        <div className="w-48 xl:w-56 bg-sky-900/5 border-r border-sky-200/20 p-2 overflow-y-auto">
          <div className="sticky top-14">
            <div className="bg-white rounded-[10px] border-[1.50px] border-neutral-400 py-2 shadow-lg">
              <div id="desktop-section-drawer" className=''>
                {sections?.map((section, index) => {
                  // console.log('🔍 [DRAWER-RENDER]', section.id, 'expanded?', expandedSectionId === section.id);
                  const colors = ['text-sky-800', 'text-red-800', 'text-purple-900', 'text-lime-700', 'text-blue-950'];
                  const colorClass = colors[index] || 'text-sky-800';
                  const isLast = index === sections.length - 1;
                  
                  return (
                    <div key={section.id}>
                      <button 
                        className="relative w-full px-4 py-2 text-left flex items-center justify-between hover:bg-sky-50/30 transition-colors z-10 cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('🔍 [CLICK] Clicked section:', section.id, 'Current expanded:', expandedSectionId);
                          toggleSection(section.id);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`text-xl font-normal font-gilroy-bold tracking-[-1.5px] ${colorClass}`}>
                            {section.title}
                          </div>
                        </div>
                        <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedSectionId === section.id ? 'rotate-90' : ''}`} />
                      </button>
                      {expandedSectionId === section.id && (() => {
                        //console.log('🔍 [QUESTIONS-RENDER] Section:', section.id, 'Questions:', allQuestions?.filter(q => q.sectionId === section.id).length);
                        return (
                          <div className="bg-sky-50/20 py-2">
                            {allQuestions?.filter(q => q.sectionId === section.id).map((question, qIndex) => {
                              const hasResponse = session?.responses?.[question.id]?.response?.trim();
                              const questionPreview = question.text.substring(0, 10) + (question.text.length > 40 ? '...' : '');
                              
                              return (
                                <div
                                  key={question.id}
                                  className={`px-6 py-2 hover:bg-sky-100/40 cursor-pointer transition-colors flex items-center gap-3 ${
                                    currentQuestion?.id === question.id ? 'bg-sky-200/50 border-l-4 border-sky-600' : ''
                                  }`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (currentSectionId !== section.id) {
                                      changeSection(section.id);
                                    }
                                    goToQuestion(qIndex);
                                  }}
                                >
                                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs ${
                                    hasResponse ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-gray-400'
                                  }`}>
                                    {hasResponse ? '✓' : qIndex + 1}
                                  </span>
                                  <span className="text-sm text-gray-700 font-gilroy-regular">
                                    {questionPreview}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                      {!isLast && (
                        <div className="w-full h-0 outline outline-[0.50px] outline-offset-[-0.25px] outline-neutral-400"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
        
          {showHeader && (
            <QuestHeader 
              title={currentSection?.title || 'Psychology Assessment'} 
              subtitle={currentSection?.description}
              className='border-b border-sky-200/30 bg-sky-50/30'
            />
          )}

          {/* Breadcrumb Navigation - Desktop Only */}
          <div className="hidden lg:block border-b border-sky-200/30 bg-white px-8 py-3">
            <div className="max-w-4xl mx-auto flex items-center gap-2 text-sm">
              <Home className="w-4 h-4 text-gray-600" />
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600 font-gilroy-medium">My Quest</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-sky-800 font-gilroy-bold">
                {currentSection?.title || 'Psychology Assessment'}
              </span>
            </div>
          </div>
          
         
          <main className="flex-1 overflow-auto pb-32 px-8 py-6">
            <QuestContainer className='min-h-full max-w-4xl mx-auto border border-sky-200/40 rounded-2xl bg-white/90 backdrop-blur-sm shadow-lg p-8'>
              {/* Loading state */}
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center p-12"
                >
                  <div className="loader w-12 h-12 border-4 border-gray-200 border-t-sky-500 rounded-full animate-spin"></div>
                  <span className="ml-4 text-lg text-gray-600">Loading your assessment...</span>
                </motion.div>
              )}
              
              {/* Error state */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-50 text-red-700 p-6 rounded-xl border-2 border-red-200 shadow-sm"
                >
                  <h3 className="font-semibold text-lg mb-2">Something went wrong</h3>
                  <p className="text-base mb-4">{error.message}</p>
                  <button 
                    className="text-base bg-white px-6 py-3 rounded-lg border-2 border-red-200 hover:bg-red-50 transition-colors shadow-sm font-medium"
                    onClick={() => window.location.reload()}
                  >
                    Refresh Page
                  </button>
                </motion.div>
              )}
              
              {!isLoading && !error && children}
            </QuestContainer>
          </main>
          
          {/* Navigation positioned with better spacing - matches question container width */}
          <div className='absolute bottom-0 left-48 xl:left-56 right-72 xl:right-80 px-8 py-6 bg-gradient-to-t from-sky-50/80 to-transparent'>
            {showNavigation && session && session.status === 'in_progress' && (
              <div className="max-w-4xl mx-auto">
                <QuestNavigation 
                  showPrevious={true}
                  showNext={true}
                  showSkip={false}
                  showFinish={true}
                  onFinish={onFinish}
                  className="desktop-enhanced"
                />
              </div>
            )}
          </div>
        </div>
        
        {/* Right Sidebar - Question Info */}
        <div className="w-72 xl:w-80 bg-sky-900/5 border-l border-sky-200/20 p-6 overflow-y-auto">
          <div className="sticky top-6 space-y-6">
            
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 font-gilroy-bold">You are in Quest Mode</h3>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-sky-200/40 shadow-sm">
                <div id="desktop-info-container" className="text-gray-600 font-gilroy-regular">
                  {currentQuestion?.infoText ? (
                    <>
                      <h4 className="font-semibold text-base mb-2 text-gray-800 font-gilroy-bold">Why do I ask</h4>
                      <p className="text-sm leading-relaxed font-gilroy-regular">{currentQuestion.infoText}</p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 italic font-gilroy-bold">This question helps us better understand your personality and provide more accurate insights.</p>
                  )}
                </div>
              </div>
            </div>
            
            
            <div>
              <h4 className="text-base font-semibold text-gray-800 mb-3 font-gilroy-bold">For Accurate Results</h4>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-sky-200/30 shadow-sm">
                <ul className="text-sm text-gray-600 space-y-2 font-gilroy-regular">
                  <li className="flex items-start">
                    <span className="text-sky-600 mr-2 font-gilroy-regular">•</span>
                    <span>Give more context - More details you provide, More accurate my analysis will become.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-sky-600 mr-2 font-gilroy-regular">•</span>
                    <span>Fill your responses like you are chatting with a close friend - This will give me a better understanding of you</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-sky-600 mr-2 font-gilroy-regular">•</span>
                    <span>Take your time - Don't rush through questions. Try to be accurate but also try to finish it in one sitting.</span>
                  </li>
                </ul>
              </div>
            </div>
            
          </div>
        </div>
      
      </div>
    </div>
  );
}

export default QuestLayout;