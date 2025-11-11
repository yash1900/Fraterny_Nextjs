'use client';

import React, { useState, useEffect } from 'react';
import { NumberDropdownProps } from '../types/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function NumberDropdownResponse({
  question,
  onResponse,
  isActive = true,
  isAnswered = false,
  previousResponse = '',
  placeholder = 'Select an option',
  className = ''
}: NumberDropdownProps) {
  const [selectedValue, setSelectedValue] = useState<string>(previousResponse);

  useEffect(() => {
    if (previousResponse) {
      setSelectedValue(previousResponse);
    }
  }, [previousResponse]);

  const handleValueChange = (value: string) => {
    if (!isActive || isAnswered) return;
    
    setSelectedValue(value);
    onResponse(value);
  };

  return (
    <div className={`number-dropdown-response ${className}`}>
      <Select
        value={selectedValue}
        onValueChange={handleValueChange}
        disabled={!isActive || isAnswered}
      >
        <SelectTrigger 
          className={`
            w-full p-4 border rounded-lg text-xl py-6 font-gilroy-regular
            ${!isActive || isAnswered ? 'bg-gray-50 opacity-90 cursor-not-allowed' : 'bg-white'}
            ${selectedValue ? 'border-neutral-700' : 'border-gray-200'}
          `}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className='max-h-60 overflow-y-auto'>
          {question.options?.map((option: string, index: number) => (
            <SelectItem key={index} value={option} className='text-lg font-gilroy-regular'>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default NumberDropdownResponse;