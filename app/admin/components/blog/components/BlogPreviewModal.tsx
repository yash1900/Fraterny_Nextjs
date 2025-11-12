'use client';

import { X, Calendar, Tag } from 'lucide-react';
import ResponsiveImage from '@/components/ui/ResponsiveImage';
import DOMPurify from 'dompurify';
import parse from 'html-react-parser';
import { BlogPost } from '../types';
import { useEffect } from 'react';

interface BlogPreviewModalProps {
  post: BlogPost;
  isOpen: boolean;
  onClose: () => void;
}

const BlogPreviewModal = ({ post, isOpen, onClose }: BlogPreviewModalProps) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const sanitizeContent = (htmlContent: string): string => {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      return htmlContent;
    }
    
    let cleaned = htmlContent.replace(/\s*data-start="[^"]*"/g, '');
    cleaned = cleaned.replace(/\s*data-end="[^"]*"/g, '');
    
    const textarea = document.createElement('textarea');
    textarea.innerHTML = cleaned;
    cleaned = textarea.value;
    
    const sanitized = DOMPurify.sanitize(cleaned, {
      ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'a', 'blockquote', 'code', 'pre', 'hr', 'span', 'div'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
    });
    
    return sanitized;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-start justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-5xl lg:max-w-4xl max-h-[90vh] overflow-y-auto my-8">
          {/* Close button */}
          <button
            onClick={onClose}
            className="sticky top-4 right-4 float-right z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            aria-label="Close preview"
          >
            <X size={24} className="text-gray-600" />
          </button>

          {/* Preview badge */}
          <div className="sticky top-4 left-4 z-10 inline-block">
            <span className="bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
              Preview Mode
            </span>
          </div>

          {/* Blog post content - mimicking BlogPostClient.tsx */}
          <article className="px-6 sm:px-12 lg:px-20 pt-8 pb-10">
            <div>
              {post.category && (
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-black bg-opacity-10 text-navy text-sm rounded">
                    {post.category}
                  </span>
                </div>
              )}
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-playfair font-bold text-navy mb-6">
                {post.title}
              </h1>
              
              <div className="mb-8 flex items-center text-gray-500">
                <Calendar size={16} className="mr-2" />
                {new Date(post.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
                {post.reading_time && post.reading_time > 0 && (
                  <span className="ml-4">• {post.reading_time} min read</span>
                )}
              </div>
              
              {post.image_key && (
                <div className="mb-8 rounded-lg overflow-hidden">
                  <ResponsiveImage
                    dynamicKey={post.image_key}
                    alt={post.featured_image_alt || post.title}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="w-full h-auto"
                    loading="eager"
                    priority={true}
                    seoEnhanced={true}
                    showCaption={true}
                  />
                </div>
              )}
              
              {post.excerpt && (
                <div className="mb-6 p-4 bg-gray-50 border-l-4 border-navy rounded">
                  <p className="text-lg text-gray-700 italic">{post.excerpt}</p>
                </div>
              )}
              
              {post.tags && post.tags.length > 0 && (
                <div className="mb-8 flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                      <Tag size={14} className="mr-1 text-terracotta" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="prose prose-lg max-w-none text-gray-700">
                {parse(sanitizeContent(post.content))}
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};

export default BlogPreviewModal;
