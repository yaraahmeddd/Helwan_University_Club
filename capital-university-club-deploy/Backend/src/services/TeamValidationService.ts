/**
 * TeamValidationService
 *
 * Pure domain logic: no HTTP concerns, no persistence side-effects.
 * All methods throw descriptive Error objects on validation failure so
 * callers can surface them as structured 400 responses.
 */

import { Repository } from 'typeorm';
import { AppDataSource } from '../database/data-source';
import { Field } from '../entities/Field';
import { Sport } from '../entities/Sport';
import { TeamTrainingSchedule } from '../entities/TeamTrainingSchedule';
import {
    TeamVisibilityType,
    TEAM_VISIBILITY_VALUES,
    TeamStatus,
    TEAM_STATUS_VALUES,
    TrainingDay,
    TRAINING_DAY_VALUES,
} from '../constants/TeamEnums';

// ─── Input Types ─────────────────────────────────────────────────────────────

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
    field_id: string;                  // required: must belong to sport
    name_en: string;
    name_ar: string;
    max_participants: number;
    status?: TeamStatus;
    visibility_type: TeamVisibilityType;

    branch_id?: number;
    training_schedules?: TrainingScheduleInput[];
}

// ─── Validated result returned to TeamService ────────────────────────────────

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

// ─── Service ─────────────────────────────────────────────────────────────────

export class TeamValidationService {
    private sportRepo: Repository<Sport>;
    private fieldRepo: Repository<Field>;
    private scheduleRepo: Repository<TeamTrainingSchedule>;

    constructor() {
        this.sportRepo = AppDataSource.getRepository(Sport);
        this.fieldRepo = AppDataSource.getRepository(Field);
        this.scheduleRepo = AppDataSource.getRepository(TeamTrainingSchedule);
    }

    /**
     * Full validation pipeline for team creation.
     * Throws on the first fatal error so the caller receives one clear message.
     *
     * Returns the validated, normalised data ready to be persisted.
     */
    async validateCreateTeamInput(raw: CreateTeamInput): Promise<ValidatedTeamData> {
        // 1. Required field presence
        this.assertRequiredStrings({ name_en: raw.name_en, name_ar: raw.name_ar });

        // 2. Sport exists
        const sport = await this.validateSport(raw.sport_id);

        // 3. Field belongs to the sport & exists
        const field = await this.validateField(raw.field_id, raw.sport_id);

        // 4. max_participants ≤ field.capacity (if capacity is set)
        const maxParticipants = this.validateMaxParticipants(raw.max_participants, field);

        // 5. Status is valid (defaults to ACTIVE)
        const status = this.validateStatus(raw.status);

        // 6. Visibility type is valid
        const visibilityType = this.validateVisibilityType(raw.visibility_type);



        // 8. Training schedules: time range + no overlap with same sport
        const schedules = raw.training_schedules ?? [];
        if (schedules.length > 0) {
            await this.validateTrainingSchedules(schedules, raw.sport_id);
        }

        return {
            sport,
            field,
            name_en: raw.name_en.trim(),
            name_ar: raw.name_ar.trim(),
            max_participants: maxParticipants,
            status,
            visibility_type: visibilityType,

            branch_id: raw.branch_id ?? null,
            training_schedules: schedules,
        };
    }

    // ─── Individual validators ────────────────────────────────────────────────

    private assertRequiredStrings(fields: Record<string, unknown>): void {
        for (const [key, value] of Object.entries(fields)) {
            if (!value || typeof value !== 'string' || value.trim() === '') {
                throw new Error(`Validation error: "${key}" is required and must be a non-empty string.`);
            }
        }
    }

    private async validateSport(sportId: unknown): Promise<Sport> {
        if (!sportId || isNaN(Number(sportId))) {
            throw new Error('Validation error: "sport_id" is required and must be a valid integer.');
        }
        const sport = await this.sportRepo.findOne({ where: { id: Number(sportId) } });
        if (!sport) {
            throw new Error(`Validation error: Sport with ID ${sportId} does not exist.`);
        }
        return sport;
    }

