import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { TableHead } from '../ui/table';
import { adminHeadClass, adminTableStyles } from './adminTableStyles';
import { cn } from '@/lib/utils';

export type SortDirection = 'asc' | 'desc';

type AdminSortableHeadProps = {
  children: React.ReactNode;
  sortKey?: string;
  activeSortKey?: string;
  sortDirection?: SortDirection;
  onSort?: (key: string) => void;
  center?: boolean;
  className?: string;
};

function SortIcon({
  field,
  active,
  dir,
}: {
  field: string;
  active?: string;
  dir?: SortDirection;
}) {
  if (field !== active) {
    return <ChevronsUpDown className={`${adminTableStyles.icon} opacity-40`} />;
  }
  return dir === 'asc' ? (
    <ChevronUp className={`${adminTableStyles.icon} text-primary`} />
  ) : (
    <ChevronDown className={`${adminTableStyles.icon} text-primary`} />
  );
}

export function AdminSortableHead({
  children,
  sortKey,
  activeSortKey,
  sortDirection = 'asc',
  onSort,
  center,
  className,
}: AdminSortableHeadProps) {
  const sortable = Boolean(sortKey && onSort);

  return (
    <TableHead
      onClick={() => sortKey && onSort?.(sortKey)}
      className={adminHeadClass({ sortable, center, className })}
    >
      <span
        className={cn(
          'inline-flex items-center gap-1',
          center && 'justify-center',
        )}
      >
        {children}
        {sortable && (
          <SortIcon
            field={sortKey!}
            active={activeSortKey}
            dir={sortDirection}
          />
        )}
      </span>
    </TableHead>
  );
}
