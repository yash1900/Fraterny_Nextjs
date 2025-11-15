'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// ADD these imports:
import { HonestyTag } from '../types/types';
import { AuthenticityTags } from '../components/AuthenticityTags';

interface RankingOption {
  id: string;
  text: string;
  selectedTags?: HonestyTag[];
  onTagSelect?: (tag: HonestyTag) => void;
  allowTags?: boolean;
  showTags?: boolean;
}

interface RankingResponseProps {
  options: string[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onResponse: (value: string) => void;
  disabled?: boolean;
  className?: string;
    selectedTags?: HonestyTag[];
  onTagSelect?: (tag: HonestyTag) => void;
  allowTags?: boolean;
  showTags?: boolean;
  
}

/**
 * Ranking component for ordering options by preference
 */
export function RankingResponse({
  options,
  value,
  onChange,
  onResponse,
  disabled = false,
  className = '',
  selectedTags = [],
  onTagSelect,
  allowTags = false,
  showTags = true,
}: RankingResponseProps) {
  // Parse existing response if available
  const parseResponse = (): { rankings: RankingOption[]; explanation: string; isUserRanked?: boolean } => {
    if (!value) {
      return { 
        rankings: options.map((text, index) => ({ id: `option-${index}`, text })),
        explanation: '',
        isUserRanked: false
      };
    }
    
    try {
      return JSON.parse(value);
    } catch (e) {
      return { 
        rankings: options.map((text, index) => ({ id: `option-${index}`, text })),
        explanation: '',
        isUserRanked: false
      };
    }
  };
  
  const [state, setState] = useState(parseResponse());
  const [draggedItem, setDraggedItem] = useState<RankingOption | null>(null);
  
  // Update state when value prop changes (e.g., when navigating back to this question)
  useEffect(() => {
    const parseCurrentValue = () => {
      if (!value) {
        return { 
          rankings: options.map((text, index) => ({ id: `option-${index}`, text })),
          explanation: '',
          isUserRanked: false
        };
      }
      
      try {
        return JSON.parse(value);
      } catch (e) {
        return { 
          rankings: options.map((text, index) => ({ id: `option-${index}`, text })),
          explanation: '',
          isUserRanked: false
        };
      }
    };
    
    const newParsedResponse = parseCurrentValue();
    setState(newParsedResponse);
  }, [value, options]); // Re-run when value or options change
  
  // Handle drag start
  const handleDragStart = (item: RankingOption) => {
    setDraggedItem(item);
  };
  
  // Handle drag end - moved before handleDragOver to fix "used before defined" error
  const handleDragEnd = () => {
    setDraggedItem(null);
    
    // Update the response value with user ranking flag
    const responseValue = JSON.stringify({ ...state, isUserRanked: true });
    const event = {
      target: { value: responseValue }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    
    onChange(event);
    onResponse(responseValue);
  };
  
  // Handle drag over
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (!draggedItem) return;
    
    const newRankings = [...state.rankings];
    const draggedIndex = newRankings.findIndex(item => item.id === draggedItem.id);
    
    if (draggedIndex === index) return;
    
    // Reorder the items
    newRankings.splice(draggedIndex, 1);
    newRankings.splice(index, 0, draggedItem);
    
    setState({
      ...state,
      rankings: newRankings,
      isUserRanked: true
    });
  };

// ADD this new function:
const moveItemUp = (index: number) => {
  if (index === 0 || disabled) return; // Can't move first item up
  
  const newRankings = [...state.rankings];
  // Swap with item above
  [newRankings[index], newRankings[index - 1]] = [newRankings[index - 1], newRankings[index]];
  
  const newState = { ...state, rankings: newRankings, isUserRanked: true };
  setState(newState);
  
  // Update response
  const responseValue = JSON.stringify(newState);
  const event = { target: { value: responseValue } } as React.ChangeEvent<HTMLTextAreaElement>;
  onChange(event);
  onResponse(responseValue);
};

// UPDATE: handleExplanationChange function (around line 80)
const handleExplanationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
  const newState = {
    ...state,
    explanation: e.target.value
  };
  
  setState(newState);
  
  // Update the response value
  const responseValue = JSON.stringify(newState);
  
  const event = {
    target: { value: responseValue }
  } as React.ChangeEvent<HTMLTextAreaElement>;
  
  onChange(event);
  
  // AUTO-SAVE: Call onResponse immediately
  // onResponse(responseValue);
};
  
  return (
    <div className={`ranking-response ${className}`}>
      <div className="mb-4">
        <p className="text-[18px] text-[#A1A1AA] font-normal font-gilroy-medium mb-3">
          Rank the following in order of importance. <span className='font-bold'>1</span> being the most important. Tell us why also.
        </p>
        
        <div className="space-y-2">
          {state.rankings.map((item, index) => (
            // <motion.div
            //   key={item.id}
            //   draggable={!disabled}
            //   onDragStart={() => handleDragStart(item)}
            //   onDragOver={(e) => handleDragOver(e, index)}
            //   onDragEnd={handleDragEnd}
            //   className={`
            //     flex items-center rounded-lg h-14 text-left pl-3 text-xl font-normal font-['Gilroy-Medium'] border
            //     ${index === 0 ? '' : 'bg-[#FFFFFF]'}
            //     ${draggedItem?.id === item.id ? 'opacity-50' : 'opacity-100'}
            //   `}
            // >
            //   <div className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 mr-3">
            //     <span className="font-['Gilroy-Medium']">{index + 1}</span>
            //   </div>
            //   <span>{item.text}</span>
            // </motion.div>
            // REPLACE the entire motion.div with:
            <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  layout: { duration: 0.3, ease: "easeInOut" },
                  opacity: { duration: 0.2 }
                }}
                className="flex items-center rounded-lg h-14 text-left pl-3 text-xl font-normal font-['Gilroy-Medium'] border bg-[#FFFFFF]"
              >
              {/* Up Arrow Button */}
              <button
                onClick={() => moveItemUp(index)}
                disabled={index === 0 || disabled}
                className={`mr-2 p-1 rounded ${index === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'}`}
              >
                ↑
              </button>
              
              {/* Number Circle */}
              <div className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 mr-3">
                <span className="font-gilroy-medium">{index + 1}</span>
              </div>
              
              {/* Item Text */}
              <span className='font-gilroy-medium'>{item.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
      
      <div className="mt-6">
        {/* <label className="block text-[18px] text-[#A1A1AA] font-normal font-['Gilroy-Medium'] mb-2">
          Explain why your top choice is most important to you:
        </label> */}
        <textarea
          value={state.explanation}
          onChange={handleExplanationChange}
          placeholder="Write one sentence explaining why..."
          className="w-full p-3 border bg-white border-gray-200 rounded-lg justify-start text-black text-xl font-normal font-gilroy-medium resize-y"
          disabled={disabled}
        />
      </div>

      {allowTags && showTags && onTagSelect && (
        <div className="mt-4 mb-3">
          <p className="font-normal font-gilroy-medium text-gray-600 pb-2"> Want to tag your answer? </p>
          <AuthenticityTags 
            selectedTags={selectedTags}
            onTagSelect={onTagSelect}
            disabled={disabled}
          />
        </div>
      )}
      
      {/* {!disabled && (
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-4 px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta/90 transition-colors"
          disabled={!state.rankings.length || !state.explanation.trim() || disabled}
        >
          Submit
        </motion.button>
      )} */}
    </div>
  );
}

export default RankingResponse;