import { useState, useCallback, useEffect } from "react";
import {
  Link2,
  Search,
  RefreshCw,
  Loader2,
  CalendarCheck,
  ShieldAlert,
  CalendarDays,
  User,
  Phone,
  Users,
  Award,
} from "lucide-react";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import type { Locale } from "date-fns";

import { useTranslation } from "react-i18next";
import { useLanguage } from "../hooks/useLanguage";
import { adminTableStyles, adminHeadClass, adminCellClass, ADMIN_PAGE_SIZE, adminPageStyles, adminDialogStyles } from "../components/StaffPagesComponents/shared/adminTableStyles";
import { AdminPagination } from "../components/StaffPagesComponents/shared/AdminPagination";
import { AdminPageHeader } from "../components/StaffPagesComponents/shared/AdminPageHeader";
import { BilingualText } from "../components/StaffPagesComponents/shared/BilingualText";
import { getLocalizedText } from "../lib/localizedDisplay";
import {
  RecordViewField,
  RecordViewProfileHeader,
  RecordViewSection,
  RecordViewTabs,
} from "../components/StaffPagesComponents/shared/RecordViewPrimitives";
import { adminFieldIcons } from "../components/StaffPagesComponents/shared/adminRecordFields";
import { RoleGuard } from "../components/StaffPagesComponents/RoleGuard";
import { useAdminFormatters } from "../components/StaffPagesComponents/shared/adminFormatters";

import { useToast } from "../hooks/use-toast";
import api from "../services/axios";
import { Button } from "../components/StaffPagesComponents/ui/button";
import { Input } from "../components/StaffPagesComponents/ui/input";
import { Badge } from "../components/StaffPagesComponents/ui/badge";
import { AdminMemberStatusBadge } from "../components/StaffPagesComponents/shared/AdminMemberStatusBadge";
import { getAdminStatusConfig } from "../components/StaffPagesComponents/shared/adminMemberStatus";
import { AdminActionButton, AdminRowActions, AdminViewButton } from "../components/StaffPagesComponents/shared/AdminRowActions";
import { useTableExport } from "../utils/reportExport/useTableExport";
import { ExportReportButton } from "../components/StaffPagesComponents/shared/ExportReportButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/StaffPagesComponents/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/StaffPagesComponents/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/StaffPagesComponents/ui/dialog";

// ─── Types ───────────────────────────────────────────────────────────────────

type Participant = {
  id: string;
  full_name_ar?: string;
  full_name_en?: string;
  full_name?: string;
  phone_number: string | null;
  email: string | null;
  is_creator: boolean;
  registered_at: string;
};

type Invitation = {
  booking_id: string;
  share_token: string;
  share_url: string;
  booker: {
    name_ar?: string;
    name_en?: string;
    name?: string;
    type: string | null;
    phone: string | null;
    email: string | null;
  };
  booking_date: string;
  booking_time: {
    start: string;
    end: string;
    duration_minutes: number;
  };
  sport: {
    name_ar?: string;
    name_en?: string;
  };
  field: {
    name_ar?: string;
    name_en?: string;
  };
  participants: Participant[];
  stats: {
    expected_participants: number;
    registered_count: number;
    remaining_slots: number;
    is_full: boolean;
  };
  status: "pending_payment" | "payment_completed" | "in_progress" | "completed" | "cancelled" | "confirmed";
  payment_status: "pending" | "completed";
  created_at: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Invitation["status"] }) {
  return <AdminMemberStatusBadge status={status} compact />;
}

function getPersonDisplayName(
  ar: string | undefined | null,
  en: string | undefined | null,
  language: "ar" | "en",
  legacyName?: string | null,
  fallback = "—",
) {
  const localized = getLocalizedText(ar, en, language);
  if (localized) return localized;
  if (legacyName?.trim()) return legacyName.trim();
  return fallback;
}

