import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Search, RefreshCw, UserPlus, ChevronLeft, ChevronRight,
    Mail, Phone, MapPin, CreditCard, Briefcase, CalendarCheck,
    CalendarX, ShieldCheck, X, Pencil, Trash2, Users, Eye,
} from "lucide-react";
import api from "../services/axios";
import { useToast } from "../hooks/use-toast";
import { Button } from "../components/StaffPagesComponents/ui/button";
import { Input } from "../components/StaffPagesComponents/ui/input";
import { Badge } from "../components/StaffPagesComponents/ui/badge";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogDescription, DialogFooter,
} from "../components/StaffPagesComponents/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/StaffPagesComponents/ui/select";
import { RoleGuard } from "../components/StaffPagesComponents/RoleGuard";
import { useNavigate } from "react-router-dom";
import { StaffService } from "../services/staffService";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/StaffPagesComponents/ui/table";
import { adminTableStyles, adminHeadClass, adminCellClass } from "../components/StaffPagesComponents/shared/adminTableStyles";
import { PersonNameDisplay } from "../components/StaffPagesComponents/shared/PersonNameDisplay";
import { RecordViewProfileHeader } from "../components/StaffPagesComponents/shared/RecordViewPrimitives";
import { buildPersonName, getLocalizedText } from "../lib/localizedDisplay";
import { useLanguage } from "../hooks/useLanguage";
import { useLocalizedTranslation } from "../hooks/useLocalizedTranslation";
import { useTranslation } from "react-i18next";
import { validateStaffEdit } from "../lib/validation";

const PAGE_SIZE = 12;

// ─── Types ─────────────────────────────────────────────────────────────────

type StaffType = {
    id: number;
    code?: string;
    name_ar?: string; name_en?: string;
    title_ar?: string; title_en?: string;
};

type StaffApiItem = {
    id: number;
    first_name_en?: string; first_name_ar?: string;
    last_name_en?: string; last_name_ar?: string;
    email?: string;
    national_id?: string;
    phone?: string;
    address?: string;
    staff_type_id?: number | string;
    staff_type?: string;
    status?: string;
    is_active?: boolean;
    created_at?: string;
    employment_start_date?: string;
    employment_end_date?: string | null;
};

type StaffRow = {
    id: string;
    firstNameEn?: string; firstNameAr?: string;
    lastNameEn?: string; lastNameAr?: string;
    email?: string;
    nationalId: string;
    phone: string;
    address?: string;
    staffTypeId: number;
    staffTypeLabel: string;
    status?: string;
    isActive?: boolean;
    createdAt?: string;
    employmentStartDate?: string;
    employmentEndDate?: string | null;
};

type StaffDetailsData = {
    id: number;
    first_name_en?: string; first_name_ar?: string;
    last_name_en?: string; last_name_ar?: string;
    email?: string;
    national_id?: string;
    phone?: string;
    address?: string;
    staff_type_id?: number | string;
    employment_start_date?: string;
    employment_end_date?: string | null;
    status?: string;
    assigned_packages?: Array<{ id: number; code: string; name_en?: string; name_ar?: string }>;
};

type PrivilegeItem = { id: number; code: string; name_en?: string; name_ar?: string };

type EditFormData = {
    first_name_ar: string;
    last_name_ar: string;
    first_name_en: string;
    last_name_en: string;
    phone: string;
    address: string;
    staff_type_id: string;
};

// ─── Static fallback types ──────────────────────────────────────────────────

