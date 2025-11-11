/**
 * API Route: /api/admin/users/duplicates
 * Methods: GET
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET /api/admin/users/duplicates - Detect duplicate users based on IP/device
export async function GET(request: NextRequest) {
  try {
    // Get all users
    const { data: usersData, error: usersError } = await supabaseAdmin
      .from('user_data')
      .select('*');

    if (usersError) {
      return NextResponse.json(
        { success: false, error: usersError.message },
        { status: 500 }
      );
    }

    // Get IP addresses from summary_generation
    const { data: ipData, error: ipError } = await supabaseAdmin
      .from('summary_generation')
      .select('user_id, ip_address, device_fingerprint')
      .not('ip_address', 'is', null);

    if (ipError) {
      return NextResponse.json(
        { success: false, error: ipError.message },
        { status: 500 }
      );
    }

    // Create a map of user_id to IP info
    const userIpMap = new Map();
    ipData?.forEach(record => {
      if (!userIpMap.has(record.user_id)) {
        userIpMap.set(record.user_id, {
          ip_address: record.ip_address,
          device_fingerprint: record.device_fingerprint
        });
      }
    });

    // Group users by IP+device fingerprint
    const groups = new Map();
    
    usersData?.forEach(user => {
      let groupKey = '';
      
      const ipInfo = userIpMap.get(user.user_id);
      if (ipInfo?.ip_address) {
        groupKey = `ip:${ipInfo.ip_address}:${ipInfo.device_fingerprint || 'unknown'}`;
      } else {
        groupKey = `unique:${user.user_id}`;
      }
      
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(user);
    });

    // Filter groups with multiple users
    const duplicateGroups: any[] = [];
    
    groups.forEach((users, groupKey) => {
      if (users.length > 1) {
        // Sort users to determine primary
        const sortedUsers = users.sort((a: any, b: any) => {
          // Registered users over anonymous
          if (a.is_anonymous !== b.is_anonymous) {
            return a.is_anonymous === false ? -1 : 1;
          }
          
          // More paid generations
          const aPaidGens = a.total_paid_generation || 0;
          const bPaidGens = b.total_paid_generation || 0;
          if (aPaidGens !== bPaidGens) {
            return bPaidGens - aPaidGens;
          }
          
          // More recent activity
          const aLastUsed = a.last_used ? new Date(a.last_used).getTime() : 0;
          const bLastUsed = b.last_used ? new Date(b.last_used).getTime() : 0;
          return bLastUsed - aLastUsed;
        });

        duplicateGroups.push({
          groupKey,
          users: sortedUsers,
          primaryUser: sortedUsers[0],
          duplicateUsers: sortedUsers.slice(1)
        });
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        duplicateGroups,
        totalGroups: duplicateGroups.length,
        totalDuplicates: duplicateGroups.reduce((sum, group) => sum + group.duplicateUsers.length, 0)
      }
    });

  } catch (error: any) {
    console.error('Error detecting duplicates:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

