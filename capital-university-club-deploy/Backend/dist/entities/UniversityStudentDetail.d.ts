import { Member } from './Member';
import { Faculty } from './Faculty';
export declare class UniversityStudentDetail {
    id: number;
    member_id: number;
    faculty_id: number;
    graduation_year: number;
    enrollment_date: Date | null;
    student_proof: string | null;
    created_at: Date;
    updated_at: Date;
    member: Member;
    faculty: Faculty;
}
//# sourceMappingURL=UniversityStudentDetail.d.ts.map