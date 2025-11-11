// Payment helper utilities for quest-result page
import axios from 'axios';
import type { DualGatewayPricingData, AssessmentPaymentStatus } from './types';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.fraterny.in';

/**
 * Fetch dynamic pricing for both Razorpay and PayPal gateways
 * Uses the payment gateway's shared pricing API
 */
export async function fetchDynamicPricing(): Promise<DualGatewayPricingData> {
  try {
    console.log('💰 Fetching dynamic pricing data...');

    // Import the pricing function from payment gateway
    const { getBothGatewayPricing } = await import('@/app/payment-gateway/shared/paymentApi');
    
    const pricingData = await getBothGatewayPricing();
    
    // Transform to DualGatewayPricingData format expected by quest-result components
    const transformedPricing: DualGatewayPricingData = {
      razorpay: {
        main: pricingData.razorpay.main,
        original: pricingData.razorpay.original,
        currency: pricingData.razorpay.currency,
        symbol: pricingData.razorpay.symbol,
        amount: Math.round(pricingData.razorpay.amount / 100), // Convert cents to main unit
        isIndia: pricingData.razorpay.isIndia,
        isLoading: false
      },
      paypal: {
        main: pricingData.paypal.displayAmount,
        original: pricingData.paypal.displayOriginal,
        currency: pricingData.paypal.currency,
        amount: pricingData.paypal.numericAmount,
        isIndia: pricingData.paypal.isIndia
      },
      isLoading: false
    };

    console.log('✅ Dynamic pricing loaded:', transformedPricing);
    return transformedPricing;
    
  } catch (error) {
    console.error('❌ Error fetching dynamic pricing:', error);
    
    // Return fallback pricing on error
    return {
      razorpay: {
        main: '₹299',
        original: '₹999',
        currency: 'INR',
        symbol: '₹',
        amount: 299,
        isIndia: true,
        isLoading: false
      },
      paypal: {
        main: '$5',
        original: '$15',
        currency: 'USD',
        amount: 5,
        isIndia: false
      },
      isLoading: false
    };
  }
}

/**
 * Poll payment status to check if payment is completed and PDF is ready
 * Returns null if still processing, or AssessmentPaymentStatus when ready
 */
export async function pollPaymentStatus(
  sessionId: string,
  testId: string
): Promise<AssessmentPaymentStatus | null> {
  try {
    console.log(`📡 Polling payment status for test: ${testId}`);
    
    // Use Next.js API route to check payment status from Supabase
    const response = await axios.get(
      `/api/quest/payment-status/${testId}`,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      }
    );

    const data = response.data;
    
    if (!data.success) {
      console.warn('⚠️ API returned error:', data.error);
      return null;
    }
    
    // Check if payment is completed
    if (data.ispaymentdone === 'success') {
      console.log('✅ Payment completed! PDF status:', data.quest_status);
      
      // Validate quest_status to match expected type
      let validQuestStatus: 'generated' | 'working' | null = 'working';
      if (data.quest_status === 'generated' || data.quest_status === 'working') {
        validQuestStatus = data.quest_status;
      } else if (!data.quest_status) {
        validQuestStatus = null;
      }
      
      return {
        ispaymentdone: 'success',
        quest_pdf: data.quest_pdf || '',
        quest_status: validQuestStatus
      };
    }

    // Payment not completed yet
    console.log('⏳ Payment not completed yet, payment_status:', data.payment_status || 'null');
    return null;
    
  } catch (error: any) {
    console.error('❌ Error polling payment status:', error);
    
    // If it's a 404, record doesn't exist yet (submission still processing)
    if (error.response?.status === 404) {
      console.log('ℹ️ Status check returned 404 - record not ready yet');
      return null;
    }
    
    // For other errors, throw to let caller handle
    throw error;
  }
}

/**
 * Start polling for payment status with automatic retry logic
 * Polls every 5 seconds for up to 2 minutes (24 attempts)
 * 
 * @param sessionId - Session ID
 * @param testId - Test ID
 * @param onStatusUpdate - Callback when status changes
 * @param onComplete - Callback when payment is complete and PDF ready
 * @param onError - Callback when polling fails
 * @returns Function to stop polling
 */
export function startPaymentStatusPolling(
  sessionId: string,
  testId: string,
  onStatusUpdate: (status: AssessmentPaymentStatus | null) => void,
  onComplete: (status: AssessmentPaymentStatus) => void,
  onError?: (error: Error) => void
): () => void {
  let pollCount = 0;
  const maxAttempts = 24; // 2 minutes total (24 * 5 seconds)
  const pollInterval = 5000; // 5 seconds
  let intervalId: NodeJS.Timeout | null = null;
  let isActive = true;

  const poll = async () => {
    if (!isActive) return;

    pollCount++;
    console.log(`🔄 Payment status poll attempt ${pollCount}/${maxAttempts}`);

    try {
      const status = await pollPaymentStatus(sessionId, testId);
      
      // Update caller with current status
      onStatusUpdate(status);

      if (status?.ispaymentdone === 'success') {
        console.log('🎉 Payment completed and verified!');
        isActive = false;
        if (intervalId) clearInterval(intervalId);
        onComplete(status);
        return;
      }

      // Check if max attempts reached
      if (pollCount >= maxAttempts) {
        console.warn('⏰ Max polling attempts reached');
        isActive = false;
        if (intervalId) clearInterval(intervalId);
        if (onError) {
          onError(new Error('Payment verification timeout'));
        }
      }
      
    } catch (error: any) {
      console.error('❌ Polling error:', error);
      
      // Stop polling on critical errors
      if (pollCount >= maxAttempts || error.response?.status === 500) {
        isActive = false;
        if (intervalId) clearInterval(intervalId);
        if (onError) {
          onError(error);
        }
      }
      // Otherwise continue polling
    }
  };

  // Start polling immediately, then at intervals
  poll();
  intervalId = setInterval(poll, pollInterval);

  // Return cleanup function
  return () => {
    isActive = false;
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    console.log('🛑 Payment status polling stopped');
  };
}

/**
 * Check if a payment has already been completed for this session
 * Useful for page refreshes or navigation back to results
 */
export async function checkExistingPaymentStatus(
  sessionId: string,
  testId: string
): Promise<AssessmentPaymentStatus | null> {
  try {
    console.log('🔍 Checking for existing payment...');
    return await pollPaymentStatus(sessionId, testId);
  } catch (error) {
    console.error('❌ Error checking existing payment:', error);
    return null;
  }
}