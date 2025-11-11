'use client';


import { X } from 'lucide-react';

interface ModalHeaderProps {
  onClose: () => void;
  title: string;
}

const ModalHeader = ({ onClose, title }: ModalHeaderProps) => {
  return (
    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
      <h2 className="text-xl font-medium text-navy">{title}</h2>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ModalHeader;


