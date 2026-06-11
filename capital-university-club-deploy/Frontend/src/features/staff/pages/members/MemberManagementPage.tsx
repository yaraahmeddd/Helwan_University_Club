import React, { useCallback, useEffect, useMemo, useState } from "react";




import {

    Search, RefreshCw,

    ChevronUp, ChevronDown, ChevronsUpDown,

    Users, UserCheck, Trophy,

    Pencil, Shield, Eye, Trash2,

    AlertTriangle, CheckCircle,

    XCircle, Clock, Filter,
    Mail, Phone, MapPin, Calendar, Globe, User, Award, Hash, HeartPulse, FileBadge, CreditCard
} from "lucide-react";
import { useTableExport } from '@/utils/reportExport/useTableExport';
import { ExportReportButton } from '@/components/StaffPagesComponents/shared/ExportReportButton';

import api from '@/services/axios';

import { useToast } from '@/hooks/use-toast';
import { useTranslation } from "react-i18next";
import { useMemberEditSchema } from '@/hooks/useValidation';
import { useAdminFieldValidation } from '@/hooks/useAdminFieldValidation';
import { validateAdminMemberEditForm } from '@/lib/validation/adminForms';

import { Button } from '@/components/StaffPagesComponents/ui/button';

import { Input } from '@/components/StaffPagesComponents/ui/input';

import { Label } from '@/components/StaffPagesComponents/ui/label';

import {

    Dialog, DialogContent, DialogHeader, DialogTitle,

    DialogDescription, DialogFooter,

} from '@/components/StaffPagesComponents/ui/dialog';

import {

    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,

} from '@/components/StaffPagesComponents/ui/select';

import {

    Popover,

    PopoverContent,

    PopoverTrigger,

} from '@/components/StaffPagesComponents/ui/popover';

import {
    AdminActionButton,
    AdminRowActions,
    AdminViewButton,
} from '@/components/StaffPagesComponents/shared/AdminRowActions';

import {
    TooltipProvider,
} from '@/components/StaffPagesComponents/ui/tooltip';

import { RoleGuard } from '@/components/StaffPagesComponents/RoleGuard';
import { BACKEND_ORIGIN } from '@/config/backend';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/StaffPagesComponents/ui/table';
import { adminTableStyles, adminHeadClass, adminCellClass, adminDialogStyles, ADMIN_PAGE_SIZE, adminTableBadgeClass, adminTableStatusBadgeClass, adminPageStyles } from '@/components/StaffPagesComponents/shared/adminTableStyles';
import { AdminPagination } from '@/components/StaffPagesComponents/shared/AdminPagination';
import { AdminMemberStatusBadge } from '@/components/StaffPagesComponents/shared/AdminMemberStatusBadge';
import { ADMIN_MEMBER_STATUS_CONFIG, getAdminMemberStatusConfig } from '@/components/StaffPagesComponents/shared/adminMemberStatus';
import { PersonNameDisplay } from '@/components/StaffPagesComponents/shared/PersonNameDisplay';
import { formatAdminDate, formatAdminTime, getAdminLocale, useAdminFormatters } from '@/components/StaffPagesComponents/shared/adminFormatters';
import { adminFieldIcons } from '@/components/StaffPagesComponents/shared/adminRecordFields';
import { MemberEditPanel } from '@/components/StaffPagesComponents/shared/MemberEditPanel';
import {
    RecordViewTabs,
    RecordViewSection,
    RecordViewField,
    RecordViewProfileHeader,
} from '@/components/StaffPagesComponents/shared/RecordViewPrimitives';
import { buildPersonName, getEntityName } from '@/lib/localizedDisplay';
import { useLanguage } from '@/hooks/useLanguage';






// ─── Types ─────────────────────────────────────────────────────────────────



type MemberType = { id: number; name_en?: string; name_ar?: string; code?: string };

type MemberAccount = { email?: string };



type SportItem = {

    id: number;

    name_ar?: string;

    name_en?: string;

    pivot?: {

        level?: string;

        position?: string;

        join_date?: string;

    };

};



type MemberApiItem = {

    id: number;

    first_name_en: string; first_name_ar: string;

    last_name_en: string; last_name_ar: string;

    gender?: string;

    phone?: string;

    nationality?: string;

    birthdate?: string | null;

    national_id: string;

    health_status?: string;

    is_foreign?: boolean;

    address?: string;

    member_type_id: number;

    member_type?: MemberType;

    account?: MemberAccount;

    points_balance?: number;

    status: string;

    created_at?: string;

    updated_at?: string;

    sports?: SportItem[]; // ← ADDED

    photo?: string;

    national_id_front?: string;

    national_id_back?: string;

    medical_report?: string;

    university_student_detail?: {
        faculty_id?: number | null;
        graduation_year?: number | null;
        faculty?: { id: number; name_en?: string; name_ar?: string };
    };

    employee_detail?: {
        profession_id?: number;
        department_en?: string;
        department_ar?: string;
        salary?: number | string | null;
        profession?: { id: number; name_en?: string; name_ar?: string };
    };

    retired_employee_detail?: {
        profession_code?: string | null;
        former_department_en?: string | null;
        former_department_ar?: string | null;
        retirement_date?: string | null;
        last_salary?: number | string | null;
    };

    outsider_detail?: {
        job_title_en?: string | null;
        job_title_ar?: string | null;
        employment_status?: string | null;
        passport_number?: string | null;
        country?: string | null;
        visa_status?: string | null;
        visitor_type?: string | null;
        duration_months?: number | null;
    };

};



// ← ADDED: Team Member API response type

type TeamMemberApiItem = {

    id: number;

    firstNameEn?: string;

    lastNameEn?: string;

    firstNameAr?: string;

    lastNameAr?: string;

    first_name_en?: string;

    last_name_en?: string;

    first_name_ar?: string;

    last_name_ar?: string;

    name_en?: string;

    name_ar?: string;

    national_id?: string;

    phone?: string;

    email?: string;

    account?: { email?: string };

    gender?: string;

    nationality?: string;

    birthdate?: string | null;

    address?: string;

    status: string;

    created_at?: string;

    updated_at?: string;

    teams?: Array<{

        name?: string;

        startDate?: string;

        endDate?: string;

        status?: string;

        price?: number;

    }>;

    sports?: Array<{

        id?: number;

        name?: string;

        status?: string;

        start_date?: string;

        end_date?: string;

        price?: number;

    }>;

};



type MemberRow = {

    uniqueId: string;

    id: string;

    firstNameAr: string; firstNameEn: string;

    lastNameAr: string; lastNameEn: string;

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

    sports: Array<{ // ← ADDED

        id: number;

        name: string;

        level?: string;

        position?: string;

        joinDate?: string;

    }>;

};



type SortField = "name" | "memberType" | "status" | "createdAt" | "nationalId";

type SortDir = "asc" | "desc";

type TabKey = "all" | "members" | "teamMembers";



// ─── Constants ───────────────────────────────────────────────────────────────



const TEAM_PLAYER_CODES = new Set([

    "TEAM_MEMBER", "TEAM_PLAYER", "PLAYER", "SPORT_MEMBER",

    "TEAM", "ATHLETE", "SPORT_PLAYER",

]);

const isTeamPlayerType = (t?: MemberType) => {

    if (!t) return false;

    const code = (t.code ?? "").toUpperCase();

    const nameEn = (t.name_en ?? "").toLowerCase();

    const nameAr = (t.name_ar ?? "");

    return (

        TEAM_PLAYER_CODES.has(code) ||

        nameEn.includes("team") ||

        nameEn.includes("player") ||

        nameEn.includes("athlete") ||

        nameAr.includes("لاعب") ||

        nameAr.includes("فريق")

    );

};



const STATUS_CONFIG = ADMIN_MEMBER_STATUS_CONFIG;



const GENDER_LABELS: Record<string, string> = {

    male: "gender.male", female: "gender.female", other: "gender.other",

};



const PAGE_SIZE = ADMIN_PAGE_SIZE;

// ─── Status Badge ─────────────────────────────────────────────────────────────



function StatusBadge({ status, compact = false }: { status: string; compact?: boolean }) {
    return <AdminMemberStatusBadge status={status} compact={compact} />;
}



// ─── Sort indicator ───────────────────────────────────────────────────────────



function SortIcon({ field, active, dir }: { field: SortField; active: SortField; dir: SortDir }) {

    if (field !== active) return <ChevronsUpDown className={`${adminTableStyles.icon} opacity-40`} />;

    return dir === "asc" ? <ChevronUp className={`${adminTableStyles.icon} text-primary`} /> : <ChevronDown className={`${adminTableStyles.icon} text-primary`} />;

}



// ─── Detail Panel (IMPROVED) ─────────────────────────────────────────────────



type PanelProps = {

    row: MemberRow;

    details: MemberApiItem | null;

    loading: boolean;

    sports: { id: number; team_name: string; status: string }[];

    onClose: () => void;

    onEdit: () => void;

    onChangeStatus: () => void;

    onDelete: () => void;

};



