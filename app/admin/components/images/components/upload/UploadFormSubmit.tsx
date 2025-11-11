'use client';


import { Upload, CheckCircle } from 'lucide-react';
import { useIsMobile } from '@/app/admin/hooks/use-mobile';

interface UploadFormSubmitProps {
  onCancel: () => void;
  isPending: boolean;
  isSuccess?: boolean;
}

const UploadFormSubmit = ({ onCancel, isPending, isSuccess }: UploadFormSubmitProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`flex ${isMobile ? 'flex-col' : 'justify-end'} gap-3`}>
      <button
        type="button"
        onClick={onCancel}
        className={`px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors ${isMobile ? 'w-full' : ''}`}
      >
        Cancel
      </button>
      <button
        type="submit"
        className={`px-4 py-2 bg-terracotta text-white rounded-md hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2 ${isMobile ? 'w-full' : ''}`}
        disabled={isPending || isSuccess}
      >
        {isPending ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
            Uploading...
          </>
        ) : isSuccess ? (
          <>
            <CheckCircle className="w-4 h-4" />
            Uploaded
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            Upload
          </>
        )}
      </button>
    </div>
  );
};

export default UploadFormSubmit;


