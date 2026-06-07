import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authorizePrivilege';
/**
 * MemberTypeController - Handles member type management
 *
 * All endpoints are protected by privilege-based authorization.
 *
 * Privileges required:
 * - VIEW_MEMBER_TYPES: View member types
 * - CREATE_MEMBER_TYPE: Create new member types
 * - UPDATE_MEMBER_TYPE: Edit member types
 * - DELETE_MEMBER_TYPE: Delete member types
 */
export declare class MemberTypeController {
    private static memberTypeRepo;
    /**
     * VIEW_MEMBER_TYPES - Get all member types
     * GET /api/member-types
     */
    static getAllMemberTypes(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * VIEW_MEMBER_TYPES - Get specific member type by ID
     * GET /api/member-types/:id
     */
    static getMemberTypeById(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * CREATE_MEMBER_TYPE - Create a new member type
     * POST /api/member-types
     */
    static createMemberType(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * UPDATE_MEMBER_TYPE - Edit member type details
     * PUT /api/member-types/:id
     */
    static updateMemberType(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * DELETE_MEMBER_TYPE - Delete member type
     * DELETE /api/member-types/:id
     */
    static deleteMemberType(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * ASSIGN_MEMBER_TYPE_TO_MEMBER - Assign member type to a member
     * POST /api/members/:member_id/member-type
     */
    static assignMemberTypeToMember(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=MemberTypeController.d.ts.map