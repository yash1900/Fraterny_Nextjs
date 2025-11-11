
/**
 * Formats a phone number by ensuring it follows E.164 format
 * (+ followed by country code and number digits only, no spaces or special characters)
 * 
 * @param phoneNumber The phone number to format
 * @returns Formatted phone number with + prefix and no non-digit characters
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  const trimmed = phoneNumber.trim();
  if (!trimmed) return '';
  
  // If it already has a country code with +, strip all non-digit characters except the initial +
  if (trimmed.startsWith('+')) {
    return '+' + trimmed.substring(1).replace(/\D/g, '');
  }
  
  // If no +, assume it's just the number part (will be combined with country code later)
  return trimmed.replace(/\D/g, '');
};

/**
 * Separates a full phone number into country code and national number parts
 * 
 * @param fullNumber Complete phone number with country code
 * @returns Object with countryCode and nationalNumber
 */
export const separatePhoneNumber = (fullNumber: string): { countryCode: string, nationalNumber: string } => {
  if (!fullNumber || !fullNumber.startsWith('+')) {
    return { countryCode: '+91', nationalNumber: fullNumber.replace(/\D/g, '') };
  }
  
  // Try to extract country code - assume it's the first 1-3 digits after the +
  const match = fullNumber.match(/^\+(\d{1,3})(.*)/);
  if (match) {
    return {
      countryCode: `+${match[1]}`,
      nationalNumber: match[2].replace(/\D/g, '')
    };
  }
  
  return { countryCode: '+91', nationalNumber: fullNumber.replace(/\D/g, '') };
};

/**
 * Sanitizes phone number input by removing invalid characters
 * @param value Raw phone number input
 * @returns Sanitized phone number (only digits)
 */
export const sanitizePhoneInput = (value: string): string => {
  return value.replace(/[^\d]/g, '');
};

/**
 * Formats a national number for display (without country code)
 * @param nationalNumber The national part of the phone number (without country code)
 * @returns Formatted national number for display
 */
export const formatNationalNumber = (nationalNumber: string): string => {
  return nationalNumber;
};
