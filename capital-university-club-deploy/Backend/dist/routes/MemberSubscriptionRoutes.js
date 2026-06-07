"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const MemberSubscriptionController_1 = require("../controllers/MemberSubscriptionController");
const auth_1 = require("../middleware/auth");
const authorizePrivilege_1 = require("../middleware/authorizePrivilege");
const router = (0, express_1.Router)();
/**
 * POST /api/member-subscriptions/:subscriptionId/confirm-payment
 * Confirm member subscription after successful payment
 */
router.post('/:subscriptionId/confirm-payment', auth_1.authenticate, (req, res) => MemberSubscriptionController_1.MemberSubscriptionController.confirmPayment(req, res));
/**
 * Member Sport Subscription Routes
 * All routes require authentication and APPROVE_SPORT_SUBSCRIPTION privilege (except subscribe)
 *
 * Base path: /api/member-subscriptions
 */
/**
 * POST /api/member-subscriptions/subscribe
 * Members can subscribe to a team
 * Body: { team_id: string, member_id: number }
 */
router.post('/subscribe', auth_1.authenticate, (req, res) => MemberSubscriptionController_1.MemberSubscriptionController.subscribeToTeam(req, res));
/**
 * GET /api/member-subscriptions/:memberId/subscriptions
 * Get all subscriptions for a specific member (public access for member's own data)
 */
router.get('/:memberId/subscriptions', (req, res) => MemberSubscriptionController_1.MemberSubscriptionController.getMemberSubscriptions(req, res));
/**
 * GET /api/member-subscriptions/pending
 * Privilege: APPROVE_SPORT_SUBSCRIPTION
 * Get all pending member sport subscription requests with pagination
 * Query params: page=1, limit=20, member_id?
 */
router.get('/pending', auth_1.authenticate, (0, authorizePrivilege_1.authorizePrivilege)('APPROVE_SPORT_SUBSCRIPTION'), (req, res) => MemberSubscriptionController_1.MemberSubscriptionController.getPendingSubscriptions(req, res));
/**
 * GET /api/member-subscriptions/stats/summary
 * Privilege: APPROVE_SPORT_SUBSCRIPTION
 * Get summary statistics of all member sport subscriptions
 * Returns: { pending: number, approved: number, declined: number, cancelled: number }
 */
router.get('/stats/summary', auth_1.authenticate, (0, authorizePrivilege_1.authorizePrivilege)('APPROVE_SPORT_SUBSCRIPTION'), (req, res) => MemberSubscriptionController_1.MemberSubscriptionController.getSubscriptionStats(req, res));
/**
 * GET /api/member-subscriptions/:subscriptionId
 * Privilege: APPROVE_SPORT_SUBSCRIPTION
 * Get specific member subscription request details
 */
router.get('/:subscriptionId', auth_1.authenticate, (0, authorizePrivilege_1.authorizePrivilege)('APPROVE_SPORT_SUBSCRIPTION'), (req, res) => MemberSubscriptionController_1.MemberSubscriptionController.getSubscriptionById(req, res));
/**
 * PATCH /api/member-subscriptions/:subscriptionId/approve
 * Privilege: APPROVE_SPORT_SUBSCRIPTION
 * Approve a pending member sport subscription request
 * Body: { notes?: string }
 */
router.patch('/:subscriptionId/approve', auth_1.authenticate, (0, authorizePrivilege_1.authorizePrivilege)('APPROVE_SPORT_SUBSCRIPTION'), (req, res) => MemberSubscriptionController_1.MemberSubscriptionController.approveSportSubscription(req, res));
/**
 * PATCH /api/member-subscriptions/:subscriptionId/decline
 * Privilege: APPROVE_SPORT_SUBSCRIPTION
 * Decline a pending member sport subscription request
 * Body: { reason: string (required) }
 */
router.patch('/:subscriptionId/decline', auth_1.authenticate, (0, authorizePrivilege_1.authorizePrivilege)('APPROVE_SPORT_SUBSCRIPTION'), (req, res) => MemberSubscriptionController_1.MemberSubscriptionController.declineSportSubscription(req, res));
/**
 * PATCH /api/member-subscriptions/:subscriptionId/cancel
 * Privilege: APPROVE_SPORT_SUBSCRIPTION
 * Cancel an approved member sport subscription
 * Body: { reason?: string }
 */
router.patch('/:subscriptionId/cancel', auth_1.authenticate, (req, res) => MemberSubscriptionController_1.MemberSubscriptionController.cancelSportSubscription(req, res));
exports.default = router;
//# sourceMappingURL=MemberSubscriptionRoutes.js.map