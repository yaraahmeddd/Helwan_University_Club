import React from 'react';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProfileAvatar } from './ProfileAvatar';

/** Tab bar — matches Registration review dialog. */
export function RecordViewTabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { key: T; label: string }[];
  active: T;
  onChange: (key: T) => void;
}) {
  return (
    <div className="flex gap-0 border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={cn(
            'px-5 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-px whitespace-nowrap',
            active === tab.key
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

/** Grouped card section with icon header. */
export function RecordViewSection({
  icon: Icon,
  title,
  children,
  variant = 'default',
  className,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  variant?: 'default' | 'accent';
  className?: string;
}) {
  const accent = variant === 'accent';
  return (
    <div
      className={cn(
        'rounded-xl shadow-sm overflow-hidden border',
        accent ? 'bg-primary/5 border-primary/20' : 'bg-card border-border',
        className,
      )}
    >
      <div
        className={cn(
          'px-4 py-3 border-b flex items-center gap-2',
          accent ? 'bg-primary/10 border-primary/10' : 'bg-muted/40 border-border',
        )}
      >
        <Icon className={cn('w-4 h-4', accent ? 'text-primary' : 'text-primary')} />
        <h4 className={cn('font-semibold text-sm', accent && 'text-primary')}>{title}</h4>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

/** Label + editable control inside a section grid (edit mode). */
export function RecordViewEditableField({
  icon: Icon,
  label,
  children,
  className,
  hidden,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
  className?: string;
  hidden?: boolean;
}) {
  if (hidden) return null;

  return (
    <div className={cn('space-y-1.5', className)}>
      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 shrink-0" />
        {label}
      </p>
      {children}
    </div>
  );
}

/** Label + value field row inside a section grid. */
export function RecordViewField({
  icon: Icon,
  label,
  value,
  ltr = false,
  fallback = '—',
}: {
  icon: React.ElementType;
  label: string;
  value?: React.ReactNode;
  ltr?: boolean;
  fallback?: string;
}) {
  const display =
    value === undefined || value === null || value === '' ? (
      <span className="text-muted-foreground/50 font-normal">{fallback}</span>
    ) : (
      value
    );

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 shrink-0" />
        {label}
      </p>
      <div
        className="text-sm font-semibold leading-snug break-words"
        dir={ltr ? 'ltr' : undefined}
      >
        {display}
      </div>
    </div>
  );
}

/** Profile header block — photo, name, optional subtitle, badge row. */
export function RecordViewProfileHeader({
  photoUrl,
  photoAlt,
  name,
  subtitle,
  badges,
}: {
  photoUrl?: string | null;
  photoAlt?: string;
  name: string;
  subtitle?: string | null;
  badges?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 p-4 bg-muted/40 rounded-xl">
      <ProfileAvatar photoUrl={photoUrl} alt={photoAlt} size="xl" rounded="xl" />
      <div className="flex-1 min-w-0 space-y-1">
        <h3 className="text-xl font-bold leading-tight truncate">{name || '—'}</h3>
        {subtitle && (
          <p className="text-xs text-muted-foreground truncate" dir="ltr">
            {subtitle}
          </p>
        )}
        {badges && <div className="flex flex-wrap gap-2 mt-1">{badges}</div>}
      </div>
    </div>
  );
}

/** Empty document / photo placeholder. */
export function RecordViewDocPlaceholder({
  label,
  className,
  large = false,
}: {
  label: string;
  className?: string;
  large?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/10 flex flex-col items-center justify-center gap-2 text-muted-foreground',
        large ? 'h-48 w-36' : 'p-4 w-full',
        className,
      )}
    >
      <FileText className={cn('opacity-40', large ? 'h-8 w-8' : 'h-7 w-7')} />
      <span className="text-xs text-center px-2">{label}</span>
    </div>
  );
}
