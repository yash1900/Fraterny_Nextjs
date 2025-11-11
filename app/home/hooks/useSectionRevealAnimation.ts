'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useAnimation, useInView, Variants } from 'framer-motion';

// Animation variant types
export type AnimationVariant = 
  | 'fade-up' 
  | 'fade-down' 
  | 'fade-left' 
  | 'fade-right'
  | 'slide-up' 
  | 'slide-down' 
  | 'slide-left' 
  | 'slide-right'
  | 'scale-in' 
  | 'scale-out'
  | 'zoom-in'
  | 'rotate-in'
  | 'flip-in'
  | 'professional'
  | 'bold'
  | 'custom';

// Configuration options
export interface ScrollAnimationConfig {
  variant?: AnimationVariant;
  once?: boolean;
  amount?: number | 'some' | 'all';
  staggerChildren?: number;
  delayChildren?: number;
  duration?: number;
  mobile?: {
    variant?: AnimationVariant;
    reduced?: boolean;
    duration?: number;
  };
  threshold?: {
    desktop?: number;
    mobile?: number;
  };
}

// Default configuration
const defaultConfig: Required<ScrollAnimationConfig> = {
  variant: 'fade-up',
  once: false,
  amount: 0.25,
  staggerChildren: 0.18,
  delayChildren: 0,
  duration: 0.6,
  mobile: {
    variant: 'fade-up',
    reduced: true,
    duration: 0.4,
  },
  threshold: {
    desktop: 0.25,
    mobile: 0.15,
  },
};

// Detect if user prefers reduced motion
const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Detect mobile device
const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768; // Tailwind md breakpoint
};

// Animation variants factory
const createAnimationVariants = (
  variant: AnimationVariant,
  duration: number,
  isMobile: boolean,
  isReducedMotion: boolean
): { parentVariants: Variants; childVariants: Variants } => {
  
  // Reduced motion fallback
  if (isReducedMotion) {
    return {
      parentVariants: {
        hidden: {},
        visible: { transition: { staggerChildren: 0.1 } },
      },
      childVariants: {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
      },
    };
  }

  // Base animation properties
  const baseTransition = {
    duration,
    ease: 'easeOut' as const,
  };

  const springTransition = {
    type: 'spring' as const,
    stiffness: isMobile ? 100 : 120,
    damping: isMobile ? 20 : 15,
  };

  // Animation variant definitions
  const variants: Record<AnimationVariant, { parentVariants: Variants; childVariants: Variants }> = {
    'fade-up': {
      parentVariants: {
        hidden: {},
        visible: { transition: { staggerChildren: 0.15 } },
      },
      childVariants: {
        hidden: { opacity: 0, y: isMobile ? 20 : 30 },
        visible: { opacity: 1, y: 0, transition: baseTransition },
      },
    },

    'fade-down': {
      parentVariants: {
        hidden: {},
        visible: { transition: { staggerChildren: 0.15 } },
      },
      childVariants: {
        hidden: { opacity: 0, y: isMobile ? -20 : -30 },
        visible: { opacity: 1, y: 0, transition: baseTransition },
      },
    },

    'fade-left': {
      parentVariants: {
        hidden: {},
        visible: { transition: { staggerChildren: 0.12 } },
      },
      childVariants: {
        hidden: { opacity: 0, x: isMobile ? 30 : 50 },
        visible: { opacity: 1, x: 0, transition: baseTransition },
      },
    },

    'fade-right': {
      parentVariants: {
        hidden: {},
        visible: { transition: { staggerChildren: 0.15 } },
      },
      childVariants: {
        hidden: { opacity: 0, x: isMobile ? -30 : -40 },
        visible: { 
          opacity: 1, 
          x: 0, 
          transition: { 
            ...baseTransition,
            ease: [0.25, 0.46, 0.45, 0.94] // Custom cubic-bezier for smoother motion
          } 
        },
      },
    },

    'slide-up': {
      parentVariants: {
        hidden: {},
        visible: { transition: { staggerChildren: 0.18 } },
      },
      childVariants: {
        hidden: { y: isMobile ? 40 : 60, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: springTransition },
      },
    },

    'slide-down': {
      parentVariants: {
        hidden: {},
        visible: { transition: { staggerChildren: 0.18 } },
      },
      childVariants: {
        hidden: { y: isMobile ? -40 : -60, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: springTransition },
      },
    },

    'slide-left': {
      parentVariants: {
        hidden: {},
        visible: { transition: { staggerChildren: 0.15 } },
      },
      childVariants: {
        hidden: { x: isMobile ? 60 : 100, opacity: 0 },
        visible: { x: 0, opacity: 1, transition: springTransition },
      },
    },

    'slide-right': {
      parentVariants: {
        hidden: {},
        visible: { transition: { staggerChildren: 0.15 } },
      },
      childVariants: {
        hidden: { x: isMobile ? -60 : -100, opacity: 0 },
        visible: { x: 0, opacity: 1, transition: springTransition },
      },
    },

    'scale-in': {
      parentVariants: {
        hidden: {},
        visible: { transition: { staggerChildren: 0.12 } },
      },
      childVariants: {
        hidden: { scale: 0.8, opacity: 0 },
        visible: { scale: 1, opacity: 1, transition: springTransition },
      },
    },

    'scale-out': {
      parentVariants: {
        hidden: {},
        visible: { transition: { staggerChildren: 0.12 } },
      },
      childVariants: {
        hidden: { scale: 1.2, opacity: 0 },
        visible: { scale: 1, opacity: 1, transition: baseTransition },
      },
    },

    'zoom-in': {
      parentVariants: {
        hidden: {},
        visible: { transition: { staggerChildren: 0.1 } },
      },
      childVariants: {
        hidden: { scale: 0.5, opacity: 0 },
        visible: { scale: 1, opacity: 1, transition: { ...springTransition, stiffness: 150 } },
      },
    },

    'rotate-in': {
      parentVariants: {
        hidden: {},
        visible: { transition: { staggerChildren: 0.15 } },
      },
      childVariants: {
        hidden: { rotate: isMobile ? -10 : -15, opacity: 0, scale: 0.9 },
        visible: { rotate: 0, opacity: 1, scale: 1, transition: springTransition },
      },
    },

    'flip-in': {
      parentVariants: {
        hidden: {},
        visible: { transition: { staggerChildren: 0.1 } },
      },
      childVariants: {
        hidden: { rotateX: -90, opacity: 0 },
        visible: { rotateX: 0, opacity: 1, transition: springTransition },
      },
    },

    'professional': {
      parentVariants: {
        hidden: {},
        visible: { transition: { staggerChildren: 0.2, delayChildren: 0.1 } },
      },
      childVariants: {
        hidden: { opacity: 0, y: 15 },
        visible: { 
          opacity: 1, 
          y: 0, 
          transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] } 
        },
      },
    },

    'bold': {
      parentVariants: {
        hidden: {},
        visible: { transition: { staggerChildren: 0.08 } },
      },
      childVariants: {
        hidden: { scale: 0.6, opacity: 0, rotate: -5 },
        visible: { 
          scale: 1, 
          opacity: 1, 
          rotate: 0,
          transition: { 
            type: 'spring',
            stiffness: 200,
            damping: 10,
            duration: 0.4
          } 
        },
      },
    },

    'custom': {
      parentVariants: {
        hidden: {},
        visible: { transition: { staggerChildren: 0.15 } },
      },
      childVariants: {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: baseTransition },
      },
    },
  };

  return variants[variant];
};

