/**
 * API Route: /api/analytics
 * Methods: GET
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';



/**
 * Analytics data interfaces
 */
interface TrafficDataPoint {
  name: string;
  visits: number;
  signups: number;
  conversion?: number;
}

interface DistributionDataPoint {
  name: string;
  value: number;
}

interface TopPageData {
  path: string;
  pageTitle: string;
  views: number;
  exitRate: number;
  avgTimeOnPage: number;
}

interface AnalyticsOverview {
  totalVisits: number;
  averageSessionTime: string;
  bounceRate: string;
  conversionRate: string;
  pagesPerSession: number;
  averageTimeOnSite: number;
  mobileConversionRate: number;
  percentChange: {
    visits: number;
    sessionTime: number;
    bounceRate: number;
    conversionRate: number;
  };
}

interface PageViewEvent {
  path: string;
  title: string;
  timestamp: string;
  session_id: string;
  user_agent?: string;
  ip_address?: string;
  referrer?: string;
}

interface SignupEvent {
  user_id: string;
  timestamp: string;
  session_id: string;
  referrer?: string;
}

/**
 * Calculate date range start based on period
 */
function getStartDateByPeriod(endDate: Date, period: string): Date {
  const startDate = new Date(endDate);
  
  switch (period) {
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(startDate.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(startDate.getDate() - 90);
      break;
    case 'ytd':
      startDate.setMonth(0, 1); // January 1st of current year
      break;
    case 'all':
      startDate.setFullYear(2020, 0, 1); // Set to a far past date
      break;
    default:
      startDate.setDate(startDate.getDate() - 7);
  }
  
  return startDate;
}

/**
 * Get device info from user agent
 */
function getDeviceInfo(userAgent: string) {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);
  
  if (isTablet) return 'tablet';
  if (isMobile) return 'mobile';
  return 'desktop';
}

// GET - Retrieve analytics data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const operation = searchParams.get('operation');
    const period = searchParams.get('period') || '7d';

    // Get overview metrics
    if (operation === 'overview') {
      // This is a placeholder implementation
      // In production, you'd calculate these from stored analytics data
      const overview: AnalyticsOverview = {
        totalVisits: 0,
        averageSessionTime: '0 sec',
        bounceRate: '0%',
        conversionRate: '0%',
        pagesPerSession: 0,
        averageTimeOnSite: 0,
        mobileConversionRate: 0,
        percentChange: {
          visits: 0,
          sessionTime: 0,
          bounceRate: 0,
          conversionRate: 0
        }
      };

      return NextResponse.json({
        success: true,
        data: overview
      });
    }

    // Get traffic data
    if (operation === 'traffic') {
      const endDate = new Date();
      const startDate = getStartDateByPeriod(endDate, period);
      
      // Placeholder - in production, fetch from analytics_events table
      const trafficData: TrafficDataPoint[] = [];
      
      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        trafficData.push({
          name: dateString,
          visits: 0,
          signups: 0,
          conversion: 0
        });
      }

      return NextResponse.json({
        success: true,
        data: trafficData
      });
    }

    // Get source distribution
    if (operation === 'sources') {
      // Placeholder - in production, fetch from analytics data
      const sourceData: DistributionDataPoint[] = [
        { name: 'Direct', value: 0 },
        { name: 'Search', value: 0 },
        { name: 'Social', value: 0 },
        { name: 'Referral', value: 0 }
      ];

      return NextResponse.json({
        success: true,
        data: sourceData
      });
    }

    // Get device distribution
    if (operation === 'devices') {
      // Placeholder - in production, fetch from analytics data
      const deviceData: DistributionDataPoint[] = [
        { name: 'Desktop', value: 0 },
        { name: 'Mobile', value: 0 },
        { name: 'Tablet', value: 0 }
      ];

      return NextResponse.json({
        success: true,
        data: deviceData
      });
    }

    // Get top pages
    if (operation === 'top-pages') {
      // Placeholder - in production, fetch from analytics data
      const topPages: TopPageData[] = [];

      return NextResponse.json({
        success: true,
        data: topPages
      });
    }

    // Invalid operation
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid operation. Use ?operation=overview|traffic|sources|devices|top-pages'
      },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('❌ Error fetching analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}

// POST - Track analytics event (page view or signup)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_type, data } = body;

    if (!event_type) {
      return NextResponse.json(
        {
          success: false,
          error: 'event_type is required'
        },
        { status: 400 }
      );
    }

    // Track page view
    if (event_type === 'pageview') {
      const pageViewData: PageViewEvent = data;
      
      if (!pageViewData.path || !pageViewData.session_id) {
        return NextResponse.json(
          {
            success: false,
            error: 'path and session_id are required for pageview events'
          },
          { status: 400 }
        );
      }

      // Get device info from user agent
      const userAgent = request.headers.get('user-agent') || '';
      const deviceType = getDeviceInfo(userAgent);

      // Store analytics event (you could create an analytics_events table)
      console.log('📊 Pageview tracked:', {
        path: pageViewData.path,
        title: pageViewData.title,
        session_id: pageViewData.session_id,
        device: deviceType,
        timestamp: pageViewData.timestamp
      });

      return NextResponse.json({
        success: true,
        message: 'Page view tracked successfully'
      });
    }

    // Track signup
    if (event_type === 'signup') {
      const signupData: SignupEvent = data;
      
      if (!signupData.user_id || !signupData.session_id) {
        return NextResponse.json(
          {
            success: false,
            error: 'user_id and session_id are required for signup events'
          },
          { status: 400 }
        );
      }

      console.log('📊 Signup tracked:', {
        user_id: signupData.user_id,
        session_id: signupData.session_id,
        timestamp: signupData.timestamp
      });

      return NextResponse.json({
        success: true,
        message: 'Signup tracked successfully'
      });
    }

    // Invalid event type
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid event_type. Use pageview or signup'
      },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('❌ Error tracking analytics event:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}

