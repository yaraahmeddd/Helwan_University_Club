"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TeamMemberController_1 = require("../controllers/TeamMemberController");
const upload_1 = require("../middleware/upload");
const auth_1 = require("../middleware/auth");
const data_source_1 = require("../database/data-source");
const StaffType_1 = require("../entities/StaffType");
const router = (0, express_1.Router)();
const controller = new TeamMemberController_1.TeamMemberController();
// POST /register/details/team-member
router.post('/details/team-member', upload_1.upload.fields([
    { name: 'personal_photo', maxCount: 1 },
    { name: 'medical_report', maxCount: 1 },
    { name: 'national_id_front', maxCount: 1 },
    { name: 'national_id_back', maxCount: 1 },
    { name: 'proof', maxCount: 1 },
]), controller.submitDetails);
// POST /register/team-member/select-teams
router.post('/team-member/select-teams', controller.selectTeams);
// GET /register/team-member/status/:member_id
router.get('/team-member/status/:member_id', controller.getStatus);
// GET /register/team-member/details/:member_id
// Returns full member profile (photo, DOB, address, etc.)
router.get('/team-member/details/:member_id', controller.getDetails);
router.put('/team-member/details/:member_id', auth_1.authenticate, upload_1.upload.fields([
    { name: 'personal_photo', maxCount: 1 },
    { name: 'medical_report', maxCount: 1 },
    { name: 'national_id_front', maxCount: 1 },
    { name: 'national_id_back', maxCount: 1 },
    { name: 'proof', maxCount: 1 },
]), controller.updateProfile);
// GET /register/team-member/review-all
// Secured route for Sport Staff
const authorizeSportStaff = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user || !user.staff_type_id) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const staffTypeRepo = data_source_1.AppDataSource.getRepository(StaffType_1.StaffType);
        const staffType = await staffTypeRepo.findOne({ where: { id: user.staff_type_id } });
        if (!staffType || (staffType.code !== 'SPORT_MANAGER' && staffType.code !== 'SPORT_SPECIALIST')) {
            res.status(403).json({ error: 'Access denied. Only Sport Manager or Specialist allowed.' });
            return;
        }
        next();
    }
    catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
router.get('/team-member/review-all', auth_1.authenticate, authorizeSportStaff, controller.reviewAllTeamMemberData);
exports.default = router;
//# sourceMappingURL=TeamMemberRoutes.js.map