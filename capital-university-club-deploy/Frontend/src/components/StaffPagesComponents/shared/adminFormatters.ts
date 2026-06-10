import { useMemo } from 'react';
import { resolveDisplayLanguage, type DisplayLanguage } from '../../../lib/localizedDisplay';
import { useLanguage } from '../../../hooks/useLanguage';

function parseAdminDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** BCP-47 locale for admin date/time formatting (ar-EG / en-US). */
export function getAdminLocale(language?: string | null): string {
  return resolveDisplayLanguage(language) === 'en' ? 'en-US' : 'ar-EG';
}

/** Registration / join / birth dates in tables (date only, no time). */
export function formatAdminDate(iso: string | null | undefined, locale: string): string {
  const d = parseAdminDate(iso);
  if (!d) return '—';
  return d.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/** Time only (no date) — for timestamps and booking times from ISO values. */
export function formatAdminTime(iso: string | null | undefined, locale: string): string {
  const d = parseAdminDate(iso);
  if (!d) return '—';
  return d.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/** Locale-aware date + time for audit logs and timestamp columns. */
export function formatAdminDateTime(
  iso: string | null | undefined,
  locale: string,
): string {
  const d = parseAdminDate(iso);
  if (!d) return '—';
  return `${formatAdminDate(iso, locale)} ${formatAdminTime(iso, locale)}`;
}

/** Shared formatters bound to the current UI language. */
export function useAdminFormatters() {
  const { language } = useLanguage();
  const locale = useMemo(() => getAdminLocale(language), [language]);

  return useMemo(
    () => ({
      locale,
      language: language as DisplayLanguage,
      fmtDate: (iso?: string | null) => formatAdminDate(iso, locale),
      fmtTime: (iso?: string | null) => formatAdminTime(iso, locale),
      fmtDateTime: (iso?: string | null) => formatAdminDateTime(iso, locale),
    }),
    [locale, language],
  );
}
