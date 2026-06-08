import { Request, Response } from 'express';
interface AuthenticatedRequest extends Request {
    user?: {
        staff_id?: number;
        id?: number;
        email?: string;
        [key: string]: unknown;
    };
}
/**
 * AnnouncementController
 *
 * Handles announcements for promoting sports:
 * - Admin: Create, update, delete, publish announcements
 * - Users: View published announcements, click to subscribe
 */
export declare class AnnouncementController {
    private announcementService;
    constructor();
    /**
     * CREATE - Create a new announcement
     * POST /api/announcements
     * Admin only
     */
    createAnnouncement: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    /**
     * READ - Get announcement by ID
     * GET /api/announcements/:announcementId
     */
    getAnnouncementById: (req: Request, res: Response) => Promise<void>;
    /**
     * READ - Get all announcements (admin)
     * GET /api/announcements?sport_id=1&branch_id=1&status=published
     */
    getAllAnnouncements: (req: Request, res: Response) => Promise<void>;
    /**
     * READ - Get public announcements (users)
     * GET /api/announcements/public?sport_id=1&branch_id=1&target_role=member
     */
    getPublicAnnouncements: (req: Request, res: Response) => Promise<void>;
    /**
     * READ - Get announcements by sport
     * GET /api/announcements/sport/:sportId
     */
    getAnnouncementsBySport: (req: Request, res: Response) => Promise<void>;
    /**
     * UPDATE - Update announcement
     * PUT /api/announcements/:announcementId
     * Admin only
     */
    updateAnnouncement: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    /**
     * ACTION - Publish announcement
     * PATCH /api/announcements/:announcementId/publish
     * Admin only
     */
    publishAnnouncement: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    /**
     * ACTION - Archive announcement
     * PATCH /api/announcements/:announcementId/archive
     * Admin only
     */
    archiveAnnouncement: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    /**
     * DELETE - Delete announcement
     * DELETE /api/announcements/:announcementId
     * Admin only
     */
    deleteAnnouncement: (req: AuthenticatedRequest, res: Response) => Promise<void>;
    /**
     * ACTION - Record announcement click
     * POST /api/announcements/:announcementId/click
     */
    recordClick: (req: Request, res: Response) => Promise<void>;
    /**
     * READ - Get trending announcements
     * GET /api/announcements/trending
     */
    getTrendingAnnouncements: (req: Request, res: Response) => Promise<void>;
}
export {};
//# sourceMappingURL=AnnouncementController.d.ts.map