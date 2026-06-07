import { Account } from './Account';
import { StaffType } from './StaffType';
export declare class Staff {
    id: number;
    account_id: number;
    account: Account;
    staff_type_id: number;
    staff_type: StaffType;
    first_name_en: string;
    first_name_ar: string;
    last_name_en: string;
    last_name_ar: string;
    national_id: string;
    phone: string;
    address: string;
    employment_start_date: Date;
    employment_end_date: Date | null;
    status: string;
    is_active: boolean;
    /** Academic qualification certificate (original/copy) */
    academic_certificate: string | null;
    /** National ID card — front side (valid) */
    national_id_front: string | null;
    /** National ID card — back side (valid) */
    national_id_back: string | null;
    /** Military service status document (males only; original/copy) */
    military_service_doc: string | null;
    /** Criminal record certificate — original (for non-university employees) */
    criminal_record: string | null;
    /** Employer approval letter */
    employer_approval_letter: string | null;
    /** Employment status statement (for those working in other organisations) */
    employment_status_statement: string | null;
    /** Good conduct certificate (for those NOT working in other organisations) */
    good_conduct_certificate: string | null;
    /** Recent personal photo */
    personal_photo: string | null;
    /** Completed personal-information (acquaintance) form */
    personal_info_form: string | null;
    /** Experience certificates and training course copies (if available) */
    experience_certificates: string | null;
    created_at: Date;
    updated_at: Date;
}
//# sourceMappingURL=Staff.d.ts.map