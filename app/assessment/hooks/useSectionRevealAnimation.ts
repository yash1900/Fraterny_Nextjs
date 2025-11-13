



'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useAnimation, useInView, Variants } from 'framer-motion';

export interface SectionRevealOptions {
  variant?: 'fade-up' | 'fade-down' | 'fade-in' | 'slide-up' | 'slide-down' | 'scale';
  once?: boolean;
  threshold?: number;
  duration?: number;
  staggerChildren?: number;
  delayChildren?: number;
}

export interface SectionRevealResult {
  ref: React.RefObject<any>;
  controls: ReturnType<typeof useAnimation>;
  isInView: boolean;
  parentVariants: Variants;
  childVariants: Variants;
}

// Default configuration
const defaultConfig = {
  variant: 'fade-up' as const,
  once: true,
  threshold: 0.2,
  duration: 0.5,
  staggerChildren: 0.1,
  delayChildren: 0.1
};

// Animation variants factory - clean and simple
const createAnimationVariants = (
  variant: SectionRevealOptions['variant'],
  duration: number
): { parentVariants: Variants; childVariants: Variants } => {
  
  // Base animation properties
  const baseTransition = {
    duration,
    ease: 'easeOut' as const,
  };

  const springTransition = {
    type: 'spring' as const,
    stiffness: 100,
    damping: 15,
  };

  // Default fade-up variants
  let parentVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration,
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };
  
  let childVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: springTransition
    }
  };
  
  // Customize based on variant type
  switch (variant) {
    case 'fade-down':
      childVariants.hidden = { opacity: 0, y: -20 };
      break;
      
    case 'fade-in':
      childVariants.hidden = { opacity: 0 };
      childVariants.visible = {
        opacity: 1,
        transition: { duration }
      };
      break;
      
    case 'slide-up':
      childVariants.hidden = { opacity: 0, y: 50 };
      childVariants.visible = {
        opacity: 1,
        y: 0,
        transition: { 
          type: 'spring',
          stiffness: 90,
          damping: 20,
          duration 
        }
      };
      break;
      
    case 'slide-down':
      childVariants.hidden = { opacity: 0, y: -50 };
      childVariants.visible = {
        opacity: 1,
        y: 0,
        transition: { 
          type: 'spring',
          stiffness: 90,
          damping: 20,
          duration 
        }
      };
      break;
      
    case 'scale':
      childVariants.hidden = { opacity: 0, scale: 0.9 };
      childVariants.visible = {
        opacity: 1,
        scale: 1,
        transition: { 
          type: 'spring',
          stiffness: 100,
          damping: 15,
          duration 
        }
      };
      break;
  }
  
  return { parentVariants, childVariants };
};

/**
 * Hook for revealing sections with staggered children animations
 * This is designed for larger sections with multiple child elements
 */
export function useSectionRevealAnimation(options: SectionRevealOptions = {}): SectionRevealResult {
  const mergedConfig = useMemo(() => ({ ...defaultConfig, ...options }), [options]);
  
  const ref = useRef(null);

  // Create animation variants - pure and simple
  const { parentVariants, childVariants } = useMemo(() => 
    createAnimationVariants(mergedConfig.variant, mergedConfig.duration),
    [mergedConfig.variant, mergedConfig.duration]
  );

  // Enhanced parent variants with config options
  const enhancedParentVariants = useMemo((): Variants => ({
    ...parentVariants,
    visible: {
      ...parentVariants.visible,
      transition: {
        ...(parentVariants.visible as any)?.transition,
        staggerChildren: mergedConfig.staggerChildren,
        delayChildren: mergedConfig.delayChildren,
      },
    },
  }), [parentVariants, mergedConfig.staggerChildren, mergedConfig.delayChildren]);

  // Intersection observer - clean and simple
  const isInView = useInView(ref, { 
    once: mergedConfig.once,
    amount: mergedConfig.threshold,
  });

  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    } else if (!mergedConfig.once) {
      controls.start('hidden');
    }
  }, [isInView, controls, mergedConfig.once]);

  return {
    ref,
    controls,
    isInView,
    parentVariants: enhancedParentVariants,
    childVariants,
  };
}

export default useSectionRevealAnimation;