'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useSectionRevealAnimation } from '../../home/hooks/useSectionRevealAnimation';

interface BlogHeroProps {
  totalPosts?: number;
}

const BlogHero: React.FC<BlogHeroProps> = ({ totalPosts }) => {
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0.95, 0.7]);

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
    <section className="pt-32 pb-16 bg-navy text-white relative overflow-hidden">
      <motion.div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ 
          y: backgroundY,
          backgroundImage: "url('/blog.webp')"
        }}
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2.3, ease: "easeOut" }}
      />
      
      <motion.div 
        className="absolute inset-0"
        style={{ 
          opacity: overlayOpacity,
          background: `linear-gradient(to right, 
            rgba(10, 26, 47, 0.95) 100%,
            rgba(10, 26, 47, 0.8) 50%,
            rgba(10, 26, 47, 0.6) 0%
          )`
        }}
      />
      
      <div className="px-6 relative z-10">
        <div className="max-w-3xl">
          
          <motion.div
            ref={titleAnimation.ref}
            variants={titleAnimation.parentVariants}
            initial="hidden"
            animate={titleAnimation.controls}
          >
            <motion.h1 
              className="text-3xl md:text-5xl lg:text-7xl font-gilroy-regular mb-4 text-white"
              variants={titleAnimation.childVariants}
            >
              Our Blog
            </motion.h1>
          </motion.div>

          <motion.div
            ref={subtitleAnimation.ref}
            variants={subtitleAnimation.parentVariants}
            initial="hidden"
            animate={subtitleAnimation.controls}
          >
            <motion.p 
              className="text-lg md:text-xl lg:text-2xl font-gilroy-medium text-neutral-300"
              variants={subtitleAnimation.childVariants}
            >
              <span className='text-white font-semibold'>Insights, stories</span>, and <span className='text-white font-semibold'>perspectives</span> from our community
            </motion.p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BlogHero;
