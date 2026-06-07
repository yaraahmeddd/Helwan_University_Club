import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authorizePrivilege';
/**
 * SportSubscriptionController - Handles admin approval/rejection of sport subscriptions
 * Requires: APPROVE_SPORT_SUBSCRIPTION privilege
 */
export declare class SportSubscriptionController {
    private static teamMemberTeamRepo;
    private static teamMemberRepo;
    private static staffRepo;
    private static logAction;
    /**
     * GET /api/sports/subscriptions/pending
     * Privilege: VIEW_SPORT_REQUESTS
     * Get all pending sport subscription requests
     */
    static getPendingSubscriptions(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/sports/subscriptions/:subscriptionId
     * Privilege: VIEW_SPORT_REQUESTS
     * Get specific subscription request details
     */
    static getSubscriptionById(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * PATCH /api/sports/subscriptions/:subscriptionId/approve
     * Privilege: APPROVE_SPORT_SUBSCRIPTION
     * Approve a sport subscription request
     */
    static approveSportSubscription(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * PATCH /api/sports/subscriptions/:subscriptionId/decline
     * Privilege: APPROVE_SPORT_SUBSCRIPTION
     * Decline a sport subscription request with optional reason
     */
    static declineSportSubscription(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * PATCH /api/sports/subscriptions/:subscriptionId/cancel
     * Privilege: APPROVE_SPORT_SUBSCRIPTION
     * Cancel an already approved subscription
     */
    static cancelSportSubscription(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/sports/subscriptions/stats/summary
     * Privilege: VIEW_SPORT_REQUESTS
     * Get summary statistics for sport subscriptions
     */
    static getSubscriptionStats(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=SportSubscriptionController.d.ts.map