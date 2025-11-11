'use client';

import React from 'react';
import Image from 'next/image';
import { User } from '../utils/types';



const getAuthBannerColors = (sectionIndex: number) => {
  const sectionKeys = ["emotional", "mind", "findings", "subjects", "quotes", "films", "books", /* "astrology", */ "work", "pdf-report"];
  const currentSection = sectionKeys[sectionIndex];

  switch (currentSection) {
    case "quotes":
    case "subjects":
    case "books":
    case "pdf-report":
      // Light sections - use dark colors
      return {
        logoFilter: "invert(0)", // Dark logo
        buttonBg: "rgba(0,0,0,0.8)", // Dark button background
        buttonText: "text-white", // Dark text
        buttonBorder: "border-black/50"
      };
    case "emotional":
    case "mind":
    case "findings":
    case "films":
    // case "astrology":
    case "work":
    default:
      // Dark sections - use light colors
      return {
        logoFilter: "invert(1)", // White logo
        buttonBg: "rgba(255,255,255,0.2)", // Light button background
        buttonText: "text-white", // White text
        buttonBorder: "border-white/20"
      };
  }
};

interface AuthBannerProps {
  onSignIn: () => void;
  onPayment: (gateway?: any) => void;
  user: User | null;
  paymentLoading: boolean;
  activeIndex?: number;
}

export const AuthBanner: React.FC<AuthBannerProps> = ({ onSignIn, onPayment, user, paymentLoading, activeIndex = 0 }) => {
  const colors = getAuthBannerColors(activeIndex);

  const getGlassBackground = (index: number) => {
    const sectionKeys = ["emotional", "mind", "findings", "subjects", "quotes", "films", "books", /* "astrology", */ "work", "pdf-report"];
    const currentSection = sectionKeys[index];

    if (currentSection === "quotes" || currentSection === "subjects" || currentSection === "books" || currentSection === "pdf-report") {
      return 'rgba(255,255,255,0.25)';
    } else {
      return 'rgba(255,255,255,0.1)';
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[60] px-4 transition-all duration-300 py-3`}
      style={{
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        background: getGlassBackground(activeIndex)
      }}
    >
      <div className="max-w-md flex items-center justify-between">
        <Image
          src='/Vector.svg'
          alt="Logo"
          width={80}
          height={56}
          className="transition-all duration-300 cursor-pointer hover:opacity-80"
          style={{ filter: colors.logoFilter }}
          onClick={() => window.location.href = '/quest'}
        />
        <button
          onClick={onSignIn}
          className={`font-gilroy-regular tracking-tight px-4 py-1 rounded-lg shadow-md transition-all duration-300 ${colors.buttonText} ${colors.buttonBorder}`}
          style={{ background: colors.buttonBg }}
        >
          {user ? 'Dashboard' : 'Save'}
        </button>
      </div>
    </div>
  );
};