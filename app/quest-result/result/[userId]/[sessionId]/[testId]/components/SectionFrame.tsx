'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { tokens } from '../utils/constants';
import { sectionVariants } from '../utils/constants';
import { SectionActions } from './SectionActions';
import { CTA_HEIGHT } from '../utils/constants';



// SectionFrame Component
interface SectionFrameProps {
  id: string;
  title: string;
  sub?: string;
  shareText: string;
  themeKey: string;
  customClass?: string;
  inputClassName?: string;
  buttonClassName?: string;
  sessionId?: string;    // Add this
  testId?: string;       // Add this
  children: React.ReactNode;
  onToast?: (msg: string) => void;
}

// Section Themes
const sectionTheme = (key: string) => {
  switch (key) {
    case "emotional":
      return {
        bg: `radial-gradient(1200px 600px at 60% 80%, rgba(255,255,255,.25), transparent 60%), linear-gradient(160deg, #0b4ef6 0%, #2d73ff 45%, #69c7ff 100%)`,
        text: tokens.textLight,
      };
    case "mind":
      return {
        bg: `linear-gradient(180deg, rgba(72,185,216,0.9) 0%, rgba(65,217,255,0.85) 40%, rgba(12,69,240,0.9) 100%)`,
        text: tokens.textLight,
      };
    case "findings":
      return {
        bg: `linear-gradient(135deg, rgba(12,69,240,1) 0%, rgba(65,217,255,0.85) 55%, rgba(255,255,255,0.2) 100%)`,
        text: tokens.textLight,
      };
    case "quotes":
      return {
        bg: `linear-gradient(180deg, #FFFFFF 0%, #F7F9FC 30%, #006983 100%)`,
        text: tokens.textDark,
      };
    case "films":
      return {
        bg: `radial-gradient(120% 100% at 50% 100%, rgba(12,69,240,1) 0%, rgba(12,69,240,0.9) 35%, rgba(65,217,255,0.6) 100%)`,
        text: tokens.textLight,
      };
    case "subjects":
      return { bg: `linear-gradient(180deg, #FFFFFF 0%, #F7F9FC 100%)`, text: tokens.textDark };
    case "astrology":
      return {
        bg: `radial-gradient(90% 80% at 50% 60%, rgba(12,69,240,0.95) 0%, rgba(12,69,240,0.9) 45%, rgba(65,217,255,0.6) 100%)`,
        text: tokens.textLight,
      };
    case "books":
      return { bg: `linear-gradient(180deg, #FFFFFF 0%, #F7F9FC 100%)`, text: tokens.textDark };
    case "work":
      return { bg: `linear-gradient(135deg, rgba(12,69,240,1) 0%, rgba(72,185,216,0.95) 100%)`, text: tokens.textLight };
    case "pdf-report":
      return {
        bg: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.9) 50%, rgba(241,245,249,0.95) 100%)`,
        text: tokens.textDark
      };
    default:
      return { bg: `#FFFFFF`, text: tokens.textDark };
  }
};


export const SectionFrame: React.FC<SectionFrameProps> = ({ id, title, sub, shareText, themeKey, customClass, inputClassName, buttonClassName, children, onToast, sessionId, testId }) => {
  const theme = sectionTheme(themeKey);
  const text = theme.text;
  return (
    <section
      id={id}
      className={`snap-start relative ${customClass}`}
      style={{
        minHeight: `calc(100vh - ${CTA_HEIGHT}px)`,
        background: theme.bg,
        color: text,
      }}
    >
      {text === tokens.textLight && (
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.12))" }} />
      )}
      <div className="mx-auto relative z-[1] flex h-full max-w-[390px] flex-col px-4 py-6">
        <div className="mb-1 text-sm font-normal font-['Inter'] uppercase leading-tight tracking-[4.20px]">{sub || ""}</div>
        <div className={`mb-4 font-normal font-gilroy-bold leading-10 ${
          id === "pdf-report" ? "text-4xl" : "text-5xl"
        }`}>
          {title}
        </div>
        <motion.div className="flex-1 overflow-y-auto" variants={sectionVariants} initial="hidden" whileInView="show" viewport={{ amount: 0.25 }}>
          {children}
        </motion.div>
        {/* Hide SectionActions in PDF section */}
        {id !== "pdf-report" && (
          <SectionActions title={title} share={shareText} textColor={text} onToast={onToast} inputClassName={inputClassName} buttonClassName={buttonClassName} sessionId={sessionId} testId={testId} sectionId={id} />
        )}
      </div>
    </section>
  );
};