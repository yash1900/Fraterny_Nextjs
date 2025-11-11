'use client';


import { PlusCircle, FilterX } from 'lucide-react';

interface EmptyStateProps {
  selectedCategory: string | null;
  searchTerm?: string;
  onClearFilter: () => void;
  onUploadClick: () => void;
}

const EmptyState = ({ selectedCategory, searchTerm, onClearFilter, onUploadClick }: EmptyStateProps) => {
  const isFiltered = selectedCategory !== null || (searchTerm && searchTerm.length > 0);
  
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="bg-gray-100 rounded-full p-3 mb-4">
        {isFiltered ? (
          <FilterX className="h-8 w-8 text-gray-500" />
        ) : (
          <PlusCircle className="h-8 w-8 text-gray-500" />
        )}
      </div>
      
      {isFiltered ? (
        <>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No images found</h3>
          <p className="text-sm text-gray-500 mb-6">
            {selectedCategory && searchTerm 
              ? `No images found in category "${selectedCategory}" matching "${searchTerm}"`
              : selectedCategory 
                ? `No images found in category "${selectedCategory}"`
                : `No images found matching "${searchTerm}"`}
          </p>
          <button
            onClick={onClearFilter}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <FilterX className="mr-2 h-4 w-4" />
            Clear filters
          </button>
        </>
      ) : (
        <>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No images yet</h3>
          <p className="text-sm text-gray-500 mb-6">Upload your first image to get started</p>
          <button
            onClick={onUploadClick}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-navy hover:bg-navy-dark"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Upload image
          </button>
        </>
      )}
    </div>
  );
};

export default EmptyState;

