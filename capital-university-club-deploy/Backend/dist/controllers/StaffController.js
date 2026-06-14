"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffController = void 0;
const StaffService_1 = __importDefault(require("../services/StaffService"));
const AuditLogService_1 = require("../services/AuditLogService");
const SocketManager_1 = require("../websocket/SocketManager");
const PrivilegeCalculationService_1 = require("../services/PrivilegeCalculationService");
const localFileStorage_1 = require("../utils/localFileStorage");
const staffService = new StaffService_1.default();
const auditLogService = new AuditLogService_1.AuditLogService();
/**
 * Staff Management Controller
 */
class StaffController {
    static async logAction(req, action, description, oldValue, newValue) {
        try {
            const authReq = req;
            if (!authReq.user || !authReq.user.staff_id)
                return;
            const staff = await staffService.getStaffById(authReq.user.staff_id);
            const userName = staff ? `${staff.first_name_en} ${staff.last_name_en}` : authReq.user.email;
            const role = authReq.user.role; // Default to role from token
            await auditLogService.createLog({
                userName,
                role: role || 'Staff',
                action,
                module: 'Staff',
                description,
                status: 'نجح',
                oldValue,
                newValue,
                dateTime: new Date(),
                ipAddress: req.ip || '0.0.0.0'
            });
        }
        catch (error) {
            console.error('Failed to create audit log in StaffController:', error);
        }
    }
    /**
     * Emit privilege update to connected clients via WebSocket
     * Fetches the latest privilege codes and broadcasts them
     */
    static async emitPrivilegeUpdate(staffId) {
        try {
            const privilegeCodes = await PrivilegeCalculationService_1.PrivilegeCalculationService.calculateFinalPrivilegeCodes(staffId);
            const privilegesArray = Array.from(privilegeCodes);
            SocketManager_1.socketManager.broadcastPrivilegeUpdate('staff', staffId, privilegesArray);
            console.log(`[StaffController] Privilege update emitted for staff ${staffId}: ${privilegesArray.join(', ')}`);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error(`[StaffController] Failed to emit privilege update for staff ${staffId}:`, errorMessage);
            // Don't throw - logging failure shouldn't break the response
        }
    }
    /**
     * GET /staff/types
     * Get all available staff types
     */
    static async getStaffTypes(req, res) {
        try {
            const staffTypes = await staffService.getAllStaffTypes();
            res.status(200).json({
                success: true,
                count: staffTypes.length,
                data: staffTypes.map((st) => ({
                    id: st.id,
                    code: st.code,
                    name_en: st.name_en,
                    name_ar: st.name_ar,
                    description_en: st.description_en,
                    description_ar: st.description_ar,
                    is_active: st.is_active,
                })),
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({
                success: false,
                message: 'Error fetching staff types',
                error: errorMessage,
            });
        }
    }
    /**
     * GET /staff/privileges
     * Get all available privileges (Admin and Executive Manager only)
     * Query params: module (optional) - filter by specific module
     *
     * Response formats:
     * - Without module param: All privileges grouped by module
     * - With module param: Privileges for specific module
     */
    static async getPrivileges(req, res) {
        try {
            const { module } = req.query;
            const requestedModule = module;
            const privileges = await staffService.getAllPrivileges(requestedModule);
            // Group privileges by module if no specific module requested
            let response;
            if (!requestedModule) {
                // Group by module
                const grouped = {};
                privileges.forEach((p) => {
                    const mod = p.module || 'Other';
                    if (!grouped[mod]) {
                        grouped[mod] = [];
                    }
                    grouped[mod].push({
                        id: p.id,
                        code: p.code,
                        name_en: p.name_en,
                        name_ar: p.name_ar,
                        description_en: p.description_en,
                        description_ar: p.description_ar,
                        module: p.module,
                        is_active: p.is_active,
                    });
                });
                response = {
                    success: true,
                    data: grouped,
                };
            }
            else {
                // Specific module requested
                response = {
                    success: true,
                    module: requestedModule,
                    count: privileges.length,
                    data: privileges.map((p) => ({
                        id: p.id,
                        code: p.code,
                        name_en: p.name_en,
                        name_ar: p.name_ar,
                        description_en: p.description_en,
                        description_ar: p.description_ar,
                        module: p.module,
                        is_active: p.is_active,
                    })),
                };
            }
            res.status(200).json(response);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({
                success: false,
                message: 'Error fetching privileges',
                error: errorMessage,
            });
        }
    }
    /**
     * GET /staff/packages
     * Get all available privilege packages
     */
    static async getPrivilegePackages(req, res) {
        try {
            const packages = await staffService.getAllPrivilegePackages();
            res.status(200).json({
                success: true,
                count: packages.length,
                data: packages.map((pkg) => ({
                    id: pkg.id,
                    code: pkg.code,
                    name_en: pkg.name_en,
                    name_ar: pkg.name_ar,
                    description_en: pkg.description_en,
                    description_ar: pkg.description_ar,
                    is_active: pkg.is_active,
                })),
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({
                success: false,
                message: 'Error fetching privilege packages',
                error: errorMessage,
            });
        }
    }
    /**
     * POST /staff/packages
     * Create a new privilege package
     * Body: {
     *   code: string,
     *   name_en: string,
     *   name_ar: string,
     *   description_en?: string,
     *   description_ar?: string,
     *   privilege_ids: number[]
     * }
     */
    static async createPrivilegePackage(req, res) {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'Authorization required',
                });
                return;
            }
            const staffTypeId = user.staff_type_id;
            // Only ADMIN (1) and EXECUTIVE_MANAGER (2) can create packages
            if (staffTypeId !== 1 && staffTypeId !== 2) {
                res.status(403).json({
                    success: false,
                    message: 'Only administrators and executive managers can create privilege packages',
                });
                return;
            }
            const { code, name_en, name_ar, description_en, description_ar, privilege_ids } = req.body;
            if (!code || !name_en || !name_ar) {
                res.status(400).json({
                    success: false,
                    message: 'Missing required fields: code, name_en, name_ar',
                });
                return;
            }
            if (!privilege_ids || !Array.isArray(privilege_ids)) {
                res.status(400).json({
                    success: false,
                    message: 'Missing required field: privilege_ids (array)',
                });
                return;
            }
            const result = await staffService.createPrivilegePackage({
                code,
                name_en,
                name_ar,
                description_en,
                description_ar,
                privilege_ids,
            });
            await StaffController.logAction(req, 'Create Package', `Created privilege package: ${code}`, undefined, result.data);
            res.status(201).json(result);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(400).json({
                success: false,
                message: 'Error creating privilege package',
                error: errorMessage,
            });
        }
    }
    /**
     * GET /staff/packages/:packageId
     * Get privilege package by ID with full details
     */
    static async getPrivilegePackageById(req, res) {
        try {
            const { packageId } = req.params;
            if (!packageId || isNaN(Number(packageId))) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid package ID provided',
                });
                return;
            }
            const result = await staffService.getPrivilegePackageById(Number(packageId));
            res.status(200).json(result);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(404).json({
                success: false,
                message: 'Error fetching privilege package',
                error: errorMessage,
            });
        }
    }
    /**
     * PUT /staff/packages/:packageId
     * Update privilege package
     * Body: {
     *   code?: string,
     *   name_en?: string,
     *   name_ar?: string,
     *   description_en?: string,
     *   description_ar?: string,
     *   is_active?: boolean,
     *   privilege_ids?: number[]
     * }
     */
    static async updatePrivilegePackage(req, res) {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'Authorization required',
                });
                return;
            }
            const staffTypeId = user.staff_type_id;
            // Only ADMIN (1) and EXECUTIVE_MANAGER (2) can update packages
            if (staffTypeId !== 1 && staffTypeId !== 2) {
                res.status(403).json({
                    success: false,
                    message: 'Only administrators and executive managers can update privilege packages',
                });
                return;
            }
            const { packageId } = req.params;
            if (!packageId || isNaN(Number(packageId))) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid package ID provided',
                });
                return;
            }
            const updateData = req.body;
            const result = await staffService.updatePrivilegePackage(Number(packageId), updateData);
            await StaffController.logAction(req, 'Update Package', `Updated privilege package ID: ${packageId}`, undefined, updateData);
            res.status(200).json(result);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(400).json({
                success: false,
                message: 'Error updating privilege package',
                error: errorMessage,
            });
        }
    }
    /**
     * DELETE /staff/packages/:packageId
     * Delete privilege package
     */
    static async deletePrivilegePackage(req, res) {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'Authorization required',
                });
                return;
            }
            const staffTypeId = user.staff_type_id;
            // Only ADMIN (1) can delete packages
            if (staffTypeId !== 1) {
                res.status(403).json({
                    success: false,
                    message: 'Only administrators can delete privilege packages',
                });
                return;
            }
            const { packageId } = req.params;
            if (!packageId || isNaN(Number(packageId))) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid package ID provided',
                });
                return;
            }
            const result = await staffService.deletePrivilegePackage(Number(packageId));
            await StaffController.logAction(req, 'Delete Package', `Deleted privilege package ID: ${packageId}`, undefined, result);
            res.status(200).json(result);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(400).json({
                success: false,
                message: 'Error deleting privilege package',
                error: errorMessage,
            });
        }
    }
    /**
     * PUT /staff/packages/:packageId/privileges
     * Update privileges in a package
     * Body: {
     *   privilege_ids: number[]
     * }
     */
    static async updatePackagePrivileges(req, res) {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'Authorization required',
                });
                return;
            }
            const staffTypeId = user.staff_type_id;
            // Only ADMIN (1) and EXECUTIVE_MANAGER (2) can update package privileges
            if (staffTypeId !== 1 && staffTypeId !== 2) {
                res.status(403).json({
                    success: false,
                    message: 'Only administrators and executive managers can update package privileges',
                });
                return;
            }
            const { packageId } = req.params;
            const { privilege_ids } = req.body;
            if (!packageId || isNaN(Number(packageId))) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid package ID provided',
                });
                return;
            }
            if (!privilege_ids || !Array.isArray(privilege_ids)) {
                res.status(400).json({
                    success: false,
                    message: 'Missing required field: privilege_ids (array)',
                });
                return;
            }
            const result = await staffService.updatePackagePrivileges(Number(packageId), privilege_ids);
            await StaffController.logAction(req, 'Update Package Privileges', `Updated privileges for package ID: ${packageId}`, undefined, { privilege_ids });
            res.status(200).json(result);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(400).json({
                success: false,
                message: 'Error updating package privileges',
                error: errorMessage,
            });
        }
    }
    /**
     * GET /staff/packages/:packageId/privileges
     * Get all privileges in a specific package
     */
    static async getPackagePrivileges(req, res) {
        try {
            const { packageId } = req.params;
            const privileges = await staffService.getPackagePrivileges(Number(packageId));
            res.status(200).json({
                success: true,
                count: privileges.length,
                data: privileges,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({
                success: false,
                message: 'Error fetching package privileges',
                error: errorMessage,
            });
        }
    }
    /**
     * POST /staff/register
     * Register a new staff member
     *
     * Accepts multipart/form-data so document files can be uploaded in the same request.
     * All documents are optional — they can be uploaded later via PUT /staff/:id.
     *
     * File fields:
     *   academic_certificate       — Original/copy of academic qualification certificate
     *   national_id_front          — Front of valid national ID card
     *   national_id_back           — Back of valid national ID card
     *   military_service_doc       — Military service status (males)
     *   criminal_record            — Original criminal record (non-university employees)
     *   employer_approval_letter   — Employer approval letter
     *   employment_status_statement— Employment status statement (other-org employees)
     *   good_conduct_certificate   — Good conduct cert (non-other-org employees)
     *   personal_photo             — Recent personal photo
     *   personal_info_form         — Completed personal-information / acquaintance form
     *   experience_certificates    — Experience / training course certificates
     *
     * Authorization Rules:
     * - Only ADMIN (staff_type_id = 1) can register EXECUTIVE_MANAGER (staff_type_id = 2)
     * - ADMIN and EXECUTIVE_MANAGER can register other staff
     * - DEPUTY_EXEC_MANAGER can register staff but action requires approval
     */
    static async registerStaff(req, res) {
        try {
            // Check if user is authenticated
            const user = req.user;
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'Authorization required. Please provide a valid JWT token.',
                });
                return;
            }
            const staffTypeId = user.staff_type_id;
            const { first_name_en, first_name_ar, last_name_en, last_name_ar, national_id, phone, address, staff_type_id, employment_start_date, employment_end_date, } = req.body;
            // Validation
            if (!first_name_en || !last_name_en || !national_id || !phone || !staff_type_id || !employment_start_date) {
                res.status(400).json({
                    success: false,
                    message: 'Missing required fields: first_name_en, last_name_en, national_id, phone, staff_type_id, employment_start_date',
                });
                return;
            }
            // Authorization check: Only ADMIN can register EXECUTIVE_MANAGER
            if (Number(staff_type_id) === 2 && staffTypeId !== 1) {
                res.status(403).json({
                    success: false,
                    message: 'Only administrators can create Executive Manager accounts',
                });
                return;
            }
            // Only ADMIN (1), EXECUTIVE_MANAGER (2), or DEPUTY_EXEC_MANAGER (3) can register staff
            if (staffTypeId !== 1 && staffTypeId !== 2 && staffTypeId !== 3) {
                res.status(403).json({
                    success: false,
                    message: 'Only administrators, executive managers, and deputy managers can register staff',
                });
                return;
            }
            // ── Upload documents ────────────────────────────────────────────────────
            const files = req.files;
            const getFile = (field) => files?.[field]?.[0];
            const uploadDoc = async (field, docType) => {
                const file = getFile(field);
                if (!file)
                    return undefined;
                return (0, localFileStorage_1.saveToLocalStorage)(file.buffer, file.originalname, docType, localFileStorage_1.UserType.STAFF);
            };
            let academic_certificate;
            let national_id_front;
            let national_id_back;
            let military_service_doc;
            let criminal_record;
            let employer_approval_letter;
            let employment_status_statement;
            let good_conduct_certificate;
            let personal_photo;
            let personal_info_form;
            let experience_certificates;
            try {
                academic_certificate = await uploadDoc('academic_certificate', localFileStorage_1.DocumentType.OTHER);
                national_id_front = await uploadDoc('national_id_front', localFileStorage_1.DocumentType.NATIONAL_ID);
                national_id_back = await uploadDoc('national_id_back', localFileStorage_1.DocumentType.NATIONAL_ID);
                military_service_doc = await uploadDoc('military_service_doc', localFileStorage_1.DocumentType.OTHER);
                criminal_record = await uploadDoc('criminal_record', localFileStorage_1.DocumentType.OTHER);
                employer_approval_letter = await uploadDoc('employer_approval_letter', localFileStorage_1.DocumentType.OTHER);
                employment_status_statement = await uploadDoc('employment_status_statement', localFileStorage_1.DocumentType.OTHER);
                good_conduct_certificate = await uploadDoc('good_conduct_certificate', localFileStorage_1.DocumentType.OTHER);
                personal_photo = await uploadDoc('personal_photo', localFileStorage_1.DocumentType.PERSONAL_PHOTO);
                personal_info_form = await uploadDoc('personal_info_form', localFileStorage_1.DocumentType.OTHER);
                experience_certificates = await uploadDoc('experience_certificates', localFileStorage_1.DocumentType.OTHER);
            }
            catch (uploadError) {
                console.error('File upload error during staff registration:', uploadError);
                res.status(400).json({
                    success: false,
                    message: uploadError instanceof Error ? uploadError.message : 'Failed to upload one or more documents',
                });
                return;
            }
            // ── Build staff data payload ─────────────────────────────────────────────
            const staffData = {
                first_name_en,
                first_name_ar: first_name_ar || first_name_en,
                last_name_en,
                last_name_ar: last_name_ar || last_name_en,
                national_id,
                email: `staff.${national_id}@helwan-club.local`,
                password: national_id,
                phone,
                address: address || '',
                staff_type_id: Number(staff_type_id),
                employment_start_date: new Date(employment_start_date),
                employment_end_date: employment_end_date ? new Date(employment_end_date) : undefined,
                created_by_staff_type_id: staffTypeId,
                // Documents
                academic_certificate,
                national_id_front,
                national_id_back,
                military_service_doc,
                criminal_record,
                employer_approval_letter,
                employment_status_statement,
                good_conduct_certificate,
                personal_photo,
                personal_info_form,
                experience_certificates,
            };
            const result = await staffService.registerStaff(staffData);
            await StaffController.logAction(req, 'Register', `Registered new staff member: ${first_name_en} ${last_name_en}`, undefined, result);
            res.status(201).json(result);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Registration Error:', error);
            res.status(400).json({
                success: false,
                message: errorMessage,
                error: errorMessage,
            });
        }
    }
    /**
     * GET /staff/:id
     * Get staff member details including assigned packages and privileges
     */
    static async getStaffById(req, res) {
        try {
            const { id } = req.params;
            if (!id || isNaN(Number(id))) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid staff ID provided',
                });
                return;
            }
            const staff = await staffService.getStaffById(Number(id));
            res.status(200).json({
                success: true,
                data: staff,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error in getStaffById:', errorMessage);
            res.status(404).json({
                success: false,
                message: 'Staff member not found',
                error: errorMessage,
            });
        }
    }
    /**
     * GET /staff
     * Get all staff members with pagination
     */
    static async getAllStaff(req, res) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const role = req.query.role;
            const result = await staffService.getAllStaff(page, limit, role);
            res.status(200).json({
                success: true,
                ...result,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({
                success: false,
                message: 'Error fetching staff list',
                error: errorMessage,
            });
        }
    }
    /**
     * PUT /staff/:id
     * Update staff member information
     */
    static async updateStaff(req, res) {
        try {
            const { id } = req.params;
            const updateData = { ...req.body };
            if (req.files) {
                const files = req.files;
                const uploadDoc = async (fieldName, docType) => {
                    if (files[fieldName] && files[fieldName][0]) {
                        return await (0, localFileStorage_1.saveToLocalStorage)(files[fieldName][0].buffer, files[fieldName][0].originalname, docType, localFileStorage_1.UserType.STAFF);
                    }
                    return undefined;
                };
                const academic_certificate = await uploadDoc('academic_certificate', localFileStorage_1.DocumentType.OTHER);
                if (academic_certificate)
                    updateData.academic_certificate = academic_certificate;
                const national_id_front = await uploadDoc('national_id_front', localFileStorage_1.DocumentType.NATIONAL_ID);
                if (national_id_front)
                    updateData.national_id_front = national_id_front;
                const national_id_back = await uploadDoc('national_id_back', localFileStorage_1.DocumentType.NATIONAL_ID);
                if (national_id_back)
                    updateData.national_id_back = national_id_back;
                const military_service_doc = await uploadDoc('military_service_doc', localFileStorage_1.DocumentType.OTHER);
                if (military_service_doc)
                    updateData.military_service_doc = military_service_doc;
                const criminal_record = await uploadDoc('criminal_record', localFileStorage_1.DocumentType.OTHER);
                if (criminal_record)
                    updateData.criminal_record = criminal_record;
                const employer_approval_letter = await uploadDoc('employer_approval_letter', localFileStorage_1.DocumentType.OTHER);
                if (employer_approval_letter)
                    updateData.employer_approval_letter = employer_approval_letter;
                const employment_status_statement = await uploadDoc('employment_status_statement', localFileStorage_1.DocumentType.OTHER);
                if (employment_status_statement)
                    updateData.employment_status_statement = employment_status_statement;
                const good_conduct_certificate = await uploadDoc('good_conduct_certificate', localFileStorage_1.DocumentType.OTHER);
                if (good_conduct_certificate)
                    updateData.good_conduct_certificate = good_conduct_certificate;
                const personal_photo = await uploadDoc('personal_photo', localFileStorage_1.DocumentType.PERSONAL_PHOTO);
                if (personal_photo)
                    updateData.personal_photo = personal_photo;
                const personal_info_form = await uploadDoc('personal_info_form', localFileStorage_1.DocumentType.OTHER);
                if (personal_info_form)
                    updateData.personal_info_form = personal_info_form;
                const experience_certificates = await uploadDoc('experience_certificates', localFileStorage_1.DocumentType.OTHER);
                if (experience_certificates)
                    updateData.experience_certificates = experience_certificates;
            }
            const result = await staffService.updateStaff(Number(id), updateData);
            await StaffController.logAction(req, 'Update', `Updated staff member ID: ${id}`, undefined, updateData);
            res.status(200).json(result);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(400).json({
                success: false,
                message: 'Error updating staff member',
                error: errorMessage,
            });
        }
    }
    /**
     * POST /staff/:id/packages
     * Assign privilege packages to a staff member
     * Body: {
     *   package_ids: number[],
     *   assigned_by: number (staff ID of who's making the assignment)
     * }
     */
    static async assignPackages(req, res) {
        try {
            const { id } = req.params;
            const { package_ids } = req.body;
            // Extract user from middleware
            const user = req.user;
            if (!package_ids || !Array.isArray(package_ids)) {
                res.status(400).json({
                    success: false,
                    message: 'Missing required field: package_ids (array)',
                });
                return;
            }
            if (!user || !user.staff_id) {
                res.status(401).json({
                    success: false,
                    message: 'Authorization required. Invalid user context.',
                });
                return;
            }
            const result = await staffService.assignPackages(Number(id), package_ids, Number(user.staff_id));
            // Emit privilege update to connected clients
            await StaffController.emitPrivilegeUpdate(Number(id));
            await StaffController.logAction(req, 'Assign Packages', `Assigned privilege packages to staff ID: ${id}`, undefined, { package_ids });
            res.status(200).json(result);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(400).json({
                success: false,
                message: 'Error assigning privilege packages',
                error: errorMessage,
            });
        }
    }
    /**
     * POST /staff/:id/privileges/grant
     * Grant individual privileges to a staff member
     * Body: {
     *   privilege_id: number,      // Single privilege ID
     *   reason?: string
     * }
     * OR for multiple:
     * Body: {
     *   privilege_ids: number[],   // Array of privilege IDs
     *   reason?: string
     * }
     */
    static async grantPrivilege(req, res) {
        try {
            const { id } = req.params;
            const { privilege_id, privilege_ids, reason } = req.body;
            const user = req.user;
            if (!user || !user.staff_id) {
                res.status(401).json({
                    success: false,
                    message: 'Authorization required. Invalid user context.',
                });
                return;
            }
            // Accept either single privilege_id or array privilege_ids
            const ids = privilege_id ? [privilege_id] : (privilege_ids || []);
            if (!ids || ids.length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'Missing required field: privilege_id or privilege_ids',
                });
                return;
            }
            // Grant each privilege individually
            const results = [];
            for (const privId of ids) {
                try {
                    const result = await staffService.grantPrivilege(Number(id), Number(privId), Number(user.staff_id), reason);
                    results.push(result);
                }
                catch (err) {
                    results.push({
                        success: false,
                        privilege_id: privId,
                        error: err instanceof Error ? err.message : 'Unknown error',
                    });
                }
            }
            const allSuccessful = results.every((r) => r.success !== false);
            if (allSuccessful) {
                await StaffController.logAction(req, 'Grant Privilege', `Granted privileges to staff ID: ${id}`, undefined, { ids, reason });
                // Emit privilege update to connected clients
                await StaffController.emitPrivilegeUpdate(Number(id));
            }
            res.status(allSuccessful ? 200 : 207).json({
                success: allSuccessful,
                count: ids.length,
                results,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(400).json({
                success: false,
                message: 'Error granting privileges',
                error: errorMessage,
            });
        }
    }
    /**
     * POST /staff/:id/revoke-privilege
     * Revoke privileges from a staff member
     * Body: {
     *   privilege_id: number,      // Single privilege ID
     *   reason?: string
     * }
     * OR for multiple:
     * Body: {
     *   privilege_ids: number[],   // Array of privilege IDs
     *   reason?: string
     * }
     */
    static async revokePrivilege(req, res) {
        try {
            const { id } = req.params;
            const { privilege_id, privilege_ids, reason } = req.body;
            const user = req.user;
            if (!user || !user.staff_id) {
                res.status(401).json({
                    success: false,
                    message: 'Authorization required. Invalid user context.',
                });
                return;
            }
            // Accept either single privilege_id or array privilege_ids
            const ids = privilege_id ? [privilege_id] : (privilege_ids || []);
            if (!ids || ids.length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'Missing required field: privilege_id or privilege_ids',
                });
                return;
            }
            // Revoke each privilege individually
            const results = [];
            const failedAttempts = [];
            for (const privId of ids) {
                try {
                    const result = await staffService.revokePrivilege(Number(id), Number(privId), Number(user.staff_id), reason);
                    results.push({ ...result, privilege_id: privId, success: true });
                }
                catch (err) {
                    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
                    results.push({
                        success: false,
                        privilege_id: privId,
                        error: errorMsg,
                    });
                    // Track all failures for detailed response
                    failedAttempts.push({
                        privilege_id: privId,
                        error: errorMsg,
                    });
                }
            }
            const allSuccessful = results.every((r) => r.success !== false);
            if (allSuccessful) {
                await StaffController.logAction(req, 'Revoke Privilege', `Revoked privileges from staff ID: ${id}`, undefined, { ids, reason });
                // Emit privilege update to connected clients
                await StaffController.emitPrivilegeUpdate(Number(id));
                res.status(200).json({
                    success: true,
                    count: ids.length,
                    results,
                });
            }
            else if (failedAttempts.length > 0) {
                // Some failed - return details, but still emit update for successful ones
                await StaffController.emitPrivilegeUpdate(Number(id));
                res.status(409).json({
                    success: false,
                    count: ids.length,
                    successful_revokes: results.filter((r) => r.success).length,
                    failed_revokes: failedAttempts.length,
                    results,
                    failed_attempts: failedAttempts,
                    hint: 'Some privileges could not be revoked. See failed_attempts for details.',
                });
            }
            else {
                res.status(207).json({
                    success: false,
                    count: ids.length,
                    results,
                });
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(400).json({
                success: false,
                message: 'Error revoking privileges',
                error: errorMessage,
            });
        }
    }
    /**
     * GET /staff/:id/privileges
     * Get all effective privileges for a staff member
     */
    static async getStaffPrivileges(req, res) {
        try {
            const { id } = req.params;
            const privileges = await staffService.getStaffPrivileges(Number(id));
            res.status(200).json({
                success: true,
                count: privileges.length,
                data: privileges,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({
                success: false,
                message: 'Error fetching staff privileges',
                error: errorMessage,
            });
        }
    }
    /**
     * GET /staff/:id/has-privilege/:privilegeCode
     * Check if a staff member has a specific privilege
     */
    static async checkPrivilege(req, res) {
        try {
            const { id, privilegeCode } = req.params;
            const hasPrivilege = await staffService.hasPrivilege(Number(id), privilegeCode);
            res.status(200).json({
                success: true,
                staff_id: Number(id),
                privilege_code: privilegeCode,
                has_privilege: hasPrivilege,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({
                success: false,
                message: 'Error checking privilege',
                error: errorMessage,
            });
        }
    }
    /**
     * POST /staff/:id/deactivate
     * Deactivate a staff member
     * Body: {
     *   deactivated_by: number (staff ID)
     * }
     */
    static async deactivateStaff(req, res) {
        try {
            const { id } = req.params;
            const user = req.user;
            if (!user || !user.staff_id) {
                res.status(401).json({
                    success: false,
                    message: 'Authorization required. Invalid user context.',
                });
                return;
            }
            const result = await staffService.deactivateStaff(Number(id), Number(user.staff_id));
            await StaffController.logAction(req, 'Deactivate', `Deactivated staff member ID: ${id}`, undefined, { status: 'inactive', is_active: false });
            res.status(200).json(result);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(400).json({
                success: false,
                message: 'Error deactivating staff member',
                error: errorMessage,
            });
        }
    }
    /**
     * GET /staff/:id/activity-logs
     * Get activity logs for a staff member
     */
    static async getActivityLogs(req, res) {
        try {
            const { id } = req.params;
            const limit = Number(req.query.limit) || 50;
            const logs = await staffService.getStaffActivityLogs(Number(id), limit);
            res.status(200).json({
                success: true,
                count: logs.length,
                data: logs,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({
                success: false,
                message: 'Error fetching activity logs',
                error: errorMessage,
            });
        }
    }
    /**
     * GET /staff/:id/final-privileges
     * Get dynamically calculated final privileges for a staff member (detailed view)
     *
     * Combines:
     * - Privileges from all assigned packages
     * - Individual privilege grants
     * - Individual privilege revokes
     *
     * Returns full privilege details including name, description, module
     */
    static async getFinalPrivileges(req, res) {
        try {
            const { id } = req.params;
            const staffId = Number(id);
            if (!Number.isFinite(staffId) || staffId <= 0) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid staff ID',
                    code: 'INVALID_STAFF_ID',
                });
                return;
            }
            const privileges = await staffService.getFinalPrivileges(staffId);
            res.status(200).json({
                success: true,
                staff_id: staffId,
                count: privileges.length,
                privileges,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            if (errorMessage.includes('not found')) {
                res.status(404).json({
                    success: false,
                    message: 'Staff member not found',
                    code: 'STAFF_NOT_FOUND',
                    error: errorMessage,
                });
            }
            else {
                console.error('Error fetching final privileges:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error fetching final privileges',
                    code: 'INTERNAL_ERROR',
                    error: errorMessage,
                });
            }
        }
    }
    /**
     * GET /staff/:id/privilege-codes
     * Get dynamically calculated final privilege codes for a staff member (optimized)
     *
     * Returns only privilege codes as an array
     * Ideal for lightweight authorization checks
     */
    static async getFinalPrivilegeCodes(req, res) {
        try {
            const { id } = req.params;
            const privilegeCodes = await staffService.getFinalPrivilegeCodes(Number(id));
            res.status(200).json({
                success: true,
                staff_id: Number(id),
                privilege_codes: Array.from(privilegeCodes),
                count: privilegeCodes.size,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(404).json({
                success: false,
                message: 'Error fetching privilege codes',
                error: errorMessage,
            });
        }
    }
    /**
     * POST /staff/:id/check-privilege/:privilegeCode
     * Check if a staff member has a specific privilege
     *
     * Returns: { has_privilege: true/false }
     */
    static async checkStaffPrivilege(req, res) {
        try {
            const { id, privilegeCode } = req.params;
            const hasPrivilege = await staffService.staffHasPrivilege(Number(id), privilegeCode);
            res.status(200).json({
                success: true,
                staff_id: Number(id),
                privilege_code: privilegeCode,
                has_privilege: hasPrivilege,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({
                success: false,
                message: 'Error checking privilege',
                error: errorMessage,
            });
        }
    }
    /**
     * POST /staff/:id/check-privileges/any
     * Check if a staff member has ANY of the specified privileges
     *
     * Body: {
     *   privilege_codes: string[]  // Array of privilege codes to check
     * }
     *
     * Returns: { found_privileges: string[], matching_count: number }
     */
    static async checkStaffHasAnyPrivilege(req, res) {
        try {
            const { id } = req.params;
            const { privilege_codes } = req.body;
            if (!privilege_codes || !Array.isArray(privilege_codes) || privilege_codes.length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'Missing required field: privilege_codes (non-empty array)',
                });
                return;
            }
            const foundPrivileges = await staffService.staffHasAnyPrivilege(Number(id), privilege_codes);
            res.status(200).json({
                success: true,
                staff_id: Number(id),
                requested_privileges: privilege_codes,
                found_privileges: foundPrivileges,
                matching_count: foundPrivileges.length,
                has_any: foundPrivileges.length > 0,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({
                success: false,
                message: 'Error checking privileges',
                error: errorMessage,
            });
        }
    }
    /**
     * POST /staff/:id/check-privileges/all
     * Check if a staff member has ALL of the specified privileges
     *
     * Body: {
     *   privilege_codes: string[]  // Array of privilege codes to check
     * }
     *
     * Returns: { has_all: true/false }
     */
    static async checkStaffHasAllPrivileges(req, res) {
        try {
            const { id } = req.params;
            const { privilege_codes } = req.body;
            if (!privilege_codes || !Array.isArray(privilege_codes) || privilege_codes.length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'Missing required field: privilege_codes (non-empty array)',
                });
                return;
            }
            const hasAllPrivileges = await staffService.staffHasAllPrivileges(Number(id), privilege_codes);
            res.status(200).json({
                success: true,
                staff_id: Number(id),
                requested_privileges: privilege_codes,
                has_all: hasAllPrivileges,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({
                success: false,
                message: 'Error checking privileges',
                error: errorMessage,
            });
        }
    }
    /**
     * GET /staff/:id/privilege-stats
     * Get privilege statistics for a staff member
     *
     * Returns breakdown of:
     * - Total final privileges
     * - Privileges from packages
     * - Individually granted
     * - Individually revoked
     * - Modules covered
     */
    static async getStaffPrivilegeStats(req, res) {
        try {
            const { id } = req.params;
            const stats = await staffService.getPrivilegeStats(Number(id));
            res.status(200).json({
                success: true,
                staff_id: Number(id),
                stats,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(404).json({
                success: false,
                message: 'Error fetching privilege statistics',
                error: errorMessage,
            });
        }
    }
    /**
     * GET /staff/:id/privilege-breakdown
     * Get detailed privilege breakdown for a staff member
     *
     * Returns:
     * - Assigned packages with their privileges
     * - Individually granted privileges
     * - Individually revoked privileges
     * - Final computed privilege set
     * - Summary statistics
     */
    static async getStaffPrivilegeBreakdown(req, res) {
        try {
            const { id } = req.params;
            const breakdown = await staffService.getPrivilegeBreakdown(Number(id));
            res.status(200).json({
                success: true,
                data: breakdown,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(404).json({
                success: false,
                message: 'Error fetching privilege breakdown',
                error: errorMessage,
            });
        }
    }
}
exports.StaffController = StaffController;
exports.default = StaffController;
//# sourceMappingURL=StaffController.js.map