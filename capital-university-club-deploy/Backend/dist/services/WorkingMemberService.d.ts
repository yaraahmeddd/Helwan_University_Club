/**
 * Working Member Service
 * Handles registration for Egyptian working members (WORKING member type)
 * Includes salary-based membership pricing and dependent member support
 */
export declare class WorkingMemberService {
    private memberRepository;
    private employeeDetailRepository;
    private membershipRepository;
    private membershipPlanRepository;
    private professionRepository;
    private memberRelationshipRepository;
    private activityLogRepository;
    constructor();
    /**
     * Get list of professions for working members
     */
    getProfessions(): Promise<{
        id: number;
        code: string;
        name_en: string;
        name_ar: string;
    }[]>;
    /**
     * Calculate membership price based on salary and profession
     * Faculty Member: 20,000 EGP
     * Others:
     *   - Salary > 10,000: 10,000 EGP
     *   - Salary 8,000-10,000: 8,000 EGP
     *   - Salary 5,000-8,000: 5,000 EGP
     *   - Salary < 5,000: 2,000 EGP
     */
    calculateSalaryBasedPrice(professionCode: string, salary: number): {
        price: number;
        tier: string;
        description_en: string;
        description_ar: string;
    };
    /**
     * Get relationship types for dependents
     */
    getRelationshipTypes(): {
        code: string;
        label_en: string;
        label_ar: string;
    }[];
    /**
     * Submit working member detailed information
     */
    submitWorkingMemberDetails(memberData: {
        member_id: number;
        profession_id: number;
        department_en: string;
        department_ar: string;
        salary: number;
        salary_slip?: string;
        employment_start_date: Date;
        is_related_to_active_member: boolean;
        related_member_id?: number;
        relationship_type?: string;
        relationship_proof?: string;
        national_id_front?: string;
        national_id_back?: string;
        personal_photo?: string;
        medical_report?: string;
        address?: string;
    }): Promise<{
        success: boolean;
        message: string;
        employee_detail_id: any;
        is_related_to_active_member: boolean;
        relationship_info: {
            related_member_id: number | undefined;
            relationship_type: string | undefined;
            relationship_proof: string | undefined;
        } | null;
    }>;
    /**
     * Calculate membership pricing for working member
     * Includes dependent discount if related to active member
     */
    calculateMembershipPricing(memberData: {
        profession_id: number;
        salary: number;
        is_related_to_active_member: boolean;
        related_member_id?: number;
    }): Promise<{
        is_dependent: boolean;
        base_price: number;
        discount: number;
        final_price: number;
        price_tier: string;
        description_en: string;
        description_ar: string;
        currency: string;
        related_member_price?: undefined;
        selected_price?: undefined;
        discount_percentage?: undefined;
        discount_amount?: undefined;
        related_member_id?: undefined;
    } | {
        is_dependent: boolean;
        base_price: number;
        related_member_price: number;
        selected_price: number;
        discount_percentage: number;
        discount_amount: number;
        final_price: number;
        price_tier: string;
        description_en: string;
        description_ar: string;
        currency: string;
        related_member_id: number;
        discount?: undefined;
    }>;
    /**
     * Get active working members for dependent relationship
     */
    getActiveWorkingMembers(): Promise<{
        id: number;
        name_en: string;
        name_ar: string;
        status: string;
    }[]>;
    /**
     * Create membership for working member
     */
    createWorkingMembership(memberData: {
        member_id: number;
        profession_id: number;
        salary: number;
        is_related_to_active_member: boolean;
        related_member_id?: number;
    }): Promise<{
        success: boolean;
        message: string;
        membership_id: any;
        details: {
            start_date: string;
            end_date: string;
            price: number;
            is_dependent: boolean;
            discount_applied: string;
            currency: string;
        };
    }>;
    /**
     * Get working member status
     */
    getWorkingMemberStatus(memberId: number): Promise<{
        member_id: number;
        member_type: string;
        status: string;
        profession: string | undefined;
        department: string | undefined;
        salary: number | undefined;
        employment_start_date: string | null;
        is_dependent: boolean;
        dependent_of: number | undefined;
        dependent_relationship: string | undefined;
        membership_active: boolean;
        membership_details: {
            start_date: string;
            end_date: string;
            price: number;
            status: string;
        } | null;
        documents_uploaded: {
            national_id_front: boolean;
            national_id_back: boolean;
            personal_photo: boolean;
            medical_report: boolean;
            salary_slip: boolean;
        };
    }>;
}
declare const _default: WorkingMemberService;
export default _default;
//# sourceMappingURL=WorkingMemberService.d.ts.map