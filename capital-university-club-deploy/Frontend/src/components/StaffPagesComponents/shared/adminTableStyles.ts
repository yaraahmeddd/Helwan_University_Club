import { cn } from '@/lib/utils';

/** Base admin text size (matches --admin-font-size in staffDashboard.css) */
/** Fonts: heading = Cairo/Plus Jakarta Sans · body/tables = IBM Plex Sans Arabic/Inter */
export const ADMIN_TEXT = 'text-sm' as const;
export const ADMIN_ICON = 'w-[13px] h-[13px] shrink-0' as const;
export const ADMIN_ACTION_ICON = '!w-[13px] !h-[13px] shrink-0' as const;
export const ADMIN_PAGE_SIZE = 10;

/** Semantic font roles — pair with CSS vars in staffDashboard.css */
export const adminFontClass = {
  heading: 'admin-font-heading',
  section: 'admin-font-section',
  label: 'admin-font-label',
  value: 'admin-font-value',
  tableHead: 'admin-font-table-head',
  tableCell: 'admin-font-table-cell',
  ui: 'admin-font-ui',
} as const;

/** Member type pills in admin tables */
export const adminTableBadgeClass =
  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[13px] font-semibold leading-tight whitespace-nowrap';

/** Status pills — slightly smaller than type badges */
export const adminTableStatusBadgeClass =
  'admin-table-status-badge inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-full font-semibold leading-none whitespace-nowrap';

/** View / edit dialogs — +50px vs max-w-3xl @ 88vh (see .admin-detail-dialog in CSS) */
export const adminDialogStyles = {
  content: 'admin-detail-dialog w-full p-0 overflow-hidden',
  panel: 'admin-detail-panel flex flex-col',
} as const;

