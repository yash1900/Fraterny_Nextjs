/**
 * API Route: /api/admin/refund/[refundId]/sync
 * Methods: POST
 * Description: Sync refund status with payment gateway
 */
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const RAZORPAY_BASE_URL = 'https://api.razorpay.com/v1';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_ENVIRONMENT = process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT;
const PAYPAL_BASE_URL = PAYPAL_ENVIRONMENT === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

/**
 * Get PayPal access token
 */
async function getPayPalAccessToken(): Promise<string> {
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

  const data = await response.json();
  return data.access_token;
}

/**
 * Check Razorpay refund status
 */
async function checkRazorpayRefundStatus(refundId: string): Promise<any> {
  const credentials = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

  const response = await fetch(`${RAZORPAY_BASE_URL}/refunds/${refundId}`, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch Razorpay refund: ${errorText}`);
  }

  return await response.json();
}

/**
 * Check PayPal refund status
 */
async function checkPayPalRefundStatus(refundId: string): Promise<any> {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(`${PAYPAL_BASE_URL}/v2/payments/refunds/${refundId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch PayPal refund: ${errorText}`);
  }

  return await response.json();
}

/**
 * Map gateway status to our internal status
 */
function mapGatewayStatus(gateway: string, gatewayStatus: string): string {
  if (gateway === 'Razorpay') {
    // Razorpay statuses: pending, processed, failed
    if (gatewayStatus === 'processed') return 'completed';
    if (gatewayStatus === 'failed') return 'failed';
    return 'processing';
  } else if (gateway === 'paypal') {
    // PayPal statuses: COMPLETED, PENDING, FAILED, CANCELLED
    if (gatewayStatus === 'COMPLETED') return 'completed';
    if (gatewayStatus === 'FAILED') return 'failed';
    if (gatewayStatus === 'CANCELLED') return 'cancelled';
    return 'processing';
  }
  return 'processing';
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ refundId: string }> }
) {
  try {
    const { refundId } = await params;

    // Fetch refund record from database
    const { data: refund, error: fetchError } = await supabaseAdmin
      .from('refund_transactions')
      .select('*')
      .eq('refund_id', refundId)
      .single();

    if (fetchError || !refund) {
      return NextResponse.json(
        {
          success: false,
          error: 'Refund not found',
        },
        { status: 404 }
      );
    }

    console.log(`🔄 Syncing refund status for ${refundId} with ${refund.gateway}`);

    // If gateway_refund_id is missing, try to find it from the payment gateway
    let gatewayRefundId = refund.gateway_refund_id;
    
    if (!gatewayRefundId) {
      console.log('⚠️ No gateway_refund_id found, attempting to lookup from payment...');
      
      // For old refunds without gateway_refund_id, we can't sync
      return NextResponse.json(
        {
          success: false,
          error: 'This refund does not have a gateway refund ID. It may be from an old refund that was not properly tracked. Please process a new refund instead.',
        },
        { status: 400 }
      );
    }

    // Fetch status from gateway
    let gatewayData: any;
    
    if (refund.gateway === 'Razorpay') {
      gatewayData = await checkRazorpayRefundStatus(gatewayRefundId);
    } else if (refund.gateway === 'paypal') {
      gatewayData = await checkPayPalRefundStatus(gatewayRefundId);
    } else {
      return NextResponse.json(
        {
          success: false,
          error: `Unsupported gateway: ${refund.gateway}`,
        },
        { status: 400 }
      );
    }

    // Map gateway status to our status
    const newStatus = mapGatewayStatus(refund.gateway, gatewayData.status);
    const updates: any = {
      refund_status: newStatus,
      gateway_refund_status: gatewayData.status,
      gateway_response: gatewayData,
    };

    // Set completed_at if status is completed
    if (newStatus === 'completed' && !refund.completed_at) {
      updates.completed_at = new Date().toISOString();
    }

    // Update refund record
    const { data: updatedRefund, error: updateError } = await supabaseAdmin
      .from('refund_transactions')
      .update(updates)
      .eq('refund_id', refundId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to update refund: ${updateError.message}`,
        },
        { status: 500 }
      );
    }

    console.log(`✅ Refund status synced: ${refund.refund_status} → ${newStatus}`);

    return NextResponse.json({
      success: true,
      data: {
        refund: updatedRefund,
        gateway_data: gatewayData,
      },
      message: `Status synced successfully: ${newStatus}`,
    });

  } catch (error: any) {
    console.error('❌ Error syncing refund status:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to sync refund status',
      },
      { status: 500 }
    );
  }
}
