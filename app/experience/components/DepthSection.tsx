'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code, Brain, BookOpen, FileCheck, Users, Heart, ChefHat, Users2 } from 'lucide-react';
import ResponsiveImage from '@/components/ui/ResponsiveImage';
import { useIsMobile } from '@/app/admin/hooks/use-mobile';


const useSectionRevealAnimation = (config: any) => {
  const ref = React.useRef(null);
  const controls = 'visible';
  const isInView = true;
  
  const parentVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: config.staggerChildren || 0.1 } }
  };
  
  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: config.duration || 0.6 } }
  };
  
  return { ref, controls, parentVariants, childVariants, isInView };
};

const depthFeatures = [
  { 
    icon: <Code className="w-6 h-6 md:w-7 md:h-7" />, 
    title: "Quest Entry", 
    description: "Begin with Quest by Fraterny. Your profile casts you into a tailored archetype for the week.",
    dynamicKey: "depth-house-code",
    imageSrc: {
      mobile: "/images/depth/house-code-mobile.webp",
      desktop: "/images/depth/house-code-desktop.webp"
    },
    imageAlt: "Entrepreneurs discussing house rules in a premium workspace"
  },
  { 
    icon: <Brain className="w-6 h-6 md:w-7 md:h-7" />, 
    title: "Ingrained House Code", 
    description: "Psychology-backed house rules to boost engagement, clarity of thought and productivity",
    dynamicKey: "depth-startup",
    imageSrc: {
      mobile: "/images/depth/startup-mobile.webp", 
      desktop: "/images/depth/startup-desktop.webp"
    },
    imageAlt: "Team engaging in startup simulation exercises"
  },
  { 
    icon: <BookOpen className="w-6 h-6 md:w-7 md:h-7" />, 
    title: "Archetype Role-Play", 
    description: "Embody your assigned character in real situations, improv activities, debates, poker, parties and live it fully.",
    dynamicKey: "depth-learning",
    imageSrc: {
      mobile: "/images/depth/learning-mobile.webp",
      desktop: "/images/depth/learning-desktop.webp"
    },
    imageAlt: "Knowledge sharing session among entrepreneurs"
  },
  { 
    icon: <FileCheck className="w-6 h-6 md:w-7 md:h-7" />, 
    title: "Signature Nights", 
    description: "Sunsets, deep talks, challenges and parties - making memories that doubles social-skill practice.",
    dynamicKey: "depth-frameworks",
    imageSrc: {
      mobile: "/images/depth/frameworks-mobile.webp",
      desktop: "/images/depth/frameworks-desktop.webp"
    },
    imageAlt: "Organized workspace with growth framework materials"
  },
  { 
    icon: <Users className="w-6 h-6 md:w-7 md:h-7" />, 
    title: "Group Think", 
    description: "Collaborative thinking and team activities to broaden your mindset",
    dynamicKey: "depth-group-think",
    imageSrc: {
      mobile: "/images/depth/group-think-mobile.webp",
      desktop: "/images/depth/group-think-desktop.webp"
    },
    imageAlt: "Collaborative brainstorming session in progress"
  },
  { 
    icon: <Heart className="w-6 h-6 md:w-7 md:h-7" />, 
    title: "Squad Dynamics", 
    description: "Groups engineered from Quest results to maximize bonding, chemistry and perspective shifts.",
    dynamicKey: "depth-memories",
    imageSrc: {
      mobile: "/images/depth/memories-mobile.webp",
      desktop: "/images/depth/memories-desktop.webp"
    },
    imageAlt: "Participants sharing meaningful moments together"
  },
  { 
    icon: <ChefHat className="w-6 h-6 md:w-7 md:h-7" />, 
    title: "Great Food, Good Coffee and more", 
    description: "Caffeine is my fuel for clear thinking.",
    dynamicKey: "depth-food",
    imageSrc: {
      mobile: "/images/depth/food-mobile.webp",
      desktop: "/images/depth/food-desktop.webp"
    },
    imageAlt: "Premium dining experience with gourmet food"
  },
  { 
    icon: <Users2 className="w-6 h-6 md:w-7 md:h-7" />, 
    title: "Post Program Community", 
    description: "The villa ends; the tribe continues—alumni circles, challenges and collabs by matching archetypes.",
    dynamicKey: "depth-community",
    imageSrc: {
      mobile: "/images/depth/community-mobile.webp",
      desktop: "/images/depth/community-desktop.webp"
    },
    imageAlt: "Alumni networking and continued community building"
  },
  { 
    icon: <Brain className="w-6 h-6 md:w-7 md:h-7" />, 
    title: "Life Skills", 
    description: "Critical Thinking, Effective Communication and Empathy. Everyone has principles, no one offers practice",
    dynamicKey: "depth-soft-skills",
    imageSrc: {
      mobile: "/images/depth/soft-skills-mobile.webp",
      desktop: "/images/depth/soft-skills-desktop.webp"
    },
    imageAlt: "Soft skills workshop in an elegant setting"
  },
];

