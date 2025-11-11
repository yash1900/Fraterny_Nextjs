
'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { WebsiteImage } from '../../hooks/useImageManagement';
import { supabase } from '@/lib/supabase';

export const useEditImage = (image: WebsiteImage, onClose: () => void) => {
  const queryClient = useQueryClient();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [isReplacing, setIsReplacing] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  const [editForm, setEditForm] = useState({
    key: image.key,
    description: image.description || '',
    alt_text: image.alt_text || '',
    category: image.category || ''
  });
  
  // Load the original image on mount and when image changes
  useEffect(() => {
    const fetchImageUrl = async () => {
      try {
        console.log(`🖼️ Loading image preview for key: ${image.key}`);
        setImageLoading(true);
        
        // AGGRESSIVE APPROACH: Fetch image metadata directly and build URL manually
        console.log('🧹 Fetching fresh image data directly from database...');
        
        // Fetch image data directly from Supabase
        const { data: imageData, error } = await supabase
          .from('website_images')
          .select('storage_path, metadata')
          .eq('key', image.key)
          .maybeSingle();
          
        if (error || !imageData || !imageData.storage_path) {
          console.error('Failed to fetch image data:', error);
          setPreviewUrl(null);
          setImageLoading(false);
          return;
        }
        
        console.log(`📋 Fresh image data:`, imageData);
        
        // Get fresh public URL directly from Supabase storage
        const { data: urlData } = supabase.storage
          .from('website-images')
          .getPublicUrl(imageData.storage_path);
          
        if (!urlData || !urlData.publicUrl) {
          console.error('Failed to get public URL');
          setPreviewUrl(null);
          setImageLoading(false);
          return;
        }
        
        // Add AGGRESSIVE cache busting with multiple parameters
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substr(2, 9);
        const cacheBustedUrl = urlData.publicUrl.includes('?') 
          ? `${urlData.publicUrl}&_t=${timestamp}&_r=${randomId}&_modal=1` 
          : `${urlData.publicUrl}?_t=${timestamp}&_r=${randomId}&_modal=1`;
        
        console.log(`🔗 Generated AGGRESSIVE cache-busted URL:`, cacheBustedUrl);
        
        // Add a longer delay to ensure the image is ready
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setPreviewUrl(cacheBustedUrl);
        setImageLoading(false);
        console.log(`✅ Image preview loaded for: ${image.key}`);
      } catch (error) {
        console.error('Failed to load image preview:', error);
        setPreviewUrl(null);
        setImageLoading(false);
      }
    };
    
    // Reset all state when image changes (important for modal reopening)
    setFile(null);
    setCroppedFile(null);
    setIsReplacing(false);
    
    // Update form with current image data
    setEditForm({
      key: image.key,
      description: image.description || '',
      alt_text: image.alt_text || '',
      category: image.category || ''
    });
    
    fetchImageUrl();
    
    // Clean up any blob URLs when unmounting or image changes
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [image.key, image.id]); // Added image.id to dependencies to detect updates
  
  // Cleanup function to reset all state
  const resetAllState = () => {
    console.log('🧹 Resetting all edit state...');
    
    // Clean up any blob URLs
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    
    // Reset all state
    setFile(null);
    setCroppedFile(null);
    setIsReplacing(false);
    setPreviewUrl(null);
    
    // Reset form to original values
    setEditForm({
      key: image.key,
      description: image.description || '',
      alt_text: image.alt_text || '',
      category: image.category || ''
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    
    if (selectedFile) {
      // Clean up previous blob URL if exists
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      
      setFile(selectedFile);
      setCroppedFile(null);
      
      // Create a preview URL
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      setIsReplacing(true);
    }
  };

  const handleCroppedFile = (newCroppedFile: File) => {
    // Clean up previous blob URL if exists
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    
    setCroppedFile(newCroppedFile);
    
    // Update preview with cropped version
    const objectUrl = URL.createObjectURL(newCroppedFile);
    setPreviewUrl(objectUrl);
  };

  const cancelReplacement = () => {
    // Clean up any blob URLs to prevent memory leaks
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    
    setFile(null);
    setCroppedFile(null);
    setIsReplacing(false);
    
    // Restore original image preview
    const fetchOriginalImage = async () => {
      try {
        const response = await fetch(`/api/media/by-key?key=${encodeURIComponent(image.key)}`);
        const result = await response.json();
        if (result.success) {
          setPreviewUrl(result.data.url);
        }
      } catch (error) {
        console.error('Failed to restore original image preview:', error);
      }
    };
    
    fetchOriginalImage();
  };
  
  const replaceImageMutation = useMutation({
    mutationFn: async (data: { 
      file: File, 
      key: string, 
      description: string, 
      alt_text: string, 
      category?: string 
    }) => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('key', data.key);
      formData.append('description', data.description);
      formData.append('alt_text', data.alt_text);
      if (data.category) formData.append('category', data.category);

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (data) => {
      console.log('✅ Image replacement successful, cleaning up state...');
      
      // Clean up all blob URLs to prevent memory leaks and 404 errors
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      
      // Cache invalidation handled by refetch
      
      // Invalidate cache to refresh the image list - this will update the parent component
      queryClient.invalidateQueries({ queryKey: ['website-images'] });
      
      toast.success('Image replaced successfully');
      
      // Close modal immediately - the parent will handle refreshing the data
      onClose();
    },
    onError: (error) => {
      console.error('❌ Image replacement failed:', error);
      toast.error('Failed to replace image');
    }
  });
  
  const updateMutation = useMutation({
    mutationFn: async (data: { id: string, updates: Partial<WebsiteImage> }) => {
      const response = await fetch(`/api/media/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.updates),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: () => {
      console.log('✅ Image metadata update successful');
      
      // Invalidate cache to refresh the image list
      queryClient.invalidateQueries({ queryKey: ['website-images'] });
      
      // Close modal
      onClose();
      toast.success('Image updated successfully');
    },
    onError: (error) => {
      console.error('❌ Image metadata update failed:', error);
      toast.error('Failed to update image');
    }
  });
  
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If we're replacing the image
    if (isReplacing && (croppedFile || file)) {
      const fileToUpload = croppedFile || file;
      if (fileToUpload) {
        replaceImageMutation.mutate({
          file: fileToUpload,
          key: editForm.key,
          description: editForm.description,
          alt_text: editForm.alt_text,
          category: editForm.category || undefined,
        });
        return;
      }
    }
    
    // Otherwise just update the metadata
    updateMutation.mutate({
      id: image.id,
      updates: {
        key: editForm.key,
        description: editForm.description,
        alt_text: editForm.alt_text,
        category: editForm.category || undefined
      }
    });
  };

  return {
    previewUrl,
    file,
    croppedFile,
    isReplacing,
    editForm,
    setEditForm,
    updateMutation,
    replaceImageMutation,
    handleEditSubmit,
    handleFileChange,
    handleCroppedFile,
    setIsReplacing,
    cancelReplacement,
    resetAllState,
    imageLoading
  };
};


