/**
 * MemberTable
 *
 * A reusable table component for displaying club members and team players.
 * Built on top of the shared <DataTable> component.
 *
 * Usage:
 *   <MemberTable
 *     rows={pageRows}
 *     isLoading={fetching}
 *     emptyMessage="لا يوجد أعضاء في هذه الفئة"
 *     sortField={sortField}
 *     sortDir={sortDir}
 *     onSort={handleSort}
 *     onView={(row) => openDetail(row)}
 *     onEdit={(row) => openEdit(row)}
 *     onChangeStatus={(row) => openStatus(row)}
 *     onDelete={(row) => openDelete(row)}
 *   />
 */

import React from "react";
import { useAdminFormatters } from "../shared/adminFormatters";
import {
    Trophy,
    Pencil,
    Shield,
    Trash2,
    ChevronUp,
    ChevronDown,
    ChevronsUpDown,
} from "lucide-react";
import { AdminMemberStatusBadge } from "../shared/AdminMemberStatusBadge";
import { DataTable, ColumnDef } from "./data-table";
import { Button } from "./button";
import {
    TooltipProvider,
} from "./tooltip";
import {
    AdminActionButton,
    AdminRowActions,
    AdminViewButton,
} from "../shared/AdminRowActions";
import { RoleGuard } from "../RoleGuard";
import { ProfileAvatar } from "../shared/ProfileAvatar";


// ─── Types ────────────────────────────────────────────────────────────────────

export type MemberRow = {
    id: string;
    firstNameAr: string;
    firstNameEn: string;
    lastNameAr: string;
    lastNameEn: string;
    email?: string;
    phone?: string;
    nationalId: string;
    gender?: string;
    nationality?: string;
    birthdate?: string | null;
    healthStatus?: string;
    isForeign: boolean;
    address?: string;
    memberTypeId: number;
    memberTypeLabel: string;
    memberTypeCode: string;
    isTeamPlayer: boolean;
    pointsBalance: number;
    status: string;
    createdAt?: string;
    sports: Array<{
        id: number;
        name: string;
        level?: string;
        position?: string;
        joinDate?: string;
    }>;
};

export type SortField = "name" | "memberType" | "status" | "points" | "createdAt";
export type SortDir = "asc" | "desc";


// ─── Helpers ──────────────────────────────────────────────────────────────────

// ─── Status Badge ─────────────────────────────────────────────────────────────

export function StatusBadge({
    status,
    compact = false,
}: {
    status: string;
    compact?: boolean;
}) {
    return <AdminMemberStatusBadge status={status} compact={compact} />;
}


// ─── Sort Icon ────────────────────────────────────────────────────────────────

function SortIcon({
    field,
    active,
    dir,
}: {
    field: SortField;
    active: SortField;
    dir: SortDir;
}) {
    if (field !== active) return <ChevronsUpDown className="w-3 h-3 opacity-40" />;
    return dir === "asc"
        ? <ChevronUp className="w-3 h-3 text-primary" />
        : <ChevronDown className="w-3 h-3 text-primary" />;
}


// ─── Sub-components ───────────────────────────────────────────────────────────

function MemberCell({ row }: { row: MemberRow }) {
    const nameAr = `${row.firstNameAr} ${row.lastNameAr}`.trim();
    const nameEn = `${row.firstNameEn} ${row.lastNameEn}`.trim();

    return (
        <div className="flex items-center gap-2.5">
            <ProfileAvatar size="xs" />
            <div className="min-w-0">
                <p className="font-semibold leading-tight truncate max-w-[160px] text-xs">
                    {nameAr || "—"}
                </p>
                <p className="text-[10px] text-muted-foreground truncate max-w-[160px]" dir="ltr">
                    {nameEn}
                </p>
            </div>
        </div>
    );
}

function MemberTypeCell({ row }: { row: MemberRow }) {
    return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
            {row.isTeamPlayer && <Trophy className="w-3 h-3 text-amber-500 shrink-0" />}
            <span className="truncate max-w-[100px]">{row.memberTypeLabel}</span>
        </div>
    );
}

