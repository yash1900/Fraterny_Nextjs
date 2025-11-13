import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, Filter, Search, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface BlogFilterProps {
  categories: string[];
  tags: string[];
  selectedCategory: string | null;
  selectedTag: string | null;
  onSelectCategory: (category: string | null) => void;
  onSelectTag: (tag: string | null) => void;
  onSearch: (query: string) => void;
}

const BlogFilter: React.FC<BlogFilterProps> = ({
  categories,
  tags,
  selectedCategory,
  selectedTag,
  onSelectCategory,
  onSelectTag,
  onSearch
}) => {
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);

  const slideFromLeft = {
    hidden: { 
      opacity: 0, 
      x: -50 
    },
    visible: (delay: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        delay: delay * 0.1,
        ease: [0.42, 0, 0.58, 1] as const
      }
    })
  };

  if (categories.length === 0 && tags.length === 0) {
    return (
      <motion.div 
        className="mb-8 bg-red-900 rounded-lg p-6 shadow-sm"
      >
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-5 w-5 text-navy" />
            <h2 className="text-xl font-gilroy-semibold text-navy">Search Posts</h2>
          </div>
          <Input
            type="search"
            placeholder="Search blog posts..."
            onChange={(e) => onSearch(e.target.value)}
            className="max-w-md"
          />
        </div>
        
        <div className="text-center py-8 text-gray-500">
          <p>No categories or tags available yet.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="mb-8 bg-white max-w-7xl mx-auto rounded-lg p-6 shadow-sm"
      variants={slideFromLeft}
      custom={0}
      initial="hidden"
      animate="visible"
    >
      {/* Search Section */}
      <motion.div 
        className="mb-6"
        variants={slideFromLeft}
        custom={1}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center gap-2 mb-4">
          <Search className="h-5 w-5 text-navy" />
          <h2 className="text-xl font-gilroy-semibold text-navy">Search Posts</h2>
        </div>
        <Input
          type="search"
          placeholder="Search blog posts..."
          onChange={(e) => onSearch(e.target.value)}
          className="max-w-md font-gilroy-regular"
        />
      </motion.div>

      {/* Categories Section */}
      {categories.length > 0 && (
        <motion.div 
          className="mb-6"
          variants={slideFromLeft}
          custom={2}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-navy" />
            <h2 className="text-xl font-gilroy-semibold text-navy">Filter by Category</h2>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <motion.button 
              className={`px-4 py-2 rounded-full text-sm font-gilroy-regular transition-colors duration-200 ${
                !selectedCategory 
                  ? 'bg-navy text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => onSelectCategory(null)}
              variants={slideFromLeft}
              custom={3}
              initial="hidden"
              animate="visible"
            >
              All Categories
            </motion.button>
            
            {categories.map((category, index) => (
              <motion.button 
                key={category} 
                className={`px-4 py-2 rounded-full text-sm font-gilroy-regular transition-colors duration-200 ${
                  selectedCategory === category 
                    ? 'bg-navy text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => onSelectCategory(category)}
                variants={slideFromLeft}
                custom={4 + index}
                initial="hidden"
                animate="visible"
              >
                {category}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
      
      {/* Tags Section */}
      {tags.length > 0 && (
        <motion.div 
          className="pt-4 border-t border-gray-200"
          variants={slideFromLeft}
          custom={4 + categories.length}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center gap-2 mb-4">
            <Tag className="h-5 w-5 text-black" />
            <h2 className="text-xl font-gilroy-semibold text-navy">Filter by Tags</h2>
          </div>
          
          {/* Desktop View - Button Grid */}
          <div className="hidden md:flex flex-wrap gap-2">
            <motion.button 
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
                !selectedTag 
                  ? 'bg-black text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => onSelectTag(null)}
              variants={slideFromLeft}
              custom={5 + categories.length}
              initial="hidden"
              animate="visible"
            >
               Tags
            </motion.button>
            
            {tags.map((tag, index) => (
              <motion.button 
                key={tag} 
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 font-gilroy-regular ${
                  selectedTag === tag 
                    ? 'bg-black text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => onSelectTag(tag)}
                variants={slideFromLeft}
                custom={6 + categories.length + index}
                initial="hidden"
                animate="visible"
              >
                <Tag size={14} className="mr-1.5" />
                {tag}
              </motion.button>
            ))}
          </div>

          {/* Mobile View - Dropdown */}
          <motion.div 
            className="md:hidden relative"
            variants={slideFromLeft}
            custom={5 + categories.length}
            initial="hidden"
            animate="visible"
          >
            <button
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 rounded-lg text-left transition-colors duration-200 hover:bg-gray-200"
              onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
            >
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-black" />
                <span className="text-sm font-medium text-gray-700">
                  {selectedTag || 'All Tags'}
                </span>
              </div>
              <ChevronDown 
                size={16} 
                className={`text-gray-500 transition-transform duration-200 ${
                  isTagDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isTagDropdownOpen && (
              <motion.div 
                className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  className={`w-full flex items-center gap-2 px-4 py-3 text-left text-sm transition-colors duration-200 ${
                    !selectedTag 
                      ? 'bg-black text-white' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    onSelectTag(null);
                    setIsTagDropdownOpen(false);
                  }}
                >
                  <Tag size={14} />
                   Tags
                </button>

                {tags.map((tag) => (
                  <button
                    key={tag}
                    className={`w-full flex items-center gap-2 px-4 py-3 font-semibold text-left text-sm transition-colors duration-200 ${
                      selectedTag === tag 
                        ? 'bg-black text-white' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      onSelectTag(tag);
                      setIsTagDropdownOpen(false);
                    }}
                  >
                    <Tag size={14} />
                    {tag}
                  </button>
                ))}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default BlogFilter;
