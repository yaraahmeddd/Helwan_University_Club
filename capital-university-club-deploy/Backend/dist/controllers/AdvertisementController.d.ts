import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authorizePrivilege';
export declare class AdvertisementController {
    private service;
    constructor();
    /**
     * POST /advertisements
     * Create new advertisement
     * - Manager: Creates with "approved" status
     * - Specialist: Creates with "pending" status
     */
    createAdvertisement(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * GET /advertisements
     * Get all advertisements with optional filters
     */
    getAllAdvertisements(req: Request, res: Response): Promise<void>;
    /**
     * GET /advertisements/:id
     * Get single advertisement by ID
     */
    getAdvertisementById(req: Request, res: Response): Promise<void>;
    /**
     * GET /advertisements/pending/all
     * Get all pending advertisements (for manager approval)
     */
    getPendingAdvertisements(req: Request, res: Response): Promise<void>;
    /**
     * PUT /advertisements/:id
     * Update advertisement
     */
    updateAdvertisement(req: Request, res: Response): Promise<void>;
    /**
     * POST /advertisements/:id/approve
     * Approve pending advertisement (Manager only)
     */
    approveAdvertisement(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * POST /advertisements/:id/reject
     * Reject pending advertisement (Manager only)
     */
    rejectAdvertisement(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * POST /advertisements/:id/publish
     * Publish approved advertisement
     */
    publishAdvertisement(req: Request, res: Response): Promise<void>;
    /**
     * DELETE /advertisements/:id
     * Delete advertisement
     */
    deleteAdvertisement(req: Request, res: Response): Promise<void>;
    /**
     * POST /advertisements/:id/archive
     * Archive advertisement
     */
    archiveAdvertisement(req: Request, res: Response): Promise<void>;
    /**
     * POST /advertisements/:id/view
     * Track advertisement view
     */
    trackView(req: Request, res: Response): Promise<void>;
    /**
     * POST /advertisements/:id/click
     * Track advertisement click
     */
    trackClick(req: Request, res: Response): Promise<void>;
    /**
     * GET /advertisement-categories
     * Get all advertisement categories
     */
    getCategories(req: Request, res: Response): Promise<void>;
    /**
     * GET /advertisement-categories/:id
     * Get category by ID
     */
    getCategoryById(req: Request, res: Response): Promise<void>;
    /**
     * POST /advertisement-categories
     * Create advertisement category (Admin only)
     */
    createCategory(req: Request, res: Response): Promise<void>;
    /**
     * PUT /advertisement-categories/:id
     * Update advertisement category (Admin only)
     */
    updateCategory(req: Request, res: Response): Promise<void>;
}
export default AdvertisementController;
//# sourceMappingURL=AdvertisementController.d.ts.map