function PointsCell({ row }: { row: MemberRow }) {
    return (
        <span
            className={`font-semibold tabular-nums text-xs ${
                row.pointsBalance > 0 ? "text-amber-600" : "text-muted-foreground"
            }`}
        >
            {row.pointsBalance.toLocaleString()}
        </span>
    );
}

type ActionCellProps = {
    row: MemberRow;
    onView: (row: MemberRow) => void;
    onEdit: (row: MemberRow) => void;
    onChangeStatus: (row: MemberRow) => void;
    onDelete: (row: MemberRow) => void;
};

function ActionCell({ row, onView, onEdit, onChangeStatus, onDelete }: ActionCellProps) {
    return (
        <AdminRowActions>
            <AdminViewButton tooltip="عرض التفاصيل" onClick={() => onView(row)} />
            <RoleGuard privilege="UPDATE_MEMBER">
                <AdminActionButton tooltip="تعديل" icon={Pencil} variant="edit" onClick={() => onEdit(row)} />
            </RoleGuard>
            <RoleGuard privilege="MANAGE_MEMBER_BLOCK">
                <AdminActionButton tooltip="تغيير الحالة" icon={Shield} variant="status" onClick={() => onChangeStatus(row)} />
            </RoleGuard>
            <RoleGuard privilege="DELETE_MEMBER">
                <AdminActionButton tooltip="حذف العضو" icon={Trash2} variant="delete" onClick={() => onDelete(row)} />
            </RoleGuard>
        </AdminRowActions>
    );
}


// ─── Sortable Header ──────────────────────────────────────────────────────────

type SortableThProps = {
    field?: SortField;
    sortField: SortField;
    sortDir: SortDir;
    onSort: (field: SortField) => void;
    center?: boolean;
    className?: string;
    children: React.ReactNode;
};

function SortableTh({
    field,
    sortField,
    sortDir,
    onSort,
    center,
    className = "",
    children,
}: SortableThProps) {
    return (
        <th
            onClick={() => field && onSort(field)}
            className={`px-4 py-3 text-xs font-semibold text-muted-foreground whitespace-nowrap select-none align-middle
                ${field ? "cursor-pointer hover:text-foreground" : ""}
                ${center ? "text-center" : "text-right"} ${className}`}
        >
            <span className={`inline-flex items-center gap-1 ${center ? "justify-center" : ""}`}>
                {children}
                {field && <SortIcon field={field} active={sortField} dir={sortDir} />}
            </span>
        </th>
    );
}


// ─── Skeleton Row ─────────────────────────────────────────────────────────────

