"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const RegistrationController_1 = __importDefault(require("../controllers/RegistrationController"));
const DetailedRegistrationController_1 = __importDefault(require("../controllers/DetailedRegistrationController"));
const ForeignerSeasonalController_1 = __importDefault(require("../controllers/ForeignerSeasonalController"));
const WorkingMemberController_1 = __importDefault(require("../controllers/WorkingMemberController"));
const RetiredMemberController_1 = require("../controllers/RetiredMemberController");
const DependentMemberController_1 = require("../controllers/DependentMemberController");
const StudentMemberController_1 = require("../controllers/StudentMemberController");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
// Get member type classification and form schema (legacy, by code)
router.get('/member-type-info', (req, res) => RegistrationController_1.default.getMemberTypeInfo(req, res));
// ── STEP 0a: Get all member types with classification ─────────────────────────
// GET /register/member-types
// Returns all member types from DB with Internal/External classification.
// Frontend uses this to show the member-type selection dropdown.
router.get('/member-types', (req, res) => RegistrationController_1.default.getMemberTypes(req, res));
// ── STEP 0b: Select member type AND role ──────────────────────────────────────
// POST /register/choose-member-type
// Body: { member_type_id: number, role: 'member' | 'team_member' }
// Returns: classification, form_schema_key, next_step hint
router.post('/choose-member-type', (req, res) => RegistrationController_1.default.chooseMemberType(req, res));
/**
 * Registration Routes
 * ==================
 *
 * Step 1: POST /register/basic
 *   - Register basic member info (email, password, name, gender, nationality)
 *   - Returns member_id to continue
 *
 * Step 2: Answer membership determination questions
 *   - GET /register/salary-brackets (for working members)
 *   - GET /register/dependent-tiers (for dependents)
 *
 * Step 3: POST /register/determine-membership
 *   - Submit answers to questions
 *   - System auto-determines membership type
 *
 * Step 4: POST /register/complete
 *   - Create membership subscription
 *   - Complete registration
 */
