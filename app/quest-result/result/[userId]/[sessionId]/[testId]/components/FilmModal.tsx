// FilmModal.tsx
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Film } from 'lucide-react';
import { Film as FilmType } from '../utils/types';
import Image from 'next/image';

interface FilmModalProps {
  film: FilmType | null;
  onClose: () => void;
}

export const FilmModal: React.FC<FilmModalProps> = ({ film, onClose }) => {
  if (!film) return null;

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
          className="absolute inset-x-4 top-1/2 -translate-y-1/2 mx-auto max-w-[350px] min-h-[400px] rounded-[20px] bg-gradient-to-b from-blue-900 to-blue-800 overflow-hidden"
          initial={{ y: "50%", opacity: 0, scale: 0.9 }}
          animate={{ y: "-50%", opacity: 1, scale: 1 }}
          exit={{ y: "50%", opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <button
            aria-label="Close"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 bg-black hover:bg-white/30 transition-colors z-20"
          >
            <X className="h-5 w-5 text-white" />
          </button>

          <div className="w-full h-48 bg-gradient-to-b from-blue-600 to-blue-700 flex items-center justify-center relative">
            {film.imageUrl ? (
              <Image
                src={film.imageUrl}
                alt={film.title}
                fill
                className="object-cover"
              />
            ) : (
              <Film className="h-16 w-16 text-white/60" />
            )}
          </div>

          <div className="p-6">
            <h3 className="text-2xl font-gilroy-bold text-white mb-4">
              {film.title}
            </h3>
            <p className="text-white/90 text-base font-gilroy-regular leading-relaxed">
              {film.description}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};