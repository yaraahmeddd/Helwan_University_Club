import { Request, Response } from 'express';
export declare class MembershipController {
    private static membershipRepo;
    static getAllPlans(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getPlan(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=MembershipController.d.ts.map