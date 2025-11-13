'use client';

import { motion, useAnimationControls } from 'framer-motion';
import { useSectionRevealAnimation } from './hooks/useSectionRevealAnimation';
import { useEffect, useRef } from 'react';

const NavalQuoteSection = () => {
  // Quote section animations
  const quoteAnimation = useSectionRevealAnimation({
    variant: 'fade-up',
    once: false,
    duration: 0.8,
    staggerChildren: 0.4
  });

  // Supporting text animation
  const supportingTextAnimation = useSectionRevealAnimation({
    variant: 'fade-left',
    once: false,
    duration: 0.6,
    delayChildren: 0.2
  });

  // Statistics animation
  const statsAnimation = useSectionRevealAnimation({
    variant: 'scale-in',
    once: false,
    duration: 0.6,
    staggerChildren: 0.3,
    delayChildren: 0.3
  });

  // Number counting animation
  const useNumberCounter = (targetNumber: number, isInView: boolean) => {
    const controls = useAnimationControls();
    const countRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (isInView && countRef.current) {
        let startTime: number;
        const duration = 1500; // 1.5 seconds

        const animateCount = (timestamp: number) => {
          if (!startTime) startTime = timestamp;
          const progress = Math.min((timestamp - startTime) / duration, 1);
          
          // Easing function for smooth counting
          const easeOutQuart = 1 - Math.pow(1 - progress, 4);
          const currentNumber = Math.round(easeOutQuart * targetNumber);
          
          if (countRef.current) {
            countRef.current.textContent = `${currentNumber}%`;
          }

          if (progress < 1) {
            requestAnimationFrame(animateCount);
          }
        };

        requestAnimationFrame(animateCount);
      }
    }, [isInView, targetNumber]);

    return countRef;
  };

  const count83Ref = useNumberCounter(83, statsAnimation.isInView);
  const count49Ref = useNumberCounter(49, statsAnimation.isInView);

  // Card hover variants
  const cardVariants = {
    hidden: { 
      scale: 0.8,
      opacity: 0,
      y: 40
    },
    visible: { 
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    },
    hover: {
      scale: 1.02,
      y: -5,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 25
      }
    }
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Quote Section with scroll animation */}
          <motion.div 
            className="space-y-2"
            ref={quoteAnimation.ref}
            variants={quoteAnimation.parentVariants}
            initial="hidden"
            animate={quoteAnimation.controls}
          >
            <motion.h2 
              className="text-left text-4xl md:text-5xl lg:text-6xl font-playfair text-navy"
              variants={quoteAnimation.childVariants}
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
            >
              "The closer you want to get to me, the better your values have to be."
            </motion.h2>

            <motion.p 
              className="text-left text-xl md:text-2xl text-gray-600 font-playfair italic"
              variants={quoteAnimation.childVariants}
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 200 }}
            >
              ~ Naval Ravikant
            </motion.p>
          </motion.div>
          
          {/* Supporting Text with border accent */}
          <motion.div
            ref={supportingTextAnimation.ref}
            variants={supportingTextAnimation.parentVariants}
            initial="hidden"
            animate={supportingTextAnimation.controls}
          >
            <motion.p 
              className="text-left md:text-2xl text-gray-600 border-l-4 border-terracotta pl-6 text-xl"
              variants={supportingTextAnimation.childVariants}
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
            >
              Exclusivity ensures depth. No crowds, no noise – just you, your new friends, and a crazy f-ing experience.
            </motion.p>
          </motion.div>
          
          {/* Statistics Grid with enhanced animations */}
          <motion.div 
            className="grid md:grid-cols-2 gap-8 bg-gradient-to-br from-navy/5 to-navy/10 rounded-2xl p-8"
            ref={statsAnimation.ref}
            variants={statsAnimation.parentVariants}
            initial="hidden"
            animate={statsAnimation.controls}
          >
            {/* First Statistic */}
            <motion.div 
              className="space-y-4 text-left group cursor-pointer"
              variants={cardVariants}
              whileHover="hover"
            >
              <motion.div 
                ref={count83Ref}
                className="text-5xl md:text-7xl font-bold text-navy"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ 
                  scale: statsAnimation.isInView ? 1 : 0.5, 
                  opacity: statsAnimation.isInView ? 1 : 0 
                }}
                transition={{ 
                  delay: 0.2,
                  type: "spring",
                  stiffness: 200,
                  damping: 15
                }}
              >
                0%
              </motion.div>
              
              <motion.p 
                className="text-lg md:text-xl text-gray-600 text-left"
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: statsAnimation.isInView ? 1 : 0,
                  y: statsAnimation.isInView ? 0 : 20
                }}
                transition={{ delay: 0.8, duration: 0.5 }}
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
              >
                individuals report improved performance in collaborative work when their team is more likeminded.
              </motion.p>
            </motion.div>

            {/* Second Statistic */}
            <motion.div 
              className="space-y-4 text-left group cursor-pointer"
              variants={cardVariants}
              whileHover="hover"
            >
              <motion.div 
                ref={count49Ref}
                className="text-5xl md:text-7xl font-bold text-navy"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ 
                  scale: statsAnimation.isInView ? 1 : 0.5, 
                  opacity: statsAnimation.isInView ? 1 : 0 
                }}
                transition={{ 
                  delay: 0.5,
                  type: "spring",
                  stiffness: 200,
                  damping: 15
                }}
              >
                0%
              </motion.div>
              
              <motion.p 
                className="text-lg md:text-xl text-gray-600 text-left"
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: statsAnimation.isInView ? 1 : 0,
                  y: statsAnimation.isInView ? 0 : 20
                }}
                transition={{ delay: 1.1, duration: 0.5 }}
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
              >
                potential achievers are deterred from innovative ideas and passionate ventures due to their fear of criticism and societal pressure.
              </motion.p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default NavalQuoteSection;