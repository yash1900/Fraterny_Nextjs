/**
 * API Route: /api/admin/refund/paypal
 * Methods: GET
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';



// PayPal API configuration
const PAYPAL_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.paypal.com' 
  : 'https://api.sandbox.paypal.com';

// PayPal interfaces
interface PayPalAccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface PayPalTransactionDetail {
  transaction_info: {
    transaction_id: string;
    transaction_amount: {
      currency_code: string;
      value: string;
    };
    transaction_status: string;
    transaction_subject: string;
    ending_balance: {
      currency_code: string;
      value: string;
    };
    available_balance: {
      currency_code: string;
      value: string;
    };
    protection_eligibility: string;
  };
  payer_info: {
    account_id: string;
    email_address: string;
    address_status: string;
    payer_status: string;
    payer_name: {
      given_name: string;
      surname: string;
    };
    country_code: string;
  };
  shipping_info?: any;
  cart_info?: any;
  store_info?: any;
  auction_info?: any;
  incentive_info?: any;
}

interface PayPalRefundRequest {
  amount: {
    value: string;
    currency_code: string;
  };
  note_to_payer?: string;
}

interface PayPalRefundResponse {
  id: string;
  status: 'CANCELLED' | 'PENDING' | 'COMPLETED';
  amount: {
    currency_code: string;
    value: string;
  };
  seller_payable_breakdown?: {
    gross_amount: {
      currency_code: string;
      value: string;
    };
    paypal_fee: {
      currency_code: string;
      value: string;
    };
    net_amount: {
      currency_code: string;
      value: string;
    };
  };
  invoice_id?: string;
  custom_id?: string;
  acquirer_reference_number?: string;
  note_to_payer?: string;
  create_time: string;
  update_time: string;
}

/**
 * Get PayPal access token
 */
async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json',
      'Accept-Language': 'en_US',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('PayPal token error:', errorText);
    throw new Error(`Failed to get PayPal access token: ${response.status}`);
  }

  const data: PayPalAccessTokenResponse = await response.json();
  return data.access_token;
}

/**
 * Enhanced transaction lookup with multiple ID support (from services-old)
 */
async function fetchDatabaseTransaction(transactionId: string): Promise<any | null> {
  try {
    console.log('🔍 Searching database for transaction:', transactionId);
    
    // Search by multiple PayPal-related fields in transaction_details table
    const { data, error } = await supabaseAdmin
      .from('transaction_details')
      .select(`
        *,
        user_data (
          user_name,
          email,
          mobile_number,
          city
        )
      `)
      .or(`payment_id.eq.${transactionId},paypal_order_id.eq.${transactionId},transaction_id.eq.${transactionId}`)
      .limit(1);

    if (error) {
      console.error('Database query error:', error);
      return null;
    }

    if (data && data.length > 0) {
      console.log('✅ Found transaction in database:', {
        payment_id: data[0].payment_id,
        transaction_id: data[0].transaction_id
      });
      return data[0];
    }

    console.log('❌ Transaction not found in database for ID:', transactionId);
    return null;
  } catch (error) {
    console.error('Error fetching database transaction:', error);
    return null;
  }
}

/**
 * Look up PayPal transaction details
 */
