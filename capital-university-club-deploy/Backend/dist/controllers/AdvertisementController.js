"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvertisementController = void 0;
const MediaCenterService_1 = __importDefault(require("../services/MediaCenterService"));
const localFileStorage_1 = require("../utils/localFileStorage");
class AdvertisementController {
    constructor() {
        this.service = new MediaCenterService_1.default();
    }
    /**
     * POST /advertisements
     * Create new advertisement
     * - Manager: Creates with "approved" status
     * - Specialist: Creates with "pending" status
     */
    async createAdvertisement(req, res) {
        try {
            const { title_en, title_ar, description_en, description_ar, category_id, start_date, end_date, is_featured } = req.body;
            const staffId = req.user?.staff_id;
            const staffTypeId = req.user?.staff_type_id;
            if (!title_en || !title_ar || !description_en || !description_ar || !category_id) {
                res.status(400).json({ error: 'Missing required fields' });
                return;
            }
            // Process uploaded files
            const photosList = [];
            if (req.files && req.files.length > 0) {
                const files = req.files;
                try {
                    for (const file of files) {
                        const localPath = await (0, localFileStorage_1.saveToLocalStorage)(file.buffer, file.originalname, localFileStorage_1.DocumentType.ADVERTISEMENT, localFileStorage_1.UserType.STAFF);
                        photosList.push({
                            path: localPath,
                            originalname: file.originalname,
                            alt_text_en: '',
                            alt_text_ar: '',
                        });
                    }
                }
                catch (uploadError) {
                    res.status(400).json({
                        error: uploadError instanceof Error ? uploadError.message : 'Failed to upload advertisement images'
                    });
                    return;
                }
            }
            const advertisement = await this.service.createAdvertisement({
                title_en,
                title_ar,
                description_en,
                description_ar,
                category_id: parseInt(category_id),
                start_date: start_date ? new Date(start_date) : undefined,
                end_date: end_date ? new Date(end_date) : undefined,
                is_featured: is_featured === 'true',
            }, staffId, staffTypeId, photosList);
            res.status(201).json({
                message: 'Advertisement created successfully',
                data: advertisement,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({ error: errorMessage });
        }
    }
    /**
     * GET /advertisements
     * Get all advertisements with optional filters
     */
    async getAllAdvertisements(req, res) {
        try {
            const { status, category_id, created_by, is_featured } = req.query;
            const filters = {};
            if (status)
                filters.status = status;
            if (category_id)
                filters.category_id = parseInt(category_id);
            if (created_by)
                filters.created_by = parseInt(created_by);
            if (is_featured)
                filters.is_featured = is_featured === 'true';
            const advertisements = await this.service.getAllAdvertisements(filters);
            res.json({
                data: advertisements,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({ error: errorMessage });
        }
    }
    /**
     * GET /advertisements/:id
     * Get single advertisement by ID
     */
    async getAdvertisementById(req, res) {
        try {
            const { id } = req.params;
            const advertisement = await this.service.getAdvertisementById(parseInt(id));
            if (!advertisement) {
                res.status(404).json({ error: 'Advertisement not found' });
                return;
            }
            res.json({ data: advertisement });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({ error: errorMessage });
        }
    }
    /**
     * GET /advertisements/pending/all
     * Get all pending advertisements (for manager approval)
     */
    async getPendingAdvertisements(req, res) {
        try {
            const advertisements = await this.service.getPendingAdvertisements();
            res.json({
                data: advertisements,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({ error: errorMessage });
        }
    }
    /**
     * PUT /advertisements/:id
     * Update advertisement
     */
    async updateAdvertisement(req, res) {
        try {
            const { id } = req.params;
            const { title_en, title_ar, description_en, description_ar, category_id, start_date, end_date, is_featured } = req.body;
            const updateData = {};
            if (title_en)
                updateData.title_en = title_en;
            if (title_ar)
                updateData.title_ar = title_ar;
            if (description_en)
                updateData.description_en = description_en;
            if (description_ar)
                updateData.description_ar = description_ar;
            if (category_id)
                updateData.category_id = parseInt(category_id);
            if (start_date)
                updateData.start_date = new Date(start_date);
            if (end_date)
                updateData.end_date = new Date(end_date);
            if (is_featured !== undefined)
                updateData.is_featured = is_featured === 'true';
            const advertisement = await this.service.updateAdvertisement(parseInt(id), updateData);
            res.json({
                message: 'Advertisement updated successfully',
                data: advertisement,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({ error: errorMessage });
        }
    }
    /**
     * POST /advertisements/:id/approve
     * Approve pending advertisement (Manager only)
     */
    async approveAdvertisement(req, res) {
        try {
            const { id } = req.params;
            const { approval_notes } = req.body;
            const managerId = req.user?.staff_id;
            const advertisement = await this.service.approveAdvertisement(parseInt(id), managerId, approval_notes);
            res.json({
                message: 'Advertisement approved successfully',
                data: advertisement,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({ error: errorMessage });
        }
    }
    /**
     * POST /advertisements/:id/reject
     * Reject pending advertisement (Manager only)
     */
    async rejectAdvertisement(req, res) {
        try {
            const { id } = req.params;
            const { rejection_reason } = req.body;
            const managerId = req.user?.staff_id;
            if (!rejection_reason) {
                res.status(400).json({ error: 'Rejection reason is required' });
                return;
            }
            const advertisement = await this.service.rejectAdvertisement(parseInt(id), managerId, rejection_reason);
            res.json({
                message: 'Advertisement rejected successfully',
                data: advertisement,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({ error: errorMessage });
        }
    }
    /**
     * POST /advertisements/:id/publish
     * Publish approved advertisement
     */
    async publishAdvertisement(req, res) {
        try {
            const { id } = req.params;
            const advertisement = await this.service.publishAdvertisement(parseInt(id));
            res.json({
                message: 'Advertisement published successfully',
                data: advertisement,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({ error: errorMessage });
        }
    }
    /**
     * DELETE /advertisements/:id
     * Delete advertisement
     */
    async deleteAdvertisement(req, res) {
        try {
            const { id } = req.params;
            await this.service.deleteAdvertisement(parseInt(id));
            res.json({
                message: 'Advertisement deleted successfully',
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({ error: errorMessage });
        }
    }
    /**
     * POST /advertisements/:id/archive
     * Archive advertisement
     */
    async archiveAdvertisement(req, res) {
        try {
            const { id } = req.params;
            const advertisement = await this.service.archiveAdvertisement(parseInt(id));
            res.json({
                message: 'Advertisement archived successfully',
                data: advertisement,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({ error: errorMessage });
        }
    }
    /**
     * POST /advertisements/:id/view
     * Track advertisement view
     */
    async trackView(req, res) {
        try {
            const { id } = req.params;
            await this.service.trackView(parseInt(id));
            res.json({
                message: 'View tracked successfully',
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({ error: errorMessage });
        }
    }
    /**
     * POST /advertisements/:id/click
     * Track advertisement click
     */
    async trackClick(req, res) {
        try {
            const { id } = req.params;
            await this.service.trackClick(parseInt(id));
            res.json({
                message: 'Click tracked successfully',
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({ error: errorMessage });
        }
    }
    // ===== CATEGORY ENDPOINTS =====
    /**
     * GET /advertisement-categories
     * Get all advertisement categories
     */
    async getCategories(req, res) {
        try {
            const { is_active } = req.query;
            const categories = await this.service.getCategories(is_active ? is_active === 'true' : undefined);
            res.json({
                data: categories,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({ error: errorMessage });
        }
    }
    /**
     * GET /advertisement-categories/:id
     * Get category by ID
     */
    async getCategoryById(req, res) {
        try {
            const { id } = req.params;
            const category = await this.service.getCategoryById(parseInt(id));
            if (!category) {
                res.status(404).json({ error: 'Category not found' });
                return;
            }
            res.json({
                data: category,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({ error: errorMessage });
        }
    }
    /**
     * POST /advertisement-categories
     * Create advertisement category (Admin only)
     */
    async createCategory(req, res) {
        try {
            const { code, name_en, name_ar, description_en, description_ar, color_code } = req.body;
            if (!code || !name_en || !name_ar) {
                res.status(400).json({ error: 'Missing required fields' });
                return;
            }
            const category = await this.service.createCategory({
                code,
                name_en,
                name_ar,
                description_en,
                description_ar,
                color_code,
            });
            res.status(201).json({
                message: 'Category created successfully',
                data: category,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({ error: errorMessage });
        }
    }
    /**
     * PUT /advertisement-categories/:id
     * Update advertisement category (Admin only)
     */
    async updateCategory(req, res) {
        try {
            const { id } = req.params;
            const { name_en, name_ar, description_en, description_ar, color_code, is_active } = req.body;
            const updateData = {};
            if (name_en)
                updateData.name_en = name_en;
            if (name_ar)
                updateData.name_ar = name_ar;
            if (description_en)
                updateData.description_en = description_en;
            if (description_ar)
                updateData.description_ar = description_ar;
            if (color_code)
                updateData.color_code = color_code;
            if (is_active !== undefined)
                updateData.is_active = is_active;
            const category = await this.service.updateCategory(parseInt(id), updateData);
            res.json({
                message: 'Category updated successfully',
                data: category,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({ error: errorMessage });
        }
    }
}
exports.AdvertisementController = AdvertisementController;
exports.default = AdvertisementController;
//# sourceMappingURL=AdvertisementController.js.map