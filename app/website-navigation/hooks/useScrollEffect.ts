'use client';


import { useState, useEffect, useCallback } from 'react';

export const useScrollEffect = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPastHero, setIsPastHero] = useState(false);

  const handleScroll = useCallback(() => {
    const scrollPosition = window.scrollY;
    requestAnimationFrame(() => {
      setIsScrolled(scrollPosition > 20);
      setIsPastHero(scrollPosition > 100);
    });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return { isScrolled, isPastHero };
};
