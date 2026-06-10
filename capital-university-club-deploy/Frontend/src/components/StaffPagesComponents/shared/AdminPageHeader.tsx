import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { adminPageStyles } from './adminTableStyles';

export type AdminPageHeaderProps = {
  icon: LucideIcon;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function AdminPageHeader({
  icon: Icon,
  title,
  subtitle,
  actions,
  className,
}: AdminPageHeaderProps) {
  return (
    <div className={cn(adminPageStyles.header, className)}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h1 className={cn(adminPageStyles.headerTitle, 'font-bold text-foreground')}>
            <Icon className="w-6 h-6 text-primary shrink-0" aria-hidden />
            <span>{title}</span>
          </h1>
          {subtitle != null ? (
            <div className={cn('mt-0.5', adminPageStyles.headerMeta)}>{subtitle}</div>
          ) : null}
        </div>
        {actions ? (
          <div className="flex items-center gap-2 shrink-0 flex-wrap">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}
