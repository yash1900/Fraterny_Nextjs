'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import BlogHero from './components/BlogHero';
import BlogFilter from './components/BlogFilter';
import BlogList from './components/BlogList';
import { BlogPost } from './components/BlogCard';
import Navigation from '../website-navigation/components/Navigation';
import Footer from '../website-navigation/components/Footer';

const BlogPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9;

  // Fetch blog posts
  const { data: postsData, isLoading: postsLoading, error: postsError, refetch: refetchPosts } = useQuery({
    queryKey: ['blogPosts', selectedCategory, selectedTag, searchQuery, currentPage, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString()
      });
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedTag) params.append('tag', selectedTag);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/public/blog?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch blog posts');
      return response.json();
    },
    staleTime: 0,
    refetchOnMount: true,
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['blogCategories'],
    queryFn: async () => {
      const response = await fetch('/api/public/blog?operation=categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
    staleTime: 10 * 60 * 1000,
  });

  // Fetch tags
  const { data: tagsData } = useQuery({
    queryKey: ['blogTags'],
    queryFn: async () => {
      const response = await fetch('/api/public/blog?operation=tags');
      if (!response.ok) throw new Error('Failed to fetch tags');
      return response.json();
    },
    staleTime: 10 * 60 * 1000,
  });

  const posts = postsData?.posts || [];
  const total = postsData?.total || 0;
  const totalPages = Math.ceil(total / pageSize);
  const categories = categoriesData?.categories || [];
  const tags = tagsData?.tags || [];

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedTag, searchQuery]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <BlogHero totalPosts={total} />
      
      <div className="container mx-auto px-6 py-12">
        <BlogFilter
          categories={categories}
          tags={tags}
          selectedCategory={selectedCategory}
          selectedTag={selectedTag}
          onSelectCategory={setSelectedCategory}
          onSelectTag={setSelectedTag}
          onSearch={setSearchQuery}
        />
        
        <BlogList
          posts={posts}
          isLoading={postsLoading}
          error={postsError}
          selectedCategory={selectedCategory}
          selectedTag={selectedTag}
          setSelectedCategory={setSelectedCategory}
          setSelectedTag={setSelectedTag}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          refetch={refetchPosts}
        />
      </div>
      <Footer />
    </div>
  );
};

export default BlogPage;
