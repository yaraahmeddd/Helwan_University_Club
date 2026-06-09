import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Eye, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../ui/tooltip';
import { adminTableStyles } from './adminTableStyles';

export type AdminActionVariant =
  | 'view'
  | 'edit'
  | 'status'
  | 'delete'
  | 'approve'
  | 'print'
  | 'default';

const variantClass: Record<AdminActionVariant, string> = {
  view: 'text-blue-600 hover:bg-blue-50 hover:text-blue-600',
  edit: 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-600',
  status: 'text-amber-600 hover:bg-amber-50 hover:text-amber-600',
  delete: 'text-red-600 hover:bg-red-50 hover:text-red-600',
  approve: 'text-emerald-700 hover:bg-emerald-50 hover:text-emerald-700',
  print: 'text-slate-600 hover:bg-muted hover:text-foreground',
  default: 'text-muted-foreground hover:bg-muted hover:text-foreground',
};

/** Eye icon view button — matches Member/Registration management tables. */
export function AdminViewButton({
  tooltip,
  onClick,
}: {
  tooltip: string;
  onClick: () => void;
}) {
  return (
    <AdminActionButton
      tooltip={tooltip}
      onClick={onClick}
      icon={Eye}
      variant="view"
    />
  );
}

/** Single inline icon action with tooltip — all row actions visible (no overflow menu). */
export function AdminActionButton({
  tooltip,
  onClick,
  icon: Icon,
  variant = 'default',
  disabled,
  loading,
}: {
  tooltip: string;
  onClick: () => void;
  icon: LucideIcon;
  variant?: AdminActionVariant;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`h-10 w-10 [&_svg]:!size-[17px] ${variantClass[variant]}`}
          onClick={onClick}
          disabled={disabled || loading}
        >
          {loading ? (
            <Loader2 className={`${adminTableStyles.actionIcon} animate-spin`} />
          ) : (
            <Icon className={adminTableStyles.actionIcon} />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

/** Standard admin row actions container — place all action buttons as children. */
export function AdminRowActions({ children }: { children: React.ReactNode }) {
  return <div className={adminTableStyles.actions}>{children}</div>;
}
