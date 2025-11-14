// 'use client';

// import { useEffect } from 'react';
// import { useAnimation, Variants } from 'framer-motion';
// import { useInView } from 'react-intersection-observer';

// type AnimationVariant = 'questionCard' | 'tag';

// interface QuestAnimationOptions {
//   variant: AnimationVariant;
//   triggerOnce?: boolean;
// }

// interface QuestAnimationResult {
//   ref: (node?: Element | null) => void;
//   controls: ReturnType<typeof useAnimation>;
//   variants: Variants;
// }

// const ANIMATION_VARIANTS: Record<AnimationVariant, Variants> = {
//   questionCard: {
//     hidden: { 
//       opacity: 0, 
//       y: 40, 
//       scale: 0.98
//     },
//     visible: { 
//       opacity: 1, 
//       y: 0, 
//       scale: 1,
//       transition: {
//         type: 'spring',
//         stiffness: 100,
//         damping: 20,
//         mass: 1,
//         opacity: { duration: 0.4 }
//       }
//     }
//   },
//   tag: {
//     hidden: { 
//       opacity: 0, 
//       scale: 0.8
//     },
//     visible: { 
//       opacity: 1, 
//       scale: 1,
//       transition: {
//         type: 'spring',
//         stiffness: 100,
//         damping: 20,
//         mass: 1
//       }
//     }
//   }
// };

// export function useQuestAnimation(options: QuestAnimationOptions): QuestAnimationResult {
//   const { variant, triggerOnce = true } = options;
  
//   const controls = useAnimation();
  
//   const [ref, inView] = useInView({
//     threshold: 0.1,
//     triggerOnce
//   });
  
//   useEffect(() => {
//     if (inView) {
//       controls.start('visible');
//     }
//   }, [controls, inView]);
  
//   return {
//     ref,
//     controls,
//     variants: ANIMATION_VARIANTS[variant]
//   };
// }

// export default useQuestAnimation;



'use client';

import { useRef, useEffect } from 'react';
import { useAnimation, useInView, Variants } from 'framer-motion';

type AnimationVariant = 'questionCard' | 'tag';

interface QuestAnimationOptions {
  variant: AnimationVariant;
  triggerOnce?: boolean;
}

interface QuestAnimationResult {
  ref: React.RefObject<any>;
  controls: ReturnType<typeof useAnimation>;
  variants: Variants;
}

const ANIMATION_VARIANTS: Record<AnimationVariant, Variants> = {
  questionCard: {
    hidden: { 
      opacity: 0, 
      y: 40, 
      scale: 0.98
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 20,
        mass: 1,
        opacity: { duration: 0.4 }
      }
    }
  },
  tag: {
    hidden: { 
      opacity: 0, 
      scale: 0.8
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 20,
        mass: 1
      }
    }
  }
};

export function useQuestAnimation(options: QuestAnimationOptions): QuestAnimationResult {
  const { variant, triggerOnce = true } = options;
  
  const ref = useRef(null);
  const controls = useAnimation();
  
  const isInView = useInView(ref, {
    once: triggerOnce,
    amount: 0.1
  });
  
  useEffect(() => {
    if (isInView) {
      controls.start('visible');
    }
  }, [controls, isInView]);
  
  return {
    ref,
    controls,
    variants: ANIMATION_VARIANTS[variant]
  };
}

export default useQuestAnimation;