'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Eye, Trash2, Copy, Check, Star, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import FeedbackStats, { FeedbackStatsData } from './components/FeedbackStats';
import FeedbackDetailsModal, { EnrichedFeedback } from './components/FeedbackDetailsModal';

export default function AdminFeedbackManagement() {
  const [loading, setLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState<EnrichedFeedback[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<FeedbackStatsData>({
    totalFeedbacks: 0,
    averageRating: 0,
    ratingDistribution: { rating1: 0, rating2: 0, rating3: 0, rating4: 0, rating5: 0 },
    feedbacksWithTestId: 0,
    feedbacksWithoutTestId: 0,
    recentFeedbacks: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedRating, setSelectedRating] = useState<'' | '1' | '2' | '3' | '4' | '5'>('');

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<EnrichedFeedback | null>(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState<EnrichedFeedback | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Fetch stats
  const fetchStatsData = async () => {
    try {
      const response = await fetch('/api/admin/feedback/stats');
      const result = await response.json();
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (err: any) {
      console.error('Error fetching feedback stats:', err);
    }
  };

  // Fetch feedbacks
  const fetchFeedbacksData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
      });

      if (searchTerm) params.append('searchTerm', searchTerm);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      if (selectedRating) params.append('rating', selectedRating);

      const response = await fetch(`/api/admin/feedback?${params}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setFeedbacks(result.data.feedbacks);
        setPagination(result.data.pagination);
      } else {
        setError(result.error || 'Failed to load feedback data');
        setFeedbacks([]);
        setPagination(null);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setFeedbacks([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchFeedbacksData();
  };

  const resetFilters = () => {
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
    setSelectedRating('');
    setCurrentPage(1);
    setError(null);
    setTimeout(() => fetchFeedbacksData(), 0);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy');
    }
  };

  const handleDelete = async () => {
    if (!feedbackToDelete) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/feedback/${feedbackToDelete.id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      
      if (result.success) {
        toast.success('Feedback deleted successfully');
        setShowDeletePopup(false);
        setFeedbackToDelete(null);
        fetchFeedbacksData();
        fetchStatsData();
      } else {
        toast.error(result.error || 'Failed to delete feedback');
      }
    } catch (error: any) {
      toast.error('Failed to delete feedback');
      setError(error.message || 'Failed to delete feedback');
    } finally {
      setDeleting(false);
    }
  };

  const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star} 
            className={`h-4 w-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`} 
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating})</span>
      </div>
    );
  };

  useEffect(() => {
    fetchStatsData();
    fetchFeedbacksData();
  }, []);

  useEffect(() => {
    if (currentPage > 1) {
      fetchFeedbacksData();
    }
  }, [currentPage]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Feedback Management</h1>
      </div>
      
      <FeedbackStats stats={stats} />

      {/* Filter Section */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Filter Feedbacks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end mb-6">
          <label className="flex flex-col">
            <p className="text-sm font-medium text-gray-700 pb-2">Search</p>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by user, test ID, feedback..."
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="flex flex-col">
            <p className="text-sm font-medium text-gray-700 pb-2">Rating</p>
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value as typeof selectedRating)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </label>

          <label className="flex flex-col">
            <p className="text-sm font-medium text-gray-700 pb-2">From Date</p>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="flex flex-col">
            <p className="text-sm font-medium text-gray-700 pb-2">To Date</p>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
          </label>

          <div className="flex gap-2">
            <Button onClick={applyFilters} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
            <Button variant="outline" onClick={resetFilters} disabled={loading}>
              Reset
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-semibold mb-2">Error:</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Test ID</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Rating</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Feedback</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                Array.from({ length: pageSize }).map((_, index) => (
                  <tr key={`loading-${index}`} className="animate-pulse">
                    <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-48"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="py-4 px-4 text-right"><div className="h-4 bg-gray-200 rounded w-20 ml-auto"></div></td>
                  </tr>
                ))
              ) : feedbacks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500 text-sm">
                    No feedback found
                  </td>
                </tr>
              ) : (
                feedbacks.map((feedback) => {
                  const rating = parseInt(feedback.rating || '0');
                  return (
                    <tr key={feedback.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{feedback.user_data?.user_name || 'N/A'}</p>
                          <p className="text-gray-500">{feedback.user_data?.email || 'N/A'}</p>
                        </div>
                      </td>
                      
                      <td className="py-4 px-4">
                        {feedback.testid ? (
                          <div className="flex items-center gap-2 group">
                            <span className="text-sm font-mono text-gray-900" title={feedback.testid}>
                              {feedback.testid.length > 12 ? feedback.testid.substring(0, 12) + '...' : feedback.testid}
                            </span>
                            <button 
                              onClick={() => copyToClipboard(feedback.testid!)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded"
                            >
                              {copiedText === feedback.testid ? 
                                <Check className="h-3 w-3 text-green-600" /> : 
                                <Copy className="h-3 w-3 text-gray-600" />
                              }
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No Test ID</span>
                        )}
                      </td>
                      
                      <td className="py-4 px-4">
                        <StarRating rating={rating} />
                      </td>
                      
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-600 max-w-xs truncate" title={feedback.feedback || ''}>
                          {feedback.feedback || 'No feedback provided'}
                        </p>
                      </td>
                      
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {feedback.date_time ? new Date(feedback.date_time).toLocaleDateString() : 'N/A'}
                      </td>
                      
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => {
                              setSelectedFeedback(feedback);
                              setShowDetailsModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => {
                              setFeedbackToDelete(feedback);
                              setShowDeletePopup(true);
                            }}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {pagination && pagination.totalPages > 0 && (
          <div className="flex items-center justify-between pt-4">
            <span className="text-sm text-gray-600">
              Showing {((pagination.currentPage - 1) * pageSize) + 1} to {Math.min(pagination.currentPage * pageSize, pagination.totalRecords)} of {pagination.totalRecords} feedbacks
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center justify-center rounded-lg h-9 w-9 border border-gray-300 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              {Array.from({ length: Math.min(pagination.totalPages, 5) }).map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button 
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`h-9 w-9 rounded-lg text-sm font-medium ${
                      currentPage === pageNum 
                        ? 'bg-blue-600 text-white' 
                        : 'border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
                className="flex items-center justify-center rounded-lg h-9 w-9 border border-gray-300 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {showDeletePopup && feedbackToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete Feedback</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this feedback? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline"
                onClick={() => {
                  setShowDeletePopup(false);
                  setFeedbackToDelete(null);
                }}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <FeedbackDetailsModal
        feedback={selectedFeedback}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedFeedback(null);
        }}
      />
    </div>
  );
}
