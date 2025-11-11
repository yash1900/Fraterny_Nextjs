/**
 * API Route: /api/admin/influencers/stats
 * Methods: GET
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET /api/admin/influencers/stats
export async function GET(request: NextRequest) {
  try {
    const { data: influencersData } = await supabaseAdmin
      .from('influencers')
      .select('status');

    const totalInfluencers = influencersData?.length || 0;
    const activeInfluencers = influencersData?.filter(inf => inf.status === 'active').length || 0;

    const { data: eventsData } = await supabaseAdmin
      .from('tracking_events')
      .select('event_type, revenue, commission_earned');

    const totalClicks = eventsData?.filter(e => e.event_type === 'click').length || 0;
    const totalSignups = eventsData?.filter(e => e.event_type === 'signup').length || 0;
    const totalQuestionnaires = eventsData?.filter(e => e.event_type === 'questionnaire_completed').length || 0;
    const totalPurchases = eventsData?.filter(e => e.event_type === 'pdf_purchased').length || 0;

    const totalRevenue = eventsData?.reduce((sum, event) => sum + (event.revenue || 0), 0) || 0;
    const totalCommissions = eventsData?.reduce((sum, event) => sum + (event.commission_earned || 0), 0) || 0;

    const averageConversionRate = totalClicks > 0 ? (totalPurchases / totalClicks) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalInfluencers,
        activeInfluencers,
        totalRevenue,
        totalCommissions,
        totalClicks,
        totalSignups,
        totalQuestionnaires,
        totalPurchases,
        averageConversionRate: Number(averageConversionRate.toFixed(2)),
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 500 }
    );
  }
}