const DepthSection = () => {
  const isMobile = useIsMobile();
  const [loadedImages, setLoadedImages] = useState(new Set());

  // Progressive image loading for mobile view
  useEffect(() => {
    if (isMobile) {
      const loadImage = (index: number) => {
        setTimeout(() => {
          setLoadedImages(prev => new Set(prev).add(index));
        }, 600 + (index * 300));
      };

      depthFeatures.forEach((_, index) => {
        loadImage(index);
      });
    }
  }, [isMobile]);

  // Section title animation
  const titleAnimation = useSectionRevealAnimation({
    variant: 'fade-up' as const,
    once: true,
    threshold: { desktop: 0.3, mobile: 0.2 },
    duration: 0.7
  });

  // Desktop grid animation
  const desktopGridAnimation = useSectionRevealAnimation({
    variant: 'slide-up' as const,
    once: true,
    threshold: { desktop: 0.2, mobile: 0.15 },
    duration: 0.6,
    staggerChildren: 0.12,
    delayChildren: 0.2
  });

  // Mobile cards animation
  const mobileCardsAnimation = useSectionRevealAnimation({
    variant: 'fade-up' as const,
    once: true,
    threshold: { desktop: 0.2, mobile: 0.1 },
    duration: 0.5,
    staggerChildren: 0.2
  });

  // Feature card variants
  const featureCardVariants = {
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

  // Icon animation variants
  const iconVariants = {
    hidden: { 
      scale: 0,
      rotate: -90,
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

  return (
    <section className={`${isMobile ? 'pt-6 pb-16' : 'py-4 md:py-8'} bg-white`}>
      <div className=" max-w-7xl mx-auto px-4">
        
        {/* Section Title */}
        <motion.div
          ref={titleAnimation.ref}
          variants={titleAnimation.parentVariants}
          initial="hidden"
          animate={titleAnimation.controls}
        >
          <motion.h2 
            className="text-3xl sm:text-3xl md:text-4xl font-gilroy-semibold mb-3 sm:mb-4"
            variants={titleAnimation.childVariants}
          >
            Designed for Depth
          </motion.h2>
        </motion.div>
        
        {isMobile ? (
          /* MOBILE LAYOUT: Alternating cards and images */
          <motion.div 
            className="space-y-6 px-4"
            ref={mobileCardsAnimation.ref}
            variants={mobileCardsAnimation.parentVariants}
            initial="hidden"
            animate={mobileCardsAnimation.controls}
          >
            {depthFeatures.map((feature, index) => (
              <React.Fragment key={index}>
                {/* Feature Card */}
                <motion.div 
                  className="flex flex-col items-start text-center bg-white backdrop-blur-md rounded-xl p-6 md:p-8 border border-cyan-700/20 shadow-lg hover:shadow-xl transition-all duration-500"
                  variants={featureCardVariants}
                  whileHover="hover"
                >
                  {/* Icon with animation */}
                  <motion.div 
                    className="bg-black p-4 rounded-full mb-4 group-hover:bg-cyan-400/30 transition-colors"
                    variants={iconVariants}
                    initial="hidden"
                    animate={mobileCardsAnimation.isInView ? "visible" : "hidden"}
                  >
                    <div className="text-white text-left">{feature.icon}</div>
                  </motion.div>
                  
                  {/* Text content */}
                  <motion.h3 
                    className="text-xl md:text-2xl lg:text-3xl text-black mb-3 font-gilroy-bold"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: mobileCardsAnimation.isInView ? 1 : 0,
                      y: mobileCardsAnimation.isInView ? 0 : 20
                    }}
                    transition={{ 
                      delay: 0.3 + (index * 0.1),
                      duration: 0.5
                    }}
                  >
                    {feature.title}
                  </motion.h3>
                  
                  <motion.p 
                    className="text-lg text-left font-gilroy-regular md:text-xl lg:text-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: mobileCardsAnimation.isInView ? 1 : 0,
                      y: mobileCardsAnimation.isInView ? 0 : 20
                    }}
                    transition={{ 
                      delay: 0.4 + (index * 0.1),
                      duration: 0.5
                    }}
                  >
                    {feature.description}
                  </motion.p>
                </motion.div>
                
                {/* Feature Image with loading state */}
                <motion.div 
                  className="aspect-[16/9] w-full overflow-hidden rounded-xl shadow-xl relative border border-white/20"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ 
                    opacity: mobileCardsAnimation.isInView ? 1 : 0,
                    x: mobileCardsAnimation.isInView ? 0 : -30
                  }}
                  transition={{ 
                    delay: 0.5 + (index * 0.1),
                    duration: 0.6
                  }}
                >
                  {/* Loading state for mobile images */}
                  {!loadedImages.has(index) && (
                    <motion.div 
                      className="absolute inset-0 bg-cyan-700/30 flex items-center justify-center"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="relative">
                        <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <motion.div 
                          className="absolute inset-0 w-8 h-8 border-4 border-cyan-300/20 rounded-full"
                          animate={{ 
                            scale: [1, 1.3, 1],
                            opacity: [0.3, 0.1, 0.3]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Image */}
                  <motion.div
                    className={`transition-opacity duration-500 ${
                      loadedImages.has(index) ? 'opacity-100' : 'opacity-0'
                    }`}
                    initial={{ scale: 1.05 }}
                    animate={{ scale: loadedImages.has(index) ? 1 : 1.05 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    <ResponsiveImage 
                      dynamicKey={feature.dynamicKey}
                      alt={feature.imageAlt}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </motion.div>
                </motion.div>
              </React.Fragment>
            ))}
          </motion.div>
        ) : (
          /* DESKTOP LAYOUT: 3-column grid */
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 "
            ref={desktopGridAnimation.ref}
            variants={desktopGridAnimation.parentVariants}
            initial="hidden"
            animate={desktopGridAnimation.controls}
          >
            {depthFeatures.map((feature, index) => (
              <motion.div 
                key={index} 
                className={`flex flex-col items-start bg-white backdrop-blur-md rounded-xl p-4 md:p-4 text-center border border-neutral-200 shadow-lg hover:shadow-xl transition-all duration-500`}
              >
                {/* Icon with animation */}
                <motion.div 
                  className="bg-black p-4 rounded-full mb-4"
                  initial="hidden"
                  animate={desktopGridAnimation.isInView ? "visible" : "hidden"}
                >
                  <div className="text-white">{feature.icon}</div>
                </motion.div>
                
                {/* Text content */}
                <motion.h3 
                  className={`text-xl md:text-2xl lg:text-3xl font-gilroy-bold text-black text-left sm:h-16 md:h-28 lg:h-12 lg:mb-4 ${index === 6 ? 'lg:mb-24' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: desktopGridAnimation.isInView ? 1 : 0,
                    y: desktopGridAnimation.isInView ? 0 : 20
                  }}
                  transition={{ 
                    delay: 0.3 + (index * 0.05),
                    duration: 0.5
                  }}
                >
                  {feature.title}
                </motion.h3>
                
                <motion.p 
                  className="text-lg font-gilroy-regular md:text-xl lg:text-xl text-left"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: desktopGridAnimation.isInView ? 1 : 0,
                    y: desktopGridAnimation.isInView ? 0 : 20
                  }}
                  transition={{ 
                    delay: 0.4 + (index * 0.05),
                    duration: 0.5
                  }}
                >
                  {feature.description}
                </motion.p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default DepthSection;