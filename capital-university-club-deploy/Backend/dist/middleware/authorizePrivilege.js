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
exports.authorizePrivilege = authorizePrivilege;
exports.authorizeAnyPrivilege = authorizeAnyPrivilege;
exports.authorizeAllPrivileges = authorizeAllPrivileges;
const jwt = __importStar(require("jsonwebtoken"));
/**
 * Middleware to validate JWT token and check for required privilege
 * Must be used after express.json() middleware
 *
 * Usage:
 * app.post('/api/members', authorizePrivilege('CREATE_MEMBER'), MemberController.createMember);
 *
 * @param requiredPrivilege - The privilege code that must exist in the JWT token
 * @returns Express middleware function
 */
function authorizePrivilege(requiredPrivilege) {
    return (req, res, next) => {
        try {
            // Extract token from Authorization header
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                res.status(401).json({
                    success: false,
                    message: 'Missing or invalid Authorization header. Expected: Bearer <token>',
                });
                return;
            }
            const token = authHeader.substring(7); // Remove "Bearer " prefix
            const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
            // Verify and decode JWT token
            let decoded;
            try {
                decoded = jwt.verify(token, JWT_SECRET);
            }
            catch (err) {
                const error = err;
                if (error.name === 'TokenExpiredError') {
                    res.status(401).json({
                        success: false,
                        message: 'Token has expired',
                    });
                    return;
                }
                else if (error.name === 'JsonWebTokenError') {
                    res.status(401).json({
                        success: false,
                        message: 'Invalid token',
                    });
                    return;
                }
                throw err;
            }
            // Verify this is a staff member (only staff have privilege-based access to these endpoints)
            if (!decoded.staff_id) {
                res.status(403).json({
                    success: false,
                    message: 'Only staff members with valid privileges can access this endpoint',
                });
                return;
            }
            // ADMIN role bypass — admins have unrestricted access to all endpoints
            if (decoded.role?.toLowerCase() === 'admin') {
                req.user = decoded;
                next();
                return;
            }
            // Extract privileges array from token
            const tokenPrivileges = decoded.privileges || [];
            // Check if required privilege exists in token
            if (!tokenPrivileges.includes(requiredPrivilege)) {
                res.status(403).json({
                    success: false,
                    message: `Insufficient permissions. Required privilege: ${requiredPrivilege}`,
                    missingPrivilege: requiredPrivilege,
                });
                return;
            }
            // Attach decoded user data to request object for use in route handlers
            req.user = decoded;
            // Proceed to next middleware/route handler
            next();
        }
        catch (error) {
            console.error('Authorization error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during authorization',
            });
        }
    };
}
/**
 * Middleware to validate JWT token and check for any of multiple required privileges (OR logic)
 *
 * Usage:
 * app.post('/api/members/:id/edit', authorizeAnyPrivilege(['UPDATE_MEMBER', 'REVIEW_MEMBER']), MemberController.updateMember);
 *
 * @param requiredPrivileges - Array of privilege codes, at least one must exist in the JWT token
 * @returns Express middleware function
 */
function authorizeAnyPrivilege(requiredPrivileges) {
    return (req, res, next) => {
        try {
            // Extract token from Authorization header
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                res.status(401).json({
                    success: false,
                    message: 'Missing or invalid Authorization header. Expected: Bearer <token>',
                });
                return;
            }
            const token = authHeader.substring(7);
            const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
            // Verify and decode JWT token
            let decoded;
            try {
                decoded = jwt.verify(token, JWT_SECRET);
            }
            catch (err) {
                const error = err;
                if (error.name === 'TokenExpiredError') {
                    res.status(401).json({
                        success: false,
                        message: 'Token has expired',
                    });
                    return;
                }
                else if (error.name === 'JsonWebTokenError') {
                    res.status(401).json({
                        success: false,
                        message: 'Invalid token',
                    });
                    return;
                }
                throw err;
            }
            // Verify this is a staff member
            if (!decoded.staff_id) {
                res.status(403).json({
                    success: false,
                    message: 'Only staff members with valid privileges can access this endpoint',
                });
                return;
            }
            // ADMIN role bypass — admins have unrestricted access to all endpoints
            if (decoded.role?.toLowerCase() === 'admin') {
                req.user = decoded;
                next();
                return;
            }
            // Extract privileges array from token
            const tokenPrivileges = decoded.privileges || [];
            // Check if at least one required privilege exists in token (OR logic)
            const hasPrivilege = requiredPrivileges.some((priv) => tokenPrivileges.includes(priv));
            if (!hasPrivilege) {
                res.status(403).json({
                    success: false,
                    message: `Insufficient permissions. Required any of: ${requiredPrivileges.join(', ')}`,
                    missingPrivileges: requiredPrivileges,
                });
                return;
            }
            // Attach decoded user data to request object
            req.user = decoded;
            next();
        }
        catch (error) {
            console.error('Authorization error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during authorization',
            });
        }
    };
}
/**
 * Middleware to validate JWT token and check for all required privileges (AND logic)
 *
 * Usage:
 * app.post('/api/members/:id/delete', authorizeAllPrivileges(['VIEW_MEMBERS', 'UPDATE_MEMBER']), MemberController.deleteMember);
 *
 * @param requiredPrivileges - Array of privilege codes, all must exist in the JWT token
 * @returns Express middleware function
 */
function authorizeAllPrivileges(requiredPrivileges) {
    return (req, res, next) => {
        try {
            // Extract token from Authorization header
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                res.status(401).json({
                    success: false,
                    message: 'Missing or invalid Authorization header. Expected: Bearer <token>',
                });
                return;
            }
            const token = authHeader.substring(7);
            const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
            // Verify and decode JWT token
            let decoded;
            try {
                decoded = jwt.verify(token, JWT_SECRET);
            }
            catch (err) {
                const error = err;
                if (error.name === 'TokenExpiredError') {
                    res.status(401).json({
                        success: false,
                        message: 'Token has expired',
                    });
                    return;
                }
                else if (error.name === 'JsonWebTokenError') {
                    res.status(401).json({
                        success: false,
                        message: 'Invalid token',
                    });
                    return;
                }
                throw err;
            }
            // Verify this is a staff member
            if (!decoded.staff_id) {
                res.status(403).json({
                    success: false,
                    message: 'Only staff members with valid privileges can access this endpoint',
                });
                return;
            }
            // ADMIN role bypass — admins have unrestricted access to all endpoints
            if (decoded.role?.toLowerCase() === 'admin') {
                req.user = decoded;
                next();
                return;
            }
            // Extract privileges array from token
            const tokenPrivileges = decoded.privileges || [];
            // Check if all required privileges exist in token (AND logic)
            const allPrivilegesPresent = requiredPrivileges.every((priv) => tokenPrivileges.includes(priv));
            if (!allPrivilegesPresent) {
                const missingPrivileges = requiredPrivileges.filter((priv) => !tokenPrivileges.includes(priv));
                res.status(403).json({
                    success: false,
                    message: `Insufficient permissions. Missing privileges: ${missingPrivileges.join(', ')}`,
                    missingPrivileges: missingPrivileges,
                });
                return;
            }
            // Attach decoded user data to request object
            req.user = decoded;
            next();
        }
        catch (error) {
            console.error('Authorization error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error during authorization',
            });
        }
    };
}
//# sourceMappingURL=authorizePrivilege.js.map