export function useSectionRevealAnimation(config: ScrollAnimationConfig = {}) {
  const mergedConfig = useMemo(() => ({ ...defaultConfig, ...config }), [config]);
  
  const ref = useRef(null);
  const isMobile = isMobileDevice();
  const isReducedMotion = prefersReducedMotion();
  
  // Determine the appropriate variant and settings
  const effectiveVariant = useMemo(() => {
    if (isMobile && mergedConfig.mobile.variant) {
      return mergedConfig.mobile.variant;
    }
    return mergedConfig.variant;
  }, [isMobile, mergedConfig.variant, mergedConfig.mobile.variant]);

  const effectiveDuration = useMemo(() => {
    if (isMobile && mergedConfig.mobile.duration) {
      return mergedConfig.mobile.duration;
    }
    return mergedConfig.duration;
  }, [isMobile, mergedConfig.duration, mergedConfig.mobile.duration]);

  const effectiveThreshold = useMemo(() => {
    return isMobile ? mergedConfig.threshold.mobile : mergedConfig.threshold.desktop;
  }, [isMobile, mergedConfig.threshold]);

  // Create animation variants
  const { parentVariants, childVariants } = useMemo(() => 
    createAnimationVariants(effectiveVariant, effectiveDuration, isMobile, isReducedMotion),
    [effectiveVariant, effectiveDuration, isMobile, isReducedMotion]
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

  // Intersection observer with enhanced options
  const isInView = useInView(ref, { 
    once: mergedConfig.once,
    amount: typeof mergedConfig.amount === 'number' ? effectiveThreshold : mergedConfig.amount,
    margin: isMobile ? '0px 0px -50px 0px' : '0px 0px -100px 0px', // Different margins for mobile
  });

  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    } else if (!mergedConfig.once) {
      controls.start('hidden');
    }
  }, [isInView, controls, mergedConfig.once]);

  // Additional utilities
  const triggerAnimation = () => controls.start('visible');
  const resetAnimation = () => controls.start('hidden');

  return {
    ref,
    controls,
    isInView,
    parentVariants: enhancedParentVariants,
    childVariants,
    isMobile,
    isReducedMotion,
    // Utility functions
    triggerAnimation,
    resetAnimation,
    // Configuration info
    config: mergedConfig,
    effectiveVariant,
  };
}