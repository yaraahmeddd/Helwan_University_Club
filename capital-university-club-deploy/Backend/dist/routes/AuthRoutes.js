"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = __importDefault(require("../controllers/AuthController"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * Authentication Routes
 * All routes are prefixed with /api/auth
 */
/**
 * POST /auth/login
 *
 * Two login methods:
 *
 * 1. For ADMIN and EXECUTIVE_MANAGER:
 *    - Body: { email, password }
 *    - Returns: JWT token with immediate access
 *
 * 2. For Regular Staff (first login):
 *    - Body: { national_id, password: national_id }
 *    - Returns: Temporary JWT token + requires_credential_change = true
 *    - Must call /auth/change-credentials next
 */
router.post('/login', (req, res) => AuthController_1.default.login(req, res));
/**
 * POST /auth/change-credentials
 *
 * For regular staff: Change email and password on first login
 *
 * Requires: Valid JWT token (from first login)
 * Body: { new_email, new_password }
 * Returns: New JWT token with active status
 */
router.post('/change-credentials', auth_1.authenticate, (req, res) => AuthController_1.default.changeCredentials(req, res));
/**
 * GET /auth/me
 *
 * Get current logged-in user's information
 *
 * Requires: Valid JWT token in Authorization header
 * Returns: Current user's profile data including account info, role, privileges
 */
router.get('/me', auth_1.authenticate, async (req, res) => {
    await AuthController_1.default.getCurrentUser(req, res);
});
/**
 * PUT /auth/me/profile
 *
 * Allows a logged-in member to update their own profile (no admin privilege required).
 *
 * Requires: Valid JWT token (role = 'member')
 * Body: { first_name_ar, last_name_ar, first_name_en, last_name_en, phone, address, birthdate }
 */
router.put('/me/profile', auth_1.authenticate, async (req, res) => {
    await AuthController_1.default.updateMyProfile(req, res);
});
exports.default = router;
//# sourceMappingURL=AuthRoutes.js.map