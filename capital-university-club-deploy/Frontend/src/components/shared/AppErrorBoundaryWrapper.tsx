import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { AppErrorBoundary } from './AppErrorBoundary';

type Props = {
  children: ReactNode;
  compact?: boolean;
};

/** Resets the error boundary when the route changes. */
export function AppErrorBoundaryWrapper({ children, compact }: Props) {
  const location = useLocation();
  return (
    <AppErrorBoundary resetKey={location.pathname} compact={compact}>
      {children}
    </AppErrorBoundary>
  );
}
