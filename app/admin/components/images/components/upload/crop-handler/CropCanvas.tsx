'use client';


import { RefObject, useState } from 'react';
import { Move } from 'lucide-react';
import ReactCrop, { type Crop as CropArea } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { getRecommendedAspectRatio } from '../constants';

interface CropCanvasProps {
  imageSrc: string;
  imgRef: RefObject<HTMLImageElement | null>;
  crop: CropArea;
  setCrop: (crop: CropArea) => void;
  setCompletedCrop: (crop: CropArea) => void;
  zoom: number;
  rotation: number;
  imageKey: string;
  onImageLoad?: () => void;
}

const CropCanvas = ({
  imageSrc,
  imgRef,
  crop,
  setCrop,
  setCompletedCrop,
  zoom,
  rotation,
  imageKey,
  onImageLoad
}: CropCanvasProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (onImageLoad) onImageLoad();

    // Set initial crop to center of image with recommended aspect ratio
    const { width, height } = e.currentTarget;
    const recommendedAspect = imageKey ? getRecommendedAspectRatio(imageKey).ratio : undefined;
    let cropWidth, cropHeight;
    
    if (recommendedAspect) {
      if (recommendedAspect > 1) {
        // Landscape
        cropWidth = width * 0.8;
        cropHeight = cropWidth / recommendedAspect;
      } else {
        // Portrait or square
        cropHeight = height * 0.8;
        cropWidth = cropHeight * recommendedAspect;
      }
    } else {
      // No aspect ratio constraint
      cropWidth = width * 0.8;
      cropHeight = height * 0.8;
    }
    
    const x = (width - cropWidth) / 2;
    const y = (height - cropHeight) / 2;
    
    setCrop({
      unit: 'px',
      x,
      y,
      width: cropWidth,
      height: cropHeight
    } as CropArea);
  };
  
  return (
    <div className="relative bg-gray-50 rounded-lg border border-gray-200 p-4">
      <ReactCrop
        crop={crop}
        onChange={(c) => {
          setCrop(c);
          setIsDragging(true);
        }}
        onComplete={(c) => {
          setCompletedCrop(c);
          setIsDragging(false);
        }}
        aspect={imageKey ? getRecommendedAspectRatio(imageKey).ratio : undefined}
        className="max-h-[500px] flex justify-center"
      >
        <img
          ref={imgRef}
          src={imageSrc}
          alt="Crop Preview"
          style={{
            maxHeight: '500px',
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transformOrigin: 'center',
            transition: 'transform 0.2s ease-in-out'
          }}
          onLoad={handleImageLoad}
        />
      </ReactCrop>
      
      {isDragging && (
        <div className="absolute top-0 left-0 right-0 bg-navy text-white text-center py-1 text-sm">
          Dragging selection...
        </div>
      )}
      
      <div className="mt-4 w-full flex items-center justify-center text-gray-500 gap-2 text-sm">
        <Move className="w-4 h-4" />
        <p>Drag to position the image in the placeholder • Use controls to zoom and rotate</p>
      </div>
      
      <style>
        {`
        .ReactCrop__crop-selection {
          border: 2px solid #0A1A2F;
          box-shadow: 0 0 0 9999em rgba(0, 0, 0, 0.5);
        }
        .ReactCrop__drag-handle {
          background-color: #0A1A2F;
          width: 10px;
          height: 10px;
        }
        .ReactCrop__drag-handle:after {
          width: 10px;
          height: 10px;
          background-color: rgba(10, 26, 47, 0.5);
        }
        .ReactCrop__drag-handle.ord-nw, 
        .ReactCrop__drag-handle.ord-ne,
        .ReactCrop__drag-handle.ord-sw,
        .ReactCrop__drag-handle.ord-se {
          width: 12px;
          height: 12px;
        }
        `}
      </style>
    </div>
  );
};

export default CropCanvas;


