/**
 * API Route: /api/reconciliation
 * Methods: POST
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Database } from '@/integrations/supabase/types';



type ReconciliationResult = {
  influencerId: string;
  affiliateCode: string;
  trackedPurchases: number;
  verifiedPurchases: number;
  totalCommission: number;
  discrepancies: Array<{
    trackingEventId: string;
    issue: string;
  }>;
};

// POST /api/reconciliation - Run payment reconciliation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { influencerId, affiliateCode, startDate, endDate, autoUpdate = false } = body;

    if (!influencerId && !affiliateCode) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: 'Either influencerId or affiliateCode is required',
        },
        { status: 400 }
      );
    }

    // Get influencer profile
    let influencerQuery = supabaseAdmin.from('influencers').select('*');
    
    if (influencerId) {
      influencerQuery = influencerQuery.eq('id', influencerId);
    } else {
      influencerQuery = influencerQuery.eq('affiliate_code', affiliateCode);
    }

    const { data: influencer, error: influencerError } = await influencerQuery.single();

    if (influencerError || !influencer) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: 'Influencer not found',
        },
        { status: 404 }
      );
    }

    // Get tracking events for purchases
    let trackingQuery = supabaseAdmin
      .from('tracking_events')
      .select('*')
      .eq('affiliate_code', influencer.affiliate_code)
      .eq('event_type', 'pdf_purchased');

    if (startDate) {
      trackingQuery = trackingQuery.gte('timestamp', startDate);
    }
    if (endDate) {
      trackingQuery = trackingQuery.lte('timestamp', endDate);
    }

    const { data: trackingEvents, error: trackingError } = await trackingQuery;

    if (trackingError) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: trackingError.message,
        },
        { status: 500 }
      );
    }

    // Get actual transactions to cross-verify
    let transactionQuery = supabaseAdmin
      .from('transaction_details')
      .select('*')
      .eq('status', 'success');

    if (startDate) {
      transactionQuery = transactionQuery.gte('payment_completed_time', startDate);
    }
    if (endDate) {
      transactionQuery = transactionQuery.lte('payment_completed_time', endDate);
    }

    const { data: transactions, error: transactionError } = await transactionQuery;

    if (transactionError) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: transactionError.message,
        },
        { status: 500 }
      );
    }

    // Reconciliation logic
    const discrepancies: Array<{ trackingEventId: string; issue: string }> = [];
    let verifiedPurchases = 0;
    let totalCommission = 0;

    for (const trackingEvent of trackingEvents || []) {
      // Find matching transaction
      const matchedTransaction = transactions?.find(
        (txn) =>
          txn.user_id === trackingEvent.user_id &&
          Math.abs(
            new Date(txn.payment_completed_time || '').getTime() -
              new Date(trackingEvent.timestamp).getTime()
          ) <
            5 * 60 * 1000 // Within 5 minutes
      );

      if (matchedTransaction) {
        verifiedPurchases++;
        totalCommission += trackingEvent.commission_earned || 0;
      } else {
        discrepancies.push({
          trackingEventId: trackingEvent.id,
          issue: 'No matching transaction found',
        });
      }
    }

    // Check for commission calculation errors
    for (const trackingEvent of trackingEvents || []) {
      const expectedCommission = 100; // Replace with actual calculation logic
      if (trackingEvent.commission_earned !== expectedCommission) {
        discrepancies.push({
          trackingEventId: trackingEvent.id,
          issue: `Commission mismatch: expected ${expectedCommission}, got ${trackingEvent.commission_earned}`,
        });
      }
    }

    const result: ReconciliationResult = {
      influencerId: influencer.id,
      affiliateCode: influencer.affiliate_code,
      trackedPurchases: trackingEvents?.length || 0,
      verifiedPurchases,
      totalCommission: Number(totalCommission.toFixed(2)),
      discrepancies,
    };

    // Auto-update influencer balance if requested and no discrepancies
    if (autoUpdate && discrepancies.length === 0) {
      const { error: updateError } = await supabaseAdmin
        .from('influencers')
        .update({
          total_earnings: totalCommission,
          remaining_balance: totalCommission - (influencer.total_paid || 0),
          updated_at: new Date().toISOString(),
        })
        .eq('id', influencer.id);

      if (updateError) {
        return NextResponse.json(
          {
            success: false,
            data: result,
            error: `Reconciliation completed but failed to update balance: ${updateError.message}`,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
      error: null,
      message:
        autoUpdate && discrepancies.length === 0
          ? 'Reconciliation completed and balances updated'
          : 'Reconciliation completed',
    });
  } catch (error: any) {
    console.error('Unexpected error in reconciliation API:', error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: error?.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

// GET /api/reconciliation - Get reconciliation report for an influencer
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const influencerId = searchParams.get('influencerId');
    const affiliateCode = searchParams.get('affiliateCode');

    if (!influencerId && !affiliateCode) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: 'Either influencerId or affiliateCode is required',
        },
        { status: 400 }
      );
    }

    // Get influencer
    let influencerQuery = supabaseAdmin.from('influencers').select('*');
    
    if (influencerId) {
      influencerQuery = influencerQuery.eq('id', influencerId);
    } else {
      influencerQuery = influencerQuery.eq('affiliate_code', affiliateCode);
    }

    const { data: influencer, error: influencerError } = await influencerQuery.single();

    if (influencerError || !influencer) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: 'Influencer not found',
        },
        { status: 404 }
      );
    }

    // Get payouts history
    const { data: payouts, error: payoutsError } = await supabaseAdmin
      .from('influencer_payouts')
      .select('*')
      .eq('influencer_id', influencer.id)
      .order('created_at', { ascending: false });

    if (payoutsError) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: payoutsError.message,
        },
        { status: 500 }
      );
    }

    // Get tracking events summary
    const { data: trackingEvents, error: trackingError } = await supabaseAdmin
      .from('tracking_events')
      .select('event_type, commission_earned')
      .eq('affiliate_code', influencer.affiliate_code)
      .eq('event_type', 'pdf_purchased');

    if (trackingError) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: trackingError.message,
        },
        { status: 500 }
      );
    }

    const totalTrackedCommission =
      trackingEvents?.reduce((sum, e) => sum + (e.commission_earned || 0), 0) || 0;

    const totalPaidOut =
      payouts?.filter((p) => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0) || 0;

    const report = {
      influencer: {
        id: influencer.id,
        name: influencer.name,
        email: influencer.email,
        affiliateCode: influencer.affiliate_code,
      },
      earnings: {
        totalTrackedCommission: Number(totalTrackedCommission.toFixed(2)),
        totalEarnings: influencer.total_earnings || 0,
        totalPaid: influencer.total_paid || 0,
        remainingBalance: influencer.remaining_balance || 0,
      },
      payouts: payouts?.map((p) => ({
        id: p.id,
        amount: p.amount,
        status: p.status,
        method: p.payout_method,
        transactionId: p.transaction_id,
        createdAt: p.created_at,
        payoutDate: p.payout_date,
      })),
      discrepancy: {
        exists: Math.abs(totalTrackedCommission - (influencer.total_earnings || 0)) > 0.01,
        difference: Number((totalTrackedCommission - (influencer.total_earnings || 0)).toFixed(2)),
      },
    };

    return NextResponse.json({
      success: true,
      data: report,
      error: null,
    });
  } catch (error: any) {
    console.error('Unexpected error in reconciliation report API:', error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: error?.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

