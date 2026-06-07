"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSportStaff = exports.requireSportManager = void 0;
/**
 * Sport Activity Manager Authorization Middleware
 * Checks if user is a Sport Activity Manager
 */
const requireSportManager = (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
            return;
        }
        const staffTypeCode = user.staff_type_code;
        if (staffTypeCode !== 'SPORT_MANAGER') {
            res.status(403).json({
                success: false,
                message: 'Only Sport Activity Managers can perform this action',
            });
            return;
        }
        next();
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Authorization check failed';
        res.status(500).json({
            success: false,
            message: 'Authorization check error',
            error: errorMessage,
        });
    }
};
exports.requireSportManager = requireSportManager;
/**
 * Sport Activity Specialist or Manager Authorization Middleware
 * Checks if user is either a Sport Activity Specialist or Manager
 */
const requireSportStaff = (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
            return;
        }
        const staffTypeCode = user.staff_type_code;
        if (staffTypeCode !== 'SPORT_MANAGER' && staffTypeCode !== 'SPORT_SPECIALIST') {
            res.status(403).json({
                success: false,
                message: 'Only Sport Activity staff can perform this action',
            });
            return;
        }
        next();
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Authorization check failed';
        res.status(500).json({
            success: false,
            message: 'Authorization check error',
            error: errorMessage,
        });
    }
};
exports.requireSportStaff = requireSportStaff;
//# sourceMappingURL=sportAuth.js.map