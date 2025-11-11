/**
 * API Route: /api/admin/influencers
 * Methods: GET, POST
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// TypeScript Interfaces

// Social media links structure
interface SocialLinks {
  instagram?: string;
  twitter?: string;
  youtube?: string;
  linkedin?: string;
  facebook?: string;
}

// Payment information structure
interface PaymentInfo {
  bank_name?: string;
  account_number?: string;
  ifsc?: string;
  upi?: string;
  paypal?: string;
}

// Influencer data structure matching database schema
interface InfluencerData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  profile_image: string | null;
  bio: string | null;
  social_links: SocialLinks | null;
  affiliate_code: string;
  commission_rate: number;
  status: 'active' | 'inactive' | 'suspended';
  total_earnings: number;
  remaining_balance: number;
  total_paid: number;
  payment_info: PaymentInfo | null;
  total_clicks: number;
  total_signups: number;
  total_questionnaires: number;
  total_purchases: number;
  conversion_rate: number;
  created_at: string;
  updated_at: string;
  last_activity_at: string | null;
}

// Filters for influencer queries
interface InfluencerFilters {
  searchTerm?: string;
  status?: 'active' | 'inactive' | 'suspended';
  minEarnings?: number;
  maxEarnings?: number;
  minConversionRate?: number;
  maxConversionRate?: number;
  dateFrom?: string;
  dateTo?: string;
}

// Pagination metadata
interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

// Statistics for dashboard cards
interface InfluencerStats {
  totalInfluencers: number;
  activeInfluencers: number;
  totalRevenue: number;
  totalCommissions: number;
  totalClicks: number;
  totalSignups: number;
  totalQuestionnaires: number;
  totalPurchases: number;
  averageConversionRate: number;
}

// Response for fetching influencers
interface InfluencersResponse {
  success: boolean;
  data: {
    influencers: InfluencerData[];
    pagination: PaginationMeta;
    filteredStats?: InfluencerStats;
  } | null;
  error: string | null;
}

// Response for single influencer operations
interface InfluencerResponse {
  success: boolean;
  data: InfluencerData | null;
  error: string | null;
}

// Response for delete operations
interface DeleteInfluencerResponse {
  success: boolean;
  message: string | null;
  error: string | null;
}

// Input data for creating influencer
interface CreateInfluencerInput {
  name: string;
  email: string;
  phone?: string;
  profile_image?: string;
  bio?: string;
  social_links?: SocialLinks;
  affiliate_code: string;
  commission_rate: number;
  payment_info?: PaymentInfo;
}

// Input data for updating influencer
interface UpdateInfluencerInput {
  name?: string;
  email?: string;
  phone?: string;
  profile_image?: string;
  bio?: string;
  social_links?: SocialLinks;
  commission_rate?: number;
  status?: 'active' | 'inactive' | 'suspended';
  payment_info?: PaymentInfo;
}

// Tracking event data
interface TrackingEvent {
  id: string;
  affiliate_code: string;
  user_id: string | null;
  session_id: string | null;
  test_id: string | null;
  event_type: 'click' | 'signup' | 'questionnaire_completed' | 'pdf_purchased';
  ip_address: string | null;
  device_info: any | null;
  location: string | null;
  metadata: any | null;
  revenue: number;
  commission_earned: number;
  conversion_value: number | null;
  timestamp: string;
}

// Payout record
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
  processed_by: string | null;
}

// Helper Functions

/**
 * Generate a unique affiliate code
 */
function generateAffiliateCode(name: string): string {
  // Remove spaces and special characters, take first 4 letters, add year
  const cleanName = name.replace(/[^a-zA-Z]/g, '').toUpperCase();
  const namePart = cleanName.substring(0, 4).padEnd(4, 'X');
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `${namePart}${year}${random}`;
}

/**
 * Get influencer statistics for dashboard cards
 */
