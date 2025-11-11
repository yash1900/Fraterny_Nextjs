/**
 * API Route: /api/admin/summaries/stats
 * Methods: GET
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET /api/admin/summaries/stats
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('summary_generation')
      .select('payment_status, status, qualityscore');

    if (error) {
      return NextResponse.json({
        success: true,
        data: {
          totalSummaries: 0,
          paidSummaries: 0,
          completedSummaries: 0,
          averageQualityScore: 0,
          failedPayments: 0,
        }
      });
    }

    const totalSummaries = data?.length || 0;
    const paidSummaries = data?.filter(s => 
      s.payment_status === 'success' || s.payment_status === 'completed'
    ).length || 0;
    
    const failedPayments = data?.filter(s => 
      s.payment_status && (
        s.payment_status.toLowerCase().includes('failed') ||
        s.payment_status.toLowerCase().includes('error')
      )
    ).length || 0;
    
    const completedSummaries = data?.filter(s => 
      s.status === 'Complete' || s.status === 'completed'
    ).length || 0;

    const qualityScores = data
      ?.map(s => parseFloat(s.qualityscore || '0'))
      .filter(score => !isNaN(score) && score > 0) || [];
    
    const averageQualityScore = qualityScores.length > 0
      ? Math.round(qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalSummaries,
        paidSummaries,
        completedSummaries,
        averageQualityScore,
        failedPayments,
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 500 }
    );
  }
}

