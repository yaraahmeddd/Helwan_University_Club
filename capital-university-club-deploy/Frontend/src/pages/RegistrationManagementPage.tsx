import { useEffect, useState } from "react";
import { Check, Printer, Search, Eye, FileText, UserX, Loader2, RefreshCw, Filter, Users, Award, Globe } from "lucide-react";
import { Button } from "../components/StaffPagesComponents/ui/button";
import { Input } from "../components/StaffPagesComponents/ui/input";
import { Badge } from "../components/StaffPagesComponents/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../components/StaffPagesComponents/ui/dialog";
import { Label } from "../components/StaffPagesComponents/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/StaffPagesComponents/ui/select";
import { useToast } from "../hooks/use-toast";
import { RoleGuard } from "../components/StaffPagesComponents/RoleGuard";
import api from "../services/axios";
import { useTranslation } from "react-i18next";
import i18n from "../i18n";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/StaffPagesComponents/ui/table";

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
}

export default function RegistrationManagementPage() {
    const { t } = useTranslation(["RegistrationManagementPage", "common"]);
    const { toast } = useToast();
    const [records, setRecords] = useState<RegistrationRecord[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState<'all' | 'member' | 'team_member'>('all');

    const [approvingId, setApprovingId] = useState<string | null>(null);
    const [approvedKey, setApprovedKey] = useState<string | null>(null);
    const [isAddingMember, setIsAddingMember] = useState(false);

    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<RegistrationRecord | null>(null);
    const [printDialogOpen, setPrintDialogOpen] = useState(false);
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [reviewTab, setReviewTab] = useState<'data' | 'photos'>('data');

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

    const isRTL = i18n.language === 'ar';
    const getDisplayName = (m?: Pick<RegistrationRecord, 'first_name_ar' | 'last_name_ar' | 'first_name_en' | 'last_name_en'> | null) => {
        if (!m) return '';
        const ar = `${m.first_name_ar || ''} ${m.last_name_ar || ''}`.trim();
        const en = `${m.first_name_en || ''} ${m.last_name_en || ''}`.trim();
        return isRTL ? (ar || en) : (en || ar);
    };
    const locale = isRTL ? 'ar-EG' : 'en-US';

    const toggleLanguage = () => {
        const newLang = isRTL ? 'en' : 'ar';
        i18n.changeLanguage(newLang);
        document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = newLang;
    };

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
                regularMembers = data.map((m: any) => ({ ...m, memberType: 'member' as const }));
            }

            let teamMembers: RegistrationRecord[] = [];
            if (teamMembersRes.status === 'fulfilled') {
                const raw = teamMembersRes.value.data;
                const data = Array.isArray(raw) ? raw : (raw?.data || []);
                teamMembers = data;
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

    // ── Filter ───────────────────────────────────────────────────────────────
    const filteredRecords = records.filter(m => {
        const arName = `${m.first_name_ar || ''} ${m.last_name_ar || ''}`;
        const enName = `${m.first_name_en || ''} ${m.last_name_en || ''}`;
        const matchesSearch = (
            arName.includes(search) ||
            enName.toLowerCase().includes(search.toLowerCase()) ||
            m.national_id?.includes(search) ||
            m.phone?.includes(search)
        );
        const matchesType = typeFilter === 'all' || m.memberType === typeFilter;
        return matchesSearch && matchesType;
    });

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
        } catch (error) {
            toast({ title: t('toast.error'), description: t('toast.addMemberFailed'), variant: "destructive" });
        } finally {
            setIsAddingMember(false);
        }
    };

    const openPrint = (record: RegistrationRecord) => { setSelectedRecord(record); setPrintDialogOpen(true); };
    const handlePrint = () => { window.print(); };
    const openReview = (record: RegistrationRecord) => { setSelectedRecord(record); setReviewTab('data'); setReviewDialogOpen(true); };

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

    return (
        <div className="min-h-screen flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>

            {/* ── Header ── */}
            <div className="px-6 py-4 border-b border-border bg-background shrink-0">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <FileText className="w-6 h-6 text-primary" />
                            {t('registration.title')}
                        </h1>
                        <div className="flex items-center gap-4 mt-1">
                            <p className="text-sm text-muted-foreground">
                                {t('registration.pending')}: <strong>{records.length}</strong> {records.length === 1 ? t('registration.request_one') : t('registration.request_other')}
                            </p>
                            <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                                <Users className="w-3 h-3" /> {t('registration.members')}: {memberCount}
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                                <Award className="w-3 h-3" /> {t('registration.teamMembers')}: {teamMemberCount}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleLanguage}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm text-muted-foreground"
                        >
                            <Globe className="w-4 h-4" />
                            {isRTL ? 'English' : 'العربية'}
                        </button>
                        <button
                            onClick={() => void fetchRecords()}
                            disabled={isLoading}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm text-muted-foreground disabled:opacity-40"
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

                {/* Type filter tabs */}
                <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
                    {([
                        { value: 'all' as const, label: t('registration.all') },
                        { value: 'member' as const, label: t('registration.members') },
                        { value: 'team_member' as const, label: t('registration.teamMembers') },
                    ]).map(tab => (
                        <button
                            key={tab.value}
                            onClick={() => setTypeFilter(tab.value)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${typeFilter === tab.value
                                ? 'bg-white shadow-sm text-foreground'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
                <Badge variant="outline" className="text-xs text-muted-foreground">
                    {filteredRecords.length} {t('registration.results')}
                </Badge>
            </div>

            {/* ── Table ── */}
            <div className="flex-1 overflow-auto [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
                {isLoading ? (
                    <div className="py-20 text-center text-muted-foreground">
                        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3" />
                        <p className="text-sm">{t('registration.loading')}</p>
                    </div>
                ) : filteredRecords.length === 0 ? (
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
                    <Table>
                        <TableHeader className="sticky top-0 bg-muted/70 backdrop-blur border-b border-border z-10">
                            <TableRow>
                                <TableHead className={`px-4 py-3 font-semibold text-xs text-muted-foreground whitespace-nowrap align-middle w-10 ${isRTL ? 'text-right' : 'text-left'}`}>{t('table.index')}</TableHead>
                                <TableHead className={`px-4 py-3 font-semibold text-xs text-muted-foreground whitespace-nowrap align-middle ${isRTL ? 'text-right' : 'text-left'}`}>{t('table.name')}</TableHead>
                                <TableHead className={`px-4 py-3 font-semibold text-xs text-muted-foreground whitespace-nowrap align-middle ${isRTL ? 'text-right' : 'text-left'}`}>{t('table.phone')}</TableHead>
                                <TableHead className={`px-4 py-3 font-semibold text-xs text-muted-foreground whitespace-nowrap align-middle ${isRTL ? 'text-right' : 'text-left'}`}>{t('table.nationalId')}</TableHead>
                                <TableHead className={`px-4 py-3 font-semibold text-xs text-muted-foreground whitespace-nowrap align-middle ${isRTL ? 'text-right' : 'text-left'}`}>{t('table.registrationDate')}</TableHead>
                                <TableHead className="text-center px-4 py-3 font-semibold text-xs text-muted-foreground whitespace-nowrap align-middle">{t('table.type')}</TableHead>
                                <TableHead className="text-center px-4 py-3 font-semibold text-xs text-muted-foreground whitespace-nowrap align-middle">{t('table.status')}</TableHead>
                                <TableHead className="text-center px-4 py-3 font-semibold text-xs text-muted-foreground whitespace-nowrap align-middle">{t('table.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-border">
                            {filteredRecords.map((record, idx) => {
                                const key = `${record.memberType}-${record.id}`;
                                const isApproving = approvingId === key;
                                const isActive = record.status === 'active';
                                const isJustApproved = approvedKey === key;
                                const isTeamMember = record.memberType === 'team_member';

                                return (
                                    <TableRow
                                        key={key}
                                        className={`transition-colors hover:bg-muted/40 ${isJustApproved ? 'bg-emerald-500/10' : ''}`}
                                    >
                                        <TableCell className="px-4 py-3 text-sm text-muted-foreground font-mono align-middle">{idx + 1}</TableCell>

                                        <TableCell className="px-4 py-3 align-middle">
                                            <p className="font-semibold leading-tight">{getDisplayName(record)}</p>
                                            {((isRTL && (record.first_name_en || record.last_name_en)) || (!isRTL && (record.first_name_ar || record.last_name_ar))) && (
                                                <p className="text-[11px] text-muted-foreground/70 italic tracking-wide" dir={isRTL ? 'ltr' : undefined}>
                                                    {isRTL ? `${record.first_name_en || ''} ${record.last_name_en || ''}` : `${record.first_name_ar || ''} ${record.last_name_ar || ''}`}
                                                </p>
                                            )}
                                        </TableCell>

                                        <TableCell className={`px-4 py-3 tabular-nums text-sm align-middle ${isRTL ? 'text-right' : 'text-left'}`}>
                                            <span dir="ltr">{record.phone}</span>
                                        </TableCell>

                                        <TableCell className={`px-4 py-3 font-mono text-xs align-middle ${isRTL ? 'text-right' : 'text-left'}`}>
                                            <span dir="ltr">{record.national_id}</span>
                                        </TableCell>

                                        <TableCell className="px-4 py-3 text-sm text-muted-foreground tabular-nums align-middle">
                                            {new Date(record.created_at).toLocaleDateString(locale)}
                                        </TableCell>

                                        {/* Member type badge */}
                                        <TableCell className="px-4 py-3 text-center align-middle">
                                            {isTeamMember ? (
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
                                        </TableCell>

                                        {/* Status badge */}
                                        <TableCell className="px-4 py-3 text-center align-middle">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${isActive
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-amber-100 text-amber-800'
                                                }`}>
                                                {isActive ? t('status.active') : t('status.pending')}
                                            </span>
                                        </TableCell>

                                        {/* Actions */}
                                        <TableCell className="px-4 py-3 align-middle">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <RoleGuard privilege="VIEW_MEMBERS">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 px-3 gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
                                                        onClick={() => openReview(record)}
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                        {t('actions.review')}
                                                    </Button>
                                                </RoleGuard>

                                                <RoleGuard privilege="MANAGE_MEMBERSHIP_REQUEST">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 px-3 gap-1.5 border-emerald-500/40 text-emerald-700 hover:bg-emerald-50 disabled:opacity-40"
                                                        onClick={() => void handleApprove(record)}
                                                        disabled={isActive || isApproving}
                                                    >
                                                        {isApproving
                                                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                            : <Check className="h-3.5 w-3.5" />
                                                        }
                                                        {isApproving ? t('actions.processing') : t('actions.approve')}
                                                    </Button>
                                                </RoleGuard>

                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 px-3 gap-1.5"
                                                    onClick={() => openPrint(record)}
                                                >
                                                    <Printer className="h-3.5 w-3.5" />
                                                    {t('actions.print')}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Add New Member Dialog */}
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogContent className="max-w-3xl" dir={isRTL ? 'rtl' : 'ltr'}>
                    <DialogHeader>
                        <DialogTitle>{t('addMember.title')}</DialogTitle>
                        <DialogDescription>{t('addMember.description')}</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                            <Label>{t('addMember.nameAr')}</Label>
                            <Input value={newMember.name_ar} onChange={e => setNewMember({ ...newMember, name_ar: e.target.value })} placeholder={t('addMember.nameArPlaceholder')} />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('addMember.nameEn')}</Label>
                            <Input value={newMember.name_en} onChange={e => setNewMember({ ...newMember, name_en: e.target.value })} placeholder={t('addMember.nameEnPlaceholder')} className="text-left" dir="ltr" />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('addMember.nationalId')}</Label>
                            <Input value={newMember.national_id} onChange={e => setNewMember({ ...newMember, national_id: e.target.value })} placeholder={t('addMember.nationalIdPlaceholder')} type="number" />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('addMember.phone')}</Label>
                            <Input value={newMember.phone} onChange={e => setNewMember({ ...newMember, phone: e.target.value })} placeholder={t('addMember.phonePlaceholder')} type="tel" className="text-left" dir="ltr" />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('addMember.birthDate')}</Label>
                            <Input value={newMember.birth_date} onChange={e => setNewMember({ ...newMember, birth_date: e.target.value })} type="date" />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('addMember.gender')}</Label>
                            <Select onValueChange={v => setNewMember({ ...newMember, gender: v })}>
                                <SelectTrigger><SelectValue placeholder={t('addMember.selectGender')} /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">{t('addMember.male')}</SelectItem>
                                    <SelectItem value="female">{t('addMember.female')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label>{t('addMember.address')}</Label>
                            <Input value={newMember.address} onChange={e => setNewMember({ ...newMember, address: e.target.value })} placeholder={t('addMember.addressPlaceholder')} />
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
                            <Input value={newMember.job} onChange={e => setNewMember({ ...newMember, job: e.target.value })} placeholder={t('addMember.jobPlaceholder')} />
                        </div>
                        <div className="space-y-2">
                            <Label>{t('addMember.childrenCount')}</Label>
                            <Input value={newMember.children_count} onChange={e => setNewMember({ ...newMember, children_count: parseInt(e.target.value) || 0 })} type="number" min={0} />
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

            {/* Print Form Dialog */}
            <Dialog open={printDialogOpen} onOpenChange={setPrintDialogOpen}>
                <DialogContent className="max-w-4xl h-[90vh] overflow-y-auto print:max-w-none print:h-auto print:overflow-visible" dir={isRTL ? 'rtl' : 'ltr'}>
                    <div id="printable-form" className="p-8 bg-white text-black print:p-0">
                        <div className={`flex justify-between items-start mb-8 border-b pb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                            <div className={isRTL ? 'text-right' : 'text-left'}>
                                {selectedRecord?.memberType === 'team_member' ? (
                                    <div className="text-sm font-bold mb-1 text-amber-700">{t('memberTypes.teamMember')}</div>
                                ) : (
                                    <div className="text-sm font-bold mb-1">{t('print.formFee')}</div>
                                )}
                            </div>
                            <div className="text-center">
                                <h2 className="text-2xl font-bold mb-2">
                                    {selectedRecord?.memberType === 'team_member' ? t('print.teamMembershipForm') : t('print.membershipForm')}
                                </h2>
                                <div className="text-primary font-bold">HUC</div>
                                <div className="text-xs">{t('print.clubName')}</div>
                                <div className="text-xs">{t('print.clubNameEn')}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-8 relative items-start">
                            <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none select-none z-0">
                                <span className="text-[150px] font-bold">HUC</span>
                            </div>

                            <div className="col-span-3 z-10">
                                <div className="w-32 h-40 border border-black flex items-center justify-center bg-gray-50 overflow-hidden">
                                    {selectedRecord?.photo ? (
                                        <img
                                            src={getFileUrl(selectedRecord.photo)}
                                            alt="Member"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                                (e.target as HTMLImageElement).parentElement!.innerText = t('print.photo');
                                            }}
                                        />
                                    ) : (
                                        <span>{t('print.photo')}</span>
                                    )}
                                </div>
                            </div>

                            <div className={`col-span-9 space-y-6 z-10 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                                <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                    <span className="font-bold min-w-[80px]">{t('print.name')}:</span>
                                    <div className="flex-1 border-b border-dotted border-black px-2">{getDisplayName(selectedRecord!)}</div>
                                </div>
                                <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                    <span className="font-bold min-w-[80px]">{t('print.birthDate')}:</span>
                                    <div className="flex-1 border-b border-dotted border-black px-2">{selectedRecord?.birth_date}</div>
                                </div>
                                <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                    <span className="font-bold min-w-[80px]">{t('print.gender')}:</span>
                                    <div className="flex-1 border-b border-dotted border-black px-2">
                                        {selectedRecord?.gender === 'male' ? t('addMember.male') : selectedRecord?.gender === 'female' ? t('addMember.female') : ''}
                                    </div>
                                </div>
                                <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                    <span className="font-bold min-w-[80px]">{t('print.address')}:</span>
                                    <div className="flex-1 border-b border-dotted border-black px-2">{selectedRecord?.address}</div>
                                </div>
                                {selectedRecord?.memberType === 'team_member' && selectedRecord.teams && selectedRecord.teams.length > 0 && (
                                    <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                        <span className="font-bold min-w-[80px]">{t('print.teams')}:</span>
                                        <div className="flex-1 border-b border-dotted border-black px-2">{selectedRecord.teams.join(' - ')}</div>
                                    </div>
                                )}
                                {selectedRecord?.memberType !== 'team_member' && (
                                    <div className={`flex gap-2 items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                                        <span className="font-bold min-w-[80px]">{t('print.socialStatus')}:</span>
                                        <div className={`flex gap-4 flex-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                            {[t('print.single'), t('print.married'), t('print.marriedWithDependents'), t('print.widowed'), t('print.divorced')].map((status, i) => {
                                                const statusKeys = ['single', 'married', 'married', 'widowed', 'divorced'];
                                                const isChecked = selectedRecord?.social_status === statusKeys[i] && (i !== 2 || selectedRecord?.social_status === 'married');
                                                if (i === 2 && selectedRecord?.social_status !== 'married') return null;
                                                return (
                                                    <div key={status} className={`flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                                        <div className={`w-4 h-4 rounded-full border border-black ${isChecked ? 'bg-black' : ''}`} />
                                                        <span>{status}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                    <span className="font-bold min-w-[80px]">{t('print.phone')}:</span>
                                    <div className="flex-1 border-b border-dotted border-black px-2" dir="ltr">{selectedRecord?.phone}</div>
                                </div>
                            </div>
                        </div>

                        <div className={`mt-12 z-10 relative ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                            <div className="font-bold mb-2">{t('print.declaration')}</div>
                            <div className={`flex gap-4 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <span>{t('print.iDeclare')}</span>
                                <span className="border-b border-dotted border-black flex-1"></span>
                                <span>{t('print.nationalId')}</span>
                                <span className="border-b border-dotted border-black flex-1">{selectedRecord?.national_id}</span>
                                <span>{t('print.declareBelow')}</span>
                            </div>
                            <p className="text-justify leading-relaxed mb-8">
                                {t('print.declarationText')}
                            </p>
                            <div className={`flex justify-between items-end mt-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-1/3 ${isRTL ? 'text-left' : 'text-right'}`}>
                                    <div className={`flex gap-2 mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                        <span>{t('print.issuedOn')}</span><span>/</span><span>/</span><span>{t('print.year')}</span>
                                    </div>
                                </div>
                                <div className="w-1/3">
                                    <div className={`mb-2 flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                        <span>{t('print.acknowledged')}:</span>
                                        <span className="border-b border-dotted border-black flex-1"></span>
                                    </div>
                                    <div className={`mb-2 flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                        <span>{t('print.signatureName')}:</span>
                                        <span className="border-b border-dotted border-black flex-1"></span>
                                    </div>
                                    <div className={`mb-2 flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                                        <span>{t('print.signature')}:</span>
                                        <span className="border-b border-dotted border-black flex-1"></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="print:hidden mt-4">
                        <Button onClick={handlePrint} className="gap-2 bg-[#1b71bc] hover:bg-[#1b71bc]/90">
                            <Printer className="h-4 w-4" />
                            {t('actions.print')}
                        </Button>
                        <Button variant="outline" onClick={() => setPrintDialogOpen(false)}>{t('actions.close')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Review Record Details Dialog — 2 Tabs */}
            <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
                    <DialogHeader className="shrink-0 pb-0">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-lg font-bold flex items-center gap-2">
                                {t('review.title')}
                                {selectedRecord?.memberType === 'team_member' ? (
                                    <span className="text-xs font-normal bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">{t('memberTypes.teamMember')}</span>
                                ) : (
                                    <span className="text-xs font-normal bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{t('memberTypes.member')}</span>
                                )}
                            </DialogTitle>
                        </div>
                        <DialogDescription className="sr-only">{t('review.title')}</DialogDescription>

                        {/* ── Tab bar ── */}
                        <div className="flex gap-0 mt-3 border-b border-border">
                            {(['data', 'photos'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setReviewTab(tab)}
                                    className={`px-5 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-px ${reviewTab === tab
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    {tab === 'data' ? t('review.memberData') : t('review.documents')}
                                </button>
                            ))}
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto">

                        {/* ══ TAB 1: User Data ══════════════════════════════════════ */}
                        {reviewTab === 'data' && (
                            <div className="p-5 space-y-5">
                                {/* Profile header */}
                                <div className="flex items-center gap-4 p-4 bg-muted/40 rounded-xl">
                                    <div className="w-20 h-24 rounded-xl border-2 border-border bg-background overflow-hidden shadow flex items-center justify-center shrink-0">
                                        {selectedRecord?.photo ? (
                                            <img src={getFileUrl(selectedRecord.photo)} alt={t('review.personalPhoto')} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xs text-muted-foreground text-center px-1">{t('review.noPhoto')}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <h3 className="text-xl font-bold">{getDisplayName(selectedRecord!)}</h3>
                                        {((isRTL && (selectedRecord?.first_name_en || selectedRecord?.last_name_en)) || (!isRTL && (selectedRecord?.first_name_ar || selectedRecord?.last_name_ar))) && (
                                            <p className="text-sm text-muted-foreground italic" dir={isRTL ? 'ltr' : undefined}>
                                                {isRTL ? `${selectedRecord?.first_name_en || ''} ${selectedRecord?.last_name_en || ''}` : `${selectedRecord?.first_name_ar || ''} ${selectedRecord?.last_name_ar || ''}`}
                                            </p>
                                        )}
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${selectedRecord?.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
                                                }`}>
                                                {selectedRecord?.status === 'active' ? t('status.active') : t('status.pending')}
                                            </span>
                                            <span className="text-xs bg-muted px-2.5 py-0.5 rounded-full text-muted-foreground">
                                                {t('review.registered')}: {selectedRecord?.created_at ? new Date(selectedRecord.created_at).toLocaleDateString(locale) : t('common.notAvailable')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Data fields grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                                    {/* Identity */}
                                    <div className="bg-background border border-border rounded-lg px-4 py-2.5">
                                        <p className="text-[11px] text-muted-foreground font-medium mb-0.5">{t('table.nationalId')}</p>
                                        <p className="text-sm font-semibold font-mono" dir="ltr">{selectedRecord?.national_id || t('common.notAvailable')}</p>
                                    </div>
                                    <div className="bg-background border border-border rounded-lg px-4 py-2.5">
                                        <p className="text-[11px] text-muted-foreground font-medium mb-0.5">{t('table.phone')}</p>
                                        <p className="text-sm font-semibold" dir="ltr">{selectedRecord?.phone || t('common.notAvailable')}</p>
                                    </div>

                                    {/* Birthday with age */}
                                    <div className="bg-background border border-border rounded-lg px-4 py-2.5">
                                        <p className="text-[11px] text-muted-foreground font-medium mb-0.5">{t('addMember.birthDate')}</p>
                                        {(() => {
                                            const raw = selectedRecord?.birthdate || selectedRecord?.birth_date;
                                            if (!raw) return <p className="text-sm font-semibold">{t('common.notAvailable')}</p>;
                                            const dob = new Date(raw);
                                            if (isNaN(dob.getTime())) return <p className="text-sm font-semibold">{String(raw)}</p>;
                                            const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
                                            return (
                                                <p className="text-sm font-semibold">
                                                    {dob.toLocaleDateString(locale)}
                                                    <span className={`${isRTL ? 'mr-2' : 'ml-2'} text-xs font-normal text-primary`}>({age} {t('review.age')})</span>
                                                </p>
                                            );
                                        })()}
                                    </div>

                                    {/* Registration date */}
                                    <div className="bg-background border border-border rounded-lg px-4 py-2.5">
                                        <p className="text-[11px] text-muted-foreground font-medium mb-0.5">{t('table.registrationDate')}</p>
                                        {selectedRecord?.created_at ? (() => {
                                            const d = new Date(selectedRecord.created_at);
                                            return (
                                                <p className="text-sm font-semibold">
                                                    {d.toLocaleDateString(locale)}
                                                    <span className={`${isRTL ? 'mr-2' : 'ml-2'} text-xs font-normal text-muted-foreground`}>{d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</span>
                                                </p>
                                            );
                                        })() : <p className="text-sm font-semibold">{t('common.notAvailable')}</p>}
                                    </div>

                                    {/* Gender */}
                                    <div className="bg-background border border-border rounded-lg px-4 py-2.5">
                                        <p className="text-[11px] text-muted-foreground font-medium mb-0.5">{t('addMember.gender')}</p>
                                        <p className="text-sm font-semibold">
                                            {getGenderLabel(selectedRecord?.gender)}
                                        </p>
                                    </div>

                                    {/* Social status */}
                                    <div className="bg-background border border-border rounded-lg px-4 py-2.5">
                                        <p className="text-[11px] text-muted-foreground font-medium mb-0.5">{t('addMember.socialStatus')}</p>
                                        <p className="text-sm font-semibold">
                                            {getSocialStatusLabel(selectedRecord?.social_status)}
                                        </p>
                                    </div>

                                    {/* Address — full width */}
                                    <div className="sm:col-span-2 bg-background border border-border rounded-lg px-4 py-2.5">
                                        <p className="text-[11px] text-muted-foreground font-medium mb-0.5">{t('addMember.address')}</p>
                                        <p className="text-sm font-semibold">{selectedRecord?.address || t('common.notAvailable')}</p>
                                    </div>
                                </div>

                                {/* ── Special / Extra Data ── */}
                                <div className="border border-primary/20 bg-primary/5 rounded-xl p-4 space-y-3">
                                    <p className="text-xs font-bold text-primary tracking-wide">{t('review.specialData')}</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="bg-background border border-border rounded-lg px-4 py-2.5">
                                            <p className="text-[11px] text-muted-foreground font-medium mb-0.5">{t('review.membershipType')}</p>
                                            <p className="text-sm font-semibold">
                                                {selectedRecord?.memberType === 'team_member' ? t('review.sportsTeamMember') : t('review.socialMember')}
                                            </p>
                                        </div>
                                        {selectedRecord?.memberType === 'team_member' && selectedRecord.teams && selectedRecord.teams.length > 0 && (
                                            <div className="sm:col-span-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5">
                                                <p className="text-[11px] text-amber-700 font-medium mb-1.5">{t('review.registeredTeams')}</p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {selectedRecord.teams.map(t => (
                                                        <span key={t} className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-200">{t}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ══ TAB 2: Documents / Photos ═════════════════════════════ */}
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

                    <DialogFooter className={`shrink-0 border-t pt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <RoleGuard privilege="MANAGE_MEMBERSHIP_REQUEST">
                            <Button
                                className="bg-green-600 hover:bg-green-700 text-white gap-2 px-8"
                                onClick={() => {
                                    if (selectedRecord) {
                                        void handleApprove(selectedRecord);
                                        setReviewDialogOpen(false);
                                    }
                                }}
                                disabled={selectedRecord?.status === 'active' || approvingId === `${selectedRecord?.memberType}-${selectedRecord?.id}`}
                            >
                                {approvingId === `${selectedRecord?.memberType}-${selectedRecord?.id}` ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" />{t('review.approving')}</>
                                ) : (
                                    <><Check className="h-4 w-4" />{t('review.approveMembership', { type: selectedRecord?.memberType === 'team_member' ? t('memberTypes.teamMember') : t('memberTypes.member') })}</>
                                )}
                            </Button>
                        </RoleGuard>
                        <Button variant="outline" onClick={() => setReviewDialogOpen(false)} className="px-8">{t('actions.close')}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* CSS for print */}
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #printable-form, #printable-form * { visibility: visible; }
                    #printable-form {
                        position: fixed;
                        left: 0; top: 0;
                        width: 100%; height: 100%;
                        margin: 0; padding: 2cm;
                        background: white;
                    }
                    .no-print { display: none !important; }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </div>
    );
}