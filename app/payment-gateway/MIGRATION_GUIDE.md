# Payment Gateway Migration Guide

## How to Update QuestResult.tsx (or any component using payments)

### ❌ OLD IMPORTS (Remove these)
```typescript
import { PaymentService, sessionManager } from '@/services/payments';
import {
  unifiedPaymentService,
  processPaymentWithGateway,
  getBothGatewayPricing,
  type PaymentGateway,
  type UnifiedPricingData
} from '../../../services/payments/unifiedPaymentService';
```

### ✅ NEW IMPORTS (Use these instead)
```typescript
import { 
  processRazorpayPayment,
  processPayPalPayment,
  getBothGatewayPricing,
  storePaymentContext,
  getPaymentContext,
  clearPaymentContext,
  type PaymentGateway,
  type UnifiedPricingData,
  type PaymentResult
} from '@/app/payment-gateway';
```

---

## Key Changes in Your Code

### 1. **Update handlePayment Function**

**OLD CODE:**
```typescript
const handlePayment = async (selectedGateway: PaymentGateway = 'razorpay'): Promise<void> => {
  // ... auth checks ...
  
  if (!user?.id) {
    sessionManager.createPaymentContext(sessionId, testId, undefined, selectedGateway);
    sessionManager.createSessionData(sessionId, testId, true);
    // ... rest of auth flow
  }
  
  const paymentResult = await unifiedPaymentService.processPayment(selectedGateway, sessionId, testId);
}
```

**NEW CODE:**
```typescript
const handlePayment = async (selectedGateway: PaymentGateway = 'razorpay'): Promise<void> => {
  // ... auth checks ...
  
  if (!user?.id) {
    // Store payment context with selected gateway
    storePaymentContext(sessionId, testId, selectedGateway);
    // ... rest of auth flow
  }
  
  // Process payment based on selected gateway
  let paymentResult: PaymentResult;
  
  if (selectedGateway === 'razorpay') {
    paymentResult = await processRazorpayPayment(sessionId, testId, user);
  } else {
    paymentResult = await processPayPalPayment(sessionId, testId, user);
  }
  
  // Handle result
  if (paymentResult.success) {
    toast.success('Payment successful!');
    setPaymentSuccess(true);
    // ... rest of success handling
  } else {
    toast.error(paymentResult.error || 'Payment failed');
  }
}
```

### 2. **Update Payment Context Check (after auth)**

**OLD CODE:**
```typescript
useEffect(() => {
  if (user?.id && userId === user.id && sessionId && testId) {
    const resumeResult = sessionManager.resumePaymentFlow();
    
    if (resumeResult.canResume) {
      const gatewayToUse = resumeResult.context?.selectedGateway || 'razorpay';
      const paymentResult = await unifiedPaymentService.processPayment(gatewayToUse, sessionId, testId);
    }
  }
}, [user?.id, userId, sessionId, testId]);
```

**NEW CODE:**
```typescript
useEffect(() => {
  if (user?.id && userId === user.id && sessionId && testId) {
    const context = getPaymentContext();
    
    if (context && context.sessionId === sessionId && context.testId === testId) {
      const gatewayToUse = context.gateway || 'razorpay';
      
      // Clear context before processing
      clearPaymentContext();
      
      // Process payment
      setTimeout(async () => {
        setPaymentLoading(true);
        try {
          let paymentResult: PaymentResult;
          
          if (gatewayToUse === 'razorpay') {
            paymentResult = await processRazorpayPayment(sessionId, testId, user);
          } else {
            paymentResult = await processPayPalPayment(sessionId, testId, user);
          }
          
          if (paymentResult.success) {
            toast.success('Payment successful!');
            setPaymentSuccess(true);
            setShowSuccessPopup(true);
            setUpsellOpen(false);
          } else {
            toast.error(paymentResult.error || 'Payment failed');
          }
        } catch (error) {
          console.error('Error processing payment:', error);
          toast.error('Failed to process payment');
        } finally {
          setPaymentLoading(false);
        }
      }, 1000);
    }
  }
}, [user?.id, userId, sessionId, testId]);
```

### 3. **Update Pricing State**

**No changes needed** - The pricing interface remains the same:
```typescript
const [pricing, setPricing] = useState<DualGatewayPricingData>({
  razorpay: { main: '₹950', original: '₹1200', currency: 'INR', symbol: '₹', amount: 950, isIndia: true, isLoading: true },
  paypal: { main: '$20', original: '$25', currency: 'USD', amount: 20, isIndia: false },
  isLoading: true
});

// Load pricing (no changes needed)
useEffect(() => {
  const loadPricing = async () => {
    try {
      const unifiedPricingData = await getBothGatewayPricing();
      // ... set pricing state
    } catch (error) {
      console.error('Failed to load pricing:', error);
    }
  };
  loadPricing();
}, []);
```

---

## Summary of Benefits

### Before (Old System):
- ❌ 15+ files across multiple folders
- ❌ Complex imports from deep nested paths
- ❌ Mixed authentication, session, pricing logic
- ❌ Hard to understand which code does what

### After (New System):
- ✅ 5 clean files total
- ✅ Simple imports from `@/app/payment-gateway`
- ✅ Clear separation: Razorpay logic | PayPal logic | Shared utilities
- ✅ Easy to maintain and extend

---

## Testing Checklist

After migration, test:
1. ✅ Razorpay payment flow (India & International)
2. ✅ PayPal payment flow
3. ✅ Auth flow (sign in → resume payment)
4. ✅ Payment context persists after sign-in
5. ✅ Pricing loads correctly for both gateways
6. ✅ Analytics tracking works
7. ✅ Error handling displays correct messages

---

## Need Help?

The new system is in: `/app/payment-gateway/`
- `razorpay/razorpayService.ts` - Razorpay logic
- `paypal/paypalService.ts` - PayPal logic  
- `shared/paymentApi.ts` - Shared utilities
- `shared/types.ts` - TypeScript types
- `index.ts` - Main exports

All old functionality is preserved, just cleaner! 🎉
