'use client';


import { useState } from 'react';
import { Info } from 'lucide-react';
import { IMAGE_KEYS } from './constants';

interface PredefinedKeysSectionProps {
  onSelectKey: (key: string, description: string) => void;
  visible: boolean;
  onToggle: () => void;
}

const PredefinedKeysSection = ({ onSelectKey, visible, onToggle }: PredefinedKeysSectionProps) => {
  return (
    <>
      <div className="bg-navy bg-opacity-10 rounded-lg p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-navy flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium text-navy">Replace Website Images</h3>
          <p className="text-sm text-gray-700">
            To replace placeholder images on the website, use one of the predefined keys. 
            Custom keys will be available for use but won't automatically replace website images.
          </p>
          <button
            type="button"
            onClick={onToggle}
            className="text-sm text-terracotta hover:text-terracotta-dark underline mt-2"
          >
            {visible ? 'Hide predefined keys' : 'Show predefined keys'}
          </button>
        </div>
      </div>
      
      {visible && (
        <div className="border border-gray-200 rounded-lg p-3 max-h-60 overflow-y-auto">
          <h4 className="font-medium text-navy mb-2">Select a predefined key:</h4>
          <div className="grid grid-cols-1 gap-2">
            {IMAGE_KEYS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelectKey(item.key, item.description)}
                className="text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded text-sm transition-colors"
              >
                <span className="font-medium text-navy block">{item.key}</span>
                <span className="text-xs text-gray-600">{item.description}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default PredefinedKeysSection;


