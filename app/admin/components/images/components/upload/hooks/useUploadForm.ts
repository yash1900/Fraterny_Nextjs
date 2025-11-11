
import { useFormState } from './useFormState';
import { useCropState } from './useCropState';
import { useUploadImageMutation } from './useUploadMutation';

// Import and re-export the type with the 'type' keyword
import type { UploadFormState } from './useFormState';

// Re-export as a type
export type { UploadFormState };
export { useUploadImageMutation };

export const useUploadForm = () => {
  const formState = useFormState();
  const cropState = useCropState();
  
  const resetAll = () => {
    formState.resetUploadForm();
    cropState.resetCropState();
  };
  
  return {
    ...formState,
    ...cropState,
    resetUploadForm: resetAll
  };
};


