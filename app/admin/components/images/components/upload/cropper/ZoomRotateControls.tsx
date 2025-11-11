'use client';


import { Minus, Plus, RotateCw } from 'lucide-react';
import { useIsMobile } from '@/app/admin/hooks/use-mobile';

interface ZoomRotateControlsProps {
  zoom: number;
  setZoom: (zoom: number) => void;
  rotation: number;
  setRotation: (rotation: number) => void;
}

const ZoomRotateControls = ({ zoom, setZoom, rotation, setRotation }: ZoomRotateControlsProps) => {
  const isMobile = useIsMobile();

  const increaseZoom = () => {
    setZoom(Math.min(zoom + 0.1, 3));
  };

  const decreaseZoom = () => {
    setZoom(Math.max(zoom - 0.1, 0.1));
  };

  const rotateImage = () => {
    setRotation((rotation + 90) % 360);
  };

  return (
    <div className={`flex items-center ${isMobile ? 'justify-between' : 'justify-center'} gap-4 md:gap-8 mt-6 flex-wrap`}>
      <div className="flex flex-col items-center">
        <p className="text-xs font-medium text-gray-500 mb-2">Zoom</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={decreaseZoom}
            className="p-1.5 md:p-2 bg-gray-100 rounded-full text-navy hover:bg-gray-200 transition-colors"
            disabled={zoom <= 0.1}
          >
            <Minus className="w-3 h-3 md:w-4 md:h-4" />
          </button>
          
          <div className={`w-12 text-center ${isMobile ? 'text-xs' : 'text-sm'}`}>
            <span className="font-medium">{Math.round(zoom * 100)}%</span>
          </div>
          
          <button
            type="button"
            onClick={increaseZoom}
            className="p-1.5 md:p-2 bg-gray-100 rounded-full text-navy hover:bg-gray-200 transition-colors"
            disabled={zoom >= 3}
          >
            <Plus className="w-3 h-3 md:w-4 md:h-4" />
          </button>
        </div>
      </div>
      
      <div className="flex flex-col items-center">
        <p className="text-xs font-medium text-gray-500 mb-2">Rotation</p>
        <button
          type="button"
          onClick={rotateImage}
          className="p-1.5 md:p-2 bg-gray-100 rounded-full text-navy hover:bg-gray-200 transition-colors"
        >
          <RotateCw className="w-3 h-3 md:w-4 md:h-4" />
          <span className="sr-only">Rotate 90°</span>
        </button>
      </div>
    </div>
  );
};

export default ZoomRotateControls;


