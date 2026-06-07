"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocalFileUrl = exports.initializeFolderStructure = exports.deleteFromLocalStorage = exports.saveToLocalStorage = exports.ensureDirectoryExists = exports.buildLocalPath = exports.UserType = exports.DocumentType = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
const writeFile = (0, util_1.promisify)(fs_1.default.writeFile);
const mkdir = (0, util_1.promisify)(fs_1.default.mkdir);
/**
 * Document types for organizing local uploads
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
 * User types for organizing local uploads
 */
var UserType;
(function (UserType) {
    UserType["MEMBER"] = "members";
    UserType["TEAM_MEMBER"] = "team-members";
    UserType["STAFF"] = "staff";
    UserType["PARTICIPANT"] = "participants";
})(UserType || (exports.UserType = UserType = {}));
/**
 * Build local folder path based on document type and user type
 * Structure: uploads/{document-type}/{user-type}
 * Example: uploads/national-ids/members
 *
 * @param documentType - Type of document being uploaded
 * @param userType - Type of user uploading the document
 * @returns Formatted folder path
 */
const buildLocalPath = (documentType, userType) => {
    return path_1.default.join('uploads', documentType, userType);
};
exports.buildLocalPath = buildLocalPath;
/**
 * Ensure directory exists, create if it doesn't
 * @param dirPath - Directory path to ensure
 */
const ensureDirectoryExists = async (dirPath) => {
    try {
        await mkdir(dirPath, { recursive: true });
    }
    catch (error) {
        // Directory might already exist, ignore error
        if (error.code !== 'EEXIST') {
            throw error;
        }
    }
};
exports.ensureDirectoryExists = ensureDirectoryExists;
/**
 * Save a file buffer to local storage with organized folder structure
 * @param fileBuffer - File buffer to save
 * @param fileName - Original file name
 * @param documentType - Type of document (e.g., PERSONAL_PHOTO, NATIONAL_ID)
 * @param userType - Type of user (e.g., MEMBER, TEAM_MEMBER, STAFF, PARTICIPANT)
 * @returns Promise with local file path
 */
const saveToLocalStorage = async (fileBuffer, fileName, documentType = DocumentType.OTHER, userType = UserType.MEMBER) => {
    try {
        // Build the organized folder path
        const folderPath = (0, exports.buildLocalPath)(documentType, userType);
        // Ensure the directory exists
        const fullFolderPath = path_1.default.join(process.cwd(), folderPath);
        await (0, exports.ensureDirectoryExists)(fullFolderPath);
        // Create a unique filename using original name and timestamp
        const timestamp = Date.now();
        const fileExtension = path_1.default.extname(fileName);
        const fileNameWithoutExt = path_1.default.basename(fileName, fileExtension);
        const uniqueFileName = `${fileNameWithoutExt}-${timestamp}${fileExtension}`;
        // Full file path
        const filePath = path_1.default.join(fullFolderPath, uniqueFileName);
        // Write the file
        await writeFile(filePath, fileBuffer);
        // Return the relative path (for storing in database)
        const relativePath = path_1.default.join(folderPath, uniqueFileName).replace(/\\/g, '/');
        console.log(`✅ File saved locally: ${relativePath} [${documentType}/${userType}]`);
        return relativePath;
    }
    catch (error) {
        console.error('❌ Local file save failed:', error);
        throw new Error(`Failed to save file locally: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
exports.saveToLocalStorage = saveToLocalStorage;
/**
 * Delete a file from local storage
 * @param filePath - Relative file path (e.g., 'uploads/national-ids/members/file-123.jpg')
 */
const deleteFromLocalStorage = async (filePath) => {
    try {
        const fullPath = path_1.default.join(process.cwd(), filePath);
        if (fs_1.default.existsSync(fullPath)) {
            fs_1.default.unlinkSync(fullPath);
            console.log(`✅ File deleted locally: ${filePath}`);
        }
    }
    catch (error) {
        console.error('❌ Local file deletion failed:', error);
        // Don't throw - log and continue as this is not critical
    }
};
exports.deleteFromLocalStorage = deleteFromLocalStorage;
/**
 * Initialize all folder structures (creates empty folders)
 * Run this once during application startup
 */
const initializeFolderStructure = async () => {
    console.log('📁 Initializing upload folder structure...');
    const documentTypes = Object.values(DocumentType);
    const userTypes = Object.values(UserType);
    let createdCount = 0;
    for (const docType of documentTypes) {
        for (const userType of userTypes) {
            const folderPath = (0, exports.buildLocalPath)(docType, userType);
            const fullPath = path_1.default.join(process.cwd(), folderPath);
            try {
                await (0, exports.ensureDirectoryExists)(fullPath);
                createdCount++;
            }
            catch (error) {
                console.error(`Failed to create folder: ${folderPath}`, error);
            }
        }
    }
    console.log(`✅ Created/verified ${createdCount} upload folders`);
    console.log(`📂 Structure: uploads/{document-type}/{user-type}`);
};
exports.initializeFolderStructure = initializeFolderStructure;
/**
 * Get public URL for a local file
 * @param relativePath - Relative file path from uploads folder
 * @param baseUrl - Base URL of the server (default: http://localhost:3000)
 * @returns Full URL to access the file
 */
const getLocalFileUrl = (relativePath, baseUrl = process.env.BASE_URL || 'http://localhost:3000') => {
    // Normalize path separators
    const normalizedPath = relativePath.replace(/\\/g, '/');
    return `${baseUrl}/${normalizedPath}`;
};
exports.getLocalFileUrl = getLocalFileUrl;
//# sourceMappingURL=localFileStorage.js.map