async function getInfluencerStats(): Promise<InfluencerStats> {
  try {
    // Fetch influencer count
    const { data: influencersData, error: influencersError } = await supabaseAdmin
      .from('influencers')
      .select('status');

    if (influencersError) {
      console.error('Error fetching influencers:', influencersError);
    }

    const totalInfluencers = influencersData?.length || 0;
    const activeInfluencers = influencersData?.filter(inf => inf.status === 'active').length || 0;
    
    // Fetch ALL tracking events
    const { data: eventsData, error: eventsError } = await supabaseAdmin
      .from('tracking_events')
      .select('event_type, revenue, commission_earned');
    
    if (eventsError) {
      console.error('Error fetching tracking events:', eventsError);
    }

    // Count events by type
    const totalClicks = eventsData?.filter(e => e.event_type === 'click').length || 0;
    const totalSignups = eventsData?.filter(e => e.event_type === 'signup').length || 0;
    const totalQuestionnaires = eventsData?.filter(e => e.event_type === 'questionnaire_completed').length || 0;
    const totalPurchases = eventsData?.filter(e => e.event_type === 'pdf_purchased').length || 0;
    
    // Calculate totals
    const totalRevenue = eventsData?.reduce((sum, event) => sum + (event.revenue || 0), 0) || 0;
    const totalCommissions = eventsData?.reduce((sum, event) => sum + (event.commission_earned || 0), 0) || 0;
    
    // Calculate average conversion rate
    const averageConversionRate = totalClicks > 0 
      ? (totalPurchases / totalClicks) * 100 
      : 0;

    return {
      totalInfluencers,
      activeInfluencers,
      totalRevenue,
      totalCommissions,
      totalClicks,
      totalSignups,
      totalQuestionnaires,
      totalPurchases,
      averageConversionRate: Number(averageConversionRate.toFixed(2)),
    };
  } catch (error) {
    console.error('Unexpected error in getInfluencerStats:', error);
    return {
      totalInfluencers: 0,
      activeInfluencers: 0,
      totalRevenue: 0,
      totalCommissions: 0,
      totalClicks: 0,
      totalSignups: 0,
      totalQuestionnaires: 0,
      totalPurchases: 0,
      averageConversionRate: 0,
    };
  }
}

/**
 * Get a single influencer by ID
 */
async function getInfluencerById(influencerId: string): Promise<InfluencerResponse> {
  try {
    const { data, error } = await supabaseAdmin
      .from('influencers')
      .select('*')
      .eq('id', influencerId)
      .single();

    if (error) {
      console.error('Error fetching influencer:', error);
      return {
        success: false,
        data: null,
        error: error.message,
      };
    }

    return {
      success: true,
      data: data as InfluencerData,
      error: null,
    };
  } catch (error: any) {
    console.error('Unexpected error in getInfluencerById:', error);
    return {
      success: false,
      data: null,
      error: error?.message || 'An unexpected error occurred',
    };
  }
}

/**
 * Update influencer metrics (called when events occur)
 */
async function updateInfluencerMetrics(affiliateCode: string): Promise<void> {
  try {
    console.log('Updating metrics for:', affiliateCode);
    // This would typically be called by backend triggers or cron jobs
    // For now, it's a placeholder for future implementation
  } catch (error) {
    console.error('Error updating influencer metrics:', error);
  }
}

/**
 * Fetch all payouts for a specific influencer
 */
async function getInfluencerPayouts(influencerId: string): Promise<{
  success: boolean;
  data: any[] | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabaseAdmin
      .from('influencer_payouts')
      .select('*')
      .eq('influencer_id', influencerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payouts:', error);
      return { success: false, data: null, error: error.message };
    }

    return { success: true, data, error: null };
  } catch (error: any) {
    console.error('Unexpected error fetching payouts:', error);
    return { success: false, data: null, error: error?.message || 'An unexpected error occurred' };
  }
}

/**
 * Create a new payout for an influencer
 */
