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
  className?: string;
};

export function AdminMemberStatusBadge({
  status,
  compact = false,
  className,
}: AdminMemberStatusBadgeProps) {
  const { t } = useTranslation('common');
  const cfg = getAdminStatusConfig(status);
  const Icon = cfg.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full font-semibold border',
        cfg.color,
        cfg.bg,
        cfg.border,
        compact ? adminTableStatusBadgeClass : 'px-3 py-1 text-[15px] gap-1',
        className,
      )}
    >
      <Icon className={compact ? 'w-[11px] h-[11px] shrink-0' : adminTableStyles.icon} />
      {t(cfg.labelKey, { defaultValue: status })}
    </span>
  );
}
