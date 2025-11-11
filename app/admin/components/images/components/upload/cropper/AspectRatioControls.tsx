'use client';


import { useState } from 'react';
import { AspectRatioOption } from './types';

interface AspectRatioControlsProps {
  aspectRatio: number | undefined;
  setAspectRatio: (ratio: number | undefined) => void;
}

const AspectRatioControls = ({ aspectRatio, setAspectRatio }: AspectRatioControlsProps) => {
  const options: AspectRatioOption[] = [
    { value: undefined, label: 'Free' },
    { value: 1 / 1, label: '1:1' },
    { value: 16 / 9, label: '16:9' },
    { value: 4 / 3, label: '4:3' },
    { value: 3 / 2, label: '3:2' },
    { value: 3 / 1, label: '3:1' },
  ];

  return (
    <div className="flex flex-wrap gap-2 justify-center mt-4">
      {options.map((option) => (
        <button
          key={option.label}
          type="button"
          className={`px-3 py-1 text-xs rounded-full border ${
            option.value === aspectRatio
              ? 'bg-navy text-white border-navy'
              : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => setAspectRatio(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default AspectRatioControls;


