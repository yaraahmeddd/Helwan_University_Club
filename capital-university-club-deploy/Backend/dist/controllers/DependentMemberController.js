"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependentMemberController = void 0;
const DependentMemberService_1 = require("../services/DependentMemberService");
const i18n_1 = require("../utils/i18n");
const localFileStorage_1 = require("../utils/localFileStorage");
class DependentMemberController {
    /**
     * GET /register/dependent/subtypes
     * Return dependent member subtypes (DEPENDENT_ACTIVE, DEPENDENT_VISITOR)
     */
    static async getDependentSubtypes(req, res) {
        try {
            const language = (0, i18n_1.getLanguageFromRequest)(req);
            const subtypes = DependentMemberService_1.DependentMemberService.getDependentSubtypes();
            res.status(200).json((0, i18n_1.createLocalizedResponse)(true, 'DEPENDENT_SUBTYPE_SUCCESS', language, subtypes));
        }
        catch (error) {
            const language = (0, i18n_1.getLanguageFromRequest)(req);
            res.status(500).json((0, i18n_1.createLocalizedError)('DEPENDENT_SUBTYPE_ERROR', language, error));
        }
    }
    /**
     * GET /register/dependent/relationship-types
     * Return list of relationship types
     */
    static async getRelationshipTypes(req, res) {
        try {
            const relationshipTypes = DependentMemberService_1.DependentMemberService.getRelationshipTypes();
            res.status(200).json({
                success: true,
                message: 'Relationship types retrieved successfully',
                data: relationshipTypes,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving relationship types',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * GET /register/dependent/active-working-members
     * Return list of active working members for dependent selection
     */
    static async getActiveWorkingMembers(req, res) {
        try {
            const members = await DependentMemberService_1.DependentMemberService.getActiveWorkingMembers();
            res.status(200).json({
                success: true,
                message: 'Active working members retrieved successfully',
                data: members,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving active working members',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * GET /register/dependent/active-visitor-members
     * Return list of active visitor members for dependent selection
     */
    static async getActiveVisitorMembers(req, res) {
        try {
            const members = await DependentMemberService_1.DependentMemberService.getActiveVisitorMembers();
            res.status(200).json({
                success: true,
                message: 'Active visitor members retrieved successfully',
                data: members,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving active visitor members',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * GET /register/dependent/active-members
     * Return combined list of active members (both working and visitor)
     */
    static async getActiveMembers(req, res) {
        try {
            const members = await DependentMemberService_1.DependentMemberService.getActiveMembers();
            res.status(200).json({
                success: true,
                message: 'Active members retrieved successfully',
                data: members,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving active members',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * POST /register/calculate-dependent-membership-price
     * Calculate dependent membership price (40% discount)
     */
    static async calculateMembershipPrice(req, res) {
        try {
            const { related_member_id, dependent_subtype } = req.body;
            if (!related_member_id || !dependent_subtype) {
                res.status(400).json({
                    success: false,
                    message: 'related_member_id and dependent_subtype are required',
                });
                return;
            }
            if (!['DEPENDENT_ACTIVE', 'DEPENDENT_VISITOR'].includes(dependent_subtype)) {
                res.status(400).json({
                    success: false,
                    message: 'dependent_subtype must be DEPENDENT_ACTIVE or DEPENDENT_VISITOR',
                });
                return;
            }
            const pricingDetails = await DependentMemberService_1.DependentMemberService.calculateDependentMembershipPrice({
                related_member_id,
                dependent_subtype,
            });
            res.status(200).json({
                success: true,
                message: 'Dependent membership price calculated successfully',
                data: pricingDetails,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error calculating dependent membership price',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * POST /register/dependent-membership
     * Create dependent membership subscription with relationship
     */
    static async createDependentMembership(req, res) {
        try {
            const { member_id, related_member_id, relationship_type, dependent_subtype, proof_document, is_auto_renew, } = req.body;
            if (!member_id || !related_member_id || !relationship_type || !dependent_subtype) {
                res.status(400).json({
                    success: false,
                    message: 'member_id, related_member_id, relationship_type, and dependent_subtype are required',
                });
                return;
            }
            if (!['DEPENDENT_ACTIVE', 'DEPENDENT_VISITOR'].includes(dependent_subtype)) {
                res.status(400).json({
                    success: false,
                    message: 'dependent_subtype must be DEPENDENT_ACTIVE or DEPENDENT_VISITOR',
                });
                return;
            }
            const result = await DependentMemberService_1.DependentMemberService.createDependentMembership({
                member_id,
                related_member_id,
                relationship_type,
                dependent_subtype,
                proof_document: proof_document || null,
                is_auto_renew,
            });
            res.status(201).json({
                success: true,
                message: 'Dependent membership created successfully',
                data: result,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error creating dependent membership',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * GET /register/dependent-status/:member_id
     * Get complete status and details of dependent member
     */
    static async getDependentMemberStatus(req, res) {
        try {
            const { member_id } = req.params;
            if (!member_id) {
                res.status(400).json({
                    success: false,
                    message: 'member_id is required',
                });
                return;
            }
            const status = await DependentMemberService_1.DependentMemberService.getDependentMemberStatus(parseInt(member_id));
            res.status(200).json({
                success: true,
                message: 'Dependent member status retrieved successfully',
                data: status,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving dependent member status',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * POST /register/details/dependent
     * Submit dependent member details (photos and documents)
     */
    static async submitDependentDetails(req, res) {
        try {
            const files = req.files;
            const { member_id, related_member_id, relationship_type } = req.body;
            console.log('📋 Dependent Details Submission:');
            console.log('  Body:', { member_id, related_member_id, relationship_type });
            console.log('  Files:', files ? Object.keys(files) : 'No files');
            // Validate required fields
            if (!member_id || !related_member_id || !relationship_type) {
                console.error('❌ Missing required fields');
                res.status(400).json({
                    success: false,
                    message: 'member_id, related_member_id, and relationship_type are required',
                });
                return;
            }
            // Upload files to local storage
            let personal_photo;
            let national_id_front;
            let national_id_back;
            let medical_report;
            let relation_proof;
            try {
                // Helper function to upload file
                const uploadFile = async (fieldname, documentType) => {
                    if (!files || !files[fieldname] || files[fieldname].length === 0) {
                        return undefined;
                    }
                    const file = files[fieldname][0];
                    return await (0, localFileStorage_1.saveToLocalStorage)(file.buffer, file.originalname, documentType, localFileStorage_1.UserType.MEMBER);
                };
                personal_photo = await uploadFile('personal_photo', localFileStorage_1.DocumentType.PERSONAL_PHOTO);
                national_id_front = await uploadFile('national_id_front', localFileStorage_1.DocumentType.NATIONAL_ID);
                national_id_back = await uploadFile('national_id_back', localFileStorage_1.DocumentType.NATIONAL_ID);
                medical_report = await uploadFile('medical_report', localFileStorage_1.DocumentType.MEDICAL_REPORT);
                relation_proof = await uploadFile('relation_proof', localFileStorage_1.DocumentType.PROOF);
            }
            catch (uploadError) {
                console.error('❌ File upload error:', uploadError);
                res.status(400).json({
                    success: false,
                    message: uploadError instanceof Error ? uploadError.message : 'Failed to upload files'
                });
                return;
            }
            // Submit dependent details with Cloudinary URLs
            const submitData = {
                member_id: parseInt(member_id),
                related_member_id: parseInt(related_member_id),
                relationship_type: String(relationship_type),
                personal_photo,
                national_id_front,
                national_id_back,
                medical_report,
                relation_proof,
            };
            console.log('📤 Submitting to service:', submitData);
            const result = await DependentMemberService_1.DependentMemberService.submitDependentDetails(submitData);
            console.log('✅ Service result:', result);
            res.status(201).json({
                success: true,
                message: 'Dependent details submitted successfully',
                data: result,
            });
        }
        catch (error) {
            console.error('❌ Error in submitDependentDetails:', error);
            res.status(500).json({
                success: false,
                message: 'Error submitting dependent details',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}
exports.DependentMemberController = DependentMemberController;
//# sourceMappingURL=DependentMemberController.js.map