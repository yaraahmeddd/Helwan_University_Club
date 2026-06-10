import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import i18n from '../../i18n';
import { normalizeAppLanguage } from '../../lib/normalizeLanguage';

type AppErrorBoundaryProps = {
  children: ReactNode;
  /** Changing this resets the boundary (e.g. route path). */
  resetKey?: string;
  /** Compact layout for nested dashboards. */
  compact?: boolean;
};

type AppErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

function t(key: string) {
  const lng = normalizeAppLanguage(i18n.resolvedLanguage ?? i18n.language);
  return i18n.getFixedT(lng, 'common')(key);
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[AppErrorBoundary]', error, info.componentStack);
  }

  componentDidUpdate(prevProps: AppErrorBoundaryProps) {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false, error: null });
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const lng = normalizeAppLanguage(i18n.resolvedLanguage ?? i18n.language);
    const isRTL = lng === 'ar';
    const compact = this.props.compact;

    return (
      <div
        className={
          compact
            ? 'flex flex-col items-center justify-center min-h-[320px] p-8 bg-background'
            : 'flex flex-col items-center justify-center min-h-[60vh] p-8 bg-background'
        }
        dir={isRTL ? 'rtl' : 'ltr'}
        lang={lng}
        role="alert"
      >
        <div className="max-w-md w-full rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden />
          </div>
          <h1 className="text-lg font-semibold text-foreground mb-2">{t('errors.boundaryTitle')}</h1>
          <p className="text-sm text-muted-foreground mb-4">{t('errors.boundaryDescription')}</p>
          {import.meta.env.DEV && this.state.error?.message && (
            <p className="text-xs font-mono text-destructive/80 mb-4 break-all text-start bg-background/60 rounded-md p-2 border border-border">
              {this.state.error.message}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              {t('errors.tryAgain')}
            </button>
            <button
              type="button"
              onClick={this.handleGoHome}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <Home className="h-4 w-4" />
              {t('errors.goHome')}
            </button>
          </div>
        </div>
      </div>
    );
  }
}
