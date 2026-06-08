import { Request, Response } from 'express';
export declare class RegistrationController {
    /**
     * GET /register/member-type-info?code=MEMBER_TYPE_CODE
     * Returns classification and form schema key for a given member type code
     */
    getMemberTypeInfo(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /register/member-types
     * Step 0a: Returns all available member types from DB with their
     * classification (Internal/External) and the form schema key.
     * Frontend uses this to render the member-type picker.
     */
    getMemberTypes(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * POST /register/choose-member-type
     * Step 0b: Client selects a member type ID and then chooses
     * "member" or "team_member". Returns the classification,
     * registration form key, and next steps.
     *
     * Body: { member_type_id: number, role: 'member' | 'team_member' }
     */
    chooseMemberType(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * STEP 0: Choose Role
     * Route: POST /register/choose-role
     */
    chooseRole(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * STEP 1: Register basic information
     * Route: POST /register/basic
     */
    registerBasic(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * STEP 2: Get salary brackets
     * Route: GET /register/salary-brackets
     */
    getSalaryBrackets(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * STEP 2: Get dependent tiers
     * Route: GET /register/dependent-tiers
     */
    getDependentTiers(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * STEP 3: Determine membership type based on answers
     * Route: POST /register/determine-membership
     */
    determineMembership(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * STEP 4: Complete registration and create membership record
     * Route: POST /register/complete
     */
    completeRegistration(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * COMPLETE WORKING MEMBER REGISTRATION
     * Route: POST /register/register-working-member
     * Registers in: accounts → members → employee_details → membership
     */
    registerCompleteWorkingMember(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * COMPLETE RETIRED MEMBER REGISTRATION
     * Route: POST /register/register-retired-member
     * Registers in: accounts → members → retired_employee_details → membership
     */
    registerCompleteRetiredMember(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * COMPLETE STUDENT MEMBER REGISTRATION
     * Route: POST /register/register-student-member
     * Registers in: accounts → members → university_student_details → membership
     */
    registerCompleteStudentMember(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
declare const _default: RegistrationController;
export default _default;
//# sourceMappingURL=RegistrationController.d.ts.map