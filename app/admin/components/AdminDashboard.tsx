'use client';

import React, { useState, useEffect } from 'react';
import { Users, DollarSign, FileText, CreditCard, BarChart3, Menu, X, MessageCircle, TrendingUp, AlertCircle, Image, Mail, PieChart, Settings, UserCheck, Calendar, Shield, RefreshCw, Send } from 'lucide-react';

// Import placeholder components (these will be replaced with real migrations)
import {
  AdminUserManagement,
  AdminSummaryManagement,
  AdminQuestPayment,
  AdminFeedbackManagement,
  Analytics,
  AdminBlog,
  AdminImages,
  NewsletterSubscribers,
  WebsiteSettings,
  AdminInfluencerManagement,
  AdminPricingManagement,
  AdminEmailManagement,
  VillaEditionsManagement,
  AdminBulkEmailManagement
} from './placeholders';

// Direct API interfaces - no utility functions needed
export interface DashboardStats {
  users: {
    totalUsers: number;
    newUsersLast30Days: number;
    activeUsersLast7Days: number;
  };
  summaries: {
    totalSummaries: number;
    paidSummaries: number;
    summariesLast30Days: number;
  };
  payments: {
    totalRevenue: number;
    totalRevenueUSD: number;
    totalRevenueINR: number;
    totalTransactions: number;
    revenueThisMonth: number;
    revenueThisMonthUSD: number;
    revenueThisMonthINR: number;
    successfulPayments: number;
    indiaRevenueUSD: number;
    indiaRevenueINR: number;
    internationalRevenueUSD: number;
  };
  feedback: {
    totalFeedbacks: number;
    averageRating: number;
    feedbacksLast30Days: number;
  };
}

export interface QuickStats {
  label: string;
  value: string;
  change?: {
    value: number;
    period: string;
  };
  icon: string;
  color: string;
}

// Define menu items - EXACT SAME AS ORIGINAL
const menuItems = [
  {
    id: 'overview',
    label: 'Dashboard Overview',
    icon: BarChart3,
    component: null
  },
  // {
  //   id: 'analytics',
  //   label: 'Analytics',
  //   icon: PieChart,
  //   component: Analytics
  // },
  {
    id: 'blog',
    label: 'Blog Management',
    icon: FileText,
    component: AdminBlog
  },
  {
    id: 'images',
    label: 'Image Management',
    icon: Image,
    component: AdminImages
  },
  {
    id: 'newsletter',
    label: 'Newsletter Subscribers',
    icon: Mail,
    component: NewsletterSubscribers
  },
  {
    id: 'settings',
    label: 'Website Settings',
    icon: Settings,
    component: WebsiteSettings
  },
  {
    id: 'admin-emails',
    label: 'Admin Emails',
    icon: Shield,
    component: AdminEmailManagement
  },
  {
    id: 'bulk-emails',
    label: 'Bulk Email Management',
    icon: Send,
    component: AdminBulkEmailManagement
  },
  {
    id: 'editions',
    label: 'Villa Editions',
    icon: Calendar,
    component: VillaEditionsManagement  // We'll create this component next
  },
  {
    id: 'influencers',
    label: 'Influencer Management',
    icon: UserCheck,
    component: AdminInfluencerManagement
  },
  {
    id: 'users',
    label: 'User Management',
    icon: Users,
    component: AdminUserManagement
  },
  {
    id: 'summaries',
    label: 'Summary Management',
    icon: FileText,
    component: AdminSummaryManagement
  },
  {
    id: 'payments',
    label: 'Payment Dashboard',
    icon: CreditCard,
    component: AdminQuestPayment
  },
  {
    id: 'pricing',
    label: 'Pricing Management',
    icon: DollarSign,
    component: AdminPricingManagement
  },
  {
    id: 'feedback',
    label: 'Feedback Management',
    icon: MessageCircle,
    component: AdminFeedbackManagement
  }
];