async function createPayout(input: {
  influencer_id: string;
  amount: number;
  payout_method: 'bank_transfer' | 'upi' | 'paypal';
  transaction_id?: string;
  notes?: string;
  processed_by?: string;
}): Promise<{
  success: boolean;
  data: any | null;
  error: string | null;
}> {
  try {
    const { data, error } = await supabaseAdmin
      .from('influencer_payouts')
      .insert({
        influencer_id: input.influencer_id,
        amount: input.amount,
        payout_method: input.payout_method,
        transaction_id: input.transaction_id || null,
        status: 'pending',
        notes: input.notes || null,
        processed_by: input.processed_by || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating payout:', error);
      return { success: false, data: null, error: error.message };
    }

    return { success: true, data, error: null };
  } catch (error: any) {
    console.error('Unexpected error creating payout:', error);
    return { success: false, data: null, error: error?.message || 'An unexpected error occurred' };
  }
}

/**
 * Update payout status (pending → completed/failed)
 */
async function updatePayoutStatus(input: {
  payout_id: string;
  status: 'completed' | 'failed';
  transaction_id?: string;
  notes?: string;
}): Promise<{
  success: boolean;
  data: any | null;
  error: string | null;
}> {
  try {
    const updateData: any = {
      status: input.status,
      payout_date: new Date().toISOString(),
    };

    if (input.transaction_id) updateData.transaction_id = input.transaction_id;
    if (input.notes) updateData.notes = input.notes;

    const { data, error } = await supabaseAdmin
      .from('influencer_payouts')
      .update(updateData)
      .eq('id', input.payout_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating payout status:', error);
      return { success: false, data: null, error: error.message };
    }

    // If completed, update influencer's total_paid and remaining_balance
    if (input.status === 'completed' && data) {
      try {
        // First, get current influencer data
        const { data: influencerData, error: fetchError } = await supabaseAdmin
          .from('influencers')
          .select('total_paid, remaining_balance')
          .eq('id', data.influencer_id)
          .single();

        if (fetchError) {
          console.warn('Could not fetch current influencer data:', fetchError);
        } else {
          // Update the influencer's totals
          const newTotalPaid = (influencerData.total_paid || 0) + data.amount;
          const newRemainingBalance = Math.max(0, (influencerData.remaining_balance || 0) - data.amount);

          const { error: updateError } = await supabaseAdmin
            .from('influencers')
            .update({
              total_paid: newTotalPaid,
              remaining_balance: newRemainingBalance,
              updated_at: new Date().toISOString()
            })
            .eq('id', data.influencer_id);

          if (updateError) {
            console.warn('Could not update influencer totals:', updateError);
          } else {
            console.log(`Updated influencer ${data.influencer_id}: total_paid=${newTotalPaid}, remaining_balance=${newRemainingBalance}`);
          }
        }
      } catch (updateError: any) {
        console.warn('Error updating influencer totals:', updateError);
        // Don't fail the whole operation if this fails
      }
    }

    return { success: true, data, error: null };
  } catch (error: any) {
    console.error('Unexpected error updating payout status:', error);
    return { success: false, data: null, error: error?.message || 'An unexpected error occurred' };
  }
}

// GET /api/admin/influencers - Fetch influencers with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Check for special operations
    const operation = searchParams.get('operation');
    
    // Handle stats operation
    if (operation === 'stats') {
      const stats = await getInfluencerStats();
      return NextResponse.json({
        success: true,
        data: stats
      });
    }
    
    // Handle single influencer by ID operation
    if (operation === 'single' && searchParams.get('id')) {
      const influencerId = searchParams.get('id')!;
      const result = await getInfluencerById(influencerId);
      return NextResponse.json(result);
    }
    
    // Handle generate affiliate code operation
    if (operation === 'generate-code' && searchParams.get('name')) {
      const name = searchParams.get('name')!;
      const code = generateAffiliateCode(name);
      return NextResponse.json({
        success: true,
        data: { affiliate_code: code }
      });
    }
    
    // Handle get influencer payouts operation
    if (operation === 'payouts' && searchParams.get('influencerId')) {
      const influencerId = searchParams.get('influencerId')!;
      const result = await getInfluencerPayouts(influencerId);
      return NextResponse.json(result);
    }
    
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Filters
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const minEarnings = searchParams.get('minEarnings') ? parseFloat(searchParams.get('minEarnings')!) : null;
    const maxEarnings = searchParams.get('maxEarnings') ? parseFloat(searchParams.get('maxEarnings')!) : null;
    const minConversionRate = searchParams.get('minConversionRate') ? parseFloat(searchParams.get('minConversionRate')!) : null;
    const maxConversionRate = searchParams.get('maxConversionRate') ? parseFloat(searchParams.get('maxConversionRate')!) : null;
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // Build query
    let query = supabaseAdmin.from('influencers').select('*', { count: 'exact' });

    // Apply search filter
    if (search && search.trim()) {
      query = query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,affiliate_code.ilike.%${search}%,phone.ilike.%${search}%`
      );
    }

    // Apply status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Apply earnings filters
    if (minEarnings !== null) {
      query = query.gte('total_earnings', minEarnings);
    }
    if (maxEarnings !== null) {
      query = query.lte('total_earnings', maxEarnings);
    }

    // Apply conversion rate filters
    if (minConversionRate !== null) {
      query = query.gte('conversion_rate', minConversionRate);
    }
    if (maxConversionRate !== null) {
      query = query.lte('conversion_rate', maxConversionRate);
    }

    // Apply date range filters
    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    // Apply pagination and ordering
    query = query.range(from, to).order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Fetch live tracking stats for each influencer
    const influencersWithStats = await Promise.all(
      (data || []).map(async (influencer: any) => {
        const { data: trackingData } = await supabaseAdmin
          .from('tracking_events')
          .select('event_type')
          .eq('affiliate_code', influencer.affiliate_code);

        const liveClicks = trackingData?.filter((e: any) => e.event_type === 'click').length || 0;
        const liveSignups = trackingData?.filter((e: any) => e.event_type === 'signup').length || 0;
        const liveQuestionnaires = trackingData?.filter((e: any) => e.event_type === 'questionnaire_completed').length || 0;
        const livePurchases = trackingData?.filter((e: any) => e.event_type === 'pdf_purchased').length || 0;

        return {
          ...influencer,
          total_clicks: liveClicks,
          total_signups: liveSignups,
          total_questionnaires: liveQuestionnaires,
          total_purchases: livePurchases,
        };
      })
    );

    const totalPages = Math.ceil((count || 0) / pageSize);

    return NextResponse.json({
      success: true,
      data: {
        influencers: influencersWithStats,
        pagination: {
          currentPage: page,
          pageSize,
          totalRecords: count || 0,
          totalPages,
        }
      }
    });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// POST /api/admin/influencers - Create new influencer and handle payout operations
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;
    
    // Handle payout operations
    if (action === 'create-payout') {
      const { influencer_id, amount, payout_method, transaction_id, notes, processed_by } = data;
      
      if (!influencer_id || !amount || !payout_method) {
        return NextResponse.json(
          { success: false, error: 'Influencer ID, amount, and payout method are required' },
          { status: 400 }
        );
      }
      
      const result = await createPayout({
        influencer_id,
        amount,
        payout_method,
        transaction_id,
        notes,
        processed_by
      });
      
      return NextResponse.json(result, { status: result.success ? 201 : 400 });
    }
    
    if (action === 'update-payout-status') {
      const { payout_id, status, transaction_id, notes } = data;
      
      if (!payout_id || !status) {
        return NextResponse.json(
          { success: false, error: 'Payout ID and status are required' },
          { status: 400 }
        );
      }
      
      const result = await updatePayoutStatus({
        payout_id,
        status,
        transaction_id,
        notes
      });
      
      return NextResponse.json(result);
    }
    
    // Default: Create new influencer
    const { name, email, phone, profile_image, bio, social_links, affiliate_code, commission_rate, payment_info } = data;

    if (!name || !email || !affiliate_code) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and affiliate code are required' },
        { status: 400 }
      );
    }

    // Check if affiliate code exists
    const { data: existingCode } = await supabaseAdmin
      .from('influencers')
      .select('id')
      .eq('affiliate_code', affiliate_code)
      .maybeSingle();

    if (existingCode) {
      return NextResponse.json(
        { success: false, error: 'Affiliate code already exists' },
        { status: 400 }
      );
    }

    // Check if email exists
    const { data: existingEmail } = await supabaseAdmin
      .from('influencers')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Create influencer
    const { data: newInfluencer, error } = await supabaseAdmin
      .from('influencers')
      .insert({
        name,
        email,
        phone: phone || null,
        profile_image: profile_image || null,
        bio: bio || null,
        social_links: social_links || null,
        affiliate_code,
        commission_rate,
        payment_info: payment_info || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: newInfluencer,
      message: 'Influencer created successfully'
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/influencers - Update existing influencer
export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const influencerId = searchParams.get('id');
    
    if (!influencerId) {
      return NextResponse.json(
        { success: false, error: 'Influencer ID is required' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const input: UpdateInfluencerInput = body;
    
    console.log('Updating influencer:', influencerId);

    // Build update object with only provided fields
    const updateData: any = { updated_at: new Date().toISOString() };
    
    if (input.name !== undefined) updateData.name = input.name;
    if (input.email !== undefined) updateData.email = input.email;
    if (input.phone !== undefined) updateData.phone = input.phone;
    if (input.profile_image !== undefined) updateData.profile_image = input.profile_image;
    if (input.bio !== undefined) updateData.bio = input.bio;
    if (input.social_links !== undefined) updateData.social_links = input.social_links;
    if (input.commission_rate !== undefined) updateData.commission_rate = input.commission_rate;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.payment_info !== undefined) updateData.payment_info = input.payment_info;

    const { data, error } = await supabaseAdmin
      .from('influencers')
      .update(updateData)
      .eq('id', influencerId)
      .select()
      .single();

    if (error) {
      console.error('Error updating influencer:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    console.log('Influencer updated successfully');
    return NextResponse.json({
      success: true,
      data: data as InfluencerData,
      message: 'Influencer updated successfully'
    });
  } catch (error: any) {
    console.error('Unexpected error in PUT /api/admin/influencers:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/influencers - Delete influencer with cascade
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const influencerId = searchParams.get('id');
    
    if (!influencerId) {
      return NextResponse.json(
        { success: false, error: 'Influencer ID is required' },
        { status: 400 }
      );
    }
    
    console.log('Starting cascade delete for influencer:', influencerId);

    // Step 1: Delete related tracking events
    console.log('Deleting tracking events...');
    const { data: influencerData } = await supabaseAdmin
      .from('influencers')
      .select('affiliate_code')
      .eq('id', influencerId)
      .single();

    if (influencerData) {
      const { error: eventsError } = await supabaseAdmin
        .from('tracking_events')
        .delete()
        .eq('affiliate_code', influencerData.affiliate_code);

      if (eventsError) {
        console.error('Error deleting tracking events:', eventsError);
        return NextResponse.json(
          { success: false, error: `Failed to delete tracking events: ${eventsError.message}` },
          { status: 500 }
        );
      }
      console.log('Deleted tracking events');
    }

    // Step 2: Delete related payouts
    console.log('Deleting payout records...');
    const { error: payoutsError } = await supabaseAdmin
      .from('influencer_payouts')
      .delete()
      .eq('influencer_id', influencerId);

    if (payoutsError) {
      console.error('Error deleting payouts:', payoutsError);
      return NextResponse.json(
        { success: false, error: `Failed to delete payout records: ${payoutsError.message}` },
        { status: 500 }
      );
    }
    console.log('Deleted payout records');

    // Step 3: Delete the influencer
    console.log('Deleting influencer record...');
    const { error } = await supabaseAdmin
      .from('influencers')
      .delete()
      .eq('id', influencerId);

    if (error) {
      console.error('Error deleting influencer:', error);
      return NextResponse.json(
        { success: false, error: `Failed to delete influencer: ${error.message}` },
        { status: 500 }
      );
    }

    console.log('Influencer deleted successfully!');
    return NextResponse.json({
      success: true,
      message: 'Influencer and all related records deleted successfully'
    });
  } catch (error: any) {
    console.error('Unexpected error in DELETE /api/admin/influencers:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

