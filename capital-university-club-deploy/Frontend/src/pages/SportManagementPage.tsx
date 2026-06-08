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
    ChevronLeft, ChevronRight, Loader2, UserCheck,
} from "lucide-react";
import api from "../services/axios";
import { useToast } from "../components/StaffPagesComponents/ui/use-toast";
import { Input } from "../components/StaffPagesComponents/ui/input";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/StaffPagesComponents/ui/select";
import { motion } from "framer-motion";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/StaffPagesComponents/ui/table";
import { useLanguage } from "../hooks/useLanguage";
import { adminTableStyles, adminHeadClass, adminCellClass } from "../components/StaffPagesComponents/shared/adminTableStyles";
import { PersonNameDisplay } from "../components/StaffPagesComponents/shared/PersonNameDisplay";
import { getLocalizedText, type DisplayLanguage } from "../lib/localizedDisplay";

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

const getSportName = (sport: Sport, language: DisplayLanguage) =>
    getLocalizedText(sport.nameAr, sport.nameEn, language);

const getTeamName = (team: Team | { name_ar?: string; name_en?: string }, language: DisplayLanguage) =>
    getLocalizedText(team.name_ar, team.name_en, language);

const sportTags = (m: ApiMember) =>
    m.team_member_teams ?? [];

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
    const { language, isRTL } = useLanguage();

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

            <div className="flex flex-1 flex-col overflow-hidden">
                    <div className="shrink-0 flex items-center gap-3 px-6 py-3 border-b border-border bg-muted/20 flex-wrap">
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
                                value={selectedSport ? String(selectedSport.id) : "all"}
                                onValueChange={(val) => {
                                    if (val === "all") handleSelectSport(null);
                                    else {
                                        const sport = sports.find((s) => String(s.id) === val);
                                        if (sport) handleSelectSport(sport);
                                    }
                                }}
                                disabled={sportsLoading}
                            >
                                <SelectTrigger className="w-44 sm:w-52 h-9">
                                    <SelectValue placeholder={t("toolbar.allSports")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t("toolbar.allSports")}</SelectItem>
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
                                    <SelectValue placeholder={t("toolbar.allStatuses")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t("toolbar.allStatuses")}</SelectItem>
                                    {Object.keys(STATUS_CLASSES).map((status) => (
                                        <SelectItem key={status} value={status}>{t(`status.${status}`)}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <span className="inline-flex items-center px-2.5 py-1 rounded-full border border-border text-xs text-muted-foreground shrink-0">
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
                                    {search || filterStatus !== "all"
                                        ? t("table.emptyFiltered")
                                        : selectedSport
                                            ? t("table.emptySport", { sport: getSportName(selectedSport, language) })
                                            : t("table.empty")}
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader className={adminTableStyles.header}>
                                    <TableRow>
                                        <Th field="name" {...thProps}>{t("table.member")}</Th>
                                        <Th {...thProps}>{t("table.phone")}</Th>
                                        <Th field="national_id" {...thProps}>{t("table.nationalId")}</Th>
                                        <Th {...thProps}>{t("table.sports")}</Th>
                                        <Th field="created_at" {...thProps}>{t("table.subscriptionDate")}</Th>
                                        <Th field="status" {...thProps} center>{t("table.status")}</Th>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className={adminTableStyles.body}>
                                    {pageRows.map((m) => (
                                            <TableRow key={m.id} className={adminTableStyles.row}>
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
                                                <TableCell className={adminCellClass({ className: "tabular-nums" })}>
                                                    <span dir="ltr">{m.phone ?? "-"}</span>
                                                </TableCell>
                                                <TableCell className={adminCellClass({ size: "xs", className: "font-mono" })}>
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
                                                                    {tag.team_name}
                                                                </span>
                                                            ))
                                                            : <span className="text-muted-foreground text-xs">-</span>
                                                        }
                                                    </div>
                                                </TableCell>
                                                <TableCell className={adminCellClass({ size: "muted", className: "tabular-nums" })}>
                                                    <span dir="ltr">
                                                        {m.created_at
                                                            ? new Date(m.created_at).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")
                                                            : "-"}
                                                    </span>
                                                </TableCell>
                                                <TableCell className={adminCellClass({ center: true })}>
                                                    <span className={`inline-flex text-[11px] font-semibold rounded-full px-2.5 py-0.5 ${STATUS_CLASSES[m.status] ?? "bg-muted text-muted-foreground"}`}>
                                                        {t(`status.${m.status}`, { defaultValue: m.status })}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
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
            </div>
        </div>
    );
}
