"use strict";
/**
 * TeamService
 *
 * Handles all persistence operations for teams.
 * Business-rule validation is delegated to TeamValidationService.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamService = void 0;
const data_source_1 = require("../database/data-source");
const Team_1 = require("../entities/Team");
const TeamTrainingSchedule_1 = require("../entities/TeamTrainingSchedule");
const MemberTeam_1 = require("../entities/MemberTeam");
const TeamMemberTeam_1 = require("../entities/TeamMemberTeam");
const Sport_1 = require("../entities/Sport");
const BranchSportTeam_1 = require("../entities/BranchSportTeam");
const TeamEnums_1 = require("../constants/TeamEnums");
const TeamValidationService_1 = require("./TeamValidationService");
// ─── Service ─────────────────────────────────────────────────────────────────
class TeamService {
    constructor() {
        this.teamRepo = data_source_1.AppDataSource.getRepository(Team_1.Team);
        this.trainingScheduleRepo = data_source_1.AppDataSource.getRepository(TeamTrainingSchedule_1.TeamTrainingSchedule);
        this.memberTeamRepo = data_source_1.AppDataSource.getRepository(MemberTeam_1.MemberTeam);
        this.teamMemberTeamRepo = data_source_1.AppDataSource.getRepository(TeamMemberTeam_1.TeamMemberTeam);
        this.sportRepo = data_source_1.AppDataSource.getRepository(Sport_1.Sport);
        this.branchSportTeamRepo = data_source_1.AppDataSource.getRepository(BranchSportTeam_1.BranchSportTeam);
        this.validationService = new TeamValidationService_1.TeamValidationService();
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
    async createTeam(data) {
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
        return this.getTeamById(savedTeam.id);
    }
    // ─── Read ─────────────────────────────────────────────────────────────────
    async getAllTeams(filters) {
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
    async getTeamById(teamId) {
        return this.teamRepo.findOne({
            where: { id: teamId },
            relations: ['sport', 'branch', 'field', 'training_schedules', 'team_member_teams'],
        });
    }
    async getTeamsBySport(sportId) {
        return this.teamRepo.find({
            where: { sport_id: sportId, status: TeamEnums_1.TeamStatus.ACTIVE },
            relations: ['training_schedules', 'field'],
        });
    }
    // ─── Update ───────────────────────────────────────────────────────────────
    async updateTeam(teamId, updates) {
        const team = await this.getTeamById(teamId);
        if (!team)
            throw new Error('Team not found.');
        // Apply scalar updates
        if (updates.name_en !== undefined)
            team.name_en = updates.name_en;
        if (updates.name_ar !== undefined)
            team.name_ar = updates.name_ar;
        if (updates.branch_id !== undefined)
            team.branch_id = updates.branch_id;
        if (updates.field_id !== undefined)
            team.field_id = updates.field_id;
        if (updates.max_participants !== undefined) {
            // Re-validate capacity against field
            if (team.field_id) {
                const fieldRepo = data_source_1.AppDataSource.getRepository('Field');
                const field = await fieldRepo.findOne({ where: { id: team.field_id } });
                if (field && field.capacity !== null && updates.max_participants > field.capacity) {
                    throw new Error(`Validation error: "max_participants" (${updates.max_participants}) ` +
                        `exceeds the field's maximum capacity (${field.capacity}).`);
                }
            }
            team.max_participants = updates.max_participants;
        }
        if (updates.status !== undefined) {
            const validationService = new TeamValidationService_1.TeamValidationService();
            // Reuse status validation by calling private method indirectly
            const allowedStatuses = Object.values(TeamEnums_1.TeamStatus);
            if (!allowedStatuses.includes(updates.status)) {
                throw new Error(`Validation error: Invalid status "${updates.status}". ` +
                    `Allowed values: ${allowedStatuses.join(', ')}.`);
            }
            team.status = updates.status;
        }
        if (updates.visibility_type !== undefined) {
            const allowed = Object.values(TeamEnums_1.TeamVisibilityType);
            if (!allowed.includes(updates.visibility_type)) {
                throw new Error(`Validation error: Invalid visibility_type "${updates.visibility_type}". ` +
                    `Allowed values: ${allowed.join(', ')}.`);
            }
            team.visibility_type = updates.visibility_type;
        }
        await this.teamRepo.save(team);
        // Update training schedules if provided
        if (updates.training_schedules && updates.training_schedules.length > 0) {
            // Validate new schedules against other teams for this sport (exclude self)
            await this.validationService.validateTrainingSchedules(updates.training_schedules, team.sport_id, teamId);
            // Delete existing schedules and recreate
            await this.trainingScheduleRepo.delete({ team_id: teamId });
            await this.saveTrainingSchedules(teamId, team.sport_id, updates.training_schedules);
        }
        return (await this.getTeamById(teamId));
    }
    async updateTeamStatus(teamId, status) {
        const validStatuses = Object.values(TeamEnums_1.TeamStatus);
        if (!validStatuses.includes(status)) {
            throw new Error(`Validation error: Invalid status "${status}". ` +
                `Allowed values: ${validStatuses.join(', ')}.`);
        }
        const team = await this.getTeamById(teamId);
        if (!team)
            throw new Error('Team not found.');
        team.status = status;
        return this.teamRepo.save(team);
    }
    // ─── Delete ───────────────────────────────────────────────────────────────
    async deleteTeam(teamId) {
        const team = await this.getTeamById(teamId);
        if (!team)
            throw new Error('Team not found.');
        await this.teamRepo.remove(team);
    }
    // ─── Participant Counters (BranchSportTeam) ───────────────────────────────
    async incrementParticipants(teamId) {
        await this.branchSportTeamRepo.increment({ id: teamId }, 'current_participants', 1);
    }
    async decrementParticipants(teamId) {
        const team = await this.branchSportTeamRepo.findOne({ where: { id: teamId } });
        if (team && team.current_participants > 0) {
            await this.branchSportTeamRepo.decrement({ id: teamId }, 'current_participants', 1);
        }
    }
    // ─── Members ──────────────────────────────────────────────────────────────
    async getTeamMembers(teamId) {
        const team = await this.getTeamById(teamId);
        if (!team)
            throw new Error('Team not found.');
        const memberTeams = await this.memberTeamRepo.find({
            where: { team_id: parseInt(teamId) },
            relations: ['member'],
        });
        const teamMemberTeams = await this.teamMemberTeamRepo.find({
            where: { team_name: team.name_en },
            relations: ['team_member'],
        });
        const getMemberName = (obj) => {
            if (!obj || typeof obj !== 'object')
                return '';
            const m = obj;
            return `${m.first_name || ''} ${m.last_name || ''}`.trim();
        };
        const regularMembers = memberTeams.map((mt) => ({
            id: mt.member_id,
            name: getMemberName(mt.member),
            email: mt.member?.email || '',
            status: mt.status,
            joined_at: mt.start_date || new Date(),
        }));
        const teamMembers = teamMemberTeams.map((tmt) => ({
            id: tmt.team_member_id,
            name: getMemberName(tmt.team_member),
            email: tmt.team_member?.email || '',
            status: tmt.status,
            joined_at: tmt.start_date || new Date(),
        }));
        return { regular_members: regularMembers, team_members: teamMembers };
    }
    async getAvailableSlots(teamId) {
        const team = await this.getTeamById(teamId);
        if (!team)
            throw new Error('Team not found.');
        const memberCount = await this.memberTeamRepo.count({
            where: { team_id: parseInt(teamId), status: 'active' },
        });
        const teamMemberCount = await this.teamMemberTeamRepo.count({
            where: { team_name: team.name_en, status: 'active' },
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
    async getTeamsBySportWithMembers(sportId, teamId) {
        const whereCondition = { sport_id: sportId, status: TeamEnums_1.TeamStatus.ACTIVE };
        if (teamId)
            whereCondition.id = teamId;
        const teams = await this.teamRepo.find({
            where: whereCondition,
            relations: ['training_schedules', 'field'],
            order: { name_en: 'ASC' },
        });
        return Promise.all(teams.map(async (team) => {
            const memberTeams = await this.memberTeamRepo.find({
                where: { team_id: parseInt(team.id) },
                relations: ['member'],
            });
            const teamMemberTeams = await this.teamMemberTeamRepo.find({
                where: { team_name: team.name_en },
                relations: ['team_member'],
            });
            const regularMembers = memberTeams.map((mt) => {
                const m = mt.member;
                return {
                    id: mt.member_id,
                    name_en: `${m.first_name_en || ''} ${m.last_name_en || ''}`.trim(),
                    name_ar: `${m.first_name_ar || ''} ${m.last_name_ar || ''}`.trim(),
                    email: m.email || '',
                    phone: m.phone || '',
                    national_id: m.national_id || '',
                    type: 'regular_member',
                    status: mt.status,
                    joined_at: mt.start_date || new Date(),
                };
            });
            const teamMembers = teamMemberTeams.map((tmt) => {
                const tm = tmt.team_member;
                return {
                    id: tmt.team_member_id,
                    name_en: `${tm.first_name_en || ''} ${tm.last_name_en || ''}`.trim(),
                    name_ar: `${tm.first_name_ar || ''} ${tm.last_name_ar || ''}`.trim(),
                    email: tm.email || '',
                    phone: tm.phone || '',
                    national_id: tm.national_id || '',
                    type: 'team_member',
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
        }));
    }
    // ─── Private Helpers ──────────────────────────────────────────────────────
    async saveTrainingSchedules(teamId, sportId, schedules) {
        const entities = schedules.map((s) => this.trainingScheduleRepo.create({
            team_id: teamId,
            sport_id: sportId,
            days_en: s.days_en,
            days_ar: s.days_ar,
            start_time: s.start_time.length === 5 ? `${s.start_time}:00` : s.start_time,
            end_time: s.end_time.length === 5 ? `${s.end_time}:00` : s.end_time,
            field_id: s.field_id ?? null,
            training_fee: s.training_fee ?? 0,
            status: 'active',
        }));
        await this.trainingScheduleRepo.save(entities);
    }
}
exports.TeamService = TeamService;
//# sourceMappingURL=TeamService.js.map