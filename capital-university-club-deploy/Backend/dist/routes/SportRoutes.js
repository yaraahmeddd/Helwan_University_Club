"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SportController_1 = require("../controllers/SportController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * All sport routes require authentication
 * Role-specific permissions are handled within the controller/service
 */
// PUBLIC: Get active sports (no authentication required for member subscription page)
router.get('/public', SportController_1.SportController.getActiveSports);
// --- NEW TEAM MEMBER ROUTES (must be before :id routes to avoid conflict) ---
router.get('/team-members', auth_1.authenticate, SportController_1.SportController.getTeamMembers);
router.get('/team-members/sport/:sportName', auth_1.authenticate, SportController_1.SportController.getTeamMembersBySport);
router.get('/team-members/user/:memberId', auth_1.authenticate, SportController_1.SportController.getTeamMemberById);
// Create new sport
router.post('/', auth_1.authenticate, SportController_1.SportController.createSport);
// Get all sports with optional filters
router.get('/', auth_1.authenticate, SportController_1.SportController.getAllSports);
// Get sport by ID
router.get('/:id', auth_1.authenticate, SportController_1.SportController.getSportById);
// Update sport
router.put('/:id', auth_1.authenticate, SportController_1.SportController.updateSport);
// Approve or reject sport (Manager only)
router.post('/:id/approve', auth_1.authenticate, SportController_1.SportController.approveSport);
// Delete sport (Manager only)
router.delete('/:id', auth_1.authenticate, SportController_1.SportController.deleteSport);
// Toggle sport active status (Manager only)
router.patch('/:id/toggle-status', auth_1.authenticate, SportController_1.SportController.toggleSportStatus);
exports.default = router;
//# sourceMappingURL=SportRoutes.js.map