
import { useState } from 'react';
import { type Crop as CropArea } from 'react-image-crop';

export interface UploadFormState {
  key: string;
  description: string;
  alt_text: string;
  category: string;
  file: File | null;
}

export const useFormState = () => {
  // Form state for upload
  const [uploadForm, setUploadForm] = useState<UploadFormState>({
    key: '',
    description: '',
    alt_text: '',
    category: '',
    file: null
  });
  
  const resetUploadForm = () => {
    setUploadForm({
      key: '',
      description: '',
      alt_text: '',
      category: '',
      file: null
    });
  };
  
  return {
    uploadForm,
    setUploadForm,
    resetUploadForm
  };
};


