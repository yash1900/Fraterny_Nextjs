'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface WebsiteImage {
  id: string;
  key: string;
  alt_text?: string;
  description?: string;
  category?: string;
  storage_path: string;
  metadata?: any;
  sizes?: any;
  width?: number;
  height?: number;
  created_at: string;
  updated_at?: string;
}

export const useImageManagement = () => {
  const [selectedImage, setSelectedImage] = useState<WebsiteImage | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['website-images', selectedCategory, searchTerm, page, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      
      if (selectedCategory) {
        params.append('category', selectedCategory);
      }
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      const response = await fetch(`/api/media?${params.toString()}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return result.data;
    }
  });
  
  const images = data?.images || [];
  const totalCount = data?.total || 0;
  
  const categories = images.length > 0
    ? [...new Set(images.filter((img: WebsiteImage) => img.category).map((img: WebsiteImage) => img.category))] as string[]
    : [];
  
  const openEditModal = (image: WebsiteImage) => {
    setSelectedImage(image);
    setIsEditModalOpen(true);
  };
  
  const openDeleteModal = (image: WebsiteImage) => {
    setSelectedImage(image);
    setIsDeleteModalOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && (newPage - 1) * pageSize < totalCount) {
      setPage(newPage);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };
  
  const clearFilters = () => {
    setSelectedCategory(null);
    setSearchTerm('');
  };

  return {
    images,
    totalCount,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    setSearchTerm,
    page,
    pageSize,
    isLoading,
    error,
    selectedImage,
    isUploadModalOpen,
    setIsUploadModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    openEditModal,
    openDeleteModal,
    handlePageChange,
    handleSearch,
    clearFilters
  };
};
