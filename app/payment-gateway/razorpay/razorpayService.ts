// Razorpay payment gateway service
import type { PaymentResult, CreateOrderRequest, PaymentCompletionRequest } from '../shared/types';
import { 
  createPaymentOrder, 
  completePayment, 
  getUserLocationFlag,
  getOrCreateSessionStartTime,
  getSessionData,
  getSessionDuration
} from '../shared/paymentApi';

// Razorpay configuration
const RAZORPAY_CONFIG = {
  KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
  COMPANY_NAME: 'Fraterny',
  THEME_COLOR: '#3399cc',
};

// Razorpay types
interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// Declare Razorpay for TypeScript
declare global {
  interface Window {
    Razorpay: any;
  }
}

// Load Razorpay SDK
async function loadRazorpaySDK(): Promise<void> {
  if (window.Razorpay) {
    return; // Already loaded
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    script.onload = () => {
      if (window.Razorpay) {
        console.log('✅ Razorpay SDK loaded successfully');
        resolve();
      } else {
        reject(new Error('Razorpay object not available after script load'));
      }
    };

    script.onerror = () => {
      reject(new Error('Failed to load Razorpay script'));
    };

    document.head.appendChild(script);

    // Timeout after 10 seconds
    setTimeout(() => {
      if (!window.Razorpay) {
        reject(new Error('Razorpay script load timeout'));
      }
    }, 10000);
  });
}

// Create Razorpay order via backend
async function createRazorpayOrder(
  sessionId: string,
  testId: string,
  user: any
): Promise<any> {
  try {
    console.log('📱 Creating Razorpay order:', { sessionId, testId });

    // Get session start time
    const sessionStartTime = getOrCreateSessionStartTime();

    // Get pricing data from API route
    const axios = (await import('axios')).default;
    const response = await axios.get('/api/admin/pricing/display');
    const pricingResult = response.data;
    
    if (!pricingResult.success || !pricingResult.data) {
      throw new Error('Failed to get pricing data');
    }

    const isIndia = await getUserLocationFlag();
    const amount = isIndia
      ? pricingResult.data.razorpay.india.price
      : pricingResult.data.razorpay.international.price;
    const currency = isIndia ? 'INR' : 'USD';

    // Validate email
    const email = user.email;
    if (!email || email.trim().length === 0) {
      throw new Error('User email is required for payment');
    }

    // Create order request
    const orderRequest: CreateOrderRequest = {
      sessionId,
      testId,
      userId: user.id,
      fixEmail: email,
      pricingTier: 'regular',
      amount,
      currency,
      gateway: 'razorpay',
      sessionStartTime,
      isIndia,
      metadata: {
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        authenticationRequired: false,
        isIndia,
        location: isIndia ? 'IN' : 'INTL',
      },
    };

    console.log('📡 Calling create-order API for Razorpay...');
    const orderResponse = await createPaymentOrder(orderRequest);
    
    console.log('✅ Razorpay order created:', orderResponse);
    return orderResponse;
  } catch (error) {
    console.error('❌ Failed to create Razorpay order:', error);
    throw error;
  }
}

