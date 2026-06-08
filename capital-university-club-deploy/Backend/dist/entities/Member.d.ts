import { Account } from './Account';
import { MemberRelationship } from './MemberRelationship';
import { MemberMembership } from './MemberMembership';
import { MemberType } from './MemberType';
export declare class Member {
    id: number;
    account_id: number;
    first_name_en: string;
    first_name_ar: string;
    last_name_en: string;
    last_name_ar: string;
    gender: string;
    phone: string;
    nationality: string;
    birthdate: Date | null;
    national_id: string;
    health_status: string;
    is_foreign: boolean;
    photo: string;
    national_id_front: string;
    national_id_back: string;
    address: string;
    medical_report: string;
    member_type_id: number;
    points_balance: number;
    status: string;
    created_at: Date;
    updated_at: Date;
    account: Account;
    member_type: MemberType;
    relationships: MemberRelationship[];
    memberships: MemberMembership[];
}
//# sourceMappingURL=Member.d.ts.map