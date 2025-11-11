/**
 * API Route: /api/influencer/dashboard
 * Methods: GET
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Database } from '@/integrations/supabase/types';



// GET dashboard stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const affiliateCode = searchParams.get('affiliateCode');
    const type = searchParams.get('type') || 'stats'; // stats | activity | funnel | performance

    if (!affiliateCode) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: 'Affiliate code is required',
        },
        { status: 400 }
      );
    }

    switch (type) {
      case 'stats':
        return await getDashboardStats(affiliateCode);
      case 'activity':
        const limit = parseInt(searchParams.get('limit') || '10', 10);
        return await getRecentActivity(affiliateCode, limit);
      case 'funnel':
        return await getConversionFunnel(affiliateCode);
      case 'performance':
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const dateRange = startDate && endDate ? { startDate, endDate } : undefined;
        return await getPerformanceData(affiliateCode, dateRange);
      default:
        return NextResponse.json(
          {
            success: false,
            data: null,
            error: 'Invalid type parameter',
          },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('Unexpected error in dashboard API:', error);
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

async function getDashboardStats(affiliateCode: string) {
  try {
    const { data: trackingData, error: trackingError } = await supabaseAdmin
      .from('tracking_events')
      .select('event_type, commission_earned')
      .eq('affiliate_code', affiliateCode);

    if (trackingError) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: trackingError.message,
        },
        { status: 500 }
      );
    }

    const totalClicks = trackingData?.filter((e) => e.event_type === 'click').length || 0;
    const totalSignups = trackingData?.filter((e) => e.event_type === 'signup').length || 0;
    const totalQuestionnaires =
      trackingData?.filter((e) => e.event_type === 'questionnaire_completed').length || 0;
    const totalPurchases = trackingData?.filter((e) => e.event_type === 'pdf_purchased').length || 0;

    const totalEarnings =
      trackingData
        ?.filter((e) => e.event_type === 'pdf_purchased')
        .reduce((sum, e) => sum + (e.commission_earned || 0), 0) || 0;

    const clickToSignup = totalClicks > 0 ? (totalSignups / totalClicks) * 100 : 0;
    const signupToPurchase = totalSignups > 0 ? (totalPurchases / totalSignups) * 100 : 0;
    const overallConversion = totalClicks > 0 ? (totalPurchases / totalClicks) * 100 : 0;

    const stats = {
      totalClicks,
      totalSignups,
      totalQuestionnaires,
      totalPurchases,
      totalEarnings: Number(totalEarnings.toFixed(2)),
      conversionRate: Number(overallConversion.toFixed(2)),
      clickToSignup: Number(clickToSignup.toFixed(2)),
      signupToPurchase: Number(signupToPurchase.toFixed(2)),
    };

    return NextResponse.json({
      success: true,
      data: stats,
      error: null,
    });
  } catch (error: any) {
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

async function getRecentActivity(affiliateCode: string, limit: number) {
  try {
    const { data, error } = await supabaseAdmin
      .from('tracking_events')
      .select('*')
      .eq('affiliate_code', affiliateCode)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: error.message,
        },
        { status: 500 }
      );
    }

    const activities = (data || []).map((event) => {
      let description = '';
      let earnings = undefined;

      switch (event.event_type) {
        case 'click':
          description = 'User clicked your affiliate link';
          break;
        case 'signup':
          description = 'User signed up via your link';
          break;
        case 'questionnaire_completed':
          description = 'User completed the questionnaire';
          break;
        case 'pdf_purchased':
          description = `PDF purchased - $${event.commission_earned?.toFixed(2)} commission earned`;
          earnings = event.commission_earned;
          break;
      }

      return {
        id: event.id,
        type: event.event_type,
        description,
        timestamp: event.timestamp,
        earnings,
      };
    });

    return NextResponse.json({
      success: true,
      data: activities,
      error: null,
    });
  } catch (error: any) {
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

async function getConversionFunnel(affiliateCode: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('tracking_events')
      .select('event_type')
      .eq('affiliate_code', affiliateCode);

    if (error) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: error.message,
        },
        { status: 500 }
      );
    }

    const events = data || [];
    const clicks = events.filter((e) => e.event_type === 'click').length;
    const signups = events.filter((e) => e.event_type === 'signup').length;
    const questionnaires = events.filter((e) => e.event_type === 'questionnaire_completed').length;
    const purchases = events.filter((e) => e.event_type === 'pdf_purchased').length;

    const clickToSignupRate = clicks > 0 ? (signups / clicks) * 100 : 0;
    const signupToQuestionnaireRate = signups > 0 ? (questionnaires / signups) * 100 : 0;
    const questionnaireToPurchaseRate = questionnaires > 0 ? (purchases / questionnaires) * 100 : 0;
    const overallConversionRate = clicks > 0 ? (purchases / clicks) * 100 : 0;

    const funnel = {
      clicks,
      signups,
      questionnairesCompleted: questionnaires,
      purchases,
      clickToSignupRate: Number(clickToSignupRate.toFixed(2)),
      signupToQuestionnaireRate: Number(signupToQuestionnaireRate.toFixed(2)),
      questionnaireToPurchaseRate: Number(questionnaireToPurchaseRate.toFixed(2)),
      overallConversionRate: Number(overallConversionRate.toFixed(2)),
    };

    return NextResponse.json({
      success: true,
      data: funnel,
      error: null,
    });
  } catch (error: any) {
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

async function getPerformanceData(affiliateCode: string, dateRange?: { startDate: string; endDate: string }) {
  try {
    let query = supabaseAdmin
      .from('tracking_events')
      .select('event_type, timestamp')
      .eq('affiliate_code', affiliateCode)
      .order('timestamp', { ascending: true });

    if (dateRange) {
      query = query.gte('timestamp', dateRange.startDate).lte('timestamp', dateRange.endDate);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: error.message,
        },
        { status: 500 }
      );
    }

    const groupedData: { [date: string]: { clicks: number; signups: number; purchases: number } } = {};

    (data || []).forEach((event) => {
      const date = new Date(event.timestamp).toISOString().split('T')[0];

      if (!groupedData[date]) {
        groupedData[date] = { clicks: 0, signups: 0, purchases: 0 };
      }

      switch (event.event_type) {
        case 'click':
          groupedData[date].clicks++;
          break;
        case 'signup':
          groupedData[date].signups++;
          break;
        case 'pdf_purchased':
          groupedData[date].purchases++;
          break;
      }
    });

    const performanceData = Object.entries(groupedData)
      .map(([date, counts]) => ({
        date,
        ...counts,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      success: true,
      data: performanceData,
      error: null,
    });
  } catch (error: any) {
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

