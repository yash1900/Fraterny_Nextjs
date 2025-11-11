'use client';


import { Search } from 'lucide-react';
import React from 'react';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const SearchBar = ({ searchTerm, setSearchTerm, onSubmit }: SearchBarProps) => {
  return (
    <form onSubmit={onSubmit} className="relative w-full sm:w-auto">
      <input
        type="text"
        placeholder="Search images..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent w-full"
      />
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <button type="submit" className="sr-only">Search</button>
    </form>
  );
};

export default SearchBar;

