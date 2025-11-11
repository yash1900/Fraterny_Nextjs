'use client';

import { Send, UserCheck, Users } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useSectionRevealAnimation } from './hooks/useSectionRevealAnimation';

const HowItWorksSection = () => {
  // CUSTOMIZATION: Process Steps
  // Modify this array to change the steps in the process
  // Each step has: title, description, and an icon (from Lucide React)
  const steps = [
    {
      title: "Apply",
      description: "Submit your profile",
      icon: Send
    },
    {
      title: "Screen",
      description: "A brief conversation with a counselor",
      icon: UserCheck
    },
    {
      title: "Join",
      description: "Welcome to the community",
      icon: Users
    }
  ];

  // Section title animation
  const titleAnimation = useSectionRevealAnimation({
    variant: 'fade-up',
    once: false,
    threshold: { desktop: 0.3, mobile: 0.2 },
    duration: 0.7
  });

  // Steps grid animation with sophisticated reveals
  const stepsAnimation = useSectionRevealAnimation({
    variant: 'slide-up',
    once: false,
    threshold: { desktop: 0.2, mobile: 0.15 },
    duration: 0.6,
    staggerChildren: 0.2,
    delayChildren: 0.3
  });

  // CTA button animation
  const ctaAnimation = useSectionRevealAnimation({
    variant: 'fade-up',
    once: false,
    threshold: { desktop: 0.6, mobile: 0.5 },
    duration: 0.6
  });

  // Icon animation variants for individual step icons
  const iconVariants = {
    hidden: { 
      scale: 0,
      rotate: -180,
      opacity: 0
    },
    visible: { 
      scale: 1,
      rotate: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 15,
        delay: 0.2
      }
    }
  };

  // Step card variants
  const stepCardVariants = {
    hidden: { 
      y: 60,
      opacity: 0,
      scale: 0.8
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

  // Connection line variants (for connecting steps)
  const connectionVariants = {
    hidden: { 
      scaleX: 0,
      opacity: 0
    },
    visible: { 
      scaleX: 1,
      opacity: 0.3,
      transition: {
        delay: 0.8,
        duration: 0.8,
        ease: "easeInOut" as const
      }
    }
  };

  return (
    <section className="bg-white mb-20 px-0">
      <div className="container mx-auto px-6">
        
        {/* Section Title with scroll animation */}
        <motion.div
          ref={titleAnimation.ref}
          variants={titleAnimation.parentVariants}
          initial="hidden"
          animate={titleAnimation.controls}
        >
          <motion.h2 
            className="text-center text-4xl md:text-5xl lg:text-6xl font-playfair text-navy mb-16"
            variants={titleAnimation.childVariants}
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
          >
            How to Get an Invite?
          </motion.h2>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          
          {/* Steps Grid with enhanced animations */}
          <motion.div
            className="relative grid md:grid-cols-3 gap-12 lg:gap-16 my-0 mx-0 px-[4px] rounded-none py-[23px]"
            ref={stepsAnimation.ref}
            variants={stepsAnimation.parentVariants}
            initial="hidden"
            animate={stepsAnimation.controls}
          >
            
            {/* Connection lines between steps (desktop only) */}
            <div className="hidden md:block absolute top-10 left-0 right-0 h-px">
              <motion.div 
                className="absolute top-0 left-1/6 right-1/6 h-px bg-navy/20"
                variants={connectionVariants}
                initial="hidden"
                animate={stepsAnimation.isInView ? "visible" : "hidden"}
                style={{ originX: 0 }}
              />
            </div>
            
            {steps.map((Step, index) => (
              <motion.div
                key={index}
                className="text-center relative group cursor-pointer"
                variants={stepCardVariants}
                whileHover="hover"
              >
                {/* Icon container with enhanced animations */}
                <motion.div 
                  className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-full bg-navy text-white relative overflow-hidden"
                  whileHover={{
                    boxShadow: "0 10px 25px rgba(224, 122, 95, 0.3)"
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Background pulse effect */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: [0, 1.2, 0],
                      opacity: [0, 0.3, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.5
                    }}
                  />
                  
                  {/* Icon with micro-animations */}
                  <motion.div
                    variants={iconVariants}
                    initial="hidden"
                    animate={stepsAnimation.isInView ? "visible" : "hidden"}
                  >
                    <Step.icon size={32} />
                  </motion.div>
                </motion.div>

                {/* Step content */}
                <motion.h3 
                  className="text-2xl font-medium text-navy mb-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: stepsAnimation.isInView ? 1 : 0,
                    y: stepsAnimation.isInView ? 0 : 20
                  }}
                  transition={{ 
                    delay: 0.4 + (index * 0.15),
                    duration: 0.5
                  }}
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
                >
                  {Step.title}
                </motion.h3>
                
                <motion.p 
                  className="text-lg text-gray-600"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: stepsAnimation.isInView ? 1 : 0,
                    y: stepsAnimation.isInView ? 0 : 20
                  }}
                  transition={{ 
                    delay: 0.5 + (index * 0.15),
                    duration: 0.5
                  }}
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                >
                  {Step.description}
                </motion.p>

                {/* Decorative arrow (except for last step) */}
                {index < steps.length - 1 && (
                  <motion.div 
                    className="hidden md:block absolute -right-8 top-10 text-navy/30"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ 
                      opacity: stepsAnimation.isInView ? 1 : 0,
                      x: stepsAnimation.isInView ? 0 : -10
                    }}
                    transition={{ 
                      delay: 1 + (index * 0.2),
                      duration: 0.5
                    }}
                  >
                    <svg 
                      width="24" 
                      height="24" 
                      viewBox="0 0 24 24" 
                      fill="currentColor"
                    >
                      <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6-6 6-1.41-1.41z"/>
                    </svg>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
          
          {/* CTA Button with scroll trigger */}
          <motion.div 
            className="flex justify-center mt-16"
            ref={ctaAnimation.ref}
            variants={ctaAnimation.parentVariants}
            initial="hidden"
            animate={ctaAnimation.controls}
          >
            <motion.div
              variants={ctaAnimation.childVariants}
            >
              <Link 
                href="/process" 
                className="px-6 py-3 bg-navy text-white rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg inline-block group"
              >
                <motion.span
                  className="flex items-center gap-2"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
                >
                  Know More
                  <motion.svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="group-hover:translate-x-1 transition-transform"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </motion.svg>
                </motion.span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;