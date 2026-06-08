import { UserX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LoadingState } from '../../shared/LoadingState';

type AdminTableStatesProps = {
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  emptyTitle?: string;
  icon?: React.ReactNode;
};

export function AdminTableLoading() {
  return <LoadingState namespace="common" messageKey="loading" />;
}

export function AdminTableEmpty({
  message,
  title,
  icon,
}: {
  message?: string;
  title?: string;
  icon?: React.ReactNode;
}) {
  const { t } = useTranslation('common');
  return (
    <div className="py-20 text-center text-muted-foreground">
      <div className="rounded-full bg-muted/30 p-6 mb-4 w-fit mx-auto">
        {icon ?? <UserX className="h-12 w-12 text-muted-foreground/50" />}
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">
        {title ?? t('table.noData')}
      </h3>
      <p className="text-sm">{message ?? t('table.noDataDesc')}</p>
    </div>
  );
}

export function AdminTableStates({
  isLoading,
  isEmpty,
  emptyMessage,
  emptyTitle,
  icon,
}: AdminTableStatesProps) {
  if (isLoading) return <AdminTableLoading />;
  if (isEmpty) {
    return (
      <AdminTableEmpty
        message={emptyMessage}
        title={emptyTitle}
        icon={icon}
      />
    );
  }
  return null;
}
