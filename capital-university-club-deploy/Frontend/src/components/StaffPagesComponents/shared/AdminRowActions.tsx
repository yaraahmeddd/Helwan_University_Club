import React from 'react';
import { Eye, MoreHorizontal } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../ui/tooltip';
import { adminTableStyles } from './adminTableStyles';

/** Eye icon view button — matches Member/Registration management tables. */
export function AdminViewButton({
  tooltip,
  onClick,
}: {
  tooltip: string;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600"
          onClick={onClick}
        >
          <Eye className="w-4 h-4 text-blue-600" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Standard admin row actions: optional view slot + ⋯ overflow menu.
 * Wrap view with RoleGuard in the parent when needed.
 */
export function AdminRowActions({
  view,
  menu,
  menuWidth = 'w-40',
}: {
  view?: React.ReactNode;
  menu: React.ReactNode;
  menuWidth?: string;
}) {
  return (
    <div className={adminTableStyles.actions}>
      {view}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className={`text-xs ${menuWidth}`}>
          {menu}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
