'use client';

import React, { useState } from 'react';
import { Star, Copy, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export interface EnrichedFeedback {
  id: string;
  user_id: string | null;
  testid: string | null;
  rating: string | null;
  feedback: string | null;
  date_time: string | null;
  created_at: string;
  user_data: {
    user_id: string;
    user_name: string | null;
    email: string | null;
    mobile_number: string | null;
    city: string | null;
    gender: string | null;
  } | null;
  summary_generation: {
    testid: string | null;
    quest_pdf: string | null;
    payment_status: string | null;
    paid_generation_time: string | null;
    quest_status: string | null;
    status: string | null;
    qualityscore: number | null;
    starting_time: string | null;
    completion_time: string | null;
  } | null;
}

interface FeedbackDetailsModalProps {
  feedback: EnrichedFeedback | null;
  isOpen: boolean;
  onClose: () => void;
}

const StarRating: React.FC<{ rating: number; size?: string }> = ({ rating, size = 'h-4 w-4' }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star 
          key={star} 
          className={`${size} ${
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`} 
        />
      ))}
      <span className="text-sm text-gray-600 ml-1">({rating})</span>
    </div>
  );
};

export default function FeedbackDetailsModal({ feedback, isOpen, onClose }: FeedbackDetailsModalProps) {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isOpen || !feedback) return null;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      toast.error('Failed to copy');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">Feedback Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Feedback Overview */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Feedback Overview</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Rating</p>
                <div className="mt-1">
                  <StarRating rating={parseInt(feedback.rating || '0')} size="h-6 w-6" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Date</p>
                <p className="text-sm text-gray-900">{formatDate(feedback.date_time)}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-600">Feedback</p>
                <p className="text-sm text-gray-900 mt-1 p-3 bg-white rounded border">
                  {feedback.feedback || 'No feedback provided'}
                </p>
              </div>
            </div>
          </div>

          {/* User Information */}
          {feedback.user_data && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">User Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Name</p>
                  <p className="text-sm text-gray-900">{feedback.user_data.user_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-sm text-gray-900">{feedback.user_data.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Mobile</p>
                  <p className="text-sm text-gray-900">{feedback.user_data.mobile_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">City</p>
                  <p className="text-sm text-gray-900">{feedback.user_data.city || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Gender</p>
                  <p className="text-sm text-gray-900">{feedback.user_data.gender || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">User ID</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono text-gray-900">{feedback.user_data.user_id || 'N/A'}</p>
                    {feedback.user_data.user_id && (
                      <button 
                        onClick={() => copyToClipboard(feedback.user_data?.user_id || '')}
                        className="p-1 hover:bg-gray-200 rounded" 
                        title="Copy"
                      >
                        {copiedText === feedback.user_data.user_id ? 
                          <Check className="h-3 w-3 text-green-600" /> : 
                          <Copy className="h-3 w-3 text-gray-600" />
                        }
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Test Information */}
          {feedback.summary_generation && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">Related Test Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Test ID</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-mono text-gray-900 break-all">{feedback.summary_generation.testid || 'N/A'}</p>
                      {feedback.summary_generation.testid && (
                        <button 
                          onClick={() => copyToClipboard(feedback.summary_generation?.testid || '')}
                          className="p-1 hover:bg-gray-200 rounded flex-shrink-0" 
                          title="Copy"
                        >
                          {copiedText === feedback.summary_generation.testid ? 
                            <Check className="h-3 w-3 text-green-600" /> : 
                            <Copy className="h-3 w-3 text-gray-600" />
                          }
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Payment Status</p>
                    <p className="text-sm text-gray-900">{feedback.summary_generation.payment_status || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Quest Status</p>
                    <p className="text-sm text-gray-900">{feedback.summary_generation.quest_status || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Quality Score</p>
                    <p className="text-lg font-bold text-purple-600">{feedback.summary_generation.qualityscore || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Starting Time</p>
                    <p className="text-sm text-gray-900">{formatDate(feedback.summary_generation.starting_time)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Completion Time</p>
                    <p className="text-sm text-gray-900">{formatDate(feedback.summary_generation.completion_time)}</p>
                  </div>
                </div>
              </div>
              
              {feedback.summary_generation.quest_pdf && (
                <div className="mt-4 pt-4 border-t border-purple-200">
                  <p className="text-sm font-medium text-gray-600 mb-2">Quest PDF</p>
                  <a 
                    href={feedback.summary_generation.quest_pdf} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
