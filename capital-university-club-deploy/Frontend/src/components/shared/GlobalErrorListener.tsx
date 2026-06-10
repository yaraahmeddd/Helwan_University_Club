import { useEffect } from 'react';
import { APP_ERROR_EVENT, getApiErrorMessage, type AppErrorDetail } from '../../lib/appErrors';
import { useLocalizedTranslation } from '../../hooks/useLocalizedTranslation';
import { useToast } from '../../hooks/use-toast';

/** Shows a toast for unhandled app errors (e.g. unhandled promise rejections). */
export function GlobalErrorListener() {
  const { t } = useLocalizedTranslation('common');
  const { toast } = useToast();

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<AppErrorDetail>).detail;
      if (!detail || detail.silent) return;

      const message = getApiErrorMessage(detail.error, t);
      toast({
        title: t('errors.title'),
        description: message,
        variant: 'destructive',
      });
    };

    window.addEventListener(APP_ERROR_EVENT, handler);
    return () => window.removeEventListener(APP_ERROR_EVENT, handler);
  }, [toast, t]);

  return null;
}
