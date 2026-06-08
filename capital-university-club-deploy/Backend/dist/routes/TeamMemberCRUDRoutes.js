"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TeamMemberController_1 = require("../controllers/TeamMemberController");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
const controller = new TeamMemberController_1.TeamMemberController();
/**
 * Middleware to authorize users with view_team_members privilege or Admin or Staff
 */
const authorizeViewTeamMembers = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            console.error('AUTH FAILED: No user object');
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        console.log('AUTH CHECK for', req.path, {
            role: user.role,
            staff_id: user.staff_id,
            staff_type_id: user.staff_type_id,
            privileges: user.privileges
        });
        // Admin users have access
        if (user.role === 'admin' || user.staff_type_id === 1) {
            console.log('AUTH PASS: User is admin');
            next();
            return;
        }
        // Staff with any role can access
        if (user.staff_id) {
            console.log('AUTH PASS: User is staff member');
            next();
            return;
        }
        // Check for view_team_members privilege
        const privileges = user.privileges;
        let hasPrivilege = false;
        if (Array.isArray(privileges)) {
            // Handle string array
            if (privileges.some(p => typeof p === 'string' && p.toUpperCase() === 'VIEW_TEAM_MEMBERS')) {
                hasPrivilege = true;
            }
            // Handle object array with code property
            if (privileges.some(p => typeof p === 'object' &&
                p !== null &&
                p.code === 'VIEW_TEAM_MEMBERS')) {
                hasPrivilege = true;
            }
        }
        if (hasPrivilege) {
            console.log('AUTH PASS: User has VIEW_TEAM_MEMBERS privilege');
            next();
            return;
        }
        console.log('AUTH FAIL: No matching authorization');
        res.status(403).json({
            error: 'Access denied. Requires admin, staff, or VIEW_TEAM_MEMBERS privilege.',
            userRole: user.role,
            userStaffId: user.staff_id,
            userPrivileges: privileges
        });
    }
    catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
/**
 * CRUD Operations for Team Members
 */
/**
 * CREATE - Create a new team member with account and sports
 * POST /api/team-members
 * Body: {
 *   email: string,
 *   password: string,
 *   first_name_en: string,
 *   first_name_ar: string,
 *   last_name_en: string,
 *   last_name_ar: string,
 *   national_id: string,
 *   phone?: string,
 *   gender?: string,
 *   nationality?: string,
 *   birthdate?: string (YYYY-MM-DD),
 *   address?: string,
 *   is_foreign?: boolean,
 *   sport_ids: number[] (required, array of sport IDs)
 * }
 */
router.post('/', auth_1.authenticate, authorizeViewTeamMembers, upload_1.upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'national_id_front', maxCount: 1 },
    { name: 'national_id_back', maxCount: 1 },
    { name: 'medical_report', maxCount: 1 },
    { name: 'proof', maxCount: 1 }
]), controller.createTeamMember);
/**
 * READ - Get all team members
 * GET /api/team-members
 */
router.get('/', auth_1.authenticate, authorizeViewTeamMembers, controller.getAllTeamMembers);
/**
 * READ - Get all pending team members
 * GET /api/team-members/pending
 */
router.get('/pending', auth_1.authenticate, authorizeViewTeamMembers, controller.getPendingTeamMembers);
/**
 * APPROVE - Approve a pending team member
 * POST /api/team-members/:team_member_id/approve
 */
router.post('/:team_member_id/approve', auth_1.authenticate, authorizeViewTeamMembers, controller.approveTeamMember);
/**
 * READ - Get single team member by ID
 * GET /api/team-members/:team_member_id
 */
router.get('/:team_member_id', auth_1.authenticate, authorizeViewTeamMembers, controller.getTeamMember);
/**
 * ASSIGN SPORTS - Assign sports to a team member
 * POST /api/team-members/:team_member_id/sports
 * Body: { sportIds: number[] }
 */
router.post('/:team_member_id/sports', auth_1.authenticate, authorizeViewTeamMembers, controller.assignSportsToTeamMember);
/**
 * UPDATE - Update team member with sports
 * PUT /api/team-members/:team_member_id
 * Body: {
 *   first_name_en?: string,
 *   first_name_ar?: string,
 *   last_name_en?: string,
 *   last_name_ar?: string,
 *   phone?: string,
 *   gender?: string,
 *   nationality?: string,
 *   birthdate?: string (YYYY-MM-DD),
 *   address?: string,
 *   sport_ids?: number[] (array of sport IDs - replaces existing)
 * }
 */
router.put('/:team_member_id', auth_1.authenticate, authorizeViewTeamMembers, controller.updateTeamMember);
/**
 * DELETE (Soft) - Deactivate team member account
 * PUT /api/team-members/:team_member_id/deactivate
 * Deactivates the associated account without deleting data
 */
router.put('/:team_member_id/deactivate', auth_1.authenticate, authorizeViewTeamMembers, controller.deactivateTeamMember);
/**
 * DELETE (Hard) - Permanently delete team member
 * DELETE /api/team-members/:team_member_id
 * Permanently deletes team member and associated account
 */
router.delete('/:team_member_id', auth_1.authenticate, authorizeViewTeamMembers, controller.deleteTeamMember);
/**
 * GET - Get team member bookings
 * GET /api/team-members/:member_id/bookings
 */
router.get('/:member_id/bookings', auth_1.authenticate, controller.getTeamMemberBookings);
exports.default = router;
//# sourceMappingURL=TeamMemberCRUDRoutes.js.map