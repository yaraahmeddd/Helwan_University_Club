import { AlertCircle, X } from 'lucide-react';
import { useLocalizedTranslation } from '../../hooks/useLocalizedTranslation';

type FormErrorAlertProps = {
  message?: string | null;
  title?: string;
  onDismiss?: () => void;
  className?: string;
};

/** Inline banner for form-level validation or submit errors. */
export function FormErrorAlert({
  message,
  title,
  onDismiss,
  className = '',
}: FormErrorAlertProps) {
  const { t, isRTL } = useLocalizedTranslation('common');

  if (!message?.trim()) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm ${className}`}
    >
      <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" aria-hidden />
      <div className="min-w-0 flex-1 text-start">
        <p className="font-semibold text-destructive">{title ?? t('errors.validationTitle')}</p>
        <p className="text-destructive/90 mt-0.5 break-words">{message}</p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-md p-1 text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors"
          aria-label={t('close')}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
