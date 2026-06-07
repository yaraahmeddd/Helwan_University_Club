/**
 * TeamVisibilityService
 *
 * Resolves which teams a given logged-in user (Member OR TeamMember) can see
 * based on the team's visibility_type and the user's member/team-member type.
 *
 * Rules:
 *   INTERNAL teams  → visible to internal members & internal team-members only
 *   EXTERNAL teams  → visible to external members & external team-members only
 *   BOTH teams      → visible to everyone
 *
 * "Internal" members/team-members:
 *   Working Member, Student, Graduate, Retired Member, Dependent of Working Member,
 *   Working Team Member, Student Team Member, Retired Team Member,
 *   Dependent of Working Team Member
 *
 * "External" members/team-members:
 *   Foreigner, Visitor Member, Dependent of Visitor Member,
 *   Visitor Team Member, Foreigner Team Member, Dependent of Visitor Team Member
 */
import { TeamVisibilityType, TeamStatus } from '../constants/TeamEnums';
export interface CallerIdentity {
    /** Populated when the caller is a regular Member */
    member_id?: number;
    /** Populated when the caller is a TeamMember */
    team_member_id?: number;
    /** The member_type_id from the members table (only for regular Members) */
    member_type_id?: number;
}
export interface VisibleTeam {
    id: string;
    name_en: string;
    name_ar: string;
    sport_id: number;
    sport_name_en: string;
    sport_name_ar: string;
    field_id: string | null;
    max_participants: number;
    visibility_type: TeamVisibilityType;
    price: number | null;
    status: TeamStatus;
    training_schedules: unknown[];
}
export declare class TeamVisibilityService {
    private teamRepo;
    private memberRepo;
    private teamMemberRepo;
    private memberTypeRepo;
    constructor();
    /**
     * Returns all ACTIVE teams the caller is allowed to see, optionally filtered
     * by sport_id.
     *
     * @param caller  Identity built from the JWT token payload
     * @param sportId Optional filter — only return teams for this sport
     */
    getTeamsForCaller(caller: CallerIdentity, sportId?: number): Promise<VisibleTeam[]>;
    /**
     * Determines which TeamVisibilityType values this caller may access.
     *
     * - "BOTH" is always included for every caller.
     * - "INTERNAL" is added for internal member/team-member types.
     * - "EXTERNAL" is added for external member/team-member types.
     */
    private resolveAllowedVisibilities;
    /**
     * Resolves a single canonical member-type code string for the caller.
     *
     * For a regular Member:  looks up member_type.code from the member_types table.
     * For a TeamMember:      looks up member_type.code via member_type_id (set at registration).
     *                        Falls back to is_foreign flag if member_type_id is not set.
     *
     * If neither member_id nor team_member_id is present, returns null
     * (the caller gets BOTH only — safest fallback).
     */
    private resolveMemberTypeCode;
}
//# sourceMappingURL=TeamVisibilityService.d.ts.map