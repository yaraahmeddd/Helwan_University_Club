import { Advertisement } from '../entities/Advertisement';
import { AdvertisementCategory } from '../entities/AdvertisementCategory';
export declare class MediaCenterService {
    private advertisementRepository;
    private photoRepository;
    private categoryRepository;
    constructor();
    /**
     * Create advertisement
     * - Manager: Creates with "approved" status and is immediately published
     * - Specialist: Creates with "pending" status and requires manager approval
     */
    createAdvertisement(data: {
        title_en: string;
        title_ar: string;
        description_en: string;
        description_ar: string;
        category_id: number;
        start_date?: Date;
        end_date?: Date;
        is_featured?: boolean;
    }, staffId: number, staffTypeId: number, photos: Array<{
        path: string;
        originalname: string;
        alt_text_en?: string;
        alt_text_ar?: string;
    }>): Promise<Advertisement>;
    /**
     * Get all advertisements with optional filters
     */
    getAllAdvertisements(filters?: {
        status?: string;
        category_id?: number;
        created_by?: number;
        is_featured?: boolean;
    }): Promise<Advertisement[]>;
    /**
     * Get advertisement by ID
     */
    getAdvertisementById(id: number): Promise<Advertisement | null>;
    /**
     * Get pending advertisements (for manager approval)
     */
    getPendingAdvertisements(): Promise<Advertisement[]>;
    /**
     * Approve advertisement (Manager only)
     */
    approveAdvertisement(id: number, managerId: number, approvalNotes?: string): Promise<Advertisement>;
    /**
     * Reject advertisement (Manager only)
     */
    rejectAdvertisement(id: number, managerId: number, rejectionReason: string): Promise<Advertisement>;
    /**
     * Publish advertisement (typically done after approval)
     */
    publishAdvertisement(id: number): Promise<Advertisement>;
    /**
     * Update advertisement (only if still pending)
     */
    updateAdvertisement(id: number, data: Partial<{
        title_en: string;
        title_ar: string;
        description_en: string;
        description_ar: string;
        category_id: number;
        start_date: Date;
        end_date: Date;
        is_featured: boolean;
    }>): Promise<Advertisement>;
    /**
     * Delete advertisement (only if not published)
     */
    deleteAdvertisement(id: number): Promise<void>;
    /**
     * Archive advertisement
     */
    archiveAdvertisement(id: number): Promise<Advertisement>;
    /**
     * Get advertisement categories
     */
    getCategories(isActive?: boolean): Promise<AdvertisementCategory[]>;
    /**
     * Get category by ID
     */
    getCategoryById(id: number): Promise<AdvertisementCategory | null>;
    /**
     * Create category (Admin only)
     */
    createCategory(data: {
        code: string;
        name_en: string;
        name_ar: string;
        description_en?: string;
        description_ar?: string;
        color_code?: string;
    }): Promise<AdvertisementCategory>;
    /**
     * Update category (Admin only)
     */
    updateCategory(id: number, data: Partial<AdvertisementCategory>): Promise<AdvertisementCategory>;
    /**
     * Track advertisement view
     */
    trackView(id: number): Promise<void>;
    /**
     * Track advertisement click
     */
    trackClick(id: number): Promise<void>;
}
export default MediaCenterService;
//# sourceMappingURL=MediaCenterService.d.ts.map