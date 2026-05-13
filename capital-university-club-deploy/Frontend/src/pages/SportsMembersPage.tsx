import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Search, RefreshCw, Trophy, ChevronRight, ChevronLeft, Loader2, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/StaffPagesComponents/ui/dialog";
import { Input } from "../components/StaffPagesComponents/ui/input";
import { Button } from "../components/StaffPagesComponents/ui/button";
import { Badge } from "../components/StaffPagesComponents/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/StaffPagesComponents/ui/select";
import api from "../services/api";
import { useToast } from "../hooks/use-toast";

// Types

type Language = "ar" | "en";

type SportItem = { id: number; name: string; nameAr?: string; nameEn?: string };

type SportApiItem = {
  id: number;
  name?: string;
  name_ar?: string;
  name_en?: string;
};

type MemberTeamSubscriptionResponse = {
  id: number;
  member_id: number;
  team_id: string;
  status: string;
  team?: {
    id: string;
    name_ar?: string;
    name_en?: string;
    sport?: {
      id: number;
      name_ar?: string;
      name_en?: string;
      name?: string;
    };
  };
};

type MemberApiItem = {
  id: string;
  first_name_ar: string;
  last_name_ar: string;
  first_name_en?: string;
  last_name_en?: string;
  national_id: string;
  status: string;
};

type MemberRow = {
  id: string;
  firstNameAr: string;
  lastNameAr: string;
  firstNameEn: string;
  lastNameEn: string;
  nationalId: string;
  status: string;
  isTeamPlayer: boolean;
  sports: SportItem[];
};

const PAGE_SIZE = 10;
const MAX_SPORTS_PER_MEMBER = 4;

const isActiveStatus = (status: string) => status === "active";

const getLanguage = (language?: string): Language =>
  (language ?? "ar").split("-")[0] === "en" ? "en" : "ar";

const getSportApiName = (
  sport: { name?: string; name_ar?: string; name_en?: string },
  language: Language
) =>
  language === "en"
    ? sport.name_en || sport.name_ar || sport.name || ""
    : sport.name_ar || sport.name_en || sport.name || "";

const getSportName = (sport: SportItem, language: Language) =>
  language === "en"
    ? sport.nameEn || sport.nameAr || sport.name
    : sport.nameAr || sport.nameEn || sport.name;

const getMemberDisplayName = (member: MemberRow, language: Language) => {
  const arabicName = `${member.firstNameAr} ${member.lastNameAr}`.trim();
  const englishName = `${member.firstNameEn} ${member.lastNameEn}`.trim();
  return language === "en" ? englishName || arabicName : arabicName || englishName;
};

const getMemberSecondaryName = (member: MemberRow, language: Language) => {
  const arabicName = `${member.firstNameAr} ${member.lastNameAr}`.trim();
  const englishName = `${member.firstNameEn} ${member.lastNameEn}`.trim();
  return language === "en" ? arabicName : englishName;
};

const getTeamName = (team: { name_ar?: string; name_en?: string }, language: Language) =>
  language === "en" ? team.name_en || team.name_ar || "" : team.name_ar || team.name_en || "";

// Component

