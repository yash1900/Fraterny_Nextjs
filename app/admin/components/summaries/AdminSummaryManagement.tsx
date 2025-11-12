'use client';

import React, { useState, useEffect } from 'react';
import { FileStack, CheckCircle, Clock, TrendingUp, ChevronLeft, ChevronRight, Trash2, AlertTriangle, Copy, Check, Eye, Download } from 'lucide-react';
import { toast } from 'sonner';

// Types (matching API response structure)
interface SummaryGeneration {
  id: number;
  testid?: string | null;
  user_id?: string | null;
  session_id?: string | null;
  starting_time?: string | null;
  completion_time?: string | null;
  payment_status?: string | null;
  quest_status?: string | null;
  status?: string | null;
  qualityscore?: string | null;
  device_type?: string | null;
  device_browser?: string | null;
  operating_system?: string | null;
  ip_address?: string | null;
  quest_pdf?: string | null;
  url?: string | null;
  AQI?: string | null;
  perecentile?: string | null;
  complete_duration?: string | null;
  paid_generation_time?: string | null;
  agent_start_time?: string | null;
  agent_completion_time?: string | null;
  summary_error?: string | null;
  quest_error?: string | null;
  user_data?: {
    user_name?: string | null;
    email?: string | null;
    mobile_number?: string | null;
    city?: string | null;
    gender?: string | null;
    dob?: string | null;
  } | null;
  [key: string]: any;
}

interface SummaryFilters {
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
  paymentStatus?: string | null;
  status?: string;
  minQualityScore?: number | null;
  maxQualityScore?: number | null;
}

interface PaginationParams {
  page: number;
  pageSize: number;
}

interface SummaryStats {
  totalSummaries: number;
  paidSummaries: number;
  completedSummaries: number;
  averageQualityScore: number;
  failedPayments: number;
}

