/**
 * API Route: /api/admin/refund/stats
 * Methods: GET
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Database } from '@/integrations/supabase/types';



type RefundStats = {
  totalRefunds: number;
  completedRefunds: number;
  failedRefunds: number;
  processingRefunds: number;
  totalRefundAmount: number;
  completedRefundAmount: number;
  totalRefundAmountUSD: number;
  totalRefundAmountINR: number;
  completedRefundAmountUSD: number;
  completedRefundAmountINR: number;
};

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('refund_transactions')
      .select('refund_status, refund_amount, currency');

    if (error) {
      console.error('Error fetching refund stats:', error);
      return NextResponse.json(
        {
          totalRefunds: 0,
          completedRefunds: 0,
          failedRefunds: 0,
          processingRefunds: 0,
          totalRefundAmount: 0,
          completedRefundAmount: 0,
          totalRefundAmountUSD: 0,
          totalRefundAmountINR: 0,
          completedRefundAmountUSD: 0,
          completedRefundAmountINR: 0,
        },
        { status: 500 }
      );
    }

    const totalRefunds = data?.length || 0;
    const completedRefunds = data?.filter((r) => r.refund_status === 'completed').length || 0;
    const failedRefunds = data?.filter((r) => r.refund_status === 'failed').length || 0;
    const processingRefunds =
      data?.filter((r) => r.refund_status === 'processing' || r.refund_status === 'initiated').length || 0;

    const totalRefundAmount = data?.reduce((sum, r) => sum + (r.refund_amount || 0), 0) || 0;
    const completedRefundAmount =
      data?.filter((r) => r.refund_status === 'completed').reduce((sum, r) => sum + (r.refund_amount || 0), 0) || 0;

    const totalRefundAmountUSD =
      data?.filter((r) => r.currency === 'USD').reduce((sum, r) => sum + (r.refund_amount || 0), 0) || 0;
    const totalRefundAmountINR =
      data?.filter((r) => r.currency === 'INR').reduce((sum, r) => sum + (r.refund_amount || 0), 0) || 0;

    const completedRefundAmountUSD =
      data
        ?.filter((r) => r.refund_status === 'completed' && r.currency === 'USD')
        .reduce((sum, r) => sum + (r.refund_amount || 0), 0) || 0;
    const completedRefundAmountINR =
      data
        ?.filter((r) => r.refund_status === 'completed' && r.currency === 'INR')
        .reduce((sum, r) => sum + (r.refund_amount || 0), 0) || 0;

    const stats: RefundStats = {
      totalRefunds,
      completedRefunds,
      failedRefunds,
      processingRefunds,
      totalRefundAmount,
      completedRefundAmount,
      totalRefundAmountUSD,
      totalRefundAmountINR,
      completedRefundAmountUSD,
      completedRefundAmountINR,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Unexpected error in getRefundStats:', error);
    return NextResponse.json(
      {
        totalRefunds: 0,
        completedRefunds: 0,
        failedRefunds: 0,
        processingRefunds: 0,
        totalRefundAmount: 0,
        completedRefundAmount: 0,
        totalRefundAmountUSD: 0,
        totalRefundAmountINR: 0,
        completedRefundAmountUSD: 0,
        completedRefundAmountINR: 0,
      },
      { status: 500 }
    );
  }
}

