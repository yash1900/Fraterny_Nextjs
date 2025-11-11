'use client';

import React, { useState, useEffect } from 'react';
import ResponsiveImage from '@/components/ui/ResponsiveImage';

// Updated gallery images with dynamic keys
const experienceImages = [
  {
    dynamicKey: "experience-villa-retreat",
    fallback: {
      mobile: "/images/experience/villa-retreat-mobile.webp",
      tablet: "/images/experience/villa-retreat-tablet.webp",
      desktop: "/images/experience/villa-retreat-desktop.webp"
    },
    alt: "Luxury villa retreat where entrepreneurs gather for deep connections",
    loadingMessage: "Loading villa retreat..."
  },
  {
    dynamicKey: "experience-workshop",
    fallback: {
      mobile: "/images/experience/workshop-mobile.webp",
      tablet: "/images/experience/workshop-tablet.webp",
      desktop: "/images/experience/workshop-desktop.webp"
    },
    alt: "Interactive workshop session with driven professionals",
    loadingMessage: "Loading workshop session..."
  },
  {
    dynamicKey: "experience-networking",
    fallback: {
      mobile: "/images/experience/networking-mobile.webp",
      tablet: "/images/experience/networking-tablet.webp",
      desktop: "/images/experience/networking-desktop.webp"
    },
    alt: "Meaningful networking among ambitious individuals",
    loadingMessage: "Loading networking moments..."
  },
  {
    dynamicKey: "experience-collaboration",
    fallback: {
      mobile: "/images/experience/collaboration-mobile.webp",
      tablet: "/images/experience/collaboration-tablet.webp",
      desktop: "/images/experience/collaboration-desktop.webp"
    },
    alt: "Collaborative problem-solving in a premium environment",
    loadingMessage: "Loading collaboration spaces..."
  },
  {
    dynamicKey: "experience-evening-session",
    fallback: {
      mobile: "/images/experience/evening-session-mobile.webp",
      tablet: "/images/experience/evening-session-tablet.webp",
      desktop: "/images/experience/evening-session-desktop.webp"
    },
    alt: "Evening mastermind session with panoramic views",
    loadingMessage: "Loading evening sessions..."
  },
  {
    dynamicKey: "experience-gourmet-dining",
    fallback: {
      mobile: "/images/experience/gourmet-dining-mobile.webp",
      tablet: "/images/experience/gourmet-dining-tablet.webp",
      desktop: "/images/experience/gourmet-dining-desktop.webp"
    },
    alt: "Gourmet dining experience bringing people together",
    loadingMessage: "Loading dining experiences..."
  }
];

const ImageGallery = () => {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [loadingProgress, setLoadingProgress] = useState<number>(0);

  // Progressive image loading with progress tracking
  useEffect(() => {
    const loadImage = (index: number) => {
      setTimeout(() => {
        setLoadedImages(prev => {
          const newSet = new Set(prev).add(index);
          // Update progress
          setLoadingProgress(Math.round((newSet.size / experienceImages.length) * 100));
          return newSet;
        });
      }, 500 + (index * 300)); // First at 500ms, then every 300ms
    };

    experienceImages.forEach((_, index) => {
      loadImage(index);
    });
  }, []);

  // Beautiful loading messages
  const getLoadingMessage = (index: number) => {
    return experienceImages[index]?.loadingMessage || "Loading experience...";
  };

  const getProgressMessage = (index: number) => {
    const messages = [
      "Preparing your experience...",
      "Curating the perfect moments...",
      "Bringing stories to life...",
      "Almost there...",
      "Final touches...",
      "Experience ready!"
    ];
    return messages[index] || messages[messages.length - 1];
  };

  return (
    <section className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-2">
        {experienceImages.map((image, index) => (
          <div 
            key={index} 
            className="aspect-[4/3] w-full relative overflow-hidden group"
          >
            {/* Beautiful Loading State */}
            {!loadedImages.has(index) && (
              <div className="absolute inset-0 bg-gradient-to-br from-navy/5 via-gray-50 to-terracotta/5 flex flex-col items-center justify-center p-4">
                {/* Animated Spinner */}
                <div className="relative mb-4">
                  <div className="w-12 h-12 border-4 border-gray-200 border-t-terracotta rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-b-navy/20 rounded-full animate-pulse"></div>
                </div>
                
                {/* Loading Message */}
                <div className="text-center">
                  <p className="text-sm font-medium text-navy mb-1">
                    {getLoadingMessage(index)}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">
                    {getProgressMessage(index)}
                  </p>
                  
                  {/* Progress Indicator */}
                  <div className="flex items-center gap-1 justify-center">
                    <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-terracotta to-navy rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min(((index + 1) / experienceImages.length) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-400 ml-1">
                      {Math.round(((index + 1) / experienceImages.length) * 100)}%
                    </span>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-4 left-4 w-2 h-2 bg-terracotta/20 rounded-full animate-pulse"></div>
                <div className="absolute top-6 right-6 w-1 h-1 bg-navy/30 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute bottom-8 left-6 w-1.5 h-1.5 bg-terracotta/15 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                
                {/* Subtle Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div 
                    className="w-full h-full animate-float"
                    style={{
                      backgroundImage: `radial-gradient(circle at 20% 50%, rgba(224, 122, 95, 0.1) 1px, transparent 1px),
                                       radial-gradient(circle at 80% 20%, rgba(10, 26, 47, 0.1) 1px, transparent 1px)`,
                      backgroundSize: '30px 30px',
                      animationDuration: `${2 + (index % 3) * 0.5}s`
                    }}
                  />
                </div>
              </div>
            )}
            
            {/* Image with smooth fade-in */}
            <div className={`w-full h-full transition-all duration-700 ease-out ${
              loadedImages.has(index) 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-105'
            }`}>
              <ResponsiveImage 
                alt={image.alt}
                loading={index < 2 ? "eager" : "lazy"}
                dynamicKey={image.dynamicKey}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              
              {/* Subtle overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Overall Progress Indicator */}
      {loadingProgress < 100 && (
        <div className="mt-6 text-center">
          <div className="max-w-md mx-auto">
            <p className="text-sm text-gray-600 mb-2">
              Loading your experience gallery...
            </p>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-terracotta via-navy to-terracotta rounded-full transition-all duration-500 ease-out"
                style={{ width: `${loadingProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {loadingProgress}% complete
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default ImageGallery;