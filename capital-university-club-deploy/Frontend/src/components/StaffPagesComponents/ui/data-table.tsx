import React from "react";
import { UserX } from "lucide-react";
import { cn } from "../../../lib/utils";

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
    return (
        <div className="flex-1 overflow-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
            {isLoading ? (
                <div className="py-20 text-center text-muted-foreground">
                    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3" />
                    <p className="text-sm">جارٍ التحميل...</p>
                </div>
            ) : data.length === 0 ? (
                <div className="py-20 text-center text-muted-foreground">
                    <div className="rounded-full bg-muted/30 p-6 mb-4 w-fit mx-auto">
                        <UserX className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground mb-1">لا يوجد بيانات حالياً</h3>
                    <p className="text-sm">
                        {emptyMessage || "لم يتم العثور على بيانات"}
                    </p>
                </div>
            ) : (
                <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-muted/70 backdrop-blur border-b border-border z-10">
                        <tr>
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    className={cn(
                                        "px-4 py-3 font-semibold text-xs text-muted-foreground whitespace-nowrap align-middle",
                                        col.className
                                    )}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                className="transition-colors hover:bg-muted/40"
                            >
                                {columns.map((col, colIndex) => (
                                    <td
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
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
