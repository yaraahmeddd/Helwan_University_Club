import { Request, Response } from 'express';
/**
 * Authentication Controller
 * Handles login for all user types: Staff, Members, and other account holders
 */
export declare class AuthController {
    private accountRepository;
    private staffRepository;
    private memberRepository;
    private teamMemberRepository;
    private auditLogService;
    constructor();
    /**
     * POST /auth/login
     *
     * Universal login for all account types:
     * 1. Staff Login: Email + password OR National ID + National ID (first login)
     * 2. Member Login: Email + password OR National ID + National ID (first login)
     * 3. Any account role: admin, staff, member, moderator
     */
    login(req: Request, res: Response): Promise<void>;
    /**
     * POST /auth/change-credentials
     *
     * For staff/members: Change email and password on first login
     * Required: JWT token from first login
     * Works for both staff and members
     */
    changeCredentials(req: Request, res: Response): Promise<void>;
    /**
     * GET /auth/me
     * Get current logged-in user's information
     * Requires: Valid JWT token
     */
    /**
     * GET /auth/me
     * Get current logged-in user's information
     *
     * Requires: Valid JWT token in Authorization header
     * Returns: Current user's profile data including account info, role, privileges
     */
    getCurrentUser(req: Request, res: Response): Promise<void>;
    /**
     * PUT /auth/me/profile
     * Allows a logged-in member to update their own profile data.
     * Requires: Valid JWT token (authenticate middleware only — no admin privilege needed).
     */
    updateMyProfile(req: Request, res: Response): Promise<void>;
}
declare const _default: AuthController;
export default _default;
//# sourceMappingURL=AuthController.d.ts.map