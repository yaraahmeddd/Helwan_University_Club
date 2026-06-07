import { Sport } from './Sport';
import { Branch } from './Branch';
import { Field } from './Field';
import { TeamTrainingSchedule } from './TeamTrainingSchedule';
import { TeamMemberTeam } from './TeamMemberTeam';
import { TeamVisibilityType, TeamStatus } from '../constants/TeamEnums';
export declare class Team {
    id: string;
    sport_id: number;
    sport: Sport;
    branch_id: number | null;
    branch: Branch | null;
    /** The primary field used for this team's training sessions. */
    field_id: string | null;
    field: Field | null;
    name_en: string;
    name_ar: string;
    max_participants: number;
    status: TeamStatus;
    /**
     * Controls which member types can see and join this team.
     *   INTERNAL → working members, students, graduates, their dependents
     *   EXTERNAL → foreigners, visitor members, their dependents
     *   BOTH     → no restriction; any member type can join
     */
    visibility_type: TeamVisibilityType;
    /**
     * Subscription price tied to visibility_type.
     * INTERNAL → price for internal users
     * EXTERNAL → price for external users
     * BOTH     → unified price for all users
     */
    price: number | null;
    /** Legacy column kept for backward compatibility */
    subscription_price: number | null;
    approval_required: boolean;
    created_at: Date;
    updated_at: Date;
    training_schedules: TeamTrainingSchedule[];
    team_member_teams: TeamMemberTeam[];
}
//# sourceMappingURL=Team.d.ts.map