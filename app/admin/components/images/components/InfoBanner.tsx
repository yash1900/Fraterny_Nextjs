'use client';


import React from 'react';
import { Info } from 'lucide-react';

const InfoBanner = () => {
  return (
    <div className="p-4 bg-navy bg-opacity-5 border-b border-navy border-opacity-20">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-navy flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium text-navy">Image Management System</h3>
          <p className="text-sm text-gray-700 mt-1">
            This system allows you to upload and manage images used throughout the website. 
            Images with predefined keys (marked as "Website Image") will automatically replace placeholder 
            images on the website. Upload new images with the same keys to update content in real-time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default InfoBanner;