function DetailPanel({ row, details, loading, sports, onEdit, onChangeStatus, onDelete }: PanelProps) {
    const { t } = useTranslation('MemberManagementPage');
    const { language, isRTL } = useLanguage();
    const { fmtDate } = useAdminFormatters();
    const locale = getAdminLocale(language);
    const d = details;
    const createdAt = d?.created_at ?? row.createdAt;
    const { primary: displayName, secondary: subtitleName } = buildPersonName(row, language);
    const [detailTab, setDetailTab] = React.useState<'info' | 'sports' | 'photos'>('info');
    const notAvailable = t('common.notAvailable', { defaultValue: '—' });

    return (
        <div className={adminDialogStyles.panel} dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="px-6 pt-5 pb-0 border-b border-border shrink-0">
                <RecordViewProfileHeader
                    photoUrl={getFileUrl(d?.photo) || null}
                    photoAlt={t('detail.photos.personalPhoto')}
                    name={displayName}
                    subtitle={subtitleName}
                    badges={
                        <>
                            {row.isTeamPlayer ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                                    <Award className="w-3 h-3" />
                                    {t('memberTypes.teamMember')}
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
                                    <Users className="w-3 h-3" />
                                    {t('memberTypes.member')}
                                </span>
                            )}
                            <StatusBadge status={row.status} />
                        </>
                    }
                />
                <div className="mt-3">
                    <RecordViewTabs
                        tabs={[
                            { key: 'info' as const, label: t('detail.tabInfo') },
                            { key: 'sports' as const, label: t('detail.tabSports') },
                            { key: 'photos' as const, label: t('detail.tabPhotos') },
                        ]}
                        active={detailTab}
                        onChange={setDetailTab}
                    />
                </div>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto">

                {loading ? (
                    <div className="py-16 text-center" role="status" aria-live="polite" lang={language}>
                        <div className="w-7 h-7 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3" aria-hidden />
                        <p className="text-sm text-muted-foreground">{t('detail.loading', { lng: language })}</p>
                    </div>
                ) : detailTab === 'info' ? (
                    <div className="p-5 space-y-4">
                        <RecordViewSection icon={adminFieldIcons.accountSection} title={t('detail.sectionAccount', 'Account Information')}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <RecordViewField icon={adminFieldIcons.memberId} label={t('detail.fieldMemberId')} value={`MEM-${String(row.id).padStart(5, '0')}`} ltr fallback={notAvailable} />
                                <RecordViewField icon={adminFieldIcons.email} label={t('detail.fieldEmail')} value={d?.account?.email ?? row.email} ltr fallback={notAvailable} />
                                <RecordViewField
                                    icon={adminFieldIcons.registrationDate}
                                    label={t('detail.fieldRegistrationDate')}
                                    value={formatAdminDate(createdAt, locale)}
                                    ltr
                                    alignEnd={isRTL}
                                    fallback={notAvailable}
                                />
                                <RecordViewField
                                    icon={adminFieldIcons.registrationTime}
                                    label={t('detail.fieldRegistrationTime')}
                                    value={formatAdminTime(createdAt, locale)}
                                    ltr
                                    alignEnd={isRTL}
                                    fallback={notAvailable}
                                />
                                <RecordViewField icon={adminFieldIcons.memberType} label={t('detail.fieldMemberType')} value={row.memberTypeLabel} fallback={notAvailable} />
                            </div>
                        </RecordViewSection>

                        <RecordViewSection icon={adminFieldIcons.personalSection} title={t('detail.sectionPersonal', 'Personal Information')}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <RecordViewField icon={adminFieldIcons.gender} label={t('detail.fieldGender')} value={t(GENDER_LABELS[d?.gender ?? row.gender ?? ''] || row.gender || '', { defaultValue: notAvailable })} fallback={notAvailable} />
                                <RecordViewField icon={adminFieldIcons.nationality} label={t('detail.fieldNationality')} value={(() => {
                                    const nat = d?.nationality ?? row.nationality;
                                    if (!nat) return undefined;
                                    if (nat.toLowerCase() === 'egyptian') return isRTL ? 'مصرى' : 'Egyptian';
                                    if (nat.toLowerCase() === 'foreigner' || nat.toLowerCase() === 'non-egyptian') return isRTL ? 'أجنبى' : 'Foreigner';
                                    return nat;
                                })()} fallback={notAvailable} />
                                <RecordViewField icon={adminFieldIcons.birthdate} label={t('detail.fieldBirthdate')} value={fmtDate(d?.birthdate ?? row.birthdate)} ltr fallback={notAvailable} />
                                <RecordViewField icon={adminFieldIcons.nationalId} label={t('detail.fieldNationalId')} value={d?.national_id ?? row.nationalId} ltr alignEnd={isRTL} fallback={notAvailable} />
                            </div>
                        </RecordViewSection>

                        <RecordViewSection icon={adminFieldIcons.contactSection} title={t('detail.sectionContact', 'Contact Information')}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <RecordViewField icon={adminFieldIcons.phone} label={t('detail.fieldPhone')} value={d?.phone ?? row.phone} ltr alignEnd={isRTL} fallback={notAvailable} />
                                <RecordViewField icon={adminFieldIcons.address} label={t('detail.fieldAddress')} value={d?.address ?? row.address} fallback={notAvailable} />
                                <RecordViewField icon={adminFieldIcons.healthStatus} label={t('detail.fieldHealthStatus')} value={d?.health_status ?? row.healthStatus} fallback={notAvailable} />
                            </div>
                        </RecordViewSection>

                        {/* Payment info is shown on Subscriptions & Payments pages from live API data */}

                    </div>

                ) : detailTab === 'sports' ? (

                    <div className="p-5 space-y-5">

                        {/* Sports */}

                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                                {t('detail.tabSports')}
                                {sports.length > 0 && (
                                    <span className="me-1.5 text-[10px] bg-primary/10 text-primary rounded-full px-1.5 py-0.5 font-bold">
                                        {sports.length}
                                    </span>
                                )}
                            </p>
                            {sports.length === 0 ? (
                                <p className="text-xs text-muted-foreground/60 py-2">
                                    {row.isTeamPlayer ? t('detail.noSports') : t('detail.notPlayer')}
                                </p>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {sports.map((s) => (
                                        <div key={s.id} className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2">
                                            <div className="flex items-center gap-2">
                                                <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                                <span className="text-sm font-semibold">{s.team_name}</span>
                                            </div>
                                            <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 ${s.status === 'active' ? 'bg-emerald-100 text-emerald-700'
                                                    : s.status === 'pending' ? 'bg-amber-100 text-amber-700'
                                                        : 'bg-rose-100 text-rose-700'}`}>
                                                {s.status === 'active' ? t('detail.sportStatusActive') : s.status === 'pending' ? t('detail.sportStatusPending') : s.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>

                ) : (

                    /* Photos tab */
                    <div className="p-5 space-y-4">

                        {/* Personal photo */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                                <span className="w-1 h-4 bg-primary rounded-full inline-block" />
                                {t('detail.photos.personalPhoto')}
                            </h4>
                            <div className="flex justify-center">
                                {getFileUrl(d?.photo) ? (
                                    <a href={getFileUrl(d?.photo)} target="_blank" rel="noreferrer">
                                        <img src={getFileUrl(d?.photo)} alt={t('detail.photos.personalPhoto')} className="h-48 w-auto rounded-xl border-2 border-border shadow-md object-cover cursor-zoom-in hover:opacity-90 transition-opacity" />
                                    </a>
                                ) : (
                                    <div className="h-48 w-36 rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/10 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                        <Eye className="h-8 w-8 opacity-40" />
                                        <span className="text-xs">{t('detail.photos.noPersonalPhoto')}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ID front + back */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {([
                                { label: t('detail.photos.idFront'), src: d?.national_id_front, color: '#1b71bc' },
                                { label: t('detail.photos.idBack'), src: d?.national_id_back, color: '#1b71bc' },
                            ] as const).map(doc => (
                                <div key={doc.label} className="space-y-2">
                                    <h4 className="text-sm font-bold flex items-center gap-2">
                                        <span className="w-1 h-4 rounded-full inline-block" style={{ background: doc.color }} />
                                        {doc.label}
                                    </h4>
                                    <div className="aspect-[1.6/1] w-full rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/10 overflow-hidden flex items-center justify-center group hover:border-primary/50 transition-all">
                                        {getFileUrl(doc.src) ? (
                                            <a href={getFileUrl(doc.src)} target="_blank" rel="noreferrer" className="w-full h-full">
                                                <img src={getFileUrl(doc.src)} alt={doc.label} className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                                            </a>
                                        ) : (
                                            <div className="text-center p-4">
                                                <Eye className="h-7 w-7 mx-auto text-muted-foreground/40 mb-1" />
                                                <span className="text-xs text-muted-foreground">{t('detail.photos.notUploaded')}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Medical report */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-bold flex items-center gap-2">
                                <span className="w-1 h-4 bg-orange-500 rounded-full inline-block" />
                                {t('detail.photos.medicalReport')}
                            </h4>
                            <div className="min-h-[220px] w-full rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/10 overflow-hidden flex items-center justify-center group hover:border-orange-400/60 transition-all">
                                {getFileUrl(d?.medical_report) ? (
                                    <a href={getFileUrl(d?.medical_report)} target="_blank" rel="noreferrer" className="w-full h-full">
                                        <img src={getFileUrl(d?.medical_report)} alt={t('detail.photos.medicalReport')} className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
                                    </a>
                                ) : (
                                    <div className="text-center p-8">
                                        <Eye className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                                        <span className="text-sm text-muted-foreground">{t('detail.photos.noMedicalReport')}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                )}

            </div>

            {/* ── Footer ── */}

            <div className="border-t border-border px-5 py-3 bg-muted/20 shrink-0 flex items-center gap-2">
                <RoleGuard privilege="DELETE_MEMBER">
                    <Button variant="destructive" size="sm" className="gap-1.5" onClick={onDelete}>
                        <Trash2 className="w-4 h-4" /> {t('detail.footer.delete')}
                    </Button>
                </RoleGuard>

                <div className="flex gap-2 me-auto">
                    <RoleGuard privilege="MANAGE_MEMBER_BLOCK">
                        <Button variant="outline" size="sm" className="gap-1.5" onClick={onChangeStatus}>
                            <Shield className="w-4 h-4" /> {t('detail.footer.changeStatus')}
                        </Button>
                    </RoleGuard>
                    <RoleGuard privilege="UPDATE_MEMBER">
                        <Button size="sm" className="gap-1.5" onClick={onEdit}>
                            <Pencil className="w-4 h-4" /> {t('detail.footer.edit')}
                        </Button>
                    </RoleGuard>
                </div>
            </div>

        </div>

    );

}



// ─── Main Page ────────────────────────────────────────────────────────────────





// ─── File URL helper ─────────────────────────────────────────────────────────
// Resolve the backend origin dynamically — mirrors the logic in axios.ts.
const getBackendOrigin = (): string => {
    // Hard-coded backend origin for file URLs
    return BACKEND_ORIGIN;
};

const getFileUrl = (f?: string | null): string => {
    if (!f) return "";
    if (f.startsWith("data:")) return f;

    // If backend saved/returned an absolute URL (e.g. http://10.100.104.157/uploads/...),
    // rewrite it to our hard-coded base (localhost:3000) so all images start the same way.
    if (f.startsWith("http://") || f.startsWith("https://")) {
        try {
            const u = new URL(f);
            const pathname = u.pathname.replace(/\\/g, "/");
            const fileBase = getBackendOrigin();
            if (pathname.startsWith("/api/uploads/")) return `${fileBase}${pathname.replace(/^\/api/, "")}`;
            if (pathname.startsWith("/uploads/")) return `${fileBase}${pathname}`;
            return f;
        } catch {
            // If parsing fails, fall through to relative handling below.
        }
    }

    const fileBase = getBackendOrigin();
    const normalized = f.replace(/\\/g, "/");
    const clean = normalized.startsWith("/") ? normalized : `/${normalized}`;

    if (clean.startsWith("/uploads/")) {
        return `${fileBase}${clean}`;
    }
    if (clean.startsWith("/api/uploads/")) {
        // Strip the /api prefix — the file server serves directly under /uploads.
        return `${fileBase}${clean.replace(/^\/api/, "")}`;
    }
    return `${fileBase}/uploads${clean}`;
};

export default function MemberManagementPage() {
    const { t } = useTranslation('MemberManagementPage');
    const { t: tStatus } = useTranslation('common');
    const { language, isRTL } = useLanguage();
    const { fmtDate } = useAdminFormatters();
    const locale = getAdminLocale(language);
    const { toast } = useToast();
    const memberEditSchema = useMemberEditSchema();
    const {
        tVal,
        handleArabicChange,
        handleEnglishChange,
        handleDigitsChange,
        handlePhoneChange,
    } = useAdminFieldValidation();
    const [editFieldErrors, setEditFieldErrors] = useState<Record<string, string | undefined>>({});

    const mapMemberEditErrors = (errors: Record<string, string>): Record<string, string | undefined> => ({
        firstNameAr: errors.first_name_ar,
        lastNameAr: errors.last_name_ar,
        firstNameEn: errors.first_name_en,
        lastNameEn: errors.last_name_en,
        phone: errors.phone,
        email: errors.email,
        nationalId: errors.national_id,
        birthdate: errors.birthdate,
        nationality: errors.nationality,
        address: errors.address,
        health: errors.health_status,
        departmentAr: errors.department_ar,
        departmentEn: errors.department_en,
        jobTitleAr: errors.job_title_ar,
        jobTitleEn: errors.job_title_en,
        formerDepartmentAr: errors.former_department_ar,
        formerDepartmentEn: errors.former_department_en,
    });

    const getMemberDisplayName = useCallback((row: Pick<MemberRow, "firstNameAr" | "lastNameAr" | "firstNameEn" | "lastNameEn">) => {
        return buildPersonName(row, language).primary;
    }, [language]);



    const [allRows, setAllRows] = useState<MemberRow[]>([]);

    const [fetching, setFetching] = useState(false);



    const [search, setSearch] = useState("");

    const [tab, setTab] = useState<TabKey>("all");

    const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
    const [dateFilter, setDateFilter] = useState<string>("");

    const [statusPopoverOpen, setStatusPopoverOpen] = useState(false);

    const [sortField, setSortField] = useState<SortField>("createdAt");

    const [sortDir, setSortDir] = useState<SortDir>("desc");

    const [page, setPage] = useState(1);



    const [selectedRow, setSelectedRow] = useState<MemberRow | null>(null);

    const [selectedDetail, setSelectedDetail] = useState<MemberApiItem | null>(null);

    const [detailLoading, setDetailLoading] = useState(false);

    // Sports the selected member is subscribed to (from /sports/team-members/user/:id)

    const [memberSports, setMemberSports] = useState<{ id: number; team_name: string; status: string }[]>([]);



    const [editOpen, setEditOpen] = useState(false);

    const [editFirstNameAr, setEditFirstNameAr] = useState("");

    const [editFirstNameEn, setEditFirstNameEn] = useState("");

    const [editLastNameAr, setEditLastNameAr] = useState("");

    const [editLastNameEn, setEditLastNameEn] = useState("");

    const [editGender, setEditGender] = useState("");

    const [editPhone, setEditPhone] = useState("");

    const [editBirthdate, setEditBirthdate] = useState("");

    const [editNationality, setEditNationality] = useState("");

    const [editAddress, setEditAddress] = useState("");

    const [editHealth, setEditHealth] = useState("");

    const [editEmail, setEditEmail] = useState("");

    const [editNationalId, setEditNationalId] = useState("");

    const [editFacultyId, setEditFacultyId] = useState("");

    const [editGraduationYear, setEditGraduationYear] = useState("");

    const [editProfessionId, setEditProfessionId] = useState("");

    const [editDepartmentEn, setEditDepartmentEn] = useState("");

    const [editDepartmentAr, setEditDepartmentAr] = useState("");

    const [editSalary, setEditSalary] = useState("");

    const [editProfessionCode, setEditProfessionCode] = useState("");

    const [editFormerDepartmentEn, setEditFormerDepartmentEn] = useState("");

    const [editFormerDepartmentAr, setEditFormerDepartmentAr] = useState("");

    const [editRetirementDate, setEditRetirementDate] = useState("");

    const [editLastSalary, setEditLastSalary] = useState("");

    const [editJobTitleEn, setEditJobTitleEn] = useState("");

    const [editJobTitleAr, setEditJobTitleAr] = useState("");

    const [editEmploymentStatus, setEditEmploymentStatus] = useState("");

    const [editPassportNumber, setEditPassportNumber] = useState("");

    const [editCountry, setEditCountry] = useState("");

    const [editVisaStatus, setEditVisaStatus] = useState("");

    const [editVisitorType, setEditVisitorType] = useState("");

    const [editDurationMonths, setEditDurationMonths] = useState("");

    const [faculties, setFaculties] = useState<Array<{ id: number; name_en?: string; name_ar?: string }>>([]);

    const [professions, setProfessions] = useState<Array<{ id: number; name_en?: string; name_ar?: string }>>([]);

    const [editSaving, setEditSaving] = useState(false);



    const [statusOpen, setStatusOpen] = useState(false);

    const [newStatus, setNewStatus] = useState("");

    const [statusReason, setStatusReason] = useState("");

    const [statusSaving, setStatusSaving] = useState(false);



    const [deleteOpen, setDeleteOpen] = useState(false);

    const [deleteSaving, setDeleteSaving] = useState(false);



    // Map raw API item → row (ADDED SPORTS MAPPING)

    const mapItem = useCallback((item: MemberApiItem): MemberRow => ({

        uniqueId: `member_${item.id}`,

        id: String(item.id),

        firstNameAr: item.first_name_ar,

        firstNameEn: item.first_name_en,

        lastNameAr: item.last_name_ar,

        lastNameEn: item.last_name_en,

        email: item.account?.email,

        phone: item.phone,

        nationalId: item.national_id,

        gender: item.gender,

        nationality: item.nationality,

        birthdate: item.birthdate,

        healthStatus: item.health_status,

        isForeign: item.is_foreign ?? false,

        address: item.address,

        memberTypeId: item.member_type_id,

        memberTypeLabel: getEntityName(item.member_type, language) || `#${item.member_type_id}`,

        memberTypeCode: item.member_type?.code ?? "",

        isTeamPlayer: isTeamPlayerType(item.member_type),

        pointsBalance: item.points_balance ?? 0,

        status: item.status,

        createdAt: item.created_at,

        sports: (item.sports ?? []).map(s => ({ // ← ADDED SPORTS MAPPING

            id: s.id,

            name: getEntityName(s, language) || `Sport #${s.id}`,

            level: s.pivot?.level,

            position: s.pivot?.position,

            joinDate: s.pivot?.join_date,

        })),

    }), [language]);



    // ← ADDED: Map team member API item → row

    const mapTeamMemberItem = useCallback((item: TeamMemberApiItem): MemberRow => ({

        uniqueId: `team_${item.id}`,

        id: String(item.id),

        firstNameAr: item.firstNameAr || item.first_name_ar || '',

        firstNameEn: item.firstNameEn || item.first_name_en || '',

        lastNameAr: item.lastNameAr || item.last_name_ar || '',

        lastNameEn: item.lastNameEn || item.last_name_en || '',

        email: undefined,

        phone: item.phone,

        nationalId: item.national_id || '',

        gender: item.gender,

        nationality: item.nationality,

        birthdate: item.birthdate,

        healthStatus: undefined,

        isForeign: false,

        address: item.address,

        memberTypeId: 0,

        memberTypeLabel: t('memberTypes.teamPlayer', { defaultValue: "لاعب فريق" }),

        memberTypeCode: "TEAM_MEMBER",

        isTeamPlayer: true,

        pointsBalance: 0,

        status: item.status,

        createdAt: item.created_at,

        sports: (item.teams ?? []).map((t, idx) => ({

            id: idx,

            name: t.name || `Sport #${idx + 1}`,

            level: undefined,

            position: undefined,

            joinDate: t.startDate,

        })),

    }), [t]);



    // Fetch all members

    const fetchAll = useCallback(async () => {

        setFetching(true);

        try {

            // Fetch regular members - paginate through all pages

            type MembersRes = { success: boolean; data: MemberApiItem[]; pagination?: { pages: number; total: number } };

            const first = await api.get<MembersRes>("/members", { params: { page: 1, limit: 1 } });

            const totalPages = first.data?.pagination?.pages ?? 1;



            let memberRows: MemberRow[] = [];

            if (totalPages > 0) {

                // Fetch all pages (use a reasonable per-page limit like 100)

                const pageLimit = 100;

                const totalMembers = first.data?.pagination?.total ?? 0;

                const pagesToFetch = Math.ceil(totalMembers / pageLimit);



                console.log(`Fetching members: ${totalMembers} total, ${pagesToFetch} pages at ${pageLimit} per page`);



                for (let page = 1; page <= pagesToFetch; page++) {

                    const res = await api.get<MembersRes>("/members", { params: { page, limit: pageLimit } });

                    if (res.data?.data) {

                        memberRows = memberRows.concat((res.data.data).map(mapItem));

                        console.log(`Fetched page ${page}/${pagesToFetch}, total so far: ${memberRows.length}`);

                    }

                }

            }



            // Fetch team members - Try primary endpoint first, then fallback

            type TeamMembersRes = { success: boolean; data: TeamMemberApiItem[] };

            let teamMemberRows: MemberRow[] = [];

            let teamFetchSuccess = false;



            try {

                console.log('Fetching team members from /team-members...');

                const teamRes = await api.get<TeamMembersRes>("/team-members");

                console.log('Team members API response:', teamRes.data);

                console.log('Team members raw data (first item):', teamRes.data?.data?.[0]);

                if (teamRes.data?.success && teamRes.data?.data) {

                    const teamData = teamRes.data.data;

                    console.log('Team members data received:', teamData.length, 'records');

                    console.log('First team member raw:', JSON.stringify(teamData[0], null, 2));

                    teamMemberRows = teamData.map(mapTeamMemberItem);

                    console.log('Mapped team members rows:', teamMemberRows.length);

                    console.log('First mapped row:', JSON.stringify(teamMemberRows[0], null, 2));

                    teamFetchSuccess = true;

                } else if (teamRes.data) {

                    console.warn('Team members response not successful:', teamRes.data);

                }

            } catch (err: unknown) {

                const errorMsg = err instanceof Error ? err.message : String(err);

                console.error('Primary team members endpoint failed:', errorMsg);



                // Fallback: Try alternative endpoint

                try {

                    console.log('Trying fallback endpoint /register/team-member/review-all...');

                    type ReviewRes = {
                        success: boolean; count?: number; data?: Array<{

                            member_id?: number;

                            id?: number;

                            firstNameEn?: string;

                            lastNameEn?: string;

                            firstNameAr?: string;

                            lastNameAr?: string;

                            first_name_en?: string;

                            last_name_en?: string;

                            first_name_ar?: string;

                            last_name_ar?: string;

                            national_id?: string;

                            phone?: string;

                            status?: string;

                        }>
                    };



                    const fallbackRes = await api.get<ReviewRes>("/register/team-member/review-all");

                    console.log('Fallback endpoint response:', fallbackRes.data);



                    if (fallbackRes.data?.success && fallbackRes.data?.data) {

                        const reviewData = fallbackRes.data.data;

                        console.log('Review data received:', reviewData.length, 'records');



                        // Map review data to TeamMemberApiItem format

                        teamMemberRows = reviewData.map(item => mapTeamMemberItem({

                            id: (item.member_id || item.id || 0) as number,

                            firstNameEn: item.firstNameEn || item.first_name_en || '',

                            lastNameEn: item.lastNameEn || item.last_name_en || '',

                            firstNameAr: item.firstNameAr || item.first_name_ar || '',

                            lastNameAr: item.lastNameAr || item.last_name_ar || '',

                            name_en: `${item.firstNameEn || item.first_name_en || ''} ${item.lastNameEn || item.last_name_en || ''}`.trim(),

                            name_ar: `${item.firstNameAr || item.first_name_ar || ''} ${item.lastNameAr || item.last_name_ar || ''}`.trim(),

                            national_id: item.national_id || '',

                            phone: item.phone,

                            status: item.status || 'pending',

                            teams: []

                        } as TeamMemberApiItem));

                        teamFetchSuccess = true;

                        console.log('Fallback successful. Mapped:', teamMemberRows.length, 'records');

                    }

                } catch (fallbackErr: unknown) {

                    const fallbackMsg = fallbackErr instanceof Error ? fallbackErr.message : String(fallbackErr);

                    console.error('Fallback endpoint also failed:', fallbackMsg);

                    console.error('Full error:', fallbackErr);

                }

            }



            if (!teamFetchSuccess) {

                console.warn('Could not fetch team members from any endpoint');

            }



            // Combine both (members + team members)

            // Since they're from separate tables, there are no ID conflicts

            const combined = [...memberRows, ...teamMemberRows];



            console.log('Final count - Members:', memberRows.length, 'Team Members:', teamMemberRows.length, 'Combined:', combined.length);

            console.log('Team member IDs available:', teamMemberRows.map(r => `${r.id}(${r.firstNameAr})`).join(', '));

            console.log('Full team member rows (first 3):', teamMemberRows.slice(0, 3).map(r => ({

                id: r.id,

                idType: typeof r.id,

                firstNameAr: r.firstNameAr,

                memberTypeCode: r.memberTypeCode

            })));

            setAllRows(combined);

        } catch (err) {

            const errorMsg = err instanceof Error ? err.message : 'Unknown error';

            toast({ title: t('toast.loadFailed'), description: errorMsg, variant: "destructive" });

        } finally {

            setFetching(false);

        }

    }, [mapItem, mapTeamMemberItem, toast]);



    useEffect(() => { void fetchAll(); }, [fetchAll]);

    useEffect(() => {
        void (async () => {
            try {
                const [facultyRes, professionRes] = await Promise.all([
                    api.get<{ success?: boolean; data?: Array<{ id: number; name_en?: string; name_ar?: string }> }>('/faculties'),
                    api.get<{ success?: boolean; data?: Array<{ id: number; name_en?: string; name_ar?: string }> }>('/professions'),
                ]);
                setFaculties(facultyRes.data?.data ?? []);
                setProfessions(professionRes.data?.data ?? []);
            } catch {
                // optional lookups for edit form
            }
        })();
    }, []);



    // Player types filter

    const playerTypes = useMemo(() => {

        const seen = new Map<number, string>();

        allRows.filter((r) => r.isTeamPlayer).forEach((r) => {

            if (!seen.has(r.memberTypeId)) seen.set(r.memberTypeId, r.memberTypeLabel);

        });

        return Array.from(seen.entries()).map(([id, label]) => ({ id, label }));

    }, [allRows]);



    const [filterPlayerType, setFilterPlayerType] = useState<string>("all");



    // Process rows

    const processedRows = useMemo(() => {

        let result = [...allRows];



        if (tab === "members") result = result.filter((r) => !r.isTeamPlayer);

        if (tab === "teamMembers") result = result.filter((r) => r.isTeamPlayer);



        if (tab === "teamMembers" && filterPlayerType !== "all") {

            result = result.filter((r) => r.memberTypeId === Number(filterPlayerType));

        }



        if (filterStatuses.length > 0) {

            result = result.filter((r) => filterStatuses.includes(r.status));

        }



        if (search.trim()) {

            const q = search.toLowerCase();

            result = result.filter((r) =>

                [

                    `${r.firstNameAr} ${r.lastNameAr}`,

                    `${r.firstNameEn} ${r.lastNameEn}`,

                    r.nationalId,

                    r.email ?? "",

                    r.phone ?? "",

                ].some((v) => v.toLowerCase().includes(q))

            );

        }

        if (dateFilter) {
            result = result.filter((r) => r.createdAt && r.createdAt.startsWith(dateFilter));
        }



        result.sort((a, b) => {

            let cmp = 0;

            if (sortField === "name") cmp = `${a.firstNameAr}${a.lastNameAr}`.localeCompare(`${b.firstNameAr}${b.lastNameAr}`);

            if (sortField === "memberType") cmp = Number(a.isTeamPlayer) - Number(b.isTeamPlayer);

            if (sortField === "status") cmp = a.status.localeCompare(b.status);

            if (sortField === "nationalId") cmp = a.nationalId.localeCompare(b.nationalId);

            if (sortField === "createdAt") cmp = (a.createdAt ?? "").localeCompare(b.createdAt ?? "");

            return sortDir === "asc" ? cmp : -cmp;

        });



        return result;

    }, [allRows, tab, filterStatuses, filterPlayerType, search, dateFilter, sortField, sortDir]);



    const totalFiltered = processedRows.length;

    const pageRows = processedRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);



    useEffect(() => { setPage(1); }, [search, dateFilter, tab, filterStatuses, filterPlayerType, sortField, sortDir]);



    const statusCounts = useMemo(() => {

        const base = tab === "members" ? allRows.filter((r) => !r.isTeamPlayer)

            : tab === "teamMembers" ? allRows.filter((r) => r.isTeamPlayer)

                : allRows;

        const counts: Record<string, number> = {};

        base.forEach((r) => { counts[r.status] = (counts[r.status] ?? 0) + 1; });

        return counts;

    }, [allRows, tab]);



    // Open detail — fetches member details AND sports in parallel

    const openDetail = useCallback(async (row: MemberRow) => {

        setSelectedRow(row);

        setSelectedDetail(null);

        setMemberSports([]);

        setDetailLoading(true);

        try {

            // Check if it's a team player or regular member

            if (row.isTeamPlayer && row.memberTypeCode === "TEAM_MEMBER") {

                // Fetch team member details from /team-members/:member_id

                console.log('Fetching team member details for ID:', row.id);

                console.log('Team member row data:', { id: row.id, firstNameAr: row.firstNameAr, firstNameEn: row.firstNameEn });

                type TeamMemberDetailsRes = { success: boolean; data: TeamMemberApiItem };

                try {

                    const teamRes = await api.get<TeamMemberDetailsRes>(`/team-members/${row.id}`);

                    console.log('Team member details response:', teamRes.data);

                    if (teamRes.data?.success) {

                        const teamData = teamRes.data.data;

                        console.log('Team member data loaded:', teamData);

                        console.log('Sports from API:', teamData.sports || teamData.teams);

                        setSelectedRow(mapTeamMemberItem(teamData));

                        // ── Set selectedDetail so the Photos tab can display images ──
                        // Cast the team-member payload to MemberApiItem so the shared
                        // DetailPanel can read photo / national_id_front / national_id_back
                        // / medical_report fields when the backend starts returning them.
                        const teamAsDetail = {
                            id: teamData.id,
                            first_name_en: teamData.first_name_en ?? teamData.firstNameEn ?? '',
                            first_name_ar: teamData.first_name_ar ?? teamData.firstNameAr ?? '',
                            last_name_en: teamData.last_name_en ?? teamData.lastNameEn ?? '',
                            last_name_ar: teamData.last_name_ar ?? teamData.lastNameAr ?? '',
                            gender: teamData.gender,
                            phone: teamData.phone,
                            nationality: teamData.nationality,
                            birthdate: teamData.birthdate,
                            national_id: teamData.national_id ?? '',
                            address: teamData.address,
                            status: teamData.status,
                            created_at: teamData.created_at,
                            updated_at: teamData.updated_at,
                            member_type_id: 0,
                            // Photo / document fields — populated when the API returns them
                            photo: (teamData as Record<string, unknown>).photo as string | undefined,
                            national_id_front: (teamData as Record<string, unknown>).national_id_front as string | undefined,
                            national_id_back: (teamData as Record<string, unknown>).national_id_back as string | undefined,
                            medical_report: (teamData as Record<string, unknown>).medical_report as string | undefined,
                        } as MemberApiItem;

                        setSelectedDetail(teamAsDetail);

                        // Map sports to display format for consistency

                        const sportsArray = (teamData.sports || teamData.teams || []) as Array<{

                            id?: number;

                            name?: string;

                            status?: string;

                            startDate?: string;

                        }>;

                        const sportsToDisplay = sportsArray.map((s, idx) => ({

                            id: s?.id || idx,

                            team_name: s?.name || '',

                            status: s?.status ?? 'active'

                        }));

                        console.log('Sports mapped for display:', sportsToDisplay);

                        setMemberSports(sportsToDisplay);

                    } else {

                        console.warn('Team member response not successful:', teamRes.data);

                        toast({
                            title: t('toast.loadDetailsFailed'),
                            description: t('toast.teamPlayerLoadFailed', { id: row.id }),
                            variant: "destructive"
                        });

                    }

                } catch (detailErr: unknown) {

                    const detailMsg = detailErr instanceof Error ? detailErr.message : String(detailErr);

                    console.error('Team member detail fetch error:', detailMsg);

                    toast({

                        title: t('toast.loadDetailsFailed'),

                        description: `${detailMsg} (ID: ${row.id})`,

                        variant: "destructive"

                    });

                }

            } else {

                // Fetch regular member details

                console.log('Fetching regular member details for ID:', row.id);

                const memberRes = await api.get<{ success: boolean; data: MemberApiItem }>(`/members/${row.id}`);

                if (memberRes.data?.success) {

                    const d = memberRes.data.data;

                    setSelectedDetail(d);

                    setAllRows((prev) => prev.map((r) => r.id === row.id ? mapItem(d) : r));

                    setSelectedRow(mapItem(d));

                }



                // Regular members don't have sports from the team_members table

                // So we just clear the sports array

                setMemberSports([]);

            }

        } catch (err: unknown) {

            const errorMsg = err instanceof Error ? err.message : String(err);

            console.error('Error loading details:', errorMsg);

            toast({ title: t('toast.loadDetailsFailed'), description: errorMsg, variant: "destructive" });

        } finally {

            setDetailLoading(false);

        }

    }, [mapItem, mapTeamMemberItem, toast]);



    // Edit handlers

    const populateEditFields = (target: MemberRow, d: MemberApiItem | null) => {
        setEditFirstNameAr(d?.first_name_ar ?? target.firstNameAr);
        setEditFirstNameEn(d?.first_name_en ?? target.firstNameEn);
        setEditLastNameAr(d?.last_name_ar ?? target.lastNameAr);
        setEditLastNameEn(d?.last_name_en ?? target.lastNameEn);
        setEditGender(d?.gender ?? target.gender ?? "");
        setEditPhone(d?.phone ?? target.phone ?? "");
        setEditBirthdate(d?.birthdate ? String(d.birthdate).slice(0, 10) : target.birthdate ? String(target.birthdate).slice(0, 10) : "");
        setEditNationality(d?.nationality ?? target.nationality ?? "");
        setEditAddress(d?.address ?? target.address ?? "");
        setEditHealth(d?.health_status ?? target.healthStatus ?? "");
        setEditEmail(d?.account?.email ?? target.email ?? "");
        setEditNationalId(d?.national_id ?? target.nationalId ?? "");

        const student = d?.university_student_detail;
        setEditFacultyId(student?.faculty_id ? String(student.faculty_id) : "");
        setEditGraduationYear(student?.graduation_year ? String(student.graduation_year) : "");

        const employee = d?.employee_detail;
        setEditProfessionId(employee?.profession_id ? String(employee.profession_id) : "");
        setEditDepartmentEn(employee?.department_en ?? "");
        setEditDepartmentAr(employee?.department_ar ?? "");
        setEditSalary(employee?.salary != null ? String(employee.salary) : "");

        const retired = d?.retired_employee_detail;
        setEditProfessionCode(retired?.profession_code ?? "");
        setEditFormerDepartmentEn(retired?.former_department_en ?? "");
        setEditFormerDepartmentAr(retired?.former_department_ar ?? "");
        setEditRetirementDate(retired?.retirement_date ? String(retired.retirement_date).slice(0, 10) : "");
        setEditLastSalary(retired?.last_salary != null ? String(retired.last_salary) : "");

        const outsider = d?.outsider_detail;
        setEditJobTitleEn(outsider?.job_title_en ?? "");
        setEditJobTitleAr(outsider?.job_title_ar ?? "");
        setEditEmploymentStatus(outsider?.employment_status ?? "");
        setEditPassportNumber(outsider?.passport_number ?? "");
        setEditCountry(outsider?.country ?? "");
        setEditVisaStatus(outsider?.visa_status ?? "");
        setEditVisitorType(outsider?.visitor_type ?? "");
        setEditDurationMonths(outsider?.duration_months != null ? String(outsider.duration_months) : "");
    };

    const openEdit = async (row?: MemberRow) => {
        const target = row || selectedRow;
        if (!target) return;
        setEditOpen(true);
        if (row) setSelectedRow(row);

        let d = selectedRow?.id === target.id ? selectedDetail : null;

        try {
            if (!d || selectedRow?.id !== target.id) {
                if (target.isTeamPlayer && target.memberTypeCode === "TEAM_MEMBER") {
                    const teamRes = await api.get<{ success: boolean; data: TeamMemberApiItem }>(`/team-members/${target.id}`);
                    if (teamRes.data?.success) {
                        const teamData = teamRes.data.data;
                        const teamEmail = teamData.account?.email ?? teamData.email;
                        d = {
                            id: teamData.id,
                            first_name_en: teamData.first_name_en ?? teamData.firstNameEn ?? '',
                            first_name_ar: teamData.first_name_ar ?? teamData.firstNameAr ?? '',
                            last_name_en: teamData.last_name_en ?? teamData.lastNameEn ?? '',
                            last_name_ar: teamData.last_name_ar ?? teamData.lastNameAr ?? '',
                            gender: teamData.gender,
                            phone: teamData.phone,
                            nationality: teamData.nationality,
                            birthdate: teamData.birthdate,
                            national_id: teamData.national_id ?? '',
                            address: teamData.address,
                            status: teamData.status ?? 'active',
                            member_type_id: 0,
                            account: teamEmail ? { email: teamEmail } : undefined,
                        } as MemberApiItem;
                        setSelectedDetail(d);
                    }
                } else {
                    const memberRes = await api.get<{ success: boolean; data: MemberApiItem }>(`/members/${target.id}`);
                    if (memberRes.data?.success) {
                        d = memberRes.data.data;
                        setSelectedDetail(d);
                    }
                }
            }
        } catch {
            // fall back to row-level data
        }

        populateEditFields(target, d);
        setEditFieldErrors({});
        setEditOpen(true);
    };

    const handleSaveEdit = async () => {

        if (!selectedRow) return;

        const regexErrors = validateAdminMemberEditForm({
            first_name_ar: editFirstNameAr.trim(),
            last_name_ar: editLastNameAr.trim(),
            first_name_en: editFirstNameEn.trim(),
            last_name_en: editLastNameEn.trim(),
            phone: editPhone.trim(),
            email: editEmail.trim(),
            national_id: editNationalId.trim(),
            birthdate: editBirthdate.trim(),
            nationality: editNationality.trim(),
            address: editAddress.trim(),
            health_status: editHealth.trim(),
            department_ar: editDepartmentAr.trim(),
            department_en: editDepartmentEn.trim(),
            job_title_ar: editJobTitleAr.trim(),
            job_title_en: editJobTitleEn.trim(),
            former_department_ar: editFormerDepartmentAr.trim(),
            former_department_en: editFormerDepartmentEn.trim(),
        }, tVal);

        if (Object.keys(regexErrors).length > 0) {
            setEditFieldErrors(mapMemberEditErrors(regexErrors));
            toast({
                title: Object.values(regexErrors)[0] ?? t('toast.updateFailed'),
                variant: 'destructive',
            });
            return;
        }

        setEditFieldErrors({});

        const validation = memberEditSchema.safeParse({
            first_name_ar: editFirstNameAr.trim(),
            last_name_ar: editLastNameAr.trim(),
            first_name_en: editFirstNameEn.trim(),
            last_name_en: editLastNameEn.trim(),
            email: editEmail.trim(),
            national_id: editNationalId.trim(),
            gender: (editGender.trim() || 'male') as 'male' | 'female' | 'other',
            phone: editPhone.trim(),
            birthdate: editBirthdate.trim(),
            nationality: editNationality.trim(),
            address: editAddress.trim(),
            health_status: editHealth.trim(),
        });

        if (!validation.success) {
            toast({
                title: validation.error.issues[0]?.message ?? t('toast.updateFailed'),
                variant: 'destructive',
            });
            return;
        }

        setEditSaving(true);

        try {

            const endpoint = selectedRow.isTeamPlayer && selectedRow.memberTypeCode === "TEAM_MEMBER"
                ? `/team-members/${selectedRow.id}`
                : `/members/${selectedRow.id}`;

            const basePayload = {
                email: editEmail.trim() || undefined,
                first_name_ar: editFirstNameAr.trim() || undefined,
                first_name_en: editFirstNameEn.trim() || undefined,
                last_name_ar: editLastNameAr.trim() || undefined,
                last_name_en: editLastNameEn.trim() || undefined,
                gender: editGender.trim() || undefined,
                phone: editPhone.trim() || undefined,
                birthdate: editBirthdate.trim() || undefined,
                nationality: editNationality.trim() || undefined,
                address: editAddress.trim() || undefined,
                health_status: editHealth.trim() || undefined,
                national_id: editNationalId.trim() || undefined,
            };

            const detailPayload =
                selectedRow.isTeamPlayer && selectedRow.memberTypeCode === "TEAM_MEMBER"
                    ? basePayload
                    : {
                        ...basePayload,
                        ...(selectedDetail?.university_student_detail || editFacultyId || editGraduationYear
                            ? {
                                university_student: {
                                    faculty_id: editFacultyId ? Number(editFacultyId) : null,
                                    graduation_year: editGraduationYear ? Number(editGraduationYear) : null,
                                },
                            }
                            : {}),
                        ...(selectedDetail?.employee_detail || editProfessionId
                            ? {
                                employee: {
                                    profession_id: editProfessionId ? Number(editProfessionId) : undefined,
                                    department_en: editDepartmentEn.trim() || undefined,
                                    department_ar: editDepartmentAr.trim() || undefined,
                                    salary: editSalary.trim() || undefined,
                                },
                            }
                            : {}),
                        ...(selectedDetail?.retired_employee_detail || editRetirementDate || editProfessionCode
                            ? {
                                retired: {
                                    profession_code: editProfessionCode.trim() || undefined,
                                    former_department_en: editFormerDepartmentEn.trim() || undefined,
                                    former_department_ar: editFormerDepartmentAr.trim() || undefined,
                                    retirement_date: editRetirementDate.trim() || undefined,
                                    last_salary: editLastSalary.trim() || undefined,
                                },
                            }
                            : {}),
                        ...(selectedDetail?.outsider_detail || editPassportNumber || editVisitorType
                            ? {
                                outsider: {
                                    job_title_en: editJobTitleEn.trim() || undefined,
                                    job_title_ar: editJobTitleAr.trim() || undefined,
                                    employment_status: editEmploymentStatus.trim() || undefined,
                                    passport_number: editPassportNumber.trim() || undefined,
                                    country: editCountry.trim() || undefined,
                                    visa_status: editVisaStatus.trim() || undefined,
                                    visitor_type: editVisitorType.trim() || undefined,
                                    duration_months: editDurationMonths.trim() || undefined,
                                },
                            }
                            : {}),
                    };

            await api.put(endpoint, detailPayload);

            toast({ title: t('toast.updateSuccess') });

            setEditOpen(false);

            const updatedRow = {
                ...selectedRow,
                firstNameAr: editFirstNameAr || selectedRow.firstNameAr,
                firstNameEn: editFirstNameEn || selectedRow.firstNameEn,
                lastNameAr: editLastNameAr || selectedRow.lastNameAr,
                lastNameEn: editLastNameEn || selectedRow.lastNameEn,
                gender: editGender || selectedRow.gender,
                phone: editPhone || selectedRow.phone,
                email: editEmail || selectedRow.email,
                nationalId: editNationalId || selectedRow.nationalId,
                nationality: editNationality || selectedRow.nationality,
                address: editAddress || selectedRow.address,
                healthStatus: editHealth || selectedRow.healthStatus,
            };

            setSelectedRow(updatedRow);
            setAllRows((prev) => prev.map((r) => r.id === selectedRow.id ? updatedRow : r));
            void openDetail(updatedRow);
        } catch (err) {

            toast({ title: t('toast.updateFailed'), description: err instanceof Error ? err.message : "", variant: "destructive" });

        } finally {

            setEditSaving(false);

        }

    };



    // Status handlers

    const openStatus = (row?: MemberRow) => {

        const target = row || selectedRow;

        if (!target) return;

        setNewStatus(target.status);

        setStatusReason("");

        setStatusOpen(true);

        if (row) setSelectedRow(row);

    };

    const handleChangeStatus = async () => {

        if (!selectedRow || !newStatus) return;

        setStatusSaving(true);

        try {

            await api.patch(`/members/${selectedRow.id}/status`, {

                status: newStatus,

                reason: statusReason.trim() || undefined,

            });

            toast({ title: t('toast.statusChanged') });

            setStatusOpen(false);

            setAllRows((prev) => prev.map((r) => r.id === selectedRow.id ? { ...r, status: newStatus } : r));

            setSelectedRow((prev) => prev ? { ...prev, status: newStatus } : prev);

        } catch (err) {

            toast({ title: t('toast.statusChangeFailed'), description: err instanceof Error ? err.message : "", variant: "destructive" });

        } finally {

            setStatusSaving(false);

        }

    };



    // Delete handlers

    const openDelete = (row?: MemberRow) => {
        setDeleteOpen(true);
        if (row) setSelectedRow(row);
    };



    const handleDelete = async () => {

        if (!selectedRow) return;

        setDeleteSaving(true);

        try {

            if (selectedRow.isTeamPlayer && selectedRow.memberTypeCode === "TEAM_MEMBER") {
                await api.put(`/team-members/${selectedRow.id}/deactivate`);
            } else {
                await api.patch(`/members/${selectedRow.id}/status`, { status: "cancelled", reason: t('toast.deletedByAdmin') });
            }

            toast({ title: t('toast.deleted') });

            setDeleteOpen(false);

            setAllRows((prev) => prev.map((r) =>
                r.uniqueId === selectedRow.uniqueId ? { ...r, status: "cancelled" } : r
            ));

            setSelectedRow(null);

        } catch (err) {

            toast({ title: t('toast.deleteFailed'), description: err instanceof Error ? err.message : "", variant: "destructive" });

        } finally {

            setDeleteSaving(false);

        }

    };



    const handleSort = (field: SortField) => {

        if (field === sortField) setSortDir((d) => d === "asc" ? "desc" : "asc");

        else { setSortField(field); setSortDir("asc"); }

    };

    // ── Export ──────────────────────────────────────────────────────────────
    const exportColumns = useMemo(
        () => [
            {
                headerEn: 'Name', headerAr: 'الاسم',
                accessor: (r: MemberRow) => language === 'ar'
                    ? `${r.firstNameAr ?? ''} ${r.lastNameAr ?? ''}`.trim() || `${r.firstNameEn ?? ''} ${r.lastNameEn ?? ''}`.trim()
                    : `${r.firstNameEn ?? ''} ${r.lastNameEn ?? ''}`.trim() || `${r.firstNameAr ?? ''} ${r.lastNameAr ?? ''}`.trim(),
                width: 30,
            },
            {
                headerEn: 'Type', headerAr: 'النوع',
                accessor: (r: MemberRow) => r.isTeamPlayer
                    ? (language === 'ar' ? 'عضو فريق رياضي' : 'Team Member')
                    : r.memberTypeLabel,
                width: 18,
            },
            { headerEn: 'National ID', headerAr: 'الرقم القومي', accessor: (r: MemberRow) => r.nationalId, width: 18 },
            { headerEn: 'Phone', headerAr: 'رقم الهاتف', accessor: (r: MemberRow) => r.phone, width: 16 },
            {
                headerEn: 'Gender', headerAr: 'الجنس',
                accessor: (r: MemberRow) => t(GENDER_LABELS[r.gender || ''] || r.gender || '', { defaultValue: r.gender }),
                width: 12,
            },
            {
                headerEn: 'Status', headerAr: 'الحالة',
                accessor: (r: MemberRow) => tStatus(getAdminMemberStatusConfig(r.status).labelKey, { defaultValue: r.status }),
                width: 14,
            },
            {
                headerEn: 'Registration Date', headerAr: 'تاريخ التسجيل',
                accessor: (r: MemberRow) => formatAdminDate(r.createdAt, locale),
                width: 20,
            },
        ],
        [language, t, tStatus, locale],
    );

    const exportHandle = useTableExport({
        reportId: 'members',
        titleEn: 'Members Directory',
        titleAr: 'دليل الأعضاء',
        columns: exportColumns,
        rows: processedRows,
    });



    const Th = ({ field, children, center, className = "" }: { field?: SortField; children: React.ReactNode; center?: boolean; className?: string }) => (
        <TableHead
            onClick={() => field && handleSort(field)}
            className={adminHeadClass({ sortable: !!field, center, className })}
        >
            <span className={`inline-flex items-center gap-1 ${center ? "justify-center" : ""}`}>
                {children}
                {field && <SortIcon field={field} active={sortField} dir={sortDir} />}
            </span>
        </TableHead>
    );



    const memberCount = allRows.filter((r) => !r.isTeamPlayer).length;
    const teamMemberCount = allRows.filter((r) => r.isTeamPlayer).length;

    const TAB_CONFIG: { key: TabKey; label: string; icon: typeof Users }[] = [
        { key: "all", label: t('tabs.all'), icon: Users },
        { key: "members", label: t('tabs.members'), icon: UserCheck },
        { key: "teamMembers", label: t('tabs.teamMembers'), icon: Trophy },
    ];



    return (

        <TooltipProvider>

            <div className="h-[calc(100vh-4rem)] flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>



                {/* Header */}

                <div className="px-6 py-4 border-b border-border bg-background shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className={adminPageStyles.headerTitle}>
                                <Users className="w-6 h-6 text-primary" />
                                {t('header.title')}
                            </h1>
                            <div className="flex items-center gap-4 mt-1 flex-wrap">
                                <p className="text-sm text-muted-foreground">
                                    {t('header.totalLoaded')} <strong>{allRows.length}</strong>
                                </p>
                                <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                                    <Users className="w-3 h-3" /> {t('tabs.members')}: {memberCount}
                                </span>
                                <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                                    <Award className="w-3 h-3" /> {t('tabs.teamMembers')}: {teamMemberCount}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <ExportReportButton {...exportHandle} rowCount={totalFiltered} />
                            <button
                                type="button"
                                onClick={() => void fetchAll()}
                                disabled={fetching}
                                className={adminPageStyles.refreshBtn}
                            >
                                <RefreshCw className={`w-4 h-4 ${fetching ? "animate-spin" : ""}`} />
                                {fetching ? t('header.refreshing') : t('header.refresh')}
                            </button>
                        </div>
                    </div>
                </div>



                {/* Main area */}

                <div className="flex flex-1 overflow-hidden">



                    {/* Table panel */}

                    <div className="flex flex-col w-full overflow-hidden">



                        {/* Toolbar */}

                        <div className="flex items-center gap-3 px-6 py-3 border-b border-border bg-muted/20 shrink-0 flex-wrap">

                            <div className="relative flex-1 max-w-sm">
                                <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none ${isRTL ? 'right-3' : 'left-3'}`} />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={t('toolbar.searchPlaceholder')}
                                    className={`${isRTL ? 'pr-9' : 'pl-9'} h-9`}
                                />
                            </div>

                            <div className={adminPageStyles.toolbarTabGroup}>
                                {TAB_CONFIG.map(({ key, label, icon: Icon }) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setTab(key)}
                                        className={`${adminPageStyles.toolbarTab} ${tab === key ? adminPageStyles.toolbarTabActive : adminPageStyles.toolbarTabInactive}`}
                                    >
                                        <Icon className="w-4 h-4 shrink-0" />
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {tab === "teamMembers" && playerTypes.length > 1 && (
                                <Select value={filterPlayerType} onValueChange={setFilterPlayerType}>
                                    <SelectTrigger className="h-9 w-36 text-xs shrink-0">
                                        <SelectValue placeholder={t('tabs.allTypesPlaceholder')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">{t('tabs.allPlayerTypes')}</SelectItem>
                                        {playerTypes.map(({ id, label }) => (
                                            <SelectItem key={id} value={String(id)}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}



                            <Popover>
                                <PopoverTrigger asChild>
                                    <button
                                        type="button"
                                        className={`${adminPageStyles.toolbarFilterBtn} h-8 text-xs
                                        ${dateFilter
                                            ? "border-primary bg-primary/5 text-primary hover:bg-primary/10"
                                            : "border-border bg-background text-muted-foreground"}`}>
                                        <Calendar className="w-3 h-3" />
                                        {t('toolbar.dateFilter', 'Date Filter')}
                                        {dateFilter && (
                                            <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-primary" />
                                        )}
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent align="end" className="w-64 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-sm">{t('toolbar.filterByDate', 'Filter by Date')}</h4>
                                        <Input 
                                            type="date" 
                                            value={dateFilter} 
                                            onChange={(e) => setDateFilter(e.target.value)} 
                                            className="w-full text-xs h-8"
                                        />
                                        {dateFilter && (
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="w-full text-xs h-8" 
                                                onClick={() => setDateFilter("")}
                                            >
                                                {t('actions.clear', 'Clear')}
                                            </Button>
                                        )}
                                    </div>
                                </PopoverContent>
                            </Popover>



                            <Popover open={statusPopoverOpen} onOpenChange={setStatusPopoverOpen}>

                                <PopoverTrigger asChild>

                                    <button
                                        type="button"
                                        className={`${adminPageStyles.toolbarFilterBtn} h-8 text-xs

                                        ${filterStatuses.length > 0

                                            ? "border-primary bg-primary/5 text-primary hover:bg-primary/10"

                                            : "border-border bg-background text-muted-foreground"}`}>

                                        <Filter className="w-3 h-3" />
                                        {t('toolbar.statusFilter')}
                                        {filterStatuses.length > 0 && (

                                            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold">

                                                {filterStatuses.length}

                                            </span>

                                        )}

                                    </button>

                                </PopoverTrigger>

                                <PopoverContent align="end" className="w-52 p-0" dir={isRTL ? 'rtl' : 'ltr'}>

                                    <div className="py-1">

                                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {

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

                                                            setFilterStatuses(prev =>

                                                                prev.includes(key)

                                                                    ? prev.filter(s => s !== key)

                                                                    : [...prev, key]

                                                            );

                                                        }}

                                                        className="w-3.5 h-3.5 rounded accent-primary cursor-pointer"

                                                    />

                                                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${cfg.color}`}>

                                                        <cfg.icon className="w-3 h-3" />
                                                        {tStatus(cfg.labelKey)}
                                                    </span>

                                                    <span className="me-auto text-[10px] text-muted-foreground">

                                                        {statusCounts[key] ?? 0}

                                                    </span>

                                                </label>

                                            );

                                        })}

                                    </div>

                                    <div className="flex items-center justify-end gap-2 px-3 py-2 border-t border-border">

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFilterStatuses([]);
                                                setStatusPopoverOpen(false);
                                            }}
                                            className="text-xs text-muted-foreground hover:text-foreground hover:underline cursor-pointer transition-colors"
                                        >
                                            {t('toolbar.clearFilter')}
                                        </button>

                                    </div>

                                </PopoverContent>

                            </Popover>



                        </div>



                        {/* Table */}

                        <div className={adminTableStyles.container}>

                            <Table className={adminTableStyles.table}>

                                <TableHeader className={adminTableStyles.header}>

                                    <TableRow>
                                        <Th className="w-10">{t('table.index')}</Th>
                                        <Th field="name">{t('table.name')}</Th>
                                        <Th>{t('table.phone')}</Th>
                                        <Th field="nationalId">{t('table.nationalId')}</Th>
                                        <Th field="createdAt">{t('table.registrationDate')}</Th>
                                        <Th field="memberType" center>{t('table.type')}</Th>
                                        <Th field="status" center>{t('table.status')}</Th>
                                        <Th center className="w-[1%] whitespace-nowrap">{t('table.actions')}</Th>
                                    </TableRow>

                                </TableHeader>

                                <TableBody className="divide-y divide-border">

                                    {fetching && allRows.length === 0 ? (

                                        Array.from({ length: 8 }).map((_, i) => (

                                            <TableRow key={i} className="animate-pulse">

                                                <TableCell className="px-4 py-3">

                                                    <div className="flex items-center gap-2.5">

                                                        <div className="w-7 h-7 rounded-full bg-muted shrink-0" />

                                                        <div className="space-y-1">

                                                            <div className="h-2.5 w-20 bg-muted rounded" />

                                                            <div className="h-2 w-14 bg-muted rounded" />

                                                        </div>

                                                    </div>

                                                </TableCell>

                                                {[1, 2, 3, 4, 5, 6, 7].map(j => <TableCell key={j} className={adminCellClass()}><div className="h-2.5 w-12 bg-muted rounded mx-auto" /></TableCell>)}

                                            </TableRow>

                                        ))

                                    ) : pageRows.length === 0 ? (

                                        <TableRow>

                                            <TableCell colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                                                {search ? t('table.noResults', { query: search }) : t('table.noMembers')}
                                            </TableCell>

                                        </TableRow>

                                    ) : pageRows.map((row, idx) => (
                                            <TableRow
                                                key={row.uniqueId}
                                                className={adminTableStyles.row}
                                            >
                                                <TableCell className={adminCellClass({ size: "muted", className: "font-mono w-10" })}>
                                                    {(page - 1) * PAGE_SIZE + idx + 1}
                                                </TableCell>

                                                <TableCell className={adminCellClass()}>
                                                    <PersonNameDisplay
                                                        id={row.id}
                                                        names={row}
                                                        language={language}
                                                        showAvatar={false}
                                                        primaryClassName="text-[13px]"
                                                        secondaryClassName="text-[13px] text-muted-foreground"
                                                    />
                                                </TableCell>

                                                <TableCell className={adminCellClass({ size: 'phone' })}>
                                                    <span dir="ltr">{row.phone || "—"}</span>
                                                </TableCell>

                                                <TableCell className={adminCellClass({ size: 'nationalId' })}>
                                                    <span dir="ltr">{row.nationalId || "—"}</span>
                                                </TableCell>

                                                <TableCell className={adminCellClass({ size: "muted", className: "tabular-nums whitespace-nowrap" })}>
                                                    {fmtDate(row.createdAt)}
                                                </TableCell>

                                                <TableCell className={adminCellClass({ center: true })}>
                                                    {row.isTeamPlayer ? (
                                                        <span className={`${adminTableBadgeClass} bg-amber-100 text-amber-800`}>
                                                            <Award className="w-3 h-3 shrink-0" />
                                                            {t('memberTypes.teamMember')}
                                                        </span>
                                                    ) : (
                                                        <span className={`${adminTableBadgeClass} bg-blue-100 text-blue-800`}>
                                                            <Users className="w-3 h-3 shrink-0" />
                                                            {t('memberTypes.member')}
                                                        </span>
                                                    )}
                                                </TableCell>

                                                <TableCell className={adminCellClass({ center: true })}>
                                                    <StatusBadge status={row.status} compact />
                                                </TableCell>

                                                <TableCell className={adminCellClass({ center: true, className: "whitespace-nowrap" })}>
                                                    <AdminRowActions>
                                                        <AdminViewButton
                                                            tooltip={t('rowActions.viewDetails')}
                                                            onClick={() => void openDetail(row)}
                                                        />
                                                        <RoleGuard privilege="UPDATE_MEMBER">
                                                            <AdminActionButton
                                                                tooltip={t('rowActions.edit')}
                                                                icon={Pencil}
                                                                variant="edit"
                                                                onClick={() => void openEdit(row)}
                                                            />
                                                        </RoleGuard>
                                                        <RoleGuard privilege="MANAGE_MEMBER_BLOCK">
                                                            <AdminActionButton
                                                                tooltip={t('rowActions.changeStatus')}
                                                                icon={Shield}
                                                                variant="status"
                                                                onClick={() => openStatus(row)}
                                                            />
                                                        </RoleGuard>
                                                        <RoleGuard privilege="DELETE_MEMBER">
                                                            <AdminActionButton
                                                                tooltip={t('rowActions.deleteMember')}
                                                                icon={Trash2}
                                                                variant="delete"
                                                                onClick={() => openDelete(row)}
                                                            />
                                                        </RoleGuard>
                                                    </AdminRowActions>
                                                </TableCell>

                                            </TableRow>
                                    ))}

                                </TableBody>

                            </Table>

                        </div>



                        <AdminPagination
                            page={page}
                            totalCount={totalFiltered}
                            pageSize={PAGE_SIZE}
                            onPageChange={setPage}
                            isRTL={isRTL}
                            disabled={fetching}
                        />

                    </div>

                </div>



                {/* Detail Modal */}

                <Dialog open={!!selectedRow && !editOpen && !statusOpen && !deleteOpen} onOpenChange={(o) => !o && setSelectedRow(null)}>

                    <DialogContent className={adminDialogStyles.content} dir={isRTL ? 'rtl' : 'ltr'}>

                        <DialogHeader className="sr-only">

                            <DialogTitle>{t('detailModal.title', { type: selectedRow?.isTeamPlayer ? t('detailModal.teamPlayer') : t('detailModal.member') })}</DialogTitle>
                            <DialogDescription>{t('detailModal.description')}</DialogDescription>

                        </DialogHeader>

                        {selectedRow && (

                            <DetailPanel

                                row={selectedRow}

                                details={selectedDetail}

                                loading={detailLoading}

                                sports={memberSports}

                                onClose={() => setSelectedRow(null)}

                                onEdit={() => void openEdit()}

                                onChangeStatus={() => openStatus()}

                                onDelete={() => openDelete()}

                            />

                        )}

                    </DialogContent>

                </Dialog>



                {/* Edit Dialog — same layout as view, fields editable */}

                <Dialog open={editOpen} onOpenChange={(o) => !o && setEditOpen(false)}>

                    <DialogContent className={adminDialogStyles.content} dir={isRTL ? 'rtl' : 'ltr'}>

                        <DialogHeader className="sr-only">
                            <DialogTitle>{t('editModal.title')}</DialogTitle>
                            <DialogDescription>{t('editModal.description')}</DialogDescription>
                        </DialogHeader>

                        {selectedRow && (
                            <MemberEditPanel
                                row={selectedRow}
                                details={selectedDetail}
                                language={language}
                                isRTL={isRTL}
                                photoUrl={getFileUrl(selectedDetail?.photo) || null}
                                fmtDate={fmtDate}
                                statusBadge={<StatusBadge status={selectedRow.status} />}
                                memberTypeBadge={
                                    selectedRow.isTeamPlayer ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                                            <Award className="w-3 h-3" />
                                            {t('memberTypes.teamMember')}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
                                            <Users className="w-3 h-3" />
                                            {t('memberTypes.member')}
                                        </span>
                                    )
                                }
                                faculties={faculties}
                                professions={professions}
                                editSaving={editSaving}
                                onSave={() => void handleSaveEdit()}
                                onCancel={() => setEditOpen(false)}
                                fieldErrors={editFieldErrors}
                                fields={{
                                    firstNameAr: editFirstNameAr,
                                    firstNameEn: editFirstNameEn,
                                    lastNameAr: editLastNameAr,
                                    lastNameEn: editLastNameEn,
                                    gender: editGender,
                                    phone: editPhone,
                                    birthdate: editBirthdate,
                                    nationality: editNationality,
                                    address: editAddress,
                                    health: editHealth,
                                    email: editEmail,
                                    nationalId: editNationalId,
                                    facultyId: editFacultyId,
                                    graduationYear: editGraduationYear,
                                    professionId: editProfessionId,
                                    departmentEn: editDepartmentEn,
                                    departmentAr: editDepartmentAr,
                                    salary: editSalary,
                                    professionCode: editProfessionCode,
                                    formerDepartmentEn: editFormerDepartmentEn,
                                    formerDepartmentAr: editFormerDepartmentAr,
                                    retirementDate: editRetirementDate,
                                    lastSalary: editLastSalary,
                                    passportNumber: editPassportNumber,
                                    country: editCountry,
                                    visaStatus: editVisaStatus,
                                    visitorType: editVisitorType,
                                    durationMonths: editDurationMonths,
                                    jobTitleEn: editJobTitleEn,
                                    jobTitleAr: editJobTitleAr,
                                    employmentStatus: editEmploymentStatus,
                                }}
                                onChange={{
                                    setFirstNameAr: (v) => handleArabicChange(v, setEditFirstNameAr, (m) => setEditFieldErrors((prev) => ({ ...prev, firstNameAr: m })), 'name'),
                                    setFirstNameEn: (v) => handleEnglishChange(v, setEditFirstNameEn, (m) => setEditFieldErrors((prev) => ({ ...prev, firstNameEn: m })), 'name'),
                                    setLastNameAr: (v) => handleArabicChange(v, setEditLastNameAr, (m) => setEditFieldErrors((prev) => ({ ...prev, lastNameAr: m })), 'name'),
                                    setLastNameEn: (v) => handleEnglishChange(v, setEditLastNameEn, (m) => setEditFieldErrors((prev) => ({ ...prev, lastNameEn: m })), 'name'),
                                    setGender: setEditGender,
                                    setPhone: (v) => handlePhoneChange(v, setEditPhone),
                                    setBirthdate: setEditBirthdate,
                                    setNationality: (v) => setEditNationality(v.slice(0, 50)),
                                    setAddress: (v) => setEditAddress(v.slice(0, 200)),
                                    setHealth: (v) => setEditHealth(v.slice(0, 500)),
                                    setEmail: setEditEmail,
                                    setNationalId: (v) => handleDigitsChange(v, setEditNationalId, 14),
                                    setFacultyId: setEditFacultyId,
                                    setGraduationYear: setEditGraduationYear,
                                    setProfessionId: setEditProfessionId,
                                    setDepartmentEn: (v) => handleEnglishChange(v, setEditDepartmentEn, (m) => setEditFieldErrors((prev) => ({ ...prev, departmentEn: m }))),
                                    setDepartmentAr: (v) => handleArabicChange(v, setEditDepartmentAr, (m) => setEditFieldErrors((prev) => ({ ...prev, departmentAr: m }))),
                                    setSalary: setEditSalary,
                                    setProfessionCode: setEditProfessionCode,
                                    setFormerDepartmentEn: (v) => handleEnglishChange(v, setEditFormerDepartmentEn, (m) => setEditFieldErrors((prev) => ({ ...prev, formerDepartmentEn: m }))),
                                    setFormerDepartmentAr: (v) => handleArabicChange(v, setEditFormerDepartmentAr, (m) => setEditFieldErrors((prev) => ({ ...prev, formerDepartmentAr: m }))),
                                    setRetirementDate: setEditRetirementDate,
                                    setLastSalary: setEditLastSalary,
                                    setPassportNumber: setEditPassportNumber,
                                    setCountry: setEditCountry,
                                    setVisaStatus: setEditVisaStatus,
                                    setVisitorType: setEditVisitorType,
                                    setDurationMonths: setEditDurationMonths,
                                    setJobTitleEn: (v) => handleEnglishChange(v, setEditJobTitleEn, (m) => setEditFieldErrors((prev) => ({ ...prev, jobTitleEn: m }))),
                                    setJobTitleAr: (v) => handleArabicChange(v, setEditJobTitleAr, (m) => setEditFieldErrors((prev) => ({ ...prev, jobTitleAr: m }))),
                                    setEmploymentStatus: setEditEmploymentStatus,
                                }}
                            />
                        )}

                    </DialogContent>

                </Dialog>



                {/* Status Dialog */}

                <Dialog open={statusOpen} onOpenChange={(o) => !o && setStatusOpen(false)}>

                    <DialogContent className="max-w-sm" dir={isRTL ? 'rtl' : 'ltr'}>

                        <DialogHeader>

                            <DialogTitle className="text-sm">{t('statusModal.title')}</DialogTitle>

                            <DialogDescription className="text-xs">

                                {t('statusModal.currentStatus')} <StatusBadge status={selectedRow?.status ?? ""} compact />

                            </DialogDescription>

                        </DialogHeader>

                        <div className="space-y-4 py-4">

                            <div>

                                <Label className="text-xs">{t('statusModal.newStatus')}</Label>

                                <Select value={newStatus} onValueChange={setNewStatus}>

                                    <SelectTrigger className="mt-1 h-8 text-xs">

                                        <SelectValue placeholder={t('statusModal.selectStatus')} />

                                    </SelectTrigger>

                                    <SelectContent>

                                        {Object.entries(STATUS_CONFIG).map(([k, v]) => (

                                            <SelectItem key={k} value={k} className="text-xs">{tStatus(v.labelKey)}</SelectItem>

                                        ))}

                                    </SelectContent>

                                </Select>

                            </div>

                            <div>

                                <Label className="text-xs">{t('statusModal.reason')}</Label>

                                <Input value={statusReason} onChange={(e) => setStatusReason(e.target.value)}

                                    placeholder={t('statusModal.reasonPlaceholder')} className="mt-1 h-8 text-xs" />

                            </div>

                        </div>

                        <DialogFooter className="gap-2">

                            <Button
                                onClick={() => void handleChangeStatus()}
                                disabled={statusSaving || !newStatus || newStatus === selectedRow?.status}
                                size="sm"
                                className="text-xs"
                            >
                                {statusSaving ? t('statusModal.buttons.saving') : t('statusModal.buttons.confirm')}
                            </Button>
                            <Button variant="outline" onClick={() => setStatusOpen(false)} disabled={statusSaving} size="sm" className="text-xs">{t('statusModal.buttons.cancel')}</Button>

                        </DialogFooter>

                    </DialogContent>

                </Dialog>



                {/* Delete Confirm Dialog */}

                <Dialog open={deleteOpen} onOpenChange={(o) => !o && setDeleteOpen(false)}>

                    <DialogContent className="max-w-sm" dir={isRTL ? 'rtl' : 'ltr'}>

                        <DialogHeader>

                            <DialogTitle className="text-destructive flex items-center gap-2 text-sm">

                                <Trash2 className="w-4 h-4" /> {t('deleteModal.title')}

                            </DialogTitle>

                            <DialogDescription className="text-xs">

                                {t('deleteModal.areYouSure')}{" "}

                                <strong>{selectedRow ? getMemberDisplayName(selectedRow) : t('deleteModal.thisMember')}</strong>?

                                <br />

                                {t('deleteModal.warning')}

                            </DialogDescription>

                        </DialogHeader>

                        <DialogFooter className="gap-2 mt-2">

                            <Button variant="destructive" onClick={() => void handleDelete()} disabled={deleteSaving} size="sm" className="text-xs">

                                {deleteSaving ? t('deleteModal.buttons.deleting') : t('deleteModal.buttons.confirm')}

                            </Button>

                            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleteSaving} size="sm" className="text-xs">{t('deleteModal.buttons.cancel')}</Button>

                        </DialogFooter>

                    </DialogContent>

                </Dialog>

            </div>

        </TooltipProvider>

    );

}
