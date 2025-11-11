import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

interface AdminEmailData {
  id: number;
  email: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email ID',
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { is_active } = body;

    if (typeof is_active !== 'boolean') {
      return NextResponse.json(
        {
          success: false,
          error: 'is_active must be a boolean',
        },
        { status: 400 }
      );
    }

    console.log(`🔄 Updating admin email ${id} status to ${is_active}...`);

    const { data, error } = await supabaseAdmin
      .from('admin_emails')
      .update({ is_active })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('❌ Error updating admin email:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Failed to update admin email',
        },
        { status: 500 }
      );
    }

    console.log('✅ Admin email updated successfully');
    return NextResponse.json({
      success: true,
      data: data as AdminEmailData,
    });
  } catch (error: any) {
    console.error('❌ Exception updating admin email:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update admin email',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id = parseInt(idParam, 10);

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email ID',
        },
        { status: 400 }
      );
    }

    console.log(`🔄 Deleting admin email ${id}...`);

    const { error } = await supabaseAdmin
      .from('admin_emails')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Error deleting admin email:', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Failed to delete admin email',
        },
        { status: 500 }
      );
    }

    console.log('✅ Admin email deleted successfully');
    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error('❌ Exception deleting admin email:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to delete admin email',
      },
      { status: 500 }
    );
  }
}
