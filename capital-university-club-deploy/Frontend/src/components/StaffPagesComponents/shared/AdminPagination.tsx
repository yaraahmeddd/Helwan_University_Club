import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { adminPageStyles, ADMIN_PAGE_SIZE, getAdminTotalPages } from './adminTableStyles';

export type AdminPaginationProps = {
  page: number;
  totalCount: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  isRTL?: boolean;
  disabled?: boolean;
  className?: string;
};

export function AdminPagination({
  page,
  totalCount,
  pageSize = ADMIN_PAGE_SIZE,
  onPageChange,
  isRTL = false,
  disabled = false,
  className,
}: AdminPaginationProps) {
  const { t } = useTranslation('common');
  const totalPages = getAdminTotalPages(totalCount, pageSize);
  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);
  const PrevIcon = isRTL ? ChevronRight : ChevronLeft;
  const NextIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div className={cn(adminPageStyles.pagination, className)}>
      <span className={adminPageStyles.paginationMeta}>
        {totalCount === 0
          ? t('pagination.showingNone')
          : `${t('pagination.showing', { from, to, total: totalCount })} · ${t('pagination.page', { page, totalPages })}`}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          className={cn(adminPageStyles.paginationBtn, 'gap-1.5')}
        >
          <PrevIcon className={adminPageStyles.icon} />
          {t('pagination.previous')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || page >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          className={cn(adminPageStyles.paginationBtn, 'gap-1.5')}
        >
          {t('pagination.next')}
          <NextIcon className={adminPageStyles.icon} />
        </Button>
      </div>
    </div>
  );
}
