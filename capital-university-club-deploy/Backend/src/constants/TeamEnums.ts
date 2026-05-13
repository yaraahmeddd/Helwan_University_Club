/**
 * Team Creation Enums & Constants
 *
 * Central source of truth for all team-related enumerated values.
 * Import these constants everywhere instead of using raw strings.
 */

// ─── Member Type Codes ────────────────────────────────────────────────────────

export enum MemberTypeCode {
  // ── Internal regular-member types ──────────────────────────────────────────
  WORKING_MEMBER = 'working_member',
  STUDENT = 'student',
  GRADUATE = 'graduate',
  DEPENDENT_OF_WORKING_MEMBER = 'dependent_of_working_member',

  // ── Internal team-member types ─────────────────────────────────────────────
  WORKING_TEAM_MEMBER = 'working_team_member',
  STUDENT_TEAM_MEMBER = 'student_team_member',
  RETIRED_TEAM_MEMBER = 'retired_team_member',
  DEPENDENT_OF_WORKING_TEAM_MEMBER = 'dependent_of_working_team_member',

  // ── External regular-member types ──────────────────────────────────────────
  FOREIGNER = 'foreigner',
  VISITOR_MEMBER = 'visitor_member',
  DEPENDENT_OF_VISITOR_MEMBER = 'dependent_of_visitor_member',

  // ── External team-member types ─────────────────────────────────────────────
  VISITOR_TEAM_MEMBER = 'visitor_team_member',
  FOREIGNER_TEAM_MEMBER = 'foreigner_team_member',
  DEPENDENT_OF_VISITOR_TEAM_MEMBER = 'dependent_of_visitor_team_member',

  // ── Retired regular-member types (INTERNAL) ────────────────────────────────
  RETIRED_MEMBER = 'retired_member',
}

export const INTERNAL_MEMBER_TYPES: MemberTypeCode[] = [
  // Regular members
  MemberTypeCode.WORKING_MEMBER,
  MemberTypeCode.STUDENT,
  MemberTypeCode.GRADUATE,
  MemberTypeCode.RETIRED_MEMBER,
  MemberTypeCode.DEPENDENT_OF_WORKING_MEMBER,
  // Team members
  MemberTypeCode.WORKING_TEAM_MEMBER,
  MemberTypeCode.STUDENT_TEAM_MEMBER,
  MemberTypeCode.RETIRED_TEAM_MEMBER,
  MemberTypeCode.DEPENDENT_OF_WORKING_TEAM_MEMBER,
];

export const EXTERNAL_MEMBER_TYPES: MemberTypeCode[] = [
  // Regular members
  MemberTypeCode.FOREIGNER,
  MemberTypeCode.VISITOR_MEMBER,
  MemberTypeCode.DEPENDENT_OF_VISITOR_MEMBER,
  // Team members
  MemberTypeCode.VISITOR_TEAM_MEMBER,
  MemberTypeCode.FOREIGNER_TEAM_MEMBER,
  MemberTypeCode.DEPENDENT_OF_VISITOR_TEAM_MEMBER,
];

// ─── Team Visibility ─────────────────────────────────────────────────────────

export enum TeamVisibilityType {
  INTERNAL = 'INTERNAL',
  EXTERNAL = 'EXTERNAL',
  BOTH = 'BOTH',
}

export const TEAM_VISIBILITY_VALUES = Object.values(TeamVisibilityType);

/**
 * Member-type codes that are eligible per visibility type.
 * These codes match the `code` column in the `member_types` table.
 *
 * BOTH → empty array means no restriction (all member types allowed).
 */
export const VISIBILITY_ALLOWED_MEMBER_TYPES: Record<TeamVisibilityType, MemberTypeCode[]> = {
  [TeamVisibilityType.INTERNAL]: INTERNAL_MEMBER_TYPES,
  [TeamVisibilityType.EXTERNAL]: EXTERNAL_MEMBER_TYPES,
  [TeamVisibilityType.BOTH]: [],
};

// ─── Team Status ──────────────────────────────────────────────────────────────

export enum TeamStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  ARCHIVED = 'archived',
}

export const TEAM_STATUS_VALUES = Object.values(TeamStatus);

// ─── Training Days ────────────────────────────────────────────────────────────

export enum TrainingDay {
  SUNDAY = 'Sunday',
  MONDAY = 'Monday',
  TUESDAY = 'Tuesday',
  WEDNESDAY = 'Wednesday',
  THURSDAY = 'Thursday',
  FRIDAY = 'Friday',
  SATURDAY = 'Saturday',
}

export const TRAINING_DAY_VALUES = Object.values(TrainingDay);

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Returns true if the given member type code is allowed to join a team
 * with the specified visibility type.
 */
export function isMemberTypeAllowed(
  memberTypeCode: string,
  visibility: TeamVisibilityType,
): boolean {
  if (visibility === TeamVisibilityType.BOTH) return true;
  return (VISIBILITY_ALLOWED_MEMBER_TYPES[visibility] as string[]).includes(memberTypeCode);
}
