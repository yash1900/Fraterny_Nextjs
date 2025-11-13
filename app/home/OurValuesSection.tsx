'use client';

import { motion } from 'framer-motion';
import { useSectionRevealAnimation } from './hooks/useSectionRevealAnimation';

const OurValuesSection = () => {
  // Section header animations
  const headerAnimation = useSectionRevealAnimation({
    variant: 'fade-up' as const,
    once: false,
    duration: 0.7,
    staggerChildren: 0.3
  });

  // Cards grid animation with sophisticated reveals
  const cardsAnimation = useSectionRevealAnimation({
    variant: 'slide-up' as const,
    once: false,
    duration: 0.6,
    staggerChildren: 0.2,
    delayChildren: 0.4
  });

  // CTA button animation
  const ctaAnimation = useSectionRevealAnimation({
    variant: 'fade-up' as const,
    once: false,
    duration: 0.6
  });

  // Card hover animation variants
  const cardVariants = {
    hidden: { 
      y: 60,
      opacity: 0,
      scale: 0.9
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
      y: -12,
      scale: 1.03,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 25
      }
    }
  };

  // Icon container animation variants
  const iconContainerVariants = {
    hover: {
      scale: 1.1,
      rotate: [0, -5, 5, 0],
      transition: {
        scale: { type: "spring" as const, stiffness: 400, damping: 25 },
        rotate: { duration: 0.6, ease: "easeInOut" as const}
      }
    }
  };

  // SVG path drawing animation
  const pathVariants = {
    hidden: {
      pathLength: 0,
      opacity: 0
    },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 1.5, ease: "easeInOut" as const },
        opacity: { duration: 0.3 }
      }
    }
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-6">
        
        {/* Section Header with scroll animations */}
        <motion.div
          ref={headerAnimation.ref}
          variants={headerAnimation.parentVariants}
          initial="hidden"
          animate={headerAnimation.controls}
        >
          <motion.h2 
            className="text-center text-4xl md:text-5xl lg:text-6xl font-playfair text-navy mb-10"
            variants={headerAnimation.childVariants}
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
          >
            What's so Special?
          </motion.h2>
          
          <motion.p 
            className="text-center sm:text-xl text-gray-600 text-base pb-8"
            variants={headerAnimation.childVariants}
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
          >
            Fraterny is built on the belief that{' '}
            <span className="font-extrabold text-black" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>success</span> and{' '}
            <span className="font-extrabold text-black" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>self discovery</span> can be accelerated exponentially with the <span className="font-extrabold text-black" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>right tools</span> and the <span className="font-extrabold text-black" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>right people</span>
          </motion.p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          
          {/* Cards Grid with enhanced animations */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-10"
            ref={cardsAnimation.ref}
            variants={cardsAnimation.parentVariants}
            initial="hidden"
            animate={cardsAnimation.controls}
          >
            
            {/* Edu-Vacation Card */}
            <motion.div
              className="group flex flex-col items-center p-5 hover:bg-gray-50 rounded-lg transition-all duration-300 cursor-pointer"
              variants={cardVariants}
              whileHover="hover"
            >
              <motion.div 
                className="w-16 h-16 rounded-full bg-navy/10 flex items-center justify-center mb-6 group-hover:bg-navy/20 transition-all duration-300"
                variants={iconContainerVariants}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="32" 
                  height="32" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="#0A1A2F" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <motion.path 
                    d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"
                    variants={pathVariants}
                    initial="hidden"
                    animate={cardsAnimation.isInView ? "visible" : "hidden"}
                  />
                  <motion.path 
                    d="M12 7V3"
                    variants={pathVariants}
                    initial="hidden"
                    animate={cardsAnimation.isInView ? "visible" : "hidden"}
                    transition={{ delay: 0.3 }}
                  />
                </svg>
              </motion.div>
              
              <motion.h3 
                className="text-2xl font-medium text-navy mb-4 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: cardsAnimation.isInView ? 1 : 0,
                  y: cardsAnimation.isInView ? 0 : 20
                }}
                transition={{ delay: 0.3, duration: 0.5 }}
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              >
                Edu-Vacation
              </motion.h3>
              
              <motion.p 
                className="text-navy/70 leading-relaxed text-center text-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: cardsAnimation.isInView ? 1 : 0,
                  y: cardsAnimation.isInView ? 0 : 20
                }}
                transition={{ delay: 0.4, duration: 0.5 }}
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
              >
                Looks like a vacation. Feels like a level-up. Ever felt like going on a vacation but not compromise on productivity?
              </motion.p>
            </motion.div>

            {/* Brain Hacking Card */}
            <motion.div
              className="group flex flex-col items-center p-5 hover:bg-gray-50 rounded-lg transition-all duration-300 cursor-pointer"
              variants={cardVariants}
              whileHover="hover"
            >
              <motion.div 
                className="w-16 h-16 rounded-full bg-terracotta/10 flex items-center justify-center mb-6 group-hover:bg-terracotta/20 transition-all duration-300"
                variants={iconContainerVariants}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="32" 
                  height="32" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="#E07A5F" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <motion.path 
                    d="M18 6H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h13l4-3.5L18 6Z"
                    variants={pathVariants}
                    initial="hidden"
                    animate={cardsAnimation.isInView ? "visible" : "hidden"}
                    transition={{ delay: 0.2 }}
                  />
                  <motion.path 
                    d="M12 13v8"
                    variants={pathVariants}
                    initial="hidden"
                    animate={cardsAnimation.isInView ? "visible" : "hidden"}
                    transition={{ delay: 0.5 }}
                  />
                  <motion.path 
                    d="M12 3v3"
                    variants={pathVariants}
                    initial="hidden"
                    animate={cardsAnimation.isInView ? "visible" : "hidden"}
                    transition={{ delay: 0.5 }}
                  />
                </svg>
              </motion.div>
              
              <motion.h3 
                className="text-2xl font-medium text-navy mb-4 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: cardsAnimation.isInView ? 1 : 0,
                  y: cardsAnimation.isInView ? 0 : 20
                }}
                transition={{ delay: 0.5, duration: 0.5 }}
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              >
                Brain Hacking
              </motion.h3>
              
              <motion.p 
                className="text-navy/70 leading-relaxed text-center text-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: cardsAnimation.isInView ? 1 : 0,
                  y: cardsAnimation.isInView ? 0 : 20
                }}
                transition={{ delay: 0.6, duration: 0.5 }}
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
              >
                We curate experiences and activities which ensure critical thinking, insightful interactions and openness
              </motion.p>
            </motion.div>

            {/* Collaboration Card */}
            <motion.div
              className="group flex flex-col items-center p-5 hover:bg-gray-50 rounded-lg transition-all duration-300 cursor-pointer"
              variants={cardVariants}
              whileHover="hover"
            >
              <motion.div 
                className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-all duration-300"
                variants={iconContainerVariants}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="32" 
                  height="32" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="#D4AF37" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <motion.path 
                    d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"
                    variants={pathVariants}
                    initial="hidden"
                    animate={cardsAnimation.isInView ? "visible" : "hidden"}
                    transition={{ delay: 0.4 }}
                  />
                  <motion.path 
                    d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"
                    variants={pathVariants}
                    initial="hidden"
                    animate={cardsAnimation.isInView ? "visible" : "hidden"}
                    transition={{ delay: 0.7 }}
                  />
                </svg>
              </motion.div>
              
              <motion.h3 
                className="text-2xl font-medium text-navy mb-4 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: cardsAnimation.isInView ? 1 : 0,
                  y: cardsAnimation.isInView ? 0 : 20
                }}
                transition={{ delay: 0.7, duration: 0.5 }}
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
              >
                Collaboration
              </motion.h3>
              
              <motion.p 
                className="text-navy/70 leading-relaxed text-center text-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: cardsAnimation.isInView ? 1 : 0,
                  y: cardsAnimation.isInView ? 0 : 20
                }}
                transition={{ delay: 0.8, duration: 0.5 }}
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}
              >
                Legends don't compete. They collaborate. Imagine being stranded on a 10BHK exclusive villa with 19 other ambitious souls like yourself.
              </motion.p>
            </motion.div>
          </motion.div>
        </div>

        {/* <motion.div 
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
              to="https://docs.google.com/forms/d/1TTHQN3gG2ZtC26xlh0lU8HeiMc3qDJhfoU2tOh9qLQM/edit" 
              className="px-6 py-3 bg-terracotta text-white rounded-lg transition-all duration-300 hover:bg-terracotta hover:scale-105 hover:shadow-lg inline-block group"
            >
              <motion.span
                className="flex items-center gap-2"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                Apply Now
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
        </motion.div> */}
      </div>
    </section>
  );
};

export default OurValuesSection;