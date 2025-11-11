'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useUploadImageMutation = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async (data: { 
      file: File, 
      key: string, 
      description: string, 
      alt_text: string, 
      category?: string,
      seoMetadata?: any
    }) => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('key', data.key);
      formData.append('description', data.description);
      formData.append('alt_text', data.alt_text);
      if (data.category) formData.append('category', data.category);
      if (data.seoMetadata) formData.append('seoMetadata', JSON.stringify(data.seoMetadata));

      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: async (_, variables) => {
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['website-images'] });
      
      // Show success message
      toast.success(`Image "${variables.key}" uploaded successfully`, {
        description: "The image will be available throughout the website where it's used.",
      });
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      toast.error('Failed to upload image', {
        description: 'Please try again or contact support if the problem persists.'
      });
      console.error('Upload error:', error);
    }
  });
  
  return mutation;
};


