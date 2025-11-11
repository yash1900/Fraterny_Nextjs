'use client';


import { useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import PredefinedKeysSelector from './PredefinedKeysSelector';
import { IMAGE_USAGE_MAP } from './constants';

interface KeySelectorProps {
  form: any;
  onSelect: (key: string) => void;
}

const KeySelector = ({ form, onSelect }: KeySelectorProps) => {
  const [showPredefinedKeys, setShowPredefinedKeys] = useState(false);
  
  const handleKeySelection = (key: string, description: string) => {
    form.setValue('key', key);
    onSelect(key);
  };
  
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="key"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-medium">Image Key <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input 
                {...field}
                placeholder="e.g., hero-background, team-photo-1" 
                className="mb-1"
                onChange={(e) => {
                  field.onChange(e);
                  // Check if this is a predefined key
                  const isPredefined = !!IMAGE_USAGE_MAP[e.target.value];
                  if (isPredefined) {
                    onSelect(e.target.value);
                  }
                }}
              />
            </FormControl>
            <FormMessage />
            <p className="text-xs text-gray-500 mt-1">
              A unique identifier used to fetch this image later
            </p>
          </FormItem>
        )}
      />
      
      <PredefinedKeysSelector
        onSelectKey={handleKeySelection}
        visible={showPredefinedKeys}
        onToggle={() => setShowPredefinedKeys(!showPredefinedKeys)}
      />
    </div>
  );
};

export default KeySelector;


