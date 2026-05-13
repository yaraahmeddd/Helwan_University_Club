/**
 * TeamService
 *
 * Handles all persistence operations for teams.
 * Business-rule validation is delegated to TeamValidationService.
 */

import { Repository } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { Team } from '../entities/Team';
import { TeamTrainingSchedule } from '../entities/TeamTrainingSchedule';
import { MemberTeam } from '../entities/MemberTeam';
import { TeamMemberTeam } from '../entities/TeamMemberTeam';
import { Sport } from '../entities/Sport';
import { BranchSportTeam } from '../entities/BranchSportTeam';
import { TeamStatus, TeamVisibilityType } from '../constants/TeamEnums';
import {
    TeamValidationService,
    CreateTeamInput,
    TrainingScheduleInput,
} from './TeamValidationService';

// ─── Public Interfaces ────────────────────────────────────────────────────────

export interface UpdateTeamInput {
    name_en?: string;
    name_ar?: string;
    max_participants?: number;
    status?: TeamStatus;
    visibility_type?: TeamVisibilityType;

    branch_id?: number | null;
    field_id?: string | null;
    training_schedules?: TrainingScheduleInput[];
}

interface AvailableSlotsResponse {
    team_id: string;
    team_name_en: string;
    team_name_ar: string;
    max_participants: number;
    current_members: number;
    available_slots: number;
    is_available: boolean;
}

interface MemberInfo {
    id: number;
    name: string;
    email: string;
    status: string;
    joined_at: Date;
}

interface TeamMembersResponse {
    regular_members: MemberInfo[];
    team_members: MemberInfo[];
}

// ─── Service ─────────────────────────────────────────────────────────────────

export class TeamService {
    private teamRepo: Repository<Team>;
    private trainingScheduleRepo: Repository<TeamTrainingSchedule>;
    private memberTeamRepo: Repository<MemberTeam>;
    private teamMemberTeamRepo: Repository<TeamMemberTeam>;
    private sportRepo: Repository<Sport>;
    private branchSportTeamRepo: Repository<BranchSportTeam>;
    private validationService: TeamValidationService;

    constructor() {
        this.teamRepo = AppDataSource.getRepository(Team);
        this.trainingScheduleRepo = AppDataSource.getRepository(TeamTrainingSchedule);
        this.memberTeamRepo = AppDataSource.getRepository(MemberTeam);
        this.teamMemberTeamRepo = AppDataSource.getRepository(TeamMemberTeam);
        this.sportRepo = AppDataSource.getRepository(Sport);
        this.branchSportTeamRepo = AppDataSource.getRepository(BranchSportTeam);
        this.validationService = new TeamValidationService();
    }

    // ─── Create ───────────────────────────────────────────────────────────────

    /**
     * Creates a team with full backend validation:
     *   - Sport must exist.
     *   - Field must belong to that sport.
     *   - max_participants ≤ field.capacity.
     *   - visibility_type must be INTERNAL | EXTERNAL | BOTH.
     *   - Training schedules must not overlap (same sport, same day, same time range).
     */
    async createTeam(data: CreateTeamInput): Promise<Team> {
        // Run all business-rule validations first
        const validated = await this.validationService.validateCreateTeamInput(data);

        // Persist team
        const team = this.teamRepo.create({
            sport_id: validated.sport.id,
            branch_id: validated.branch_id,
            field_id: validated.field.id,
            name_en: validated.name_en,
            name_ar: validated.name_ar,
            max_participants: validated.max_participants,
            status: validated.status,
            visibility_type: validated.visibility_type,

        });

        const savedTeam = await this.teamRepo.save(team);

        // Persist training schedules if provided
        if (validated.training_schedules.length > 0) {
            await this.saveTrainingSchedules(savedTeam.id, validated.sport.id, validated.training_schedules);
        }

        return this.getTeamById(savedTeam.id) as Promise<Team>;
    }

    // ─── Read ─────────────────────────────────────────────────────────────────

