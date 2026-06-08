import { Request, Response } from 'express';
export declare class DetailedRegistrationController {
    /**
     * GET /register/branches
     * Returns list of all branches for visitor-branch selection
     */
    static getBranches(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /register/visitor-types
     * Returns list of visitor membership types (excluding VISITOR_STUDENT if exists)
     */
    static getVisitorMembershipTypes(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /register/employment-status
     * Returns list of employment status options
     */
    static getEmploymentStatusOptions(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * POST /register/details/visitor
     * Submit detailed information for visitor members
     * Body: {
     *   member_id: number,
     *   job_title_en?: string,
     *   job_title_ar?: string,
     *   employment_status?: string,
     *   visitor_type: string (visitor, visitor-honorary, visitor-athletic, visitor-branch),
     *   branch_id?: number (required if visitor_type is visitor-branch),
     *   health_status?: string,
     *   address?: string,
     *   national_id_front?: file,
     *   national_id_back?: file,
     *   personal_photo?: file,
     *   medical_report?: file
     * }
     */
    static submitVisitorDetails(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * POST /register/details/working
     * Submit detailed information for working members
     * Body: {
     *   member_id: number,
     *   profession_id: number,
     *   department_en: string,
     *   department_ar: string,
     *   salary: number,
     *   salary_slip?: file,
     *   employment_start_date: Date,
     *   university_id: number,
     *   national_id_front?: file,
     *   national_id_back?: file,
     *   personal_photo?: file,
     *   medical_report?: file,
     *   address?: string
     * }
     */
    static submitWorkingDetails(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * POST /register/details/retired
     * Submit detailed information for retired members
     * Body: {
     *   member_id: number,
     *   university_id: number,
     *   former_department_en: string,
     *   former_department_ar: string,
     *   retirement_date: Date,
     *   national_id_front?: file,
     *   national_id_back?: file,
     *   personal_photo?: file,
     *   medical_report?: file,
     *   address?: string
     * }
     */
    static submitRetiredDetails(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * POST /register/details/student
     * Submit detailed information for student members
     * Body: {
     *   member_id: number,
     *   university_id: number,
     *   faculty_id: number,
     *   graduation_year: number,
     *   enrollment_date: Date,
     *   national_id_front?: string (file path),
     *   national_id_back?: string (file path),
     *   personal_photo?: string (file path),
     *   medical_report?: string (file path),
     *   address?: string
     * }
     */
    static submitStudentDetails(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /register/status/:member_id
     * Get member registration status and what information has been submitted
     */
    static getMemberStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export default DetailedRegistrationController;
//# sourceMappingURL=DetailedRegistrationController.d.ts.map