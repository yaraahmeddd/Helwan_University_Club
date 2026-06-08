"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementRoutes = void 0;
const express_1 = require("express");
const AnnouncementController_1 = require("../controllers/AnnouncementController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const controller = new AnnouncementController_1.AnnouncementController();
/**
 * Announcement Routes
 */
// ========== PUBLIC ROUTES ==========
/**
 * GET /api/announcements/public
 * Get published announcements visible to users
 */
router.get('/public', controller.getPublicAnnouncements);
/**
 * GET /api/announcements/trending
 * Get trending announcements
 */
router.get('/trending', controller.getTrendingAnnouncements);
/**
 * GET /api/announcements/sport/:sportId
 * Get announcements for a specific sport
 */
router.get('/sport/:sportId', controller.getAnnouncementsBySport);
/**
 * GET /api/announcements/:announcementId
 * Get a specific announcement (records view)
 */
router.get('/:announcementId', controller.getAnnouncementById);
/**
 * POST /api/announcements/:announcementId/click
 * Record when a user clicks on an announcement
 */
router.post('/:announcementId/click', controller.recordClick);
// ========== ADMIN ROUTES ==========
// All admin routes require authentication
// In production, also add authorization middleware like authorizePrivilege('MANAGE_ANNOUNCEMENTS')
/**
 * POST /api/announcements
 * Create a new announcement
 * Admin only
 */
router.post('/', auth_1.authenticate, controller.createAnnouncement);
/**
 * GET /api/announcements
 * Get all announcements (admin view)
 * Admin only
 */
router.get('/', auth_1.authenticate, controller.getAllAnnouncements);
/**
 * PUT /api/announcements/:announcementId
 * Update an announcement
 * Admin only
 */
router.put('/:announcementId', auth_1.authenticate, controller.updateAnnouncement);
/**
 * PATCH /api/announcements/:announcementId/publish
 * Publish an announcement
 * Admin only
 */
router.patch('/:announcementId/publish', auth_1.authenticate, controller.publishAnnouncement);
/**
 * PATCH /api/announcements/:announcementId/archive
 * Archive an announcement
 * Admin only
 */
router.patch('/:announcementId/archive', auth_1.authenticate, controller.archiveAnnouncement);
/**
 * DELETE /api/announcements/:announcementId
 * Delete an announcement
 * Admin only
 */
router.delete('/:announcementId', auth_1.authenticate, controller.deleteAnnouncement);
exports.AnnouncementRoutes = router;
exports.default = router;
//# sourceMappingURL=AnnouncementRoutes.js.map