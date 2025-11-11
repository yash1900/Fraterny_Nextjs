// ProgressRail.tsx
'use client';

import React from 'react';
import { tokens } from '../utils/constants';
import { sectionIds } from '../utils/sectionHelpers';

interface ProgressRailProps {
  activeIndex: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export const ProgressRail: React.FC<ProgressRailProps> = ({ activeIndex, containerRef }) => {
  const handleDotClick = (id: string) => {
    containerRef.current?.querySelector(`#${id}`)?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  };

  return (
    <div className="fixed right-2 top-1/2 z-[55] -translate-y-1/2 flex flex-col items-center gap-2">
      {sectionIds.map((id, i) => (
        <button
          key={id}
          aria-label={`Jump to ${id}`}
          onClick={() => handleDotClick(id)}
          className="transition-all"
          style={{
            width: 6,
            height: i === activeIndex ? 20 : 6,
            borderRadius: 9999,
            background: i === activeIndex ? tokens.accent : 'rgba(10,10,10,0.25)'
          }}
        />
      ))}
    </div>
  );
};