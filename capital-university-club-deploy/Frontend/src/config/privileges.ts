/**
 * ─── Privilege Configuration ──────────────────────────────────────────────────
 *
 * Maps every page/module in the Staff Dashboard to:
 *   1. The privilege required to access (view) the page.
 *   2. All in-page action privileges (Create, Edit, Delete, etc.).
 *
 * Used by:
 *   - <ProtectedRoute requiredPrivilege="..."> to guard route access.
 *   - <RoleGuard privilege="..."> to show/hide buttons and actions inside pages.
 *   - Sidebar navigation (show only pages the user can access).
 *
 * Privilege names match exactly the backend/DB definitions as provided.
 */

// ─── Privilege string union ────────────────────────────────────────────────────
// Add every privilege code here so TypeScript catches typos across the codebase.
export type Privilege =
  // Members
  | "View Member Requests"
  | "Change Member Status"
  | "View Members"
  | "Edit Member"
  | "Create Member"
  | "Print Member Card"
  | "Reset Member Password"
  // Team Members
  | "View Team Member Requests"
  | "Change Team Member Status"
  | "View Team Members"
  | "Edit Team Member"
  | "Create Team Member"
  | "Print Team Member Card"
  // Sports
  | "View Sports"
  | "Create Sport"
  | "Edit Sport"
  | "Deactivate Sport"
  | "Allow Sport Booking"
  | "Assign Sport to Branch"
  // Teams
  | "View Teams"
  | "Create Team"
  | "Edit Team"
  | "Deactivate Team"
  | "View Members in Team"
  | "View Team Members in Team"
  | "Assign Team to Sport"
  | "Remove Team from Sport"
  | "Assign Member to Sport"
  | "Remove Member from Sport"
  | "Assign Team Member to Sport"
  | "Remove Team Member from Sport"
  // Fields
  | "View Fields"
  | "Create Field"
  | "Edit Field"
  | "Deactivate Field"
  | "Assign Field to Sport"
  | "Allow Field Booking"
  // Bookings
  | "View Bookings"
  | "Create Booking"
  | "Edit Booking"
  | "Change Booking Status"
  | "Block Field Time"
  // Invitations
  | "View Invitations"
  // Memberships
  | "View Memberships"
  | "Create Membership"
  | "Edit Membership"
  | "Change Membership Status"
  // Posts / Media
  | "View Posts"
  | "Create Post"
  | "Edit Post"
  | "Remove Post"
  // Branches
  | "View Branches"
  | "Create Branch"
  | "Edit Branch"
  | "Change Branch Status"
  // Faculties
  | "View Faculties"
  | "Create Faculty"
  | "Edit Faculty"
  | "Remove Faculty"
  // Professions
  | "View Professions"
  | "Create Profession"
  | "Edit Profession"
  | "Remove Profession"
  // Audit Logs
  | "View Logs"
  | "Create Log"
  | "Edit Log"
  // Privilege Packages
  | "View Packages"
  | "Create Package"
  | "Edit Package"
  | "Remove Package"
  // Staff
  | "View Staff"
  | "Create Staff"
  | "Edit Staff"
  | "Change Staff Status"
  | "Print Staff Card"
  | "Assign Package to Staff"
  | "Remove Package from Staff"
  | "Assign Privilege to Staff"
  | "Remove Privilege from Staff";

// ─── Action definition ─────────────────────────────────────────────────────────
export interface PageAction {
  /** Human-readable label for the action */
  label: string;
  /** The privilege code that gates this action */
  privilege: Privilege;
}

// ─── Page/module definition ────────────────────────────────────────────────────
export interface PagePrivilegeConfig {
  /** Internal key for this module */
  module: string;
  /** Human-readable module name */
  label: string;
  /** Route path (relative to /staff/dashboard/) */
  path?: string;
  /**
   * The privilege required just to see / access the page.
   * If null the page is always visible to any authenticated staff.
   */
  pagePrivilege: Privilege | null;
  /** All in-page actions and their required privileges */
  actions: PageAction[];
}

