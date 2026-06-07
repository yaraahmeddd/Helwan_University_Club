"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const MemberAdminController_1 = require("../controllers/MemberAdminController");
const MemberTypeController_1 = require("../controllers/MemberTypeController");
const MembershipPlanAdminController_1 = require("../controllers/MembershipPlanAdminController");
const authorizePrivilege_1 = require("../middleware/authorizePrivilege");
/**
 * Member Management Routes
 *
 * All routes are protected by privilege-based authorization middleware.
 * The middleware validates JWT tokens and checks for required privileges.
 *
 * Routes:
 * - Member Management (rows 33-45)
 * - Member Type Management (rows 57-61)
 * - Membership Plan Management (rows 50-56)
 */
const router = (0, express_1.Router)();
// ============================================================================
// MEMBER MANAGEMENT ROUTES (Privileges: VIEW_MEMBERS, CREATE_MEMBER, etc.)
// ============================================================================
/**
 * GET /api/members
 * Privilege: VIEW_MEMBERS
 * Description: Get all members (paginated)
 * Query params: page=1, limit=20, status?, member_type_id?
 */
router.get('/members', (0, authorizePrivilege_1.authorizePrivilege)('VIEW_MEMBERS'), (req, res) => MemberAdminController_1.MemberController.getAllMembers(req, res));
/**
 * GET /api/members/all-with-teams
 * Privilege: VIEW_MEMBERS
 * Description: Get all members and team members combined (paginated)
 * Query params: page=1, limit=20, status?, member_type_id?
 */
router.get('/members/all-with-teams', (0, authorizePrivilege_1.authorizePrivilege)('VIEW_MEMBERS'), (req, res) => MemberAdminController_1.MemberController.getAllMembersWithTeamMembers(req, res));
/**
 * GET /api/members/:id
 * Privilege: VIEW_MEMBERS
 * Description: Get specific member details
 */
router.get('/members/:id', (0, authorizePrivilege_1.authorizePrivilege)('VIEW_MEMBERS'), (req, res) => MemberAdminController_1.MemberController.getMemberById(req, res));
/**
 * POST /api/members
 * Privilege: CREATE_MEMBER
 * Description: Create a new member account
 */
router.post('/members', (0, authorizePrivilege_1.authorizePrivilege)('CREATE_MEMBER'), (req, res) => MemberAdminController_1.MemberController.createMember(req, res));
/**
 * PUT /api/members/:id
 * Privilege: UPDATE_MEMBER
 * Description: Edit member information
 */
router.put('/members/:id', (0, authorizePrivilege_1.authorizePrivilege)('UPDATE_MEMBER'), (req, res) => MemberAdminController_1.MemberController.updateMember(req, res));
/**
 * GET /api/members/:id/review
 * Privilege: REVIEW_MEMBER
 * Description: Review member information for approval
 */
router.get('/members/:id/review', (0, authorizePrivilege_1.authorizePrivilege)('REVIEW_MEMBER'), (req, res) => MemberAdminController_1.MemberController.reviewMember(req, res));
/**
 * PATCH /api/members/:id/status
 * Privilege: CHANGE_MEMBER_STATUS
 * Description: Change member account status (active, suspended, banned, expired, cancelled)
 */
router.patch('/members/:id/status', (0, authorizePrivilege_1.authorizePrivilege)('CHANGE_MEMBER_STATUS'), (req, res) => MemberAdminController_1.MemberController.changeMemberStatus(req, res));
/**
 * PATCH /api/members/:id/block
 * Privilege: MANAGE_MEMBER_BLOCK
 * Description: Block or unblock member account
 */
router.patch('/members/:id/block', (0, authorizePrivilege_1.authorizePrivilege)('MANAGE_MEMBER_BLOCK'), (req, res) => MemberAdminController_1.MemberController.manageMemberBlock(req, res));
/**
 * POST /api/members/:id/reset-password
 * Privilege: RESET_MEMBER_PASSWORD
 * Description: Reset member password
 */
router.post('/members/:id/reset-password', (0, authorizePrivilege_1.authorizePrivilege)('RESET_MEMBER_PASSWORD'), (req, res) => MemberAdminController_1.MemberController.resetMemberPassword(req, res));
/**
 * GET /api/members/:id/history
 * Privilege: VIEW_MEMBER_HISTORY
 * Description: View member activity history
 */
