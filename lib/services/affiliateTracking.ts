/**
 * Affiliate Tracking Service
 * Handles affiliate click, signup, and purchase tracking
 */

/**
 * Track affiliate payment/purchase
 * Call this after successful payment completion
 */
export async function trackAffiliatePurchase(params: {
  userId: string;
  sessionId: string;
  testId: string;
  gateway: 'razorpay' | 'paypal';
  amount: number;  // Amount in smallest unit (paise for INR, cents for USD)
  currency: 'INR' | 'USD';
}): Promise<{ success: boolean; error?: string }> {
  try {
    // Get referred_by from localStorage
    const referredBy = localStorage.getItem('referred_by');
    
    if (!referredBy) {
      console.log('ℹ️ No affiliate code found, skipping purchase tracking');
      return { success: true }; // Not an error, just no affiliate
    }

    console.log('💳 Tracking affiliate purchase:', {
      referredBy,
      userId: params.userId,
      gateway: params.gateway,
      amount: params.amount,
      currency: params.currency
    });

    // Call the affiliate purchase tracking API
    const response = await fetch('/api/tracking/affiliate/purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: params.userId,
        session_id: params.sessionId,
        test_id: params.testId,
        affiliate_code: referredBy,
        gateway: params.gateway,
        amount: params.amount,
        currency: params.currency,
        ip_address: null, // Will be fetched by API
        device_info: null, // Will be fetched by API
        location: null, // Will be fetched by API
        metadata: {
          payment_time: new Date().toISOString()
        }
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Affiliate purchase tracked successfully');
      console.log('💰 Commission:', result.commission);
      
      // Clear the referred_by after successful purchase tracking
      localStorage.removeItem('referred_by');
      console.log('🧹 Cleared referred_by from localStorage');
      
      return { success: true };
    } else {
      console.error('❌ Failed to track affiliate purchase:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('❌ Error tracking affiliate purchase:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Check if user came from affiliate link
 */
export function hasAffiliateCode(): boolean {
  try {
    const referredBy = localStorage.getItem('referred_by');
    return !!referredBy;
  } catch {
    return false;
  }
}

/**
 * Get current affiliate code
 */
export function getAffiliateCode(): string | null {
  try {
    return localStorage.getItem('referred_by');
  } catch {
    return null;
  }
}

/**
 * Clear affiliate code from storage
 */
export function clearAffiliateCode(): void {
  try {
    localStorage.removeItem('referred_by');
  } catch (error) {
    console.error('Error clearing affiliate code:', error);
  }
}
