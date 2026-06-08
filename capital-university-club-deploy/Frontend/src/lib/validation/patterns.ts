/** Canonical regex patterns used across the application. */
export const PATTERNS = {
  ARABIC_NAME: /^[\u0600-\u06FF\s\-']+$/,
  ARABIC_TEXT: /^[\u0600-\u06FF\s\-.,;:!?()«»']*$/,
  ENGLISH_NAME: /^[a-zA-Z\s\-']+$/,
  ENGLISH_TEXT: /^[a-zA-Z0-9\s\-.,;:!?()]*$/,
  EGYPTIAN_MOBILE: /^01[0125]\d{8}$/,
  /** Member registration — 14 digits, first digit cannot be 0 */
  NATIONAL_ID_MEMBER: /^[1-9]\d{13}$/,
  /** Staff records — starts with 1–4 */
  NATIONAL_ID_STAFF: /^[1-4]\d{13}$/,
  /** Login / identity — any 14 digits */
  NATIONAL_ID_LOGIN: /^\d{14}$/,
  /** Invitation flow — starts with 2 or 3 */
  NATIONAL_ID_INVITE: /^[23]\d{13}$/,
  EMAIL_BASIC: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  PASSWORD_CHARS: /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]*$/,
  PASSPORT: /^[A-Za-z0-9]{5,20}$/,
  DIGITS_ONLY: /^\d*$/,
  CODE: /^[A-Z0-9_-]+$/i,
  URL: /^https?:\/\/.+/i,
  NUMBERS_ONLY: /^\d+$/,
} as const;

export const ALLOWED_EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'icloud.com', 'protonmail.com', 'mail.com', 'aol.com',
  'yandex.com', 'zoho.com', 'gmx.com', 'inbox.com',
] as const;

export const FIELD_LIMITS = {
  NAME_MAX: 20,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 50,
  PASSWORD_MIN_CREDENTIAL: 6,
  ADDRESS_MAX: 200,
  HEALTH_MAX: 500,
  NATIONALITY_MAX: 50,
  DESCRIPTION_MAX: 500,
  CODE_MAX: 50,
  MIN_AGE: 16,
  MAX_AGE_MEMBER: 120,
  MAX_AGE_REGISTER: 100,
} as const;
