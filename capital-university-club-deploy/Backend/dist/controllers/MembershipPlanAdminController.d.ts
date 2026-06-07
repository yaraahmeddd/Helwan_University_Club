import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authorizePrivilege';
/**
 * MembershipPlanController - Handles membership plan management
 *
 * All endpoints are protected by privilege-based authorization.
 *
 * Privileges required:
 * - VIEW_MEMBERSHIP_PLANS: View membership plans
 * - CREATE_MEMBERSHIP_PLAN: Create new membership plans
 * - UPDATE_MEMBERSHIP_PLAN: Edit membership plans
 * - DELETE_MEMBERSHIP_PLAN: Delete membership plans
 * - CHANGE_MEMBERSHIP_PLAN_STATUS: Change plan status
 * - ASSIGN_MEMBERSHIP_PLAN_TO_MEMBER: Assign plan to member
 * - CHANGE_MEMBER_MEMBERSHIP_PLAN: Change member's plan
 */
export declare class MembershipPlanController {
    private static planRepo;
    private static memberTypeRepo;
    /**
     * VIEW_MEMBERSHIP_PLANS - Get all membership plans (paginated)
     * GET /api/membership-plans
     */
    static getAllPlans(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * VIEW_MEMBERSHIP_PLANS - Get specific membership plan by ID
     * GET /api/membership-plans/:id
     */
    static getPlanById(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * CREATE_MEMBERSHIP_PLAN - Create a new membership plan
     * POST /api/membership-plans
     */
    static createPlan(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * UPDATE_MEMBERSHIP_PLAN - Edit membership plan details
     * PUT /api/membership-plans/:id
     */
    static updatePlan(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * DELETE_MEMBERSHIP_PLAN - Delete membership plan
     * DELETE /api/membership-plans/:id
     */
    static deletePlan(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * CHANGE_MEMBERSHIP_PLAN_STATUS - Activate or deactivate membership plan
     * PATCH /api/membership-plans/:id/status
     */
    static changePlanStatus(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * ASSIGN_MEMBERSHIP_PLAN_TO_MEMBER - Assign a membership plan to a member
     * POST /api/members/:member_id/membership-plan
     */
    static assignPlanToMember(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * CHANGE_MEMBER_MEMBERSHIP_PLAN - Change member's current membership plan
     * PUT /api/members/:member_id/membership-plan
     */
    static changeMemberPlan(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=MembershipPlanAdminController.d.ts.map