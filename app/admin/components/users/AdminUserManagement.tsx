'use client';

import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Activity, BarChart3, ChevronLeft, ChevronRight, Trash2, AlertTriangle, Copy, Check, UserX, Shield } from 'lucide-react';
import { toast } from 'sonner';
import DuplicateManagementPopup from './components/DuplicateManagementPopup';
import type { UserData } from './components/DuplicateManagementPopup';

// Simple Button component (since we're matching original UI)
const Button = ({ children, onClick, disabled, variant, className, ...props }: any) => {
  const baseClasses = "px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const variantClasses = variant === 'outline' 
    ? "border border-gray-300 text-gray-700 hover:bg-gray-50" 
    : "bg-blue-600 text-white hover:bg-blue-700";
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Extended interfaces for user management
export interface UserDataWithDuplicateInfo extends UserData {
  isDuplicateGroup?: boolean;
  duplicateCount?: number;
  isPrimary?: boolean;
  groupKey?: string;
}

export interface UserFilters {
  searchTerm?: string;
  excludeTerm?: string;
  dateFrom?: string;
  dateTo?: string;
  isAnonymous?: boolean | null;
  gender?: string;
  ageFrom?: number | null;
  ageTo?: number | null;
  minPaidGeneration?: number | null;
  maxPaidGeneration?: number | null;
  minSummaryGeneration?: number | null;
  maxSummaryGeneration?: number | null;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface UserStats {
  totalUsers: number;
  anonymousUsers: number;
  activeUsers: number;
  totalGenerations: number;
}

const AdminUserManagement: React.FC = () => {
  // State for data
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserDataWithDuplicateInfo[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats>({ 
    totalUsers: 0, 
    anonymousUsers: 0, 
    activeUsers: 0, 
    totalGenerations: 0 
  });
  const [filteredStats, setFilteredStats] = useState<UserStats | null>(null);
  const [uniqueUsersCount, setUniqueUsersCount] = useState(0);
  const [filteredUniqueUsersCount, setFilteredUniqueUsersCount] = useState<number | null>(null);
  
  // State for applied filters (only updated when Search button is clicked)
  const [appliedFilters, setAppliedFilters] = useState<UserFilters>({
    searchTerm: '',
    excludeTerm: '',
    dateFrom: '',
    dateTo: '',
    isAnonymous: null,
    gender: '',
    ageFrom: null,
    ageTo: null,
    minPaidGeneration: null,
    maxPaidGeneration: null,
  });
  
  // State for duplicate management
  const [showDuplicatePopup, setShowDuplicatePopup] = useState(false);
  const [selectedGroupKey, setSelectedGroupKey] = useState('');
  const [selectedPrimaryUserName, setSelectedPrimaryUserName] = useState('');
  const [selectedDuplicateCount, setSelectedDuplicateCount] = useState(0);

  // Filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10); // Fixed at 10 per page
  const [searchTerm, setSearchTerm] = useState('');
  const [excludeTerm, setExcludeTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isAnonymous, setIsAnonymous] = useState<boolean | null>(null);
  const [gender, setGender] = useState('');
  const [ageFrom, setAgeFrom] = useState<number | null>(null);
  const [ageTo, setAgeTo] = useState<number | null>(null);
  const [minPaidGeneration, setMinPaidGeneration] = useState<number | null>(null);
  const [maxPaidGeneration, setMaxPaidGeneration] = useState<number | null>(null);
  
  // Delete confirmation popup state
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Copy functionality state
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);
  
  // Bulk selection state
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [showBulkDeletePopup, setShowBulkDeletePopup] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // DIRECT API CALLS - replacing service functions

  // Fetch user statistics
  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/admin/users?operation=stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (err: any) {
      console.error('Error fetching user stats:', err);
    }
  };

  // Fetch total unique users count
  const fetchUniqueUsersCount = async () => {
    try {
      const response = await fetch('/api/admin/users?operation=unique-count', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setUniqueUsersCount(data.data.uniqueUsersCount);
      }
    } catch (err: any) {
      console.error('Error fetching unique users count:', err);
      setUniqueUsersCount(0);
    }
  };

  // Fetch users with specific filter values
  const fetchUsersDataWithFilters = async (filterValues: UserFilters) => {
    setLoading(true);
    setError(null);
    setUsers([]);
    setPagination(null);

    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
        withDuplicateDetection: 'true'
      });

      // Add filters to params
      if (filterValues.searchTerm) params.append('search', filterValues.searchTerm);
      if (filterValues.excludeTerm) params.append('exclude', filterValues.excludeTerm);
      if (filterValues.dateFrom) params.append('dateFrom', filterValues.dateFrom);
      if (filterValues.dateTo) params.append('dateTo', filterValues.dateTo);
      if (filterValues.isAnonymous !== null && filterValues.isAnonymous !== undefined) params.append('isAnonymous', filterValues.isAnonymous.toString());
      if (filterValues.gender) params.append('gender', filterValues.gender);
      if (filterValues.ageFrom !== null && filterValues.ageFrom !== undefined) params.append('ageFrom', filterValues.ageFrom.toString());
      if (filterValues.ageTo !== null && filterValues.ageTo !== undefined) params.append('ageTo', filterValues.ageTo.toString());
      if (filterValues.minPaidGeneration !== null && filterValues.minPaidGeneration !== undefined) params.append('minPaidGeneration', filterValues.minPaidGeneration.toString());
      if (filterValues.maxPaidGeneration !== null && filterValues.maxPaidGeneration !== undefined) params.append('maxPaidGeneration', filterValues.maxPaidGeneration.toString());

      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        console.log('📊 Fetched Users Data:', {
          totalUsers: data.data.users.length,
          anonymousCount: data.data.users.filter((u: any) => 
            u.is_anonymous === 'TRUE' || 
            u.is_anonymous === 'true' || 
            u.is_anonymous === '1' ||
            (typeof u.is_anonymous === 'boolean' && u.is_anonymous === true)
          ).length
        });
        
        setUsers(data.data.users);
        setPagination(data.data.pagination);
        
        // Set filtered statistics if available
        if (data.data.filteredStats) {
          console.log('🟢 Setting filtered stats:', data.data.filteredStats);
          setFilteredStats(data.data.filteredStats);
          setFilteredUniqueUsersCount(data.data.filteredStats.totalUsers);
        } else {
          console.log('🔴 No filtered stats in response, clearing filtered stats');
          setFilteredStats(null);
          setFilteredUniqueUsersCount(null);
        }
      } else {
        setError(data.error || 'Failed to load user data');
        setUsers([]);
        setPagination(null);
        setFilteredStats(null);
        setFilteredUniqueUsersCount(null);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setUsers([]);
      setPagination(null);
      setUniqueUsersCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Delete single user
  const deleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete user'
      };
    }
  };

  // Delete multiple users
  const deleteUsers = async (userIds: string[]) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'bulk-delete',
          userIds
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete users'
      };
    }
  };

  // Fetch users based on applied filters (for initial load)
  const fetchUsersData = async () => {
    fetchUsersDataWithFilters(appliedFilters);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    clearSelections();
  };

  // Handle filter apply
  const applyFilters = () => {
    console.log('🔄 Apply Filters Clicked - Input Values:', {
      searchTerm,
      excludeTerm,
      dateFrom,
      dateTo,
      isAnonymous,
      gender,
      ageFrom,
      ageTo,
      minPaidGeneration,
      maxPaidGeneration,
    });
    
    const newAppliedFilters: UserFilters = {
      searchTerm,
      excludeTerm,
      dateFrom,
      dateTo,
      isAnonymous,
      gender,
      ageFrom,
      ageTo,
      minPaidGeneration,
      maxPaidGeneration,
    };
    
    // Update applied filters state with current input values
    setAppliedFilters(newAppliedFilters);
    setCurrentPage(1);
    
    console.log('📝 Setting Applied Filters:', newAppliedFilters);
    
    // Use the current input values for immediate API call
    clearSelections();
    fetchUsersDataWithFilters(newAppliedFilters);
  };

  // Handle filter reset
  const resetFilters = () => {
    // Clear input states
    setSearchTerm('');
    setExcludeTerm('');
    setDateFrom('');
    setDateTo('');
    setIsAnonymous(null);
    setGender('');
    setAgeFrom(null);
    setAgeTo(null);
    setMinPaidGeneration(null);
    setMaxPaidGeneration(null);
    
    // Clear applied filters
    const emptyFilters: UserFilters = {
      searchTerm: '',
      excludeTerm: '',
      dateFrom: '',
      dateTo: '',
      isAnonymous: null,
      gender: '',
      ageFrom: null,
      ageTo: null,
      minPaidGeneration: null,
      maxPaidGeneration: null,
    };
    
    setAppliedFilters(emptyFilters);
    setCurrentPage(1);
    setError(null);
    setUsers([]);
    setPagination(null);
    setFilteredStats(null);
    setFilteredUniqueUsersCount(null);
    clearSelections();
    
    // Fetch data with empty filters
    setTimeout(() => {
      fetchUsersDataWithFilters(emptyFilters);
    }, 0);
  };

  // Clear selections
  const clearSelections = () => {
    setSelectedUserIds([]);
    setIsAllSelected(false);
  };

  // Handle row selection
  const handleRowSelect = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUserIds(prev => [...prev, userId]);
    } else {
      setSelectedUserIds(prev => prev.filter(id => id !== userId));
      setIsAllSelected(false);
    }
  };

  // Handle select all checkbox
  const handleSelectAllCheckbox = (checked: boolean) => {
    if (checked) {
      const allIds = users.filter(u => !u.isDuplicateGroup).map(user => user.user_id);
      setSelectedUserIds(allIds);
      setIsAllSelected(true);
    } else {
      setSelectedUserIds([]);
      setIsAllSelected(false);
    }
  };
  
  // Handle select all button
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedUserIds([]);
      setIsAllSelected(false);
    } else {
      const allIds = users.filter(u => !u.isDuplicateGroup).map(user => user.user_id);
      setSelectedUserIds(allIds);
      setIsAllSelected(true);
    }
  };

  // Check if all visible rows are selected
  useEffect(() => {
    if (users.length > 0) {
      const allSelected = users.every(user => selectedUserIds.includes(user.user_id));
      setIsAllSelected(allSelected);
    }
  }, [selectedUserIds, users]);

  // Handle duplicate group click
  const handleDuplicateGroupClick = (user: UserDataWithDuplicateInfo) => {
    if (user.isDuplicateGroup && user.groupKey) {
      setSelectedGroupKey(user.groupKey);
      setSelectedPrimaryUserName(user.name || user.email || 'Unknown');
      setSelectedDuplicateCount(user.duplicateCount || 0);
      setShowDuplicatePopup(true);
    }
  };

  // Handle duplicate management complete
  const handleDuplicateManagementComplete = () => {
    setShowDuplicatePopup(false);
    // Refresh data after duplicate management
    fetchUsersData();
    fetchUserStats();
    fetchUniqueUsersCount();
  };

  // Handle single user delete
  const handleDeleteUser = (user: UserData) => {
    setSelectedUser(user);
    setShowDeletePopup(true);
  };

  // Confirm single user delete
  const confirmDeleteUser = async () => {
    if (!selectedUser) return;
    
    setDeleting(true);
    try {
      const result = await deleteUser(selectedUser.user_id);
      if (result.success) {
        toast.success(`User ${selectedUser.name || selectedUser.email} deleted successfully`);
        setShowDeletePopup(false);
        setSelectedUser(null);
        
        // Refresh data
        fetchUsersData();
        fetchUserStats();
        fetchUniqueUsersCount();
        clearSelections();
      } else {
        toast.error(result.error || 'Failed to delete user');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedUserIds.length === 0) {
      toast.error('No users selected for deletion');
      return;
    }
    setShowBulkDeletePopup(true);
  };

  // Confirm bulk delete
  const confirmBulkDelete = async () => {
    if (selectedUserIds.length === 0) return;
    
    setBulkDeleting(true);
    try {
      const result = await deleteUsers(selectedUserIds);
      if (result.success) {
        toast.success(`${selectedUserIds.length} users deleted successfully`);
        setShowBulkDeletePopup(false);
        
        // Refresh data
        fetchUsersData();
        fetchUserStats();
        fetchUniqueUsersCount();
        clearSelections();
      } else {
        toast.error(result.error || 'Failed to delete users');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete users');
    } finally {
      setBulkDeleting(false);
    }
  };

  // Handle copy user ID
  const handleCopyUserId = async (userId: string) => {
    try {
      await navigator.clipboard.writeText(userId);
      setCopiedUserId(userId);
      toast.success('User ID copied to clipboard');
      
      // Clear copied state after 2 seconds
      setTimeout(() => {
        setCopiedUserId(null);
      }, 2000);
    } catch (error) {
      toast.error('Failed to copy user ID');
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Helper function to get display name
  const getDisplayName = (user: UserDataWithDuplicateInfo) => {
    if (user.name && user.name.trim()) {
      return user.name;
    }
    if (user.email && user.email.trim()) {
      return user.email;
    }
    return 'Anonymous';
  };

  // Helper function to check if user is anonymous
  const isUserAnonymous = (user: UserDataWithDuplicateInfo) => {
    return user.is_anonymous === 'TRUE' || 
           user.is_anonymous === 'true' || 
           user.is_anonymous === '1' ||
           (typeof user.is_anonymous === 'boolean' && user.is_anonymous === true);
  };

  // useEffect hooks
  useEffect(() => {
    // Initial data load
    fetchUserStats();
    fetchUniqueUsersCount();
    // Don't call fetchUsersData here - let the currentPage useEffect handle it
  }, []);

  // Update users data when currentPage changes
  useEffect(() => {
    // Only fetch if we have appliedFilters and page actually changed
    if (currentPage >= 1) {
      fetchUsersDataWithFilters(appliedFilters);
    }
  }, [currentPage]); // Only depend on currentPage

  // Helper function to check if any filters are active (based on applied filters, not input states)
  const hasActiveFilters = () => {
    const hasFilters = !!(appliedFilters.searchTerm || appliedFilters.excludeTerm || appliedFilters.dateFrom || 
              appliedFilters.dateTo || appliedFilters.isAnonymous !== null || appliedFilters.gender || 
              appliedFilters.ageFrom || appliedFilters.ageTo || appliedFilters.minPaidGeneration || appliedFilters.maxPaidGeneration);
    
    return hasFilters;
  };

  return (
    <>
    <div className="p-8">
            <div className="flex flex-wrap justify-between items-center gap-3 mb-8">
              <p className="text-gray-900 text-3xl font-black leading-tight tracking-[-0.033em]">User Management</p>
            </div>
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              {/* Total Users Card */}
              <div className="flex flex-col gap-2 rounded-xl p-6 border border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <p className="text-gray-600 text-base font-medium leading-normal">Total Users</p>
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <p className="text-gray-900 tracking-tight text-4xl font-bold leading-tight">
                  {(filteredStats && hasActiveFilters() ? filteredStats.totalUsers : stats.totalUsers).toLocaleString()}
                </p>
                {hasActiveFilters() && (
                  <p className="text-blue-600 text-xs font-medium">Filtered Results</p>
                )}
              </div>

              {/* Anonymous Users Card */}
              <div className="flex flex-col gap-2 rounded-xl p-6 border border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <p className="text-gray-600 text-base font-medium leading-normal">Anonymous</p>
                  <UserCheck className="h-6 w-6 text-orange-500" />
                </div>
                <p className="text-gray-900 tracking-tight text-4xl font-bold leading-tight">
                  {(filteredStats && hasActiveFilters() ? filteredStats.anonymousUsers : stats.anonymousUsers).toLocaleString()}
                </p>
                {hasActiveFilters() && (
                  <p className="text-blue-600 text-xs font-medium">Filtered Results</p>
                )}
              </div>

              {/* Active Users Card */}
              <div className="flex flex-col gap-2 rounded-xl p-6 border border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <p className="text-gray-600 text-base font-medium leading-normal">Active (30d)</p>
                  <Activity className="h-6 w-6 text-green-500" />
                </div>
                <p className="text-gray-900 tracking-tight text-4xl font-bold leading-tight">
                  {(filteredStats && hasActiveFilters() ? filteredStats.activeUsers : stats.activeUsers).toLocaleString()}
                </p>
                {hasActiveFilters() && (
                  <p className="text-blue-600 text-xs font-medium">Filtered Results</p>
                )}
              </div>

              {/* Unique Users Card */}
              <div className="flex flex-col gap-2 rounded-xl p-6 border border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <p className="text-gray-600 text-base font-medium leading-normal">Unique Users</p>
                  <Shield className="h-6 w-6 text-indigo-500" />
                </div>
                <p className="text-gray-900 tracking-tight text-4xl font-bold leading-tight">
                  {(filteredUniqueUsersCount !== null && hasActiveFilters() ? filteredUniqueUsersCount : uniqueUsersCount).toLocaleString()}
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  {hasActiveFilters() ? 'Filtered results' : 'After duplicate detection'}
                </p>
                {hasActiveFilters() && (
                  <p className="text-blue-600 text-xs font-medium">Filtered Results</p>
                )}
              </div>

              {/* Total Generations Card */}
              <div 
                className={`flex flex-col gap-2 rounded-xl p-6 border cursor-pointer transition-colors duration-200 ${
                  appliedFilters.minPaidGeneration 
                    ? 'border-purple-300 bg-purple-50'
                    : 'border-gray-200 bg-white hover:bg-purple-50 hover:border-purple-300'
                }`}
                onClick={() => {
                  // Filter to show only users with paid generations
                  setSearchTerm('');
                  setExcludeTerm('');
                  setDateFrom('');
                  setDateTo('');
                  setIsAnonymous(null);
                  setGender('');
                  setAgeFrom(null);
                  setAgeTo(null);
                  setMinPaidGeneration(1); // Set minimum paid generations to 1
                  setMaxPaidGeneration(null);
                  
                  // Apply filters immediately
                  const paidUserFilters = {
                    searchTerm: '',
                    excludeTerm: '',
                    dateFrom: '',
                    dateTo: '',
                    isAnonymous: null,
                    gender: '',
                    ageFrom: null,
                    ageTo: null,
                    minPaidGeneration: 1,
                    maxPaidGeneration: null,
                  };
                  
                  setAppliedFilters(paidUserFilters);
                  setCurrentPage(1);
                  
                  // Fetch users with paid generations
                  fetchUsersDataWithFilters(paidUserFilters);
                }}
                title="Click to show only users with paid generations"
              >
                <div className="flex items-center justify-between">
                  <p className="text-gray-600 text-base font-medium leading-normal">Total Paid Gen.</p>
                  <BarChart3 className="h-6 w-6 text-purple-500" />
                </div>
                <p className="text-gray-900 tracking-tight text-4xl font-bold leading-tight">
                  {(filteredStats && hasActiveFilters() ? filteredStats.totalGenerations : stats.totalGenerations).toLocaleString()}
                </p>
                {appliedFilters.minPaidGeneration ? (
                  <p className="text-purple-600 text-xs font-medium">Showing Paid Users Only</p>
                ) : hasActiveFilters() ? (
                  <p className="text-blue-600 text-xs font-medium">Filtered Results</p>
                ) : null}
              </div>
            </div>

            {/* Filter Section */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
              <h2 className="text-gray-900 text-xl font-bold leading-tight tracking-[-0.015em] mb-4">Filter Users</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end mb-6">
                {/* Search */}
                <label className="flex flex-col">
                  <p className="text-gray-700 text-sm font-medium leading-normal pb-2">Search</p>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Name, email, user ID, mobile..."
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </label>
                
                {/* User Type */}
                <label className="flex flex-col">
                  <p className="text-gray-700 text-sm font-medium leading-normal pb-2">User Type</p>
                  <select
                    value={isAnonymous === null ? '' : isAnonymous.toString()}
                    onChange={(e) => setIsAnonymous(e.target.value === '' ? null : e.target.value === 'true')}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">All Users</option>
                    <option value="false">Registered</option>
                    <option value="true">Anonymous</option>
                  </select>
                </label>
                
                {/* Exclusion Filter */}
                <label className="flex flex-col">
                  <p className="text-gray-700 text-sm font-medium leading-normal pb-2">Exclude Filter</p>
                  <input
                    type="text"
                    value={excludeTerm}
                    onChange={(e) => setExcludeTerm(e.target.value)}
                    placeholder="Exclude matching data..."
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </label>
                
                {/* Gender */}
                <label className="flex flex-col">
                  <p className="text-gray-700 text-sm font-medium leading-normal pb-2">Gender</p>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-binary">Non-binary</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </label>
                
                {/* Age Range */}
                <label className="flex flex-col">
                  <p className="text-gray-700 text-sm font-medium leading-normal pb-2">Age From</p>
                  <input
                    type="number"
                    value={ageFrom || ''}
                    onChange={(e) => setAgeFrom(e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="Min age..."
                    min="0"
                    max="120"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </label>
                
                <label className="flex flex-col">
                  <p className="text-gray-700 text-sm font-medium leading-normal pb-2">Age To</p>
                  <input
                    type="number"
                    value={ageTo || ''}
                    onChange={(e) => setAgeTo(e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="Max age..."
                    min="0"
                    max="120"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </label>
                
                {/* Last Used From */}
                <label className="flex flex-col">
                  <p className="text-gray-700 text-sm font-medium leading-normal pb-2">Last Used From</p>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </label>
                
                {/* Last Used To */}
                <label className="flex flex-col">
                  <p className="text-gray-700 text-sm font-medium leading-normal pb-2">Last Used To</p>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
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
                    onClick={handleBulkDelete}
                    disabled={selectedUserIds.length === 0 || loading}
                    className="flex items-center justify-center rounded-lg h-10 bg-red-600 text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-4 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={selectedUserIds.length === 0 ? 'Select users to delete' : `Delete ${selectedUserIds.length} selected users`}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Selected ({selectedUserIds.length})
                  </button>
                  <button 
                    onClick={handleSelectAll}
                    disabled={loading || users.filter(u => !u.isDuplicateGroup).length === 0}
                    className="flex items-center justify-center rounded-lg h-10 bg-blue-600 text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-4 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAllSelected ? 'Unselect All' : 'Select All'}
                  </button>
                  <button 
                    onClick={clearSelections}
                    disabled={loading || selectedUserIds.length === 0}
                    className="flex items-center justify-center rounded-lg h-10 bg-gray-600 text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-4 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clear Selection
                  </button>
                </div>
                {selectedUserIds.length > 0 && (
                  <div className="text-sm text-gray-600">
                    {selectedUserIds.length} of {users.filter(u => !u.isDuplicateGroup).length} selected on this page
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
                          checked={isAllSelected && users.filter(u => !u.isDuplicateGroup).length > 0}
                          onChange={(e) => handleSelectAllCheckbox(e.target.checked)}
                          disabled={loading || users.filter(u => !u.isDuplicateGroup).length === 0}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          title={isAllSelected ? 'Unselect all on this page' : 'Select all on this page'}
                        />
                      </th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        User ID
                      </th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Mobile
                      </th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        City
                      </th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Gender
                      </th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Age
                      </th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Generations
                      </th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Last Used
                      </th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading ? (
                      // Loading rows
                      Array.from({ length: 10 }).map((_, index) => (
                        <tr key={`loading-${index}`} className="animate-pulse hover:bg-gray-50">
                          <td className="py-4 px-4 w-12">
                            <div className="h-4 bg-gray-200 rounded w-4"></div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="h-4 bg-gray-200 rounded w-10"></div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="h-4 bg-gray-200 rounded w-12"></div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      // Render users (no fixed row count)
                      users.length > 0 ? users.map((user, index) => {
                        if (user) {
                          // Check if user is anonymous - handle various possible values
                          const isAnonymous = user.is_anonymous === 'TRUE' || 
                                             user.is_anonymous === 'true' || 
                                             user.is_anonymous === '1' ||
                                             (typeof user.is_anonymous === 'boolean' && user.is_anonymous === true);
                          
                          // Calculate age from date of birth (handles both date strings and simple age numbers)
                          const calculateAge = (dob: string | null | undefined): number | null => {
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
                          
                          const userAge = calculateAge(user.dob);
                          
                          return (
                            <tr key={user.user_id} className="hover:bg-gray-50">
                              {/* Checkbox - only show for non-duplicate groups */}
                              <td className="py-4 px-4 w-12">
                                {!user.isDuplicateGroup ? (
                                  <input 
                                    type="checkbox" 
                                    checked={selectedUserIds.includes(user.user_id)}
                                    onChange={(e) => handleRowSelect(user.user_id, e.target.checked)}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                  />
                                ) : (
                                  <span className="text-gray-400 text-xs" title="Cannot select duplicate groups">—</span>
                                )}
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2 group">
                                  <div className="relative">
                                    <span 
                                      className="text-sm font-mono text-gray-900 cursor-pointer hover:text-blue-600"
                                      title={user.user_id}
                                    >
                                      {user.user_id.substring(0, 12)}...
                                    </span>
                                    {/* Tooltip with full ID */}
                                    <div className="absolute left-0 top-full mt-1 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 shadow-lg">
                                      {user.user_id}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleCopyUserId(user.user_id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded cursor-pointer"
                                    title="Copy User ID"
                                  >
                                    {copiedUserId === user.user_id ? (
                                      <Check className="h-3 w-3 text-green-600" />
                                    ) : (
                                      <Copy className="h-3 w-3 text-gray-600" />
                                    )}
                                  </button>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-900">
                                {user.name || user.user_name || 'N/A'}
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-600">
                                {user.email || 'N/A'}
                              </td>
                              <td className="py-4 px-4 text-sm font-medium text-gray-900">
                                {user.mobile_number || 'N/A'}
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-600">
                                {user.city || 'N/A'}
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-600">
                                {user.gender || 'N/A'}
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-900">
                                {userAge !== null ? userAge : 'N/A'}
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-900">
                                <div className="flex flex-col">
                                  <span className="text-xs text-gray-500">Total: {user.total_summary_generation || 0}</span>
                                  <span className="text-xs font-semibold text-green-600">Paid: {user.total_paid_generation || 0}</span>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-sm text-gray-600">
                                {user.last_used ? new Date(user.last_used).toLocaleDateString() : 'Never'}
                              </td>
                              <td className="py-4 px-4">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  isAnonymous
                                    ? 'bg-orange-100 text-orange-800' 
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {isAnonymous ? 'Anonymous' : 'Registered'}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-right">
                                {user.isDuplicateGroup ? (
                                  <div className="flex items-center justify-end gap-2">
                                    <button 
                                      onClick={() => handleDuplicateGroupClick(user)}
                                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline cursor-pointer"
                                    >
                                      <UserX className="h-4 w-4" />
                                      Duplicates ({user.duplicateCount})
                                    </button>
                                  </div>
                                ) : (
                                  <button 
                                    onClick={() => handleDeleteUser(user)}
                                    className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium hover:underline cursor-pointer"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        } else {
                          return null;
                        }
                      }) : (
                        <tr>
                          <td colSpan={12} className="py-12 text-center text-gray-500 text-sm">
                            No users found
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
                    Showing {((pagination.currentPage - 1) * pageSize) + 1} to {Math.min(pagination.currentPage * pageSize, pagination.totalRecords)} of {pagination.totalRecords} users
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
    </div>
    {/* End of main container - popups render outside to avoid stacking context issues */}
      
    {/* Duplicate Management Popup */}
    {showDuplicatePopup && (
        <DuplicateManagementPopup
          isOpen={showDuplicatePopup}
          groupKey={selectedGroupKey}
          primaryUserName={selectedPrimaryUserName}
          duplicateCount={selectedDuplicateCount}
          onMergeComplete={handleDuplicateManagementComplete}
          onClose={() => setShowDuplicatePopup(false)}
          onDeleteUser={(userId) => {
            // Close duplicate popup and open delete confirmation for specific user
            setShowDuplicatePopup(false);
            const userToDelete = users.find(u => u.user_id === userId);
            if (userToDelete) {
              handleDeleteUser(userToDelete);
            }
          }}
        />
      )}

    {/* Single User Delete Confirmation Popup */}
    {showDeletePopup && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete User</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this user? This action cannot be undone and will also:
            </p>
            <ul className="text-sm text-gray-600 mb-4 list-disc list-inside space-y-1 bg-yellow-50 p-3 rounded border border-yellow-200">
              <li>Remove all associated question answers</li>
              <li>Delete all summary generation records</li>
              <li>Remove all transaction history</li>
            </ul>
            <div className="bg-gray-50 p-3 rounded-md mb-4">
              <p className="font-medium text-sm">User: <span className="text-gray-900">{selectedUser.name || selectedUser.user_name}</span></p>
              <p className="text-xs text-gray-500 mt-1">Email: {selectedUser.email}</p>
              <p className="text-xs text-gray-500">ID: {selectedUser.user_id}</p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeletePopup(false);
                  setSelectedUser(null);
                }}
                disabled={deleting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}

    {/* Bulk Delete Confirmation Popup */}
    {showBulkDeletePopup && selectedUserIds.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete Multiple Users</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete <strong>{selectedUserIds.length}</strong> selected users? This action cannot be undone and will also:
            </p>
            <ul className="text-sm text-gray-600 mb-4 list-disc list-inside space-y-1 bg-yellow-50 p-3 rounded border border-yellow-200">
              <li>Remove all associated question answers</li>
              <li>Delete all summary generation records</li>
              <li>Remove all transaction history</li>
            </ul>
            <div className="bg-gray-50 p-3 rounded-md mb-4">
              <p className="font-medium text-sm text-red-600">⚠️ This will permanently delete:</p>
              <ul className="text-xs text-gray-600 mt-1 list-disc list-inside">
                <li>{selectedUserIds.length} user records</li>
                <li>All associated data for these users</li>
                <li>All related records across multiple tables</li>
              </ul>
            </div>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowBulkDeletePopup(false)} 
                disabled={bulkDeleting} 
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={confirmBulkDelete} 
                disabled={bulkDeleting} 
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {bulkDeleting ? `Deleting ${selectedUserIds.length}...` : `Delete ${selectedUserIds.length} Users`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminUserManagement;
