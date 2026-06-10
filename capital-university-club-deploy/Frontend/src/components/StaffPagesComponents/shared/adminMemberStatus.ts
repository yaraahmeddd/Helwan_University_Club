import {
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

export type AdminMemberStatusConfig = {
  labelKey: string;
  color: string;
  bg: string;
  border: string;
  icon: LucideIcon;
};

/** Canonical member status labels and colors — matches MemberManagementPage. */
export const ADMIN_MEMBER_STATUS_CONFIG: Record<string, AdminMemberStatusConfig> = {
  active: {
    labelKey: 'memberStatus.active',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: CheckCircle,
  },
  suspended: {
    labelKey: 'memberStatus.suspended',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: Clock,
  },
  banned: {
    labelKey: 'memberStatus.banned',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: XCircle,
  },
  expired: {
    labelKey: 'memberStatus.expired',
    color: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    icon: AlertTriangle,
  },
  cancelled: {
    labelKey: 'memberStatus.cancelled',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    icon: XCircle,
  },
  pending: {
    labelKey: 'memberStatus.pending',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: Clock,
  },
};

/** Sport-module entity statuses — same palette as member management. */
export const ADMIN_ENTITY_STATUS_CONFIG: Record<string, AdminMemberStatusConfig> = {
  approved: ADMIN_MEMBER_STATUS_CONFIG.active,
  confirmed: {
    labelKey: 'entityStatus.confirmed',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: CheckCircle,
  },
  completed: {
    labelKey: 'entityStatus.completed',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: CheckCircle,
  },
  payment_completed: {
    labelKey: 'entityStatus.payment_completed',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: CheckCircle,
  },
  rejected: {
    labelKey: 'entityStatus.rejected',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: XCircle,
  },
  blocked: {
    labelKey: 'entityStatus.blocked',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: XCircle,
  },
  inactive: {
    labelKey: 'entityStatus.inactive',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    icon: XCircle,
  },
  archived: {
    labelKey: 'entityStatus.archived',
    color: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    icon: AlertTriangle,
  },
  maintenance: {
    labelKey: 'entityStatus.maintenance',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: Clock,
  },
  draft: {
    labelKey: 'entityStatus.draft',
    color: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    icon: AlertTriangle,
  },
  pending_payment: ADMIN_MEMBER_STATUS_CONFIG.pending,
  in_progress: ADMIN_MEMBER_STATUS_CONFIG.pending,
};

export function getAdminMemberStatusConfig(status: string): AdminMemberStatusConfig {
  return getAdminStatusConfig(status);
}

export function getAdminStatusConfig(status: string): AdminMemberStatusConfig {
  return (
    ADMIN_MEMBER_STATUS_CONFIG[status] ??
    ADMIN_ENTITY_STATUS_CONFIG[status] ?? {
      labelKey: `memberStatus.${status}`,
      color: 'text-muted-foreground',
      bg: 'bg-muted',
      border: 'border-muted',
      icon: Clock,
    }
  );
}

export function getAdminStatusClassName(status: string): string {
  const cfg = getAdminStatusConfig(status);
  return `${cfg.bg} ${cfg.color} ${cfg.border}`;
}
