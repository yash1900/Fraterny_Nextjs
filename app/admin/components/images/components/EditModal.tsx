'use client';

import { WebsiteImage } from '../hooks/useImageManagement';
import { 
  EditModalHeader, 
  EditModalFooter, 
  EditFormFields, 
  ImagePreview,
  useEditImage 
} from './edit';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useIsMobile } from '@/app/admin/hooks/use-mobile';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: WebsiteImage;
}

const EditModal = ({ isOpen, onClose, image }: EditModalProps) => {
  const {
    previewUrl,
    file,
    isReplacing,
    editForm,
    setEditForm,
    updateMutation,
    replaceImageMutation,
    handleEditSubmit,
    handleFileChange,
    handleCroppedFile,
    cancelReplacement,
    resetAllState,
    imageLoading
  } = useEditImage(image, onClose);
  
  // Enhanced close handler with cleanup
  const handleClose = () => {
    resetAllState();
    onClose();
  };
  
  const isPending = updateMutation.isPending || replaceImageMutation.isPending;
  const isMobile = useIsMobile();
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-lg ${isMobile ? 'w-full' : 'max-w-[90rem] w-full'} max-h-[90vh] overflow-y-auto`}>
        <EditModalHeader onClose={handleClose} />
        
        <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
          <ImagePreview 
            previewUrl={previewUrl} 
            image={image} 
            isReplacing={isReplacing}
            file={file}
            onFileChange={handleFileChange}
            onCroppedFile={handleCroppedFile}
            onCancelReplace={cancelReplacement}
            imageLoading={imageLoading}
          />
          
          {!isReplacing && (
            <EditFormFields 
              editForm={editForm}
              setEditForm={setEditForm}
              image={image}
            />
          )}
          
          <EditModalFooter 
            onClose={handleClose}
            isPending={isPending}
          />
        </form>
      </div>
    </div>
  );
};

export default EditModal;

