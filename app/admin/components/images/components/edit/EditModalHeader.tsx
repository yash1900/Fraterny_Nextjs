'use client';


import { X } from 'lucide-react';

interface EditModalHeaderProps {
  onClose: () => void;
}

const EditModalHeader = ({ onClose }: EditModalHeaderProps) => {
  return (
    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
      <h2 className="text-xl font-medium text-navy">Edit Image</h2>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export default EditModalHeader;


