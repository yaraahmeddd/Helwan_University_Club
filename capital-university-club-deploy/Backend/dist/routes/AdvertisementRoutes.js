"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AdvertisementController_1 = __importDefault(require("../controllers/AdvertisementController"));
const upload_1 = require("../middleware/upload");
const auth_1 = require("../middleware/auth");
const authorizePrivilege_1 = require("../middleware/authorizePrivilege");
const router = (0, express_1.Router)();
const controller = new AdvertisementController_1.default();
// Privilege codes for Media Center Management
const PRIVILEGE_MEDIA_CENTER_CREATE = 'MEDIA_CENTER_CREATE';
const PRIVILEGE_MEDIA_CENTER_PUBLISH = 'MEDIA_CENTER_PUBLISH';
const PRIVILEGE_MEDIA_CENTER_APPROVE = 'MEDIA_CENTER_APPROVE';
const PRIVILEGE_MEDIA_CENTER_EDIT = 'MEDIA_CENTER_EDIT';
const PRIVILEGE_MEDIA_CENTER_DELETE = 'MEDIA_CENTER_DELETE';
const PRIVILEGE_MEDIA_CENTER_MANAGE_CATEGORIES = 'MEDIA_CENTER_MANAGE_CATEGORIES';
// ===== ADVERTISEMENT ENDPOINTS =====
/**
 * POST /media-center/advertisements
 * Create new advertisement with photo upload
 * Requires: MEDIA_CENTER_CREATE privilege
 */
router.post('/advertisements', auth_1.authenticate, (0, authorizePrivilege_1.authorizePrivilege)(PRIVILEGE_MEDIA_CENTER_CREATE), upload_1.upload.array('photos', 10), async (req, res) => {
    await controller.createAdvertisement(req, res);
});
/**
 * GET /media-center/advertisements
 * Get all advertisements with optional filters
 */
router.get('/advertisements', async (req, res) => {
    await controller.getAllAdvertisements(req, res);
});
/**
 * GET /media-center/advertisements/:id
 * Get single advertisement by ID
 */
router.get('/advertisements/:id', async (req, res) => {
    await controller.getAdvertisementById(req, res);
});
/**
 * GET /media-center/advertisements/pending/all
 * Get pending advertisements for manager approval
 * Requires: MEDIA_CENTER_APPROVE privilege
 */
router.get('/advertisements/pending/all', auth_1.authenticate, (0, authorizePrivilege_1.authorizePrivilege)(PRIVILEGE_MEDIA_CENTER_APPROVE), async (req, res) => {
    await controller.getPendingAdvertisements(req, res);
});
/**
 * PUT /media-center/advertisements/:id
 * Update advertisement
 * Requires: MEDIA_CENTER_EDIT privilege
 */
router.put('/advertisements/:id', auth_1.authenticate, (0, authorizePrivilege_1.authorizePrivilege)(PRIVILEGE_MEDIA_CENTER_EDIT), async (req, res) => {
    await controller.updateAdvertisement(req, res);
});
/**
 * POST /media-center/advertisements/:id/approve
 * Approve pending advertisement
 * Requires: MEDIA_CENTER_APPROVE privilege
 */
router.post('/advertisements/:id/approve', auth_1.authenticate, (0, authorizePrivilege_1.authorizePrivilege)(PRIVILEGE_MEDIA_CENTER_APPROVE), async (req, res) => {
    await controller.approveAdvertisement(req, res);
});
/**
 * POST /media-center/advertisements/:id/reject
 * Reject pending advertisement
 * Requires: MEDIA_CENTER_APPROVE privilege
 */
router.post('/advertisements/:id/reject', auth_1.authenticate, (0, authorizePrivilege_1.authorizePrivilege)(PRIVILEGE_MEDIA_CENTER_APPROVE), async (req, res) => {
    await controller.rejectAdvertisement(req, res);
});
/**
 * POST /media-center/advertisements/:id/publish
 * Publish approved advertisement
 * Requires: MEDIA_CENTER_PUBLISH privilege
 */
router.post('/advertisements/:id/publish', auth_1.authenticate, (0, authorizePrivilege_1.authorizePrivilege)(PRIVILEGE_MEDIA_CENTER_PUBLISH), async (req, res) => {
    await controller.publishAdvertisement(req, res);
});
/**
 * DELETE /media-center/advertisements/:id
 * Delete advertisement
 * Requires: MEDIA_CENTER_DELETE privilege
 */
router.delete('/advertisements/:id', auth_1.authenticate, (0, authorizePrivilege_1.authorizePrivilege)(PRIVILEGE_MEDIA_CENTER_DELETE), async (req, res) => {
    await controller.deleteAdvertisement(req, res);
});
/**
 * POST /media-center/advertisements/:id/archive
 * Archive advertisement
 * Requires: MEDIA_CENTER_EDIT or MEDIA_CENTER_DELETE privilege
 */
router.post('/advertisements/:id/archive', auth_1.authenticate, (0, authorizePrivilege_1.authorizePrivilege)(PRIVILEGE_MEDIA_CENTER_EDIT), async (req, res) => {
    await controller.archiveAdvertisement(req, res);
});
/**
 * POST /media-center/advertisements/:id/view
 * Track advertisement view (public endpoint)
 */
router.post('/advertisements/:id/view', async (req, res) => {
    await controller.trackView(req, res);
});
/**
 * POST /media-center/advertisements/:id/click
 * Track advertisement click (public endpoint)
 */
router.post('/advertisements/:id/click', async (req, res) => {
    await controller.trackClick(req, res);
});
// ===== CATEGORY ENDPOINTS =====
/**
 * GET /media-center/categories
 * Get all advertisement categories
 */
router.get('/categories', async (req, res) => {
    await controller.getCategories(req, res);
});
/**
 * GET /media-center/categories/:id
 * Get category by ID
 */
router.get('/categories/:id', async (req, res) => {
    await controller.getCategoryById(req, res);
});
/**
 * POST /media-center/categories
 * Create advertisement category
 * Requires: MEDIA_CENTER_MANAGE_CATEGORIES privilege
 */
router.post('/categories', auth_1.authenticate, (0, authorizePrivilege_1.authorizePrivilege)(PRIVILEGE_MEDIA_CENTER_MANAGE_CATEGORIES), async (req, res) => {
    await controller.createCategory(req, res);
});
/**
 * PUT /media-center/categories/:id
 * Update advertisement category
 * Requires: MEDIA_CENTER_MANAGE_CATEGORIES privilege
 */
router.put('/categories/:id', auth_1.authenticate, (0, authorizePrivilege_1.authorizePrivilege)(PRIVILEGE_MEDIA_CENTER_MANAGE_CATEGORIES), async (req, res) => {
    await controller.updateCategory(req, res);
});
exports.default = router;
//# sourceMappingURL=AdvertisementRoutes.js.map