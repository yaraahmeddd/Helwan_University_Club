"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentMemberController = void 0;
const StudentMemberService_1 = require("../services/StudentMemberService");
const i18n_1 = require("../utils/i18n");
class StudentMemberController {
    /**
     * Get student/graduate status options
     * GET /register/student/statuses
     */
    static async getStudentStatusOptions(req, res) {
        try {
            const language = (0, i18n_1.getLanguageFromRequest)(req);
            const statuses = StudentMemberService_1.StudentMemberService.getStudentStatusOptions();
            res.status(200).json((0, i18n_1.createLocalizedResponse)(true, 'STUDENT_STATUS_OPTIONS_SUCCESS', language, {
                statuses,
            }));
        }
        catch (error) {
            const language = (0, i18n_1.getLanguageFromRequest)(req);
            res.status(500).json((0, i18n_1.createLocalizedError)('STUDENT_STATUS_OPTIONS_ERROR', language, error));
        }
    }
    /**
     * Get relationship types for dependents
     * GET /register/student/relationship-types
     */
    static async getRelationshipTypes(req, res) {
        try {
            const language = (0, i18n_1.getLanguageFromRequest)(req);
            const relationshipTypes = StudentMemberService_1.StudentMemberService.getRelationshipTypes();
            res.status(200).json((0, i18n_1.createLocalizedResponse)(true, 'RELATIONSHIP_TYPES_SUCCESS', language, {
                relationship_types: relationshipTypes,
            }));
        }
        catch (error) {
            const language = (0, i18n_1.getLanguageFromRequest)(req);
            res.status(500).json((0, i18n_1.createLocalizedError)('RELATIONSHIP_TYPES_ERROR', language, error));
        }
    }
    /**
     * Get active members for dependent selection
     * GET /register/student/active-members
     */
    static async getActiveMembers(req, res) {
        try {
            const language = (0, i18n_1.getLanguageFromRequest)(req);
            const members = await StudentMemberService_1.StudentMemberService.getActiveMembers();
            res.status(200).json((0, i18n_1.createLocalizedResponse)(true, 'ACTIVE_MEMBERS_SUCCESS', language, {
                active_members: members,
                total_count: members.length,
            }));
        }
        catch (error) {
            const language = (0, i18n_1.getLanguageFromRequest)(req);
            res.status(500).json((0, i18n_1.createLocalizedError)('ACTIVE_MEMBERS_ERROR', language, error));
        }
    }
    /**
     * Submit student member details (name, email, password, phone, etc.)
     * POST /register/student-details
     * Body: {
     *   member_id: number,
     *   university_id: number,
     *   graduation_year: number,
     *   status_proof: string (path to certificate/ID)
     * }
     */
    static async submitStudentMemberDetails(req, res) {
        try {
            const language = (0, i18n_1.getLanguageFromRequest)(req);
            const { member_id, university_id, graduation_year, status_proof } = req.body;
            // Validation
            if (!member_id || !university_id || !graduation_year || !status_proof) {
                res.status(400).json((0, i18n_1.createLocalizedError)('MISSING_REQUIRED_FIELDS', language, 'member_id, university_id, graduation_year, status_proof'));
                return;
            }
            if (typeof graduation_year !== 'number' || graduation_year < 1900 || graduation_year > new Date().getFullYear() + 10) {
                res.status(400).json((0, i18n_1.createLocalizedError)('INVALID_GRADUATION_YEAR', language));
                return;
            }
            const result = await StudentMemberService_1.StudentMemberService.submitStudentMemberDetails({
                member_id,
                university_id,
                graduation_year,
                status_proof,
            });
            res.status(201).json((0, i18n_1.createLocalizedResponse)(true, 'STUDENT_DETAILS_SUCCESS', language, result));
        }
        catch (error) {
            const language = (0, i18n_1.getLanguageFromRequest)(req);
            res.status(500).json((0, i18n_1.createLocalizedError)('STUDENT_DETAILS_ERROR', language, error));
        }
    }
    /**
     * Calculate student/graduate membership price
     * POST /register/calculate-student-membership-price
     * Body: {
     *   student_status: 'STUDENT' | 'GRADUATE'
     * }
     */
    static async calculateMembershipPrice(req, res) {
        try {
            const language = (0, i18n_1.getLanguageFromRequest)(req);
            const { student_status } = req.body;
            // Validation
            if (!student_status || !['STUDENT', 'GRADUATE'].includes(student_status)) {
                res.status(400).json((0, i18n_1.createLocalizedError)('INVALID_STUDENT_STATUS', language));
                return;
            }
            const pricingDetails = StudentMemberService_1.StudentMemberService.calculateMembershipPrice(student_status);
            res.status(200).json((0, i18n_1.createLocalizedResponse)(true, 'PRICE_CALCULATED_SUCCESS', language, {
                student_status,
                price: pricingDetails.price,
                currency: 'EGP',
            }));
        }
        catch (error) {
            const language = (0, i18n_1.getLanguageFromRequest)(req);
            res.status(500).json((0, i18n_1.createLocalizedError)('PRICE_CALCULATED_ERROR', language, error));
        }
    }
    /**
     * Create student/graduate membership
     * POST /register/student-membership
     * Body: {
     *   member_id: number,
     *   student_status: 'STUDENT' | 'GRADUATE'
     * }
     */
    static async createStudentMembership(req, res) {
        try {
            const language = (0, i18n_1.getLanguageFromRequest)(req);
            const { member_id, student_status } = req.body;
            // Validation
            if (!member_id || !student_status) {
                res.status(400).json((0, i18n_1.createLocalizedError)('MISSING_REQUIRED_FIELDS', language, 'member_id, student_status'));
                return;
            }
            if (!['STUDENT', 'GRADUATE'].includes(student_status)) {
                res.status(400).json((0, i18n_1.createLocalizedError)('INVALID_STUDENT_STATUS', language));
                return;
            }
            const result = await StudentMemberService_1.StudentMemberService.createStudentMembership({
                member_id,
                student_status,
            });
            res.status(201).json((0, i18n_1.createLocalizedResponse)(true, 'MEMBERSHIP_CREATED_SUCCESS', language, {
                membership: {
                    id: result.membership.id,
                    member_id: result.membership.member_id,
                    status: result.membership.status,
                    start_date: result.membership.start_date,
                    end_date: result.membership.end_date,
                },
                pricing: result.pricing,
            }));
        }
        catch (error) {
            const language = (0, i18n_1.getLanguageFromRequest)(req);
            res.status(500).json((0, i18n_1.createLocalizedError)('MEMBERSHIP_CREATED_ERROR', language, error));
        }
    }
    /**
     * Calculate dependent membership price (40% discount)
     * POST /register/calculate-student-dependent-price
     * Body: {
     *   related_member_id: number
     * }
     */
    static async calculateDependentMembershipPrice(req, res) {
        try {
            const language = (0, i18n_1.getLanguageFromRequest)(req);
            const { related_member_id } = req.body;
            // Validation
            if (!related_member_id) {
                res.status(400).json((0, i18n_1.createLocalizedError)('MISSING_REQUIRED_FIELDS', language, 'related_member_id'));
                return;
            }
            const pricingDetails = await StudentMemberService_1.StudentMemberService.calculateDependentMembershipPrice({
                related_member_id,
            });
            res.status(200).json((0, i18n_1.createLocalizedResponse)(true, 'DEPENDENT_PRICE_CALCULATED_SUCCESS', language, {
                related_member_id,
                pricing: {
                    related_member_price: pricingDetails.related_member_price,
                    discount_percentage: pricingDetails.discount_percentage,
                    discount_amount: pricingDetails.discount_amount,
                    final_price: pricingDetails.final_price,
                    currency: 'EGP',
                },
            }));
        }
        catch (error) {
            const language = (0, i18n_1.getLanguageFromRequest)(req);
            res.status(500).json((0, i18n_1.createLocalizedError)('DEPENDENT_PRICE_CALCULATED_ERROR', language, error));
        }
    }
    /**
     * Create student/graduate dependent membership
     * POST /register/student-dependent-membership
     * Body: {
     *   member_id: number,
     *   related_member_id: number,
     *   relationship_type: string,
     *   proof_document: string
     * }
     */
    static async createStudentDependentMembership(req, res) {
        try {
            const language = (0, i18n_1.getLanguageFromRequest)(req);
            const { member_id, related_member_id, relationship_type, proof_document } = req.body;
            // Validation
            if (!member_id || !related_member_id || !relationship_type || !proof_document) {
                res.status(400).json((0, i18n_1.createLocalizedError)('MISSING_REQUIRED_FIELDS', language, 'member_id, related_member_id, relationship_type, proof_document'));
                return;
            }
            const validRelationships = ['spouse', 'child', 'parent', 'orphan'];
            if (!validRelationships.includes(relationship_type)) {
                res.status(400).json((0, i18n_1.createLocalizedError)('INVALID_RELATIONSHIP_TYPE', language));
                return;
            }
            const result = await StudentMemberService_1.StudentMemberService.createStudentDependentMembership({
                member_id,
                related_member_id,
                relationship_type,
                proof_document,
            });
            res.status(201).json((0, i18n_1.createLocalizedResponse)(true, 'DEPENDENT_MEMBERSHIP_CREATED_SUCCESS', language, {
                membership: {
                    id: result.membership.id,
                    member_id: result.membership.member_id,
                    status: result.membership.status,
                    start_date: result.membership.start_date,
                    end_date: result.membership.end_date,
                },
                relationship: {
                    id: result.relationship.id,
                    relationship_type: result.relationship.relationship_type,
                    is_dependent: result.relationship.is_dependent,
                },
                pricing: result.pricing,
            }));
        }
        catch (error) {
            const language = (0, i18n_1.getLanguageFromRequest)(req);
            res.status(500).json((0, i18n_1.createLocalizedError)('DEPENDENT_MEMBERSHIP_CREATED_ERROR', language, error));
        }
    }
    /**
     * Get student member complete status and details
     * GET /register/student-status/:member_id
     */
    static async getStudentMemberStatus(req, res) {
        try {
            const language = (0, i18n_1.getLanguageFromRequest)(req);
            const { member_id } = req.params;
            // Validation
            if (!member_id || isNaN(Number(member_id))) {
                res.status(400).json((0, i18n_1.createLocalizedError)('INVALID_MEMBER_ID', language));
                return;
            }
            const memberStatus = await StudentMemberService_1.StudentMemberService.getStudentMemberStatus(Number(member_id));
            res.status(200).json((0, i18n_1.createLocalizedResponse)(true, 'STUDENT_STATUS_RETRIEVED_SUCCESS', language, memberStatus));
        }
        catch (error) {
            const language = (0, i18n_1.getLanguageFromRequest)(req);
            res.status(500).json((0, i18n_1.createLocalizedError)('STUDENT_STATUS_RETRIEVED_ERROR', language, error));
        }
    }
}
exports.StudentMemberController = StudentMemberController;
//# sourceMappingURL=StudentMemberController.js.map