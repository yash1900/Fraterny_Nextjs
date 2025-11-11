// AstrologyModal.tsx
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface AstrologyModalProps {
  prediction: { title: string; likelihood: number; reason: string } | null;
  onClose: () => void;
}

export const AstrologyModal: React.FC<AstrologyModalProps> = ({ prediction, onClose }) => {
  if (!prediction) return null;

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
          className="absolute inset-x-4 top-1/2 -translate-y-1/2 mx-auto max-w-[350px] min-h-[320px] rounded-[20px] bg-gradient-to-b from-purple-900 to-indigo-800 overflow-hidden"
          initial={{ y: "50%", opacity: 0, scale: 0.9 }}
          animate={{ y: "-50%", opacity: 1, scale: 1 }}
          exit={{ y: "50%", opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-white/70 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="p-8 flex flex-col items-center justify-center h-full">
            <div className="text-white text-8xl font-gilroy-bold leading-none mb-6">
              {prediction.likelihood}%
            </div>

            <h3 className="text-white text-2xl font-gilroy-bold text-center mb-4 leading-tight">
              {prediction.title}
            </h3>

            <p className="text-white/90 text-base font-gilroy-regular text-center leading-relaxed">
              {prediction.reason}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};