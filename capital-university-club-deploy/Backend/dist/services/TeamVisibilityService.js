"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamVisibilityService = void 0;
const data_source_1 = require("../database/data-source");
const Team_1 = require("../entities/Team");
const Member_1 = require("../entities/Member");
const TeamMember_1 = require("../entities/TeamMember");
const MemberType_1 = require("../entities/MemberType");
const TeamEnums_1 = require("../constants/TeamEnums");
// ─── Service ─────────────────────────────────────────────────────────────────
class TeamVisibilityService {
    constructor() {
        this.teamRepo = data_source_1.AppDataSource.getRepository(Team_1.Team);
        this.memberRepo = data_source_1.AppDataSource.getRepository(Member_1.Member);
        this.teamMemberRepo = data_source_1.AppDataSource.getRepository(TeamMember_1.TeamMember);
        this.memberTypeRepo = data_source_1.AppDataSource.getRepository(MemberType_1.MemberType);
    }
    /**
     * Returns all ACTIVE teams the caller is allowed to see, optionally filtered
     * by sport_id.
     *
     * @param caller  Identity built from the JWT token payload
     * @param sportId Optional filter — only return teams for this sport
     */
    async getTeamsForCaller(caller, sportId) {
        // 1. Determine the allowed visibility types for this caller
        const allowedVisibilities = await this.resolveAllowedVisibilities(caller);
        // 2. Query only active teams whose visibility_type is in the allowed list
        const qb = this.teamRepo
            .createQueryBuilder('team')
            .leftJoinAndSelect('team.sport', 'sport')
            .leftJoinAndSelect('team.field', 'field')
            .leftJoinAndSelect('team.training_schedules', 'schedules')
            .where('team.status = :status', { status: TeamEnums_1.TeamStatus.ACTIVE })
            .andWhere('team.visibility_type IN (:...visibilities)', {
            visibilities: allowedVisibilities,
        });
        if (sportId) {
            qb.andWhere('team.sport_id = :sportId', { sportId });
        }
        const teams = await qb.orderBy('team.name_en', 'ASC').getMany();
        return teams.map((t) => ({
            id: t.id,
            name_en: t.name_en,
            name_ar: t.name_ar,
            sport_id: t.sport_id,
            sport_name_en: t.sport?.name_en ?? '',
            sport_name_ar: t.sport?.name_ar ?? '',
            field_id: t.field_id,
            max_participants: t.max_participants,
            visibility_type: t.visibility_type,
            price: t.price,
            status: t.status,
            training_schedules: t.training_schedules ?? [],
        }));
    }
    // ─── Private helpers ──────────────────────────────────────────────────────
    /**
     * Determines which TeamVisibilityType values this caller may access.
     *
     * - "BOTH" is always included for every caller.
     * - "INTERNAL" is added for internal member/team-member types.
     * - "EXTERNAL" is added for external member/team-member types.
     */
    async resolveAllowedVisibilities(caller) {
        const allowed = [TeamEnums_1.TeamVisibilityType.BOTH];
        const memberTypeCode = await this.resolveMemberTypeCode(caller);
        if (memberTypeCode) {
            const internalCodes = TeamEnums_1.INTERNAL_MEMBER_TYPES;
            const externalCodes = TeamEnums_1.EXTERNAL_MEMBER_TYPES;
            if (internalCodes.includes(memberTypeCode)) {
                allowed.push(TeamEnums_1.TeamVisibilityType.INTERNAL);
            }
            if (externalCodes.includes(memberTypeCode)) {
                allowed.push(TeamEnums_1.TeamVisibilityType.EXTERNAL);
            }
        }
        return allowed;
    }
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
    async resolveMemberTypeCode(caller) {
        // ── Regular Member path ───────────────────────────────────────────────
        if (caller.member_id) {
            const member = await this.memberRepo.findOne({
                where: { id: caller.member_id },
                relations: ['member_type'],
            });
            if (member?.member_type?.code) {
                return member.member_type.code;
            }
            // Fallback: use member_type_id from the JWT payload if the relation
            // didn't load (shouldn't normally happen, but belt-and-suspenders)
            if (caller.member_type_id) {
                const mt = await this.memberTypeRepo.findOne({
                    where: { id: caller.member_type_id },
                });
                return mt?.code ?? null;
            }
            return null;
        }
        // ── TeamMember path ───────────────────────────────────────────────────
        if (caller.team_member_id) {
            const tm = await this.teamMemberRepo.findOne({
                where: { id: caller.team_member_id },
                relations: ['member_type'],
            });
            if (!tm)
                return null;
            // Prefer the explicit member_type.code set during registration
            if (tm.member_type?.code) {
                return tm.member_type.code;
            }
            // Legacy fallback: derive classification from is_foreign flag
            return tm.is_foreign ? 'foreigner_team_member' : 'working_team_member';
        }
        return null;
    }
}
exports.TeamVisibilityService = TeamVisibilityService;
//# sourceMappingURL=TeamVisibilityService.js.map