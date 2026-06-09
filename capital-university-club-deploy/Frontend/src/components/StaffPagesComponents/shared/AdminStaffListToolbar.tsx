import { Calendar, Filter, Search } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { adminPageStyles } from './adminTableStyles';

export type StaffTypeOption = {
  id: number;
  code?: string;
  label: string;
};

export type AdminStaffListToolbarProps = {
  isRTL: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
  dateFilterLabel: string;
  filterByDateLabel: string;
  clearLabel: string;
  statusFilterLabel: string;
  clearFilterLabel: string;
  filterStatuses: string[];
  onFilterStatusesChange: (statuses: string[]) => void;
  statusPopoverOpen: boolean;
  onStatusPopoverOpenChange: (open: boolean) => void;
  statusOptions: Array<{ key: string; label: string; color: string; count: number }>;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  allRolesLabel: string;
  staffTypes: StaffTypeOption[];
  showRoleFilter?: boolean;
  showStatusFilter?: boolean;
};

export function AdminStaffListToolbar({
  isRTL,
  search,
  onSearchChange,
  searchPlaceholder,
  dateFilter,
  onDateFilterChange,
  dateFilterLabel,
  filterByDateLabel,
  clearLabel,
  statusFilterLabel,
  clearFilterLabel,
  filterStatuses,
  onFilterStatusesChange,
  statusPopoverOpen,
  onStatusPopoverOpenChange,
  statusOptions,
  roleFilter,
  onRoleFilterChange,
  allRolesLabel,
  staffTypes,
  showRoleFilter = true,
  showStatusFilter = true,
}: AdminStaffListToolbarProps) {
  return (
    <div className="flex items-center gap-3 px-6 py-3 border-b border-border bg-muted/20 shrink-0 flex-wrap">
      <div className="relative flex-1 max-w-sm min-w-[200px]">
        <Search
          className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none ${isRTL ? 'right-3' : 'left-3'}`}
        />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className={`h-9 ${isRTL ? 'pr-9' : 'pl-9'}`}
        />
      </div>

      {showRoleFilter && (
        <Select value={roleFilter || 'all'} onValueChange={(val) => onRoleFilterChange(val === 'all' ? '' : val)}>
          <SelectTrigger className="h-9 w-44 text-xs shrink-0">
            <SelectValue placeholder={allRolesLabel} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{allRolesLabel}</SelectItem>
            {staffTypes.map((st) => (
              <SelectItem key={st.code || st.id} value={st.code || String(st.id)}>
                {st.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={`${adminPageStyles.toolbarFilterBtn} h-8 text-xs ${
              dateFilter
                ? 'border-primary bg-primary/5 text-primary hover:bg-primary/10'
                : 'border-border bg-background text-muted-foreground'
            }`}
          >
            <Calendar className="w-3 h-3" />
            {dateFilterLabel}
            {dateFilter && (
              <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-primary" />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="space-y-3">
            <h4 className="font-medium text-sm">{filterByDateLabel}</h4>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => onDateFilterChange(e.target.value)}
              className="w-full text-xs h-8"
            />
            {dateFilter && (
              <Button variant="ghost" size="sm" className="w-full text-xs h-8" onClick={() => onDateFilterChange('')}>
                {clearLabel}
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {showStatusFilter && (
        <Popover open={statusPopoverOpen} onOpenChange={onStatusPopoverOpenChange}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={`${adminPageStyles.toolbarFilterBtn} h-8 text-xs ${
                filterStatuses.length > 0
                  ? 'border-primary bg-primary/5 text-primary hover:bg-primary/10'
                  : 'border-border bg-background text-muted-foreground'
              }`}
            >
              <Filter className="w-3 h-3" />
              {statusFilterLabel}
              {filterStatuses.length > 0 && (
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold">
                  {filterStatuses.length}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-52 p-0" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="py-1">
              {statusOptions.map(({ key, label, color, count }) => {
                const checked = filterStatuses.includes(key);
                return (
                  <label
                    key={key}
                    className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/60 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        onFilterStatusesChange(
                          checked ? filterStatuses.filter((s) => s !== key) : [...filterStatuses, key],
                        );
                      }}
                      className="w-3.5 h-3.5 rounded accent-primary cursor-pointer"
                    />
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${color}`}>{label}</span>
                    <span className="me-auto text-[10px] text-muted-foreground">{count}</span>
                  </label>
                );
              })}
            </div>
            <div className="flex items-center justify-end gap-2 px-3 py-2 border-t border-border">
              <button
                type="button"
                onClick={() => {
                  onFilterStatusesChange([]);
                  onStatusPopoverOpenChange(false);
                }}
                className="text-xs text-muted-foreground hover:text-foreground hover:underline cursor-pointer transition-colors"
              >
                {clearFilterLabel}
              </button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
