'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertTriangle, ChevronLeft, ChevronRight, Copy, Check, RefreshCw, Eye, History } from 'lucide-react';
import { toast } from 'sonner';
import RefundPopup from './RefundPopup';
import RefundHistoryPopup from './RefundHistoryPopup';

// Types
type PaymentStatus = 'success' | 'Start' | 'error';

type EnrichedTransaction = {
  transaction_id?: string | null;
  payment_id?: string | null;
  order_id?: string | null;
  session_id?: string | null;
  testid?: string | null;
  user_id?: string | null;
  total_paid?: number | null;
  total_discount?: number | null;
  coupon?: string | null;
  gateway?: string | null;
  IsIndia?: boolean | null;
  status?: string | null;
  payment_completed_time?: string | null;
  session_start_time?: string | null;
  paypal_order_id?: string | null;
  payment_session_id?: string | null;
  session_duration?: string | null;
  date?: string | null;
  user_data?: {
    user_id?: string | null;
    user_name?: string | null;
    email?: string | null;
    mobile_number?: string | null;
    city?: string | null;
    gender?: string | null;
    dob?: string | null;
    is_anonymous?: string | null;
    last_used?: string | null;
    total_summary_generation?: number | null;
    total_paid_generation?: number | null;
  } | null;
  summary_generation?: {
    testid?: string | null;
    quest_pdf?: string | null;
    payment_status?: string | null;
    paid_generation_time?: string | null;
    summary_error?: string | null;
    quest_error?: string | null;
    quest_status?: string | null;
    status?: string | null;
    qualityscore?: string | null;
    ip_address?: string | null;
  } | null;
};

type PaymentFilters = {
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
  gateway?: 'Razorpay' | 'paypal';
  isIndia?: boolean | null;
};

type PaginationParams = {
  page: number;
  pageSize: number;
};

// Helper function to format currency based on gateway and location
const formatCurrency = (amount: number | string | null | undefined, gateway: string | null | undefined, isIndia: boolean | null | undefined): string => {
  if (!amount) return 'N/A';
  
  const numericAmount = (Number(amount) / 100).toFixed(2); // Divide by 100 and format to 2 decimals
  
  if (gateway === 'paypal') {
    // PayPal always shows dollar sign regardless of location
    return `$${numericAmount}`;
  } else if (gateway === 'Razorpay') {
    // Razorpay: India = ₹, International = $
    return isIndia === true ? `₹${numericAmount}` : `$${numericAmount}`;
  } else {
    // Other gateways: default based on location
    return isIndia === true ? `₹${numericAmount}` : `$${numericAmount}`;
  }
};

