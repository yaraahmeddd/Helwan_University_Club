import { Member } from './Member';
import { BranchSportTeam } from './BranchSportTeam';
import { Staff } from './Staff';
import { Announcement } from './Announcement';
/**
 * MemberTeamSubscription Entity
 *
 * Tracks member subscriptions to specific team(s).
 * A member can subscribe to multiple teams across different sports and branches.
 */
export declare class MemberTeamSubscription {
    id: number;
    member_id: number;
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
    created_at: Date;
    updated_at: Date;
    member: Member;
    team: BranchSportTeam;
    created_by: Staff | null;
    approved_by: Staff | null;
    announcement: Announcement | null;
}
//# sourceMappingURL=MemberTeamSubscription.d.ts.map