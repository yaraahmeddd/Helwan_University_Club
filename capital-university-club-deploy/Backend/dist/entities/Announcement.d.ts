import { Sport } from './Sport';
import { Branch } from './Branch';
import { Staff } from './Staff';
/**
 * Announcement Entity
 *
 * Represents announcements created by admins to promote sports.
 * When users click on an announcement, they're redirected to the sport's subscription page
 * filtered by the specific branch (if specified).
 */
export declare class Announcement {
    id: number;
    sport_id: number;
    branch_id: number | null;
    created_by_staff_id: number;
    title_en: string;
    title_ar: string;
    description_en: string | null;
    description_ar: string | null;
    banner_image: string | null;
    thumbnail_image: string | null;
    external_link: string | null;
    status: string;
    is_visible: boolean;
    priority: number;
    published_at: Date | null;
    expires_at: Date | null;
    view_count: number;
    click_count: number;
    subscription_count: number;
    target_role: string | null;
    min_age: number;
    max_age: number;
    created_at: Date;
    updated_at: Date;
    sport: Sport;
    branch: Branch | null;
    created_by: Staff;
}
//# sourceMappingURL=Announcement.d.ts.map