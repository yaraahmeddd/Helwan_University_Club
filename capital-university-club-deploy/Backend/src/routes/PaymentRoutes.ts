import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController';
import { authenticate } from '../middleware/auth';
import { authorizePrivilege } from '../middleware/authorizePrivilege';

const router = Router();
const controller = new PaymentController();

router.get(
  '/recent',
  authenticate,
  authorizePrivilege('VIEW_FINANCE'),
  (req, res) => controller.listRecent(req, res),
);

router.get(
  '/subscription-alerts',
  authenticate,
  authorizePrivilege('VIEW_FINANCE'),
  (req, res) => controller.subscriptionAlerts(req, res),
);

export default router;
