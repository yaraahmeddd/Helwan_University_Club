/**
 * SportManagementPage.tsx
 *
 * Dynamic page: shows team members filtered by sport.
 *
 * Layout matches SportsMembersPage:
 *   Left panel (280px): sport cards -> GET /sports
 *   Right panel (flex): members table -> GET /sports/team-members[/sport/:name]
 *
 * Default sort: created_at DESC (newest first)
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
    Trophy, Users, Search, RefreshCw, Filter,
    ChevronUp, ChevronDown, ChevronsUpDown,
    ChevronLeft, ChevronRight, Loader2, UserCheck,
} from "lucide-react";
import api from "../services/axios";
import { useToast } from "../components/StaffPagesComponents/ui/use-toast";
import { Input } from "../components/StaffPagesComponents/ui/input";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/StaffPagesComponents/ui/select";
import { motion } from "framer-motion";

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
    team_name: string;
    status: string;
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
    team_member_teams?: TeamMemberTeamItem[];
};

const PAGE_SIZE = 15;

type SortField = "name" | "national_id" | "status" | "created_at";
type SortDir = "asc" | "desc";
// Status config
const STATUS_CLASSES: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700",
    approved: "bg-emerald-100 text-emerald-700",
    inactive: "bg-rose-100 text-rose-700",
    rejected: "bg-rose-100 text-rose-700",
    suspended: "bg-orange-100 text-orange-700",
    pending: "bg-amber-100 text-amber-800",
};

// Helpers
const fullNameAr = (m: ApiMember) =>
    [m.first_name_ar, m.last_name_ar].filter(Boolean).join(" ");

const fullNameEn = (m: ApiMember) =>
    [m.first_name_en, m.last_name_en].filter(Boolean).join(" ");

const getLanguage = (language?: string): Language =>
    (language ?? "ar").split("-")[0] === "en" ? "en" : "ar";

const fullName = (m: ApiMember, language: Language) =>
    language === "en" ? fullNameEn(m) || fullNameAr(m) : fullNameAr(m) || fullNameEn(m);

const secondaryName = (m: ApiMember, language: Language) =>
    language === "en" ? fullNameAr(m) : fullNameEn(m);

const getSportName = (sport: Sport, language: Language) =>
    language === "en" ? sport.nameEn || sport.nameAr : sport.nameAr || sport.nameEn;

const getSportSecondaryName = (sport: Sport, language: Language) =>
    language === "en" ? sport.nameAr : sport.nameEn;

const getTeamName = (team: Team | { name_ar?: string; name_en?: string }, language: Language) =>
    language === "en" ? team.name_en || team.name_ar || "" : team.name_ar || team.name_en || "";

const sportTags = (m: ApiMember) =>
    m.team_member_teams ?? [];

// Sport card

function SportCard({
    sport,
    count,
    selected,
    onClick,
    language,
    isRTL,
    allLabel,
}: {
    sport: Sport | null;   // null = "All"
    count: number;
    selected: boolean;
    onClick: () => void;
    language: Language;
    isRTL: boolean;
    allLabel: string;
}) {
    const isAll = sport === null;
    const secondary = sport ? getSportSecondaryName(sport, language) : "";
    return (
        <button
            onClick={onClick}
            className={`
        w-full ${isRTL ? "text-right" : "text-left"} rounded-xl border p-4 transition-all duration-150
        flex items-start gap-3
        ${selected
                    ? "border-[#214474] bg-[#214474] text-white shadow-md"
                    : "border-border bg-card hover:bg-muted/50 hover:border-[#214474]/40"
                }
      `}
        >
            <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg
        ${selected ? "bg-white/20" : "bg-muted"}`}>
                {isAll
                    ? <Users className={`h-4 w-4 ${selected ? "text-white" : "text-muted-foreground"}`} />
                    : <Trophy className={`h-4 w-4 ${selected ? "text-white" : "text-muted-foreground"}`} />
                }
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm font-bold leading-tight truncate ${selected ? "text-white" : "text-foreground"}`}>
                        {isAll || !sport ? allLabel : getSportName(sport, language)}
                    </p>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold
            ${selected ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
                        {count}
                    </span>
                </div>
                {!isAll && sport && secondary && (
                    <p className={`mt-0.5 text-[11px] ${selected ? "text-white/70" : "text-muted-foreground"}`} dir="ltr">
                        {secondary}
                    </p>
                )}
            </div>
        </button>
    );
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
        <th
            onClick={() => field && onSort(field)}
            className={`
        ${center ? "text-center" : isRTL ? "text-right" : "text-left"}
        px-4 py-3 text-xs font-semibold text-muted-foreground
        whitespace-nowrap select-none align-middle
        ${field ? "cursor-pointer hover:text-foreground" : ""}
      `}
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
        </th>
    );
}

// Main page

export default function SportManagementPage() {
    const { toast } = useToast();
    const { t, i18n } = useTranslation("SportManagementPage");
    const language = getLanguage(i18n.resolvedLanguage ?? i18n.language);
    const isRTL = language === "ar";

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
    const [selectedTeam, setSelectedTeam] = useState<{ id: string; name_ar: string; name_en?: string } | null>(null);
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
            const url = sport
                ? `/sports/team-members/sport/${encodeURIComponent(sport.nameEn || sport.nameAr)}`
                : "/sports/team-members";
            const res = await api.get<{ data?: ApiMember[] }>(url);
            setMembers(Array.isArray(res?.data?.data) ? res.data.data : []);
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

    useEffect(() => { void fetchMembers(selectedSport); }, [selectedSport, fetchMembers]);

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

    // Processed list
    const processed = useMemo(() => {
        let r = [...members];

        if (filterStatus !== "all") r = r.filter((m) => m.status === filterStatus);

        // Filter by selected team (client-side: match team_name in nested team_member_teams)
        if (selectedTeam) {
            r = r.filter((m) =>
                (m.team_member_teams ?? []).some((t) =>
                    t.team_name === selectedTeam.name_ar || t.team_name === selectedTeam.name_en
                )
            );
        }

        if (search.trim()) {
            const q = search.toLowerCase();
            r = r.filter((m) =>
                [fullNameAr(m), fullNameEn(m), m.national_id, m.phone ?? ""]
                    .some((v) => v.toLowerCase().includes(q))
            );
        }

        r.sort((a, b) => {
            let cmp = 0;
            if (sortField === "name") cmp = fullName(a, language).localeCompare(fullName(b, language));
            if (sortField === "national_id") cmp = a.national_id.localeCompare(b.national_id);
            if (sortField === "status") cmp = a.status.localeCompare(b.status);
            if (sortField === "created_at") cmp = a.created_at.localeCompare(b.created_at);
            return sortDir === "asc" ? cmp : -cmp;
        });

        return r;
    }, [members, search, filterStatus, sortField, sortDir, selectedTeam, language]);

    useEffect(() => { setPage(1); }, [search, filterStatus, sortField, sortDir, selectedSport, selectedTeam]);

    const totalPages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE));
    const pageRows = processed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const thProps = { sortField, sortDir, onSort: handleSort, isRTL };



    return (
        <div className="h-full flex flex-col overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
            <div className="shrink-0 px-6 py-4 border-b border-border bg-background">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Trophy className="w-6 h-6 text-primary" />
                            {t("header.title")}
                        </h1>
                        <div className="flex items-center gap-4 mt-1">
                            <p className="text-sm text-muted-foreground">
                                {t("header.total", { count: processed.length })}
                                {membersLoading && <Loader2 className={`h-3.5 w-3.5 animate-spin inline ${isRTL ? "mr-1" : "ml-1"}`} />}
                            </p>
                            {selectedSport && (
                                <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                                    <Trophy className="w-3 h-3" />
                                    {getSportName(selectedSport, language)}
                                </span>
                            )}
                            {!selectedSport && (
                                <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                                    <Users className="w-3 h-3" />
                                    {t("header.allSports", { count: sports.length })}
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => { void fetchSports(); void fetchMembers(selectedSport); }}
                        disabled={membersLoading || sportsLoading}
                        className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors disabled:opacity-40"
                    >
                        <RefreshCw className={`h-4 w-4 ${(membersLoading || sportsLoading) ? "animate-spin" : ""}`} />
                        {t("header.refresh")}
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                <aside className={`flex w-[280px] shrink-0 flex-col ${isRTL ? "border-l" : "border-r"} border-border overflow-y-auto`}>
                    <div className="shrink-0 px-4 pt-4 pb-2">
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                            {sportsLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                            {t("sidebar.sports")}
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 px-3 pb-6">
                        <SportCard
                            sport={null}
                            count={selectedSport ? 0 : members.length}
                            selected={selectedSport === null}
                            onClick={() => handleSelectSport(null)}
                            language={language}
                            isRTL={isRTL}
                            allLabel={t("sidebar.all")}
                        />
                        {sports.map((sport) => (
                            <SportCard
                                key={sport.id}
                                sport={sport}
                                count={selectedSport?.id === sport.id ? members.length : sport.membersCount}
                                selected={selectedSport?.id === sport.id}
                                onClick={() => handleSelectSport(sport)}
                                language={language}
                                isRTL={isRTL}
                                allLabel={t("sidebar.all")}
                            />
                        ))}
                    </div>
                </aside>

                <main className="flex flex-1 flex-col overflow-hidden">
                    <div className="shrink-0 flex items-center gap-3 px-6 py-3 border-b border-border bg-muted/20">
                        <div className="relative flex-1 max-w-sm">
                            <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none`} />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t("toolbar.searchPlaceholder")}
                                className={`${isRTL ? "pr-9" : "pl-9"} h-9`}
                            />
                        </div>
                        <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-40 h-9">
                                <SelectValue placeholder={t("toolbar.allStatuses")} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">{t("toolbar.allStatuses")}</SelectItem>
                                {Object.keys(STATUS_CLASSES).map((status) => (
                                    <SelectItem key={status} value={status}>{t(`status.${status}`)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-border text-xs text-muted-foreground">
                            {t("toolbar.results", { count: processed.length })}
                        </span>
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

                    <div className="flex-1 overflow-auto">
                        {membersLoading ? (
                            <div className="py-20 flex flex-col items-center gap-3 text-muted-foreground">
                                <Loader2 className="h-8 w-8 animate-spin text-primary opacity-60" />
                                <p className="text-sm">{t("table.loading")}</p>
                            </div>
                        ) : pageRows.length === 0 ? (
                            <div className="py-20 text-center text-muted-foreground">
                                <UserCheck className="h-12 w-12 opacity-20 mx-auto mb-3" />
                                <p className="text-sm">
                                    {search || filterStatus !== "all"
                                        ? t("table.emptyFiltered")
                                        : selectedSport
                                            ? t("table.emptySport", { sport: getSportName(selectedSport, language) })
                                            : t("table.empty")}
                                </p>
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 bg-muted/70 backdrop-blur border-b border-border z-10">
                                    <tr>
                                        <Th field="name" {...thProps}>{t("table.member")}</Th>
                                        <Th {...thProps}>{t("table.phone")}</Th>
                                        <Th field="national_id" {...thProps}>{t("table.nationalId")}</Th>
                                        <Th {...thProps}>{t("table.sports")}</Th>
                                        <Th field="created_at" {...thProps}>{t("table.subscriptionDate")}</Th>
                                        <Th field="status" {...thProps} center>{t("table.status")}</Th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {pageRows.map((m) => {
                                        const secondary = secondaryName(m, language);
                                        return (
                                            <tr key={m.id} className="hover:bg-muted/20 transition-colors">
                                                <td className="px-4 py-3 font-semibold align-middle">
                                                    <div>{fullName(m, language)}</div>
                                                    {secondary && (
                                                        <div className="text-xs text-muted-foreground font-normal" dir={language === "en" ? "rtl" : "ltr"}>
                                                            {secondary}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className={`${isRTL ? "text-right" : "text-left"} px-4 py-3 tabular-nums align-middle`}>
                                                    <span dir="ltr">{m.phone ?? "-"}</span>
                                                </td>
                                                <td className={`${isRTL ? "text-right" : "text-left"} px-4 py-3 font-mono text-xs align-middle`}>
                                                    <span dir="ltr">{m.national_id}</span>
                                                </td>
                                                <td className="px-4 py-3 align-middle">
                                                    <div className="flex flex-wrap gap-1">
                                                        {sportTags(m).length > 0
                                                            ? sportTags(m).map((tag) => (
                                                                <span key={tag.id}
                                                                    className="inline-flex items-center gap-1 text-xs bg-[#214474]/10 text-[#214474] rounded-full px-2 py-0.5 font-medium"
                                                                >
                                                                    <Trophy className="h-3 w-3" />
                                                                    {tag.team_name}
                                                                </span>
                                                            ))
                                                            : <span className="text-muted-foreground text-xs">-</span>
                                                        }
                                                    </div>
                                                </td>
                                                <td className={`${isRTL ? "text-right" : "text-left"} px-4 py-3 text-xs text-muted-foreground tabular-nums align-middle`}>
                                                    <span dir="ltr">
                                                        {m.created_at
                                                            ? new Date(m.created_at).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")
                                                            : "-"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center align-middle">
                                                    <span className={`inline-flex text-[11px] font-semibold rounded-full px-2.5 py-0.5 ${STATUS_CLASSES[m.status] ?? "bg-muted text-muted-foreground"}`}>
                                                        {t(`status.${m.status}`, { defaultValue: m.status })}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {!membersLoading && processed.length > PAGE_SIZE && (
                        <div className="shrink-0 flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20 text-sm">
                            <span className="text-muted-foreground text-xs">
                                {t("pagination.summary", { page, totalPages, count: processed.length })}
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => p - 1)}
                                    className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40 transition-colors"
                                    aria-label={t("pagination.previous")}
                                >
                                    {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                                </button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const pg = page <= 3 ? i + 1
                                        : page >= totalPages - 2 ? totalPages - 4 + i
                                            : page - 2 + i;
                                    if (pg < 1 || pg > totalPages) return null;
                                    return (
                                        <button
                                            key={pg}
                                            onClick={() => setPage(pg)}
                                            className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors
                        ${pg === page ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`}
                                        >
                                            {pg}
                                        </button>
                                    );
                                })}
                                <button
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((p) => p + 1)}
                                    className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-40 transition-colors"
                                    aria-label={t("pagination.next")}
                                >
                                    {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
