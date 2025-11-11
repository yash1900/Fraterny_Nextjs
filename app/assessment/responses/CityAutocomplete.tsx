'use client';

import React, { useState, useEffect, useRef } from 'react';
import { searchCities, CityResult } from '../hooks/cityApi';
import { motion } from 'framer-motion';

interface CityAutocompleteProps {
  onCitySelect: (city: string) => void;
  placeholder?: string;
  selectedCity?: string;
  isAnonymousMode?: boolean;
// onToggleAnonymous?: () => void;
}

export function CityAutocomplete({ 
  onCitySelect, 
  placeholder = "Start typing a city name...",
  selectedCity = "",
  isAnonymousMode = false,
  // onToggleAnonymous
}: CityAutocompleteProps) {

const [query, setQuery] = useState(selectedCity);
const [suggestions, setSuggestions] = useState<CityResult[]>([]);
const [showDropdown, setShowDropdown] = useState(false);
const [isLoading, setIsLoading] = useState(false);
const [hasSelectedFromDropdown, setHasSelectedFromDropdown] = useState(false);
const inputRef = useRef<HTMLInputElement>(null);
const [hasUserInteracted, setHasUserInteracted] = useState(false);

// useEffect(() => {
//   // Don't search if user just selected from dropdown
//   if (hasSelectedFromDropdown) {
//     setHasSelectedFromDropdown(false);
//     return;
//   }

//   const searchTimeout = setTimeout(async () => {
//     if (query.length >= 2) {
//       setIsLoading(true);
//       const results = await searchCities(query);
//       setSuggestions(results);
//       setShowDropdown(true);
//       setIsLoading(false);
//     } else {
//       setSuggestions([]);
//       setShowDropdown(false);
//     }
//   }, 300);

//   return () => clearTimeout(searchTimeout);
// }, [query]);
useEffect(() => {
  // Don't search if user just selected from dropdown
  if (hasSelectedFromDropdown) {
    setHasSelectedFromDropdown(false);
    return;
  }

  // Don't search on initial load with pre-filled data
  if (!hasUserInteracted) {
    return;
  }

  const searchTimeout = setTimeout(async () => {
    if (query.length >= 2) {
      setIsLoading(true);
      const results = await searchCities(query);
      setSuggestions(results);
      setShowDropdown(true);
      setIsLoading(false);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  }, 300);

  return () => clearTimeout(searchTimeout);
}, [query, hasUserInteracted]);


// const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//   setQuery(e.target.value);
//   // Reset the selection flag when user types manually
//   setHasSelectedFromDropdown(false);
// };
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setQuery(e.target.value);
  setHasUserInteracted(true); // Mark that user has interacted
  setHasSelectedFromDropdown(false);
};


const handleCitySelect = (city: CityResult) => {
  setQuery(city.displayName);
  setSuggestions([]);
  setShowDropdown(false);
  setHasSelectedFromDropdown(true); // Set flag BEFORE calling setQuery
  onCitySelect(city.displayName);
};

// Keep the second useEffect as is
useEffect(() => {
  if (selectedCity !== query) {
    setQuery(selectedCity);
    setHasSelectedFromDropdown(true);
  }
}, [selectedCity]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder={isAnonymousMode 
          ? "Anonymous mode" 
          : "City, Country"
        }
        disabled={isAnonymousMode}
        className="p-3 pb-10 bg-white rounded-lg border border-zinc-400 h-full w-full justify-start text-black text-xl font-normal font-gilroy-medium placeholder:text-xl placeholder:text-wrap placeholder:leading-tight placeholder:align-top placeholder:pt-0"
      />
      
      {isLoading && (
        <div className="absolute right-3 top-2.5">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      )}

      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
          {suggestions.map((city) => (
            <li
              key={city.id}
              onClick={() => handleCitySelect(city)}
              className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
            >
              {city.displayName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}