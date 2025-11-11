// types.ts
export interface Film {
  title: string;
  description: string;
  imageUrl?: string;
}

export interface Subject {
  title: string;
  description: string;
  matchPercentage: number;
}

export interface AstrologyData {
  actualSign: string;
  behavioralSign: string;
  description: string;
  predictions: Array<{
    title: string;
    likelihood: number;
    reason: string;
  }>;
}

export interface AstrologyModalProps {
  prediction: { title: string, likelihood: number, reason: string } | null;
  onClose: () => void;
}

export interface Book {
  title: string;
  author: string;
  description?: string;
}

export interface Quote {
  text: string;
  author: string;
}

export interface MindCardData {
  name?: string;
  personality?: string;
  description?: string;
  attributes: string[];
  scores: string[];
  insights: string[];
}

export interface ResultData {
  session_id: string;
  user_id?: string;
  completion_date: string;
  pecentile?: string;
  qualityscore?: string;
  referred_by?: string;
  results: {
    "section 1"?: string;
    "Mind Card"?: MindCardData;
    findings?: string[];
    quotes?: Quote[];
    films?: Film[];
    subjects?: Subject[];
    astrology?: AstrologyData;
    books?: Book[];
    actionItem?: string;
  };
}

export interface User {
  id: string;
  email?: string;
  name?: string;
  user_metadata?: any;
  app_metadata?: any;
}

export interface RouteParams {
  userId: string;
  sessionId: string;
  testId: string;
}

export interface PricingData {
  main: string;
  original: string;
  currency: string;
  symbol: string;
  amount: number;
  isIndia: boolean;
  isLoading: boolean;
}

export interface DualGatewayPricingData {
  razorpay: PricingData;
  paypal: {
    main: string;
    original: string;
    currency: string;
    amount: number;
    isIndia: boolean;
  };
  isLoading: boolean;
}

export interface AssessmentPaymentStatus {
  ispaymentdone: "success" | null;
  quest_pdf: string;
  quest_status: "generated" | "working" | null;
}

export type PaymentGateway = 'razorpay' | 'paypal';