async function lookupPayPalTransaction(transactionId: string): Promise<PayPalTransactionDetail | null> {
  try {
    const accessToken = await getPayPalAccessToken();

    const response = await fetch(
      `${PAYPAL_BASE_URL}/v1/reporting/transactions?transaction_id=${transactionId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`PayPal transaction lookup failed: ${response.status}`);
    }

    const data = await response.json();
    return data.transaction_details?.[0] || null;
  } catch (error) {
    console.error('Error looking up PayPal transaction:', error);
    return null;
  }
}

/**
 * Enhanced transaction lookup combining database and PayPal (from services-old)
 */
async function lookupTransaction(transactionId: string): Promise<{
  success: boolean;
  status: string;
  message: string;
  database_data: any | null;
  paypal_data: PayPalTransactionDetail | null;
  can_refund: boolean;
  error?: string;
}> {
  try {
    console.log('🔍 Starting transaction lookup for:', transactionId);
    
    // Fetch from both sources in parallel
    const [databaseData, paypalData] = await Promise.all([
      fetchDatabaseTransaction(transactionId),
      lookupPayPalTransaction(transactionId),
    ]);

    // Determine status based on what was found
    if (databaseData && paypalData) {
      return {
        success: true,
        status: 'VERIFIED',
        message: 'Transaction found in both database and PayPal. Ready for refund.',
        database_data: databaseData,
        paypal_data: paypalData,
        can_refund: true,
      };
    } else if (!databaseData && paypalData) {
      return {
        success: true,
        status: 'UNRECORDED',
        message: 'Payment made in PayPal but not recorded in database.',
        database_data: null,
        paypal_data: paypalData,
        can_refund: false,
      };
    } else if (databaseData && !paypalData) {
      return {
        success: true,
        status: 'NOT_IN_PAYPAL',
        message: 'Payment recorded in database but not found in PayPal.',
        database_data: databaseData,
        paypal_data: null,
        can_refund: false,
      };
    } else {
      return {
        success: true,
        status: 'NOT_FOUND',
        message: 'Transaction not found in database or PayPal.',
        database_data: null,
        paypal_data: null,
        can_refund: false,
      };
    }
  } catch (error: any) {
    console.error('Error in transaction lookup:', error);
    return {
      success: false,
      status: 'NOT_FOUND',
      message: 'Error occurred during transaction lookup.',
      database_data: null,
      paypal_data: null,
      can_refund: false,
      error: error.message,
    };
  }
}

/**
 * Process PayPal refund
 */
async function processPayPalRefund(
  captureId: string,
  amount: string,
  currency: string,
  note?: string
): Promise<PayPalRefundResponse> {
  const accessToken = await getPayPalAccessToken();

  const refundData: PayPalRefundRequest = {
    amount: {
      value: amount,
      currency_code: currency,
    },
  };

  if (note) {
    refundData.note_to_payer = note;
  }

  const response = await fetch(
    `${PAYPAL_BASE_URL}/v2/payments/captures/${captureId}/refund`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'PayPal-Request-Id': `refund-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      },
      body: JSON.stringify(refundData),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('PayPal refund error:', errorText);
    throw new Error(`PayPal refund failed: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

// POST - Process PayPal refund with transaction lookup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      transaction_id, 
      payment_id,
      refund_amount, 
      currency = 'USD',
      reason,
      admin_notes 
    } = body;

    if (!transaction_id && !payment_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Either transaction_id or payment_id is required'
        },
        { status: 400 }
      );
    }

    console.log('🔍 Looking up PayPal transaction:', { transaction_id, payment_id });

    // Step 1: Check database first
    let dbTransaction = null;
    if (transaction_id) {
      const { data } = await supabaseAdmin
        .from('transaction_details')
        .select(`
          *,
          user_data (
            user_name,
            email,
            mobile_number
          )
        `)
        .or(`transaction_id.eq.${transaction_id},payment_id.eq.${transaction_id},paypal_order_id.eq.${transaction_id}`)
        .single();
      
      dbTransaction = data;
    } else if (payment_id) {
      const { data } = await supabaseAdmin
        .from('transaction_details')
        .select(`
          *,
          user_data (
            user_name,
            email,
            mobile_number
          )
        `)
        .or(`payment_id.eq.${payment_id},paypal_order_id.eq.${payment_id}`)
        .single();
      
      dbTransaction = data;
    }

    if (!dbTransaction) {
      return NextResponse.json(
        {
          success: false,
          error: 'Transaction not found in database'
        },
        { status: 404 }
      );
    }

    // Step 2: Look up transaction in PayPal
    const paypalTransaction = await lookupPayPalTransaction(
      dbTransaction.transaction_id || dbTransaction.payment_id
    );

    if (!paypalTransaction) {
      return NextResponse.json(
        {
          success: false,
          error: 'Transaction not found in PayPal'
        },
        { status: 404 }
      );
    }

    // Step 3: Verify transaction is refundable
    const transactionStatus = paypalTransaction.transaction_info.transaction_status;
    if (!['S', 'T', 'C'].includes(transactionStatus)) {
      return NextResponse.json(
        {
          success: false,
          error: `Transaction status ${transactionStatus} is not refundable`
        },
        { status: 400 }
      );
    }

    // Step 4: Process the refund
    const refundResponse = await processPayPalRefund(
      dbTransaction.payment_id || dbTransaction.transaction_id,
      refund_amount,
      currency,
      reason
    );

    // Step 5: Update database with refund details
    const refundRecord = {
      transaction_id: dbTransaction.transaction_id,
      payment_id: dbTransaction.payment_id,
      order_id: dbTransaction.order_id,
      session_id: dbTransaction.session_id,
      user_id: dbTransaction.user_id,
      refund_amount,
      original_amount: dbTransaction.amount,
      currency,
      gateway: 'paypal',
      refund_status: refundResponse.status.toLowerCase() as 'pending' | 'completed' | 'cancelled',
      initiated_by: 'admin',
      reason,
      admin_notes,
      customer_name: `${paypalTransaction.payer_info.payer_name.given_name} ${paypalTransaction.payer_info.payer_name.surname}`,
      customer_email: paypalTransaction.payer_info.email_address,
      gateway_refund_id: refundResponse.id,
      gateway_response: refundResponse,
      original_transaction_data: paypalTransaction,
    };

    const { data: refund, error: insertError } = await supabaseAdmin
      .from('refund_transactions')
      .insert(refundRecord)
      .select()
      .single();

    if (insertError) {
      console.error('Error saving refund record:', insertError);
      return NextResponse.json(
        {
          success: false,
          error: `Refund processed but failed to save record: ${insertError.message}`,
          gateway_refund_id: refundResponse.id
        },
        { status: 500 }
      );
    }

    console.log('✅ PayPal refund completed:', refund.refund_id);

    return NextResponse.json({
      success: true,
      data: {
        refund,
        gateway_response: refundResponse
      }
    });

  } catch (error: any) {
    console.error('PayPal refund error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'PayPal refund processing failed'
      },
      { status: 500 }
    );
  }
}

// GET - Enhanced PayPal transaction lookup
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transaction_id = searchParams.get('transaction_id');
    const payment_id = searchParams.get('payment_id');

    if (!transaction_id && !payment_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Either transaction_id or payment_id is required'
        },
        { status: 400 }
      );
    }

    // Use enhanced lookup from services-old
    const lookupResult = await lookupTransaction(transaction_id || payment_id || '');
    
    return NextResponse.json(lookupResult);

  } catch (error: any) {
    console.error('PayPal transaction lookup error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Transaction lookup failed'
      },
      { status: 500 }
    );
  }
}

