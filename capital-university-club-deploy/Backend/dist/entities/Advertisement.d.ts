import { Staff } from './Staff';
import { AdvertisementPhoto } from './AdvertisementPhoto';
import { AdvertisementCategory } from './AdvertisementCategory';
export declare class Advertisement {
    id: number;
    title_en: string;
    title_ar: string;
    description_en: string;
    description_ar: string;
    status: 'pending' | 'approved' | 'rejected' | 'published' | 'archived';
    approval_status: 'pending' | 'approved' | 'rejected' | null;
    category: AdvertisementCategory;
    category_id: number;
    created_by_staff: Staff;
    created_by: number;
    approved_by_staff: Staff | null;
    approved_by: number | null;
    approved_at: Date | null;
    approval_notes: string | null;
    start_date: Date | null;
    end_date: Date | null;
    is_featured: boolean;
    view_count: number;
    click_count: number;
    created_at: Date;
    updated_at: Date;
    photos: AdvertisementPhoto[];
}
//# sourceMappingURL=Advertisement.d.ts.map