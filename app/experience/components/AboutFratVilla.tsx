'use client'

import React from 'react';
import { motion } from 'framer-motion';
import useSectionRevealAnimation from '@/app/assessment/hooks/useSectionRevealAnimation';

const features = [
    {
      title: "Creates an Environment:",
      description: "The Fratvilla group is carefully selected based on the harmony, diversity, and thinking depth of their Quest results, ensuring a dynamic and supportive environment for all attendees."
    },
    {
      title: "Instills the Psychology of Success:",
      description: "Through a series of specially designed activities and the application of our \"Fratrules,\" you'll learn to embody the mindset of a high-achiever."
    },
    {
      title: "Fosters Genuine Connection:",
      description: "Fratvilla is designed to maximize personal growth and bonding, creating a powerful network of ambitious individuals who will support you long after the experience is over."
    }
  ];

const AboutFratVilla = () => {

  // First section header animation - for "About FratVilla" title and description
  const headerAnimation = useSectionRevealAnimation({
    variant: 'fade-up',
    once: true,
    duration: 0.7,
    staggerChildren: 0.2
  });

  // Second section header animation - for "What FratVilla Does" title
  const secondHeaderAnimation = useSectionRevealAnimation({
    variant: 'fade-up',
    once: true,
    duration: 0.6
  });

  // Feature cards animation - exactly matching PricingSection
  const featureCardsAnimation = useSectionRevealAnimation({
    variant: 'slide-up',
    once: true,
    duration: 0.6,
    staggerChildren: 0.15,
    delayChildren: 0.2
  });

  // Individual card animation variants - exactly matching FeatureCard from PricingSection
  const cardVariants = {
    hidden: { 
      y: 40,
      opacity: 0,
      scale: 0.95
    },
    visible: { 
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    },
    hover: {
      y: -8,
      scale: 1.02,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 25
      }
    }
  };
    
  return (
    <section className="py-4 bg-white">
      <div className="mx-auto px-6">
        <div className="max-w-7xl mx-auto">

          {/* First Section - About FratVilla */}
          <motion.div
            ref={headerAnimation.ref}
            variants={headerAnimation.parentVariants}
            initial="hidden"
            animate={headerAnimation.controls}
          >
            <motion.h2
              className="text-3xl sm:text-3xl md:text-4xl font-gilroy-semibold mb-3 sm:mb-4"
              variants={headerAnimation.childVariants}
            >
              About FratVilla
            </motion.h2>
            
            <motion.p 
              className="text-lg md:text-xl md:leading-[-10px] lg:text-xl font-gilroy-regular text-left mb-8 text-black"
              variants={headerAnimation.childVariants}
            >
              Fratvilla is our exclusive, hyper-luxurious 6-day experience for 20 ambitious 
              individuals in a secret villa. It's an immersive, real-world application of the 
              principles discovered through Quest, where you'll be surrounded by a curated 
              group of like-minded peers.
            </motion.p>
          </motion.div>

          {/* Second Section - What FratVilla Does */}
          <section className="bg-white rounded-xl max-w-7xl">
            <div className="max-w-7xl mx-auto">
              <div className="text-left">
                {/* Section Title */}
                <motion.div
                  ref={secondHeaderAnimation.ref}
                  variants={secondHeaderAnimation.parentVariants}
                  initial="hidden"
                  animate={secondHeaderAnimation.controls}
                >
                  <motion.h2 
                    className="text-3xl sm:text-3xl md:text-4xl font-gilroy-semibold mb-3 sm:mb-4"
                    variants={secondHeaderAnimation.childVariants}
                  >
                    What FratVilla Does
                  </motion.h2>
                </motion.div>

                {/* Feature Cards with staggered animation */}
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                  ref={featureCardsAnimation.ref}
                  variants={featureCardsAnimation.parentVariants}
                  initial="hidden"
                  animate={featureCardsAnimation.controls}
                >
                  {features.map((feature, index) => (
                    <motion.div
                      key={index}
                      variants={featureCardsAnimation.childVariants}
                      className=''
                    >
                      <motion.div 
                        className="backdrop-blur-md h-full rounded-xl p-6 md:p-8 text-left border border-white/20 shadow-xl hover:bg-white/20 hover:border-white/30 hover:shadow-2xl transition-all duration-300 cursor-pointer"
                        variants={cardVariants}
                        whileHover="hover"
                      >
                        <h3 
                          className="text-xl md:text-xl lg:text-2xl font-gilroy-bold text-neutral-700 tracking-tighter"
                        >
                          {feature.title}
                        </h3>
                        
                        <p 
                          className="text-[16px] font-gilroy-regular md:text-xl lg:text-xl text-black mt-4 mb-8"
                        >
                          {feature.description}
                        </p>
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </section>
  );
};

export default AboutFratVilla;