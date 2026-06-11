import { Router } from 'express';
import { PaymobController } from '../controllers/PaymobController';
import { authenticate } from '../middleware/auth';

const router = Router();
const controller = new PaymobController();

router.post('/start', authenticate, (req, res) => controller.start(req, res));
router.get('/status/:paymentReference', authenticate, (req, res) => controller.status(req, res));
router.post('/webhook', (req, res) => controller.webhook(req, res));
router.get('/redirect', (req, res) => controller.redirect(req, res));

export default router;
