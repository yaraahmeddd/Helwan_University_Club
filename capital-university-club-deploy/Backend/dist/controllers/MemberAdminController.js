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
exports.MemberController = void 0;
const data_source_1 = require("../database/data-source");
const Member_1 = require("../entities/Member");
const Account_1 = require("../entities/Account");
const Staff_1 = require("../entities/Staff");
const TeamMember_1 = require("../entities/TeamMember");
const TeamMemberTeam_1 = require("../entities/TeamMemberTeam");
const bcrypt = __importStar(require("bcrypt"));
const AuditLogService_1 = require("../services/AuditLogService");
const TeamEnums_1 = require("../constants/TeamEnums");
const auditLogService = new AuditLogService_1.AuditLogService();
/**
 * MemberController - Handles all member management operations
 */
class MemberController {
    static async logAction(req, action, description, oldValue, newValue) {
        try {
            if (!req.user || !req.user.staff_id)
                return;
            const staff = await MemberController.staffRepo.findOne({
                where: { id: req.user.staff_id },
                relations: ['staff_type']
            });
            const userName = staff ? `${staff.first_name_en} ${staff.last_name_en}` : req.user.email;
            const role = staff?.staff_type?.name_en || req.user.role;
            await auditLogService.createLog({
                userName,
                role,
                action,
                module: 'Members',
                description,
                status: 'نجح',
                oldValue,
                newValue,
                dateTime: new Date(),
                ipAddress: req.ip || '0.0.0.0'
            });
        }
        catch (error) {
            console.error('Failed to create audit log:', error);
        }
    }
    /**
     * VIEW_MEMBERS - Get all members (paginated)
     * GET /api/members
     */
    static async getAllMembers(req, res) {
        try {
            const { page = 1, limit = 20, status, member_type_id } = req.query;
            const skip = ((Number(page) - 1) * Number(limit)) || 0;
            const query = MemberController.memberRepo.createQueryBuilder('member')
                .leftJoinAndSelect('member.account', 'account')
                .leftJoinAndSelect('member.member_type', 'member_type');
            // Filter by status if provided
            if (status) {
                query.andWhere('member.status = :status', { status });
            }
            // Filter by member type if provided
            if (member_type_id) {
                query.andWhere('member.member_type_id = :member_type_id', { member_type_id });
            }
            const [members, total] = await query
                .skip(skip)
                .take(Number(limit))
                .orderBy('member.created_at', 'DESC')
                .getManyAndCount();
            return res.json({
                success: true,
                data: members,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit)),
                },
            });
        }
        catch (error) {
            console.error('Error fetching members:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch members',
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    /**
     * VIEW_MEMBERS - Get specific member details
     * GET /api/members/:id
     */
    static async getMemberById(req, res) {
        try {
            const { id } = req.params;
            const member = await MemberController.memberRepo.findOne({
                where: { id: parseInt(id) },
                relations: ['account', 'member_type', 'memberships', 'memberships.membership_plan'],
            });
            if (!member) {
                return res.status(404).json({
                    success: false,
                    message: 'Member not found',
                });
            }
            // Flatten active membership data for backward compatibility with frontend
            const memberData = { ...member };
            if (member.memberships && member.memberships.length > 0) {
                const sortedMemberships = member.memberships.sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
                const activeMembership = sortedMemberships.find(m => m.status === 'active') || sortedMemberships[0];
                if (activeMembership && activeMembership.membership_plan) {
                    memberData.membership_plan_name = activeMembership.membership_plan.name_ar || activeMembership.membership_plan.name_en;
                    memberData.membership_plan_code = activeMembership.membership_plan.plan_code || activeMembership.membership_plan.id;
                    memberData.registration_date = activeMembership.start_date;
                    memberData.expiry_date = activeMembership.end_date;
                    memberData.renewal_fee = activeMembership.membership_plan.renewal_price;
                    memberData.membership_status = activeMembership.status;
                }
            }
            return res.json({
                success: true,
                data: memberData,
            });
        }
        catch (error) {
            console.error('Error fetching member:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch member',
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    /**
     * VIEW_ALL_MEMBERS - Get all members and team members combined
     * GET /api/members/all-with-teams
     */
    static async getAllMembersWithTeamMembers(req, res) {
        try {
            const { page = 1, limit = 20, status, member_type_id } = req.query;
            const skip = ((Number(page) - 1) * Number(limit)) || 0;
            // Get all regular members
            const memberQuery = MemberController.memberRepo.createQueryBuilder('member')
                .leftJoinAndSelect('member.account', 'account')
                .leftJoinAndSelect('member.member_type', 'member_type')
                .leftJoinAndSelect('member.team_member_teams', 'team_member_teams');
            // Filter by status if provided
            if (status) {
                memberQuery.andWhere('member.status = :status', { status });
            }
            // Filter by member type if provided
            if (member_type_id) {
                memberQuery.andWhere('member.member_type_id = :member_type_id', { member_type_id });
            }
            const [members, total] = await memberQuery
                .skip(skip)
                .take(Number(limit))
                .orderBy('member.created_at', 'DESC')
                .getManyAndCount();
            return res.json({
                success: true,
                data: members,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages: Math.ceil(total / Number(limit)),
                },
            });
        }
        catch (error) {
            console.error('Error fetching members with team members:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch members with team members',
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    /**
     * CREATE_MEMBER - Create a new member account
     * POST /api/members
     */
    static async createMember(req, res) {
        try {
            const { email, password, first_name_en, first_name_ar, last_name_en, last_name_ar, national_id, gender, phone, birthdate, nationality, member_type_id, address, photo, national_id_front, national_id_back, medical_report, } = req.body;
            // Validate required fields
            if (!email || !password || !first_name_en || !first_name_ar || !last_name_en || !last_name_ar || !national_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required fields: email, password, first_name_en, first_name_ar, last_name_en, last_name_ar, national_id',
                });
            }
            // Check if email already exists
            const existingAccount = await MemberController.accountRepo.findOne({ where: { email } });
            if (existingAccount) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already exists',
                });
            }
            // Check if national_id already exists
            const existingMember = await MemberController.memberRepo.findOne({ where: { national_id } });
            if (existingMember) {
                return res.status(409).json({
                    success: false,
                    message: 'National ID already exists',
                });
            }
            return await data_source_1.AppDataSource.manager.transaction(async (transactionalEntityManager) => {
                // Create account
                const newAccount = new Account_1.Account();
                newAccount.email = email;
                newAccount.password = await bcrypt.hash(password, 10);
                newAccount.role = 'member';
                newAccount.status = 'active';
                newAccount.is_active = true;
                const savedAccount = await transactionalEntityManager.save(Account_1.Account, newAccount);
                // Create member
                const newMember = new Member_1.Member();
                newMember.account_id = savedAccount.id;
                newMember.account = savedAccount;
                newMember.first_name_en = first_name_en;
                newMember.first_name_ar = first_name_ar;
                newMember.last_name_en = last_name_en;
                newMember.last_name_ar = last_name_ar;
                newMember.national_id = national_id;
                newMember.gender = gender || 'M';
                newMember.phone = phone || '';
                newMember.birthdate = birthdate ? new Date(birthdate) : null;
                newMember.nationality = nationality || 'Egyptian';
                newMember.member_type_id = member_type_id || 1;
                newMember.is_foreign = (nationality || 'Egyptian').toLowerCase() !== 'egyptian';
                newMember.address = address || '';
                newMember.photo = photo || null;
                newMember.national_id_front = national_id_front || null;
                newMember.national_id_back = national_id_back || null;
                newMember.medical_report = medical_report || null;
                newMember.status = 'active';
                const savedMember = await transactionalEntityManager.save(Member_1.Member, newMember);
                await MemberController.logAction(req, 'Create', `Created member: ${savedMember.first_name_en} ${savedMember.last_name_en}`, undefined, { account: savedAccount, member: savedMember });
                return res.status(201).json({
                    success: true,
                    message: 'Member created successfully',
                    data: {
                        account_id: savedAccount.id,
                        member_id: savedMember.id,
                        email: savedAccount.email,
                    },
                });
            });
        }
        catch (error) {
            console.error('Error creating member:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create member',
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    /**
     * UPDATE_MEMBER - Edit member information
     * PUT /api/members/:id
     */
    static async updateMember(req, res) {
        try {
            const { id } = req.params;
            const { first_name_en, first_name_ar, last_name_en, last_name_ar, gender, phone, birthdate, nationality, health_status, address, photo, national_id_front, national_id_back, medical_report, } = req.body;
            const member = await MemberController.memberRepo.findOne({ where: { id: parseInt(id) } });
            if (!member) {
                return res.status(404).json({
                    success: false,
                    message: 'Member not found',
                });
            }
            const oldMember = { ...member };
            // Update fields if provided
            if (first_name_en)
                member.first_name_en = first_name_en;
            if (first_name_ar)
                member.first_name_ar = first_name_ar;
            if (last_name_en)
                member.last_name_en = last_name_en;
            if (last_name_ar)
                member.last_name_ar = last_name_ar;
            if (gender)
                member.gender = gender;
            if (phone)
                member.phone = phone;
            if (birthdate)
                member.birthdate = new Date(birthdate);
            if (nationality) {
                member.nationality = nationality;
                member.is_foreign = nationality.toLowerCase() !== 'egyptian';
            }
            if (health_status)
                member.health_status = health_status;
            if (address !== undefined)
                member.address = address;
            if (photo !== undefined)
                member.photo = photo;
            if (national_id_front !== undefined)
                member.national_id_front = national_id_front;
            if (national_id_back !== undefined)
                member.national_id_back = national_id_back;
            if (medical_report !== undefined)
                member.medical_report = medical_report;
            const updatedMember = await MemberController.memberRepo.save(member);
            await MemberController.logAction(req, 'Update', `Updated member profile: ${updatedMember.first_name_en} ${updatedMember.last_name_en}`, oldMember, updatedMember);
            return res.json({
                success: true,
                message: 'Member updated successfully',
                data: updatedMember,
            });
        }
        catch (error) {
            console.error('Error updating member:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to update member',
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    /**
     * REVIEW_MEMBER - Review member information (for approval workflows)
     * GET /api/members/:id/review
     */
    static async reviewMember(req, res) {
        try {
            const { id } = req.params;
            const member = await MemberController.memberRepo.findOne({
                where: { id: parseInt(id) },
                relations: ['account', 'member_type'],
            });
            if (!member) {
                return res.status(404).json({
                    success: false,
                    message: 'Member not found',
                });
            }
            // Return member information with all details for review
            return res.json({
                success: true,
                data: {
                    member,
                    reviewInfo: {
                        created_at: member.created_at,
                        updated_at: member.updated_at,
                        status: member.status,
                        account_status: member.account?.status,
                    },
                },
            });
        }
        catch (error) {
            console.error('Error reviewing member:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to review member',
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    /**
     * CHANGE_MEMBER_STATUS - Change member account status
     * PATCH /api/members/:id/status
     */
    static async changeMemberStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            // Validate status
            const validStatuses = ['active', 'suspended', 'banned', 'expired', 'cancelled'];
            if (!status || !validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
                });
            }
            const member = await MemberController.memberRepo.findOne({ where: { id: parseInt(id) }, relations: ['account'] });
            if (!member) {
                return res.status(404).json({
                    success: false,
                    message: 'Member not found',
                });
            }
            return await data_source_1.AppDataSource.manager.transaction(async (transactionalEntityManager) => {
                // Update member status
                member.status = status;
                const updatedMember = await transactionalEntityManager.save(Member_1.Member, member);
                // Update account status as well
                if (member.account_id) {
                    const account = await transactionalEntityManager.findOne(Account_1.Account, { where: { id: member.account_id } });
                    if (account) {
                        account.status = status;
                        await transactionalEntityManager.save(Account_1.Account, account);
                    }
                }
                await MemberController.logAction(req, 'Status Change', `Changed status of member ${updatedMember.first_name_en} to ${status}`, { oldStatus: member.status }, { newStatus: status });
                return res.json({
                    success: true,
                    message: `Member status changed to ${status}`,
                    data: updatedMember,
                });
            });
        }
        catch (error) {
            console.error('Error changing member status:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to change member status',
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    /**
     * MANAGE_MEMBER_BLOCK - Block or unblock member account
     * PATCH /api/members/:id/block
     */
    static async manageMemberBlock(req, res) {
        try {
            const { id } = req.params;
            const { blocked } = req.body;
            if (typeof blocked !== 'boolean') {
                return res.status(400).json({
                    success: false,
                    message: 'blocked field must be a boolean',
                });
            }
            const member = await MemberController.memberRepo.findOne({
                where: { id: parseInt(id) },
                relations: ['account'],
            });
            if (!member) {
                return res.status(404).json({
                    success: false,
                    message: 'Member not found',
                });
            }
            const account = member.account;
            if (!account) {
                return res.status(400).json({
                    success: false,
                    message: 'Member account not found',
                });
            }
            return await data_source_1.AppDataSource.manager.transaction(async (transactionalEntityManager) => {
                // Set status based on blocked flag
                if (blocked) {
                    member.status = 'banned';
                    account.status = 'banned';
                    account.is_active = false;
                }
                else {
                    member.status = 'active';
                    account.status = 'active';
                    account.is_active = true;
                }
                await transactionalEntityManager.save(Member_1.Member, member);
                await transactionalEntityManager.save(Account_1.Account, account);
                await MemberController.logAction(req, blocked ? 'Block' : 'Unblock', `${blocked ? 'Blocked' : 'Unblocked'} member: ${member.first_name_en} ${member.last_name_en}`, { blocked: !blocked }, { blocked });
                return res.json({
                    success: true,
                    message: blocked ? 'Member blocked successfully' : 'Member unblocked successfully',
                    data: { member_id: member.id, status: member.status, blocked },
                });
            });
        }
        catch (error) {
            console.error('Error managing member block:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to manage member block',
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    /**
     * RESET_MEMBER_PASSWORD - Reset member password
     * POST /api/members/:id/reset-password
     */
    static async resetMemberPassword(req, res) {
        try {
            const { id } = req.params;
            const { old_password, new_password, confirm_password } = req.body;
            // Validate all required fields
            if (!old_password || !new_password || !confirm_password) {
                return res.status(400).json({
                    success: false,
                    message: 'old_password, new_password, and confirm_password are required',
                });
            }
            if (new_password !== confirm_password) {
                return res.status(400).json({
                    success: false,
                    message: 'New passwords do not match',
                });
            }
            if (new_password.length < 8) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must be at least 8 characters',
                });
            }
            if (old_password === new_password) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must be different from old password',
                });
            }
            const member = await MemberController.memberRepo.findOne({
                where: { id: parseInt(id) },
                relations: ['account'],
            });
            if (!member || !member.account) {
                return res.status(404).json({
                    success: false,
                    message: 'Member not found',
                });
            }
            // Verify old password
            const passwordMatch = await bcrypt.compare(old_password, member.account.password);
            if (!passwordMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Old password is incorrect',
                });
            }
            return await data_source_1.AppDataSource.manager.transaction(async (transactionalEntityManager) => {
                // Update password
                member.account.password = await bcrypt.hash(new_password, 10);
                member.account.password_changed_at = new Date();
                await transactionalEntityManager.save(Account_1.Account, member.account);
                await MemberController.logAction(req, 'Reset Password', `Reset password for member: ${member.first_name_en} ${member.last_name_en}`, null, { password_changed: true });
                return res.json({
                    success: true,
                    message: 'Member password reset successfully',
                });
            });
        }
        catch (error) {
            console.error('Error resetting member password:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to reset member password',
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    /**
     * VIEW_MEMBER_HISTORY - View member activity history
     * GET /api/members/:id/history
     */
    static async getMemberHistory(req, res) {
        try {
            const { id } = req.params;
            const member = await MemberController.memberRepo.findOne({
                where: { id: parseInt(id) },
                relations: ['account'],
            });
            if (!member) {
                return res.status(404).json({
                    success: false,
                    message: 'Member not found',
                });
            }
            // Return member history (basic implementation - can be extended with ActivityLog table)
            return res.json({
                success: true,
                data: {
                    member_id: member.id,
                    email: member.account?.email,
                    created_at: member.created_at,
                    updated_at: member.updated_at,
                    status: member.status,
                    account_status: member.account?.status,
                },
            });
        }
        catch (error) {
            console.error('Error fetching member history:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch member history',
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    /**
     * MANAGE_MEMBERSHIP_REQUEST - Manage membership requests
     * POST /api/members/:id/membership-request
     */
    static async manageMembershipRequest(req, res) {
        try {
            const { id } = req.params;
            const { action } = req.body; // 'approve' or 'reject'
            if (!action || !['approve', 'reject'].includes(action)) {
                return res.status(400).json({
                    success: false,
                    message: 'action must be either "approve" or "reject"',
                });
            }
            const member = await MemberController.memberRepo.findOne({
                where: { id: parseInt(id) },
                relations: ['account'],
            });
            if (!member) {
                return res.status(404).json({
                    success: false,
                    message: 'Member not found',
                });
            }
            const newStatus = action === 'approve' ? 'active' : 'cancelled';
            return await data_source_1.AppDataSource.manager.transaction(async (transactionalEntityManager) => {
                // Update member status
                member.status = newStatus;
                const updatedMember = await transactionalEntityManager.save(Member_1.Member, member);
                // Also update account status so it stays in sync
                if (member.account) {
                    member.account.status = newStatus;
                    if (action === 'approve') {
                        member.account.is_active = true;
                    }
                    await transactionalEntityManager.save(Account_1.Account, member.account);
                }
                await MemberController.logAction(req, action === 'approve' ? 'Approve' : 'Reject', `${action === 'approve' ? 'Approved' : 'Rejected'} membership request for: ${member.first_name_en} ${member.last_name_en}`, { status: 'pending' }, { status: newStatus });
                return res.json({
                    success: true,
                    message: `Membership request ${action}d successfully`,
                    data: updatedMember,
                });
            });
        }
        catch (error) {
            console.error('Error managing membership request:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to manage membership request',
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    /**
     * UPLOAD_MEMBER_DOCUMENT - Upload member documents
     * POST /api/members/:id/documents
     */
    static async uploadMemberDocument(req, res) {
        try {
            const { id } = req.params;
            const { document_type, document_url, document_data } = req.body;
            if (!document_type) {
                return res.status(400).json({
                    success: false,
                    message: 'document_type is required',
                });
            }
            const member = await MemberController.memberRepo.findOne({ where: { id: parseInt(id) } });
            if (!member) {
                return res.status(404).json({
                    success: false,
                    message: 'Member not found',
                });
            }
            // Store document data based on type
            // This is a simplified implementation - in production, use a file storage service
            if (document_type === 'national_id_front') {
                member.national_id_front = document_data || document_url;
            }
            else if (document_type === 'national_id_back') {
                member.national_id_back = document_data || document_url;
            }
            else if (document_type === 'medical_report') {
                member.medical_report = document_data || document_url;
            }
            else if (document_type === 'photo') {
                member.photo = document_data || document_url;
            }
            const updatedMember = await MemberController.memberRepo.save(member);
            await MemberController.logAction(req, 'Upload Document', `Uploaded ${document_type} for member ID: ${id}`, null, { document_type });
            return res.status(201).json({
                success: true,
                message: 'Document uploaded successfully',
                data: {
                    member_id: member.id,
                    document_type,
                    updated_at: updatedMember.updated_at,
                },
            });
        }
        catch (error) {
            console.error('Error uploading member document:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to upload member document',
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    /**
     * DELETE_MEMBER_DOCUMENT - Delete member documents
     * DELETE /api/members/:id/documents/:document_type
     */
    static async deleteMemberDocument(req, res) {
        try {
            const { id, document_type } = req.params;
            const member = await MemberController.memberRepo.findOne({ where: { id: parseInt(id) } });
            if (!member) {
                return res.status(404).json({
                    success: false,
                    message: 'Member not found',
                });
            }
            // Remove document based on type
            if (document_type === 'national_id_front') {
                member.national_id_front = '';
            }
            else if (document_type === 'national_id_back') {
                member.national_id_back = '';
            }
            else if (document_type === 'medical_report') {
                member.medical_report = '';
            }
            else if (document_type === 'photo') {
                member.photo = '';
            }
            else {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid document_type',
                });
            }
            await MemberController.memberRepo.save(member);
            await MemberController.logAction(req, 'Delete Document', `Deleted ${document_type} for member ID: ${id}`, { document_type }, null);
            return res.json({
                success: true,
                message: 'Document deleted successfully',
                data: { member_id: member.id, document_type },
            });
        }
        catch (error) {
            console.error('Error deleting member document:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to delete member document',
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    /**
     * PRINT_MEMBER_DOCUMENT - Print member documents (returns document data)
     * GET /api/members/:id/documents/:document_type/print
     */
    static async printMemberDocument(req, res) {
        try {
            const { id, document_type } = req.params;
            const member = await MemberController.memberRepo.findOne({ where: { id: parseInt(id) } });
            if (!member) {
                return res.status(404).json({
                    success: false,
                    message: 'Member not found',
                });
            }
            let documentData = null;
            if (document_type === 'national_id_front') {
                documentData = member.national_id_front;
            }
            else if (document_type === 'national_id_back') {
                documentData = member.national_id_back;
            }
            else if (document_type === 'medical_report') {
                documentData = member.medical_report;
            }
            else if (document_type === 'photo') {
                documentData = member.photo;
            }
            else {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid document_type',
                });
            }
            if (!documentData) {
                return res.status(404).json({
                    success: false,
                    message: 'Document not found',
                });
            }
            await MemberController.logAction(req, 'Print Document', `Printed ${document_type} for member ID: ${id}`, null, { document_type });
            return res.json({
                success: true,
                data: {
                    member_id: member.id,
                    document_type,
                    document_url: documentData,
                    print_date: new Date(),
                },
            });
        }
        catch (error) {
            console.error('Error printing member document:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to print member document',
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    /**
     * PRINT_MEMBER_CARD - Print member identification card
     * GET /api/members/:id/card
     */
    static async printMemberCard(req, res) {
        try {
            const { id } = req.params;
            const member = await MemberController.memberRepo.findOne({
                where: { id: parseInt(id) },
                relations: ['account', 'member_type'],
            });
            if (!member) {
                return res.status(404).json({
                    success: false,
                    message: 'Member not found',
                });
            }
            await MemberController.logAction(req, 'Print Card', `Printed ID card for member: ${member.first_name_en} ${member.last_name_en}`, null, { card_generated: true });
            // Return member card data
            return res.json({
                success: true,
                message: 'Member card generated successfully',
                data: {
                    card_number: `CARD-${member.id}`,
                    member_name_en: `${member.first_name_en} ${member.last_name_en}`,
                    member_name_ar: `${member.first_name_ar} ${member.last_name_ar}`,
                    national_id: member.national_id,
                    member_type: member.member_type?.name_en || 'Regular',
                    issued_date: new Date(),
                    valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
                    photo: member.photo || null,
                    status: member.status,
                },
            });
        }
        catch (error) {
            console.error('Error printing member card:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to print member card',
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    /**
     * POST /api/members/:id/sports
     * Assign sports to a member
     * Note: Currently stores in audit log - full member-sport relationship schema needed for persistence
     */
    static async assignSportsToMember(req, res) {
        try {
            const { id } = req.params;
            const { sportIds } = req.body;
            if (!Array.isArray(sportIds)) {
                return res.status(400).json({
                    success: false,
                    message: 'sportIds must be an array',
                });
            }
            const member = await MemberController.memberRepo.findOne({
                where: { id: parseInt(id) },
            });
            if (!member) {
                return res.status(404).json({
                    success: false,
                    message: 'Member not found',
                });
            }
            // Validate sportIds are numbers
            const validSportIds = sportIds.filter((id) => typeof id === 'number' || !isNaN(parseInt(String(id))));
            if (validSportIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No valid sport IDs provided',
                });
            }
            // Check if this is a team member by looking up in team_members table
            const teamMemberRepo = data_source_1.AppDataSource.getRepository(TeamMember_1.TeamMember);
            const teamMemberTeamRepo = data_source_1.AppDataSource.getRepository(TeamMemberTeam_1.TeamMemberTeam);
            const teamMember = await teamMemberRepo.findOne({
                where: { account_id: member.account_id },
                relations: ['team_member_teams']
            });
            if (teamMember) {
                // This is a team member - save to team_member_teams table
                console.log(`Assigning sports to team member ${teamMember.id}`);
                // Delete existing team_member_teams for this team member
                await teamMemberTeamRepo.delete({ team_member_id: teamMember.id });
                // Import Team entity and get teams for the sports
                const { Team } = await Promise.resolve().then(() => __importStar(require('../entities/Team')));
                const teamRepo = data_source_1.AppDataSource.getRepository(Team);
                // Create new team_member_teams entries
                const newTeamMemberTeams = [];
                for (const sportId of validSportIds) {
                    // Find first active team for this sport
                    const teams = await teamRepo.find({
                        where: { sport_id: sportId, status: TeamEnums_1.TeamStatus.ACTIVE },
                        take: 1
                    });
                    if (teams.length === 0) {
                        console.warn(`No active teams found for sport ${sportId}, skipping`);
                        continue;
                    }
                    const tmt = new TeamMemberTeam_1.TeamMemberTeam();
                    tmt.team_member_id = teamMember.id;
                    tmt.team_id = teams[0].id;
                    tmt.status = 'pending';
                    tmt.price = 0;
                    const now = new Date();
                    tmt.start_date = new Date(now.getFullYear(), now.getMonth(), 1);
                    tmt.end_date = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month
                    newTeamMemberTeams.push(tmt);
                }
                await teamMemberTeamRepo.save(newTeamMemberTeams);
                console.log(`Saved ${newTeamMemberTeams.length} team member teams`);
            }
            // Log the action
            await MemberController.logAction(req, 'ASSIGN_MEMBER_SPORTS', `Assigned ${validSportIds.length} sports to member ID ${member.id}`, null, {
                member_id: member.id,
                member_name: `${member.first_name_en} ${member.last_name_en}`,
                sport_ids: validSportIds,
                assigned_at: new Date()
            });
            return res.json({
                success: true,
                message: 'Sports assigned successfully',
                data: {
                    member_id: member.id,
                    member_name: `${member.first_name_en} ${member.last_name_en}`,
                    sports_assigned: validSportIds.length,
                    sport_ids: validSportIds,
                },
            });
        }
        catch (error) {
            console.error('Error assigning sports to member:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to assign sports to member',
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
}
exports.MemberController = MemberController;
MemberController.memberRepo = data_source_1.AppDataSource.getRepository(Member_1.Member);
MemberController.accountRepo = data_source_1.AppDataSource.getRepository(Account_1.Account);
MemberController.staffRepo = data_source_1.AppDataSource.getRepository(Staff_1.Staff);
//# sourceMappingURL=MemberAdminController.js.map