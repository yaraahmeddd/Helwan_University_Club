import { Request, Response } from 'express';
export declare class MemberTeamController {
    private service;
    constructor();
    /**
     * CREATE - Add a sport subscription for a member
     * POST /api/member-teams
     * Body: { member_id, team_id, start_date?, end_date?, price? }
     */
    addSubscription: (req: Request, res: Response) => Promise<void>;
    /**
     * READ - Get all subscriptions for a member
     * GET /api/member-teams/member/:member_id
     */
    getMemberSubscriptions: (req: Request, res: Response) => Promise<void>;
    /**
     * READ - Get a specific subscription
     * GET /api/member-teams/:subscription_id
     */
    getSubscriptionById: (req: Request, res: Response) => Promise<void>;
    /**
     * READ - Get all subscriptions
     * GET /api/member-teams?limit=100&offset=0
     */
    getAllSubscriptions: (req: Request, res: Response) => Promise<void>;
    /**
     * UPDATE - Update a subscription
     * PUT /api/member-teams/:subscription_id
     * Body: { start_date?, end_date?, status?, price? }
     */
    updateSubscription: (req: Request, res: Response) => Promise<void>;
    /**
     * DELETE - Deactivate a subscription
     * PUT /api/member-teams/:subscription_id/deactivate
     */
    deactivateSubscription: (req: Request, res: Response) => Promise<void>;
    /**
     * DELETE - Permanently delete a subscription
     * DELETE /api/member-teams/:subscription_id
     */
    deleteSubscription: (req: Request, res: Response) => Promise<void>;
    /**
     * GET - Get active subscriptions for a member
     * GET /api/member-teams/member/:member_id/active
     */
    getActiveSubscriptions: (req: Request, res: Response) => Promise<void>;
    /**
     * GET - Get subscription count by status
     * GET /api/member-teams/stats/count-by-status
     */
    getCountByStatus: (req: Request, res: Response) => Promise<void>;
    /**
     * POST - Member chooses a sport (subscribe)
     * POST /api/member-teams/member/:member_id/choose-sport
     * Body: { team_id }
     */
    chooseSport: (req: Request, res: Response) => Promise<void>;
    /**
     * DELETE - Member removes a sport (unsubscribe)
     * DELETE /api/member-teams/member/:member_id/remove-sport/:team_id
     */
    removeSport: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=MemberTeamController.d.ts.map