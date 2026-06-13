import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Eye, FileText, Loader2, Printer } from 'lucide-react';
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
  | 'assign'
  | 'copy'
  | 'link'
  | 'default';

/** Always-visible tinted backgrounds — shared by table row actions across the admin module. */
export const adminActionVariantClass: Record<AdminActionVariant, string> = {
  view: 'bg-blue-50 text-blue-600 border border-blue-200/90 hover:bg-blue-100 hover:text-blue-700 hover:ring-1 hover:ring-blue-200',
  edit: 'bg-emerald-50 text-emerald-600 border border-emerald-200/90 hover:bg-emerald-100 hover:text-emerald-700 hover:ring-1 hover:ring-emerald-200',
  status: 'bg-amber-50 text-amber-700 border border-amber-200/90 hover:bg-amber-100 hover:text-amber-800 hover:ring-1 hover:ring-amber-200',
  delete: 'bg-red-50 text-red-600 border border-red-200/90 hover:bg-red-100 hover:text-red-700 hover:ring-1 hover:ring-red-200',
  approve: 'bg-emerald-50 text-emerald-700 border border-emerald-200/90 hover:bg-emerald-100 hover:text-emerald-800 hover:ring-1 hover:ring-emerald-200',
  print: 'bg-slate-100 text-slate-700 border border-slate-200/90 hover:bg-slate-200 hover:text-slate-900 hover:ring-1 hover:ring-slate-200',
  assign: 'bg-violet-50 text-violet-600 border border-violet-200/90 hover:bg-violet-100 hover:text-violet-700 hover:ring-1 hover:ring-violet-200',
  copy: 'bg-indigo-50 text-indigo-600 border border-indigo-200/90 hover:bg-indigo-100 hover:text-indigo-700 hover:ring-1 hover:ring-indigo-200',
  link: 'bg-sky-50 text-sky-600 border border-sky-200/90 hover:bg-sky-100 hover:text-sky-700 hover:ring-1 hover:ring-sky-200',
  default: 'bg-indigo-50 text-indigo-600 border border-indigo-200/90 hover:bg-indigo-100 hover:text-indigo-700 hover:ring-1 hover:ring-indigo-200',
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

/** Print membership application form (استمارة عضوية). */
export function AdminPrintFormButton({
  tooltip,
  onClick,
  loading,
  disabled,
}: {
  tooltip: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <AdminActionButton
      tooltip={tooltip}
      onClick={onClick}
      icon={FileText}
      variant="copy"
      loading={loading}
      disabled={disabled}
    />
  );
}

/** Print member card — opens shared card print preview dialog. */
export function AdminPrintCardButton({
  tooltip,
  onClick,
  loading,
  disabled,
}: {
  tooltip: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  return (
    <AdminActionButton
      tooltip={tooltip}
      onClick={onClick}
      icon={Printer}
      variant="print"
      loading={loading}
      disabled={disabled}
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
          className={`admin-row-action-btn h-10 w-10 cursor-pointer transition-all duration-150 hover:scale-110 active:scale-95 [&_svg]:!size-[17px] ${adminActionVariantClass[variant]}`}
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
