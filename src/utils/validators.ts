/**
 * Validation utilities for Sri Lankan phone numbers and emails
 */
export const isValidSriLankanPhone = (phone: string): boolean => {
  // Matches formats: +947XXXXXXXX, 07XXXXXXXX, 7XXXXXXXX
  const cleaned = phone.replace(/\s+/g, '').replace(/-/g, '');
  const pattern = /^(?:\+94|0)?7[0-9]{8}$/;
  return pattern.test(cleaned);
};

export const normalizePhoneNumber = (phone: string): string => {
  let cleaned = phone.replace(/\s+/g, '').replace(/-/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '+94' + cleaned.substring(1);
  } else if (!cleaned.startsWith('+94')) {
    cleaned = '+94' + cleaned;
  }
  return cleaned;
};

export const isValidEmail = (email: string): boolean => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email.trim());
};
