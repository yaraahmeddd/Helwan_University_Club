import { Router } from 'express';
import StaffController from '../controllers/StaffController';
import { authenticate } from '../middleware/auth';
import { authorizePrivilege } from '../middleware/authorizePrivilege';
import { upload } from '../middleware/upload';

const router = Router();

/**
 * Staff Management Routes
 * All routes are prefixed with /api/staff
 * 
 * These routes support the privilege package system with per-individual overrides
 */

// Staff Types
router.get('/types', StaffController.getStaffTypes);

// Privilege Management - require VIEW_PRIVILEGES or MANAGE_PRIVILEGES
router.get('/privileges', authorizePrivilege('VIEW_PRIVILEGES'), StaffController.getPrivileges);

// Privilege Packages (CRUD operations)
// GET operations require VIEW_PRIVILEGES, POST/PUT/DELETE require MANAGE_PRIVILEGES
router.get('/packages', authorizePrivilege('VIEW_PRIVILEGES'), StaffController.getPrivilegePackages);
router.post('/packages', authorizePrivilege('MANAGE_PRIVILEGES'), StaffController.createPrivilegePackage);
router.get('/packages/:packageId', authorizePrivilege('VIEW_PRIVILEGES'), StaffController.getPrivilegePackageById);
router.put('/packages/:packageId', authorizePrivilege('MANAGE_PRIVILEGES'), StaffController.updatePrivilegePackage);
router.delete('/packages/:packageId', authorizePrivilege('MANAGE_PRIVILEGES'), StaffController.deletePrivilegePackage);
router.put('/packages/:packageId/privileges', authorizePrivilege('MANAGE_PRIVILEGES'), StaffController.updatePackagePrivileges);
router.get('/packages/:packageId/privileges', authorizePrivilege('VIEW_PRIVILEGES'), StaffController.getPackagePrivileges);

// Staff CRUD Operations
// IMPORTANT: Register endpoint requires authentication
// Only ADMIN can register EXECUTIVE_MANAGER
// Only ADMIN and EXECUTIVE_MANAGER can register other staff immediately
// DEPUTY_EXEC_MANAGER registrations require approval
router.post(
  '/register',
  authenticate,
  upload.fields([
    { name: 'academic_certificate',        maxCount: 1 },
    { name: 'national_id_front',           maxCount: 1 },
    { name: 'national_id_back',            maxCount: 1 },
    { name: 'military_service_doc',        maxCount: 1 },
    { name: 'criminal_record',             maxCount: 1 },
    { name: 'employer_approval_letter',    maxCount: 1 },
    { name: 'employment_status_statement', maxCount: 1 },
    { name: 'good_conduct_certificate',    maxCount: 1 },
    { name: 'personal_photo',              maxCount: 1 },
    { name: 'personal_info_form',          maxCount: 1 },
    { name: 'experience_certificates',     maxCount: 1 },
  ]),
  StaffController.registerStaff
);
router.get('/', StaffController.getAllStaff);

// Individual Privilege Grants/Revokes (more specific routes first)
router.get('/:id/privileges', authenticate, StaffController.getStaffPrivileges);
router.get('/:id/final-privileges', authenticate, StaffController.getFinalPrivileges);
router.get('/:id/privilege-codes', authenticate, StaffController.getFinalPrivilegeCodes);
router.post('/:id/check-privilege/:privilegeCode', authenticate, StaffController.checkStaffPrivilege);
router.post('/:id/check-privileges/any', authenticate, StaffController.checkStaffHasAnyPrivilege);
router.post('/:id/check-privileges/all', authenticate, StaffController.checkStaffHasAllPrivileges);
router.get('/:id/privilege-stats', authenticate, StaffController.getStaffPrivilegeStats);
router.get('/:id/privilege-breakdown', authenticate, StaffController.getStaffPrivilegeBreakdown);
router.post('/:id/grant-privilege', authenticate, StaffController.grantPrivilege);
router.post('/:id/revoke-privilege', authenticate, StaffController.revokePrivilege);
router.get('/:id/has-privilege/:privilegeCode', authenticate, StaffController.checkPrivilege);

// Privilege Package Assignment
router.post('/:id/assign-packages', authenticate, StaffController.assignPackages);

// Activity Logs
router.get('/:id/activity-logs', authenticate, StaffController.getActivityLogs);

// Staff detail routes (less specific, at the end)
router.get('/:id', authenticate, StaffController.getStaffById);
router.put(
  '/:id',
  authenticate,
  upload.fields([
    { name: 'academic_certificate',        maxCount: 1 },
    { name: 'national_id_front',           maxCount: 1 },
    { name: 'national_id_back',            maxCount: 1 },
    { name: 'military_service_doc',        maxCount: 1 },
    { name: 'criminal_record',             maxCount: 1 },
    { name: 'employer_approval_letter',    maxCount: 1 },
    { name: 'employment_status_statement', maxCount: 1 },
    { name: 'good_conduct_certificate',    maxCount: 1 },
    { name: 'personal_photo',              maxCount: 1 },
    { name: 'personal_info_form',          maxCount: 1 },
    { name: 'experience_certificates',     maxCount: 1 },
  ]),
  StaffController.updateStaff
);
router.patch('/:id/deactivate', authenticate, StaffController.deactivateStaff);

export default router;
