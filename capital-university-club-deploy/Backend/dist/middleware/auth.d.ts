import { Request, Response, NextFunction } from 'express';
/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches staff information to request
 */
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Admin Authorization Middleware
 * Checks if the authenticated user is an admin
 */
export declare const requireAdmin: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Executive Manager Authorization Middleware
 * Checks if user is admin or executive manager
 */
export declare const requireExecutiveOrAdmin: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map