    private async validateField(fieldId: unknown, sportId: number): Promise<Field> {
        if (!fieldId || typeof fieldId !== 'string' || fieldId.trim() === '') {
            throw new Error('Validation error: "field_id" is required.');
        }
        const field = await this.fieldRepo.findOne({
            where: { id: fieldId as string },
            relations: ['sport'],
        });
        if (!field) {
            throw new Error(`Validation error: Field with ID "${fieldId}" does not exist.`);
        }
        if (field.sport_id !== sportId) {
            throw new Error(
                `Validation error: Field "${field.name_en}" (sport: ${field.sport_id}) ` +
                `does not belong to the selected sport (ID: ${sportId}). ` +
                `Only fields associated with the chosen sport can be selected.`,
            );
        }
        return field;
    }

    private validateMaxParticipants(value: unknown, field: Field): number {
        const num = Number(value);
        if (!value || isNaN(num) || num < 1) {
            throw new Error('Validation error: "max_participants" must be a positive integer.');
        }
        if (field.capacity !== null && num > field.capacity) {
            throw new Error(
                `Validation error: "max_participants" (${num}) exceeds the field's maximum capacity (${field.capacity}). ` +
                `Please set a value ≤ ${field.capacity}.`,
            );
        }
        return num;
    }

    private validateStatus(value?: unknown): TeamStatus {
        if (!value) return TeamStatus.ACTIVE;
        if (!TEAM_STATUS_VALUES.includes(value as TeamStatus)) {
            throw new Error(
                `Validation error: Invalid status "${value}". ` +
                `Allowed values: ${TEAM_STATUS_VALUES.join(', ')}.`,
            );
        }
        return value as TeamStatus;
    }

    private validateVisibilityType(value: unknown): TeamVisibilityType {
        if (!value || !TEAM_VISIBILITY_VALUES.includes(value as TeamVisibilityType)) {
            throw new Error(
                `Validation error: "visibility_type" is required. ` +
                `Allowed values: ${TEAM_VISIBILITY_VALUES.join(', ')}.`,
            );
        }
        return value as TeamVisibilityType;
    }



    /**
     * Validates every training schedule:
     *  1. Day names are valid English day names.
     *  2. start_time < end_time.
     *  3. No overlap with existing schedules for the same sport (any other team).
     *
     * Overlap rule: two time ranges [A_start, A_end) and [B_start, B_end) overlap
     * on the same day when A_start < B_end AND B_start < A_end.
     */
    async validateTrainingSchedules(
        schedules: TrainingScheduleInput[],
        sportId: number,
        excludeTeamId?: string,   // used during updates to exclude the team being edited
    ): Promise<void> {
        // Validate time format and order for each incoming schedule
        for (const s of schedules) {
            const days = this.parseDays(s.days_en);
            const startTime = this.normaliseTime(s.start_time, 'start_time');
            const endTime = this.normaliseTime(s.end_time, 'end_time');

            if (startTime >= endTime) {
                throw new Error(
                    `Validation error: "start_time" (${s.start_time}) must be before "end_time" (${s.end_time}).`,
                );
            }

            // Check each day against existing sport schedules
            await this.checkScheduleConflicts(days, startTime, endTime, sportId, excludeTeamId);
        }

        // Also check for intra-request conflicts (two schedules sent in the same request)
        this.checkIntraRequestConflicts(schedules);
    }

    // ─── Conflict detection ───────────────────────────────────────────────────

