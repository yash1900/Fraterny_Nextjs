/**
 * API Route: /api/tracking
 * Methods: POST
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';



// Types
type EventType = 'click' | 'signup' | 'questionnaire_completed' | 'pdf_purchased';

interface TrackingEventData {
  affiliate_code: string;
  event_type: EventType;
  user_id?: string | null;
  session_id?: string | null;
  test_id?: string | null;
  ip_address?: string | null;
  device_info?: Record<string, any> | null;
  location?: string | null;
  metadata?: Record<string, any> | null;
  revenue?: number;
  commission_earned?: number;
  conversion_value?: number | null;
}

interface TrackingFilters {
  affiliate_code?: string;
  event_type?: EventType;
  user_id?: string;
  session_id?: string;
  test_id?: string;
  date_from?: string;
  date_to?: string;
  search_term?: string;
}

interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

interface TrackingStats {
  totalEvents: number;
  totalRevenue: number;
  totalCommission: number;
  eventsByType: Record<string, number>;
  topAffiliates: Array<{
    affiliate_code: string;
    event_count: number;
    total_revenue: number;
    total_commission: number;
  }>;
  recentEvents: number; // Events in last 24 hours
}

/**
 * Get device information for tracking
 */
function getDeviceInfo(userAgent: string) {
  const detectBrowser = (): string => {
    if (userAgent.indexOf('Chrome') > -1) return 'Chrome';
    if (userAgent.indexOf('Safari') > -1) return 'Safari';
    if (userAgent.indexOf('Firefox') > -1) return 'Firefox';
    if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident') > -1) return 'Internet Explorer';
    if (userAgent.indexOf('Edge') > -1) return 'Edge';
    return 'Unknown';
  };

  const detectOS = (): string => {
    if (userAgent.indexOf('Windows') > -1) return 'Windows';
    if (userAgent.indexOf('Mac') > -1) return 'Mac';
    if (userAgent.indexOf('Linux') > -1) return 'Linux';
    if (userAgent.indexOf('Android') > -1) return 'Android';
    if (userAgent.indexOf('iOS') > -1) return 'iOS';
    return 'Unknown';
  };

  const detectDeviceType = (): string => {
    if (/mobile|android|iphone|ipad|ipod/i.test(userAgent.toLowerCase())) {
      return /ipad/i.test(userAgent.toLowerCase()) ? 'tablet' : 'mobile';
    }
    return 'desktop';
  };

  return {
    browser: detectBrowser(),
    os: detectOS(),
    device_type: detectDeviceType(),
    user_agent: userAgent
  };
}

/**
 * Get user's IP address from request
 */
function getUserIP(request: NextRequest): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  const cfConnecting = request.headers.get('cf-connecting-ip');
  
  if (cfConnecting) return cfConnecting;
  if (forwarded) return forwarded.split(',')[0].trim();
  if (real) return real;
  
  return request.headers.get('remote-addr') || null;
}

/**
 * Check if user already has a signup event tracked
 */
async function hasSignupTracked(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin
      .from('tracking_events')
      .select('id')
      .eq('event_type', 'signup')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Error checking signup tracking:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('❌ Failed to check signup tracking:', error);
    return false;
  }
}

/**
 * Update influencer statistics after a payment
 */
async function updateInfluencerStats(
  affiliateCode: string,
  commissionEarned: number
): Promise<void> {
  try {
    // Fetch current influencer data
    const { data: influencer, error: fetchError } = await supabaseAdmin
      .from('influencers')
      .select('total_earnings, remaining_balance, total_purchases, total_signups')
      .eq('affiliate_code', affiliateCode)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching influencer data for', affiliateCode, ':', fetchError);
      throw new Error(`Failed to fetch influencer: ${fetchError.message}`);
    }

    if (!influencer) {
      throw new Error(`No influencer found with affiliate_code: ${affiliateCode}`);
    }

    // Calculate new values
    const currentTotalEarnings = parseFloat(influencer.total_earnings?.toString() || '0');
    const currentRemainingBalance = parseFloat(influencer.remaining_balance?.toString() || '0');
    const currentTotalPurchases = parseInt(influencer.total_purchases?.toString() || '0');
    const currentTotalSignups = parseInt(influencer.total_signups?.toString() || '0');
    
    const newTotalEarnings = currentTotalEarnings + commissionEarned;
    const newRemainingBalance = currentRemainingBalance + commissionEarned;
    const newTotalPurchases = currentTotalPurchases + 1;
    
    // Calculate conversion rate
    const newConversionRate = currentTotalSignups > 0 ? 
      Math.round((newTotalPurchases / currentTotalSignups * 100) * 100) / 100 : 0;

    // Update influencer record
    const { error: updateError } = await supabaseAdmin
      .from('influencers')
      .update({
        total_earnings: newTotalEarnings,
        remaining_balance: newRemainingBalance,
        total_purchases: newTotalPurchases,
        conversion_rate: newConversionRate,
        updated_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString()
      })
      .eq('affiliate_code', affiliateCode);

    if (updateError) {
      console.error('❌ Error updating influencer stats for', affiliateCode, ':', updateError);
      throw new Error(`Failed to update influencer: ${updateError.message}`);
    }

    console.log(`✅ Successfully updated influencer ${affiliateCode}:`, {
      commissionEarned: `$${commissionEarned.toFixed(2)}`,
      newTotalEarnings: `$${newTotalEarnings.toFixed(2)}`,
      newRemainingBalance: `$${newRemainingBalance.toFixed(2)}`,
      newTotalPurchases,
      newConversionRate: `${newConversionRate}%`
    });
  } catch (error) {
    console.error('❌ Failed to update influencer stats for', affiliateCode, ':', error);
    throw error;
  }
}

