import { Request, Response, NextFunction } from 'express';
/**
 * Extended Express Request with decoded JWT data
 */
export interface AuthenticatedRequest extends Request {
    user?: {
        account_id: number;
        email: string;
        role: string;
        staff_id?: number;
        staff_type_id?: number;
        member_id?: number;
        member_type_id?: number;
        privileges: string[];
        iat: number;
        exp: number;
    };
}
/**
 * Middleware to validate JWT token and check for required privilege
 * Must be used after express.json() middleware
 *
 * Usage:
 * app.post('/api/members', authorizePrivilege('CREATE_MEMBER'), MemberController.createMember);
 *
 * @param requiredPrivilege - The privilege code that must exist in the JWT token
 * @returns Express middleware function
 */
export declare function authorizePrivilege(requiredPrivilege: string): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
/**
 * Middleware to validate JWT token and check for any of multiple required privileges (OR logic)
 *
 * Usage:
 * app.post('/api/members/:id/edit', authorizeAnyPrivilege(['UPDATE_MEMBER', 'REVIEW_MEMBER']), MemberController.updateMember);
 *
 * @param requiredPrivileges - Array of privilege codes, at least one must exist in the JWT token
 * @returns Express middleware function
 */
export declare function authorizeAnyPrivilege(requiredPrivileges: string[]): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
/**
 * Middleware to validate JWT token and check for all required privileges (AND logic)
 *
 * Usage:
 * app.post('/api/members/:id/delete', authorizeAllPrivileges(['VIEW_MEMBERS', 'UPDATE_MEMBER']), MemberController.deleteMember);
 *
 * @param requiredPrivileges - Array of privilege codes, all must exist in the JWT token
 * @returns Express middleware function
 */
export declare function authorizeAllPrivileges(requiredPrivileges: string[]): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=authorizePrivilege.d.ts.map