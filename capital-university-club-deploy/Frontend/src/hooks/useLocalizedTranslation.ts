import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from './useLanguage';

/**
 * Like useTranslation, but every t() call is pinned to the active UI language.
 */
export function useLocalizedTranslation(ns?: string | string[]) {
  const translation = useTranslation(ns);
  const { language, isRTL } = useLanguage();

  const t = useCallback(
    (key: string, options?: Record<string, unknown>) =>
      translation.t(key, { ...options, lng: language }),
    [translation.t, language],
  );

  return { t, i18n: translation.i18n, language, isRTL, ready: translation.ready };
}
