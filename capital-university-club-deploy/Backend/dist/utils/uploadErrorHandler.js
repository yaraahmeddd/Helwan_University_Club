"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMulterErrorMessage = exports.asyncUploadHandler = void 0;
/**
 * Wrapper to handle Multer errors in async route handlers
 * Usage: router.post('/endpoint', upload.fields(...), asyncUploadHandler(async (req, res) => { ... }))
 */
const asyncUploadHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncUploadHandler = asyncUploadHandler;
/**
 * Extract error details from Multer error
 */
const getMulterErrorMessage = (err) => {
    const multerErr = err;
    if (multerErr.code === 'LIMIT_UNEXPECTED_FILE') {
        return {
            message: `Unexpected field: "${multerErr.field}". Please check field names match the API specification.`,
            field: multerErr.field
        };
    }
    if (multerErr.code === 'LIMIT_FILE_SIZE') {
        return { message: 'File is too large. Maximum file size is 5MB.' };
    }
    if (multerErr.code === 'LIMIT_FILE_COUNT') {
        return { message: 'Too many files uploaded.' };
    }
    if (err.message && err.message.includes('Only images and PDFs are allowed')) {
        return { message: err.message };
    }
    return { message: err.message || 'File upload error occurred' };
};
exports.getMulterErrorMessage = getMulterErrorMessage;
//# sourceMappingURL=uploadErrorHandler.js.map