import { useEffect, useState } from "react";
import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import {
  BadgeCheck,
  Briefcase,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Home,
  Image,
  LayoutDashboard,
  MapPin,
  ScrollText,
  Shield,
  Trophy,
  User,
  UserPlus,
  Users,
  Dumbbell,
  Link2,
  Building,
} from "lucide-react";
import { PAYMENT_ALERTS } from "../../../data/paymentsData";
import { useTranslation } from "react-i18next";

// ─── Types ─────────────────────────────────────────────────────────────────────

type SidebarItem = {
  title: string;
  icon: React.ElementType;
  path: string;
  privilege?: string | null;
};

type SidebarGroup = {
  label: string;
  collapsible: boolean;
  items: SidebarItem[];
};

// ─── Groups ────────────────────────────────────────────────────────────────────

const SIDEBAR_GROUPS: SidebarGroup[] = [
  // ── 1. الرئيسية ───────────────────────────────────────────────────────────
  {
    label: "groups.home",
    collapsible: false,
    items: [
      { title: "nav.dashboard", icon: LayoutDashboard, path: "/staff/dashboard", privilege: "dashboard.view" },
    ],
  },
  // ── 2. الأعضاء ────────────────────────────────────────────────────────────
  {
    label: "groups.members",
    collapsible: false,
    items: [
      { title: "nav.registrations",  icon: ClipboardList, path: "/staff/dashboard/registrations",            privilege: "MANAGE_MEMBERSHIP_REQUEST" },
      { title: "nav.membersManage",  icon: Users,         path: "/staff/dashboard/members/manage",          privilege: "VIEW_MEMBERS" },
      { title: "nav.membersNew",     icon: UserPlus,      path: "/staff/dashboard/members/new",             privilege: "CREATE_MEMBER" },
      { title: "nav.membersNewTeam", icon: UserPlus,      path: "/staff/dashboard/members/new-team-member", privilege: "ADD_TEAM_MEMBER" },
    ],
  },
  // ── 3. العمليات اليومية ───────────────────────────────────────────────────
  {
    label: "groups.dailyOps",
    collapsible: false,
    items: [
      { title: "nav.bookings",    icon: CalendarCheck, path: "/staff/dashboard/sports/bookings",    privilege: "VIEW_SPORTS" },
      { title: "nav.invitations", icon: Link2,         path: "/staff/dashboard/sports/invitations", privilege: "VIEW_SPORTS" },
    ],
  },
  // ── 4. إدارة الرياضات ─────────────────────────────────────────────────────
  {
    label: "groups.sports",
    collapsible: true,
    items: [
      { title: "nav.sports",       icon: Trophy,  path: "/staff/dashboard/sports",                  privilege: "VIEW_SPORTS" },
      { title: "nav.teams",        icon: Users,   path: "/staff/dashboard/sports/teams",            privilege: "VIEW_TEAMS" },
      { title: "nav.courts",       icon: MapPin,  path: "/staff/dashboard/sports/courts",           privilege: "VIEW_FIELDS" },
      { title: "nav.assignSports", icon: Shield,  path: "/staff/dashboard/members/sports",          privilege: "ASSIGN_SPORT_TO_MEMBER" },
      { title: "nav.sportsView",   icon: Users,   path: "/staff/dashboard/members/sports-view",     privilege: "VIEW_TEAM_MEMBERS" },
    ],
  },
  // ── 5. المالية والاشتراكات ─────────────────────────────────────────────────
  {
    label: "groups.finance",
    collapsible: true,
    items: [
      { title: "nav.subscriptions", icon: CreditCard, path: "/staff/dashboard/finance/subscriptions", privilege: "VIEW_FINANCE" },
      { title: "nav.memberships",   icon: BadgeCheck,  path: "/staff/dashboard/memberships",          privilege: "VIEW_MEMBERSHIP_PLANS" },
    ],
  },
  // ── 6. الموظفون ───────────────────────────────────────────────────────────
  {
    label: "groups.staff",
    collapsible: true,
    items: [
      { title: "nav.staffManage",     icon: Users,    path: "/staff/dashboard/admin/staff/manage",            privilege: "VIEW_STAFF" },
      { title: "nav.staffNew",        icon: UserPlus, path: "/staff/dashboard/admin/staff/new",               privilege: "CREATE_STAFF" },
      { title: "nav.assignPrivileges",icon: Shield,   path: "/staff/dashboard/admin/staff/assign-privileges", privilege: "VIEW_PRIVILEGES" },
      { title: "nav.revokePrivileges",icon: Shield,   path: "/staff/dashboard/admin/staff/revoke-privileges", privilege: "VIEW_PRIVILEGES" },
    ],
  },
  // ── 7. الباقات والصلاحيات ─────────────────────────────────────────────────
  {
    label: "groups.packages",
    collapsible: true,
    items: [
      { title: "nav.managePackages",   icon: Shield,   path: "/staff/dashboard/admin/manage-packages",     privilege: "VIEW_PRIVILEGES" },
      { title: "nav.privilegePackages",icon: UserPlus, path: "/staff/dashboard/admin/privilege-packages", privilege: "VIEW_PRIVILEGES" },
    ],
  },
  // ── 8. المركز الإعلامي ─────────────────────────────────────────────────────
  {
    label: "groups.media",
    collapsible: true,
    items: [
      { title: "nav.media",      icon: Image,      path: "/staff/dashboard/media-gallery", privilege: "MEDIA_CENTER_CREATE" },
    ],
  },
  // ── 9. إعدادات النظام ─────────────────────────────────────────────────────
  {
    label: "groups.system",
    collapsible: true,
    items: [
      { title: "nav.branches",   icon: Building,   path: "/staff/dashboard/branches",   privilege: "VIEW_BRANCHES" },
      { title: "nav.faculties",  icon: Building,   path: "/staff/dashboard/faculties",  privilege: "VIEW_FACULTIES" },
      { title: "nav.professions",icon: Briefcase,  path: "/staff/dashboard/professions",privilege: "VIEW_PROFESSIONS" },
      { title: "nav.auditLog",   icon: ScrollText, path: "/staff/dashboard/audit-log",  privilege: "VIEW_AUDIT_LOGS" },
    ],
  },
];

