/**
 * SportManagementPage.tsx
 *
 * Dynamic page: shows team members filtered by sport.
 *
 * Layout: top toolbar filters (search, sport, status) + members table.
 * Data: GET /sports, GET /sports/team-members[/sport/:name]
 *
 * Default sort: created_at DESC (newest first)
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
    Trophy, Users, Search, RefreshCw, Filter,
    ChevronUp, ChevronDown, ChevronsUpDown,
    Loader2, UserCheck,
} from "lucide-react";
import api from '@/services/axios';
import { useToast } from '@/components/StaffPagesComponents/ui/use-toast';
import { Input } from '@/components/StaffPagesComponents/ui/input';
import { Button } from '@/components/StaffPagesComponents/ui/button';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/StaffPagesComponents/ui/select';
import { motion } from "framer-motion";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/StaffPagesComponents/ui/table';
import { useLanguage } from '@/hooks/useLanguage';
import { adminTableStyles, adminHeadClass, adminCellClass, ADMIN_PAGE_SIZE, adminPageStyles } from '@/components/StaffPagesComponents/shared/adminTableStyles';
import { AdminPagination } from '@/components/StaffPagesComponents/shared/AdminPagination';
import { AdminMemberStatusBadge } from '@/components/StaffPagesComponents/shared/AdminMemberStatusBadge';
import {
    ADMIN_MEMBER_STATUS_CONFIG,
    getAdminStatusConfig,
} from '@/components/StaffPagesComponents/shared/adminMemberStatus';
import { AdminPageHeader } from '@/components/StaffPagesComponents/shared/AdminPageHeader';
import { PersonNameDisplay } from '@/components/StaffPagesComponents/shared/PersonNameDisplay';
import { getLocalizedText, type DisplayLanguage } from '@/lib/localizedDisplay';
import { useAdminFormatters } from '@/components/StaffPagesComponents/shared/adminFormatters';
import { useTableExport } from '@/utils/reportExport/useTableExport';
import { useTableImport } from '@/utils/reportExport/useTableImport';
import { TEAM_MEMBER_IMPORT_FIELDS } from '@/utils/reportExport/importFieldSchemas';
import { importTeamMemberRow } from '@/utils/reportExport/importRegistrationHelpers';
import type { ReportSheet } from '@/utils/reportExport/types';
import { AdminReportToolbar } from '@/components/StaffPagesComponents/shared/AdminReportToolbar';


// Types

type Sport = {
    id: number;
    nameAr: string;
    nameEn: string;
    membersCount: number;
};

type Team = {
    id: string;
    name_ar: string;
    name_en?: string;
    max_participants?: number;
};

type SportApiItem = {
    id: number;
    name?: string;
    name_ar?: string;
    name_en?: string;
    membersCount?: number;
    members_count?: number;
    price?: number | string;
};

type TeamMemberTeamItem = {
    id: number;
    team_id?: string | null;
    team_name?: string;
    team_name_en?: string;
    status: string;
    team?: {
        id?: string;
        name_ar?: string;
        name_en?: string;
    } | null;
};

type SelectedTeam = { id: string; name_ar: string; name_en?: string };

const normalizeTeamLabel = (value?: string | null) => (value ?? "").trim().toLowerCase();

const memberBelongsToTeam = (entry: TeamMemberTeamItem, team: SelectedTeam): boolean => {
    if (entry.team_id && entry.team_id === team.id) return true;
    if (entry.team?.id && entry.team.id === team.id) return true;

    const entryNames = new Set(
        [
            entry.team?.name_ar,
            entry.team?.name_en,
            entry.team_name,
            entry.team_name_en,
        ]
            .map(normalizeTeamLabel)
            .filter(Boolean),
    );
    const teamNames = [team.name_ar, team.name_en]
        .map(normalizeTeamLabel)
        .filter(Boolean);

    return teamNames.some((name) => entryNames.has(name));
};

type ApiMember = {
    id: number;
    first_name_ar: string;
    last_name_ar: string;
    first_name_en: string;
    last_name_en: string;
    phone?: string | null;
    national_id: string;
    status: string;
    created_at: string;
    member_type?: 'member' | 'team_member';
    team_member_teams?: TeamMemberTeamItem[];
};

const PAGE_SIZE = ADMIN_PAGE_SIZE;

type SortField = "name" | "national_id" | "status" | "created_at";
type SortDir = "asc" | "desc";
// Status filter options — labels/colors from shared admin status config
const ALL_FILTER_STATUSES = [
    ...Object.keys(ADMIN_MEMBER_STATUS_CONFIG),
    "approved",
    "inactive",
    "rejected",
];

// Helpers
const fullNameAr = (m: ApiMember) =>
    [m.first_name_ar, m.last_name_ar].filter(Boolean).join(" ");

const fullNameEn = (m: ApiMember) =>
    [m.first_name_en, m.last_name_en].filter(Boolean).join(" ");

const fullName = (m: ApiMember, language: DisplayLanguage) =>
    getLocalizedText(fullNameAr(m), fullNameEn(m), language);

const getSportName = (sport: Sport, language: DisplayLanguage) =>
    getLocalizedText(sport.nameAr, sport.nameEn, language);

const getTeamName = (team: Team | { name_ar?: string; name_en?: string }, language: DisplayLanguage) =>
    getLocalizedText(team.name_ar, team.name_en, language);

const sportTags = (m: ApiMember) =>
    m.team_member_teams ?? [];

const getTeamTagName = (tag: TeamMemberTeamItem, language: DisplayLanguage) => {
    if (tag.team?.name_ar || tag.team?.name_en) {
        return getLocalizedText(tag.team.name_ar, tag.team.name_en, language);
    }
    return tag.team_name || "—";
};

type ProcessMemberOptions = {
    search: string;
    filterStatus: string;
    selectedTeam: SelectedTeam | null;
    sortField: SortField;
    sortDir: SortDir;
    language: DisplayLanguage;
};

function processMemberList(list: ApiMember[], opts: ProcessMemberOptions): ApiMember[] {
    let r = [...list];

    if (opts.filterStatus !== "all") r = r.filter((m) => m.status === opts.filterStatus);

    if (opts.selectedTeam) {
        r = r.filter((m) =>
            (m.team_member_teams ?? []).some((entry) => memberBelongsToTeam(entry, opts.selectedTeam!)),
        );
    }

    if (opts.search.trim()) {
        const q = opts.search.toLowerCase();
        r = r.filter((m) =>
            [fullNameAr(m), fullNameEn(m), m.national_id, m.phone ?? ""]
                .some((v) => v.toLowerCase().includes(q))
        );
    }

    r.sort((a, b) => {
        let cmp = 0;
        if (opts.sortField === "name") cmp = fullName(a, opts.language).localeCompare(fullName(b, opts.language));
        if (opts.sortField === "national_id") cmp = a.national_id.localeCompare(b.national_id);
        if (opts.sortField === "status") cmp = a.status.localeCompare(b.status);
        if (opts.sortField === "created_at") cmp = a.created_at.localeCompare(b.created_at);
        return opts.sortDir === "asc" ? cmp : -cmp;
    });

    return r;
}

async function fetchMembersForSport(sport: Sport | null): Promise<ApiMember[]> {
    if (!sport) return [];
    const [teamMembersRes, membersRes] = await Promise.allSettled([
        api.get<{ data?: ApiMember[] }>(`/sports/team-members/sport/${encodeURIComponent(sport.nameEn || sport.nameAr)}`),
        api.get<{ data?: ApiMember[] }>(`/sports/members/sport/${encodeURIComponent(sport.nameEn || sport.nameAr)}`),
    ]);

    const teamMembers: ApiMember[] = teamMembersRes.status === 'fulfilled' && Array.isArray(teamMembersRes.value?.data?.data)
        ? teamMembersRes.value.data.data.map(m => ({ ...m, member_type: 'team_member' as const }))
        : [];

    const members: ApiMember[] = membersRes.status === 'fulfilled' && Array.isArray(membersRes.value?.data?.data)
        ? membersRes.value.data.data.map(m => ({ ...m, member_type: 'member' as const }))
        : [];

    // Merge: use a composite key to avoid duplicates (same person registered as both)
    const seen = new Set<string>();
    const combined: ApiMember[] = [];
    for (const m of [...teamMembers, ...members]) {
        const key = `${m.member_type}:${m.id}`;
        if (!seen.has(key)) { seen.add(key); combined.push(m); }
    }
    return combined;
}

// Sort header helper

function Th({
    field,
    children,
    center,
    sortField,
    sortDir,
    onSort,
    isRTL,
}: {
    field?: SortField;
    children: React.ReactNode;
    center?: boolean;
    sortField: SortField;
    sortDir: SortDir;
    onSort: (f: SortField) => void;
    isRTL: boolean;
}) {
    return (
        <TableHead
            onClick={() => field && onSort(field)}
            className={adminHeadClass({
                sortable: !!field,
                center,
            })}
        >
            <span className="inline-flex items-center gap-1">
                {children}
                {field && (
                    sortField === field
                        ? sortDir === "asc"
                            ? <ChevronUp className="w-3 h-3 text-primary" />
                            : <ChevronDown className="w-3 h-3 text-primary" />
                        : <ChevronsUpDown className="w-3 h-3 opacity-40" />
                )}
            </span>
        </TableHead>
    );
}

// Main page

export default function SportManagementPage() {
    const { toast } = useToast();
    const { t } = useTranslation("SportManagementPage");
    const { t: tStatus } = useTranslation("common");
    const { language, isRTL } = useLanguage();
    const { fmtDate } = useAdminFormatters();


    // Sports
    const [sports, setSports] = useState<Sport[]>([]);
    const [sportsLoading, setSportsLoading] = useState(true);
    const [selectedSport, setSelectedSport] = useState<Sport | null>(null); // null = All

    // Members
    const [members, setMembers] = useState<ApiMember[]>([]);
    const [membersLoading, setMembersLoading] = useState(false);

    // Table state
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [sortField, setSortField] = useState<SortField>("created_at");  // default: date
    const [sortDir, setSortDir] = useState<SortDir>("desc");           // newest first
    const [page, setPage] = useState(1);

    // Team sub-nav state
    const [selectedTeam, setSelectedTeam] = useState<SelectedTeam | null>(null);
    const [teamsForSport, setTeamsForSport] = useState<Team[]>([]);
    const [teamsLoading, setTeamsLoading] = useState(false);

    // Map API sport
    const mapSport = (item: SportApiItem): Sport => ({
        id: item.id,
        nameAr: item.name_ar || item.name || "",
        nameEn: item.name_en || item.name || "",
        membersCount: item.membersCount ?? item.members_count ?? 0,
    });

    // Fetch sports
    const fetchSports = useCallback(async () => {
        setSportsLoading(true);
        try {
            const res = await api.get<{ data?: SportApiItem[] }>("/sports");
            setSports(Array.isArray(res?.data?.data) ? res.data.data.map(mapSport) : []);
        } catch (err) {
            toast({
                title: t("toasts.loadSportsFailed.title"),
                description: err instanceof Error ? err.message : t("common.error"),
                variant: "destructive",
            });
        } finally {
            setSportsLoading(false);
        }
    }, [t, toast]);

    useEffect(() => { void fetchSports(); }, [fetchSports]);

    // Fetch members
    const fetchMembers = useCallback(async (sport: Sport | null) => {
        setMembersLoading(true);
        try {
            const data = await fetchMembersForSport(sport);
            setMembers(data);
        } catch (err) {
            setMembers([]);
            toast({
                title: t("toasts.loadMembersFailed.title"),
                description: err instanceof Error ? err.message : t("common.error"),
                variant: "destructive",
            });
        } finally {
            setMembersLoading(false);
        }
    }, [t, toast]);

    // Only fetch members when a specific sport is selected
    useEffect(() => {
        if (selectedSport) {
            void fetchMembers(selectedSport);
        } else {
            setMembers([]);
        }
    }, [selectedSport, fetchMembers]);

    // Fetch teams for selected sport
    const fetchTeamsForSport = useCallback(async (sport: Sport) => {
        setTeamsLoading(true);
        setTeamsForSport([]);
        try {
            const res = await api.get(`/teams?sport_id=${sport.id}`);
            const raw = res?.data as Record<string, unknown>;
            const data = Array.isArray(raw?.data)
                ? (raw.data as Team[])
                : Array.isArray(raw) ? (raw as Team[]) : [];
            setTeamsForSport(data);
        } catch {
            setTeamsForSport([]);
        } finally {
            setTeamsLoading(false);
        }
    }, []);

    // Fetch teams whenever sport selection changes
    useEffect(() => {
        if (selectedSport) {
            void fetchTeamsForSport(selectedSport);
        } else {
            setTeamsForSport([]);
            setSelectedTeam(null);
        }
    }, [selectedSport, fetchTeamsForSport]);

    // Handle sport selection
    const handleSelectSport = (sport: Sport | null) => {
        setSelectedSport(sport);
        setSelectedTeam(null);
        setTeamsForSport([]);
        setSearch("");
        setFilterStatus("all");
        setPage(1);
    };

    // Sort
    const handleSort = (f: SortField) => {
        if (f === sortField) setSortDir((d) => d === "asc" ? "desc" : "asc");
        else { setSortField(f); setSortDir(f === "created_at" ? "desc" : "asc"); }
    };

    // Processed list (filtered view — used for table + PDF export)
    const processOpts = useMemo<ProcessMemberOptions>(() => ({
        search,
        filterStatus,
        selectedTeam,
        sortField,
        sortDir,
        language,
    }), [search, filterStatus, selectedTeam, sortField, sortDir, language]);

    const processed = useMemo(
        () => processMemberList(members, processOpts),
        [members, processOpts],
    );

    useEffect(() => { setPage(1); }, [search, filterStatus, sortField, sortDir, selectedSport, selectedTeam]);

    const pageRows = processed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const thProps = { sortField, sortDir, onSort: handleSort, isRTL };

    const exportColumns = useMemo(() => [
            {
                headerEn: "Member",
                headerAr: "الاسم",
                accessor: (m: ApiMember) => fullName(m, language),
                width: 24,
            },
            {
                headerEn: "Type",
                headerAr: "النوع",
                accessor: (m: ApiMember) =>
                    m.member_type === 'member'
                        ? (language === 'ar' ? 'عضو' : 'Member')
                        : (language === 'ar' ? 'لاعب' : 'Team Member'),
                width: 14,
            },
            {
                headerEn: "Phone",
                headerAr: "الهاتف",
                accessor: (m: ApiMember) => m.phone ?? "-",
                width: 14,
            },
            {
                headerEn: "National ID",
                headerAr: "الرقم القومي",
                accessor: (m: ApiMember) => m.national_id,
                width: 16,
            },
            {
                headerEn: "Teams",
                headerAr: "الفرق",
                accessor: (m: ApiMember) =>
                    sportTags(m).map((tag) => getTeamTagName(tag, language)).join(", ") || "-",
                width: 20,
            },
            {
                headerEn: "Subscription Date",
                headerAr: "تاريخ الاشتراك",
                accessor: (m: ApiMember) => fmtDate(m.created_at),
                width: 16,
            },
            {
                headerEn: "Status",
                headerAr: "الحالة",
                accessor: (m: ApiMember) =>
                    tStatus(getAdminStatusConfig(m.status).labelKey, { defaultValue: m.status }),
                width: 12,
            },
        ], [language, fmtDate, tStatus]);

    const buildExcelSheets = useCallback(async (): Promise<ReportSheet<ApiMember>[]> => {
        const excelFilterOpts: ProcessMemberOptions = {
            ...processOpts,
            selectedTeam: null,
        };

        const allMembers = await fetchMembersForSport(null);
        const sportMemberLists = await Promise.all(
            sports.map((sport) => fetchMembersForSport(sport)),
        );

        const allSportsLabelEn = t("toolbar.allSports");
        const allSportsLabelAr = t("toolbar.allSports");

        const sheets: ReportSheet<ApiMember>[] = [
            {
                sheetNameEn: "All Sports",
                sheetNameAr: "جميع الرياضات",
                titleEn: `Members by Sport Report — ${allSportsLabelEn}`,
                titleAr: `تقرير الأعضاء حسب الرياضة — ${allSportsLabelAr}`,
                rows: processMemberList(allMembers, excelFilterOpts),
            },
        ];

        sports.forEach((sport, index) => {
            const sportNameEn = sport.nameEn || sport.nameAr;
            const sportNameAr = sport.nameAr || sport.nameEn;
            sheets.push({
                sheetNameEn: sportNameEn,
                sheetNameAr: sportNameAr,
                titleEn: `Members by Sport Report — ${sportNameEn}`,
                titleAr: `تقرير الأعضاء حسب الرياضة — ${sportNameAr}`,
                rows: processMemberList(sportMemberLists[index] ?? [], excelFilterOpts),
            });
        });

        return sheets;
    }, [sports, processOpts, t]);

    const exportHandle = useTableExport({
        reportId: "members-by-sport",
        titleEn: "Members by Sport Report",
        titleAr: "تقرير الأعضاء حسب الرياضة",
        columns: exportColumns,
        rows: processed,
        buildExcelSheets,
    });

    const refreshMembers = useCallback(async () => {
        await fetchSports();
        await fetchMembers(selectedSport);
    }, [fetchSports, fetchMembers, selectedSport]);

    const importHandle = useTableImport({
        templateId: 'team-member-import',
        titleEn: 'Team Members Import Template',
        titleAr: 'قالب استيراد أعضاء الفرق',
        fields: TEAM_MEMBER_IMPORT_FIELDS,
        importRow: async (row) => {
            await importTeamMemberRow(row);
        },
        onComplete: refreshMembers,
    });

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col bg-background overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
            <AdminPageHeader
                icon={Trophy}
                title={t("header.title")}
                subtitle={
                    <>
                        {t("header.total", { count: processed.length })}
                        {membersLoading && <Loader2 className={`h-3.5 w-3.5 animate-spin inline ${isRTL ? "mr-1" : "ml-1"}`} />}
                        {selectedSport && (
                            <span className={`${adminPageStyles.statChip} text-amber-700 bg-amber-50 ${isRTL ? "mr-2" : "ml-2"}`}>
                                <Trophy className="w-3 h-3 inline" />
                                {" "}{getSportName(selectedSport, language)}
                            </span>
                        )}
                    </>
                }
                actions={
                    <>
                        <AdminReportToolbar
                            export={exportHandle}
                            import={importHandle}
                            importPrivilege="ADD_TEAM_MEMBER"
                            rowCount={processed.length}
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => { void fetchSports(); void fetchMembers(selectedSport); }}
                            disabled={membersLoading || sportsLoading}
                        >
                            <RefreshCw className={`h-4 w-4 ${(membersLoading || sportsLoading) ? "animate-spin" : ""}`} />
                            {t("header.refresh")}
                        </Button>
                    </>
                }
            />

            <div className="flex flex-1 flex-col overflow-hidden min-h-0">
                    <div className={`${adminPageStyles.toolbar} shrink-0`}>
                        <div className="relative w-full sm:w-72 md:w-80">
                            <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none`} />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t("toolbar.searchPlaceholder")}
                                className={`${isRTL ? "pr-9" : "pl-9"} h-9`}
                            />
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <Trophy className="h-4 w-4 text-muted-foreground" />
                            <Select
                                value={selectedSport ? String(selectedSport.id) : ""}
                                onValueChange={(val) => {
                                    const sport = sports.find((s) => String(s.id) === val);
                                    if (sport) handleSelectSport(sport);
                                }}
                                disabled={sportsLoading}
                            >
                                <SelectTrigger className="w-44 sm:w-52 h-9">
                                    <SelectValue placeholder={sportsLoading ? t("table.loading") : t("toolbar.selectSport")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {sports.map((sport) => (
                                        <SelectItem key={sport.id} value={String(sport.id)}>
                                            {getSportName(sport, language)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-36 sm:w-40 h-9">
                                    <SelectValue placeholder={t("toolbar.status")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t("toolbar.status")}</SelectItem>
                                    {ALL_FILTER_STATUSES.map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {tStatus(getAdminStatusConfig(status).labelKey, { defaultValue: status })}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                    </div>

                    {selectedSport && (
                        <div className="shrink-0 border-b border-border bg-background px-6 py-2">
                            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 custom-scrollbar">
                                {teamsLoading ? (
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        <span>{t("teams.loading")}</span>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setSelectedTeam(null)}
                                            className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-150 ${
                                                selectedTeam === null
                                                    ? "border-[#214474] bg-[#214474] text-white shadow-sm"
                                                    : "border-border bg-card text-muted-foreground hover:border-[#214474]/50 hover:text-foreground"
                                            }`}
                                        >
                                            {t("teams.all")}
                                        </button>
                                        {teamsForSport.map((team) => (
                                            <button
                                                key={team.id}
                                                onClick={() => setSelectedTeam({ id: team.id, name_ar: team.name_ar, name_en: team.name_en })}
                                                className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-150 ${
                                                    selectedTeam?.id === team.id
                                                        ? "border-[#214474] bg-[#214474] text-white shadow-sm"
                                                        : "border-border bg-card text-muted-foreground hover:border-[#214474]/50 hover:text-foreground"
                                                }`}
                                            >
                                                <Trophy className="h-3 w-3" />
                                                {getTeamName(team, language)}
                                                {team.max_participants != null && (
                                                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                                                        selectedTeam?.id === team.id ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                                                    }`}>
                                                        {team.max_participants}
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                        {teamsForSport.length === 0 && (
                                            <span className="text-xs text-muted-foreground">{t("teams.empty")}</span>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    <div className={adminTableStyles.shell}>
                    <div className={adminTableStyles.container}>
                        {membersLoading ? (
                            <div className="py-20 flex flex-col items-center gap-3 text-muted-foreground">
                                <Loader2 className="h-8 w-8 animate-spin text-primary opacity-60" />
                                <p className="text-sm">{t("table.loading")}</p>
                            </div>
                        ) : pageRows.length === 0 ? (
                            <div className="py-20 text-center text-muted-foreground">
                                <UserCheck className="h-12 w-12 opacity-20 mx-auto mb-3" />
                                <p className="text-sm">
                                    {!selectedSport
                                        ? t("toolbar.selectSport")
                                        : search || filterStatus !== "all"
                                            ? t("table.emptyFiltered")
                                            : t("table.emptySport", { sport: getSportName(selectedSport, language) })}
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader className={adminTableStyles.header}>
                                    <TableRow>
                                        <Th field="name" {...thProps}>{t("table.member")}</Th>
                                        <Th {...thProps}>{t("table.type")}</Th>
                                        <Th {...thProps}>{t("table.phone")}</Th>
                                        <Th field="national_id" {...thProps}>{t("table.nationalId")}</Th>
                                        <Th {...thProps}>{t("table.sports")}</Th>
                                        <Th field="created_at" {...thProps}>{t("table.subscriptionDate")}</Th>
                                        <Th field="status" {...thProps} center>{t("table.status")}</Th>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className={adminTableStyles.body}>
                                    {pageRows.map((m) => (
                                            <TableRow key={`${m.member_type ?? 'tm'}-${m.id}`} className={adminTableStyles.row}>
                                                <TableCell className={adminCellClass()}>
                                                    <PersonNameDisplay
                                                        id={m.id}
                                                        names={{
                                                            firstNameAr: m.first_name_ar,
                                                            lastNameAr: m.last_name_ar,
                                                            firstNameEn: m.first_name_en,
                                                            lastNameEn: m.last_name_en,
                                                        }}
                                                        language={language}
                                                        showAvatar={false}
                                                    />
                                                </TableCell>
                                                <TableCell className={adminCellClass()}>
                                                    <span className={`inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5 ${
                                                        m.member_type === 'member'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                        {m.member_type === 'member'
                                                            ? (language === 'ar' ? 'عضو' : 'Member')
                                                            : (language === 'ar' ? 'لاعب' : 'Team Member')}
                                                    </span>
                                                </TableCell>
                                                <TableCell className={adminCellClass({ size: 'phone' })}>
                                                    <span dir="ltr">{m.phone ?? "-"}</span>
                                                </TableCell>
                                                <TableCell className={adminCellClass({ size: 'nationalId' })}>
                                                    <span dir="ltr">{m.national_id}</span>
                                                </TableCell>
                                                <TableCell className={adminCellClass()}>
                                                    <div className="flex flex-wrap gap-1">
                                                        {sportTags(m).length > 0
                                                            ? sportTags(m).map((tag) => (
                                                                <span key={tag.id}
                                                                    className="inline-flex items-center gap-1 text-xs bg-[#214474]/10 text-[#214474] rounded-full px-2 py-0.5 font-medium"
                                                                >
                                                                    <Trophy className="h-3 w-3" />
                                                                    {getTeamTagName(tag, language)}
                                                                </span>
                                                            ))
                                                            : <span className="text-muted-foreground text-xs">-</span>
                                                        }
                                                    </div>
                                                </TableCell>
                                                <TableCell className={adminCellClass({ size: "muted", className: "tabular-nums" })}>
                                                    <span dir="ltr">{fmtDate(m.created_at)}</span>
                                                </TableCell>
                                                <TableCell className={adminCellClass({ center: true })}>
                                                    <AdminMemberStatusBadge status={m.status} compact />
                                                </TableCell>
                                            </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>

                    <AdminPagination
                        page={page}
                        totalCount={processed.length}
                        pageSize={PAGE_SIZE}
                        onPageChange={setPage}
                        isRTL={isRTL}
                        disabled={membersLoading}
                    />
                    </div>
            </div>

        </div>
    );
}
