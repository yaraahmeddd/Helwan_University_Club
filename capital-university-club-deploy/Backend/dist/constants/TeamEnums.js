"use strict";
/**
 * Team Creation Enums & Constants
 *
 * Central source of truth for all team-related enumerated values.
 * Import these constants everywhere instead of using raw strings.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TRAINING_DAY_VALUES = exports.TrainingDay = exports.TEAM_STATUS_VALUES = exports.TeamStatus = exports.VISIBILITY_ALLOWED_MEMBER_TYPES = exports.TEAM_VISIBILITY_VALUES = exports.TeamVisibilityType = exports.EXTERNAL_MEMBER_TYPES = exports.INTERNAL_MEMBER_TYPES = exports.MemberTypeCode = void 0;
exports.isMemberTypeAllowed = isMemberTypeAllowed;
// ─── Member Type Codes ────────────────────────────────────────────────────────
var MemberTypeCode;
(function (MemberTypeCode) {
    // ── Internal regular-member types ──────────────────────────────────────────
    MemberTypeCode["WORKING_MEMBER"] = "working_member";
    MemberTypeCode["STUDENT"] = "student";
    MemberTypeCode["GRADUATE"] = "graduate";
    MemberTypeCode["DEPENDENT_OF_WORKING_MEMBER"] = "dependent_of_working_member";
    // ── Internal team-member types ─────────────────────────────────────────────
    MemberTypeCode["WORKING_TEAM_MEMBER"] = "working_team_member";
    MemberTypeCode["STUDENT_TEAM_MEMBER"] = "student_team_member";
    MemberTypeCode["RETIRED_TEAM_MEMBER"] = "retired_team_member";
    MemberTypeCode["DEPENDENT_OF_WORKING_TEAM_MEMBER"] = "dependent_of_working_team_member";
    // ── External regular-member types ──────────────────────────────────────────
    MemberTypeCode["FOREIGNER"] = "foreigner";
    MemberTypeCode["VISITOR_MEMBER"] = "visitor_member";
    MemberTypeCode["DEPENDENT_OF_VISITOR_MEMBER"] = "dependent_of_visitor_member";
    // ── External team-member types ─────────────────────────────────────────────
    MemberTypeCode["VISITOR_TEAM_MEMBER"] = "visitor_team_member";
    MemberTypeCode["FOREIGNER_TEAM_MEMBER"] = "foreigner_team_member";
    MemberTypeCode["DEPENDENT_OF_VISITOR_TEAM_MEMBER"] = "dependent_of_visitor_team_member";
    // ── Retired regular-member types (INTERNAL) ────────────────────────────────
    MemberTypeCode["RETIRED_MEMBER"] = "retired_member";
})(MemberTypeCode || (exports.MemberTypeCode = MemberTypeCode = {}));
exports.INTERNAL_MEMBER_TYPES = [
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
exports.EXTERNAL_MEMBER_TYPES = [
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
var TeamVisibilityType;
(function (TeamVisibilityType) {
    TeamVisibilityType["INTERNAL"] = "INTERNAL";
    TeamVisibilityType["EXTERNAL"] = "EXTERNAL";
    TeamVisibilityType["BOTH"] = "BOTH";
})(TeamVisibilityType || (exports.TeamVisibilityType = TeamVisibilityType = {}));
exports.TEAM_VISIBILITY_VALUES = Object.values(TeamVisibilityType);
/**
 * Member-type codes that are eligible per visibility type.
 * These codes match the `code` column in the `member_types` table.
 *
 * BOTH → empty array means no restriction (all member types allowed).
 */
exports.VISIBILITY_ALLOWED_MEMBER_TYPES = {
    [TeamVisibilityType.INTERNAL]: exports.INTERNAL_MEMBER_TYPES,
    [TeamVisibilityType.EXTERNAL]: exports.EXTERNAL_MEMBER_TYPES,
    [TeamVisibilityType.BOTH]: [],
};
// ─── Team Status ──────────────────────────────────────────────────────────────
var TeamStatus;
(function (TeamStatus) {
    TeamStatus["ACTIVE"] = "active";
    TeamStatus["INACTIVE"] = "inactive";
    TeamStatus["SUSPENDED"] = "suspended";
    TeamStatus["ARCHIVED"] = "archived";
})(TeamStatus || (exports.TeamStatus = TeamStatus = {}));
exports.TEAM_STATUS_VALUES = Object.values(TeamStatus);
// ─── Training Days ────────────────────────────────────────────────────────────
var TrainingDay;
(function (TrainingDay) {
    TrainingDay["SUNDAY"] = "Sunday";
    TrainingDay["MONDAY"] = "Monday";
    TrainingDay["TUESDAY"] = "Tuesday";
    TrainingDay["WEDNESDAY"] = "Wednesday";
    TrainingDay["THURSDAY"] = "Thursday";
    TrainingDay["FRIDAY"] = "Friday";
    TrainingDay["SATURDAY"] = "Saturday";
})(TrainingDay || (exports.TrainingDay = TrainingDay = {}));
exports.TRAINING_DAY_VALUES = Object.values(TrainingDay);
// ─── Helper ───────────────────────────────────────────────────────────────────
/**
 * Returns true if the given member type code is allowed to join a team
 * with the specified visibility type.
 */
function isMemberTypeAllowed(memberTypeCode, visibility) {
    if (visibility === TeamVisibilityType.BOTH)
        return true;
    return exports.VISIBILITY_ALLOWED_MEMBER_TYPES[visibility].includes(memberTypeCode);
}
//# sourceMappingURL=TeamEnums.js.map