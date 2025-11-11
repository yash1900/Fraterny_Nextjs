import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock } from 'lucide-react';
import { PaymentGateway } from '../utils/types';
// import { PaymentGateway } from '../../../services/payments/unifiedPaymentService';

// Design Tokens
const tokens = {
  textDark: "#0A0A0A",
  textLight: "#FFFFFF",
  muted: "#6B7280",
  border: "#E6EAF2",
  accent: "#0C45F0",
  accent2: "#41D9FF",
  accent3: "#48B9D8",
  soft: "#F7F9FC",
};

// Extended pricing data for dual gateways
interface DualGatewayPricingData {
  razorpay: {
    main: string;
    original: string;
    currency: string;
    symbol: string;
    amount: number;
    isIndia: boolean;
    isLoading: boolean;
  };
  paypal: {
    main: string;
    original: string;
    currency: string;
    amount: number;
    isIndia: boolean;
  };
  isLoading: boolean;
}

// just add onPayment prop as an mock now we will implement payment later
interface UpsellSheetProps {
  open: boolean;
  onClose: () => void;
  onPayment: (gateway: PaymentGateway) => Promise<void>;
  // onPayment: (gateway: string) => Promise<void>;
  paymentLoading: boolean;
  pricing: DualGatewayPricingData;
}

// Utility function to format time
const formatTime = (s: number): string => {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const r = (s % 60).toString().padStart(2, "0");
  return `${m}:${r}`;
};

export const UpsellSheet: React.FC<UpsellSheetProps> = ({ open, onClose, onPayment, paymentLoading, pricing }) => {
  const [trial, setTrial] = useState(true);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>('razorpay');
  const [seconds, setSeconds] = useState(30 * 60);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const handlePaymentClick = async () => {
    try {
      await onPayment(selectedGateway);
    } catch (error) {
      console.error('Payment error in UpsellSheet:', error);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/35" onClick={onClose} />
          <motion.div
            className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-[390px] rounded-t-[28px] bg-white flex flex-col"
            style={{ 
              boxShadow: "0 -12px 32px rgba(0,0,0,0.15)", 
              border: `1px solid ${tokens.border}`,
              maxHeight: 'calc(100vh - 2rem)',
              minHeight: '60vh'
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            {/* Fixed Header with Close Button */}
            <div className="flex-shrink-0 relative px-4 pt-4 pb-2">
              <button 
                aria-label="Close" 
                onClick={onClose} 
                className="absolute right-4 top-4 rounded-full p-2 bg-gray-100 hover:bg-gray-200 transition-colors z-10"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              >
                <X className="h-5 w-5" color={tokens.textDark} />
              </button>
              <div className="pt-6 text-[26px] font-gilroy-regular leading-8" style={{ color: tokens.textDark }}>
                Download your 35+ page <span className="font-gilroy-black">Personalised PDF Report</span>
              </div>
              <div className="mb-3 text-[14px] font-gilroy-regular" style={{ color: tokens.muted }}> Powered by Fraterny's advanced AI model </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4" style={{
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain'
            }}>
              <ul className="grid gap-2 pb-4">
                {["A Deep-Dive Mindset Analysis", "Detailed Mental Blueprint", "Personalized Content Operating System ", "You VS Future You", "Curated Action & Growth Plan"].map((t, i) => (
                  <li key={i} className="flex items-center gap-2 text-[14px] font-gilroy-semibold">
                    <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: i === 0 ? "#FF3B6B" : tokens.accent }} />
                    <span className={i === 0 ? "font-[700]" : ""} style={{ color: tokens.textDark }}>
                      {i === 0 ? <span style={{ color: "#FF3B6B" }}>A Deep-Dive Mindset Analysis</span> : t}
                    </span>
                  </li>
                ))}
              </ul>

              <motion.div
                className="relative rounded-2xl p-4 text-white mb-4"
                style={{ background: "linear-gradient(135deg, rgba(12,69,240,1) 0%, rgba(65,217,255,1) 45%, rgba(72,185,216,1) 100%)" }}
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <div className="text-[12px] opacity-95"><span>Ends in {formatTime(seconds)}</span></div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-[24px] font-gilroy-regular font-[400] text-white">
                    {pricing.isLoading ? '...' : (selectedGateway === 'razorpay' ? pricing.razorpay.main : pricing.paypal.main)}
                  </span>
                  <span className="text-[18px] font-gilroy-regular line-through text-gray-800">
                    {pricing.isLoading ? '...' : (selectedGateway === 'razorpay' ? pricing.razorpay.original : pricing.paypal.original)}
                  </span>
                </div>
              </motion.div>

              <div className="mb-4 flex items-center justify-between rounded-xl bg-[#F2F5FA] px-3 py-3 font-gilroy-bold" style={{ border: `1px solid ${tokens.border}` }}>
                <div className="text-[16px] font-gilroy-semibold" style={{ color: tokens.textDark }}>Incorporate My Feedback</div>
                <button aria-label="toggle trial" onClick={() => setTrial((t) => !t)} className="relative h-6 w-11 rounded-full" style={{ background: trial ? tokens.accent : "#D1D5DB", boxShadow: "0 10px 30px rgba(12,69,240,0.06)" }}>
                  <span className="absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform" style={{ transform: `translateX(${trial ? 20 : 0}px)` }} />
                </button>
              </div>

              {/* Payment Gateway Selection */}
              <div className="pb-4">
                <div className="text-[14px] font-gilroy-semibold mb-3" style={{ color: tokens.textDark }}>
                  Choose Payment Method
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {/* Razorpay Option */}
                  <button
                    onClick={() => setSelectedGateway('razorpay')}
                    className={`p-3 rounded-xl border-2 transition-all ${selectedGateway === 'razorpay'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">💳</span>
                      <span className="font-gilroy-bold text-[14px]" style={{ color: tokens.textDark }}>
                        Razorpay
                      </span>
                    </div>
                    <div className="text-[12px] text-gray-600 text-left font-gilroy-black">
                      Cards, UPI, Net Banking
                    </div>
                  </button>

                  {/* PayPal Option */}
                  <button
                    onClick={() => setSelectedGateway('paypal')}
                    className={`p-3 rounded-xl border-2 transition-all ${selectedGateway === 'paypal'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🌐</span>
                        <span className="font-gilroy-bold text-[14px]" style={{ color: tokens.textDark }}>
                          PayPal
                        </span>
                      </div>
                      <span className="text-[12px] text-gray-500 font-gilroy-regular">(USD)</span>
                    </div>
                    <div className="text-[12px] text-gray-600 text-left font-gilroy-black">
                      PayPal Balance, Cards
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="flex-shrink-0 border-t bg-white" style={{ borderColor: tokens.border }}>
              <div className="px-4 py-3">
                <button
                  onClick={handlePaymentClick}
                  disabled={paymentLoading}
                  className="w-full rounded-xl px-4 py-3 text-[16px] font-[600] font-gilroy-bold tracking-tight text-white disabled:opacity-50"
                  style={{ background: tokens.textDark }}
                >
                  {paymentLoading ? 'Processing...' : 'Continue'}
                </button>
                <div className="pt-2 text-center text-[12px]" style={{ color: tokens.muted }}>
                  Fully Refundable. T&C apply.
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export type { DualGatewayPricingData };