const AdminQuestPayment: React.FC = () => {
  
  // State for data
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<EnrichedTransaction[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusCounts, setStatusCounts] = useState({ success: 0, attempted: 0, disputed: 0 });

  // Filter states
  const [activeStatus, setActiveStatus] = useState<PaymentStatus>('success');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10); // Fixed at 10 per page
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [gateway, setGateway] = useState<'Razorpay' | 'paypal' | ''>('');
  const [isIndia, setIsIndia] = useState<boolean | null>(null);
  
  // Refund popup state
  const [showRefundPopup, setShowRefundPopup] = useState(false);
  const [showRefundHistoryPopup, setShowRefundHistoryPopup] = useState(false);
  
  // View Details popup state
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [selectedTransactionDetails, setSelectedTransactionDetails] = useState<EnrichedTransaction | null>(null);
  
  // Copy functionality state
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Fetch payment count for each status type to display on cards
  const fetchStatusCounts = async () => {
    try {
      // We can make parallel requests for efficiency
      const [successResponse, attemptedResponse, disputedResponse] = await Promise.all([
        fetch('/api/admin/payments?status=success&page=1&pageSize=1').then(res => res.json()),
        fetch('/api/admin/payments?status=Start&page=1&pageSize=1').then(res => res.json()),
        fetch('/api/admin/payments?status=error&page=1&pageSize=1').then(res => res.json())
      ]);

      setStatusCounts({
        success: successResponse.data?.pagination.totalRecords || 0,
        attempted: attemptedResponse.data?.pagination.totalRecords || 0,
        disputed: disputedResponse.data?.pagination.totalRecords || 0
      });
    } catch (err: any) {
      console.error('Error fetching status counts:', err);
    }
  };

  // Fetch payment data based on current filters
  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    // Clear existing transactions to prevent mixing old and new data
    setTransactions([]);
    setPagination(null);

    try {
      // Build query parameters
      const params = new URLSearchParams({
        status: activeStatus,
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
      });

      // Add filters to params
      if (searchTerm) params.append('searchTerm', searchTerm);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      if (gateway) params.append('gateway', gateway);
      if (isIndia !== null && isIndia !== undefined) params.append('isIndia', isIndia.toString());

      console.log('🔍 Applying filters:', {
        searchTerm,
        dateFrom,
        dateTo,
        gateway,
        isIndia,
        activeStatus
      });

      const response = await fetch(`/api/admin/payments?${params.toString()}`);
      const result = await response.json();

      if (result.success && result.data) {
        let filteredTransactions = result.data.transactions;
        
        // Frontend backup filter for location consistency
        if (isIndia !== null && isIndia !== undefined) {
          const originalCount = filteredTransactions.length;
          filteredTransactions = filteredTransactions.filter((transaction: EnrichedTransaction) => {
            const matches = transaction.IsIndia === isIndia;
            if (!matches) {
              console.log('🚨 Frontend filter removing inconsistent record:', {
                transactionId: transaction.transaction_id || transaction.payment_id,
                expectedIsIndia: isIndia,
                actualIsIndia: transaction.IsIndia,
                actualIsIndiaType: typeof transaction.IsIndia
              });
            }
            return matches;
          });
          
          if (originalCount !== filteredTransactions.length) {
            console.log('🔄 Frontend filter applied:', {
              originalCount,
              filteredCount: filteredTransactions.length,
              removed: originalCount - filteredTransactions.length
            });
          }
        }
        
        console.log('📊 Final transaction data being set:', {
          originalCount: result.data.transactions.length,
          filteredCount: filteredTransactions.length,
          pageSize,
          currentPage,
          paginationData: result.data.pagination
        });
        
        setTransactions(filteredTransactions);
        setPagination(result.data.pagination);
      } else {
        setError(result.error || 'Failed to load payment data');
        setTransactions([]);
        setPagination(null);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setTransactions([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle status card click
  const handleStatusChange = (status: PaymentStatus) => {
    setActiveStatus(status);
    setCurrentPage(1); // Reset to first page when status changes
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    console.log('📄 Page change requested:', {
      fromPage: currentPage,
      toPage: page,
      currentTransactionCount: transactions.length
    });
    setCurrentPage(page);
  };
  
  // Handle filter apply
  const applyFilters = () => {
    setCurrentPage(1); // Reset to first page when filters change
    fetchPayments();
  };
  
  // Handle filter reset
  const resetFilters = () => {
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
    setGateway('');
    setIsIndia(null);
    setCurrentPage(1);
    setError(null);
    setTransactions([]);
    setPagination(null);
    // Immediately fetch data after reset
    setTimeout(() => {
      fetchPayments();
    }, 0);
  };

  // Open refund popup - disabled for now
  // const openRefundPopup = (transaction: EnrichedTransaction) => {
  //   setSelectedTransaction(transaction);
  //   setShowRefundPopup(true);
  // };

  // Close refund popup - disabled for now
  // const closeRefundPopup = () => {
  //   setShowRefundPopup(false);
  //   setSelectedTransaction(null);
  // };
  
  // Open view details popup
  const openDetailsPopup = (transaction: EnrichedTransaction) => {
    setSelectedTransactionDetails(transaction);
    setShowDetailsPopup(true);
  };
  
  // Close view details popup
  const closeDetailsPopup = () => {
    setShowDetailsPopup(false);
    setSelectedTransactionDetails(null);
    setCopiedText(null); // Reset copied state when closing popup
  };
  
  // Copy to clipboard function
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedText(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedText(text);
        setTimeout(() => {
          setCopiedText(null);
        }, 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed: ', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };
  
  // Process refund - disabled for now
  // const processRefund = async () => {
  //   try {
  //     await new Promise(resolve => setTimeout(resolve, 500));
  //     closeRefundPopup();
  //     fetchPayments();
  //     fetchStatusCounts();
  //   } catch (error) {
  //     console.error('Refund error:', error);
  //   }
  // };
  
  // Load initial data
  useEffect(() => {
    fetchStatusCounts();
    fetchPayments();
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    fetchPayments();
  }, [activeStatus, currentPage]);
  
  // Remove auto-filtering - now only manual triggering

  return (
    <div className="p-8">
            <div className="flex flex-wrap justify-between items-center gap-3 mb-8">
              <p className="text-gray-900 text-3xl font-black leading-tight tracking-[-0.033em]">Payment Dashboard</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowRefundHistoryPopup(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <History className="h-4 w-4" />
                  View Refund History
                </button>
                <button
                  onClick={() => setShowRefundPopup(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  <RefreshCw className="h-4 w-4" />
                  Process Refund
                </button>
              </div>
            </div>
            
            {/* Status Filter Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Success Card */}
              <div 
                className={`flex flex-col gap-2 rounded-xl p-6 border border-gray-200 bg-white cursor-pointer hover:shadow-lg transition-shadow ${
                  activeStatus === 'success' ? 'ring-2 ring-green-500 bg-green-50' : ''
                }`}
                onClick={() => handleStatusChange('success')}
              >
                <div className="flex items-center justify-between">
                  <p className="text-gray-600 text-base font-medium leading-normal">Successful Payments</p>
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <p className="text-gray-900 tracking-tight text-4xl font-bold leading-tight">{statusCounts.success.toLocaleString()}</p>
              </div>

              {/* Attempted Card */}
              <div 
                className={`flex flex-col gap-2 rounded-xl p-6 border border-gray-200 bg-white cursor-pointer hover:shadow-lg transition-shadow ${
                  activeStatus === 'Start' ? 'ring-2 ring-orange-500 bg-orange-50' : ''
                }`}
                onClick={() => handleStatusChange('Start')}
              >
                <div className="flex items-center justify-between">
                  <p className="text-gray-600 text-base font-medium leading-normal">Attempted Payments</p>
                  <Clock className="h-6 w-6 text-orange-500" />
                </div>
                <p className="text-gray-900 tracking-tight text-4xl font-bold leading-tight">{statusCounts.attempted.toLocaleString()}</p>
              </div>

              {/* Disputed Card */}
              <div 
                className={`flex flex-col gap-2 rounded-xl p-6 border border-gray-200 bg-white cursor-pointer hover:shadow-lg transition-shadow ${
                  activeStatus === 'error' ? 'ring-2 ring-red-500 bg-red-50' : ''
                }`}
                onClick={() => handleStatusChange('error')}
              >
                <div className="flex items-center justify-between">
                  <p className="text-gray-600 text-base font-medium leading-normal">Disputed Payments</p>
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <p className="text-gray-900 tracking-tight text-4xl font-bold leading-tight">{statusCounts.disputed.toLocaleString()}</p>
              </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
              <h2 className="text-gray-900 text-xl font-bold leading-tight tracking-[-0.015em] mb-4">Filter Transactions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end mb-6">
                {/* Search */}
                <label className="flex flex-col">
                  <p className="text-gray-700 text-sm font-medium leading-normal pb-2">Search</p>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by transaction ID, name..."
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </label>
                
                {/* Gateway */}
                <label className="flex flex-col">
                  <p className="text-gray-700 text-sm font-medium leading-normal pb-2">Gateway</p>
                  <select
                    value={gateway}
                    onChange={(e) => setGateway(e.target.value as 'Razorpay' | 'paypal' | '')}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">All Gateways</option>
                    <option value="Razorpay">Razorpay</option>
                    <option value="paypal">PayPal</option>
                  </select>
                </label>
                
                {/* Location */}
                <label className="flex flex-col">
                  <p className="text-gray-700 text-sm font-medium leading-normal pb-2">Location</p>
                  <select
                    value={isIndia === null ? '' : isIndia.toString()}
                    onChange={(e) => setIsIndia(e.target.value === '' ? null : e.target.value === 'true')}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">All Locations</option>
                    <option value="true">India</option>
                    <option value="false">International</option>
                  </select>
                </label>
                
                {/* Date From */}
                <label className="flex flex-col">
                  <p className="text-gray-700 text-sm font-medium leading-normal pb-2">From Date</p>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </label>
                
                {/* Date To */}
                <label className="flex flex-col">
                  <p className="text-gray-700 text-sm font-medium leading-normal pb-2">To Date</p>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </label>
              </div>
              
              <div className="flex justify-end mt-4">
                <button 
                  onClick={applyFilters}
                  disabled={loading}
                  className="flex items-center justify-center rounded-lg h-11 bg-blue-600 text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-8 hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>

              {/* Error Message */}
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
                      <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Transaction/Payment ID
                      </th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Gateway
                      </th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading ? (
                      // Loading rows - Always show exactly 10 rows
                      Array.from({ length: 10 }).map((_, index) => (
                        <tr key={`loading-${index}`} className="animate-pulse hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="h-4 bg-gray-200 rounded w-20 ml-auto"></div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      // Render transactions (only show actual data, not empty rows)
                      transactions.length > 0 ? (
                        transactions.map((transaction, index) => {
                          // Get status info - handle null status
                          const getStatusInfo = (status: string | null | undefined) => {
                            switch (status) {
                              case 'success':
                                return { 
                                  label: 'Success', 
                                  className: 'inline-flex items-center gap-1.5 rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-600',
                                  dotClassName: 'w-1.5 h-1.5 rounded-full bg-green-600'
                                };
                              case 'Start':
                                return { 
                                  label: 'Attempt', 
                                  className: 'inline-flex items-center gap-1.5 rounded-full bg-orange-500/20 px-2 py-1 text-xs font-medium text-orange-600',
                                  dotClassName: 'w-1.5 h-1.5 rounded-full bg-orange-600'
                                };
                              default:
                                return { 
                                  label: 'Dispute', 
                                  className: 'inline-flex items-center gap-1.5 rounded-full bg-red-500/20 px-2 py-1 text-xs font-medium text-red-600',
                                  dotClassName: 'w-1.5 h-1.5 rounded-full bg-red-600'
                                };
                            }
                          };
                          
                          // Use status with fallback
                          const transactionStatus = transaction.status || 'unknown';
                          const statusInfo = getStatusInfo(transactionStatus);
                          
                          // Render actual transaction data  
                          return (
                            <tr key={`${transaction.payment_id || transaction.transaction_id || index}`} className="hover:bg-gray-50">
                              {/* Transaction/Payment ID with hover tooltip and copy - shows based on gateway */}
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2 group">
                                  <div className="relative">
                                    {(() => {
                                      // Choose ID based on gateway
                                      let fullId, idType;
                                      if (transaction.gateway === 'paypal') {
                                        // For PayPal, prefer transaction_id, fallback to payment_id
                                        fullId = transaction.transaction_id || transaction.payment_id || `TXN${index + 1}`;
                                        idType = 'Transaction ID';
                                      } else if (transaction.gateway === 'Razorpay') {
                                        // For Razorpay, prefer payment_id, fallback to transaction_id
                                        fullId = transaction.payment_id || transaction.transaction_id || `PAY${index + 1}`;
                                        idType = 'Payment ID';
                                      } else {
                                        // For other gateways, use whatever is available
                                        fullId = transaction.transaction_id || transaction.payment_id || `TXN${index + 1}`;
                                        idType = 'Transaction ID';
                                      }
                                      
                                      const displayId = fullId.length > 12 ? `#${fullId.substring(0, 12)}...` : `#${fullId}`;
                                      return (
                                        <>
                                          <span className="text-sm font-mono text-gray-900 cursor-pointer hover:text-blue-600" title={`${idType}: ${fullId}`}>
                                            {displayId}
                                          </span>
                                          {fullId.length > 12 && (
                                            <div className="absolute left-0 top-full mt-1 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 shadow-lg">
                                              <div className="font-medium text-yellow-200">{idType}</div>
                                              #{fullId}
                                            </div>
                                          )}
                                        </>
                                      );
                                    })()}
                                  </div>
                                  {(() => {
                                    // Get the appropriate ID for copying based on gateway
                                    const copyId = transaction.gateway === 'paypal' 
                                      ? (transaction.transaction_id || transaction.payment_id)
                                      : transaction.gateway === 'Razorpay'
                                      ? (transaction.payment_id || transaction.transaction_id)
                                      : (transaction.transaction_id || transaction.payment_id);
                                    
                                    const copyLabel = transaction.gateway === 'paypal' 
                                      ? 'Copy Transaction ID'
                                      : transaction.gateway === 'Razorpay'
                                      ? 'Copy Payment ID'
                                      : 'Copy ID';
                                    
                                    return copyId && (
                                      <button 
                                        onClick={() => copyToClipboard(copyId)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded" 
                                        title={copyLabel}
                                      >
                                        {copiedText === copyId ? 
                                          <Check className="h-3 w-3 text-green-600" /> : 
                                          <Copy className="h-3 w-3 text-gray-600" />
                                        }
                                      </button>
                                    );
                                  })()}
                                </div>
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-600">
                                {transaction.user_data?.email || 'N/A'}
                              </td>
                              <td className="py-4 px-4 text-sm font-medium text-gray-900">
                                {formatCurrency(transaction.total_paid, transaction.gateway, transaction.IsIndia)}
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-600">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  transaction.gateway === 'Razorpay' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : transaction.gateway === 'paypal' 
                                    ? 'bg-purple-100 text-purple-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {transaction.gateway === 'Razorpay' ? 'Razorpay' : transaction.gateway === 'paypal' ? 'PayPal' : 'Other'}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-600">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  transaction.IsIndia === true 
                                    ? 'bg-green-100 text-green-800' 
                                    : transaction.IsIndia === false 
                                    ? 'bg-orange-100 text-orange-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {transaction.IsIndia === true ? 'India' : transaction.IsIndia === false ? 'International' : 'Unknown'}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-600">
                                {(() => {
                                  // For attempted payments (Start status), show session_start_time
                                  // For successful payments, show payment_completed_time
                                  if (transaction.status === 'Start' && transaction.session_start_time) {
                                    return new Date(transaction.session_start_time).toLocaleDateString();
                                  } else if (transaction.payment_completed_time) {
                                    return new Date(transaction.payment_completed_time).toLocaleDateString();
                                  } else if (transaction.session_start_time) {
                                    return new Date(transaction.session_start_time).toLocaleDateString();
                                  }
                                  return 'N/A';
                                })()}
                              </td>
                              <td className="py-4 px-4">
                                <span className={statusInfo.className}>
                                  <span className={statusInfo.dotClassName}></span>
                                  {statusInfo.label}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-right">
                                <button 
                                  onClick={() => openDetailsPopup(transaction)}
                                  className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        // Show "no data" message instead of empty rows
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-gray-500 text-sm">
                            No transactions found for the current filters
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {pagination && (
                <div className="flex items-center justify-between pt-4">
                  <span className="text-sm text-gray-600">
                    Showing {((pagination.currentPage - 1) * pageSize) + 1} to {Math.min(pagination.currentPage * pageSize, pagination.totalRecords)} of {pagination.totalRecords} results
                  </span>
                  <div className="flex items-center gap-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center justify-center rounded-lg h-9 w-9 border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    
                    {/* Page Number Buttons */}
                    {pagination.totalPages <= 10 ? (
                      // Show all pages if 10 or fewer
                      Array.from({ length: pagination.totalPages }).map((_, i) => (
                        <button 
                          key={i+1}
                          onClick={() => handlePageChange(i+1)}
                          className={`flex items-center justify-center rounded-lg h-9 w-9 text-sm font-medium ${
                            currentPage === i+1 
                              ? 'bg-blue-600 text-white' 
                              : 'border border-gray-300 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {i+1}
                        </button>
                      ))
                    ) : (
                      // Show a subset of pages with ellipsis for many pages  
                      <>
                        <button 
                          onClick={() => handlePageChange(1)}
                          className={`flex items-center justify-center rounded-lg h-9 w-9 text-sm font-medium ${
                            currentPage === 1 
                              ? 'bg-blue-600 text-white' 
                              : 'border border-gray-300 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          1
                        </button>
                        
                        {currentPage > 4 && (
                          <span className="px-2 text-gray-500">...</span>
                        )}
                        
                        {Array.from({ length: Math.min(3, pagination.totalPages - 2) }).map((_, i) => {
                          const pageNum = Math.max(2, currentPage - 1) + i;
                          if (pageNum > 1 && pageNum < pagination.totalPages) {
                            return (
                              <button 
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`flex items-center justify-center rounded-lg h-9 w-9 text-sm font-medium ${
                                  currentPage === pageNum 
                                    ? 'bg-blue-600 text-white' 
                                    : 'border border-gray-300 text-gray-600 hover:bg-gray-100'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          }
                          return null;
                        })}
                        
                        {currentPage < pagination.totalPages - 3 && (
                          <span className="px-2 text-gray-500">...</span>
                        )}
                        
                        {pagination.totalPages > 1 && (
                          <button 
                            onClick={() => handlePageChange(pagination.totalPages)}
                            className={`flex items-center justify-center rounded-lg h-9 w-9 text-sm font-medium ${
                              currentPage === pagination.totalPages 
                                ? 'bg-blue-600 text-white' 
                                : 'border border-gray-300 text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {pagination.totalPages}
                          </button>
                        )}
                      </>
                    )}
                    
                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pagination.totalPages}
                      className="flex items-center justify-center rounded-lg h-9 w-9 border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Refund Popup */}
            <RefundPopup 
              isOpen={showRefundPopup}
              onClose={() => setShowRefundPopup(false)}
            />

            {/* Refund History Popup */}
            <RefundHistoryPopup 
              isOpen={showRefundHistoryPopup}
              onClose={() => setShowRefundHistoryPopup(false)}
            />

            {/* View Details Popup */}
            {showDetailsPopup && selectedTransactionDetails && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold text-gray-900">Transaction Details</h3>
                      <button
                        onClick={closeDetailsPopup}
                        className="text-gray-400 hover:text-gray-600 text-2xl font-semibold cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    {/* Transaction Overview */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Transaction Overview</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Transaction ID</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-mono text-gray-900 break-all flex-1">{selectedTransactionDetails.transaction_id || selectedTransactionDetails.payment_id || 'N/A'}</p>
                            {(selectedTransactionDetails.transaction_id || selectedTransactionDetails.payment_id) && (
                              <button 
                                onClick={() => copyToClipboard(selectedTransactionDetails.transaction_id || selectedTransactionDetails.payment_id || '')}
                                className="p-1 hover:bg-gray-200 rounded transition-colors cursor-pointer"
                                title="Copy Transaction ID"
                              >
                                {copiedText === (selectedTransactionDetails.transaction_id || selectedTransactionDetails.payment_id) ? (
                                  <Check className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Copy className="h-3 w-3 text-gray-600" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Order ID</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-mono text-gray-900 break-all flex-1">{selectedTransactionDetails.order_id || 'N/A'}</p>
                            {selectedTransactionDetails.order_id && selectedTransactionDetails.order_id !== 'N/A' && (
                              <button 
                                onClick={() => copyToClipboard(selectedTransactionDetails.order_id || '')}
                                className="p-1 hover:bg-gray-200 rounded transition-colors cursor-pointer"
                                title="Copy Order ID"
                              >
                                {copiedText === selectedTransactionDetails.order_id ? (
                                  <Check className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Copy className="h-3 w-3 text-gray-600" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Payment ID</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-mono text-gray-900 break-all flex-1">{selectedTransactionDetails.payment_id || 'N/A'}</p>
                            {selectedTransactionDetails.payment_id && selectedTransactionDetails.payment_id !== 'N/A' && (
                              <button 
                                onClick={() => copyToClipboard(selectedTransactionDetails.payment_id || '')}
                                className="p-1 hover:bg-gray-200 rounded transition-colors cursor-pointer"
                                title="Copy Payment ID"
                              >
                                {copiedText === selectedTransactionDetails.payment_id ? (
                                  <Check className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Copy className="h-3 w-3 text-gray-600" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Session ID</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-mono text-gray-900 break-all flex-1">{selectedTransactionDetails.session_id || 'N/A'}</p>
                            {selectedTransactionDetails.session_id && selectedTransactionDetails.session_id !== 'N/A' && (
                              <button 
                                onClick={() => copyToClipboard(selectedTransactionDetails.session_id || '')}
                                className="p-1 hover:bg-gray-200 rounded transition-colors cursor-pointer"
                                title="Copy Session ID"
                              >
                                {copiedText === selectedTransactionDetails.session_id ? (
                                  <Check className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Copy className="h-3 w-3 text-gray-600" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Test ID</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-mono text-gray-900 break-all flex-1">{selectedTransactionDetails.testid || 'N/A'}</p>
                            {selectedTransactionDetails.testid && selectedTransactionDetails.testid !== 'N/A' && (
                              <button 
                                onClick={() => copyToClipboard(selectedTransactionDetails.testid || '')}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                title="Copy Test ID"
                              >
                                {copiedText === selectedTransactionDetails.testid ? (
                                  <Check className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Copy className="h-3 w-3 text-gray-600" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Status</p>
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${
                            selectedTransactionDetails.status === 'success' 
                              ? 'bg-green-100 text-green-800' 
                              : selectedTransactionDetails.status === 'Start'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              selectedTransactionDetails.status === 'success' 
                                ? 'bg-green-600' 
                                : selectedTransactionDetails.status === 'Start'
                                ? 'bg-orange-600'
                                : 'bg-red-600'
                            }`}></span>
                            {selectedTransactionDetails.status === 'success' ? 'Success' : selectedTransactionDetails.status === 'Start' ? 'Attempted' : 'Disputed'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Details */}
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Payment Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Paid</p>
                          <p className="text-lg font-bold text-green-600">{formatCurrency(selectedTransactionDetails.total_paid, selectedTransactionDetails.gateway, selectedTransactionDetails.IsIndia)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Discount</p>
                          <p className="text-sm text-gray-900">{formatCurrency(selectedTransactionDetails.total_discount || 0, selectedTransactionDetails.gateway, selectedTransactionDetails.IsIndia)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Coupon</p>
                          <p className="text-sm text-gray-900">{selectedTransactionDetails.coupon || 'None'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Gateway</p>
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            selectedTransactionDetails.gateway === 'Razorpay' 
                              ? 'bg-blue-100 text-blue-800' 
                              : selectedTransactionDetails.gateway === 'paypal' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {selectedTransactionDetails.gateway === 'Razorpay' ? 'Razorpay' : selectedTransactionDetails.gateway === 'paypal' ? 'PayPal' : 'Other'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Location</p>
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            selectedTransactionDetails.IsIndia === true 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {selectedTransactionDetails.IsIndia ? 'India' : 'International'}
                          </span>
                        </div>
                        {/* Only show PayPal Order ID for PayPal transactions */}
                        {selectedTransactionDetails.gateway === 'paypal' && (
                          <div>
                            <p className="text-sm font-medium text-gray-600">PayPal Order ID</p>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-mono text-gray-900 break-all flex-1">{selectedTransactionDetails.paypal_order_id || 'N/A'}</p>
                              {selectedTransactionDetails.paypal_order_id && selectedTransactionDetails.paypal_order_id !== 'N/A' && (
                                <button 
                                  onClick={() => copyToClipboard(selectedTransactionDetails.paypal_order_id || '')}
                                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                                  title="Copy PayPal Order ID"
                                >
                                  {copiedText === selectedTransactionDetails.paypal_order_id ? (
                                    <Check className="h-3 w-3 text-green-600" />
                                  ) : (
                                    <Copy className="h-3 w-3 text-gray-600" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-600">Payment Session</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-mono text-gray-900 break-all flex-1">{selectedTransactionDetails.payment_session_id || 'N/A'}</p>
                            {selectedTransactionDetails.payment_session_id && selectedTransactionDetails.payment_session_id !== 'N/A' && (
                              <button 
                                onClick={() => copyToClipboard(selectedTransactionDetails.payment_session_id || '')}
                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                title="Copy Payment Session ID"
                              >
                                {copiedText === selectedTransactionDetails.payment_session_id ? (
                                  <Check className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Copy className="h-3 w-3 text-gray-600" />
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Session Duration</p>
                          <p className="text-sm text-gray-900">{selectedTransactionDetails.session_duration || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Timestamps */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Timeline</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Session Start</p>
                          <p className="text-sm text-gray-900">
                            {selectedTransactionDetails.session_start_time 
                              ? new Date(selectedTransactionDetails.session_start_time).toLocaleString()
                              : 'N/A'
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Payment Completed</p>
                          <p className="text-sm text-gray-900">
                            {selectedTransactionDetails.payment_completed_time 
                              ? new Date(selectedTransactionDetails.payment_completed_time).toLocaleString()
                              : 'N/A'
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Date</p>
                          <p className="text-sm text-gray-900">{selectedTransactionDetails.date || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Customer Information */}
                    {selectedTransactionDetails.user_data && (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Name</p>
                            <p className="text-sm text-gray-900">{selectedTransactionDetails.user_data.user_name || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Email</p>
                            <p className="text-sm text-gray-900">{selectedTransactionDetails.user_data.email || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Mobile</p>
                            <p className="text-sm text-gray-900">{selectedTransactionDetails.user_data.mobile_number || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">City</p>
                            <p className="text-sm text-gray-900">{selectedTransactionDetails.user_data.city || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Gender</p>
                            <p className="text-sm text-gray-900">{selectedTransactionDetails.user_data.gender || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">DOB</p>
                            <p className="text-sm text-gray-900">
                              {selectedTransactionDetails.user_data.dob 
                                ? new Date(selectedTransactionDetails.user_data.dob).toLocaleDateString()
                                : 'N/A'
                              }
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">User ID</p>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-mono text-gray-900 break-all flex-1">{selectedTransactionDetails.user_data?.user_id || 'N/A'}</p>
                              {selectedTransactionDetails.user_data?.user_id && selectedTransactionDetails.user_data.user_id !== 'N/A' && (
                                <button 
                                  onClick={() => copyToClipboard(selectedTransactionDetails.user_data?.user_id || '')}
                                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                                  title="Copy User ID"
                                >
                                  {copiedText === selectedTransactionDetails.user_data?.user_id ? (
                                    <Check className="h-3 w-3 text-green-600" />
                                  ) : (
                                    <Copy className="h-3 w-3 text-gray-600" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Anonymous</p>
                            <p className="text-sm text-gray-900">{selectedTransactionDetails.user_data.is_anonymous || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Last Used</p>
                            <p className="text-sm text-gray-900">
                              {selectedTransactionDetails.user_data.last_used 
                                ? new Date(selectedTransactionDetails.user_data.last_used).toLocaleString()
                                : 'N/A'
                              }
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-blue-200">
                          <h5 className="text-md font-semibold text-gray-900 mb-2">Usage Statistics</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-600">Total Summary Generations</p>
                              <p className="text-lg font-bold text-blue-600">{selectedTransactionDetails.user_data.total_summary_generation || '0'}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Total Paid Generations</p>
                              <p className="text-lg font-bold text-green-600">{selectedTransactionDetails.user_data.total_paid_generation || '0'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Summary Generation Details */}
                    {selectedTransactionDetails.summary_generation && (
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Summary Generation Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Test ID</p>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-mono text-gray-900 break-all flex-1">{selectedTransactionDetails.summary_generation?.testid || 'N/A'}</p>
                              {selectedTransactionDetails.summary_generation?.testid && selectedTransactionDetails.summary_generation.testid !== 'N/A' && (
                                <button 
                                  onClick={() => copyToClipboard(selectedTransactionDetails.summary_generation?.testid || '')}
                                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                                  title="Copy Test ID"
                                >
                                  {copiedText === selectedTransactionDetails.summary_generation?.testid ? (
                                    <Check className="h-3 w-3 text-green-600" />
                                  ) : (
                                    <Copy className="h-3 w-3 text-gray-600" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Payment Status</p>
                            <p className="text-sm text-gray-900">{selectedTransactionDetails.summary_generation.payment_status || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Quest Status</p>
                            <p className="text-sm text-gray-900">{selectedTransactionDetails.summary_generation.quest_status || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Quality Score</p>
                            <p className="text-lg font-bold text-purple-600">{selectedTransactionDetails.summary_generation.qualityscore || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">IP Address</p>
                            <p className="text-sm font-mono text-gray-900">{selectedTransactionDetails.summary_generation.ip_address || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Generation Time</p>
                            <p className="text-sm text-gray-900">
                              {selectedTransactionDetails.summary_generation.paid_generation_time 
                                ? new Date(selectedTransactionDetails.summary_generation.paid_generation_time).toLocaleString()
                                : 'N/A'
                              }
                            </p>
                          </div>
                        </div>
                        
                        {selectedTransactionDetails.summary_generation.quest_pdf && (
                          <div className="mt-4 pt-4 border-t border-purple-200">
                            <p className="text-sm font-medium text-gray-600 mb-2">Quest PDF</p>
                            <a 
                              href={selectedTransactionDetails.summary_generation.quest_pdf} 
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
                        
                        {(selectedTransactionDetails.summary_generation.summary_error || selectedTransactionDetails.summary_generation.quest_error) && (
                          <div className="mt-4 pt-4 border-t border-purple-200">
                            <h5 className="text-md font-semibold text-red-600 mb-2">Errors</h5>
                            {selectedTransactionDetails.summary_generation.summary_error && (
                              <div className="mb-2">
                                <p className="text-sm font-medium text-gray-600">Summary Error</p>
                                <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{selectedTransactionDetails.summary_generation.summary_error}</p>
                              </div>
                            )}
                            {selectedTransactionDetails.summary_generation.quest_error && (
                              <div>
                                <p className="text-sm font-medium text-gray-600">Quest Error</p>
                                <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{selectedTransactionDetails.summary_generation.quest_error}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
                    <div className="flex justify-end">
                      <button
                        onClick={closeDetailsPopup}
                        className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
    </div>
  );
};

export default AdminQuestPayment;