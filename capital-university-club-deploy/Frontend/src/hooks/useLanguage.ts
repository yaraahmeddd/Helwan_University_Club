import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export function useLanguage() {
  const { i18n } = useTranslation();

  // resolvedLanguage is the actual matched resource key ("ar" / "en"),
  // whereas i18n.language can be a raw browser locale like "ar-EG".
  const language = (i18n.resolvedLanguage ?? i18n.language ?? 'ar') as 'ar' | 'en';
  const isRTL = language === 'ar';

  const applyToDocument = useCallback((lang: string) => {
    const rtl = lang === 'ar';
    document.dir = rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    localStorage.setItem('dashboard-lang', lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    const next = language === 'ar' ? 'en' : 'ar';
    // Await changeLanguage so localStorage is written only after i18n is ready.
    void i18n.changeLanguage(next).then(() => applyToDocument(next));
  }, [language, i18n, applyToDocument]);

  return { language, isRTL, toggleLanguage };
}
