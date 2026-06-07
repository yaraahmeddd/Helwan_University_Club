import { TeamMember } from './TeamMember';
import { BranchSportTeam } from './BranchSportTeam';
import { Staff } from './Staff';
import { Announcement } from './Announcement';
/**
 * TeamMemberTeamSubscription Entity
 *
 * Tracks team member subscriptions to specific team(s).
 * A team member (athlete) can subscribe to multiple teams across different sports and branches.
 */
export declare class TeamMemberTeamSubscription {
    id: number;
    team_member_id: number;
    team_id: number;
    created_by_staff_id: number | null;
    approved_by_staff_id: number | null;
    announcement_id: number | null;
    status: string;
    decline_reason: string | null;
    cancellation_reason: string | null;
    start_date: Date | null;
    end_date: Date | null;
    approved_at: Date | null;
    declined_at: Date | null;
    cancelled_at: Date | null;
    monthly_fee: number;
    registration_fee: number | null;
    discount_amount: number;
    custom_price: number | null;
    payment_status: string;
    approval_notes: string | null;
    special_notes: string | null;
    is_captain: boolean;
    created_at: Date;
    updated_at: Date;
    team_member: TeamMember;
    team: BranchSportTeam;
    created_by: Staff | null;
    approved_by: Staff | null;
    announcement: Announcement | null;
}
//# sourceMappingURL=TeamMemberTeamSubscription.d.ts.map