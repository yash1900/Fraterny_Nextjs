/**
 * API Route: /api/admin/emails
 * Methods: GET, POST
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Database } from '@/integrations/supabase/types';



type AdminEmailData = Database['public']['Tables']['admin_emails']['Row'];

type AdminEmailUpdateData = {
  email: string;
  is_active?: boolean;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    console.log(activeOnly ? '🔄 Fetching active admin emails...' : '🔄 Fetching all admin emails...');

    let query = supabaseAdmin
      .from('admin_emails')
      .select('*')
      .order('created_at', { ascending: true });

    if (activeOnly) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching admin emails:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Failed to fetch admin emails',
        },
        { status: 500 }
      );
    }

    console.log('✅ Admin emails fetched successfully');
    return NextResponse.json({
      success: true,
      data: data as AdminEmailData[],
    });
  } catch (error: any) {
    console.error('❌ Exception fetching admin emails:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch admin emails',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const updateData: AdminEmailUpdateData = body;

    console.log('🔄 Adding new admin email...', updateData);

    const { data, error } = await supabaseAdmin
      .from('admin_emails')
      .insert({
        ...updateData,
        is_active: updateData.is_active ?? true,
      })
      .select('*')
      .single();

    if (error) {
      console.error('❌ Error adding admin email:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Failed to add admin email',
        },
        { status: 500 }
      );
    }

    console.log('✅ Admin email added successfully');
    return NextResponse.json({
      success: true,
      data: data as AdminEmailData,
    });
  } catch (error: any) {
    console.error('❌ Exception adding admin email:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to add admin email',
      },
      { status: 500 }
    );
  }
}

