import { Request, Response } from 'express';
export declare class StudentMemberController {
    /**
     * Get student/graduate status options
     * GET /register/student/statuses
     */
    static getStudentStatusOptions(req: Request, res: Response): Promise<void>;
    /**
     * Get relationship types for dependents
     * GET /register/student/relationship-types
     */
    static getRelationshipTypes(req: Request, res: Response): Promise<void>;
    /**
     * Get active members for dependent selection
     * GET /register/student/active-members
     */
    static getActiveMembers(req: Request, res: Response): Promise<void>;
    /**
     * Submit student member details (name, email, password, phone, etc.)
     * POST /register/student-details
     * Body: {
     *   member_id: number,
     *   university_id: number,
     *   graduation_year: number,
     *   status_proof: string (path to certificate/ID)
     * }
     */
    static submitStudentMemberDetails(req: Request, res: Response): Promise<void>;
    /**
     * Calculate student/graduate membership price
     * POST /register/calculate-student-membership-price
     * Body: {
     *   student_status: 'STUDENT' | 'GRADUATE'
     * }
     */
    static calculateMembershipPrice(req: Request, res: Response): Promise<void>;
    /**
     * Create student/graduate membership
     * POST /register/student-membership
     * Body: {
     *   member_id: number,
     *   student_status: 'STUDENT' | 'GRADUATE'
     * }
     */
    static createStudentMembership(req: Request, res: Response): Promise<void>;
    /**
     * Calculate dependent membership price (40% discount)
     * POST /register/calculate-student-dependent-price
     * Body: {
     *   related_member_id: number
     * }
     */
    static calculateDependentMembershipPrice(req: Request, res: Response): Promise<void>;
    /**
     * Create student/graduate dependent membership
     * POST /register/student-dependent-membership
     * Body: {
     *   member_id: number,
     *   related_member_id: number,
     *   relationship_type: string,
     *   proof_document: string
     * }
     */
    static createStudentDependentMembership(req: Request, res: Response): Promise<void>;
    /**
     * Get student member complete status and details
     * GET /register/student-status/:member_id
     */
    static getStudentMemberStatus(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=StudentMemberController.d.ts.map