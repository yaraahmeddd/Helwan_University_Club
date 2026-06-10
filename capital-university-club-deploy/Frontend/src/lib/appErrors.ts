import type { ZodError } from 'zod';

export const APP_ERROR_EVENT = 'app:error';

export type AppErrorDetail = {
  error: unknown;
  source?: string;
  silent?: boolean;
};

type ErrorTranslator = (key: string, params?: Record<string, string | number>) => string;

type ApiErrorLike = Error & {
  status?: number;
  responseData?: unknown;
  original?: unknown;
};

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null;

/** Dispatch a user-visible app error (picked up by GlobalErrorListener). */
export function reportAppError(error: unknown, source?: string, silent = false) {
  window.dispatchEvent(
    new CustomEvent<AppErrorDetail>(APP_ERROR_EVENT, {
      detail: { error, source, silent },
    }),
  );
}

/** Register window-level handlers so unhandled failures surface instead of crashing silently. */
export function registerGlobalErrorHandlers() {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('[App] Unhandled promise rejection:', event.reason);
    reportAppError(event.reason, 'unhandledrejection');
  });

  window.addEventListener('error', (event) => {
    if (event.error) {
      console.error('[App] Uncaught error:', event.error);
    }
  });
}

function readServerMessage(data: unknown): string | null {
  if (!isRecord(data)) return null;
  const msg = data.message ?? data.error;
  if (typeof msg === 'string' && msg.trim()) return msg.trim();
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    const first = data.errors[0];
    if (typeof first === 'string') return first;
    if (isRecord(first) && typeof first.message === 'string') return first.message;
  }
  return null;
}

export function isNetworkError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const err = error as ApiErrorLike;
  if (err.status) return false;
  const msg = String(err.message ?? '').toLowerCase();
  return msg.includes('network') || msg.includes('timeout') || msg.includes('failed to fetch');
}

/** Map API / network failures to a plain-language message. */
export function getApiErrorMessage(
  error: unknown,
  t: ErrorTranslator,
  fallback?: string,
): string {
  if (!error) return fallback ?? t('errors.unexpected');

  const err = error as ApiErrorLike;
  const serverMsg = readServerMessage(err.responseData);

  if (isNetworkError(error)) {
    return t('errors.network');
  }

  const status = err.status;
  if (status === 400) return serverMsg ?? t('errors.badRequest');
  if (status === 401) return serverMsg ?? t('errors.unauthorized');
  if (status === 403) return serverMsg ?? t('errors.forbidden');
  if (status === 404) return serverMsg ?? t('errors.notFound');
  if (status === 409) return serverMsg ?? t('errors.conflict');
  if (status === 422) return serverMsg ?? t('errors.validation');
  if (status === 429) return t('errors.tooManyRequests');
  if (status && status >= 500) return serverMsg ?? t('errors.server');

  if (typeof err.message === 'string' && err.message.trim() && err.message !== 'An unexpected error occurred') {
    return err.message.trim();
  }

  return serverMsg ?? fallback ?? t('errors.unexpected');
}

/** First message from a Zod validation result (schemas already embed localized text). */
export function getZodErrorMessage(error: ZodError): string {
  const first = error.issues[0];
  if (!first) return '';
  if (first.message) return first.message;
  const path = first.path.length > 0 ? first.path.join('.') : 'field';
  return `${path}: ${first.code}`;
}

/** First message from react-hook-form style nested errors. */
export function getFirstFieldError(errors: unknown): string | null {
  if (!errors || typeof errors !== 'object') return null;

  for (const value of Object.values(errors as Record<string, unknown>)) {
    if (!value) continue;
    if (typeof value === 'object' && value !== null && 'message' in value) {
      const msg = (value as { message?: unknown }).message;
      if (typeof msg === 'string' && msg.trim()) return msg.trim();
    }
    const nested = getFirstFieldError(value);
    if (nested) return nested;
  }
  return null;
}

export function getValidationSummary(
  errors: unknown,
  t: ErrorTranslator,
): string {
  const fieldMsg = getFirstFieldError(errors);
  if (fieldMsg) return fieldMsg;
  if (errors && typeof errors === 'object' && 'issues' in errors) {
    const zodMsg = getZodErrorMessage(errors as ZodError);
    if (zodMsg) return zodMsg;
  }
  return t('validation.missingFields');
}
