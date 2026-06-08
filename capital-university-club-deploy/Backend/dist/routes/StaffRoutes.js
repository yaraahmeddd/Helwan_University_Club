"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const StaffController_1 = __importDefault(require("../controllers/StaffController"));
const auth_1 = require("../middleware/auth");
const authorizePrivilege_1 = require("../middleware/authorizePrivilege");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
/**
 * Staff Management Routes
 * All routes are prefixed with /api/staff
 *
 * These routes support the privilege package system with per-individual overrides
 */
// Staff Types
router.get('/types', StaffController_1.default.getStaffTypes);
// Privilege Management - require VIEW_PRIVILEGES or MANAGE_PRIVILEGES
router.get('/privileges', (0, authorizePrivilege_1.authorizePrivilege)('VIEW_PRIVILEGES'), StaffController_1.default.getPrivileges);
// Privilege Packages (CRUD operations)
// GET operations require VIEW_PRIVILEGES, POST/PUT/DELETE require MANAGE_PRIVILEGES
router.get('/packages', (0, authorizePrivilege_1.authorizePrivilege)('VIEW_PRIVILEGES'), StaffController_1.default.getPrivilegePackages);
router.post('/packages', (0, authorizePrivilege_1.authorizePrivilege)('MANAGE_PRIVILEGES'), StaffController_1.default.createPrivilegePackage);
router.get('/packages/:packageId', (0, authorizePrivilege_1.authorizePrivilege)('VIEW_PRIVILEGES'), StaffController_1.default.getPrivilegePackageById);
router.put('/packages/:packageId', (0, authorizePrivilege_1.authorizePrivilege)('MANAGE_PRIVILEGES'), StaffController_1.default.updatePrivilegePackage);
router.delete('/packages/:packageId', (0, authorizePrivilege_1.authorizePrivilege)('MANAGE_PRIVILEGES'), StaffController_1.default.deletePrivilegePackage);
router.put('/packages/:packageId/privileges', (0, authorizePrivilege_1.authorizePrivilege)('MANAGE_PRIVILEGES'), StaffController_1.default.updatePackagePrivileges);
router.get('/packages/:packageId/privileges', (0, authorizePrivilege_1.authorizePrivilege)('VIEW_PRIVILEGES'), StaffController_1.default.getPackagePrivileges);
// Staff CRUD Operations
// IMPORTANT: Register endpoint requires authentication
// Only ADMIN can register EXECUTIVE_MANAGER
// Only ADMIN and EXECUTIVE_MANAGER can register other staff immediately
// DEPUTY_EXEC_MANAGER registrations require approval
router.post('/register', auth_1.authenticate, upload_1.upload.fields([
    { name: 'academic_certificate', maxCount: 1 },
    { name: 'national_id_front', maxCount: 1 },
    { name: 'national_id_back', maxCount: 1 },
    { name: 'military_service_doc', maxCount: 1 },
    { name: 'criminal_record', maxCount: 1 },
    { name: 'employer_approval_letter', maxCount: 1 },
    { name: 'employment_status_statement', maxCount: 1 },
    { name: 'good_conduct_certificate', maxCount: 1 },
    { name: 'personal_photo', maxCount: 1 },
    { name: 'personal_info_form', maxCount: 1 },
    { name: 'experience_certificates', maxCount: 1 },
]), StaffController_1.default.registerStaff);
router.get('/', StaffController_1.default.getAllStaff);
// Individual Privilege Grants/Revokes (more specific routes first)
router.get('/:id/privileges', auth_1.authenticate, StaffController_1.default.getStaffPrivileges);
router.get('/:id/final-privileges', auth_1.authenticate, StaffController_1.default.getFinalPrivileges);
router.get('/:id/privilege-codes', auth_1.authenticate, StaffController_1.default.getFinalPrivilegeCodes);
router.post('/:id/check-privilege/:privilegeCode', auth_1.authenticate, StaffController_1.default.checkStaffPrivilege);
router.post('/:id/check-privileges/any', auth_1.authenticate, StaffController_1.default.checkStaffHasAnyPrivilege);
router.post('/:id/check-privileges/all', auth_1.authenticate, StaffController_1.default.checkStaffHasAllPrivileges);
router.get('/:id/privilege-stats', auth_1.authenticate, StaffController_1.default.getStaffPrivilegeStats);
router.get('/:id/privilege-breakdown', auth_1.authenticate, StaffController_1.default.getStaffPrivilegeBreakdown);
router.post('/:id/grant-privilege', auth_1.authenticate, StaffController_1.default.grantPrivilege);
router.post('/:id/revoke-privilege', auth_1.authenticate, StaffController_1.default.revokePrivilege);
router.get('/:id/has-privilege/:privilegeCode', auth_1.authenticate, StaffController_1.default.checkPrivilege);
// Privilege Package Assignment
router.post('/:id/assign-packages', auth_1.authenticate, StaffController_1.default.assignPackages);
// Activity Logs
router.get('/:id/activity-logs', auth_1.authenticate, StaffController_1.default.getActivityLogs);
// Staff detail routes (less specific, at the end)
router.get('/:id', auth_1.authenticate, StaffController_1.default.getStaffById);
router.put('/:id', auth_1.authenticate, StaffController_1.default.updateStaff);
router.patch('/:id/deactivate', auth_1.authenticate, StaffController_1.default.deactivateStaff);
exports.default = router;
//# sourceMappingURL=StaffRoutes.js.map