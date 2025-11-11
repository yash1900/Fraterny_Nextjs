'use client';

import { WebsiteImage } from '../hooks/useImageManagement';
import { supabase } from '@/lib/supabase';
import { Edit, Trash2, Link } from 'lucide-react';

interface ImageGalleryProps {
  images: WebsiteImage[];
  onEdit: (image: WebsiteImage) => void;
  onDelete: (image: WebsiteImage) => void;
}

const ImageGallery = ({ images, onEdit, onDelete }: ImageGalleryProps) => {
  const getImageUrl = (path: string) => {
    const { data } = supabase.storage
      .from('website-images')
      .getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {images.map((image) => {
        const isWebsiteImage = false; // Simplified - remove IMAGE_USAGE_MAP dependency
        
        return (
          <div 
            key={image.id} 
            className={`
              bg-gray-50 rounded-lg overflow-hidden border 
              ${isWebsiteImage ? 'border-navy border-opacity-50' : 'border-gray-200'}
            `}
          >
            <div className="aspect-video bg-gray-200 relative">
              <img 
                src={getImageUrl(image.storage_path)} 
                alt={image.alt_text}
                className="w-full h-full object-cover"
              />
              
              {isWebsiteImage && (
                <div className="absolute top-2 right-2 bg-navy text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Link className="w-3 h-3" />
                  <span>Website Image</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-navy">{image.key}</h3>
                {image.category && (
                  <span className="px-2 py-1 bg-navy bg-opacity-10 text-navy text-xs rounded">
                    {image.category}
                  </span>
                )}
              </div>
              
              
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{image.description}</p>
              {(image.width && image.height) && (
                <p className="text-xs text-gray-500 mt-1">
                  {image.width} × {image.height}px
                </p>
              )}
              <div className="flex justify-between items-center mt-4">
                <span className="text-xs text-gray-500">
                  Added: {new Date(image.created_at).toLocaleDateString()}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(image)}
                    className="p-1 text-gray-600 hover:text-navy"
                    aria-label="Edit image"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(image)}
                    className="p-1 text-gray-600 hover:text-red-600"
                    aria-label="Delete image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ImageGallery;

