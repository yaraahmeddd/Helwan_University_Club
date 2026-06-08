/**
 * TeamValidationService
 *
 * Pure domain logic: no HTTP concerns, no persistence side-effects.
 * All methods throw descriptive Error objects on validation failure so
 * callers can surface them as structured 400 responses.
 */
import { Field } from '../entities/Field';
import { Sport } from '../entities/Sport';
import { TeamVisibilityType, TeamStatus } from '../constants/TeamEnums';
export interface TrainingScheduleInput {
    /** Comma-separated English day names, e.g. "Sunday,Tuesday" */
    days_en: string;
    /** Comma-separated Arabic day names */
    days_ar: string;
    /** HH:MM or HH:MM:SS */
    start_time: string;
    /** HH:MM or HH:MM:SS */
    end_time: string;
    /** UUID of the field used for training */
    field_id: string;
    /** Training session fee */
    training_fee?: number;
}
export interface CreateTeamInput {
    sport_id: number;
    field_id: string;
    name_en: string;
    name_ar: string;
    max_participants: number;
    status?: TeamStatus;
    visibility_type: TeamVisibilityType;
    branch_id?: number;
    training_schedules?: TrainingScheduleInput[];
}
export interface ValidatedTeamData {
    sport: Sport;
    field: Field;
    name_en: string;
    name_ar: string;
    max_participants: number;
    status: TeamStatus;
    visibility_type: TeamVisibilityType;
    branch_id: number | null;
    training_schedules: TrainingScheduleInput[];
}
export declare class TeamValidationService {
    private sportRepo;
    private fieldRepo;
    private scheduleRepo;
    constructor();
    /**
     * Full validation pipeline for team creation.
     * Throws on the first fatal error so the caller receives one clear message.
     *
     * Returns the validated, normalised data ready to be persisted.
     */
    validateCreateTeamInput(raw: CreateTeamInput): Promise<ValidatedTeamData>;
    private assertRequiredStrings;
    private validateSport;
    private validateField;
    private validateMaxParticipants;
    private validateStatus;
    private validateVisibilityType;
    /**
     * Validates every training schedule:
     *  1. Day names are valid English day names.
     *  2. start_time < end_time.
     *  3. No overlap with existing schedules for the same sport (any other team).
     *
     * Overlap rule: two time ranges [A_start, A_end) and [B_start, B_end) overlap
     * on the same day when A_start < B_end AND B_start < A_end.
     */
    validateTrainingSchedules(schedules: TrainingScheduleInput[], sportId: number, excludeTeamId?: string): Promise<void>;
    /**
     * Fetches all active training schedules for the sport and checks for day+time overlap.
     */
    private checkScheduleConflicts;
    /**
     * Checks that multiple schedules supplied in a single request don't
     * conflict with each other.
     */
    private checkIntraRequestConflicts;
    /**
     * Parses a comma-separated day string into TrainingDay values.
     * Throws on invalid day names.
     */
    private parseDays;
    /**
     * Normalises HH:MM or HH:MM:SS to HH:MM:SS for consistent comparison.
     */
    private normaliseTime;
    private formatTime;
}
//# sourceMappingURL=TeamValidationService.d.ts.map