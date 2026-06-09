import { cn } from '@/lib/utils';

/** Base admin text size (matches --admin-font-size in staffDashboard.css) */
export const ADMIN_TEXT = 'text-[15px]' as const;
export const ADMIN_ICON = 'w-[15px] h-[15px] shrink-0' as const;
export const ADMIN_ACTION_ICON = '!w-[17px] !h-[17px] shrink-0' as const;

/** View / edit dialogs — +50px vs max-w-3xl @ 88vh (see .admin-detail-dialog in CSS) */
export const adminDialogStyles = {
  content: 'admin-detail-dialog w-full p-0 overflow-hidden',
  panel: 'admin-detail-panel flex flex-col',
} as const;

/** Shared admin table styling — matches MemberManagementPage. */
export const adminTableStyles = {
  container:
    'flex-1 overflow-auto [&::-webkit-scrollbar]:hidden',
  /** Action button groups — horizontal, no wrapping */
  actions: 'inline-flex items-center justify-center gap-2 flex-nowrap',
  table: `w-full ${ADMIN_TEXT} leading-snug`,
  /** Shared icon size for admin table cells, badges, and row actions */
  icon: ADMIN_ICON,
  /** Row action column icons — slightly larger than badges */
  actionIcon: ADMIN_ACTION_ICON,
  /** Icon-only ghost buttons in action columns */
  iconAction:
    'inline-flex h-10 w-10 items-center justify-center rounded-md transition-colors text-muted-foreground hover:bg-muted hover:text-foreground',
  header: 'sticky top-0 bg-muted/70 backdrop-blur border-b border-border z-10',
  head: `px-4 py-2.5 ${ADMIN_TEXT} font-semibold text-muted-foreground whitespace-nowrap select-none align-middle`,
  headSortable: 'cursor-pointer hover:text-foreground',
  headCenter: 'text-center',
  headStart: 'text-start',
  body: 'divide-y divide-border',
  row: 'transition-colors hover:bg-muted/40 group',
  cell: `px-4 py-2.5 ${ADMIN_TEXT} align-middle !h-auto`,
  cellXs: `px-4 py-2.5 ${ADMIN_TEXT} align-middle !h-auto`,
  cellMuted: `px-4 py-2.5 ${ADMIN_TEXT} text-muted-foreground align-middle !h-auto`,
  /** Phone / numeric columns */
  cellPhone: `px-4 py-2.5 ${ADMIN_TEXT} tabular-nums align-middle !h-auto`,
  cellCenter: 'px-4 py-2.5 text-center align-middle !h-auto',
  skeletonRow: 'animate-pulse',
} as const;

export function adminHeadClass(options?: {
  sortable?: boolean;
  center?: boolean;
  className?: string;
}) {
  return cn(
    adminTableStyles.head,
    options?.sortable && adminTableStyles.headSortable,
    options?.center ? adminTableStyles.headCenter : adminTableStyles.headStart,
    options?.className,
  );
}

/** Page chrome outside tables — headers, toolbars, filters, pagination, stats */
export const adminPageStyles = {
  header: `px-6 py-4 border-b border-border bg-background shrink-0 ${ADMIN_TEXT}`,
  headerTitle: 'text-2xl font-bold tracking-tight flex items-center gap-2',
  headerMeta: `${ADMIN_TEXT} text-muted-foreground`,
  statChip:
    `inline-flex items-center gap-1.5 ${ADMIN_TEXT} px-2.5 py-1 rounded-full font-medium`,
  toolbar:
    `flex items-center gap-3 px-6 py-3 border-b border-border bg-muted/20 shrink-0 flex-wrap ${ADMIN_TEXT}`,
  toolbarSearch: `h-10 ${ADMIN_TEXT} ps-10`,
  toolbarTab:
    `flex items-center gap-1.5 px-3 py-2 rounded-md ${ADMIN_TEXT} font-medium transition-all`,
  toolbarSelect: `h-10 min-w-[9rem] ${ADMIN_TEXT} shrink-0`,
  toolbarFilterBtn:
    `flex items-center gap-1.5 h-10 px-3 rounded-md border ${ADMIN_TEXT} transition-colors`,
  toolbarResults: `inline-flex items-center ${ADMIN_TEXT} text-muted-foreground`,
  pagination:
    `flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/20 shrink-0 ${ADMIN_TEXT}`,
  paginationMeta: `${ADMIN_TEXT} text-muted-foreground`,
  paginationBtn: `h-10 px-4 ${ADMIN_TEXT}`,
  icon: ADMIN_ICON,
  refreshBtn:
    `flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors ${ADMIN_TEXT} text-muted-foreground disabled:opacity-40`,
} as const;

export function adminCellClass(options?: {
  size?: 'default' | 'xs' | 'muted' | 'phone';
  center?: boolean;
  className?: string;
}) {
  const base =
    options?.size === 'xs'
      ? adminTableStyles.cellXs
      : options?.size === 'muted'
        ? adminTableStyles.cellMuted
        : options?.size === 'phone'
          ? adminTableStyles.cellPhone
          : adminTableStyles.cell;
  return cn(base, options?.center && 'text-center', options?.className);
}
