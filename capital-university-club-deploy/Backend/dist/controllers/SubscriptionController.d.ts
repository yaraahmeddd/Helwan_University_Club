import { Request, Response } from 'express';
interface AuthenticatedRequest extends Request {
    user?: Record<string, unknown>;
}
/**
 * SubscriptionController
 * Handles team subscriptions for both Members and Team Members
 */
export declare class SubscriptionController {
    /**
     * POST /api/subscriptions/members
     * Create a new member subscription to a team
     */
    createMemberSubscription(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/subscriptions/members/:memberId
     * Get all subscriptions for a specific member
     */
    getMemberSubscriptions(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/subscriptions/members/subscription/:subscriptionId
     * Get a specific member subscription by ID
     */
    getMemberSubscriptionById(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * PATCH /api/subscriptions/members/:subscriptionId/approve
     * Approve a pending member subscription
     */
    approveMemberSubscription(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * PATCH /api/subscriptions/members/:subscriptionId/decline
     * Decline a pending member subscription
     */
    declineMemberSubscription(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * PATCH /api/subscriptions/members/:subscriptionId/cancel
     * Cancel an approved/active member subscription
     */
    cancelMemberSubscription(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/subscriptions/members/pending/all
     * Get all pending member subscriptions for approval
     */
    getPendingMemberSubscriptions(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * POST /api/subscriptions/team-members
     * Create a new team member subscription to a team
     */
    createTeamMemberSubscription(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/subscriptions/team-members/:teamMemberId
     * Get all subscriptions for a specific team member
     */
    getTeamMemberSubscriptions(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/subscriptions/team-members/subscription/:subscriptionId
     * Get a specific team member subscription by ID
     */
    getTeamMemberSubscriptionById(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * PATCH /api/subscriptions/team-members/:subscriptionId/approve
     * Approve a pending team member subscription
     */
    approveTeamMemberSubscription(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * PATCH /api/subscriptions/team-members/:subscriptionId/decline
     * Decline a pending team member subscription
     */
    declineTeamMemberSubscription(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * PATCH /api/subscriptions/team-members/:subscriptionId/cancel
     * Cancel an approved/active team member subscription
     */
    cancelTeamMemberSubscription(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/subscriptions/team-members/pending/all
     * Get all pending team member subscriptions for approval
     */
    getPendingTeamMemberSubscriptions(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /api/subscriptions/stats
     * Get subscription statistics
     */
    getSubscriptionStats(req: AuthenticatedRequest, res: Response): Promise<void>;
}
export {};
//# sourceMappingURL=SubscriptionController.d.ts.map