import { z } from 'zod';
import { ALLOWED_EMAIL_DOMAINS, FIELD_LIMITS, PATTERNS } from './patterns';

export type ValidationTranslator = (key: string, params?: Record<string, string | number>) => string;

export const zArabicName = (t: ValidationTranslator, opts?: { required?: boolean; max?: number }) => {
  const max = opts?.max ?? FIELD_LIMITS.NAME_MAX;
  const required = opts?.required !== false;
  let schema = z.string().max(max, t('arabicName.max', { max }));
  if (required) schema = schema.min(1, t('arabicName.required'));
  return schema.regex(PATTERNS.ARABIC_NAME, t('arabicName.invalid')).transform((v) => v.trim());
};

export const zOptionalArabicName = (t: ValidationTranslator, max = FIELD_LIMITS.NAME_MAX) =>
  z.string()
    .max(max, t('arabicName.max', { max }))
    .regex(PATTERNS.ARABIC_NAME, t('arabicName.invalid'))
    .optional()
    .or(z.literal(''));

export const zEnglishName = (t: ValidationTranslator, opts?: { required?: boolean; max?: number }) => {
  const max = opts?.max ?? FIELD_LIMITS.NAME_MAX;
  const required = opts?.required !== false;
  let schema = z.string().max(max, t('englishName.max', { max }));
  if (required) schema = schema.min(1, t('englishName.required'));
  return schema.regex(PATTERNS.ENGLISH_NAME, t('englishName.invalid')).transform((v) => v.trim());
};

export const zEgyptianPhone = (t: ValidationTranslator) =>
  z.string()
    .min(11, t('phone.length'))
    .max(11, t('phone.length'))
    .regex(PATTERNS.EGYPTIAN_MOBILE, t('phone.invalid'))
    .transform((v) => v.replace(/\s/g, ''));

export const zMemberNationalId = (t: ValidationTranslator) =>
  z.string()
    .min(1, t('nationalId.required'))
    .regex(PATTERNS.NATIONAL_ID_MEMBER, t('nationalId.memberInvalid'));

export const zStaffNationalId = (t: ValidationTranslator) =>
  z.string()
    .length(14, t('nationalId.length'))
    .regex(PATTERNS.NATIONAL_ID_STAFF, t('nationalId.staffInvalid'));

export const zLoginNationalId = (t: ValidationTranslator) =>
  z.string()
    .length(14, t('nationalId.length'))
    .regex(PATTERNS.NATIONAL_ID_LOGIN, t('nationalId.loginInvalid'));

export const zPassport = (t: ValidationTranslator) =>
  z.string()
    .min(5, t('passport.invalid'))
    .max(20, t('passport.invalid'))
    .regex(PATTERNS.PASSPORT, t('passport.invalid'));

export const zRegistrationEmail = (t: ValidationTranslator) =>
  z.string()
    .min(1, t('email.required'))
    .email(t('email.invalid'))
    .refine((email) => {
      const domain = email.split('@')[1]?.toLowerCase();
      return !!domain && ALLOWED_EMAIL_DOMAINS.includes(domain as typeof ALLOWED_EMAIL_DOMAINS[number]);
    }, t('email.domain'));

export const zBasicEmail = (t: ValidationTranslator) =>
  z.string()
    .min(1, t('email.required'))
    .regex(PATTERNS.EMAIL_BASIC, t('email.invalid'));

export const zRegistrationPassword = (t: ValidationTranslator) =>
  z.string()
    .min(FIELD_LIMITS.PASSWORD_MIN, t('password.min', { min: FIELD_LIMITS.PASSWORD_MIN }))
    .max(FIELD_LIMITS.PASSWORD_MAX, t('password.max', { max: FIELD_LIMITS.PASSWORD_MAX }))
    .regex(PATTERNS.PASSWORD_STRONG, t('password.strong'))
    .regex(PATTERNS.PASSWORD_CHARS, t('password.chars'));

export const zCredentialPassword = (t: ValidationTranslator) =>
  z.string()
    .min(FIELD_LIMITS.PASSWORD_MIN_CREDENTIAL, t('password.min', { min: FIELD_LIMITS.PASSWORD_MIN_CREDENTIAL }));

export const zBirthdate = (t: ValidationTranslator, maxAge = FIELD_LIMITS.MAX_AGE_MEMBER) =>
  z.string()
    .min(1, t('birthdate.required'))
    .refine((date) => {
      const birthDate = new Date(date);
      if (Number.isNaN(birthDate.getTime())) return false;
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();
      const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
      return actualAge >= FIELD_LIMITS.MIN_AGE && actualAge <= maxAge;
    }, t('birthdate.ageRange', { min: FIELD_LIMITS.MIN_AGE, max: maxAge }));

export const zArabicText = (t: ValidationTranslator, opts?: { required?: boolean }) => {
  const required = opts?.required === true;
  let schema = z.string().regex(PATTERNS.ARABIC_TEXT, t('arabicText.invalid'));
  if (required) schema = schema.min(1, t('arabicText.required'));
  return schema;
};

export const zEnglishText = (t: ValidationTranslator, opts?: { required?: boolean }) => {
  const required = opts?.required === true;
  let schema = z.string().regex(PATTERNS.ENGLISH_TEXT, t('englishText.invalid'));
  if (required) schema = schema.min(1, t('englishText.required'));
  return schema;
};
