import { Request, Response } from 'express';
/**
 * Staff Management Controller
 */
export declare class StaffController {
    private static logAction;
    /**
     * Emit privilege update to connected clients via WebSocket
     * Fetches the latest privilege codes and broadcasts them
     */
    private static emitPrivilegeUpdate;
    /**
     * GET /staff/types
     * Get all available staff types
     */
    static getStaffTypes(req: Request, res: Response): Promise<void>;
    /**
     * GET /staff/privileges
     * Get all available privileges (Admin and Executive Manager only)
     * Query params: module (optional) - filter by specific module
     *
     * Response formats:
     * - Without module param: All privileges grouped by module
     * - With module param: Privileges for specific module
     */
    static getPrivileges(req: Request, res: Response): Promise<void>;
    /**
     * GET /staff/packages
     * Get all available privilege packages
     */
    static getPrivilegePackages(req: Request, res: Response): Promise<void>;
    /**
     * POST /staff/packages
     * Create a new privilege package
     * Body: {
     *   code: string,
     *   name_en: string,
     *   name_ar: string,
     *   description_en?: string,
     *   description_ar?: string,
     *   privilege_ids: number[]
     * }
     */
    static createPrivilegePackage(req: Request, res: Response): Promise<void>;
    /**
     * GET /staff/packages/:packageId
     * Get privilege package by ID with full details
     */
    static getPrivilegePackageById(req: Request, res: Response): Promise<void>;
    /**
     * PUT /staff/packages/:packageId
     * Update privilege package
     * Body: {
     *   code?: string,
     *   name_en?: string,
     *   name_ar?: string,
     *   description_en?: string,
     *   description_ar?: string,
     *   is_active?: boolean,
     *   privilege_ids?: number[]
     * }
     */
    static updatePrivilegePackage(req: Request, res: Response): Promise<void>;
    /**
     * DELETE /staff/packages/:packageId
     * Delete privilege package
     */
    static deletePrivilegePackage(req: Request, res: Response): Promise<void>;
    /**
     * PUT /staff/packages/:packageId/privileges
     * Update privileges in a package
     * Body: {
     *   privilege_ids: number[]
     * }
     */
    static updatePackagePrivileges(req: Request, res: Response): Promise<void>;
    /**
     * GET /staff/packages/:packageId/privileges
     * Get all privileges in a specific package
     */
    static getPackagePrivileges(req: Request, res: Response): Promise<void>;
    /**
     * POST /staff/register
     * Register a new staff member
     *
     * Accepts multipart/form-data so document files can be uploaded in the same request.
     * All documents are optional — they can be uploaded later via PUT /staff/:id.
     *
     * File fields:
     *   academic_certificate       — Original/copy of academic qualification certificate
     *   national_id_front          — Front of valid national ID card
     *   national_id_back           — Back of valid national ID card
     *   military_service_doc       — Military service status (males)
     *   criminal_record            — Original criminal record (non-university employees)
     *   employer_approval_letter   — Employer approval letter
     *   employment_status_statement— Employment status statement (other-org employees)
     *   good_conduct_certificate   — Good conduct cert (non-other-org employees)
     *   personal_photo             — Recent personal photo
     *   personal_info_form         — Completed personal-information / acquaintance form
     *   experience_certificates    — Experience / training course certificates
     *
     * Authorization Rules:
     * - Only ADMIN (staff_type_id = 1) can register EXECUTIVE_MANAGER (staff_type_id = 2)
     * - ADMIN and EXECUTIVE_MANAGER can register other staff
     * - DEPUTY_EXEC_MANAGER can register staff but action requires approval
     */
    static registerStaff(req: Request, res: Response): Promise<void>;
    /**
     * GET /staff/:id
     * Get staff member details including assigned packages and privileges
     */
    static getStaffById(req: Request, res: Response): Promise<void>;
    /**
     * GET /staff
     * Get all staff members with pagination
     */
    static getAllStaff(req: Request, res: Response): Promise<void>;
    /**
     * PUT /staff/:id
     * Update staff member information
     */
    static updateStaff(req: Request, res: Response): Promise<void>;
    /**
     * POST /staff/:id/packages
     * Assign privilege packages to a staff member
     * Body: {
     *   package_ids: number[],
     *   assigned_by: number (staff ID of who's making the assignment)
     * }
     */
    static assignPackages(req: Request, res: Response): Promise<void>;
    /**
     * POST /staff/:id/privileges/grant
     * Grant individual privileges to a staff member
     * Body: {
     *   privilege_id: number,      // Single privilege ID
     *   reason?: string
     * }
     * OR for multiple:
     * Body: {
     *   privilege_ids: number[],   // Array of privilege IDs
     *   reason?: string
     * }
     */
    static grantPrivilege(req: Request, res: Response): Promise<void>;
    /**
     * POST /staff/:id/revoke-privilege
     * Revoke privileges from a staff member
     * Body: {
     *   privilege_id: number,      // Single privilege ID
     *   reason?: string
     * }
     * OR for multiple:
     * Body: {
     *   privilege_ids: number[],   // Array of privilege IDs
     *   reason?: string
     * }
     */
    static revokePrivilege(req: Request, res: Response): Promise<void>;
    /**
     * GET /staff/:id/privileges
     * Get all effective privileges for a staff member
     */
    static getStaffPrivileges(req: Request, res: Response): Promise<void>;
    /**
     * GET /staff/:id/has-privilege/:privilegeCode
     * Check if a staff member has a specific privilege
     */
    static checkPrivilege(req: Request, res: Response): Promise<void>;
    /**
     * POST /staff/:id/deactivate
     * Deactivate a staff member
     * Body: {
     *   deactivated_by: number (staff ID)
     * }
     */
    static deactivateStaff(req: Request, res: Response): Promise<void>;
    /**
     * GET /staff/:id/activity-logs
     * Get activity logs for a staff member
     */
    static getActivityLogs(req: Request, res: Response): Promise<void>;
    /**
     * GET /staff/:id/final-privileges
     * Get dynamically calculated final privileges for a staff member (detailed view)
     *
     * Combines:
     * - Privileges from all assigned packages
     * - Individual privilege grants
     * - Individual privilege revokes
     *
     * Returns full privilege details including name, description, module
     */
    static getFinalPrivileges(req: Request, res: Response): Promise<void>;
    /**
     * GET /staff/:id/privilege-codes
     * Get dynamically calculated final privilege codes for a staff member (optimized)
     *
     * Returns only privilege codes as an array
     * Ideal for lightweight authorization checks
     */
    static getFinalPrivilegeCodes(req: Request, res: Response): Promise<void>;
    /**
     * POST /staff/:id/check-privilege/:privilegeCode
     * Check if a staff member has a specific privilege
     *
     * Returns: { has_privilege: true/false }
     */
    static checkStaffPrivilege(req: Request, res: Response): Promise<void>;
    /**
     * POST /staff/:id/check-privileges/any
     * Check if a staff member has ANY of the specified privileges
     *
     * Body: {
     *   privilege_codes: string[]  // Array of privilege codes to check
     * }
     *
     * Returns: { found_privileges: string[], matching_count: number }
     */
    static checkStaffHasAnyPrivilege(req: Request, res: Response): Promise<void>;
    /**
     * POST /staff/:id/check-privileges/all
     * Check if a staff member has ALL of the specified privileges
     *
     * Body: {
     *   privilege_codes: string[]  // Array of privilege codes to check
     * }
     *
     * Returns: { has_all: true/false }
     */
    static checkStaffHasAllPrivileges(req: Request, res: Response): Promise<void>;
    /**
     * GET /staff/:id/privilege-stats
     * Get privilege statistics for a staff member
     *
     * Returns breakdown of:
     * - Total final privileges
     * - Privileges from packages
     * - Individually granted
     * - Individually revoked
     * - Modules covered
     */
    static getStaffPrivilegeStats(req: Request, res: Response): Promise<void>;
    /**
     * GET /staff/:id/privilege-breakdown
     * Get detailed privilege breakdown for a staff member
     *
     * Returns:
     * - Assigned packages with their privileges
     * - Individually granted privileges
     * - Individually revoked privileges
     * - Final computed privilege set
     * - Summary statistics
     */
    static getStaffPrivilegeBreakdown(req: Request, res: Response): Promise<void>;
}
export default StaffController;
//# sourceMappingURL=StaffController.d.ts.map