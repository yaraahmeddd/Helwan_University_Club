import { MemberMembership } from '../entities/MemberMembership';
import { MemberRelationship } from '../entities/MemberRelationship';
export declare class DependentMemberService {
    /**
     * Get dependent member subtypes
     */
    static getDependentSubtypes(): {
        code: string;
        label_en: string;
        label_ar: string;
    }[];
    /**
     * Get relationship types for dependent members
     */
    static getRelationshipTypes(): {
        code: string;
        label_en: string;
        label_ar: string;
    }[];
    /**
     * Get list of active members (working members) for dependent selection
     */
    static getActiveWorkingMembers(): Promise<{
        member_id: number;
        member_type: string;
        name_en: string;
        name_ar: string;
        email: string;
        active_membership: number | null;
        highest_plan_price: number;
    }[]>;
    /**
     * Get list of visitor members for dependent selection
     */
    static getActiveVisitorMembers(): Promise<{
        member_id: number;
        member_type: string;
        name_en: string;
        name_ar: string;
        email: string;
        active_membership: number | null;
        membership_price: number;
    }[]>;
    /**
     * Calculate dependent membership price (40% discount on related member's price)
     */
    static calculateDependentMembershipPrice(memberData: {
        related_member_id: number;
        dependent_subtype: 'DEPENDENT_ACTIVE' | 'DEPENDENT_VISITOR';
    }): Promise<{
        is_dependent: boolean;
        dependent_subtype: "DEPENDENT_VISITOR" | "DEPENDENT_ACTIVE";
        related_member_price: number;
        discount_percentage: number;
        discount_amount: number;
        final_price: number;
    }>;
    /**
     * Create dependent member relationship and membership
     */
    static createDependentMembership(memberData: {
        member_id: number;
        related_member_id: number;
        relationship_type: string;
        dependent_subtype: 'DEPENDENT_ACTIVE' | 'DEPENDENT_VISITOR';
        proof_document: string;
        is_auto_renew?: boolean;
    }): Promise<{
        membership: MemberMembership;
        relationship: MemberRelationship;
        pricing: {
            is_dependent: boolean;
            dependent_subtype: "DEPENDENT_VISITOR" | "DEPENDENT_ACTIVE";
            related_member_price: number;
            discount_percentage: number;
            discount_amount: number;
            final_price: number;
        };
    }>;
    /**
     * Get dependent member complete status and details
     */
    static getDependentMemberStatus(member_id: number): Promise<{
        member: {
            id: number;
            name_en: string;
            name_ar: string;
            email: string;
            status: string;
            phone: string;
            national_id: string;
            birthdate: Date | null;
            health_status: string;
            photo: string;
            member_type_id: number;
        };
        active_membership: MemberMembership;
        relationships: {
            id: number;
            relationship_type: string;
            is_dependent: boolean;
            related_member: {
                id: number;
                name_en: string;
                name_ar: string;
                member_type_id: number;
            };
        }[];
    }>;
    /**
     * Get combined list of active members (both working and visitor)
     */
    static getActiveMembers(): Promise<{
        working_members: {
            member_id: number;
            member_type: string;
            name_en: string;
            name_ar: string;
            email: string;
            active_membership: number | null;
            highest_plan_price: number;
        }[];
        visitor_members: {
            member_id: number;
            member_type: string;
            name_en: string;
            name_ar: string;
            email: string;
            active_membership: number | null;
            membership_price: number;
        }[];
    }>;
    /**
     * Submit dependent member details (Step 3 of registration)
     * Saves photos and documents to member record, creates relationship
     */
    static submitDependentDetails(memberData: {
        member_id: number;
        related_member_id: number;
        relationship_type: string;
        personal_photo?: string;
        national_id_front?: string;
        national_id_back?: string;
        medical_report?: string;
        relation_proof?: string;
    }): Promise<{
        success: boolean;
        member_id: number;
        relationship_id: number;
        message: string;
        next_step: string;
    }>;
}
//# sourceMappingURL=DependentMemberService.d.ts.map