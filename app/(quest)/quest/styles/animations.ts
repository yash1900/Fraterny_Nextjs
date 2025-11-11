// Animation duration constants
export const duration = {
  instant: 0,
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  slower: 0.8,
  slowest: 1.2,
} as const;

// Easing functions
export const easing = {
  linear: [0, 0, 1, 1] as number[],
  easeIn: [0.4, 0, 1, 1] as number[],
  easeOut: [0, 0, 0.2, 1] as number[],
  easeInOut: [0.4, 0, 0.2, 1] as number[],
  backOut: [0.34, 1.56, 0.64, 1] as number[],
  backIn: [0.36, 0, 0.66, -0.56] as number[],
  backInOut: [0.68, -0.6, 0.32, 1.6] as number[],
};

// Framer Motion animation variants
export const animations = {
  // Fade animations
  fadeIn: {
    hidden: { 
      opacity: 0 
    },
    visible: { 
      opacity: 1,
      transition: {
        duration: duration.normal,
        ease: easing.easeOut
      }
    }
  },
  
  // Slide animations
  slideUp: {
    hidden: { 
      opacity: 0, 
      y: 30 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: duration.slow,
        ease: easing.easeOut
      }
    }
  },
  
  slideInLeft: {
    hidden: { 
      opacity: 0, 
      x: -30 
    },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        duration: duration.slow,
        ease: easing.easeOut
      }
    }
  },
  
  // Hero text animations (staggered)
  heroText: {
    hidden: { 
      opacity: 0, 
      y: 20 
    },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1, // Stagger delay
        duration: duration.slow,
        ease: [0.6, -0.05, 0.01, 0.99] as [number, number, number, number]
      }
    })
  },
  
  // Button animations
  buttonHover: {
    scale: 1.05,
    transition: {
      duration: duration.fast,
      ease: easing.easeOut
    }
  },
  
  buttonTap: {
    scale: 0.95,
    transition: {
      duration: duration.instant,
      ease: easing.easeInOut
    }
  },
  
  // Background gradient animation
  gradientFloat: {
    animate: {
      scale: [1, 1.1, 1],
      rotate: [0, 5, 0],
      transition: {
        duration: duration.slowest * 5, // 6 seconds
        repeat: Infinity,
        ease: easing.easeInOut
      }
    }
  },
  
  // Container animations
  containerReveal: {
    hidden: { 
      opacity: 0 
    },
    visible: {
      opacity: 1,
      transition: {
        duration: duration.slow,
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  },
  
  // Page transition animations
  pageTransition: {
    initial: { 
      opacity: 0,
      y: 20
    },
    animate: { 
      opacity: 1,
      y: 0
    },
    exit: { 
      opacity: 0,
      y: -20
    },
    transition: {
      duration: duration.normal,
      ease: easing.easeInOut
    }
  }
} as const;

// Animation timing presets for common use cases
export const timing = {
  microInteraction: duration.fast,
  uiElement: duration.normal,
  pageTransition: duration.slow,
  backgroundEffect: duration.slower,
} as const;

// Spring animation presets
export const springs = {
  gentle: {
    type: "spring",
    damping: 20,
    stiffness: 100
  },
  bouncy: {
    type: "spring",
    damping: 15,
    stiffness: 200
  },
  snappy: {
    type: "spring",
    damping: 25,
    stiffness: 300
  }
} as const;

// Export individual animation groups
export const { fadeIn, slideUp, slideInLeft, heroText, buttonHover, buttonTap, gradientFloat, containerReveal, pageTransition } = animations;