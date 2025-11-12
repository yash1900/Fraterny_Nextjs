'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import ResponsiveImage from '@/components/ui/ResponsiveImage';
import BlogPreviewModal from './BlogPreviewModal';
import { BlogPost } from '../types';

interface BlogListProps {
  blogPosts: BlogPost[] | null;
  isLoading: boolean;
  error: Error | unknown | null;
  onEdit: (post: BlogPost) => void;
  refetch: () => void;
}

const BlogList = ({ blogPosts, isLoading, error, onEdit, refetch }: BlogListProps) => {
  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handlePreview = (post: BlogPost) => {
    setPreviewPost(post);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setTimeout(() => setPreviewPost(null), 300); // Delay clearing to allow fade-out animation
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
      // Delete the blog post
      const response = await fetch(`/api/admin/blog?id=${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (!result.success) throw new Error(result.error);
      
      // Refetch admin blog posts
      await refetch();
      
      toast.success('Blog post deleted successfully');
    } catch (error) {
      console.error('Error deleting blog post:', error);
      toast.error('Failed to delete blog post');
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    const newStatus = !post.published;
    const actionText = newStatus ? 'publish' : 'unpublish';
    
    try {
      const response = await fetch('/api/admin/blog', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: post.id,
          title: post.title,
          content: post.content,
          category: post.category,
          tags: post.tags,
          published: newStatus,
          image_key: post.image_key,
          meta_description: post.meta_description,
          meta_keywords: post.meta_keywords,
          slug: post.slug,
          seo_title: post.seo_title,
          excerpt: post.excerpt,
          featured_image_alt: post.featured_image_alt,
          social_image_key: post.social_image_key,
          reading_time: post.reading_time,
        }),
      });
      const result = await response.json();

      if (!result.success) throw new Error(result.error);
      
      await refetch();
      
      toast.success(`Blog post ${actionText}ed successfully`);
    } catch (error) {
      console.error(`Error ${actionText}ing blog post:`, error);
      toast.error(`Failed to ${actionText} blog post`);
    }
  };

  // Helper function to parse PostgreSQL array strings
const parsePostgresArray = (value: any): string[] => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  if (typeof value === 'string') {
    // Remove curly braces and parse
    const cleaned = value.replace(/^\{|\}$/g, '');
    if (!cleaned) return [];
    // Split by comma, handle quoted strings
    return cleaned.match(/(?:[^,"]+|"[^"]*")+/g)?.map(s => s.replace(/^"|"$/g, '').trim()) || [];
  }
  return [];
};

  // Status labels for blog posts
  const getStatusLabel = (post: BlogPost) => {
    if (!post.published) return <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded">Draft</span>;
    return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Published</span>;
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-medium text-navy">Blog Posts</h2>
      </div>

      <div className="divide-y divide-gray-200">
        {isLoading ? (
          <div className="p-6 text-center">Loading blog posts...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">Failed to load blog posts</div>
        ) : blogPosts?.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No blog posts yet</div>
        ) : (
          blogPosts?.map((post) => (
            <div key={post.id} className="p-6">
              <div className="flex gap-4">
                {/* Blog image thumbnail with responsive handling */}
                {post.image_key ? (
                  <div className="flex-shrink-0 w-24 h-24 rounded overflow-hidden bg-gray-100">
                    <ResponsiveImage
                      dynamicKey={post.image_key}
                      alt={post.title}
                      sizes="small"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-24 h-24 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
                
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{post.title}</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {post.category && (
                          <span className="px-2 py-1 bg-navy bg-opacity-10 text-navy text-xs rounded">
                            {post.category}
                          </span>
                        )}
                        {getStatusLabel(post)}
                        <span className="text-sm text-gray-500">
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {post.tags && parsePostgresArray(post.tags).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {parsePostgresArray(post.tags).map(tag => (
                            <span key={tag} className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handlePreview(post)}
                        className="text-blue-600 hover:underline"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => handleTogglePublish(post)}
                        className={`${post.published ? 'text-orange-600' : 'text-green-600'} hover:underline`}
                      >
                        {post.published ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => onEdit(post)}
                        className="text-navy hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-gray-700 line-clamp-2">{post.content.substring(0, 150)}...</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Preview Modal */}
      {previewPost && (
        <BlogPreviewModal
          post={previewPost}
          isOpen={isPreviewOpen}
          onClose={handleClosePreview}
        />
      )}
    </div>
  );
};

export default BlogList;
