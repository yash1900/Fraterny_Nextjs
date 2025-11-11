
import { useState } from 'react';
import { type Crop as CropArea } from 'react-image-crop';

export const useCropState = () => {
  // Image cropping state
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<CropArea>({
    unit: 'px',
    width: 80,
    height: 80,
    x: 10,
    y: 10
  });
  const [completedCrop, setCompletedCrop] = useState<CropArea | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isCropping, setIsCropping] = useState(false);
  
  const resetCropState = () => {
    setImageSrc(null);
    setCrop({
      unit: 'px',
      width: 80,
      height: 80,
      x: 10,
      y: 10
    });
    setCompletedCrop(null);
    setZoom(1);
    setRotation(0);
    setIsCropping(false);
  };
  
  return {
    imageSrc,
    setImageSrc,
    crop,
    setCrop,
    completedCrop,
    setCompletedCrop,
    zoom,
    setZoom,
    rotation,
    setRotation,
    isCropping,
    setIsCropping,
    resetCropState
  };
};