// ─── Member-only nav ───────────────────────────────────────────────────────────

const MEMBER_SIDEBAR_ITEMS: SidebarItem[] = [
  { title: "member.home", icon: Home, path: "/member/dashboard/home" },
  { title: "member.profile", icon: User, path: "/member/dashboard/profile" },
  { title: "member.memberships", icon: CreditCard, path: "/member/dashboard/memberships" },
  { title: "member.sports", icon: Trophy, path: "/member/dashboard/sports" },
  { title: "member.subscribe", icon: Dumbbell, path: "/member/dashboard/subscribe" },
  { title: "member.courts", icon: MapPin, path: "/member/dashboard/courts" },
];

// ─── Main Component ────────────────────────────────────────────────────────────

export function AppSidebar() {
  const { t } = useTranslation("nav");
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const { hasPrivilege, user } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const isMember = user?.role === "MEMBER";

  // ── Sidebar width via CSS var ──────────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      const isSmall = window.innerWidth < 768;
      if (isSmall) setCollapsed(true);
      const width = (collapsed || isSmall) ? "60px" : "256px";
      document.documentElement.style.setProperty("--sidebar-width", width);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [collapsed]);

  // ── Active detection ───────────────────────────────────────────────────────
  /** Routes that must not match longer sibling paths (e.g. sports vs sports/bookings) */
  const EXACT_ONLY_PATHS = new Set([
    "/staff/dashboard/members/new",
    "/staff/dashboard/members/new-team-member",
    "/staff/dashboard/sports",
  ]);

  const isActive = (path: string) => {
    if (currentPath === path) return true;
    if (EXACT_ONLY_PATHS.has(path)) return false;
    if (path === "/staff/dashboard") return false;
    return currentPath.startsWith(`${path}/`);
  };

  // ── Auto-expand group containing active route ──────────────────────────────
  useEffect(() => {
    const activeGroup = SIDEBAR_GROUPS.find(
      g =>
        g.collapsible &&
        g.items.some(item => isActive(item.path))
    );
    if (activeGroup) {
      setOpenGroups(prev => new Set([...prev, activeGroup.label]));
    }
  }, [currentPath]);

  // ── Toggle collapsible group ───────────────────────────────────────────────
  const toggleGroup = (label: string) => {
    setOpenGroups(prev => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  // ── Privilege filter ───────────────────────────────────────────────────────
  const filterItems = (items: SidebarItem[]): SidebarItem[] => {
    if (user?.role === "ADMIN") return items;
    return items.filter(item => !item.privilege || hasPrivilege(item.privilege));
  };

  // ── Payment alert helpers ──────────────────────────────────────────────────
  const hasPaymentAlert = (path: string) =>
    path.includes("finance/subscriptions") && PAYMENT_ALERTS.length > 0;

  const paymentCountLabel =
    PAYMENT_ALERTS.length > 9 ? "9+" : String(PAYMENT_ALERTS.length);

  // ── Render single nav item ─────────────────────────────────────────────────
  const renderItem = (item: SidebarItem) => {
    const active = isActive(item.path);
    const hasAlert = hasPaymentAlert(item.path);

    if (collapsed) {
      return (
        <RouterNavLink
          key={item.path}
          to={item.path}
          title={t(item.title)}
          className={`relative mx-auto mb-0.5 flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-150 ${active
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-white/80 hover:bg-white/15 hover:text-white"
            }`}
        >
          <item.icon className="h-5 w-5 shrink-0" />
          {hasAlert && (
            <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-rose-500 ring-1 ring-[#214474]" />
          )}
        </RouterNavLink>
      );
    }

    return (
      <RouterNavLink
        key={item.path}
        to={item.path}
        className={`mx-2 mb-1 flex h-11 items-center gap-4 rounded-xl border-r-[3px] px-4 transition-all duration-200 ${active
          ? "bg-gradient-to-l from-[#f8941c] to-[#fb923c] border-[#f8941c] text-white font-extrabold shadow-lg shadow-[#f8941c]/25"
          : "border-transparent text-white/90 hover:bg-white/10 hover:text-white font-bold"
          }`}
      >
        <item.icon className="h-[20px] w-[20px] shrink-0" />
        <span className="flex-1 text-[13px] font-extrabold leading-tight tracking-tight pe-1">{t(item.title)}</span>
        {hasAlert && (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold shrink-0">
            {paymentCountLabel}
          </span>
        )}
      </RouterNavLink>
    );
  };

  // ── Render group label / collapsible header ────────────────────────────────
  const renderGroupHeader = (group: SidebarGroup) => {
    if (collapsed) return null; // no labels in icon-only mode

    if (!group.collapsible) {
      return (
        <div className="flex items-center gap-2 px-3 py-1.5 mt-4">
          <div className="h-px flex-1 bg-white/20" />
          <span className="text-[13px] font-extrabold tracking-[0.15em] text-[#f8941c] whitespace-nowrap px-2">
            {t(group.label)}
          </span>
          <div className="h-px flex-1 bg-white/20" />
        </div>
      );
    }

    const isOpen = openGroups.has(group.label);
    return (
      <button
        onClick={() => toggleGroup(group.label)}
        className="w-full flex items-center gap-2 px-3 py-1.5 mt-4 rounded-md hover:bg-white/10 transition-colors"
      >
        <div className="h-px flex-1 bg-white/20" />
        <span className="text-[13px] font-extrabold tracking-[0.15em] text-[#f8941c] whitespace-nowrap px-2 flex items-center gap-2">
          {t(group.label)}
          <ChevronLeft
            className={`w-[15px] h-[15px] transition-transform duration-200 ${isOpen ? "-rotate-90" : ""
              }`}
          />
        </span>
        <div className="h-px flex-1 bg-white/20" />
      </button>
    );
  };

  return (
    <aside
      className="fixed start-0 top-16 bottom-0 z-30 flex flex-col border-e border-white/10 transition-[width] duration-200 ease-in-out shadow-[0_0_30px_rgba(14,28,56,0.25)]"
      style={{
        backgroundImage: "linear-gradient(to bottom, #0e1c38 0%, #1a3a64 55%, #2596be 100%)",
        width: collapsed ? "60px" : "256px",
      }}
    >
      {/* Gold accent strip on top — matches the dashboard header */}
      <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-[#f8941c] to-transparent pointer-events-none" />
      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav
        className="flex-1 overflow-y-auto py-3"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
      >
        {isMember ? (
          // Member-only nav ─────────────────────────────────────────────────
          <div className={collapsed ? "flex flex-col items-center gap-0.5 pt-1" : ""}>
            {MEMBER_SIDEBAR_ITEMS.map(item => renderItem(item))}
          </div>
        ) : (
          // Staff nav groups ─────────────────────────────────────────────────
          SIDEBAR_GROUPS.map(group => {
            const visibleItems = filterItems(group.items);
            if (visibleItems.length === 0) return null;

            const isOpen = !group.collapsible || openGroups.has(group.label);

            return (
              <div key={group.label}>
                {renderGroupHeader(group)}

                {group.collapsible ? (
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden"
                      >
                        <div className={`pt-1 ${collapsed ? "flex flex-col items-center gap-0.5" : ""}`}>
                          {visibleItems.map(item => renderItem(item))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                ) : (
                  <div className={`pt-1 ${collapsed ? "flex flex-col items-center gap-0.5" : ""}`}>
                    {visibleItems.map(item => renderItem(item))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </nav>

      {/* ── Profile link (staff only) ────────────────────────────────────────── */}
      {!isMember && (
        <div className={`border-t border-white/10 py-2 ${collapsed ? "flex justify-center" : ""}`}>
          {renderItem({ title: "nav.profile", icon: User, path: "/staff/dashboard/profile" })}
        </div>
      )}

      {/* ── Expand / Collapse toggle ─────────────────────────────────────────── */}
      <div className="border-t border-white/10 px-2 py-3">
        <button
          onClick={() => setCollapsed(prev => !prev)}
          className="flex w-full items-center justify-center rounded-lg p-2 text-white transition-all duration-150 hover:bg-white/10"
          aria-label={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
        >
          {collapsed
            ? <ChevronLeft className="h-4 w-4" />   // collapsed → expand (point left = away from right wall)
            : <ChevronRight className="h-4 w-4" />   // expanded  → collapse (point right = toward wall)
          }
        </button>
      </div>
    </aside>
  );
}
