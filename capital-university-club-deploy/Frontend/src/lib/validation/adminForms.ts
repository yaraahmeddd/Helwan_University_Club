import { FIELD_LIMITS, PATTERNS } from './patterns';
import {
  formatValidationError,
  validateArabicName,
  validateArabicText,
  validateBirthdate,
  validateCode,
  validateEmail,
  validateEnglishName,
  validateEnglishText,
  validateEgyptianPhone,
  validateMaxLength,
  validateMemberNationalId,
  validateMoneyAmount,
  validatePositiveInteger,
  validateRequired,
  validateSportSelection,
  validateUrl,
  type FieldValidation,
} from './rules';

export type ValidationTranslator = (
  key: string,
  params?: Record<string, string | number>,
) => string;

export function validationMessage(
  result: FieldValidation,
  t: ValidationTranslator,
): string | undefined {
  if (result.valid) return undefined;
  return formatValidationError(result, t) ?? undefined;
}

export const matchesArabicText = (value: string) =>
  value === '' || PATTERNS.ARABIC_TEXT.test(value);

export const matchesEnglishText = (value: string) =>
  value === '' || PATTERNS.ENGLISH_TEXT.test(value);

export const matchesCode = (value: string) =>
  value === '' || PATTERNS.CODE.test(value);

export const matchesDigitsOnly = (value: string) =>
  value === '' || PATTERNS.DIGITS_ONLY.test(value);

