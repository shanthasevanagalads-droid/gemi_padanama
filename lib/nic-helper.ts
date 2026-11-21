/**
 * Sri Lanka National Identity Card (NIC) Validation & Parsing Helper
 * Supports both 9-character (Old) and 12-digit (New) formats.
 */

export interface NicAnalysis {
  isValid: boolean;
  format: 'Old (9-digit+V/X)' | 'New (12-digit)' | 'Invalid';
  gender?: 'Male' | 'Female';
  birthYear?: number;
  message?: string;
}

export function parseSriLankaNIC(rawNic: string): NicAnalysis {
  const clean = rawNic.trim().toUpperCase();

  if (!clean) {
    return { isValid: false, format: 'Invalid' };
  }

  // 1. Old Format: 9 numbers + 'V' or 'X'
  const oldRegex = /^([0-9]{9})([VvXx])$/;
  if (oldRegex.test(clean)) {
    const match = clean.match(oldRegex);
    if (!match) return { isValid: false, format: 'Invalid' };

    const digits = match[1];
    const yearDigits = parseInt(digits.substring(0, 2), 10);
    const dayOfYear = parseInt(digits.substring(2, 5), 10);

    const birthYear = 1900 + yearDigits;
    const gender = dayOfYear > 500 ? 'Female' : 'Male';

    return {
      isValid: true,
      format: 'Old (9-digit+V/X)',
      gender,
      birthYear,
      message: `Old NIC • Born ~${birthYear} • ${gender}`,
    };
  }

  // 2. New Format: 12 numeric digits
  const newRegex = /^([0-9]{12})$/;
  if (newRegex.test(clean)) {
    const yearDigits = parseInt(clean.substring(0, 4), 10);
    const dayOfYear = parseInt(clean.substring(4, 7), 10);

    const gender = dayOfYear > 500 ? 'Female' : 'Male';

    return {
      isValid: true,
      format: 'New (12-digit)',
      gender,
      birthYear: yearDigits,
      message: `New NIC • Born ${yearDigits} • ${gender}`,
    };
  }

  return {
    isValid: false,
    format: 'Invalid',
    message: 'NIC must be 9 digits + V/X or 12 digits',
  };
}
