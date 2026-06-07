"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AttendanceController_1 = require("../controllers/AttendanceController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// POST /api/attendance - Record attendance
router.post('/', auth_1.authenticate, AttendanceController_1.AttendanceController.recordAttendance);
// PUT /api/attendance/:id - Update attendance record
router.put('/:id', auth_1.authenticate, AttendanceController_1.AttendanceController.updateAttendance);
// GET /api/members/:member_id/attendance - Get member attendance history
router.get('/members/:member_id/attendance', auth_1.authenticate, AttendanceController_1.AttendanceController.getMemberAttendance);
// GET /api/members/:member_id/teams/:team_id/absences - Get member team absences
router.get('/members/:member_id/teams/:team_id/absences', auth_1.authenticate, AttendanceController_1.AttendanceController.getMemberTeamAbsences);
// POST /api/members/:member_id/absence-alert - Send absence alert
router.post('/members/:member_id/absence-alert', auth_1.authenticate, AttendanceController_1.AttendanceController.sendAbsenceAlert);
// GET /api/teams/:team_id/attendance-report - Get team attendance report
router.get('/teams/:team_id/attendance-report', auth_1.authenticate, AttendanceController_1.AttendanceController.getTeamAttendanceReport);
// GET /api/attendance/team-member-stats/:teamMemberId - Get dashboard stats for team member
router.get('/team-member-stats/:teamMemberId', auth_1.authenticate, AttendanceController_1.AttendanceController.getTeamMemberStats);
// GET /api/attendance/member-stats/:memberId - Get dashboard stats for regular member
router.get('/member-stats/:memberId', auth_1.authenticate, AttendanceController_1.AttendanceController.getMemberStats);
exports.default = router;
//# sourceMappingURL=AttendanceRoutes.js.map