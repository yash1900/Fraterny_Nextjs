'use client';


import { CropIcon } from 'lucide-react';

interface ImagePreviewProps {
  imageSrc: string;
  onToggleCrop: () => void;
}

const ImagePreview = ({ imageSrc, onToggleCrop }: ImagePreviewProps) => {
  return (
    <div className="flex flex-col items-center">
      <img 
        src={imageSrc} 
        alt="Preview" 
        className="max-h-[300px] object-contain mb-3" 
      />
      <button
        type="button"
        onClick={onToggleCrop}
        className="px-3 py-1.5 bg-gray-200 text-navy rounded-md flex items-center hover:bg-gray-300 transition-colors"
      >
        <CropIcon className="w-4 h-4 mr-1.5" /> Crop Image
      </button>
    </div>
  );
};

export default ImagePreview;


