'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  RefreshCw, 
  Send, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Eye,
  Code,
  FileText,
  Pencil,
  Check,
  X,
  Save,
  FolderOpen,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

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

interface SavedTemplate {
  id: string;
  name: string;
  from_name: string;
  reply_to: string;
  subject: string;
  body: string;
  is_html: boolean;
  created_at: string;
}

interface SendResult {
  email: string;
  success: boolean;
  error?: string;
}

const AdminBulkEmailManagement: React.FC = () => {
  // State for users
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [allUsers, setAllUsers] = useState<AuthUser[]>([]); // Store all users for filtering
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Selection state
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  
  // Custom names for users (overrides)
  const [customNames, setCustomNames] = useState<Record<string, string>>({});
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  
  // Email template state
  const [template, setTemplate] = useState<EmailTemplate>({
    fromName: 'Fraterny Team',
    replyTo: '',
    subject: '',
    body: '',
    isHtml: false,
  });
  
  // Sending state
  const [sending, setSending] = useState(false);
  const [sendProgress, setSendProgress] = useState({ sent: 0, total: 0 });
  const [showResults, setShowResults] = useState(false);
  const [sendResults, setSendResults] = useState<any>(null);
  
  // Preview state
  const [showPreview, setShowPreview] = useState(false);
  const [previewUser, setPreviewUser] = useState<AuthUser | null>(null);
  
  // Template management state
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [templateName, setTemplateName] = useState('');

  // Fetch auth users
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Dynamically import supabase to avoid build-time errors
      const { supabase } = await import('@/lib/supabase');
      
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
        setAllUsers(data.data.users);
        applyFilters(data.data.users);
      } else {
        throw new Error(data.error || 'Failed to fetch users');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      toast.error('Error loading users', {
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Apply date filters
  const applyFilters = (userList: AuthUser[] = allUsers) => {
    let filtered = [...userList];

    // Filter by date range
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter(user => new Date(user.created_at) >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999); // Include entire end date
      filtered = filtered.filter(user => new Date(user.created_at) <= toDate);
    }

    setUsers(filtered);
    
    // Clear selections when filters change
    setSelectedUserIds([]);
    setIsAllSelected(false);
  };

  // Handle filter changes
  const handleFilterChange = () => {
    applyFilters();
  };

  // Reset filters
  const resetFilters = () => {
    setDateFrom('');
    setDateTo('');
    applyFilters(allUsers);
    toast.success('Filters reset');
  };

  // Initialize
  useEffect(() => {
    fetchUsers();
    fetchTemplates();
  }, []);
  
  // Fetch saved templates
  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/email-templates');
      const data = await response.json();
      if (data.success) {
        setSavedTemplates(data.data);
      }
    } catch (error: any) {
      console.error('Error fetching templates:', error);
    }
  };
  
  // Save template
  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }
    
    if (!template.fromName || !template.replyTo || !template.subject || !template.body) {
      toast.error('Please fill in all template fields');
      return;
    }
    
    try {
      const response = await fetch('/api/admin/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateName,
          from_name: template.fromName,
          reply_to: template.replyTo,
          subject: template.subject,
          body: template.body,
          is_html: template.isHtml,
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('Template saved successfully!');
        setShowSaveModal(false);
        setTemplateName('');
        fetchTemplates();
      } else {
        toast.error(data.error || 'Failed to save template');
      }
    } catch (error: any) {
      toast.error('Failed to save template');
    }
  };
  
  // Load template
  const handleLoadTemplate = (savedTemplate: SavedTemplate) => {
    setTemplate({
      fromName: savedTemplate.from_name,
      replyTo: savedTemplate.reply_to,
      subject: savedTemplate.subject,
      body: savedTemplate.body,
      isHtml: savedTemplate.is_html,
    });
    setShowLoadModal(false);
    toast.success('Template loaded!');
  };
  
  // Delete template
  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    try {
      const response = await fetch(`/api/admin/email-templates?id=${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      if (data.success) {
        toast.success('Template deleted');
        fetchTemplates();
      } else {
        toast.error(data.error || 'Failed to delete template');
      }
    } catch (error: any) {
      toast.error('Failed to delete template');
    }
  };

  // Selection handlers
  const handleSelectUser = (userId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedUserIds(prev => [...prev, userId]);
    } else {
      setSelectedUserIds(prev => prev.filter(id => id !== userId));
      setIsAllSelected(false);
    }
  };

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedUserIds([]);
      setIsAllSelected(false);
    } else {
      setSelectedUserIds(users.map(u => u.id));
      setIsAllSelected(true);
    }
  };

  const handleClearSelection = () => {
    setSelectedUserIds([]);
    setIsAllSelected(false);
  };

  // Get selected users
  const selectedUsers = users.filter(u => selectedUserIds.includes(u.id));

  // Template variable replacement for preview
  const replaceVariables = (text: string, user: AuthUser) => {
    const displayName = customNames[user.id] || user.name || user.email;
    return text
      .replace(/\{\{\s*name\s*\}\}/gi, displayName)
      .replace(/\{\{\s*email\s*\}\}/gi, user.email);
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

  // Preview handler
  const handlePreview = () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one recipient');
      return;
    }
    setPreviewUser(selectedUsers[0]);
    setShowPreview(true);
  };

  // Send emails handler
  const handleSendEmails = async () => {
    // Validation
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one recipient');
      return;
    }

    if (!template.subject.trim()) {
      toast.error('Please enter an email subject');
      return;
    }

    if (!template.body.trim()) {
      toast.error('Please enter email content');
      return;
    }

    if (!template.replyTo.trim() || !template.replyTo.includes('@')) {
      toast.error('Please enter a valid reply-to email address');
      return;
    }

    // Confirm
    const confirmed = window.confirm(
      `Are you sure you want to send this email to ${selectedUsers.length} recipient(s)?`
    );

    if (!confirmed) return;

    setSending(true);
    setSendProgress({ sent: 0, total: selectedUsers.length });
    setShowResults(false);

    try {
      const recipients = selectedUsers.map(u => ({
        email: u.email,
        name: customNames[u.id] || u.name || u.email,
      }));

      // Dynamically import supabase to avoid build-time errors
      const { supabase } = await import('@/lib/supabase');
      
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
        setSendResults(data.data);
        setShowResults(true);
        
        if (data.data.totalFailed === 0) {
          toast.success(`Successfully sent ${data.data.totalSent} emails!`);
        } else {
          toast.warning(`Sent ${data.data.totalSent} emails, ${data.data.totalFailed} failed`);
        }
      } else {
        throw new Error(data.error || 'Failed to send emails');
      }
    } catch (error: any) {
      toast.error('Failed to send emails', {
        description: error.message
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-8 mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Mail className="h-8 w-8" />
              Bulk Email Management
            </h1>
            <p className="text-gray-600 mt-1">
              Send personalized emails to authenticated users
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={fetchUsers}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Users
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Email Template */}
        <div className="space-y-6">
          {/* Template Form */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Email Template</h2>
            
            <div className="space-y-4">
              {/* From Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Name
                </label>
                <Input
                  value={template.fromName}
                  onChange={(e) => setTemplate({ ...template, fromName: e.target.value })}
                  placeholder="e.g., Fraterny Team"
                />
              </div>

              {/* Reply-To Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reply-To Email <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={template.replyTo}
                  onChange={(e) => setTemplate({ ...template, replyTo: e.target.value })}
                  placeholder="support@fraterny.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Users' replies will be sent to this email address
                </p>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <Input
                  value={template.subject}
                  onChange={(e) => setTemplate({ ...template, subject: e.target.value })}
                  placeholder="e.g., Welcome to Fraterny, {{name}}!"
                />
              </div>

              {/* Template Type Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Format
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={!template.isHtml ? 'default' : 'outline'}
                    onClick={() => setTemplate({ ...template, isHtml: false })}
                    className="flex-1"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Plain Text
                  </Button>
                  <Button
                    variant={template.isHtml ? 'default' : 'outline'}
                    onClick={() => setTemplate({ ...template, isHtml: true })}
                    className="flex-1"
                  >
                    <Code className="h-4 w-4 mr-2" />
                    HTML
                  </Button>
                </div>
              </div>

              {/* Email Body */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Content <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={template.body}
                  onChange={(e) => setTemplate({ ...template, body: e.target.value })}
                  placeholder={template.isHtml 
                    ? "Enter HTML content...\n\nExample:\n<h1>Hello {{name}}!</h1>\n<p>Welcome to our platform.</p>"
                    : "Enter plain text...\n\nExample:\nHello {{name}}!\n\nWelcome to our platform."
                  }
                  rows={12}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available variables: <code className="bg-gray-100 px-1 rounded">{'{{name}}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{{email}}'}</code>
                </p>
              </div>

              {/* Template Management Buttons */}
              <div className="flex gap-2 mb-2">
                <Button
                  onClick={() => setShowSaveModal(true)}
                  variant="outline"
                  disabled={!template.fromName || !template.replyTo || !template.subject || !template.body}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Template
                </Button>
                <Button
                  onClick={() => setShowLoadModal(true)}
                  variant="outline"
                  className="flex-1"
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Load Template
                </Button>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handlePreview}
                  variant="outline"
                  disabled={!template.subject || !template.body || selectedUsers.length === 0}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button
                  onClick={handleSendEmails}
                  disabled={sending || !template.subject || !template.body || !template.replyTo || selectedUsers.length === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {sending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Sending... ({sendProgress.sent}/{sendProgress.total})
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send to {selectedUsers.length} Users
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Send Results */}
          {showResults && sendResults && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Send Results</h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900">Successfully Sent</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">{sendResults.totalSent}</span>
                </div>
                
                {sendResults.totalFailed > 0 && (
                  <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-red-900">Failed</span>
                    </div>
                    <span className="text-2xl font-bold text-red-600">{sendResults.totalFailed}</span>
                  </div>
                )}

                {sendResults.results?.filter((r: any) => !r.success).length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Failed Emails:</h3>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {sendResults.results
                        .filter((r: any) => !r.success)
                        .map((result: any, index: number) => (
                          <div key={index} className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                            {result.email}: {result.error}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Recipients */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {/* Date Filters */}
          <div className="mb-4 pb-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Filter by Registration Date</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  From Date
                </label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  To Date
                </label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                onClick={handleFilterChange}
                size="sm"
                className="flex-1"
              >
                Apply Filters
              </Button>
              <Button
                onClick={resetFilters}
                variant="outline"
                size="sm"
                className="flex-1"
                disabled={!dateFrom && !dateTo}
              >
                Reset
              </Button>
            </div>
            {(dateFrom || dateTo) && (
              <p className="text-xs text-blue-600 mt-2">
                Showing {users.length} of {allUsers.length} users
              </p>
            )}
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Recipients ({users.length})
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={loading || users.length === 0}
              >
                {isAllSelected ? 'Deselect All' : 'Select All'}
              </Button>
              {selectedUserIds.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearSelection}
                >
                  Clear ({selectedUserIds.length})
                </Button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-3 text-gray-600">Loading users...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                    selectedUserIds.includes(user.id)
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(user.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSelectUser(user.id, e.target.checked);
                    }}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  {editingUserId === user.id ? (
                    <div className="flex-1 flex items-center gap-2">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEditName(user.id);
                          if (e.key === 'Escape') handleCancelEditName();
                        }}
                        className="h-8 text-sm"
                        placeholder="Enter custom name"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveEditName(user.id);
                        }}
                        className="p-1.5 hover:bg-green-100 rounded transition-colors"
                      >
                        <Check className="w-4 h-4 text-green-600" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelEditName();
                        }}
                        className="p-1.5 hover:bg-red-100 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {customNames[user.id] || user.name || user.email}
                          {customNames[user.id] && (
                            <span className="ml-1.5 text-xs text-blue-600 font-normal">(custom)</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 truncate">{user.email}</div>
                      </div>
                      {user.email_confirmed && (
                        <span title="Email verified">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        </span>
                      )}
                      {selectedUserIds.includes(user.id) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEditName(user);
                          }}
                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors flex-shrink-0"
                          title="Edit custom name for email"
                        >
                          <Pencil className="w-4 h-4 text-blue-600" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && previewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Email Preview</h3>
                <button onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-semibold">
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Preview for: {previewUser.name || previewUser.email} ({previewUser.email})
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">From:</label>
                <div className="text-gray-900">{template.fromName}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Reply-To:</label>
                <div className="text-gray-900">{template.replyTo}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Subject:</label>
                <div className="text-gray-900">{replaceVariables(template.subject, previewUser)}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Body:</label>
                <div className="border border-gray-200 rounded p-4 bg-gray-50">
                  {template.isHtml ? (
                    <div dangerouslySetInnerHTML={{ __html: replaceVariables(template.body, previewUser) }} />
                  ) : (
                    <pre className="whitespace-pre-wrap font-sans text-gray-900">{replaceVariables(template.body, previewUser)}</pre>
                  )}
                </div>
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
              <Button onClick={() => setShowPreview(false)} className="w-full">
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Save Template Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Save Template</h3>
                <button onClick={() => setShowSaveModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">
                  ×
                </button>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name
                </label>
                <Input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Welcome Email"
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveTemplate()}
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={() => setShowSaveModal(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSaveTemplate} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Load Template Modal */}
      {showLoadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh]">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Load Template</h3>
                <button onClick={() => setShowLoadModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {savedTemplates.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No saved templates</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedTemplates.map((tmpl) => (
                    <div key={tmpl.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{tmpl.name}</h4>
                          <p className="text-sm text-gray-600 mb-1">Subject: {tmpl.subject}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>From: {tmpl.from_name}</span>
                            <span>•</span>
                            <span>{tmpl.is_html ? 'HTML' : 'Plain Text'}</span>
                            <span>•</span>
                            <span>{new Date(tmpl.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            onClick={() => handleLoadTemplate(tmpl)}
                            size="sm"
                            variant="outline"
                          >
                            <FolderOpen className="h-4 w-4 mr-1" />
                            Load
                          </Button>
                          <Button
                            onClick={() => handleDeleteTemplate(tmpl.id)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t">
              <Button onClick={() => setShowLoadModal(false)} variant="outline" className="w-full">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBulkEmailManagement;
