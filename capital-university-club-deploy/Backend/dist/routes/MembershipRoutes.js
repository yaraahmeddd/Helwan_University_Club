"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const MembershipController_1 = require("../controllers/MembershipController");
const router = (0, express_1.Router)();
// Get all membership plans
router.get('/', (req, res) => MembershipController_1.MembershipController.getAllPlans(req, res));
// Get single membership plan
router.get('/:id', (req, res) => MembershipController_1.MembershipController.getPlan(req, res));
exports.default = router;
//# sourceMappingURL=MembershipRoutes.js.map