"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SportController_1 = require("../controllers/SportController");
const router = (0, express_1.Router)();
/**
 * Public Routes - No authentication required
 * These endpoints are accessible to all users, including unauthenticated ones
 */
// Get all active sports (for registration form)
router.get('/sports', SportController_1.SportController.getActiveSports);
exports.default = router;
//# sourceMappingURL=publicRoutes.js.map