"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractPublicIdFromUrl = exports.deleteFromCloudinary = exports.uploadToCloudinaryLegacy = exports.uploadToCloudinary = exports.buildCloudinaryPath = exports.UserType = exports.DocumentType = void 0;
const cloudinary_1 = require("cloudinary");
const stream_1 = require("stream");
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dkjnugbsd',
    api_key: process.env.CLOUDINARY_API_KEY || '532636498527284',
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
/**
 * Document types for organizing uploads
 */
var DocumentType;
(function (DocumentType) {
    DocumentType["PERSONAL_PHOTO"] = "personal-photos";
    DocumentType["NATIONAL_ID"] = "national-ids";
    DocumentType["MEDICAL_REPORT"] = "medical-reports";
    DocumentType["PROOF"] = "proofs";
    DocumentType["PASSPORT"] = "passports";
    DocumentType["SALARY_SLIP"] = "salary-slips";
    DocumentType["STUDENT_PROOF"] = "student-proofs";
    DocumentType["MEDIA"] = "media";
    DocumentType["ADVERTISEMENT"] = "advertisements";
    DocumentType["OTHER"] = "other";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
/**
 * User types for organizing uploads
 */
var UserType;
(function (UserType) {
    UserType["MEMBER"] = "members";
    UserType["TEAM_MEMBER"] = "team-members";
    UserType["STAFF"] = "staff";
    UserType["PARTICIPANT"] = "participants";
})(UserType || (exports.UserType = UserType = {}));
/**
 * Build Cloudinary folder path based on document type and user type
 * Structure: helwan-club/{document-type}/{user-type}
 * Example: helwan-club/national-ids/members
 *
 * @param documentType - Type of document being uploaded
 * @param userType - Type of user uploading the document
 * @returns Formatted folder path
 */
const buildCloudinaryPath = (documentType, userType) => {
    return `helwan-club/${documentType}/${userType}`;
};
exports.buildCloudinaryPath = buildCloudinaryPath;
/**
 * Upload a file buffer to Cloudinary with organized folder structure
 * @param fileBuffer - File buffer from multer
 * @param fileName - Original file name (used for public_id)
 * @param documentType - Type of document (e.g., PERSONAL_PHOTO, NATIONAL_ID)
 * @param userType - Type of user (e.g., MEMBER, TEAM_MEMBER, STAFF, PARTICIPANT)
 * @returns Promise with secure_url from Cloudinary
 */
const uploadToCloudinary = async (fileBuffer, fileName, documentType = DocumentType.OTHER, userType = UserType.MEMBER) => {
    try {
        // Build the organized folder path
        const folder = (0, exports.buildCloudinaryPath)(documentType, userType);
        // Create a unique public ID using filename and timestamp
        const timestamp = Date.now();
        const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
        const publicId = `${folder}/${fileNameWithoutExt}-${timestamp}`;
        // Create a readable stream from the buffer
        const stream = stream_1.Readable.from(fileBuffer);
        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                public_id: publicId,
                resource_type: 'auto',
                folder: folder,
                overwrite: true,
                quality: 'auto',
                fetch_format: 'auto',
            }, (error, result) => {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
            stream.pipe(uploadStream);
        });
        console.log(`✅ File uploaded to Cloudinary: ${result.secure_url} [${documentType}/${userType}]`);
        return result.secure_url;
    }
    catch (error) {
        console.error('❌ Cloudinary upload failed:', error);
        throw new Error(`Failed to upload file to Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
exports.uploadToCloudinary = uploadToCloudinary;
/**
 * Legacy function for backward compatibility
 * @deprecated Use uploadToCloudinary with DocumentType and UserType enums instead
 */
const uploadToCloudinaryLegacy = async (fileBuffer, fileName, folder = 'helwan-club') => {
    try {
        // Create a unique public ID using filename and timestamp
        const timestamp = Date.now();
        const fileNameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
        const publicId = `${folder}/${fileNameWithoutExt}-${timestamp}`;
        // Create a readable stream from the buffer
        const stream = stream_1.Readable.from(fileBuffer);
        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                public_id: publicId,
                resource_type: 'auto',
                folder: folder,
                overwrite: true,
                quality: 'auto',
                fetch_format: 'auto',
            }, (error, result) => {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
            stream.pipe(uploadStream);
        });
        console.log(`✅ File uploaded to Cloudinary: ${result.secure_url}`);
        return result.secure_url;
    }
    catch (error) {
        console.error('❌ Cloudinary upload failed:', error);
        throw new Error(`Failed to upload file to Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
exports.uploadToCloudinaryLegacy = uploadToCloudinaryLegacy;
/**
 * Delete a file from Cloudinary by public_id
 * @param publicId - Public ID of the file in Cloudinary
 */
const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary_1.v2.uploader.destroy(publicId);
        if (result.result === 'ok') {
            console.log(`✅ File deleted from Cloudinary: ${publicId}`);
        }
    }
    catch (error) {
        console.error('❌ Cloudinary deletion failed:', error);
        // Don't throw - log and continue as this is not critical
    }
};
exports.deleteFromCloudinary = deleteFromCloudinary;
/**
 * Extract public ID from Cloudinary URL
 * @param cloudinaryUrl - Full Cloudinary URL
 * @returns Public ID of the file
 */
const extractPublicIdFromUrl = (cloudinaryUrl) => {
    try {
        const urlParts = cloudinaryUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];
        // Remove file extension
        return fileName.split('.')[0];
    }
    catch (error) {
        console.error('Error extracting public ID:', error);
        return '';
    }
};
exports.extractPublicIdFromUrl = extractPublicIdFromUrl;
//# sourceMappingURL=cloudinaryUpload.js.map