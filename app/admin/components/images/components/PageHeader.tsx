'use client';

import { PlusCircle, ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/app/admin/hooks/use-mobile';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  onUploadClick: () => void;
}

const PageHeader = ({ onUploadClick }: PageHeaderProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Image Management</h1>
      <button 
        onClick={onUploadClick}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md text-sm font-medium transition-colors"
      >
        <PlusCircle className="w-5 h-5" />
        Add New Image
      </button>
    </div>
  );
};

export default PageHeader;