const AdminSummaryManagement: React.FC = () => {
  // State for data
  const [loading, setLoading] = useState(false);
  const [summaries, setSummaries] = useState<SummaryGeneration[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<SummaryStats>({ 
    totalSummaries: 0, 
    paidSummaries: 0, 
    completedSummaries: 0, 
    averageQualityScore: 0,
    failedPayments: 0
  });
  const [filteredStats, setFilteredStats] = useState<SummaryStats | null>(null);

  // Filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [status, setStatus] = useState('');
  const [minQualityScore, setMinQualityScore] = useState<number | null>(null);
  const [maxQualityScore, setMaxQualityScore] = useState<number | null>(null);
  
  // Delete confirmation popup state
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState<SummaryGeneration | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // View Details popup state
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [selectedSummaryDetails, setSelectedSummaryDetails] = useState<SummaryGeneration | null>(null);
  
  // Copy functionality state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Bulk selection state
  const [selectedSummaryIds, setSelectedSummaryIds] = useState<number[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [showBulkDeletePopup, setShowBulkDeletePopup] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Fetch summary statistics
  const fetchSummaryStats = async () => {
    try {
      const response = await fetch('/api/admin/summaries?operation=stats');
      const result = await response.json();
      
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (err: any) {
      console.error('Error fetching summary stats:', err);
    }
  };

  // Fetch summaries based on current filters
  const fetchSummariesData = async () => {
    setLoading(true);
    setError(null);
    setSummaries([]);
    setPagination(null);

    try {
      const paginationParams: PaginationParams = {
        page: currentPage,
        pageSize,
      };

      const filters: SummaryFilters = {
        searchTerm: searchTerm || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        paymentStatus: paymentStatus ? paymentStatus as any : null,
        status: status || undefined,
        minQualityScore: minQualityScore,
        maxQualityScore: maxQualityScore,
      };

      console.log('🔍 Applying filters:', filters);

      // Build query parameters
      const params = new URLSearchParams({
        page: paginationParams.page.toString(),
        pageSize: paginationParams.pageSize.toString(),
      });

      // Add filters to params
      if (filters.searchTerm) params.append('search', filters.searchTerm);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
      if (filters.status) params.append('status', filters.status);
      if (filters.minQualityScore !== null && filters.minQualityScore !== undefined) params.append('minQualityScore', filters.minQualityScore.toString());
      if (filters.maxQualityScore !== null && filters.maxQualityScore !== undefined) params.append('maxQualityScore', filters.maxQualityScore.toString());

      const response = await fetch(`/api/admin/summaries?${params.toString()}`);
      const result = await response.json();

      if (result.success && result.data) {
        console.log('📊 Received summaries data:', result.data.summaries);
        console.log('📊 First 3 summaries debug:', result.data.summaries.slice(0, 3).map((s: SummaryGeneration) => ({
          id: s.id,
          testid: s.testid?.substring(0, 8) + '...',
          status: s.status,
          payment_status: s.payment_status,
          quest_status: s.quest_status,
          starting_time: s.starting_time,
          summary_response: (s as any).summary_response,
          allKeys: Object.keys(s).filter((key: string) => key.includes('status') || key.includes('response'))
        })));
        
        setSummaries(result.data.summaries);
        setPagination(result.data.pagination);
        
        // Set filtered statistics if available
        if (result.data.filteredStats) {
          setFilteredStats(result.data.filteredStats);
        } else {
          setFilteredStats(null);
        }
      } else {
        setError(result.error || 'Failed to load summary data');
        setSummaries([]);
        setPagination(null);
        setFilteredStats(null);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setSummaries([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    clearSelections();
  };

  // Handle filter apply
  const applyFilters = () => {
    setCurrentPage(1);
    clearSelections();
    fetchSummariesData();
  };

  // Handle filter reset
  const resetFilters = () => {
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
    setPaymentStatus('');
    setStatus('');
    setMinQualityScore(null);
    setMaxQualityScore(null);
    setCurrentPage(1);
    setError(null);
    setSummaries([]);
    setPagination(null);
    setFilteredStats(null);
    clearSelections();
    setTimeout(() => {
      fetchSummariesData();
    }, 0);
  };

  // Copy to clipboard function
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(text);
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedId(text);
        setTimeout(() => {
          setCopiedId(null);
        }, 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed: ', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  // Open delete confirmation popup
  const openDeletePopup = (summary: SummaryGeneration) => {
    setSelectedSummary(summary);
    setShowDeletePopup(true);
  };

  // Close delete confirmation popup
  const closeDeletePopup = () => {
    setShowDeletePopup(false);
    setSelectedSummary(null);
  };
  
  // Open view details popup
  const openDetailsPopup = (summary: SummaryGeneration) => {
    setSelectedSummaryDetails(summary);
    setShowDetailsPopup(true);
  };
  
  // Close view details popup
  const closeDetailsPopup = () => {
    setShowDetailsPopup(false);
    setSelectedSummaryDetails(null);
    setCopiedId(null);
  };

  // Process delete
  const processDelete = async () => {
    if (!selectedSummary) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/summaries?id=${selectedSummary.id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      
      if (result.success) {
        toast.success('Summary deleted successfully', {
          description: 'Summary record has been removed.'
        });
        closeDeletePopup();
        fetchSummariesData();
        fetchSummaryStats();
      } else {
        toast.error('Failed to delete summary', {
          description: result.error || 'An unknown error occurred'
        });
        setError(result.error || 'Failed to delete summary');
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error('Failed to delete summary', {
        description: error.message || 'An unexpected error occurred'
      });
      setError(error.message || 'Failed to delete summary');
    } finally {
      setDeleting(false);
    }
  };

  // Helper function to check if any filters are active
  const hasActiveFilters = () => {
    return !!(searchTerm || dateFrom || dateTo || paymentStatus || status || minQualityScore || maxQualityScore);
  };

  // Bulk selection handlers
  const handleSelectSummary = (summaryId: number, isSelected: boolean) => {
    if (isSelected) {
      setSelectedSummaryIds(prev => [...prev, summaryId]);
    } else {
      setSelectedSummaryIds(prev => prev.filter(id => id !== summaryId));
      setIsAllSelected(false);
    }
  };
  
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedSummaryIds([]);
      setIsAllSelected(false);
    } else {
      const currentPageIds = summaries.map(s => s.id);
      setSelectedSummaryIds(currentPageIds);
      setIsAllSelected(true);
    }
  };
  
  const handleUnselectAll = () => {
    setSelectedSummaryIds([]);
    setIsAllSelected(false);
  };
  
  const openBulkDeletePopup = () => {
    if (selectedSummaryIds.length > 0) {
      setShowBulkDeletePopup(true);
    }
  };
  
  const closeBulkDeletePopup = () => {
    setShowBulkDeletePopup(false);
  };
  
  const processBulkDelete = async () => {
    if (selectedSummaryIds.length === 0) return;
    
    setBulkDeleting(true);
    try {
      const response = await fetch('/api/admin/summaries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'bulk-delete',
          summaryIds: selectedSummaryIds,
        }),
      });
      const result = await response.json();
      
      if (result.success) {
        toast.success(`${selectedSummaryIds.length} summaries deleted successfully`, {
          description: 'Selected summary records have been removed.'
        });
        closeBulkDeletePopup();
        setSelectedSummaryIds([]);
        setIsAllSelected(false);
        fetchSummariesData();
        fetchSummaryStats();
      } else {
        toast.error('Failed to delete summaries', {
          description: result.error || 'An unknown error occurred'
        });
        setError(result.error || 'Failed to delete summaries');
      }
    } catch (error: any) {
      console.error('Bulk delete error:', error);
      toast.error('Failed to delete summaries', {
        description: error.message || 'An unexpected error occurred'
      });
      setError(error.message || 'Failed to delete summaries');
    } finally {
      setBulkDeleting(false);
    }
  };
  
  // Clear selected summaries when page changes
  const clearSelections = () => {
    setSelectedSummaryIds([]);
    setIsAllSelected(false);
  };

  // Helper function to apply filters immediately with specific values
  const applyFiltersWithValues = async (filterOverrides: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const filters = {
        searchTerm: searchTerm || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        paymentStatus: paymentStatus ? paymentStatus as any : null,
        status: status || undefined,
        minQualityScore: minQualityScore,
        maxQualityScore: maxQualityScore,
        ...filterOverrides, // Override with new values
      };
      
      // Build query parameters
      const params = new URLSearchParams({
        page: '1',
        pageSize: pageSize.toString(),
      });

      // Add filters to params
      if (filters.searchTerm) params.append('search', filters.searchTerm);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
      if (filters.status) params.append('status', filters.status);
      if (filters.minQualityScore !== null && filters.minQualityScore !== undefined) params.append('minQualityScore', filters.minQualityScore.toString());
      if (filters.maxQualityScore !== null && filters.maxQualityScore !== undefined) params.append('maxQualityScore', filters.maxQualityScore.toString());

      const response = await fetch(`/api/admin/summaries?${params.toString()}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setSummaries(result.data.summaries);
        setPagination(result.data.pagination);
        
        if (result.data.filteredStats) {
          setFilteredStats(result.data.filteredStats);
        } else {
          setFilteredStats(null);
        }
      } else {
        setError(result.error || 'Failed to load summary data');
        setSummaries([]);
        setPagination(null);
        setFilteredStats(null);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setSummaries([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    fetchSummaryStats();
    fetchSummariesData();
  }, []);

  // Fetch data when page changes (except for the initial page 1 load)
  useEffect(() => {
    // Only fetch if currentPage > 1 OR if we're going back to page 1 from another page
    // We can detect this by checking if we have pagination data (meaning we've loaded before)
    if (currentPage > 1 || (currentPage === 1 && pagination && pagination.totalPages > 1)) {
      fetchSummariesData();
    }
  }, [currentPage]);
  
  // Update selection state when summaries change
  useEffect(() => {
    if (summaries.length > 0) {
      const currentPageIds = summaries.map(s => s.id);
      const allCurrentPageSelected = currentPageIds.every(id => selectedSummaryIds.includes(id));
      setIsAllSelected(allCurrentPageSelected && currentPageIds.length > 0);
    } else {
      setIsAllSelected(false);
    }
  }, [summaries, selectedSummaryIds]);

  // Calculate age from date of birth (handles both date strings and simple age numbers)
  const calculateAge = (dob: string | null): number | null => {
    if (!dob) return null;
    
    // Check if dob is already a simple number (age)
    const numericAge = parseInt(dob);
    if (!isNaN(numericAge) && numericAge > 0 && numericAge < 150) {
      return numericAge;
    }
    
    // Try to parse as date
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) {
      // Invalid date, return null
      return null;
    }
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Format date helper
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
  };

  return (
    <div className="p-8">
            {/* Page Header */}
            <div className="flex flex-wrap justify-between items-center gap-3 mb-8">
              <p className="text-gray-900 text-3xl font-black leading-tight tracking-[-0.033em]">Summary Management</p>
            </div>
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              {/* Total Summaries Card */}
              <div 
                className={`flex flex-col gap-2 rounded-xl p-6 border cursor-pointer transition-all duration-200 ${
                  !hasActiveFilters()
                    ? 'border-blue-400 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm'
                }`}
                onClick={() => {
                  // Clear all filters to show total summaries
                  resetFilters();
                }}
                title="Click to clear all filters and show all summaries"
              >
                <div className="flex items-center justify-between">
                  <p className="text-gray-600 text-base font-medium leading-normal">Total Summaries</p>
                  <FileStack className="h-6 w-6 text-blue-500" />
                </div>
                <p className="text-gray-900 tracking-tight text-4xl font-bold leading-tight">
                  {(filteredStats && hasActiveFilters() ? filteredStats.totalSummaries : stats.totalSummaries).toLocaleString()}
                </p>
                {!hasActiveFilters() ? (
                  <p className="text-blue-600 text-xs font-medium">Showing All Results</p>
                ) : (
                  <p className="text-gray-600 text-xs font-medium">Click to Clear Filters</p>
                )}
              </div>

              {/* Paid Summaries Card */}
              <div 
                className={`flex flex-col gap-2 rounded-xl p-6 border cursor-pointer transition-all duration-200 ${
                  paymentStatus === 'success'
                    ? 'border-green-400 bg-green-50 shadow-md transform scale-105'
                    : 'border-gray-200 bg-white hover:bg-green-50 hover:border-green-300 hover:shadow-sm'
                }`}
                onClick={() => {
                  // Toggle paid summaries filter (preserve other filters)
                  const newPaymentStatus = paymentStatus === 'success' ? '' : 'success';
                  
                  // Update state immediately
                  setPaymentStatus(newPaymentStatus);
                  setCurrentPage(1);
                  
                  // Apply filters with the new value immediately
                  setTimeout(() => {
                    applyFiltersWithValues({
                      paymentStatus: newPaymentStatus ? newPaymentStatus as any : null,
                    });
                  }, 10);
                }}
                title="Click to show only paid summaries"
              >
                <div className="flex items-center justify-between">
                  <p className="text-gray-600 text-base font-medium leading-normal">Paid Summaries</p>
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
                <p className="text-gray-900 tracking-tight text-4xl font-bold leading-tight">
                  {(filteredStats && hasActiveFilters() ? filteredStats.paidSummaries : stats.paidSummaries).toLocaleString()}
                </p>
                {paymentStatus === 'success' ? (
                  <p className="text-green-600 text-xs font-medium">✓ Success Filter Active</p>
                ) : hasActiveFilters() ? (
                  <p className="text-blue-600 text-xs font-medium">Filtered Results</p>
                ) : (
                  <p className="text-gray-600 text-xs font-medium">Click to Filter Success</p>
                )}
              </div>

              {/* Completed Summaries Card */}
              <div 
                className={`flex flex-col gap-2 rounded-xl p-6 border cursor-pointer transition-all duration-200 ${
                  status === 'Complete'
                    ? 'border-orange-400 bg-orange-50 shadow-md transform scale-105'
                    : 'border-gray-200 bg-white hover:bg-orange-50 hover:border-orange-300 hover:shadow-sm'
                }`}
                onClick={() => {
                  // Toggle completed summaries filter (preserve other filters)
                  const newStatus = status === 'Complete' ? '' : 'Complete';
                  
                  // Update state immediately
                  setStatus(newStatus);
                  setCurrentPage(1);
                  
                  // Apply filters with the new value immediately
                  setTimeout(() => {
                    applyFiltersWithValues({
                      status: newStatus || undefined,
                    });
                  }, 10);
                }}
                title="Click to show only completed summaries"
              >
                <div className="flex items-center justify-between">
                  <p className="text-gray-600 text-base font-medium leading-normal">Completed</p>
                  <Clock className="h-6 w-6 text-orange-500" />
                </div>
                <p className="text-gray-900 tracking-tight text-4xl font-bold leading-tight">
                  {(filteredStats && hasActiveFilters() ? filteredStats.completedSummaries : stats.completedSummaries).toLocaleString()}
                </p>
                {status === 'Complete' ? (
                  <p className="text-orange-600 text-xs font-medium">✓ Completed Filter Active</p>
                ) : hasActiveFilters() ? (
                  <p className="text-blue-600 text-xs font-medium">Filtered Results</p>
                ) : (
                  <p className="text-gray-600 text-xs font-medium">Click to Filter Completed</p>
                )}
              </div>

              {/* Failed Payments Card */}
              <div 
                className={`flex flex-col gap-2 rounded-xl p-6 border cursor-pointer transition-all duration-200 ${
                  paymentStatus === 'ERROR'
                    ? 'border-red-400 bg-red-50 shadow-md transform scale-105'
                    : 'border-gray-200 bg-white hover:bg-red-50 hover:border-red-300 hover:shadow-sm'
                }`}
                onClick={() => {
                  // Toggle failed payments filter (preserve other filters)
                  const newPaymentStatus = paymentStatus === 'ERROR' ? '' : 'ERROR';
                  
                  // Update state immediately
                  setPaymentStatus(newPaymentStatus);
                  setCurrentPage(1);
                  
                  // Apply filters with the new value immediately
                  setTimeout(() => {
                    applyFiltersWithValues({
                      paymentStatus: newPaymentStatus ? newPaymentStatus as any : null,
                    });
                  }, 10);
                }}
                title="Click to filter for failed/error payments"
              >
                <div className="flex items-center justify-between">
                  <p className="text-gray-600 text-base font-medium leading-normal">Failed Payments</p>
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <p className="text-gray-900 tracking-tight text-4xl font-bold leading-tight">
                  {(filteredStats && hasActiveFilters() ? filteredStats.failedPayments : stats.failedPayments).toLocaleString()}
                </p>
                {paymentStatus === 'ERROR' ? (
                  <p className="text-red-600 text-xs font-medium">✓ Error Filter Active</p>
                ) : hasActiveFilters() ? (
                  <p className="text-blue-600 text-xs font-medium">Filtered Results</p>
                ) : (
                  <p className="text-gray-600 text-xs font-medium">Click to Filter Errors</p>
                )}
              </div>

              {/* Average Quality Score Card */}
              <div 
                className={`flex flex-col gap-2 rounded-xl p-6 border cursor-pointer transition-all duration-200 ${
                  minQualityScore === 70
                    ? 'border-purple-400 bg-purple-50 shadow-md transform scale-105'
                    : 'border-gray-200 bg-white hover:bg-purple-50 hover:border-purple-300 hover:shadow-sm'
                }`}
                onClick={() => {
                  // Toggle high quality filter (70+)
                  const newMinQualityScore = minQualityScore === 70 ? null : 70;
                  
                  // Update state immediately
                  setMinQualityScore(newMinQualityScore);
                  setCurrentPage(1);
                  
                  // Apply filters with the new value immediately
                  setTimeout(() => {
                    applyFiltersWithValues({
                      minQualityScore: newMinQualityScore,
                    });
                  }, 10);
                }}
                title="Click to filter for high quality summaries (70+)"
              >
                <div className="flex items-center justify-between">
                  <p className="text-gray-600 text-base font-medium leading-normal">Avg Quality</p>
                  <TrendingUp className="h-6 w-6 text-purple-500" />
                </div>
                <p className="text-gray-900 tracking-tight text-4xl font-bold leading-tight">
                  {filteredStats && hasActiveFilters() ? filteredStats.averageQualityScore : stats.averageQualityScore}
                </p>
                {minQualityScore === 70 ? (
                  <p className="text-purple-600 text-xs font-medium">Showing Quality 70+</p>
                ) : hasActiveFilters() ? (
                  <p className="text-blue-600 text-xs font-medium">Filtered Results</p>
                ) : (
                  <p className="text-gray-600 text-xs font-medium">Click for Quality 70+</p>
                )}
              </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
              <h2 className="text-gray-900 text-xl font-bold leading-tight tracking-[-0.015em] mb-4">Filter Summaries</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-end mb-6">
                {/* Search */}
                <label className="flex flex-col">
                  <p className="text-gray-700 text-sm font-medium leading-normal pb-2">Search</p>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Test ID, User ID, Session..."
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </label>
                
                {/* Payment Status */}
                <label className="flex flex-col">
                  <p className="text-gray-700 text-sm font-medium leading-normal pb-2">Payment Status</p>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="success">Success</option>
                    <option value="Start">Start</option>
                    <option value="ERROR">Failed/Error</option>
                  </select>
                </label>
                
                {/* Status */}
                <label className="flex flex-col">
                  <p className="text-gray-700 text-sm font-medium leading-normal pb-2">Status</p>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="Complete">Complete</option>
                    <option value="Failed">Failed</option>
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
                
                {/* Min Quality Score */}
                <label className="flex flex-col">
                  <p className="text-gray-700 text-sm font-medium leading-normal pb-2">Min Quality Score</p>
                  <input
                    type="number"
                    value={minQualityScore || ''}
                    onChange={(e) => setMinQualityScore(e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="e.g., 70"
                    min="0"
                    max="100"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </label>
                
                {/* Max Quality Score */}
                <label className="flex flex-col">
                  <p className="text-gray-700 text-sm font-medium leading-normal pb-2">Max Quality Score</p>
                  <input
                    type="number"
                    value={maxQualityScore || ''}
                    onChange={(e) => setMaxQualityScore(e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="e.g., 100"
                    min="0"
                    max="100"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </label>
              </div>
              
              <div className="flex justify-end gap-3 mt-4">
                <button 
                  onClick={resetFilters}
                  disabled={loading}
                  className="flex items-center justify-center rounded-lg h-11 bg-gray-200 text-gray-700 gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-6 hover:bg-gray-300 disabled:opacity-50"
                >
                  Reset
                </button>
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
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
                  <h3 className="text-red-800 font-semibold mb-2">Error:</h3>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Bulk Actions */}
              <div className="flex items-center justify-between mt-6 mb-4">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={openBulkDeletePopup}
                    disabled={selectedSummaryIds.length === 0 || loading}
                    className="flex items-center justify-center rounded-lg h-10 bg-red-600 text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-4 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={selectedSummaryIds.length === 0 ? 'Select summaries to delete' : `Delete ${selectedSummaryIds.length} selected summaries`}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Selected ({selectedSummaryIds.length})
                  </button>
                  <button 
                    onClick={handleSelectAll}
                    disabled={loading || summaries.length === 0}
                    className="flex items-center justify-center rounded-lg h-10 bg-blue-600 text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-4 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAllSelected ? 'Unselect All' : 'Select All'}
                  </button>
                  <button 
                    onClick={handleUnselectAll}
                    disabled={loading || selectedSummaryIds.length === 0}
                    className="flex items-center justify-center rounded-lg h-10 bg-gray-600 text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-4 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clear Selection
                  </button>
                </div>
                {selectedSummaryIds.length > 0 && (
                  <div className="text-sm text-gray-600">
                    {selectedSummaryIds.length} of {summaries.length} selected on this page
                  </div>
                )}
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">
                        <input 
                          type="checkbox" 
                          checked={isAllSelected && summaries.length > 0}
                          onChange={handleSelectAll}
                          disabled={loading || summaries.length === 0}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          title={isAllSelected ? 'Unselect all on this page' : 'Select all on this page'}
                        />
                      </th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Test ID</th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Age</th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Start Time</th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Quality</th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Device</th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading ? (
                      Array.from({ length: 10 }).map((_, index) => (
                        <tr key={`loading-${index}`} className="animate-pulse hover:bg-gray-50">
                          <td className="py-4 px-4 w-12"><div className="h-4 bg-gray-200 rounded w-4"></div></td>
                          <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                          <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                          <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                          <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-10"></div></td>
                          <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                          <td className="py-4 px-4"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
                          <td className="py-4 px-4"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
                          <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-12"></div></td>
                          <td className="py-4 px-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                          <td className="py-4 px-4 text-right"><div className="h-4 bg-gray-200 rounded w-20 ml-auto"></div></td>
                        </tr>
                      ))
                    ) : (
                      Array.from({ length: pageSize }).map((_, index) => {
                        const summary = index < pageSize ? summaries[index] : undefined;
                        
                        if (summary) {
                          return (
                            <tr key={summary.id} className="hover:bg-gray-50">
                              {/* Checkbox */}
                              <td className="py-4 px-4 w-12">
                                <input 
                                  type="checkbox" 
                                  checked={selectedSummaryIds.includes(summary.id)}
                                  onChange={(e) => handleSelectSummary(summary.id, e.target.checked)}
                                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                />
                              </td>
                              {/* Test ID with copy */}
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2 group">
                                  <div className="relative">
                                    <span className="text-sm font-mono text-gray-900 cursor-pointer hover:text-blue-600" title={summary.testid || 'N/A'}>
                                      {summary.testid ? summary.testid.substring(0, 12) + '...' : 'N/A'}
                                    </span>
                                    {summary.testid && (
                                      <div className="absolute left-0 top-full mt-1 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 shadow-lg">
                                        {summary.testid}
                                      </div>
                                    )}
                                  </div>
                                  {summary.testid && (
                                    <button onClick={() => copyToClipboard(summary.testid!)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded cursor-pointer" title="Copy Test ID">
                                      {copiedId === summary.testid ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3 text-gray-600" />}
                                    </button>
                                  )}
                                </div>
                              </td>
                              
                              {/* Name */}
                              <td className="py-4 px-4 text-sm text-gray-900">
                                {summary.user_data?.user_name || 'N/A'}
                              </td>
                              
                              {/* Email */}
                              <td className="py-4 px-4 text-sm text-gray-600">
                                {summary.user_data?.email || 'N/A'}
                              </td>
                              
                              {/* Age */}
                              <td className="py-4 px-4 text-sm text-gray-900">
                                {summary.user_data?.dob ? (
                                  calculateAge(summary.user_data.dob) !== null ? calculateAge(summary.user_data.dob) : 'N/A'
                                ) : 'N/A'}
                              </td>
                              
                              {/* Start Time */}
                              <td className="py-4 px-4 text-sm text-gray-600">
                                {summary.starting_time ? new Date(summary.starting_time).toLocaleDateString() : 'N/A'}
                              </td>
                              
                              {/* Payment Status */}
                              <td className="py-4 px-4">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  summary.payment_status === 'success' || summary.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                                  summary.payment_status === 'Start' ? 'bg-yellow-100 text-yellow-800' :
                                  summary.payment_status === null || summary.payment_status === 'NULL' ? 'bg-gray-100 text-gray-800' :
                                  (summary.payment_status && (
                                    summary.payment_status.toLowerCase().includes('failed') ||
                                    summary.payment_status.toLowerCase().includes('error')
                                  )) ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {summary.payment_status || 'NULL'}
                                </span>
                              </td>
                              
                              {/* Status */}
                              <td className="py-4 px-4">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  summary.status === 'Complete' || summary.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                  summary.status === 'Failed' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {summary.status || 'N/A'}
                                </span>
                              </td>
                              
                              {/* Quality Score */}
                              <td className="py-4 px-4">
                                {summary.qualityscore ? (
                                  <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                                    parseInt(summary.qualityscore) >= 80 ? 'bg-green-100 text-green-800' :
                                    parseInt(summary.qualityscore) >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                    parseInt(summary.qualityscore) >= 40 ? 'bg-orange-100 text-orange-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {summary.qualityscore}
                                  </span>
                                ) : (
                                  <span className="text-sm text-gray-400">N/A</span>
                                )}
                              </td>
                              
                              {/* Device */}
                              <td className="py-4 px-4 text-sm text-gray-600">
                                {summary.device_type || 'N/A'}
                              </td>
                              
                              {/* Actions */}
                              <td className="py-4 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => openDetailsPopup(summary)} className="inline-flex cursor-pointer items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline" title="View Details">
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button onClick={() => openDeletePopup(summary)} className="inline-flex cursor-pointer items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium hover:underline" title="Delete">
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        } else {
                          return (
                            <tr key={`empty-${index}`} className="h-14">
                              <td className="py-4 px-4"></td>
                              <td className="py-4 px-4"></td>
                              <td className="py-4 px-4"></td>
                              <td className="py-4 px-4"></td>
                              <td className="py-4 px-4"></td>
                              <td className="py-4 px-4"></td>
                              <td className="py-4 px-4"></td>
                              <td className="py-4 px-4"></td>
                              <td className="py-4 px-4"></td>
                              <td className="py-4 px-4"></td>
                              <td className="py-4 px-4"></td>
                            </tr>
                          );
                        }
                      })
                    )}
                    
                    {!loading && summaries.length === 0 && (
                      <tr>
                        <td colSpan={11} className="py-12 text-center text-gray-500 text-sm">
                          No summaries found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {pagination && (
                <div className="flex items-center justify-between pt-4">
                  <span className="text-sm text-gray-600">
                    Showing {((pagination.currentPage - 1) * pageSize) + 1} to {Math.min(pagination.currentPage * pageSize, pagination.totalRecords)} of {pagination.totalRecords} summaries
                  </span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="flex items-center justify-center rounded-lg h-9 w-9 border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    
                    {pagination.totalPages <= 10 ? (
                      Array.from({ length: pagination.totalPages }).map((_, i) => (
                        <button key={i+1} onClick={() => handlePageChange(i+1)} className={`flex items-center justify-center rounded-lg h-9 w-9 text-sm font-medium ${ currentPage === i+1 ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-100' }`}>
                          {i+1}
                        </button>
                      ))
                    ) : (
                      <>
                        <button onClick={() => handlePageChange(1)} className={`flex items-center justify-center rounded-lg h-9 w-9 text-sm font-medium ${ currentPage === 1 ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-100' }`}>1</button>
                        {currentPage > 4 && <span className="px-2 text-gray-500">...</span>}
                        {Array.from({ length: Math.min(3, pagination.totalPages - 2) }).map((_, i) => {
                          const pageNum = Math.max(2, currentPage - 1) + i;
                          if (pageNum > 1 && pageNum < pagination.totalPages) {
                            return <button key={pageNum} onClick={() => handlePageChange(pageNum)} className={`flex items-center justify-center rounded-lg h-9 w-9 text-sm font-medium ${ currentPage === pageNum ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-100' }`}>{pageNum}</button>;
                          }
                          return null;
                        })}
                        {currentPage < pagination.totalPages - 3 && <span className="px-2 text-gray-500">...</span>}
                        {pagination.totalPages > 1 && (
                          <button onClick={() => handlePageChange(pagination.totalPages)} className={`flex items-center justify-center rounded-lg h-9 w-9 text-sm font-medium ${ currentPage === pagination.totalPages ? 'bg-blue-600 text-white' : 'border border-gray-300 text-gray-600 hover:bg-gray-100' }`}>{pagination.totalPages}</button>
                        )}
                      </>
                    )}
                    
                    <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === pagination.totalPages} className="flex items-center justify-center rounded-lg h-9 w-9 border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Bulk Delete Confirmation Popup */}
            {showBulkDeletePopup && selectedSummaryIds.length > 0 && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Delete Multiple Summaries</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Are you sure you want to delete <strong>{selectedSummaryIds.length}</strong> selected summaries? This action cannot be undone.
                  </p>
                  <div className="bg-gray-50 p-3 rounded-md mb-4">
                    <p className="font-medium text-sm text-red-600">⚠️ This will permanently delete:</p>
                    <ul className="text-xs text-gray-600 mt-1 list-disc list-inside">
                      <li>{selectedSummaryIds.length} summary records</li>
                      <li>All associated question answers</li>
                      <li>All related data for these summaries</li>
                    </ul>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button 
                      onClick={closeBulkDeletePopup} 
                      disabled={bulkDeleting} 
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={processBulkDelete} 
                      disabled={bulkDeleting} 
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                    >
                      {bulkDeleting ? `Deleting ${selectedSummaryIds.length}...` : `Delete ${selectedSummaryIds.length} Summaries`}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Delete Confirmation Popup */}
            {showDeletePopup && selectedSummary && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Delete Summary</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Are you sure you want to delete this summary? This action cannot be undone.
                  </p>
                  <div className="bg-gray-50 p-3 rounded-md mb-4">
                    <p className="font-medium text-sm">Test ID: <span className="text-gray-900 font-mono">{selectedSummary.testid || 'N/A'}</span></p>
                    <p className="text-xs text-gray-500 mt-1">User: {selectedSummary.user_id || 'N/A'}</p>
                    <p className="text-xs text-gray-500">Started: {selectedSummary.starting_time ? new Date(selectedSummary.starting_time).toLocaleString() : 'N/A'}</p>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button onClick={closeDeletePopup} disabled={deleting} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 cursor-pointer">Cancel</button>
                    <button onClick={processDelete} disabled={deleting} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 cursor-pointer">{deleting ? 'Deleting...' : 'Delete Summary'}</button>
                  </div>
                </div>
              </div>
            )}

            {/* View Details Popup */}
            {showDetailsPopup && selectedSummaryDetails && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold text-gray-900">Summary Details</h3>
                      <button onClick={closeDetailsPopup} className="text-gray-400 hover:text-gray-600 text-2xl font-semibold cursor-pointer">×</button>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    {/* User Information */}
                    {selectedSummaryDetails.user_data && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">User Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div><p className="text-sm font-medium text-gray-600">Name</p><p className="text-sm text-gray-900">{selectedSummaryDetails.user_data.user_name || 'N/A'}</p></div>
                          <div><p className="text-sm font-medium text-gray-600">Email</p><p className="text-sm text-gray-900">{selectedSummaryDetails.user_data.email || 'N/A'}</p></div>
                          <div><p className="text-sm font-medium text-gray-600">Mobile</p><p className="text-sm text-gray-900">{selectedSummaryDetails.user_data.mobile_number || 'N/A'}</p></div>
                          <div><p className="text-sm font-medium text-gray-600">City</p><p className="text-sm text-gray-900">{selectedSummaryDetails.user_data.city || 'N/A'}</p></div>
                          <div><p className="text-sm font-medium text-gray-600">Gender</p><p className="text-sm text-gray-900">{selectedSummaryDetails.user_data.gender || 'N/A'}</p></div>
                          <div><p className="text-sm font-medium text-gray-600">Age</p><p className="text-sm text-gray-900">{selectedSummaryDetails.user_data.dob ? (() => {
                            const calculatedAge = calculateAge(selectedSummaryDetails.user_data.dob);
                            return calculatedAge !== null ? calculatedAge.toString() : 'N/A';
                          })() : 'N/A'}</p></div>
                        </div>
                      </div>
                    )}

                    {/* Test Information */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Test Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div><p className="text-sm font-medium text-gray-600">Test ID</p><div className="flex items-center gap-2"><p className="text-sm font-mono text-gray-900">{selectedSummaryDetails.testid || 'N/A'}</p>{selectedSummaryDetails.testid && (<button onClick={() => copyToClipboard(selectedSummaryDetails.testid!)} className="p-1 hover:bg-gray-200 rounded cursor-pointer" title="Copy">{copiedId === selectedSummaryDetails.testid ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3 text-gray-600" />}</button>)}</div></div>
                        <div><p className="text-sm font-medium text-gray-600">Session ID</p><p className="text-sm font-mono text-gray-900">{selectedSummaryDetails.session_id || 'N/A'}</p></div>
                        <div><p className="text-sm font-medium text-gray-600">User ID</p><p className="text-sm font-mono text-gray-900">{selectedSummaryDetails.user_id || 'N/A'}</p></div>
                        <div><p className="text-sm font-medium text-gray-600">Quality Score</p><p className="text-lg font-bold text-purple-600">{selectedSummaryDetails.qualityscore || 'N/A'}</p></div>
                        <div><p className="text-sm font-medium text-gray-600">AQI</p><p className="text-sm text-gray-900">{selectedSummaryDetails.AQI || 'N/A'}</p></div>
                        <div><p className="text-sm font-medium text-gray-600">Percentile</p><p className="text-sm text-gray-900">{selectedSummaryDetails.perecentile || 'N/A'}</p></div>
                        <div><p className="text-sm font-medium text-gray-600">PDF Attempts</p><p className="text-sm text-gray-900">{(selectedSummaryDetails as any).pdf_attempt || '0'}</p></div>
                        <div><p className="text-sm font-medium text-gray-600">Paid Agent Time</p><p className="text-sm text-gray-900">{(selectedSummaryDetails as any).paid_agent_time ? `${(selectedSummaryDetails as any).paid_agent_time}s` : 'N/A'}</p></div>
                      </div>
                    </div>

                    {/* Status Information */}
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Status & Payment</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div><p className="text-sm font-medium text-gray-600">Payment Status</p><span className={`inline-block px-2 py-1 text-xs rounded-full ${selectedSummaryDetails.payment_status === 'success' || selectedSummaryDetails.payment_status === 'completed' ? 'bg-green-100 text-green-800' : selectedSummaryDetails.payment_status === 'Start' ? 'bg-yellow-100 text-yellow-800' : (selectedSummaryDetails.payment_status && (selectedSummaryDetails.payment_status.toLowerCase().includes('failed') || selectedSummaryDetails.payment_status.toLowerCase().includes('error'))) ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{selectedSummaryDetails.payment_status || 'NULL'}</span></div>
                        <div><p className="text-sm font-medium text-gray-600">Quest Status</p><span className="inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">{selectedSummaryDetails.quest_status || 'N/A'}</span></div>
                        <div><p className="text-sm font-medium text-gray-600">Status</p><span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{selectedSummaryDetails.status || 'N/A'}</span></div>
                      </div>
                    </div>

                    {/* Timing Information */}
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Timeline</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div><p className="text-sm font-medium text-gray-600">Starting Time</p><p className="text-sm text-gray-900">{formatDate(selectedSummaryDetails.starting_time)}</p></div>
                        <div><p className="text-sm font-medium text-gray-600">Completion Time</p><p className="text-sm text-gray-900">{formatDate(selectedSummaryDetails.completion_time)}</p></div>
                        <div><p className="text-sm font-medium text-gray-600">Duration</p><p className="text-sm text-gray-900">{selectedSummaryDetails.complete_duration || 'N/A'}</p></div>
                        <div><p className="text-sm font-medium text-gray-600">Paid Generation Time</p><p className="text-sm text-gray-900">{formatDate(selectedSummaryDetails.paid_generation_time)}</p></div>
                        <div><p className="text-sm font-medium text-gray-600">Agent Start</p><p className="text-sm text-gray-900">{formatDate(selectedSummaryDetails.agent_start_time)}</p></div>
                        <div><p className="text-sm font-medium text-gray-600">Agent Complete</p><p className="text-sm text-gray-900">{formatDate(selectedSummaryDetails.agent_completion_time)}</p></div>
                        <div><p className="text-sm font-medium text-gray-600">Paid Agent Start</p><p className="text-sm text-gray-900">{formatDate((selectedSummaryDetails as any).paid_agent_start_time)}</p></div>
                        <div><p className="text-sm font-medium text-gray-600">Paid Agent Complete</p><p className="text-sm text-gray-900">{formatDate((selectedSummaryDetails as any).paid_agent_complete_time)}</p></div>
                        <div><p className="text-sm font-medium text-gray-600">Agent Time Taken</p><p className="text-sm text-gray-900">{(selectedSummaryDetails as any).total_time_taken_by_agent ? `${(selectedSummaryDetails as any).total_time_taken_by_agent}s` : 'N/A'}</p></div>
                      </div>
                    </div>

                    {/* Device Information */}
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Device & Browser</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div><p className="text-sm font-medium text-gray-600">Device Type</p><p className="text-sm text-gray-900">{selectedSummaryDetails.device_type || 'N/A'}</p></div>
                        <div><p className="text-sm font-medium text-gray-600">Browser</p><p className="text-sm text-gray-900">{selectedSummaryDetails.device_browser || 'N/A'}</p></div>
                        <div><p className="text-sm font-medium text-gray-600">OS</p><p className="text-sm text-gray-900">{selectedSummaryDetails.operating_system || 'N/A'}</p></div>
                        <div><p className="text-sm font-medium text-gray-600">IP Address</p><p className="text-sm font-mono text-gray-900">{selectedSummaryDetails.ip_address || 'N/A'}</p></div>
                        <div><p className="text-sm font-medium text-gray-600">Device Fingerprint</p><p className="text-sm font-mono text-gray-900">{(selectedSummaryDetails as any).device_fingerprint || 'N/A'}</p></div>
                        <div><p className="text-sm font-medium text-gray-600">Archetype</p><p className="text-sm text-gray-900">{(selectedSummaryDetails as any).Archetype || 'N/A'}</p></div>
                      </div>
                    </div>

                    {/* Question & Answer */}
                    {(selectedSummaryDetails as any).question_answer && (
                      <div className="bg-cyan-50 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Question & Answer</h4>
                        <div className="text-sm text-gray-800 bg-white p-6 rounded-lg border border-gray-200 max-h-96 overflow-y-auto shadow-sm">
                          {(() => {
                            const qaText = (selectedSummaryDetails as any).question_answer;
                            if (!qaText) return null;
                            
                            // Split by question pattern and format
                            const lines = qaText.split(/\n(?=Question:)/g);
                            
                            return lines.map((block: string, index: number) => {
                              if (!block.trim()) return null;
                              
                              // Extract question and answer
                              const questionMatch = block.match(/Question:\s*(.+?)(?=\n|$)/s);
                              const answerMatch = block.match(/Answer[:\s]+(.+?)(?=\[\]|$)/s);
                              
                              if (!questionMatch) return null;
                              
                              const question = questionMatch[1]?.trim();
                              let answer = answerMatch?.[1]?.trim() || 'N/A';
                              
                              // Try to parse JSON answers and format them nicely
                              try {
                                const parsed = JSON.parse(answer);
                                if (parsed.rankings && Array.isArray(parsed.rankings)) {
                                  answer = `Rankings: ${parsed.rankings.map((r: any, i: number) => `${i + 1}. ${r.text}`).join(', ')}${parsed.explanation ? ` - Explanation: ${parsed.explanation}` : ''}`;
                                } else if (typeof parsed === 'object') {
                                  answer = JSON.stringify(parsed, null, 2);
                                }
                              } catch (e) {
                                // Not JSON, keep as is
                              }
                              
                              return (
                                <div key={index} className="mb-5 pb-5 border-b border-gray-200 last:border-b-0 last:mb-0 last:pb-0">
                                  <div className="flex items-start gap-2 mb-2">
                                    <span className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                                      {index + 1}
                                    </span>
                                    <p className="font-semibold text-gray-900 leading-relaxed">{question}</p>
                                  </div>
                                  <div className="ml-8">
                                    <p className="text-sm font-medium text-gray-500 mb-1">Answer:</p>
                                    <p className="text-gray-700 leading-relaxed bg-gray-50 px-3 py-2 rounded">{answer}</p>
                                  </div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Content Outputs */}
                    {((selectedSummaryDetails as any).brain_mapping || (selectedSummaryDetails as any).future_compass || (selectedSummaryDetails as any).content_output || (selectedSummaryDetails as any).thought) && (
                      <div className="bg-indigo-50 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">AI Generated Content</h4>
                        <div className="space-y-4">
                          {(selectedSummaryDetails as any).brain_mapping && (
                            <div>
                              <p className="text-sm font-medium text-gray-600 mb-2">Brain Mapping</p>
                              <div className="text-sm text-gray-900 bg-white p-3 rounded border max-h-32 overflow-y-auto">
                                {(selectedSummaryDetails as any).brain_mapping}
                              </div>
                            </div>
                          )}
                          {(selectedSummaryDetails as any).future_compass && (
                            <div>
                              <p className="text-sm font-medium text-gray-600 mb-2">Future Compass</p>
                              <div className="text-sm text-gray-900 bg-white p-3 rounded border max-h-32 overflow-y-auto">
                                {(selectedSummaryDetails as any).future_compass}
                              </div>
                            </div>
                          )}
                          {(selectedSummaryDetails as any).content_output && (
                            <div>
                              <p className="text-sm font-medium text-gray-600 mb-2">Content Output</p>
                              <div className="text-sm text-gray-900 bg-white p-3 rounded border max-h-32 overflow-y-auto">
                                {(selectedSummaryDetails as any).content_output}
                              </div>
                            </div>
                          )}
                          {(selectedSummaryDetails as any).thought && (
                            <div>
                              <p className="text-sm font-medium text-gray-600 mb-2">Thought</p>
                              <div className="text-sm text-gray-900 bg-white p-3 rounded border max-h-32 overflow-y-auto">
                                {(selectedSummaryDetails as any).thought}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* PDF & URLs */}
                    {(selectedSummaryDetails.quest_pdf || selectedSummaryDetails.url) && (
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Resources</h4>
                        <div className="space-y-2">
                          {selectedSummaryDetails.quest_pdf && (
                            <div><p className="text-sm font-medium text-gray-600 mb-2">Quest PDF</p><a href={selectedSummaryDetails.quest_pdf} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"><Download className="w-4 h-4 mr-2" />Download PDF</a></div>
                          )}
                          {selectedSummaryDetails.url && (
                            <div><p className="text-sm font-medium text-gray-600">URL</p><a href={selectedSummaryDetails.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline break-all">{selectedSummaryDetails.url}</a></div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Errors */}
                    {(selectedSummaryDetails.summary_error || selectedSummaryDetails.quest_error) && (
                      <div className="bg-red-50 rounded-lg p-4">
                        <h4 className="text-lg font-semibold text-red-900 mb-3">Errors</h4>
                        {selectedSummaryDetails.summary_error && (<div className="mb-2"><p className="text-sm font-medium text-gray-600">Summary Error</p><p className="text-sm text-red-600 bg-red-100 p-2 rounded">{selectedSummaryDetails.summary_error}</p></div>)}
                        {selectedSummaryDetails.quest_error && (<div><p className="text-sm font-medium text-gray-600">Quest Error</p><p className="text-sm text-red-600 bg-red-100 p-2 rounded">{selectedSummaryDetails.quest_error}</p></div>)}
                      </div>
                    )}
                  </div>
                  
                  <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
                    <button onClick={closeDetailsPopup} className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 cursor-pointer">Close</button>
                  </div>
                </div>
              </div>
            )}
    </div>
  );
};

export default AdminSummaryManagement;
