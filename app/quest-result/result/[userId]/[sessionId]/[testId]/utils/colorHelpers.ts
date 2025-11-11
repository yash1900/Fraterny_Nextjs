// colorHelpers.ts
import { tokens } from './constants';

export const getAuthBannerColors = (activeIndex: number) => {
  const sectionKeys = ["emotional", "mind", "findings", "subjects", "quotes", "films", "books", "work", "pdf-report"];
  const currentSection = sectionKeys[activeIndex];

  switch (currentSection) {
    case "emotional":
      return {
        buttonBg: 'linear-gradient(135deg, #0C45F0 0%, #41D9FF 100%)',
        buttonText: 'text-white',
        buttonBorder: 'border-none',
        logoFilter: 'brightness(0) invert(1)'
      };
    case "mind":
      return {
        buttonBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        buttonText: 'text-white',
        buttonBorder: 'border-none',
        logoFilter: 'brightness(0) invert(1)'
      };
    case "findings":
      return {
        buttonBg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        buttonText: 'text-white',
        buttonBorder: 'border-none',
        logoFilter: 'brightness(0) invert(1)'
      };
    case "subjects":
      return {
        buttonBg: 'rgba(255,255,255,0.95)',
        buttonText: 'text-gray-900',
        buttonBorder: 'border border-gray-200',
        logoFilter: 'none'
      };
    case "quotes":
      return {
        buttonBg: 'rgba(255,255,255,0.95)',
        buttonText: 'text-gray-900',
        buttonBorder: 'border border-gray-200',
        logoFilter: 'none'
      };
    case "films":
      return {
        buttonBg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        buttonText: 'text-gray-900',
        buttonBorder: 'border-none',
        logoFilter: 'none'
      };
    case "books":
      return {
        buttonBg: 'rgba(255,255,255,0.95)',
        buttonText: 'text-gray-900',
        buttonBorder: 'border border-gray-200',
        logoFilter: 'none'
      };
    case "work":
      return {
        buttonBg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        buttonText: 'text-gray-900',
        buttonBorder: 'border-none',
        logoFilter: 'none'
      };
    case "pdf-report":
      return {
        buttonBg: 'rgba(255,255,255,0.95)',
        buttonText: 'text-gray-900',
        buttonBorder: 'border border-gray-200',
        logoFilter: 'none'
      };
    default:
      return {
        buttonBg: 'linear-gradient(135deg, #0C45F0 0%, #41D9FF 100%)',
        buttonText: 'text-white',
        buttonBorder: 'border-none',
        logoFilter: 'brightness(0) invert(1)'
      };
  }
};

export const getGlassBackground = (index: number) => {
  const sectionKeys = ["emotional", "mind", "findings", "subjects", "quotes", "films", "books", "work", "pdf-report"];
  const currentSection = sectionKeys[index];

  if (currentSection === "quotes" || currentSection === "subjects" || currentSection === "books" || currentSection === "pdf-report") {
    return 'rgba(255,255,255,0.25)';
  } else {
    return 'rgba(255,255,255,0.1)';
  }
};