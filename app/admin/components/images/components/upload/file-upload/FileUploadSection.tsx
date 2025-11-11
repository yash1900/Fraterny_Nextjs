'use client';


import { useState } from 'react';
import FileInput from './FileInput';
import ImagePreview from './ImagePreview';
import { Card } from '@/components/ui/card';
import { useIsMobile } from '@/app/admin/hooks/use-mobile';

interface FileUploadSectionProps {
  file: File | null;
  previewUrl: string | null;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCroppedFile: (file: File) => void;
  imageKey: string;
}

const FileUploadSection = ({ 
  file, 
  previewUrl, 
  onFileChange, 
  onCroppedFile,
  imageKey
}: FileUploadSectionProps) => {
  const [isFileSelected, setIsFileSelected] = useState(false);
  const isMobile = useIsMobile();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const hasFile = !!(event.target.files && event.target.files.length > 0);
    setIsFileSelected(hasFile);
    onFileChange(event);
  };

  return (
    <Card className="p-3 md:p-5 bg-white border border-gray-200 rounded-lg w-full">
      <h3 className="font-medium text-navy mb-2 md:mb-3 text-sm md:text-base">Upload Image</h3>
      
      {!previewUrl ? (
        <FileInput 
          onFileChange={handleFileChange} 
          isFileSelected={isFileSelected} 
        />
      ) : file && (
        <ImagePreview 
          file={file} 
          previewUrl={previewUrl}
          onCroppedFile={onCroppedFile}
          imageKey={imageKey}
        />
      )}
    </Card>
  );
};

export default FileUploadSection;