/** Shared admin table styling — matches MemberManagementPage. */
export const adminTableStyles = {
  /** White table shell with scroll when content overflows */
  shell:
    'flex-1 overflow-hidden border-t border-border bg-white flex flex-col min-h-0',
  container:
    'flex-1 overflow-auto bg-white [&::-webkit-scrollbar]:thin',
  /** Action button groups — horizontal, no wrapping */
  actions: 'inline-flex items-center justify-center gap-2 flex-nowrap',
  table: `w-full ${ADMIN_TEXT} leading-snug [font-family:var(--admin-font-body)]`,
  /** Shared icon size for admin table cells, badges, and row actions */
  icon: ADMIN_ICON,
  /** Row action column icons — slightly larger than badges */
  actionIcon: ADMIN_ACTION_ICON,
  /** Icon-only ghost buttons in action columns — prefer AdminActionButton with a colored variant */
  iconAction:
    'admin-row-action-btn inline-flex h-10 w-10 items-center justify-center rounded-md cursor-pointer transition-all duration-150 bg-blue-50 text-blue-600 border border-blue-200/90 hover:bg-blue-100 hover:scale-105 active:scale-95',
  header: 'sticky top-0 bg-white border-b border-border z-10',
  head: `px-4 py-2 ${adminFontClass.tableHead} text-muted-foreground whitespace-nowrap select-none align-middle`,
  headSortable: 'admin-head-sortable cursor-pointer hover:text-foreground hover:bg-muted/60',
  headCenter: 'text-center',
  headStart: 'text-start',
  body: 'divide-y divide-border',
  row: 'transition-colors hover:bg-muted/20 group bg-white',
  cell: `px-4 py-1.5 ${adminFontClass.tableCell} align-middle !h-auto`,
  cellXs: `px-4 py-1.5 ${adminFontClass.tableCell} align-middle !h-auto`,
  cellMuted: `px-4 py-1.5 ${adminFontClass.tableCell} text-muted-foreground align-middle !h-auto`,
  /** Phone & national ID — shared compact numeric styling */
  cellPhone: 'px-4 py-1.5 admin-cell-phone align-middle !h-auto',
  cellNationalId: 'px-4 py-1.5 admin-cell-national-id align-middle !h-auto',
  cellCenter: 'px-4 py-1.5 text-center align-middle !h-auto',
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
  header: `px-6 py-4 border-b border-border bg-background shrink-0 ${ADMIN_TEXT} ${adminFontClass.ui}`,
  headerTitle: `text-2xl tracking-tight flex items-center gap-2 ${adminFontClass.heading}`,
  headerMeta: `${ADMIN_TEXT} text-muted-foreground ${adminFontClass.ui}`,
  statChip:
    `inline-flex items-center gap-1.5 ${ADMIN_TEXT} px-2.5 py-1 rounded-full font-medium`,
  toolbar:
    `flex items-center gap-3 px-6 py-3 border-b border-border bg-muted/20 shrink-0 flex-wrap ${ADMIN_TEXT} ${adminFontClass.ui}`,
  /** Search icon — use with toolbarSearch; `start-3` keeps icon on the correct side in RTL/LTR */
  toolbarSearchIcon: `absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none shrink-0`,
  toolbarSearch: `h-10 ${ADMIN_TEXT} ps-10 pe-3`,
  toolbarTabGroup:
    'inline-flex items-stretch gap-1.5 p-1 rounded-xl border border-border bg-muted/40 shrink-0',
  toolbarTab:
    `admin-toolbar-tab flex items-center justify-center gap-2 px-4 py-2 rounded-lg min-w-[7.5rem] ${ADMIN_TEXT} font-semibold cursor-pointer transition-all duration-150`,
  toolbarTabActive: 'bg-background text-foreground shadow-sm border border-border',
  toolbarTabInactive: 'text-muted-foreground hover:text-foreground hover:bg-background/70 hover:shadow-sm',
  toolbarSelect: `h-10 min-w-[9rem] ${ADMIN_TEXT} shrink-0 cursor-pointer`,
  toolbarFilterBtn:
    `admin-filter-btn flex items-center gap-1.5 h-10 px-3 rounded-md border ${ADMIN_TEXT} cursor-pointer transition-all duration-150 hover:bg-muted hover:border-muted-foreground/30 hover:text-foreground`,
  toolbarResults: `inline-flex items-center ${ADMIN_TEXT} text-muted-foreground`,
  pagination:
    `flex flex-col items-center justify-center gap-2 px-4 py-3 border-t border-border bg-white shrink-0 ${ADMIN_TEXT} ${adminFontClass.ui}`,
  paginationMeta: `${ADMIN_TEXT} text-muted-foreground text-center`,
  paginationControls: 'flex items-center justify-center gap-1 flex-wrap',
  paginationBtn: `h-9 px-3 ${ADMIN_TEXT} cursor-pointer transition-colors duration-150 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50`,
  paginationPageBtn:
    `h-9 min-w-9 px-2 ${ADMIN_TEXT} cursor-pointer transition-colors duration-150`,
  paginationPageBtnActive: 'bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground',
  paginationEllipsis: 'px-1 text-muted-foreground select-none',
  icon: ADMIN_ICON,
  refreshBtn:
    `admin-refresh-btn flex items-center gap-2 px-3 py-2 rounded-lg border border-border cursor-pointer transition-all duration-150 hover:bg-muted hover:border-muted-foreground/30 hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed ${ADMIN_TEXT} text-muted-foreground`,
} as const;

export function getAdminTotalPages(totalCount: number, pageSize = ADMIN_PAGE_SIZE): number {
  return Math.max(1, Math.ceil(totalCount / pageSize));
}

export type AdminPageToken = number | 'ellipsis';

/** Page numbers to render, with ellipsis when the list is long. */
export function getAdminVisiblePages(currentPage: number, totalPages: number): AdminPageToken[] {
  if (totalPages <= 0) return [];
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: AdminPageToken[] = [1];
  const windowStart = Math.max(2, currentPage - 1);
  const windowEnd = Math.min(totalPages - 1, currentPage + 1);

  if (windowStart > 2) pages.push('ellipsis');
  for (let pageNumber = windowStart; pageNumber <= windowEnd; pageNumber += 1) {
    pages.push(pageNumber);
  }
  if (windowEnd < totalPages - 1) pages.push('ellipsis');
  pages.push(totalPages);

  return pages;
}

export function paginateAdminRows<T>(rows: T[], page: number, pageSize = ADMIN_PAGE_SIZE): T[] {
  return rows.slice((page - 1) * pageSize, page * pageSize);
}

export function adminCellClass(options?: {
  size?: 'default' | 'xs' | 'muted' | 'phone' | 'nationalId';
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
          : options?.size === 'nationalId'
            ? adminTableStyles.cellNationalId
            : adminTableStyles.cell;
  return cn(base, options?.center && 'text-center', options?.className);
}
