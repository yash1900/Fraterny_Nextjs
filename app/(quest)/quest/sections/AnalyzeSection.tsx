// /src/components/quest-landing/sections/AnalyzeSection.tsx

'use client';

import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import Change from './Change';
import Testimonials from './Testimonials';
import FaqSection from './FaqSection';
import img from '../../../../public/Vector.svg';
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { AnalyzeSidebar } from './AnalyzeSidebar';
import QuestFooter from './QuestFooter';

interface AnalyzeSectionProps {
  animationState: string;
  className?: string;
  onScreenTransition?: () => void;
  onLogoClick?: () => void;
  onNavigateToSection?: (targetScreen: number, sectionId?: string) => void;
}

// Simple animation variants
const animationVariants = {
  invisible: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6
    }
  }
};

const AnalyzeSection: React.FC<AnalyzeSectionProps> = ({ 
   animationState: _animationState,
    className = '',
  onScreenTransition: _onScreenTransition,
  onLogoClick: _onLogoClick,
  onNavigateToSection
  
}) => {
  const [isInHeroSection, setIsInHeroSection] = useState(true);
  const heroSectionRef = useRef<HTMLDivElement>(null);
  // const containerRef = useRef<HTMLDivElement>(null);
  const analyzeScrollRef = useRef<HTMLDivElement>(null);
  // console.log('Current logo state - should be white?', isInHeroSection);
  useEffect(() => {
  const container = analyzeScrollRef.current;
  if (!container) {
    // console.log('No container found');
    return;
  }

  const handleScroll = () => {
    const scrollTop = container.scrollTop;
    const shouldBeInHero = scrollTop < 20;
    
    if (shouldBeInHero !== isInHeroSection) {
      setIsInHeroSection(shouldBeInHero);
    }
  };

  container.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
  return () => container.removeEventListener('scroll', handleScroll);
}, [isInHeroSection]);

const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const handleMenuClick = () => {
    setIsSidebarOpen(true);
  };

  return (


    <section className=''>
    <div ref={analyzeScrollRef} className='relative h-screen overflow-y-auto'>
      {/* Header */}
      <div className='flex justify-between fixed top-0 w-full z-50 pt-4 left-0 text-white items-center'>
        <motion.div>
        </motion.div>
        
        <motion.div
        layoutId='logo'
          className="z-50"
          initial={{ y: 0, opacity: 1 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ 
            duration: 0.8,
            ease: "easeOut",
            delay: 0.4  // Start after text fades out
          }}
        >
          <Image 
            src='/Vector.svg'
            alt="QUEST: Run Quest in 15 minutes. Free test with optional paid PDF. Map thought patterns, get a 35+ page report." 
            width={90}
            height={36}
            className={`transition-all duration-500 ease-out cursor-pointer ${isInHeroSection ? 'brightness-0 invert' : 'opacity-0'}`}
            onClick={_onLogoClick}
          />
        </motion.div>

        <motion.div 
          variants={animationVariants} 
          initial="invisible" 
          animate="visible"
          onClick={handleMenuClick}
          className="flex items-center justify-center cursor-pointer p-2 rounded-lg hover:bg-white/10 transition-colors"
          whileTap={{ scale: 0.95 }}
        >
          <Menu className="w-6 h-6" />
        </motion.div>
      </div>   

      {/* Sidebar */}
      <AnalyzeSidebar
      isOpen={isSidebarOpen}
      onClose={() => setIsSidebarOpen(false)}
      theme="blue"
      onNavigateToSection={onNavigateToSection}
      />

      {/* Hero section */}
      {/* <div ref={heroSectionRef} className='max-h-400 relative bg-[#004A7F] overflow-hidden gap-7 text-white w-full p-4 py-20'> */}
      <div id="analyze-hero" ref={heroSectionRef} className='max-h-400 relative bg-[#004A7F] overflow-hidden gap-7 text-white w-full p-4 py-20'>
        <div className='gap-8 flex relative flex-col z-20'>
          {/* Main Title */}
          <div className='w-[140px] text-left'>
            <motion.p 
              variants={animationVariants} 
              initial="invisible" 
              animate="visible"
              className='pb-[10px] font-gilroy-medium text-4xl'
            >
              What I will do?
            </motion.p>
            <div className='border-b-2 border-white ml-1' />
          </div>
          
          {/* Description */}
          <p className='pt-2 font-gilroy-regular text-[20px]'>
            I'll guide you to reflect on your
          </p>
          
          {/* Pills */}
          <motion.div 
            variants={animationVariants} 
            initial="invisible" 
            animate="visible"
            className='flex flex-wrap gap-2 mt-[-5px]'
          >
            {['Motivations', 'Desires', 'Patterns', 'Triggers', 'Fears'].map((item, i) => (
              <div 
                key={i}
                className="px-4 py-2 font-normal font-gilroy-bold rounded-full border-2 border-white bg-white/10 text-white tracking-[-1.1px]"
                style={{ fontSize: '20px', fontWeight: 400 }}
              >
                {item}
              </div>
            ))}
          </motion.div>
          
          {/* Understanding text */}
          <p className='pt-4 font-gilroy-regular text-[20px]'>
            So together, we can understand
          </p>
          
          {/* Questions list */}
          <motion.div 
            variants={animationVariants} 
            initial="invisible" 
            animate="visible"
            className='flex flex-col gap-6'
          >
            {[
              'What makes you unique',
              "How to use your strengths", 
              'How others truly see you',
              'How to reach your ideal self'
            ].map((question, i) => (
              <div key={i} className="relative flex items-center justify-between">
                <p 
                  className="text-white font-bold pb-3 font-gilroy-bold text-[20px]"
                >
                  {question}
                </p>
                <span 
                  className="font-normal ml-4 mb-3 font-gilroy-regular text-[14px]"
                >
                  {i + 1}
                </span>
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white" />
              </div>
            ))}
          </motion.div>
        </div>
        
        {/* Background Gradient */}
        <motion.div 
          layoutId='bg'
          transition={{ duration: 0.8 }}
          className='absolute z-10 w-[554px] h-[554px] bg-radial from-10% from-[#48B9D8] via-80% to-40% via-[#41D9FF] to-[#0C45F0] flex bottom-0 top-[45px] right-[51px] translate-x-1/2 rounded-full blur-[80px]'
          style={{
            background: 'radial-gradient(50% 50% at 50% 50%, #0C45F0 0%, #41D9FF 50.96%, #48B9D8 100%)',
            backdropFilter: 'blur(10px)',
          }}
        />
      </div>

      <div id="change-section">
        <Change />
      </div>
      <div className='flex flex-col'>
        <Testimonials />
      <div id="faq-section">
        <FaqSection />
      </div>
      <div id="contact-section">
        <QuestFooter />
      </div>
      </div>

    </div>
    </section>
    
  );
};

export default AnalyzeSection;

