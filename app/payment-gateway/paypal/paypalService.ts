// PayPal payment gateway service
import type { PaymentResult, CreateOrderRequest, PaymentCompletionRequest } from '../shared/types';
import { 
  createPaymentOrder, 
  completePayment, 
  getUserLocationFlag,
  getOrCreateSessionStartTime,
  getSessionData,
  getSessionDuration
} from '../shared/paymentApi';

// PayPal configuration
const PAYPAL_CONFIG = {
  CLIENT_ID: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
  ENVIRONMENT: process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT || 'production',
  COMPANY_NAME: 'Fraterny',
  BRAND_NAME: 'Fraterny Assessment',
};

// PayPal SDK types
declare global {
  interface Window {
    paypal?: {
      Buttons: (options: any) => {
        render: (selector: string) => Promise<void>;
      };
    };
  }
}

// PayPal order data interface
interface PayPalOrderData {
  id: string;
  status: string;
  purchase_units: Array<{
    amount: {
      currency_code: string;
      value: string;
    };
    payments?: {
      captures?: Array<{
        id: string;
        status: string;
        amount: {
          currency_code: string;
          value: string;
        };
      }>;
    };
  }>;
  payer?: {
    email_address?: string;
  };
}

// Load PayPal SDK
async function loadPayPalSDK(): Promise<void> {
  if (window.paypal) {
    return; // Already loaded
  }

  return new Promise((resolve, reject) => {
    // Remove existing script if any
    const existingScript = document.querySelector('script[src*="paypal.com/sdk/js"]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    const params = new URLSearchParams({
      'client-id': PAYPAL_CONFIG.CLIENT_ID,
      'currency': 'USD',
      'intent': 'capture',
      'components': 'buttons',
    });

    script.src = `https://www.paypal.com/sdk/js?${params.toString()}`;
    script.async = true;

    script.onload = () => {
      if (window.paypal) {
        console.log('✅ PayPal SDK loaded successfully');
        resolve();
      } else {
        reject(new Error('PayPal object not available after script load'));
      }
    };

    script.onerror = () => {
      reject(new Error('Failed to load PayPal SDK script'));
    };

    document.head.appendChild(script);

    // Timeout after 15 seconds
    setTimeout(() => {
      if (!window.paypal) {
        reject(new Error('PayPal SDK load timeout'));
      }
    }, 15000);
  });
}

// Create PayPal order via backend
async function createPayPalOrder(
  sessionId: string,
  testId: string,
  user: any
): Promise<any> {
  try {
    console.log('🌐 Creating PayPal order:', { sessionId, testId });

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
    const amountInCents = isIndia
      ? pricingResult.data.paypal.india.price
      : pricingResult.data.paypal.international.price;

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
      amount: Math.round(amountInCents), // Amount in cents
      currency: 'USD',
      gateway: 'paypal',
      sessionStartTime,
      isIndia: false, // PayPal is international
      metadata: {
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        authenticationRequired: false,
        isIndia: false,
        location: 'INTL',
      },
    };

    console.log('📡 Calling create-order API for PayPal...');
    const orderResponse = await createPaymentOrder(orderRequest);
    
    console.log('✅ PayPal order created:', orderResponse);
    return orderResponse;
  } catch (error) {
    console.error('❌ Failed to create PayPal order:', error);
    throw error;
  }
}

