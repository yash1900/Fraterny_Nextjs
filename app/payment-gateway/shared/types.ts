// Shared types for payment gateway system

export type PaymentGateway = 'razorpay' | 'paypal';

export interface PaymentResult {
  success: boolean;
  paymentData?: any;
  error?: string;
}

export interface PricingData {
  main: string;
  original: string;
  currency: string;
  symbol: string;
  amount: number;
  isIndia: boolean;
}

export interface UnifiedPricingData {
  razorpay: PricingData;
  paypal: {
    displayAmount: string;
    displayOriginal: string;
    currency: string;
    amount: string;
    numericAmount: number;
    isIndia: boolean;
  };
}

export interface CreateOrderRequest {
  sessionId: string;
  testId: string;
  userId: string;
  fixEmail: string;
  pricingTier: 'early' | 'regular';
  amount: number;
  currency: string;
  gateway: PaymentGateway;
  sessionStartTime: string;
  isIndia: boolean;
  metadata: {
    userAgent: string;
    timestamp: string;
    authenticationRequired: boolean;
    isIndia: boolean;
    location: string | null;
  };
}

export interface CreateOrderResponse {
  razorpayOrderId?: string;
  paypalOrderId?: string;
  amount: number;
  currency: string;
  paymentSessionId: string;
  gateway: PaymentGateway;
  transaction_id?: string;
  clientSecret?: string;
  approvalUrl?: string;
}

export interface PaymentCompletionRequest {
  userId: string;
  originalSessionId: string;
  testId: string;
  paymentSessionId: string;
  gateway: PaymentGateway;
  orderid: string;
  transaction_id?: string;
  paymentData: {
    order_id: string;
    payment_id: string;
    amount: number;
    currency: string;
    status: 'success' | 'failed';
    razorpay_signature?: string;
    transaction_id?: string;
    payer_id?: string;
    paypal_order_id?: string;
  };
  metadata: {
    pricingTier: 'early' | 'regular';
    sessionStartTime: string;
    paymentStartTime: string;
    paymentCompletedTime: string;
    authenticationFlow: boolean;
    userAgent: string;
    timingData: {
      sessionToPaymentDuration: number;
      authenticationDuration?: number;
    };
  };
}
