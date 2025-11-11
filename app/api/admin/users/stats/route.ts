/**
 * API Route: /api/admin/users/stats
 * Methods: GET
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

interface UserStats {
  totalUsers: number;
  anonymousUsers: number;
  activeUsers: number;
  totalGenerations: number;
}

// GET /api/admin/users/stats - Get user statistics
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_data')
      .select('is_anonymous, last_used, total_summary_generation, total_paid_generation');

    if (error) {
      console.error('Error fetching user stats:', error);
      return NextResponse.json({
        success: true,
        data: {
          totalUsers: 0,
          anonymousUsers: 0,
          activeUsers: 0,
          totalGenerations: 0,
        }
      });
    }

    const totalUsers = data?.length || 0;
    
    // Count anonymous users
    const anonymousUsers = data?.filter(user => {
      const anonymousValue = user.is_anonymous;
      return anonymousValue === 'TRUE' || 
             anonymousValue === 'true' || 
             anonymousValue === '1' || 
             anonymousValue === 1 ||
             (typeof anonymousValue === 'boolean' && anonymousValue === true);
    }).length || 0;
    
    // Active users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = data?.filter(user => 
      user.last_used && new Date(user.last_used) >= thirtyDaysAgo
    ).length || 0;

    // Total generations
    const totalGenerations = data?.reduce((sum, user) => 
      sum + (user.total_paid_generation || 0), 0
    ) || 0;

    const stats: UserStats = {
      totalUsers,
      anonymousUsers,
      activeUsers,
      totalGenerations,
    };

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error: any) {
    console.error('Unexpected error in GET /api/admin/users/stats:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

