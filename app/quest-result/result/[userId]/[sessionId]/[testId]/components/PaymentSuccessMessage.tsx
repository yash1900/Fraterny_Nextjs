// PaymentSuccessMessage.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { tokens, CTA_HEIGHT } from '../utils/constants';

interface PaymentSuccessMessageProps {
  userId?: string;
}

export const PaymentSuccessMessage: React.FC<PaymentSuccessMessageProps> = ({ userId }) => {
  const router = useRouter();

  const handleDashboardClick = () => {
    if (userId) {
      router.push(`/quest-dashboard/${userId}`);
    } else {
      router.push('/quest-dashboard');
    }
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: "rgba(255,255,255,0.92)",
        borderTop: `1px solid ${tokens.border}`,
        boxShadow: "0 -6px 18px rgba(10,10,10,0.06)",
        height: CTA_HEIGHT,
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        overscrollBehavior: 'none'
      }}
    >
      <div className="mx-auto flex h-full max-w-[390px] items-center justify-between px-3" style={{ color: tokens.textDark }}>
        <div className="flex-1 pr-4">
          <div className="text-[12px] leading-4 font-gilroy-semibold">
            I am analysing your responses to generate a detailed report. It will be ready in 15 minutes.
          </div>
        </div>
        <button
          onClick={handleDashboardClick}
          className="rounded-lg px-4 py-2 text-sm font-gilroy-semibold text-white whitespace-nowrap"
          style={{ background: tokens.accent }}
        >
          Dashboard
        </button>
      </div>
    </div>
  );
};