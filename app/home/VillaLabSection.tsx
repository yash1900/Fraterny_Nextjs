'use client';


import { motion } from 'framer-motion';
import { useSectionRevealAnimation } from './hooks/useSectionRevealAnimation';
import { ArrowRight } from 'lucide-react';
import { EnhancedParallaxScroll } from './ui/enhanced-parallax-scroll';

const VillaLabSection = () => {
  // Section header animations
  const headerAnimation = useSectionRevealAnimation({
    variant: 'fade-up',
    once: false,
    threshold: { desktop: 0.3, mobile: 0.2 },
    duration: 0.7,
    staggerChildren: 0.2
  });

  // CTA button animation
  const ctaAnimation = useSectionRevealAnimation({
    variant: 'fade-up',
    once: false,
    threshold: { desktop: 0.6, mobile: 0.5 },
    duration: 0.6
  });

  return (
    <section className="bg-white sm:py-[49px] py-[31px]">
      <div className="container mx-auto px-4 sm:px-6">
        
        {/* Section Header with scroll animations */}
        <motion.div 
          className="mb-8 sm:mb-12"
          ref={headerAnimation.ref}
          variants={headerAnimation.parentVariants}
          initial="hidden"
          animate={headerAnimation.controls}
        >
          <motion.h2 
            className="text-center sm:text-4xl md:text-5xl lg:text-6xl font-playfair text-navy mb-3 sm:mb-4 text-4xl"
            variants={headerAnimation.childVariants}
            style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
          >
            The Villa Lab
          </motion.h2>

          <motion.p 
            className="text-center sm:text-xl text-gray-600 text-base"
            variants={headerAnimation.childVariants}
          >
            <span className="font-extrabold" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>Think</span> hard.{' '}
            <span className="font-extrabold" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>Vibe</span> harder.
          </motion.p>
        </motion.div>

        {/* Enhanced Parallax Gallery */}
        <div className="mb-8 sm:mb-12">
          <EnhancedParallaxScroll className="rounded-xl overflow-hidden shadow-lg border-black-4" />
        </div>

        {/* Instagram Link */}
        <div className="mt-8 sm:mt-12 text-center sm:text-right">
          <a 
            href="https://www.instagram.com/join.fraterny/?hl=en" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center text-navy hover:text-black transition-colors group"
          >
            <span className="mr-2">see more</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        {/* CTA Button with scroll trigger */}
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

export default VillaLabSection;