export default function SportsMembersPage() {
  const { toast } = useToast();
  const { t, i18n } = useTranslation("SportsMembersPage");
  const language = getLanguage(i18n.resolvedLanguage ?? i18n.language);
  const isRTL = language === "ar";

  const [memberTab, setMemberTab] = useState<"members" | "team-members">("members");

  // Member list state
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sports master list
  const [allSports, setAllSports] = useState<SportItem[]>([]);

  // Modal state
  const [selectedMember, setSelectedMember] = useState<MemberRow | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [sportTab, setSportTab] = useState<"all" | "subscribed" | "unsubscribed">("all");
  const [sportSearch, setSportSearch] = useState("");
  const [memberSports, setMemberSports] = useState<Set<number>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // Teams cached by sport id
  const [sportTeams, setSportTeams] = useState<Record<number, { id: string; name_ar: string; name_en: string }[]>>({});
  // Selected team uuid by sport id
  const [selectedTeams, setSelectedTeams] = useState<Record<number, string>>({});

  // Assign-team modal state
  const [assignModal, setAssignModal] = useState<{
    open: boolean;
    member: MemberRow | null;
    step: 1 | 2;
    selectedSport: SportItem | null;
    selectedTeam: { id: string; name_ar: string; name_en?: string } | null;
  }>({ open: false, member: null, step: 1, selectedSport: null, selectedTeam: null });

  const [assignTeams, setAssignTeams] = useState<{
    list: { id: string; name_ar: string; name_en?: string; max_participants: number }[];
    loading: boolean;
  }>({ list: [], loading: false });

  const [assignSaving, setAssignSaving] = useState(false);

  // Load sports master list
  useEffect(() => {
    api
      .get<{ data?: SportApiItem[] }>("/sports")
      .then((res) => {
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        setAllSports(
          list.map((item) => ({
            id: item.id,
            name: getSportApiName(item, language),
            nameAr: item.name_ar,
            nameEn: item.name_en,
          }))
        );
      })
      .catch(() => {
        toast({
          title: t("toasts.loadSportsFailed.title"),
          description: t("toasts.loadSportsFailed.description"),
          variant: "destructive",
        });
      });
  }, [language, t, toast]);

  // Fetch one page of active members
  const fetchPage = useCallback(
    async (page: number, searchTerm: string, tab: "members" | "team-members") => {
      setIsLoading(true);
      try {
        if (tab === "members") {
          // GET /api/members?status=active&limit=10&page=N
          const res = await api.get("/members", {
            params: { status: "active", limit: PAGE_SIZE, page },
          });
          const raw = res.data;
          const data: MemberApiItem[] = Array.isArray(raw)
            ? raw
            : Array.isArray(raw?.data)
              ? raw.data
              : [];
          const total: number = raw?.total ?? raw?.meta?.total ?? raw?.pagination?.total ?? data.length;

          // Filter by search client-side (name or national_id)
          const q = searchTerm.trim().toLowerCase();
          const filtered = q
            ? data.filter(
              (m) =>
                `${m.first_name_ar} ${m.last_name_ar}`.includes(searchTerm.trim()) ||
                `${m.first_name_en ?? ""} ${m.last_name_en ?? ""}`.toLowerCase().includes(q) ||
                m.national_id?.includes(q)
            )
            : data;

          // For each member, fetch their sports subscriptions
          const rows: MemberRow[] = await Promise.all(
            filtered.map(async (item) => {
              let memberSportList: SportItem[] = [];
              try {
                const sRes = await api.get(`/member-teams/member/${item.id}`);
                // Backend returns: { success: true, data: [{ id, member_id, team_id, team: { id, name_ar, name_en, sport: {...} } }] }
                const subs: MemberTeamSubscriptionResponse[] = Array.isArray(sRes.data?.data) ? sRes.data.data : [];

                console.log(`[SportsMembersPage] Member ${item.id} subscriptions:`, subs);

                // Extract sport from team.sport for each subscription
                memberSportList = subs
                  .map((sub) => {
                    // Check if sub has team.sport nested object
                    if (sub.team?.sport?.id) {
                      const sport = {
                        id: sub.team.sport.id,
                        name: getSportApiName(sub.team.sport, language),
                        nameAr: sub.team.sport.name_ar,
                        nameEn: sub.team.sport.name_en,
                      };
                      console.log(`[SportsMembersPage] Extracted sport:`, sport);
                      return sport;
                    }
                    console.warn(`[SportsMembersPage] No sport found in subscription:`, sub);
                    return null;
                  })
                  .filter((s): s is SportItem => s !== null);

                console.log(`[SportsMembersPage] Member ${item.id} final sports list:`, memberSportList);
              } catch (error) {
                console.error(`Error fetching subscriptions for member ${item.id}:`, error);
                // Non-fatal: member may have no subscriptions
              }
              return {
                id: item.id,
                firstNameAr: item.first_name_ar || "",
                lastNameAr: item.last_name_ar || "",
                firstNameEn: item.first_name_en || "",
                lastNameEn: item.last_name_en || "",
                nationalId: item.national_id || "",
                status: item.status || "active",
                isTeamPlayer: false,
                sports: memberSportList,
              };
            })
          );

          const activeRows = rows.filter((r) => isActiveStatus(r.status));
          setMembers(activeRows);
          setTotalCount(q ? activeRows.length : total);
        } else {
          // GET /api/team-members with active filter
          const res = await api.get("/team-members", {
            params: { status: "active", limit: PAGE_SIZE, page },
          });
          const raw = res.data;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const data: any[] = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
          const total: number = raw?.total ?? raw?.meta?.total ?? raw?.pagination?.total ?? data.length;

          const q = searchTerm.trim().toLowerCase();
          // Team members have mixed snake_case/camelCase properties, need 'any' for compatibility
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const filtered: any[] = q
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ? data.filter((m: any) =>
              `${m.firstNameAr ?? m.first_name_ar ?? ""} ${m.lastNameAr ?? m.last_name_ar ?? ""}`.includes(searchTerm.trim()) ||
              (m.nationalId ?? m.national_id)?.includes(q)
            )
            : data;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const rows: MemberRow[] = filtered.map((item: any) => {
            // Backend already returns sports in correct format: { id: number, name: string }
            const rawSports: Array<{ id?: number | null; name?: string }> = Array.isArray(item.sports)
              ? item.sports
              : [];
            const memberSportList: SportItem[] = rawSports
              .filter((s): s is { id: number; name: string } => s.id != null && typeof s.id === 'number' && !!s.name)
              .map(s => ({ id: s.id, name: s.name }));

            return {
              id: item.id,
              firstNameAr: item.firstNameAr || item.first_name_ar || "",
              lastNameAr: item.lastNameAr || item.last_name_ar || "",
              firstNameEn: item.firstNameEn || item.first_name_en || "",
              lastNameEn: item.lastNameEn || item.last_name_en || "",
              nationalId: item.nationalId || item.national_id || "",
              status: item.membershipStatus || item.status || "active",
              isTeamPlayer: true,
              sports: memberSportList,
            };
          });

          const activeRows = rows.filter((r) => isActiveStatus(r.status));
          setMembers(activeRows);
          setTotalCount(q ? activeRows.length : total);
        }
      } catch {
        toast({
          title: t("toasts.loadMembersFailed.title"),
          description: t("toasts.loadMembersFailed.description"),
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [language, t, toast]
  );

  // Reload when page, tab, or search changes
  useEffect(() => {
    void fetchPage(currentPage, search, memberTab);
  }, [currentPage, fetchPage, memberTab, search]);

  // Reset to page 1 when tab or confirmed search changes
  const handleTabChange = (tab: "members" | "team-members") => {
    setMemberTab(tab);
    setCurrentPage(1);
    setSearch("");
  };

  const handleSearchChange = (value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(value);
      setCurrentPage(1);
    }, 300);
  };

  // Pagination
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Sports dialog filtering
  const filteredSports = useMemo(() => {
    let list = allSports;
    if (sportSearch.trim()) {
      list = list.filter((s) => getSportName(s, language).toLowerCase().includes(sportSearch.toLowerCase()));
    }
    if (sportTab === "subscribed") list = list.filter((s) => memberSports.has(s.id));
    if (sportTab === "unsubscribed") list = list.filter((s) => !memberSports.has(s.id));
    return list;
  }, [allSports, language, sportSearch, sportTab, memberSports]);

  const openEdit = useCallback((member: MemberRow) => {
    setSelectedMember(member);
    setMemberSports(new Set(member.sports.map((s) => s.id)));
    setSportTab("all");
    setSportSearch("");
    setShowModal(true);
    toast({
      title: t("toasts.editOpened.title"),
      description: t("toasts.editOpened.description", { member: getMemberDisplayName(member, language) }),
    });
  }, [language, t, toast]);

  const toggleSport = useCallback(
    (sport: SportItem) => {
      setMemberSports((prev) => {
        const next = new Set(prev);
        const sportName = getSportName(sport, language);

        if (next.has(sport.id)) {
          next.delete(sport.id);
          setSelectedTeams((st) => {
            const n = { ...st };
            delete n[sport.id];
            return n;
          });
          toast({
            title: t("toasts.sportRemoved.title"),
            description: t("toasts.sportRemoved.description", { sport: sportName }),
          });
        } else {
          if (next.size >= MAX_SPORTS_PER_MEMBER) {
            toast({
              title: t("toasts.maxSports.title"),
              description: t("toasts.maxSports.description", { max: MAX_SPORTS_PER_MEMBER }),
              variant: "destructive",
            });
            return prev;
          }

          next.add(sport.id);
          if (!selectedMember?.isTeamPlayer && !sportTeams[sport.id]) {
            api.get<{ data?: { id: string; name_ar: string; name_en: string }[] }>(`/teams?sport_id=${sport.id}`)
              .then((res) => {
                const raw = res?.data as Record<string, unknown>;
                const data = Array.isArray(raw?.data)
                  ? (raw.data as { id: string; name_ar: string; name_en: string }[])
                  : Array.isArray(raw) ? (raw as { id: string; name_ar: string; name_en: string }[]) : [];
                setSportTeams((prev2) => ({ ...prev2, [sport.id]: data }));
              })
              .catch(() => {
                setSportTeams((prev2) => ({ ...prev2, [sport.id]: [] }));
              });
          }
          toast({
            title: t("toasts.sportAdded.title"),
            description: t("toasts.sportAdded.description", { sport: sportName }),
          });
        }
        return next;
      });
    },
    [language, selectedMember, sportTeams, t, toast]
  );

  const saveAssignments = async () => {
    if (!selectedMember) return;

    if (memberSports.size > MAX_SPORTS_PER_MEMBER) {
      toast({
        title: t("toasts.validationError.title"),
        description: t("toasts.validationError.description", { count: memberSports.size, max: MAX_SPORTS_PER_MEMBER }),
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const currentSportIds = new Set(selectedMember.sports.map((s) => s.id));
      const sportsToAdd = Array.from(memberSports).filter((id) => !currentSportIds.has(id));
      const sportsToRemove = Array.from(currentSportIds).filter((id) => !memberSports.has(id));
      const errors: string[] = [];

      if (selectedMember.isTeamPlayer) {
        for (const sportId of sportsToRemove) {
          try {
            await api.delete(`/team-members/${selectedMember.id}/sports/${sportId}`);
          } catch {
            errors.push(t("errors.removeSport", { id: sportId }));
          }
        }
        for (const sportId of sportsToAdd) {
          try {
            await api.post(`/team-members/${selectedMember.id}/sports`, { sportIds: [sportId] });
          } catch {
            errors.push(t("errors.addSport", { id: sportId }));
          }
        }
      } else {
        for (const teamId of sportsToRemove) {
          try {
            await api.delete(`/member-teams/member/${selectedMember.id}/remove-sport/${teamId}`);
          } catch {
            errors.push(t("errors.removeSport", { id: teamId }));
          }
        }
        for (const sportId of sportsToAdd) {
          const teamId = selectedTeams[sportId];
          if (!teamId) {
            toast({
              title: t("toasts.selectTeam.title"),
              description: t("toasts.selectTeam.description"),
              variant: "destructive",
            });
            setIsSaving(false);
            return;
          }
          try {
            await api.post(`/member-teams/member/${selectedMember.id}/choose-sport`, { team_id: teamId });
          } catch {
            errors.push(t("errors.addSport", { id: sportId }));
          }
        }
      }

      const updatedSports = allSports.filter((s) => memberSports.has(s.id));
      setMembers((prev) =>
        prev.map((m) => (m.id === selectedMember.id ? { ...m, sports: updatedSports } : m))
      );

      if (errors.length > 0) {
        toast({
          title: t("toasts.partialSave.title"),
          description: t("toasts.partialSave.description", { count: errors.length, error: errors[0] }),
          variant: "destructive",
        });
      } else {
        toast({
          title: t("toasts.saveSuccess.title"),
          description: t("toasts.saveSuccess.description", { member: getMemberDisplayName(selectedMember, language) }),
        });
      }

      setShowModal(false);
    } catch {
      toast({
        title: t("toasts.saveFailed.title"),
        description: t("toasts.saveFailed.description"),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const openAssignModal = (member: MemberRow) => {
    setAssignModal({ open: true, member, step: 1, selectedSport: null, selectedTeam: null });
    setAssignTeams({ list: [], loading: false });
  };

  const closeAssignModal = () => {
    setAssignModal({ open: false, member: null, step: 1, selectedSport: null, selectedTeam: null });
    setAssignTeams({ list: [], loading: false });
    setAssignSaving(false);
  };

  const handleAssignSportSelect = (sport: SportItem) => {
    setAssignModal((prev) => ({ ...prev, step: 2, selectedSport: sport, selectedTeam: null }));
    setAssignTeams({ list: [], loading: true });
    api.get<{ data?: { id: string; name_ar: string; name_en?: string; max_participants: number }[] }>(`/teams?sport_id=${sport.id}`)
      .then((res) => {
        const raw = res?.data as Record<string, unknown>;
        const data = Array.isArray(raw?.data)
          ? (raw.data as { id: string; name_ar: string; name_en?: string; max_participants: number }[])
          : Array.isArray(raw) ? (raw as { id: string; name_ar: string; name_en?: string; max_participants: number }[]) : [];
        setAssignTeams({ list: data, loading: false });
      })
      .catch(() => setAssignTeams({ list: [], loading: false }));
  };

  const handleAssignTeam = async () => {
    if (!assignModal.member || !assignModal.selectedSport || !assignModal.selectedTeam) return;
    setAssignSaving(true);
    try {
      if (assignModal.member.isTeamPlayer) {
        await api.post(`/team-members/${assignModal.member.id}/sports`, {
          sport_id: assignModal.selectedSport.id,
          team_id: assignModal.selectedTeam.id,
        });
      } else {
        await api.post(`/member-teams/member/${assignModal.member.id}/choose-sport`, {
          team_id: assignModal.selectedTeam.id,
        });
      }
      toast({
        title: t("toasts.assignTeamSuccess.title"),
        description: t("toasts.assignTeamSuccess.description", {
          member: getMemberDisplayName(assignModal.member, language),
          team: getTeamName(assignModal.selectedTeam, language),
        }),
      });
      closeAssignModal();
      void fetchPage(currentPage, search, memberTab);
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      toast({
        title: t("toasts.assignTeamFailed.title"),
        description: e?.response?.data?.message ?? e?.message ?? t("common.unexpectedError"),
        variant: "destructive",
      });
      setAssignSaving(false);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <div className="px-6 py-4 border-b border-border bg-background shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              {t("header.title")}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {t("header.subtitle", { page: currentPage, totalPages, count: totalCount })}
            </p>
          </div>
          <button
            onClick={() => void fetchPage(currentPage, search, memberTab)}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm text-muted-foreground disabled:opacity-40"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            {t("header.refresh")}
          </button>
        </div>

        <div className="flex items-center gap-1 mt-3">
          <button
            onClick={() => handleTabChange("members")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${memberTab === "members"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted"
              }`}
          >
            <Users className="w-3.5 h-3.5" />
            {t("tabs.members")}
          </button>
          <button
            onClick={() => handleTabChange("team-members")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${memberTab === "team-members"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-muted"
              }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            {t("tabs.teamMembers")}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-muted/20 shrink-0 flex-wrap">
        <div className="relative w-full sm:w-80 md:w-96">
          <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none`} />
          <Input
            placeholder={t("toolbar.searchPlaceholder")}
            defaultValue={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className={`${isRTL ? "pr-9" : "pl-9"} h-10`}
          />
        </div>
        <Badge variant="outline" className="text-xs text-muted-foreground shrink-0">
          {t("toolbar.results", { count: totalCount })}
        </Badge>

        <div className="flex-1" />

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || isLoading}
              className="p-2 rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-40"
              aria-label={t("pagination.previous")}
            >
              {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`el-${i}`} className="px-1.5 text-muted-foreground text-xs">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p as number)}
                    className={`min-w-[36px] h-9 rounded-md text-xs font-medium transition-colors border ${currentPage === p
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-muted text-foreground"
                      }`}
                  >
                    {p}
                  </button>
                )
              )}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || isLoading}
              className="p-2 rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-40"
              aria-label={t("pagination.next")}
            >
              {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      <div
        className="flex-1 overflow-auto [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        {isLoading ? (
          <div className="py-20 text-center text-muted-foreground">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3" />
            <p className="text-sm">{t("table.loading")}</p>
          </div>
        ) : members.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <div className="rounded-full bg-muted/30 p-6 mb-4 w-fit mx-auto">
              <Users className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">
              {t("table.emptyTitle")}
            </h3>
            <p className="text-sm">
              {search ? t("table.emptySearch", { search }) : t("table.emptyDescription")}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted/70 backdrop-blur border-b border-border z-10">
              <tr>
                <th className={`${isRTL ? "text-right" : "text-left"} px-4 py-3 font-semibold text-xs text-muted-foreground whitespace-nowrap align-middle w-10`}>#</th>
                <th className={`${isRTL ? "text-right" : "text-left"} px-4 py-3 font-semibold text-xs text-muted-foreground whitespace-nowrap align-middle`}>{t("table.name")}</th>
                <th className="text-center px-4 py-3 font-semibold text-xs text-muted-foreground whitespace-nowrap align-middle">{t("table.status")}</th>
                <th className="text-center px-4 py-3 font-semibold text-xs text-muted-foreground whitespace-nowrap align-middle">{t("table.sports")}</th>
                <th className="text-center px-4 py-3 font-semibold text-xs text-muted-foreground whitespace-nowrap align-middle">{t("table.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {members.map((member, idx) => {
                const secondaryName = getMemberSecondaryName(member, language);
                return (
                  <tr key={member.id} className="transition-colors hover:bg-muted/40">
                    <td className="px-4 py-3 text-sm text-muted-foreground font-mono align-middle">
                      {(currentPage - 1) * PAGE_SIZE + idx + 1}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <p className="font-semibold leading-tight">{getMemberDisplayName(member, language)}</p>
                      {secondaryName && (
                        <p className="text-[11px] text-muted-foreground/70 italic tracking-wide">{secondaryName}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center align-middle">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${isActiveStatus(member.status)
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {isActiveStatus(member.status) ? t("status.active") : member.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center align-middle">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${member.sports.length >= MAX_SPORTS_PER_MEMBER
                        ? "text-amber-600 font-semibold"
                        : "text-muted-foreground"
                        }`}
                      >
                        <Trophy className="w-3 h-3" />
                        {member.sports.length} / {MAX_SPORTS_PER_MEMBER}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
                          onClick={() => openEdit(member)}
                        >
                          {t("actions.editSports")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 gap-1.5 border-amber-400/60 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                          onClick={() => openAssignModal(member)}
                        >
                          {t("actions.assignTeam")}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={showModal} onOpenChange={(open) => {
        if (!isSaving) {
          setShowModal(open);
          if (!open) {
            setSelectedTeams({});
            setSportTeams({});
          }
        }
      }}>
        <DialogContent className="max-w-2xl" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle>
              {selectedMember
                ? t("sportsModal.titleWithMember", { member: getMemberDisplayName(selectedMember, language) })
                : t("sportsModal.title")}
            </DialogTitle>
            <DialogDescription>
              {t("sportsModal.description")}
              <span className="block mt-0.5 text-amber-600 font-medium">
                {t("sportsModal.maxSports", { max: MAX_SPORTS_PER_MEMBER })}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex gap-2 border-b border-border">
              {(["all", "subscribed", "unsubscribed"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSportTab(tab)}
                  className={`px-3 py-2 border-b-2 font-medium text-sm transition-colors ${sportTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                >
                  {tab === "all"
                    ? t("sportsModal.tabs.all")
                    : tab === "subscribed"
                      ? t("sportsModal.tabs.subscribed", { count: memberSports.size })
                      : t("sportsModal.tabs.unsubscribed")}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
              <Input
                placeholder={t("sportsModal.searchPlaceholder")}
                value={sportSearch}
                onChange={(e) => setSportSearch(e.target.value)}
                className={isRTL ? "pr-10" : "pl-10"}
              />
            </div>

            <div className="space-y-1 max-h-72 overflow-y-auto border border-border rounded-lg p-2 bg-muted/10">
              {filteredSports.length > 0 ? (
                filteredSports.map((sport) => {
                  const checked = memberSports.has(sport.id);
                  const disableUnchecked = !checked && memberSports.size >= MAX_SPORTS_PER_MEMBER;
                  return (
                    <label
                      key={sport.id}
                      className={`flex flex-col gap-1 p-2.5 rounded-md transition-colors ${disableUnchecked
                        ? "opacity-40 cursor-not-allowed"
                        : checked
                          ? "bg-primary/8 hover:bg-primary/12 cursor-pointer"
                          : "hover:bg-muted/60 cursor-pointer"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={disableUnchecked}
                          onChange={() => toggleSport(sport)}
                          className="w-4 h-4 rounded border-border accent-primary disabled:cursor-not-allowed"
                        />
                        <span className={`text-sm font-medium flex-1 ${disableUnchecked ? "text-muted-foreground" : ""}`}>
                          {getSportName(sport, language)}
                        </span>
                        {checked && (
                          <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-full">
                            {t("sportsModal.added")}
                          </span>
                        )}
                      </div>
                      {checked && selectedMember && !selectedMember.isTeamPlayer && (
                        <div className={isRTL ? "mr-7" : "ml-7"}>
                          <Select
                            value={selectedTeams[sport.id] ?? ""}
                            onValueChange={(v) => setSelectedTeams((prev) => ({ ...prev, [sport.id]: v }))}
                          >
                            <SelectTrigger className="h-8 text-xs w-48">
                              <SelectValue placeholder={t("sportsModal.selectTeamPlaceholder")} />
                            </SelectTrigger>
                            <SelectContent>
                              {(sportTeams[sport.id] ?? []).length === 0 ? (
                                <SelectItem value="__loading" disabled>{t("common.loading")}</SelectItem>
                              ) : (
                                (sportTeams[sport.id] ?? []).map((team) => (
                                  <SelectItem key={team.id} value={team.id}>
                                    {getTeamName(team, language)}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </label>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  {sportTab === "subscribed"
                    ? t("sportsModal.empty.subscribed")
                    : sportTab === "unsubscribed"
                      ? t("sportsModal.empty.unsubscribed")
                      : t("sportsModal.empty.all")}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className={`text-xs font-semibold ${memberSports.size >= MAX_SPORTS_PER_MEMBER
                ? "text-amber-600"
                : "text-muted-foreground"
                }`}
              >
                {t("sportsModal.selectedCount", { count: memberSports.size, max: MAX_SPORTS_PER_MEMBER })}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  disabled={isSaving}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  onClick={() => void saveAssignments()}
                  disabled={isSaving}
                  className="gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("common.saving")}
                    </>
                  ) : (
                    t("common.save")
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={assignModal.open}
        onOpenChange={(open) => { if (!open) closeAssignModal(); }}
      >
        <DialogContent className="max-w-lg" dir={isRTL ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle>
              {assignModal.step === 1
                ? t("assignTeamModal.titleStepSport")
                : t("assignTeamModal.titleStepTeam")}
            </DialogTitle>
            <DialogDescription>
              {assignModal.member
                ? t("assignTeamModal.member", { member: getMemberDisplayName(assignModal.member, language) })
                : ""}
            </DialogDescription>
          </DialogHeader>

          {assignModal.step === 1 && (
            <div className="space-y-3 py-2">
              {allSports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">{t("assignTeamModal.noSports")}</div>
              ) : (
                <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto">
                  {allSports.map((sport) => (
                    <button
                      key={sport.id}
                      onClick={() => handleAssignSportSelect(sport)}
                      className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border bg-muted/20 p-4 hover:border-primary hover:bg-primary/5 transition-all duration-150 text-center"
                    >
                      <span className="text-sm font-semibold">{getSportName(sport, language)}</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="flex justify-end pt-2 border-t border-border">
                <Button variant="outline" onClick={closeAssignModal}>{t("common.cancel")}</Button>
              </div>
            </div>
          )}

          {assignModal.step === 2 && (
            <div className="space-y-3 py-2">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <button
                  onClick={() => setAssignModal((prev) => ({ ...prev, step: 1, selectedTeam: null }))}
                  className="hover:text-primary transition-colors"
                >
                  {t("assignTeamModal.sportsBreadcrumb")}
                </button>
                <span>/</span>
                <span className="text-foreground font-medium">
                  {assignModal.selectedSport ? getSportName(assignModal.selectedSport, language) : ""}
                </span>
              </div>

              {assignTeams.loading ? (
                <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">{t("assignTeamModal.loadingTeams")}</span>
                </div>
              ) : assignTeams.list.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">{t("assignTeamModal.noTeams")}</div>
              ) : (
                <div className="space-y-1.5 max-h-64 overflow-y-auto">
                  {assignTeams.list.map((team) => {
                    const isSelected = assignModal.selectedTeam?.id === team.id;
                    return (
                      <button
                        key={team.id}
                        onClick={() => setAssignModal((prev) => ({ ...prev, selectedTeam: { id: team.id, name_ar: team.name_ar, name_en: team.name_en } }))}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all duration-150 ${isRTL ? "text-right" : "text-left"} ${isSelected
                          ? "border-primary bg-primary/8 text-primary"
                          : "border-border bg-background hover:border-primary/50 hover:bg-muted/40"
                          }`}
                      >
                        <span className="font-medium text-sm">{getTeamName(team, language)}</span>
                        <span className="text-xs text-muted-foreground">{t("assignTeamModal.participants", { count: team.max_participants })}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setAssignModal((prev) => ({ ...prev, step: 1, selectedTeam: null }))}
                >
                  {t("common.back")}
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={closeAssignModal} disabled={assignSaving}>{t("common.cancel")}</Button>
                  <Button
                    disabled={!assignModal.selectedTeam || assignSaving}
                    className="gap-2"
                    onClick={() => void handleAssignTeam()}
                  >
                    {assignSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {t("assignTeamModal.assigning")}
                      </>
                    ) : (
                      t("common.assign")
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
