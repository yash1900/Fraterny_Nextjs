/**
 * API Route: /api/tracking/affiliate/click
 * Methods: POST
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Database } from '@/integrations/supabase/types';



export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { affiliate_code, session_id, ip_address, device_info, location, metadata } = body;

    if (!affiliate_code) {
      return NextResponse.json(
        { success: false, error: 'affiliate_code is required' },
        { status: 400 }
      );
    }

    // Duplicate prevention for clicks: Check if same IP + affiliate_code exists in last 5 minutes
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

    // No duplicate found, proceed with insertion
    const { data, error } = await supabaseAdmin
      .from('tracking_events')
      .insert([
        {
          affiliate_code,
          event_type: 'click',
          user_id: null,
          session_id: session_id || null,
          test_id: null,
          ip_address: ip_address || null,
          device_info: device_info || null,
          location: location || null,
          metadata: metadata || null,
          revenue: 0.0,
          commission_earned: 0.0,
          conversion_value: null,
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

