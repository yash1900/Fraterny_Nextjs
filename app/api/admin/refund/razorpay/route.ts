/**
 * API Route: /api/admin/refund/razorpay
 * Methods: GET
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';



// Razorpay API configuration
const RAZORPAY_BASE_URL = 'https://api.razorpay.com/v1';

// Razorpay interfaces
interface RazorpayPaymentDetail {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';
  order_id: string;
  invoice_id?: string;
  international: boolean;
  method: string;
  amount_refunded: number;
  refund_status?: 'null' | 'partial' | 'full';
  captured: boolean;
  description?: string;
  card_id?: string;
  bank?: string;
  wallet?: string;
  vpa?: string;
  email: string;
  contact: string;
  notes: Record<string, string>;
  fee?: number;
  tax?: number;
  error_code?: string;
  error_description?: string;
  error_source?: string;
  error_step?: string;
  error_reason?: string;
  acquirer_data?: Record<string, any>;
  created_at: number;
}

interface RazorpayRefundRequest {
  amount?: number;
  speed?: 'normal' | 'optimum';
  notes?: Record<string, string>;
  receipt?: string;
}

interface RazorpayRefundResponse {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  payment_id: string;
  notes: Record<string, string>;
  receipt?: string;
  acquirer_data?: Record<string, any>;
  created_at: number;
  batch_id?: string;
  status: 'pending' | 'processed' | 'failed';
  speed_processed: 'normal' | 'optimum';
  speed_requested: 'normal' | 'optimum';
}

/**
 * Get Razorpay Basic Auth header
 */
function getRazorpayAuth(): string {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials not configured');
  }

  return Buffer.from(`${keyId}:${keySecret}`).toString('base64');
}

/**
 * Enhanced database transaction lookup with multiple ID support (from services-old)
 */
async function fetchDatabaseTransaction(paymentId: string): Promise<any | null> {
  try {
    console.log('🔍 Searching database for Razorpay transaction:', paymentId);
    
    // Search by multiple Razorpay-related fields in transaction_details table
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
      .or(`payment_id.eq.${paymentId},order_id.eq.${paymentId},transaction_id.eq.${paymentId}`)
      .eq('gateway', 'Razorpay')
      .limit(1);

    if (error) {
      console.error('Database query error:', error);
      return null;
    }

    if (data && data.length > 0) {
      console.log('✅ Found Razorpay transaction in database:', {
        payment_id: data[0].payment_id,
        transaction_id: data[0].transaction_id,
        gateway: data[0].gateway
      });
      return data[0];
    }

    console.log('❌ Razorpay transaction not found in database for ID:', paymentId);
    return null;
  } catch (error) {
    console.error('Error fetching database transaction:', error);
    return null;
  }
}

/**
 * Look up Razorpay payment details
 */
