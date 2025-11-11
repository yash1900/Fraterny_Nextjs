import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/integrations/supabase/types';
import { supabaseAdmin } from '@/lib/supabase-admin';

type RefundTransaction = Database['public']['Tables']['refund_transactions']['Row'];

type RefundStatus = 
  | 'initiated' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'partial' 
  | 'cancelled';

// GET refund by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ refundId: string }> }
) {
  try {
    const { refundId } = await params;

    const { data, error } = await supabaseAdmin
      .from('refund_transactions')
      .select('*')
      .eq('refund_id', refundId)
      .single();

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: error.code === 'PGRST116' ? 404 : 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        refund: data as RefundTransaction,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

// PATCH update refund status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ refundId: string }> }
) {
  try {
    const { refundId } = await params;
    const body = await request.json();
    const { status, ...updateData } = body;

    const updates: any = {
      refund_status: status as RefundStatus,
      ...updateData,
    };

    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }

    const { data, error } = await supabaseAdmin
      .from('refund_transactions')
      .update(updates)
      .eq('refund_id', refundId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        refund: data as RefundTransaction,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