router.get('/members/:id/history', (0, authorizePrivilege_1.authorizePrivilege)('VIEW_MEMBER_HISTORY'), (req, res) => MemberAdminController_1.MemberController.getMemberHistory(req, res));
/**
 * POST /api/members/:id/membership-request
 * Privilege: MANAGE_MEMBERSHIP_REQUEST
 * Description: Manage membership requests (approve or reject)
 */
router.post('/members/:id/membership-request', (0, authorizePrivilege_1.authorizePrivilege)('MANAGE_MEMBERSHIP_REQUEST'), (req, res) => MemberAdminController_1.MemberController.manageMembershipRequest(req, res));
/**
 * POST /api/members/:id/documents
 * Privilege: UPLOAD_MEMBER_DOCUMENT
 * Description: Upload member documents
 */
router.post('/members/:id/documents', (0, authorizePrivilege_1.authorizePrivilege)('UPLOAD_MEMBER_DOCUMENT'), (req, res) => MemberAdminController_1.MemberController.uploadMemberDocument(req, res));
/**
 * DELETE /api/members/:id/documents/:document_type
 * Privilege: DELETE_MEMBER_DOCUMENT
 * Description: Delete member documents
 */
router.delete('/members/:id/documents/:document_type', (0, authorizePrivilege_1.authorizePrivilege)('DELETE_MEMBER_DOCUMENT'), (req, res) => MemberAdminController_1.MemberController.deleteMemberDocument(req, res));
/**
 * GET /api/members/:id/documents/:document_type/print
 * Privilege: PRINT_MEMBER_DOCUMENT
 * Description: Print member documents
 */
router.get('/members/:id/documents/:document_type/print', (0, authorizePrivilege_1.authorizePrivilege)('PRINT_MEMBER_DOCUMENT'), (req, res) => MemberAdminController_1.MemberController.printMemberDocument(req, res));
/**
 * GET /api/members/:id/card
 * Privilege: PRINT_MEMBER_CARD
 * Description: Print member identification card
 */
router.get('/members/:id/card', (0, authorizePrivilege_1.authorizePrivilege)('PRINT_MEMBER_CARD'), (req, res) => MemberAdminController_1.MemberController.printMemberCard(req, res));
// ============================================================================
// MEMBERSHIP PLAN ROUTES (Privileges: VIEW_MEMBERSHIP_PLANS, CREATE_MEMBERSHIP_PLAN, etc.)
// ============================================================================
/**
 * GET /api/membership-plans
 * Privilege: VIEW_MEMBERSHIP_PLANS
 * Description: Get all membership plans (paginated)
 * Query params: page=1, limit=20, member_type_id?
 */
router.get('/membership-plans', (0, authorizePrivilege_1.authorizePrivilege)('VIEW_MEMBERSHIP_PLANS'), (req, res) => MembershipPlanAdminController_1.MembershipPlanController.getAllPlans(req, res));
/**
 * GET /api/membership-plans/:id
 * Privilege: VIEW_MEMBERSHIP_PLANS
 * Description: Get specific membership plan details
 */
router.get('/membership-plans/:id', (0, authorizePrivilege_1.authorizePrivilege)('VIEW_MEMBERSHIP_PLANS'), (req, res) => MembershipPlanAdminController_1.MembershipPlanController.getPlanById(req, res));
/**
 * POST /api/membership-plans
 * Privilege: CREATE_MEMBERSHIP_PLAN
 * Description: Create a new membership plan
 */
router.post('/membership-plans', (0, authorizePrivilege_1.authorizePrivilege)('CREATE_MEMBERSHIP_PLAN'), (req, res) => MembershipPlanAdminController_1.MembershipPlanController.createPlan(req, res));
/**
 * PUT /api/membership-plans/:id
 * Privilege: UPDATE_MEMBERSHIP_PLAN
 * Description: Edit membership plan details
 */
router.put('/membership-plans/:id', (0, authorizePrivilege_1.authorizePrivilege)('UPDATE_MEMBERSHIP_PLAN'), (req, res) => MembershipPlanAdminController_1.MembershipPlanController.updatePlan(req, res));
/**
 * DELETE /api/membership-plans/:id
 * Privilege: DELETE_MEMBERSHIP_PLAN
 * Description: Delete membership plan
 */
