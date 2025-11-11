'use client';


import { useState } from 'react';
import { Crop as CropIcon, Trash2 } from 'lucide-react';
import { ImageCropHandler } from '../../upload/crop-handler';
import { useIsMobile } from '@/app/admin/hooks/use-mobile';

interface ImagePreviewProps {
  file: File;
  previewUrl: string;
  onCroppedFile: (file: File) => void;
  imageKey: string;
}

const ImagePreview = ({ file, previewUrl, onCroppedFile, imageKey }: ImagePreviewProps) => {
  const [isCropping, setIsCropping] = useState(false);
  const isMobile = useIsMobile();
  
  // Determine if image is used as cover or contain based on usage key
  const getObjectFit = (): 'cover' | 'contain' => {
    if (
      imageKey.includes('hero') || 
      imageKey.includes('background') || 
      imageKey.includes('banner') ||
      imageKey.includes('villalab') ||
      imageKey.includes('experience')
    ) {
      return 'cover';
    }
    return 'contain';
  };
  
  const objectFit = getObjectFit();
  
  const handleStartCrop = () => {
    setIsCropping(true);
  };
  
  const handleCroppedFile = (croppedFile: File) => {
    setIsCropping(false);
    onCroppedFile(croppedFile);
  };
  
  if (isCropping) {
    return (
      <ImageCropHandler 
        imageSrc={previewUrl}
        uploadFile={file}
        onCroppedFile={handleCroppedFile}
        imageKey={imageKey}
      />
    );
  }
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  // Simplified without usage map
  const usageInfo = '';

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="relative border border-gray-200 rounded-lg overflow-hidden">
        {imageKey && (
          <div className="bg-navy bg-opacity-10 rounded-t-lg px-2 py-1 text-xs text-center">
            {objectFit === 'cover' ? 'Image will fill the entire container' : 'Image will be fully visible'}
            {usageInfo && ` • ${usageInfo}`}
          </div>
        )}
        <img 
          src={previewUrl} 
          alt="Preview" 
          className={`w-full ${isMobile ? 'h-48' : 'h-64'} object-${objectFit} bg-gray-50`}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div>
          <p className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'} truncate max-w-[140px] md:max-w-[180px]`}>
            {file.name}
          </p>
          <p className="text-xs text-gray-500">
            {formatFileSize(file.size)}
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleStartCrop}
            className={`${isMobile ? 'p-1.5' : 'p-2'} bg-navy text-white rounded hover:bg-opacity-90`}
            title="Crop Image"
          >
            <CropIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImagePreview;