// Open PayPal payment UI
async function openPayPalPayment(
  sessionId: string,
  testId: string,
  orderData: any
): Promise<PaymentResult> {
  return new Promise((resolve) => {
    try {
      if (!window.paypal) {
        throw new Error('PayPal SDK not loaded');
      }

      // Create a container for PayPal buttons
      const containerId = 'paypal-button-container';
      let container = document.getElementById(containerId);
      
      if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        container.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 10000; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); min-width: 300px;';
        document.body.appendChild(container);

        // Add close button
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '×';
        closeButton.style.cssText = 'position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 20px; cursor: pointer; color: #666;';
        closeButton.onclick = () => {
          cleanup();
          resolve({
            success: false,
            error: 'Payment cancelled by user',
          });
        };
        container.appendChild(closeButton);

        // Add title
        const title = document.createElement('h3');
        title.textContent = 'Complete payment with PayPal';
        title.style.cssText = 'margin: 0 0 15px 0; font-family: Arial, sans-serif; color: #333;';
        container.appendChild(title);

        // Add amount display
        const amountDisplay = document.createElement('div');
        amountDisplay.textContent = `Amount: $${(orderData.amount / 100).toFixed(2)}`;
        amountDisplay.style.cssText = 'margin-bottom: 15px; font-size: 16px; font-weight: bold; color: #333;';
        container.appendChild(amountDisplay);

        // PayPal button container
        const buttonContainer = document.createElement('div');
        buttonContainer.id = 'paypal-buttons';
        container.appendChild(buttonContainer);
      }

      // Cleanup function
      const cleanup = () => {
        const elem = document.getElementById(containerId);
        if (elem) elem.remove();
      };

      // Import analytics (COMMENTED OUT)
      import('../../../lib/services/googleAnalytics').then(({ googleAnalytics }) => {
        // Initialize PayPal buttons
        const paypalButtons = window.paypal!.Buttons({
          style: {
            layout: 'vertical',
            color: 'blue',
            shape: 'pill',
            label: 'pay',
          },
          
          // Create order dynamically
          createOrder: (data: any, actions: any) => {
            console.log('🎯 Creating PayPal order dynamically');
            
            googleAnalytics.trackPaymentModalOpened({
              session_id: sessionId,
              order_id: 'paypal_order_creating',
              amount: orderData.amount,
              currency: orderData.currency
            });

            return actions.order.create({
              purchase_units: [{
                amount: {
                  currency_code: orderData.currency,
                  value: (orderData.amount / 100).toFixed(2),
                },
                description: `Fraterny Assessment Report`,
              }],
              application_context: {
                brand_name: PAYPAL_CONFIG.BRAND_NAME,
                shipping_preference: 'NO_SHIPPING',
                user_action: 'PAY_NOW',
              },
            });
          },

          // Handle approval
          onApprove: async (data: any, actions: any) => {
            console.log('✅ PayPal payment approved:', data);
            
            try {
              // Capture the payment
              const orderDetails: PayPalOrderData = await actions.order.capture();
              console.log('✅ PayPal payment captured:', orderDetails);

              // Complete payment via backend
              await completePayPalPayment(orderData, orderDetails, sessionId, testId, data);

              // Track successful payment (COMMENTED OUT)
              googleAnalytics.trackPaymentSuccess({
                session_id: sessionId,
                payment_id: orderDetails.id,
                order_id: orderDetails.id,
                amount: orderData.amount
              });

              cleanup();
              
              resolve({
                success: true,
                paymentData: {
                  paypal_order_id: orderDetails.id,
                  amount: orderData.amount / 100,
                  currency: orderData.currency,
                  status: orderDetails.status,
                  payer_email: orderDetails.payer?.email_address,
                },
              });

            } catch (captureError) {
              console.error('❌ PayPal capture/completion error:', captureError);
              
              googleAnalytics.trackPaymentFailed({
                session_id: sessionId,
                failure_reason: 'PayPal capture/completion failed',
                error_code: 'PAYPAL_CAPTURE_ERROR',
                amount: orderData.amount
              });

              cleanup();
              
              resolve({
                success: false,
                error: 'Failed to complete PayPal payment. Please contact support.',
              });
            }
          },

          // Handle errors
          onError: (err: any) => {
            console.error('❌ PayPal payment error:', err);
            
            googleAnalytics.trackPaymentFailed({
              session_id: sessionId,
              failure_reason: 'PayPal payment error',
              error_code: err.code || 'PAYPAL_ERROR',
              amount: orderData.amount
            });

            cleanup();
            
            resolve({
              success: false,
              error: 'PayPal payment failed. Please try again.',
            });
          },

          // Handle cancellation
          onCancel: (data: any) => {
            console.log('⚠️ PayPal payment cancelled:', data);
            
            googleAnalytics.trackPaymentCancelled({
              session_id: sessionId,
              cancel_reason: 'user_cancelled_paypal',
              amount: orderData.amount
            });

            cleanup();
            
            resolve({
              success: false,
              error: 'Payment cancelled by user',
            });
          },
        });

        // Render PayPal buttons
        paypalButtons.render('#paypal-buttons').catch((renderError: any) => {
          console.error('Error rendering PayPal buttons:', renderError);
          cleanup();
          resolve({
            success: false,
            error: 'Failed to load payment gateway. Please refresh and try again.',
          });
        });
      });

    } catch (error) {
      console.error('Error creating PayPal payment:', error);
      resolve({
        success: false,
        error: 'Failed to create PayPal payment',
      });
    }
  });
}

