'use client';


import { Dialog, DialogContent } from '@/components/ui/dialog';
import ModalHeader from './ModalHeader';
import UploadForm from './UploadForm';
import { useIsMobile } from '@/app/admin/hooks/use-mobile';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UploadModal = ({ isOpen, onClose }: UploadModalProps) => {
  const isMobile = useIsMobile();
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className={`bg-white rounded-lg w-full ${isMobile ? 'max-w-full h-[95vh]' : 'max-w-3xl max-h-[90vh]'} overflow-y-auto`}>
        <ModalHeader title="Add New Image" onClose={onClose} />
        <div className="p-3 md:p-6 overflow-y-auto">
          <UploadForm onClose={onClose} />
        </div>
      </div>
    </div>
  );
};

export default UploadModal;


