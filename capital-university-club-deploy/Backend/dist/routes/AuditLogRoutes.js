"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuditLogController_1 = require("../controllers/AuditLogController");
// import { authenticate } from '../middleware/authenticate'; // Assuming authentication is needed
const router = (0, express_1.Router)();
// Assuming you have authentication middleware, uncomment the next line
// router.use(authenticate);
router.get('/', AuditLogController_1.getAuditLogs);
router.get('/filters', AuditLogController_1.getFilterOptions);
router.get('/stats', AuditLogController_1.getAuditStats);
exports.default = router;
//# sourceMappingURL=AuditLogRoutes.js.map