// ─── Configuration ─────────────────────────────────────────────────────────────
export const PAGE_PRIVILEGES: PagePrivilegeConfig[] = [

  // ── MEMBERS ─────────────────────────────────────────────────────────────────
  {
    module: "member_requests",
    label: "Member Requests",
    path: "registrations",
    pagePrivilege: "View Member Requests",
    actions: [
      { label: "Change Member Status", privilege: "Change Member Status" },
    ],
  },
  {
    module: "member_management",
    label: "Members",
    path: "members/manage",
    pagePrivilege: "View Members",
    actions: [
      { label: "Create Member",        privilege: "Create Member" },
      { label: "Edit Member",          privilege: "Edit Member" },
      { label: "Print Member Card",    privilege: "Print Member Card" },
      { label: "Reset Member Password", privilege: "Reset Member Password" },
    ],
  },

  // ── TEAM MEMBERS ────────────────────────────────────────────────────────────
  {
    module: "team_member_requests",
    label: "Team Member Requests",
    path: "registrations",           // same page, different tab
    pagePrivilege: "View Team Member Requests",
    actions: [
      { label: "Change Team Member Status", privilege: "Change Team Member Status" },
    ],
  },
  {
    module: "team_member_management",
    label: "Team Members",
    path: "members/manage",          // shared page, different tab
    pagePrivilege: "View Team Members",
    actions: [
      { label: "Create Team Member",     privilege: "Create Team Member" },
      { label: "Edit Team Member",       privilege: "Edit Team Member" },
      { label: "Print Team Member Card", privilege: "Print Team Member Card" },
    ],
  },

  // ── SPORTS ──────────────────────────────────────────────────────────────────
  {
    module: "sports",
    label: "Sports",
    path: "sports",
    pagePrivilege: "View Sports",
    actions: [
      { label: "Create Sport",         privilege: "Create Sport" },
      { label: "Edit Sport",           privilege: "Edit Sport" },
      { label: "Deactivate Sport",     privilege: "Deactivate Sport" },
      { label: "Allow Sport Booking",  privilege: "Allow Sport Booking" },
      { label: "Assign Sport to Branch", privilege: "Assign Sport to Branch" },
    ],
  },

  // ── TEAMS ───────────────────────────────────────────────────────────────────
  {
    module: "teams",
    label: "Teams",
    path: "sports/teams",
    pagePrivilege: "View Teams",
    actions: [
      { label: "Create Team",                  privilege: "Create Team" },
      { label: "Edit Team",                    privilege: "Edit Team" },
      { label: "Deactivate Team",              privilege: "Deactivate Team" },
      { label: "View Members in Team",         privilege: "View Members in Team" },
      { label: "View Team Members in Team",    privilege: "View Team Members in Team" },
      { label: "Assign Team to Sport",         privilege: "Assign Team to Sport" },
      { label: "Remove Team from Sport",       privilege: "Remove Team from Sport" },
      { label: "Assign Member to Sport",       privilege: "Assign Member to Sport" },
      { label: "Remove Member from Sport",     privilege: "Remove Member from Sport" },
      { label: "Assign Team Member to Sport",  privilege: "Assign Team Member to Sport" },
      { label: "Remove Team Member from Sport", privilege: "Remove Team Member from Sport" },
    ],
  },

  // ── FIELDS ──────────────────────────────────────────────────────────────────
  {
    module: "fields",
    label: "Fields / Courts",
    path: "sports/courts",
    pagePrivilege: "View Fields",
    actions: [
      { label: "Create Field",         privilege: "Create Field" },
      { label: "Edit Field",           privilege: "Edit Field" },
      { label: "Deactivate Field",     privilege: "Deactivate Field" },
      { label: "Assign Field to Sport", privilege: "Assign Field to Sport" },
      { label: "Allow Field Booking",  privilege: "Allow Field Booking" },
    ],
  },

  // ── BOOKINGS ────────────────────────────────────────────────────────────────
  {
    module: "bookings",
    label: "Bookings",
    path: "sports/bookings",
    pagePrivilege: "View Bookings",
    actions: [
      { label: "Create Booking",        privilege: "Create Booking" },
      { label: "Edit Booking",          privilege: "Edit Booking" },
      { label: "Change Booking Status", privilege: "Change Booking Status" },
      { label: "Block Field Time",      privilege: "Block Field Time" },
    ],
  },

  // ── INVITATIONS ─────────────────────────────────────────────────────────────
  {
    module: "invitations",
    label: "Invitations",
    path: "sports/invitations",
    pagePrivilege: "View Invitations",
    actions: [],
  },

  // ── MEMBERSHIPS ─────────────────────────────────────────────────────────────
  {
    module: "memberships",
    label: "Memberships",
    path: "memberships",
    pagePrivilege: "View Memberships",
    actions: [
      { label: "Create Membership",        privilege: "Create Membership" },
      { label: "Edit Membership",          privilege: "Edit Membership" },
      { label: "Change Membership Status", privilege: "Change Membership Status" },
    ],
  },

  // ── POSTS / MEDIA ───────────────────────────────────────────────────────────
  {
    module: "posts",
    label: "Posts / Media",
    path: "media-gallery",
    pagePrivilege: "View Posts",
    actions: [
      { label: "Create Post", privilege: "Create Post" },
      { label: "Edit Post",   privilege: "Edit Post" },
      { label: "Remove Post", privilege: "Remove Post" },
    ],
  },

  // ── BRANCHES ────────────────────────────────────────────────────────────────
  {
    module: "branches",
    label: "Branches",
    path: "branches",
    pagePrivilege: "View Branches",
    actions: [
      { label: "Create Branch",        privilege: "Create Branch" },
      { label: "Edit Branch",          privilege: "Edit Branch" },
      { label: "Change Branch Status", privilege: "Change Branch Status" },
    ],
  },

  // ── FACULTIES ───────────────────────────────────────────────────────────────
  {
    module: "faculties",
    label: "Faculties",
    path: "faculties",
    pagePrivilege: "View Faculties",
    actions: [
      { label: "Create Faculty", privilege: "Create Faculty" },
      { label: "Edit Faculty",   privilege: "Edit Faculty" },
      { label: "Remove Faculty", privilege: "Remove Faculty" },
    ],
  },

  // ── PROFESSIONS ─────────────────────────────────────────────────────────────
  {
    module: "professions",
    label: "Professions",
    path: "professions",
    pagePrivilege: "View Professions",
    actions: [
      { label: "Create Profession", privilege: "Create Profession" },
      { label: "Edit Profession",   privilege: "Edit Profession" },
      { label: "Remove Profession", privilege: "Remove Profession" },
    ],
  },

  // ── AUDIT LOGS ──────────────────────────────────────────────────────────────
  {
    module: "audit_logs",
    label: "Audit Logs",
    path: "audit-log",
    pagePrivilege: "View Logs",
    actions: [
      { label: "Create Log", privilege: "Create Log" },
      { label: "Edit Log",   privilege: "Edit Log" },
    ],
  },

  // ── PRIVILEGE PACKAGES ──────────────────────────────────────────────────────
  {
    module: "packages",
    label: "Privilege Packages",
    path: "admin/manage-packages",
    pagePrivilege: "View Packages",
    actions: [
      { label: "Create Package", privilege: "Create Package" },
      { label: "Edit Package",   privilege: "Edit Package" },
      { label: "Remove Package", privilege: "Remove Package" },
    ],
  },

  // ── STAFF ───────────────────────────────────────────────────────────────────
  {
    module: "staff",
    label: "Staff",
    path: "admin/staff/manage",
    pagePrivilege: "View Staff",
    actions: [
      { label: "Create Staff",              privilege: "Create Staff" },
      { label: "Edit Staff",                privilege: "Edit Staff" },
      { label: "Change Staff Status",       privilege: "Change Staff Status" },
      { label: "Print Staff Card",          privilege: "Print Staff Card" },
    ],
  },
  {
    module: "staff_packages",
    label: "Staff – Package Assignment",
    path: "admin/staff/manage",        // action panel within staff management
    pagePrivilege: "View Staff",
    actions: [
      { label: "Assign Package to Staff", privilege: "Assign Package to Staff" },
      { label: "Remove Package from Staff", privilege: "Remove Package from Staff" },
    ],
  },
  {
    module: "staff_privileges",
    label: "Staff – Privilege Management",
    path: "admin/staff/assign-privileges",
    pagePrivilege: "Assign Privilege to Staff",
    actions: [
      { label: "Assign Privilege to Staff", privilege: "Assign Privilege to Staff" },
    ],
  },
  {
    module: "staff_revoke_privileges",
    label: "Staff – Revoke Privileges",
    path: "admin/staff/revoke-privileges",
    pagePrivilege: "Remove Privilege from Staff",
    actions: [
      { label: "Remove Privilege from Staff", privilege: "Remove Privilege from Staff" },
    ],
  },
];

// ─── Lookup helpers ────────────────────────────────────────────────────────────

/** Returns the config for a single module by key */
export const getPageConfig = (module: string): PagePrivilegeConfig | undefined =>
  PAGE_PRIVILEGES.find((p) => p.module === module);

/** Returns all page-level privileges (for sidebar filtering) */
export const getAllPagePrivileges = (): (Privilege | null)[] =>
  PAGE_PRIVILEGES.map((p) => p.pagePrivilege);

/** Returns all action privileges for a given module */
export const getActionPrivileges = (module: string): Privilege[] =>
  getPageConfig(module)?.actions.map((a) => a.privilege) ?? [];