// Complete PayPal payment
async function completePayPalPayment(
  orderResponse: any,
  paypalOrderData: PayPalOrderData,
  sessionId: string,
  testId: string,
  paypalApprovalData?: any
): Promise<void> {
  try {
    console.log('📡 Completing PayPal payment...');

    // Get session data with fallback
    let sessionData = getSessionData();
    if (!sessionData) {
      console.warn('⚠️ No session data found, creating fallback');
      sessionData = {
        sessionStartTime: getOrCreateSessionStartTime(),
        originalSessionId: sessionId,
        testId: testId,
        authenticationRequired: false,
      };
    }

    // Calculate timing
    const sessionDuration = getSessionDuration();

    // Get current user
    const { supabase } = await import('@/integrations/supabase/client');
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || sessionId;

    // Get PayPal transaction ID
    const paypalTransactionId = paypalOrderData.purchase_units?.[0]?.payments?.captures?.[0]?.id;
    const finalTransactionId = paypalTransactionId || orderResponse.transaction_id;

    // Prepare completion data
    const completionData: PaymentCompletionRequest = {
      userId,
      originalSessionId: sessionId,
      testId: testId,
      paymentSessionId: orderResponse.paymentSessionId,
      gateway: 'paypal',
      orderid: paypalOrderData.id,
      transaction_id: finalTransactionId,
      paymentData: {
        order_id: paypalOrderData.id,
        payment_id: paypalOrderData.id,
        paypal_order_id: orderResponse.paypalOrderId,
        razorpay_signature: "paypal_no_signature",
        transaction_id: finalTransactionId,
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        status: 'success',
        payer_id: paypalApprovalData?.payerID || paypalApprovalData?.PayerID || 'unknown'
      },
      metadata: {
        pricingTier: 'regular',
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

    // Send completion to backend
    await completePayment(completionData);
    console.log('✅ PayPal payment completion sent successfully');

    // Track affiliate purchase
    try {
      const { trackAffiliatePurchase } = await import('@/lib/services/affiliateTracking');
      await trackAffiliatePurchase({
        userId: userId,
        sessionId: sessionId,
        testId: testId,
        gateway: 'paypal',
        amount: orderResponse.amount,
        currency: orderResponse.currency
      });
    } catch (error) {
      console.error('⚠️ Failed to track affiliate purchase (non-critical):', error);
    }

    // Track analytics (COMMENTED OUT)
    const { googleAnalytics } = await import('../../../lib/services/googleAnalytics');
    
    googleAnalytics.trackPaymentCompleted({
      session_id: sessionId,
      payment_id: paypalOrderData.id,
      verification_success: true,
      total_duration: sessionDuration
    });

    // // Track conversions
    const urlParams = new URLSearchParams(window.location.search);
    const gclid = urlParams.get('gclid') || sessionStorage.getItem('gclid') || localStorage.getItem('gclid');

    if (gclid) {
      googleAnalytics.trackGoogleAdsConversion({
        session_id: sessionId,
        payment_id: paypalOrderData.id,
        amount: orderResponse.amount / 100,
        currency: orderResponse.currency
      });
    }

    if (googleAnalytics.isRedditTraffic()) {
      googleAnalytics.trackRedditConversion({
        session_id: sessionId,
        payment_id: paypalOrderData.id,
        amount: orderResponse.amount / 100,
        currency: orderResponse.currency
      });
    }

    console.log('✅ PayPal payment flow completed successfully');
  } catch (error) {
    console.error('❌ Error completing PayPal payment:', error);
    throw error;
  }
}

// Main PayPal payment processing function
export async function processPayPalPayment(
  sessionId: string,
  testId: string,
  user: any
): Promise<PaymentResult> {
  try {
    console.log('🚀 Starting PayPal payment flow:', { sessionId, testId });

    // Step 1: Load PayPal SDK
    await loadPayPalSDK();

    // Step 2: Create order via backend
    const orderData = await createPayPalOrder(sessionId, testId, user);

    // Step 3: Open PayPal payment UI
    const paymentResult = await openPayPalPayment(sessionId, testId, orderData);

    return paymentResult;
  } catch (error: any) {
    console.error('❌ PayPal payment flow failed:', error);
    
    const errorMessage = error?.message || 'Unknown PayPal error';
    let userFriendlyMessage: string;

    if (errorMessage.includes('authentication') || errorMessage.includes('Authentication')) {
      userFriendlyMessage = 'Please sign in to continue with PayPal payment.';
    } else if (errorMessage.includes('network') || errorMessage.includes('Network')) {
      userFriendlyMessage = 'Network error. Please check your connection and try again.';
    } else if (errorMessage.includes('script') || errorMessage.includes('SDK')) {
      userFriendlyMessage = 'Failed to load PayPal. Please refresh and try again.';
    } else if (errorMessage.includes('timeout')) {
      userFriendlyMessage = 'PayPal loading timed out. Please try again.';
    } else {
      userFriendlyMessage = 'PayPal payment failed. Please try again.';
    }

    return {
      success: false,
      error: userFriendlyMessage,
    };
  }
}
