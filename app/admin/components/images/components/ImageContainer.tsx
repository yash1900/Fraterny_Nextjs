'use client';

import React from 'react';
import { WebsiteImage } from '../hooks/useImageManagement';
import ImageGallery from './ImageGallery';
import EmptyState from './EmptyState';
import Pagination from './Pagination';

interface ImageContainerProps {
  images: WebsiteImage[];
  selectedCategory: string | null;
  searchTerm: string;
  onClearFilter: () => void;
  onUploadClick: () => void;
  onEdit: (image: WebsiteImage) => void;
  onDelete: (image: WebsiteImage) => void;
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (newPage: number) => void;
}

const ImageContainer = ({
  images,
  selectedCategory,
  searchTerm,
  onClearFilter,
  onUploadClick,
  onEdit,
  onDelete,
  page,
  pageSize,
  totalCount,
  onPageChange
}: ImageContainerProps) => {
  return (
    <>
      {images.length > 0 ? (
        <>
          <ImageGallery 
            images={images} 
            onEdit={onEdit} 
            onDelete={onDelete} 
          />
          
          <Pagination
            page={page}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={onPageChange}
          />
        </>
      ) : (
        <EmptyState 
          selectedCategory={selectedCategory} 
          searchTerm={searchTerm}
          onClearFilter={onClearFilter} 
          onUploadClick={onUploadClick} 
        />
      )}
    </>
  );
};

export default ImageContainer;

