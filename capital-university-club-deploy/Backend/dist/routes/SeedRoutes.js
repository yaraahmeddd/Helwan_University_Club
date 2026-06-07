"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const initializePlans_1 = require("../utils/initializePlans");
const router = express_1.default.Router();
router.get('/plans', async (req, res) => {
    try {
        await (0, initializePlans_1.initializeDefaultPlans)();
        res.json({ success: true, message: 'Membership plans seeded successfully' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=SeedRoutes.js.map