async function lookupRazorpayPayment(paymentId: string): Promise<RazorpayPaymentDetail | null> {
  try {
    const auth = getRazorpayAuth();

    const response = await fetch(
      `${RAZORPAY_BASE_URL}/payments/${paymentId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const errorText = await response.text();
      console.error('Razorpay payment lookup error:', errorText);
      throw new Error(`Razorpay payment lookup failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error looking up Razorpay payment:', error);
    return null;
  }
}

/**
 * Enhanced transaction lookup combining database and Razorpay (from services-old)
 */
async function lookupTransaction(paymentId: string): Promise<{
  success: boolean;
  status: string;
  message: string;
  database_data: any | null;
  razorpay_data: RazorpayPaymentDetail | null;
  can_refund: boolean;
  error?: string;
}> {
  try {
    console.log('🔍 Starting Razorpay transaction lookup for:', paymentId);
    
    // Fetch from both sources in parallel
    const [databaseData, razorpayData] = await Promise.all([
      fetchDatabaseTransaction(paymentId),
      lookupRazorpayPayment(paymentId),
    ]);

    // Determine status based on what was found
    if (databaseData && razorpayData) {
      // Check if the transaction can be refunded
      const canRefund = razorpayData.status === 'captured' && 
                       razorpayData.amount_refunded < razorpayData.amount;
      
      return {
        success: true,
        status: 'VERIFIED',
        message: canRefund 
          ? 'Transaction found in both database and Razorpay. Ready for refund.'
          : 'Transaction found but cannot be refunded (not captured or already refunded).',
        database_data: databaseData,
        razorpay_data: razorpayData,
        can_refund: canRefund,
      };
    } else if (!databaseData && razorpayData) {
      return {
        success: true,
        status: 'UNRECORDED',
        message: 'Payment made in Razorpay but not recorded in database.',
        database_data: null,
        razorpay_data: razorpayData,
        can_refund: false,
      };
    } else if (databaseData && !razorpayData) {
      return {
        success: true,
        status: 'NOT_IN_RAZORPAY',
        message: 'Payment recorded in database but not found in Razorpay.',
        database_data: databaseData,
        razorpay_data: null,
        can_refund: false,
      };
    } else {
      return {
        success: true,
        status: 'NOT_FOUND',
        message: 'Transaction not found in database or Razorpay.',
        database_data: null,
        razorpay_data: null,
        can_refund: false,
      };
    }
  } catch (error: any) {
    console.error('Error in Razorpay transaction lookup:', error);
    return {
      success: false,
      status: 'NOT_FOUND',
      message: 'Error occurred during transaction lookup.',
      database_data: null,
      razorpay_data: null,
      can_refund: false,
      error: error.message,
    };
  }
}

/**
 * Process Razorpay refund
 */
async function processRazorpayRefund(
  paymentId: string,
  amountInPaise: number,
  notes?: Record<string, string>,
  receipt?: string,
  speed: 'normal' | 'optimum' = 'normal'
): Promise<RazorpayRefundResponse> {
  const auth = getRazorpayAuth();

  const refundData: RazorpayRefundRequest = {
    amount: amountInPaise,
    speed,
  };

  if (notes) {
    refundData.notes = notes;
  }

  if (receipt) {
    refundData.receipt = receipt;
  }

  const response = await fetch(
    `${RAZORPAY_BASE_URL}/payments/${paymentId}/refund`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(refundData),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Razorpay refund error:', errorText);
    throw new Error(`Razorpay refund failed: ${response.status} - ${errorText}`);
  }

  return await response.json();
}

/**
 * Format Razorpay amount from paise to rupees
 */
function formatRazorpayAmount(amountInPaise: number): string {
  return (amountInPaise / 100).toFixed(2);
}

/**
 * Convert amount from rupees to paise for Razorpay API
 */
function convertToRazorpayAmount(amountInRupees: number): number {
  return Math.round(amountInRupees * 100);
}

// POST - Process Razorpay refund with transaction lookup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      transaction_id, 
      payment_id,
      refund_amount, 
      currency = 'INR',
      reason,
      admin_notes,
      speed = 'normal'
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

    console.log('🔍 Looking up Razorpay payment:', { transaction_id, payment_id });

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
        .or(`transaction_id.eq.${transaction_id},payment_id.eq.${transaction_id},order_id.eq.${transaction_id}`)
        .eq('gateway', 'Razorpay')
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
        .or(`payment_id.eq.${payment_id},order_id.eq.${payment_id}`)
        .eq('gateway', 'Razorpay')
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

    // Step 2: Look up payment in Razorpay
    const razorpayPaymentId = dbTransaction.payment_id || dbTransaction.transaction_id;
    const razorpayPayment = await lookupRazorpayPayment(razorpayPaymentId);

    if (!razorpayPayment) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment not found in Razorpay'
        },
        { status: 404 }
      );
    }

    // Step 3: Verify payment is refundable
    if (!['captured', 'authorized'].includes(razorpayPayment.status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Payment status ${razorpayPayment.status} is not refundable`
        },
        { status: 400 }
      );
    }

    // Step 4: Convert refund amount to paise
    const refundAmountInPaise = convertToRazorpayAmount(parseFloat(refund_amount));
    
    // Validate refund amount doesn't exceed available amount
    const availableForRefund = razorpayPayment.amount - razorpayPayment.amount_refunded;
    if (refundAmountInPaise > availableForRefund) {
      return NextResponse.json(
        {
          success: false,
          error: `Refund amount ₹${refund_amount} exceeds available amount ₹${formatRazorpayAmount(availableForRefund)}`
        },
        { status: 400 }
      );
    }

    // Step 5: Process the refund
    const refundNotes = {
      reason: reason || 'Admin initiated refund',
      admin_notes: admin_notes || '',
      refund_id: `refund_${Date.now()}`
    };

    const refundResponse = await processRazorpayRefund(
      razorpayPaymentId,
      refundAmountInPaise,
      refundNotes,
      `receipt_${Date.now()}`,
      speed as 'normal' | 'optimum'
    );

    // Step 6: Update database with refund details
    const refundRecord = {
      transaction_id: dbTransaction.transaction_id,
      payment_id: dbTransaction.payment_id,
      order_id: dbTransaction.order_id,
      session_id: dbTransaction.session_id,
      user_id: dbTransaction.user_id,
      refund_amount,
      original_amount: formatRazorpayAmount(razorpayPayment.amount),
      currency,
      gateway: 'razorpay',
      refund_status: refundResponse.status === 'processed' ? 'completed' : 'pending',
      initiated_by: 'admin',
      reason,
      admin_notes,
      customer_email: razorpayPayment.email,
      customer_mobile: razorpayPayment.contact,
      gateway_refund_id: refundResponse.id,
      gateway_response: refundResponse,
      original_transaction_data: razorpayPayment,
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

    console.log('✅ Razorpay refund completed:', refund.refund_id);

    return NextResponse.json({
      success: true,
      data: {
        refund,
        gateway_response: refundResponse,
        refund_amount_formatted: `₹${refund_amount}`,
        refund_amount_paise: refundAmountInPaise
      }
    });

  } catch (error: any) {
    console.error('Razorpay refund error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Razorpay refund processing failed'
      },
      { status: 500 }
    );
  }
}

// GET - Enhanced Razorpay payment lookup
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
    
    // Format amounts for readability if Razorpay data exists
    if (lookupResult.razorpay_data) {
      const razorpayPayment = lookupResult.razorpay_data;
      lookupResult.razorpay_data = {
        ...razorpayPayment,
        amount_formatted: `₹${formatRazorpayAmount(razorpayPayment.amount)}`,
        amount_refunded_formatted: `₹${formatRazorpayAmount(razorpayPayment.amount_refunded)}`,
        available_for_refund: `₹${formatRazorpayAmount(razorpayPayment.amount - razorpayPayment.amount_refunded)}`
      } as any;
    }
    
    return NextResponse.json(lookupResult);

  } catch (error: any) {
    console.error('Razorpay payment lookup error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Payment lookup failed'
      },
      { status: 500 }
    );
  }
}

