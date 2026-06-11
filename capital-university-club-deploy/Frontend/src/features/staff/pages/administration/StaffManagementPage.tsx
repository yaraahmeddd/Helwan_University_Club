import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, UserPlus, Users, Pencil, Trash2 } from 'lucide-react';
import { useTableExport } from '@/utils/reportExport/useTableExport';
import { ExportReportButton } from '@/components/StaffPagesComponents/shared/ExportReportButton';
import api from '@/services/axios';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/StaffPagesComponents/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/StaffPagesComponents/ui/dialog';
import { RoleGuard } from '@/components/StaffPagesComponents/RoleGuard';
import { useNavigate } from 'react-router-dom';
import { StaffService } from '@/services/staffService';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/StaffPagesComponents/ui/table';
import {
  adminTableStyles,
  adminHeadClass,
  adminCellClass,
  adminDialogStyles,
  ADMIN_PAGE_SIZE,
} from '@/components/StaffPagesComponents/shared/adminTableStyles';
import { AdminActionButton, AdminRowActions, AdminViewButton } from '@/components/StaffPagesComponents/shared/AdminRowActions';
import { AdminMemberStatusBadge } from '@/components/StaffPagesComponents/shared/AdminMemberStatusBadge';
import { AdminPagination } from '@/components/StaffPagesComponents/shared/AdminPagination';
import { AdminStaffListToolbar } from '@/components/StaffPagesComponents/shared/AdminStaffListToolbar';
import { PersonNameDisplay } from '@/components/StaffPagesComponents/shared/PersonNameDisplay';
import {
  StaffDetailPanel,
  type EditFormData,
  type StaffDetailsData,
  type StaffRow,
} from '@/components/StaffPagesComponents/shared/StaffDetailPanel';
import { getLocalizedText } from '@/lib/localizedDisplay';
import { useLanguage } from '@/hooks/useLanguage';
import { useLocalizedTranslation } from '@/hooks/useLocalizedTranslation';
import { useTranslation } from 'react-i18next';
import { validateStaffEdit } from '@/lib/validation';
import { useAdminFormatters } from '@/components/StaffPagesComponents/shared/adminFormatters';

type StaffType = {
  id: number;
  code?: string;
  name_ar?: string;
  name_en?: string;
  title_ar?: string;
  title_en?: string;
};

type StaffApiItem = {
  id: number;
  first_name_en?: string;
  first_name_ar?: string;
  last_name_en?: string;
  last_name_ar?: string;
  email?: string;
  national_id?: string;
  phone?: string;
  address?: string;
  staff_type_id?: number | string;
  staff_type?: string | { id?: number; code?: string; name_ar?: string; name_en?: string };
  status?: string;
  is_active?: boolean;
  created_at?: string;
  employment_start_date?: string;
  employment_end_date?: string | null;
};

const STATIC_STAFF_TYPES: StaffType[] = [
  { id: 1, code: 'ADMIN', name_ar: 'المسئول', name_en: 'Admin' },
  { id: 2, code: 'CEO', name_ar: 'المدير التنفيذى', name_en: 'Executive Director' },
];

function normalizeStaffStatus(status?: string, isActive?: boolean): string {
  const s = (status ?? '').toLowerCase();
  if (s === 'cancelled' || s === 'inactive' || isActive === false) return 'cancelled';
  return 'active';
}

function staffStatusForBadge(status?: string, isActive?: boolean): string {
  return normalizeStaffStatus(status, isActive);
}

