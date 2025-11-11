/**
 * API Route: /api/admin/dashboard
 * Methods: GET
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export interface DashboardStats {
  users: {
    totalUsers: number;
    newUsersLast30Days: number;
    activeUsersLast7Days: number;
  };
  summaries: {
    totalSummaries: number;
    paidSummaries: number;
    summariesLast30Days: number;
  };
  payments: {
    totalRevenue: number;
    totalRevenueUSD: number;
    totalRevenueINR: number;
    totalTransactions: number;
    revenueThisMonth: number;
    revenueThisMonthUSD: number;
    revenueThisMonthINR: number;
    successfulPayments: number;
    indiaRevenueUSD: number;
    indiaRevenueINR: number;
    internationalRevenueUSD: number;
  };
  feedback: {
    totalFeedbacks: number;
    averageRating: number;
    feedbacksLast30Days: number;
  };
}

interface DashboardResponse {
  success: boolean;
  data?: DashboardStats;
  error?: string;
}

// GET /api/admin/dashboard - Fetch comprehensive dashboard statistics
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching dashboard statistics...');

    // Calculate date ranges
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Create filter function for excluding test data
    const applyTestDataFilter = (query: any) => {
      return query
        .not('user_name', 'ilike', '%test%')
        .not('email', 'ilike', '%test%')
        .not('dob', 'ilike', '%test%');
    };

    // Parallel fetch all statistics
    const [
      usersResult,
      newUsersResult,
      activeUsersResult,
      summariesResult,
      paidSummariesResult,
      recentSummariesResult,
      paymentsResult,
      revenueThisMonthResult,
      feedbackResult,
      recentFeedbackResult
    ] = await Promise.all([
      // Users queries - exclude test users
      applyTestDataFilter(supabaseAdmin.from('user_data').select('user_id', { count: 'exact' })),
      applyTestDataFilter(supabaseAdmin.from('user_data').select('user_id', { count: 'exact' }).gte('last_used', thirtyDaysAgo.toISOString())),
      applyTestDataFilter(supabaseAdmin.from('user_data').select('user_id', { count: 'exact' }).gte('last_used', sevenDaysAgo.toISOString())),
      
      // Summaries queries
      supabaseAdmin.from('summary_generation')
        .select(`
          id, question_answer,
          user_data!inner(
            user_id, user_name, email, dob
          )
        `, { count: 'exact' })
        .not('user_data.user_name', 'ilike', '%test%')
        .not('user_data.email', 'ilike', '%test%')
        .not('user_data.dob', 'ilike', '%test%')
        .not('question_answer', 'ilike', '%test%'),
        
      supabaseAdmin.from('summary_generation')
        .select(`
          id, question_answer,
          user_data!inner(
            user_id, user_name, email, dob
          )
        `, { count: 'exact' })
        .in('payment_status', ['success', 'completed'])
        .not('user_data.user_name', 'ilike', '%test%')
        .not('user_data.email', 'ilike', '%test%')
        .not('user_data.dob', 'ilike', '%test%')
        .not('question_answer', 'ilike', '%test%'),
        
      supabaseAdmin.from('summary_generation')
        .select(`
          id, question_answer,
          user_data!inner(
            user_id, user_name, email, dob
          )
        `, { count: 'exact' })
        .gte('starting_time', thirtyDaysAgo.toISOString())
        .not('user_data.user_name', 'ilike', '%test%')
        .not('user_data.email', 'ilike', '%test%')
        .not('user_data.dob', 'ilike', '%test%')
        .not('question_answer', 'ilike', '%test%'),
      
      // Payments queries
      supabaseAdmin.from('transaction_details')
        .select(`
          total_paid, status, gateway, IsIndia,
          user_data!inner(
            user_id, user_name, email, dob
          ),
          summary_generation!inner(
            testid, user_id, question_answer
          )
        `, { count: 'exact' })
        .not('user_data.user_name', 'ilike', '%test%')
        .not('user_data.email', 'ilike', '%test%')
        .not('user_data.dob', 'ilike', '%test%')
        .not('summary_generation.question_answer', 'ilike', '%test%'),
        
      supabaseAdmin.from('transaction_details')
        .select(`
          total_paid, gateway, IsIndia,
          user_data!inner(
            user_id, user_name, email, dob
          ),
          summary_generation!inner(
            testid, user_id, question_answer
          )
        `)
        .eq('status', 'success')
        .gte('payment_completed_time', startOfMonth.toISOString())
        .not('user_data.user_name', 'ilike', '%test%')
        .not('user_data.email', 'ilike', '%test%')
        .not('user_data.dob', 'ilike', '%test%')
        .not('summary_generation.question_answer', 'ilike', '%test%'),
      
      // Feedback queries
      supabaseAdmin.from('summary_overall_feedback')
        .select(`
          rating,
          user_data!inner(
            user_id, user_name, email, dob
          )
        `, { count: 'exact' })
        .not('user_data.user_name', 'ilike', '%test%')
        .not('user_data.email', 'ilike', '%test%')
        .not('user_data.dob', 'ilike', '%test%'),
        
      supabaseAdmin.from('summary_overall_feedback')
        .select(`
          id,
          user_data!inner(
            user_id, user_name, email, dob
          )
        `, { count: 'exact' })
        .gte('created_at', thirtyDaysAgo.toISOString())
        .not('user_data.user_name', 'ilike', '%test%')
        .not('user_data.email', 'ilike', '%test%')
        .not('user_data.dob', 'ilike', '%test%')
    ]);

    // Process users data
    const totalUsers = usersResult.count || 0;
    const newUsersLast30Days = newUsersResult.count || 0;
    const activeUsersLast7Days = activeUsersResult.count || 0;

    // Process summaries data
    const totalSummaries = summariesResult.count || 0;
    const paidSummaries = paidSummariesResult.count || 0;
    const summariesLast30Days = recentSummariesResult.count || 0;

    // Process payments data
    const allPayments = paymentsResult.data || [];
    const totalTransactions = paymentsResult.count || 0;
    const successfulPayments = allPayments.filter((p: any) => p.status === 'success').length;
    
    // Helper function to calculate currency amounts
    const calculateCurrencyAmount = (payment: any) => {
      const amount = (parseFloat(payment.total_paid) || 0) / 100;
      
      let isUSD = false;
      let isINR = false;
      
      if (payment.gateway === 'paypal') {
        isUSD = true;
      } else if (payment.gateway === 'Razorpay') {
        if (payment.IsIndia === true) {
          isINR = true;
        } else {
          isUSD = true;
        }
      }
      
      const isFromIndia = payment.IsIndia === true;
      
      if (isFromIndia) {
        return {
          usd: isUSD ? amount : 0,
          inr: isINR ? amount : 0,
          indiaUSD: isUSD ? amount : 0,
          indiaINR: isINR ? amount : 0,
          internationalUSD: 0
        };
      } else {
        return {
          usd: isUSD ? amount : 0,
          inr: isINR ? amount : 0,
          indiaUSD: 0,
          indiaINR: 0,
          internationalUSD: isUSD ? amount : 0
        };
      }
    };
    
    // Calculate total revenue by currency and region
    const successfulPaymentData = allPayments.filter((p: any) => p.status === 'success');
    const totalRevenueByCurrency = successfulPaymentData.reduce(
      (totals: any, payment: any) => {
        const { usd, inr, indiaUSD, indiaINR, internationalUSD } = calculateCurrencyAmount(payment);
        return {
          usd: totals.usd + usd,
          inr: totals.inr + inr,
          indiaUSD: totals.indiaUSD + indiaUSD,
          indiaINR: totals.indiaINR + indiaINR,
          internationalUSD: totals.internationalUSD + internationalUSD
        };
      },
      { usd: 0, inr: 0, indiaUSD: 0, indiaINR: 0, internationalUSD: 0 }
    );
    
    // Calculate revenue this month
    const monthlyPayments = revenueThisMonthResult.data || [];
    const monthlyRevenueByCurrency = monthlyPayments.reduce(
      (totals: any, payment: any) => {
        const { usd, inr, indiaUSD, indiaINR, internationalUSD } = calculateCurrencyAmount(payment);
        return {
          usd: totals.usd + usd,
          inr: totals.inr + inr,
          indiaUSD: totals.indiaUSD + indiaUSD,
          indiaINR: totals.indiaINR + indiaINR,
          internationalUSD: totals.internationalUSD + internationalUSD
        };
      },
      { usd: 0, inr: 0, indiaUSD: 0, indiaINR: 0, internationalUSD: 0 }
    );
    
    const totalRevenue = totalRevenueByCurrency.usd + totalRevenueByCurrency.inr;
    const revenueThisMonth = monthlyRevenueByCurrency.usd + monthlyRevenueByCurrency.inr;

    // Process feedback data
    const totalFeedbacks = feedbackResult.count || 0;
    const recentFeedbacksLast30Days = recentFeedbackResult.count || 0;
    
    const ratings = feedbackResult.data?.map((f: any) => parseInt(f.rating || '0')).filter((r: number) => r > 0) || [];
    const averageRating = ratings.length > 0 
      ? parseFloat((ratings.reduce((sum: number, r: number) => sum + r, 0) / ratings.length).toFixed(1))
      : 0;

    // Compile dashboard statistics
    const dashboardStats: DashboardStats = {
      users: {
        totalUsers,
        newUsersLast30Days,
        activeUsersLast7Days,
      },
      summaries: {
        totalSummaries,
        paidSummaries,
        summariesLast30Days,
      },
      payments: {
        totalRevenue,
        totalRevenueUSD: totalRevenueByCurrency.usd,
        totalRevenueINR: totalRevenueByCurrency.inr,
        totalTransactions,
        revenueThisMonth,
        revenueThisMonthUSD: monthlyRevenueByCurrency.usd,
        revenueThisMonthINR: monthlyRevenueByCurrency.inr,
        successfulPayments,
        indiaRevenueUSD: totalRevenueByCurrency.indiaUSD,
        indiaRevenueINR: totalRevenueByCurrency.indiaINR,
        internationalRevenueUSD: totalRevenueByCurrency.internationalUSD,
      },
      feedback: {
        totalFeedbacks,
        averageRating,
        feedbacksLast30Days: recentFeedbacksLast30Days,
      },
    };

    console.log('✅ Dashboard stats fetched successfully');

    return NextResponse.json({
      success: true,
      data: dashboardStats,
    } as DashboardResponse);

  } catch (error: any) {
    console.error('❌ Error fetching dashboard stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to fetch dashboard statistics',
      } as DashboardResponse,
      { status: 500 }
    );
  }
}
