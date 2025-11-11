'use client';


import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { InfoIcon } from 'lucide-react';
import KeySelector from './KeySelector';
import { IMAGE_CATEGORIES, IMAGE_USAGE_MAP } from './constants';

interface ImageDetailsFormProps {
  form: any; // Using any here for simplicity, but should be typed properly in real code
  isPredefinedKey: boolean;
  key: string;
  handleKeyChange: (value: string) => void;
  handleKeySelection: (key: string) => void;
}

const ImageDetailsForm = ({ 
  form, 
  isPredefinedKey,
  key,
  handleKeyChange,
  handleKeySelection
}: ImageDetailsFormProps) => {
  return (
    <div className="space-y-4">
      <KeySelector 
        form={form}
        onSelect={handleKeySelection}
      />
      
      <FormField
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-medium">Category</FormLabel>
            <FormControl>
              <select
                {...field}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-navy focus:border-navy"
              >
                <option value="">Select a category</option>
                {IMAGE_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-medium">Description <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input 
                {...field} 
                placeholder="e.g., Main hero background image"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="alt_text"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-medium">Alt Text <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input 
                {...field}
                placeholder="e.g., Luxury villa with ocean view" 
              />
            </FormControl>
            <FormMessage />
            <p className="text-xs text-gray-500 mt-1">
              Text description for accessibility
            </p>
          </FormItem>
        )}
      />
      
      {isPredefinedKey && (
        <div className="p-3 bg-green-50 border border-green-100 rounded-md">
          <p className="text-sm text-green-800 flex items-start">
            <InfoIcon className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            This key will replace a specific placeholder on the website.
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageDetailsForm;


