// 'use client';

// import { useEffect } from 'react';
// import { useAnimation, Variants } from 'framer-motion';
// import { useInView } from 'react-intersection-observer';

// export interface SectionRevealOptions {
//   variant?: 'fade-up' | 'fade-down' | 'fade-in' | 'slide-up' | 'slide-down' | 'scale';
//   once?: boolean;
//   threshold?: { desktop: number; mobile: number } | number;
//   duration?: number;
//   staggerChildren?: number;
//   delayChildren?: number;
// }

// export interface SectionRevealResult {
//   ref: (node?: Element | null) => void;
//   controls: ReturnType<typeof useAnimation>;
//   isInView: boolean;
//   parentVariants: Variants;
//   childVariants: Variants;
// }

// /**
//  * Hook for revealing sections with staggered children animations
//  * This is designed for larger sections with multiple child elements
//  */
// export function useSectionRevealAnimation(options: SectionRevealOptions = {}): SectionRevealResult {
//   const {
//     variant = 'fade-up',
//     once = true,
//     threshold = { desktop: 0.2, mobile: 0.1 },
//     duration = 0.5,
//     staggerChildren = 0.1,
//     delayChildren = 0.1
//   } = options;
  
//   // Calculate threshold based on screen size
//   const thresholdValue = typeof threshold === 'number' 
//     ? threshold 
//     : (typeof window !== 'undefined' && window.innerWidth > 768) ? threshold.desktop : threshold.mobile;
  
//   // Animation controls
//   const controls = useAnimation();
  
//   // Intersection observer
//   const [ref, inView] = useInView({
//     threshold: thresholdValue,
//     triggerOnce: once
//   });
  
//   // Build variants based on the specified variant type
//   const buildVariants = (): { parentVariants: Variants; childVariants: Variants } => {
//     // Default fade-up variants
//     let parentVariants: Variants = {
//       hidden: { opacity: 0 },
//       visible: {
//         opacity: 1,
//         transition: {
//           duration,
//           staggerChildren,
//           delayChildren
//         }
//       }
//     };
    
//     let childVariants: Variants = {
//       hidden: { opacity: 0, y: 20 },
//       visible: {
//         opacity: 1,
//         y: 0,
//         transition: { 
//           type: 'spring',
//           stiffness: 100,
//           damping: 15,
//           duration 
//         }
//       }
//     };
    
//     // Customize based on variant type
//     switch (variant) {
//       case 'fade-down':
//         childVariants.hidden = { opacity: 0, y: -20 };
//         break;
        
//       case 'fade-in':
//         childVariants.hidden = { opacity: 0 };
//         childVariants.visible = {
//           opacity: 1,
//           transition: { duration }
//         };
//         break;
        
//       case 'slide-up':
//         childVariants.hidden = { opacity: 0, y: 50 };
//         childVariants.visible = {
//           opacity: 1,
//           y: 0,
//           transition: { 
//             type: 'spring',
//             stiffness: 90,
//             damping: 20,
//             duration 
//           }
//         };
//         break;
        
//       case 'slide-down':
//         childVariants.hidden = { opacity: 0, y: -50 };
//         childVariants.visible = {
//           opacity: 1,
//           y: 0,
//           transition: { 
//             type: 'spring',
//             stiffness: 90,
//             damping: 20,
//             duration 
//           }
//         };
//         break;
        
//       case 'scale':
//         childVariants.hidden = { opacity: 0, scale: 0.9 };
//         childVariants.visible = {
//           opacity: 1,
//           scale: 1,
//           transition: { 
//             type: 'spring',
//             stiffness: 100,
//             damping: 15,
//             duration 
//           }
//         };
//         break;
//     }
    
//     return { parentVariants, childVariants };
//   };
  
//   const { parentVariants, childVariants } = buildVariants();
  
//   // Trigger animation when element comes into view
//   useEffect(() => {
//     if (inView) {
//       controls.start('visible');
//     } else if (!once) {
//       controls.start('hidden');
//     }
//   }, [controls, inView, once]);
  
//   return {
//     ref,
//     controls,
//     isInView: inView,
//     parentVariants,
//     childVariants
//   };
// }

// export default useSectionRevealAnimation;


'use client';

import { useEffect, useState } from 'react';
import { useAnimation, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export interface SectionRevealOptions {
  variant?: 'fade-up' | 'fade-down' | 'fade-in' | 'slide-up' | 'slide-down' | 'scale';
  once?: boolean;
  threshold?: { desktop: number; mobile: number } | number;
  duration?: number;
  staggerChildren?: number;
  delayChildren?: number;
}

export interface SectionRevealResult {
  ref: (node?: Element | null) => void;
  controls: ReturnType<typeof useAnimation>;
  isInView: boolean;
  parentVariants: Variants;
  childVariants: Variants;
}

/**
 * Hook for revealing sections with staggered children animations
 * This is designed for larger sections with multiple child elements
 */
export function useSectionRevealAnimation(options: SectionRevealOptions = {}): SectionRevealResult {
  const {
    variant = 'fade-up',
    once = true,
    threshold = { desktop: 0.2, mobile: 0.1 },
    duration = 0.5,
    staggerChildren = 0.1,
    delayChildren = 0.1
  } = options;
  
  // Use state to track if we're on client side
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Calculate threshold based on screen size - always use mobile threshold for SSR
  const thresholdValue = typeof threshold === 'number' 
    ? threshold 
    : isClient && window.innerWidth > 768 
      ? threshold.desktop 
      : threshold.mobile;
  
  // Animation controls
  const controls = useAnimation();
  
  // Intersection observer
  const [ref, inView] = useInView({
    threshold: thresholdValue,
    triggerOnce: once
  });
  
  // Build variants based on the specified variant type
  const buildVariants = (): { parentVariants: Variants; childVariants: Variants } => {
    // Default fade-up variants
    let parentVariants: Variants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          duration,
          staggerChildren,
          delayChildren
        }
      }
    };
    
    let childVariants: Variants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { 
          type: 'spring',
          stiffness: 100,
          damping: 15,
          duration 
        }
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
  
  const { parentVariants, childVariants } = buildVariants();
  
  // Trigger animation when element comes into view
  useEffect(() => {
    if (inView) {
      controls.start('visible');
    } else if (!once) {
      controls.start('hidden');
    }
  }, [controls, inView, once]);
  
  return {
    ref,
    controls,
    isInView: inView,
    parentVariants,
    childVariants
  };
}

export default useSectionRevealAnimation;