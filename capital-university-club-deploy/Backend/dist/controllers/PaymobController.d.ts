import { Request, Response } from 'express';
export declare class PaymobController {
    private paymobService;
    private paymentService;
    private finalizationService;
    private paymentRepo;
    private getBackendBaseUrl;
    private getFrontendBaseUrl;
    private buildRedirectUrl;
    start(req: Request, res: Response): Promise<void>;
    webhook(req: Request, res: Response): Promise<void>;
    redirect(req: Request, res: Response): Promise<void>;
    status(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=PaymobController.d.ts.map