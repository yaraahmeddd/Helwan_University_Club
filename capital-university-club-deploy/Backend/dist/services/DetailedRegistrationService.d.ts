import { OutsiderDetail } from '../entities/OutsiderDetail';
import { Branch } from '../entities/Branch';
/**
 * Detailed Registration Service
 * Handles STEP 2: Collecting detailed information based on membership type
 */
export declare class DetailedRegistrationService {
    private memberRepository;
    private outsiderDetailRepository;
    private employeeDetailRepository;
    private retiredEmployeeDetailRepository;
    private universityStudentDetailRepository;
    private memberMembershipRepository;
    private branchRepository;
    private activityLogRepository;
    private facultyRepository;
    constructor();
    /**
     * Get all available branches (for visitor-branch selection)
     */
    getAllBranches(): Promise<Branch[]>;
    /**
     * Get visitor membership types (dropdown options)
     */
    getVisitorMembershipTypes(): ({
        code: string;
        label_en: string;
        label_ar: string;
        description_en: string;
        description_ar: string;
        requires_branch?: undefined;
    } | {
        code: string;
        label_en: string;
        label_ar: string;
        description_en: string;
        description_ar: string;
        requires_branch: boolean;
    })[];
    /**
     * STEP 2.1: Submit detailed info for Visitor/Outsider Members
     */
    submitVisitorDetailedInfo(memberData: {
        member_id: number;
        job_title_en?: string;
        job_title_ar?: string;
        employment_status?: string;
        visitor_type: string;
        branch_id?: number;
        national_id_front?: string;
        national_id_back?: string;
        personal_photo?: string;
        medical_report?: string;
        address?: string;
    }): Promise<{
        success: boolean;
        message: string;
        outsider_id: number | undefined;
    }>;
    /**
     * STEP 2.2: Submit detailed info for Working Members
     */
    submitWorkingMemberDetailedInfo(memberData: {
        member_id: number;
        profession_id: number;
        department_en: string;
        department_ar: string;
        salary: number;
        salary_slip?: string;
        employment_start_date: Date;
        national_id_front?: string;
        national_id_back?: string;
        personal_photo?: string;
        medical_report?: string;
        address?: string;
    }): Promise<{
        success: boolean;
        message: string;
        employee_detail_id: any;
    }>;
    /**
     * STEP 2.3: Submit detailed info for Retired Members
     */
    submitRetiredMemberDetailedInfo(memberData: {
        member_id: number;
        former_department_en: string;
        former_department_ar: string;
        retirement_date: Date;
        profession_id?: number;
        last_salary?: number;
        salary_slip?: string;
        national_id_front?: string;
        national_id_back?: string;
        personal_photo?: string;
        medical_report?: string;
        address?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * STEP 2.4: Submit detailed info for Student Members
     */
    submitStudentMemberDetailedInfo(memberData: {
        member_id: number;
        faculty_id: number;
        graduation_year?: number;
        enrollment_date?: Date;
        national_id_front?: string;
        national_id_back?: string;
        personal_photo?: string;
        medical_report?: string;
        student_proof?: string;
        address?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Get member status and membership info
     */
    getMemberRegistrationStatus(memberId: number): Promise<{
        member_id: number;
        member_type: string;
        member_type_name: string;
        status: string;
        membership_active: boolean;
        membership_plan: string | undefined;
        outsider_details: OutsiderDetail | null;
        documents_uploaded: {
            national_id_front: boolean;
            national_id_back: boolean;
            personal_photo: boolean;
            medical_report: boolean;
        };
    }>;
}
declare const _default: DetailedRegistrationService;
export default _default;
//# sourceMappingURL=DetailedRegistrationService.d.ts.map