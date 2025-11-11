'use client';


import { useState, useEffect, RefObject } from 'react';
import { type Crop as CropArea } from 'react-image-crop';
import { getRecommendedAspectRatio } from '../constants';
import LivePreview from '../cropper/LivePreview';

interface LivePreviewProps {
  imgRef: RefObject<HTMLImageElement | null>;
  crop: CropArea;
  completedCrop: CropArea | null;
  zoom: number;
  rotation: number;
  imageKey: string;
  viewMode: 'desktop' | 'mobile';
  setViewMode: (mode: 'desktop' | 'mobile') => void;
}

const CropLivePreview = ({
  imgRef,
  crop,
  completedCrop,
  zoom,
  rotation,
  imageKey,
  viewMode,
  setViewMode
}: LivePreviewProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined);
  const [placeholderLabel, setPlaceholderLabel] = useState<string>('');
  const [objectFit, setObjectFit] = useState<'cover' | 'contain'>('cover');
  
  // Set aspect ratio based on image key
  useEffect(() => {
    if (imageKey) {
      const recommended = getRecommendedAspectRatio(imageKey);
      setAspectRatio(recommended.ratio);
      setPlaceholderLabel(recommended.label);
      
      // Set objectFit based on image type
      if (imageKey.includes('hero') || imageKey.includes('background')) {
        setObjectFit('cover');
      } else {
        setObjectFit('contain');
      }
    }
  }, [imageKey]);
  
  // Generate preview whenever crop, zoom, rotation or the reference image changes
  useEffect(() => {
    if (!imgRef.current || !crop.width || !crop.height) return;

    const canvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    
    // Set canvas dimensions to cropped area size
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Apply center-based transformations
    ctx.save();
    
    // Draw the cropped image
    ctx.drawImage(
      imgRef.current,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );
    
    ctx.restore();
    
    // Clean up previous blob URL
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    
    // Use higher quality for preview
    const dataUrl = canvas.toDataURL('image/jpeg', 1.0);
    setPreviewUrl(dataUrl);
  }, [crop, zoom, rotation, imgRef.current]);
  
  // Cleanup blob URLs when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []);
  
  return (
    <div className="bg-white border rounded-lg p-4">
      <LivePreview 
        previewUrl={previewUrl}
        aspectRatio={aspectRatio}
        placeholderLabel={placeholderLabel}
        objectFit={objectFit}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />
    </div>
  );
};

export default CropLivePreview;


