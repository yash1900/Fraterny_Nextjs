'use client';


import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useSectionRevealAnimation } from '../../home/hooks/useSectionRevealAnimation';


const HeroSection = () => {
  // Scroll-based parallax effects
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  // Animation hooks
  const titleAnimation = useSectionRevealAnimation({
    variant: 'slide-right',
    once: true,
    threshold: { desktop: 0.3, mobile: 0.2 },
    duration: 0.8,
    mobile: { variant: 'fade-up', duration: 0.6 }
  });

  const subtitleAnimation = useSectionRevealAnimation({
    variant: 'fade-right',
    once: true,
    threshold: { desktop: 0.4, mobile: 0.3 },
    delayChildren: 0.2,
    duration: 0.6
  });

  const ctaAnimation = useSectionRevealAnimation({
    variant: 'fade-up',
    once: true,
    threshold: { desktop: 0.6, mobile: 0.5 },
    delayChildren: 0.3,
    duration: 0.8
  });

  return (
    <section className="pt-32 pb-16 text-white relative overflow-hidden">
      
      {/* Background Image Layer */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ y: backgroundY }}
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2.3, ease: "easeOut" }}
      >
        <picture>
          <source
            media="(max-width: 640px)"
            srcSet="/exp-mobile.webp"
            type="image/webp"
          />
          <img 
            src="/exp-desktop.webp" 
            alt="Luxury villa experience setting"
            className="h-full w-full object-cover"
            loading="eager"
          />
        </picture>
      </motion.div>
      

      {/* Hero Content */}
      <div className="px-6 relative z-10">
        <div className="">
          
          {/* Title with scroll-triggered animation */}
          <motion.div
            ref={titleAnimation.ref}
            variants={titleAnimation.parentVariants}
            initial="hidden"
            animate={titleAnimation.controls}
          >
            <motion.h1 
              className="text-3xl md:text-5xl lg:text-7xl font-gilroy-regular mb-4"
              variants={titleAnimation.childVariants}
            >
              <motion.span
                variants={titleAnimation.childVariants}
               
              >
                Fratvilla by Fraterny: The Journey Outward
              </motion.span>
            </motion.h1>
          
            <motion.h1 
              className="text-lg md:text-xl lg:text-2xl font-gilroy-medium text-neutral-300"
              variants={titleAnimation.childVariants}
            >
              <motion.span
                variants={titleAnimation.childVariants}
               
              >
                Condensing lifelong{' '}
                <span className="">
                  memories
                </span>
                ,{' '}
                <span className="">
                  lessons
                </span>
                , and{' '}
                <span className="">
                  friendships
                </span>{' '}
                in a week.
              </motion.span>
            </motion.h1>
          </motion.div>

          {/* Subtitle with separate scroll trigger */}
          <motion.div
            ref={subtitleAnimation.ref}
            variants={subtitleAnimation.parentVariants}
            initial="hidden"
            animate={subtitleAnimation.controls}
          >
            <motion.p 
              className="text-sm md:text-base lg:text-lg font-gilroy-medium text-neutral-300"
              variants={subtitleAnimation.childVariants}
            >
              20 people. 7 days. 1 life-changing experience
            </motion.p>
          </motion.div>
          
          {/* CTA Link with fade-up animation */}
          {/* <motion.div
            ref={ctaAnimation.ref}
            variants={ctaAnimation.parentVariants}
            initial="hidden"
            animate={ctaAnimation.controls}
            className="text-center sm:text-left"
          >
            <motion.div
              variants={ctaAnimation.childVariants}
            >
              <a 
                href="/quest"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm italic underline hover:text-opacity-80 transition-colors"
              >
                See if you fit →
              </a>
            </motion.div>
          </motion.div> */}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;