/**
 * TeamService
 *
 * Handles all persistence operations for teams.
 * Business-rule validation is delegated to TeamValidationService.
 */
import { Team } from '../entities/Team';
import { TeamStatus, TeamVisibilityType } from '../constants/TeamEnums';
import { CreateTeamInput, TrainingScheduleInput } from './TeamValidationService';
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
export declare class TeamService {
    private teamRepo;
    private trainingScheduleRepo;
    private memberTeamRepo;
    private teamMemberTeamRepo;
    private sportRepo;
    private branchSportTeamRepo;
    private validationService;
    constructor();
    /**
     * Creates a team with full backend validation:
     *   - Sport must exist.
     *   - Field must belong to that sport.
     *   - max_participants ≤ field.capacity.
     *   - visibility_type must be INTERNAL | EXTERNAL | BOTH.
     *   - Training schedules must not overlap (same sport, same day, same time range).
     */
    createTeam(data: CreateTeamInput): Promise<Team>;
    getAllTeams(filters: Record<string, unknown>): Promise<Team[]>;
    getTeamById(teamId: string): Promise<Team | null>;
    getTeamsBySport(sportId: number): Promise<Team[]>;
    updateTeam(teamId: string, updates: UpdateTeamInput): Promise<Team>;
    updateTeamStatus(teamId: string, status: string): Promise<Team>;
    deleteTeam(teamId: string): Promise<void>;
    incrementParticipants(teamId: number): Promise<void>;
    decrementParticipants(teamId: number): Promise<void>;
    getTeamMembers(teamId: string): Promise<TeamMembersResponse>;
    getAvailableSlots(teamId: string): Promise<AvailableSlotsResponse>;
    getTeamsBySportWithMembers(sportId: number, teamId?: string): Promise<Array<{
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
    }>>;
    private saveTrainingSchedules;
}
export {};
//# sourceMappingURL=TeamService.d.ts.map