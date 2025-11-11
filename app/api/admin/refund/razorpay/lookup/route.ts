/**
 * API Route: /api/admin/refund/razorpay/lookup
 * Methods: POST
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Database } from '@/integrations/supabase/types';



const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const RAZORPAY_BASE_URL = 'https://api.razorpay.com/v1';

async function fetchRazorpayTransaction(paymentId: string): Promise<any | null> {
  try {
    console.log('🔍 Searching Razorpay for transaction:', paymentId);

    const credentials = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

    const response = await fetch(`${RAZORPAY_BASE_URL}/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const razorpayData = await response.json();
      console.log('✅ Found transaction in Razorpay:', razorpayData);
      return razorpayData;
    } else if (response.status === 404) {
      console.log('❌ Transaction not found in Razorpay');
      return null;
    } else {
      const errorData = await response.json().catch(() => null);
      console.error('Razorpay API error:', response.status, response.statusText, errorData);
      return null;
    }
  } catch (error) {
    console.error('Error fetching Razorpay transaction:', error);
    return null;
  }
}

async function fetchDatabaseTransaction(paymentId: string): Promise<any | null> {
  try {
    console.log('🔍 Searching database for Razorpay transaction:', paymentId);

    const { data, error } = await supabaseAdmin
      .from('transaction_details')
      .select(
        `
        *,
        user_data (
          user_name,
          email,
          mobile_number,
          city
        )
      `
      )
      .or(`payment_id.eq.${paymentId},order_id.eq.${paymentId},transaction_id.eq.${paymentId}`)
      .eq('gateway', 'Razorpay')
      .limit(1);

    if (error) {
      console.error('Database query error:', error);
      return null;
    }

    if (data && data.length > 0) {
      console.log('✅ Found Razorpay transaction in database');
      return data[0];
    }

    console.log('❌ Razorpay transaction not found in database');
    return null;
  } catch (error) {
    console.error('Error fetching database transaction:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Payment ID is required',
        },
        { status: 400 }
      );
    }

    console.log('🔍 Starting Razorpay transaction lookup for:', paymentId);

    const [databaseData, razorpayData] = await Promise.all([
      fetchDatabaseTransaction(paymentId),
      fetchRazorpayTransaction(paymentId),
    ]);

    if (databaseData && razorpayData) {
      const canRefund = razorpayData.status === 'captured' && razorpayData.amount_refunded < razorpayData.amount;

      return NextResponse.json({
        success: true,
        status: 'VERIFIED',
        message: canRefund
          ? 'Transaction found in both database and Razorpay. Ready for refund.'
          : 'Transaction found but cannot be refunded (not captured or already refunded).',
        database_data: databaseData,
        razorpay_data: razorpayData,
        can_refund: canRefund,
      });
    } else if (!databaseData && razorpayData) {
      return NextResponse.json({
        success: true,
        status: 'UNRECORDED',
        message: 'Payment made in Razorpay but not recorded in database.',
        database_data: null,
        razorpay_data: razorpayData,
        can_refund: false,
      });
    } else if (databaseData && !razorpayData) {
      return NextResponse.json({
        success: true,
        status: 'NOT_IN_RAZORPAY',
        message: 'Payment recorded in database but not found in Razorpay.',
        database_data: databaseData,
        razorpay_data: null,
        can_refund: false,
      });
    } else {
      return NextResponse.json({
        success: true,
        status: 'NOT_FOUND',
        message: 'Transaction not found in database or Razorpay.',
        database_data: null,
        razorpay_data: null,
        can_refund: false,
      });
    }
  } catch (error: any) {
    console.error('Error in Razorpay transaction lookup:', error);
    return NextResponse.json(
      {
        success: false,
        status: 'NOT_FOUND',
        message: 'Error occurred during transaction lookup.',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

