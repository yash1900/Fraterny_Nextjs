/**
 * API Route: /api/admin/refund/razorpay/process
 * Methods: POST
 */
import { NextRequest, NextResponse } from 'next/server';

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const RAZORPAY_BASE_URL = 'https://api.razorpay.com/v1';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { payment_id, amount, speed = 'normal', notes, receipt } = body;

    if (!payment_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'payment_id is required',
          message: 'Missing required parameter',
        },
        { status: 400 }
      );
    }

    console.log('💰 Processing Razorpay refund for:', payment_id);

    const credentials = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

    // First, fetch payment details to validate
    const paymentResponse = await fetch(`${RAZORPAY_BASE_URL}/payments/${payment_id}`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
    });

    if (!paymentResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: 'Payment not found',
          message: 'Unable to fetch payment details from Razorpay',
        },
        { status: 404 }
      );
    }

    const paymentData = await paymentResponse.json();

    // Validate payment is refundable
    if (paymentData.status !== 'captured' && paymentData.status !== 'authorized') {
      return NextResponse.json(
        {
          success: false,
          error: `Payment status '${paymentData.status}' is not refundable`,
          message: 'Payment must be captured or authorized to refund',
        },
        { status: 400 }
      );
    }

    // Calculate available amount for refund
    const availableAmount = paymentData.amount - paymentData.amount_refunded;

    // Prepare refund data
    const refundData: any = {};

    // Validate and set amount (already in paise - no conversion needed!)
    if (amount) {
      if (amount > availableAmount) {
        return NextResponse.json(
          {
            success: false,
            error: `Refund amount ₹${(amount / 100).toFixed(2)} exceeds available amount ₹${(availableAmount / 100).toFixed(2)}`,
            message: 'Invalid refund amount',
          },
          { status: 400 }
        );
      }
      refundData.amount = amount; // Amount already in paise
    }
    // If no amount specified, Razorpay will refund full available amount

    if (speed) {
      refundData.speed = speed;
    }

    if (notes) {
      refundData.notes = notes;
    }

    if (receipt) {
      refundData.receipt = receipt;
    }

    const response = await fetch(`${RAZORPAY_BASE_URL}/payments/${payment_id}/refund`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(refundData),
    });

    if (response.ok) {
      const refundResponse = await response.json();
      console.log('✅ Razorpay refund processed successfully:', refundResponse);

      return NextResponse.json({
        success: true,
        refund_id: refundResponse.id,
        payment_id: refundResponse.payment_id,
        amount: refundResponse.amount,
        currency: refundResponse.currency,
        status: refundResponse.status,
        speed: refundResponse.speed_requested,
        message: 'Refund processed successfully',
      });
    } else {
      const errorData = await response.json().catch(() => ({
        error: {
          code: 'UNKNOWN_ERROR',
          description: response.statusText,
          source: 'api',
          step: 'refund',
          reason: 'network_error',
        },
      }));

      console.error('❌ Razorpay refund failed:', errorData);

      return NextResponse.json(
        {
          success: false,
          error: errorData.error?.description || 'Refund failed',
          message: 'Failed to process refund with Razorpay',
        },
        { status: response.status || 500 }
      );
    }
  } catch (error: any) {
    console.error('Error processing Razorpay refund:', error);
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