export default function StaffManagementPage() {
  const { t } = useLocalizedTranslation('StaffManagementPage');
  const { t: tVal } = useTranslation('validation');
  const { language, isRTL } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { fmtDate } = useAdminFormatters();

  const [rows, setRows] = useState<StaffRow[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);

  const [staffTypes, setStaffTypes] = useState<StaffType[]>(STATIC_STAFF_TYPES);

  const staffTypeLabelById = useMemo(() => {
    const m = new Map<number, string>();
    staffTypes.forEach((st) => {
      m.set(
        st.id,
        getLocalizedText(st.name_ar || st.title_ar, st.name_en || st.title_en, language) || `#${st.id}`,
      );
    });
    return m;
  }, [staffTypes, language]);

  const staffTypeCodeById = useMemo(() => {
    const m = new Map<number, string>();
    staffTypes.forEach((st) => m.set(st.id, st.code || String(st.id)));
    return m;
  }, [staffTypes]);

  const staffTypeOptions = useMemo(
    () =>
      staffTypes.map((st) => ({
        id: st.id,
        code: st.code,
        label: getLocalizedText(st.name_ar || st.title_ar, st.name_en || st.title_en, language) || `#${st.id}`,
      })),
    [staffTypes, language],
  );

  const [selectedRow, setSelectedRow] = useState<StaffRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<StaffDetailsData | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [panelStartEditing, setPanelStartEditing] = useState(false);
  const [editSaving, setEditSaving] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StaffRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    StaffService.getStaffTypes()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) setStaffTypes(res.data);
      })
      .catch(() => undefined);
  }, []);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      type ListRes = { success: boolean; data: StaffApiItem[] };
      const res = await api.get<ListRes>('/staff', { params: { page: 1, limit: 500 } });
      const mapped: StaffRow[] = (res.data?.data ?? []).map((item) => {
        const typeId = Number.isFinite(Number(item.staff_type_id)) ? Number(item.staff_type_id) : 0;
        const staffTypeObj = typeof item.staff_type === 'object' && item.staff_type ? item.staff_type : null;
        const typeCode = staffTypeObj?.code ?? staffTypeCodeById.get(typeId);
        return {
          id: String(item.id),
          firstNameEn: item.first_name_en,
          firstNameAr: item.first_name_ar,
          lastNameEn: item.last_name_en,
          lastNameAr: item.last_name_ar,
          email: item.email,
          nationalId: item.national_id || '—',
          phone: item.phone || '—',
          address: item.address,
          staffTypeId: typeId,
          staffTypeCode: typeCode,
          staffTypeLabel:
            staffTypeLabelById.get(typeId) ||
            (typeof item.staff_type === 'string' ? item.staff_type : '') ||
            (typeId ? String(typeId) : '—'),
          status: normalizeStaffStatus(item.status, item.is_active),
          isActive: item.is_active,
          employmentStartDate: item.employment_start_date,
          employmentEndDate: item.employment_end_date ?? null,
        };
      });
      setRows(mapped);
    } catch (err) {
      toast({
        title: t('toasts.loadFailed.title'),
        description: err instanceof Error ? err.message : '',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [staffTypeLabelById, staffTypeCodeById, toast, t]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  const openDetail = useCallback(async (row: StaffRow, startEditing = false) => {
    setSelectedRow(row);
    setPanelStartEditing(startEditing);
    setDetailOpen(true);
    setSelectedDetails(null);
    setDetailLoading(true);
    try {
      const detRes = await api.get<{ success: boolean; data: StaffDetailsData }>(`/staff/${row.id}`);
      if (detRes.data?.success) {
        setSelectedDetails(detRes.data.data);
      }
    } catch {
      /* non-fatal */
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleSaveFromPanel = async (formData: Partial<EditFormData>) => {
    if (!selectedRow) return;
    
    // Only validate fields that are provided
    const validateData: any = {};
    if (formData.first_name_ar !== undefined) validateData.first_name_ar = formData.first_name_ar;
    if (formData.last_name_ar !== undefined) validateData.last_name_ar = formData.last_name_ar;
    if (formData.first_name_en !== undefined) validateData.first_name_en = formData.first_name_en;
    if (formData.last_name_en !== undefined) validateData.last_name_en = formData.last_name_en;
    if (formData.phone !== undefined) validateData.phone = formData.phone;

    const validationError = validateStaffEdit(
      validateData,
      tVal,
    );
    if (validationError) {
      toast({ title: t('toasts.dataError.title'), description: validationError, variant: 'destructive' });
      return;
    }
    setEditSaving(true);
    try {
      const payload = new FormData();
      if (formData.first_name_ar !== undefined) payload.append('first_name_ar', formData.first_name_ar.trim());
      if (formData.last_name_ar !== undefined) payload.append('last_name_ar', formData.last_name_ar.trim());
      if (formData.first_name_en !== undefined) payload.append('first_name_en', formData.first_name_en.trim());
      if (formData.last_name_en !== undefined) payload.append('last_name_en', formData.last_name_en.trim());
      if (formData.phone !== undefined) payload.append('phone', formData.phone.trim());
      if (formData.address !== undefined) payload.append('address', formData.address.trim());
      if (formData.staff_type_id !== undefined && formData.staff_type_id) payload.append('staff_type_id', String(formData.staff_type_id));

      if (formData.documentFiles) {
        Object.entries(formData.documentFiles).forEach(([key, file]) => {
          payload.append(key, file);
        });
      }

      await api.put(`/staff/${selectedRow.id}`, payload);
      toast({ title: t('toasts.updateSuccess.title'), description: t('toasts.updateSuccess.desc') });
      void fetchList();
      void openDetail(selectedRow);
    } catch (err) {
      toast({
        title: t('toasts.updateFailed.title'),
        description: err instanceof Error ? err.message : '',
        variant: 'destructive',
      });
      throw err;
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.patch(`/staff/${deleteTarget.id}/deactivate`);
      toast({ title: t('toasts.deactivateSuccess.title'), description: t('toasts.deactivateSuccess.desc') });
      setDeleteOpen(false);
      setDetailOpen(false);
      setRows((prev) =>
        prev.map((r) =>
          r.id === deleteTarget.id
            ? { ...r, status: 'cancelled', isActive: false, employmentEndDate: new Date().toISOString() }
            : r,
        ),
      );
      if (selectedRow?.id === deleteTarget.id) setSelectedRow(null);
    } catch (err) {
      toast({
        title: t('toasts.deactivateFailed.title'),
        description: err instanceof Error ? err.message : '',
        variant: 'destructive',
      });
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, dateFilter, roleFilter, filterStatuses]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { active: 0, cancelled: 0 };
    rows.forEach((r) => {
      const key = normalizeStaffStatus(r.status, r.isActive);
      counts[key] = (counts[key] ?? 0) + 1;
    });
    return counts;
  }, [rows]);

  const filteredRows = useMemo(() => {
    let result = rows;
    if (filterStatuses.length > 0) {
      result = result.filter((r) => filterStatuses.includes(normalizeStaffStatus(r.status, r.isActive)));
    }
    if (roleFilter) {
      result = result.filter((r) => r.staffTypeCode === roleFilter);
    }
    if (dateFilter) {
      result = result.filter((r) => r.employmentStartDate?.startsWith(dateFilter));
    }
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((r) => {
        const fullAr = [r.firstNameAr, r.lastNameAr].filter(Boolean).join(' ').toLowerCase();
        const fullEn = [r.firstNameEn, r.lastNameEn].filter(Boolean).join(' ').toLowerCase();
        return (
          fullAr.includes(q) ||
          fullEn.includes(q) ||
          (r.nationalId ?? '').includes(search.trim()) ||
          (r.phone ?? '').includes(search.trim())
        );
      });
    }
    return result;
  }, [rows, search, dateFilter, roleFilter, filterStatuses]);

  const pagedRows = filteredRows.slice((page - 1) * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE);
  const roleOf = (row: StaffRow) => staffTypeLabelById.get(row.staffTypeId) || row.staffTypeLabel;

  // ── Export ────────────────────────────────────────────────────────────────
  const exportColumns = useMemo(
    () => [
      { headerEn: '#', headerAr: '#', accessor: (_: StaffRow, i: number) => i + 1, width: 6 },
      {
        headerEn: 'Name', headerAr: 'الاسم',
        accessor: (r: StaffRow) => language === 'ar'
          ? `${r.firstNameAr ?? ''} ${r.lastNameAr ?? ''}`.trim() || `${r.firstNameEn ?? ''} ${r.lastNameEn ?? ''}`.trim()
          : `${r.firstNameEn ?? ''} ${r.lastNameEn ?? ''}`.trim() || `${r.firstNameAr ?? ''} ${r.lastNameAr ?? ''}`.trim(),
        width: 28,
      },
      {
        headerEn: 'Job Role', headerAr: 'المسمى الوظيفي',
        accessor: (r: StaffRow) => roleOf(r),
        width: 22,
      },
      { headerEn: 'National ID', headerAr: 'الرقم القومي', accessor: (r: StaffRow) => r.nationalId, width: 18 },
      { headerEn: 'Phone', headerAr: 'رقم الهاتف', accessor: (r: StaffRow) => r.phone, width: 16 },
      { headerEn: 'Start Date', headerAr: 'تاريخ البدء', accessor: (r: StaffRow) => fmtDate(r.employmentStartDate), width: 16 },
      {
        headerEn: 'Status', headerAr: 'الحالة',
        accessor: (r: StaffRow) => normalizeStaffStatus(r.status, r.isActive) === 'active'
          ? (language === 'ar' ? 'نشط' : 'Active')
          : (language === 'ar' ? 'غير نشط' : 'Inactive'),
        width: 12,
      },
    ],
    [language, roleOf, fmtDate],
  );

  const exportHandle = useTableExport({
    reportId: 'staff',
    titleEn: 'Staff Report',
    titleAr: 'تقرير الموظفين',
    columns: exportColumns,
    rows: filteredRows,
  });

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col gap-0" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            {t('page.title')}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t('page.totalStaff')}: <strong>{filteredRows.length}</strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportReportButton {...exportHandle} rowCount={filteredRows.length} />
          <RoleGuard privilege="CREATE_STAFF">
            <Button size="sm" className="gap-2" onClick={() => navigate('/staff/dashboard/admin/staff/new')}>
              <UserPlus className="w-4 h-4" />
              {t('page.newStaff')}
            </Button>
          </RoleGuard>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden flex-col">
        <AdminStaffListToolbar
          isRTL={isRTL}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder={t('list.searchPlaceholder')}
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
          dateFilterLabel={t('toolbar.dateFilter')}
          filterByDateLabel={t('toolbar.filterByDate')}
          clearLabel={t('toolbar.clearFilter')}
          statusFilterLabel={t('toolbar.statusFilter')}
          clearFilterLabel={t('toolbar.clearFilter')}
          filterStatuses={filterStatuses}
          onFilterStatusesChange={setFilterStatuses}
          statusPopoverOpen={statusPopoverOpen}
          onStatusPopoverOpenChange={setStatusPopoverOpen}
          statusOptions={[
            { key: 'active', label: t('status.active'), color: 'text-emerald-700', count: statusCounts.active ?? 0 },
            { key: 'cancelled', label: t('status.cancelled'), color: 'text-rose-700', count: statusCounts.cancelled ?? 0 },
          ]}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          allRolesLabel={t('toolbar.allRoles')}
          staffTypes={staffTypeOptions}
        />

        <div className="flex items-center justify-end px-6 py-2 border-b border-border bg-background shrink-0">
          <button
            onClick={() => void fetchList()}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground disabled:opacity-40"
            title={t('toolbar.refresh')}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className={adminTableStyles.container} style={{ scrollbarWidth: 'none' }}>
          <Table>
            <TableHeader className={adminTableStyles.header}>
              <TableRow>
                <TableHead className={adminHeadClass({ className: 'w-10' })}>{t('table.headers.number')}</TableHead>
                <TableHead className={adminHeadClass()}>{t('table.headers.staff')}</TableHead>
                <TableHead className={adminHeadClass()}>{t('table.headers.job')}</TableHead>
                <TableHead className={adminHeadClass()}>{t('table.headers.nationalId')}</TableHead>
                <TableHead className={adminHeadClass()}>{t('table.headers.phone')}</TableHead>
                <TableHead className={adminHeadClass()}>{t('table.headers.startDate')}</TableHead>
                <TableHead className={adminHeadClass({ center: true })}>{t('table.headers.status')}</TableHead>
                <TableHead className={adminHeadClass({ center: true })}>{t('table.headers.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className={adminTableStyles.body}>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse">
                    {Array.from({ length: 8 }).map((__, j) => (
                      <TableCell key={j} className="px-4 py-3">
                        <div className="h-3 w-full max-w-[80px] bg-muted rounded" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-16 text-muted-foreground text-sm">
                    {t('table.states.noStaff')}
                  </TableCell>
                </TableRow>
              ) : (
                pagedRows.map((row, idx) => (
                  <TableRow
                    key={row.id}
                    className={`${adminTableStyles.row} cursor-pointer`}
                    onClick={() => void openDetail(row)}
                  >
                    <TableCell className={adminCellClass({ size: 'muted', className: 'font-mono w-10' })}>
                      {(page - 1) * ADMIN_PAGE_SIZE + idx + 1}
                    </TableCell>
                    <TableCell className={adminCellClass()}>
                      <PersonNameDisplay
                        id={row.id}
                        names={{
                          firstNameAr: row.firstNameAr,
                          lastNameAr: row.lastNameAr,
                          firstNameEn: row.firstNameEn,
                          lastNameEn: row.lastNameEn,
                        }}
                        language={language}
                        showAvatar={false}
                        primaryClassName="text-sm"
                      />
                    </TableCell>
                    <TableCell className={adminCellClass({ size: 'muted', className: 'max-w-[160px]' })}>
                      <span className="truncate block">{roleOf(row)}</span>
                    </TableCell>
                    <TableCell className={adminCellClass({ className: adminTableStyles.cellNationalId })}>
                      <span dir="ltr">{row.nationalId}</span>
                    </TableCell>
                    <TableCell className={adminCellClass({ className: adminTableStyles.cellPhone })}>
                      <span dir="ltr">{row.phone}</span>
                    </TableCell>
                    <TableCell className={adminCellClass({ size: 'muted', className: 'text-sm tabular-nums' })}>
                      {fmtDate(row.employmentStartDate)}
                    </TableCell>
                    <TableCell className={adminCellClass({ center: true })}>
                      <AdminMemberStatusBadge status={staffStatusForBadge(row.status)} compact />
                    </TableCell>
                    <TableCell className={adminCellClass({ center: true })} onClick={(e) => e.stopPropagation()}>
                      <AdminRowActions>
                        <AdminViewButton
                          tooltip={t('table.actions.view')}
                          onClick={() => void openDetail(row)}
                        />
                        <RoleGuard privilege="UPDATE_STAFF">
                          <AdminActionButton
                            tooltip={t('table.actions.edit')}
                            icon={Pencil}
                            variant="edit"
                            onClick={() => void openDetail(row, true)}
                          />
                        </RoleGuard>
                        <RoleGuard privilege="TERMINATE_STAFF">
                          <AdminActionButton
                            tooltip={t('table.actions.deactivate')}
                            icon={Trash2}
                            variant="delete"
                            onClick={() => {
                              setDeleteTarget(row);
                              setDeleteOpen(true);
                            }}
                          />
                        </RoleGuard>
                      </AdminRowActions>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <AdminPagination
          page={page}
          totalCount={filteredRows.length}
          onPageChange={setPage}
          isRTL={isRTL}
          disabled={loading}
        />
      </div>

      <Dialog open={detailOpen} onOpenChange={(o) => { if (!o) setDetailOpen(false); }}>
        <DialogContent className={adminDialogStyles.content} dir={isRTL ? 'rtl' : 'ltr'}>
          {selectedRow && (
            <StaffDetailPanel
              key={selectedRow.id}
              row={selectedRow}
              details={selectedDetails}
              loading={detailLoading}
              roleName={roleOf(selectedRow)}
              onDelete={() => {
                setDetailOpen(false);
                setDeleteTarget(selectedRow);
                setDeleteOpen(true);
              }}
              staffTypeOptions={staffTypeOptions}
              onSave={handleSaveFromPanel}
              isSaving={editSaving}
              defaultEditing={panelStartEditing}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={(o) => { if (!o) setDeleteOpen(false); }}>
        <DialogContent className="max-w-sm" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{t('deactivateDialog.title')}</DialogTitle>
            <DialogDescription>{t('deactivateDialog.description')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="destructive" onClick={() => void handleDelete()} disabled={deleteLoading}>
              {deleteLoading ? t('common:processing') : t('detailPanel.actions.deactivate')}
            </Button>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleteLoading}>
              {t('deactivateDialog.cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
