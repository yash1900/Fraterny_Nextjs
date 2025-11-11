'use client';

import React, { useState, useEffect } from 'react';
import { X, Users, Crown, Copy, AlertTriangle, RefreshCw, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';

export interface UserData {
  user_id: string;
  user_name?: string;
  email?: string;
  mobile_number?: string;
  city?: string;
  gender?: string;
  dob?: string;
  total_summary_generation?: number;
  total_paid_generation?: number;
  last_used?: string;
  is_anonymous?: boolean | string;
  [key: string]: any;
}

export interface DuplicateGroup {
  groupKey: string;
  users: UserData[];
  primaryUser: UserData;
  duplicateUsers: UserData[];
}

interface DuplicateManagementPopupProps {
  isOpen: boolean;
  onClose: () => void;
  groupKey: string;
  primaryUserName: string;
  duplicateCount: number;
  onMergeComplete: () => void;
  onDeleteUser: (userId: string) => void;
}

const DuplicateManagementPopup: React.FC<DuplicateManagementPopupProps> = ({
  isOpen,
  onClose,
  groupKey,
  primaryUserName,
  duplicateCount,
  onMergeComplete,
  onDeleteUser
}) => {
  const [loading, setLoading] = useState(false);
  const [duplicateGroup, setDuplicateGroup] = useState<DuplicateGroup | null>(null);
  const [showMergeConfirmation, setShowMergeConfirmation] = useState(false);
  const [merging, setMerging] = useState(false);
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);
  const [selectedPrimaryUserId, setSelectedPrimaryUserId] = useState<string | null>(null);

  // Copy to clipboard function
  const copyToClipboard = async (userId: string) => {
    try {
      await navigator.clipboard.writeText(userId);
      setCopiedUserId(userId);
      setTimeout(() => setCopiedUserId(null), 2000);
    } catch (err) {
      console.error('Failed to copy user ID: ', err);
    }
  };

  // Load duplicate group data - DIRECT API CALL
  const loadDuplicateGroup = async () => {
    if (!groupKey) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users?operation=duplicate-group&groupKey=${encodeURIComponent(groupKey)}`, {
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
        setDuplicateGroup(data.data);
        // Set the initial primary user (first one by default)
        if (data.data.users.length > 0) {
          setSelectedPrimaryUserId(data.data.primaryUser.user_id);
        }
      } else {
        throw new Error(data.error || 'Failed to load duplicate group');
      }
    } catch (error: any) {
      console.error('Error loading duplicate group:', error);
      toast.error('Failed to load duplicate users', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle primary user selection
  const handleSelectPrimary = (userId: string) => {
    setSelectedPrimaryUserId(userId);
    toast.success('Primary user updated', {
      description: 'This user will be kept after merge, others will be consolidated into it.'
    });
  };

  // Handle merge confirmation - DIRECT API CALL
  const handleMergeConfirmation = async () => {
    if (!groupKey || !selectedPrimaryUserId || !duplicateGroup) return;
    
    setMerging(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'merge-duplicates',
          groupKey,
          primaryUserId: selectedPrimaryUserId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success('Users merged successfully', {
          description: result.message || 'Duplicate users have been consolidated.'
        });
        onMergeComplete();
        onClose();
      } else {
        toast.error('Failed to merge users', {
          description: result.error || 'An unknown error occurred'
        });
      }
    } catch (error: any) {
      console.error('Merge error:', error);
      toast.error('Failed to merge users', {
        description: error.message || 'An unexpected error occurred'
      });
    } finally {
      setMerging(false);
      setShowMergeConfirmation(false);
    }
  };

  // Calculate merge preview data
  const getMergePreview = () => {
    if (!duplicateGroup || !selectedPrimaryUserId) return null;
    
    const totalSummaryGen = duplicateGroup.users.reduce(
      (sum, user) => sum + (user.total_summary_generation || 0), 0
    );
    const totalPaidGen = duplicateGroup.users.reduce(
      (sum, user) => sum + (user.total_paid_generation || 0), 0
    );
    
    const duplicateCount = duplicateGroup.users.filter(u => u.user_id !== selectedPrimaryUserId).length;
    
    return {
      totalSummaryGen,
      totalPaidGen,
      duplicateCount
    };
  };

  const mergePreview = getMergePreview();

  // Load data when popup opens
  useEffect(() => {
    if (isOpen && groupKey) {
      loadDuplicateGroup();
    }
  }, [isOpen, groupKey]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-bold text-gray-900">Duplicate Users</h3>
              <p className="text-sm text-gray-600">
                {duplicateCount} users found for: <span className="font-medium">{primaryUserName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Loading duplicate users...</span>
            </div>
          ) : duplicateGroup ? (
            <div className="space-y-6">
              {/* Instructions */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                <h4 className="font-medium text-blue-900 mb-2">📋 Instructions</h4>
                <p className="text-blue-800 text-sm">
                  Click on any duplicate user card to make it the primary user. The primary user will be kept after merge, and all other users' data will be consolidated into it.
                </p>
              </div>

              {/* Group Information */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Group Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">Group Key:</span>
                    <span className="ml-2 text-gray-700 font-mono text-xs">{groupKey}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Total Users:</span>
                    <span className="ml-2 text-gray-700">{duplicateGroup.users.length}</span>
                  </div>
                </div>
              </div>

              {/* Users List */}
              <div className="space-y-4">
                {duplicateGroup.users.map((user, index) => {
                  const isPrimary = selectedPrimaryUserId === user.user_id;
                  const isClickable = selectedPrimaryUserId !== user.user_id;
                  
                  return (
                    <div
                      key={user.user_id}
                      onClick={() => isClickable && handleSelectPrimary(user.user_id)}
                      className={`p-4 rounded-lg border transition-all duration-200 ${
                        isPrimary 
                          ? 'bg-green-50 border-green-300 ring-2 ring-green-200' 
                          : isClickable
                            ? 'bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-300 cursor-pointer'
                            : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              {isPrimary ? (
                                <Crown className="h-5 w-5 text-green-600" />
                              ) : (
                                <Copy className="h-5 w-5 text-gray-400" />
                              )}
                              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                isPrimary 
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-orange-100 text-orange-800'
                              }`}>
                                {isPrimary ? 'Primary User' : 'Duplicate'}
                              </span>
                            </div>
                            {!isPrimary && (
                              <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded">
                                Click to make primary
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 font-medium">User ID:</span>
                              <div className="flex items-center gap-1 mt-1">
                                <span className="font-mono text-xs text-gray-700">
                                  {user.user_id.substring(0, 12)}...
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(user.user_id);
                                  }}
                                  className="p-1 hover:bg-gray-200 rounded cursor-pointer"
                                  title="Copy User ID"
                                >
                                  {copiedUserId === user.user_id ? (
                                    <Check className="h-3 w-3 text-green-600" />
                                  ) : (
                                    <Copy className="h-3 w-3 text-gray-500" />
                                  )}
                                </button>
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500 font-medium">Name:</span>
                              <p className="text-gray-700 mt-1 break-words">{user.user_name || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 font-medium">Email:</span>
                              <p className="text-gray-700 mt-1 break-all text-xs">
                                {user.email && user.email.length > 25 
                                  ? `${user.email.substring(0, 25)}...` 
                                  : (user.email || 'N/A')}
                              </p>
                              {user.email && user.email.length > 25 && (
                                <p className="text-gray-400 text-xs mt-1" title={user.email}>
                                  Hover for full email
                                </p>
                              )}
                            </div>
                            <div>
                              <span className="text-gray-500 font-medium">Mobile:</span>
                              <p className="text-gray-700 mt-1 break-words">{user.mobile_number || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 font-medium">City:</span>
                              <p className="text-gray-700 mt-1 break-words">{user.city || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 font-medium">Gender:</span>
                              <p className="text-gray-700 mt-1">{user.gender || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 font-medium">Total Gens:</span>
                              <p className="text-gray-700 mt-1">{user.total_summary_generation || 0}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 font-medium">Paid Gens:</span>
                              <p className="text-gray-700 mt-1 font-semibold">{user.total_paid_generation || 0}</p>
                            </div>
                            <div>
                              <span className="text-gray-500 font-medium">Last Used:</span>
                              <p className="text-gray-700 mt-1 text-xs">
                                {user.last_used ? new Date(user.last_used).toLocaleDateString() : 'Never'}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500 font-medium">Type:</span>
                              <span className={`px-2 py-1 text-xs rounded-full mt-1 inline-block ${
                                user.is_anonymous === 'FALSE' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-orange-100 text-orange-800'
                              }`}>
                                {user.is_anonymous === 'FALSE' ? 'Registered' : 'Anonymous'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {!isPrimary && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteUser(user.user_id);
                            }}
                            className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete this duplicate"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Failed to load duplicate users</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {duplicateGroup && !loading && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center text-sm text-gray-600">
              <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
              Merging will combine all data into the primary user and delete duplicates.
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => setShowMergeConfirmation(true)}
                disabled={duplicateGroup.users.length < 2}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Merge All Users
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Merge Confirmation Dialog */}
      {showMergeConfirmation && mergePreview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              <h3 className="text-lg font-bold text-gray-900">Confirm Merge</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              Are you sure you want to merge these {duplicateCount} users? This action cannot be undone.
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium text-blue-900 mb-2">This will:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✅ Combine generation counts: {mergePreview.totalSummaryGen} total</li>
                <li>✅ Combine paid generations: {mergePreview.totalPaidGen} paid</li>
                <li>✅ Move all activity records to primary user</li>
                <li>✅ Fill missing profile data</li>
                <li>❌ Delete {mergePreview.duplicateCount} duplicate user records permanently</li>
              </ul>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowMergeConfirmation(false)}
                disabled={merging}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleMergeConfirmation}
                disabled={merging}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {merging && <RefreshCw className="h-4 w-4 animate-spin" />}
                {merging ? 'Merging...' : 'Confirm Merge'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DuplicateManagementPopup;