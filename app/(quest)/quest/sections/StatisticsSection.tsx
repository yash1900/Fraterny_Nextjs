// /src/components/quest-landing/sections/StatisticsSection.tsx

'use client';

import React,{useState} from 'react';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { ChevronDown } from 'lucide-react';
import img from '../../../../public/Vector.svg';
import { AnalyzeSidebar } from './AnalyzeSidebar';

interface StatisticsSectionProps {
  animationState: string;
  className?: string;
  onContinueClick?: () => void;
  onLogoClick?: () => void;
  onMenuClick?: () => void;
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

const StatisticsSection: React.FC<StatisticsSectionProps> = ({ 
  animationState,
  className = '',
  onContinueClick,
  onLogoClick,
  onMenuClick
}) => {
  const [hasRippled, setHasRippled] = useState(false);
  

  const handleRipple = () => {
    if (!hasRippled) {
      setHasRippled(true);
    }
  }


  return (
    
    <section className={`w-screen h-full relative  ${className}`}>
      <motion.div 
        layoutId='bg'
        transition={{ duration: 1.2 }}
        className='absolute z-0 w-[554px] h-[554px] rounded-full'
        style={{
          background: 'radial-gradient(ellipse 50% 50% at 50% 50%, #0C45F0 0%, #41D9FF 51%, #48B9D8 100%)',
          left: '-70px',
          top: '15%',
          filter: 'blur(30px)',
        }}
      />

      <div className='flex w-full items-center justify-center pt-4'>
        {/* <motion.div>
        </motion.div> */}

        <motion.div
          className="z-50"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ 
            duration: 0.8,
            ease: "easeOut",
            delay: 0.4  
          }}
        >
          <img 
            src='/Vector.svg'
            alt="QUEST" 
            className="h-[36px] w-auto brightness-0 cursor-pointer"
            onClick={onLogoClick}
          />
        </motion.div>

        {/* <motion.span 
          variants={animationVariants} 
          initial="invisible" 
          animate="visible"
          onClick={onMenuClick}
          className="cursor-pointer p-2 rounded-lg hover:bg-white/10 transition-colors z-[50]"
          whileTap={{ scale: 0.95 }}
        >
          <Menu className="w-6 h-6 text-black" />
        </motion.span> */}
      </div>

    <div className='relative flex flex-col gap-10 top-[18%] h-screen'>
      <div className=''>
        <motion.div 
          variants={animationVariants} 
          initial="invisible" 
          animate="visible"
          className="text-center justify-start text-white text-xl font-normal font-gilroy-regular">You’d be shocked to know,<br/>Harvard researchers suggest that
        </motion.div>
      </div>

      <div className=''>
        <motion.div 
          variants={animationVariants} 
          initial="invisible" 
          animate="visible"
          className="text-center justify-start text-white text-5xl font-normal font-gilroy-semibold">95%
        </motion.div>
        <motion.div 
        variants={animationVariants} 
        initial="invisible" 
        animate="visible"
        className="text-center justify-start"><span className="text-white text-2xl font-normal font-gilroy-regular">of people believe<br/>they are </span><span className="text-white text-2xl font-gilroy-bold font-bold">self-aware<br/></span><span className="text-white text-2xl font-normal font-gilroy-regular">but only</span>
        </motion.div>
      </div>

      <div className=''>
        <div className='flex flex-col gap-1'>
        <motion.div 
        variants={animationVariants} 
          initial="invisible" 
          animate="visible"
        className="text-center justify-start text-white text-5xl font-normal font-gilroy-semibold">10-15%</motion.div>

        <motion.div
          variants={animationVariants} 
          initial="invisible" 
          animate="visible"
          className="text-center justify-start text-white text-2xl font-normal font-gilroy-regular">
            actually are
        </motion.div>

      </div>
      </div>

      <div className='w-full flex justify-center mt-[-5px]'>
        <motion.div
          variants={animationVariants} 
          initial="invisible" 
          animate="visible"
          className='w-20'
        >
          <motion.button
          onClick={onContinueClick}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-full h-full relative"
          style={{}}
        >
          {/* Circular spinning text */}
          <motion.div 
            className=""
            animate={{ rotate: 360 }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <img 
              src="/text.svg" 
              alt="Those who are" 
              className="w-full h-full"
            />
          </motion.div>
          
          {/* Central arrow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <img 
              src="/arrow-down.svg" 
              alt="arrow down" 
              className="w-6 h-6"
            />
          </div>
        </motion.button>

        </motion.div>

      </div>

    </div>


    </section>
  );
};

export default StatisticsSection;