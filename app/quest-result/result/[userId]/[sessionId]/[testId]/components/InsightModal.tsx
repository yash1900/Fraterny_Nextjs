// InsightModal.tsx
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface InsightModalProps {
  insight: { index: number; text: string } | null;
  onClose: () => void;
  attribute?: string;
}

export const InsightModal: React.FC<InsightModalProps> = ({ insight, onClose, attribute }) => {
  if (!insight) return null;

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
          className="absolute inset-x-4 top-1/2 -translate-y-1/2 mx-auto max-w-[350px] min-h-[280px] rounded-[20px] bg-gradient-to-b from-cyan-900 to-purple-900 overflow-hidden"
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

          <div className="relative z-10 p-6 pt-16">
            <div className="text-4xl font-gilroy-regular leading-tight text-white">
              {insight.text}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};