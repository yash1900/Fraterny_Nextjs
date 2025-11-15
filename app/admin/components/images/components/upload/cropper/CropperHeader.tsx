'use client';


import { ArrowLeft, Check } from 'lucide-react';
import { useIsMobile } from '@/app/admin/hooks/use-mobile';

interface CropperHeaderProps {
  onApplyChanges: () => void;
  onCancelCrop: () => void;
  imageKey: string;
}

const CropperHeader = ({ onApplyChanges, onCancelCrop, imageKey }: CropperHeaderProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex ${isMobile ? 'flex-col' : 'justify-between'} items-start sm:items-center mb-4 gap-3 relative z-20`}>
      <button
        type="button"
        onClick={onCancelCrop}
        className={`text-navy hover:text-navy-dark transition-colors flex items-center gap-1.5 ${isMobile ? 'w-full justify-center py-2 border border-gray-200 rounded-md' : ''}`}
      >
        <ArrowLeft className="w-4 h-4" />
        <span className={isMobile ? "text-sm" : ""}>Back</span>
      </button>
      
      <button
        type="button"
        onClick={onApplyChanges}
        className={`flex items-center gap-1.5 bg-navy text-white px-3 py-1.5 rounded-md hover:bg-opacity-90 text-sm md:text-base ${isMobile ? 'w-full justify-center py-2' : ''}`}
      >
        <Check className="w-4 h-4" />
        <span>Apply</span>
      </button>
    </div>
  );
};

export default CropperHeader;


