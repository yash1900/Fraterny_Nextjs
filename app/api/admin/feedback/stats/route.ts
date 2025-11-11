/**
 * API Route: /api/admin/feedback/stats
 * Methods: GET
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Database } from '@/integrations/supabase/types';



type FeedbackStats = {
  totalFeedbacks: number;
  averageRating: number;
  ratingDistribution: {
    rating1: number;
    rating2: number;
    rating3: number;
    rating4: number;
    rating5: number;
  };
  feedbacksWithTestId: number;
  feedbacksWithoutTestId: number;
  recentFeedbacks: number; // Last 7 days
};

export async function GET(request: NextRequest) {
  try {
    // Get total feedback count and average rating
    const { data: totalData, error: totalError } = await supabaseAdmin
      .from('summary_overall_feedback')
      .select('id, rating', { count: 'exact' });

    if (totalError) {
      console.error('Error fetching total feedback stats:', totalError);
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: totalError.message,
        },
        { status: 500 }
      );
    }

    const totalFeedbacks = totalData?.length || 0;

    // Calculate average rating and distribution
    const ratings = totalData?.map(f => parseInt(f.rating || '0')).filter(r => r > 0) || [];
    const averageRating = ratings.length > 0
      ? parseFloat((ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1))
      : 0;

    const ratingDistribution = {
      rating1: ratings.filter(r => r === 1).length,
      rating2: ratings.filter(r => r === 2).length,
      rating3: ratings.filter(r => r === 3).length,
      rating4: ratings.filter(r => r === 4).length,
      rating5: ratings.filter(r => r === 5).length,
    };

    // Get count with and without test IDs
    const { count: withTestIdCount } = await supabaseAdmin
      .from('summary_overall_feedback')
      .select('id', { count: 'exact' })
      .not('testid', 'is', null);

    const feedbacksWithTestId = withTestIdCount || 0;
    const feedbacksWithoutTestId = totalFeedbacks - feedbacksWithTestId;

    // Get recent feedback count (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: recentCount } = await supabaseAdmin
      .from('summary_overall_feedback')
      .select('id', { count: 'exact' })
      .gte('created_at', sevenDaysAgo.toISOString());

    const recentFeedbacks = recentCount || 0;

    const stats: FeedbackStats = {
      totalFeedbacks,
      averageRating,
      ratingDistribution,
      feedbacksWithTestId,
      feedbacksWithoutTestId,
      recentFeedbacks,
    };

    return NextResponse.json({
      success: true,
      data: stats,
      error: null,
    });
  } catch (error: any) {
    console.error('Unexpected error in fetchFeedbackStats:', error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: error?.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

