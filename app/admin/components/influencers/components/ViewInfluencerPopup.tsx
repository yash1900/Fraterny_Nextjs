'use client';

import React, { useState, useEffect } from 'react';
import { X, Edit2, Save, User, TrendingUp, MousePointer, DollarSign, Users, Upload, Plus, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

// Types
interface SocialLinks {
  instagram?: string;
  twitter?: string;
  youtube?: string;
  linkedin?: string;
}

interface PaymentInfo {
  bank_name?: string;
  account_number?: string;
  ifsc?: string;
  upi?: string;
}

export interface InfluencerData {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  profile_image?: string | null;
  bio?: string | null;
  social_links?: SocialLinks | null;
  affiliate_code: string;
  commission_rate: number;
  status: 'active' | 'inactive' | 'suspended';
  total_earnings: number;
  remaining_balance: number;
  total_paid: number;
  payment_info?: PaymentInfo | null;
  created_at: string;
  updated_at: string;
  last_activity_at?: string | null;
}

interface PayoutRecord {
  id: string;
  influencer_id: string;
  amount: number;
  payout_date: string | null;
  payout_method: 'bank_transfer' | 'upi' | 'paypal' | null;
  transaction_id: string | null;
  status: 'pending' | 'completed' | 'failed';
  notes: string | null;
  created_at: string;
  processed_by?: string | null;
}

interface ViewInfluencerPopupProps {
  isOpen: boolean;
  influencer: InfluencerData;
  onClose: () => void;
  onUpdate: () => void;
}

const ViewInfluencerPopup: React.FC<ViewInfluencerPopupProps> = ({ isOpen, influencer, onClose, onUpdate }) => {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [liveStats, setLiveStats] = useState<{ totalClicks: number; totalSignups: number; totalQuestionnaires: number; totalPurchases: number; conversionRate: number } | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [exchangeRate, setExchangeRate] = useState<number>(83.50);
  
  // Payout states
  const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
  const [payoutsLoading, setPayoutsLoading] = useState(false);
  const [showPayoutDialog, setShowPayoutDialog] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState<'bank_transfer' | 'upi' | 'paypal'>('bank_transfer');
  const [payoutInitialNote, setPayoutInitialNote] = useState('Your payout is initiated');
  const [processingPayout, setProcessingPayout] = useState(false);
  
  // Mark as paid/failed dialog states
  const [showMarkPaidDialog, setShowMarkPaidDialog] = useState(false);
  const [showMarkFailedDialog, setShowMarkFailedDialog] = useState(false);
  const [selectedPayoutId, setSelectedPayoutId] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [completionNote, setCompletionNote] = useState('Your payment is transferred successfully');
  const [failureReason, setFailureReason] = useState('');
  
  const [hasImageFailed, setHasImageFailed] = useState(false);
  
  // Form states
  const [name, setName] = useState(influencer.name);
  const [email, setEmail] = useState(influencer.email);
  const [phone, setPhone] = useState(influencer.phone || '');
  const [commissionRate, setCommissionRate] = useState(influencer.commission_rate);
  const [status, setStatus] = useState(influencer.status);
  const [bio, setBio] = useState(influencer.bio || '');
  const [profileImagePreview, setProfileImagePreview] = useState(influencer.profile_image || '');
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  
  // Social links
  const [instagram, setInstagram] = useState(influencer.social_links?.instagram || '');
  const [twitter, setTwitter] = useState(influencer.social_links?.twitter || '');
  const [youtube, setYoutube] = useState(influencer.social_links?.youtube || '');
  const [linkedin, setLinkedin] = useState(influencer.social_links?.linkedin || '');
  
  // Payment info
  const [bankName, setBankName] = useState(influencer.payment_info?.bank_name || '');
  const [accountNumber, setAccountNumber] = useState(influencer.payment_info?.account_number || '');
  const [ifsc, setIfsc] = useState(influencer.payment_info?.ifsc || '');
  const [upi, setUpi] = useState(influencer.payment_info?.upi || '');

  // Fetch exchange rate
  useEffect(() => {
    const fetchRate = async () => {
      try {
        const response = await fetch('/api/commission?operation=exchange-rate');
        const result = await response.json();
        if (result.success && result.data) {
          setExchangeRate(result.data.rate);
        }
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
      }
    };
    fetchRate();
  }, []);

  // Fetch live stats
  useEffect(() => {
    const fetchLiveStats = async () => {
      setStatsLoading(true);
      try {
        const response = await fetch(`/api/influencer/dashboard?affiliateCode=${influencer.affiliate_code}&type=stats`);
        const result = await response.json();
        if (result.success && result.data) {
          setLiveStats({
            totalClicks: result.data.totalClicks,
            totalSignups: result.data.totalSignups,
            totalQuestionnaires: result.data.totalQuestionnaires || 0,
            totalPurchases: result.data.totalPurchases,
            conversionRate: result.data.conversionRate,
          });
        }
      } catch (error) {
        console.error('Error fetching live stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchLiveStats();
  }, [influencer.affiliate_code]);

  // Fetch payouts
  useEffect(() => {
    const fetchPayouts = async () => {
      setPayoutsLoading(true);
      try {
        const response = await fetch(`/api/admin/influencers/${influencer.id}/payouts`);
        const result = await response.json();
        if (result.success && result.data) {
          setPayouts(result.data);
        }
      } catch (error) {
        console.error('Error fetching payouts:', error);
      } finally {
        setPayoutsLoading(false);
      }
    };

    fetchPayouts();
  }, [influencer.id]);

  // Update form when influencer changes
  useEffect(() => {
    setName(influencer.name);
    setEmail(influencer.email);
    setPhone(influencer.phone || '');
    setCommissionRate(influencer.commission_rate);
    setStatus(influencer.status);
    setBio(influencer.bio || '');
    setProfileImagePreview(influencer.profile_image || '');
    setInstagram(influencer.social_links?.instagram || '');
    setTwitter(influencer.social_links?.twitter || '');
    setYoutube(influencer.social_links?.youtube || '');
    setLinkedin(influencer.social_links?.linkedin || '');
    setBankName(influencer.payment_info?.bank_name || '');
    setAccountNumber(influencer.payment_info?.account_number || '');
    setIfsc(influencer.payment_info?.ifsc || '');
    setUpi(influencer.payment_info?.upi || '');
    setHasImageFailed(false);
  }, [influencer]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setProfileImageFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }
    if (commissionRate < 0 || commissionRate > 100) {
      toast.error('Commission rate must be between 0 and 100');
      return;
    }

    setLoading(true);

    try {
      let uploadedImageUrl = profileImagePreview;

      // Upload new image if selected
      if (profileImageFile) {
        setImageUploading(true);
        const formData = new FormData();
        formData.append('file', profileImageFile);
        formData.append('folder', 'influencer-profiles');

        const uploadResponse = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadResponse.json();
        if (uploadData.success && uploadData.data?.path) {
          uploadedImageUrl = uploadData.data.path;
        }
        setImageUploading(false);
      }

      // Build social links
      const socialLinks: SocialLinks = {};
      if (instagram) socialLinks.instagram = instagram;
      if (twitter) socialLinks.twitter = twitter;
      if (youtube) socialLinks.youtube = youtube;
      if (linkedin) socialLinks.linkedin = linkedin;

      // Build payment info
      const paymentInfo: PaymentInfo = {};
      if (bankName) paymentInfo.bank_name = bankName;
      if (accountNumber) paymentInfo.account_number = accountNumber;
      if (ifsc) paymentInfo.ifsc = ifsc;
      if (upi) paymentInfo.upi = upi;

      // Update influencer
      const response = await fetch(`/api/admin/influencers/${influencer.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          commission_rate: commissionRate,
          status,
          bio: bio.trim() || undefined,
          profile_image: uploadedImageUrl || undefined,
          social_links: Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
          payment_info: Object.keys(paymentInfo).length > 0 ? paymentInfo : undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Influencer updated successfully!');
        setEditMode(false);
        onUpdate();
      } else {
        toast.error(result.error || 'Failed to update influencer');
      }
    } catch (error: any) {
      console.error('Error updating influencer:', error);
      toast.error(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
      setImageUploading(false);
    }
  };

  const convertUSDtoINR = (amountInUSD: number): number => {
    return amountInUSD * exchangeRate;
  };

  const formatCurrency = (amountInUSD: number) => {
    const amountInINR = convertUSDtoINR(amountInUSD);
    return `₹${amountInINR.toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPayoutStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'failed':
        return { color: 'bg-red-100 text-red-800', icon: XCircle };
      case 'pending':
      default:
        return { color: 'bg-yellow-100 text-yellow-800', icon: Clock };
    }
  };

  const handleCreatePayout = async () => {
    const amount = parseFloat(payoutAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setProcessingPayout(true);
    try {
      const initialNote = {
        message: payoutInitialNote.trim() || 'Your payout is initiated',
        timestamp: new Date().toISOString()
      };
      
      const response = await fetch(`/api/admin/influencers/${influencer.id}/payouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          payout_method: payoutMethod,
          notes: JSON.stringify([initialNote]),
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Payout created successfully');
        setShowPayoutDialog(false);
        setPayoutAmount('');
        setPayoutInitialNote('Your payout is initiated');
        
        // Refresh payouts
        const payoutsResponse = await fetch(`/api/admin/influencers/${influencer.id}/payouts`);
        const payoutsResult = await payoutsResponse.json();
        if (payoutsResult.success && payoutsResult.data) {
          setPayouts(payoutsResult.data);
        }
      } else {
        toast.error(result.error || 'Failed to create payout');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setProcessingPayout(false);
    }
  };

  const openMarkPaidDialog = (payoutId: string) => {
    setSelectedPayoutId(payoutId);
    setTransactionId('');
    setCompletionNote('Your payment is transferred successfully');
    setShowMarkPaidDialog(true);
  };

  const openMarkFailedDialog = (payoutId: string) => {
    setSelectedPayoutId(payoutId);
    setFailureReason('');
    setShowMarkFailedDialog(true);
  };

  const handleMarkAsPaid = async () => {
    if (!transactionId.trim()) {
      toast.error('Transaction ID is required');
      return;
    }
    if (!selectedPayoutId) return;

    setProcessingPayout(true);
    try {
      const currentPayout = payouts.find(p => p.id === selectedPayoutId);
      let existingNotes = [];
      try {
        existingNotes = currentPayout?.notes ? JSON.parse(currentPayout.notes as any) : [];
      } catch {
        existingNotes = [];
      }

      const newNote = {
        message: completionNote,
        timestamp: new Date().toISOString(),
        transaction_id: transactionId
      };
      const updatedNotes = [...existingNotes, newNote];

      const response = await fetch(`/api/admin/influencers/payouts/${selectedPayoutId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          transaction_id: transactionId,
          notes: JSON.stringify(updatedNotes),
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Payout marked as paid');
        setShowMarkPaidDialog(false);
        
        // Refresh payouts
        const payoutsResponse = await fetch(`/api/admin/influencers/${influencer.id}/payouts`);
        const payoutsResult = await payoutsResponse.json();
        if (payoutsResult.success && payoutsResult.data) {
          setPayouts(payoutsResult.data);
        }
        onUpdate();
      } else {
        toast.error(result.error || 'Failed to mark as paid');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setProcessingPayout(false);
    }
  };

  const handleMarkAsFailed = async () => {
    if (!failureReason.trim()) {
      toast.error('Please provide a reason for failure');
      return;
    }
    if (!selectedPayoutId) return;

    setProcessingPayout(true);
    try {
      const currentPayout = payouts.find(p => p.id === selectedPayoutId);
      let existingNotes = [];
      try {
        existingNotes = currentPayout?.notes ? JSON.parse(currentPayout.notes as any) : [];
      } catch {
        existingNotes = [];
      }

      const newNote = {
        message: failureReason,
        timestamp: new Date().toISOString(),
        type: 'failure'
      };
      const updatedNotes = [...existingNotes, newNote];

      const response = await fetch(`/api/admin/influencers/payouts/${selectedPayoutId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'failed',
          notes: JSON.stringify(updatedNotes),
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Payout marked as failed');
        setShowMarkFailedDialog(false);
        
        // Refresh payouts
        const payoutsResponse = await fetch(`/api/admin/influencers/${influencer.id}/payouts`);
        const payoutsResult = await payoutsResponse.json();
        if (payoutsResult.success && payoutsResult.data) {
          setPayouts(payoutsResult.data);
        }
        onUpdate();
      } else {
        toast.error(result.error || 'Failed to mark as failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setProcessingPayout(false);
    }
  };

  const handleImageError = () => {
    setHasImageFailed(true);
  };

  const getProfileImageUrl = (storagePath: string | null): string | null => {
    if (!storagePath) return null;
    if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) return storagePath;
    if (storagePath.startsWith('data:')) return storagePath;
    const { data } = supabase.storage.from('website-images').getPublicUrl(storagePath);
    return data?.publicUrl || null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">Influencer Profile</h2>
            <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(editMode ? status : influencer.status)}`}>
              {editMode ? status : influencer.status}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={loading || imageUploading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <Save className="h-4 w-4" />
                {loading ? (imageUploading ? 'Uploading...' : 'Saving...') : 'Save'}
              </button>
            )}
            <button
              onClick={editMode ? () => setEditMode(false) : onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content - Continue in next message due to length... */}
        <div className="p-6 space-y-6">
          {/* Profile Section */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Profile Image */}
            <div className="relative">
              {profileImagePreview && getProfileImageUrl(profileImagePreview) && !hasImageFailed ? (
                <img
                  src={getProfileImageUrl(profileImagePreview)!}
                  alt={name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                  onError={handleImageError}
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center border-4 border-white shadow-lg text-white font-bold text-4xl">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
              {editMode && (
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors z-10">
                  <Upload className="h-4 w-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={imageUploading}
                  />
                </label>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1 space-y-4">
              {editMode ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Commission Rate (%)</label>
                    <input
                      type="number"
                      value={commissionRate}
                      onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-gray-900">{influencer.name}</h3>
                  <p className="text-gray-600">{influencer.email}</p>
                  {influencer.phone && <p className="text-gray-600">{influencer.phone}</p>}
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-sm text-gray-500">
                      Code: <span className="font-mono font-semibold text-gray-900">{influencer.affiliate_code}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Commission: <span className="font-semibold text-gray-900">{influencer.commission_rate}%</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                {editMode ? (
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                ) : (
                  <p className="text-gray-600 text-sm">{influencer.bio || 'No bio provided'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Questionnaires</span>
                <MousePointer className="h-4 w-4 text-blue-600" />
              </div>
              {statsLoading ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">{liveStats?.totalQuestionnaires?.toLocaleString() || 0}</p>
              )}
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Signups</span>
                <Users className="h-4 w-4 text-green-600" />
              </div>
              {statsLoading ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">{liveStats?.totalSignups.toLocaleString() || 0}</p>
              )}
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Purchases</span>
                <DollarSign className="h-4 w-4 text-purple-600" />
              </div>
              {statsLoading ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">{liveStats?.totalPurchases.toLocaleString() || 0}</p>
              )}
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Conversion</span>
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </div>
              {statsLoading ? (
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">{liveStats?.conversionRate.toFixed(2) || 0}%</p>
              )}
            </div>
          </div>

          {/* Earnings Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
              <p className="text-sm opacity-90 mb-1">Total Earnings</p>
              <p className="text-3xl font-bold">{formatCurrency(influencer.total_earnings)}</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
              <p className="text-sm opacity-90 mb-1">Remaining Balance</p>
              <p className="text-3xl font-bold">{formatCurrency(influencer.remaining_balance)}</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
              <p className="text-sm opacity-90 mb-1">Total Paid</p>
              <p className="text-3xl font-bold">{formatCurrency(influencer.total_paid)}</p>
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Social Media</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {editMode ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                    <input
                      type="url"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      placeholder="https://instagram.com/username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                    <input
                      type="url"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      placeholder="https://twitter.com/username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">YouTube</label>
                    <input
                      type="url"
                      value={youtube}
                      onChange={(e) => setYoutube(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      placeholder="https://youtube.com/@username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                    <input
                      type="url"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                </>
              ) : (
                <div className="col-span-2 space-y-2">
                  {influencer.social_links?.instagram && (
                    <a href={influencer.social_links.instagram} target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline text-sm">
                      Instagram: {influencer.social_links.instagram}
                    </a>
                  )}
                  {influencer.social_links?.twitter && (
                    <a href={influencer.social_links.twitter} target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline text-sm">
                      Twitter: {influencer.social_links.twitter}
                    </a>
                  )}
                  {influencer.social_links?.youtube && (
                    <a href={influencer.social_links.youtube} target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline text-sm">
                      YouTube: {influencer.social_links.youtube}
                    </a>
                  )}
                  {influencer.social_links?.linkedin && (
                    <a href={influencer.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:underline text-sm">
                      LinkedIn: {influencer.social_links.linkedin}
                    </a>
                  )}
                  {!influencer.social_links && <p className="text-gray-500 text-sm">No social links added</p>}
                </div>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Information</h3>
            {editMode ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                  <input
                    type="text"
                    value={ifsc}
                    onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID</label>
                  <input
                    type="text"
                    value={upi}
                    onChange={(e) => setUpi(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {influencer.payment_info?.bank_name && (
                  <p className="text-sm"><span className="font-medium">Bank:</span> {influencer.payment_info.bank_name}</p>
                )}
                {influencer.payment_info?.account_number && (
                  <p className="text-sm"><span className="font-medium">Account:</span> ****{influencer.payment_info.account_number.slice(-4)}</p>
                )}
                {influencer.payment_info?.ifsc && (
                  <p className="text-sm"><span className="font-medium">IFSC:</span> {influencer.payment_info.ifsc}</p>
                )}
                {influencer.payment_info?.upi && (
                  <p className="text-sm"><span className="font-medium">UPI:</span> {influencer.payment_info.upi}</p>
                )}
                {!influencer.payment_info && <p className="text-gray-500 text-sm">No payment information added</p>}
              </div>
            )}
          </div>

          {/* Payout History - Due to character limit, will continue this in the updated file... */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Payout History</h3>
              <button
                onClick={() => setShowPayoutDialog(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <Plus className="h-4 w-4" />
                New Payout
              </button>
            </div>

            {payoutsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : payouts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No payout history yet
              </div>
            ) : (
              <div className="space-y-3">
                {payouts.map((payout) => {
                  const statusBadge = getPayoutStatusBadge(payout.status);
                  const StatusIcon = statusBadge.icon;
                  return (
                    <div key={payout.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg font-bold text-gray-900">{formatCurrency(payout.amount)}</span>
                            <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${statusBadge.color}`}>
                              <StatusIcon className="h-3 w-3" />
                              {payout.status}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p className='uppercase'><span className="font-medium">Method:</span> {payout.payout_method?.replace('_', ' ') || 'N/A'}</p>
                            {payout.transaction_id && (
                              <p><span className="font-medium">Transaction ID:</span> {payout.transaction_id}</p>
                            )}
                            {payout.notes && (() => {
                              try {
                                const notesArray = typeof payout.notes === 'string' ? JSON.parse(payout.notes) : payout.notes;
                                if (Array.isArray(notesArray) && notesArray.length > 0) {
                                  return (
                                    <div className="mt-2">
                                      <p className="font-medium text-xs text-gray-700 mb-1">History:</p>
                                      <div className="space-y-1">
                                        {notesArray.map((note: any, idx: number) => (
                                          <div key={idx} className="text-xs bg-gray-50 p-2 rounded">
                                            <p className="text-gray-800">{note.message}</p>
                                            {note.transaction_id && (
                                              <p className="text-gray-600">TXN: {note.transaction_id}</p>
                                            )}
                                            <p className="text-gray-500 text-[10px]">
                                              {new Date(note.timestamp).toLocaleString()}
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                }
                              } catch {
                                return <p><span className="font-medium">Notes:</span> {payout.notes}</p>;
                              }
                            })()}
                            <p className="text-xs text-gray-500">
                              Created: {new Date(payout.created_at).toLocaleString()}
                            </p>
                            {payout.payout_date && (
                              <p className="text-xs text-gray-500">
                                Processed: {new Date(payout.payout_date).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                        {payout.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => openMarkPaidDialog(payout.id)}
                              className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                            >
                              Mark Paid
                            </button>
                            <button
                              onClick={() => openMarkFailedDialog(payout.id)}
                              className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                            >
                              Mark Failed
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Timestamps */}
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Created:</span> {new Date(influencer.created_at).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Updated:</span> {new Date(influencer.updated_at).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Last Activity:</span> {influencer.last_activity_at ? new Date(influencer.last_activity_at).toLocaleDateString() : 'Never'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mark as Paid Dialog */}
      {showMarkPaidDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Mark Payout as Paid</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction ID <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter transaction ID"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
                <textarea
                  value={completionNote}
                  onChange={(e) => setCompletionNote(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowMarkPaidDialog(false)}
                disabled={processingPayout}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkAsPaid}
                disabled={processingPayout}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {processingPayout ? 'Updating...' : 'Mark as Paid'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark as Failed Dialog */}
      {showMarkFailedDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Mark Payout as Failed</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Failure <span className="text-red-500">*</span></label>
                <textarea
                  value={failureReason}
                  onChange={(e) => setFailureReason(e.target.value)}
                  rows={4}
                  placeholder="Explain why this payout failed..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowMarkFailedDialog(false)}
                disabled={processingPayout}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkAsFailed}
                disabled={processingPayout}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {processingPayout ? 'Updating...' : 'Mark as Failed'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Payout Dialog */}
      {showPayoutDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Payout</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (USD)</label>
                <input
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
                {payoutAmount && (
                  <p className="text-xs text-gray-500 mt-1">
                    ≈ {formatCurrency(parseFloat(payoutAmount) || 0)}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value as any)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="upi">UPI</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Initial Note</label>
                <textarea
                  value={payoutInitialNote}
                  onChange={(e) => setPayoutInitialNote(e.target.value)}
                  rows={3}
                  placeholder="This note will be saved when payout is created..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">This message will be timestamped and saved in payout history</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPayoutDialog(false)}
                disabled={processingPayout}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePayout}
                disabled={processingPayout}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {processingPayout ? 'Creating...' : 'Create Payout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewInfluencerPopup;
