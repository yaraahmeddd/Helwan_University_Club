import { MemberMembership } from '../entities/MemberMembership';
import { RetiredEmployeeDetail } from '../entities/RetiredEmployeeDetail';
import { MemberRelationship } from '../entities/MemberRelationship';
export declare class RetiredMemberService {
    /**
     * Get list of retired profession options
     */
    static getProfessions(): {
        code: string;
        label_en: string;
        label_ar: string;
    }[];
    /**
     * Get relationship types for dependents
     */
    static getRelationshipTypes(): {
        code: string;
        label_en: string;
        label_ar: string;
    }[];
    /**
     * Calculate salary-based membership price for retired members
     * Faculty: Fixed 20,000 EGP
     * Others: Based on last salary before retirement
     */
    static calculateSalaryBasedPrice(professionCode: string, salary: number): {
        price: number;
        tier: string;
    };
    /**
     * Get list of active working members (for dependent relationship selection)
     */
    static getActiveWorkingMembers(): Promise<{
        member_id: number;
        name_en: string;
        name_ar: string;
        email: string;
        active_membership: number | null;
        highest_plan_price: number;
    }[]>;
    /**
     * Submit retired member details
     */
    static submitRetiredMemberDetails(retiredData: {
        member_id: number;
        profession_code: string;
        former_department: string;
        retirement_date: Date;
        last_salary: number;
        salary_slip: string;
    }): Promise<RetiredEmployeeDetail>;
    /**
     * Calculate final membership pricing
     * If independent: Based on profession/salary
     * If dependent: 40% discount on lower of (member's price, related member's highest membership fee)
     */
    static calculateMembershipPricing(memberData: {
        member_id: number;
        profession_code: string;
        last_salary: number;
        is_related_to_active_member: boolean;
        related_member_id?: number;
    }): Promise<{
        is_dependent: boolean;
        base_price: number;
        discount_percentage: number;
        final_price: number;
        tier: string;
        related_member_price?: undefined;
        lower_price?: undefined;
        discount_amount?: undefined;
    } | {
        is_dependent: boolean;
        base_price: number;
        related_member_price: number;
        lower_price: number;
        discount_percentage: number;
        discount_amount: number;
        final_price: number;
        tier: string;
    }>;
    /**
     * Create membership subscription for retired member
     */
    static createRetiredMembership(memberData: {
        member_id: number;
        profession_code: string;
        last_salary: number;
        is_related_to_active_member: boolean;
        related_member_id?: number;
        is_auto_renew?: boolean;
    }): Promise<{
        membership: MemberMembership;
        pricing: {
            is_dependent: boolean;
            base_price: number;
            discount_percentage: number;
            final_price: number;
            tier: string;
            related_member_price?: undefined;
            lower_price?: undefined;
            discount_amount?: undefined;
        } | {
            is_dependent: boolean;
            base_price: number;
            related_member_price: number;
            lower_price: number;
            discount_percentage: number;
            discount_amount: number;
            final_price: number;
            tier: string;
        };
    }>;
    /**
     * Create relationship between retired member and active member (with approval tracking)
     */
    static createMemberRelationship(relationshipData: {
        retired_member_id: number;
        active_member_id: number;
        relationship_type: string;
        proof_document: string;
    }): Promise<MemberRelationship>;
    /**
     * Get retired member complete status and details
     */
    static getRetiredMemberStatus(member_id: number): Promise<{
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
        };
        retired_details: RetiredEmployeeDetail | null;
        active_membership: MemberMembership;
        relationships: {
            id: number;
            relationship_type: string;
            related_member: {
                id: number;
                name: string;
            };
        }[];
    }>;
}
//# sourceMappingURL=RetiredMemberService.d.ts.map