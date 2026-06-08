export declare class RegistrationService {
    /**
     * Map member type code to classification (Internal/External)
     */
    static getMemberTypeClassification(memberTypeCode: string): 'Internal' | 'External' | 'Unknown';
    /**
     * Map member type code to form schema key (for frontend)
     * You can expand this mapping as needed
     */
    static getFormSchemaKey(memberTypeCode: string): string;
    /**
     * GET /register/member-types
     * Fetches all member types from DB and enriches with
     * classification (Internal/External) and form schema key.
     * This is Step 0 of the new registration flow.
     */
    static getMemberTypes(): Promise<{
        id: number;
        code: string;
        name_en: string;
        name_ar: string;
        classification: 'Internal' | 'External' | 'Unknown';
        form_schema_key: string;
    }[]>;
    static emailExists(email: string): Promise<boolean>;
    static nationalIdExists(national_id: string): Promise<boolean>;
    static memberExists(id: number): Promise<boolean>;
    static registerBasicInfo(data: {
        role: 'member' | 'team_member';
        email: string;
        password: string;
        first_name_en: string;
        first_name_ar: string;
        last_name_en: string;
        last_name_ar: string;
        phone?: string;
        gender?: string;
        nationality?: string;
        birthdate?: Date | null;
        national_id: string;
        membership_type_code?: string;
    }): Promise<{
        account_id: number;
        member_id: number;
        team_member_id: null;
        is_foreign: boolean;
        membership_type_code: string;
        role: string;
    } | {
        account_id: number;
        member_id: null;
        team_member_id: number;
        is_foreign: boolean;
        membership_type_code: string | undefined;
        role: string;
    }>;
    /**
     * Helper method to create initial membership for a new member
     * Maps membership_type_code to the appropriate membership plan
     */
    private static createMembershipForNewMember;
    /**
     * Map membership type code to membership plan code
     */
    private static getMembershipPlanForType;
    /**
     * Map membership type code to member_type_id
     * These IDs correspond to the member_types table in the database
     * Based on the INSERT statements in schema.sql:
     * 1=FOUNDER, 2=WORKING, 3=DEPENDENT, 4=VISITOR, 5=VISITOR_HONORARY,
     * 6=VISITOR_ATHLETIC, 7=VISITOR_BRANCH, 8=BRANCH, 9=SEASONAL, 10=ATHLETE,
     * 11=HONORARY, 12=FOREIGNER, 13=STUDENT, 14=GRADUATE
     */
    private static getMemberTypeIdForCode;
    static getSalaryBrackets(): Promise<{
        id: number;
        range: string;
    }[]>;
    static getDependentTiers(): Promise<{
        id: number;
        name: string;
    }[]>;
    static determineMembershipType(data: {
        member_id: number;
        is_foreign?: boolean;
        is_working?: boolean;
        is_retired?: boolean;
        is_student?: boolean;
        is_graduated?: boolean;
        has_relation?: boolean;
        relation_member_id?: number;
    }): Promise<{
        member_type_code: string;
        member_type_id: number;
        membership_plan_code: string;
    }>;
    static createMembership(data: {
        member_id: number;
        membership_plan_code: string;
        start_date?: Date;
    }): Promise<{
        id: number;
        member_id: number;
        status: string;
        payment_status: string;
        start_date: Date;
        end_date: Date;
    }>;
    /**
     * Complete Registration Flow for Working Members
     * Registers member in: accounts → members → employee_details → membership
     */
    static registerWorkingMember(data: {
        email: string;
        password: string;
        first_name_en: string;
        first_name_ar: string;
        last_name_en: string;
        last_name_ar: string;
        phone?: string;
        gender?: string;
        nationality?: string;
        birthdate?: Date;
        national_id: string;
        profession_id: number;
        department_en?: string;
        department_ar?: string;
        salary: number;
        salary_slip?: string;
        employment_start_date?: Date;
        membership_plan_id: number;
        branch_id?: number;
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            account_id: number;
            member_id: number;
            employee_detail_id: number;
            membership_id: number;
            member_type: string;
            status: string;
        };
    }>;
    /**
     * Complete Registration Flow for Retired Members
     */
    static registerRetiredMember(data: {
        email: string;
        password: string;
        first_name_en: string;
        first_name_ar: string;
        last_name_en: string;
        last_name_ar: string;
        phone?: string;
        gender?: string;
        nationality?: string;
        birthdate?: Date;
        national_id: string;
        profession_id: number;
        former_department_en?: string;
        former_department_ar?: string;
        retirement_date: Date;
        last_salary?: number;
        salary_slip?: string;
        membership_plan_id: number;
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            account_id: number;
            member_id: number;
            retired_detail_id: number;
            membership_id: number;
            member_type: string;
            status: string;
        };
    }>;
    /**
     * Complete Registration Flow for Student Members
     */
    static registerStudentMember(data: {
        email: string;
        password: string;
        first_name_en: string;
        first_name_ar: string;
        last_name_en: string;
        last_name_ar: string;
        phone?: string;
        gender?: string;
        nationality?: string;
        birthdate?: Date;
        national_id: string;
        faculty_id?: number;
        membership_plan_id: number;
        personal_photo?: string;
        national_id_front?: string;
        national_id_back?: string;
        medical_report?: string;
        student_proof?: string;
    }): Promise<{
        success: boolean;
        message: string;
        data: {
            account_id: number;
            member_id: number;
            student_detail_id: number;
            membership_id: number;
            member_type: string;
            status: string;
        };
    }>;
}
export default RegistrationService;
//# sourceMappingURL=RegistrationService.d.ts.map