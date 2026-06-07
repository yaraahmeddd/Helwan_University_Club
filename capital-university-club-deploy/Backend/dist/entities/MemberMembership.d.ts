import { Member } from './Member';
import { MembershipPlan } from './MembershipPlan';
export declare class MemberMembership {
    id: number;
    member_id: number;
    membership_plan_id: number;
    start_date: Date;
    end_date: Date;
    status: string;
    payment_status: string;
    created_at: Date;
    updated_at: Date;
    member: Member;
    membership_plan: MembershipPlan;
}
//# sourceMappingURL=MemberMembership.d.ts.map