// Open Razorpay payment modal
async function openRazorpayModal(
  orderData: any,
  userInfo: { email: string; name?: string; userId: string }
): Promise<PaymentResult> {
  return new Promise((resolve) => {
    try {
      // Import analytics (COMMENTED OUT FOR NOW)
      import('../../../lib/services/googleAnalytics').then(({ googleAnalytics }) => {
        const options = {
          key: RAZORPAY_CONFIG.KEY_ID,
          amount: orderData.amount,
          currency: orderData.currency,
          name: RAZORPAY_CONFIG.COMPANY_NAME,
          description: 'Payment for Assessment',
          order_id: orderData.razorpayOrderId,
          handler: (response: RazorpayResponse) => {
            console.log('✅ Payment successful:', response);
            
            // Track payment success (COMMENTED OUT)
            googleAnalytics.trackPaymentSuccess({
              session_id: orderData.paymentSessionId,
              payment_id: response.razorpay_payment_id,
              order_id: response.razorpay_order_id,
              amount: orderData.amount
            });
            
            resolve({
              success: true,
              paymentData: response,
            });
          },
          prefill: {
            email: userInfo.email,
            name: userInfo.name,
          },
          theme: {
            color: RAZORPAY_CONFIG.THEME_COLOR,
          },
          modal: {
            ondismiss: () => {
              console.log('⚠️ Payment modal dismissed by user');
              
              // Track payment cancellation (COMMENTED OUT)
              googleAnalytics.trackPaymentCancelled({
                session_id: orderData.paymentSessionId,
                cancel_reason: 'user_dismissed',
                amount: orderData.amount
              });

              googleAnalytics.trackMetaPixelPaymentCancelled({
                session_id: orderData.paymentSessionId,
                amount: orderData.amount / 100,
                currency: orderData.currency
              });
              
              resolve({
                success: false,
                error: 'Payment cancelled by user',
              });
            },
            escape: true,
            backdropclose: false,
          },
        };

        // Create and open Razorpay instance
        const rzp = new window.Razorpay(options);

        // Track modal opened (COMMENTED OUT)
        googleAnalytics.trackPaymentModalOpened({
          session_id: orderData.paymentSessionId,
          order_id: orderData.razorpayOrderId,
          amount: orderData.amount,
          currency: orderData.currency
        });

        // Handle payment failure
        rzp.on('payment.failed', (response: any) => {
          console.error('❌ Payment failed:', response);
          
          // Track payment failure (COMMENTED OUT)
          googleAnalytics.trackPaymentFailed({
            session_id: orderData.paymentSessionId,
            failure_reason: response.error?.description || 'Payment failed',
            error_code: response.error?.code || 'unknown',
            amount: orderData.amount
          });
          
          resolve({
            success: false,
            error: response.error?.description || 'Payment failed',
          });
        });

        // Open the modal
        rzp.open();
      });
    } catch (error) {
      console.error('❌ Error opening Razorpay modal:', error);
      resolve({
        success: false,
        error: 'Failed to open payment modal',
      });
    }
  });
}

// Complete Razorpay payment
async function completeRazorpayPayment(
  orderData: any,
  paymentData: RazorpayResponse,
  userId: string
): Promise<void> {
  try {
    console.log('📡 Completing Razorpay payment...');

    // Get session data
    const sessionData = getSessionData();
    if (!sessionData) {
      throw new Error('Session data not found');
    }

    // Calculate timing data
    const sessionDuration = getSessionDuration();

    // Prepare completion request
    const completionRequest: PaymentCompletionRequest = {
      userId,
      originalSessionId: sessionData.originalSessionId,
      testId: sessionData.testId,
      paymentSessionId: orderData.paymentSessionId,
      gateway: 'razorpay',
      orderid: paymentData.razorpay_order_id,
      transaction_id: orderData.transaction_id,
      paymentData: {
        order_id: paymentData.razorpay_order_id,
        payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
        transaction_id: orderData.transaction_id,
        amount: orderData.amount,
        currency: orderData.currency,
        status: 'success',
        payer_id: 'razorpay_no_payer',
        paypal_order_id: 'razorpay_no_paypal_order'
      },
      metadata: {
        pricingTier: sessionData.pricingSnapshot?.tier as 'early' | 'regular' || 'regular',
        sessionStartTime: sessionData.sessionStartTime,
        paymentStartTime: new Date().toISOString(),
        paymentCompletedTime: new Date().toISOString(),
        authenticationFlow: sessionData.authenticationRequired,
        userAgent: navigator.userAgent,
        timingData: {
          sessionToPaymentDuration: sessionDuration,
        },
      },
    };

    // Send completion data to backend
    await completePayment(completionRequest);
    console.log('✅ Razorpay payment completion sent successfully');

    // Track affiliate purchase
    try {
      const { trackAffiliatePurchase } = await import('@/lib/services/affiliateTracking');
      await trackAffiliatePurchase({
        userId: userId,
        sessionId: sessionData.originalSessionId,
        testId: sessionData.testId,
        gateway: 'razorpay',
        amount: orderData.amount,
        currency: orderData.currency
      });
    } catch (error) {
      console.error('⚠️ Failed to track affiliate purchase (non-critical):', error);
    }

    // Track completion analytics (COMMENTED OUT)
    const { googleAnalytics } = await import('../../../lib/services/googleAnalytics');
    
    googleAnalytics.trackPaymentCompleted({
      session_id: sessionData.originalSessionId,
      payment_id: paymentData.razorpay_payment_id,
      verification_success: true,
      total_duration: sessionDuration
    });

    // // Track conversions if applicable
    const urlParams = new URLSearchParams(window.location.search);
    const gclid = urlParams.get('gclid') || sessionStorage.getItem('gclid') || localStorage.getItem('gclid');

    if (gclid) {
      googleAnalytics.trackGoogleAdsConversion({
        session_id: sessionData.originalSessionId,
        payment_id: paymentData.razorpay_payment_id,
        amount: orderData.amount / 100,
        currency: orderData.currency
      });
    }

    if (googleAnalytics.isRedditTraffic()) {
      googleAnalytics.trackRedditConversion({
        session_id: sessionData.originalSessionId,
        payment_id: paymentData.razorpay_payment_id,
        amount: orderData.amount / 100,
        currency: orderData.currency
      });
    }

    if (googleAnalytics.isMetaTraffic()) {
      googleAnalytics.trackMetaPixelPurchase({
        session_id: sessionData.originalSessionId,
        payment_id: paymentData.razorpay_payment_id,
        amount: orderData.amount / 100,
        currency: orderData.currency
      });
    }

    console.log('✅ Razorpay payment flow completed successfully');
  } catch (error) {
    console.error('❌ Error completing Razorpay payment:', error);
    throw error;
  }
}