    async getAllTeams(filters: Record<string, unknown>): Promise<Team[]> {
        const query = this.teamRepo
            .createQueryBuilder('team')
            .leftJoinAndSelect('team.sport', 'sport')
            .leftJoinAndSelect('team.branch', 'branch')
            .leftJoinAndSelect('team.field', 'field')
            .leftJoinAndSelect('team.training_schedules', 'schedules');

        if (filters.sport_id) {
            query.andWhere('team.sport_id = :sportId', { sportId: filters.sport_id });
        }
        if (filters.status) {
            query.andWhere('team.status = :status', { status: filters.status });
        }
        if (filters.branch_id) {
            query.andWhere('team.branch_id = :branchId', { branchId: filters.branch_id });
        }
        if (filters.visibility_type) {
            query.andWhere('team.visibility_type = :visibilityType', {
                visibilityType: filters.visibility_type,
            });
        }

        return query.getMany();
    }

    async getTeamById(teamId: string): Promise<Team | null> {
        return this.teamRepo.findOne({
            where: { id: teamId },
            relations: ['sport', 'branch', 'field', 'training_schedules', 'team_member_teams'],
        });
    }

    async getTeamsBySport(sportId: number): Promise<Team[]> {
        return this.teamRepo.find({
            where: { sport_id: sportId, status: TeamStatus.ACTIVE },
            relations: ['training_schedules', 'field'],
        });
    }

    // ─── Update ───────────────────────────────────────────────────────────────

    async updateTeam(teamId: string, updates: UpdateTeamInput): Promise<Team> {
        const team = await this.getTeamById(teamId);
        if (!team) throw new Error('Team not found.');

        // Apply scalar updates
        if (updates.name_en !== undefined) team.name_en = updates.name_en;
        if (updates.name_ar !== undefined) team.name_ar = updates.name_ar;
        if (updates.branch_id !== undefined) team.branch_id = updates.branch_id;
        if (updates.field_id !== undefined) team.field_id = updates.field_id;

        if (updates.max_participants !== undefined) {
            // Re-validate capacity against field
            if (team.field_id) {
                const fieldRepo = AppDataSource.getRepository('Field');
                const field = await fieldRepo.findOne({ where: { id: team.field_id } }) as { capacity: number | null } | null;
                if (field && field.capacity !== null && updates.max_participants > field.capacity) {
                    throw new Error(
                        `Validation error: "max_participants" (${updates.max_participants}) ` +
                        `exceeds the field's maximum capacity (${field.capacity}).`,
                    );
                }
            }
            team.max_participants = updates.max_participants;
        }

        if (updates.status !== undefined) {
            const validationService = new TeamValidationService();
            // Reuse status validation by calling private method indirectly
            const allowedStatuses = Object.values(TeamStatus);
            if (!allowedStatuses.includes(updates.status)) {
                throw new Error(
                    `Validation error: Invalid status "${updates.status}". ` +
                    `Allowed values: ${allowedStatuses.join(', ')}.`,
                );
            }
            team.status = updates.status;
        }

        if (updates.visibility_type !== undefined) {
            const allowed = Object.values(TeamVisibilityType);
            if (!allowed.includes(updates.visibility_type)) {
                throw new Error(
                    `Validation error: Invalid visibility_type "${updates.visibility_type}". ` +
                    `Allowed values: ${allowed.join(', ')}.`,
                );
            }
            team.visibility_type = updates.visibility_type;
        }



        await this.teamRepo.save(team);

        // Update training schedules if provided
        if (updates.training_schedules && updates.training_schedules.length > 0) {
            // Validate new schedules against other teams for this sport (exclude self)
            await this.validationService.validateTrainingSchedules(
                updates.training_schedules,
                team.sport_id,
                teamId,
            );

            // Delete existing schedules and recreate
            await this.trainingScheduleRepo.delete({ team_id: teamId });
            await this.saveTrainingSchedules(teamId, team.sport_id, updates.training_schedules);
        }

        return (await this.getTeamById(teamId))!;
    }

