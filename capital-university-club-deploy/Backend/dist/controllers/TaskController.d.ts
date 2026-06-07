import { Request, Response } from 'express';
export declare class TaskController {
    private static taskRepo;
    static getAllTasks(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static createTask(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static updateTaskStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=TaskController.d.ts.map