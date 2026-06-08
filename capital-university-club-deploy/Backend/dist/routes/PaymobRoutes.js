"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PaymobController_1 = require("../controllers/PaymobController");
const router = (0, express_1.Router)();
const controller = new PaymobController_1.PaymobController();
router.post('/start', (req, res) => controller.start(req, res));
router.post('/webhook', (req, res) => controller.webhook(req, res));
router.get('/redirect', (req, res) => controller.redirect(req, res));
exports.default = router;
//# sourceMappingURL=PaymobRoutes.js.map