// Simple Overview Component - EXACT SAME AS ORIGINAL
const DashboardOverview: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [quickStats, setQuickStats] = useState<QuickStats[]>([]);
  
  // Direct API call functions
  const formatQuickStats = (data: DashboardStats): QuickStats[] => {
    return [
      {
        label: 'Total Users',
        value: data.users.totalUsers.toLocaleString(),
        change: {
          value: data.users.newUsersLast30Days,
          period: 'last 30 days'
        },
        icon: 'users',
        color: 'blue'
      },
      {
        label: 'Generated Summaries',
        value: data.summaries.totalSummaries.toLocaleString(),
        change: {
          value: data.summaries.summariesLast30Days,
          period: 'last 30 days'
        },
        icon: 'summaries',
        color: 'green'
      },
      {
        label: 'Total Revenue',
        value: `$${data.payments.totalRevenueUSD.toLocaleString()} + ₹${data.payments.totalRevenueINR.toLocaleString()}`,
        change: {
          value: data.payments.revenueThisMonthUSD + data.payments.revenueThisMonthINR,
          period: 'this month'
        },
        icon: 'payments',
        color: 'purple'
      },
      {
        label: 'Customer Feedback',
        value: `${data.feedback.totalFeedbacks.toLocaleString()} (${data.feedback.averageRating}⭐)`,
        change: {
          value: data.feedback.feedbacksLast30Days,
          period: 'last 30 days'
        },
        icon: 'feedback',
        color: 'orange'
      }
    ];
  };

  const getDashboardInsights = (data: DashboardStats) => {
    const conversionRate = data.users.totalUsers > 0 
      ? ((data.summaries.paidSummaries / data.users.totalUsers) * 100).toFixed(1)
      : '0';
      
    const paymentSuccessRate = data.payments.totalTransactions > 0
      ? ((data.payments.successfulPayments / data.payments.totalTransactions) * 100).toFixed(1)
      : '0';
      
    const activeUsersRatio = data.users.totalUsers > 0
      ? ((data.users.activeUsersLast7Days / data.users.totalUsers) * 100).toFixed(1)
      : '0';
      
    const averageRevenue = data.payments.successfulPayments > 0
      ? (data.payments.totalRevenueUSD / data.payments.successfulPayments).toFixed(2)
      : '0';

    return {
      businessMetrics: {
        conversionRate,
        paymentSuccessRate,
        averageRevenue
      },
      userEngagement: {
        activeUsersRatio
      }
    };
  };

  // Fetch dashboard data - DIRECT API CALL
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/dashboard', {
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
        setDashboardStats(data.data);
        setQuickStats(formatQuickStats(data.data));
      } else {
        setError(data.error || 'Failed to load dashboard statistics');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading dashboard data');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  // Get icon component based on icon type
  const getIconComponent = (iconType: string) => {
    const iconMap = {
      users: Users,
      summaries: FileText,
      payments: CreditCard,
      feedback: MessageCircle,
    };
    return iconMap[iconType as keyof typeof iconMap] || Users;
  };
  
  // Get color classes based on color type
  const getColorClasses = (colorType: string) => {
    const colorMap = {
      blue: { icon: 'text-blue-500', trend: 'text-blue-600' },
      green: { icon: 'text-green-500', trend: 'text-green-600' },
      purple: { icon: 'text-purple-500', trend: 'text-purple-600' },
      orange: { icon: 'text-orange-500', trend: 'text-orange-600' },
    };
    return colorMap[colorType as keyof typeof colorMap] || colorMap.blue;
  };
  
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome to the admin dashboard. Here's your business overview.</p>
      </div>
      
      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <h3 className="text-red-800 font-semibold">Error Loading Dashboard</h3>
          </div>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            Retry
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Quick Stats Cards */}
        {loading ? (
          // Loading skeleton cards
          Array.from({ length: 4 }).map((_, index) => (
            <div key={`loading-${index}`} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-5 bg-gray-200 rounded w-20"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          ))
        ) : (
          // Real stats cards
          quickStats.map((stat, index) => {
            const IconComponent = getIconComponent(stat.icon);
            const colors = getColorClasses(stat.color);
            
            return (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{stat.label}</h3>
                  <IconComponent className={`h-8 w-8 ${colors.icon}`} />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                {stat.change && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className={`h-4 w-4 ${colors.trend}`} />
                    <span className={`text-sm font-medium ${colors.trend}`}>
                      +{stat.change.value.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-600">{stat.change.period}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      
      {/* Regional Revenue Breakdown - More Prominent */}
      {dashboardStats && !loading && (
        <div className="mt-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              🌍 Revenue by Region
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-semibold text-green-800">🇮🇳 India Revenue</h4>
                </div>
                <div className="text-2xl font-bold text-green-700 mb-1">
                  ${dashboardStats.payments.indiaRevenueUSD.toLocaleString()} + ₹{dashboardStats.payments.indiaRevenueINR.toLocaleString()}
                </div>
                <div className="text-sm text-green-600">
                  USD: ${dashboardStats.payments.indiaRevenueUSD.toLocaleString()} | INR: ₹{dashboardStats.payments.indiaRevenueINR.toLocaleString()}
                </div>
                <div className="text-xs text-green-500 mt-1">
                  PayPal USD + Razorpay INR from Indian users
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-semibold text-blue-800">🌎 International Revenue</h4>
                </div>
                <div className="text-2xl font-bold text-blue-700 mb-1">
                  ${dashboardStats.payments.internationalRevenueUSD.toLocaleString()}
                </div>
                <div className="text-sm text-blue-600">
                  USD Only
                </div>
                <div className="text-xs text-blue-500 mt-1">
                  PayPal + Razorpay USD from international users
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Business Insights */}
      {dashboardStats && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Key Metrics */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Business Metrics</h3>
            <div className="space-y-4">
              {(() => {
                const insights = getDashboardInsights(dashboardStats);
                return (
                  <>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">Conversion Rate</span>
                      <span className="text-lg font-bold text-green-600">{insights.businessMetrics.conversionRate}%</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">Payment Success Rate</span>
                      <span className="text-lg font-bold text-blue-600">{insights.businessMetrics.paymentSuccessRate}%</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">Active Users (7 days)</span>
                      <span className="text-lg font-bold text-purple-600">{insights.userEngagement.activeUsersRatio}%</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm font-medium text-gray-600">Avg Revenue per Payment</span>
                      <span className="text-lg font-bold text-orange-600">${insights.businessMetrics.averageRevenue}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <span className="text-blue-800 font-medium block">Manage Users</span>
                  <span className="text-blue-600 text-xs">{dashboardStats.users.totalUsers.toLocaleString()} total</span>
                </div>
              </button>
              <button className="flex items-center gap-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left">
                <FileText className="h-5 w-5 text-green-600" />
                <div>
                  <span className="text-green-800 font-medium block">View Summaries</span>
                  <span className="text-green-600 text-xs">{dashboardStats.summaries.totalSummaries.toLocaleString()} generated</span>
                </div>
              </button>
              <button className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left">
                <CreditCard className="h-5 w-5 text-purple-600" />
                <div>
                  <span className="text-purple-800 font-medium block">Payment Reports</span>
                  <span className="text-purple-600 text-xs">
                    ${dashboardStats.payments.totalRevenueUSD.toLocaleString()} + ₹{dashboardStats.payments.totalRevenueINR.toLocaleString()}
                  </span>
                </div>
              </button>
              <button className="flex items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-left">
                <MessageCircle className="h-5 w-5 text-orange-600" />
                <div>
                  <span className="text-orange-800 font-medium block">View Feedback</span>
                  <span className="text-orange-600 text-xs">{dashboardStats.feedback.totalFeedbacks.toLocaleString()} received</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const [activeMenuItem, setActiveMenuItem] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Handle reload button click
  const handleReload = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Get the active component
  const getActiveComponent = () => {
    const activeItem = menuItems.find(item => item.id === activeMenuItem);
    
    if (!activeItem) return <DashboardOverview key={refreshKey} />;
    
    if (activeItem.id === 'overview') {
      return <DashboardOverview key={refreshKey} />;
    }
    
    if (activeItem.component) {
      const Component = activeItem.component;
      return <Component key={refreshKey} />;
    }
    
    return <DashboardOverview key={refreshKey} />;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-sm flex-shrink-0`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className={`text-xl font-bold text-gray-900 transition-all duration-300 overflow-hidden whitespace-nowrap ${
            sidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0'
          }`}>Admin Panel</h2>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeMenuItem === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveMenuItem(item.id)}
                    className={`w-full flex items-center ${sidebarOpen ? 'gap-3 px-3' : 'justify-center px-2'} py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    title={sidebarOpen ? '' : item.label}
                  >
                    <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                    <span className={`font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${isActive ? 'text-blue-700' : 'text-gray-700'} ${
                      sidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0'
                    }`}>
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-semibold">A</span>
            </div>
            <div className={`transition-all duration-300 overflow-hidden ${
              sidebarOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0'
            }`}>
              <p className="text-sm font-medium text-gray-900 whitespace-nowrap">Admin User</p>
              <p className="text-xs text-gray-500 whitespace-nowrap">admin@fraterny.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {menuItems.find(item => item.id === activeMenuItem)?.label || 'Dashboard'}
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={handleReload}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors group"
                title="Reload Page"
              >
                <RefreshCw className="h-5 w-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </button>
              <div className="text-sm text-gray-500" suppressHydrationWarning>
                Last updated: {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {getActiveComponent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;