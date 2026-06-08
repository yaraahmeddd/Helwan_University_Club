import { TeamTrainingSchedule } from "../entities/TeamTrainingSchedule";
export interface CreateScheduleRequest {
    team_id: string;
    sport_id: number;
    days_en: string;
    days_ar: string;
    start_time: string;
    end_time: string;
    field_id: string | null;
    training_fee: number;
}
export interface UpdateScheduleRequest {
    days_en?: string;
    days_ar?: string;
    start_time?: string;
    end_time?: string;
    field_id?: string | null;
    training_fee?: number;
}
export declare class TeamTrainingScheduleService {
    private scheduleRepository;
    private teamRepository;
    constructor();
    /**
     * Create a new training schedule
     */
    createSchedule(request: CreateScheduleRequest): Promise<TeamTrainingSchedule>;
    /**
     * Get all training schedules for a team
     */
    getTeamSchedules(teamId: string): Promise<TeamTrainingSchedule[]>;
    /**
     * Get a specific training schedule
     */
    getScheduleById(scheduleId: string): Promise<TeamTrainingSchedule | null>;
    /**
     * Update a training schedule
     */
    updateSchedule(scheduleId: string, request: UpdateScheduleRequest): Promise<TeamTrainingSchedule>;
    /**
     * Delete a training schedule
     */
    deleteSchedule(scheduleId: string): Promise<void>;
    /**
     * Get schedules for a sport (across all teams in that sport)
     */
    getSchedulesBySport(sportId: number): Promise<TeamTrainingSchedule[]>;
    /**
     * Get schedules for a specific field
     */
    getSchedulesByField(fieldId: string): Promise<TeamTrainingSchedule[]>;
    /**
     * Check if a schedule has available capacity
     */
    checkAvailability(scheduleId: string): Promise<{
        team_capacity: number;
    }>;
    /**
     * Private helper: Validate time format (HH:MM:SS)
     */
    private validateTimeFormat;
}
//# sourceMappingURL=TeamTrainingScheduleService.d.ts.map