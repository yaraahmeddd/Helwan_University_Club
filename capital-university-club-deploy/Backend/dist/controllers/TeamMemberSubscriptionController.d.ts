import { Request, Response } from 'express';
export declare class TeamMemberSubscriptionController {
    /**
     * @route   POST /api/team-members/:teamMemberId/subscriptions/teams/:teamId
     * @desc    Subscribe a team member to a team
     * @access  Staff only
     */
    static subscribeTeamMemberToTeam(req: Request, res: Response): Promise<void>;
    /**
     * @route   DELETE /api/team-members/:teamMemberId/subscriptions/:subscriptionId
     * @desc    Unsubscribe a team member from a team
     * @access  Staff only
     */
    static unsubscribeTeamMemberFromTeam(req: Request, res: Response): Promise<void>;
    /**
     * @route   PATCH /api/team-members/subscriptions/:subscriptionId/approve
     * @desc    Approve a pending team member subscription
     * @access  Staff only
     */
    static approveTeamMemberSubscription(req: Request, res: Response): Promise<void>;
    /**
     * @route   PATCH /api/team-members/subscriptions/:subscriptionId/reject
     * @desc    Reject a pending team member subscription
     * @access  Staff only
     */
    static rejectTeamMemberSubscription(req: Request, res: Response): Promise<void>;
    /**
     * @route   GET /api/team-members/:teamMemberId/subscriptions
     * @desc    Get all teams a team member is subscribed to
     * @access  Public
     */
    static getTeamMemberSubscriptions(req: Request, res: Response): Promise<void>;
    /**
     * @route   GET /api/teams/:teamId/members
     * @desc    Get all team members subscribed to a specific team
     * @access  Public
     */
    static getTeamMembers(req: Request, res: Response): Promise<void>;
    /**
     * @route   GET /api/team-members/:teamMemberId/subscriptions/teams/:teamId/check
     * @desc    Check if team member is subscribed to a team
     * @access  Public
     */
    static checkTeamMemberSubscription(req: Request, res: Response): Promise<void>;
    /**
     * @route   GET /api/teams/:teamId/pending-subscriptions
     * @desc    Get all pending subscriptions for a team
     * @access  Staff only
     */
    static getPendingSubscriptions(req: Request, res: Response): Promise<void>;
    /**
     * @route   GET /api/team-members/:teamMemberId/subscription-count
     * @desc    Get number of active teams a team member is subscribed to
     * @access  Public
     */
    static getTeamMemberSubscriptionCount(req: Request, res: Response): Promise<void>;
    /**
     * @route   POST /api/team-member-subscriptions/subscriptions/:subscriptionId/confirm-payment
     * @desc    Confirm payment for a team member subscription
     * @access  Authenticated team members (or staff)
     */
    static confirmTeamMemberSubscriptionPayment(req: Request, res: Response): Promise<void>;
    /**
     * @route   PATCH /api/team-member-subscriptions/subscriptions/:subscriptionId/cancel
     * @desc    Cancel a team member subscription draft or active subscription
     * @access  Authenticated team members (own draft) or staff
     */
    static cancelTeamMemberSubscription(req: Request, res: Response): Promise<void>;
    /**
     * @route   POST /api/team-members/subscribe
     * @desc    Team member can subscribe themselves to a team
     * @access  Authenticated team members
     */
    static teamMemberSelfSubscribe(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=TeamMemberSubscriptionController.d.ts.map