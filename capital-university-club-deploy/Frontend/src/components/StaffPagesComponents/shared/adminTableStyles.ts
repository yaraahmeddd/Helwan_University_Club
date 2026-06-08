import { cn } from '@/lib/utils';

/** Shared admin table styling — matches MemberManagementPage. */
export const adminTableStyles = {
  container:
    'flex-1 overflow-auto [&::-webkit-scrollbar]:hidden',
  /** Action button groups — horizontal, no wrapping */
  actions: 'inline-flex items-center justify-center gap-2 flex-nowrap',
  table: 'w-full text-sm',
  /** Icon-only ghost buttons in action columns */
  iconAction:
    'inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors text-muted-foreground hover:bg-muted hover:text-foreground',
  header: 'sticky top-0 bg-muted/70 backdrop-blur border-b border-border z-10',
  head: 'px-3 py-2 text-xs font-semibold text-muted-foreground whitespace-nowrap select-none align-middle',
  headSortable: 'cursor-pointer hover:text-foreground',
  headCenter: 'text-center',
  headStart: 'text-start',
  body: 'divide-y divide-border',
  row: 'transition-colors hover:bg-muted/40 group',
  cell: 'px-3 py-2 align-middle !h-auto',
  cellXs: 'px-3 py-2 text-xs align-middle !h-auto',
  cellMuted: 'px-3 py-2 text-xs text-muted-foreground align-middle !h-auto',
  /** Phone / numeric columns — slightly smaller than default body text */
  cellPhone: 'px-3 py-2 text-xs tabular-nums align-middle !h-auto',
  cellCenter: 'px-3 py-2 text-center align-middle !h-auto',
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
