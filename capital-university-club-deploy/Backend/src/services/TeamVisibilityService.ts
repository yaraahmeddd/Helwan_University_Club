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

import { Repository, In } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { Team } from '../entities/Team';
import { Member } from '../entities/Member';
import { TeamMember } from '../entities/TeamMember';
import { MemberType } from '../entities/MemberType';
import {
    TeamVisibilityType,
    TeamStatus,
    INTERNAL_MEMBER_TYPES,
    EXTERNAL_MEMBER_TYPES,
} from '../constants/TeamEnums';

// ─── Caller identity (built from the JWT payload) ────────────────────────────

export interface CallerIdentity {
    /** Populated when the caller is a regular Member */
    member_id?: number;
    /** Populated when the caller is a TeamMember */
    team_member_id?: number;
    /** The member_type_id from the members table (only for regular Members) */
    member_type_id?: number;
}

// ─── Result shape ─────────────────────────────────────────────────────────────

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

// ─── Service ─────────────────────────────────────────────────────────────────

export class TeamVisibilityService {
    private teamRepo: Repository<Team>;
    private memberRepo: Repository<Member>;
    private teamMemberRepo: Repository<TeamMember>;
    private memberTypeRepo: Repository<MemberType>;

    constructor() {
        this.teamRepo = AppDataSource.getRepository(Team);
        this.memberRepo = AppDataSource.getRepository(Member);
        this.teamMemberRepo = AppDataSource.getRepository(TeamMember);
        this.memberTypeRepo = AppDataSource.getRepository(MemberType);
    }

    /**
     * Returns all ACTIVE teams the caller is allowed to see, optionally filtered
     * by sport_id.
     *
     * @param caller  Identity built from the JWT token payload
     * @param sportId Optional filter — only return teams for this sport
     */
    async getTeamsForCaller(
        caller: CallerIdentity,
        sportId?: number,
    ): Promise<VisibleTeam[]> {
        // 1. Determine the allowed visibility types for this caller
        const allowedVisibilities = await this.resolveAllowedVisibilities(caller);

        // 2. Query only active teams whose visibility_type is in the allowed list
        const qb = this.teamRepo
            .createQueryBuilder('team')
            .leftJoinAndSelect('team.sport', 'sport')
            .leftJoinAndSelect('team.field', 'field')
            .leftJoinAndSelect('team.training_schedules', 'schedules')
            .where('team.status = :status', { status: TeamStatus.ACTIVE })
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
    private async resolveAllowedVisibilities(
        caller: CallerIdentity,
    ): Promise<TeamVisibilityType[]> {
        const allowed: TeamVisibilityType[] = [TeamVisibilityType.BOTH];

        const memberTypeCode = await this.resolveMemberTypeCode(caller);

        if (memberTypeCode) {
            const internalCodes = INTERNAL_MEMBER_TYPES as string[];
            const externalCodes = EXTERNAL_MEMBER_TYPES as string[];

            if (internalCodes.includes(memberTypeCode)) {
                allowed.push(TeamVisibilityType.INTERNAL);
            }
            if (externalCodes.includes(memberTypeCode)) {
                allowed.push(TeamVisibilityType.EXTERNAL);
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
    private async resolveMemberTypeCode(
        caller: CallerIdentity,
    ): Promise<string | null> {
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

            if (!tm) return null;

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
