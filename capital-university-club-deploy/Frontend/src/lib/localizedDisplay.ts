import i18n from '../i18n';

export type DisplayLanguage = 'ar' | 'en';
export type BilingualFieldLocale = DisplayLanguage;

/** Font family for locale-appropriate name display (Cairo for Arabic UI). */
export function localeFontFamily(language: DisplayLanguage): string {
  return language === 'ar'
    ? "'Cairo', sans-serif"
    : "'Segoe UI', system-ui, sans-serif";
}

/**
 * Placeholder for bilingual form fields: always in the field's writing language
 * (Arabic inputs → Arabic hint, English inputs → English hint), regardless of UI language.
 */
export function getBilingualFieldPlaceholder(
  fieldLocale: BilingualFieldLocale,
  namespace: string,
  key: string,
): string {
  return i18n.getFixedT(fieldLocale, namespace)(key);
}

/**
 * Text in the UI's language only — no cross-language fallback (bilingual field labels/names).
 */
export function getLanguageOnlyText(
  ar: string | undefined | null,
  en: string | undefined | null,
  language: DisplayLanguage,
): string {
  return language === 'ar' ? (ar ?? '').trim() : (en ?? '').trim();
}

/** Normalize i18n language codes (e.g. "ar-EG") to a supported display language. */
export function resolveDisplayLanguage(language?: string | null): DisplayLanguage {
  const code = (language ?? 'ar').split('-')[0].toLowerCase();
  return code === 'en' ? 'en' : 'ar';
}

/**
 * Primary localized text.
 * Arabic UI: Arabic first, English fallback.
 * English UI: English first, Arabic fallback (so names always display).
 */
export function getLocalizedText(
  ar: string | undefined | null,
  en: string | undefined | null,
  language: DisplayLanguage,
): string {
  const arTrim = (ar ?? '').trim();
  const enTrim = (en ?? '').trim();
  if (language === 'ar') return arTrim || enTrim;
  return enTrim || arTrim;
}

/**
 * Secondary subtitle — suppressed in admin UI (Arabic shows Arabic only).
 */
export function getSecondaryText(
  _ar: string | undefined | null,
  _en: string | undefined | null,
  _language: DisplayLanguage,
): string | null {
  return null;
}

export type PersonNameFields = {
  firstNameAr?: string | null;
  lastNameAr?: string | null;
  firstNameEn?: string | null;
  lastNameEn?: string | null;
};

export function buildPersonName(
  parts: PersonNameFields,
  language: DisplayLanguage,
): { primary: string; secondary: string | null; ar: string; en: string } {
  const ar = `${parts.firstNameAr ?? ''} ${parts.lastNameAr ?? ''}`.trim();
  const en = `${parts.firstNameEn ?? ''} ${parts.lastNameEn ?? ''}`.trim();
  return {
    ar,
    en,
    primary: getLocalizedText(ar, en, language),
    secondary: getSecondaryText(ar, en, language),
  };
}

export type EntityNameFields = {
  name_ar?: string | null;
  name_en?: string | null;
};

export function getEntityName(
  entity: EntityNameFields | null | undefined,
  language: DisplayLanguage,
): string {
  if (!entity) return '';
  return getLocalizedText(entity.name_ar, entity.name_en, language);
}

export function getEntityNamePair(
  entity: EntityNameFields | null | undefined,
  language: DisplayLanguage,
): { primary: string; secondary: string | null } {
  if (!entity) return { primary: '', secondary: null };
  const ar = (entity.name_ar ?? '').trim();
  const en = (entity.name_en ?? '').trim();
  return {
    primary: getLocalizedText(ar, en, language),
    secondary: getSecondaryText(ar, en, language),
  };
}

/** Initials for avatar badges — prefers the primary display language. */
export function getNameInitials(
  ar: string | undefined | null,
  en: string | undefined | null,
  language: DisplayLanguage,
): string {
  const source = language === 'ar' ? ((ar ?? '').trim() || (en ?? '').trim()) : (en ?? '').trim();
  if (!source) return '?';
  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}
