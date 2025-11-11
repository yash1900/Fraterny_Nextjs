'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageHeader from './components/PageHeader';
import BlogForm from './components/BlogForm';
import BlogList from './components/BlogList';
import { BlogFormValues, BlogPost } from './types';

type TabType = 'published' | 'draft';

const AdminBlog = () => {
  const [formValues, setFormValues] = useState<BlogFormValues>({
    title: '',
    content: '',
    category: '',
    tags: [],
    published: true,
    image_key: null,
    meta_description: '',
    meta_keywords: [],
    slug: '',
    seo_title: '',
    excerpt: '',
    featured_image_alt: '',
    social_image_key: null,
    reading_time: 0,
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>('published');

  

  // Use React Query hook for fetching all blog posts (including unpublished)
  const fetchAdminBlogPosts = async () => {
    const response = await fetch('/api/admin/blog');
    const result = await response.json();
    
    if (!result.success) throw new Error(result.error);
    return result.data as BlogPost[];
  };

  const { data: blogPosts, isLoading, error, refetch } = useQuery({
    queryKey: ['adminBlogPosts'],
    queryFn: fetchAdminBlogPosts,
  });

  const handleEdit = (post: BlogPost) => {
    setFormValues({
      title: post.title,
      content: post.content,
      category: post.category || '',
      tags: post.tags || [],
      published: post.published,
      image_key: post.image_key || null,
      meta_description: post.meta_description || '',
      meta_keywords: post.meta_keywords || [],
      slug: post.slug || '',
      seo_title: post.seo_title || '',
      excerpt: post.excerpt || '',
      featured_image_alt: post.featured_image_alt || '',
      social_image_key: post.social_image_key || null,
      reading_time: post.reading_time || 0,
    });
    setEditingId(post.id);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handleNewPost = () => {
    setFormValues({
      title: '',
      content: '',
      category: '',
      tags: [],
      published: true,
      image_key: null,
      meta_description: '',
      meta_keywords: [],
      slug: '',
      seo_title: '',
      excerpt: '',
      featured_image_alt: '',
      social_image_key: null,
      reading_time: 0,
    });
    setEditingId(null);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const handleFormSuccess = async () => {
    // Refetch admin posts
    await refetch();
    setShowForm(false);
  };

  // Filter blog posts based on active tab
  const filteredBlogPosts = blogPosts?.filter(post => {
    if (activeTab === 'published') return post.published === true;
    if (activeTab === 'draft') return post.published === false;
    return true;
  });

  return (
    <div className="p-8">
      <PageHeader onNewPostClick={handleNewPost} />
        
        {showForm && (
          <BlogForm 
            editingId={editingId}
            formValues={formValues}
            setFormValues={setFormValues}
            setEditingId={setEditingId}
            onSuccess={handleFormSuccess}
          />
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('published')}
                className={`${
                  activeTab === 'published'
                    ? 'border-navy text-navy'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Published
                {blogPosts && (
                  <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100">
                    {blogPosts.filter(p => p.published).length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('draft')}
                className={`${
                  activeTab === 'draft'
                    ? 'border-navy text-navy'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Draft
                {blogPosts && (
                  <span className="ml-2 py-0.5 px-2 rounded-full text-xs bg-gray-100">
                    {blogPosts.filter(p => !p.published).length}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>

        <BlogList 
          blogPosts={filteredBlogPosts || null}
          isLoading={isLoading}
          error={error}
          onEdit={handleEdit}
          refetch={refetch}
        />
    </div>
  );
};

export default AdminBlog;