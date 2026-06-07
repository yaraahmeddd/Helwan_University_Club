"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const FieldController_1 = require("../controllers/FieldController");
const authorizePrivilege_1 = require("../middleware/authorizePrivilege");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * All field routes require authentication and appropriate privileges
 * Privileges are enforced through authorizePrivilege middleware
 */
// ==================== FIELD MANAGEMENT ====================
/**
 * POST /api/fields
 * Create a new field
 * Required Privilege: CREATE_FIELD
 * Body: {
 *   name_en: string,
 *   name_ar: string,
 *   description_en?: string,
 *   description_ar?: string,
 *   sport_id: number,
 *   capacity?: number,
 *   branch_id?: number,
 *   status?: 'active' | 'inactive' | 'maintenance',
 *   hourly_rate?: number,
 *   operating_hours?: [{
 *     day_of_week: number (0-6),
 *     opening_time: string (HH:MM:SS),
 *     closing_time: string (HH:MM:SS)
 *   }]
 * }
 */
router.post('/', (0, authorizePrivilege_1.authorizePrivilege)('CREATE_FIELD'), FieldController_1.FieldController.createField);
/**
 * GET /api/fields
 * Get all fields with optional filters
 * Requires authentication only
 * Query: sport_id?, branch_id?, status?
 */
router.get('/', auth_1.authenticate, FieldController_1.FieldController.getAllFields);
/**
 * GET /api/fields/sport/:sport_id/available
 * Get available fields for a sport
 * Requires authentication only
 */
router.get('/sport/:sport_id/available', auth_1.authenticate, FieldController_1.FieldController.getAvailableFields);
/**
 * GET /api/fields/branch/:branch_id
 * Get fields by branch
 * Requires authentication only
 */
router.get('/branch/:branch_id', auth_1.authenticate, FieldController_1.FieldController.getFieldsByBranch);
router.get('/bookable/by-sport/auth', auth_1.authenticate, FieldController_1.FieldController.getBookableFieldsBySport);
/**
 * GET /api/fields/:id
 * Get field by ID with full details
 * Requires authentication only
 */
router.get('/:id', auth_1.authenticate, FieldController_1.FieldController.getFieldById);
/**
 * PUT /api/fields/:id
 * Update field details
 * Required Privilege: UPDATE_FIELD
 */
router.put('/:id', (0, authorizePrivilege_1.authorizePrivilege)('UPDATE_FIELD'), FieldController_1.FieldController.updateField);
/**
 * DELETE /api/fields/:id
 * Delete a field
 * Required Privilege: DELETE_FIELD
 */
router.delete('/:id', (0, authorizePrivilege_1.authorizePrivilege)('DELETE_FIELD'), FieldController_1.FieldController.deleteField);
/**
 * PATCH /api/fields/:id/status
 * Update field status (active, inactive, maintenance)
 * Required Privilege: MANAGE_FIELD_STATUS
 */
router.patch('/:id/status', (0, authorizePrivilege_1.authorizePrivilege)('MANAGE_FIELD_STATUS'), FieldController_1.FieldController.updateFieldStatus);
// ==================== OPERATING HOURS ====================
/**
 * POST /api/fields/:id/operating-hours
 * Add operating hours to a field
 * Required Privilege: MANAGE_FIELD_HOURS
 * Body: {
 *   hours: [{
 *     day_of_week: number (0-6),
 *     opening_time: string (HH:MM:SS),
 *     closing_time: string (HH:MM:SS)
 *   }]
 * }
 */
router.post('/:id/operating-hours', (0, authorizePrivilege_1.authorizePrivilege)('MANAGE_FIELD_HOURS'), FieldController_1.FieldController.addOperatingHours);
/**
 * PUT /api/fields/:id/operating-hours
 * Update operating hours for a field (replaces all existing)
 * Required Privilege: MANAGE_FIELD_HOURS
 * Body: {
 *   hours: [{
 *     day_of_week: number (0-6),
 *     opening_time: string (HH:MM:SS),
 *     closing_time: string (HH:MM:SS)
 *   }]
 * }
 */
router.put('/:id/operating-hours', (0, authorizePrivilege_1.authorizePrivilege)('MANAGE_FIELD_HOURS'), FieldController_1.FieldController.updateOperatingHours);
/**
 * GET /api/fields/:id/operating-hours
 * Get operating hours for a field
 * Requires authentication only
 */
router.get('/:id/operating-hours', auth_1.authenticate, FieldController_1.FieldController.getOperatingHours);
/**
 * DELETE /api/fields/:id/operating-hours/:day
 * Delete operating hours for a specific day
 * Required Privilege: MANAGE_FIELD_HOURS
 */
router.delete('/:id/operating-hours/:day', (0, authorizePrivilege_1.authorizePrivilege)('MANAGE_FIELD_HOURS'), FieldController_1.FieldController.deleteOperatingHours);
// ==================== AVAILABILITY ====================
/**
 * POST /api/fields/:id/check-availability
 * Check field availability at a specific time
 * Requires authentication only
 * Body: {
 *   day_of_week: number (0-6),
 *   time: string (HH:MM:SS)
 * }
 */
router.post('/:id/check-availability', auth_1.authenticate, FieldController_1.FieldController.checkAvailability);
// ==================== BOOKING SETTINGS ====================
/**
 * PATCH /api/fields/:id/booking-settings
 * Update field booking settings
 * Required Privilege: MANAGE_FIELD_HOURS
 * Body: {
 *   is_available_for_booking?: boolean,
 *   booking_slot_duration?: number (in minutes, 15-480)
 * }
 */
router.patch('/:id/booking-settings', (0, authorizePrivilege_1.authorizePrivilege)('MANAGE_FIELD_HOURS'), FieldController_1.FieldController.updateBookingSettings);
/**
 * GET /api/fields/bookable
 * Get all bookable fields (active and available for booking)
 * Requires authentication only
 * Query Params: sport_id (optional)
 */
router.get('/bookable', auth_1.authenticate, FieldController_1.FieldController.getBookableFields);
/**
 * GET /api/fields/bookable/by-sport
 * Get bookable fields grouped by sport
 * Requires authentication only
 */
router.get('/bookable/by-sport', auth_1.authenticate, FieldController_1.FieldController.getBookableFieldsBySport);
exports.default = router;
//# sourceMappingURL=FieldRoutes.js.map