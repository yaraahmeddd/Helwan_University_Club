/**
 * Document types for organizing local uploads
 */
export declare enum DocumentType {
    PERSONAL_PHOTO = "personal-photos",
    NATIONAL_ID = "national-ids",
    MEDICAL_REPORT = "medical-reports",
    PROOF = "proofs",
    PASSPORT = "passports",
    SALARY_SLIP = "salary-slips",
    STUDENT_PROOF = "student-proofs",
    MEDIA = "media",
    ADVERTISEMENT = "advertisements",
    OTHER = "other"
}
/**
 * User types for organizing local uploads
 */
export declare enum UserType {
    MEMBER = "members",
    TEAM_MEMBER = "team-members",
    STAFF = "staff",
    PARTICIPANT = "participants"
}
/**
 * Build local folder path based on document type and user type
 * Structure: uploads/{document-type}/{user-type}
 * Example: uploads/national-ids/members
 *
 * @param documentType - Type of document being uploaded
 * @param userType - Type of user uploading the document
 * @returns Formatted folder path
 */
export declare const buildLocalPath: (documentType: DocumentType, userType: UserType) => string;
/**
 * Ensure directory exists, create if it doesn't
 * @param dirPath - Directory path to ensure
 */
export declare const ensureDirectoryExists: (dirPath: string) => Promise<void>;
/**
 * Save a file buffer to local storage with organized folder structure
 * @param fileBuffer - File buffer to save
 * @param fileName - Original file name
 * @param documentType - Type of document (e.g., PERSONAL_PHOTO, NATIONAL_ID)
 * @param userType - Type of user (e.g., MEMBER, TEAM_MEMBER, STAFF, PARTICIPANT)
 * @returns Promise with local file path
 */
export declare const saveToLocalStorage: (fileBuffer: Buffer, fileName: string, documentType?: DocumentType, userType?: UserType) => Promise<string>;
/**
 * Delete a file from local storage
 * @param filePath - Relative file path (e.g., 'uploads/national-ids/members/file-123.jpg')
 */
export declare const deleteFromLocalStorage: (filePath: string) => Promise<void>;
/**
 * Initialize all folder structures (creates empty folders)
 * Run this once during application startup
 */
export declare const initializeFolderStructure: () => Promise<void>;
/**
 * Get public URL for a local file
 * @param relativePath - Relative file path from uploads folder
 * @param baseUrl - Base URL of the server (default: http://localhost:3000)
 * @returns Full URL to access the file
 */
export declare const getLocalFileUrl: (relativePath: string, baseUrl?: string) => string;
//# sourceMappingURL=localFileStorage.d.ts.map