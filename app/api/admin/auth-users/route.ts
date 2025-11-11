/**
 * API Route: /api/admin/auth-users
 * Methods: GET
 * Description: Fetch all authenticated users from Supabase Auth (Admin only)
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAdminAuth } from '@/lib/admin-auth';

interface AuthUser {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  email_confirmed: boolean;
  last_sign_in_at?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof Response) {
      return authResult;
    }

    // Get pagination parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    // Calculate pagination
    const from = (page - 1) * pageSize;

    // Fetch users from Supabase Auth using admin client
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: pageSize,
    });

    if (error) {
      console.error('Error fetching users from Supabase Auth:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch users from authentication service',
          details: error.message,
        },
        { status: 500 }
      );
    }

    // Transform and filter users
    let users: AuthUser[] = data.users.map((user) => ({
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || user.user_metadata?.full_name || '',
      created_at: user.created_at,
      email_confirmed: user.email_confirmed_at !== null,
      last_sign_in_at: user.last_sign_in_at || undefined,
    }));

    // Apply date filters if provided
    if (fromDate) {
      const fromDateTime = new Date(fromDate).getTime();
      users = users.filter(
        (user) => new Date(user.created_at).getTime() >= fromDateTime
      );
    }

    if (toDate) {
      const toDateTime = new Date(toDate).getTime();
      users = users.filter(
        (user) => new Date(user.created_at).getTime() <= toDateTime
      );
    }

    // Sort by creation date (newest first)
    users.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          pageSize,
          total: users.length,
          hasMore: data.users.length === pageSize,
        },
      },
    });
  } catch (error: any) {
    console.error('Error in /api/admin/auth-users:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
