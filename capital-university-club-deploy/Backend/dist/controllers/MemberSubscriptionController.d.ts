import { Response, Request } from 'express';
import { AuthenticatedRequest } from '../middleware/authorizePrivilege';
/**
 * MemberSubscriptionController - Handles admin approval/rejection of member sport subscriptions
 * Requires: APPROVE_SPORT_SUBSCRIPTION privilege
 */
export declare class MemberSubscriptionController {
    private static memberTeamRepo;
    private static memberRepo;
    private static teamRepo;
    private static staffRepo;
    private static logAction;
    /**
     * GET /api/member-subscriptions/:memberId/subscriptions
     * Get all subscriptions for a specific member
     */
    static getMemberSubscriptions(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/member-subscriptions/pending
     * Privilege: APPROVE_SPORT_SUBSCRIPTION
     * Get all pending member sport subscription requests
     */
    static getPendingSubscriptions(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/member-subscriptions/:subscriptionId
     * Privilege: APPROVE_SPORT_SUBSCRIPTION
     * Get specific member subscription request details
     */
    static getSubscriptionById(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * PATCH /api/member-subscriptions/:subscriptionId/approve
     * Privilege: APPROVE_SPORT_SUBSCRIPTION
     * Approve a pending member sport subscription request
     */
    static approveSportSubscription(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * PATCH /api/member-subscriptions/:subscriptionId/decline
     * Privilege: APPROVE_SPORT_SUBSCRIPTION
     * Decline a pending member sport subscription request with optional reason
     */
    static declineSportSubscription(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * PATCH /api/member-subscriptions/:subscriptionId/cancel
     * Privilege: APPROVE_SPORT_SUBSCRIPTION
     * Cancel an already approved member sport subscription
     */
    static cancelSportSubscription(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/member-subscriptions/stats/summary
     * Privilege: APPROVE_SPORT_SUBSCRIPTION
     * Get summary statistics for member sport subscriptions
     */
    static getSubscriptionStats(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * POST /api/member-subscriptions/subscribe
     * Member can subscribe to a team
     * Body: { team_id: string, member_id: number }
     */
    static subscribeToTeam(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * POST /api/member-subscriptions/:subscriptionId/confirm-payment
     * Confirm member subscription after successful payment
     */
    static confirmPayment(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=MemberSubscriptionController.d.ts.map