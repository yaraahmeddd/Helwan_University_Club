import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link2,
  Search,
  RefreshCw,
  Loader2,
  CalendarCheck,
  X,
  User,
  Phone,
  ArrowRight,
  ShieldAlert,
  CalendarDays,
} from "lucide-react";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import type { Locale } from "date-fns";

import { useTranslation } from "react-i18next";
import { useLanguage } from "../hooks/useLanguage";
import { adminTableStyles, adminHeadClass, adminCellClass, ADMIN_PAGE_SIZE } from "../components/StaffPagesComponents/shared/adminTableStyles";
import { AdminPagination } from "../components/StaffPagesComponents/shared/AdminPagination";
import { AdminPageHeader } from "../components/StaffPagesComponents/shared/AdminPageHeader";
import { BilingualText } from "../components/StaffPagesComponents/shared/BilingualText";
import { getLocalizedText, localeFontFamily } from "../lib/localizedDisplay";
import { RoleGuard } from "../components/StaffPagesComponents/RoleGuard";
import { useAdminFormatters } from "../components/StaffPagesComponents/shared/adminFormatters";

import { useToast } from "../hooks/use-toast";
import api from "../services/axios";
import { Button } from "../components/StaffPagesComponents/ui/button";
import { Input } from "../components/StaffPagesComponents/ui/input";
import { Badge } from "../components/StaffPagesComponents/ui/badge";
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
  const { t } = useTranslation("ManageInvitationsPage");
  const nowrap = "whitespace-nowrap shrink-0";
  switch (status) {
    case "confirmed":
    case "payment_completed":
    case "completed":
      return <Badge className={`bg-emerald-100 text-emerald-700 border-emerald-200 ${nowrap}`}>{t('status.confirmed')}</Badge>;
    case "pending_payment":
      return <Badge className={`bg-amber-100 text-amber-700 border-amber-200 ${nowrap}`}>{t('status.pending_payment')}</Badge>;
    case "cancelled":
      return <Badge variant="outline" className={`text-muted-foreground ${nowrap}`}>{t('status.cancelled')}</Badge>;
    case "in_progress":
      return <Badge className={`bg-blue-100 text-blue-700 border-blue-200 ${nowrap}`}>{t('status.in_progress')}</Badge>;
    default:
      return <Badge variant="outline" className={nowrap}>{status}</Badge>;
  }
}

