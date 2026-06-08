import { TeamMember } from './TeamMember';
import { Team } from './Team';
import { Payment } from './Payment';
export declare class TeamMemberTeam {
    id: number;
    team_member_id: number;
    team_id: string;
    start_date: Date;
    end_date: Date;
    status: string;
    subscription_status: string;
    payment_id: number | null;
    payment_reference: string | null;
    payment_completed_at: Date | null;
    admin_approved_at: Date | null;
    approved_by_staff_id: number | null;
    price: number;
    created_at: Date;
    updated_at: Date;
    team_member: TeamMember;
    team: Team;
    payment?: Payment;
}
//# sourceMappingURL=TeamMemberTeam.d.ts.map