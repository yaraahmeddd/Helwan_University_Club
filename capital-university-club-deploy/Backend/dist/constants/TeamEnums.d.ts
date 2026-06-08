/**
 * Team Creation Enums & Constants
 *
 * Central source of truth for all team-related enumerated values.
 * Import these constants everywhere instead of using raw strings.
 */
export declare enum MemberTypeCode {
    WORKING_MEMBER = "working_member",
    STUDENT = "student",
    GRADUATE = "graduate",
    DEPENDENT_OF_WORKING_MEMBER = "dependent_of_working_member",
    WORKING_TEAM_MEMBER = "working_team_member",
    STUDENT_TEAM_MEMBER = "student_team_member",
    RETIRED_TEAM_MEMBER = "retired_team_member",
    DEPENDENT_OF_WORKING_TEAM_MEMBER = "dependent_of_working_team_member",
    FOREIGNER = "foreigner",
    VISITOR_MEMBER = "visitor_member",
    DEPENDENT_OF_VISITOR_MEMBER = "dependent_of_visitor_member",
    VISITOR_TEAM_MEMBER = "visitor_team_member",
    FOREIGNER_TEAM_MEMBER = "foreigner_team_member",
    DEPENDENT_OF_VISITOR_TEAM_MEMBER = "dependent_of_visitor_team_member",
    RETIRED_MEMBER = "retired_member"
}
export declare const INTERNAL_MEMBER_TYPES: MemberTypeCode[];
export declare const EXTERNAL_MEMBER_TYPES: MemberTypeCode[];
export declare enum TeamVisibilityType {
    INTERNAL = "INTERNAL",
    EXTERNAL = "EXTERNAL",
    BOTH = "BOTH"
}
export declare const TEAM_VISIBILITY_VALUES: TeamVisibilityType[];
/**
 * Member-type codes that are eligible per visibility type.
 * These codes match the `code` column in the `member_types` table.
 *
 * BOTH → empty array means no restriction (all member types allowed).
 */
export declare const VISIBILITY_ALLOWED_MEMBER_TYPES: Record<TeamVisibilityType, MemberTypeCode[]>;
export declare enum TeamStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SUSPENDED = "suspended",
    ARCHIVED = "archived"
}
export declare const TEAM_STATUS_VALUES: TeamStatus[];
export declare enum TrainingDay {
    SUNDAY = "Sunday",
    MONDAY = "Monday",
    TUESDAY = "Tuesday",
    WEDNESDAY = "Wednesday",
    THURSDAY = "Thursday",
    FRIDAY = "Friday",
    SATURDAY = "Saturday"
}
export declare const TRAINING_DAY_VALUES: TrainingDay[];
/**
 * Returns true if the given member type code is allowed to join a team
 * with the specified visibility type.
 */
export declare function isMemberTypeAllowed(memberTypeCode: string, visibility: TeamVisibilityType): boolean;
//# sourceMappingURL=TeamEnums.d.ts.map