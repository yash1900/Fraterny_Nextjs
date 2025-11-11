'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Clock, XCircle, DollarSign, ChevronLeft, ChevronRight, Copy, Check, Eye, Search, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

// Types
type RefundStatus = 
  | 'initiated' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'partial' 
  | 'cancelled';

type RefundTransaction = {
  refund_id: string;
  transaction_id?: string | null;
  payment_id?: string | null;
  order_id?: string | null;
  session_id?: string | null;
  testid?: string | null;
  user_id?: string | null;
  refund_amount: number;
  original_amount: number;
  currency: string;
  gateway: string;
  refund_status: RefundStatus;
  gateway_refund_id?: string | null;
  gateway_refund_status?: string | null;
  initiated_by: string;
  initiated_at: string;
  processed_at?: string | null;
  completed_at?: string | null;
  reason?: string | null;
  admin_notes?: string | null;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_mobile?: string | null;
  error_code?: string | null;
  error_message?: string | null;
  gateway_error?: any;
  gateway_response?: any;
};

type RefundStats = {
  totalRefunds: number;
  completedRefunds: number;
  failedRefunds: number;
  processingRefunds: number;
  totalRefundAmountUSD: number;
  totalRefundAmountINR: number;
  completedRefundAmountUSD: number;
  completedRefundAmountINR: number;
};

interface RefundHistoryPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helper function to format currency
const formatCurrency = (amount: number | string | null, currency: string = 'USD'): string => {
  if (!amount) return 'N/A';
  const numericAmount = (Number(amount) / 100).toFixed(2);
  if (currency === 'USD') return `$${numericAmount}`;
  else if (currency === 'INR') return `₹${numericAmount}`;
  else return `${numericAmount} ${currency}`;
};

