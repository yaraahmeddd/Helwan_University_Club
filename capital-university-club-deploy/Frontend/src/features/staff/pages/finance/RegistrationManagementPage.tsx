import { useEffect, useMemo, useState } from "react";
import { useTableExport } from '@/utils/reportExport/useTableExport';
import { ExportReportButton } from '@/components/StaffPagesComponents/shared/ExportReportButton';
import { Check, Search, FileText, UserX, Loader2, RefreshCw, Filter, Users, Award, Globe, Phone, CreditCard, User, MapPin, Calendar, Mail, Clock, Activity, FileBadge, Shield } from "lucide-react";
import { Button } from '@/components/StaffPagesComponents/ui/button';
import { Input } from '@/components/StaffPagesComponents/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/StaffPagesComponents/ui/dialog';
import { Label } from '@/components/StaffPagesComponents/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/StaffPagesComponents/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/StaffPagesComponents/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { RoleGuard } from '@/components/StaffPagesComponents/RoleGuard';
import api from '@/services/axios';
import { useLocalizedTranslation } from '@/hooks/useLocalizedTranslation';
import { adminTableStyles, adminHeadClass, adminCellClass, adminDialogStyles, ADMIN_PAGE_SIZE, adminTableBadgeClass, adminTableStatusBadgeClass, adminPageStyles } from '@/components/StaffPagesComponents/shared/adminTableStyles';
import { AdminPagination } from '@/components/StaffPagesComponents/shared/AdminPagination';
import { AdminMemberStatusBadge } from '@/components/StaffPagesComponents/shared/AdminMemberStatusBadge';
import { AdminSortableHead, type SortDirection } from '@/components/StaffPagesComponents/shared/AdminSortableHead';
import { formatAdminDate, getAdminLocale } from '@/components/StaffPagesComponents/shared/adminFormatters';
import { adminFieldIcons } from '@/components/StaffPagesComponents/shared/adminRecordFields';
import { PersonNameDisplay } from '@/components/StaffPagesComponents/shared/PersonNameDisplay';
import {
    RecordViewTabs,
    RecordViewSection,
    RecordViewField,
    RecordViewProfileHeader,
} from '@/components/StaffPagesComponents/shared/RecordViewPrimitives';
import { buildPersonName, getBilingualFieldPlaceholder, getLocalizedText } from '@/lib/localizedDisplay';
import { FieldInlineError } from '@/components/StaffPagesComponents/shared/FieldInlineError';
import { useAdminFieldValidation } from '@/hooks/useAdminFieldValidation';
import { validateAdminRegistrationMemberForm } from '@/lib/validation/adminForms';
import { normalizePhone } from '@/lib/validation/rules';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/StaffPagesComponents/ui/table';
import {
    TooltipProvider,
} from '@/components/StaffPagesComponents/ui/tooltip';
import {
    AdminActionButton,
    AdminRowActions,
    AdminViewButton,
} from '@/components/StaffPagesComponents/shared/AdminRowActions';

// ─── Unified record type ────────────────────────────────────────────────────
interface RegistrationRecord {
    id: number;
    first_name_ar?: string;
    last_name_ar?: string;
    first_name_en?: string;
    last_name_en?: string;
    phone: string;
    national_id: string;
    birthdate?: string | null;
    birth_date?: string | null;
    gender: 'male' | 'female';
    address: string;
    social_status: string;
    job?: string;
    status: string;
    created_at: string;
    photo?: string;
    national_id_front?: string;
    national_id_back?: string;
    medical_report?: string;
    memberType: 'member' | 'team_member';
    teams?: string[];
    email?: string;
    nationality?: string;
    membership_plan?: string;
    membership_plan_ar?: string;
    membership_plan_en?: string;
}

type SortField = 'name' | 'created_at';

const PAGE_SIZE = ADMIN_PAGE_SIZE;

const toArabicDigits = (str: string | undefined | null) => {
    if (!str) return '';
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return String(str).replace(/[0-9]/g, w => arabicNumbers[+w]);
};

