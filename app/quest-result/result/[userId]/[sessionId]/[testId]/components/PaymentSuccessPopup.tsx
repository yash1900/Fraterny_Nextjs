'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';


interface PaymentSuccessPopupProps {
  open: boolean;
  onClose: () => void;
  userId?: string;
}

export const PaymentSuccessPopup: React.FC<PaymentSuccessPopupProps> = ({ open, onClose, userId }) => {
  const router = useRouter();

  const handleDashboardClick = () => {
    if (userId) {
      router.push(`/quest-dashboard/${userId}`);
    } else {
      router.push('/quest-dashboard');
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[80]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4 relative"
          >
            <button
              aria-label="Close"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-2 hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>

            <p className="text-gray-600 text-xl leading-6 font-gilroy-regular mb-6 pr-8">
              Payment Recieved. I'm performing an indepth analysis to generate your Personalised PDF. It will be ready in 15 minutes. Please check your dashboard for the latest status.
            </p>

            <button
              onClick={handleDashboardClick}
              className="px-6 py-3 text-xl font-normal font-gilroy-bold tracking-[-1px] bg-gradient-to-br from-sky-800 to-sky-400 text-white rounded-lg hover:opacity-90 transition-colors"
            >
              Dashboard
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};