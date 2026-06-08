"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionRoutes = void 0;
const express_1 = require("express");
const SubscriptionController_1 = require("../controllers/SubscriptionController");
const auth_1 = require("../middleware/auth");
const authorizePrivilege_1 = require("../middleware/authorizePrivilege");
const router = (0, express_1.Router)();
const controller = new SubscriptionController_1.SubscriptionController();
/**
 * Team Subscription Routes
 * Handles subscriptions for both Members and Team Members joining teams
 */
// ==================== MEMBER SUBSCRIPTIONS ====================
/**
 * POST /api/subscriptions/members
 * Create a new member subscription to a team
 * Body: {
 *   member_id: number,
 *   team_id: number,
 *   monthly_fee: number,
 *   registration_fee?: number,
 *   start_date?: string (ISO date),
 *   end_date?: string (ISO date)
 * }
 */
router.post('/members', auth_1.authenticate, (req, res) => controller.createMemberSubscription(req, res));
/**
 * GET /api/subscriptions/members/:memberId
 * Get all subscriptions for a specific member
 * Query params: status? (pending, approved, active, declined, cancelled)
 */
router.get('/members/:memberId', auth_1.authenticate, (req, res) => controller.getMemberSubscriptions(req, res));
/**
 * GET /api/subscriptions/members/subscription/:subscriptionId
 * Get a specific member subscription by ID
 */
router.get('/members/subscription/:subscriptionId', auth_1.authenticate, (req, res) => controller.getMemberSubscriptionById(req, res));
/**
 * PATCH /api/subscriptions/members/:subscriptionId/approve
 * Approve a pending member subscription
 * Requires: APPROVE_TEAM_SUBSCRIPTION privilege
 * Body: {
 *   custom_price?: number,
 *   notes?: string
 * }
 */
router.patch('/members/:subscriptionId/approve', auth_1.authenticate, (0, authorizePrivilege_1.authorizePrivilege)('APPROVE_TEAM_SUBSCRIPTION'), (req, res) => controller.approveMemberSubscription(req, res));
/**
 * PATCH /api/subscriptions/members/:subscriptionId/decline
 * Decline a pending member subscription
 * Requires: APPROVE_TEAM_SUBSCRIPTION privilege
 * Body: {
 *   reason: string (required)
 * }
 */
router.patch('/members/:subscriptionId/decline', auth_1.authenticate, (0, authorizePrivilege_1.authorizePrivilege)('APPROVE_TEAM_SUBSCRIPTION'), (req, res) => controller.declineMemberSubscription(req, res));
/**
 * PATCH /api/subscriptions/members/:subscriptionId/cancel
 * Cancel an approved/active member subscription
 * Requires: MANAGE_TEAM_SUBSCRIPTION privilege
 * Body: {
 *   reason?: string
 * }
 */
router.patch('/members/:subscriptionId/cancel', auth_1.authenticate, (0, authorizePrivilege_1.authorizePrivilege)('MANAGE_TEAM_SUBSCRIPTION'), (req, res) => controller.cancelMemberSubscription(req, res));
/**
 * GET /api/subscriptions/members/pending/all
 * Get all pending member subscriptions for approval
 * Requires: APPROVE_TEAM_SUBSCRIPTION privilege
 */
router.get('/members/pending/all', auth_1.authenticate, (0, authorizePrivilege_1.authorizePrivilege)('APPROVE_TEAM_SUBSCRIPTION'), (req, res) => controller.getPendingMemberSubscriptions(req, res));
// ==================== TEAM MEMBER SUBSCRIPTIONS ====================
/**
 * POST /api/subscriptions/team-members
 * Create a new team member subscription to a team
 * Body: {
 *   team_member_id: number,
 *   team_id: number,
 *   monthly_fee: number,
 *   registration_fee?: number,
 *   start_date?: string (ISO date),
 *   end_date?: string (ISO date)
 * }
 */
router.post('/team-members', auth_1.authenticate, (req, res) => controller.createTeamMemberSubscription(req, res));
/**
 * GET /api/subscriptions/team-members/:teamMemberId
 * Get all subscriptions for a specific team member
 * Query params: status? (pending, approved, active, declined, cancelled)
 */
router.get('/team-members/:teamMemberId', auth_1.authenticate, (req, res) => controller.getTeamMemberSubscriptions(req, res));
/**
 * GET /api/subscriptions/team-members/subscription/:subscriptionId
 * Get a specific team member subscription by ID
 */
router.get('/team-members/subscription/:subscriptionId', auth_1.authenticate, (req, res) => controller.getTeamMemberSubscriptionById(req, res));
/**
 * PATCH /api/subscriptions/team-members/:subscriptionId/approve
 * Approve a pending team member subscription
 * Requires: APPROVE_TEAM_SUBSCRIPTION privilege
 * Body: {
 *   is_captain?: boolean,
 *   custom_price?: number,
 *   notes?: string
 * }
 */
router.patch('/team-members/:subscriptionId/approve', auth_1.authenticate, (0, authorizePrivilege_1.authorizePrivilege)('APPROVE_TEAM_SUBSCRIPTION'), (req, res) => controller.approveTeamMemberSubscription(req, res));
/**
 * PATCH /api/subscriptions/team-members/:subscriptionId/decline
 * Decline a pending team member subscription
 * Requires: APPROVE_TEAM_SUBSCRIPTION privilege
 * Body: {
 *   reason: string (required)
 * }
 */
router.patch('/team-members/:subscriptionId/decline', auth_1.authenticate, (0, authorizePrivilege_1.authorizePrivilege)('APPROVE_TEAM_SUBSCRIPTION'), (req, res) => controller.declineTeamMemberSubscription(req, res));
/**
 * PATCH /api/subscriptions/team-members/:subscriptionId/cancel
 * Cancel an approved/active team member subscription
 * Requires: MANAGE_TEAM_SUBSCRIPTION privilege
 * Body: {
 *   reason?: string
 * }
 */
router.patch('/team-members/:subscriptionId/cancel', auth_1.authenticate, (0, authorizePrivilege_1.authorizePrivilege)('MANAGE_TEAM_SUBSCRIPTION'), (req, res) => controller.cancelTeamMemberSubscription(req, res));
/**
 * GET /api/subscriptions/team-members/pending/all
 * Get all pending team member subscriptions for approval
 * Requires: APPROVE_TEAM_SUBSCRIPTION privilege
 */
router.get('/team-members/pending/all', auth_1.authenticate, (0, authorizePrivilege_1.authorizePrivilege)('APPROVE_TEAM_SUBSCRIPTION'), (req, res) => controller.getPendingTeamMemberSubscriptions(req, res));
/**
 * GET /api/subscriptions/stats
 * Get subscription statistics
 * Requires: APPROVE_TEAM_SUBSCRIPTION privilege
 * Returns: {
 *   members: { pending, approved, active, declined, cancelled },
 *   teamMembers: { pending, approved, active, declined, cancelled }
 * }
 */
router.get('/stats/summary', auth_1.authenticate, (0, authorizePrivilege_1.authorizePrivilege)('APPROVE_TEAM_SUBSCRIPTION'), (req, res) => controller.getSubscriptionStats(req, res));
exports.default = router;
exports.SubscriptionRoutes = router;
//# sourceMappingURL=SubscriptionRoutes.js.map