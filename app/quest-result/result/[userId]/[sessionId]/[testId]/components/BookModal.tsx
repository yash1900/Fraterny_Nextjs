// BookModal.tsx
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen } from 'lucide-react';
import { Book } from '../utils/types';

interface BookModalProps {
  book: Book | null;
  onClose: () => void;
}

export const BookModal: React.FC<BookModalProps> = ({ book, onClose }) => {
  if (!book) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[70]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <motion.div
          className="absolute inset-x-4 top-1/2 -translate-y-1/2 mx-auto max-w-[350px] min-h-[320px] rounded-[20px] bg-gradient-to-b from-blue-800 to-blue-900 overflow-hidden"
          initial={{ y: "50%", opacity: 0, scale: 0.9 }}
          animate={{ y: "-50%", opacity: 1, scale: 1 }}
          exit={{ y: "50%", opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <button
            aria-label="Close"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 bg-white/20 hover:bg-white/30 transition-colors z-20"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          <div className="w-full h-32 bg-gradient-to-b from-blue-600 to-blue-700 flex items-center justify-center">
            <BookOpen className="h-16 w-16 text-white/80" />
          </div>

          <div className="p-6">
            <h3 className="text-3xl font-gilroy-bold text-white">
              {book.title}
            </h3>
            <p className="text-blue-200 text-lg font-gilroy-regular mb-4">
              by {book.author}
            </p>
            {book.description && (
              <p className="text-white/90 text-2xl leading-tight font-gilroy-semibold">
                {book.description}
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};