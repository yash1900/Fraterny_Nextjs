'use client';


import { ChangeEvent, useState } from 'react';
import { Upload } from 'lucide-react';
import { useIsMobile } from '@/app/admin/hooks/use-mobile';

export interface FileInputProps {
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  isFileSelected?: boolean;
}

const FileInput = ({ onFileChange, isFileSelected = false }: FileInputProps) => {
  const [dragActive, setDragActive] = useState(false);
  const isMobile = useIsMobile();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const event = {
        target: {
          files: e.dataTransfer.files
        }
      } as unknown as ChangeEvent<HTMLInputElement>;
      
      onFileChange(event);
    }
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg ${isMobile ? 'p-4' : 'p-8'} flex flex-col items-center justify-center text-center transition-colors
        ${dragActive ? 'border-navy bg-navy/5' : 'border-gray-300'}
        ${isFileSelected ? 'bg-green-50 border-green-300' : 'bg-gray-50'}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className={`${isMobile ? 'w-8 h-8 mb-2' : 'w-12 h-12 mb-4'} rounded-full bg-navy/10 flex items-center justify-center`}>
        <Upload className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'} text-navy`} />
      </div>
      
      <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>
        {isFileSelected ? 'File selected' : (isMobile ? 'Tap to upload' : 'Drag & drop your image here')}
      </p>
      <p className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-500 mt-1`}>
        PNG, JPG, WebP, or SVG (max. 50MB)
      </p>
      
      <label className={`mt-${isMobile ? '3' : '4'} cursor-pointer`}>
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={onFileChange}
        />
        <span className={`px-3 py-1.5 ${isMobile ? 'text-xs' : 'text-sm'} bg-navy text-white rounded-md hover:bg-opacity-90 transition-colors`}>
          {isFileSelected ? 'Select Different File' : 'Browse Files'}
        </span>
      </label>
    </div>
  );
};

export default FileInput;


