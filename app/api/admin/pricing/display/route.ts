/**
 * API Route: /api/admin/pricing/display
 * Methods: GET
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Database } from '@/integrations/supabase/types';



type DynamicPricingData = Database['public']['Tables']['dynamic_pricing']['Row'];

type PricingDisplayData = {
  razorpay: {
    india: { price: number; displayPrice: number };
    international: { price: number; displayPrice: number };
  };
  paypal: {
    india: { price: number; displayPrice: number };
    international: { price: number; displayPrice: number };
  };
};

export async function GET(request: NextRequest) {
  try {
    const priceStatus = process.env.NEXT_PUBLIC_DYNAMIC_PRICE_STATUS;
    console.log('🔍 Price status:', priceStatus);

    if (priceStatus === 'development') {
      // Use environment variables
      console.log('📝 Using environment pricing (development mode)');

      const envPricing: PricingDisplayData = {
        razorpay: {
          india: {
            price: Number(process.env.NEXT_PUBLIC_INDIA_PRICE_PAISE) || 20000,
            displayPrice: Number(process.env.NEXT_PUBLIC_INDIA_ORIGINAL_PRICE_PAISE) || 120000,
          },
          international: {
            price: Number(process.env.NEXT_PUBLIC_INTERNATIONAL_PRICE_CENTS) || 1000,
            displayPrice: Number(process.env.NEXT_PUBLIC_INTERNATIONAL_ORIGINAL_PRICE_CENTS) || 2500,
          },
        },
        paypal: {
          india: {
            price: Number(process.env.NEXT_PUBLIC_PAYPAL_INDIA_PRICE_CENTS) || 500,
            displayPrice: Number(process.env.NEXT_PUBLIC_PAYPAL_INDIA_ORIGINAL_PRICE_CENTS) || 200,
          },
          international: {
            price: Number(process.env.NEXT_PUBLIC_PAYPAL_INTERNATIONAL_PRICE_CENTS) || 1000,
            displayPrice: Number(process.env.NEXT_PUBLIC_PAYPAL_INTERNATIONAL_ORIGINAL_PRICE_CENTS) || 2500,
          },
        },
      };

      return NextResponse.json({
        success: true,
        data: envPricing,
        source: 'environment',
      });
    } else {
      // Use database pricing
      console.log('🗄️ Using database pricing (live mode)');

      const { data, error } = await supabaseAdmin
        .from('dynamic_pricing')
        .select('*')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        console.error('❌ Error fetching active pricing:', error);
        return NextResponse.json(
          {
            success: false,
            error: error?.message || 'Failed to fetch database pricing',
            source: 'database',
          },
          { status: 500 }
        );
      }

      const activePricing = data as DynamicPricingData;

      const dbPricing: PricingDisplayData = {
        razorpay: {
          india: {
            price: activePricing.razorpay_india_price_paise,
            displayPrice: activePricing.razorpay_india_display_price_paise,
          },
          international: {
            price: activePricing.razorpay_international_price_cents,
            displayPrice: activePricing.razorpay_international_display_price_cents,
          },
        },
        paypal: {
          india: {
            price: activePricing.paypal_india_price_cents,
            displayPrice: activePricing.paypal_india_display_price_cents,
          },
          international: {
            price: activePricing.paypal_international_price_cents,
            displayPrice: activePricing.paypal_international_display_price_cents,
          },
        },
      };

      return NextResponse.json({
        success: true,
        data: dbPricing,
        source: 'database',
      });
    }
  } catch (error: any) {
    console.error('❌ Exception getting pricing for display:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to get pricing configuration',
        source: 'environment',
      },
      { status: 500 }
    );
  }
}

