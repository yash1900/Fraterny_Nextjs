'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSectionRevealAnimation } from '../../home/hooks/useSectionRevealAnimation';
import ResponsiveImage from '@/components/ui/ResponsiveImage';

// Peer profiles data
const peers = [
  { 
    title: "The Strategists", 
    dynamicKey: "tribe-visionary",
    description: "Think Speed, Structure, Scale",
    imageSrc: {
      mobile: "/images/tribe/visionary-mobile.webp",
      desktop: "/images/tribe/visionary-desktop.webp"
    }
  },
  { 
    title: "The Hidden Thinkers", 
    dynamicKey: "tribe-hustler",
    description: "Move with Evidence",
    imageSrc: {
      mobile: "/images/tribe/hustler-mobile.webp",
      desktop: "/images/tribe/hustler-desktop.webp"
    }
  },
  { 
    title: "The Restless Minds", 
    dynamicKey: "tribe-workaholic",
    description: "Overflowing with Ideas",
    imageSrc: {
      mobile: "/images/tribe/workaholic-mobile.webp",
      desktop: "/images/tribe/workaholic-desktop.webp"
    }
  },
  { 
    title: "The Soul-Aligned", 
    dynamicKey: "tribe-experienced",
    description: "Meaning-driven, Vibe-tuning, Purpose-focused",
    imageSrc: {
      mobile: "/images/tribe/experienced-mobile.webp",
      desktop: "/images/tribe/experienced-desktop.webp"
    }
  },
  { 
    title: "The Healing Hearts", 
    dynamicKey: "tribe-optimist",
    description: "Protect Calm and Safety",
    imageSrc: {
      mobile: "/images/tribe/optimist-mobile.webp",
      desktop: "/images/tribe/optimist-desktop.webp"
    }
  },
  { 
    title: "The Free Spirits", 
    dynamicKey: "tribe-guardian",
    description: "Creative, curious, and nonlinear.",
    imageSrc: {
      mobile: "/images/tribe/guardian-mobile.webp",
      desktop: "/images/tribe/guardian-desktop.webp"
    }
  }
];

const journeySteps = [
    {
      step: "1",
      title: "Start with Quest:",
      description: "Begin your journey by taking the free Quest analysis to gain clarity on your internal reality.",
      isButton: true,
      link: "/quest"
    },
    {
      step: "2",
      title: "Apply for Fratvilla:",
      description: "Use your Quest results to apply for the Fratvilla experience, where you'll be surrounded by a curated group of peers who will challenge and support you.",
      isButton: true,
      link: "/fratvilla"
    },
    {
      step: "3",
      title: "Reshape Yourself",
      description: "Through the combined power of Quest and Fratvilla, you'll gain the tools, mindset, and network to reshape both your internal and external realities, unlocking your full potential and becoming the best version of yourself.",
      isButton: false,
      link: ""
    }
  ];

const timelineEvents = [
  { time: "11:30 AM", title: "Brainstorming Breakfasts", description: "Start your day with engaging discussions" },
  { time: "1:00 PM", title: "Team Activity Afternoons", description: "Collaborative sessions and workshops" },
  { time: "6:00 PM", title: "Simulation Sunsets", description: "Apply learnings in practical scenarios" },
  { time: "12:00 AM", title: "Midnight Momentum", description: "Deep conversations and connections" },
];

