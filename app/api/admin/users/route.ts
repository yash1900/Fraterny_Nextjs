/**
 * API Route: /api/admin/users
 * Methods: GET, POST, DELETE
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

interface UserFilters {
  searchTerm?: string;
  excludeTerm?: string;
  dateFrom?: string;
  dateTo?: string;
  isAnonymous?: boolean | null;
  minSummaryGeneration?: number | null;
  maxSummaryGeneration?: number | null;
  minPaidGeneration?: number | null;
  maxPaidGeneration?: number | null;
  gender?: string;
  ageFrom?: number | null;
  ageTo?: number | null;
}

interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

interface UserStats {
  totalUsers: number;
  anonymousUsers: number;
  activeUsers: number;
  totalGenerations: number;
}

interface UserData {
  user_id: string;
  user_name?: string;
  email?: string;
  mobile_number?: string;
  city?: string;
  gender?: string;
  dob?: string;
  total_summary_generation?: number;
  total_paid_generation?: number;
  last_used?: string;
  is_anonymous?: boolean | string;
  [key: string]: any;
}

interface UserDataWithDuplicateInfo extends UserData {
  isDuplicateGroup?: boolean;
  duplicateCount?: number;
  isPrimary?: boolean;
  groupKey?: string;
}

interface DuplicateGroup {
  groupKey: string;
  users: UserData[];
  primaryUser: UserData;
  duplicateUsers: UserData[];
}

interface DeleteUserResponse {
  success: boolean;
  message: string | null;
  error: string | null;
}

interface UsersResponse {
  success: boolean;
  data: {
    users: UserData[];
    pagination: PaginationMeta;
    filteredStats?: UserStats;
  } | null;
  error: string | null;
}

// Helper Functions

/**
 * Detect duplicate user groups based on IP address and device fingerprint
 */
