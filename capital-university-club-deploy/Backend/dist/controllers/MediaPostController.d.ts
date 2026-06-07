import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authorizePrivilege';
export declare class MediaPostController {
    private static mediaRepo;
    private static logAction;
    static getAllPosts(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getPostById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static createPost(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static updatePost(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static deletePost(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=MediaPostController.d.ts.map