const STATIC_STAFF_TYPES: StaffType[] = [
    { id: 1, code: "ADMIN", name_ar: "المسئول", name_en: "Admin" },
    { id: 2, code: "CEO", name_ar: "المدير التنفيذى", name_en: "Executive Director" },
    { id: 3, code: "DEPUTY_CEO", name_ar: "نائب المدير التنفيذى", name_en: "Deputy Executive Director" },
    { id: 4, code: "EVENTS_MANAGER", name_ar: "مدير الفاعليات والاحداث", name_en: "Events Manager" },
    { id: 5, code: "EXEC_SECRETARY_MANAGER", name_ar: "مدير السكرتارية التنفيذىة", name_en: "Executive Secretariat Manager" },
    { id: 6, code: "MEDIA_CENTER_MANAGER", name_ar: "مدير المركز الاعلامى", name_en: "Media Center Manager" },
    { id: 7, code: "SPORT_ACTIVITY_SPECIALIST", name_ar: "اخصائى النشاط الرياضى", name_en: "Sports Activity Specialist" },
    { id: 8, code: "FINANCE_MANAGER", name_ar: "مدير الشئون المالية", name_en: "Finance Manager" },
    { id: 9, code: "HR_MEMBERSHIP_MANAGER", name_ar: "مدير الموارد البشرية وشئون العضوية", name_en: "HR Manager" },
    { id: 10, code: "CONTRACTS_MANAGER", name_ar: "مدير التعاقدات", name_en: "Contracts Manager" },
    { id: 11, code: "MAINTENANCE_MANAGER", name_ar: "مدير الصيانة", name_en: "Maintenance Manager" },
    { id: 12, code: "SPORT_ACTIVITY_MANAGER", name_ar: "مدير النشاط الرياضى", name_en: "Sports Activity Manager" },
    { id: 13, code: "SOCIAL_ACTIVITY_MANAGER", name_ar: "مدير النشاط الاجتماعى", name_en: "Social Activity Manager" },
    { id: 14, code: "PR_MANAGER", name_ar: "مدير العلاقات العامة", name_en: "PR Manager" },
    { id: 15, code: "MEDIA_CENTER_SPECIALIST", name_ar: "اخصائى المركز الاعلامى", name_en: "Media Center Specialist" },
    { id: 16, code: "MAINTENANCE_OFFICER", name_ar: "مسئول الصيانة", name_en: "Maintenance Officer" },
    { id: 17, code: "ADMIN_OFFICER", name_ar: "مسئول الشئون الادارية", name_en: "Admin Affairs Officer" },
    { id: 18, code: "SUPPORT_SERVICES", name_ar: "خدمات معاونة", name_en: "Support Services" },
    { id: 19, code: "SPORT_MANAGER", name_ar: "مدير الأنشطة الرياضية", name_en: "Sport Activity Manager" },
    { id: 20, code: "SPORT_SPECIALIST", name_ar: "أخصائي الأنشطة الرياضية", name_en: "Sport Activity Specialist" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDisplayDate = (
    v: string | null | undefined,
    locale: string,
    month: "long" | "short" = "long",
) => {
    if (!v) return "—";
    try {
        return new Date(v).toLocaleDateString(locale, { year: "numeric", month, day: "numeric" });
    } catch { return v; }
};

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status, row }: { status?: string; row?: StaffRow }) {
    const { t } = useLocalizedTranslation("StaffManagementPage");
    const isActive = status === "active" && row?.isActive !== false;
    return (
        <Badge
            className={
                isActive
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 text-[11px]"
                    : "bg-rose-100 text-rose-700 hover:bg-rose-100 border-0 text-[11px]"
            }
        >
            {isActive ? t("status.active") : t("status.inactive")}
        </Badge>
    );
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

type DetailPanelProps = {
    row: StaffRow;
    details: StaffDetailsData | null;
    privileges: PrivilegeItem[];
    loading: boolean;
    roleName: string;
    onDelete: () => void;
    staffTypeOptions: { id: number; label: string }[];
    onSave: (data: EditFormData) => Promise<void>;
    isSaving: boolean;
    defaultEditing?: boolean;
};

function DetailPanel({ row, details, privileges, loading, roleName, onDelete, staffTypeOptions, onSave, isSaving, defaultEditing = false }: DetailPanelProps) {
    const { t } = useLocalizedTranslation("StaffManagementPage");
    const { t: tVal } = useTranslation("validation");
    const { language } = useLanguage();
    const dateLocale = language === "en" ? "en-US" : "ar-EG";
    const fmtDate = (v?: string | null) => formatDisplayDate(v, dateLocale);
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(defaultEditing);

    // Inline edit state
    const [editFirstNameAr, setEditFirstNameAr] = useState("");
    const [editLastNameAr, setEditLastNameAr] = useState("");
    const [editFirstNameEn, setEditFirstNameEn] = useState("");
    const [editLastNameEn, setEditLastNameEn] = useState("");
    const [editPhone, setEditPhone] = useState("");
    const [editAddress, setEditAddress] = useState("");
    const [editStaffTypeId, setEditStaffTypeId] = useState("");

    const nameParts = details
        ? {
            firstNameAr: details.first_name_ar,
            lastNameAr: details.last_name_ar,
            firstNameEn: details.first_name_en,
            lastNameEn: details.last_name_en,
        }
        : {
            firstNameAr: row.firstNameAr,
            lastNameAr: row.lastNameAr,
            firstNameEn: row.firstNameEn,
            lastNameEn: row.lastNameEn,
        };
    const { primary: displayName, secondary: subtitleName } = buildPersonName(nameParts, language);
    const isActive = row.isActive !== false && (details?.status ?? row.status) === "active";

    const startEdit = () => {
        setEditFirstNameAr(row.firstNameAr ?? "");
        setEditLastNameAr(row.lastNameAr ?? "");
        setEditFirstNameEn(row.firstNameEn ?? "");
        setEditLastNameEn(row.lastNameEn ?? "");
        setEditPhone(row.phone === "—" ? "" : row.phone);
        setEditAddress(row.address ?? "");
        setEditStaffTypeId(String(row.staffTypeId || ""));
        setIsEditing(true);
    };

    const handleSave = async () => {
        const validationError = validateStaffEdit({
            first_name_ar: editFirstNameAr,
            last_name_ar: editLastNameAr,
            first_name_en: editFirstNameEn,
            last_name_en: editLastNameEn,
            phone: editPhone,
        }, tVal);
        if (validationError) {
            toast({ title: t("toasts.dataError.title"), description: validationError, variant: "destructive" });
            return;
        }
        try {
            await onSave({ first_name_ar: editFirstNameAr, last_name_ar: editLastNameAr, first_name_en: editFirstNameEn, last_name_en: editLastNameEn, phone: editPhone, address: editAddress, staff_type_id: editStaffTypeId });
            setIsEditing(false);
        } catch { /* stay in edit mode on error */ }
    };

    return (
        <div className="w-full flex flex-col" style={{ maxHeight: "90vh" }}>

            <div className="px-5 py-5 border-b border-border">
                <RecordViewProfileHeader
                    name={displayName}
                    subtitle={subtitleName}
                    badges={
                        <>
                            <span className="text-[10px] bg-muted text-muted-foreground rounded-full px-2 py-0.5 font-medium">{roleName}</span>
                            <span className={`text-[10px] rounded-full px-2 py-0.5 font-medium ${isActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                                {isActive ? t("status.active") : t("status.inactive")}
                            </span>
                        </>
                    }
                />
            </div>

            {/* ── Body ── */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {loading ? (
                    <div className="py-10 text-center text-sm text-muted-foreground">
                        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-2" />
                        {t("detailPanel.loading")}
                    </div>
                ) : isEditing ? (
                    /* ── Edit mode: same layout as view, fields become inputs ── */
                    <>
                        {/* Names — not shown in body during view mode but needed for edit */}
                        <section>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{t("detailPanel.sections.name")}</p>
                            <div className="rounded-xl border border-border bg-muted/30 divide-y divide-border overflow-hidden">
                                {[
                                    { icon: Users, label: t("detailPanel.fields.firstNameAr"), value: editFirstNameAr, setValue: setEditFirstNameAr, dir: "rtl" as const },
                                    { icon: Users, label: t("detailPanel.fields.lastNameAr"), value: editLastNameAr, setValue: setEditLastNameAr, dir: "rtl" as const },
                                    { icon: Users, label: t("detailPanel.fields.firstNameEn"), value: editFirstNameEn, setValue: setEditFirstNameEn, dir: "ltr" as const },
                                    { icon: Users, label: t("detailPanel.fields.lastNameEn"), value: editLastNameEn, setValue: setEditLastNameEn, dir: "ltr" as const },
                                ].map(({ icon: Icon, label, value, setValue, dir }) => (
                                    <div key={label} className="flex items-center gap-3 px-4 py-1.5">
                                        <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                                        <span className="text-[11px] text-muted-foreground w-32 shrink-0">{label}</span>
                                        <input
                                            value={value}
                                            onChange={(e) => setValue(e.target.value)}
                                            dir={dir}
                                            className="flex-1 bg-transparent text-sm font-medium outline-none border-b border-transparent focus:border-primary transition-colors py-1.5 min-w-0 text-right"
                                            style={{ direction: dir }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Contact — same rows as view mode but editable */}
                        <section>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{t("detailPanel.sections.contact")}</p>
                            <div className="rounded-xl border border-border bg-muted/30 divide-y divide-border overflow-hidden">
                                {/* Phone — editable */}
                                <div className="flex items-center gap-3 px-4 py-1.5">
                                    <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                                    <span className="text-[11px] text-muted-foreground w-24 shrink-0">{t("detailPanel.fields.phone")}</span>
                                    <input
                                        value={editPhone}
                                        onChange={(e) => setEditPhone(e.target.value)}
                                        placeholder="01012345678"
                                        dir="ltr"
                                        type="tel"
                                        className="flex-1 bg-transparent text-sm font-medium outline-none border-b border-transparent focus:border-primary transition-colors py-1.5 min-w-0 text-left"
                                    />
                                </div>
                                {/* Address — editable */}
                                <div className="flex items-center gap-3 px-4 py-1.5">
                                    <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                                    <span className="text-[11px] text-muted-foreground w-24 shrink-0">{t("detailPanel.fields.address")}</span>
                                    <input
                                        value={editAddress}
                                        onChange={(e) => setEditAddress(e.target.value)}
                                        placeholder={t("detailPanel.placeholders.address")}
                                        className="flex-1 bg-transparent text-sm font-medium outline-none border-b border-transparent focus:border-primary transition-colors py-1.5 min-w-0"
                                    />
                                </div>
                            </div>
                        </section>

                        <section>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{t("detailPanel.sections.employment")}</p>
                            <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
                                <div className="flex items-center gap-1.5 mb-1.5">
                                    <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
                                    <p className="text-[10px] text-muted-foreground">{t("detailPanel.fields.job")}</p>
                                </div>
                                <Select value={editStaffTypeId} onValueChange={setEditStaffTypeId}>
                                    <SelectTrigger className="h-8 text-sm border-0 bg-transparent p-0 shadow-none focus:ring-0">
                                        <SelectValue placeholder={t("detailPanel.placeholders.selectJob")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {staffTypeOptions.map((type) => (
                                            <SelectItem key={type.id} value={String(type.id)}>{type.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </section>
                    </>
                ) : (
                    /* ── Read-only view ── */
                    <>
                        <section>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{t("detailPanel.sections.contact")}</p>
                            <div className="rounded-xl border border-border bg-muted/30 divide-y divide-border overflow-hidden">
                                {[
                                    { icon: Mail, label: t("detailPanel.fields.email"), value: details?.email ?? row.email, ltr: true },
                                    { icon: Phone, label: t("detailPanel.fields.phone"), value: details?.phone ?? row.phone, ltr: true },
                                    { icon: CreditCard, label: t("detailPanel.fields.nationalId"), value: details?.national_id ?? row.nationalId, ltr: true },
                                    { icon: MapPin, label: t("detailPanel.fields.address"), value: details?.address ?? row.address, ltr: false },
                                ].map(({ icon: Icon, label, value, ltr }) => (
                                    <div key={label} className="flex items-center gap-3 px-4 py-2.5">
                                        <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                                        <span className="text-[11px] text-muted-foreground w-24 shrink-0">{label}</span>
                                        <span className={`text-sm font-medium flex-1 truncate ${ltr ? "text-left" : ""}`} dir={ltr ? "ltr" : undefined}>{value || "—"}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{t("detailPanel.sections.employment")}</p>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { icon: CalendarCheck, label: t("detailPanel.fields.startDate"), value: fmtDate(details?.employment_start_date ?? row.employmentStartDate) },
                                    { icon: CalendarX, label: t("detailPanel.fields.endDate"), value: fmtDate(details?.employment_end_date ?? row.employmentEndDate) },
                                    { icon: Briefcase, label: t("detailPanel.fields.job"), value: roleName },
                                ].map(({ icon: Icon, label, value }) => (
                                    <div key={label} className="rounded-xl border border-border bg-muted/30 p-3">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                                            <p className="text-[10px] text-muted-foreground">{label}</p>
                                        </div>
                                        <p className="text-sm font-semibold">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {details && (
                            <section>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{t("detailPanel.sections.assignedPackages")}</p>
                                {(details.assigned_packages ?? []).length === 0 ? (
                                    <div className="rounded-xl border border-dashed border-border py-5 text-center text-sm text-muted-foreground">{t("detailPanel.messages.noPackages")}</div>
                                ) : (
                                    <div className="flex flex-wrap gap-1.5">
                                        {details.assigned_packages?.map((pkg) => (
                                            <span key={pkg.id} className="inline-flex items-center gap-1 rounded-lg border border-primary/20 bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">
                                                📦 {getLocalizedText(pkg.name_ar, pkg.name_en, language) || pkg.code}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}

                        {privileges.length > 0 && (
                            <section>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                                    {t("detailPanel.sections.privileges")}
                                    <span className="mr-1.5 bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 text-[9px]">{privileges.length}</span>
                                </p>
                                <details className="rounded-xl border border-border bg-muted/30 overflow-hidden">
                                    <summary className="px-4 py-2.5 text-sm cursor-pointer select-none flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                                        <ShieldCheck className="w-3.5 h-3.5" /> {t("detailPanel.actions.viewPrivileges")}
                                    </summary>
                                    <div className="px-4 pb-3 flex flex-wrap gap-1.5 border-t border-border pt-2.5 max-h-36 overflow-y-auto">
                                        {privileges.map((p) => (
                                            <span key={p.id} className="inline-block rounded bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground">{p.code}</span>
                                        ))}
                                    </div>
                                </details>
                            </section>
                        )}
                    </>
                )}
            </div>

            {/* ── Footer ── */}
            <div className="border-t border-border px-5 py-3 flex gap-2 bg-muted/20 shrink-0">
                {isEditing ? (
                    <>
                        <Button size="sm" className="flex-1 gap-1.5" onClick={() => void handleSave()} disabled={isSaving}>
                            {isSaving ? t("detailPanel.actions.saving") : <><Pencil className="w-3.5 h-3.5" /> {t("detailPanel.actions.saveChanges")}</>}
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={() => setIsEditing(false)} disabled={isSaving}>
                            <X className="w-3.5 h-3.5" /> {t("detailPanel.actions.cancel")}
                        </Button>
                    </>
                ) : (
                    <>
                        <RoleGuard privilege="UPDATE_STAFF">
                            <Button size="sm" className="flex-1 gap-1.5" onClick={startEdit}>
                                <Pencil className="w-3.5 h-3.5" /> {t("detailPanel.actions.edit")}
                            </Button>
                        </RoleGuard>
                        <RoleGuard privilege="TERMINATE_STAFF">
                            <Button size="sm" variant="destructive" className="flex-1 gap-1.5" onClick={onDelete}>
                                <Trash2 className="w-3.5 h-3.5" /> {t("detailPanel.actions.deactivate")}
                            </Button>
                        </RoleGuard>
                    </>
                )}
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StaffManagementPage() {
    const { t } = useLocalizedTranslation("StaffManagementPage");
    const { t: tVal } = useTranslation("validation");
    const { language, isRTL } = useLanguage();
    const { toast } = useToast();
    const navigate = useNavigate();
    const dateLocale = language === "en" ? "en-US" : "ar-EG";
    const fmtDate = useCallback(
        (v?: string | null) => formatDisplayDate(v, dateLocale),
        [dateLocale],
    );

    // List state
    const [rows, setRows] = useState<StaffRow[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    // Staff types
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

    const staffTypeOptions = useMemo(() =>
        staffTypes.map((st) => ({
            id: st.id,
            label: getLocalizedText(st.name_ar || st.title_ar, st.name_en || st.title_en, language) || `#${st.id}`,
        })),
        [staffTypes, language]);

    // Detail dialog
    const [selectedRow, setSelectedRow] = useState<StaffRow | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedDetails, setSelectedDetails] = useState<StaffDetailsData | null>(null);
    const [privileges, setPrivileges] = useState<PrivilegeItem[]>([]);
    const [detailLoading, setDetailLoading] = useState(false);
    const [panelStartEditing, setPanelStartEditing] = useState(false);

    // Edit saving state (form state lives in DetailPanel)
    const [editSaving, setEditSaving] = useState(false);

    // Delete dialog state
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<StaffRow | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Load staff types
    useEffect(() => {
        StaffService.getStaffTypes()
            .then((res) => { if (res.success && Array.isArray(res.data)) setStaffTypes(res.data); })
            .catch(() => {/* keep static */ });
    }, []);

    // Fetch ALL staff once (client-side pagination)
    const fetchList = useCallback(async () => {
        setLoading(true);
        try {
            type ListRes = { success: boolean; data: StaffApiItem[]; pagination?: { pages: number; total: number } };
            const res = await api.get<ListRes>("/staff", { params: { page: 1, limit: 500 } });
            const payload = res.data;
            const mapped: StaffRow[] = (payload?.data ?? []).map((item) => {
                const typeId = Number.isFinite(Number(item.staff_type_id)) ? Number(item.staff_type_id) : 0;
                return {
                    id: String(item.id),
                    firstNameEn: item.first_name_en,
                    firstNameAr: item.first_name_ar,
                    lastNameEn: item.last_name_en,
                    lastNameAr: item.last_name_ar,
                    email: item.email,
                    nationalId: item.national_id || "—",
                    phone: item.phone || "—",
                    address: item.address,
                    staffTypeId: typeId,
                    staffTypeLabel: staffTypeLabelById.get(typeId) || item.staff_type || (typeId ? String(typeId) : "—"),
                    status: item.status,
                    isActive: item.is_active,
                    createdAt: item.created_at,
                    employmentStartDate: item.employment_start_date,
                    employmentEndDate: item.employment_end_date ?? null,
                };
            });
            setRows(mapped);
            setTotal(mapped.length);
        } catch (err) {
            toast({ title: t("toasts.loadFailed.title"), description: err instanceof Error ? err.message : "", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    }, [staffTypeLabelById, toast]);

    useEffect(() => { void fetchList(); }, [fetchList]);

    const openDetail = useCallback(async (row: StaffRow, startEditing = false) => {
        setSelectedRow(row);
        setPanelStartEditing(startEditing);
        setDetailOpen(true);
        setSelectedDetails(null);
        setPrivileges([]);
        setDetailLoading(true);
        try {
            const [detRes, privRes] = await Promise.allSettled([
                api.get<{ success: boolean; data: StaffDetailsData }>(`/staff/${row.id}`),
                api.get<{ success: boolean; data: PrivilegeItem[] }>(`/staff/${row.id}/privileges`),
            ]);
            if (detRes.status === "fulfilled" && detRes.value.data?.success) {
                const det = detRes.value.data.data;
                setSelectedDetails(det);
                if (det.phone || det.email || det.address) {
                    setRows((prev) => prev.map((r) =>
                        r.id === row.id
                            ? { ...r, phone: det.phone || r.phone, email: det.email || r.email, address: det.address || r.address }
                            : r
                    ));
                    setSelectedRow((prev) => prev && prev.id === row.id
                        ? { ...prev, phone: det.phone || prev.phone, email: det.email || prev.email, address: det.address || prev.address }
                        : prev
                    );
                }
            }
            if (privRes.status === "fulfilled" && privRes.value.data?.success) {
                const privData = privRes.value.data.data;
                setPrivileges(Array.isArray(privData) ? privData : []);
            }
        } catch { /* non-fatal */ } finally {
            setDetailLoading(false);
        }
    }, []);

    // Save handler passed to DetailPanel
    const handleSaveFromPanel = async (formData: EditFormData) => {
        if (!selectedRow) return;
        const validationError = validateStaffEdit({
            first_name_ar: formData.first_name_ar,
            last_name_ar: formData.last_name_ar,
            first_name_en: formData.first_name_en,
            last_name_en: formData.last_name_en,
            phone: formData.phone,
        }, tVal);
        if (validationError) {
            toast({ title: t("toasts.dataError.title"), description: validationError, variant: "destructive" });
            return;
        }
        setEditSaving(true);
        try {
            await api.put(`/staff/${selectedRow.id}`, {
                first_name_ar: formData.first_name_ar.trim() || undefined,
                last_name_ar: formData.last_name_ar.trim() || undefined,
                first_name_en: formData.first_name_en.trim() || undefined,
                last_name_en: formData.last_name_en.trim() || undefined,
                phone: formData.phone.trim() || undefined,
                address: formData.address.trim() || undefined,
                staff_type_id: formData.staff_type_id ? Number(formData.staff_type_id) : undefined,
            });
            toast({ title: t("toasts.updateSuccess.title"), description: t("toasts.updateSuccess.desc") });
            void fetchList();
            void openDetail(selectedRow);
        } catch (err) {
            toast({ title: t("toasts.updateFailed.title"), description: err instanceof Error ? err.message : "", variant: "destructive" });
            throw err;
        } finally {
            setEditSaving(false);
        }
    };

    // Delete / deactivate
    const openDelete = () => {
        if (!selectedRow) return;
        setDeleteTarget(selectedRow);
        setDeleteOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleteLoading(true);
        try {
            await api.patch(`/staff/${deleteTarget.id}/deactivate`);
            toast({ title: t("toasts.deactivateSuccess.title"), description: t("toasts.deactivateSuccess.desc") });
            setDeleteOpen(false);
            setSelectedRow(null);
            setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
        } catch (err) {
            toast({ title: t("toasts.deactivateFailed.title"), description: err instanceof Error ? err.message : "", variant: "destructive" });
        } finally {
            setDeleteLoading(false);
            setDeleteTarget(null);
        }
    };

    // Reset to page 1 when search changes
    useEffect(() => { setPage(1); }, [search]);

    // Filter by name only; paginate client-side
    const filteredRows = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter((r) => {
            const fullAr = [r.firstNameAr, r.lastNameAr].filter(Boolean).join(" ").toLowerCase();
            const fullEn = [r.firstNameEn, r.lastNameEn].filter(Boolean).join(" ").toLowerCase();
            return fullAr.includes(q) || fullEn.includes(q);
        });
    }, [rows, search]);

    const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
    const pagedRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const roleOf = (row: StaffRow) => staffTypeLabelById.get(row.staffTypeId) || row.staffTypeLabel;

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col gap-0" dir={isRTL ? 'rtl' : 'ltr'}>

            {/* ── Page Header ── */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background shrink-0">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Users className="w-6 h-6 text-primary" />
                        {t("page.title")}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        {t("page.totalStaff")}: <strong>{total}</strong>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <RoleGuard privilege="CREATE_STAFF">
                        <Button
                            size="sm"
                            className="gap-2"
                            onClick={() => navigate("/staff/dashboard/admin/staff/new")}
                        >
                            <UserPlus className="w-4 h-4" />
                            {t("page.newStaff")}
                        </Button>
                    </RoleGuard>
                </div>
            </div>

            {/* ── Main area ── */}
            <div className="flex flex-1 overflow-hidden">

                {/* ── Left: Table panel ── */}
                <div className="flex flex-col w-full overflow-hidden">

                    {/* Search + refresh + pagination bar */}
                    <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-muted/30 shrink-0 flex-wrap">

                        {/* Pagination – top left */}
                        <div className="flex items-center gap-1.5 shrink-0">
                            <button
                                disabled={page <= 1 || loading}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                className="p-2 rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-40"
                                aria-label={t("list.prevPage")}
                            >
                                <ChevronRight className="w-4 h-4" style={{ transform: isRTL ? 'none' : 'rotate(180deg)' }} />
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                                .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("…");
                                    acc.push(p);
                                    return acc;
                                }, [])
                                .map((p, i) =>
                                    p === "…" ? (
                                        <span key={`el-${i}`} className="px-1.5 text-muted-foreground text-xs">…</span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p as number)}
                                            className={`min-w-[36px] h-9 rounded-md text-xs font-medium transition-colors border ${page === p
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "border-border hover:bg-muted text-foreground"
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    )
                                )}

                            <button
                                disabled={page >= totalPages || loading}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                className="p-2 rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-40"
                                aria-label={t("list.nextPage")}
                            >
                                <ChevronLeft className="w-4 h-4" style={{ transform: isRTL ? 'none' : 'rotate(180deg)' }} />
                            </button>
                        </div>

                        <div className="flex-1" />

                        {/* Search */}
                        <div className="relative w-full sm:w-80">
                            <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t("list.searchPlaceholder")}
                                className={`h-9 text-sm ${isRTL ? 'pr-9' : 'pl-9'}`}
                            />
                        </div>
                        <button
                            onClick={() => { void fetchList(); }}
                            disabled={loading}
                            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground disabled:opacity-40"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        </button>
                    </div>

                    {/* Native HTML Table – consistent with RegistrationManagementPage style */}
                    <div className={adminTableStyles.container} style={{ scrollbarWidth: "none" }}>
                        <Table>
                            <TableHeader className={adminTableStyles.header}>
                                <TableRow>
                                    <TableHead className={adminHeadClass({ className: "w-10" })}>{t("table.headers.number")}</TableHead>
                                    <TableHead className={adminHeadClass()}>{t("table.headers.staff")}</TableHead>
                                    <TableHead className={adminHeadClass()}>{t("table.headers.job")}</TableHead>
                                    <TableHead className={adminHeadClass()}>{t("table.headers.startDate")}</TableHead>
                                    <TableHead className={adminHeadClass({ center: true })}>{t("table.headers.status")}</TableHead>
                                    <TableHead className={adminHeadClass({ center: true })}>{t("table.headers.actions")}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className={adminTableStyles.body}>
                                {loading ? (
                                    Array.from({ length: 8 }).map((_, i) => (
                                        <TableRow key={i} className="animate-pulse">
                                            <TableCell className="px-4 py-3"><div className="h-3 w-5 bg-muted rounded" /></TableCell>
                                            <TableCell className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-muted shrink-0" />
                                                    <div className="space-y-1.5">
                                                        <div className="h-3 w-28 bg-muted rounded" />
                                                        <div className="h-2.5 w-20 bg-muted rounded" />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-4 py-3"><div className="h-3 w-24 bg-muted rounded" /></TableCell>
                                            <TableCell className="px-4 py-3"><div className="h-3 w-20 bg-muted rounded" /></TableCell>
                                            <TableCell className="px-4 py-3 text-center"><div className="h-5 w-12 bg-muted rounded-full mx-auto" /></TableCell>
                                            <TableCell className="px-4 py-3 text-center"><div className="h-7 w-20 bg-muted rounded mx-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredRows.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-16 text-muted-foreground text-sm">
                                            {search ? t("table.states.noStaff") : t("table.states.noStaff")}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pagedRows.map((row, idx) => (
                                            <TableRow
                                                key={row.id}
                                                className={`${adminTableStyles.row} cursor-pointer`}
                                                onClick={() => { void openDetail(row); }}
                                            >
                                                <TableCell className={adminCellClass({ size: "muted", className: "font-mono w-10" })}>
                                                    {(page - 1) * 12 + idx + 1}
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
                                                        avatarSize="md"
                                                        primaryClassName="text-sm"
                                                    />
                                                </TableCell>

                                                <TableCell className={adminCellClass({ size: "muted", className: "max-w-[180px]" })}>
                                                    <span className="truncate block">{roleOf(row)}</span>
                                                </TableCell>

                                                <TableCell className={adminCellClass({ className: "text-sm tabular-nums" })}>
                                                    {fmtDate(row.employmentStartDate)}
                                                </TableCell>

                                                <TableCell className={adminCellClass({ center: true })}>
                                                    <StatusBadge status={row.status} row={row} />
                                                </TableCell>

                                                <TableCell className={adminCellClass({ center: true })} onClick={(e) => e.stopPropagation()}>
                                                    <div className={adminTableStyles.actions}>
                                                        <button
                                                            title={t("table.actions.view")}
                                                            onClick={() => { void openDetail(row); }}
                                                            className="p-1.5 rounded-md hover:bg-primary/10 text-primary transition-colors"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <RoleGuard privilege="UPDATE_STAFF">
                                                            <button
                                                                title={t("table.actions.edit")}
                                                                onClick={(e) => { e.stopPropagation(); void openDetail(row, true); }}
                                                                className="p-1.5 rounded-md hover:bg-amber-100 text-amber-600 transition-colors"
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </button>
                                                        </RoleGuard>
                                                        <RoleGuard privilege="TERMINATE_STAFF">
                                                            <button
                                                                title={t("table.actions.deactivate")}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedRow(row);
                                                                    setDeleteTarget(row);
                                                                    setDeleteOpen(true);
                                                                }}
                                                                className="p-1.5 rounded-md hover:bg-rose-100 text-rose-600 transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </RoleGuard>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>


                </div>
            </div>

            {/* ── Detail/Edit Dialog ── */}
            <Dialog open={detailOpen} onOpenChange={(o) => { if (!o) setDetailOpen(false); }}>
                <DialogContent className="max-w-lg w-full p-0 overflow-hidden" style={{ maxHeight: "90vh" }} dir={isRTL ? 'rtl' : 'ltr'}>
                    {selectedRow && (
                        <DetailPanel
                            key={selectedRow.id}
                            row={selectedRow}
                            details={selectedDetails}
                            privileges={privileges}
                            loading={detailLoading}
                            roleName={roleOf(selectedRow)}
                            onDelete={() => { setDetailOpen(false); openDelete(); }}
                            staffTypeOptions={staffTypeOptions}
                            onSave={handleSaveFromPanel}
                            isSaving={editSaving}
                            defaultEditing={panelStartEditing}
                        />
                    )}
                </DialogContent>
            </Dialog>



            {/* ── Delete Confirm Dialog ── */}
            <Dialog open={deleteOpen} onOpenChange={(o) => { if (!o) setDeleteOpen(false); }}>
                <DialogContent className="max-w-sm" dir={isRTL ? 'rtl' : 'ltr'}>
                    <DialogHeader>
                        <DialogTitle>{t("deactivateDialog.title")}</DialogTitle>
                        <DialogDescription>
                            {t("deactivateDialog.description")}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="destructive" onClick={() => void handleDelete()} disabled={deleteLoading}>
                            {deleteLoading ? t("common:processing") : t("detailPanel.actions.deactivate")}
                        </Button>
                        <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleteLoading}>{t("deactivateDialog.cancel")}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
