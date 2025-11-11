/**
 * API Route: /api/public/affiliate/validate
 * Methods: GET
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Database } from '@/integrations/supabase/types';



export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        {
          valid: false,
          error: 'Affiliate code is required',
        },
        { status: 400 }
      );
    }

    // Check if affiliate code exists and is active
    const { data, error } = await supabaseAdmin
      .from('influencers')
      .select('id, affiliate_code, full_name, email, is_active')
      .eq('affiliate_code', code)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return NextResponse.json({
          valid: false,
          message: 'Invalid affiliate code',
        });
      }

      console.error('❌ Error validating affiliate code:', error);
      return NextResponse.json(
        {
          valid: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      valid: true,
      affiliate: {
        code: data.affiliate_code,
        name: data.full_name,
      },
    });
  } catch (error: any) {
    console.error('❌ Error validating affiliate code:', error);
    return NextResponse.json(
      {
        valid: false,
        error: error.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

