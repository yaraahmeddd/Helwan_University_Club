import { Member } from './Member';
import { Branch } from './Branch';
export declare class OutsiderDetail {
    id: number;
    member_id: number;
    job_title_en: string | null;
    job_title_ar: string | null;
    employment_status: string;
    branch_id: number | null;
    visitor_type: string;
    passport_number: string | null;
    passport_photo: string | null;
    country: string | null;
    visa_status: string | null;
    duration_months: number | null;
    is_installable: boolean;
    created_at: Date;
    updated_at: Date;
    member: Member;
    branch: Branch;
}
//# sourceMappingURL=OutsiderDetail.d.ts.map