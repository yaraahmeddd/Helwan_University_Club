"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemberTeamController = void 0;
const MemberTeamService_1 = require("../services/MemberTeamService");
class MemberTeamController {
    constructor() {
        /**
         * CREATE - Add a sport subscription for a member
         * POST /api/member-teams
         * Body: { member_id, team_id, start_date?, end_date?, price? }
         */
        this.addSubscription = async (req, res) => {
            try {
                const { member_id, team_id, start_date, end_date, price } = req.body;
                // Validate required fields
                if (!member_id || !team_id) {
                    res.status(400).json({
                        success: false,
                        error: 'member_id and team_id are required'
                    });
                    return;
                }
                const result = await this.service.addSportSubscription(Number(member_id), String(team_id), start_date ? new Date(start_date) : undefined, end_date ? new Date(end_date) : undefined, price ? Number(price) : 0);
                res.status(201).json({
                    success: true,
                    data: result,
                    message: 'Subscription added successfully'
                });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error('Error adding subscription:', error);
                res.status(400).json({
                    success: false,
                    error: errorMessage
                });
            }
        };
        /**
         * READ - Get all subscriptions for a member
         * GET /api/member-teams/member/:member_id
         */
        this.getMemberSubscriptions = async (req, res) => {
            try {
                const { member_id } = req.params;
                if (!member_id) {
                    res.status(400).json({
                        success: false,
                        error: 'member_id is required'
                    });
                    return;
                }
                const subscriptions = await this.service.getMemberSubscriptions(Number(member_id));
                res.status(200).json({
                    success: true,
                    data: subscriptions,
                    count: subscriptions.length
                });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error('Error fetching subscriptions:', error);
                res.status(500).json({
                    success: false,
                    error: errorMessage
                });
            }
        };
        /**
         * READ - Get a specific subscription
         * GET /api/member-teams/:subscription_id
         */
        this.getSubscriptionById = async (req, res) => {
            try {
                const { subscription_id } = req.params;
                if (!subscription_id) {
                    res.status(400).json({
                        success: false,
                        error: 'subscription_id is required'
                    });
                    return;
                }
                const subscription = await this.service.getSubscriptionById(Number(subscription_id));
                if (!subscription) {
                    res.status(404).json({
                        success: false,
                        error: 'Subscription not found'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: subscription
                });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error('Error fetching subscription:', error);
                res.status(500).json({
                    success: false,
                    error: errorMessage
                });
            }
        };
        /**
         * READ - Get all subscriptions
         * GET /api/member-teams?limit=100&offset=0
         */
        this.getAllSubscriptions = async (req, res) => {
            try {
                const limit = req.query.limit ? Number(req.query.limit) : 100;
                const offset = req.query.offset ? Number(req.query.offset) : 0;
                const { data, total } = await this.service.getAllSubscriptions(limit, offset);
                res.status(200).json({
                    success: true,
                    data,
                    pagination: {
                        limit,
                        offset,
                        total,
                        pages: Math.ceil(total / limit)
                    }
                });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error('Error fetching subscriptions:', error);
                res.status(500).json({
                    success: false,
                    error: errorMessage
                });
            }
        };
        /**
         * UPDATE - Update a subscription
         * PUT /api/member-teams/:subscription_id
         * Body: { start_date?, end_date?, status?, price? }
         */
        this.updateSubscription = async (req, res) => {
            try {
                const { subscription_id } = req.params;
                const { start_date, end_date, status, price } = req.body;
                if (!subscription_id) {
                    res.status(400).json({
                        success: false,
                        error: 'subscription_id is required'
                    });
                    return;
                }
                const result = await this.service.updateSubscription(Number(subscription_id), {
                    start_date: start_date ? new Date(start_date) : undefined,
                    end_date: end_date ? new Date(end_date) : undefined,
                    status,
                    price: price ? Number(price) : undefined
                });
                res.status(200).json({
                    success: true,
                    data: result,
                    message: 'Subscription updated successfully'
                });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error('Error updating subscription:', error);
                res.status(400).json({
                    success: false,
                    error: errorMessage
                });
            }
        };
        /**
         * DELETE - Deactivate a subscription
         * PUT /api/member-teams/:subscription_id/deactivate
         */
        this.deactivateSubscription = async (req, res) => {
            try {
                const { subscription_id } = req.params;
                if (!subscription_id) {
                    res.status(400).json({
                        success: false,
                        error: 'subscription_id is required'
                    });
                    return;
                }
                const result = await this.service.deactivateSubscription(Number(subscription_id));
                res.status(200).json({
                    success: true,
                    data: result,
                    message: 'Subscription deactivated successfully'
                });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error('Error deactivating subscription:', error);
                res.status(400).json({
                    success: false,
                    error: errorMessage
                });
            }
        };
        /**
         * DELETE - Permanently delete a subscription
         * DELETE /api/member-teams/:subscription_id
         */
        this.deleteSubscription = async (req, res) => {
            try {
                const { subscription_id } = req.params;
                if (!subscription_id) {
                    res.status(400).json({
                        success: false,
                        error: 'subscription_id is required'
                    });
                    return;
                }
                const deleted = await this.service.deleteSubscription(Number(subscription_id));
                if (!deleted) {
                    res.status(404).json({
                        success: false,
                        error: 'Subscription not found'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: 'Subscription deleted successfully'
                });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error('Error deleting subscription:', error);
                res.status(400).json({
                    success: false,
                    error: errorMessage
                });
            }
        };
        /**
         * GET - Get active subscriptions for a member
         * GET /api/member-teams/member/:member_id/active
         */
        this.getActiveSubscriptions = async (req, res) => {
            try {
                const { member_id } = req.params;
                if (!member_id) {
                    res.status(400).json({
                        success: false,
                        error: 'member_id is required'
                    });
                    return;
                }
                const subscriptions = await this.service.getActiveMemberSubscriptions(Number(member_id));
                res.status(200).json({
                    success: true,
                    data: subscriptions,
                    count: subscriptions.length
                });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error('Error fetching active subscriptions:', error);
                res.status(500).json({
                    success: false,
                    error: errorMessage
                });
            }
        };
        /**
         * GET - Get subscription count by status
         * GET /api/member-teams/stats/count-by-status
         */
        this.getCountByStatus = async (req, res) => {
            try {
                const counts = await this.service.getSubscriptionCountByStatus();
                res.status(200).json({
                    success: true,
                    data: counts
                });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error('Error fetching subscription counts:', error);
                res.status(500).json({
                    success: false,
                    error: errorMessage
                });
            }
        };
        /**
         * POST - Member chooses a sport (subscribe)
         * POST /api/member-teams/member/:member_id/choose-sport
         * Body: { team_id }
         */
        this.chooseSport = async (req, res) => {
            try {
                const { member_id } = req.params;
                const { team_id } = req.body;
                if (!member_id) {
                    res.status(400).json({
                        success: false,
                        error: 'member_id is required'
                    });
                    return;
                }
                if (!team_id) {
                    res.status(400).json({
                        success: false,
                        error: 'team_id is required'
                    });
                    return;
                }
                const result = await this.service.addSportSubscription(Number(member_id), String(team_id));
                res.status(201).json({
                    success: true,
                    data: result,
                    message: 'Sport selected successfully'
                });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error('Error choosing sport:', error);
                res.status(400).json({
                    success: false,
                    error: errorMessage
                });
            }
        };
        /**
         * DELETE - Member removes a sport (unsubscribe)
         * DELETE /api/member-teams/member/:member_id/remove-sport/:team_id
         */
        this.removeSport = async (req, res) => {
            try {
                const { member_id, team_id } = req.params;
                if (!member_id) {
                    res.status(400).json({
                        success: false,
                        error: 'member_id is required'
                    });
                    return;
                }
                if (!team_id) {
                    res.status(400).json({
                        success: false,
                        error: 'team_id is required'
                    });
                    return;
                }
                const deleted = await this.service.deleteMemberSportSubscription(Number(member_id), String(team_id));
                if (!deleted) {
                    res.status(404).json({
                        success: false,
                        error: 'Sport subscription not found'
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: 'Sport removed successfully'
                });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error('Error removing sport:', error);
                res.status(400).json({
                    success: false,
                    error: errorMessage
                });
            }
        };
        this.service = new MemberTeamService_1.MemberTeamService();
    }
}
exports.MemberTeamController = MemberTeamController;
//# sourceMappingURL=MemberTeamController.js.map