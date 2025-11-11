// FindingModal.tsx
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface FindingModalProps {
  finding: string | null;
  onClose: () => void;
  selectedIndex: number | null;
}

export const FindingModal: React.FC<FindingModalProps> = ({ finding, onClose, selectedIndex }) => {
  if (!finding) return null;

  const gradients = [
    "bg-gradient-to-b from-emerald-700 to-emerald-900",
    "bg-gradient-to-b from-indigo-700 to-indigo-900",
    "bg-gradient-to-b from-rose-700 to-rose-900",
    "bg-gradient-to-b from-amber-600 to-amber-800",
    "bg-gradient-to-b from-purple-700 to-purple-900"
  ];

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[70]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <motion.div
          className="absolute inset-x-4 top-1/2 -translate-y-1/2 mx-auto max-w-[350px] max-h-[calc(100vh-4rem)] min-h-[280px] rounded-[20px] bg-[#7dc3e4] flex flex-col"
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

          <div className="flex-1 overflow-y-auto p-6 pt-16" style={{
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain'
          }}>
            <p className="text-white text-3xl font-gilroy-regular leading-tight">
              {finding}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};