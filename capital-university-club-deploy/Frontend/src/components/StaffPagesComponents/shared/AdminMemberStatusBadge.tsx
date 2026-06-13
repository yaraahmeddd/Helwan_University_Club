import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import {
  adminTableStatusBadgeClass,
  adminTableStyles,
} from './adminTableStyles';
import { getAdminStatusConfig } from './adminMemberStatus';

type AdminMemberStatusBadgeProps = {
  status: string;
  compact?: boolean;
  centered?: boolean;
  className?: string;
};

export function AdminMemberStatusBadge({
  status,
  compact = false,
  centered,
  className,
}: AdminMemberStatusBadgeProps) {
  const { t } = useTranslation('common');
  const cfg = getAdminStatusConfig(status);
  const Icon = cfg.icon;
  const shouldCenter = centered ?? compact;

  const badge = (
    <span
      className={cn(
        'inline-flex items-center justify-center gap-0.5 rounded-full font-semibold border',
        cfg.color,
        cfg.bg,
        cfg.border,
        compact ? adminTableStatusBadgeClass : 'px-2.5 py-0.5 text-[11px] gap-1',
        !shouldCenter && className,
      )}
    >
      <Icon className={compact ? 'w-4 h-4 shrink-0' : adminTableStyles.icon} />
      {t(cfg.labelKey, { defaultValue: status })}
    </span>
  );

  if (!shouldCenter) {
    return badge;
  }

  return (
    <div className={cn('flex w-full items-center justify-center', className)}>
      {badge}
    </div>
  );
}
