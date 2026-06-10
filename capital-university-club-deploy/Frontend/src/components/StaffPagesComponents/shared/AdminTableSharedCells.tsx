import type { ReactNode } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { adminTableStatusBadgeClass } from './adminTableStyles';

/** Monospace code chip — shared across branches, faculties, professions, etc. */
export function AdminTableCodeChip({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      dir="ltr"
      className={cn(
        'inline-flex items-center text-[11px] font-mono font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border',
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Yes / No pill — same size, font, and shape as AdminMemberStatusBadge compact. */
export function AdminTableYesNoBadge({
  value,
  yesLabel,
  noLabel,
  centered = true,
  className,
}: {
  value: boolean;
  yesLabel: string;
  noLabel: string;
  centered?: boolean;
  className?: string;
}) {
  const badge = value ? (
    <span
      className={cn(
        'inline-flex items-center justify-center gap-0.5 rounded-full font-semibold border',
        adminTableStatusBadgeClass,
        'text-emerald-700 bg-emerald-50 border-emerald-200',
        !centered && className,
      )}
    >
      <Check className="w-4 h-4 shrink-0" />
      {yesLabel}
    </span>
  ) : (
    <span
      className={cn(
        'inline-flex items-center justify-center gap-0.5 rounded-full font-semibold border',
        adminTableStatusBadgeClass,
        'text-rose-700 bg-rose-50 border-rose-200',
        !centered && className,
      )}
    >
      <X className="w-4 h-4 shrink-0" />
      {noLabel}
    </span>
  );

  if (!centered) {
    return badge;
  }

  return (
    <div className={cn('flex w-full items-center justify-center', className)}>
      {badge}
    </div>
  );
}
