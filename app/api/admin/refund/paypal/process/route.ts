/**
 * API Route: /api/admin/refund/paypal/process
 * Methods: POST
 */
import { NextRequest, NextResponse } from 'next/server';

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transaction_id, amount, currency, description, invoice_id } = body;

    if (!transaction_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'transaction_id (capture_id) is required',
          message: 'Missing required parameter',
        },
        { status: 400 }
      );
    }

    console.log('💰 Processing PayPal refund for capture:', transaction_id);

    const token = await getPayPalAccessToken();

    // Prepare refund data according to PayPal v2 API
    const refundData: any = {};

    // Add amount if specified (for partial refunds)
    if (amount && currency) {
      refundData.amount = {
        value: amount,
        currency_code: currency,
      };
    }

    // Add note to payer
    if (description) {
      refundData.note_to_payer = description;
    }

    // Add invoice ID if provided
    if (invoice_id) {
      refundData.invoice_id = invoice_id;
    }

    // Use PayPal v2 Captures API
    const response = await fetch(`${PAYPAL_BASE_URL}/v2/payments/captures/${transaction_id}/refund`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': `refund-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      },
      body: JSON.stringify(refundData),
    });

    if (response.ok) {
      const refundResponse = await response.json();
      console.log('✅ Refund processed successfully:', refundResponse);

      return NextResponse.json({
        success: true,
        refund_id: refundResponse.id,
        amount: refundResponse.amount?.value || amount,
        currency: refundResponse.amount?.currency_code || currency,
        state: refundResponse.status,
        status: refundResponse.status,
        message: 'Refund processed successfully',
      });
    } else {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error('❌ PayPal refund failed:', errorData);

      return NextResponse.json(
        {
          success: false,
          error: errorData.message || errorData.details?.[0]?.description || 'Refund failed',
          message: 'Failed to process refund with PayPal',
          details: errorData.details || null,
        },
        { status: response.status || 500 }
      );
    }
  } catch (error: any) {
    console.error('Error processing PayPal refund:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        message: 'Error occurred while processing refund',
      },
      { status: 500 }
    );
  }
}

