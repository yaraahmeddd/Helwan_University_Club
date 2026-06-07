import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authorizePrivilege';
/**
 * BranchController - Handles branch management
 *
 * All endpoints are protected by privilege-based authorization.
 * The middleware authorizePrivilege() validates JWT token, extracts staff_id and privilege codes,
 * and verifies required privilege exists in token before allowing access.
 *
 * Privileges required:
 * - VIEW_BRANCHES (code: 72): View branches list and details
 * - CREATE_BRANCH (code: 73): Create new branches
 * - UPDATE_BRANCH (code: 74): Edit branch information
 * - DELETE_BRANCH (code: 75): Delete branches
 * - ASSIGN_BRANCH_TO_MEMBER (code: 76): Assign branch to members
 *
 * Authorization Flow:
 * 1. Client sends request with JWT token in Authorization header
 * 2. authorizePrivilege middleware intercepts request
 * 3. Middleware extracts token and verifies JWT signature
 * 4. Extracts staff_id from decoded token
 * 5. Extracts privileges array from token (these are pre-calculated at login based on staff packages + overrides)
 * 6. Checks if required privilege exists in privileges array
 * 7. If missing, returns 403 Forbidden
 * 8. If present, attaches user data to req.user and calls controller
 */
export declare class BranchController {
    private static branchRepo;
    private static logAction;
    /**
     * VIEW_BRANCHES - Get all branches
     * GET /api/branches
     *
     * @requires VIEW_BRANCHES privilege
     * @returns Array of all branches sorted by most recent
     */
    static getAllBranches(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * VIEW_BRANCHES - Get specific branch by ID
     * GET /api/branches/:id
     *
     * @requires VIEW_BRANCHES privilege
     * @param {number} id - Branch ID
     * @returns Branch object with all details
     */
    static getBranchById(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * CREATE_BRANCH - Create a new branch
     * POST /api/branches
     *
     * @requires CREATE_BRANCH privilege
     * @body {string} code - Unique branch code (e.g., "MAIN", "CAIRO", "GIZA")
     * @body {string} name_en - Branch name in English
     * @body {string} name_ar - Branch name in Arabic
     * @body {string} [location_en] - Branch location in English (optional)
     * @body {string} [location_ar] - Branch location in Arabic (optional)
     * @body {string} [phone] - Branch phone number (optional)
     * @body {string} [status] - Branch status (optional, default: "active", values: "active", "inactive", "archived")
     * @returns Created branch object with ID and timestamps
     */
    static createBranch(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * UPDATE_BRANCH - Edit branch information
     * PUT /api/branches/:id
     *
     * @requires UPDATE_BRANCH privilege
     * @param {number} id - Branch ID to update
     * @body {string} [code] - New branch code (optional)
     * @body {string} [name_en] - New branch name in English (optional)
     * @body {string} [name_ar] - New branch name in Arabic (optional)
     * @body {string} [location_en] - New branch location in English (optional)
     * @body {string} [location_ar] - New branch location in Arabic (optional)
     * @body {string} [phone] - New branch phone (optional)
     * @body {string} [status] - New branch status (optional, values: "active", "inactive", "archived")
     * @returns Updated branch object
     */
    static updateBranch(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * DELETE_BRANCH - Delete a branch
     * DELETE /api/branches/:id
     *
     * @requires DELETE_BRANCH privilege
     * @param {number} id - Branch ID to delete
     * @returns Success message
     *
     * Note: Deletion may fail if branch has associated records
     */
    static deleteBranch(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * ASSIGN_BRANCH_TO_MEMBER - Assign branch to a member
     * POST /api/branches/:branchId/assign-to-member/:memberId
     *
     * @requires ASSIGN_BRANCH_TO_MEMBER privilege
     * @param {number} branchId - Branch ID to assign
     * @param {number} memberId - Member ID to assign branch to
     * @returns Success message
     *
     * This endpoint updates the branch assignment for a member.
     */
    static assignBranchToMember(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
export default BranchController;
//# sourceMappingURL=BranchController.d.ts.map