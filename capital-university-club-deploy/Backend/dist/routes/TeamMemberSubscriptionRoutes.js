"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TeamMemberSubscriptionController_1 = require("../controllers/TeamMemberSubscriptionController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * Team Member Subscription Routes
 * Base path: /api/team-member-subscriptions
 */
/**
 * POST /api/team-member-subscriptions/subscribe
 * Team members can subscribe themselves to a team
 * Body: { team_id: string (UUID), team_member_id: number }
 */
router.post('/subscribe', auth_1.authenticate, TeamMemberSubscriptionController_1.TeamMemberSubscriptionController.teamMemberSelfSubscribe);
/**
 * POST /api/team-member-subscriptions/subscriptions/:subscriptionId/confirm-payment
 * Confirm payment for a team member subscription
 * Body: { payment_reference?: string, transaction_id?: string, payment_method?: string, gateway_response?: unknown }
 */
router.post('/subscriptions/:subscriptionId/confirm-payment', auth_1.authenticate, TeamMemberSubscriptionController_1.TeamMemberSubscriptionController.confirmTeamMemberSubscriptionPayment);
/**
 * PATCH /api/team-member-subscriptions/subscriptions/:subscriptionId/cancel
 * Cancel an unpaid subscription draft from the payment page
 */
router.patch('/subscriptions/:subscriptionId/cancel', auth_1.authenticate, TeamMemberSubscriptionController_1.TeamMemberSubscriptionController.cancelTeamMemberSubscription);
/**
 * POST /api/team-members/:teamMemberId/subscriptions/teams/:teamId
 * Staff subscribes a team member to a team
 * Access: Staff only
 */
router.post('/:teamMemberId/subscriptions/teams/:teamId', auth_1.authenticate, TeamMemberSubscriptionController_1.TeamMemberSubscriptionController.subscribeTeamMemberToTeam);
/**
 * DELETE /api/team-members/:teamMemberId/subscriptions/:subscriptionId
 * Unsubscribe a team member from a team
 * Access: Staff only
 */
router.delete('/:teamMemberId/subscriptions/:subscriptionId', auth_1.authenticate, TeamMemberSubscriptionController_1.TeamMemberSubscriptionController.unsubscribeTeamMemberFromTeam);
/**
 * PATCH /api/team-member-subscriptions/subscriptions/:subscriptionId/approve
 * Approve a pending team member subscription
 * Access: Staff only
 */
router.patch('/subscriptions/:subscriptionId/approve', auth_1.authenticate, TeamMemberSubscriptionController_1.TeamMemberSubscriptionController.approveTeamMemberSubscription);
/**
 * PATCH /api/team-member-subscriptions/subscriptions/:subscriptionId/reject
 * Reject a pending team member subscription
 * Access: Staff only
 */
router.patch('/subscriptions/:subscriptionId/reject', auth_1.authenticate, TeamMemberSubscriptionController_1.TeamMemberSubscriptionController.rejectTeamMemberSubscription);
/**
 * GET /api/team-members/:teamMemberId/subscriptions
 * Get all teams a team member is subscribed to
 * Access: Public
 */
router.get('/:teamMemberId/subscriptions', TeamMemberSubscriptionController_1.TeamMemberSubscriptionController.getTeamMemberSubscriptions);
/**
 * GET /api/team-member-subscriptions/teams/:teamId/members
 * Get all team members subscribed to a specific team
 * Access: Public
 */
router.get('/teams/:teamId/members', TeamMemberSubscriptionController_1.TeamMemberSubscriptionController.getTeamMembers);
/**
 * GET /api/team-members/:teamMemberId/subscriptions/teams/:teamId/check
 * Check if team member is subscribed to a team
 * Access: Public
 */
router.get('/:teamMemberId/subscriptions/teams/:teamId/check', TeamMemberSubscriptionController_1.TeamMemberSubscriptionController.checkTeamMemberSubscription);
/**
 * GET /api/team-member-subscriptions/teams/:teamId/pending-subscriptions
 * Get all pending subscriptions for a team
 * Access: Staff only
 */
router.get('/teams/:teamId/pending-subscriptions', auth_1.authenticate, TeamMemberSubscriptionController_1.TeamMemberSubscriptionController.getPendingSubscriptions);
/**
 * GET /api/team-members/:teamMemberId/subscription-count
 * Get number of active teams a team member is subscribed to
 * Access: Public
 */
router.get('/:teamMemberId/subscription-count', TeamMemberSubscriptionController_1.TeamMemberSubscriptionController.getTeamMemberSubscriptionCount);
exports.default = router;
//# sourceMappingURL=TeamMemberSubscriptionRoutes.js.map