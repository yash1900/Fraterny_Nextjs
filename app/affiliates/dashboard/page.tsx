'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/auth/cotexts/AuthContext';
import {
  getInfluencerByEmail,
  getDashboardStats,
  getRecentActivity,
  getConversionFunnel,
  getPerformanceData,
  generateAffiliateLink,
  updateInfluencerProfile,
  updateBankDetails,
  getExchangeRate,
  type InfluencerProfile,
  type DashboardStats,
  type RecentActivity,
  type ConversionFunnel,
  type PerformanceData,
} from '@/lib/services/influencer';
import { supabase } from '@/lib/supabase';
import {
  Users,
  TrendingUp,
  DollarSign,
  MousePointer,
  Copy,
  Download,
  LogOut,
  Loader2,
  Clock,
  ChevronRight,
  BarChart3,
  Menu,
  X,
  User,
  Link,
  Activity,
  CreditCard,
  Upload,
  Save,
  Edit2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import QRCode from 'qrcode';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

type MenuSection = 'dashboard' | 'profile' | 'affiliate' | 'bank' | 'activity';

export default function AffiliatesDashboard() {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const router = useRouter();
  
  // State
  const [loading, setLoading] = useState(true);
  const [influencer, setInfluencer] = useState<InfluencerProfile | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [funnel, setFunnel] = useState<ConversionFunnel | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [activeSection, setActiveSection] = useState<MenuSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number>(83.50);

  // Edit mode states
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingBank, setEditingBank] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [bankLoading, setBankLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  // Profile edit states
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');
  const [editInstagram, setEditInstagram] = useState('');
  const [editTwitter, setEditTwitter] = useState('');
  const [editYoutube, setEditYoutube] = useState('');
  const [editLinkedin, setEditLinkedin] = useState('');

  // Bank edit states
  const [editBankName, setEditBankName] = useState('');
  const [editAccountNumber, setEditAccountNumber] = useState('');
  const [editIfsc, setEditIfsc] = useState('');
  const [editUpi, setEditUpi] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user || !user.email) {
        router.push('/affiliates');
      } else {
        loadDashboardData(user.email);
      }
    }
  }, [user, authLoading, router]);

  const loadDashboardData = async (email: string) => {
    setLoading(true);
    try {
      // Fetch exchange rate
      const rate = await getExchangeRate();
      setExchangeRate(rate);

      // Get influencer profile
      const influencerResponse = await getInfluencerByEmail(email);
      
      if (!influencerResponse.success || !influencerResponse.data) {
        toast.error('Access Denied', {
          description: 'You are not registered as an influencer.',
        });
        router.push('/affiliates');
        return;
      }

      const influencerData = influencerResponse.data;
      setInfluencer(influencerData);

      // Load all dashboard data in parallel
      const [statsResponse, activityResponse, funnelResponse, performanceResponse] = await Promise.all([
        getDashboardStats(influencerData.affiliate_code),
        getRecentActivity(influencerData.affiliate_code, 10),
        getConversionFunnel(influencerData.affiliate_code),
        getPerformanceData(influencerData.affiliate_code),
      ]);

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }

      if (activityResponse.success && activityResponse.data) {
        setRecentActivity(activityResponse.data);
      }

      if (funnelResponse.success && funnelResponse.data) {
        setFunnel(funnelResponse.data);
      }

      if (performanceResponse.success && performanceResponse.data) {
        setPerformanceData(performanceResponse.data);
      }

      // Generate QR code
      const affiliateLink = generateAffiliateLink(influencerData.affiliate_code);
      const qrUrl = await QRCode.toDataURL(affiliateLink, {
        width: 256,
        margin: 2,
        color: {
          dark: '#121212',
          light: '#FFFFFF',
        },
      });
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Error', {
        description: 'Failed to load dashboard data',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyAffiliateLink = () => {
    if (!influencer) return;
    const link = generateAffiliateLink(influencer.affiliate_code);
    navigator.clipboard.writeText(link);
    toast.success('Link Copied!', {
      description: 'Affiliate link copied to clipboard',
    });
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement('a');
    link.download = `affiliate-qr-${influencer?.affiliate_code}.png`;
    link.href = qrCodeUrl;
    link.click();
    toast.success('QR Code Downloaded!');
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/affiliates');
  };

  const convertUSDtoINR = (amountInUSD: number): number => {
    return amountInUSD * exchangeRate;
  };

  const formatCurrency = (amountInUSD: number) => {
    if (influencer?.is_india) {
      const amountInINR = convertUSDtoINR(amountInUSD);
      return `₹${amountInINR.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      return `$${amountInUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getProfileImageUrl = (storagePath: string | null): string | null => {
    if (!storagePath) return null;
    if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) return storagePath;
    if (storagePath.startsWith('data:')) return storagePath;
    const { data } = supabase.storage.from('website-images').getPublicUrl(storagePath);
    return data?.publicUrl || null;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const startEditingProfile = () => {
    setEditName(influencer?.name || '');
    setEditBio(influencer?.bio || '');
    setProfileImagePreview(influencer?.profile_image || '');
    setProfileImageFile(null);
    setEditInstagram(influencer?.social_links?.instagram || '');
    setEditTwitter(influencer?.social_links?.twitter || '');
    setEditYoutube(influencer?.social_links?.youtube || '');
    setEditLinkedin(influencer?.social_links?.linkedin || '');
    setEditingProfile(true);
  };

  const saveProfileChanges = async () => {
    if (!influencer) return;
    if (!editName.trim()) {
      toast.error('Name is required');
      return;
    }

    setProfileLoading(true);
    setImageUploading(!!profileImageFile);

    try {
      const socialLinks: any = {};
      if (editInstagram.trim()) socialLinks.instagram = editInstagram.trim();
      if (editTwitter.trim()) socialLinks.twitter = editTwitter.trim();
      if (editYoutube.trim()) socialLinks.youtube = editYoutube.trim();
      if (editLinkedin.trim()) socialLinks.linkedin = editLinkedin.trim();

      const response = await updateInfluencerProfile(
        influencer.id,
        {
          name: editName.trim(),
          bio: editBio.trim(),
          profile_image: influencer.profile_image ?? undefined,
          social_links: Object.keys(socialLinks).length > 0 ? socialLinks : undefined,
        },
        profileImageFile
      );

      if (response.success && response.data) {
        setInfluencer(response.data);
        setEditingProfile(false);
        toast.success('Profile updated successfully!');
      } else {
        toast.error(response.error || 'Failed to update profile');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setProfileLoading(false);
      setImageUploading(false);
    }
  };

  const startEditingBank = () => {
    setEditBankName(influencer?.payment_info?.bank_name || '');
    setEditAccountNumber(influencer?.payment_info?.account_number || '');
    setEditIfsc(influencer?.payment_info?.ifsc || '');
    setEditUpi(influencer?.payment_info?.upi || '');
    setEditingBank(true);
  };

  const saveBankDetails = async () => {
    if (!influencer) return;

    setBankLoading(true);

    try {
      const response = await updateBankDetails(influencer.id, {
        bank_name: editBankName.trim(),
        account_number: editAccountNumber.trim(),
        ifsc: editIfsc.trim().toUpperCase(),
        upi: editUpi.trim(),
      });

      if (response.success && response.data) {
        setInfluencer(response.data);
        setEditingBank(false);
        toast.success('Bank details updated successfully!');
      } else {
        toast.error(response.error || 'Failed to update bank details');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setBankLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!influencer || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Failed to load dashboard data</p>
      </div>
    );
  }

  const affiliateLink = generateAffiliateLink(influencer.affiliate_code);

  const menuItems = [
    { id: 'dashboard' as MenuSection, label: 'Dashboard', icon: BarChart3 },
    { id: 'profile' as MenuSection, label: 'My Profile', icon: User },
    { id: 'affiliate' as MenuSection, label: 'Affiliate Links', icon: Link },
    { id: 'bank' as MenuSection, label: 'Bank Details', icon: CreditCard },
    { id: 'activity' as MenuSection, label: 'Activity', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <h1 className="text-xl font-bold text-gray-900">Affiliate</h1>
          </div>
          <button
            onClick={handleSignOut}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      </div>

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-30
            w-64 bg-white border-r border-gray-200 shadow-lg lg:shadow-none
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div className="flex flex-col h-full">
            <div className="hidden lg:block p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Account</h2>
              <p className="text-sm text-gray-600 mt-1">Welcome, {influencer.name}</p>
            </div>

            <nav className="flex-1 p-4 overflow-y-auto">
              <ul className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          setActiveSection(item.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                          isActive
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="hidden lg:block p-4 border-t border-gray-200">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Dashboard Section */}
            {activeSection === 'dashboard' && (
              <>
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                  <p className="text-gray-600 mt-1">Overview of your affiliate performance</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-600">Total Clicks</h3>
                      <MousePointer className="h-5 w-5 text-blue-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalClicks.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">All-time clicks</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-600">Total Signups</h3>
                      <Users className="h-5 w-5 text-green-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalSignups.toLocaleString()}</p>
                    <p className="text-xs text-green-600 mt-1">{stats.clickToSignup}% conversion</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-600">PDF Sales</h3>
                      <TrendingUp className="h-5 w-5 text-purple-500" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalPurchases.toLocaleString()}</p>
                    <p className="text-xs text-purple-600 mt-1">{stats.conversionRate}% overall</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-sm text-white"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-white/90">Total Earnings</h3>
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-3xl font-bold">{formatCurrency(stats.totalEarnings)}</p>
                    <p className="text-xs text-white/80 mt-1">Commission: {influencer.commission_rate}%</p>
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-900">Performance Over Time</h2>
                      <BarChart3 className="h-5 w-5 text-gray-400" />
                    </div>
                    {performanceData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={performanceData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                          <YAxis stroke="#9ca3af" fontSize={12} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                          />
                          <Line type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                          <Line type="monotone" dataKey="signups" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
                          <Line type="monotone" dataKey="purchases" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-gray-500">
                        No data available yet
                      </div>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
                  >
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Conversion Funnel</h2>
                    {funnel && (
                      <div className="space-y-4">
                        <div className="relative">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Clicks</span>
                            <span className="text-lg font-bold text-gray-900">{funnel.clicks}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div className="bg-blue-500 h-3 rounded-full" style={{ width: '100%' }}></div>
                          </div>
                        </div>

                        <div className="flex items-center justify-center">
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                          <span className="text-xs text-green-600 font-medium">{funnel.clickToSignupRate}%</span>
                        </div>

                        <div className="relative">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Signups</span>
                            <span className="text-lg font-bold text-gray-900">{funnel.signups}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-green-500 h-3 rounded-full" 
                              style={{ width: `${funnel.clicks > 0 ? (funnel.signups / funnel.clicks) * 100 : 0}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex items-center justify-center">
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                          <span className="text-xs text-green-600 font-medium">{funnel.signupToQuestionnaireRate}%</span>
                        </div>

                        <div className="relative">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Questionnaires</span>
                            <span className="text-lg font-bold text-gray-900">{funnel.questionnairesCompleted}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-yellow-500 h-3 rounded-full" 
                              style={{ width: `${funnel.clicks > 0 ? (funnel.questionnairesCompleted / funnel.clicks) * 100 : 0}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex items-center justify-center">
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                          <span className="text-xs text-green-600 font-medium">{funnel.questionnaireToPurchaseRate}%</span>
                        </div>

                        <div className="relative">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Purchases</span>
                            <span className="text-lg font-bold text-gray-900">{funnel.purchases}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="bg-purple-500 h-3 rounded-full" 
                              style={{ width: `${funnel.clicks > 0 ? (funnel.purchases / funnel.clicks) * 100 : 0}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm font-medium text-blue-900">Overall Conversion Rate</p>
                          <p className="text-2xl font-bold text-blue-600">{funnel.overallConversionRate}%</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>
              </>
            )}

            {/* Profile Section */}
            {activeSection === 'profile' && (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-gray-600 mt-1">Manage your account information</p>
                  </div>
                  {!editingProfile && (
                    <button
                      onClick={startEditingProfile}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                      <span>Edit Profile</span>
                    </button>
                  )}
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4 pb-4 border-b border-gray-200">
                      <div className="flex-shrink-0 relative">
                        {editingProfile ? (
                          <>
                            {profileImagePreview && getProfileImageUrl(profileImagePreview) ? (
                              <img
                                src={getProfileImageUrl(profileImagePreview)!}
                                alt="Profile"
                                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                              />
                            ) : (
                              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                                {editName.charAt(0) || influencer.name.charAt(0)}
                              </div>
                            )}
                            <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                              <Upload className="h-3 w-3" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                disabled={imageUploading}
                              />
                            </label>
                          </>
                        ) : (
                          influencer.profile_image && getProfileImageUrl(influencer.profile_image) ? (
                            <img
                              src={getProfileImageUrl(influencer.profile_image)!}
                              alt="Profile"
                              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                              {influencer.name.charAt(0)}
                            </div>
                          )
                        )}
                      </div>
                      <div className="flex-1">
                        {editingProfile ? (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Your name"
                              />
                            </div>
                          </div>
                        ) : (
                          <>
                            <h3 className="text-xl font-bold text-gray-900">{influencer.name}</h3>
                            <p className="text-gray-600">{influencer.email}</p>
                            <p className="text-sm text-gray-500 mt-1">Commission Rate: {influencer.commission_rate}%</p>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-gray-900">{influencer.email}</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-gray-900">{influencer.phone || 'Not provided'}</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Affiliate Code</label>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-gray-900 font-mono">{influencer.affiliate_code}</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <span className={`inline-flex px-3 py-1 text-sm rounded-full ${
                            influencer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {influencer.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                      {editingProfile ? (
                        <textarea
                          value={editBio}
                          onChange={(e) => setEditBio(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Tell us about yourself"
                        />
                      ) : (
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-gray-900">{influencer.bio || 'No bio provided'}</p>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Social Media Links</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['Instagram', 'Twitter', 'YouTube', 'LinkedIn'].map((platform) => {
                          const key = platform.toLowerCase();
                          const value = editingProfile 
                            ? (key === 'instagram' ? editInstagram : key === 'twitter' ? editTwitter : key === 'youtube' ? editYoutube : editLinkedin)
                            : influencer.social_links?.[key as keyof typeof influencer.social_links];
                          
                          return (
                            <div key={platform}>
                              <label className="block text-sm font-medium text-gray-700 mb-1">{platform}</label>
                              {editingProfile ? (
                                <input
                                  type="url"
                                  value={value as string || ''}
                                  onChange={(e) => {
                                    if (key === 'instagram') setEditInstagram(e.target.value);
                                    else if (key === 'twitter') setEditTwitter(e.target.value);
                                    else if (key === 'youtube') setEditYoutube(e.target.value);
                                    else if (key === 'linkedin') setEditLinkedin(e.target.value);
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder={`https://${key}.com/username`}
                                />
                              ) : (
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                  {value ? (
                                    <a
                                      href={value as string}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:underline text-sm break-all"
                                    >
                                      {value as string}
                                    </a>
                                  ) : (
                                    <p className="text-gray-500 text-sm">Not provided</p>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {editingProfile && (
                      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                        <button
                          onClick={saveProfileChanges}
                          disabled={profileLoading || imageUploading}
                          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                          {profileLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>{imageUploading ? 'Uploading...' : 'Saving...'}</span>
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4" />
                              <span>Save Changes</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setEditingProfile(false)}
                          disabled={profileLoading}
                          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Earnings Summary</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm text-green-700 mb-1">Total Earnings</p>
                          <p className="text-2xl font-bold text-green-900">{formatCurrency(influencer.total_earnings)}</p>
                        </div>
                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <p className="text-sm text-yellow-700 mb-1">Remaining Balance</p>
                          <p className="text-2xl font-bold text-yellow-900">{formatCurrency(influencer.remaining_balance)}</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-700 mb-1">Total Paid</p>
                          <p className="text-2xl font-bold text-blue-900">{formatCurrency(influencer.total_paid)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Bank Details Section */}
            {activeSection === 'bank' && (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Bank Details</h1>
                    <p className="text-gray-600 mt-1">Manage your payment information</p>
                  </div>
                  {!editingBank && (
                    <button
                      onClick={startEditingBank}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                      <span>Edit Details</span>
                    </button>
                  )}
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                        {editingBank ? (
                          <input
                            type="text"
                            value={editBankName}
                            onChange={(e) => setEditBankName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter bank name"
                          />
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-gray-900">{influencer.payment_info?.bank_name || 'Not provided'}</p>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                        {editingBank ? (
                          <input
                            type="text"
                            value={editAccountNumber}
                            onChange={(e) => setEditAccountNumber(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter account number"
                          />
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-gray-900">
                              {influencer.payment_info?.account_number ? `****${influencer.payment_info.account_number.slice(-4)}` : 'Not provided'}
                            </p>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                        {editingBank ? (
                          <input
                            type="text"
                            value={editIfsc}
                            onChange={(e) => setEditIfsc(e.target.value.toUpperCase())}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                            placeholder="Enter IFSC code"
                            maxLength={11}
                          />
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-gray-900 font-mono">{influencer.payment_info?.ifsc || 'Not provided'}</p>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID</label>
                        {editingBank ? (
                          <input
                            type="text"
                            value={editUpi}
                            onChange={(e) => setEditUpi(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="yourname@upi"
                          />
                        ) : (
                          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-gray-900">{influencer.payment_info?.upi || 'Not provided'}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {editingBank && (
                      <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                        <button
                          onClick={saveBankDetails}
                          disabled={bankLoading}
                          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                          {bankLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4" />
                              <span>Save Changes</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setEditingBank(false)}
                          disabled={bankLoading}
                          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    <div className="pt-6 border-t border-gray-200">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-semibold text-blue-900 mb-1">Payment Information</h4>
                            <p className="text-sm text-blue-700">
                              Your bank details will be used for commission payouts. Please ensure all information is accurate.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Affiliate Links Section */}
            {activeSection === 'affiliate' && (
              <>
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900">Affiliate Links</h1>
                  <p className="text-gray-600 mt-1">Share your unique affiliate link to earn commissions</p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6"
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Your Affiliate Link</h2>
                  <div className="flex flex-col md:flex-row gap-4 items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-4">
                        <input
                          type="text"
                          value={affiliateLink}
                          readOnly
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-mono text-sm"
                        />
                        <button
                          onClick={copyAffiliateLink}
                          className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Copy className="h-4 w-4" />
                          <span>Copy</span>
                        </button>
                      </div>
                      <p className="text-sm text-gray-600">
                        Share this link on your social media, website, or anywhere else to track referrals and earn commissions.
                      </p>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      {qrCodeUrl && (
                        <>
                          <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32 border-2 border-gray-200 rounded-lg" />
                          <button
                            onClick={downloadQRCode}
                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                          >
                            <Download className="h-4 w-4" />
                            <span>Download QR</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Stats</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-blue-700">Total Clicks</p>
                        <MousePointer className="h-5 w-5 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-blue-900 mt-2">{stats?.totalClicks.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-green-700">Total Signups</p>
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-green-900 mt-2">{stats?.totalSignups.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-purple-700">Total Sales</p>
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                      </div>
                      <p className="text-2xl font-bold text-purple-900 mt-2">{stats?.totalPurchases.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-orange-700">Total Earnings</p>
                        <DollarSign className="h-5 w-5 text-orange-600" />
                      </div>
                      <p className="text-2xl font-bold text-orange-900 mt-2">{formatCurrency(stats?.totalEarnings || 0)}</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Activity Section */}
            {activeSection === 'activity' && (
              <>
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900">Recent Activity</h1>
                  <p className="text-gray-600 mt-1">Track all your affiliate activities</p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
                >
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
                  {recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0 mt-1">
                            <Clock className="h-5 w-5 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                            <p className="text-xs text-gray-500 mt-1">{getTimeAgo(activity.timestamp)}</p>
                          </div>
                          {activity.earnings && (
                            <div className="flex-shrink-0">
                              <span className="text-sm font-bold text-green-600">
                                +{formatCurrency(activity.earnings)}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <p>No activity yet</p>
                      <p className="text-sm mt-2">Start sharing your affiliate link to see activity here</p>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
