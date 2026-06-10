import { useCallback } from 'react';
import type { ZodError } from 'zod';
import {
  getApiErrorMessage,
  getFirstFieldError,
  getValidationSummary,
  getZodErrorMessage,
} from '../lib/appErrors';
import { useLocalizedTranslation } from './useLocalizedTranslation';
import { useToast } from './use-toast';

/**
 * Shared helpers for forms and pages — shows plain-language toasts instead of crashing.
 */
export function useAppErrorHandler() {
  const { t } = useLocalizedTranslation('common');
  const { t: tVal } = useLocalizedTranslation('validation');
  const { toast } = useToast();

  const showError = useCallback(
    (message: string, title?: string) => {
      toast({
        title: title ?? t('errors.title'),
        description: message,
        variant: 'destructive',
      });
    },
    [toast, t],
  );

  const showSuccess = useCallback(
    (message: string, title?: string) => {
      toast({
        title: title ?? t('success'),
        description: message,
      });
    },
    [toast, t],
  );

  const handleApiError = useCallback(
    (error: unknown, fallback?: string) => {
      const message = getApiErrorMessage(error, t, fallback);
      showError(message);
      return message;
    },
    [showError, t],
  );

  const handleZodError = useCallback(
    (error: ZodError) => {
      const message = getZodErrorMessage(error) || t('validation.missingFields');
      showError(message, t('errors.validationTitle'));
      return message;
    },
    [showError, t],
  );

  const handleFormErrors = useCallback(
    (errors: unknown) => {
      const message = getValidationSummary(errors, t);
      showError(message, t('errors.validationTitle'));
      return message;
    },
    [showError, t],
  );

  const resolveFieldError = useCallback(
    (errors: unknown, field: string): string | null => {
      if (!errors || typeof errors !== 'object') return null;
      const fieldErr = (errors as Record<string, unknown>)[field];
      if (fieldErr && typeof fieldErr === 'object' && fieldErr !== null && 'message' in fieldErr) {
        const msg = (fieldErr as { message?: unknown }).message;
        if (typeof msg === 'string' && msg.trim()) return msg.trim();
      }
      return getFirstFieldError(fieldErr);
    },
    [],
  );

  const resolveValidation = useCallback(
    (key: string, params?: Record<string, string | number>) => tVal(key, params),
    [tVal],
  );

  return {
    showError,
    showSuccess,
    handleApiError,
    handleZodError,
    handleFormErrors,
    resolveFieldError,
    resolveValidation,
    getApiErrorMessage: (error: unknown, fallback?: string) => getApiErrorMessage(error, t, fallback),
  };
}
