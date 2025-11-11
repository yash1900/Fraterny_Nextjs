'use client';


import { useState, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from '@/components/ui/form';
import { uploadFormSchema, IMAGE_USAGE_MAP } from './constants';
import { useUploadImageMutation } from './hooks';
import UploadFormSubmit from './UploadFormSubmit';
import { FileUploadSection } from './file-upload';
import ImageDetailsForm from './ImageDetailsForm';
import SEOFieldsSection from './SEOFieldsSection';

export const UploadForm = ({ onClose }: { onClose: () => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [key, setKey] = useState<string>('');
  const [isPredefinedKey, setIsPredefinedKey] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      key: '',
    description: '',
    alt_text: '',
    category: '',
    seo_title: '',
    seo_caption: '',
    focus_keywords: '',
    copyright: '',
    image_location: '',
    og_title: '',
    og_description: '',
    schema_type: 'ImageObject',
    },
  });
  
  const { mutate, isPending, isSuccess } = useUploadImageMutation(onClose);
  
  // Clear the preview when unmounting
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);
  
  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    
    if (selectedFile) {
      setFile(selectedFile);
      setCroppedFile(null);
      
      // Create a preview URL
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      
      // Auto-fill the alt text with the file name (without extension)
      const fileNameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
      const formattedAltText = fileNameWithoutExt
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      
      form.setValue('alt_text', formattedAltText);
    }
  };
  
  // Handle predefined key selection
  const handleKeySelection = (selectedKey: string) => {
    setKey(selectedKey);
    form.setValue('key', selectedKey);
    setIsPredefinedKey(true);
    
    // Prefill description and alt text based on key
    if (IMAGE_USAGE_MAP[selectedKey]) {
      const usageDescription = IMAGE_USAGE_MAP[selectedKey];
      form.setValue('description', `Image for ${usageDescription}`);
      form.setValue('alt_text', usageDescription.replace(' - ', ': '));
      
      // Set appropriate category based on key
      if (selectedKey.includes('hero')) {
        form.setValue('category', 'Hero');
      } else if (selectedKey.includes('background')) {
        form.setValue('category', 'Background');
      } else if (selectedKey.includes('banner')) {
        form.setValue('category', 'Banner');
      } else if (selectedKey.includes('villalab')) {
        form.setValue('category', 'Gallery');
      } else if (selectedKey.includes('experience')) {
        form.setValue('category', 'Gallery');
      }
    }
  };
  
  // Handle key input change
  const handleKeyChange = (value: string) => {
    setKey(value);
    setIsPredefinedKey(!!IMAGE_USAGE_MAP[value]);
  };
  
  // Handle cropped file
  const handleCroppedFile = (newCroppedFile: File) => {
    setCroppedFile(newCroppedFile);
    
    // Update preview with cropped version
    const objectUrl = URL.createObjectURL(newCroppedFile);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(objectUrl);
  };
  
  // Handle form submission
  const onSubmit = form.handleSubmit((data) => {
    const fileToUpload = croppedFile || file;
    
    if (!fileToUpload) {
      form.setError('root', { 
        message: 'Please select an image file to upload.' 
      });
      return;
    }
    
    // Process SEO metadata
    const seoMetadata = {
      title: data.seo_title?.trim() || undefined,
      caption: data.seo_caption?.trim() || undefined,
      focusKeywords: data.focus_keywords 
        ? data.focus_keywords.split(',').map(k => k.trim()).filter(k => k.length > 0)
        : undefined,
      copyright: data.copyright?.trim() || undefined,
      location: data.image_location?.trim() || undefined,
      ogTitle: data.og_title?.trim() || undefined,
      ogDescription: data.og_description?.trim() || undefined,
      schemaType: data.schema_type || 'ImageObject',
    };

    // Only include SEO metadata if at least one field has data
    const hasSeoData = Object.values(seoMetadata).some(value => 
      value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0)
    );

    mutate({
      file: fileToUpload,
      key: data.key,
      description: data.description,
      alt_text: data.alt_text,
      category: data.category,
      seoMetadata: hasSeoData ? seoMetadata : undefined,
    });
  });
  
  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="flex flex-col space-y-6">
          <FileUploadSection 
            file={file}
            previewUrl={previewUrl}
            onFileChange={handleFileChange}
            onCroppedFile={handleCroppedFile}
            imageKey={key}
          />
          
          <ImageDetailsForm 
            form={form}
            isPredefinedKey={isPredefinedKey}
            key={key}
            handleKeyChange={handleKeyChange}
            handleKeySelection={handleKeySelection}
          />

          <SEOFieldsSection form={form} />
        </div>
        
        <UploadFormSubmit
          isPending={isPending}
          isSuccess={isSuccess}
          onCancel={onClose}
        />
      </form>
    </Form>
  );
};

export default UploadForm;


