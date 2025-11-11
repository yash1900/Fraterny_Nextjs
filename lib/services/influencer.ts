/**
 * Client-side service for influencer/affiliate functionality
 */

// Types
export interface InfluencerProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  affiliate_code: string;
  commission_rate: number;
  status: string;
  bio?: string;
  profile_image?: string;
  social_links?: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    linkedin?: string;
  };
  payment_info?: {
    bank_name?: string;
    account_number?: string;
    ifsc?: string;
    upi?: string;
  };
  total_earnings: number;
  remaining_balance: number;
  total_paid: number;
  is_india?: boolean;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalClicks: number;
  totalSignups: number;
  totalQuestionnaires: number;
  totalPurchases: number;
  totalEarnings: number;
  conversionRate: number;
  clickToSignup: number;
  signupToPurchase: number;
}

export interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  earnings?: number;
}

export interface ConversionFunnel {
  clicks: number;
  signups: number;
  questionnairesCompleted: number;
  purchases: number;
  clickToSignupRate: number;
  signupToQuestionnaireRate: number;
  questionnaireToPurchaseRate: number;
  overallConversionRate: number;
}

export interface PerformanceData {
  date: string;
  clicks: number;
  signups: number;
  purchases: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}

/**
 * Get influencer profile by email
 */
export async function getInfluencerByEmail(email: string): Promise<ApiResponse<InfluencerProfile>> {
  try {
    const response = await fetch(`/api/influencer/profile?email=${encodeURIComponent(email)}`);
    const data = await response.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      data: null,
      error: error?.message || 'Failed to fetch influencer profile',
    };
  }
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(affiliateCode: string): Promise<ApiResponse<DashboardStats>> {
  try {
    const response = await fetch(`/api/influencer/dashboard?affiliateCode=${affiliateCode}&type=stats`);
    const data = await response.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      data: null,
      error: error?.message || 'Failed to fetch dashboard stats',
    };
  }
}

/**
 * Get recent activity
 */
export async function getRecentActivity(affiliateCode: string, limit: number = 10): Promise<ApiResponse<RecentActivity[]>> {
  try {
    const response = await fetch(`/api/influencer/dashboard?affiliateCode=${affiliateCode}&type=activity&limit=${limit}`);
    const data = await response.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      data: null,
      error: error?.message || 'Failed to fetch recent activity',
    };
  }
}

/**
 * Get conversion funnel
 */
export async function getConversionFunnel(affiliateCode: string): Promise<ApiResponse<ConversionFunnel>> {
  try {
    const response = await fetch(`/api/influencer/dashboard?affiliateCode=${affiliateCode}&type=funnel`);
    const data = await response.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      data: null,
      error: error?.message || 'Failed to fetch conversion funnel',
    };
  }
}

/**
 * Get performance data
 */
export async function getPerformanceData(affiliateCode: string): Promise<ApiResponse<PerformanceData[]>> {
  try {
    const response = await fetch(`/api/influencer/dashboard?affiliateCode=${affiliateCode}&type=performance`);
    const data = await response.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      data: null,
      error: error?.message || 'Failed to fetch performance data',
    };
  }
}

/**
 * Generate affiliate link
 */
export function generateAffiliateLink(affiliateCode: string): string {
  if (typeof window === 'undefined') {
    return `https://fraterny.com/quest?ref=${affiliateCode}`;
  }
  const baseUrl = window.location.origin;
  return `${baseUrl}/quest?ref=${affiliateCode}`;
}

/**
 * Update influencer profile
 */
export async function updateInfluencerProfile(
  influencerId: string,
  updates: {
    name?: string;
    bio?: string;
    profile_image?: string;
    social_links?: any;
  },
  imageFile?: File | null
): Promise<ApiResponse<InfluencerProfile>> {
  try {
    let profileImagePath = updates.profile_image;

    // Upload image if provided
    if (imageFile) {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('folder', 'influencer-profiles');

      const uploadResponse = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadResponse.json();
      if (uploadData.success && uploadData.data?.path) {
        profileImagePath = uploadData.data.path;
      }
    }

    // Update profile
    const response = await fetch('/api/influencer/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: influencerId,
        operation: 'update-profile',
        name: updates.name,
        bio: updates.bio,
        profile_image: profileImagePath,
        social_links: updates.social_links,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      data: null,
      error: error?.message || 'Failed to update profile',
    };
  }
}

/**
 * Update bank details
 */
export async function updateBankDetails(
  influencerId: string,
  bankDetails: {
    bank_name?: string;
    account_number?: string;
    ifsc?: string;
    upi?: string;
  }
): Promise<ApiResponse<InfluencerProfile>> {
  try {
    const response = await fetch('/api/influencer/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: influencerId,
        operation: 'update-bank-details',
        ...bankDetails,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      data: null,
      error: error?.message || 'Failed to update bank details',
    };
  }
}

/**
 * Update influencer location
 */
export async function updateInfluencerLocation(
  influencerId: string,
  isIndia: boolean
): Promise<ApiResponse<InfluencerProfile>> {
  try {
    const response = await fetch('/api/influencer/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: influencerId,
        operation: 'update-location',
        is_india: isIndia,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    return {
      success: false,
      data: null,
      error: error?.message || 'Failed to update location',
    };
  }
}

/**
 * Get exchange rate
 */
export async function getExchangeRate(): Promise<number> {
  try {
    const response = await fetch('/api/commission?operation=exchange-rate');
    const data = await response.json();
    
    if (data.success && data.data?.rate) {
      return data.data.rate;
    }
    
    return 83.50; // Fallback
  } catch (error) {
    console.error('Failed to fetch exchange rate:', error);
    return 83.50; // Fallback
  }
}
