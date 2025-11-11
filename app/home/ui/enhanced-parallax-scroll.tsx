import { useMemo, useEffect, useState, useRef, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import ResponsiveImage from '../../../components/ui/ResponsiveImage';
import { useNetworkStatus } from '@/app/admin/hooks/use-network-status';
import { useIsMobile } from '@/app/admin/hooks/use-mobile';
import { cn } from "@/lib/utils";

// Beautiful spinner loading component for gallery images
const ImageSpinner = ({ index }: { index: number }) => (
  <div className="absolute inset-0 bg-navy/90 flex items-center justify-center z-10">
    {/* Animated spinner */}
    <div className="relative">
      <div className="w-8 h-8 border-4 border-terracotta/30 border-t-blue-400 rounded-full animate-spin"></div>
      
      {/* Subtle background glow */}
      <div className="absolute inset-0 w-8 h-8 border-4 border-terracotta/10 rounded-full blur-sm"></div>
    </div>
    
    {/* Optional: Loading text for slower connections */}
    <div className="absolute bottom-4 left-4 right-4">
      <div className="text-xs text-gray-300 opacity-60 text-center">
        Loading...
      </div>
    </div>
    
    {/* Subtle animated background pattern */}
    <div className="absolute inset-0 opacity-5">
      <div 
        className="w-full h-full"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 1px, transparent 1px),
                           radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
          animation: `float ${2 + (index % 3) * 0.5}s ease-in-out infinite alternate`
        }}
      />
    </div>
  </div>
);

// Activity data structure (converted from VillaLabSection)
const activities = [
  {
    title: "Workshops",
    dynamicKey: "villalab-workshop",
    fallbackSrc: {
      mobile: "/images/villalab/workshop-mobile.webp",
      desktop: "/images/villalab/workshop-desktop.webp"
    },
    alt: "Interactive workshop session"
  },
  {
    title: "Gourmet Meals",
    dynamicKey: "villalab-gourmet",
    fallbackSrc: {
      mobile: "/images/villalab/gourmet-mobile.webp",
      desktop: "/images/villalab/gourmet-desktop.webp"
    },
    alt: "Premium dining experience"
  },
  {
    title: "Group Activities",
    dynamicKey: "villalab-group",
    fallbackSrc: {
      mobile: "/images/villalab/group-mobile.webp",
      desktop: "/images/villalab/group-desktop.webp"
    },
    alt: "Team-building activity in progress"
  },
  {
    title: "Candid Interactions",
    dynamicKey: "villalab-candid",
    fallbackSrc: {
      mobile: "/images/villalab/candid-mobile.webp",
      desktop: "/images/villalab/candid-desktop.webp"
    },
    alt: "Natural conversation between participants"
  },
  {
    title: "Networking",
    dynamicKey: "villalab-networking",
    fallbackSrc: {
      mobile: "/images/villalab/networking-mobile.webp",
      desktop: "/images/villalab/networking-desktop.webp"
    },
    alt: "Professional connections being formed"
  },
  {
    title: "Evening Sessions",
    dynamicKey: "villalab-evening",
    fallbackSrc: {
      mobile: "/images/villalab/evening-mobile.webp",
      desktop: "/images/villalab/evening-desktop.webp"
    },
    alt: "Deep discussions in evening setting"
  },
  {
    title: "Brainstorming",
    dynamicKey: "villalab-brainstorm",
    fallbackSrc: {
      mobile: "/images/villalab/brainstorm-mobile.webp",
      desktop: "/images/villalab/brainstorm-desktop.webp"
    },
    alt: "Collaborative ideation session"
  },
  {
    title: "Mentorship",
    dynamicKey: "villalab-mentorship",
    fallbackSrc: {
      mobile: "/images/villalab/mentorship-mobile.webp",
      desktop: "/images/villalab/mentorship-desktop.webp"
    },
    alt: "One-on-one guidance session"
  },
  {
    title: "Social Events",
    dynamicKey: "villalab-social",
    fallbackSrc: {
      mobile: "/images/villalab/social-mobile.webp",
      desktop: "/images/villalab/social-desktop.webp"
    },
    alt: "Relaxed social gathering"
  }
];

interface EnhancedParallaxScrollProps {
  className?: string;
}

