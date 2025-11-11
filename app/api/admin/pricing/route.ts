/**
 * API Route: /api/admin/pricing
 * Methods: GET, POST, PUT
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Database } from '@/integrations/supabase/types';



type DynamicPricingData = Database['public']['Tables']['dynamic_pricing']['Row'];

type PricingUpdateData = {
  razorpay_india_price_paise: number;
  razorpay_india_display_price_paise: number;
  razorpay_international_price_cents: number;
  razorpay_international_display_price_cents: number;
  paypal_india_price_cents: number;
  paypal_india_display_price_cents: number;
  paypal_international_price_cents: number;
  paypal_international_display_price_cents: number;
  updated_by: string;
  notes?: string;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    if (activeOnly) {
      console.log('🔄 Fetching active pricing configuration...');

      const { data, error } = await supabaseAdmin
        .from('dynamic_pricing')
        .select('*')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('❌ Error fetching active pricing:', error);
        return NextResponse.json(
          {
            success: false,
            error: error.message || 'Failed to fetch pricing configuration',
          },
          { status: 500 }
        );
      }

      if (!data) {
        console.error('❌ No active pricing configuration found');
        return NextResponse.json(
          {
            success: false,
            error: 'No active pricing configuration found',
          },
          { status: 404 }
        );
      }

      console.log('✅ Active pricing fetched successfully');
      return NextResponse.json({
        success: true,
        data: data as DynamicPricingData,
      });
    } else {
      console.log('🔄 Fetching pricing history...');

      const { data, error } = await supabaseAdmin
        .from('dynamic_pricing')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching pricing history:', error);
        return NextResponse.json(
          {
            success: false,
            error: error.message || 'Failed to fetch pricing history',
          },
          { status: 500 }
        );
      }

      console.log('✅ Pricing history fetched successfully');
      return NextResponse.json({
        success: true,
        data: data as DynamicPricingData[],
      });
    }
  } catch (error: any) {
    console.error('❌ Exception fetching pricing:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch pricing configuration',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const updateData: PricingUpdateData = body;

    console.log('🔄 Updating pricing configuration...', updateData);

    // First, deactivate all existing configurations
    const { error: deactivateError } = await supabaseAdmin
      .from('dynamic_pricing')
      .update({ is_active: false })
      .eq('is_active', true);

    if (deactivateError) {
      console.error('❌ Error deactivating old pricing:', deactivateError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to deactivate existing pricing',
        },
        { status: 500 }
      );
    }

    // Insert new active configuration
    const { data, error } = await supabaseAdmin
      .from('dynamic_pricing')
      .insert({
        ...updateData,
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) {
      console.error('❌ Error inserting new pricing:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Failed to update pricing configuration',
        },
        { status: 500 }
      );
    }

    console.log('✅ Pricing updated successfully');
    return NextResponse.json({
      success: true,
      data: data as DynamicPricingData,
    });
  } catch (error: any) {
    console.error('❌ Exception updating pricing:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update pricing configuration',
      },
      { status: 500 }
    );
  }
}