async function detectDuplicateGroups(): Promise<DuplicateGroup[]> {
  try {
    // Get all users with their IP addresses from summary_generation
    const { data: usersData, error: usersError } = await supabaseAdmin
      .from('user_data')
      .select('*');

    if (usersError) {
      console.error('Error fetching users for duplicate detection:', usersError);
      return [];
    }

    // Get IP addresses from summary_generation for each user
    const { data: ipData, error: ipError } = await supabaseAdmin
      .from('summary_generation')
      .select('user_id, ip_address, device_fingerprint')
      .not('ip_address', 'is', null);

    if (ipError) {
      console.error('Error fetching IP data:', ipError);
      return [];
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

    // Group users by IP address and device fingerprint
    const groups = new Map<string, UserData[]>();
    
    usersData?.forEach(user => {
      let groupKey = '';
      
      // Group by IP address and device fingerprint only
      const ipInfo = userIpMap.get(user.user_id);
      if (ipInfo?.ip_address) {
        groupKey = `ip:${ipInfo.ip_address}:${ipInfo.device_fingerprint || 'unknown'}`;
      } else {
        groupKey = `unique:${user.user_id}`; // Unique user (no IP data)
      }
      
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(user as UserData);
    });

    // Convert to DuplicateGroup format and filter groups with multiple users
    const duplicateGroups: DuplicateGroup[] = [];
    
    groups.forEach((users, groupKey) => {
      if (users.length > 1) {
        // Sort users to determine primary (registered > anonymous, more paid gens, more recent)
        const sortedUsers = users.sort((a, b) => {
          // Registered users over anonymous (false = registered, true = anonymous)
          if (a.is_anonymous !== b.is_anonymous) {
            return a.is_anonymous === false ? -1 : 1;
          }
          
          // More paid generations
          const aPaidGens = a.total_paid_generation || 0;
          const bPaidGens = b.total_paid_generation || 0;
          if (aPaidGens !== bPaidGens) {
            return bPaidGens - aPaidGens;
          }
          
          // More total generations
          const aTotalGens = a.total_summary_generation || 0;
          const bTotalGens = b.total_summary_generation || 0;
          if (aTotalGens !== bTotalGens) {
            return bTotalGens - aTotalGens;
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

    return duplicateGroups;
  } catch (error: any) {
    console.error('Error in detectDuplicateGroups:', error);
    return [];
  }
}

/**
 * Get all users in a specific duplicate group
 */
async function getDuplicateGroupUsers(groupKey: string): Promise<DuplicateGroup | null> {
  try {
    const allGroups = await detectDuplicateGroups();
    return allGroups.find(group => group.groupKey === groupKey) || null;
  } catch (error: any) {
    console.error('Error in getDuplicateGroupUsers:', error);
    return null;
  }
}

/**
 * Get user statistics for dashboard cards
 */
async function getUserStats(): Promise<UserStats> {
  try {
    // Fetch all users to calculate statistics
    const { data, error } = await supabaseAdmin
      .from('user_data')
      .select('is_anonymous, last_used, total_summary_generation, total_paid_generation');

    if (error) {
      console.error('Error fetching user stats:', error);
      return {
        totalUsers: 0,
        anonymousUsers: 0,
        activeUsers: 0,
        totalGenerations: 0,
      };
    }

    const totalUsers = data?.length || 0;
    // Count anonymous users - check for various possible values
    const anonymousUsers = data?.filter(user => {
      const anonymousValue = user.is_anonymous;
      return anonymousValue === 'TRUE' || 
             anonymousValue === 'true' || 
             anonymousValue === '1' || 
             anonymousValue === 1 ||
             (typeof anonymousValue === 'boolean' && anonymousValue === true);
    }).length || 0;
    
    // Active users: users who have used the system in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = data?.filter(user => 
      user.last_used && new Date(user.last_used) >= thirtyDaysAgo
    ).length || 0;

    // Total generations (sum of all paid generations)
    const totalGenerations = data?.reduce((sum, user) => 
      sum + (user.total_paid_generation || 0), 0
    ) || 0;

    return {
      totalUsers,
      anonymousUsers,
      activeUsers,
      totalGenerations,
    };
  } catch (error) {
    console.error('Unexpected error in getUserStats:', error);
    return {
      totalUsers: 0,
      anonymousUsers: 0,
      activeUsers: 0,
      totalGenerations: 0,
    };
  }
}

/**
 * Get total unique users count after duplicate detection
 */
async function getTotalUniqueUsersCount(): Promise<number> {
  try {
    // Get all duplicate groups
    const duplicateGroups = await detectDuplicateGroups();
    
    // Get all users
    const { data: usersData, error: usersError } = await supabaseAdmin
      .from('user_data')
      .select('user_id');

    if (usersError) {
      console.error('Error fetching users for unique count:', usersError);
      return 0;
    }

    const totalUsers = usersData?.length || 0;
    
    // Calculate total duplicate users (not counting primary users)
    const totalDuplicateUsers = duplicateGroups.reduce((sum, group) => {
      return sum + group.duplicateUsers.length; // Only count duplicates, not primary
    }, 0);
    
    // Unique users = Total users - Duplicate users
    return totalUsers - totalDuplicateUsers;
  } catch (error: any) {
    console.error('Error calculating unique users count:', error);
    return 0;
  }
}

/**
 * Merge duplicate users into the primary user
 */
async function mergeDuplicateUsers(groupKey: string): Promise<DeleteUserResponse> {
  try {
    console.log('🔄 Starting merge process for group:', groupKey);
    
    const duplicateGroup = await getDuplicateGroupUsers(groupKey);
    if (!duplicateGroup || duplicateGroup.users.length < 2) {
      return {
        success: false,
        message: null,
        error: 'No duplicate group found or insufficient duplicates'
      };
    }

    const primaryUser = duplicateGroup.primaryUser;
    const duplicateUsers = duplicateGroup.duplicateUsers;
    
    console.log('👑 Primary user:', primaryUser.user_id);
    console.log('🔄 Duplicates to merge:', duplicateUsers.map(u => u.user_id));

    // Step 1: Calculate merged data
    const totalSummaryGeneration = duplicateGroup.users.reduce(
      (sum, user) => sum + (user.total_summary_generation || 0), 0
    );
    const totalPaidGeneration = duplicateGroup.users.reduce(
      (sum, user) => sum + (user.total_paid_generation || 0), 0
    );
    
    // Find the most recent last_used date
    const mostRecentDate = duplicateGroup.users.reduce((latest, user) => {
      if (!user.last_used) return latest;
      const userDate = new Date(user.last_used);
      return !latest || userDate > latest ? userDate : latest;
    }, null as Date | null);

    // Merge profile data (fill missing fields from duplicates)
    const mergedUserData = {
      user_name: primaryUser.user_name || duplicateUsers.find(u => u.user_name && u.user_name !== 'None')?.user_name || primaryUser.user_name,
      email: primaryUser.email || duplicateUsers.find(u => u.email && u.email !== 'None')?.email || primaryUser.email,
      mobile_number: primaryUser.mobile_number || duplicateUsers.find(u => u.mobile_number)?.mobile_number,
      city: primaryUser.city || duplicateUsers.find(u => u.city)?.city,
      gender: primaryUser.gender || duplicateUsers.find(u => u.gender)?.gender,
      dob: primaryUser.dob || duplicateUsers.find(u => u.dob)?.dob,
      total_summary_generation: totalSummaryGeneration,
      total_paid_generation: totalPaidGeneration,
      last_used: mostRecentDate?.toISOString() || primaryUser.last_used
    };

    // Step 2: Update related records to point to primary user
    for (const duplicateUser of duplicateUsers) {
      console.log(`🔄 Updating references for user: ${duplicateUser.user_id}`);
      
      // Update summary_question_answer records
      const { error: questionAnswerError } = await supabaseAdmin
        .from('summary_question_answer')
        .update({ user_id: primaryUser.user_id })
        .eq('user_id', duplicateUser.user_id);
      
      if (questionAnswerError) {
        console.error('❌ Error updating summary_question_answer:', questionAnswerError);
        return {
          success: false,
          message: null,
          error: `Failed to update question answer records: ${questionAnswerError.message}`
        };
      }
      
      // Update summary_generation records
      const { error: summaryError } = await supabaseAdmin
        .from('summary_generation')
        .update({ user_id: primaryUser.user_id })
        .eq('user_id', duplicateUser.user_id);
      
      if (summaryError) {
        console.error('❌ Error updating summary_generation:', summaryError);
        return {
          success: false,
          message: null,
          error: `Failed to update summary records: ${summaryError.message}`
        };
      }

      // Update transaction_details records
      const { error: transactionError } = await supabaseAdmin
        .from('transaction_details')
        .update({ user_id: primaryUser.user_id })
        .eq('user_id', duplicateUser.user_id);
      
      if (transactionError) {
        console.error('❌ Error updating transaction_details:', transactionError);
        return {
          success: false,
          message: null,
          error: `Failed to update transaction records: ${transactionError.message}`
        };
      }
    }

    // Step 3: Update the primary user with merged data
    console.log('📝 Updating primary user with merged data');
    const { error: updateError } = await supabaseAdmin
      .from('user_data')
      .update(mergedUserData)
      .eq('user_id', primaryUser.user_id);
    
    if (updateError) {
      console.error('❌ Error updating primary user:', updateError);
      return {
        success: false,
        message: null,
        error: `Failed to update primary user: ${updateError.message}`
      };
    }

    // Step 4: Delete duplicate user records
    console.log('🗑️ Deleting duplicate user records');
    for (const duplicateUser of duplicateUsers) {
      const { error: deleteError } = await supabaseAdmin
        .from('user_data')
        .delete()
        .eq('user_id', duplicateUser.user_id);
      
      if (deleteError) {
        console.error('❌ Error deleting duplicate user:', deleteError);
        return {
          success: false,
          message: null,
          error: `Failed to delete duplicate user: ${deleteError.message}`
        };
      }
    }

    console.log('✅ Merge completed successfully!');
    console.log(`📊 Merged ${duplicateUsers.length} duplicate(s) into primary user: ${primaryUser.user_id}`);
    
    return {
      success: true,
      message: `Successfully merged ${duplicateUsers.length} duplicate users. New totals: ${totalSummaryGeneration} total generations, ${totalPaidGeneration} paid generations.`,
      error: null
    };
  } catch (error: any) {
    console.error('❌ Error in mergeDuplicateUsers:', error);
    return {
      success: false,
      message: null,
      error: error?.message || 'An unexpected error occurred during merge'
    };
  }
}

/**
 * Merge duplicate users with a custom primary user (manually selected)
 */
async function mergeDuplicateUsersWithCustomPrimary(
  groupKey: string, 
  primaryUserId: string
): Promise<DeleteUserResponse> {
  try {
    console.log('🔄 Starting custom merge process for group:', groupKey, 'with primary:', primaryUserId);
    
    const duplicateGroup = await getDuplicateGroupUsers(groupKey);
    if (!duplicateGroup || duplicateGroup.users.length < 2) {
      return {
        success: false,
        message: null,
        error: 'No duplicate group found or insufficient duplicates'
      };
    }

    // Find the custom primary user
    const customPrimaryUser = duplicateGroup.users.find(u => u.user_id === primaryUserId);
    if (!customPrimaryUser) {
      return {
        success: false,
        message: null,
        error: 'Selected primary user not found in duplicate group'
      };
    }

    // Create new group structure with custom primary
    const customDuplicateUsers = duplicateGroup.users.filter(u => u.user_id !== primaryUserId);
    
    console.log('👑 Custom primary user:', customPrimaryUser.user_id);
    console.log('🔄 Duplicates to merge:', customDuplicateUsers.map(u => u.user_id));

    // Step 1: Calculate merged data
    const totalSummaryGeneration = duplicateGroup.users.reduce(
      (sum, user) => sum + (user.total_summary_generation || 0), 0
    );
    const totalPaidGeneration = duplicateGroup.users.reduce(
      (sum, user) => sum + (user.total_paid_generation || 0), 0
    );
    
    // Find the most recent last_used date
    const mostRecentDate = duplicateGroup.users.reduce((latest, user) => {
      if (!user.last_used) return latest;
      const userDate = new Date(user.last_used);
      return !latest || userDate > latest ? userDate : latest;
    }, null as Date | null);

    // Merge profile data (fill missing fields from duplicates)
    const mergedUserData = {
      user_name: customPrimaryUser.user_name || customDuplicateUsers.find(u => u.user_name && u.user_name !== 'None')?.user_name || customPrimaryUser.user_name,
      email: customPrimaryUser.email || customDuplicateUsers.find(u => u.email && u.email !== 'None')?.email || customPrimaryUser.email,
      mobile_number: customPrimaryUser.mobile_number || customDuplicateUsers.find(u => u.mobile_number)?.mobile_number,
      city: customPrimaryUser.city || customDuplicateUsers.find(u => u.city)?.city,
      gender: customPrimaryUser.gender || customDuplicateUsers.find(u => u.gender)?.gender,
      dob: customPrimaryUser.dob || customDuplicateUsers.find(u => u.dob)?.dob,
      total_summary_generation: totalSummaryGeneration,
      total_paid_generation: totalPaidGeneration,
      last_used: mostRecentDate?.toISOString() || customPrimaryUser.last_used
    };

    // Step 2: Update related records to point to custom primary user
    for (const duplicateUser of customDuplicateUsers) {
      console.log(`🔄 Updating references for user: ${duplicateUser.user_id}`);
      
      // Update summary_question_answer records
      const { error: questionAnswerError } = await supabaseAdmin
        .from('summary_question_answer')
        .update({ user_id: customPrimaryUser.user_id })
        .eq('user_id', duplicateUser.user_id);
      
      if (questionAnswerError) {
        console.error('❌ Error updating summary_question_answer:', questionAnswerError);
        return {
          success: false,
          message: null,
          error: `Failed to update question answer records: ${questionAnswerError.message}`
        };
      }
      
      // Update summary_generation records
      const { error: summaryError } = await supabaseAdmin
        .from('summary_generation')
        .update({ user_id: customPrimaryUser.user_id })
        .eq('user_id', duplicateUser.user_id);
      
      if (summaryError) {
        console.error('❌ Error updating summary_generation:', summaryError);
        return {
          success: false,
          message: null,
          error: `Failed to update summary records: ${summaryError.message}`
        };
      }

      // Update transaction_details records
      const { error: transactionError } = await supabaseAdmin
        .from('transaction_details')
        .update({ user_id: customPrimaryUser.user_id })
        .eq('user_id', duplicateUser.user_id);
      
      if (transactionError) {
        console.error('❌ Error updating transaction_details:', transactionError);
        return {
          success: false,
          message: null,
          error: `Failed to update transaction records: ${transactionError.message}`
        };
      }
    }

    // Step 3: Update the custom primary user with merged data
    console.log('📝 Updating custom primary user with merged data');
    const { error: updateError } = await supabaseAdmin
      .from('user_data')
      .update(mergedUserData)
      .eq('user_id', customPrimaryUser.user_id);
    
    if (updateError) {
      console.error('❌ Error updating custom primary user:', updateError);
      return {
        success: false,
        message: null,
        error: `Failed to update primary user: ${updateError.message}`
      };
    }

    // Step 4: Delete duplicate user records
    console.log('🗑️ Deleting duplicate user records');
    for (const duplicateUser of customDuplicateUsers) {
      const { error: deleteError } = await supabaseAdmin
        .from('user_data')
        .delete()
        .eq('user_id', duplicateUser.user_id);
      
      if (deleteError) {
        console.error('❌ Error deleting duplicate user:', deleteError);
        return {
          success: false,
          message: null,
          error: `Failed to delete duplicate user: ${deleteError.message}`
        };
      }
    }

    console.log('✅ Custom merge completed successfully!');
    console.log(`📊 Merged ${customDuplicateUsers.length} duplicate(s) into custom primary user: ${customPrimaryUser.user_id}`);
    
    return {
      success: true,
      message: `Successfully merged ${customDuplicateUsers.length} duplicate users into selected primary. New totals: ${totalSummaryGeneration} total generations, ${totalPaidGeneration} paid generations.`,
      error: null
    };
  } catch (error: any) {
    console.error('❌ Error in mergeDuplicateUsersWithCustomPrimary:', error);
    return {
      success: false,
      message: null,
      error: error?.message || 'An unexpected error occurred during custom merge'
    };
  }
}

// GET /api/admin/users - Fetch users with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Check for special operations
    const operation = searchParams.get('operation');
    
    // Handle stats operation
    if (operation === 'stats') {
      const stats = await getUserStats();
      return NextResponse.json({
        success: true,
        data: stats
      });
    }
    
    // Handle unique count operation
    if (operation === 'unique-count') {
      const uniqueCount = await getTotalUniqueUsersCount();
      return NextResponse.json({
        success: true,
        data: { uniqueUsersCount: uniqueCount }
      });
    }
    
    // Handle duplicate groups operation
    if (operation === 'duplicate-groups') {
      const duplicateGroups = await detectDuplicateGroups();
      return NextResponse.json({
        success: true,
        data: { duplicateGroups }
      });
    }
    
    // Handle get duplicate group operation
    if (operation === 'duplicate-group' && searchParams.get('groupKey')) {
      const groupKey = searchParams.get('groupKey')!;
      const duplicateGroup = await getDuplicateGroupUsers(groupKey);
      if (!duplicateGroup) {
        return NextResponse.json(
          { success: false, error: 'Duplicate group not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: duplicateGroup
      });
    }
    
    // Check if duplicate detection is requested
    const withDuplicateDetection = searchParams.get('withDuplicateDetection') === 'true';
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Filters
    const filters: UserFilters = {
      searchTerm: searchParams.get('search') || undefined,
      excludeTerm: searchParams.get('exclude') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      isAnonymous: searchParams.get('isAnonymous') === 'true' ? true : searchParams.get('isAnonymous') === 'false' ? false : null,
      gender: searchParams.get('gender') || undefined,
      ageFrom: searchParams.get('ageFrom') ? parseInt(searchParams.get('ageFrom')!) : null,
      ageTo: searchParams.get('ageTo') ? parseInt(searchParams.get('ageTo')!) : null,
      minSummaryGeneration: searchParams.get('minSummaryGeneration') ? parseInt(searchParams.get('minSummaryGeneration')!) : null,
      maxSummaryGeneration: searchParams.get('maxSummaryGeneration') ? parseInt(searchParams.get('maxSummaryGeneration')!) : null,
      minPaidGeneration: searchParams.get('minPaidGeneration') ? parseInt(searchParams.get('minPaidGeneration')!) : null,
      maxPaidGeneration: searchParams.get('maxPaidGeneration') ? parseInt(searchParams.get('maxPaidGeneration')!) : null,
    };

    // Build query
    let query = supabaseAdmin.from('user_data').select('*', { count: 'exact' });

    // Apply search filter
    if (filters.searchTerm && filters.searchTerm.trim()) {
      const searchTerm = filters.searchTerm.trim();
      query = query.or(
        `user_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,user_id.ilike.%${searchTerm}%,mobile_number.ilike.%${searchTerm}%`
      );
    }

    // Apply date range filters
    if (filters.dateFrom) {
      query = query.gte('last_used', filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.lte('last_used', filters.dateTo);
    }

    // Apply anonymous filter
    if (filters.isAnonymous !== null && filters.isAnonymous !== undefined) {
      query = query.eq('is_anonymous', filters.isAnonymous);
    }

    // Apply gender filter
    if (filters.gender) {
      query = query.eq('gender', filters.gender);
    }

    // Apply age range filters
    if (filters.ageFrom !== null && filters.ageFrom !== undefined) {
      const currentDate = new Date();
      const maxBirthYear = currentDate.getFullYear() - filters.ageFrom;
      const maxBirthDate = `${maxBirthYear}-12-31`;
      query = query.lte('dob', maxBirthDate);
    }
    if (filters.ageTo !== null && filters.ageTo !== undefined) {
      const currentDate = new Date();
      const minBirthYear = currentDate.getFullYear() - filters.ageTo;
      const minBirthDate = `${minBirthYear}-01-01`;
      query = query.gte('dob', minBirthDate);
    }

    // Apply summary generation filters
    if (filters.minSummaryGeneration !== null && filters.minSummaryGeneration !== undefined) {
      query = query.gte('total_summary_generation', filters.minSummaryGeneration);
    }
    if (filters.maxSummaryGeneration !== null && filters.maxSummaryGeneration !== undefined) {
      query = query.lte('total_summary_generation', filters.maxSummaryGeneration);
    }

    // Apply paid generation filters
    if (filters.minPaidGeneration !== null && filters.minPaidGeneration !== undefined) {
      query = query.gte('total_paid_generation', filters.minPaidGeneration);
    }
    if (filters.maxPaidGeneration !== null && filters.maxPaidGeneration !== undefined) {
      query = query.lte('total_paid_generation', filters.maxPaidGeneration);
    }

    // Apply pagination and ordering
    if (filters.excludeTerm && filters.excludeTerm.trim()) {
      query = query.order('last_used', { ascending: false, nullsFirst: false });
    } else {
      query = query.range(from, to).order('last_used', { ascending: false, nullsFirst: false });
    }

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Apply exclusion filter (post-query)
    let filteredData = data || [];
    let totalFilteredRecords = count || 0;

    if (filters.excludeTerm && filters.excludeTerm.trim() && filteredData) {
      const excludeTerm = filters.excludeTerm.trim().toLowerCase();
      filteredData = filteredData.filter((user: any) => {
        const userName = (user.user_name || '').toLowerCase();
        const email = (user.email || '').toLowerCase();
        const userId = (user.user_id || '').toLowerCase();
        const mobile = (user.mobile_number || '').toLowerCase();
        
        return !(userName.includes(excludeTerm) || 
                email.includes(excludeTerm) || 
                userId.includes(excludeTerm) || 
                mobile.includes(excludeTerm));
      });
      
      totalFilteredRecords = filteredData.length;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      filteredData = filteredData.slice(startIndex, endIndex);
    }

    // Apply duplicate detection if requested
    if (withDuplicateDetection) {
      try {
        const duplicateGroups = await detectDuplicateGroups();
        const duplicateGroupsMap = new Map();
        
        // Create a map of primary user IDs for each group
        duplicateGroups.forEach(group => {
          group.users.forEach((user, index) => {
            duplicateGroupsMap.set(user.user_id, {
              isPrimary: index === 0, // First user is primary
              groupKey: group.groupKey,
              duplicateCount: group.users.length
            });
          });
        });

        // Filter to show only primary users and add duplicate info
        const usersWithDuplicateInfo = filteredData.map((user: any) => {
          const duplicateInfo = duplicateGroupsMap.get(user.user_id);
          return {
            ...user,
            isDuplicateGroup: duplicateInfo ? duplicateInfo.duplicateCount > 1 : false,
            duplicateCount: duplicateInfo?.duplicateCount || 1,
            isPrimary: duplicateInfo?.isPrimary ?? true,
            groupKey: duplicateInfo?.groupKey
          };
        }).filter((user: any) => user.isPrimary); // Only show primary users

        filteredData = usersWithDuplicateInfo;
      } catch (duplicateError) {
        console.error('Error applying duplicate detection:', duplicateError);
        // Continue without duplicate detection if it fails
      }
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalFilteredRecords / pageSize);

    const paginationMeta: PaginationMeta = {
      currentPage: page,
      pageSize,
      totalRecords: totalFilteredRecords,
      totalPages,
    };

    // Calculate filtered statistics if filters applied
    let filteredStats: UserStats | undefined;

    const hasFilters = filters.searchTerm || filters.excludeTerm || filters.dateFrom || 
                       filters.dateTo || filters.isAnonymous !== null || filters.gender || 
                       filters.ageFrom || filters.ageTo;

    if (hasFilters) {
      let statsQuery = supabaseAdmin.from('user_data').select('*');

      // Reapply all filters for stats
      if (filters.searchTerm && filters.searchTerm.trim()) {
        statsQuery = statsQuery.or(
          `user_name.ilike.%${filters.searchTerm}%,email.ilike.%${filters.searchTerm}%,user_id.ilike.%${filters.searchTerm}%,mobile_number.ilike.%${filters.searchTerm}%`
        );
      }
      if (filters.dateFrom) statsQuery = statsQuery.gte('last_used', filters.dateFrom);
      if (filters.dateTo) statsQuery = statsQuery.lte('last_used', filters.dateTo);
      if (filters.isAnonymous !== null) statsQuery = statsQuery.eq('is_anonymous', filters.isAnonymous);
      if (filters.gender) statsQuery = statsQuery.eq('gender', filters.gender);
      if (filters.ageFrom !== null && filters.ageFrom !== undefined) {
        const maxBirthYear = new Date().getFullYear() - filters.ageFrom;
        statsQuery = statsQuery.lte('dob', `${maxBirthYear}-12-31`);
      }
      if (filters.ageTo !== null && filters.ageTo !== undefined) {
        const minBirthYear = new Date().getFullYear() - filters.ageTo;
        statsQuery = statsQuery.gte('dob', `${minBirthYear}-01-01`);
      }

      const { data: allFilteredData } = await statsQuery;
      let completeFilteredData = allFilteredData || [];

      // Apply exclusion filter
      if (filters.excludeTerm && filters.excludeTerm.trim()) {
        const excludeTerm = filters.excludeTerm.trim().toLowerCase();
        completeFilteredData = completeFilteredData.filter((user: any) => {
          const userName = (user.user_name || '').toLowerCase();
          const email = (user.email || '').toLowerCase();
          const userId = (user.user_id || '').toLowerCase();
          const mobile = (user.mobile_number || '').toLowerCase();
          
          return !(userName.includes(excludeTerm) || 
                  email.includes(excludeTerm) || 
                  userId.includes(excludeTerm) || 
                  mobile.includes(excludeTerm));
        });
      }

      // Calculate stats
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      filteredStats = {
        totalUsers: completeFilteredData.length,
        anonymousUsers: completeFilteredData.filter((user: any) => {
          const val = user.is_anonymous;
          return val === 'TRUE' || val === 'true' || val === '1' || val === 1 || val === true;
        }).length,
        activeUsers: completeFilteredData.filter((user: any) => 
          user.last_used && new Date(user.last_used) >= thirtyDaysAgo
        ).length,
        totalGenerations: completeFilteredData.reduce((sum: number, user: any) => 
          sum + (user.total_paid_generation || 0), 0
        )
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        users: filteredData,
        pagination: paginationMeta,
        ...(filteredStats ? { filteredStats } : {})
      }
    });

  } catch (error: any) {
    console.error('Unexpected error in GET /api/admin/users:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users - Delete single user
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('🗑️ Starting cascade delete for user:', userId);
    
    // Step 1: Delete related records in summary_question_answer table
    console.log('📝 Deleting question answers...');
    const { error: questionError } = await supabaseAdmin
      .from('summary_question_answer')
      .delete()
      .eq('user_id', userId);

    if (questionError) {
      console.error('❌ Error deleting question answer records:', questionError);
      return NextResponse.json(
        { success: false, error: `Failed to delete user's question answers: ${questionError.message}` },
        { status: 500 }
      );
    }

    // Step 2: Delete related records in summary_generation table
    console.log('📊 Deleting summary generation records...');
    const { error: summaryError } = await supabaseAdmin
      .from('summary_generation')
      .delete()
      .eq('user_id', userId);

    if (summaryError) {
      console.error('❌ Error deleting summary_generation records:', summaryError);
      return NextResponse.json(
        { success: false, error: `Failed to delete user's summary records: ${summaryError.message}` },
        { status: 500 }
      );
    }

    // Step 3: Delete related records in transaction_details table
    console.log('💳 Deleting transaction records...');
    const { error: transactionError } = await supabaseAdmin
      .from('transaction_details')
      .delete()
      .eq('user_id', userId);

    if (transactionError) {
      console.error('❌ Error deleting transaction_details records:', transactionError);
      return NextResponse.json(
        { success: false, error: `Failed to delete user's transaction records: ${transactionError.message}` },
        { status: 500 }
      );
    }

    // Step 4: Finally, delete the user
    console.log('👤 Deleting user record...');
    const { error } = await supabaseAdmin
      .from('user_data')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Error deleting user:', error);
      return NextResponse.json(
        { success: false, error: `Failed to delete user: ${error.message}` },
        { status: 500 }
      );
    }
    
    console.log('✅ User deleted successfully!');
    return NextResponse.json({
      success: true,
      message: 'User and all related records deleted successfully'
    });

  } catch (error: any) {
    console.error('Unexpected error in DELETE /api/admin/users:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Handle bulk operations and merging
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userIds, action, groupKey, primaryUserId } = body;

    if (action === 'bulk-delete') {
      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No users selected for deletion' },
          { status: 400 }
        );
      }

      console.log('🗑️ Starting bulk cascade delete for users:', userIds);

      // Delete related records
      const { error: questionError } = await supabaseAdmin
        .from('summary_question_answer')
        .delete()
        .in('user_id', userIds);

      if (questionError) {
        return NextResponse.json(
          { success: false, error: `Failed to delete question answers: ${questionError.message}` },
          { status: 500 }
        );
      }

      const { error: summaryError } = await supabaseAdmin
        .from('summary_generation')
        .delete()
        .in('user_id', userIds);

      if (summaryError) {
        return NextResponse.json(
          { success: false, error: `Failed to delete summaries: ${summaryError.message}` },
          { status: 500 }
        );
      }

      const { error: transactionError } = await supabaseAdmin
        .from('transaction_details')
        .delete()
        .in('user_id', userIds);

      if (transactionError) {
        return NextResponse.json(
          { success: false, error: `Failed to delete transactions: ${transactionError.message}` },
          { status: 500 }
        );
      }

      // Delete users
      const { error } = await supabaseAdmin
        .from('user_data')
        .delete()
        .in('user_id', userIds);

      if (error) {
        return NextResponse.json(
          { success: false, error: `Failed to delete users: ${error.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `${userIds.length} users and all related records deleted successfully`
      });
    }

    if (action === 'merge-duplicates') {
      if (!groupKey) {
        return NextResponse.json(
          { success: false, error: 'Group key is required for merge operation' },
          { status: 400 }
        );
      }

      const mergeResult = primaryUserId 
        ? await mergeDuplicateUsersWithCustomPrimary(groupKey, primaryUserId)
        : await mergeDuplicateUsers(groupKey);
      
      return NextResponse.json(mergeResult);
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Unexpected error in POST /api/admin/users:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

