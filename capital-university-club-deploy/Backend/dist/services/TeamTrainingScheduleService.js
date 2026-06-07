"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamTrainingScheduleService = void 0;
const data_source_1 = require("../database/data-source");
const TeamTrainingSchedule_1 = require("../entities/TeamTrainingSchedule");
const Team_1 = require("../entities/Team");
class TeamTrainingScheduleService {
    constructor() {
        this.scheduleRepository = data_source_1.AppDataSource.getRepository(TeamTrainingSchedule_1.TeamTrainingSchedule);
        this.teamRepository = data_source_1.AppDataSource.getRepository(Team_1.Team);
    }
    /**
     * Create a new training schedule
     */
    async createSchedule(request) {
        // Validate team exists
        const team = await this.teamRepository.findOne({
            where: { id: request.team_id },
        });
        if (!team) {
            throw new Error(`Team with ID ${request.team_id} not found`);
        }
        // Validate time format
        this.validateTimeFormat(request.start_time);
        this.validateTimeFormat(request.end_time);
        if (request.start_time >= request.end_time) {
            throw new Error("Start time must be before end time");
        }
        const schedule = this.scheduleRepository.create({
            team_id: request.team_id,
            sport_id: request.sport_id,
            days_en: request.days_en,
            days_ar: request.days_ar,
            start_time: request.start_time,
            end_time: request.end_time,
            field_id: request.field_id,
            training_fee: request.training_fee,
            status: 'active',
        });
        return await this.scheduleRepository.save(schedule);
    }
    /**
     * Get all training schedules for a team
     */
    async getTeamSchedules(teamId) {
        return await this.scheduleRepository.find({
            where: { team_id: teamId },
            order: { start_time: "ASC" },
        });
    }
    /**
     * Get a specific training schedule
     */
    async getScheduleById(scheduleId) {
        return await this.scheduleRepository.findOne({
            where: { id: scheduleId },
            relations: ["team", "attendances"],
        });
    }
    /**
     * Update a training schedule
     */
    async updateSchedule(scheduleId, request) {
        const schedule = await this.getScheduleById(scheduleId);
        if (!schedule) {
            throw new Error(`Schedule with ID ${scheduleId} not found`);
        }
        // If times are being updated, validate them
        if (request.start_time || request.end_time) {
            const startTime = request.start_time || schedule.start_time;
            const endTime = request.end_time || schedule.end_time;
            this.validateTimeFormat(startTime);
            this.validateTimeFormat(endTime);
            if (startTime >= endTime) {
                throw new Error("Start time must be before end time");
            }
        }
        const updateData = { ...request };
        Object.assign(schedule, updateData);
        return await this.scheduleRepository.save(schedule);
    }
    /**
     * Delete a training schedule
     */
    async deleteSchedule(scheduleId) {
        const result = await this.scheduleRepository.delete(scheduleId);
        if (result.affected === 0) {
            throw new Error(`Schedule with ID ${scheduleId} not found`);
        }
    }
    /**
     * Get schedules for a sport (across all teams in that sport)
     */
    async getSchedulesBySport(sportId) {
        const query = this.scheduleRepository
            .createQueryBuilder("schedule")
            .innerJoinAndSelect("schedule.team", "team")
            .where("schedule.sport_id = :sportId", { sportId })
            .orderBy("schedule.start_time", "ASC");
        return await query.getMany();
    }
    /**
     * Get schedules for a specific field
     */
    async getSchedulesByField(fieldId) {
        return await this.scheduleRepository.find({
            where: { field_id: fieldId },
            relations: ["team"],
            order: { start_time: "ASC" },
        });
    }
    /**
     * Check if a schedule has available capacity
     */
    async checkAvailability(scheduleId) {
        const schedule = await this.getScheduleById(scheduleId);
        if (!schedule) {
            throw new Error(`Schedule with ID ${scheduleId} not found`);
        }
        // Get team max participants
        if (!schedule.team) {
            throw new Error(`Team not found for schedule ${scheduleId}`);
        }
        return {
            team_capacity: schedule.team.max_participants,
        };
    }
    /**
     * Private helper: Validate time format (HH:MM:SS)
     */
    validateTimeFormat(time) {
        const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;
        if (!timeRegex.test(time)) {
            throw new Error(`Invalid time format: ${time}. Expected HH:MM:SS`);
        }
    }
}
exports.TeamTrainingScheduleService = TeamTrainingScheduleService;
//# sourceMappingURL=TeamTrainingScheduleService.js.map