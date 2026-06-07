import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authorizePrivilege';
/**
 * FacultyController - Handles faculty management
 *
 * All endpoints are protected by privilege-based authorization.
 * The middleware authorizePrivilege() validates JWT token, extracts staff_id and privilege codes,
 * and verifies required privilege exists in token before allowing access.
 *
 * Privileges required:
 * - VIEW_FACULTIES (code: 62): View faculties list and details
 * - CREATE_FACULTY (code: 63): Create new faculties
 * - UPDATE_FACULTY (code: 64): Edit faculty information
 * - DELETE_FACULTY (code: 65): Delete faculties
 * - ASSIGN_FACULTY_TO_MEMBER (code: 66): Assign faculty to members
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
export declare class FacultyController {
    private static facultyRepo;
    private static logAction;
    /**
     * VIEW_FACULTIES - Get all faculties
     * GET /api/faculties
     *
     * @requires VIEW_FACULTIES privilege
     * @returns Array of all faculties sorted by most recent
     */
    static getAllFaculties(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * VIEW_FACULTIES - Get specific faculty by ID
     * GET /api/faculties/:id
     *
     * @requires VIEW_FACULTIES privilege
     * @param {number} id - Faculty ID
     * @returns Faculty object with all details
     */
    static getFacultyById(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * CREATE_FACULTY - Create a new faculty
     * POST /api/faculties
     *
     * @requires CREATE_FACULTY privilege
     * @body {string} code - Unique faculty code (e.g., "ENG", "MED", "LAW")
     * @body {string} name_en - Faculty name in English
     * @body {string} name_ar - Faculty name in Arabic
     * @returns Created faculty object with ID and timestamps
     */
    static createFaculty(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * UPDATE_FACULTY - Edit faculty information
     * PUT /api/faculties/:id
     *
     * @requires UPDATE_FACULTY privilege
     * @param {number} id - Faculty ID to update
     * @body {string} [code] - New faculty code (optional)
     * @body {string} [name_en] - New faculty name in English (optional)
     * @body {string} [name_ar] - New faculty name in Arabic (optional)
     * @returns Updated faculty object
     */
    static updateFaculty(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * DELETE_FACULTY - Delete a faculty
     * DELETE /api/faculties/:id
     *
     * @requires DELETE_FACULTY privilege
     * @param {number} id - Faculty ID to delete
     * @returns Success message
     *
     * Note: Deletion may fail if faculty has associated student records
     */
    static deleteFaculty(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * ASSIGN_FACULTY_TO_MEMBER - Assign faculty to a member
     * POST /api/faculties/:facultyId/assign-to-member/:memberId
     *
     * @requires ASSIGN_FACULTY_TO_MEMBER privilege
     * @param {number} facultyId - Faculty ID to assign
     * @param {number} memberId - Member ID to assign faculty to
     * @returns Success message
     *
     * This endpoint updates the faculty assignment for a member in the UniversityStudentDetail table.
     * Only applicable for student members (UniversityStudentDetail records).
     */
    static assignFacultyToMember(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
export default FacultyController;
//# sourceMappingURL=FacultyController.d.ts.map