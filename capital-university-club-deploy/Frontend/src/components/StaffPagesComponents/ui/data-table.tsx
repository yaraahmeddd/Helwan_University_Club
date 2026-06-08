import React from "react";
import { cn } from "../../../lib/utils";
import { useTranslation } from "react-i18next";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./table";
import { adminTableStyles, adminHeadClass, adminCellClass } from "../shared/adminTableStyles";
import { AdminTableLoading, AdminTableEmpty } from "../shared/AdminTableStates";
import { AdminSortableHead, type SortDirection } from "../shared/AdminSortableHead";

export interface ColumnDef<T> {
    header: React.ReactNode | string;
    accessorKey?: keyof T | string;
    cell?: (row: T, index: number) => React.ReactNode;
    className?: string;
    /** When set, column header becomes sortable */
    sortKey?: string;
    center?: boolean;
}

interface DataTableProps<T> {
    data: T[];
    columns: ColumnDef<T>[];
    isLoading?: boolean;
    emptyMessage?: string;
    emptyTitle?: string;
    emptyIcon?: React.ReactNode;
    sortKey?: string;
    sortDirection?: SortDirection;
    onSort?: (key: string) => void;
}

export function DataTable<T>({
    data,
    columns,
    isLoading,
    emptyMessage,
    emptyTitle,
    emptyIcon,
    sortKey,
    sortDirection = 'asc',
    onSort,
}: DataTableProps<T>) {
    const { t } = useTranslation('common');

    return (
        <div
            className={adminTableStyles.container}
            style={{ scrollbarWidth: 'none' }}
        >
            {isLoading ? (
                <AdminTableLoading />
            ) : data.length === 0 ? (
                <AdminTableEmpty
                    title={emptyTitle ?? t('table.noData')}
                    message={emptyMessage ?? t('table.noDataDesc')}
                    icon={emptyIcon}
                />
            ) : (
                <Table>
                    <TableHeader className={adminTableStyles.header}>
                        <TableRow>
                            {columns.map((col, idx) =>
                                col.sortKey && onSort ? (
                                    <AdminSortableHead
                                        key={idx}
                                        sortKey={col.sortKey}
                                        activeSortKey={sortKey}
                                        sortDirection={sortDirection}
                                        onSort={onSort}
                                        center={col.center}
                                        className={col.className}
                                    >
                                        {col.header}
                                    </AdminSortableHead>
                                ) : (
                                    <TableHead
                                        key={idx}
                                        className={adminHeadClass({
                                            center: col.center,
                                            className: col.className,
                                        })}
                                    >
                                        {col.header}
                                    </TableHead>
                                )
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody className={adminTableStyles.body}>
                        {data.map((row, rowIndex) => (
                            <TableRow
                                key={rowIndex}
                                className={adminTableStyles.row}
                            >
                                {columns.map((col, colIndex) => (
                                    <TableCell
                                        key={colIndex}
                                        className={adminCellClass({
                                            center: col.center,
                                            className: col.className,
                                        })}
                                    >
                                        {col.cell
                                            ? col.cell(row, rowIndex)
                                            : col.accessorKey
                                                ? (row as Record<string, unknown>)[col.accessorKey as string] as React.ReactNode
                                                : null}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}

/** Re-export admin table primitives for pages with custom table layouts. */
export {
    adminTableStyles,
    adminHeadClass,
    adminCellClass,
    AdminSortableHead,
    AdminTableLoading,
    AdminTableEmpty,
};
