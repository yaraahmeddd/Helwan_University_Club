import { Request, Response, NextFunction } from 'express';
/**
 * Sport Activity Manager Authorization Middleware
 * Checks if user is a Sport Activity Manager
 */
export declare const requireSportManager: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Sport Activity Specialist or Manager Authorization Middleware
 * Checks if user is either a Sport Activity Specialist or Manager
 */
export declare const requireSportStaff: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=sportAuth.d.ts.map