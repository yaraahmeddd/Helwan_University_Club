/**
 * Document types for organizing uploads
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
 * User types for organizing uploads
 */
export declare enum UserType {
    MEMBER = "members",
    TEAM_MEMBER = "team-members",
    STAFF = "staff",
    PARTICIPANT = "participants"
}
/**
 * Build Cloudinary folder path based on document type and user type
 * Structure: helwan-club/{document-type}/{user-type}
 * Example: helwan-club/national-ids/members
 *
 * @param documentType - Type of document being uploaded
 * @param userType - Type of user uploading the document
 * @returns Formatted folder path
 */
export declare const buildCloudinaryPath: (documentType: DocumentType, userType: UserType) => string;
/**
 * Upload a file buffer to Cloudinary with organized folder structure
 * @param fileBuffer - File buffer from multer
 * @param fileName - Original file name (used for public_id)
 * @param documentType - Type of document (e.g., PERSONAL_PHOTO, NATIONAL_ID)
 * @param userType - Type of user (e.g., MEMBER, TEAM_MEMBER, STAFF, PARTICIPANT)
 * @returns Promise with secure_url from Cloudinary
 */
export declare const uploadToCloudinary: (fileBuffer: Buffer, fileName: string, documentType?: DocumentType, userType?: UserType) => Promise<string>;
/**
 * Legacy function for backward compatibility
 * @deprecated Use uploadToCloudinary with DocumentType and UserType enums instead
 */
export declare const uploadToCloudinaryLegacy: (fileBuffer: Buffer, fileName: string, folder?: string) => Promise<string>;
/**
 * Delete a file from Cloudinary by public_id
 * @param publicId - Public ID of the file in Cloudinary
 */
export declare const deleteFromCloudinary: (publicId: string) => Promise<void>;
/**
 * Extract public ID from Cloudinary URL
 * @param cloudinaryUrl - Full Cloudinary URL
 * @returns Public ID of the file
 */
export declare const extractPublicIdFromUrl: (cloudinaryUrl: string) => string;
//# sourceMappingURL=cloudinaryUpload.d.ts.map