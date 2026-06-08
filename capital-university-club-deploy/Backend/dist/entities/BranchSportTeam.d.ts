import { Branch } from './Branch';
import { Sport } from './Sport';
import { Staff } from './Staff';
import { MemberTeamSubscription } from './MemberTeamSubscription';
import { TeamMemberTeamSubscription } from './TeamMemberTeamSubscription';
/**
 * BranchSportTeam Entity
 *
 * Represents the hierarchical structure:
 * Branch -> Sport -> Team
 *
 * Each team belongs to:
 * - Exactly one Branch
 * - Exactly one Sport (within that branch)
 *
 * Each team has:
 * - Specific training days (e.g., Sunday, Tuesday, Thursday)
 * - Start and end times (e.g., 8 PM - 10 PM)
 * - Monthly fee for subscription
 * - Maximum participants
 * - Status (pending, active, inactive, archived)
 */
export declare class BranchSportTeam {
    id: number;
    branch_id: number;
    sport_id: number;
    created_by_staff_id: number;
    name_en: string;
    name_ar: string;
    description_en: string | null;
    description_ar: string | null;
    training_days: string;
    start_time: string;
    end_time: string;
    monthly_fee: number;
    registration_fee: number | null;
    max_participants: number;
    current_participants: number;
    status: string;
    status_reason: string | null;
    approved_by_staff_id: number | null;
    approved_at: Date | null;
    approval_comments: string | null;
    team_image: string | null;
    min_age: number;
    max_age: number;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    branch: Branch;
    sport: Sport;
    created_by: Staff;
    approved_by: Staff | null;
    member_subscriptions: MemberTeamSubscription[];
    team_member_subscriptions: TeamMemberTeamSubscription[];
}
//# sourceMappingURL=BranchSportTeam.d.ts.map