    /**
     * Fetches all active training schedules for the sport and checks for day+time overlap.
     */
    private async checkScheduleConflicts(
        days: TrainingDay[],
        startTime: string,   // normalised HH:MM:SS
        endTime: string,     // normalised HH:MM:SS
        sportId: number,
        excludeTeamId?: string,
    ): Promise<void> {
        // Fetch all schedules for this sport
        const qb = this.scheduleRepo
            .createQueryBuilder('s')
            .innerJoin('s.team', 'team')
            .where('team.sport_id = :sportId', { sportId })
            .andWhere('s.status = :status', { status: 'active' });

        if (excludeTeamId) {
            qb.andWhere('s.team_id != :excludeTeamId', { excludeTeamId });
        }

        const existing = await qb.getMany();

        for (const ex of existing) {
            // Parse the stored days string into individual day names
            const existingDays = this.parseDays(ex.days_en);

            // Find days that appear in both sets
            const sharedDays = days.filter((d) => existingDays.includes(d));
            if (sharedDays.length === 0) continue;

            // Time overlap check: [start, end) intervals
            const exStart = this.normaliseTime(ex.start_time, 'stored start_time');
            const exEnd = this.normaliseTime(ex.end_time, 'stored end_time');

            const overlaps = startTime < exEnd && exStart < endTime;
            if (overlaps) {
                throw new Error(
                    `Schedule conflict: The training slot (${sharedDays.join(', ')} ` +
                    `${this.formatTime(startTime)}–${this.formatTime(endTime)}) ` +
                    `overlaps with an existing schedule ` +
                    `(${ex.days_en} ${this.formatTime(exStart)}–${this.formatTime(exEnd)}) ` +
                    `for the same sport. ` +
                    `Please choose a non-overlapping day or time range.`,
                );
            }
        }
    }

    /**
     * Checks that multiple schedules supplied in a single request don't
     * conflict with each other.
     */
    private checkIntraRequestConflicts(schedules: TrainingScheduleInput[]): void {
        for (let i = 0; i < schedules.length; i++) {
            for (let j = i + 1; j < schedules.length; j++) {
                const a = schedules[i];
                const b = schedules[j];

                const daysA = this.parseDays(a.days_en);
                const daysB = this.parseDays(b.days_en);
                const sharedDays = daysA.filter((d) => daysB.includes(d));
                if (sharedDays.length === 0) continue;

                const aStart = this.normaliseTime(a.start_time, 'start_time');
                const aEnd = this.normaliseTime(a.end_time, 'end_time');
                const bStart = this.normaliseTime(b.start_time, 'start_time');
                const bEnd = this.normaliseTime(b.end_time, 'end_time');

                const overlaps = aStart < bEnd && bStart < aEnd;
                if (overlaps) {
                    throw new Error(
                        `Schedule conflict: Two of the provided training schedules overlap ` +
                        `on ${sharedDays.join(', ')} ` +
                        `(${this.formatTime(aStart)}–${this.formatTime(aEnd)} vs ` +
                        `${this.formatTime(bStart)}–${this.formatTime(bEnd)}). ` +
                        `Please provide non-overlapping schedules.`,
                    );
                }
            }
        }
    }

    // ─── Time & Day Utilities ─────────────────────────────────────────────────

    /**
     * Parses a comma-separated day string into TrainingDay values.
     * Throws on invalid day names.
     */
    private parseDays(daysString: string): TrainingDay[] {
        if (!daysString || daysString.trim() === '') {
            throw new Error('Validation error: Training schedule must include at least one day.');
        }
        const parts = daysString.split(',').map((d) => d.trim());
        const days: TrainingDay[] = [];
        for (const part of parts) {
            if (!TRAINING_DAY_VALUES.includes(part as TrainingDay)) {
                throw new Error(
                    `Validation error: "${part}" is not a valid training day. ` +
                    `Allowed values: ${TRAINING_DAY_VALUES.join(', ')}.`,
                );
            }
            days.push(part as TrainingDay);
        }
        return days;
    }

    /**
     * Normalises HH:MM or HH:MM:SS to HH:MM:SS for consistent comparison.
     */
    private normaliseTime(time: string, fieldName: string): string {
        if (!time) throw new Error(`Validation error: "${fieldName}" is required.`);

        const full = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(time)
            ? time
            : /^([01]\d|2[0-3]):([0-5]\d)$/.test(time)
            ? `${time}:00`
            : null;

        if (!full) {
            throw new Error(
                `Validation error: "${fieldName}" has an invalid format ("${time}"). ` +
                `Expected HH:MM or HH:MM:SS (24-hour clock).`,
            );
        }
        return full;
    }

    private formatTime(hhmm: string): string {
        // Converts HH:MM:SS to a human-readable HH:MM
        return hhmm.substring(0, 5);
    }
}
