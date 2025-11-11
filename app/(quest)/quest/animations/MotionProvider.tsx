// /src/components/quest-landing/animations/MotionProvider.tsx

import React, { createContext, useContext, ReactNode } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { duration, easing } from '../styles/animations';

interface MotionConfig {
  reducedMotion: boolean;
  globalDuration: number;
  globalEasing: readonly number[];
  staggerDelay: number;
  enableAnimations: boolean;
}

interface MotionContextType {
  config: MotionConfig;
  updateConfig: (newConfig: Partial<MotionConfig>) => void;
}

const MotionContext = createContext<MotionContextType | undefined>(undefined);

interface MotionProviderProps {
  children: ReactNode;
  enableAnimations?: boolean;
  globalDuration?: number;
}

const MotionProvider: React.FC<MotionProviderProps> = ({
  children,
  enableAnimations = true,
  globalDuration = duration.normal
}) => {
  const shouldReduceMotion = useReducedMotion();
  
  // Default motion configuration
  const [config, setConfig] = React.useState<MotionConfig>({
    reducedMotion: shouldReduceMotion || false,
    globalDuration: globalDuration,
    globalEasing: easing.easeOut,
    staggerDelay: 0.1,
    enableAnimations: enableAnimations && !shouldReduceMotion,
  });

  // Update configuration function
  const updateConfig = React.useCallback((newConfig: Partial<MotionConfig>) => {
    setConfig(prev => ({
      ...prev,
      ...newConfig,
      // Always respect reduced motion preference
      enableAnimations: typeof newConfig.enableAnimations === 'boolean'
        ? newConfig.enableAnimations && !shouldReduceMotion
        : prev.enableAnimations && !shouldReduceMotion,
    }));
  }, [shouldReduceMotion]);

  // Update config when reduced motion changes
  React.useEffect(() => {
    setConfig(prev => ({
      ...prev,
      reducedMotion: shouldReduceMotion || false,
      enableAnimations: prev.enableAnimations && !shouldReduceMotion,
    }));
  }, [shouldReduceMotion]);

  const contextValue: MotionContextType = {
    config,
    updateConfig,
  };

  return (
    <MotionContext.Provider value={contextValue}>
      <AnimatePresence mode="wait">
        {children}
      </AnimatePresence>
    </MotionContext.Provider>
  );
};

// Custom hook to use motion context
export const useMotionConfig = (): MotionContextType => {
  const context = useContext(MotionContext);
  if (context === undefined) {
    throw new Error('useMotionConfig must be used within a MotionProvider');
  }
  return context;
};

// Higher-order component for pages with motion
export const withMotion = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  const WrappedComponent: React.FC<P> = (props) => (
    <MotionProvider>
      <Component {...props} />
    </MotionProvider>
  );
  
  WrappedComponent.displayName = `withMotion(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Wrapper component for motion elements that respect global config
interface MotionWrapperProps {
  children: ReactNode;
  variants?: any;
  initial?: string;
  animate?: string;
  exit?: string;
  className?: string;
  style?: React.CSSProperties;
  layout?: boolean;
  layoutId?: string;
}

export const MotionWrapper: React.FC<MotionWrapperProps> = ({
  children,
  variants,
  initial = 'hidden',
  animate = 'visible',
  exit = 'hidden',
  className,
  style,
  layout,
  layoutId,
}) => {
  const { config } = useMotionConfig();

  // If animations are disabled, return static content
  if (!config.enableAnimations) {
    return <div className={className} style={style}>{children}</div>;
  }

  return (
    <motion.div
      variants={variants}
      initial={initial}
      animate={animate}
      exit={exit}
      className={className}
      style={style}
      layout={layout}
      layoutId={layoutId}
    >
      {children}
    </motion.div>
  );
};

export default MotionProvider;