function formatTime(timeStr: string, dateLocale: Locale) {
  if (!timeStr) return "";
  try {
    // API may return ISO datetime or HH:mm
    if (timeStr.includes("T") || (timeStr.includes("-") && timeStr.includes(":"))) {
      const parsed = new Date(timeStr);
      if (!Number.isNaN(parsed.getTime())) {
        return format(parsed, "h:mm a", { locale: dateLocale });
      }
    }
    const [h, m] = timeStr.split(":");
    const date = new Date();
    date.setHours(parseInt(h, 10), parseInt(m, 10), 0);
    return format(date, "h:mm a", { locale: dateLocale });
  } catch {
    return timeStr;
  }
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ManageInvitationsPage() {
  const { t } = useTranslation("ManageInvitationsPage");
  const { t: tStatus } = useTranslation("common");
  const { language, isRTL } = useLanguage();
  const { toast } = useToast();
  const { fmtDate } = useAdminFormatters();
  const dateLocale = language === "ar" ? ar : enUS;

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: ADMIN_PAGE_SIZE, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Dialogs & Panels
  const [selectedInv, setSelectedInv] = useState<Invitation | null>(null);
  const [detailTab, setDetailTab] = useState<"booking" | "participants">("booking");
  const [cancelDialog, setCancelDialog] = useState<Invitation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Data
  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: ADMIN_PAGE_SIZE.toString(),
      });
      if (search.trim()) params.append("search", search.trim());
      if (statusFilter !== "all") params.append("status", statusFilter);

      const res = await api.get<{ success: boolean; data: Invitation[]; pagination: Pagination }>(
        `/bookings/admin/invitations?${params.toString()}`
      );

      if (res.data?.success) {
        setInvitations(res.data.data ?? []);
        setPagination(res.data.pagination ?? { page: 1, limit: ADMIN_PAGE_SIZE, total: 0, pages: 1 });
      } else {
        setInvitations([]);
        setPagination({ page: 1, limit: ADMIN_PAGE_SIZE, total: 0, pages: 1 });
      }
    } catch {
      setInvitations([]);
      setPagination((prev) => ({ ...prev, total: 0, pages: 1 }));
      toast({
        title: t('toast.loadFailed'),
        description: t('toast.loadFailedDesc'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, toast, t]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, statusFilter, fetchData]);

  // Actions
  const formatShareUrl = (url: string) => {
    if (!url) return "";
    const normalizePath = (path: string) =>
      path.replace('/bookings/join/', '/bookings/share/');

    if (url.startsWith("http")) {
      try {
        const urlObj = new URL(url);
        const newPath = normalizePath(urlObj.pathname);
        return `${window.location.origin}${newPath}${urlObj.search}${urlObj.hash}`;
      } catch {
        return url;
      }
    }
    const safeUrl = normalizePath(url);
    return `${window.location.origin}${safeUrl.startsWith('/') ? '' : '/'}${safeUrl}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: t('toast.copied'), description: t('toast.copiedDesc') });
  };

  const handleCancelBooking = async () => {
    if (!cancelDialog) return;
    setIsDeleting(true);
    try {
      await api.delete(`/bookings/${cancelDialog.booking_id}`);
      toast({ title: t('toast.cancelSuccess'), description: t('toast.cancelSuccessDesc') });
      setCancelDialog(null);
      fetchData(pagination.page);
      if (selectedInv?.booking_id === cancelDialog.booking_id) {
        setSelectedInv(null);
      }
    } catch (error) {
      toast({ title: t('toast.cancelFailed'), description: t('toast.cancelFailedDesc'), variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  const exportHandle = useTableExport({
    reportId: "manage-invitations",
    titleEn: "Invitations Report",
    titleAr: "تقرير الدعوات",
    columns: [
      {
        headerEn: "Booker",
        headerAr: "الحاجز",
        accessor: (inv: Invitation) =>
          getPersonDisplayName(inv.booker?.name_ar, inv.booker?.name_en, language, inv.booker?.name, t("cell.unknown")),
        width: 24,
      },
      {
        headerEn: "Phone",
        headerAr: "الهاتف",
        accessor: (inv: Invitation) => inv.booker?.phone ?? t("cell.noPhone"),
        width: 16,
      },
      {
        headerEn: "Date",
        headerAr: "التاريخ",
        accessor: (inv: Invitation) => fmtDate(inv.booking_date),
        width: 14,
      },
      {
        headerEn: "Time",
        headerAr: "الوقت",
        accessor: (inv: Invitation) =>
          `${formatTime(inv.booking_time?.start, dateLocale)} - ${formatTime(inv.booking_time?.end, dateLocale)}`,
        width: 16,
      },
      {
        headerEn: "Field",
        headerAr: "الملعب",
        accessor: (inv: Invitation) =>
          getLocalizedText(inv.field?.name_ar, inv.field?.name_en, language) || t("cell.noField"),
        width: 18,
      },
      {
        headerEn: "Sport",
        headerAr: "الرياضة",
        accessor: (inv: Invitation) =>
          getLocalizedText(inv.sport?.name_ar, inv.sport?.name_en, language) || t("cell.noSport"),
        width: 16,
      },
      {
        headerEn: "Status",
        headerAr: "الحالة",
        accessor: (inv: Invitation) => tStatus(getAdminStatusConfig(inv.status).labelKey),
        width: 14,
      },
      {
        headerEn: "Participants",
        headerAr: "المشاركون",
        accessor: (inv: Invitation) =>
          `${inv.stats?.registered_count ?? 0}/${inv.stats?.expected_participants ?? 0}`,
        width: 12,
      },
    ],
    rows: invitations,
  });

  return (
    <div
      className="h-[calc(100vh-4rem)] flex flex-col bg-background"
      dir={isRTL ? 'rtl' : 'ltr'}
      lang={language}
    >
      <AdminPageHeader
        icon={Link2}
        title={t('header.title')}
        subtitle={t('header.subtitle')}
        actions={
          <>
            <ExportReportButton {...exportHandle} rowCount={pagination.total} />
            <Button variant="outline" size="sm" onClick={() => fetchData(pagination.page)} disabled={loading} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {t('header.refresh')}
            </Button>
          </>
        }
      />

      <div className={adminPageStyles.toolbar}>
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none`} />
          <Input
            placeholder={t('filters.searchPlaceholder')}
            className={`${adminPageStyles.toolbarSearch} ${isRTL ? "pr-9 pl-3" : "pl-9 pr-3"}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className={`${adminPageStyles.toolbarSelect} w-[11rem]`}>
            <SelectValue placeholder={t('filters.status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('filters.status')}</SelectItem>
            <SelectItem value="confirmed">{tStatus(getAdminStatusConfig("confirmed").labelKey)}</SelectItem>
            <SelectItem value="pending_payment">{tStatus(getAdminStatusConfig("pending_payment").labelKey)}</SelectItem>
            <SelectItem value="cancelled">{tStatus(getAdminStatusConfig("cancelled").labelKey)}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className={adminTableStyles.shell}>
        <div className={adminTableStyles.container}>
          <Table>
            <TableHeader className={adminTableStyles.header}>
              <TableRow className="hover:bg-transparent">
                <TableHead className={adminHeadClass({ className: "w-[200px]" })}>{t('table.booker')}</TableHead>
                <TableHead className={adminHeadClass({ className: "w-[140px]" })}>{t('table.phone')}</TableHead>
                <TableHead className={adminHeadClass({ className: "w-[180px]" })}>{t('table.dateTime')}</TableHead>
                <TableHead className={adminHeadClass()}>{t('table.fieldSport')}</TableHead>
                <TableHead className={adminHeadClass({ center: true, className: "w-[1%] whitespace-nowrap" })}>{t('table.status')}</TableHead>
                <TableHead className={adminHeadClass({ center: true, className: "w-[1%] whitespace-nowrap" })}>{t('table.participants')}</TableHead>
                <TableHead className={adminHeadClass({ center: true, className: "w-[140px]" })}>{t('table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className={adminTableStyles.body}>
              {loading && invitations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin mb-3 text-primary/60" />
                    <p className="font-medium text-slate-500">{t('loading')}</p>
                  </TableCell>
                </TableRow>
              ) : invitations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Search className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="font-medium text-slate-500 text-lg">{t('empty.title')}</p>
                    <p className="text-sm text-slate-400 mt-1">{t('empty.subtitle')}</p>
                  </TableCell>
                </TableRow>
              ) : (
                invitations.map((inv) => (
                  <TableRow key={inv.booking_id} className={adminTableStyles.row}>
                    <TableCell className={adminCellClass()}>
                      <div className="flex flex-col gap-1.5 items-start">
                        <span className="text-sm font-bold leading-none">
                          {getPersonDisplayName(inv.booker?.name_ar, inv.booker?.name_en, language, inv.booker?.name, t('cell.unknown'))}
                        </span>
                        {inv.booker?.type && (
                          <Badge variant="secondary" className="text-[10px] uppercase font-bold text-blue-700 bg-blue-50 border-blue-200/60 shadow-sm px-2 py-0.5">
                            {inv.booker.type === "member" ? t('bookerType.member') : t('bookerType.teamPlayer')}
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className={adminCellClass()}>
                      {inv.booker?.phone ? (
                        <div className="flex items-center gap-1.5 text-slate-600 font-medium bg-slate-50 px-2 py-1 rounded-md w-fit border border-slate-100">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          <span className="text-sm tracking-wide" dir="ltr">{inv.booker.phone}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground bg-slate-50 px-2 py-1 rounded-md w-fit inline-block">{t('cell.noPhone')}</span>
                      )}
                    </TableCell>
                    
                    <TableCell className={adminCellClass()}>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5 text-slate-800 font-bold bg-slate-50 rounded-md px-2 py-1 w-fit border border-slate-100">
                          <CalendarDays className="h-3.5 w-3.5 text-primary" />
                          <span className="text-sm">
                            {fmtDate(inv.booking_date)}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 px-1">
                          <CalendarCheck className="h-3.5 w-3.5 text-slate-400" />
                          {formatTime(inv.booking_time?.start, dateLocale)} - {formatTime(inv.booking_time?.end, dateLocale)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className={adminCellClass()}>
                      <div className="flex flex-col gap-1">
                        <BilingualText
                          ar={inv.field?.name_ar}
                          en={inv.field?.name_en}
                          language={language}
                          primaryClassName="font-bold text-sm text-[#1a365d]"
                          fallback={t('cell.noField')}
                        />
                        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md w-fit">
                          {getLocalizedText(inv.sport?.name_ar, inv.sport?.name_en, language) || t('cell.noSport')}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className={adminCellClass({ center: true, className: "whitespace-nowrap" })}>
                      <StatusBadge status={inv.status} />
                    </TableCell>

                    <TableCell className={adminCellClass({ center: true, className: "whitespace-nowrap" })}>
                      <div className="inline-flex items-center gap-1.5 bg-white border shadow-sm rounded-full px-3 py-1.5 text-sm font-bold text-slate-700 group-hover:border-primary/30 group-hover:shadow transition-all">
                        <User className="h-4 w-4 text-primary shrink-0" />
                        <span dir="ltr">{inv.stats?.registered_count}<span className="text-slate-400 font-medium">/</span>{inv.stats?.expected_participants}</span>
                      </div>
                    </TableCell>

                    <TableCell className={adminCellClass({ center: true })}>
                      <AdminRowActions>
                        <AdminViewButton
                          tooltip={t('actions.viewDetails')}
                          onClick={() => setSelectedInv(inv)}
                        />
                        <AdminActionButton
                          tooltip={t('actions.copyLink')}
                          icon={Link2}
                          variant="copy"
                          onClick={() => copyToClipboard(formatShareUrl(inv.share_url))}
                        />
                      </AdminRowActions>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <AdminPagination
          page={pagination.page}
          totalCount={pagination.total}
          pageSize={pagination.limit}
          onPageChange={(p) => void fetchData(p)}
          isRTL={isRTL}
          disabled={loading}
        />
      </div>

      {/* Detail Dialog — shared admin record view layout */}
      <Dialog
        open={!!selectedInv}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedInv(null);
            setDetailTab("booking");
          }
        }}
      >
        <DialogContent className={adminDialogStyles.content} dir={isRTL ? "rtl" : "ltr"} lang={language}>
          <DialogHeader className="sr-only">
            <DialogTitle>{t("panel.title")}</DialogTitle>
            <DialogDescription>{t("panel.title")}</DialogDescription>
          </DialogHeader>

          {selectedInv && (
            <div className={adminDialogStyles.panel}>
              <div className="px-6 pt-5 pb-0 border-b border-border shrink-0">
                <RecordViewProfileHeader
                  name={getPersonDisplayName(
                    selectedInv.booker?.name_ar,
                    selectedInv.booker?.name_en,
                    language,
                    selectedInv.booker?.name,
                    t("cell.unknown"),
                  )}
                  badges={
                    <div className="flex flex-col items-start gap-2">
                      {selectedInv.booker?.type === "team_member" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                          <Award className="w-3 h-3" />
                          {t("bookerType.teamPlayer")}
                        </span>
                      ) : selectedInv.booker?.type === "member" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
                          <Users className="w-3 h-3" />
                          {t("bookerType.member")}
                        </span>
                      ) : null}
                      <AdminMemberStatusBadge status={selectedInv.status} compact centered={false} />
                    </div>
                  }
                />
                <div className="mt-3">
                  <RecordViewTabs
                    tabs={[
                      { key: "booking" as const, label: t("panel.bookingInfo") },
                      { key: "participants" as const, label: t("panel.participants") },
                    ]}
                    active={detailTab}
                    onChange={setDetailTab}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {detailTab === "booking" ? (
                  <div className="p-5 space-y-4">
                    <RecordViewSection icon={CalendarCheck} title={t("panel.bookingInfo")}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <RecordViewField
                          icon={adminFieldIcons.registrationDate}
                          label={t("panel.date")}
                          value={fmtDate(selectedInv.booking_date)}
                          ltr
                          alignEnd={isRTL}
                        />
                        <RecordViewField
                          icon={adminFieldIcons.registrationTime}
                          label={t("panel.time")}
                          value={`${formatTime(selectedInv.booking_time?.start, dateLocale)} - ${formatTime(selectedInv.booking_time?.end, dateLocale)}`}
                          ltr
                          alignEnd={isRTL}
                        />
                        <RecordViewField
                          icon={CalendarDays}
                          label={t("panel.field")}
                          value={getLocalizedText(selectedInv.field?.name_ar, selectedInv.field?.name_en, language)}
                          fallback={t("cell.noField")}
                        />
                        <RecordViewField
                          icon={Award}
                          label={t("panel.sport")}
                          value={getLocalizedText(selectedInv.sport?.name_ar, selectedInv.sport?.name_en, language)}
                          fallback={t("cell.noSport")}
                        />
                        <RecordViewField
                          icon={Users}
                          label={t("panel.participants")}
                          value={`${selectedInv.stats?.registered_count ?? 0} / ${selectedInv.stats?.expected_participants ?? 0} ${t("panel.registered")}`}
                          ltr
                          alignEnd={isRTL}
                        />
                        <div className="space-y-1">
                          <p className="text-muted-foreground flex items-center gap-1.5 admin-font-label">
                            <Link2 className="w-3.5 h-3.5 shrink-0" />
                            {t("panel.shareLink")}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 gap-1.5 border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800"
                            onClick={() => copyToClipboard(formatShareUrl(selectedInv.share_url))}
                          >
                            <Link2 className="h-3.5 w-3.5" />
                            {t("cell.copyLink")}
                          </Button>
                        </div>
                      </div>
                    </RecordViewSection>

                    <RecordViewSection icon={adminFieldIcons.personalSection} title={t("panel.booker")}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <RecordViewField
                          icon={adminFieldIcons.personalSection}
                          label={t("panel.name")}
                          value={getPersonDisplayName(
                            selectedInv.booker?.name_ar,
                            selectedInv.booker?.name_en,
                            language,
                            selectedInv.booker?.name,
                          )}
                        />
                        <RecordViewField
                          icon={adminFieldIcons.phone}
                          label={t("panel.phone")}
                          value={selectedInv.booker?.phone}
                          ltr
                          alignEnd={isRTL}
                          fallback={t("cell.noPhone")}
                        />
                      </div>
                    </RecordViewSection>
                  </div>
                ) : (
                  <div className="p-5 space-y-4">
                    <RecordViewSection icon={Users} title={t("panel.participants")} variant="accent">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                          {selectedInv.stats?.registered_count} / {selectedInv.stats?.expected_participants} {t("panel.registered")}
                        </span>
                      </div>

                      {!selectedInv.participants || selectedInv.participants.length === 0 ? (
                        <div className="text-center py-6 text-sm text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                          {t("panel.noParticipants")}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {selectedInv.participants.map((p, i) => (
                            <div
                              key={p.id || i}
                              className="rounded-lg border border-border bg-card p-3 shadow-sm relative overflow-hidden"
                            >
                              {p.is_creator && (
                                <div className="absolute top-0 end-0 w-1 bg-primary h-full rounded-e-lg" />
                              )}
                              <div className="flex justify-between items-start gap-2">
                                <span className="font-medium text-[#1a365d] flex items-center gap-1.5">
                                  {p.is_creator && <User className="h-3.5 w-3.5 text-primary" />}
                                  {getPersonDisplayName(p.full_name_ar, p.full_name_en, language, p.full_name)}
                                </span>
                                {p.is_creator && (
                                  <Badge variant="outline" className="text-[10px] h-5 border-primary/30 text-primary">
                                    {t("panel.bookingCreator")}
                                  </Badge>
                                )}
                              </div>
                              {(p.phone_number || p.email) && (
                                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-2">
                                  {p.phone_number && <span dir="ltr">{p.phone_number}</span>}
                                  {p.email && <span>{p.email}</span>}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </RecordViewSection>
                  </div>
                )}
              </div>

              <div className="border-t border-border px-5 py-3 bg-muted/20 shrink-0 flex items-center gap-2">
                <RoleGuard privilege="SCHEDULE_MATCH">
                  {selectedInv.status !== "cancelled" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setCancelDialog(selectedInv)}
                    >
                      <ShieldAlert className="h-4 w-4" />
                      {t("panel.cancelButton")}
                    </Button>
                  )}
                </RoleGuard>
                <div className="flex gap-2 ms-auto">
                  <Button variant="outline" size="sm" onClick={() => setSelectedInv(null)}>
                    {t("cancelDialog.cancel")}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={!!cancelDialog} onOpenChange={(open) => !open && setCancelDialog(null)}>
        <DialogContent dir={isRTL ? 'rtl' : 'ltr'} lang={language}>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              {t('cancelDialog.title')}
            </DialogTitle>
            <DialogDescription className="pt-2">
              {t('cancelDialog.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm font-semibold border-s-2 border-border ps-2 bg-slate-50 py-1 rounded-sm">
              {t('cancelDialog.booking')}{" "}
              {getLocalizedText(cancelDialog?.field?.name_ar, cancelDialog?.field?.name_en, language)}{" "}
              {t('cancelDialog.day')}{" "}
              {fmtDate(cancelDialog?.booking_date)}
            </p>
          </div>
          <DialogFooter className="flex gap-2 sm:justify-start">
            <Button variant="outline" onClick={() => setCancelDialog(null)} disabled={isDeleting}>
              {t('cancelDialog.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleCancelBooking} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin ms-2" /> : null}
              {t('cancelDialog.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
