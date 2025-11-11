'use client';


import { useEffect } from 'react';
import { useAnimation } from 'framer-motion';

export interface ProgressAnimationOptions {
  animated?: boolean;
  duration?: number;
}

export interface ProgressAnimationResult {
  progressControls: ReturnType<typeof useAnimation>;
}

/**
 * Simplified hook for animating progress bars
 */
export function useProgressAnimation(
  currentValue: number,
  totalValue: number,
  options: ProgressAnimationOptions = {}
): ProgressAnimationResult {
  const {
    animated = true,
    duration = 0.8
  } = options;
  
  // Calculate progress percentage
  const progressPercentage = totalValue > 0 ? (currentValue / totalValue) * 100 : 0;
  
  // Animation controls
  const progressControls = useAnimation();
  
  // Animate progress bar
  useEffect(() => {
    if (animated) {
      progressControls.start({
        width: `${progressPercentage}%`,
        transition: {
          duration,
          ease: [0.25, 0.46, 0.45, 0.94],
          type: 'spring',
          stiffness: 100,
          damping: 20
        }
      });
    } else {
      // Instant update without animation
      progressControls.set({
        width: `${progressPercentage}%`
      });
    }
  }, [progressControls, progressPercentage, animated, duration]);
  
  return {
    progressControls
  };
}

export default useProgressAnimation;