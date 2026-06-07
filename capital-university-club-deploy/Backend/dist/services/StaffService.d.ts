import { StaffType } from '../entities/StaffType';
import { Privilege } from '../entities/Privilege';
/**
 * Staff Management Service
 *
 * Handles staff registration, profile management, and privilege assignment
 * using the privilege package system with per-individual overrides.
 */
export declare class StaffService {
    private staffRepository;
    private staffTypeRepository;
    private privilegeRepository;
    private staffPackageRepository;
    private staffPrivilegeOverrideRepository;
    private accountRepository;
    constructor();
    /**
     * Get all staff types
     */
    getAllStaffTypes(): Promise<StaffType[]>;
    /**
     * Get all available privileges
     */
    getAllPrivileges(module?: string): Promise<Privilege[]>;
    /**
     * Get all available privilege packages
     */
    getAllPrivilegePackages(): Promise<any>;
    /**
     * Get privileges in a package
     */
    getPackagePrivileges(packageId: number): Promise<any>;
    /**
     * Register a new staff member
     *
     * Account status rules:
     * - If created by ADMIN (staff_type_id = 1) or EXECUTIVE_MANAGER (staff_type_id = 2): status = 'active'
     * - Otherwise: status = 'pending'
     */
    registerStaff(staffData: {
        first_name_en: string;
        first_name_ar: string;
        last_name_en: string;
        last_name_ar: string;
        national_id: string;
        email: string;
        password: string;
        phone: string;
        address: string;
        staff_type_id: number;
        employment_start_date: Date;
        employment_end_date?: Date;
        created_by_staff_type_id?: number;
        academic_certificate?: string;
        national_id_front?: string;
        national_id_back?: string;
        military_service_doc?: string;
        criminal_record?: string;
        employer_approval_letter?: string;
        employment_status_statement?: string;
        good_conduct_certificate?: string;
        personal_photo?: string;
        personal_info_form?: string;
        experience_certificates?: string;
    }): Promise<{
        success: boolean;
        message: string;
        staff_id: number;
        account_id: number;
        email: string;
    }>;
    /**
     * Assign privilege packages to a staff member
     */
    assignPackages(staffId: number, packageIds: number[], assignedById: number): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Grant an individual privilege to a staff member
     * Used for privileges not part of any assigned package
     */
    grantPrivilege(staffId: number, privilegeId: number, assignedById: number, reason?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Revoke a privilege from a staff member
     * Uses override system: adds staff_privileges_override with is_granted=false
     * This works for any privilege source (direct, package, or default)
     * Packages remain assigned - the override simply denies this specific privilege
     */
    revokePrivilege(staffId: number, privilegeId: number, assignedById: number, reason?: string): Promise<{
        success: boolean;
        message: string;
        source?: undefined;
        note?: undefined;
    } | {
        success: boolean;
        message: string;
        source: string;
        note: string;
    }>;
    /**
     * Get all effective privileges for a staff member
     * Combines package assignments and individual overrides
     */
    getStaffPrivileges(staffId: number): Promise<any>;
    /**
     * Check if a staff member has a specific privilege
     */
    hasPrivilege(staffId: number, privilegeCode: string): Promise<boolean>;
    /**
     * Get a staff member by ID
     */
    getStaffById(staffId: number): Promise<{
        id: number;
        first_name_en: string;
        first_name_ar: string;
        last_name_en: string;
        last_name_ar: string;
        national_id: string;
        email: string;
        phone: string;
        address: string;
        staff_type: {
            id: number;
            code: string;
            name_en: string;
            name_ar: string;
        };
        status: string;
        is_active: boolean;
        employment_start_date: Date;
        employment_end_date: Date | null;
        assigned_packages: {
            id: number;
            code: string;
            name_en: string;
            name_ar: string;
        }[];
        privileges: any;
    }>;
    /**
     * Get all staff members
     */
    getAllStaff(page?: number, limit?: number): Promise<{
        data: {
            id: number;
            first_name_en: string;
            first_name_ar: string;
            last_name_en: string;
            last_name_ar: string;
            phone: string;
            national_id: string;
            address: string;
            staff_type_id: number;
            staff_type: string;
            status: string;
            is_active: boolean;
            created_at: Date;
            employment_start_date: Date;
            employment_end_date: Date | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    /**
     * Update staff information
     */
    updateStaff(staffId: number, updateData: Partial<{
        first_name_en: string;
        first_name_ar: string;
        last_name_en: string;
        last_name_ar: string;
        phone: string;
        address: string;
        staff_type_id: number;
    }>): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Deactivate a staff member
     */
    deactivateStaff(staffId: number, deactivatedById: number): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Get activity logs for a staff member
     * Note: Since staff_activity_logs table doesn't exist, returning empty array
     */
    getStaffActivityLogs(_staffId: number, _limit?: number): Promise<never[]>;
    /**
     * Get final computed privileges for a staff member (detailed)
     *
     * Returns full privilege information including name, description, module
     * Useful for UI display and audit logs
     */
    getFinalPrivileges(staffId: number): Promise<Record<string, unknown>[]>;
    /**
     * Get final computed privilege codes for a staff member (optimized)
     *
     * Returns only privilege codes as a Set
     * Ideal for JWT token storage and quick authorization checks
     */
    getFinalPrivilegeCodes(staffId: number): Promise<Set<string>>;
    /**
     * Check if staff member has a specific privilege
     *
     * Uses dynamic calculation instead of raw SQL for consistency
     */
    staffHasPrivilege(staffId: number, privilegeCode: string): Promise<boolean>;
    /**
     * Check if staff member has ANY of the specified privileges
     *
     * @param staffId - Staff member ID
     * @param privilegeCodes - Array of privilege codes
     * @returns Array of privilege codes that the staff member has
     */
    staffHasAnyPrivilege(staffId: number, privilegeCodes: string[]): Promise<string[]>;
    /**
     * Check if staff member has ALL of the specified privileges
     *
     * @param staffId - Staff member ID
     * @param privilegeCodes - Array of privilege codes
     * @returns true if staff member has all privileges, false otherwise
     */
    staffHasAllPrivileges(staffId: number, privilegeCodes: string[]): Promise<boolean>;
    /**
     * Get privilege statistics for a staff member
     *
     * Returns detailed breakdown of privilege sources and counts
     */
    getPrivilegeStats(staffId: number): Promise<{
        total_privileges: number;
        privileges_from_packages: number;
        individually_granted: number;
        individually_revoked: number;
        modules: string[];
    }>;
    /**
     * Get detailed privilege breakdown for a staff member
     *
     * Returns:
     * - privileges from packages
     * - individually granted privileges
     * - individually revoked privileges
     * - final computed privileges
     */
    getPrivilegeBreakdown(staffId: number): Promise<{
        staff_id: number;
        assigned_packages: any;
        privileges_from_packages: any;
        individually_granted: any;
        individually_revoked: any;
        final_computed_privileges: {
            privilege_id: unknown;
            code: unknown;
            name_en: unknown;
            name_ar: unknown;
            module: unknown;
        }[];
        summary: {
            total_final_privileges: number;
            from_packages: any;
            individually_granted: any;
            individually_revoked: any;
            assigned_packages: any;
        };
    }>;
    /**
     * CREATE: Create a new privilege package
     */
    createPrivilegePackage(packageData: {
        code: string;
        name_en: string;
        name_ar: string;
        description_en?: string;
        description_ar?: string;
        privilege_ids: number[];
    }): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    /**
     * READ: Get privilege package by ID with full details
     */
    getPrivilegePackageById(packageId: number): Promise<{
        success: boolean;
        data: any;
    }>;
    /**
     * UPDATE: Update privilege package
     */
    updatePrivilegePackage(packageId: number, updateData: {
        code?: string;
        name_en?: string;
        name_ar?: string;
        description_en?: string;
        description_ar?: string;
        is_active?: boolean;
        privilege_ids?: number[];
    }): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    /**
     * DELETE: Delete privilege package
     */
    deletePrivilegePackage(packageId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Update privileges in a package (add/remove individual privileges)
     */
    updatePackagePrivileges(packageId: number, privilegeIds: number[]): Promise<{
        success: boolean;
        message: string;
        data: {
            package_id: number;
            privileges_count: number;
        };
    }>;
}
export default StaffService;
//# sourceMappingURL=StaffService.d.ts.map