function SkeletonRows({ count = 8 }: { count?: number }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-muted shrink-0" />
                            <div className="space-y-1">
                                <div className="h-2.5 w-20 bg-muted rounded" />
                                <div className="h-2 w-14 bg-muted rounded" />
                            </div>
                        </div>
                    </td>
                    {[1, 2, 3, 4, 5, 6].map((j) => (
                        <td key={j} className="px-4 py-3">
                            <div className="h-2.5 w-12 bg-muted rounded mx-auto" />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}


// ─── Main Component ───────────────────────────────────────────────────────────

export type MemberTableProps = {
    rows: MemberRow[];
    /** Show skeleton loaders instead of data */
    isLoading?: boolean;
    /** Message shown when rows array is empty */
    emptyMessage?: string;
    /** Currently active sort field */
    sortField: SortField;
    /** Currently active sort direction */
    sortDir: SortDir;
    /** Called when a sortable header is clicked */
    onSort: (field: SortField) => void;
    /** Called when the Eye (view) button is clicked */
    onView: (row: MemberRow) => void;
    /** Called when the Pencil (edit) button is clicked */
    onEdit: (row: MemberRow) => void;
    /** Called when تغيير الحالة is clicked */
    onChangeStatus: (row: MemberRow) => void;
    /** Called when حذف is clicked */
    onDelete: (row: MemberRow) => void;
    /** Number of skeleton rows to show while loading (default: 8) */
    skeletonRows?: number;
};

/**
 * MemberTable — renders the members list table with sortable headers,
 * skeleton loading, empty states, and per-row action buttons.
 *
 * Wraps its own <table> directly (rather than <DataTable>) so that sortable
 * column headers can be rendered without extending the generic DataTable API.
 */
export function MemberTable({
    rows,
    isLoading = false,
    emptyMessage = "لا يوجد أعضاء في هذه الفئة",
    sortField,
    sortDir,
    onSort,
    onView,
    onEdit,
    onChangeStatus,
    onDelete,
    skeletonRows = 8,
}: MemberTableProps) {
    const { fmtDate } = useAdminFormatters();
    return (
        <TooltipProvider>
            <div
                className="flex-1 overflow-auto [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: "none" }}
            >
                {isLoading && rows.length === 0 ? (
                    /* Skeleton loader */
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-muted/70 backdrop-blur border-b border-border z-10">
                            <tr>
                                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground text-right">العضو</th>
                                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground text-right">النوع</th>
                                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground text-right">الهاتف</th>
                                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground text-center">النقاط</th>
                                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground text-center">الحالة</th>
                                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground text-center">التسجيل</th>
                                <th className="px-4 py-3 text-xs font-semibold text-muted-foreground text-center">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            <SkeletonRows count={skeletonRows} />
                        </tbody>
                    </table>
                ) : rows.length === 0 ? (
                    /* Empty state */
                    <div className="py-12 text-center text-muted-foreground text-sm">
                        {emptyMessage}
                    </div>
                ) : (
                    /* Data table */
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-muted/70 backdrop-blur border-b border-border z-10">
                            <tr>
                                <SortableTh field="name" sortField={sortField} sortDir={sortDir} onSort={onSort} className="w-[200px]">
                                    العضو
                                </SortableTh>
                                <SortableTh field="memberType" sortField={sortField} sortDir={sortDir} onSort={onSort}>
                                    النوع
                                </SortableTh>
                                <SortableTh sortField={sortField} sortDir={sortDir} onSort={onSort}>
                                    الهاتف
                                </SortableTh>
                                <SortableTh field="points" sortField={sortField} sortDir={sortDir} onSort={onSort} center>
                                    النقاط
                                </SortableTh>
                                <SortableTh field="status" sortField={sortField} sortDir={sortDir} onSort={onSort} center>
                                    الحالة
                                </SortableTh>
                                <SortableTh field="createdAt" sortField={sortField} sortDir={sortDir} onSort={onSort} center>
                                    التسجيل
                                </SortableTh>
                                <SortableTh sortField={sortField} sortDir={sortDir} onSort={onSort} center className="w-[100px]">
                                    الإجراءات
                                </SortableTh>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {rows.map((row) => (
                                <tr
                                    key={row.id}
                                    className="transition-colors hover:bg-muted/40 group"
                                >
                                    {/* Member (avatar + name) */}
                                    <td className="px-4 py-3 align-middle">
                                        <MemberCell row={row} />
                                    </td>

                                    {/* Type */}
                                    <td className="px-4 py-3 align-middle">
                                        <MemberTypeCell row={row} />
                                    </td>

                                    {/* Phone */}
                                    <td className="px-4 py-3 text-xs tabular-nums text-right align-middle">
                                        <span dir="ltr" className="text-muted-foreground">
                                            {row.phone || "—"}
                                        </span>
                                    </td>

                                    {/* Points */}
                                    <td className="px-4 py-3 text-center align-middle">
                                        <PointsCell row={row} />
                                    </td>

                                    {/* Status */}
                                    <td className="px-4 py-3 text-center align-middle">
                                        <StatusBadge status={row.status} compact />
                                    </td>

                                    {/* Registration date */}
                                    <td className="px-4 py-3 text-center text-[10px] text-muted-foreground whitespace-nowrap align-middle tabular-nums" dir="ltr">
                                        {fmtDate(row.createdAt)}
                                    </td>

                                    {/* Actions */}
                                    <td className="px-4 py-3 text-center align-middle">
                                        <ActionCell
                                            row={row}
                                            onView={onView}
                                            onEdit={onEdit}
                                            onChangeStatus={onChangeStatus}
                                            onDelete={onDelete}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </TooltipProvider>
    );
}

export default MemberTable;
