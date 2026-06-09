function parseAdminDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Registration / join date only (no time). */
export function formatAdminDate(iso: string | null | undefined, locale: string): string {
  const d = parseAdminDate(iso);
  if (!d) return iso ? String(iso) : '—';
  return d.toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/** Registration time only (no date). */
export function formatAdminTime(iso: string | null | undefined, locale: string): string {
  const d = parseAdminDate(iso);
  if (!d) return iso ? String(iso) : '—';
  return d.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/** Locale-aware date + time for admin detail views (date before time). */
export function formatAdminDateTime(
  iso: string | null | undefined,
  locale: string,
): string {
  const d = parseAdminDate(iso);
  if (!d) return iso ? String(iso) : '—';
  return `${formatAdminDate(iso, locale)} ${formatAdminTime(iso, locale)}`;
}
