"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memberTeamRouter = void 0;
const express_1 = require("express");
const MemberTeamController_1 = require("../controllers/MemberTeamController");
const authorizePrivilege_1 = require("../middleware/authorizePrivilege");
exports.memberTeamRouter = (0, express_1.Router)();
const controller = new MemberTeamController_1.MemberTeamController();
/**
 * CREATE - Add a sport subscription
 * POST /api/member-teams
 * Required Privilege: ASSIGN_TEAM_MEMBERS
 */
exports.memberTeamRouter.post('/', (0, authorizePrivilege_1.authorizePrivilege)('ASSIGN_TEAM_MEMBERS'), controller.addSubscription);
/**
 * READ - Get all subscriptions
 * GET /api/member-teams
 * Required Privilege: VIEW_TEAM_MEMBERS
 */
exports.memberTeamRouter.get('/', (0, authorizePrivilege_1.authorizePrivilege)('VIEW_TEAM_MEMBERS'), controller.getAllSubscriptions);
/**
 * READ - Get stats (count by status)
 * GET /api/member-teams/stats/count-by-status
 * Required Privilege: VIEW_TEAM_MEMBERS
 */
exports.memberTeamRouter.get('/stats/count-by-status', (0, authorizePrivilege_1.authorizePrivilege)('VIEW_TEAM_MEMBERS'), controller.getCountByStatus);
/**
 * READ - Get subscriptions for a member
 * GET /api/member-teams/member/:member_id
 * Required Privilege: VIEW_TEAM_MEMBERS
 */
exports.memberTeamRouter.get('/member/:member_id', (0, authorizePrivilege_1.authorizePrivilege)('VIEW_TEAM_MEMBERS'), controller.getMemberSubscriptions);
/**
 * READ - Get active subscriptions for a member
 * GET /api/member-teams/member/:member_id/active
 * Required Privilege: VIEW_TEAM_MEMBERS
 */
exports.memberTeamRouter.get('/member/:member_id/active', (0, authorizePrivilege_1.authorizePrivilege)('VIEW_TEAM_MEMBERS'), controller.getActiveSubscriptions);
/**
 * READ - Get a specific subscription
 * GET /api/member-teams/:subscription_id
 * Required Privilege: VIEW_TEAM_MEMBERS
 */
exports.memberTeamRouter.get('/:subscription_id', (0, authorizePrivilege_1.authorizePrivilege)('VIEW_TEAM_MEMBERS'), controller.getSubscriptionById);
/**
 * UPDATE - Update a subscription
 * PUT /api/member-teams/:subscription_id
 * Required Privilege: ASSIGN_TEAM_MEMBERS
 */
exports.memberTeamRouter.put('/:subscription_id', (0, authorizePrivilege_1.authorizePrivilege)('ASSIGN_TEAM_MEMBERS'), controller.updateSubscription);
/**
 * DELETE - Deactivate a subscription
 * PUT /api/member-teams/:subscription_id/deactivate
 * Required Privilege: ASSIGN_TEAM_MEMBERS
 */
exports.memberTeamRouter.put('/:subscription_id/deactivate', (0, authorizePrivilege_1.authorizePrivilege)('ASSIGN_TEAM_MEMBERS'), controller.deactivateSubscription);
/**
 * DELETE - Delete a subscription
 * DELETE /api/member-teams/:subscription_id
 * Required Privilege: ASSIGN_TEAM_MEMBERS
 */
exports.memberTeamRouter.delete('/:subscription_id', (0, authorizePrivilege_1.authorizePrivilege)('ASSIGN_TEAM_MEMBERS'), controller.deleteSubscription);
/**
 * POST - Member chooses a sport
 * POST /api/member-teams/member/:member_id/choose-sport
 * Required Privilege: ASSIGN_TEAM_MEMBERS
 */
exports.memberTeamRouter.post('/member/:member_id/choose-sport', (0, authorizePrivilege_1.authorizePrivilege)('ASSIGN_TEAM_MEMBERS'), controller.chooseSport);
/**
 * DELETE - Member removes a sport
 * DELETE /api/member-teams/member/:member_id/remove-sport/:team_id
 * Required Privilege: ASSIGN_TEAM_MEMBERS
 */
exports.memberTeamRouter.delete('/member/:member_id/remove-sport/:team_id', (0, authorizePrivilege_1.authorizePrivilege)('ASSIGN_TEAM_MEMBERS'), controller.removeSport);
//# sourceMappingURL=MemberTeamRoutes.js.map