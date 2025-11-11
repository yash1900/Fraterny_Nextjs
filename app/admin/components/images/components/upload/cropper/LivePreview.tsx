'use client';


import React from 'react';
import { Smartphone, Monitor } from 'lucide-react';

interface LivePreviewProps {
  previewUrl: string | null;
  aspectRatio?: number;
  placeholderLabel: string;
  objectFit: 'cover' | 'contain';
  viewMode: 'desktop' | 'mobile';
  setViewMode: (mode: 'desktop' | 'mobile') => void;
}

const LivePreview = ({
  previewUrl,
  aspectRatio,
  placeholderLabel,
  objectFit,
  viewMode,
  setViewMode
}: LivePreviewProps) => {
  // Calculate container sizes based on viewMode
  const containerStyle: React.CSSProperties = {
    aspectRatio: aspectRatio ? `${aspectRatio}` : '16/9',
    maxWidth: viewMode === 'desktop' ? '100%' : '375px',
    width: viewMode === 'desktop' ? '100%' : '375px'
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium text-navy">Preview</h3>
        
        <div className="flex items-center space-x-2 bg-gray-100 rounded-md p-1">
          <button
            type="button"
            onClick={() => setViewMode('mobile')}
            className={`p-1.5 rounded-md ${viewMode === 'mobile' ? 'bg-white shadow-sm' : ''}`}
            title="Mobile view"
          >
            <Smartphone className="w-4 h-4 text-gray-700" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('desktop')}
            className={`p-1.5 rounded-md ${viewMode === 'desktop' ? 'bg-white shadow-sm' : ''}`}
            title="Desktop view"
          >
            <Monitor className="w-4 h-4 text-gray-700" />
          </button>
        </div>
      </div>

      <div className={`border border-gray-200 rounded-lg ${viewMode === 'mobile' ? 'mx-auto' : 'w-full'}`}>
        <div 
          className={`${viewMode === 'mobile' ? 'bg-gray-50' : 'bg-navy bg-opacity-10'} rounded-t-lg px-2 py-1 text-xs text-center`}
        >
          {viewMode === 'mobile' ? 'Mobile Preview' : 'Desktop Preview'}
        </div>
        
        <div 
          className="bg-white relative overflow-hidden" 
          style={containerStyle}
        >
          {previewUrl ? (
            <img 
              src={previewUrl} 
              alt="Image preview" 
              style={{ 
                width: '100%', 
                height: '100%',
                objectFit 
              }}
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs text-center p-4"
            >
              {placeholderLabel || 'Image will appear here after cropping'}
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 rounded-b-lg px-2 py-1 text-xs text-center text-gray-500">
          {objectFit === 'cover' ? 
            'Image will fill the entire space (may crop edges)' : 
            'Image will be fully visible (may show background)'
          }
        </div>
      </div>
    </div>
  );
};

export default LivePreview;