    async updateTeamStatus(teamId: string, status: string): Promise<Team> {
        const validStatuses = Object.values(TeamStatus);
        if (!validStatuses.includes(status as TeamStatus)) {
            throw new Error(
                `Validation error: Invalid status "${status}". ` +
                `Allowed values: ${validStatuses.join(', ')}.`,
            );
        }

        const team = await this.getTeamById(teamId);
        if (!team) throw new Error('Team not found.');

        team.status = status as TeamStatus;
        return this.teamRepo.save(team);
    }

    // ─── Delete ───────────────────────────────────────────────────────────────

    async deleteTeam(teamId: string): Promise<void> {
        const team = await this.getTeamById(teamId);
        if (!team) throw new Error('Team not found.');
        await this.teamRepo.remove(team);
    }

    // ─── Participant Counters (BranchSportTeam) ───────────────────────────────

    async incrementParticipants(teamId: number): Promise<void> {
        await this.branchSportTeamRepo.increment({ id: teamId }, 'current_participants', 1);
    }

    async decrementParticipants(teamId: number): Promise<void> {
        const team = await this.branchSportTeamRepo.findOne({ where: { id: teamId } });
        if (team && team.current_participants > 0) {
            await this.branchSportTeamRepo.decrement({ id: teamId }, 'current_participants', 1);
        }
    }

    // ─── Members ──────────────────────────────────────────────────────────────

    async getTeamMembers(teamId: string): Promise<TeamMembersResponse> {
        const team = await this.getTeamById(teamId);
        if (!team) throw new Error('Team not found.');

        const memberTeams = await this.memberTeamRepo.find({
            where: { team_id: parseInt(teamId) as unknown as never },
            relations: ['member'],
        });

        const teamMemberTeams = await this.teamMemberTeamRepo.find({
            where: { team_name: team.name_en } as unknown as never,
            relations: ['team_member'],
        });

        const getMemberName = (obj: unknown): string => {
            if (!obj || typeof obj !== 'object') return '';
            const m = obj as Record<string, unknown>;
            return `${(m.first_name as string) || ''} ${(m.last_name as string) || ''}`.trim();
        };

        const regularMembers: MemberInfo[] = memberTeams.map((mt) => ({
            id: mt.member_id,
            name: getMemberName(mt.member),
            email: ((mt.member as unknown as Record<string, unknown>)?.email as string) || '',
            status: mt.status,
            joined_at: mt.start_date || new Date(),
        }));

        const teamMembers: MemberInfo[] = teamMemberTeams.map((tmt) => ({
            id: tmt.team_member_id,
            name: getMemberName(tmt.team_member),
            email: ((tmt.team_member as unknown as Record<string, unknown>)?.email as string) || '',
            status: tmt.status,
            joined_at: tmt.start_date || new Date(),
        }));

        return { regular_members: regularMembers, team_members: teamMembers };
    }

    async getAvailableSlots(teamId: string): Promise<AvailableSlotsResponse> {
        const team = await this.getTeamById(teamId);
        if (!team) throw new Error('Team not found.');

        const memberCount = await this.memberTeamRepo.count({
            where: { team_id: parseInt(teamId) as unknown as never, status: 'active' as unknown as never },
        });

        const teamMemberCount = await this.teamMemberTeamRepo.count({
            where: { team_name: team.name_en, status: 'active' } as unknown as never,
        });

        const totalMembers = memberCount + teamMemberCount;
        const availableSlots = Math.max(0, team.max_participants - totalMembers);

        return {
            team_id: team.id,
            team_name_en: team.name_en,
            team_name_ar: team.name_ar,
            max_participants: team.max_participants,
            current_members: totalMembers,
            available_slots: availableSlots,
            is_available: availableSlots > 0,
        };
    }

    // ─── Teams By Sport With Members ──────────────────────────────────────────