/** Strip characters that are not allowed in Arabic text fields. */
export function filterArabicTextInput(value: string): string {
  return value.replace(/[^\u0600-\u06FF\s\-.,;:!?()«»']/g, '');
}

/** Strip characters that are not allowed in Arabic person-name fields. */
export function filterArabicNameInput(value: string): string {
  return value.replace(/[^\u0600-\u06FF\s\-']/g, '');
}

/** Strip characters that are not allowed in English text fields. */
export function filterEnglishTextInput(value: string): string {
  return value.replace(/[^a-zA-Z0-9\s\-.,;:!?()]/g, '');
}

/** Strip characters that are not allowed in English person-name fields. */
export function filterEnglishNameInput(value: string): string {
  return value.replace(/[^a-zA-Z\s\-']/g, '');
}

export type BilingualFieldVariant = 'text' | 'name';

export function validateAdminCodeNameForm(
  form: { code?: string; name_ar: string; name_en: string },
  t: ValidationTranslator,
  opts: { requireCode?: boolean; requireNameEn?: boolean } = {},
): Record<string, string> {
  const errors: Record<string, string> = {};
  const { requireCode = false, requireNameEn = true } = opts;

  if (requireCode) {
    const codeErr = validationMessage(validateCode(form.code ?? '', true), t);
    if (codeErr) errors.code = codeErr;
  }

  const arErr = validationMessage(validateArabicText(form.name_ar, true), t);
  if (arErr) errors.name_ar = arErr;

  const enErr = validationMessage(validateEnglishText(form.name_en, requireNameEn), t);
  if (enErr) errors.name_en = enErr;

  return errors;
}

export function validateAdminBranchForm(
  form: {
    code: string;
    name_ar: string;
    name_en: string;
    location_ar: string;
    location_en: string;
    phone?: string;
  },
  t: ValidationTranslator,
  opts: { requireCode?: boolean } = {},
): Record<string, string> {
  const errors = validateAdminCodeNameForm(
    { code: form.code, name_ar: form.name_ar, name_en: form.name_en },
    t,
    { requireCode: opts.requireCode ?? false, requireNameEn: false },
  );

  const locAr = validationMessage(validateArabicText(form.location_ar, true), t);
  if (locAr) errors.location_ar = locAr;

  if (form.location_en.trim()) {
    const locEn = validationMessage(validateEnglishText(form.location_en, false), t);
    if (locEn) errors.location_en = locEn;
  }

  if (form.phone?.trim()) {
    const phoneErr = validationMessage(validateEgyptianPhone(form.phone, false), t);
    if (phoneErr) errors.phone = phoneErr;
  }

  return errors;
}

export function validateAdminCourtForm(
  form: { name_ar: string; name_en: string; sportId: string; capacity: string },
  t: ValidationTranslator,
): Record<string, string> {
  const errors: Record<string, string> = {};

  const arErr = validationMessage(validateArabicText(form.name_ar, true), t);
  if (arErr) errors.name_ar = arErr;

  const enErr = validationMessage(validateEnglishText(form.name_en, true), t);
  if (enErr) errors.name_en = enErr;

  const sportErr = validationMessage(validateSportSelection(form.sportId, true), t);
  if (sportErr) errors.sportId = sportErr;

  if (form.capacity.trim()) {
    const capErr = validationMessage(validatePositiveInteger(form.capacity, false), t);
    if (capErr) errors.capacity = capErr;
  }

  return errors;
}

export function validateAdminTeamForm(
  form: {
    nameAr: string;
    nameEn: string;
    sportId: string;
    maxParticipants: string;
    trainingFee: string;
    requireSport: boolean;
  },
  t: ValidationTranslator,
): Record<string, string> {
  const errors: Record<string, string> = {};

  const arErr = validationMessage(validateArabicText(form.nameAr, true), t);
  if (arErr) errors.nameAr = arErr;

  const enErr = validationMessage(validateEnglishText(form.nameEn, true), t);
  if (enErr) errors.nameEn = enErr;

  if (form.requireSport) {
    const sportErr = validationMessage(validateSportSelection(form.sportId, true), t);
    if (sportErr) errors.sportId = sportErr;
  }

  const maxErr = validationMessage(validatePositiveInteger(form.maxParticipants, true), t);
  if (maxErr) errors.maxParticipants = maxErr;

  const feeErr = validationMessage(validateMoneyAmount(form.trainingFee, true), t);
  if (feeErr) errors.trainingFee = feeErr;

  return errors;
}

export function validateAdminSportForm(
  form: { nameAr: string; nameEn: string; branchId: string; maxParticipants: string },
  t: ValidationTranslator,
): Record<string, string> {
  const errors: Record<string, string> = {};

  const arErr = validationMessage(validateArabicText(form.nameAr, true), t);
  if (arErr) errors.nameAr = arErr;

  const enErr = validationMessage(validateEnglishText(form.nameEn, true), t);
  if (enErr) errors.nameEn = enErr;

  const branchErr = validationMessage(validateSportSelection(form.branchId, true), t);
  if (branchErr) errors.branchId = branchErr;

  if (form.maxParticipants.trim()) {
    const maxErr = validationMessage(validatePositiveInteger(form.maxParticipants, false), t);
    if (maxErr) errors.maxParticipants = maxErr;
  }

  return errors;
}

export function validateAdminRegistrationMemberForm(
  form: {
    name_ar: string;
    name_en: string;
    national_id: string;
    phone: string;
    birth_date: string;
    gender: string;
    address?: string;
    job?: string;
    children_count?: number | string;
  },
  t: ValidationTranslator,
): Record<string, string> {
  const errors: Record<string, string> = {};

  const arErr = validationMessage(validateArabicText(form.name_ar, true), t);
  if (arErr) {
    errors.name_ar = arErr;
  } else if (form.name_ar.trim().split(/\s+/).length < 2) {
    errors.name_ar = t('fullName.parts');
  }

  const enErr = validationMessage(validateEnglishText(form.name_en, true), t);
  if (enErr) {
    errors.name_en = enErr;
  } else if (form.name_en.trim().split(/\s+/).length < 2) {
    errors.name_en = t('fullName.parts');
  }

  const nidErr = validationMessage(validateMemberNationalId(form.national_id, true), t);
  if (nidErr) errors.national_id = nidErr;

  const phoneErr = validationMessage(validateEgyptianPhone(form.phone, true), t);
  if (phoneErr) errors.phone = phoneErr;

  const birthErr = validationMessage(validateBirthdate(form.birth_date, true), t);
  if (birthErr) errors.birth_date = birthErr;

  if (!form.gender.trim()) errors.gender = t('gender.required');

  if (form.address?.trim()) {
    const addrErr = validationMessage(validateMaxLength(form.address, FIELD_LIMITS.ADDRESS_MAX, 'address.max'), t);
    if (addrErr) errors.address = addrErr;
  }

  if (form.job?.trim()) {
    const jobErr = validationMessage(validateMaxLength(form.job, 100, 'title.max'), t);
    if (jobErr) errors.job = jobErr;
  }

  if (form.children_count !== undefined && String(form.children_count).trim() !== '') {
    const countErr = validationMessage(validatePositiveInteger(String(form.children_count), false), t);
    if (countErr) errors.children_count = countErr;
  }

  return errors;
}

export function validateMemberAssignId(value: string, t: ValidationTranslator): string | undefined {
  return validationMessage(validateMemberNationalId(value.replace(/\D/g, ''), true), t);
}

export function validateAdminMembershipPlanForm(
  form: {
    plan_code: string;
    name_ar: string;
    name_en: string;
    price: string;
    renewal_price?: string;
    duration_months: string;
    member_type_id?: string;
  },
  t: ValidationTranslator,
  opts: { requireMemberType?: boolean } = {},
): Record<string, string> {
  const errors: Record<string, string> = {};

  const codeErr = validationMessage(validateCode(form.plan_code, true), t);
  if (codeErr) errors.plan_code = codeErr;

  const arErr = validationMessage(validateArabicText(form.name_ar, true), t);
  if (arErr) errors.name_ar = arErr;

  const enErr = validationMessage(validateEnglishText(form.name_en, true), t);
  if (enErr) errors.name_en = enErr;

  const priceErr = validationMessage(validateMoneyAmount(String(form.price), true), t);
  if (priceErr) errors.price = priceErr;

  if (form.renewal_price?.trim()) {
    const renewErr = validationMessage(validateMoneyAmount(String(form.renewal_price), false), t);
    if (renewErr) errors.renewal_price = renewErr;
  }

  const durErr = validationMessage(validatePositiveInteger(String(form.duration_months), true), t);
  if (durErr) errors.duration_months = durErr;

  if (opts.requireMemberType && !String(form.member_type_id ?? '').trim()) {
    errors.member_type_id = t('membershipType.required');
  }

  return errors;
}

export function validateAdminPersonNamesForm(
  form: {
    first_name_ar: string;
    last_name_ar: string;
    first_name_en: string;
    last_name_en: string;
  },
  t: ValidationTranslator,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!form.first_name_ar.trim() && !form.first_name_en.trim()) {
    errors.first_name_ar = t('nameRequired');
    return errors;
  }

  if (form.first_name_ar.trim()) {
    const err = validationMessage(validateArabicName(form.first_name_ar, false), t);
    if (err) errors.first_name_ar = err;
  }
  if (form.last_name_ar.trim()) {
    const err = validationMessage(validateArabicName(form.last_name_ar, false), t);
    if (err) errors.last_name_ar = err;
  }
  if (form.first_name_en.trim()) {
    const err = validationMessage(validateEnglishName(form.first_name_en, false), t);
    if (err) errors.first_name_en = err;
  }
  if (form.last_name_en.trim()) {
    const err = validationMessage(validateEnglishName(form.last_name_en, false), t);
    if (err) errors.last_name_en = err;
  }

  return errors;
}

export function validateAdminStaffContactForm(
  form: { phone: string; address?: string },
  t: ValidationTranslator,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (form.phone.trim()) {
    const phoneErr = validationMessage(validateEgyptianPhone(form.phone, false), t);
    if (phoneErr) errors.phone = phoneErr;
  }
  if (form.address?.trim()) {
    const addrErr = validationMessage(validateMaxLength(form.address, FIELD_LIMITS.ADDRESS_MAX, 'address.max'), t);
    if (addrErr) errors.address = addrErr;
  }

  return errors;
}

export function validateAdminMediaForm(
  form: { title: string; description?: string; videoUrl?: string },
  t: ValidationTranslator,
): Record<string, string> {
  const errors: Record<string, string> = {};

  const titleReq = validationMessage(validateRequired(form.title, 'required'), t);
  if (titleReq) {
    errors.title = titleReq;
  } else {
    const titleMax = validationMessage(validateMaxLength(form.title, 200, 'title.max'), t);
    if (titleMax) errors.title = titleMax;
  }

  if (form.description?.trim()) {
    const descMax = validationMessage(validateMaxLength(form.description, FIELD_LIMITS.DESCRIPTION_MAX, 'health.max'), t);
    if (descMax) errors.description = descMax;
  }

  if (form.videoUrl?.trim()) {
    const urlErr = validationMessage(validateUrl(form.videoUrl, false), t);
    if (urlErr) errors.videoUrl = urlErr;
  }

  return errors;
}

export function validateAdminPackageForm(
  form: { name: string; description?: string },
  t: ValidationTranslator,
): Record<string, string> {
  const errors: Record<string, string> = {};

  const nameReq = validationMessage(validateRequired(form.name, 'required'), t);
  if (nameReq) {
    errors.name = nameReq;
  } else {
    const nameMax = validationMessage(validateMaxLength(form.name, 100, 'title.max'), t);
    if (nameMax) errors.name = nameMax;
  }

  if (form.description?.trim()) {
    const descMax = validationMessage(validateMaxLength(form.description, FIELD_LIMITS.DESCRIPTION_MAX, 'health.max'), t);
    if (descMax) errors.description = descMax;
  }

  return errors;
}

export function validateAdminMemberEditForm(
  form: {
    first_name_ar: string;
    last_name_ar: string;
    first_name_en: string;
    last_name_en: string;
    phone: string;
    email: string;
    national_id: string;
    birthdate: string;
    nationality?: string;
    address?: string;
    health_status?: string;
    department_ar?: string;
    department_en?: string;
    job_title_ar?: string;
    job_title_en?: string;
    former_department_ar?: string;
    former_department_en?: string;
  },
  t: ValidationTranslator,
): Record<string, string> {
  const errors = validateAdminPersonNamesForm(form, t);

  if (form.phone.trim()) {
    const phoneErr = validationMessage(validateEgyptianPhone(form.phone, false), t);
    if (phoneErr) errors.phone = phoneErr;
  }
  if (form.email.trim()) {
    const emailErr = validationMessage(validateEmail(form.email, false), t);
    if (emailErr) errors.email = emailErr;
  }
  if (form.national_id.trim()) {
    const nidErr = validationMessage(validateMemberNationalId(form.national_id, false), t);
    if (nidErr) errors.national_id = nidErr;
  }
  if (form.birthdate.trim()) {
    const birthErr = validationMessage(validateBirthdate(form.birthdate, false), t);
    if (birthErr) errors.birthdate = birthErr;
  }
  if (form.nationality?.trim()) {
    const natErr = validationMessage(validateMaxLength(form.nationality, FIELD_LIMITS.NATIONALITY_MAX, 'nationality.max'), t);
    if (natErr) errors.nationality = natErr;
  }
  if (form.address?.trim()) {
    const addrErr = validationMessage(validateMaxLength(form.address, FIELD_LIMITS.ADDRESS_MAX, 'address.max'), t);
    if (addrErr) errors.address = addrErr;
  }
  if (form.health_status?.trim()) {
    const healthErr = validationMessage(validateMaxLength(form.health_status, FIELD_LIMITS.HEALTH_MAX, 'health.max'), t);
    if (healthErr) errors.health_status = healthErr;
  }

  const optionalArabic = [
    ['department_ar', form.department_ar],
    ['job_title_ar', form.job_title_ar],
    ['former_department_ar', form.former_department_ar],
  ] as const;
  for (const [key, value] of optionalArabic) {
    if (value?.trim()) {
      const err = validationMessage(validateArabicText(value, false), t);
      if (err) errors[key] = err;
    }
  }

  const optionalEnglish = [
    ['department_en', form.department_en],
    ['job_title_en', form.job_title_en],
    ['former_department_en', form.former_department_en],
  ] as const;
  for (const [key, value] of optionalEnglish) {
    if (value?.trim()) {
      const err = validationMessage(validateEnglishText(value, false), t);
      if (err) errors[key] = err;
    }
  }

  return errors;
}

export function validateBookingMemberId(
  memberId: string,
  t: ValidationTranslator,
): Record<string, string> {
  const errors: Record<string, string> = {};
  const idErr = validationMessage(validateMemberNationalId(memberId.replace(/\D/g, ''), true), t);
  if (idErr) errors.memberId = idErr;
  return errors;
}

export function validateAdminBlockReason(
  reason: string,
  t: ValidationTranslator,
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (reason.trim()) {
    const err = validationMessage(validateMaxLength(reason, 200, 'title.max'), t);
    if (err) errors.reason = err;
  }
  return errors;
}

export function toErrorArrayMap(errors: Record<string, string>): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(errors).map(([key, message]) => [key, [message]]),
  );
}
