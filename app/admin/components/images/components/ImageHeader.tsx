'use client';


import React from 'react';
import { Info } from 'lucide-react';
import SearchBar from './SearchBar';
import ImageFilters from './ImageFilters';

interface ImageHeaderProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  onSearch: (e: React.FormEvent) => void;
  categories: string[];
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
}

const ImageHeader = ({ 
  searchTerm, 
  setSearchTerm, 
  onSearch, 
  categories, 
  selectedCategory, 
  setSelectedCategory 
}: ImageHeaderProps) => {
  return (
    <div className="p-6 border-b border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl font-medium text-navy">Website Images</h2>
          <p className="text-gray-600 mt-1">Manage the images used throughout the website</p>
        </div>
        
        <div className="flex flex-col sm:flex-row w-full sm:w-auto items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <SearchBar 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onSubmit={onSearch}
          />
          
          {categories.length > 0 && (
            <ImageFilters 
              categories={categories} 
              selectedCategory={selectedCategory} 
              onCategoryChange={setSelectedCategory} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageHeader;

