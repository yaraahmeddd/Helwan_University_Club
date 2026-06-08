import { Member } from './Member';
import { Profession } from './Profession';
export declare class EmployeeDetail {
    id: number;
    member_id: number;
    profession_id: number;
    department_en: string;
    department_ar: string;
    salary: number;
    salary_slip: string;
    employment_start_date: Date | null;
    created_at: Date;
    updated_at: Date;
    member: Member;
    profession: Profession;
}
//# sourceMappingURL=EmployeeDetail.d.ts.map