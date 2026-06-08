import { Announcement } from '../entities/Announcement';
/**
 * AnnouncementService
 *
 * Handles business logic for managing announcements
 * Announcements are used to promote sports and drive subscriptions
 */
export declare class AnnouncementService {
    private repo;
    constructor();
    /**
     * Create a new announcement
     */
    createAnnouncement(data: {
        sport_id: number;
        branch_id?: number | null;
        created_by_staff_id: number;
        title_en: string;
        title_ar: string;
        description_en?: string | null;
        description_ar?: string | null;
        banner_image?: string | null;
        thumbnail_image?: string | null;
        external_link?: string | null;
        target_role?: string | null;
        min_age?: number;
        max_age?: number;
        priority?: number;
        expires_at?: Date | null;
    }): Promise<Announcement>;
    /**
     * Get announcement by ID
     */
    getAnnouncementById(announcementId: number): Promise<Announcement | null>;
    /**
     * Get all announcements (with optional filters)
     */
    getAllAnnouncements(filters?: {
        sport_id?: number;
        branch_id?: number;
        status?: string;
        is_visible?: boolean;
    }): Promise<Announcement[]>;
    /**
     * Get published announcements visible to users
     */
    getPublicAnnouncements(filters?: {
        sport_id?: number;
        branch_id?: number;
        target_role?: string;
        minAge?: number;
        maxAge?: number;
    }): Promise<Announcement[]>;
    /**
     * Get announcements for a specific sport
     */
    getAnnouncementsBySport(sportId: number, publishedOnly?: boolean): Promise<Announcement[]>;
    /**
     * Update announcement
     */
    updateAnnouncement(announcementId: number, data: any): Promise<Announcement | null>;
    /**
     * Publish announcement (change status to published)
     */
    publishAnnouncement(announcementId: number): Promise<Announcement | null>;
    /**
     * Archive announcement
     */
    archiveAnnouncement(announcementId: number): Promise<Announcement | null>;
    /**
     * Delete announcement
     */
    deleteAnnouncement(announcementId: number): Promise<boolean>;
    /**
     * Increment view count
     */
    recordView(announcementId: number): Promise<void>;
    /**
     * Increment click count
     */
    recordClick(announcementId: number): Promise<void>;
    /**
     * Increment subscription count
     */
    recordSubscription(announcementId: number): Promise<void>;
    /**
     * Get trending announcements (by clicks)
     */
    getTrendingAnnouncements(limit?: number): Promise<Announcement[]>;
    /**
     * Get announcements with highest subscription conversion
     */
    getTopPerformingAnnouncements(limit?: number): Promise<Announcement[]>;
}
//# sourceMappingURL=AnnouncementService.d.ts.map