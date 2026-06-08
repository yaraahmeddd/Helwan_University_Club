import {
  firstError,
  validateArabicName,
  validateEnglishName,
  validateEgyptianPhone,
  type FieldValidation,
} from './rules';

export type StaffEditFields = {
  first_name_ar: string;
  last_name_ar: string;
  first_name_en: string;
  last_name_en: string;
  phone: string;
};

export function validateStaffEditFields(data: StaffEditFields): FieldValidation[] {
  const checks: FieldValidation[] = [];

  if (!data.first_name_ar.trim() && !data.first_name_en.trim()) {
    checks.push({ valid: false, key: 'nameRequired' });
  }

  if (data.first_name_ar.trim()) checks.push(validateArabicName(data.first_name_ar));
  if (data.last_name_ar.trim()) checks.push(validateArabicName(data.last_name_ar));
  if (data.first_name_en.trim()) checks.push(validateEnglishName(data.first_name_en));
  if (data.last_name_en.trim()) checks.push(validateEnglishName(data.last_name_en));
  if (data.phone.trim()) checks.push(validateEgyptianPhone(data.phone));

  return checks;
}

export function validateStaffEdit(
  data: StaffEditFields,
  t: (key: string, params?: Record<string, string | number>) => string,
): string | null {
  return firstError(validateStaffEditFields(data), t);
}
