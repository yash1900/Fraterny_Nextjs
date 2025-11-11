'use client';


import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { type Crop as CropArea } from 'react-image-crop';
import { CropIcon, ArrowLeft } from 'lucide-react';
import { getRecommendedAspectRatio } from '../constants';
import { ImageCropper } from '../cropper';

interface ImageCropHandlerProps {
  imageSrc: string;
  uploadFile: File;
  onCroppedFile: (file: File) => void;
  imageKey: string;
}

const ImageCropHandler = ({ 
  imageSrc, 
  uploadFile, 
  onCroppedFile,
  imageKey
}: ImageCropHandlerProps) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<CropArea>({
    unit: '%',
    width: 80,
    height: 80,
    x: 10,
    y: 10
  });
  const [completedCrop, setCompletedCrop] = useState<CropArea | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Initialize crop with recommended aspect ratio
  useEffect(() => {
    if (imageKey && imgRef.current) {
      // Get recommended aspect ratio for this image type
      const recommended = getRecommendedAspectRatio(imageKey);
      
      // Make sure image is loaded before calculating dimensions
      if (imgRef.current.complete) {
        initializeCropBasedOnRatio(recommended.ratio);
      } else {
        imgRef.current.onload = () => initializeCropBasedOnRatio(recommended.ratio);
      }
    }
  }, [imageKey]);
  
  // Initialize the crop area with recommended aspect ratio
  const initializeCropBasedOnRatio = (ratio: number) => {
    if (!imgRef.current) return;
    
    const { width, height } = imgRef.current;
    let cropWidth, cropHeight;
    
    if (ratio > 1) {
      // Landscape oriented image placeholder
      cropWidth = width * 0.8;
      cropHeight = cropWidth / ratio;
    } else {
      // Portrait oriented image placeholder
      cropHeight = height * 0.8;
      cropWidth = cropHeight * ratio;
    }
    
    // Center the crop area
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

  const applyChanges = async () => {
    if (!completedCrop || !imgRef.current) {
      toast.error('Please make a crop selection first');
      return;
    }

    const croppedFile = await getCroppedImg(uploadFile.name, uploadFile.type);
    if (croppedFile) {
      onCroppedFile(croppedFile);
      toast.success('Crop applied successfully');
    } else {
      toast.error('Failed to create cropped image');
    }
  };

  const getCroppedImg = async (fileName: string, fileType: string): Promise<File | null> => {
    if (!imgRef.current || !completedCrop) {
      return null;
    }
    
    const canvas = document.createElement('canvas');
    const image = imgRef.current;
    const crop = completedCrop;
    
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return null;
    }
    
    // Set exact dimensions based on cropped area
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    
    ctx.save();
    
    // Apply zoom and rotation if needed
    if (rotation !== 0 || zoom !== 1) {
      // Center the transformation
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
    }
    
    // Draw the cropped image
    ctx.drawImage(
      image,
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
    
    // Convert to File object with original quality
    return new Promise<File | null>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          
          const file = new File([blob], fileName, {
            type: fileType,
            lastModified: Date.now(),
          });
          
          resolve(file);
        },
        fileType,
        1.0 // Use maximum quality to preserve details
      );
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={() => onCroppedFile(uploadFile)}
          className="flex items-center text-navy hover:text-navy-dark transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> 
          Back to Preview
        </button>
        
        <button
          type="button"
          onClick={applyChanges}
          className="px-3 py-1.5 bg-navy text-white rounded-md flex items-center hover:bg-opacity-90 transition-colors"
        >
          <CropIcon className="w-4 h-4 mr-1.5" /> Apply Crop
        </button>
      </div>
      
      <ImageCropper
        imageSrc={imageSrc}
        crop={crop}
        setCrop={setCrop}
        setCompletedCrop={setCompletedCrop}
        zoom={zoom}
        setZoom={setZoom}
        rotation={rotation}
        setRotation={setRotation}
        imgRef={imgRef}
        onApplyChanges={applyChanges}
        onCancelCrop={() => onCroppedFile(uploadFile)}
        imageKey={imageKey}
      />
    </div>
  );
};

export default ImageCropHandler;