const TribeSection = () => {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  // Simulate progressive image loading
  useEffect(() => {
    // Start loading images progressively after component mounts
    const loadImage = (index: number) => {
      setTimeout(() => {
        setLoadedImages(prev => new Set(prev).add(index));
      }, 800 + (index * 400)); // First image at 800ms, then every 400ms
    };

    // Load all images progressively
    peers.forEach((_, index) => {
      loadImage(index);
    });
  }, []);

  // Journey section title animation
  const journeyTitleAnimation = useSectionRevealAnimation({
    variant: 'fade-up',
    once: true,
    threshold: { desktop: 0.3, mobile: 0.2 },
    duration: 0.7
  });

  // Journey steps animation
  const journeyStepsAnimation = useSectionRevealAnimation({
    variant: 'slide-up',
    once: true,
    threshold: { desktop: 0.1, mobile: 0.05 },
    duration: 0.6,
    staggerChildren: 0.15,
    delayChildren: 0.2
  });

  // Timeline title animation
  const timelineTitleAnimation = useSectionRevealAnimation({
    variant: 'fade-up',
    once: true,
    threshold: { desktop: 0.3, mobile: 0.2 },
    duration: 0.7
  });

  // Timeline animation
  const timelineAnimation = useSectionRevealAnimation({
    variant: 'slide-up',
    once: true,
    threshold: { desktop: 0.1, mobile: 0.05 },
    duration: 0.6,
    staggerChildren: 0.15,
    delayChildren: 0.2
  });

  // Tribe section title animation
  const tribeTitleAnimation = useSectionRevealAnimation({
    variant: 'fade-up',
    once: true,
    threshold: { desktop: 0.3, mobile: 0.2 },
    duration: 0.7
  });

  // Tribe profiles animation
  const profilesAnimation = useSectionRevealAnimation({
    variant: 'scale-in',
    once: true,
    threshold: { desktop: 0.2, mobile: 0.15 },
    duration: 0.6,
    staggerChildren: 0.15,
    delayChildren: 0.2
  });

  // Tagline animation
  const taglineAnimation = useSectionRevealAnimation({
    variant: 'fade-up',
    once: true,
    threshold: { desktop: 0.6, mobile: 0.5 },
    duration: 0.8
  });

  // Card hover variants
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

  // Profile card hover variants
  const profileCardVariants = {
    hidden: { 
      scale: 0.8,
      opacity: 0,
      y: 30
    },
    visible: { 
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 120,
        damping: 15
      }
    },
    hover: {
      y: -10,
      scale: 1.05,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 25
      }
    }
  };

  return (
    <section className="">
      {/* Journey Section */}
      <section className="bg-neutral-100 p-5">
        <section className="py-2 md:py-8">
          <div className="container mx-auto">
            <div className="max-w-7xl mx-auto text-left">
              {/* Journey Title */}
              <motion.div
                ref={journeyTitleAnimation.ref}
                variants={journeyTitleAnimation.parentVariants}
                initial="hidden"
                animate={journeyTitleAnimation.controls}
              >
                <motion.h2 
                  className="text-3xl sm:text-3xl md:text-4xl font-gilroy-semibold mb-3 sm:mb-4"
                  variants={journeyTitleAnimation.childVariants}
                >
                  The Integrated Fraterny Journey
                </motion.h2>
              </motion.div>

              {/* Journey Step Boxes */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
                ref={journeyStepsAnimation.ref}
                variants={journeyStepsAnimation.parentVariants}
                initial="hidden"
                animate={journeyStepsAnimation.controls}
              >
                {journeySteps.map((step, index) => (
                  <motion.div
                    key={index}
                    variants={journeyStepsAnimation.childVariants}
                  >
                    <motion.div 
                      className="bg-neutral-100 h-full relative backdrop-blur-md rounded-xl p-6 md:p-8 text-left shadow-lg hover:shadow-xl transition-all duration-500"
                      variants={cardVariants}
                      whileHover="hover"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <h3 
                          className="text-xl md:text-xl lg:text-2xl font-gilroy-bold text-neutral-700 tracking-tighter"
                        >
                          {step.title}
                        </h3>
                      </div>
                      <p 
                          className="text-[16px] font-gilroy-regular md:text-xl lg:text-xl text-black mt-4 mb-8"
                        >
                          {step.description}
                        </p>
                      <div className='lg:absolute lg:bottom-6 md:absolute md:bottom-6'>
                        {step.isButton && (
                          <button onClick={() => window.location.href = step.link} className="text-2xl mt-4 px-4 py-2 bg-neutral-500 font-gilroy-bold tracking-tighter text-white rounded-md shadow-md cursor-pointer transition-all duration-300">
                            Get Started
                          </button>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>
      </section>

      {/* Timeline Section */}
      <section className="bg-white p-5">
        <section className="py-4 md:py-8">
          <div className="container mx-auto">
            <div className="max-w-7xl mx-auto text-left">
              {/* Timeline Title */}
              <motion.div
                ref={timelineTitleAnimation.ref}
                variants={timelineTitleAnimation.parentVariants}
                initial="hidden"
                animate={timelineTitleAnimation.controls}
              >
                <motion.h2 
                  className="text-3xl sm:text-3xl md:text-4xl font-gilroy-semibold mb-3 sm:mb-4"
                  variants={timelineTitleAnimation.childVariants}
                >
                  A Day at Fratvilla
                </motion.h2>
              </motion.div>

              {/* Timeline Boxes */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                ref={timelineAnimation.ref}
                variants={timelineAnimation.parentVariants}
                initial="hidden"
                animate={timelineAnimation.controls}
              >
                {timelineEvents.map((event, index) => (
                  <motion.div
                    key={index}
                    variants={timelineAnimation.childVariants}
                  >
                    <motion.div 
                      className="bg-white backdrop-blur-md rounded-xl p-6 md:p-8 text-left border border-cyan-700/20 shadow-lg hover:shadow-xl transition-all duration-500"
                      variants={cardVariants}
                      whileHover="hover"
                    >
                      <div className="mb-4">
                        <span className="text-3xl md:text-4xl font-gilroy-bold text-black">
                          {event.time}
                        </span>
                      </div>
                      <h3 
                        className="text-xl md:text-2xl font-gilroy-bold text-neutral-700 italic h-20 mb-3"
                      >
                        {event.title}
                      </h3>
                      <p 
                        className="text-[16px] font-gilroy-regular md:text-xl lg:text-xl text-black mt-4 mb-8"
                      >
                        {event.description}
                      </p>
                    </motion.div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>
      </section>
      
      {/* Tribe Section */}
      <section className="py-4 md:py-8 bg-neutral-100">
        <div className="container max-w-7xl mx-auto px-6">
          
          {/* Section Title with scroll animation */}
          <motion.div
            ref={tribeTitleAnimation.ref}
            variants={tribeTitleAnimation.parentVariants}
            initial="hidden"
            animate={tribeTitleAnimation.controls}
          >
            <motion.h2 
              className="text-3xl sm:text-3xl md:text-4xl font-gilroy-semibold mb-3 sm:mb-4"
              variants={tribeTitleAnimation.childVariants}
            >
              Play Your Ideal Archetype
            </motion.h2>
          </motion.div>
          
          {/* Tribe Profiles Grid with enhanced animations */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 mb-12"
            ref={profilesAnimation.ref}
            variants={profilesAnimation.parentVariants}
            initial="hidden"
            animate={profilesAnimation.controls}
          >
            {peers.map((peer, index) => (
              <motion.div
                key={index}
                variants={profilesAnimation.childVariants}
              >
                <motion.div 
                  className="text-center group cursor-pointer"
                  variants={profileCardVariants}
                  whileHover="hover"
                >
                  {/* Circular profile image with loading state */}
                  <motion.div 
                    className="w-28 h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 mx-auto mb-4 bg-white/10 rounded-full overflow-hidden relative border-2 border-white/20"
                  >
                    {/* Loading State */}
                    {!loadedImages.has(index) && (
                      <motion.div 
                        className="absolute inset-0 bg-cyan-700/30 flex items-center justify-center"
                      >
                        {/* Animated spinner */}
                        <div className="relative">
                          <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                          
                          {/* Subtle background pulse */}
                          <motion.div 
                            className="absolute inset-0 w-8 h-8 border-4 border-cyan-300/20 rounded-full"
                          />
                        </div>
                        
                        {/* Loading dots pattern */}
                        <div className="absolute inset-0 opacity-5">
                          <div 
                            className="w-full h-full"
                            style={{
                              backgroundImage: `radial-gradient(circle at 30% 70%, rgba(255, 255, 255, 0.2) 2px, transparent 2px)`,
                              backgroundSize: '20px 20px',
                              animation: `float ${1.5 + (index % 3) * 0.3}s ease-in-out infinite alternate`
                            }}
                          />
                        </div>
                      </motion.div>
                    )}
                    
                    {/* Image - fades in when loaded */}
                    <motion.div
                      className={`transition-opacity duration-500 ${
                        loadedImages.has(index) ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <ResponsiveImage 
                        dynamicKey={peer.dynamicKey} 
                        alt={peer.title}
                        className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-300 group-hover:scale-110"
                        loading={index < 3 ? "eager" : "lazy"}
                      />
                    </motion.div>
                    
                    {/* Subtle overlay on hover */}
                    <motion.div
                      className="absolute inset-0 bg-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 0.1 }}
                    />
                  </motion.div>
                  
                  {/* Title with staggered reveal */}
                  <motion.h3 
                    className="text-lg md:text-xl lg:text-2xl text-black mb-2 font-gilroy-bold"
                  >
                    {peer.title}
                  </motion.h3>
                  
                  {/* Description with final reveal */}
                  <motion.p 
                    className="text-gray-700 text-xs md:text-sm lg:text-base font-gilroy-regular"
                  >
                    {peer.description}
                  </motion.p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
          
          {/* Tagline with scroll animation */}
          <motion.div
            ref={taglineAnimation.ref}
            variants={taglineAnimation.parentVariants}
            initial="hidden"
            animate={taglineAnimation.controls}
          >
            <motion.p 
              className="text-center text-lg md:text-xl text-gray-100 font-['Gilroy-Medium']"
              variants={taglineAnimation.childVariants}
            >
              Divided by Masks, United by Fraterny
            </motion.p>
          </motion.div>
        </div>
      </section>
    </section>
  );
};

export default TribeSection;