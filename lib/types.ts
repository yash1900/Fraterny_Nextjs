export interface Influencer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profile_image?: string;
  bio?: string;
  social_links?: {
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  affiliate_code: string;
  commission_rate: number;
  status: 'active' | 'inactive' | 'suspended';
  total_earnings: number;
  remaining_balance: number;
  total_paid: number;
  payment_info?: {
    bank_name?: string;
    account_number?: string;
    ifsc_code?: string;
    upi_id?: string;
  };
  total_clicks: number;
  total_signups: number;
  total_questionnaires: number;
  total_purchases: number;
  conversion_rate: number;
  created_at: string;
  updated_at: string;
  last_activity_at?: string;
  is_india?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
  count?: number;
}


