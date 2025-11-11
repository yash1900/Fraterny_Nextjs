'use client';


import { useState } from 'react';
import { CropIcon, ArrowLeft, Check, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import { CropControlsProps } from './types';
import { Slider } from '@/components/ui/slider';

const CropControls = ({
  zoom,
  setZoom,
  rotation,
  setRotation,
  onApplyChanges,
  onCancel
}: CropControlsProps) => {
  const increaseZoom = () => setZoom(Math.min(zoom + 0.1, 3));
  const decreaseZoom = () => setZoom(Math.max(zoom - 0.1, 0.1));
  
  const rotateImage = () => setRotation((rotation + 90) % 360);
  
  const handleZoomChange = (values: number[]) => {
    setZoom(values[0] / 100 * 3);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center text-navy hover:text-navy-dark transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> 
          Back to Preview
        </button>
        
        <button
          type="button"
          onClick={onApplyChanges}
          className="px-3 py-1.5 bg-navy text-white rounded-md flex items-center hover:bg-opacity-90 transition-colors"
        >
          <Check className="w-4 h-4 mr-1.5" /> Apply Crop
        </button>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-navy">Zoom: {Math.round(zoom * 100)}%</span>
            <div className="flex space-x-1">
              <button
                type="button"
                onClick={decreaseZoom}
                className="p-1.5 bg-gray-100 rounded text-navy hover:bg-gray-200 transition-colors"
                title="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={increaseZoom}
                className="p-1.5 bg-gray-100 rounded text-navy hover:bg-gray-200 transition-colors"
                title="Zoom in"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <Slider
            value={[zoom * 100 / 3]}
            min={10}
            max={100}
            step={1}
            onValueChange={handleZoomChange}
            className="w-full"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-navy">Rotation: {rotation}°</span>
            <button
              type="button"
              onClick={rotateImage}
              className="p-1.5 bg-gray-100 rounded text-navy hover:bg-gray-200 transition-colors"
              title="Rotate 90°"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex justify-between">
            {[0, 90, 180, 270].map((deg) => (
              <button
                key={deg}
                type="button"
                onClick={() => setRotation(deg)}
                className={`px-2 py-1 text-xs rounded ${
                  rotation === deg 
                  ? 'bg-navy text-white' 
                  : 'bg-gray-100 text-navy hover:bg-gray-200'
                } transition-colors`}
              >
                {deg}°
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropControls;


