/** Normalize any i18n/browser locale to the app's supported language keys. */
export function normalizeAppLanguage(lng?: string | null): 'ar' | 'en' {
  const base = (lng ?? 'ar').split('-')[0].toLowerCase();
  return base === 'en' ? 'en' : 'ar';
}
