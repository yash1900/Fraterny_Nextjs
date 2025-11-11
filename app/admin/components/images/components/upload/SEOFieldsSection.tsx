'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SEO_SCHEMA_TYPES } from './constants';

interface SEOFieldsSectionProps {
  form: any; // Using any here for simplicity, should be typed properly in production
}

const SEOFieldsSection = ({ form }: SEOFieldsSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-t-lg transition-colors"
      >
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-navy" />
          <span className="font-medium text-navy">SEO Settings</span>
          <span className="text-xs text-gray-500">(Optional)</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </button>

      {/* SEO Fields */}
      {isExpanded && (
        <div className="p-4 space-y-4 border-t border-gray-200">
          {/* SEO Title */}
          <FormField
            control={form.control}
            name="seo_title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">SEO Title</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="e.g., Luxury Villa Retreat Experience"
                  />
                </FormControl>
                <p className="text-xs text-gray-500">Used in title attribute and structured data</p>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Caption */}
          <FormField
            control={form.control}
            name="seo_caption"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Caption</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="e.g., Entrepreneurs collaborating in an exclusive villa setting"
                    rows={2}
                  />
                </FormControl>
                <p className="text-xs text-gray-500">Used in figcaption and rich snippets</p>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Focus Keywords */}
          <FormField
            control={form.control}
            name="focus_keywords"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Focus Keywords</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="luxury villa, entrepreneur retreat, collaboration"
                    rows={2}
                  />
                </FormControl>
                <p className="text-xs text-gray-500">Separate keywords with commas</p>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Copyright */}
            <FormField
              control={form.control}
              name="copyright"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Copyright</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="© 2024 Villa Experience Co."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location */}
            <FormField
              control={form.control}
              name="image_location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Location</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="e.g., Bali, Indonesia"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Social Media Section */}
          <div className="pt-4 border-t border-gray-100">
            <h4 className="font-medium text-navy mb-3 text-sm">Social Media Optimization</h4>
            
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="og_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Social Title</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Join Elite Entrepreneurs at Villa Experience"
                      />
                    </FormControl>
                    <p className="text-xs text-gray-500">Used in Open Graph and Twitter cards</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="og_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Social Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Exclusive 7-day retreat for ambitious entrepreneurs"
                        rows={2}
                      />
                    </FormControl>
                    <p className="text-xs text-gray-500">Used in social media sharing</p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Schema Type */}
          <FormField
            control={form.control}
            name="schema_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">Schema Type</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-navy focus:border-navy"
                  >
                    <option value="">Select schema type</option>
                    {SEO_SCHEMA_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <p className="text-xs text-gray-500">Helps search engines understand the image type</p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
};

export default SEOFieldsSection;

