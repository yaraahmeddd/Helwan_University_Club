"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireExecutiveOrAdmin = exports.requireAdmin = exports.authenticate = void 0;
const jwt = __importStar(require("jsonwebtoken"));
/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches staff information to request
 */
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'No authorization token provided',
            });
            return;
        }
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        const secret = process.env.JWT_SECRET || 'your-secret-key';
        const decoded = jwt.verify(token, secret);
        // Attach user info to request
        req.user = decoded;
        next();
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Token verification failed';
        res.status(403).json({
            success: false,
            message: 'Invalid or expired token',
            error: errorMessage,
        });
    }
};
exports.authenticate = authenticate;
/**
 * Admin Authorization Middleware
 * Checks if the authenticated user is an admin
 */
const requireAdmin = (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
            return;
        }
        // Check if user is admin (staff_type_id = 1 for ADMIN)
        const staffTypeId = user.staff_type_id;
        if (staffTypeId !== 1) {
            res.status(403).json({
                success: false,
                message: 'Only administrators can perform this action',
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
exports.requireAdmin = requireAdmin;
/**
 * Executive Manager Authorization Middleware
 * Checks if user is admin or executive manager
 */
const requireExecutiveOrAdmin = (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
            return;
        }
        const staffTypeId = user.staff_type_id;
        // Staff type ID: 1 = Admin, 2 = Executive Manager
        if (staffTypeId !== 1 && staffTypeId !== 2) {
            res.status(403).json({
                success: false,
                message: 'Only administrators and executive managers can perform this action',
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
exports.requireExecutiveOrAdmin = requireExecutiveOrAdmin;
//# sourceMappingURL=auth.js.map