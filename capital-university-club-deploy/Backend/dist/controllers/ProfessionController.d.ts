import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authorizePrivilege';
/**
 * ProfessionController - Handles profession management
 *
 * All endpoints are protected by privilege-based authorization.
 * The middleware authorizePrivilege() validates JWT token, extracts staff_id and privilege codes,
 * and verifies required privilege exists in token before allowing access.
 *
 * Privileges required:
 * - VIEW_PROFESSIONS (code: 67): View professions list and details
 * - CREATE_PROFESSION (code: 68): Create new professions
 * - UPDATE_PROFESSION (code: 69): Edit profession information
 * - DELETE_PROFESSION (code: 70): Delete professions
 * - ASSIGN_PROFESSION_TO_MEMBER (code: 71): Assign profession to members
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
export declare class ProfessionController {
    private static professionRepo;
    private static logAction;
    /**
     * VIEW_PROFESSIONS - Get all professions
     * GET /api/professions
     *
     * @requires VIEW_PROFESSIONS privilege
     * @returns Array of all professions sorted by most recent
     */
    static getAllProfessions(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * VIEW_PROFESSIONS - Get specific profession by ID
     * GET /api/professions/:id
     *
     * @requires VIEW_PROFESSIONS privilege
     * @param {number} id - Profession ID
     * @returns Profession object with all details
     */
    static getProfessionById(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * CREATE_PROFESSION - Create a new profession
     * POST /api/professions
     *
     * @requires CREATE_PROFESSION privilege
     * @body {string} code - Unique profession code (e.g., "DOC", "ENG", "LAW")
     * @body {string} name_en - Profession name in English
     * @body {string} name_ar - Profession name in Arabic
     * @returns Created profession object with ID and timestamps
     */
    static createProfession(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * UPDATE_PROFESSION - Edit profession information
     * PUT /api/professions/:id
     *
     * @requires UPDATE_PROFESSION privilege
     * @param {number} id - Profession ID to update
     * @body {string} [code] - New profession code (optional)
     * @body {string} [name_en] - New profession name in English (optional)
     * @body {string} [name_ar] - New profession name in Arabic (optional)
     * @returns Updated profession object
     */
    static updateProfession(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * DELETE_PROFESSION - Delete a profession
     * DELETE /api/professions/:id
     *
     * @requires DELETE_PROFESSION privilege
     * @param {number} id - Profession ID to delete
     * @returns Success message
     *
     * Note: Deletion may fail if profession has associated employee detail records
     */
    static deleteProfession(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * ASSIGN_PROFESSION_TO_MEMBER - Assign profession to a member
     * POST /api/professions/:professionId/assign-to-member/:memberId
     *
     * @requires ASSIGN_PROFESSION_TO_MEMBER privilege
     * @param {number} professionId - Profession ID to assign
     * @param {number} memberId - Member ID to assign profession to
     * @returns Success message
     *
     * This endpoint updates the profession assignment for a member in the EmployeeDetail table.
     * Only applicable for working members (EmployeeDetail records).
     */
    static assignProfessionToMember(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
export default ProfessionController;
//# sourceMappingURL=ProfessionController.d.ts.map