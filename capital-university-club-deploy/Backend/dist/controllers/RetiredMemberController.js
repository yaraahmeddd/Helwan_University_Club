"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetiredMemberController = void 0;
const RetiredMemberService_1 = require("../services/RetiredMemberService");
class RetiredMemberController {
    /**
     * GET /register/retired/professions
     * Return list of retired profession options
     */
    static async getProfessions(req, res) {
        try {
            const professions = RetiredMemberService_1.RetiredMemberService.getProfessions();
            res.status(200).json({
                success: true,
                message: 'Retired professions retrieved successfully',
                data: professions,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving professions',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * GET /register/retired/relationship-types
     * Return list of relationship types for dependents
     */
    static async getRelationshipTypes(req, res) {
        try {
            const relationshipTypes = RetiredMemberService_1.RetiredMemberService.getRelationshipTypes();
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
     * GET /register/retired/active-working-members
     * Return list of active working members for dependent relationship selection
     */
    static async getActiveWorkingMembers(req, res) {
        try {
            const members = await RetiredMemberService_1.RetiredMemberService.getActiveWorkingMembers();
            res.status(200).json({
                success: true,
                message: 'Active working members retrieved successfully',
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
     * POST /register/calculate-retired-membership-price
     * Calculate membership price based on profession and salary
     */
    static async calculateMembershipPrice(req, res) {
        try {
            const { profession_code, last_salary, is_related_to_active_member, related_member_id, member_id } = req.body;
            if (!profession_code || last_salary === undefined) {
                res.status(400).json({
                    success: false,
                    message: 'profession_code and last_salary are required',
                });
                return;
            }
            const pricingDetails = await RetiredMemberService_1.RetiredMemberService.calculateMembershipPricing({
                member_id: member_id || 0,
                profession_code,
                last_salary,
                is_related_to_active_member: is_related_to_active_member || false,
                related_member_id,
            });
            res.status(200).json({
                success: true,
                message: 'Membership price calculated successfully',
                data: pricingDetails,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error calculating membership price',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * POST /register/details/retired-member
     * Submit retired member details (profession, department, retirement date, salary slip)
     */
    static async submitRetiredMemberDetails(req, res) {
        try {
            const { member_id, profession_code, former_department, retirement_date, last_salary, salary_slip, } = req.body;
            if (!member_id || !profession_code || !former_department || !retirement_date || last_salary === undefined) {
                res.status(400).json({
                    success: false,
                    message: 'member_id, profession_code, former_department, retirement_date, and last_salary are required',
                });
                return;
            }
            const retiredDetails = await RetiredMemberService_1.RetiredMemberService.submitRetiredMemberDetails({
                member_id,
                profession_code,
                former_department,
                retirement_date: new Date(retirement_date),
                last_salary,
                salary_slip: salary_slip || null,
            });
            res.status(201).json({
                success: true,
                message: 'Retired member details submitted successfully',
                data: retiredDetails,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error submitting retired member details',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * POST /register/retired-membership
     * Create membership subscription for retired member
     */
    static async createRetiredMembership(req, res) {
        try {
            const { member_id, profession_code, last_salary, is_related_to_active_member, related_member_id, is_auto_renew, } = req.body;
            if (!member_id || !profession_code || last_salary === undefined) {
                res.status(400).json({
                    success: false,
                    message: 'member_id, profession_code, and last_salary are required',
                });
                return;
            }
            if (is_related_to_active_member && !related_member_id) {
                res.status(400).json({
                    success: false,
                    message: 'related_member_id is required when is_related_to_active_member is true',
                });
                return;
            }
            const result = await RetiredMemberService_1.RetiredMemberService.createRetiredMembership({
                member_id,
                profession_code,
                last_salary,
                is_related_to_active_member: is_related_to_active_member || false,
                related_member_id,
                is_auto_renew,
            });
            res.status(201).json({
                success: true,
                message: 'Retired membership created successfully',
                data: result,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error creating retired membership',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * POST /register/retired-relationship
     * Create relationship between retired member and active member
     * Also uploads proof document (birth certificate, marriage certificate, etc.)
     */
    static async createRetiredRelationship(req, res) {
        try {
            const { retired_member_id, active_member_id, relationship_type, proof_document, // Path to uploaded proof document
             } = req.body;
            if (!retired_member_id || !active_member_id || !relationship_type) {
                res.status(400).json({
                    success: false,
                    message: 'retired_member_id, active_member_id, and relationship_type are required',
                });
                return;
            }
            const relationship = await RetiredMemberService_1.RetiredMemberService.createMemberRelationship({
                retired_member_id,
                active_member_id,
                relationship_type,
                proof_document: proof_document || null,
            });
            res.status(201).json({
                success: true,
                message: 'Retired member relationship created successfully',
                data: relationship,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error creating relationship',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    /**
     * GET /register/retired-status/:member_id
     * Get complete status and details of retired member
     */
    static async getRetiredMemberStatus(req, res) {
        try {
            const { member_id } = req.params;
            if (!member_id) {
                res.status(400).json({
                    success: false,
                    message: 'member_id is required',
                });
                return;
            }
            const status = await RetiredMemberService_1.RetiredMemberService.getRetiredMemberStatus(parseInt(member_id));
            res.status(200).json({
                success: true,
                message: 'Retired member status retrieved successfully',
                data: status,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving retired member status',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
}
exports.RetiredMemberController = RetiredMemberController;
//# sourceMappingURL=RetiredMemberController.js.map