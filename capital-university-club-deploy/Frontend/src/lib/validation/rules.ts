import {
  ALLOWED_EMAIL_DOMAINS,
  FIELD_LIMITS,
  PATTERNS,
} from './patterns';

export type ValidationErrorKey = string;

export type FieldValidation = { valid: true } | { valid: false; key: ValidationErrorKey; params?: Record<string, string | number> };

const fail = (key: ValidationErrorKey, params?: Record<string, string | number>): FieldValidation => ({
  valid: false,
  key,
  params,
});

const ok = (): FieldValidation => ({ valid: true });

export const normalizePhone = (value: string) => value.replace(/\s/g, '');

export function validateArabicName(value: string, required = true): FieldValidation {
  const trimmed = value.trim();
  if (!trimmed) return required ? fail('arabicName.required') : ok();
  if (trimmed.length > FIELD_LIMITS.NAME_MAX) return fail('arabicName.max', { max: FIELD_LIMITS.NAME_MAX });
  if (!PATTERNS.ARABIC_NAME.test(trimmed)) return fail('arabicName.invalid');
  return ok();
}

export function validateEnglishName(value: string, required = true): FieldValidation {
  const trimmed = value.trim();
  if (!trimmed) return required ? fail('englishName.required') : ok();
  if (trimmed.length > FIELD_LIMITS.NAME_MAX) return fail('englishName.max', { max: FIELD_LIMITS.NAME_MAX });
  if (!PATTERNS.ENGLISH_NAME.test(trimmed)) return fail('englishName.invalid');
  return ok();
}

export function validateArabicText(value: string, required = false): FieldValidation {
  const trimmed = value.trim();
  if (!trimmed) return required ? fail('arabicText.required') : ok();
  if (!PATTERNS.ARABIC_TEXT.test(trimmed)) return fail('arabicText.invalid');
  return ok();
}

export function validateEnglishText(value: string, required = false): FieldValidation {
  const trimmed = value.trim();
  if (!trimmed) return required ? fail('englishText.required') : ok();
  if (!PATTERNS.ENGLISH_TEXT.test(trimmed)) return fail('englishText.invalid');
  return ok();
}

export function validateEgyptianPhone(value: string, required = true): FieldValidation {
  const trimmed = normalizePhone(value);
  if (!trimmed) return required ? fail('phone.required') : ok();
  if (trimmed.length !== 11) return fail('phone.length');
  if (!PATTERNS.EGYPTIAN_MOBILE.test(trimmed)) return fail('phone.invalid');
  return ok();
}

export function validateEmail(value: string, required = true, checkDomain = false): FieldValidation {
  const trimmed = value.trim();
  if (!trimmed) return required ? fail('email.required') : ok();
  if (!PATTERNS.EMAIL_BASIC.test(trimmed)) return fail('email.invalid');
  if (checkDomain) {
    const domain = trimmed.split('@')[1]?.toLowerCase();
    if (!domain || !ALLOWED_EMAIL_DOMAINS.includes(domain as typeof ALLOWED_EMAIL_DOMAINS[number])) {
      return fail('email.domain');
    }
  }
  return ok();
}

export function validatePassword(
  value: string,
  required = true,
  opts: { minLength?: number; strong?: boolean } = {},
): FieldValidation {
  const minLength = opts.minLength ?? FIELD_LIMITS.PASSWORD_MIN;
  const trimmed = value;
  if (!trimmed) return required ? fail('password.required') : ok();
  if (trimmed.length < minLength) return fail('password.min', { min: minLength });
  if (trimmed.length > FIELD_LIMITS.PASSWORD_MAX) return fail('password.max', { max: FIELD_LIMITS.PASSWORD_MAX });
  if (opts.strong) {
    if (!PATTERNS.PASSWORD_STRONG.test(trimmed)) return fail('password.strong');
    if (!PATTERNS.PASSWORD_CHARS.test(trimmed)) return fail('password.chars');
  }
  return ok();
}

