import { Request, Response, NextFunction } from 'express';
interface IErrorResponse {
    message: string;
    field?: string;
}
/**
 * Wrapper to handle Multer errors in async route handlers
 * Usage: router.post('/endpoint', upload.fields(...), asyncUploadHandler(async (req, res) => { ... }))
 */
export declare const asyncUploadHandler: (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Extract error details from Multer error
 */
export declare const getMulterErrorMessage: (err: Error) => IErrorResponse;
export {};
//# sourceMappingURL=uploadErrorHandler.d.ts.map