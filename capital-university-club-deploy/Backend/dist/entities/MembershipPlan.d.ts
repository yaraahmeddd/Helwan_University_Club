import { MemberType } from './MemberType';
import { MemberMembership } from './MemberMembership';
export declare class MembershipPlan {
    id: number;
    member_type_id: number;
    plan_code: string;
    name_en: string;
    name_ar: string;
    description_en: string;
    description_ar: string;
    price: number;
    currency: string;
    duration_months: number;
    renewal_price: number;
    is_installable: boolean;
    max_installments: number;
    is_active: boolean;
    is_for_foreigner: boolean;
    min_age: number;
    max_age: number;
    created_at: Date;
    updated_at: Date;
    member_type: MemberType;
    member_memberships: MemberMembership[];
}
//# sourceMappingURL=MembershipPlan.d.ts.map