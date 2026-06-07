"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const MediaPostController_1 = require("../controllers/MediaPostController");
const auth_1 = require("../middleware/auth");
const authorizePrivilege_1 = require("../middleware/authorizePrivilege");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
// Public route to get all posts for landing page
router.get('/', MediaPostController_1.MediaPostController.getAllPosts);
// Public route to get a single post by ID
router.get('/:id', MediaPostController_1.MediaPostController.getPostById);
// Allow dedicated Media role/admin accounts to manage gallery even if privilege package is not yet synced.
const authorizeMediaWrite = (requiredPrivileges) => {
    return (req, res, next) => {
        const role = String(req.user?.role || '').toUpperCase();
        const isAdmin = req.user?.staff_type_id === 1 || role === 'ADMIN';
        const isMediaStaff = role === 'MEDIA' && Boolean(req.user?.staff_id);
        if (isAdmin || isMediaStaff) {
            next();
            return;
        }
        (0, authorizePrivilege_1.authorizeAnyPrivilege)(requiredPrivileges)(req, res, next);
    };
};
// Protected routes for Media Staff / Admins
// Assuming privilege codes for media management
// VIEW_MEDIA_GALLERY: 110, CREATE_MEDIA_POST: 111, UPDATE_MEDIA_POST: 112, DELETE_MEDIA_POST: 113
router.post('/', auth_1.authenticate, authorizeMediaWrite(['media.create', 'CREATE_MEDIA_POST']), // New and old codes
upload_1.upload.array('images', 10), MediaPostController_1.MediaPostController.createPost);
router.put('/:id', auth_1.authenticate, authorizeMediaWrite(['media.edit', 'UPDATE_MEDIA_POST']), upload_1.upload.array('images', 10), MediaPostController_1.MediaPostController.updatePost);
router.delete('/:id', auth_1.authenticate, authorizeMediaWrite(['media.delete', 'DELETE_MEDIA_POST']), MediaPostController_1.MediaPostController.deletePost);
exports.default = router;
//# sourceMappingURL=MediaPostRoutes.js.map