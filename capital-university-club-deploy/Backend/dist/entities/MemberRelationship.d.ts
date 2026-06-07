import { Member } from './Member';
export declare class MemberRelationship {
    id: number;
    member_id: number;
    related_member_id: number;
    relationship_type: string;
    relationship_name_ar: string;
    is_dependent: boolean;
    age_group: string;
    created_at: Date;
    member: Member;
    related_member: Member;
}
//# sourceMappingURL=MemberRelationship.d.ts.map