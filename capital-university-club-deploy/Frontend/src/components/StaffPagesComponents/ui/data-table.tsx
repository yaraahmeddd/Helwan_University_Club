import React from "react";
import { UserX, Loader2 } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useTranslation } from "react-i18next";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./table";

export interface ColumnDef<T> {
    header: React.ReactNode | string;
    /**
     * Optional accessor key for simple text rendering.
     * Can be a key of the data object, or a nested path (if you implement path resolution).
     */
    accessorKey?: keyof T | string;
    /**
     * Optional custom render function for complex cells (like Badges or Action buttons).
     * If provided, this overrides `accessorKey`.
     */
    cell?: (row: T, index: number) => React.ReactNode;
    /**
     * Optional Tailwind classes applied to BOTH the <th> and <td> for this column.
     * Useful for setting text alignment (e.g., 'text-center') or widths (e.g., 'w-10').
     */
    className?: string;
}

interface DataTableProps<T> {
    data: T[];
    columns: ColumnDef<T>[];
    isLoading?: boolean;
    emptyMessage?: string;
}

export function DataTable<T>({ data, columns, isLoading, emptyMessage }: DataTableProps<T>) {
    const { i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    return (
        <div 
            className="flex-1 overflow-auto [&::-webkit-scrollbar]:hidden [&_td_button]:h-8 [&_td_button]:w-8 [&_td_button]:inline-flex [&_td_button]:items-center [&_td_button]:justify-center [&_td_button]:rounded-md [&_td_button]:transition-colors hover:[&_td_button]:bg-muted [&_td_button]:border-transparent [&_td_button]:shadow-none [&_td_button]:text-muted-foreground hover:[&_td_button]:text-foreground [&_td_button]:bg-transparent" 
            style={{ scrollbarWidth: 'none' }}
        >
            {isLoading ? (
                <div className="py-20 text-center text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
                    <p className="text-sm">{isRTL ? 'جارٍ التحميل...' : 'Loading...'}</p>
                </div>
            ) : data.length === 0 ? (
                <div className="py-20 text-center text-muted-foreground">
                    <div className="rounded-full bg-muted/30 p-6 mb-4 w-fit mx-auto">
                        <UserX className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground mb-1">
                        {isRTL ? 'لا يوجد بيانات حالياً' : 'No Data Available'}
                    </h3>
                    <p className="text-sm">
                        {emptyMessage || (isRTL ? 'لم يتم العثور على بيانات' : 'No data found')}
                    </p>
                </div>
            ) : (
                <Table>
                    <TableHeader className="sticky top-0 bg-muted/70 backdrop-blur border-b border-border z-10">
                        <TableRow>
                            {columns.map((col, idx) => (
                                <TableHead
                                    key={idx}
                                    className={cn(
                                        "px-4 py-3 font-semibold text-xs text-muted-foreground whitespace-nowrap align-middle",
                                        col.className
                                    )}
                                >
                                    {col.header}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-border">
                        {data.map((row, rowIndex) => (
                            <TableRow
                                key={rowIndex}
                                className="transition-colors hover:bg-muted/40"
                            >
                                {columns.map((col, colIndex) => (
                                    <TableCell
                                        key={colIndex}
                                        className={cn(
                                            "px-4 py-3 align-middle",
                                            col.className
                                        )}
                                    >
                                        {col.cell
                                            ? col.cell(row, rowIndex)
                                            : col.accessorKey
                                                ? (row as any)[col.accessorKey]
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