function truncate(str: string, length = 8) {
  if (!str) return "";
  return str.length > length ? str.substring(0, length) + "..." : str;
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
          <Button variant="outline" size="sm" onClick={() => fetchData(pagination.page)} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {t('header.refresh')}
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-6">

      {/* Controls: Filters */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row gap-3 items-center w-full xl:w-auto">
          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder={t('filters.searchPlaceholder')} 
              className="ps-3 pe-9 w-full rounded-lg bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] rounded-lg bg-slate-50 border-slate-200 font-medium focus:ring-2 focus:ring-primary/20">
              <SelectValue placeholder={t('filters.statusPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('filters.allStatuses')}</SelectItem>
              <SelectItem value="confirmed">{t('status.confirmed')}</SelectItem>
              <SelectItem value="pending_payment">{t('status.pending_payment')}</SelectItem>
              <SelectItem value="cancelled">{t('status.cancelled')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border shadow-sm bg-background overflow-hidden flex flex-col">
        <div className={adminTableStyles.container}>
          <Table>
            <TableHeader className={adminTableStyles.header}>
              <TableRow className="hover:bg-transparent">
                <TableHead className={adminHeadClass({ className: "w-[200px]" })}>{t('table.booker')}</TableHead>
                <TableHead className={adminHeadClass({ className: "w-[140px]" })}>{t('table.phone')}</TableHead>
                <TableHead className={adminHeadClass({ className: "w-[180px]" })}>{t('table.dateTime')}</TableHead>
                <TableHead className={adminHeadClass()}>{t('table.fieldSport')}</TableHead>
                <TableHead className={adminHeadClass({ className: "w-[1%] whitespace-nowrap" })}>{t('table.status')}</TableHead>
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

                    <TableCell className={adminCellClass({ className: "whitespace-nowrap" })}>
                      <StatusBadge status={inv.status} />
                    </TableCell>

                    <TableCell className={adminCellClass({ center: true, className: "whitespace-nowrap" })}>
                      <div className="inline-flex items-center gap-1.5 bg-white border shadow-sm rounded-full px-3 py-1.5 text-sm font-bold text-slate-700 group-hover:border-primary/30 group-hover:shadow transition-all">
                        <User className="h-4 w-4 text-primary shrink-0" />
                        <span dir="ltr">{inv.stats?.registered_count}<span className="text-slate-400 font-medium">/</span>{inv.stats?.expected_participants}</span>
                      </div>
                    </TableCell>

                    <TableCell className={adminCellClass({ center: true })}>
                      <div className={adminTableStyles.actions}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 shadow-sm text-primary border-primary/20 hover:bg-primary hover:text-white transition-colors"
                          onClick={() => setSelectedInv(inv)}
                          title={t('actions.viewDetails')}
                        >
                          <span className="hidden sm:inline-block ms-1.5">{t('actions.details')}</span>
                          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/10 hover:shadow-sm border border-transparent hover:border-primary/20 transition-all rounded-md"
                          onClick={() => copyToClipboard(formatShareUrl(inv.share_url))}
                          title={t('actions.copyLink')}
                        >
                          <Link2 className="h-4 w-4" />
                        </Button>
                      </div>
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
      </div>

      {/* Slide-over Detail Panel */}
      <AnimatePresence>
        {selectedInv && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedInv(null)}
              className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
            />
            {/* Panel */}
            <motion.div
              initial={{ x: "-100%", opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0.5 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 bottom-0 start-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col overflow-hidden border-e"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50/80">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                    <Link2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1a365d]">{t('panel.title')}</h3>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{truncate(selectedInv.booking_id, 12)}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setSelectedInv(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                
                {/* Meta Summary */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">{t('panel.date')}</span>
                    </div>
                    <div className="font-semibold text-sm">
                      {fmtDate(selectedInv.booking_date)}
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                      <CalendarCheck className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">{t('panel.time')}</span>
                    </div>
                    <div className="font-semibold text-sm" dir="ltr">
                      {formatTime(selectedInv.booking_time?.start, dateLocale)} - {formatTime(selectedInv.booking_time?.end, dateLocale)}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-sm border-b pb-1">{t('panel.bookingInfo')}</h4>
                    <StatusBadge status={selectedInv.status} />
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('panel.field')}</span>
                      <span className="font-medium text-start">
                        {getLocalizedText(selectedInv.field?.name_ar, selectedInv.field?.name_en, language) || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('panel.sport')}</span>
                      <span className="font-medium text-start">
                        {getLocalizedText(selectedInv.sport?.name_ar, selectedInv.sport?.name_en, language) || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">{t('panel.shareLink')}</span>
                      <Button variant="outline" size="sm" className="h-7 text-xs px-2 gap-1.5" onClick={() => copyToClipboard(formatShareUrl(selectedInv.share_url))}>
                        <Link2 className="h-3 w-3" />{t('cell.copyLink')}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mt-6">
                  <h4 className="font-semibold text-sm border-b pb-1">{t('panel.booker')}</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground text-xs py-0.5">{t('panel.name')}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {getPersonDisplayName(selectedInv.booker?.name_ar, selectedInv.booker?.name_en, language, selectedInv.booker?.name)}
                        </span>
                        {selectedInv.booker?.type && (
                          <Badge variant="secondary" className="text-[10px] h-5">{selectedInv.booker.type === "member" ? t('bookerType.memberShort') : t('bookerType.teamPlayerShort')}</Badge>
                        )}
                      </div>
                    </div>
                    {selectedInv.booker?.phone && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-xs py-0.5">{t('panel.phone')}</span>
                        <div className="flex gap-2">
                          <span className="font-medium" dir="ltr">{selectedInv.booker.phone}</span>
                          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => copyToClipboard(selectedInv.booker?.phone || "")}>
                            <Phone className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4 mt-6">
                  <div className="flex justify-between items-center border-b pb-1">
                    <h4 className="font-semibold text-sm">{t('panel.participants')}</h4>
                    <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                      {selectedInv.stats?.registered_count} / {selectedInv.stats?.expected_participants} {t('panel.registered')}
                    </span>
                  </div>
                  
                  {(!selectedInv.participants || selectedInv.participants.length === 0) ? (
                    <div className="text-center py-6 text-sm text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                      {t('panel.noParticipants')}
                    </div>
                  ) : (
                    <div className="space-y-3 mt-3">
                      {selectedInv.participants.map((p, i) => (
                        <div key={p.id || i} className="flex flex-col gap-1 p-3 rounded-lg border border-slate-100 bg-white shadow-sm relative overflow-hidden">
                          {p.is_creator && (
                            <div className="absolute top-0 end-0 w-1 bg-primary h-full rounded-e-lg"></div>
                          )}
                          <div className="flex justify-between items-start">
                            <span className="font-medium text-sm text-[#1a365d] flex items-center gap-1.5">
                              {p.is_creator && <User className="h-3.5 w-3.5 text-primary" />}
                              {getPersonDisplayName(p.full_name_ar, p.full_name_en, language, p.full_name)}
                            </span>
                            {p.is_creator && (
                              <Badge variant="outline" className="text-[10px] h-4 leading-none py-0 px-1 border-primary/30 text-primary">{t('panel.bookingCreator')}</Badge>
                            )}
                          </div>
                          
                          {(p.phone_number || p.email) && (
                            <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                              {p.phone_number && <span dir="ltr">{p.phone_number}</span>}
                              {p.email && <span>{p.email}</span>}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
              
              {/* Footer Actions */}
              <div className="p-6 border-t bg-slate-50 mt-auto">
                {selectedInv.status !== "cancelled" && (
                  <RoleGuard privilege="SCHEDULE_MATCH">
                    <Button 
                      variant="destructive" 
                      className="w-full gap-2"
                      onClick={() => setCancelDialog(selectedInv)}
                    >
                      <ShieldAlert className="h-4 w-4" />
                      {t('panel.cancelButton')}
                    </Button>
                  </RoleGuard>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