    async getTeamsBySportWithMembers(
        sportId: number,
        teamId?: string,
    ): Promise<Array<{
        team_id: string;
        team_name_en: string;
        team_name_ar: string;
        visibility_type: TeamVisibilityType;

        max_participants: number;
        current_members: number;
        available_slots: number;
        status: string;
        members: Array<{
            id: number;
            name_en: string;
            name_ar: string;
            email: string;
            phone: string;
            national_id: string;
            type: 'regular_member' | 'team_member';
            status: string;
            joined_at: Date;
        }>;
    }>> {
        const whereCondition: {
            sport_id: number;
            status: TeamStatus;
            id?: string;
        } = { sport_id: sportId, status: TeamStatus.ACTIVE };

        if (teamId) whereCondition.id = teamId;

        const teams = await this.teamRepo.find({
            where: whereCondition,
            relations: ['training_schedules', 'field'],
            order: { name_en: 'ASC' },
        });

        return Promise.all(
            teams.map(async (team) => {
                const memberTeams = await this.memberTeamRepo.find({
                    where: { team_id: parseInt(team.id) as unknown as never },
                    relations: ['member'],
                });

                const teamMemberTeams = await this.teamMemberTeamRepo.find({
                    where: { team_name: team.name_en } as unknown as never,
                    relations: ['team_member'],
                });

                const regularMembers = memberTeams.map((mt) => {
                    const m = mt.member as unknown as Record<string, unknown>;
                    return {
                        id: mt.member_id,
                        name_en: `${(m.first_name_en as string) || ''} ${(m.last_name_en as string) || ''}`.trim(),
                        name_ar: `${(m.first_name_ar as string) || ''} ${(m.last_name_ar as string) || ''}`.trim(),
                        email: (m.email as string) || '',
                        phone: (m.phone as string) || '',
                        national_id: (m.national_id as string) || '',
                        type: 'regular_member' as const,
                        status: mt.status,
                        joined_at: mt.start_date || new Date(),
                    };
                });

                const teamMembers = teamMemberTeams.map((tmt) => {
                    const tm = tmt.team_member as unknown as Record<string, unknown>;
                    return {
                        id: tmt.team_member_id,
                        name_en: `${(tm.first_name_en as string) || ''} ${(tm.last_name_en as string) || ''}`.trim(),
                        name_ar: `${(tm.first_name_ar as string) || ''} ${(tm.last_name_ar as string) || ''}`.trim(),
                        email: (tm.email as string) || '',
                        phone: (tm.phone as string) || '',
                        national_id: (tm.national_id as string) || '',
                        type: 'team_member' as const,
                        status: tmt.status,
                        joined_at: tmt.start_date || new Date(),
                    };
                });

                const allMembers = [...regularMembers, ...teamMembers];
                const currentMembers = allMembers.filter((m) => m.status === 'active').length;
                const availableSlots = Math.max(0, team.max_participants - currentMembers);

                return {
                    team_id: team.id,
                    team_name_en: team.name_en,
                    team_name_ar: team.name_ar,
                    visibility_type: team.visibility_type,

                    max_participants: team.max_participants,
                    current_members: currentMembers,
                    available_slots: availableSlots,
                    status: team.status,
                    members: allMembers.sort((a, b) => b.joined_at.getTime() - a.joined_at.getTime()),
                };
            }),
        );
    }

    // ─── Private Helpers ──────────────────────────────────────────────────────

    private async saveTrainingSchedules(
        teamId: string,
        sportId: number,
        schedules: TrainingScheduleInput[],
    ): Promise<void> {
        const entities = schedules.map((s) =>
            this.trainingScheduleRepo.create({
                team_id: teamId,
                sport_id: sportId,
                days_en: s.days_en,
                days_ar: s.days_ar,
                start_time: s.start_time.length === 5 ? `${s.start_time}:00` : s.start_time,
                end_time: s.end_time.length === 5 ? `${s.end_time}:00` : s.end_time,
                field_id: s.field_id ?? null,
                training_fee: s.training_fee ?? 0,
                status: 'active',
            }),
        );
        await this.trainingScheduleRepo.save(entities);
    }
}
