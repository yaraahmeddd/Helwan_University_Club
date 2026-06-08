import { MemberMembership } from '../entities/MemberMembership';
import { MemberRelationship } from '../entities/MemberRelationship';
export declare class StudentMemberService {
    /**
     * Get student/graduate status options
     */
    static getStudentStatusOptions(): {
        code: string;
        label_en: string;
        label_ar: string;
    }[];
    /**
     * Calculate if user is graduate or student based on graduation year
     * If graduation_year < current year: Graduate
     * If graduation_year >= current year: Student
     */
    static calculateStudentStatus(graduation_year: number): {
        status: 'STUDENT' | 'GRADUATE';
        years_since: number;
    };
    /**
     * Get student/graduate membership pricing
     * Fixed pricing for both student and graduate members
     */
    static getStudentMembershipPrice(student_status: 'STUDENT' | 'GRADUATE'): {
        price: number;
        status: string;
    };
    /**
     * Get list of active members (working, retired, or other members) for dependent selection
     */
    static getActiveMembers(): Promise<{
        member_id: number;
        member_type: string;
        name_en: string;
        name_ar: string;
        email: string;
        active_membership: number | null;
        highest_plan_price: number;
    }[]>;
    /**
     * Get relationship types for dependent members
     */
    static getRelationshipTypes(): {
        code: string;
        label_en: string;
        label_ar: string;
    }[];
    /**
     * Submit student member details
     */
    static submitStudentMemberDetails(studentData: {
        member_id: number;
        university_id: number;
        graduation_year: number;
        status_proof: string;
    }): Promise<{
        member_id: number;
        university_id: number;
        graduation_year: number;
        student_status: "STUDENT" | "GRADUATE";
        years_since: number;
        status_proof: string;
    }>;
    /**
     * Calculate student/graduate membership pricing
     */
    static calculateMembershipPrice(student_status: 'STUDENT' | 'GRADUATE'): {
        price: number;
        status: string;
    };
    /**
     * Calculate dependent membership price (40% discount on related member's price)
     */
    static calculateDependentMembershipPrice(memberData: {
        related_member_id: number;
    }): Promise<{
        is_dependent: boolean;
        related_member_price: number;
        discount_percentage: number;
        discount_amount: number;
        final_price: number;
    }>;
    /**
     * Create student/graduate membership
     */
    static createStudentMembership(memberData: {
        member_id: number;
        student_status: 'STUDENT' | 'GRADUATE';
    }): Promise<{
        membership: MemberMembership;
        pricing: {
            price: number;
            status: string;
        };
    }>;
    /**
     * Create student/graduate dependent member
     */
    static createStudentDependentMembership(memberData: {
        member_id: number;
        related_member_id: number;
        relationship_type: string;
        proof_document: string;
    }): Promise<{
        membership: MemberMembership;
        relationship: MemberRelationship;
        pricing: {
            is_dependent: boolean;
            related_member_price: number;
            discount_percentage: number;
            discount_amount: number;
            final_price: number;
        };
    }>;
    /**
     * Get student member complete status and details
     */
    static getStudentMemberStatus(member_id: number): Promise<{
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
}
//# sourceMappingURL=StudentMemberService.d.ts.map