const RefundHistoryPopup: React.FC<RefundHistoryPopupProps> = ({ isOpen, onClose }) => {
  // State
  const [loading, setLoading] = useState(false);
  const [refunds, setRefunds] = useState<RefundTransaction[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [stats, setStats] = useState<RefundStats | null>(null);
  const [activeStatus, setActiveStatus] = useState<RefundStatus | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [gateway, setGateway] = useState<'Razorpay' | 'paypal' | ''>('');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<RefundTransaction | null>(null);
  const [syncingRefundId, setSyncingRefundId] = useState<string | null>(null);

  // Fetch refund stats
  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/refund/stats');
      const result = await response.json();
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (err) {
      console.error('Error fetching refund stats:', err);
    }
  };

  // Fetch refunds
  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
      });

      if (searchTerm) params.append('searchTerm', searchTerm);
      if (gateway) params.append('gateway', gateway);
      if (activeStatus) params.append('refund_status', activeStatus);

      const response = await fetch(`/api/admin/refund?${params.toString()}`);
      const result = await response.json();

      if (result.success && result.data) {
        setRefunds(result.data.refunds);
        setPagination(result.data.pagination);
      } else {
        toast.error(result.error || 'Failed to load refund data');
      }
    } catch (err: any) {
      toast.error(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // View details
  const viewDetails = (refund: RefundTransaction) => {
    setSelectedRefund(refund);
    setShowDetailsPopup(true);
  };

  // Sync refund status with gateway
  const syncRefundStatus = async (refund: RefundTransaction) => {
    setSyncingRefundId(refund.refund_id);
    try {
      const response = await fetch(`/api/admin/refund/${refund.refund_id}/sync`, {
        method: 'POST',
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(`Status updated to: ${result.data.refund.refund_status}`);
        fetchRefunds(); // Refresh the list
      } else {
        toast.error(result.error || 'Failed to sync status');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to sync status');
    } finally {
      setSyncingRefundId(null);
    }
  };

  // Load data on mount or filter change
  useEffect(() => {
    if (isOpen) {
      fetchStats();
      fetchRefunds();
    }
  }, [isOpen, currentPage, activeStatus]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Refund History</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-semibold cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
            <div 
              onClick={() => setActiveStatus('')}
              className={`flex flex-col gap-2 rounded-xl p-6 border border-gray-200 bg-white cursor-pointer hover:shadow-lg transition-shadow ${
                activeStatus === '' ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-gray-600 text-base font-medium leading-normal">Total</p>
                <DollarSign className="h-6 w-6 text-blue-500" />
              </div>
              <p className="text-gray-900 tracking-tight text-4xl font-bold leading-tight">{stats.totalRefunds}</p>
              <p className="text-xs text-gray-500">
                {stats.totalRefundAmountINR > 0 && stats.totalRefundAmountUSD > 0
                  ? `${formatCurrency(stats.totalRefundAmountINR, 'INR')} + ${formatCurrency(stats.totalRefundAmountUSD, 'USD')}`
                  : stats.totalRefundAmountINR > 0
                  ? formatCurrency(stats.totalRefundAmountINR, 'INR')
                  : formatCurrency(stats.totalRefundAmountUSD, 'USD')
                }
              </p>
            </div>

            <div 
              onClick={() => setActiveStatus('completed')}
              className={`flex flex-col gap-2 rounded-xl p-6 border border-gray-200 bg-white cursor-pointer hover:shadow-lg transition-shadow ${
                activeStatus === 'completed' ? 'ring-2 ring-green-500 bg-green-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-gray-600 text-base font-medium leading-normal">Completed</p>
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <p className="text-gray-900 tracking-tight text-4xl font-bold leading-tight">{stats.completedRefunds}</p>
              <p className="text-xs text-green-600">
                {stats.completedRefundAmountINR > 0 && stats.completedRefundAmountUSD > 0
                  ? `${formatCurrency(stats.completedRefundAmountINR, 'INR')} + ${formatCurrency(stats.completedRefundAmountUSD, 'USD')}`
                  : stats.completedRefundAmountINR > 0
                  ? formatCurrency(stats.completedRefundAmountINR, 'INR')
                  : formatCurrency(stats.completedRefundAmountUSD, 'USD')
                }
              </p>
            </div>

            <div 
              onClick={() => setActiveStatus('processing')}
              className={`flex flex-col gap-2 rounded-xl p-6 border border-gray-200 bg-white cursor-pointer hover:shadow-lg transition-shadow ${
                activeStatus === 'processing' ? 'ring-2 ring-orange-500 bg-orange-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-gray-600 text-base font-medium leading-normal">Processing</p>
                <Clock className="h-6 w-6 text-orange-500" />
              </div>
              <p className="text-gray-900 tracking-tight text-4xl font-bold leading-tight">{stats.processingRefunds}</p>
              <p className="text-xs text-orange-600">In Progress</p>
            </div>

            <div 
              onClick={() => setActiveStatus('failed')}
              className={`flex flex-col gap-2 rounded-xl p-6 border border-gray-200 bg-white cursor-pointer hover:shadow-lg transition-shadow ${
                activeStatus === 'failed' ? 'ring-2 ring-red-500 bg-red-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-gray-600 text-base font-medium leading-normal">Failed</p>
                <XCircle className="h-6 w-6 text-red-500" />
              </div>
              <p className="text-gray-900 tracking-tight text-4xl font-bold leading-tight">{stats.failedRefunds}</p>
              <p className="text-xs text-red-600">Need Attention</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search refund ID, email..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={gateway}
              onChange={(e) => setGateway(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Gateways</option>
              <option value="Razorpay">Razorpay</option>
              <option value="paypal">PayPal</option>
            </select>

            <button
              onClick={() => {
                setCurrentPage(1);
                fetchRefunds();
              }}
              disabled={loading}
              className="flex items-center justify-center rounded-lg h-11 bg-blue-600 text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-8 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto px-6 pb-6">
          <table className="w-full text-left">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Refund ID</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Gateway</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="py-4 px-4"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-20 ml-auto"></div></td>
                  </tr>
                ))
              ) : refunds.length > 0 ? (
                refunds.map((refund) => (
                  <tr key={refund.refund_id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 group">
                        <span className="text-sm font-mono text-gray-900">
                          #{refund.refund_id.substring(0, 8)}...
                        </span>
                        <button
                          onClick={() => copyToClipboard(refund.refund_id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {copiedText === refund.refund_id ? 
                            <Check className="h-3 w-3 text-green-600" /> : 
                            <Copy className="h-3 w-3 text-gray-600" />
                          }
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm font-medium text-gray-900">{refund.customer_name || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{refund.customer_email || 'N/A'}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(refund.refund_amount, refund.currency)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        refund.gateway === 'Razorpay' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {refund.gateway}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs rounded-full font-medium ${
                        refund.refund_status === 'completed' ? 'bg-green-100 text-green-800' :
                        refund.refund_status === 'processing' || refund.refund_status === 'initiated' ? 'bg-orange-100 text-orange-800' :
                        refund.refund_status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          refund.refund_status === 'completed' ? 'bg-green-600' :
                          refund.refund_status === 'processing' || refund.refund_status === 'initiated' ? 'bg-orange-600' :
                          refund.refund_status === 'failed' ? 'bg-red-600' :
                          'bg-gray-600'
                        }`}></span>
                        {refund.refund_status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {new Date(refund.initiated_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(refund.refund_status === 'initiated' || refund.refund_status === 'processing') && (
                          <button
                            onClick={() => syncRefundStatus(refund)}
                            disabled={syncingRefundId === refund.refund_id}
                            className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 text-sm font-medium disabled:opacity-50"
                            title="Sync status with gateway"
                          >
                            <RefreshCw className={`h-4 w-4 ${syncingRefundId === refund.refund_id ? 'animate-spin' : ''}`} />
                          </button>
                        )}
                        <button
                          onClick={() => viewDetails(refund)}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    No refunds found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, pagination.totalRecords)} of {pagination.totalRecords}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center justify-center rounded-lg h-9 w-9 border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="flex items-center justify-center rounded-lg h-9 px-4 border border-gray-300 bg-white text-sm font-medium text-gray-600">
                {currentPage} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={currentPage === pagination.totalPages}
                className="flex items-center justify-center rounded-lg h-9 w-9 border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Popup */}
      {showDetailsPopup && selectedRefund && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="text-lg font-bold">Refund Details</h3>
              <button onClick={() => setShowDetailsPopup(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Refund ID</p>
                    <p className="text-sm font-mono text-gray-900 break-all">{selectedRefund.refund_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Transaction ID</p>
                    <p className="text-sm font-mono text-gray-900 break-all">{selectedRefund.transaction_id || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="text-sm text-gray-900">{selectedRefund.customer_name}</p>
                    <p className="text-xs text-gray-500">{selectedRefund.customer_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="text-sm font-bold text-red-600">{formatCurrency(selectedRefund.refund_amount, selectedRefund.currency)}</p>
                    <p className="text-xs text-gray-500">of {formatCurrency(selectedRefund.original_amount, selectedRefund.currency)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Gateway</p>
                    <p className="text-sm text-gray-900">{selectedRefund.gateway}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="text-sm text-gray-900">{selectedRefund.refund_status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Initiated By</p>
                    <p className="text-sm text-gray-900">{selectedRefund.initiated_by}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Initiated At</p>
                    <p className="text-sm text-gray-900">{new Date(selectedRefund.initiated_at).toLocaleString()}</p>
                  </div>
                </div>
                {selectedRefund.reason && (
                  <div>
                    <p className="text-sm text-gray-600">Reason</p>
                    <p className="text-sm text-gray-900">{selectedRefund.reason}</p>
                  </div>
                )}
                {selectedRefund.admin_notes && (
                  <div>
                    <p className="text-sm text-gray-600">Admin Notes</p>
                    <p className="text-sm text-gray-900">{selectedRefund.admin_notes}</p>
                  </div>
                )}
                {selectedRefund.error_message && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-red-900">Error</p>
                    <p className="text-sm text-red-600">{selectedRefund.error_message}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t p-4">
              <button
                onClick={() => setShowDetailsPopup(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefundHistoryPopup;
