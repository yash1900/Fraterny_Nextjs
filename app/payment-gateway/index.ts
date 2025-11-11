// Main export for payment gateway system
export { processRazorpayPayment } from './razorpay/razorpayService';
export { processPayPalPayment } from './paypal/paypalService';
export { 
  getBothGatewayPricing,
  storePaymentContext,
  getPaymentContext,
  clearPaymentContext,
  getUserLocationFlag
} from './shared/paymentApi';
export type { 
  PaymentGateway,
  PaymentResult,
  PricingData,
  UnifiedPricingData
} from './shared/types';
