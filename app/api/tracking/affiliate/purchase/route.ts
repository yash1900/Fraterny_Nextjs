/**
 * API Route: /api/tracking/affiliate/purchase
 * Methods: POST
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Database } from '@/integrations/supabase/types';



type CommissionResult = {
  amountInUSD: number;
  commissionInUSD: number;
  commissionRate: number;
  currency: 'INR' | 'USD';
  exchangeRate?: number;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_id,
      session_id,
      test_id,
      affiliate_code,
      gateway,
      amount,
      currency,
      ip_address,
      device_info,
      location,
      metadata,
    } = body;

    if (!user_id || !affiliate_code || !amount || !currency) {
      return NextResponse.json(
        { success: false, error: 'user_id, affiliate_code, amount, and currency are required' },
        { status: 400 }
      );
    }

    console.log('💳 Tracking payment event:', {
      user_id,
      gateway,
      amount,
      currency,
      affiliate_code,
    });

    // Calculate commission
    const commissionResult = await calculateCommission(amount, currency as 'INR' | 'USD', affiliate_code);

    console.log('💰 Commission calculated:', commissionResult);

    // Track payment event
    const { data, error } = await supabaseAdmin
      .from('tracking_events')
      .insert([
        {
          affiliate_code,
          event_type: 'pdf_purchased',
          user_id,
          session_id: session_id || null,
          test_id: test_id || null,
          ip_address: ip_address || null,
          device_info: device_info || null,
          location: location || null,
          revenue: commissionResult.amountInUSD,
          commission_earned: commissionResult.commissionInUSD,
          conversion_value: commissionResult.amountInUSD,
          metadata: {
            ...(metadata || {}),
            gateway,
            original_currency: currency,
            original_amount: amount,
            commission_rate: commissionResult.commissionRate,
            exchange_rate: commissionResult.exchangeRate,
            payment_time: new Date().toISOString(),
          },
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

    console.log('✅ Payment tracked successfully for affiliate:', affiliate_code);

    // Update influencer's total earnings and statistics
    await updateInfluencerStats(affiliate_code, commissionResult.commissionInUSD);

    return NextResponse.json({
      success: true,
      data,
      commission: commissionResult,
    });
  } catch (error: any) {
    console.error('❌ Failed to track payment:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

async function calculateCommission(
  amount: number,
  currency: 'INR' | 'USD',
  affiliateCode: string
): Promise<CommissionResult> {
  try {
    // Fetch commission rate
    const commissionRatePercent = await getCommissionRate(affiliateCode);
    const commissionRate = commissionRatePercent / 100;

    let amountInUSD: number;
    let exchangeRate: number | undefined;

    if (currency === 'INR') {
      // India payment - convert to USD
      exchangeRate = await getExchangeRate();
      amountInUSD = convertINRtoUSD(amount, exchangeRate);

      console.log('💱 INR Conversion:', {
        amountInPaise: amount,
        amountInRupees: amount / 100,
        exchangeRate,
        amountInUSD,
      });
    } else {
      // International payment - already in USD cents
      amountInUSD = amount / 100;

      console.log('💵 USD Payment:', {
        amountInCents: amount,
        amountInUSD,
      });
    }

    // Calculate commission
    const commissionInUSD = amountInUSD * commissionRate;

    // Round to 2 decimals
    const roundedAmount = Math.round(amountInUSD * 100) / 100;
    const roundedCommission = Math.round(commissionInUSD * 100) / 100;

    console.log('💰 Commission Calculation:', {
      amountInUSD: roundedAmount,
      commissionRate: `${commissionRatePercent}%`,
      commissionInUSD: roundedCommission,
    });

    return {
      amountInUSD: roundedAmount,
      commissionInUSD: roundedCommission,
      commissionRate: commissionRatePercent,
      currency,
      exchangeRate,
    };
  } catch (error) {
    console.error('❌ Failed to calculate commission:', error);
    throw error;
  }
}

async function getExchangeRate(): Promise<number> {
  try {
    const { data, error } = await supabaseAdmin.from('additional').select('usdinr').single();

    if (error) {
      console.error('❌ Error fetching exchange rate:', error);
      return 83.5; // Fallback rate
    }

    const rate = parseFloat(data.usdinr);
    console.log('💱 Exchange rate fetched:', `1 USD = ${rate} INR`);
    return rate;
  } catch (error) {
    console.error('❌ Failed to fetch exchange rate:', error);
    return 83.5; // Fallback rate
  }
}

async function getCommissionRate(affiliateCode: string): Promise<number> {
  try {
    const { data, error } = await supabaseAdmin
      .from('influencers')
      .select('commission_rate')
      .eq('affiliate_code', affiliateCode)
      .single();

    if (error) {
      console.error('❌ Error fetching commission rate:', error);
      return 30.0; // Default 30%
    }

    console.log(`💰 Commission rate for ${affiliateCode}:`, `${data.commission_rate}%`);
    return parseFloat(data.commission_rate.toString());
  } catch (error) {
    console.error('❌ Failed to fetch commission rate:', error);
    return 30.0; // Default 30%
  }
}

function convertINRtoUSD(amountInPaise: number, exchangeRate: number): number {
  const amountInRupees = amountInPaise / 100;
  const amountInUSD = amountInRupees / exchangeRate;
  return amountInUSD;
}

async function updateInfluencerStats(affiliateCode: string, commissionEarned: number): Promise<void> {
  try {
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

    const currentTotalEarnings = parseFloat(influencer.total_earnings?.toString() || '0');
    const currentRemainingBalance = parseFloat(influencer.remaining_balance?.toString() || '0');
    const currentTotalPurchases = parseInt(influencer.total_purchases?.toString() || '0');
    const currentTotalSignups = parseInt(influencer.total_signups?.toString() || '0');

    const newTotalEarnings = currentTotalEarnings + commissionEarned;
    const newRemainingBalance = currentRemainingBalance + commissionEarned;
    const newTotalPurchases = currentTotalPurchases + 1;

    const newConversionRate =
      currentTotalSignups > 0 ? Math.round((newTotalPurchases / currentTotalSignups) * 100 * 100) / 100 : 0;

    const { error: updateError } = await supabaseAdmin
      .from('influencers')
      .update({
        total_earnings: newTotalEarnings,
        remaining_balance: newRemainingBalance,
        total_purchases: newTotalPurchases,
        conversion_rate: newConversionRate,
        updated_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
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
      newConversionRate: `${newConversionRate}%`,
    });
  } catch (error) {
    console.error('❌ Failed to update influencer stats for', affiliateCode, ':', error);
    throw error;
  }
}