// Main Razorpay payment processing function
export async function processRazorpayPayment(
  sessionId: string,
  testId: string,
  user: any
): Promise<PaymentResult> {
  try {
    console.log('🚀 Starting Razorpay payment flow:', { sessionId, testId });

    // Step 1: Load Razorpay SDK
    await loadRazorpaySDK();

    // Step 2: Create order via backend
    const orderData = await createRazorpayOrder(sessionId, testId, user);

    // Step 3: Get user info
    const userInfo = {
      email: user.email || '',
      name: user.user_metadata?.full_name || 'User',
      userId: user.id
    };

    // Track Meta Pixel initiate checkout (COMMENTED OUT)
    const { googleAnalytics } = await import('../../../lib/services/googleAnalytics');
    googleAnalytics.trackMetaPixelInitiateCheckout({
      session_id: sessionId,
      test_id: testId,
      amount: orderData.amount / 100,
      currency: orderData.currency
    });

    // Step 4: Open Razorpay modal
    const paymentResult = await openRazorpayModal(orderData, userInfo);

    // Step 5: Complete payment if successful
    if (paymentResult.success && paymentResult.paymentData) {
      await completeRazorpayPayment(orderData, paymentResult.paymentData, user.id);
    }

    return paymentResult;
  } catch (error: any) {
    console.error('❌ Razorpay payment flow failed:', error);
    
    const errorMessage = error?.message || 'Unknown Razorpay error';
    let userFriendlyMessage: string;

    if (errorMessage.includes('authentication') || errorMessage.includes('Authentication')) {
      userFriendlyMessage = 'Please sign in to continue with payment.';
    } else if (errorMessage.includes('network') || errorMessage.includes('Network')) {
      userFriendlyMessage = 'Network error. Please check your connection and try again.';
    } else if (errorMessage.includes('script') || errorMessage.includes('SDK')) {
      userFriendlyMessage = 'Failed to load payment gateway. Please refresh and try again.';
    } else if (errorMessage.includes('timeout')) {
      userFriendlyMessage = 'Payment loading timed out. Please try again.';
    } else {
      userFriendlyMessage = 'Payment failed. Please try again.';
    }

    return {
      success: false,
      error: userFriendlyMessage,
    };
  }
}