/**
 * Calculate tracking statistics
 */
async function getTrackingStats(filters?: TrackingFilters): Promise<TrackingStats> {
  try {
    // Build base query
    let query = supabaseAdmin
      .from('tracking_events')
      .select('*');
    
    // Apply filters
    if (filters?.affiliate_code) {
      query = query.eq('affiliate_code', filters.affiliate_code);
    }
    if (filters?.event_type) {
      query = query.eq('event_type', filters.event_type);
    }
    if (filters?.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    if (filters?.session_id) {
      query = query.eq('session_id', filters.session_id);
    }
    if (filters?.test_id) {
      query = query.eq('test_id', filters.test_id);
    }
    if (filters?.date_from) {
      query = query.gte('timestamp', filters.date_from);
    }
    if (filters?.date_to) {
      query = query.lte('timestamp', filters.date_to);
    }

    const { data: events, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch tracking stats: ${error.message}`);
    }

    if (!events) {
      return {
        totalEvents: 0,
        totalRevenue: 0,
        totalCommission: 0,
        eventsByType: {},
        topAffiliates: [],
        recentEvents: 0
      };
    }

    // Calculate statistics
    const totalEvents = events.length;
    const totalRevenue = events.reduce((sum, event) => sum + (parseFloat(event.revenue?.toString() || '0')), 0);
    const totalCommission = events.reduce((sum, event) => sum + (parseFloat(event.commission_earned?.toString() || '0')), 0);

    // Events by type
    const eventsByType = events.reduce((acc, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Top affiliates
    const affiliateStats = events.reduce((acc, event) => {
      const code = event.affiliate_code;
      if (!acc[code]) {
        acc[code] = {
          affiliate_code: code,
          event_count: 0,
          total_revenue: 0,
          total_commission: 0
        };
      }
      acc[code].event_count++;
      acc[code].total_revenue += parseFloat(event.revenue?.toString() || '0');
      acc[code].total_commission += parseFloat(event.commission_earned?.toString() || '0');
      return acc;
    }, {} as Record<string, any>);

    const topAffiliates = Object.values(affiliateStats)
      .sort((a: any, b: any) => b.total_revenue - a.total_revenue)
      .slice(0, 10) as Array<{ affiliate_code: string; event_count: number; total_revenue: number; total_commission: number; }>;

    // Recent events (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentEvents = events.filter(event => 
      new Date(event.timestamp) > twentyFourHoursAgo
    ).length;

    return {
      totalEvents,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalCommission: Math.round(totalCommission * 100) / 100,
      eventsByType,
      topAffiliates,
      recentEvents
    };

  } catch (error: any) {
    console.error('Error calculating tracking stats:', error);
    throw error;
  }
}

// GET - Retrieve tracking events with filters and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Check for stats operation
    const operation = searchParams.get('operation');
    if (operation === 'stats') {
      const filters: TrackingFilters = {};
      
      if (searchParams.get('affiliate_code')) filters.affiliate_code = searchParams.get('affiliate_code')!;
      if (searchParams.get('event_type')) filters.event_type = searchParams.get('event_type') as EventType;
      if (searchParams.get('user_id')) filters.user_id = searchParams.get('user_id')!;
      if (searchParams.get('session_id')) filters.session_id = searchParams.get('session_id')!;
      if (searchParams.get('test_id')) filters.test_id = searchParams.get('test_id')!;
      if (searchParams.get('date_from')) filters.date_from = searchParams.get('date_from')!;
      if (searchParams.get('date_to')) filters.date_to = searchParams.get('date_to')!;

      const stats = await getTrackingStats(filters);
      return NextResponse.json({
        success: true,
        data: stats
      });
    }

    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '50', 10);

    const filters: TrackingFilters = {};

    if (searchParams.get('affiliate_code')) filters.affiliate_code = searchParams.get('affiliate_code')!;
    if (searchParams.get('event_type')) filters.event_type = searchParams.get('event_type') as EventType;
    if (searchParams.get('user_id')) filters.user_id = searchParams.get('user_id')!;
    if (searchParams.get('session_id')) filters.session_id = searchParams.get('session_id')!;
    if (searchParams.get('test_id')) filters.test_id = searchParams.get('test_id')!;
    if (searchParams.get('date_from')) filters.date_from = searchParams.get('date_from')!;
    if (searchParams.get('date_to')) filters.date_to = searchParams.get('date_to')!;
    if (searchParams.get('search_term')) filters.search_term = searchParams.get('search_term')!;

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Build query
    let query = supabaseAdmin
      .from('tracking_events')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.affiliate_code) {
      query = query.eq('affiliate_code', filters.affiliate_code);
    }
    if (filters.event_type) {
      query = query.eq('event_type', filters.event_type);
    }
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    if (filters.session_id) {
      query = query.eq('session_id', filters.session_id);
    }
    if (filters.test_id) {
      query = query.eq('test_id', filters.test_id);
    }
    if (filters.date_from) {
      query = query.gte('timestamp', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('timestamp', filters.date_to);
    }
    if (filters.search_term && filters.search_term.trim()) {
      const searchTerm = filters.search_term.trim();
      query = query.or(
        `affiliate_code.ilike.%${searchTerm}%,user_id.ilike.%${searchTerm}%,session_id.ilike.%${searchTerm}%,test_id.ilike.%${searchTerm}%,ip_address.ilike.%${searchTerm}%`
      );
    }

    // Apply pagination and sorting
    query = query
      .range(from, to)
      .order('timestamp', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching tracking events:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    const totalRecords = count || 0;
    const totalPages = Math.ceil(totalRecords / pageSize);

    const paginationMeta: PaginationMeta = {
      currentPage: page,
      pageSize,
      totalRecords,
      totalPages,
    };

    // Calculate filtered statistics if filters are applied
    let filteredStats = null;
    if (Object.keys(filters).length > 0) {
      filteredStats = await getTrackingStats(filters);
    }

    return NextResponse.json({
      success: true,
      data: {
        events: data || [],
        pagination: paginationMeta,
        stats: filteredStats
      },
    });

  } catch (error: any) {
    console.error('Unexpected error in GET tracking:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

// POST - Create tracking event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      affiliate_code,
      event_type,
      user_id,
      session_id,
      test_id,
      metadata,
      revenue,
      commission_earned,
      conversion_value,
      location
    } = body;

    if (!affiliate_code || !event_type) {
      return NextResponse.json(
        { success: false, error: 'affiliate_code and event_type are required' },
        { status: 400 }
      );
    }

    // Get device info and IP from request
    const userAgent = request.headers.get('user-agent') || '';
    const device_info = getDeviceInfo(userAgent);
    const ip_address = getUserIP(request);

    // Duplicate prevention logic
    if (event_type === 'click') {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

      const { data: existingClick, error: checkError } = await supabaseAdmin
        .from('tracking_events')
        .select('id')
        .eq('event_type', 'click')
        .eq('affiliate_code', affiliate_code)
        .eq('ip_address', ip_address)
        .gte('timestamp', fiveMinutesAgo)
        .limit(1)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Error checking for duplicate click:', checkError);
      }

      if (existingClick) {
        console.log('⚠️ Click already tracked recently (within 5 min), skipping insertion');
        return NextResponse.json({
          success: true,
          skipped: true,
          reason: 'duplicate_click',
        });
      }
    }

    if (event_type === 'questionnaire_completed') {
      const { data: existingCompletion, error: checkError } = await supabaseAdmin
        .from('tracking_events')
        .select('id')
        .eq('event_type', 'questionnaire_completed')
        .eq('test_id', test_id)
        .eq('session_id', session_id)
        .limit(1)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Error checking for duplicate completion:', checkError);
      }

      if (existingCompletion) {
        console.log('⚠️ Questionnaire completion already tracked for this test, skipping insertion');
        return NextResponse.json({
          success: true,
          skipped: true,
          reason: 'duplicate_completion',
        });
      }
    }

    if (event_type === 'signup' && user_id) {
      const alreadyTracked = await hasSignupTracked(user_id);
      if (alreadyTracked) {
        console.log('⚠️ Signup already tracked for this user, skipping');
        return NextResponse.json({
          success: true,
          skipped: true,
          reason: 'already_tracked',
        });
      }
    }

    // Create tracking event
    const { data, error } = await supabaseAdmin
      .from('tracking_events')
      .insert([
        {
          affiliate_code,
          event_type: event_type as EventType,
          user_id: user_id || null,
          session_id: session_id || null,
          test_id: test_id || null,
          ip_address,
          device_info,
          location: location || null,
          metadata: metadata || null,
          revenue: revenue || 0.0,
          commission_earned: commission_earned || 0.0,
          conversion_value: conversion_value || null,
          timestamp: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.error('❌ Error creating tracking event:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Tracking event created:', data);

    // Update influencer stats if this is a payment event with commission
    if (event_type === 'pdf_purchased' && commission_earned && commission_earned > 0) {
      try {
        await updateInfluencerStats(affiliate_code, commission_earned);
      } catch (statsError: any) {
        console.error('⚠️ Event tracked but failed to update influencer stats:', statsError.message);
        // Don't fail the request if stats update fails
      }
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('❌ Failed to create tracking event:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
