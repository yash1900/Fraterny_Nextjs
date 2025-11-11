import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ResponsiveImage from '@/components/ui/ResponsiveImage';

export type BlogPost = {
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

interface BlogCardProps {
  post: BlogPost;
  index?: number;
}

const BlogCard: React.FC<BlogCardProps> = ({ post, index = 0 }) => {
  const baseDelay = index * 0.2;
  
  const contentVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: baseDelay + (i * 0.1),
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  const imageVariants = {
    hidden: { scale: 1.1, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        delay: baseDelay + 0.1,
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div 
      className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 flex flex-col h-full"
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
      }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      initial={{ rotateY: -5, opacity: 0 }}
      animate={{ 
        rotateY: 0, 
        opacity: 1,
        transition: {
          delay: baseDelay,
          duration: 0.6,
          ease: "easeOut"
        }
      }}
      style={{ transformStyle: "preserve-3d" }}
    >
      <Link 
        href={`/blog/${post.slug}`}
        className="block h-full"
      >
        <div className="relative w-full aspect-[16/9] overflow-hidden">
          <motion.div 
            className="absolute inset-0 z-10 group-hover:bg-opacity-30 transition-opacity duration-500"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 0.5,
              transition: {
                delay: baseDelay + 0.2,
                duration: 0.6
              }
            }}
          ></motion.div>

          {post.image_key ? (
            <motion.div 
              className="w-full h-full bg-gray-200"
              initial="hidden"
              animate="visible"
            >
              <ResponsiveImage
                dynamicKey={post.image_key}
                alt={post.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
                loading="lazy"
              />
            </motion.div>
          ) : (
            <motion.div 
              className="w-full h-full bg-gradient-to-b from-navy to-terracotta"
              initial="hidden"
              animate="visible"
            >
            </motion.div>
          )}

          <motion.div 
            className="absolute bottom-0 left-0 right-0 z-20 p-6 bg-gradient-to-t from-black/90 to-transparent"
            initial={{ y: 40, opacity: 0 }}
            animate={{ 
              y: 0, 
              opacity: 1,
              transition: {
                delay: baseDelay + 0.4,
                duration: 0.7,
                ease: "easeOut"
              }
            }}
          >
            {post.category && (
              <motion.span 
                className="inline-block px-3 py-1 bg-navy bg-opacity-90 text-white text-xs font-medium rounded-full mb-3 backdrop-blur-sm"
                custom={0}
                initial="hidden"
                animate="visible"
                whileHover={{ 
                  scale: 1.1,
                  backgroundColor: "rgba(10, 26, 47, 1)",
                  transition: { duration: 0.2 }
                }}
              >
                {post.category}
              </motion.span>
            )}
            
            <motion.h2 
              className="text-xl font-playfair font-bold text-white mb-3 line-clamp-2"
              custom={1}
              initial="hidden"
              animate="visible"
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
            >
              {post.title}
            </motion.h2>
            
            <motion.div 
              className="flex justify-between items-center"
              custom={2}
              initial="hidden"
              animate="visible"
            >
              <motion.p 
                className="text-sm text-gray-200"
                whileHover={{ 
                  color: "#ffffff",
                  transition: { duration: 0.2 }
                }}
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
              >
                {new Date(post.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </motion.p>
              
              <motion.span 
                className="text-white font-medium group-hover:underline transition-all duration-200 flex items-center"
                whileHover={{ 
                  color: "#e07a5f",
                }}
              >
                Read more 
                <motion.span
                  className="ml-1"
                >
                  →
                </motion.span>
              </motion.span>
            </motion.div>
          </motion.div>
        </div>
      </Link>
    </motion.div>
  );
};

export default BlogCard;
