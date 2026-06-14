"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationController = void 0;
const RegistrationService_1 = require("../services/RegistrationService");
const localFileStorage_1 = require("../utils/localFileStorage");
// Helper to get file from req.files (now returns buffer instead of path)
const getFile = (files, fieldname) => {
    if (!files)
        return undefined;
    if (Array.isArray(files))
        return undefined;
    const filesObj = files;
    if (filesObj[fieldname] && filesObj[fieldname].length > 0) {
        return filesObj[fieldname][0];
    }
    return undefined;
};
class RegistrationController {
    /**
     * GET /register/member-type-info?code=MEMBER_TYPE_CODE
     * Returns classification and form schema key for a given member type code
     */
    async getMemberTypeInfo(req, res) {
        try {
            const code = req.query.code;
            if (!code) {
                return res.status(400).json({ success: false, message: 'Missing member type code' });
            }
            const classification = RegistrationService_1.RegistrationService.getMemberTypeClassification(code);
            const formSchemaKey = RegistrationService_1.RegistrationService.getFormSchemaKey(code);
            return res.json({
                success: true,
                data: {
                    code,
                    classification,
                    formSchemaKey
                }
            });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Unknown error' });
        }
    }
    /**
     * GET /register/member-types
     * Step 0a: Returns all available member types from DB with their
     * classification (Internal/External) and the form schema key.
     * Frontend uses this to render the member-type picker.
     */
    async getMemberTypes(req, res) {
        try {
            const memberTypes = await RegistrationService_1.RegistrationService.getMemberTypes();
            return res.status(200).json({
                success: true,
                message: 'Member types retrieved successfully',
                data: memberTypes,
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * POST /register/choose-member-type
     * Step 0b: Client selects a member type ID and then chooses
     * "member" or "team_member". Returns the classification,
     * registration form key, and next steps.
     *
     * Body: { member_type_id: number, role: 'member' | 'team_member' }
     */
    async chooseMemberType(req, res) {
        try {
            const { member_type_id, role } = req.body;
            if (!member_type_id) {
                return res.status(400).json({ success: false, message: 'member_type_id is required' });
            }
            if (!role || (role !== 'member' && role !== 'team_member')) {
                return res.status(400).json({
                    success: false,
                    message: 'role is required and must be "member" or "team_member"',
                });
            }
            // Fetch the selected member type from DB
            const allTypes = await RegistrationService_1.RegistrationService.getMemberTypes();
            const selected = allTypes.find((t) => t.id === Number(member_type_id));
            if (!selected) {
                return res.status(404).json({ success: false, message: 'Member type not found' });
            }
            const classification = selected.classification;
            // Derive next_step hint based on classification + role
            let next_step;
            if (role === 'team_member') {
                next_step = 'basic_info_team_member';
            }
            else {
                switch (selected.code) {
                    case 'WORKING':
                        next_step = 'basic_info_working_member';
                        break;
                    case 'STUDENT':
                        next_step = 'basic_info_student_member';
                        break;
                    case 'GRADUATE':
                        next_step = 'basic_info_graduate_member';
                        break;
                    case 'FOREIGNER':
                        next_step = 'basic_info_foreigner_member';
                        break;
                    case 'VISITOR':
                        next_step = 'basic_info_visitor_member';
                        break;
                    default:
                        next_step = 'basic_info_member';
                }
            }
            return res.status(200).json({
                success: true,
                message: 'Member type selected successfully',
                data: {
                    member_type_id: selected.id,
                    member_type_code: selected.code,
                    member_type_name_en: selected.name_en,
                    member_type_name_ar: selected.name_ar,
                    classification,
                    role,
                    form_schema_key: selected.form_schema_key,
                    next_step,
                },
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * STEP 0: Choose Role
     * Route: POST /register/choose-role
     */
    async chooseRole(req, res) {
        try {
            const { role } = req.body;
            if (!role) {
                return res.status(400).json({
                    success: false,
                    message: 'Role is required',
                });
            }
            if (role !== 'member' && role !== 'team_member') {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid role. Allowed roles are: member, team_member',
                });
            }
            return res.status(200).json({
                success: true,
                message: 'Role accepted',
                data: {
                    role,
                    next_step: 'basic_info',
                },
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: errorMessage,
            });
        }
    }
    /**
     * STEP 1: Register basic information
     * Route: POST /register/basic
     */
    async registerBasic(req, res) {
        try {
            const { role, email, password, first_name_en, first_name_ar, last_name_en, last_name_ar, phone, gender, nationality, birthdate, national_id, membership_type_code, // NEW: Accept membership type code
             } = req.body;
            console.log('🔴 registerBasic received:', {
                role,
                email,
                membership_type_code,
                allKeys: Object.keys(req.body)
            });
            // 1. Validation
            if (!role || !email || !password || !first_name_en || !national_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields (role, email, password, first_name_en, national_id are mandatory)',
                });
            }
            if (role !== 'member' && role !== 'team_member') {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid role. Allowed roles are: member, team_member',
                });
            }
            // National ID Validation: 14 digits, not starting with 0
            if (!/^\d{14}$/.test(national_id)) {
                return res.status(400).json({
                    success: false,
                    message: 'National ID must be exactly 14 digits',
                });
            }
            if (national_id.startsWith('0')) {
                return res.status(400).json({
                    success: false,
                    message: 'National ID cannot start with 0',
                });
            }
            // Phone Validation (if provided)
            if (phone && !/^01[0125]\d{8}$/.test(phone)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid phone number format (Expected 11 digits starting with 010, 011, 012, or 015)',
                });
            }
            // 2. Check duplicates via Service
            if (await RegistrationService_1.RegistrationService.emailExists(email)) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already registered',
                });
            }
            if (await RegistrationService_1.RegistrationService.nationalIdExists(national_id)) {
                return res.status(409).json({
                    success: false,
                    message: 'National ID already registered',
                });
            }
            // 3. Call Service logic
            const result = await RegistrationService_1.RegistrationService.registerBasicInfo({
                role,
                email,
                password,
                first_name_en,
                first_name_ar: first_name_ar || first_name_en,
                last_name_en,
                last_name_ar: last_name_ar || last_name_en,
                phone,
                gender,
                nationality,
                birthdate: new Date(birthdate),
                national_id,
                membership_type_code: membership_type_code || 'VISITOR', // Default to VISITOR, not REGULAR
            });
            // 4. Return Success Response
            return res.status(201).json({
                success: true,
                message: 'Basic registration completed. Continue with next steps.',
                data: {
                    account_id: result.account_id,
                    member_id: result.member_id,
                    team_member_id: result.team_member_id,
                    role: result.role,
                    is_foreign: result.is_foreign,
                    membership_type_code: result.membership_type_code,
                    next_step: result.role === 'member'
                        ? (result.is_foreign ? 'foreigner_details' : 'employment_question')
                        : 'team_member_files',
                },
            });
        }
        catch (error) {
            console.error('Registration Error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return res.status(500).json({
                success: false,
                message: 'Internal server error during registration',
                error: errorMessage,
            });
        }
    }
    /**
     * STEP 2: Get salary brackets
     * Route: GET /register/salary-brackets
     */
    async getSalaryBrackets(req, res) {
        try {
            const brackets = await RegistrationService_1.RegistrationService.getSalaryBrackets();
            return res.status(200).json({
                success: true,
                data: brackets,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return res.status(500).json({
                success: false,
                message: errorMessage,
            });
        }
    }
    /**
     * STEP 2: Get dependent tiers
     * Route: GET /register/dependent-tiers
     */
    async getDependentTiers(req, res) {
        try {
            const tiers = await RegistrationService_1.RegistrationService.getDependentTiers();
            return res.status(200).json({
                success: true,
                data: tiers,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return res.status(500).json({
                success: false,
                message: errorMessage,
            });
        }
    }
    /**
     * STEP 3: Determine membership type based on answers
     * Route: POST /register/determine-membership
     */
    async determineMembership(req, res) {
        try {
            const { member_id, is_foreign, is_working, is_retired, is_student, is_graduated, has_relation, relation_member_id, } = req.body;
            if (!member_id) {
                return res.status(400).json({
                    success: false,
                    message: 'member_id is required',
                });
            }
            // Validate relation logic if applicable
            if (has_relation && relation_member_id) {
                const exists = await RegistrationService_1.RegistrationService.memberExists(relation_member_id);
                if (!exists) {
                    return res.status(404).json({
                        success: false,
                        message: 'Related member not found',
                    });
                }
            }
            // Call Service Logic
            // لاحظ هنا بننادي الدالة determineMembershipType من السيرفس
            const result = await RegistrationService_1.RegistrationService.determineMembershipType({
                member_id,
                is_foreign: is_foreign || false,
                is_working: is_working || false,
                is_retired: is_retired || false,
                is_student: is_student || false,
                is_graduated: is_graduated || false,
                has_relation: has_relation || false,
                relation_member_id,
            });
            return res.status(200).json({
                success: true,
                message: 'Membership type determined automatically',
                data: {
                    member_type_code: result.member_type_code,
                    member_type_id: result.member_type_id,
                    membership_plan_code: result.membership_plan_code,
                    next_step: result.membership_plan_code, // Use the actual plan code
                },
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return res.status(500).json({
                success: false,
                message: errorMessage,
            });
        }
    }
    /**
     * STEP 4: Complete registration and create membership record
     * Route: POST /register/complete
     */
    async completeRegistration(req, res) {
        try {
            const { member_id, membership_plan_code } = req.body;
            // Default to today if not provided
            const start_date = req.body.start_date ? new Date(req.body.start_date) : new Date();
            if (!member_id || !membership_plan_code) {
                return res.status(400).json({
                    success: false,
                    message: 'member_id and membership_plan_code are required',
                });
            }
            // Call Service Logic
            const membership = await RegistrationService_1.RegistrationService.createMembership({
                member_id,
                membership_plan_code,
                start_date,
            });
            return res.status(201).json({
                success: true,
                message: 'Registration completed successfully',
                data: {
                    membership_id: membership.id,
                    member_id: membership.member_id,
                    membership_status: membership.status,
                    payment_status: membership.payment_status,
                    start_date: membership.start_date,
                    end_date: membership.end_date,
                },
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return res.status(500).json({
                success: false,
                message: errorMessage,
            });
        }
    }
    /**
     * COMPLETE WORKING MEMBER REGISTRATION
     * Route: POST /register/register-working-member
     * Registers in: accounts → members → employee_details → membership
     */
    async registerCompleteWorkingMember(req, res) {
        try {
            const { email, password, first_name_en, first_name_ar, last_name_en, last_name_ar, phone, gender, nationality, birthdate, national_id, profession_id, department_en, department_ar, salary, salary_slip, employment_start_date, membership_plan_id, branch_id } = req.body;
            // Validation
            if (!email || !password || !first_name_en || !last_name_en || !national_id || !profession_id || !salary || !membership_plan_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: email, password, first_name_en, last_name_en, national_id, profession_id, salary, membership_plan_id'
                });
            }
            if (!/^\d{14}$/.test(national_id) || national_id.startsWith('0')) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid National ID (must be 14 digits and not start with 0)'
                });
            }
            if (phone && !/^01[0125]\d{8}$/.test(phone)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid phone number format (Expected 11 digits starting with 010, 011, 012, or 015)'
                });
            }
            // Check for duplicates
            if (await RegistrationService_1.RegistrationService.emailExists(email)) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already registered'
                });
            }
            if (await RegistrationService_1.RegistrationService.nationalIdExists(national_id)) {
                return res.status(409).json({
                    success: false,
                    message: 'National ID already registered'
                });
            }
            // Call service to register complete working member
            const result = await RegistrationService_1.RegistrationService.registerWorkingMember({
                email,
                password,
                first_name_en,
                first_name_ar: first_name_ar || first_name_en,
                last_name_en,
                last_name_ar: last_name_ar || last_name_en,
                phone,
                gender,
                nationality: nationality || 'Egyptian',
                birthdate: birthdate ? new Date(birthdate) : undefined,
                national_id,
                profession_id,
                department_en,
                department_ar,
                salary: parseFloat(salary),
                salary_slip,
                employment_start_date: employment_start_date ? new Date(employment_start_date) : undefined,
                membership_plan_id,
                branch_id
            });
            return res.status(201).json(result);
        }
        catch (error) {
            console.error('Working Member Registration Error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return res.status(500).json({
                success: false,
                message: 'Failed to register working member',
                error: errorMessage
            });
        }
    }
    /**
     * COMPLETE RETIRED MEMBER REGISTRATION
     * Route: POST /register/register-retired-member
     * Registers in: accounts → members → retired_employee_details → membership
     */
    async registerCompleteRetiredMember(req, res) {
        try {
            const { email, password, first_name_en, first_name_ar, last_name_en, last_name_ar, phone, gender, nationality, birthdate, national_id, profession_id, former_department_en, former_department_ar, retirement_date, last_salary, salary_slip, membership_plan_id } = req.body;
            // Validation
            if (!email || !password || !first_name_en || !last_name_en || !national_id || !retirement_date || !membership_plan_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: email, password, first_name_en, last_name_en, national_id, retirement_date, membership_plan_id'
                });
            }
            if (!/^\d{14}$/.test(national_id) || national_id.startsWith('0')) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid National ID (must be 14 digits and not start with 0)'
                });
            }
            if (phone && !/^01[0125]\d{8}$/.test(phone)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid phone number format (Expected 11 digits starting with 010, 011, 012, or 015)'
                });
            }
            // Check for duplicates
            if (await RegistrationService_1.RegistrationService.emailExists(email)) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already registered'
                });
            }
            if (await RegistrationService_1.RegistrationService.nationalIdExists(national_id)) {
                return res.status(409).json({
                    success: false,
                    message: 'National ID already registered'
                });
            }
            // Call service
            const result = await RegistrationService_1.RegistrationService.registerRetiredMember({
                email,
                password,
                first_name_en,
                first_name_ar: first_name_ar || first_name_en,
                last_name_en,
                last_name_ar: last_name_ar || last_name_en,
                phone,
                gender,
                nationality: nationality || 'Egyptian',
                birthdate: birthdate ? new Date(birthdate) : undefined,
                national_id,
                profession_id,
                former_department_en,
                former_department_ar,
                retirement_date: new Date(retirement_date),
                last_salary: last_salary ? parseFloat(last_salary) : undefined,
                salary_slip,
                membership_plan_id
            });
            return res.status(201).json(result);
        }
        catch (error) {
            console.error('Retired Member Registration Error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return res.status(500).json({
                success: false,
                message: 'Failed to register retired member',
                error: errorMessage
            });
        }
    }
    /**
     * COMPLETE STUDENT MEMBER REGISTRATION
     * Route: POST /register/register-student-member
     * Registers in: accounts → members → university_student_details → membership
     */
    async registerCompleteStudentMember(req, res) {
        try {
            const { email, password, first_name_en, first_name_ar, last_name_en, last_name_ar, phone, gender, nationality, birthdate, national_id, faculty_id, membership_plan_id } = req.body;
            // Extract and upload files to Cloudinary
            let personal_photo;
            let national_id_front;
            let national_id_back;
            let medical_report;
            let student_proof;
            try {
                const personalPhotoFile = getFile(req.files, 'personal_photo');
                if (personalPhotoFile) {
                    personal_photo = await (0, localFileStorage_1.saveToLocalStorage)(personalPhotoFile.buffer, personalPhotoFile.originalname, localFileStorage_1.DocumentType.PERSONAL_PHOTO, localFileStorage_1.UserType.MEMBER);
                }
                const nationalIdFrontFile = getFile(req.files, 'national_id_front');
                if (nationalIdFrontFile) {
                    national_id_front = await (0, localFileStorage_1.saveToLocalStorage)(nationalIdFrontFile.buffer, nationalIdFrontFile.originalname, localFileStorage_1.DocumentType.NATIONAL_ID, localFileStorage_1.UserType.MEMBER);
                }
                const nationalIdBackFile = getFile(req.files, 'national_id_back');
                if (nationalIdBackFile) {
                    national_id_back = await (0, localFileStorage_1.saveToLocalStorage)(nationalIdBackFile.buffer, nationalIdBackFile.originalname, localFileStorage_1.DocumentType.NATIONAL_ID, localFileStorage_1.UserType.MEMBER);
                }
                const medicalReportFile = getFile(req.files, 'medical_report');
                if (medicalReportFile) {
                    medical_report = await (0, localFileStorage_1.saveToLocalStorage)(medicalReportFile.buffer, medicalReportFile.originalname, localFileStorage_1.DocumentType.MEDICAL_REPORT, localFileStorage_1.UserType.MEMBER);
                }
                const studentProofFile = getFile(req.files, 'student_proof');
                if (studentProofFile) {
                    student_proof = await (0, localFileStorage_1.saveToLocalStorage)(studentProofFile.buffer, studentProofFile.originalname, localFileStorage_1.DocumentType.STUDENT_PROOF, localFileStorage_1.UserType.MEMBER);
                }
            }
            catch (uploadError) {
                console.error('File upload error:', uploadError);
                return res.status(400).json({
                    success: false,
                    message: uploadError instanceof Error ? uploadError.message : 'Failed to upload files'
                });
            }
            // Validation
            if (!email || !password || !first_name_en || !last_name_en || !national_id || !membership_plan_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: email, password, first_name_en, last_name_en, national_id, membership_plan_id'
                });
            }
            if (!/^\d{14}$/.test(national_id) || national_id.startsWith('0')) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid National ID (must be 14 digits and not start with 0)'
                });
            }
            if (phone && !/^01[0125]\d{8}$/.test(phone)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid phone number format (Expected 11 digits starting with 010, 011, 012, or 015)'
                });
            }
            // Check for duplicates
            if (await RegistrationService_1.RegistrationService.emailExists(email)) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already registered'
                });
            }
            if (await RegistrationService_1.RegistrationService.nationalIdExists(national_id)) {
                return res.status(409).json({
                    success: false,
                    message: 'National ID already registered'
                });
            }
            // Call service
            const result = await RegistrationService_1.RegistrationService.registerStudentMember({
                email,
                password,
                first_name_en,
                first_name_ar: first_name_ar || first_name_en,
                last_name_en,
                last_name_ar: last_name_ar || last_name_en,
                phone,
                gender,
                nationality: nationality || 'Egyptian',
                birthdate: birthdate ? new Date(birthdate) : undefined,
                national_id,
                faculty_id,
                membership_plan_id,
                personal_photo,
                national_id_front,
                national_id_back,
                medical_report,
                student_proof
            });
            return res.status(201).json(result);
        }
        catch (error) {
            console.error('Student Member Registration Error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return res.status(500).json({
                success: false,
                message: 'Failed to register student member',
                error: errorMessage
            });
        }
    }
    /**
     * ROLLBACK: Delete a partially-created registration
     * Route: DELETE /register/rollback/:account_id
     *
     * Called by the frontend whenever any step after /register/basic fails,
     * so no orphaned account/member rows are left in the database.
     * Safety: only accounts with status='pending' can be rolled back.
     */
    async rollbackRegistration(req, res) {
        try {
            const account_id = parseInt(req.params.account_id, 10);
            if (!account_id || isNaN(account_id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid account_id is required',
                });
            }
            const result = await RegistrationService_1.RegistrationService.rollbackRegistration(account_id);
            if (!result.deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Account not found — nothing to rollback',
                });
            }
            return res.status(200).json({
                success: true,
                message: 'Registration rolled back successfully. All records removed.',
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Rollback Error:', errorMessage);
            return res.status(500).json({
                success: false,
                message: errorMessage,
            });
        }
    }
}
exports.RegistrationController = RegistrationController;
// Important: Export an INSTANCE of the controller
// عشان في الراوتس بتنادي RegistrationController.registerBasic مباشرة
exports.default = new RegistrationController();
//# sourceMappingURL=RegistrationController.js.map