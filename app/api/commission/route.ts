/**
 * API Route: /api/commission
 * Methods: GET, POST
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';



/**
 * Commission calculation result interface
 */
export interface CommissionResult {
  amountInUSD: number;        // Payment amount in USD (2 decimals)
  commissionInUSD: number;    // Commission amount in USD (2 decimals)
  commissionRate: number;     // Commission rate percentage
  currency: 'INR' | 'USD';    // Original currency
  exchangeRate?: number;      // Exchange rate used (if INR)
}

/**
 * Convert INR to USD
 */
function convertINRtoUSD(amountInPaise: number, exchangeRate: number): number {
  // Convert paise to rupees: 100 paise = 1 rupee
  const amountInRupees = amountInPaise / 100;
  
  // Convert rupees to USD: amountInRupees / exchangeRate
  const amountInUSD = amountInRupees / exchangeRate;
  
  return amountInUSD;
}

/**
 * Round to 2 decimal places (standard rounding)
 */
function roundToTwoDecimals(num: number): number {
  return Math.round(num * 100) / 100;
}

/**
 * Fetch current USD to INR exchange rate from database
 */
async function getExchangeRate(): Promise<number> {
  try {
    const { data, error } = await supabaseAdmin
      .from('additional')
      .select('usdinr')
      .single();

    if (error) {
      console.error('❌ Error fetching exchange rate:', error);
      // Fallback rate if DB fetch fails
      return 83.50;
    }

    const rate = parseFloat(data.usdinr);
    console.log('💱 Exchange rate fetched:', `1 USD = ${rate} INR`);
    return rate;
  } catch (error) {
    console.error('❌ Failed to fetch exchange rate:', error);
    return 83.50; // Fallback rate
  }
}

/**
 * Get commission rate for an affiliate
 */
async function getCommissionRate(affiliateCode: string): Promise<number> {
  try {
    const { data, error } = await supabaseAdmin
      .from('influencers')
      .select('commission_rate')
      .eq('affiliate_code', affiliateCode)
      .single();

    if (error) {
      console.error('❌ Error fetching commission rate:', error);
      return 30.00; // Default 30%
    }

    console.log(`💰 Commission rate for ${affiliateCode}:`, `${data.commission_rate}%`);
    return parseFloat(data.commission_rate.toString());
  } catch (error) {
    console.error('❌ Failed to fetch commission rate:', error);
    return 30.00; // Default 30%
  }
}

/**
 * Calculate commission in USD
 */
async function calculateCommission(
  amount: number,                    // Amount in smallest unit (paise for INR, cents for USD)
  currency: 'INR' | 'USD',
  affiliateCode: string
): Promise<CommissionResult> {
  try {
    // Fetch commission rate
    const commissionRatePercent = await getCommissionRate(affiliateCode);
    const commissionRate = commissionRatePercent / 100; // Convert to decimal (30% -> 0.30)

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
        amountInUSD: amountInUSD
      });
    } else {
      // International payment - already in USD cents
      amountInUSD = amount / 100; // Convert cents to dollars
      
      console.log('💵 USD Payment:', {
        amountInCents: amount,
        amountInUSD: amountInUSD
      });
    }

    // Calculate commission
    const commissionInUSD = amountInUSD * commissionRate;

    // Round to 2 decimals
    const roundedAmount = roundToTwoDecimals(amountInUSD);
    const roundedCommission = roundToTwoDecimals(commissionInUSD);

    console.log('💰 Commission Calculation:', {
      amountInUSD: roundedAmount,
      commissionRate: `${commissionRatePercent}%`,
      commissionInUSD: roundedCommission
    });

    return {
      amountInUSD: roundedAmount,
      commissionInUSD: roundedCommission,
      commissionRate: commissionRatePercent,
      currency,
      exchangeRate
    };
  } catch (error) {
    console.error('❌ Failed to calculate commission:', error);
    throw error;
  }
}

// GET - Fetch exchange rate or commission rate
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const operation = searchParams.get('operation');

    // Get exchange rate
    if (operation === 'exchange-rate') {
      const rate = await getExchangeRate();
      
      return NextResponse.json({
        success: true,
        data: {
          rate,
          currency: 'USD to INR'
        }
      });
    }

    // Get commission rate for affiliate
    if (operation === 'commission-rate') {
      const affiliateCode = searchParams.get('affiliate_code');
      
      if (!affiliateCode) {
        return NextResponse.json(
          {
            success: false,
            error: 'affiliate_code is required for commission-rate operation'
          },
          { status: 400 }
        );
      }

      const rate = await getCommissionRate(affiliateCode);
      
      return NextResponse.json({
        success: true,
        data: {
          affiliateCode,
          commissionRate: rate
        }
      });
    }

    // Invalid operation
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid operation. Use ?operation=exchange-rate or ?operation=commission-rate&affiliate_code=CODE'
      },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('❌ Error in commission GET:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}

// POST - Calculate commission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency, affiliate_code, operation } = body;

    // Convert currency operation
    if (operation === 'convert') {
      if (!amount || !currency) {
        return NextResponse.json(
          {
            success: false,
            error: 'amount and currency are required for convert operation'
          },
          { status: 400 }
        );
      }

      if (currency !== 'INR' && currency !== 'USD') {
        return NextResponse.json(
          {
            success: false,
            error: 'currency must be either INR or USD'
          },
          { status: 400 }
        );
      }

      const exchangeRate = await getExchangeRate();
      
      let result;
      if (currency === 'INR') {
        const amountInUSD = convertINRtoUSD(amount, exchangeRate);
        result = {
          originalAmount: amount,
          originalCurrency: 'INR',
          convertedAmount: roundToTwoDecimals(amountInUSD),
          convertedCurrency: 'USD',
          exchangeRate
        };
      } else {
        const amountInCents = amount / 100;
        result = {
          originalAmount: amount,
          originalCurrency: 'USD',
          convertedAmount: roundToTwoDecimals(amountInCents),
          convertedCurrency: 'USD',
          exchangeRate: null
        };
      }

      return NextResponse.json({
        success: true,
        data: result
      });
    }

    // Calculate commission operation
    if (!amount || !currency || !affiliate_code) {
      return NextResponse.json(
        {
          success: false,
          error: 'amount, currency, and affiliate_code are required'
        },
        { status: 400 }
      );
    }

    if (currency !== 'INR' && currency !== 'USD') {
      return NextResponse.json(
        {
          success: false,
          error: 'currency must be either INR or USD'
        },
        { status: 400 }
      );
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'amount must be a positive number'
        },
        { status: 400 }
      );
    }

    const result = await calculateCommission(amount, currency, affiliate_code);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error('❌ Error calculating commission:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}

