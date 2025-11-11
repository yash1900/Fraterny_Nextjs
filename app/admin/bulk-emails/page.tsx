'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Send, Eye, CheckCircle2, XCircle, Loader2, AlertCircle, Pencil, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';

interface AuthUser {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  email_confirmed: boolean;
}

interface EmailTemplate {
  fromName: string;
  replyTo: string;
  subject: string;
  body: string;
  isHtml: boolean;
}

interface SendResult {
  email: string;
  success: boolean;
  error?: string;
}

const BulkEmailsPage: React.FC = () => {
  // User data state
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  
  // Custom names for users (overrides)
  const [customNames, setCustomNames] = useState<Record<string, string>>({});
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Filter state
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Email template state
  const [template, setTemplate] = useState<EmailTemplate>({
    fromName: 'Fraterny',
    replyTo: '',
    subject: '',
    body: '',
    isHtml: false,
  });

  // Send state
  const [sending, setSending] = useState(false);
  const [sendProgress, setSendProgress] = useState({ sent: 0, total: 0 });
  const [sendResults, setSendResults] = useState<SendResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Preview state
  const [showPreview, setShowPreview] = useState(false);

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Apply filters whenever filter state or users change
  useEffect(() => {
    applyFilters();
  }, [users, fromDate, toDate]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Get auth token from Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }
      
      const response = await fetch('/api/admin/auth-users?pageSize=1000', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users);
      } else {
        throw new Error(data.error || 'Failed to fetch users');
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error(`Failed to fetch users: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    if (fromDate) {
      const fromTime = new Date(fromDate).getTime();
      filtered = filtered.filter(
        (user) => new Date(user.created_at).getTime() >= fromTime
      );
    }

    if (toDate) {
      const toTime = new Date(toDate).getTime();
      filtered = filtered.filter(
        (user) => new Date(user.created_at).getTime() <= toTime
      );
    }

    setFilteredUsers(filtered);
    
    // Clear any selected users that are no longer in the filtered list
    setSelectedUserIds(prev => {
      const filteredIds = new Set(filtered.map(u => u.id));
      return prev.filter(id => filteredIds.has(id));
    });
  };

  const handleResetFilters = () => {
    setFromDate('');
    setToDate('');
  };

  const toggleSelectUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    setSelectedUserIds(filteredUsers.map((u) => u.id));
  };

  const handleDeselectAll = () => {
    setSelectedUserIds([]);
  };

  const handleClearSelection = () => {
    setSelectedUserIds([]);
  };

  const replaceVariables = (text: string, user: AuthUser): string => {
    const displayName = customNames[user.id] || user.name || user.email;
    return text
      .replace(/\{\{name\}\}/gi, displayName)
      .replace(/\{\{email\}\}/gi, user.email);
  };

  const handleStartEditName = (user: AuthUser) => {
    setEditingUserId(user.id);
    setEditingName(customNames[user.id] || user.name || '');
  };

  const handleSaveEditName = (userId: string) => {
    if (editingName.trim()) {
      setCustomNames(prev => ({ ...prev, [userId]: editingName.trim() }));
      toast.success('Custom name saved');
    }
    setEditingUserId(null);
    setEditingName('');
  };

  const handleCancelEditName = () => {
    setEditingUserId(null);
    setEditingName('');
  };

  const handlePreview = () => {
    if (selectedUserIds.length === 0) {
      toast.warning('Please select at least one recipient to preview');
      return;
    }
    setShowPreview(true);
  };

  const handleSend = async () => {
    // Validation
    if (selectedUserIds.length === 0) {
      toast.error('Please select at least one recipient');
      return;
    }

    if (!template.replyTo || !template.replyTo.includes('@')) {
      toast.error('Please enter a valid reply-to email address');
      return;
    }

    if (!template.subject.trim()) {
      toast.error('Please enter an email subject');
      return;
    }

    if (!template.body.trim()) {
      toast.error('Please enter email body content');
      return;
    }

    // Confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to send this email to ${selectedUserIds.length} recipient(s)?`
    );

    if (!confirmed) return;

    setSending(true);
    setSendProgress({ sent: 0, total: selectedUserIds.length });
    setSendResults([]);
    setShowResults(false);

    try {
      const selectedUsers = filteredUsers.filter((u) =>
        selectedUserIds.includes(u.id)
      );

      const recipients = selectedUsers.map((u) => ({
        email: u.email,
        name: u.name,
      }));

      // Get auth token from Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const response = await fetch('/api/admin/send-bulk-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          recipients,
          subject: template.subject,
          body: template.body,
          isHtml: template.isHtml,
          replyTo: template.replyTo,
          fromName: template.fromName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send emails');
      }

      const data = await response.json();

      if (data.success) {
        setSendResults(data.data.results);
        setShowResults(true);
        toast.success(
          `Successfully sent ${data.data.totalSent} of ${data.data.total} emails`
        );

        if (data.data.totalFailed > 0) {
          toast.error(`${data.data.totalFailed} emails failed to send`);
        }
      } else {
        throw new Error(data.error || 'Failed to send emails');
      }
    } catch (error: any) {
      console.error('Error sending emails:', error);
      toast.error(`Failed to send emails: ${error.message}`);
    } finally {
      setSending(false);
    }
  };

  const selectedUsers = filteredUsers.filter((u) => selectedUserIds.includes(u.id));
  const firstSelectedUser = selectedUsers[0];

  return (
    <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-gray-900 text-3xl font-black leading-tight tracking-[-0.033em]">
            Bulk Email Management
          </p>
          <p className="text-gray-600 mt-2">
            Send personalized emails to authenticated users
          </p>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Email Template Editor */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Email Template
            </h2>

            <div className="space-y-4">
              {/* From Name */}
              <div>
                <Label htmlFor="fromName">From Name</Label>
                <Input
                  id="fromName"
                  value={template.fromName}
                  onChange={(e) =>
                    setTemplate({ ...template, fromName: e.target.value })
                  }
                  placeholder="Fraterny"
                />
              </div>

              {/* Reply-To Email */}
              <div>
                <Label htmlFor="replyTo">
                  Reply-To Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="replyTo"
                  type="email"
                  value={template.replyTo}
                  onChange={(e) =>
                    setTemplate({ ...template, replyTo: e.target.value })
                  }
                  placeholder="support@fraterny.com"
                  required
                />
              </div>

              {/* Subject */}
              <div>
                <Label htmlFor="subject">
                  Subject <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="subject"
                  value={template.subject}
                  onChange={(e) =>
                    setTemplate({ ...template, subject: e.target.value })
                  }
                  placeholder="Hello {{name}}"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use {'{'}
                  {'{'}name{'}'} {'}'}and {'{'}
                  {'{'}email{'}'} {'}'}for personalization
                </p>
              </div>

              {/* Format Toggle */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isHtml"
                  checked={template.isHtml}
                  onCheckedChange={(checked) =>
                    setTemplate({ ...template, isHtml: checked as boolean })
                  }
                />
                <Label htmlFor="isHtml" className="cursor-pointer">
                  HTML Format
                </Label>
              </div>

              {/* Body */}
              <div>
                <Label htmlFor="body">
                  Email Body <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="body"
                  value={template.body}
                  onChange={(e) =>
                    setTemplate({ ...template, body: e.target.value })
                  }
                  placeholder="Hi {{name}},&#10;&#10;Your email content here...&#10;&#10;Best regards,&#10;Fraterny Team"
                  className="min-h-[300px]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use {'{'}
                  {'{'}name{'}'} {'}'}and {'{'}
                  {'{'}email{'}'} {'}'}for personalization
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handlePreview}
                  variant="outline"
                  disabled={selectedUserIds.length === 0}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={sending || selectedUserIds.length === 0}
                  className="flex-1"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending {sendProgress.sent}/{sendProgress.total}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send to {selectedUserIds.length} Recipients
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Side - Recipients List */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Recipients
            </h2>

            {/* Filters */}
            <div className="space-y-4 mb-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fromDate">From Date</Label>
                  <Input
                    id="fromDate"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="toDate">To Date</Label>
                  <Input
                    id="toDate"
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={applyFilters} variant="outline" size="sm">
                  Apply Filters
                </Button>
                <Button onClick={handleResetFilters} variant="outline" size="sm">
                  Reset
                </Button>
              </div>
            </div>

            {/* User Count */}
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                Showing {filteredUsers.length} of {users.length} users
                {selectedUserIds.length > 0 && (
                  <span className="ml-2">
                    ({selectedUserIds.length} selected)
                  </span>
                )}
              </p>
            </div>

            {/* Selection Buttons */}
            <div className="flex gap-2 mb-4">
              <Button onClick={handleSelectAll} variant="outline" size="sm">
                Select All
              </Button>
              <Button onClick={handleDeselectAll} variant="outline" size="sm">
                Deselect All
              </Button>
              {selectedUserIds.length > 0 && (
                <Button onClick={handleClearSelection} variant="outline" size="sm">
                  Clear Selection
                </Button>
              )}
            </div>

            {/* Users List */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              {loading ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
                  <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-8 text-center">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400">No users found</p>
                </div>
              ) : (
                <div className="max-h-[600px] overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <Checkbox
                        id={`user-${user.id}`}
                        checked={selectedUserIds.includes(user.id)}
                        onCheckedChange={() => toggleSelectUser(user.id)}
                      />
                      <div className="flex-1 min-w-0">
                        {editingUserId === user.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveEditName(user.id);
                                if (e.key === 'Escape') handleCancelEditName();
                              }}
                              className="h-7 text-sm"
                              placeholder="Enter custom name"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveEditName(user.id);
                              }}
                              className="p-1 hover:bg-green-100 rounded"
                            >
                              <Check className="w-4 h-4 text-green-600" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelEditName();
                              }}
                              className="p-1 hover:bg-red-100 rounded"
                            >
                              <X className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {customNames[user.id] || user.name || 'No Name'}
                                {customNames[user.id] && (
                                  <span className="ml-1 text-xs text-blue-600">(custom)</span>
                                )}
                              </p>
                              {user.email_confirmed && (
                                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                              {user.email}
                            </p>
                          </div>
                        )}
                      </div>
                      {selectedUserIds.includes(user.id) && editingUserId !== user.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEditName(user);
                          }}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
                          title="Edit custom name for email"
                        >
                          <Pencil className="w-4 h-4 text-blue-600" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        {showPreview && firstSelectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Email Preview
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    To:
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {firstSelectedUser.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Subject:
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {replaceVariables(template.subject, firstSelectedUser)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Body:
                  </p>
                  {template.isHtml ? (
                    <div
                      className="text-sm text-gray-900 dark:text-white p-4 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700"
                      dangerouslySetInnerHTML={{
                        __html: replaceVariables(template.body, firstSelectedUser),
                      }}
                    />
                  ) : (
                    <pre className="text-sm text-gray-900 dark:text-white p-4 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 whitespace-pre-wrap">
                      {replaceVariables(template.body, firstSelectedUser)}
                    </pre>
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setShowPreview(false)}>Close</Button>
              </div>
            </div>
          </div>
        )}

        {/* Results Modal */}
        {showResults && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Send Results
              </h3>
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Successfully sent:{' '}
                  <span className="font-semibold text-green-600">
                    {sendResults.filter((r) => r.success).length}
                  </span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Failed:{' '}
                  <span className="font-semibold text-red-600">
                    {sendResults.filter((r) => !r.success).length}
                  </span>
                </p>
              </div>

              {sendResults.filter((r) => !r.success).length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Failed Emails:
                  </p>
                  <div className="space-y-2">
                    {sendResults
                      .filter((r) => !r.success)
                      .map((result, index) => (
                        <div
                          key={index}
                          className="p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800"
                        >
                          <p className="text-sm font-medium text-red-900 dark:text-red-200">
                            {result.email}
                          </p>
                          <p className="text-xs text-red-700 dark:text-red-300">
                            {result.error}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <Button onClick={() => setShowResults(false)}>Close</Button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default BulkEmailsPage;
