/**
 * API Route: /api/admin/refund/paypal/lookup
 * Methods: POST
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Database } from '@/integrations/supabase/types';



const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_ENVIRONMENT = process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT;

const PAYPAL_BASE_URL =
  PAYPAL_ENVIRONMENT === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

async function getPayPalAccessToken(): Promise<any> {
  const credentials = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error(`Failed to get PayPal access token: ${response.statusText}`);
  }

  return await response.json();
}

async function fetchPayPalTransaction(transactionId: string): Promise<any | null> {
  try {
    console.log('🔍 Searching PayPal for transaction:', transactionId);

    const token = await getPayPalAccessToken();

    // Try v2 Captures API first (for most recent PayPal transactions)
    const response = await fetch(`${PAYPAL_BASE_URL}/v2/payments/captures/${transactionId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const paypalData = await response.json();
      console.log('✅ Found transaction in PayPal (v2):', paypalData);
      return paypalData;
    } else if (response.status === 404) {
      console.log('❌ Transaction not found in PayPal');
      return null;
    } else {
      const errorText = await response.text();
      console.error('PayPal API error:', response.status, response.statusText, errorText);
      return null;
    }
  } catch (error) {
    console.error('Error fetching PayPal transaction:', error);
    return null;
  }
}

async function fetchDatabaseTransaction(transactionId: string): Promise<any | null> {
  try {
    console.log('🔍 Searching database for transaction:', transactionId);

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
      .or(`payment_id.eq.${transactionId},paypal_order_id.eq.${transactionId},transaction_id.eq.${transactionId}`)
      .limit(1);

    if (error) {
      console.error('Database query error:', error);
      return null;
    }

    if (data && data.length > 0) {
      console.log('✅ Found transaction in database');
      return data[0];
    }

    console.log('❌ Transaction not found in database');
    return null;
  } catch (error) {
    console.error('Error fetching database transaction:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');

    if (!transactionId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Transaction ID is required',
        },
        { status: 400 }
      );
    }

    console.log('🔍 Starting PayPal transaction lookup for:', transactionId);

    const [databaseData, paypalData] = await Promise.all([
      fetchDatabaseTransaction(transactionId),
      fetchPayPalTransaction(transactionId),
    ]);

    if (databaseData && paypalData) {
      // Check if PayPal capture is refundable
      const canRefund = paypalData.status === 'COMPLETED' || paypalData.status === 'PARTIALLY_REFUNDED';
      
      return NextResponse.json({
        success: true,
        status: 'VERIFIED',
        message: canRefund 
          ? 'Transaction found in both database and PayPal. Ready for refund.'
          : `Transaction found but cannot be refunded (status: ${paypalData.status}).`,
        database_data: databaseData,
        paypal_data: paypalData,
        can_refund: canRefund,
      });
    } else if (!databaseData && paypalData) {
      return NextResponse.json({
        success: true,
        status: 'UNRECORDED',
        message: 'Payment made in PayPal but not recorded in database.',
        database_data: null,
        paypal_data: paypalData,
        can_refund: false,
      });
    } else if (databaseData && !paypalData) {
      return NextResponse.json({
        success: true,
        status: 'NOT_IN_PAYPAL',
        message: 'Payment recorded in database but not found in PayPal.',
        database_data: databaseData,
        paypal_data: null,
        can_refund: false,
      });
    } else {
      return NextResponse.json({
        success: true,
        status: 'NOT_FOUND',
        message: 'Transaction not found in database or PayPal.',
        database_data: null,
        paypal_data: null,
        can_refund: false,
      });
    }
  } catch (error: any) {
    console.error('Error in PayPal transaction lookup:', error);
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

