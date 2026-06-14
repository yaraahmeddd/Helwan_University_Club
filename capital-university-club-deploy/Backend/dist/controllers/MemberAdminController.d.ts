import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authorizePrivilege';
/**
 * MemberController - Handles all member management operations
 */
export declare class MemberController {
    private static memberRepo;
    private static accountRepo;
    private static staffRepo;
    private static universityStudentRepo;
    private static employeeDetailRepo;
    private static retiredEmployeeRepo;
    private static outsiderDetailRepo;
    private static loadMemberProfileDetails;
    private static logAction;
    /**
     * VIEW_MEMBERS - Get all members (paginated)
     * GET /api/members
     */
    static getAllMembers(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * VIEW_MEMBERS - Get specific member details
     * GET /api/members/:id
     */
    static getMemberById(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * VIEW_ALL_MEMBERS - Get all members and team members combined
     * GET /api/members/all-with-teams
     */
    static getAllMembersWithTeamMembers(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * CREATE_MEMBER - Create a new member account
     * POST /api/members
     */
    static createMember(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * UPDATE_MEMBER - Edit member information
     * PUT /api/members/:id
     */
    static updateMember(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * REVIEW_MEMBER - Review member information (for approval workflows)
     * GET /api/members/:id/review
     */
    static reviewMember(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * CHANGE_MEMBER_STATUS - Change member account status
     * PATCH /api/members/:id/status
     */
    static changeMemberStatus(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * MANAGE_MEMBER_BLOCK - Block or unblock member account
     * PATCH /api/members/:id/block
     */
    static manageMemberBlock(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * RESET_MEMBER_PASSWORD - Reset member password
     * POST /api/members/:id/reset-password
     */
    static resetMemberPassword(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * VIEW_MEMBER_HISTORY - View member activity history
     * GET /api/members/:id/history
     */
    static getMemberHistory(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * MANAGE_MEMBERSHIP_REQUEST - Manage membership requests
     * POST /api/members/:id/membership-request
     */
    static manageMembershipRequest(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * UPLOAD_MEMBER_DOCUMENT - Upload member documents
     * POST /api/members/:id/documents
     */
    static uploadMemberDocument(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * DELETE_MEMBER_DOCUMENT - Delete member documents
     * DELETE /api/members/:id/documents/:document_type
     */
    static deleteMemberDocument(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * PRINT_MEMBER_DOCUMENT - Print member documents (returns document data)
     * GET /api/members/:id/documents/:document_type/print
     */
    static printMemberDocument(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * PRINT_MEMBER_CARD - Print member identification card
     * GET /api/members/:id/card
     */
    static printMemberCard(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * POST /api/members/:id/sports
     * Assign sports to a member
     * Note: Currently stores in audit log - full member-sport relationship schema needed for persistence
     */
    static assignSportsToMember(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=MemberAdminController.d.ts.map