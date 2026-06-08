import { Loader2 } from 'lucide-react';
import { useLocalizedTranslation } from '../../hooks/useLocalizedTranslation';

type LoadingStateProps = {
  /** Override translated message */
  message?: string;
  /** i18n key within namespace (default: "loading") */
  messageKey?: string;
  /** i18n namespace (default: "common") */
  namespace?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullScreen?: boolean;
};

const sizeClass = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
} as const;

/**
 * Localized loading spinner — English shows "Loading...", Arabic shows "جارٍ التحميل...".
 */
export function LoadingState({
  message,
  messageKey = 'loading',
  namespace = 'common',
  size = 'md',
  className = '',
  fullScreen = false,
}: LoadingStateProps) {
  const { t, language, isRTL } = useLocalizedTranslation(namespace);
  const text = message ?? t(messageKey);

  const wrapperClass = fullScreen
    ? 'flex flex-col items-center justify-center min-h-screen gap-4 bg-background'
    : `py-20 text-center text-muted-foreground ${className}`;

  return (
    <div
      className={wrapperClass}
      dir={isRTL ? 'rtl' : 'ltr'}
      lang={language}
      role="status"
      aria-live="polite"
      aria-label={text}
    >
      <Loader2
        className={`${sizeClass[size]} animate-spin text-primary ${fullScreen ? '' : 'mx-auto mb-3'}`}
        aria-hidden
      />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
