/**
 * API Route: /api/quest/payment-status/[testId]
 * Checks payment status from summary_generation table
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ testId: string }> }
) {
  try {
    const { testId } = await params;

    if (!testId) {
      return NextResponse.json(
        { success: false, error: 'TestId is required' },
        { status: 400 }
      );
    }

    console.log(`📡 Checking payment status for testId: ${testId}`);

    // Query summary_generation table
    const { data, error } = await supabaseAdmin
      .from('summary_generation')
      .select('payment_status, quest_pdf, quest_status')
      .eq('testid', testId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No record found
        console.log(`⚠️ No summary record found for testId: ${testId}`);
        return NextResponse.json({
          success: true,
          ispaymentdone: null,
          quest_pdf: null,
          quest_status: null
        });
      }

      console.error('❌ Database error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ Found record - payment_status: ${data.payment_status}, quest_status: ${data.quest_status}`);

    // Return payment status
    return NextResponse.json({
      success: true,
      ispaymentdone: data.payment_status === 'success' ? 'success' : null,
      quest_pdf: data.quest_pdf || null,
      quest_status: data.quest_status || null,
      payment_status: data.payment_status
    });

  } catch (error: any) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
