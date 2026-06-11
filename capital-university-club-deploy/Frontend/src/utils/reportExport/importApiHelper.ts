/** Extract a user-facing message from axios/API errors during bulk import. */
export function getApiErrorMessage(err: unknown, fallback = 'Import failed'): string {
  const e = err as { responseData?: { error?: string; message?: string }; message?: string };
  return e?.responseData?.error || e?.responseData?.message || e?.message || fallback;
}
