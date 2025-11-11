/**
 * API Route: /api/tracking/utils
 * Methods: POST
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';



/**
 * Get user's IP address using external service
 */
async function fetchUserIP(): Promise<string | null> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Failed to get IP address:', error);
    return null;
  }
}

/**
 * Calculate commission for tracking events
 * This is a basic implementation - you can integrate with your commission service
 */
async function calculateCommission(
  amountInSmallestUnit: number,
  currency: 'INR' | 'USD',
  affiliateCode: string
): Promise<{
  amountInUSD: number;
  commissionInUSD: number;
  commissionRate: number;
  exchangeRate: number;
}> {
  try {
    // Get influencer commission rate
    const { data: influencer, error } = await supabaseAdmin
      .from('influencers')
      .select('commission_rate')
      .eq('affiliate_code', affiliateCode)
      .single();

    if (error || !influencer) {
      console.warn(`Influencer not found for ${affiliateCode}, using default commission rate`);
    }

    const commissionRate = influencer?.commission_rate || 0.1; // Default 10%

    // Convert to base amount
    const baseAmount = currency === 'INR' 
      ? amountInSmallestUnit / 100  // paise to rupees
      : amountInSmallestUnit / 100; // cents to dollars

    let amountInUSD = baseAmount;
    let exchangeRate = 1;

    // Convert to USD if needed
    if (currency === 'INR') {
      // Use a simple exchange rate - in production, you'd fetch from a real API
      exchangeRate = 0.012; // Approximate INR to USD rate
      amountInUSD = baseAmount * exchangeRate;
    }

    const commissionInUSD = amountInUSD * commissionRate;

    return {
      amountInUSD: Math.round(amountInUSD * 100) / 100,
      commissionInUSD: Math.round(commissionInUSD * 100) / 100,
      commissionRate,
      exchangeRate
    };
  } catch (error) {
    console.error('Error calculating commission:', error);
    // Return default values
    const baseAmount = currency === 'INR' ? amountInSmallestUnit / 100 : amountInSmallestUnit / 100;
    const amountInUSD = currency === 'INR' ? baseAmount * 0.012 : baseAmount;
    return {
      amountInUSD: Math.round(amountInUSD * 100) / 100,
      commissionInUSD: Math.round(amountInUSD * 0.1 * 100) / 100,
      commissionRate: 0.1,
      exchangeRate: currency === 'INR' ? 0.012 : 1
    };
  }
}

// GET - Get utility data (IP, device info, etc.)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const operation = searchParams.get('operation');

    if (operation === 'ip') {
      const ip = await fetchUserIP();
      return NextResponse.json({
        success: true,
        data: { ip }
      });
    }

    if (operation === 'device') {
      const userAgent = request.headers.get('user-agent') || '';
      
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

      const deviceInfo = {
        browser: detectBrowser(),
        os: detectOS(),
        device_type: detectDeviceType(),
        user_agent: userAgent
      };

      return NextResponse.json({
        success: true,
        data: deviceInfo
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid operation. Use ?operation=ip or ?operation=device'
      },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Error in tracking utils:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}

// POST - Specialized tracking functions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation } = body;

    if (operation === 'signup') {
      const { user_id, session_id, test_id, affiliate_code } = body;

      if (!user_id || !affiliate_code) {
        return NextResponse.json(
          {
            success: false,
            error: 'user_id and affiliate_code are required for signup tracking'
          },
          { status: 400 }
        );
      }

      // Check if user already has signup event
      const { data: existingSignup } = await supabaseAdmin
        .from('tracking_events')
        .select('id')
        .eq('event_type', 'signup')
        .eq('user_id', user_id)
        .limit(1)
        .maybeSingle();

      if (existingSignup) {
        return NextResponse.json({
          success: true,
          skipped: true,
          reason: 'already_tracked'
        });
      }

      // Get device info and IP
      const userAgent = request.headers.get('user-agent') || '';
      const device_info = {
        browser: userAgent.indexOf('Chrome') > -1 ? 'Chrome' : 'Other',
        os: userAgent.indexOf('Windows') > -1 ? 'Windows' : 'Other',
        device_type: /mobile/i.test(userAgent) ? 'mobile' : 'desktop',
        user_agent: userAgent
      };

      // Get IP from headers or external service
      const forwarded = request.headers.get('x-forwarded-for');
      const ip_address = forwarded ? forwarded.split(',')[0].trim() : await fetchUserIP();

      // Create signup tracking event
      const { data, error } = await supabaseAdmin
        .from('tracking_events')
        .insert([
          {
            affiliate_code,
            event_type: 'signup',
            user_id,
            session_id: session_id || null,
            test_id: test_id || null,
            ip_address,
            device_info,
            metadata: {
              signup_time: new Date().toISOString()
            },
            timestamp: new Date().toISOString(),
          },
        ])
        .select();

      if (error) {
        console.error('❌ Error creating signup tracking:', error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data
      });
    }

    if (operation === 'payment') {
      const {
        user_id,
        session_id,
        test_id,
        affiliate_code,
        gateway,
        amount_in_smallest_unit,
        currency
      } = body;

      if (!user_id || !affiliate_code || !gateway || !amount_in_smallest_unit || !currency) {
        return NextResponse.json(
          {
            success: false,
            error: 'user_id, affiliate_code, gateway, amount_in_smallest_unit, and currency are required'
          },
          { status: 400 }
        );
      }

      // Calculate commission
      const commissionResult = await calculateCommission(
        amount_in_smallest_unit,
        currency,
        affiliate_code
      );

      // Get device info and IP
      const userAgent = request.headers.get('user-agent') || '';
      const device_info = {
        browser: userAgent.indexOf('Chrome') > -1 ? 'Chrome' : 'Other',
        os: userAgent.indexOf('Windows') > -1 ? 'Windows' : 'Other',
        device_type: /mobile/i.test(userAgent) ? 'mobile' : 'desktop',
        user_agent: userAgent
      };

      const forwarded = request.headers.get('x-forwarded-for');
      const ip_address = forwarded ? forwarded.split(',')[0].trim() : await fetchUserIP();

      // Create payment tracking event
      const { data, error } = await supabaseAdmin
        .from('tracking_events')
        .insert([
          {
            affiliate_code,
            event_type: 'pdf_purchased',
            user_id,
            session_id: session_id || null,
            test_id: test_id || null,
            ip_address,
            device_info,
            revenue: commissionResult.amountInUSD,
            commission_earned: commissionResult.commissionInUSD,
            conversion_value: commissionResult.amountInUSD,
            metadata: {
              gateway,
              original_currency: currency,
              original_amount: amount_in_smallest_unit,
              commission_rate: commissionResult.commissionRate,
              exchange_rate: commissionResult.exchangeRate,
              payment_time: new Date().toISOString()
            },
            timestamp: new Date().toISOString(),
          },
        ])
        .select();

      if (error) {
        console.error('❌ Error creating payment tracking:', error);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }

      // Update influencer stats
      try {
        await updateInfluencerStats(affiliate_code, commissionResult.commissionInUSD);
      } catch (statsError: any) {
        console.error('⚠️ Payment tracked but failed to update influencer stats:', statsError);
        // Don't fail the request if stats update fails
      }

      return NextResponse.json({
        success: true,
        data: data,
        commission: commissionResult
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid operation. Use operation: "signup" or "payment"'
      },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Error in specialized tracking:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'An unexpected error occurred'
      },
      { status: 500 }
    );
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