export function validatePasswordMatch(password: string, confirm: string): FieldValidation {
  if (!confirm) return fail('password.confirmRequired');
  if (password !== confirm) return fail('password.mismatch');
  return ok();
}

export function validateMemberNationalId(value: string, required = true): FieldValidation {
  const trimmed = value.trim();
  if (!trimmed) return required ? fail('nationalId.required') : ok();
  if (!PATTERNS.NATIONAL_ID_MEMBER.test(trimmed)) return fail('nationalId.memberInvalid');
  return ok();
}

export function validateStaffNationalId(value: string, required = true): FieldValidation {
  const trimmed = value.trim();
  if (!trimmed) return required ? fail('nationalId.required') : ok();
  if (trimmed.length !== 14) return fail('nationalId.length');
  if (!PATTERNS.NATIONAL_ID_STAFF.test(trimmed)) return fail('nationalId.staffInvalid');
  return ok();
}

export function validateLoginNationalId(value: string, required = true): FieldValidation {
  const trimmed = value.trim();
  if (!trimmed) return required ? fail('nationalId.required') : ok();
  if (!PATTERNS.NATIONAL_ID_LOGIN.test(trimmed)) return fail('nationalId.loginInvalid');
  return ok();
}

export function validateInviteNationalId(value: string, required = false): FieldValidation {
  const trimmed = value.trim();
  if (!trimmed) return required ? fail('nationalId.required') : ok();
  if (!PATTERNS.NATIONAL_ID_INVITE.test(trimmed)) return fail('nationalId.inviteInvalid');
  return ok();
}

export function validatePassport(value: string, required = true): FieldValidation {
  const trimmed = value.trim();
  if (!trimmed) return required ? fail('passport.required') : ok();
  if (!PATTERNS.PASSPORT.test(trimmed)) return fail('passport.invalid');
  return ok();
}

export function validateBirthdate(value: string, required = true, maxAge = FIELD_LIMITS.MAX_AGE_MEMBER): FieldValidation {
  const trimmed = value.trim();
  if (!trimmed) return required ? fail('birthdate.required') : ok();
  const birthDate = new Date(trimmed);
  if (Number.isNaN(birthDate.getTime())) return fail('birthdate.invalid');
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();
  const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
  if (actualAge < FIELD_LIMITS.MIN_AGE || actualAge > maxAge) {
    return fail('birthdate.ageRange', { min: FIELD_LIMITS.MIN_AGE, max: maxAge });
  }
  return ok();
}

export function validateRequired(value: string, key = 'required'): FieldValidation {
  if (!value?.trim()) return fail(key);
  return ok();
}

export function validateCode(value: string, required = true): FieldValidation {
  const trimmed = value.trim();
  if (!trimmed) return required ? fail('code.required') : ok();
  if (!PATTERNS.CODE.test(trimmed)) return fail('code.invalid');
  return ok();
}

export function validateUrl(value: string, required = true): FieldValidation {
  const trimmed = value.trim();
  if (!trimmed) return required ? fail('url.required') : ok();
  if (!PATTERNS.URL.test(trimmed)) return fail('url.invalid');
  return ok();
}

export function validateMaxLength(value: string, max: number, key: string): FieldValidation {
  if (value.trim().length > max) return fail(key, { max });
  return ok();
}

/** Resolve a validation result to a localized message. */
export function formatValidationError(
  result: FieldValidation,
  t: (key: string, params?: Record<string, string | number>) => string,
): string | null {
  if (result.valid) return null;
  return t(result.key, result.params);
}

/** Run multiple validators; returns first error message or null. */
export function firstError(
  checks: FieldValidation[],
  t: (key: string, params?: Record<string, string | number>) => string,
): string | null {
  for (const check of checks) {
    const msg = formatValidationError(check, t);
    if (msg) return msg;
  }
  return null;
}
