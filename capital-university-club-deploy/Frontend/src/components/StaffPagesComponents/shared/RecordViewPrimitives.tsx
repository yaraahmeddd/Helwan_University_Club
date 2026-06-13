import React from 'react';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProfileAvatar } from './ProfileAvatar';
import { adminFontClass } from './adminTableStyles';

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
            'admin-record-tab px-5 py-2.5 text-sm transition-all duration-150 border-b-2 -mb-px whitespace-nowrap cursor-pointer',
            adminFontClass.ui,
            active === tab.key
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/40',
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
        <h4 className={cn('text-sm', adminFontClass.section, accent && 'text-primary')}>{title}</h4>
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
      <p className={cn('text-muted-foreground flex items-center gap-1.5', adminFontClass.label)}>
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
  alignEnd = false,
  fallback = '—',
  className,
}: {
  icon: React.ElementType;
  label: string;
  value?: React.ReactNode;
  ltr?: boolean;
  /** Right-align LTR values (phone, national ID) in RTL layouts */
  alignEnd?: boolean;
  fallback?: string;
  className?: string;
}) {
  const display =
    value === undefined || value === null || value === '' ? (
      <span className="text-muted-foreground/50 font-normal">{fallback}</span>
    ) : (
      value
    );

  return (
    <div className={cn('space-y-1', className)}>
      <p className={cn('text-muted-foreground flex items-center gap-1.5', adminFontClass.label)}>
        <Icon className="w-3.5 h-3.5 shrink-0" />
        {label}
      </p>
      <div
        className={cn(
          adminFontClass.value,
          'break-words',
          ltr && 'tabular-nums',
          alignEnd && 'text-end w-full',
        )}
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
    <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl">
      <ProfileAvatar photoUrl={photoUrl} alt={photoAlt} size="xl" rounded="xl" />
      <div className="flex-1 min-w-0 space-y-1">
        <h3 className={cn('text-[15px] font-semibold leading-tight truncate', adminFontClass.heading)}>{name || '—'}</h3>
        {subtitle && (
          <p className="text-[11px] text-muted-foreground truncate" dir="ltr">
            {subtitle}
          </p>
        )}
        {badges && <div className="flex flex-wrap items-center gap-1.5 mt-0.5">{badges}</div>}
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
