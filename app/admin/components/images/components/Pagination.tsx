'use client';


import React from 'react';

interface PaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (newPage: number) => void;
}

const Pagination = ({ page, pageSize, totalCount, onPageChange }: PaginationProps) => {
  if (totalCount <= pageSize) return null;
  
  return (
    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-1 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      
      <span className="text-sm text-gray-700">
        Page {page} of {Math.ceil(totalCount / pageSize)}
      </span>
      
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={(page * pageSize) >= totalCount}
        className="px-3 py-1 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;

