// Shared API layer for payment operations
import axios from 'axios';
import type { CreateOrderRequest, CreateOrderResponse, PaymentCompletionRequest, UnifiedPricingData } from './types';

const NEXT_PUBLIC_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.fraterny.in';

// Create payment order via backend API
export async function createPaymentOrder(orderData: CreateOrderRequest): Promise<CreateOrderResponse> {
  try {
    console.log('📡 Creating payment order:', orderData);
    
    const response = await axios.post(
      `${NEXT_PUBLIC_BACKEND_URL}/api/payments/create-order`,
      orderData,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to create payment order');
    }

    if (!response.data.data) {
      throw new Error('No order data received from server');
    }

    console.log('✅ Payment order created successfully:', response.data.data);
    return response.data.data;
  } catch (error: any) {
    console.error('❌ Create order API error:', error);
    
    if (error.response?.status === 422) {
      const details = error.response.data?.detail;
      throw new Error(`Validation error: ${JSON.stringify(details)}`);
    }
    
    throw new Error(error.response?.data?.error || error.message || 'Failed to create payment order');
  }
}

// Complete payment via backend API
export async function completePayment(paymentData: PaymentCompletionRequest): Promise<void> {
  try {
    console.log('📡 Completing payment:', paymentData);
    
    const response = await axios.post(
      `${NEXT_PUBLIC_BACKEND_URL}/api/payments/complete`,
      paymentData,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to complete payment');
    }

    console.log('✅ Payment completed successfully');
  } catch (error: any) {
    console.error('❌ Complete payment API error:', error);
    throw new Error(error.response?.data?.error || error.message || 'Failed to complete payment');
  }
}

// Get user location (India vs International)
export async function getUserLocationFlag(): Promise<boolean> {
  try {
    // Import location service from correct path
    const { locationService } = await import('@/ip-finder/locationService');
    const locationData = await locationService.getUserLocation();
    return locationData.isIndia;
  } catch (error) {
    console.error('Failed to get location flag:', error);
    return false; // Default to non-India on error
  }
}

// Get pricing for both gateways
export async function getBothGatewayPricing(): Promise<UnifiedPricingData> {
  try {
    console.log('💰 Loading pricing for both payment gateways...');
    
    // Call pricing API route
    const response = await axios.get('/api/admin/pricing/display');
    const pricingResult = response.data;
    
    if (!pricingResult.success || !pricingResult.data) {
      throw new Error(pricingResult.error || 'Failed to get pricing data');
    }
    
    console.log(`💰 Using ${pricingResult.source} pricing data`);
    
    const isIndia = await getUserLocationFlag();
    
    // Razorpay pricing
    const razorpayAmountInCents = isIndia 
      ? pricingResult.data.razorpay.india.price 
      : pricingResult.data.razorpay.international.price;
    const razorpayOriginalAmountInCents = isIndia
      ? pricingResult.data.razorpay.india.displayPrice
      : pricingResult.data.razorpay.international.displayPrice;
    
    const razorpayAmount = Math.round(razorpayAmountInCents / 100);
    const razorpayOriginalAmount = Math.round(razorpayOriginalAmountInCents / 100);
    
    // PayPal pricing (always USD)
    const paypalAmountInCents = isIndia
      ? pricingResult.data.paypal.india.price
      : pricingResult.data.paypal.international.price;
    const paypalOriginalAmountInCents = isIndia
      ? pricingResult.data.paypal.india.displayPrice
      : pricingResult.data.paypal.international.displayPrice;
    
    const paypalAmountInDollars = (paypalAmountInCents / 100).toFixed(2);
    const paypalOriginalAmountInDollars = (paypalOriginalAmountInCents / 100).toFixed(2);
    
    return {
      razorpay: {
        main: isIndia ? `₹${razorpayAmount}` : `$${razorpayAmount}`,
        original: isIndia ? `₹${razorpayOriginalAmount}` : `$${razorpayOriginalAmount}`,
        currency: isIndia ? 'INR' : 'USD',
        symbol: isIndia ? '₹' : '$',
        amount: razorpayAmountInCents,
        isIndia
      },
      paypal: {
        displayAmount: `$${Math.round(paypalAmountInCents / 100)}`,
        displayOriginal: `$${Math.round(paypalOriginalAmountInCents / 100)}`,
        currency: 'USD',
        amount: paypalAmountInDollars,
        numericAmount: parseFloat(paypalAmountInDollars),
        isIndia
      }
    };
  } catch (error) {
    console.error('❌ Error loading gateway pricing:', error);
    
    // Fallback pricing
    const isIndia = await getUserLocationFlag();
    const fallbackRazorpayAmount = isIndia ? 95000 : 2000;
    const fallbackRazorpayOriginal = isIndia ? 120000 : 2500;
    const fallbackPaypalAmount = isIndia ? 1200 : 2000;
    const fallbackPaypalOriginal = isIndia ? 1500 : 2500;
    
    return {
      razorpay: {
        main: isIndia ? `₹${fallbackRazorpayAmount / 100}` : `$${fallbackRazorpayAmount / 100}`,
        original: isIndia ? `₹${fallbackRazorpayOriginal / 100}` : `$${fallbackRazorpayOriginal / 100}`,
        currency: isIndia ? 'INR' : 'USD',
        symbol: isIndia ? '₹' : '$',
        amount: fallbackRazorpayAmount,
        isIndia
      },
      paypal: {
        displayAmount: `$${fallbackPaypalAmount / 100}`,
        displayOriginal: `$${fallbackPaypalOriginal / 100}`,
        currency: 'USD',
        amount: (fallbackPaypalAmount / 100).toFixed(2),
        numericAmount: fallbackPaypalAmount / 100,
        isIndia
      }
    };
  }
}

