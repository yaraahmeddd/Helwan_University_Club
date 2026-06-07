"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TeamController_1 = require("../controllers/TeamController");
const authorizePrivilege_1 = require("../middleware/authorizePrivilege");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * All team routes require authentication and appropriate privileges
 * Privileges are enforced through authorizePrivilege middleware
 */
// ==================== MEMBER-FACING (visibility-filtered) ====================
/**
 * GET /api/teams/available/for-me
 * Returns teams visible to the currently logged-in Member or TeamMember.
 * Filtered by their member type:
 *   Internal types (working, student, graduate, retired, dependents) → INTERNAL + BOTH
 *   External types (foreigner, visitor, dependents)                  → EXTERNAL + BOTH
 * Query: sport_id? (optional filter)
 * NOTE: must be registered BEFORE /:id to avoid route collision
 */
router.get('/available/for-me', auth_1.authenticate, TeamController_1.TeamController.getAvailableTeamsForMe);
// ==================== TEAM MANAGEMENT ====================
/**
 * POST /api/teams
 * Create a new team
 * Required Privilege: CREATE_TEAM
 */
router.post('/', (0, authorizePrivilege_1.authorizePrivilege)('CREATE_TEAM'), TeamController_1.TeamController.createTeam);
/**
 * GET /api/teams
 * Get all teams with optional filters
 * Required Privilege: VIEW_TEAMS
 * Query: sport_id?, status?, branch_id?, visibility_type?
 */
router.get('/', (0, authorizePrivilege_1.authorizePrivilege)('VIEW_TEAMS'), TeamController_1.TeamController.getAllTeams);
/**
 * GET /api/teams/sport/:sport_id/with-members
 * Get all teams for a specific sport with their members
 * Required Privilege: VIEW_TEAMS
 * Returns teams with member count and full member details
 * Query: team_id? (optional - filter to specific team)
 */
router.get('/sport/:sport_id/with-members', (0, authorizePrivilege_1.authorizePrivilege)('VIEW_TEAMS'), TeamController_1.TeamController.getTeamsBySportWithMembers);
/**
 * GET /api/teams/:id
 * Get team by ID with full details
 * Required Privilege: VIEW_TEAMS
 */
router.get('/:id', (0, authorizePrivilege_1.authorizePrivilege)('VIEW_TEAMS'), TeamController_1.TeamController.getTeamById);
/**
 * PUT /api/teams/:id
 * Update team details
 * Required Privilege: UPDATE_TEAM
 */
router.put('/:id', (0, authorizePrivilege_1.authorizePrivilege)('UPDATE_TEAM'), TeamController_1.TeamController.updateTeam);
/**
 * DELETE /api/teams/:id
 * Delete a team
 * Required Privilege: DELETE_TEAM
 */
router.delete('/:id', (0, authorizePrivilege_1.authorizePrivilege)('DELETE_TEAM'), TeamController_1.TeamController.deleteTeam);
/**
 * PATCH /api/teams/:id/status
 * Update team status (active, inactive, suspended, archived)
 * Required Privilege: MANAGE_TEAM_STATUS
 */
router.patch('/:id/status', (0, authorizePrivilege_1.authorizePrivilege)('MANAGE_TEAM_STATUS'), TeamController_1.TeamController.updateTeamStatus);
/**
 * GET /api/teams/:id/members
 * Get all members in a team (both regular members and team members)
 * Required Privilege: VIEW_TEAM_MEMBERS
 */
router.get('/:id/members', (0, authorizePrivilege_1.authorizePrivilege)('VIEW_TEAM_MEMBERS'), TeamController_1.TeamController.getTeamMembers);
/**
 * GET /api/teams/:id/available-slots
 * Get available slots in a team
 * Required Privilege: VIEW_AVAILABLE_SLOTS
 */
router.get('/:id/available-slots', (0, authorizePrivilege_1.authorizePrivilege)('VIEW_AVAILABLE_SLOTS'), TeamController_1.TeamController.getAvailableSlots);
exports.default = router;
//# sourceMappingURL=TeamRoutes.js.map