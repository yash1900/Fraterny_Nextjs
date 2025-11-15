'use client';


import { useState, useEffect } from 'react';
import { Move } from 'lucide-react';
import ReactCrop, { type Crop as CropArea } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { ImageCropperProps } from './types';
import CropperHeader from './CropperHeader';
import CropLivePreview from '../crop-handler/LivePreview';
import ZoomRotateControls from './ZoomRotateControls';
import { getRecommendedAspectRatio } from '../constants';
import { useIsMobile } from '@/app/admin/hooks/use-mobile';

const ImageCropper = ({
  imageSrc,
  crop,
  setCrop,
  setCompletedCrop,
  zoom,
  setZoom,
  rotation,
  setRotation,
  imgRef,
  onApplyChanges,
  onCancelCrop,
  imageKey
}: ImageCropperProps) => {
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined);
  const [placeholderLabel, setPlaceholderLabel] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [cropLocked, setCropLocked] = useState(true);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('mobile');
  const isMobile = useIsMobile();

  // Set aspect ratio based on image key
  useEffect(() => {
    if (imageKey) {
      const recommended = getRecommendedAspectRatio(imageKey);
      setAspectRatio(recommended.ratio);
      setPlaceholderLabel(recommended.label);
      
      // Lock crop by default
      setCropLocked(true);
      
      // Default to mobile view for mobile-specific keys
      if (imageKey.includes('-mobile')) {
        setViewMode('mobile');
      }
    }
  }, [imageKey]);

  // Initialize crop area with recommended aspect ratio when image loads
  const initializeCrop = (width: number, height: number) => {
    if (!aspectRatio) return;
    
    let cropWidth, cropHeight;
    
    if (aspectRatio > 1) {
      // Landscape
      cropWidth = width * 0.8;
      cropHeight = cropWidth / aspectRatio;
    } else {
      // Portrait or square
      cropHeight = height * 0.8;
      cropWidth = cropHeight * aspectRatio;
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
    <div className="flex flex-col relative z-10">
      <CropperHeader 
        onApplyChanges={onApplyChanges}
        onCancelCrop={onCancelCrop}
        imageKey={imageKey}
      />
      
      <div className={`grid ${isMobile ? 'grid-cols-1 gap-4' : 'grid-cols-1 lg:grid-cols-3 gap-6'}`}>
        <div className={`${isMobile ? '' : 'lg:col-span-2'} relative bg-gray-50 rounded-lg border border-gray-200 p-4 z-10`}>
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
            aspect={cropLocked ? aspectRatio : undefined}
            locked={false}
            className="max-h-[400px] flex justify-center react-crop-container relative z-0"
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop Preview"
              style={{
                maxHeight: isMobile ? '300px' : '500px',
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: 'center',
                transition: 'transform 0.2s ease-in-out'
              }}
              onLoad={(e) => {
                const { width, height } = e.currentTarget;
                initializeCrop(width, height);
              }}
            />
          </ReactCrop>
          
          {isDragging && (
            <div className="absolute top-0 left-0 right-0 bg-navy text-white text-center py-1 text-xs md:text-sm z-20">
              Dragging selection...
            </div>
          )}
          
          <div className="mt-4 w-full flex items-center justify-center text-gray-500 gap-2 text-xs md:text-sm relative z-10">
            <Move className="w-4 h-4" />
            <p>{isMobile ? 'Drag to position' : 'Drag to position the image in the placeholder • Use controls to zoom and rotate'}</p>
          </div>

          <div className="mt-2 flex justify-center relative z-10">
            <label className="inline-flex items-center">
              <input 
                type="checkbox" 
                checked={cropLocked} 
                onChange={(e) => setCropLocked(e.target.checked)}
                className="rounded text-navy focus:ring-navy h-4 w-4"
              />
              <span className="ml-2 text-xs text-gray-600">Lock aspect ratio for website display</span>
            </label>
          </div>
        </div>
        
        {!isMobile && (
          <div className="bg-white border rounded-lg p-4 relative z-10">
            <CropLivePreview
              imgRef={imgRef}
              crop={crop}
              completedCrop={null}
              zoom={zoom}
              rotation={rotation}
              imageKey={imageKey}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />
          </div>
        )}
      </div>
      
      <div className="relative z-10">
        <ZoomRotateControls 
          zoom={zoom}
          setZoom={setZoom}
          rotation={rotation}
          setRotation={setRotation}
        />
      </div>
      
      {isMobile && (
        <div className="mt-6 bg-white border rounded-lg p-4 relative z-10">
          <CropLivePreview
            imgRef={imgRef}
            crop={crop}
            completedCrop={null}
            zoom={zoom}
            rotation={rotation}
            imageKey={imageKey}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        </div>
      )}
      
      <style>{`
        .ReactCrop {
          position: relative;
          display: inline-block;
        }
        .ReactCrop__crop-selection {
          border: 2px solid #0A1A2F !important;
          box-shadow: none !important;
          position: absolute !important;
        }
        .ReactCrop__drag-handle {
          background-color: #0A1A2F !important;
          width: 10px !important;
          height: 10px !important;
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
      `}</style>
    </div>
  );
};

export default ImageCropper;