router.delete('/membership-plans/:id', (0, authorizePrivilege_1.authorizePrivilege)('DELETE_MEMBERSHIP_PLAN'), (req, res) => MembershipPlanAdminController_1.MembershipPlanController.deletePlan(req, res));
/**
 * PATCH /api/membership-plans/:id/status
 * Privilege: CHANGE_MEMBERSHIP_PLAN_STATUS
 * Description: Change membership plan status (activate or deactivate)
 */
router.patch('/membership-plans/:id/status', (0, authorizePrivilege_1.authorizePrivilege)('CHANGE_MEMBERSHIP_PLAN_STATUS'), (req, res) => MembershipPlanAdminController_1.MembershipPlanController.changePlanStatus(req, res));
/**
 * POST /api/members/:member_id/membership-plan
 * Privilege: ASSIGN_MEMBERSHIP_PLAN_TO_MEMBER
 * Description: Assign a membership plan to a member
 */
router.post('/members/:member_id/membership-plan', (0, authorizePrivilege_1.authorizePrivilege)('ASSIGN_MEMBERSHIP_PLAN_TO_MEMBER'), (req, res) => MembershipPlanAdminController_1.MembershipPlanController.assignPlanToMember(req, res));
/**
 * PUT /api/members/:member_id/membership-plan
 * Privilege: CHANGE_MEMBER_MEMBERSHIP_PLAN
 * Description: Change member's current membership plan
 */
router.put('/members/:member_id/membership-plan', (0, authorizePrivilege_1.authorizePrivilege)('CHANGE_MEMBER_MEMBERSHIP_PLAN'), (req, res) => MembershipPlanAdminController_1.MembershipPlanController.changeMemberPlan(req, res));
// ============================================================================
// MEMBER TYPE ROUTES (Privileges: VIEW_MEMBER_TYPES, CREATE_MEMBER_TYPE, etc.)
// ============================================================================
/**
 * GET /api/member-types
 * Privilege: VIEW_MEMBER_TYPES
 * Description: Get all member types
 */
router.get('/member-types', (0, authorizePrivilege_1.authorizePrivilege)('VIEW_MEMBER_TYPES'), (req, res) => MemberTypeController_1.MemberTypeController.getAllMemberTypes(req, res));
/**
 * GET /api/member-types/:id
 * Privilege: VIEW_MEMBER_TYPES
 * Description: Get specific member type details
 */
router.get('/member-types/:id', (0, authorizePrivilege_1.authorizePrivilege)('VIEW_MEMBER_TYPES'), (req, res) => MemberTypeController_1.MemberTypeController.getMemberTypeById(req, res));
/**
 * POST /api/member-types
 * Privilege: CREATE_MEMBER_TYPE
 * Description: Create a new member type
 */
router.post('/member-types', (0, authorizePrivilege_1.authorizePrivilege)('CREATE_MEMBER_TYPE'), (req, res) => MemberTypeController_1.MemberTypeController.createMemberType(req, res));
/**
 * PUT /api/member-types/:id
 * Privilege: UPDATE_MEMBER_TYPE
 * Description: Edit member type details
 */
router.put('/member-types/:id', (0, authorizePrivilege_1.authorizePrivilege)('UPDATE_MEMBER_TYPE'), (req, res) => MemberTypeController_1.MemberTypeController.updateMemberType(req, res));
/**
 * DELETE /api/member-types/:id
 * Privilege: DELETE_MEMBER_TYPE
 * Description: Delete member type
 */
router.delete('/member-types/:id', (0, authorizePrivilege_1.authorizePrivilege)('DELETE_MEMBER_TYPE'), (req, res) => MemberTypeController_1.MemberTypeController.deleteMemberType(req, res));
/**
 * POST /api/members/:member_id/member-type
 * Privilege: ASSIGN_MEMBER_TYPE_TO_MEMBER
 * Description: Assign member type to a member
 */
router.post('/members/:member_id/member-type', (0, authorizePrivilege_1.authorizePrivilege)('ASSIGN_MEMBER_TYPE_TO_MEMBER'), (req, res) => MemberTypeController_1.MemberTypeController.assignMemberTypeToMember(req, res));
/**
 * POST /api/members/:id/sports
 * Privilege: VIEW_MEMBERS
 * Description: Assign sports to a member
 * Body: { sportIds: number[] }
 */
router.post('/members/:id/sports', (0, authorizePrivilege_1.authorizePrivilege)('VIEW_MEMBERS'), (req, res) => MemberAdminController_1.MemberController.assignSportsToMember(req, res));
exports.default = router;
//# sourceMappingURL=MemberAdminRoutes.js.map