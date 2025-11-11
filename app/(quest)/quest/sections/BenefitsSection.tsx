// /src/components/quest-landing/sections/BenefitsSection.tsx

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { ChevronDown } from 'lucide-react';
import img from '../../../../public/Vector.svg';
import { AnalyzeSidebar } from './AnalyzeSidebar';

interface BenefitsSectionProps {
  animationState: string;
  className?: string;
  onScreenTransition?: () => void;
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

const BenefitsSection: React.FC<BenefitsSectionProps> = ({ 
  animationState: _animationState,
    className = '',
  onScreenTransition: _onScreenTransition,
  onLogoClick: _onLogoClick,
  onMenuClick
}) => {
  // const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
  //   const handleMenuClick = () => {
  //     setIsSidebarOpen(true);
  //   };
    
  return (

    <section className='w-screen h-full relative'>
        <motion.div 
          layoutId='bg'
          transition={{ duration: 1.2 }}
          className='absolute z-0 rounded-full'
          style={{
            width: '952px',
            height: '952px',
            background: 'radial-gradient(ellipse 50% 50% at 50% 50%, #0C45F0 0%, #41D9FF 51%, #48B9D8 100%)',
            filter: 'blur(30px)',
            left: '-269px',
            top: '-39px'
          }}
        />

        <div className='flex w-full items-center justify-between pt-4'>
          <motion.div>
          </motion.div>
          <motion.div
            className="z-50"
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ 
              duration: 0.8,
              ease: "easeOut",
              delay: 0.4  // Start after text fades out
            }}
          >
            <img 
              src='/Vector.svg'
              alt="QUEST" 
              className="h-[36px] w-auto brightness-0 invert cursor-pointer"
              onClick={_onLogoClick} // Call the onLogoClick prop when clicked
            />
          </motion.div>
          <motion.span 
            variants={animationVariants} 
            initial="invisible" 
            animate="visible"
            onClick={onMenuClick}
            className="cursor-pointer p-2 rounded-lg hover:bg-white/10 transition-colors z-[50]"
            whileTap={{ scale: 0.95 }}
          >
            <Menu className="w-6 h-6 text-white" />
          </motion.span>
        </div>
      {/* <AnalyzeSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        theme="blue"
        /> */}

        <div className='z-50 pl-5 flex flex-col gap-10 absolute w-full top-[25%]'>

          <motion.div 
          variants={animationVariants}
          initial="invisible"
          animate="visible"
          className='flex flex-col gap-4 z-50 w-[96%]'>

          <div className='flex justify-between items-center'>
           <div className="justify-start text-white text-4xl font-normal font-gilroy-bold">Are more<br /> effective leaders.</div>
           <div className="justify-start text-white text-2xl font-normal font-gilroy-regular mt-10">1</div>
          </div>
          <div className="h-0 outline outline-2 outline-white w-[99%]"></div>

          </motion.div>

          <motion.div 
          variants={animationVariants}
          initial="invisible"
          animate="visible"
          className='flex flex-col gap-4 z-50 w-[96%]'>

          <div className='flex justify-between items-center'>
           <div className="justify-start text-white text-4xl font-normal font-gilroy-bold">Perform better <br /> at work.</div>
           <div className="justify-start text-white text-2xl font-normal font-gilroy-regular mt-10">2</div>
          </div>
          <div className="h-0 outline outline-2 outline-white w-[99%]"></div>

          </motion.div>


          <motion.div 
          variants={animationVariants}
          initial="invisible"
          animate="visible"
          className='flex flex-col gap-4 z-50 w-[96%]'>

          <div className='flex justify-between items-center'>
           <div className="justify-start text-white text-4xl font-normal font-gilroy-bold">Are more <br /> confident</div>
           <div className="justify-start text-white text-2xl font-normal font-gilroy-regular mt-10">3</div>
          </div>
          <div className="h-0 outline outline-2 outline-white w-[99%]"></div>

          </motion.div>

        </div>

    </section>
  );
};

export default BenefitsSection;