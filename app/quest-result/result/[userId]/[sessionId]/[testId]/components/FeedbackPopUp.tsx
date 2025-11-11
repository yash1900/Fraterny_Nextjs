'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Send, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';




interface FeedbackPopupProps {
  open: boolean;
  onClose: () => void;
  onDismiss?: (hasInteracted: boolean) => void;
  sessionId?: string;
  testId?: string;
  userId?: string;
}

export const FeedbackPopup: React.FC<FeedbackPopupProps> = ({ open, onClose, onDismiss, sessionId, testId, userId }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const handleStarClick = (starNumber: number) => {
    setRating(starNumber);
  };

  const handleSubmit = async () => {
    // Allow submission even without rating, as per backend requirements
    if (rating === 0 && !feedback.trim()) {
      toast.error('Please provide either a rating or feedback', { position: "top-right" });
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare data in the format expected by backend
      const requestData = {
        user_id: userId || null,
        testId: testId || null, // Backend expects "testId"
        feedback: feedback.trim() || null, // Send null if empty, as per backend requirement
        rating: rating || null
      };

      console.log('Submitting overall feedback:', requestData);

      const response = await axios.post('/api/feedback/submit', requestData);

      console.log('Overall feedback response:', response.data);
      console.log('Response status:', response.status);
      
      // Check HTTP status code (200-299 is success)
      if (response.status >= 200 && response.status < 300) {
        // Show thank you popup
        setShowThankYou(true);
        
        // Auto-close thank you popup after 2 seconds
        setTimeout(() => {
          setShowThankYou(false);
          setRating(0);
          setFeedback("");
          onClose();
        }, 2000);
      } else {
        // Handle backend error response
        toast.error(response.data?.message || 'Failed to submit feedback', { position: "top-right" });
      }
    } catch (error: any) {
      console.error('Failed to submit overall feedback:', error);
      
      // Handle axios error response
      const errorMessage = error.response?.data?.message || 'Failed to submit feedback. Please try again.';
      toast.error(errorMessage, { position: "top-right" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Always show star when user closes popup without submitting
    // (whether they interacted or not)
    if (onDismiss) {
      onDismiss(true); // Always true since they didn't submit
    }
    
    setRating(0);
    setFeedback("");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[80] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full relative shadow-2xl"
          >
            {showThankYou ? (
              /* Thank You View */
              <div className="flex flex-col items-center justify-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="mb-4"
                >
                  <CheckCircle2 className="h-16 w-16 text-green-500" />
                </motion.div>
                <h3 className="text-2xl font-gilroy-bold text-gray-900 mb-2">
                  Thank You!
                </h3>
                <p className="text-gray-600 font-gilroy-regular text-center">
                  Your feedback helps us improve
                </p>
              </div>
            ) : (
              /* Feedback Form View */
              <>
                {/* Close Button */}
                <button
                  aria-label="Close"
                  onClick={handleClose}
                  className="absolute right-4 top-4 rounded-full p-2 hover:bg-gray-100 transition-colors z-10"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>

            {/* Header */}
            <div className="mb-6">
              <h3 className="text-2xl font-gilroy-bold text-gray-900 mb-2">
                Rate my Accuracy
              </h3>
              <p className="text-gray-600 font-gilroy-regular text-sm">
                Do you have any feedback on my accuracy and depth?
              </p>
            </div>

            {/* Star Rating */}
            <div className="mb-6">
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    onClick={() => handleStarClick(star)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-1 transition-colors"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${star <= rating
                        ? 'text-sky-500 fill-sky-500'
                        : 'text-gray-300 hover:text-gray-400'
                        }`}
                    />
                  </motion.button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-center text-sm text-gray-600 mt-2 font-gilroy-regular">
                  {rating === 1 && 'Inaccurate'}
                  {rating === 2 && 'Less Accurate'}
                  {rating === 3 && 'Somewhat Accurate'}
                  {rating === 4 && 'Accurate'}
                  {rating === 5 && 'Very Accurate'}
                </p>
              )}
            </div>

            {/* Feedback Text */}
            <div className="mb-6">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us more about your experience... (optional)"
                className="w-full p-3 border border-gray-200 rounded-xl resize-none font-gilroy-regular text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <motion.button
                onClick={handleSubmit}
                disabled={(rating === 0 && !feedback.trim()) || isSubmitting}
                whileHover={(rating > 0 || feedback.trim()) ? { scale: 1.02 } : {}}
                whileTap={(rating > 0 || feedback.trim()) ? { scale: 0.98 } : {}}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-gilroy-bold text-sm transition-all ${(rating > 0 || feedback.trim())
                  ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Feedback
                  </>
                )}
              </motion.button>
            </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
