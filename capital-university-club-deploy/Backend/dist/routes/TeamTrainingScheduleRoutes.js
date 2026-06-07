"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TeamTrainingScheduleController_1 = require("../controllers/TeamTrainingScheduleController");
const authorizePrivilege_1 = require("../middleware/authorizePrivilege");
const router = (0, express_1.Router)();
const controller = new TeamTrainingScheduleController_1.TeamTrainingScheduleController();
/**
 * POST /teams/:teamId/schedules
 * Create training schedule for a team
 * Required Privilege: MANAGE_TEAM_TRAINING
 */
router.post('/teams/:teamId/schedules', (0, authorizePrivilege_1.authorizePrivilege)('MANAGE_TEAM_TRAINING'), (req, res) => controller.createSchedule(req, res));
/**
 * GET /teams/:teamId/schedules
 * Get all schedules for a team
 * Required Privilege: VIEW_TEAM_TRAINING
 */
router.get('/teams/:teamId/schedules', (0, authorizePrivilege_1.authorizePrivilege)('VIEW_TEAM_TRAINING'), (req, res) => controller.getTeamSchedules(req, res));
/**
 * GET /schedules/:scheduleId
 * Get specific schedule
 * Required Privilege: VIEW_TEAM_TRAINING
 */
router.get('/schedules/:scheduleId', (0, authorizePrivilege_1.authorizePrivilege)('VIEW_TEAM_TRAINING'), (req, res) => controller.getScheduleById(req, res));
/**
 * PUT /schedules/:scheduleId
 * Update schedule
 * Required Privilege: MANAGE_TEAM_TRAINING
 */
router.put('/schedules/:scheduleId', (0, authorizePrivilege_1.authorizePrivilege)('MANAGE_TEAM_TRAINING'), (req, res) => controller.updateSchedule(req, res));
/**
 * DELETE /schedules/:scheduleId
 * Delete schedule
 * Required Privilege: MANAGE_TEAM_TRAINING
 */
router.delete('/schedules/:scheduleId', (0, authorizePrivilege_1.authorizePrivilege)('MANAGE_TEAM_TRAINING'), (req, res) => controller.deleteSchedule(req, res));
/**
 * GET /sports/:sportId/schedules
 * Get all schedules for a sport
 * Required Privilege: VIEW_TEAM_TRAINING
 */
router.get('/sports/:sportId/schedules', (0, authorizePrivilege_1.authorizePrivilege)('VIEW_TEAM_TRAINING'), (req, res) => controller.getSportSchedules(req, res));
/**
 * GET /schedules/:scheduleId/availability
 * Check availability
 * Required Privilege: VIEW_TEAM_TRAINING
 */
router.get('/schedules/:scheduleId/availability', (0, authorizePrivilege_1.authorizePrivilege)('VIEW_TEAM_TRAINING'), (req, res) => controller.checkAvailability(req, res));
exports.default = router;
//# sourceMappingURL=TeamTrainingScheduleRoutes.js.map