// Session management helper
export function getOrCreateSessionStartTime(): string {
  const key = 'session_start_time';
  let startTime = sessionStorage.getItem(key);
  
  if (startTime) {
    const sessionDate = new Date(startTime);
    const now = new Date();
    const ageMinutes = Math.floor((now.getTime() - sessionDate.getTime()) / (60 * 1000));
    
    if (ageMinutes > 120) {
      sessionStorage.removeItem(key);
      startTime = null;
    }
  }
  
  if (!startTime) {
    startTime = new Date().toISOString();
    sessionStorage.setItem(key, startTime);
  }
  
  return startTime;
}

// Store payment context (for auth flow)
// Uses localStorage to survive OAuth redirects
export function storePaymentContext(sessionId: string, testId: string, gateway: 'razorpay' | 'paypal'): void {
  const context = {
    originalSessionId: sessionId,
    testId,
    sessionStartTime: getOrCreateSessionStartTime(),
    returnUrl: window.location.href,
    timestamp: Date.now(),
    selectedGateway: gateway
  };
  
  // Use localStorage instead of sessionStorage to survive OAuth redirects
  localStorage.setItem('payment_context', JSON.stringify(context));
  console.log('💾 Payment context stored in localStorage:', context);
  
  // Also store session data in localStorage
  const sessionData = {
    sessionStartTime: context.sessionStartTime,
    originalSessionId: sessionId,
    testId,
    authenticationRequired: true
  };
  
  localStorage.setItem('session_data', JSON.stringify(sessionData));
}

// Get stored payment context
export function getPaymentContext(): { sessionId: string; testId: string; gateway: 'razorpay' | 'paypal' } | null {
  try {
    const stored = localStorage.getItem('payment_context');
    if (!stored) {
      console.log('❌ No payment context found in localStorage');
      return null;
    }
    
    const context = JSON.parse(stored);
    console.log('🔍 Found payment context in localStorage:', context);
    
    // Validate context age (expire after 1 hour)
    const oneHour = 60 * 60 * 1000;
    if (Date.now() - context.timestamp > oneHour) {
      console.log('⌛ Payment context expired');
      clearPaymentContext();
      return null;
    }
    
    return {
      sessionId: context.originalSessionId,
      testId: context.testId,
      gateway: context.selectedGateway || 'razorpay'
    };
  } catch (error) {
    console.error('Failed to get payment context:', error);
    return null;
  }
}

// Clear payment context
export function clearPaymentContext(): void {
  localStorage.removeItem('payment_context');
  console.log('🗑️ Payment context cleared from localStorage');
}

// Store session data only (without setting payment_context)
export function storeSessionData(sessionId: string, testId: string, authenticationRequired: boolean): void {
  const sessionData = {
    sessionStartTime: getOrCreateSessionStartTime(),
    originalSessionId: sessionId,
    testId,
    authenticationRequired
  };
  localStorage.setItem('session_data', JSON.stringify(sessionData));
  console.log('💾 Session data stored in localStorage:', sessionData);
}

// Get session data
export function getSessionData() {
  try {
    const stored = localStorage.getItem('session_data');
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    return null;
  }
}

// Calculate session duration in minutes
export function getSessionDuration(): number {
  const sessionData = getSessionData();
  if (!sessionData?.sessionStartTime) return 0;
  
  const start = new Date(sessionData.sessionStartTime);
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / (60 * 1000));
}
