"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SportSubscriptionController_1 = require("../controllers/SportSubscriptionController");
const auth_1 = require("../middleware/auth");
const authorizePrivilege_1 = require("../middleware/authorizePrivilege");
const router = (0, express_1.Router)();
/**
 * Sport Subscription Management Routes (Admin Only)
 * All routes require authentication and APPROVE_SPORT_SUBSCRIPTION privilege
 */
/**
 * GET /api/sports/subscriptions/pending
 * Privilege: VIEW_SPORT_REQUESTS (or APPROVE_SPORT_SUBSCRIPTION)
 * Get all pending sport subscription requests with pagination
 * Query params: page=1, limit=20, team_member_id?, status=pending
 */
router.get('/subscriptions/pending', auth_1.authenticate, (0, authorizePrivilege_1.authorizePrivilege)('APPROVE_SPORT_SUBSCRIPTION'), (req, res) => SportSubscriptionController_1.SportSubscriptionController.getPendingSubscriptions(req, res));
/**
 * GET /api/sports/subscriptions/stats/summary
 * Privilege: APPROVE_SPORT_SUBSCRIPTION
 * Get summary statistics of all sport subscriptions
 * Returns: { pending: number, approved: number, declined: number, cancelled: number }
 */
router.get('/subscriptions/stats/summary', auth_1.authenticate, (0, authorizePrivilege_1.authorizePrivilege)('APPROVE_SPORT_SUBSCRIPTION'), (req, res) => SportSubscriptionController_1.SportSubscriptionController.getSubscriptionStats(req, res));
/**
 * GET /api/sports/subscriptions/:subscriptionId
 * Privilege: APPROVE_SPORT_SUBSCRIPTION
 * Get specific subscription request details
 */
router.get('/subscriptions/:subscriptionId', auth_1.authenticate, (0, authorizePrivilege_1.authorizePrivilege)('APPROVE_SPORT_SUBSCRIPTION'), (req, res) => SportSubscriptionController_1.SportSubscriptionController.getSubscriptionById(req, res));
/**
 * PATCH /api/sports/subscriptions/:subscriptionId/approve
 * Privilege: APPROVE_SPORT_SUBSCRIPTION
 * Approve a pending sport subscription request
 * Body: { notes?: string }
 */
router.patch('/subscriptions/:subscriptionId/approve', auth_1.authenticate, (0, authorizePrivilege_1.authorizePrivilege)('APPROVE_SPORT_SUBSCRIPTION'), (req, res) => SportSubscriptionController_1.SportSubscriptionController.approveSportSubscription(req, res));
/**
 * PATCH /api/sports/subscriptions/:subscriptionId/decline
 * Privilege: APPROVE_SPORT_SUBSCRIPTION
 * Decline a pending sport subscription request with required reason
 * Body: { reason: string (required) }
 */
router.patch('/subscriptions/:subscriptionId/decline', auth_1.authenticate, (0, authorizePrivilege_1.authorizePrivilege)('APPROVE_SPORT_SUBSCRIPTION'), (req, res) => SportSubscriptionController_1.SportSubscriptionController.declineSportSubscription(req, res));
/**
 * PATCH /api/sports/subscriptions/:subscriptionId/cancel
 * Privilege: APPROVE_SPORT_SUBSCRIPTION
 * Cancel an already approved sport subscription
 * Body: { reason?: string }
 */
router.patch('/subscriptions/:subscriptionId/cancel', auth_1.authenticate, (0, authorizePrivilege_1.authorizePrivilege)('APPROVE_SPORT_SUBSCRIPTION'), (req, res) => SportSubscriptionController_1.SportSubscriptionController.cancelSportSubscription(req, res));
exports.default = router;
//# sourceMappingURL=SportSubscriptionRoutes.js.map