import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET /api/admin/influencers/[id]/payouts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data, error } = await supabaseAdmin
      .from('influencer_payouts')
      .select('*')
      .eq('influencer_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/influencers/[id]/payouts
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { amount, payout_method, transaction_id, notes, processed_by } = body;

    if (!amount || !payout_method) {
      return NextResponse.json(
        { success: false, error: 'Amount and payout method are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('influencer_payouts')
      .insert({
        influencer_id: id,
        amount,
        payout_method,
        transaction_id: transaction_id || null,
        status: 'pending',
        notes: notes || null,
        processed_by: processed_by || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Payout created successfully'
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 500 }
    );
  }
}