// ========================================
// COMPLETE MEMBER REGISTRATION ENDPOINTS
// Register in single request: account → member → member_details → membership
// ========================================
router.post('/register-working-member', (req, res) => RegistrationController_1.default.registerCompleteWorkingMember(req, res));
router.post('/register-retired-member', (req, res) => RegistrationController_1.default.registerCompleteRetiredMember(req, res));
router.post('/register-student-member', upload_1.upload.fields([
    { name: 'personal_photo', maxCount: 1 },
    { name: 'national_id_front', maxCount: 1 },
    { name: 'national_id_back', maxCount: 1 },
    { name: 'medical_report', maxCount: 1 },
    { name: 'student_proof', maxCount: 1 }
]), (req, res) => RegistrationController_1.default.registerCompleteStudentMember(req, res));
// Step 0: Choose Role
router.post('/choose-role', (req, res) => RegistrationController_1.default.chooseRole(req, res));
// Step 1: Basic Registration
router.post('/basic', (req, res) => RegistrationController_1.default.registerBasic(req, res));
// Step 2: Get reference data for questions
router.get('/salary-brackets', (req, res) => RegistrationController_1.default.getSalaryBrackets(req, res));
router.get('/dependent-tiers', (req, res) => RegistrationController_1.default.getDependentTiers(req, res));
// STEP 2: Detailed Information Collection
// Dropdowns and reference data
router.get('/branches', (req, res) => DetailedRegistrationController_1.default.getBranches(req, res));
router.get('/visitor-types', (req, res) => DetailedRegistrationController_1.default.getVisitorMembershipTypes(req, res));
router.get('/employment-statuses', (req, res) => DetailedRegistrationController_1.default.getEmploymentStatusOptions(req, res));
// Submit detailed information by membership type
router.post('/details/visitor', upload_1.upload.fields([
    { name: 'national_id_front', maxCount: 1 },
    { name: 'national_id_back', maxCount: 1 },
    { name: 'personal_photo', maxCount: 1 },
    { name: 'medical_report', maxCount: 1 },
    { name: 'passport_photo', maxCount: 1 }
]), (req, res) => DetailedRegistrationController_1.default.submitVisitorDetails(req, res));
router.post('/details/working', upload_1.upload.fields([
    { name: 'national_id_front', maxCount: 1 },
    { name: 'national_id_back', maxCount: 1 },
    { name: 'personal_photo', maxCount: 1 },
    { name: 'medical_report', maxCount: 1 },
    { name: 'salary_slip', maxCount: 1 }
]), (req, res) => DetailedRegistrationController_1.default.submitWorkingDetails(req, res));
router.post('/details/retired', upload_1.upload.fields([
    { name: 'national_id_front', maxCount: 1 },
    { name: 'national_id_back', maxCount: 1 },
    { name: 'personal_photo', maxCount: 1 },
    { name: 'medical_report', maxCount: 1 },
    { name: 'salary_slip', maxCount: 1 }
]), (req, res) => DetailedRegistrationController_1.default.submitRetiredDetails(req, res));
router.post('/details/student', upload_1.upload.fields([
    { name: 'national_id_front', maxCount: 1 },
    { name: 'national_id_back', maxCount: 1 },
    { name: 'personal_photo', maxCount: 1 },
    { name: 'medical_report', maxCount: 1 },
    { name: 'student_proof', maxCount: 1 }
]), (req, res) => DetailedRegistrationController_1.default.submitStudentDetails(req, res));
// Get member registration status
router.get('/status/:member_id', (req, res) => DetailedRegistrationController_1.default.getMemberStatus(req, res));
// STEP 2 FOREIGNER/SEASONAL: Detailed Information Collection
// Dropdowns and reference data
router.get('/seasonal/duration-options', (req, res) => ForeignerSeasonalController_1.default.getDurationOptions(req, res));
router.get('/seasonal/visa-statuses', (req, res) => ForeignerSeasonalController_1.default.getVisaStatusOptions(req, res));
router.get('/seasonal/payment-options', (req, res) => ForeignerSeasonalController_1.default.getPaymentOptions(req, res));
router.get('/seasonal/pricing/:duration_months', (req, res) => ForeignerSeasonalController_1.default.getPricingDetails(req, res));
// Submit detailed information for foreigner/seasonal member
router.post('/details/foreigner-seasonal', upload_1.upload.fields([
    { name: 'national_id_front', maxCount: 1 },
    { name: 'national_id_back', maxCount: 1 },
    { name: 'personal_photo', maxCount: 1 },
    { name: 'medical_report', maxCount: 1 },
    { name: 'passport_photo', maxCount: 1 }
]), (req, res) => ForeignerSeasonalController_1.default.submitForeignerSeasonalDetails(req, res));
// Submit detailed information for dependent member
router.post('/details/dependent', upload_1.upload.fields([
    { name: 'national_id_front', maxCount: 1 },
    { name: 'national_id_back', maxCount: 1 },
    { name: 'personal_photo', maxCount: 1 },
    { name: 'medical_report', maxCount: 1 },
    { name: 'relation_proof', maxCount: 1 }
]), (req, res) => DependentMemberController_1.DependentMemberController.submitDependentDetails(req, res));
// Create membership for foreigner/seasonal member
router.post('/seasonal/membership', (req, res) => ForeignerSeasonalController_1.default.createSeasonalMembership(req, res));
// Get foreigner/seasonal member status
router.get('/seasonal/status/:member_id', (req, res) => ForeignerSeasonalController_1.default.getForeignerStatus(req, res));
// STEP 2 WORKING MEMBERS: Detailed Information Collection
// Reference data endpoints
router.get('/professions', (req, res) => WorkingMemberController_1.default.getProfessions(req, res));
router.get('/relationship-types', (req, res) => WorkingMemberController_1.default.getRelationshipTypes(req, res));
router.get('/active-working-members', (req, res) => WorkingMemberController_1.default.getActiveWorkingMembers(req, res));
// Pricing calculation
router.post('/calculate-working-membership-price', (req, res) => WorkingMemberController_1.default.calculateMembershipPrice(req, res));
// Submit working member details
router.post('/details/working-member', (req, res) => WorkingMemberController_1.default.submitWorkingMemberDetails(req, res));
// Create working membership
router.post('/working-membership', (req, res) => WorkingMemberController_1.default.createWorkingMembership(req, res));
// Get working member status
router.get('/working-status/:member_id', (req, res) => WorkingMemberController_1.default.getWorkingMemberStatus(req, res));
// STEP 2 RETIRED MEMBERS: Detailed Information Collection
// Reference data endpoints
router.get('/retired/professions', (req, res) => RetiredMemberController_1.RetiredMemberController.getProfessions(req, res));
router.get('/retired/relationship-types', (req, res) => RetiredMemberController_1.RetiredMemberController.getRelationshipTypes(req, res));
router.get('/retired/active-working-members', (req, res) => RetiredMemberController_1.RetiredMemberController.getActiveWorkingMembers(req, res));
// Pricing calculation
router.post('/calculate-retired-membership-price', (req, res) => RetiredMemberController_1.RetiredMemberController.calculateMembershipPrice(req, res));
// Submit retired member details
router.post('/details/retired-member', (req, res) => RetiredMemberController_1.RetiredMemberController.submitRetiredMemberDetails(req, res));
// Create retired membership
router.post('/retired-membership', (req, res) => RetiredMemberController_1.RetiredMemberController.createRetiredMembership(req, res));
// Create relationship between retired and active member
router.post('/retired-relationship', (req, res) => RetiredMemberController_1.RetiredMemberController.createRetiredRelationship(req, res));
// Get retired member status
router.get('/retired-status/:member_id', (req, res) => RetiredMemberController_1.RetiredMemberController.getRetiredMemberStatus(req, res));
// STEP 2 DEPENDENT MEMBERS: Detailed Information Collection
// Reference data endpoints
router.get('/dependent/subtypes', (req, res) => DependentMemberController_1.DependentMemberController.getDependentSubtypes(req, res));
router.get('/dependent/relationship-types', (req, res) => DependentMemberController_1.DependentMemberController.getRelationshipTypes(req, res));
router.get('/dependent/active-working-members', (req, res) => DependentMemberController_1.DependentMemberController.getActiveWorkingMembers(req, res));
router.get('/dependent/active-visitor-members', (req, res) => DependentMemberController_1.DependentMemberController.getActiveVisitorMembers(req, res));
router.get('/dependent/active-members', (req, res) => DependentMemberController_1.DependentMemberController.getActiveMembers(req, res));
// Pricing calculation
router.post('/calculate-dependent-membership-price', (req, res) => DependentMemberController_1.DependentMemberController.calculateMembershipPrice(req, res));
// Create dependent membership
router.post('/dependent-membership', (req, res) => DependentMemberController_1.DependentMemberController.createDependentMembership(req, res));
// Get dependent member status
router.get('/dependent-status/:member_id', (req, res) => DependentMemberController_1.DependentMemberController.getDependentMemberStatus(req, res));
// STEP 2 STUDENT MEMBERS: Detailed Information Collection
// Reference data endpoints
router.get('/student/statuses', (req, res) => StudentMemberController_1.StudentMemberController.getStudentStatusOptions(req, res));
router.get('/student/relationship-types', (req, res) => StudentMemberController_1.StudentMemberController.getRelationshipTypes(req, res));
router.get('/student/active-members', (req, res) => StudentMemberController_1.StudentMemberController.getActiveMembers(req, res));
// Submit student details
router.post('/student-details', (req, res) => StudentMemberController_1.StudentMemberController.submitStudentMemberDetails(req, res));
// Pricing calculation
router.post('/calculate-student-membership-price', (req, res) => StudentMemberController_1.StudentMemberController.calculateMembershipPrice(req, res));
// Create student membership
router.post('/student-membership', (req, res) => StudentMemberController_1.StudentMemberController.createStudentMembership(req, res));
// Calculate dependent membership price
router.post('/calculate-student-dependent-price', (req, res) => StudentMemberController_1.StudentMemberController.calculateDependentMembershipPrice(req, res));
// Create student dependent membership
router.post('/student-dependent-membership', (req, res) => StudentMemberController_1.StudentMemberController.createStudentDependentMembership(req, res));
// Get student member status
router.get('/student-status/:member_id', (req, res) => StudentMemberController_1.StudentMemberController.getStudentMemberStatus(req, res));
// Step 3: Determine membership type based on answers
router.post('/determine-membership', (req, res) => RegistrationController_1.default.determineMembership(req, res));
// Step 4: Complete registration with membership
router.post('/complete', (req, res) => RegistrationController_1.default.completeRegistration(req, res));
exports.default = router;
//# sourceMappingURL=RegistrationRoutes.js.map