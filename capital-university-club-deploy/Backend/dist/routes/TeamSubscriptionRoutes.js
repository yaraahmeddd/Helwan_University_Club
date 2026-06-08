"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TeamSubscriptionController_1 = require("../controllers/TeamSubscriptionController");
const router = (0, express_1.Router)();
const controller = new TeamSubscriptionController_1.TeamSubscriptionController();
// Validation endpoint (optional - can be called before creating subscription)
router.post('/validate', (req, res) => controller.validateSubscription(req, res));
// Create subscription (validates automatically and creates pending_payment record)
router.post('/subscribe', (req, res) => controller.createSubscription(req, res));
// Confirm payment (webhook or manual confirmation)
router.post('/:subscriptionId/confirm-payment', (req, res) => controller.confirmPayment(req, res));
// Admin endpoints
router.get('/pending-approvals', (req, res) => controller.getPendingApprovals(req, res));
router.post('/:subscriptionId/approve', (req, res) => controller.approveSubscription(req, res));
exports.default = router;
//# sourceMappingURL=TeamSubscriptionRoutes.js.map