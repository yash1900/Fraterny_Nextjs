'use client';


import { Filter } from 'lucide-react';

interface ImageFiltersProps {
  categories: (string | null)[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

const ImageFilters = ({ categories, selectedCategory, onCategoryChange }: ImageFiltersProps) => {
  return (
    <div className="flex items-center">
      <Filter className="w-4 h-4 text-gray-500 mr-2" />
      <select
        value={selectedCategory || ''}
        onChange={(e) => onCategoryChange(e.target.value || null)}
        className="border border-gray-300 rounded-md shadow-sm p-2 focus:ring-navy focus:border-navy"
      >
        <option value="">All Categories</option>
        {categories.map(category => (
          category && <option key={category} value={category}>{category}</option>
        ))}
      </select>
    </div>
  );
};

export default ImageFilters;