export default function RegistrationManagementPage() {
    const { t, language, isRTL } = useLocalizedTranslation(["RegistrationManagementPage", "common"]);
    const { toast } = useToast();
    const { tVal, handleArabicChange, handleEnglishChange, handleDigitsChange } = useAdminFieldValidation();
    const [records, setRecords] = useState<RegistrationRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState<'all' | 'member' | 'team_member'>('all');
    const [sortField, setSortField] = useState<SortField>('created_at');
    const [sortDir, setSortDir] = useState<SortDirection>('desc');
    const [page, setPage] = useState(1);

    const [approvingId, setApprovingId] = useState<string | null>(null);
    const [approvedKey, setApprovedKey] = useState<string | null>(null);
    const [isAddingMember, setIsAddingMember] = useState(false);

    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<RegistrationRecord | null>(null);
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [reviewTab, setReviewTab] = useState<'info' | 'photos'>('info');

    const [newMember, setNewMember] = useState({
        name_ar: "",
        name_en: "",
        national_id: "",
        phone: "",
        birth_date: "",
        gender: "",
        address: "",
        social_status: "",
        job: "",
        children_count: 0
    });
    const [memberFieldErrors, setMemberFieldErrors] = useState<Record<string, string | undefined>>({});

    const getDisplayName = (m?: Pick<RegistrationRecord, 'first_name_ar' | 'last_name_ar' | 'first_name_en' | 'last_name_en'> | null) => {
        if (!m) return '';
        return buildPersonName({
            firstNameAr: m.first_name_ar,
            lastNameAr: m.last_name_ar,
            firstNameEn: m.first_name_en,
            lastNameEn: m.last_name_en,
        }, language).primary;
    };
    const locale = getAdminLocale(language);

    // ── Fetch both regular members and team members ──────────────────────────
    const fetchRecords = async () => {
        setIsLoading(true);
        try {
            const [membersRes, teamMembersRes] = await Promise.allSettled([
                api.get('/members', { params: { status: 'pending', limit: 50 } }),
                api.get('/team-members/pending'),
            ]);

            let regularMembers: RegistrationRecord[] = [];
            if (membersRes.status === 'fulfilled') {
                const data = Array.isArray(membersRes.value.data)
                    ? membersRes.value.data
                    : (membersRes.value.data?.data || []);
                regularMembers = data.map((m: any) => ({ 
                    ...m, 
                    email: m.account?.email || m.email,
                    membership_plan_ar: m.memberships?.[0]?.membership_plan?.name_ar || m.member_type?.name_ar || 'عضوية اجتماعية',
                    membership_plan_en: m.memberships?.[0]?.membership_plan?.name_en || m.member_type?.name_en || 'Social Membership',
                    memberType: 'member' as const 
                }));
            }

            let teamMembers: RegistrationRecord[] = [];
            if (teamMembersRes.status === 'fulfilled') {
                const raw = teamMembersRes.value.data;
                const data = Array.isArray(raw) ? raw : (raw?.data || []);
                teamMembers = data.map((m: any) => ({
                    ...m,
                    email: m.account?.email || m.email,
                    membership_plan_ar: 'عضوية رياضية',
                    membership_plan_en: 'Sports Team Member',
                    memberType: 'team_member' as const
                }));
            }

            const combined = [...regularMembers, ...teamMembers].sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            setRecords(combined);
        } catch (error) {
            console.error('Failed to fetch registrations:', error);
            toast({ title: t('toast.error'), description: t('toast.loadFailed'), variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void fetchRecords();
    }, []);

    // ── Filter, sort, paginate ───────────────────────────────────────────────
    const processedRecords = useMemo(() => {
        let result = records.filter(m => {
            const arName = `${m.first_name_ar || ''} ${m.last_name_ar || ''}`;
            const enName = `${m.first_name_en || ''} ${m.last_name_en || ''}`;
            const matchesSearch = (
                arName.includes(search) ||
                enName.toLowerCase().includes(search.toLowerCase()) ||
                m.national_id?.includes(search) ||
                m.phone?.includes(search)
            );
            const matchesType = typeFilter === 'all' || m.memberType === typeFilter;
            const matchesDate = !dateFilter || (m.created_at && m.created_at.startsWith(dateFilter));
            return matchesSearch && matchesType && matchesDate;
        });

        result.sort((a, b) => {
            let cmp = 0;
            if (sortField === 'name') {
                cmp = `${a.first_name_ar ?? ''}${a.last_name_ar ?? ''}`.localeCompare(
                    `${b.first_name_ar ?? ''}${b.last_name_ar ?? ''}`,
                    'ar',
                );
            }
            if (sortField === 'created_at') {
                cmp = (a.created_at ?? '').localeCompare(b.created_at ?? '');
            }
            return sortDir === 'asc' ? cmp : -cmp;
        });

        return result;
    }, [records, search, typeFilter, dateFilter, sortField, sortDir]);

    const totalFiltered = processedRecords.length;
    const pageRows = processedRecords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    useEffect(() => {
        setPage(1);
    }, [search, dateFilter, typeFilter, sortField, sortDir]);

    const handleSort = (field: string) => {
        const key = field as SortField;
        if (key === sortField) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortField(key);
            setSortDir(key === 'created_at' ? 'desc' : 'asc');
        }
    };

    const memberCount = records.filter(r => r.memberType === 'member').length;
    const teamMemberCount = records.filter(r => r.memberType === 'team_member').length;

    // ── Approve ──────────────────────────────────────────────────────────────
    const handleApprove = async (record: RegistrationRecord) => {
        const key = `${record.memberType}-${record.id}`;
        setApprovingId(key);
        try {
            if (record.memberType === 'member') {
                await api.post(`/members/${record.id}/membership-request`, { action: "approve" });
            } else {
                await api.post(`/team-members/${record.id}/approve`);
            }

            setRecords(prev => prev.map(r =>
                r.id === record.id && r.memberType === record.memberType
                    ? { ...r, status: 'active' }
                    : r
            ));
            setApprovedKey(key);

            const typeLabel = record.memberType === 'team_member' ? t('memberTypes.teamMember') : t('memberTypes.member');
            toast({ title: t('toast.approved'), description: t('toast.activated', { type: typeLabel }) });

            setTimeout(() => {
                setRecords(prev => prev.filter(r => !(r.id === record.id && r.memberType === record.memberType)));
                setApprovedKey(prev => (prev === key ? null : prev));
                void fetchRecords();
            }, 600);
        } catch (error) {
            toast({ title: t('toast.error'), description: t('toast.approveFailed'), variant: "destructive" });
        } finally {
            setApprovingId(null);
        }
    };

    const handleAddMember = async () => {
        const errors = validateAdminRegistrationMemberForm(newMember, tVal);
        if (Object.keys(errors).length > 0) {
            setMemberFieldErrors(errors);
            toast({ title: t('toast.error'), description: Object.values(errors)[0], variant: "destructive" });
            return;
        }
        setMemberFieldErrors({});
        setIsAddingMember(true);
        try {
            const [firstAr, ...lastAr] = newMember.name_ar.trim().split(' ');
            const [firstEn, ...lastEn] = newMember.name_en.trim().split(' ');
            const payload = {
                first_name_ar: firstAr,
                last_name_ar: lastAr.join(' ') || firstAr,
                first_name_en: firstEn,
                last_name_en: lastEn.join(' ') || firstEn,
                national_id: newMember.national_id,
                phone: newMember.phone,
                birthdate: newMember.birth_date,
                gender: newMember.gender,
                address: newMember.address,
                email: `member${newMember.national_id}@temp.com`,
                password: "Password123!",
                nationality: "Egyptian"
            };
            await api.post('/members', payload);
            toast({ title: t('toast.added'), description: t('toast.memberAdded') });
            setAddDialogOpen(false);
            void fetchRecords();
            setNewMember({ name_ar: "", name_en: "", national_id: "", phone: "", birth_date: "", gender: "", address: "", social_status: "", job: "", children_count: 0 });
            setMemberFieldErrors({});
        } catch (error) {
            toast({ title: t('toast.error'), description: t('toast.addMemberFailed'), variant: "destructive" });
        } finally {
            setIsAddingMember(false);
        }
    };

    const openReview = (record: RegistrationRecord) => { setSelectedRecord(record); setReviewTab('info'); setReviewDialogOpen(true); };

    const getFileUrl = (filename: string | undefined) => {
        if (!filename) return "/placeholder-image.png";
        if (filename.startsWith("data:")) return filename;

        if (filename.startsWith("http://") || filename.startsWith("https://")) {
            try {
                const u = new URL(filename);
                const pathname = u.pathname.replace(/\\/g, "/");
                const fileBase = "http://localhost:3000";
                if (pathname.startsWith("/api/uploads/")) return `${fileBase}${pathname.replace(/^\/api/, "")}`;
                if (pathname.startsWith("/uploads/")) return `${fileBase}${pathname}`;
                return filename;
            } catch {
                // Fall through to relative handling
            }
        }

        const fileBase = "http://localhost:3000";
        const normalized = filename.replace(/\\/g, "/");
        const clean = normalized.startsWith("/") ? normalized : `/${normalized}`;

        if (clean.startsWith("/uploads/")) {
            return `${fileBase}${clean}`;
        }
        if (clean.startsWith("/api/uploads/")) {
            return `${fileBase}${clean.replace(/^\/api/, "")}`;
        }
        return `${fileBase}/uploads${clean}`;
    };

    const getSocialStatusLabel = (status?: string) => {
        switch (status) {
            case 'single': return t('socialStatus.single');
            case 'married': return t('socialStatus.married');
            case 'widowed': return t('socialStatus.widowed');
            case 'divorced': return t('socialStatus.divorced');
            default: return status || t('common.notAvailable');
        }
    };

    const getGenderLabel = (gender?: string) => {
        switch (gender) {
            case 'male': return t('gender.male');
            case 'female': return t('gender.female');
            default: return t('common.notAvailable');
        }
    };

    // ── Export ──────────────────────────────────────────────────────────────
    const exportColumns = useMemo(
        () => [
            {
                headerEn: 'Name', headerAr: 'الاسم',
                accessor: (r: RegistrationRecord) => getDisplayName(r),
                width: 30,
            },
            {
                headerEn: 'Type', headerAr: 'النوع',
                accessor: (r: RegistrationRecord) => r.memberType === 'team_member'
                    ? (language === 'ar' ? 'عضو فريق رياضي' : 'Team Member')
                    : (language === 'ar' ? 'عضو' : 'Member'),
                width: 18,
            },
            { headerEn: 'National ID', headerAr: 'الرقم القومي', accessor: (r: RegistrationRecord) => r.national_id, width: 18 },
            { headerEn: 'Phone', headerAr: 'رقم الهاتف', accessor: (r: RegistrationRecord) => r.phone, width: 16 },
            {
                headerEn: 'Gender', headerAr: 'الجنس',
                accessor: (r: RegistrationRecord) => getGenderLabel(r.gender),
                width: 12,
            },
            {
                headerEn: 'Status', headerAr: 'الحالة',
                accessor: (r: RegistrationRecord) => r.status === 'active'
                    ? (language === 'ar' ? 'نشط' : 'Active')
                    : (language === 'ar' ? 'معلق' : 'Pending'),
                width: 12,
            },
            {
                headerEn: 'Registration Date', headerAr: 'تاريخ التسجيل',
                accessor: (r: RegistrationRecord) => formatAdminDate(r.created_at, locale),
                width: 20,
            },
        ],
        [language, getDisplayName, getGenderLabel, locale],
    );

    const exportHandle = useTableExport({
        reportId: 'registrations',
        titleEn: 'Pending Registrations Report',
        titleAr: 'تقرير طلبات التسجيل',
        columns: exportColumns,
        rows: processedRecords,
    });

    return (
        <TooltipProvider>
        <div className="h-[calc(100vh-4rem)] flex flex-col bg-background" dir={isRTL ? 'rtl' : 'ltr'}>

            {/* ── Header ── */}
            <div className="px-6 py-4 border-b border-border bg-background shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className={adminPageStyles.headerTitle}>
                            <FileText className="w-6 h-6 text-primary" />
                            {t('registration.title')}
                        </h1>
                        <div className="flex items-center gap-4 mt-1 flex-wrap">
                            <button
                                type="button"
                                onClick={() => setTypeFilter('all')}
                                className={`text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer ${typeFilter === 'all' ? 'font-semibold text-foreground' : ''}`}
                            >
                                {t('registration.pending')} <strong>{records.length}</strong> {records.length === 1 ? t('registration.request_one') : t('registration.request_other')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setTypeFilter('member')}
                                className={`inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium transition-all cursor-pointer hover:bg-blue-100 ${typeFilter === 'member' ? 'ring-2 ring-blue-400 ring-offset-1' : ''}`}
                            >
                                <Users className="w-3 h-3" /> {t('registration.members')}: {memberCount}
                            </button>
                            <button
                                type="button"
                                onClick={() => setTypeFilter('team_member')}
                                className={`inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium transition-all cursor-pointer hover:bg-amber-100 ${typeFilter === 'team_member' ? 'ring-2 ring-amber-400 ring-offset-1' : ''}`}
                            >
                                <Award className="w-3 h-3" /> {t('registration.teamMembers')}: {teamMemberCount}
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <ExportReportButton {...exportHandle} rowCount={processedRecords.length} />
                        <button
                            type="button"
                            onClick={() => void fetchRecords()}
                            disabled={isLoading}
                            className={adminPageStyles.refreshBtn}
                        >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                        {t('registration.refresh')}
                    </button>
                    </div>
                </div>
            </div>

            {/* ── Toolbar ── */}
            <div className="flex items-center gap-3 px-6 py-3 border-b border-border bg-muted/20 shrink-0">
                <div className="relative flex-1 max-w-sm">
                    <Search className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none ${isRTL ? 'right-3' : 'left-3'}`} />
                    <Input
                        placeholder={t('registration.searchPlaceholder')}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={isRTL ? 'pr-9 h-9' : 'pl-9 h-9'}
                    />
                </div>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="icon" className={`admin-filter-btn h-8 w-8 shrink-0 relative transition-all duration-150 hover:scale-105 active:scale-95 ${dateFilter ? 'border-primary bg-primary/5' : ''}`}>
                            <Filter className="w-4 h-4 text-muted-foreground" />
                            {dateFilter && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full" />}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-4">
                        <div className="space-y-3">
                            <h4 className="font-medium text-sm">{t('registration.filterByDate')}</h4>
                            <Input 
                                type="date" 
                                value={dateFilter} 
                                onChange={(e) => setDateFilter(e.target.value)} 
                                className="w-full"
                            />
                            {dateFilter && (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="w-full" 
                                    onClick={() => setDateFilter("")}
                                >
                                    {t('actions.clear', 'Clear')}
                                </Button>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            {/* ── Table ── */}
            <div className={adminTableStyles.container}>
                {isLoading ? (
                    <div
                        className="py-20 text-center text-muted-foreground"
                        dir={isRTL ? 'rtl' : 'ltr'}
                        lang={language}
                        role="status"
                        aria-live="polite"
                    >
                        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3" aria-hidden />
                        <p className="text-sm">{t('registration.loading')}</p>
                    </div>
                ) : processedRecords.length === 0 ? (
                    <div className="py-20 text-center text-muted-foreground">
                        <div className="rounded-full bg-muted/30 p-6 mb-4 w-fit mx-auto">
                            <UserX className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-base font-semibold text-foreground mb-1">{t('registration.noRequests')}</h3>
                        <p className="text-sm">
                            {search ? `${t('registration.noResults')} "${search}"` : t('registration.noPendingRequests')}
                        </p>
                    </div>
                ) : (
                    <Table className={adminTableStyles.table}>
                        <TableHeader className={adminTableStyles.header}>
                            <TableRow>
                                <TableHead className={adminHeadClass({ className: "w-10" })}>{t('table.index')}</TableHead>
                                <AdminSortableHead sortKey="name" activeSortKey={sortField} sortDirection={sortDir} onSort={handleSort}>{t('table.name')}</AdminSortableHead>
                                <TableHead className={adminHeadClass()}>{t('table.phone')}</TableHead>
                                <TableHead className={adminHeadClass()}>{t('table.nationalId')}</TableHead>
                                <AdminSortableHead sortKey="created_at" activeSortKey={sortField} sortDirection={sortDir} onSort={handleSort}>{t('table.registrationDate')}</AdminSortableHead>
                                <TableHead className={adminHeadClass({ center: true })}>{t('table.type')}</TableHead>
                                <TableHead className={adminHeadClass({ center: true })}>{t('table.status')}</TableHead>
                                <TableHead className={adminHeadClass({ center: true, className: "w-[1%] whitespace-nowrap" })}>{t('table.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className={adminTableStyles.body}>
                            {pageRows.map((record, idx) => {
                                const key = `${record.memberType}-${record.id}`;
                                const isApproving = approvingId === key;
                                const isActive = record.status === 'active';
                                const isJustApproved = approvedKey === key;
                                const isTeamMember = record.memberType === 'team_member';

                                return (
                                    <TableRow
                                        key={key}
                                        className={`${adminTableStyles.row} ${isJustApproved ? 'bg-emerald-500/10' : ''}`}
                                    >
                                        <TableCell className={adminCellClass({ size: "muted", className: "font-mono" })}>{(page - 1) * PAGE_SIZE + idx + 1}</TableCell>

                                        <TableCell className={adminCellClass()}>
                                            <PersonNameDisplay
                                                id={record.id}
                                                names={{
                                                    firstNameAr: record.first_name_ar,
                                                    lastNameAr: record.last_name_ar,
                                                    firstNameEn: record.first_name_en,
                                                    lastNameEn: record.last_name_en,
                                                }}
                                                language={language}
                                                showAvatar={false}
                                            />
                                        </TableCell>

                                        <TableCell className={adminCellClass({ size: 'phone' })}>
                                            <span dir="ltr">{record.phone}</span>
                                        </TableCell>

                                        <TableCell className={adminCellClass({ size: 'nationalId' })}>
                                            <span dir="ltr">{record.national_id}</span>
                                        </TableCell>

                                        <TableCell className={adminCellClass({ size: "muted", className: "tabular-nums" })}>
                                            {formatAdminDate(record.created_at, locale)}
                                        </TableCell>

                                        {/* Member type badge */}
                                        <TableCell className={adminCellClass({ center: true })}>
                                            {isTeamMember ? (
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

                                        {/* Status badge */}
                                        <TableCell className={adminCellClass({ center: true })}>
                                            <AdminMemberStatusBadge status={isActive ? 'active' : 'pending'} compact />
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell className={adminCellClass({ center: true, className: "whitespace-nowrap" })}>
                                            <AdminRowActions>
                                                <RoleGuard privilege="VIEW_MEMBERS">
                                                    <AdminViewButton
                                                        tooltip={t('rowActions.viewDetails')}
                                                        onClick={() => openReview(record)}
                                                    />
                                                </RoleGuard>
                                                <RoleGuard privilege="MANAGE_MEMBERSHIP_REQUEST">
                                                    <AdminActionButton
                                                        tooltip={isApproving ? t('actions.processing') : t('actions.approve')}
                                                        icon={Check}
                                                        variant="approve"
                                                        onClick={() => void handleApprove(record)}
                                                        disabled={isActive || isApproving}
                                                        loading={isApproving}
                                                    />
                                                </RoleGuard>
                                            </AdminRowActions>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </div>

            <AdminPagination
                page={page}
                totalCount={totalFiltered}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
                isRTL={isRTL}
                disabled={isLoading}
            />

            {/* Add New Member Dialog */}
            <Dialog open={addDialogOpen} onOpenChange={(open) => { setAddDialogOpen(open); if (!open) setMemberFieldErrors({}); }}>
                <DialogContent className="max-w-3xl" dir={isRTL ? 'rtl' : 'ltr'}>
                    <DialogHeader>
                        <DialogTitle>{t('addMember.title')}</DialogTitle>
                        <DialogDescription>{t('addMember.description')}</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                            <Label>{t('addMember.nameAr')}</Label>
                            <Input
                                value={newMember.name_ar}
                                onChange={(e) => handleArabicChange(
                                    e.target.value,
                                    (name_ar) => setNewMember({ ...newMember, name_ar }),
                                    (message) => setMemberFieldErrors((prev) => ({ ...prev, name_ar: message })),
                                )}
                                placeholder={getBilingualFieldPlaceholder('ar', 'RegistrationManagementPage', 'addMember.nameArPlaceholder')}
                                className={memberFieldErrors.name_ar ? "border-destructive" : ""}
                            />
                            <FieldInlineError message={memberFieldErrors.name_ar} />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('addMember.nameEn')}</Label>
                            <Input
                                value={newMember.name_en}
                                onChange={(e) => handleEnglishChange(
                                    e.target.value,
                                    (name_en) => setNewMember({ ...newMember, name_en }),
                                    (message) => setMemberFieldErrors((prev) => ({ ...prev, name_en: message })),
                                )}
                                placeholder={getBilingualFieldPlaceholder('en', 'RegistrationManagementPage', 'addMember.nameEnPlaceholder')}
                                className={`text-left ${memberFieldErrors.name_en ? "border-destructive" : ""}`}
                                dir="ltr"
                            />
                            <FieldInlineError message={memberFieldErrors.name_en} />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('addMember.nationalId')}</Label>
                            <Input
                                value={newMember.national_id}
                                onChange={(e) => handleDigitsChange(e.target.value, (national_id) => setNewMember({ ...newMember, national_id }), 14)}
                                placeholder={t('addMember.nationalIdPlaceholder')}
                                inputMode="numeric"
                                className={`text-left ${memberFieldErrors.national_id ? "border-destructive" : ""}`}
                                dir="ltr"
                            />
                            <FieldInlineError message={memberFieldErrors.national_id} />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('addMember.phone')}</Label>
                            <Input
                                value={newMember.phone}
                                onChange={(e) => handleDigitsChange(e.target.value, (phone) => setNewMember({ ...newMember, phone: normalizePhone(phone) }), 11)}
                                placeholder={t('addMember.phonePlaceholder')}
                                type="tel"
                                inputMode="numeric"
                                className={`text-left ${memberFieldErrors.phone ? "border-destructive" : ""}`}
                                dir="ltr"
                            />
                            <FieldInlineError message={memberFieldErrors.phone} />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('addMember.birthDate')}</Label>
                            <Input
                                value={newMember.birth_date}
                                onChange={(e) => { setNewMember({ ...newMember, birth_date: e.target.value }); setMemberFieldErrors((prev) => ({ ...prev, birth_date: undefined })); }}
                                type="date"
                                className={memberFieldErrors.birth_date ? "border-destructive" : ""}
                            />
                            <FieldInlineError message={memberFieldErrors.birth_date} />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('addMember.gender')}</Label>
                            <Select onValueChange={v => { setNewMember({ ...newMember, gender: v }); setMemberFieldErrors((prev) => ({ ...prev, gender: undefined })); }}>
                                <SelectTrigger className={memberFieldErrors.gender ? "border-destructive" : ""}><SelectValue placeholder={t('addMember.selectGender')} /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">{t('addMember.male')}</SelectItem>
                                    <SelectItem value="female">{t('addMember.female')}</SelectItem>
                                </SelectContent>
                            </Select>
                            <FieldInlineError message={memberFieldErrors.gender} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>{t('addMember.address')}</Label>
                            <Input
                                value={newMember.address}
                                onChange={(e) => {
                                    const address = e.target.value.slice(0, 200);
                                    setNewMember({ ...newMember, address });
                                    setMemberFieldErrors((prev) => ({ ...prev, address: undefined }));
                                }}
                                placeholder={t('addMember.addressPlaceholder')}
                                className={memberFieldErrors.address ? "border-destructive" : ""}
                            />
                            <FieldInlineError message={memberFieldErrors.address} />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('addMember.socialStatus')}</Label>
                            <Select onValueChange={v => setNewMember({ ...newMember, social_status: v })}>
                                <SelectTrigger><SelectValue placeholder={t('addMember.selectStatus')} /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="single">{t('addMember.single')}</SelectItem>
                                    <SelectItem value="married">{t('addMember.married')}</SelectItem>
                                    <SelectItem value="widowed">{t('addMember.widowed')}</SelectItem>
                                    <SelectItem value="divorced">{t('addMember.divorced')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>{t('addMember.job')}</Label>
                            <Input
                                value={newMember.job}
                                onChange={(e) => {
                                    const job = e.target.value.slice(0, 100);
                                    setNewMember({ ...newMember, job });
                                    setMemberFieldErrors((prev) => ({ ...prev, job: undefined }));
                                }}
                                placeholder={t('addMember.jobPlaceholder')}
                                className={memberFieldErrors.job ? "border-destructive" : ""}
                            />
                            <FieldInlineError message={memberFieldErrors.job} />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('addMember.childrenCount')}</Label>
                            <Input
                                value={newMember.children_count}
                                onChange={(e) => {
                                    handleDigitsChange(e.target.value, (digits) => {
                                        setNewMember({ ...newMember, children_count: digits === '' ? 0 : Number(digits) });
                                    }, 2);
                                    setMemberFieldErrors((prev) => ({ ...prev, children_count: undefined }));
                                }}
                                type="text"
                                inputMode="numeric"
                                className={`text-left ${memberFieldErrors.children_count ? "border-destructive" : ""}`}
                                dir="ltr"
                            />
                            <FieldInlineError message={memberFieldErrors.children_count} />
                        </div>
                    </div>
                    <DialogFooter className={isRTL ? 'flex-row-reverse' : ''}>
                        <Button onClick={handleAddMember} disabled={isAddingMember} className="bg-[#1b71bc] hover:bg-[#1b71bc]/90">
                            {isAddingMember && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                            {isAddingMember ? t('addMember.saving') : t('actions.save')}
                        </Button>
                        <Button variant="outline" onClick={() => setAddDialogOpen(false)} disabled={isAddingMember}>{t('actions.cancel')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Review Record Details Dialog — matches MemberManagement DetailPanel layout */}
            <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                <DialogContent className={adminDialogStyles.content} dir={isRTL ? 'rtl' : 'ltr'}>
                    <DialogHeader className="sr-only">
                        <DialogTitle>{t('review.title')}</DialogTitle>
                        <DialogDescription>{t('review.title')}</DialogDescription>
                    </DialogHeader>

                    {selectedRecord && (
                    <div className={adminDialogStyles.panel}>
                        <div className="px-6 pt-5 pb-0 border-b border-border shrink-0">
                            <RecordViewProfileHeader
                                photoUrl={selectedRecord.photo ? getFileUrl(selectedRecord.photo) : null}
                                photoAlt={t('review.personalPhoto')}
                                name={getDisplayName(selectedRecord)}
                                badges={
                                    <>
                                        {selectedRecord.memberType === 'team_member' ? (
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
                                        <AdminMemberStatusBadge status={selectedRecord.status} />
                                    </>
                                }
                            />
                            <div className="mt-3">
                                <RecordViewTabs
                                    tabs={[
                                        { key: 'info' as const, label: t('review.memberData') },
                                        { key: 'photos' as const, label: t('review.documents') },
                                    ]}
                                    active={reviewTab}
                                    onChange={setReviewTab}
                                />
                            </div>
                        </div>

                    <div className="flex-1 overflow-y-auto">

                        {reviewTab === 'info' && (
                            <div className="p-5 space-y-4">
                                    <RecordViewSection icon={adminFieldIcons.accountSection} title={t('review.accountInfo', 'Account Information')}>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <RecordViewField icon={adminFieldIcons.email} label={t('review.email', 'Email')} value={selectedRecord?.email} ltr fallback={t('common.notAvailable')} />
                                            <RecordViewField
                                                icon={adminFieldIcons.registrationDate}
                                                label={t('review.registrationDate', 'Registration Date')}
                                                value={formatAdminDate(selectedRecord?.created_at, locale)}
                                                ltr
                                                alignEnd={isRTL}
                                                fallback={t('common.notAvailable')}
                                            />
                                            <RecordViewField
                                                icon={adminFieldIcons.registrationTime}
                                                label={t('review.registerTime', 'Registration Time')}
                                                value={formatAdminTime(selectedRecord?.created_at, locale)}
                                                ltr
                                                alignEnd={isRTL}
                                                fallback={t('common.notAvailable')}
                                            />
                                        </div>
                                    </RecordViewSection>

                                    <RecordViewSection icon={adminFieldIcons.personalSection} title={t('review.personalInfo', 'Personal Information')}>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <RecordViewField icon={adminFieldIcons.personalSection} label={t('review.name', 'Name')} value={getDisplayName(selectedRecord!)} fallback={t('common.notAvailable')} />
                                            <RecordViewField
                                                icon={adminFieldIcons.nationality}
                                                label={t('review.nationality', 'Nationality')}
                                                value={(() => {
                                                    const nat = selectedRecord?.nationality;
                                                    if (!nat) return undefined;
                                                    if (nat.toLowerCase() === 'egyptian') return isRTL ? 'مصرى' : 'Egyptian';
                                                    if (nat.toLowerCase() === 'foreigner' || nat.toLowerCase() === 'non-egyptian') return isRTL ? 'أجنبى' : 'Foreigner';
                                                    return nat;
                                                })()}
                                                fallback={t('common.notAvailable')}
                                            />
                                            <RecordViewField
                                                icon={adminFieldIcons.birthdate}
                                                label={t('addMember.birthDate')}
                                                value={(() => {
                                                    const raw = selectedRecord?.birthdate || selectedRecord?.birth_date;
                                                    if (!raw) return undefined;
                                                    const dob = new Date(raw);
                                                    if (isNaN(dob.getTime())) return String(raw);
                                                    const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
                                                    return (
                                                        <>
                                                            {formatAdminDate(raw, locale)}
                                                            <span className={`${isRTL ? 'mr-2' : 'ml-2'} text-xs font-normal text-primary`}>({age} {t('review.age')})</span>
                                                        </>
                                                    );
                                                })()}
                                                fallback={t('common.notAvailable')}
                                            />
                                            <RecordViewField
                                                icon={adminFieldIcons.nationalId}
                                                label={t('table.nationalId')}
                                                value={isRTL ? toArabicDigits(selectedRecord?.national_id ?? '') : selectedRecord?.national_id}
                                                ltr
                                                alignEnd={isRTL}
                                                fallback={t('common.notAvailable')}
                                            />
                                        </div>
                                    </RecordViewSection>

                                    <RecordViewSection icon={adminFieldIcons.contactSection} title={t('review.contactDetails', 'Contact Information')}>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <RecordViewField
                                                icon={adminFieldIcons.phone}
                                                label={t('table.phone')}
                                                value={isRTL ? toArabicDigits(selectedRecord?.phone ?? '') : selectedRecord?.phone}
                                                ltr
                                                alignEnd={isRTL}
                                                fallback={t('common.notAvailable')}
                                            />
                                            <RecordViewField icon={adminFieldIcons.address} label={t('addMember.address')} value={selectedRecord?.address} fallback={t('common.notAvailable')} />
                                        </div>
                                    </RecordViewSection>

                                    <RecordViewSection icon={Award} title={t('review.membershipDetails', 'Membership Details')} variant="accent">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <RecordViewField
                                                icon={adminFieldIcons.memberType}
                                                label={t('review.membershipType', 'Member Type')}
                                                value={selectedRecord?.memberType === 'team_member' ? t('review.sportsTeamMember') : t('review.socialMember')}
                                                fallback={t('common.notAvailable')}
                                            />
                                            <RecordViewField
                                                icon={adminFieldIcons.membershipPlan}
                                                label={t('review.membershipPlan', 'Membership Plan')}
                                                value={getLocalizedText(selectedRecord?.membership_plan_ar, selectedRecord?.membership_plan_en, language) || selectedRecord?.membership_plan}
                                                fallback={t('common.notAvailable')}
                                            />
                                            {selectedRecord?.memberType === 'team_member' && selectedRecord.teams && selectedRecord.teams.length > 0 && (
                                                <div className="space-y-2 sm:col-span-2">
                                                    <p className="text-xs text-amber-700 font-medium">{t('review.registeredTeams')}</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedRecord.teams.map(team => (
                                                            <span key={team} className="bg-white text-amber-800 text-xs font-semibold px-3 py-1 rounded-md border border-amber-200 shadow-sm">{team}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </RecordViewSection>
                            </div>
                        )}

                        {reviewTab === 'photos' && (
                            <div className="p-5 space-y-5">

                                {/* Personal photo — large */}
                                <div className="space-y-2">
                                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                                        <span className="w-1 h-4 bg-[#1b71bc] rounded-full inline-block" />
                                        {t('review.personalPhoto')}
                                    </h4>
                                    <div className="flex justify-center">
                                        {selectedRecord?.photo ? (
                                            <a href={getFileUrl(selectedRecord.photo)} target="_blank" rel="noreferrer">
                                                <img
                                                    src={getFileUrl(selectedRecord.photo)}
                                                    alt={t('review.personalPhoto')}
                                                    className="h-48 w-auto rounded-xl border-2 border-border shadow-md object-cover cursor-zoom-in hover:opacity-90 transition-opacity"
                                                />
                                            </a>
                                        ) : (
                                            <div className="h-48 w-36 rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/10 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                                <FileText className="h-8 w-8 opacity-40" />
                                                <span className="text-xs">{t('review.noPersonalPhoto')}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* ID front + back side by side */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {[
                                        { label: t('review.idFront'), src: selectedRecord?.national_id_front, color: '#1b71bc' },
                                        { label: t('review.idBack'), src: selectedRecord?.national_id_back, color: '#1b71bc' },
                                    ].map(doc => (
                                        <div key={doc.label} className="space-y-2">
                                            <h4 className="text-sm font-bold flex items-center gap-2">
                                                <span className="w-1 h-4 rounded-full inline-block" style={{ background: doc.color }} />
                                                {doc.label}
                                            </h4>
                                            <div className="aspect-[1.6/1] w-full rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/10 overflow-hidden flex items-center justify-center group cursor-zoom-in transition-all hover:border-primary/50">
                                                {doc.src ? (
                                                    <a href={getFileUrl(doc.src)} target="_blank" rel="noreferrer" className="w-full h-full">
                                                        <img src={getFileUrl(doc.src)} alt={doc.label} className="w-full h-full object-contain transition-transform group-hover:scale-105" />
                                                    </a>
                                                ) : (
                                                    <div className="text-center p-4">
                                                        <FileText className="h-7 w-7 mx-auto text-muted-foreground/40 mb-1" />
                                                        <span className="text-xs text-muted-foreground">{t('review.notUploaded')}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Medical report — full width */}
                                <div className="space-y-2">
                                    <h4 className="text-sm font-bold flex items-center gap-2">
                                        <span className="w-1 h-4 bg-orange-500 rounded-full inline-block" />
                                        {t('review.medicalReport')}
                                    </h4>
                                    <div className="min-h-[220px] w-full rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/10 overflow-hidden flex items-center justify-center group cursor-zoom-in transition-all hover:border-orange-400/60">
                                        {selectedRecord?.medical_report ? (
                                            <a href={getFileUrl(selectedRecord.medical_report)} target="_blank" rel="noreferrer" className="w-full h-full">
                                                <img src={getFileUrl(selectedRecord.medical_report)} alt={t('review.medicalReport')} className="w-full h-full object-contain transition-transform group-hover:scale-105" />
                                            </a>
                                        ) : (
                                            <div className="text-center p-8">
                                                <FileText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                                                <span className="text-sm text-muted-foreground">{t('review.noMedicalReport')}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-border px-5 py-3 bg-muted/20 shrink-0 flex items-center gap-2">
                        <div className="flex gap-2 ms-auto">
                            <Button variant="outline" size="sm" onClick={() => setReviewDialogOpen(false)}>
                                {t('actions.close')}
                            </Button>
                            <RoleGuard privilege="MANAGE_MEMBERSHIP_REQUEST">
                                <Button
                                    size="sm"
                                    className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => {
                                        void handleApprove(selectedRecord);
                                        setReviewDialogOpen(false);
                                    }}
                                    disabled={selectedRecord.status === 'active' || approvingId === `${selectedRecord.memberType}-${selectedRecord.id}`}
                                >
                                    {approvingId === `${selectedRecord.memberType}-${selectedRecord.id}` ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Check className="w-4 h-4" />
                                    )}
                                    {approvingId === `${selectedRecord.memberType}-${selectedRecord.id}` ? t('review.approving') : t('actions.approve')}
                                </Button>
                            </RoleGuard>
                        </div>
                    </div>
                    </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
        </TooltipProvider>
    );
}