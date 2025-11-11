'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Mail,
  Plus,
  RefreshCw,
  Shield,
  AlertTriangle,
  CheckCircle,
  X,
  Trash2,
  UserCheck,
  UserX
} from 'lucide-react';
import { toast } from 'sonner';

interface AdminEmailData {
  id: number;
  email: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminEmailManagement() {
  // State
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [adminEmails, setAdminEmails] = useState<AdminEmailData[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [newEmail, setNewEmail] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Fetch admin emails
  const fetchAdminEmailsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/emails');
      
      if (!response.ok) {
        throw new Error('Failed to fetch admin emails');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setAdminEmails(result.data);
      } else {
        setError(result.error || 'Failed to load admin emails');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      toast.error('Failed to load admin emails');
    } finally {
      setLoading(false);
    }
  };

  // Add new admin email
  const handleAddEmail = async () => {
    if (!newEmail.trim()) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      toast.error('Please enter a valid email address');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/admin/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newEmail.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to add admin email');
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success('Admin email added successfully');
        setNewEmail('');
        setShowAddForm(false);
        await fetchAdminEmailsData();
      } else {
        toast.error(result.error || 'Failed to add admin email');
      }
    } catch (err: any) {
      toast.error('Failed to add admin email');
    } finally {
      setSaving(false);
    }
  };

  // Toggle admin email status
  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/emails/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update admin email');
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success(`Admin email ${!currentStatus ? 'activated' : 'deactivated'}`);
        await fetchAdminEmailsData();
      } else {
        toast.error(result.error || 'Failed to update admin email');
      }
    } catch (err: any) {
      toast.error('Failed to update admin email');
    }
  };

  // Delete admin email
  const handleDeleteEmail = async (id: number, email: string) => {
    if (!confirm(`Are you sure you want to delete admin email: ${email}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/emails/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete admin email');
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success('Admin email deleted successfully');
        await fetchAdminEmailsData();
      } else {
        toast.error(result.error || 'Failed to delete admin email');
      }
    } catch (err: any) {
      toast.error('Failed to delete admin email');
    }
  };

  // Initialize data
  useEffect(() => {
    fetchAdminEmailsData();
  }, []);

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Admin Email Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage admin email addresses for system access
            </p>
          </div>
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

      {/* Admin Emails List */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Admin Emails</h2>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              size="sm"
              className="flex items-center gap-2"
            >
              {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showAddForm ? 'Cancel' : 'Add Email'}
            </Button>
          </div>
        </div>

        {/* Add Email Form */}
        {showAddForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <h3 className="text-md font-medium text-gray-900 mb-3">Add New Admin Email</h3>
            <div className="flex gap-2">
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter admin email address"
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleAddEmail()}
              />
              <Button 
                onClick={handleAddEmail}
                disabled={saving || !newEmail.trim()}
                className="flex items-center gap-2"
              >
                {saving ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading admin emails...</span>
          </div>
        ) : adminEmails.length === 0 ? (
          <div className="text-center py-8">
            <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No admin emails found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {adminEmails.map((adminEmail) => (
              <div 
                key={adminEmail.id} 
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  adminEmail.is_active ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {adminEmail.is_active ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <X className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {adminEmail.email}
                    </div>
                    <div className="text-sm text-gray-500">
                      Added: {new Date(adminEmail.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    adminEmail.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {adminEmail.is_active ? 'Active' : 'Inactive'}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(adminEmail.id, adminEmail.is_active)}
                    className="flex items-center gap-1"
                  >
                    {adminEmail.is_active ? (
                      <>
                        <UserX className="h-4 w-4" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4" />
                        Activate
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteEmail(adminEmail.id, adminEmail.email)}
                    className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">About Admin Emails</h3>
            <p className="text-sm text-blue-800 mt-1">
              Only users with active admin email addresses can access admin features. 
              Deactivating an email will immediately revoke admin access for that user.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
