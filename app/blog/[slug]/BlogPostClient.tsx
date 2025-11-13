'use client';

import Link from 'next/link';
import ResponsiveImage from '@/components/ui/ResponsiveImage';
import { ArrowLeft, Calendar, Tag } from 'lucide-react';
import DOMPurify from 'dompurify';
import parse from 'html-react-parser';
import CommentSection from '../components/CommentSection';
import NewsletterSignup from '../components/NewsletterSignup';

type BlogPost = {
  id: string;
  title: string;
  content: string;
  published: boolean;
  category: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  image_key: string | null;
  meta_description?: string | null;
  meta_keywords?: string[] | null;
  slug?: string | null;
  seo_title?: string | null;
  excerpt?: string | null;
  featured_image_alt?: string | null;
  social_image_key?: string | null;
  reading_time?: number | null;
};

type Props = {
  post: BlogPost;
};

export default function BlogPostClient({ post }: Props) {
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

  return (
    <div className="min-h-screen">
      <div className="bg-black w-full h-[69px]"></div>

      <article className="px-4 sm:px-6 pt-12 pb-10">
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <Link href="/blog" className="inline-flex items-center text-navy hover:text-neutral-900 mb-8">
            <ArrowLeft size={16} className="mr-2" />
            Back to all posts
          </Link>
          
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
          </div>
          
          {post.image_key && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <ResponsiveImage
                dynamicKey={post.image_key}
                alt={post.title}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="w-full h-auto"
                loading="eager"
                priority={true}
                seoEnhanced={true}
                showCaption={true}
              />
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
          
          <div className="max-w-none text-gray-700">
            {parse(sanitizeContent(post.content))}
          </div>
          
          <CommentSection postId={post.id} />
        </div>
      </article>
      
      <div className="container mx-auto px-4 sm:px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <NewsletterSignup />
        </div>
      </div>
    </div>
  );
}
