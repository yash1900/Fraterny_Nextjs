/**
 * API Route: /api/tracking/affiliate/signup
 * Methods: POST
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Database } from '@/integrations/supabase/types';



export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, session_id, test_id, affiliate_code, ip_address, device_info, location, metadata } = body;

    if (!user_id || !affiliate_code) {
      return NextResponse.json(
        { success: false, error: 'user_id and affiliate_code are required' },
        { status: 400 }
      );
    }

    console.log('🔍 Checking if signup already tracked for user:', user_id);

    // Check if user already has signup event
    const { data: existingSignup, error: checkError } = await supabaseAdmin
      .from('tracking_events')
      .select('id')
      .eq('event_type', 'signup')
      .eq('user_id', user_id)
      .limit(1)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking signup tracking:', checkError);
    }

    if (existingSignup) {
      console.log('⚠️ Signup already tracked for this user, skipping');
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: 'already_tracked',
      });
    }

    console.log('✅ Tracking new signup event for user:', user_id);

    // Track signup event
    const { data, error } = await supabaseAdmin
      .from('tracking_events')
      .insert([
        {
          affiliate_code,
          event_type: 'signup',
          user_id,
          session_id: session_id || null,
          test_id: test_id || null,
          ip_address: ip_address || null,
          device_info: device_info || null,
          location: location || null,
          metadata: {
            ...(metadata || {}),
            signup_time: new Date().toISOString(),
          },
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

    console.log('✅ Signup tracked successfully for affiliate:', affiliate_code);
    
    // Update influencer's total_signups
    await updateInfluencerSignups(affiliate_code);

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('❌ Failed to track signup:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

async function updateInfluencerSignups(affiliateCode: string): Promise<void> {
  try {
    const { data: influencer, error: fetchError } = await supabaseAdmin
      .from('influencers')
      .select('total_signups, total_purchases')
      .eq('affiliate_code', affiliateCode)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching influencer:', fetchError);
      return;
    }

    if (!influencer) {
      console.error('❌ No influencer found with code:', affiliateCode);
      return;
    }

    const newTotalSignups = (influencer.total_signups || 0) + 1;
    const totalPurchases = influencer.total_purchases || 0;
    const newConversionRate = newTotalSignups > 0 
      ? Math.round((totalPurchases / newTotalSignups * 100) * 100) / 100 
      : 0;

    const { error: updateError } = await supabaseAdmin
      .from('influencers')
      .update({
        total_signups: newTotalSignups,
        conversion_rate: newConversionRate,
        updated_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
      })
      .eq('affiliate_code', affiliateCode);

    if (updateError) {
      console.error('❌ Error updating influencer signups:', updateError);
    } else {
      console.log(`✅ Updated influencer ${affiliateCode}: signups = ${newTotalSignups}`);
    }
  } catch (error) {
    console.error('❌ Failed to update influencer signups:', error);
  }
}

