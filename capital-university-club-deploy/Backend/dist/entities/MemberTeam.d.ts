import { Member } from './Member';
import { Team } from './Team';
import { Payment } from './Payment';
export declare class MemberTeam {
    id: number;
    team_id: string;
    member_id: number;
    created_at: Date;
    updated_at: Date;
    start_date: Date | null;
    end_date: Date | null;
    status: string;
    subscription_status: string;
    payment_id: number | null;
    payment_reference: string | null;
    payment_completed_at: Date | null;
    admin_approved_at: Date | null;
    approved_by_staff_id: number | null;
    price: number;
    member: Member;
    team: Team;
    payment?: Payment;
}
//# sourceMappingURL=MemberTeam.d.ts.map