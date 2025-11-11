import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// PATCH /api/admin/influencers/payouts/[payoutId] - Update payout status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ payoutId: string }> }
) {
  try {
    const { payoutId } = await params;
    const body = await request.json();
    const { status, transaction_id, notes } = body;

    if (!status || (status !== 'completed' && status !== 'failed')) {
      return NextResponse.json(
        { success: false, error: 'Valid status (completed/failed) is required' },
        { status: 400 }
      );
    }

    const updateData: any = {
      status,
      payout_date: new Date().toISOString(),
    };

    if (transaction_id) updateData.transaction_id = transaction_id;
    if (notes) updateData.notes = notes;

    const { data, error } = await supabaseAdmin
      .from('influencer_payouts')
      .update(updateData)
      .eq('id', payoutId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    // If completed, update influencer balances
    if (status === 'completed' && data) {
      const { data: influencerData } = await supabaseAdmin
        .from('influencers')
        .select('total_paid, remaining_balance')
        .eq('id', data.influencer_id)
        .single();

      if (influencerData) {
        const newTotalPaid = (influencerData.total_paid || 0) + data.amount;
        const newRemainingBalance = Math.max(0, (influencerData.remaining_balance || 0) - data.amount);

        await supabaseAdmin
          .from('influencers')
          .update({
            total_paid: newTotalPaid,
            remaining_balance: newRemainingBalance,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.influencer_id);
      }
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Payout status updated successfully'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message },
      { status: 500 }
    );
  }
}