export const EnhancedParallaxScroll = ({ className }: EnhancedParallaxScrollProps) => {
  const network = useNetworkStatus();
  const isMobile = useIsMobile();
  const [visibleCount, setVisibleCount] = useState<number>(0);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Refs for infinite scroll
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  
  // Parallax scroll setup - only for desktop
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Parallax transforms - disabled on mobile
  const parallaxIntensity = 200;
  const translateFirst = useTransform(scrollYProgress, [0, 1], [0, -parallaxIntensity]);
  const translateSecond = useTransform(scrollYProgress, [0, 1], [0, parallaxIntensity]);
  const translateThird = useTransform(scrollYProgress, [0, 1], [0, -parallaxIntensity]);

  // Network-aware loading logic
  useEffect(() => {
    // Start with a small number on slow connections, more on fast connections
    const baseCount = ['slow-2g', '2g'].includes(network.effectiveConnectionType) 
      ? 2 
      : network.effectiveConnectionType === '3g' 
        ? 4 
        : 6;

    // Show fewer on mobile initially
    const count = isMobile ? Math.min(baseCount, 4) : baseCount;
    setVisibleCount(count);

    // For desktop, gradually increase the visible count
    if (!isMobile) {
      const interval = setInterval(() => {
        setVisibleCount(current => {
          const maxDisplay = 9;
          return current < maxDisplay ? current + 1 : current;
        });
      }, 300);

      return () => clearInterval(interval);
    }
  }, [network.effectiveConnectionType, isMobile]);

  // Auto-hide spinners after a reasonable time
  useEffect(() => {
    const timer = setTimeout(() => {
      // Mark first few images as "loaded" after 1.5 seconds
      const initialLoaded = new Set<number>();
      for (let i = 0; i < Math.min(visibleCount, 4); i++) {
        initialLoaded.add(i);
      }
      setLoadedImages(initialLoaded);
      
      // Gradually mark more as loaded
      const interval = setInterval(() => {
        setLoadedImages(current => {
          const newSet = new Set(current);
          const nextIndex = current.size;
          if (nextIndex < visibleCount) {
            newSet.add(nextIndex);
          }
          return newSet;
        });
      }, 300);

      return () => clearInterval(interval);
    }, 1500);

    return () => clearTimeout(timer);
  }, [visibleCount]);

  // Infinite scroll logic for mobile
  const loadMoreImages = useCallback(() => {
    if (isLoadingMore || !hasMore || !isMobile) return;

    setIsLoadingMore(true);
    
    // Simulate loading delay (you might want to adjust this)
    setTimeout(() => {
      setVisibleCount(current => {
        const newCount = Math.min(current + 3, activities.length);
        setHasMore(newCount < activities.length);
        return newCount;
      });
      setIsLoadingMore(false);
    }, 500);
  }, [isLoadingMore, hasMore, isMobile]);

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    if (!isMobile || !sentinelRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoadingMore) {
          loadMoreImages();
        }
      },
      {
        root: null,
        rootMargin: '100px', // Load when 100px before reaching the sentinel
        threshold: 0.1,
      }
    );

    observerRef.current.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoadingMore, loadMoreImages, isMobile]);

  // Calculate display images based on visible count
  const displayImages = activities.slice(0, Math.min(activities.length, visibleCount));

  // Split images into three columns for parallax (desktop only)
  const third = Math.ceil(displayImages.length / 3);
  const firstPart = displayImages.slice(0, third);
  const secondPart = displayImages.slice(third, 2 * third);
  const thirdPart = displayImages.slice(2 * third);

  // Render mobile layout (single column with infinite scroll and scrollbar)
  const renderMobileLayout = () => (
    <div className="h-[70vh] overflow-y-auto scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-terracotta/50 hover:scrollbar-thumb-terracotta/70 py-20 px-4">
      <div className="flex flex-col gap-4">
        {displayImages.map((activity, idx) => {
          const isImageLoaded = loadedImages.has(idx);
          const loadingStrategy = idx < 2 ? "eager" : "lazy";

          return (
            <motion.div
              key={`mobile-${idx}`}
              className="relative aspect-square rounded-lg overflow-hidden w-full max-w-sm mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              {/* Loading spinner overlay */}
              {!isImageLoaded && (
                <ImageSpinner index={idx} />
              )}
              
              {/* Image with fade-in animation */}
              <motion.div 
                className={`transition-opacity duration-500 ${
                  isImageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                initial={{ scale: 1.1 }}
                animate={{ scale: isImageLoaded ? 1 : 1.1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <ResponsiveImage
                  alt={activity.alt}
                  className="w-full h-full object-cover object-left-top rounded-lg !m-0 !p-0"
                  loading={loadingStrategy}
                  dynamicKey={`${activity.dynamicKey}-mobile`}
                  priority={idx < 2}
                />
              </motion.div>
            </motion.div>
          );
        })}
        
        {/* Infinite scroll sentinel */}
        {isMobile && hasMore && (
          <div ref={sentinelRef} className="flex justify-center py-4">
            {isLoadingMore ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-terracotta/30 border-t-terracotta rounded-full animate-spin"></div>
                <span className="text-gray-600">Loading more...</span>
              </div>
            ) : (
              <div className="h-4" />
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Render desktop layout (three columns with parallax)
  const renderDesktopLayout = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto gap-4 md:gap-6 lg:gap-10 py-20 px-4 md:px-10">
      {/* First Column */}
      <div className="grid gap-4 md:gap-6 lg:gap-10">
        {firstPart.map((activity, idx) => {
          const globalIndex = idx;
          const isVisible = globalIndex < visibleCount;
          const isImageLoaded = loadedImages.has(globalIndex);
          
          const loadingStrategy = globalIndex < 2 
            ? "eager" 
            : globalIndex < 4 && network.effectiveConnectionType === '4g' 
              ? "eager" 
              : "lazy";

          return (
            <motion.div
              style={{ y: translateFirst }}
              key={"grid-1" + idx}
              className={`relative aspect-square rounded-lg overflow-hidden transition-opacity duration-500 ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {!isImageLoaded && (
                <ImageSpinner index={globalIndex} />
              )}
              
              <motion.div 
                className={`transition-opacity duration-500 ${
                  isImageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                initial={{ scale: 1.1 }}
                animate={{ scale: isImageLoaded ? 1 : 1.1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <ResponsiveImage
                  alt={activity.alt}
                  className="w-full h-full object-cover object-left-top rounded-lg !m-0 !p-0"
                  loading={loadingStrategy}
                  dynamicKey={isMobile ? `${activity.dynamicKey}-mobile` : activity.dynamicKey}
                  priority={globalIndex < 2}
                />
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Second Column */}
      <div className="grid gap-4 md:gap-6 lg:gap-10">
        {secondPart.map((activity, idx) => {
          const globalIndex = third + idx;
          const isVisible = globalIndex < visibleCount;
          const isImageLoaded = loadedImages.has(globalIndex);
          
          const loadingStrategy = globalIndex < 2 
            ? "eager" 
            : globalIndex < 4 && network.effectiveConnectionType === '4g' 
              ? "eager" 
              : "lazy";

          return (
            <motion.div
              style={{ y: translateSecond }}
              key={"grid-2" + idx}
              className={`relative aspect-square rounded-lg overflow-hidden transition-opacity duration-500 ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {!isImageLoaded && (
                <ImageSpinner index={globalIndex} />
              )}
              
              <motion.div 
                className={`transition-opacity duration-500 ${
                  isImageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                initial={{ scale: 1.1 }}
                animate={{ scale: isImageLoaded ? 1 : 1.1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <ResponsiveImage
                  alt={activity.alt}
                  className="w-full h-full object-cover object-left-top rounded-lg !m-0 !p-0"
                  loading={loadingStrategy}
                  dynamicKey={isMobile ? `${activity.dynamicKey}-mobile` : activity.dynamicKey}
                  priority={globalIndex < 2}
                />
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Third Column */}
      <div className="grid gap-4 md:gap-6 lg:gap-10">
        {thirdPart.map((activity, idx) => {
          const globalIndex = 2 * third + idx;
          const isVisible = globalIndex < visibleCount;
          const isImageLoaded = loadedImages.has(globalIndex);
          
          const loadingStrategy = globalIndex < 2 
            ? "eager" 
            : globalIndex < 4 && network.effectiveConnectionType === '4g' 
              ? "eager" 
              : "lazy";

          return (
            <motion.div
              style={{ y: translateThird }}
              key={"grid-3" + idx}
              className={`relative aspect-square rounded-lg overflow-hidden transition-opacity duration-500 ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {!isImageLoaded && (
                <ImageSpinner index={globalIndex} />
              )}
              
              <motion.div 
                className={`transition-opacity duration-500 ${
                  isImageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                initial={{ scale: 1.1 }}
                animate={{ scale: isImageLoaded ? 1 : 1.1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <ResponsiveImage
                  alt={activity.alt}
                  className="w-full h-full object-cover object-left-top rounded-lg !m-0 !p-0"
                  loading={loadingStrategy}
                  dynamicKey={isMobile ? `${activity.dynamicKey}-mobile` : activity.dynamicKey}
                  priority={globalIndex < 2}
                />
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div
      className={cn("w-full relative rounded-xl", className)}
      ref={containerRef}
    >
      {/* Decorative borders */}
      <span className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-blue to-transparent h-[2px] w-3/4 mx-auto rounded-full"></span>
      <span className="absolute inset-x-0 top-0 bg-gradient-to-r from-transparent via-blue to-transparent h-[4px] w-3/4 mx-auto blur-sm opacity-100 rounded-full"></span>

      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-r from-transparent via-blue to-transparent h-[2px] w-3/4 mx-auto rounded-full"></span>
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-r from-transparent via-blue to-transparent h-[4px] w-3/4 mx-auto blur-sm opacity-100 rounded-full"></span>

      <span className="absolute inset-y-0 left-0 bg-gradient-to-b from-transparent via-blue to-transparent w-[2px] h-3/4 my-auto rounded-full"></span>
      <span className="absolute inset-y-0 left-0 bg-gradient-to-b from-transparent via-blue to-transparent w-[4px] h-3/4 my-auto blur-sm opacity-100 rounded-full"></span>

      <span className="absolute inset-y-0 right-0 bg-gradient-to-b from-transparent via-blue to-transparent w-[2px] h-3/4 my-auto rounded-full"></span>
      <span className="absolute inset-y-0 right-0 bg-gradient-to-b from-transparent via-blue to-transparent w-[4px] h-3/4 my-auto blur-sm opacity-100 rounded-full"></span>

      {/* Conditional rendering based on device */}
      {isMobile ? renderMobileLayout() : renderDesktopLayout()}
    </div>
  );
};