"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const ParticipantRegistrationController_1 = require("../controllers/ParticipantRegistrationController");
const router = express_1.default.Router();
const controller = new ParticipantRegistrationController_1.ParticipantRegistrationController();
// ============================================================================
// Multer Configuration for Participant ID Upload (Memory Storage for Cloudinary)
// ============================================================================
const storage = multer_1.default.memoryStorage(); // Store files in memory buffer for Cloudinary upload
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max per file
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            cb(null, true);
        }
        else {
            cb(new Error("Only JPEG, PNG, and PDF files are allowed for national ID photos"));
        }
    }
});
// ============================================================================
// Public Routes (No Authentication Required)
// ============================================================================
/**
 * GET /api/bookings/join/:shareToken
 * Get booking details by share token
 * Public endpoint - anyone with the link can view
 */
router.get("/join/:shareToken", controller.getBookingByShareToken.bind(controller));
/**
 * POST /api/bookings/join/:shareToken
 * Register participant via share token
 * Public endpoint - anyone with the link can register
 * Accepts multipart/form-data with optional file uploads
 */
router.post("/join/:shareToken", upload.fields([
    { name: "national_id_front", maxCount: 1 },
    { name: "national_id_back", maxCount: 1 }
]), controller.registerParticipant.bind(controller));
exports.default = router;
//# sourceMappingURL=participantRegistration.js.map