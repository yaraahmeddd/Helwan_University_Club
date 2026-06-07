"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DetailedRegistrationService = void 0;
const data_source_1 = require("../database/data-source");
const Member_1 = require("../entities/Member");
const OutsiderDetail_1 = require("../entities/OutsiderDetail");
const EmployeeDetail_1 = require("../entities/EmployeeDetail");
const RetiredEmployeeDetail_1 = require("../entities/RetiredEmployeeDetail");
const UniversityStudentDetail_1 = require("../entities/UniversityStudentDetail");
const MemberMembership_1 = require("../entities/MemberMembership");
const Branch_1 = require("../entities/Branch");
const ActivityLog_1 = require("../entities/ActivityLog");
const Faculty_1 = require("../entities/Faculty");
/**
 * Detailed Registration Service
 * Handles STEP 2: Collecting detailed information based on membership type
 */
class DetailedRegistrationService {
    constructor() {
        this.memberRepository = data_source_1.AppDataSource.getRepository(Member_1.Member);
        this.outsiderDetailRepository = data_source_1.AppDataSource.getRepository(OutsiderDetail_1.OutsiderDetail);
        this.employeeDetailRepository = data_source_1.AppDataSource.getRepository(EmployeeDetail_1.EmployeeDetail);
        this.retiredEmployeeDetailRepository = data_source_1.AppDataSource.getRepository(RetiredEmployeeDetail_1.RetiredEmployeeDetail);
        this.universityStudentDetailRepository = data_source_1.AppDataSource.getRepository(UniversityStudentDetail_1.UniversityStudentDetail);
        this.memberMembershipRepository = data_source_1.AppDataSource.getRepository(MemberMembership_1.MemberMembership);
        this.branchRepository = data_source_1.AppDataSource.getRepository(Branch_1.Branch);
        this.activityLogRepository = data_source_1.AppDataSource.getRepository(ActivityLog_1.ActivityLog);
        this.facultyRepository = data_source_1.AppDataSource.getRepository(Faculty_1.Faculty);
    }
    /**
     * Get all available branches (for visitor-branch selection)
     */
    async getAllBranches() {
        return await this.branchRepository.find({
            select: ['id', 'code', 'name_en', 'name_ar', 'location_en', 'location_ar', 'phone'],
        });
    }
    /**
     * Get visitor membership types (dropdown options)
     */
    getVisitorMembershipTypes() {
        return [
            {
                code: 'VISITOR',
                label_en: 'Regular Visitor',
                label_ar: 'زائر عادي',
                description_en: 'Standard visitor membership',
                description_ar: 'عضوية زائر عادية',
            },
            {
                code: 'VISITOR_HONORARY',
                label_en: 'Honorary Visitor',
                label_ar: 'زائر فخري',
                description_en: 'Honorary visitor status',
                description_ar: 'حالة زائر فخري',
            },
            {
                code: 'VISITOR_ATHLETIC',
                label_en: 'Athletic Visitor',
                label_ar: 'زائر رياضي',
                description_en: 'Athlete visitor membership',
                description_ar: 'عضوية زائر رياضي',
            },
            {
                code: 'VISITOR_BRANCH',
                label_en: 'Branch Visitor',
                label_ar: 'زائر من الفرع',
                description_en: 'Visitor from club branch',
                description_ar: 'زائر من فرع النادي',
                requires_branch: true,
            },
        ];
    }
    /**
     * STEP 2.1: Submit detailed info for Visitor/Outsider Members
     */
    async submitVisitorDetailedInfo(memberData) {
        // Validate branch_id if visitor-branch
        if (memberData.visitor_type === 'VISITOR_BRANCH' && !memberData.branch_id) {
            throw new Error('Branch is required for visitor-branch membership');
        }
        if (memberData.visitor_type === 'VISITOR_BRANCH' && memberData.branch_id) {
            const branch = await this.branchRepository.findOne({
                where: { id: memberData.branch_id },
            });
            if (!branch) {
                throw new Error('Selected branch not found');
            }
        }
        // ========================================================================
        // VALIDATE ESSENTIAL FILES (photo, national IDs, medical) - Must not be null/missing
        // Category-specific files (passport_photo) are optional
        // ========================================================================
        const missingFiles = [];
        if (!memberData.national_id_front)
            missingFiles.push('national_id_front');
        if (!memberData.national_id_back)
            missingFiles.push('national_id_back');
        if (!memberData.personal_photo)
            missingFiles.push('personal_photo');
        if (!memberData.medical_report)
            missingFiles.push('medical_report');
        if (missingFiles.length > 0) {
            // DELETE the member record from database since registration is incomplete
            await this.memberRepository.delete({ id: memberData.member_id });
            console.log(`🗑️  Deleted incomplete member ID ${memberData.member_id} due to missing files: ${missingFiles.join(', ')}`);
            throw new Error(`Essential files are missing: ${missingFiles.join(', ')}. Member registration cancelled and deleted.`);
        }
        // Update member with additional information
        const updateData = {};
        if (memberData.national_id_front)
            updateData.national_id_front = memberData.national_id_front;
        if (memberData.national_id_back)
            updateData.national_id_back = memberData.national_id_back;
        if (memberData.personal_photo)
            updateData.photo = memberData.personal_photo;
        if (memberData.medical_report)
            updateData.medical_report = memberData.medical_report;
        if (memberData.address)
            updateData.address = memberData.address;
        if (Object.keys(updateData).length > 0) {
            await this.memberRepository.update({ id: memberData.member_id }, updateData);
        }
        // Create or update outsider details
        let outsider = await this.outsiderDetailRepository.findOne({
            where: { member_id: memberData.member_id },
        });
        if (!outsider) {
            await this.outsiderDetailRepository.insert({
                member_id: memberData.member_id,
                job_title_en: memberData.job_title_en || null,
                job_title_ar: memberData.job_title_ar || null,
                employment_status: memberData.employment_status || 'employed',
                visitor_type: memberData.visitor_type,
                branch_id: memberData.branch_id || null,
            });
            outsider = await this.outsiderDetailRepository.findOne({
                where: { member_id: memberData.member_id },
            });
        }
        else {
            outsider.job_title_en = memberData.job_title_en || null;
            outsider.job_title_ar = memberData.job_title_ar || null;
            outsider.employment_status = memberData.employment_status || 'employed';
            outsider.visitor_type = memberData.visitor_type;
            outsider.branch_id = memberData.branch_id || null;
            await this.outsiderDetailRepository.save(outsider);
        }
        // Log activity
        await this.activityLogRepository.insert({
            member_id: memberData.member_id,
            action: 'detailed_info_submitted',
            description: `Submitted detailed information for ${memberData.visitor_type} membership`,
            action_date: new Date(),
        });
        return {
            success: true,
            message: 'Detailed information saved successfully',
            outsider_id: outsider?.id,
        };
    }
    /**
     * STEP 2.2: Submit detailed info for Working Members
     */
    async submitWorkingMemberDetailedInfo(memberData) {
        // ========================================================================
        // VALIDATE ESSENTIAL FILES - Must not be null/missing
        // ========================================================================
        const missingFiles = [];
        if (!memberData.national_id_front)
            missingFiles.push('national_id_front');
        if (!memberData.national_id_back)
            missingFiles.push('national_id_back');
        if (!memberData.personal_photo)
            missingFiles.push('personal_photo');
        if (!memberData.medical_report)
            missingFiles.push('medical_report');
        if (missingFiles.length > 0) {
            // DELETE the member record from database since registration is incomplete
            await this.memberRepository.delete({ id: memberData.member_id });
            console.log(`🗑️  Deleted incomplete member ID ${memberData.member_id} due to missing files: ${missingFiles.join(', ')}`);
            throw new Error(`Essential files are missing: ${missingFiles.join(', ')}. Member registration cancelled and deleted.`);
        }
        // Update member with photos and documents
        const updateData = {};
        if (memberData.national_id_front)
            updateData.national_id_front = memberData.national_id_front;
        if (memberData.national_id_back)
            updateData.national_id_back = memberData.national_id_back;
        if (memberData.personal_photo)
            updateData.photo = memberData.personal_photo;
        if (memberData.medical_report)
            updateData.medical_report = memberData.medical_report;
        if (memberData.address)
            updateData.address = memberData.address;
        if (Object.keys(updateData).length > 0) {
            await this.memberRepository.update({ id: memberData.member_id }, updateData);
        }
        // Create employee details
        const result = await this.employeeDetailRepository.insert({
            member_id: memberData.member_id,
            profession_id: memberData.profession_id,
            department_en: memberData.department_en,
            department_ar: memberData.department_ar,
            salary: memberData.salary,
            salary_slip: memberData.salary_slip || undefined,
            employment_start_date: memberData.employment_start_date,
        });
        // Log activity
        await this.activityLogRepository.insert({
            member_id: memberData.member_id,
            action: 'detailed_info_submitted',
            description: 'Submitted detailed information for working member',
            action_date: new Date(),
        });
        return {
            success: true,
            message: 'Working member details saved successfully',
            employee_detail_id: result.identifiers[0].id,
        };
    }
    /**
     * STEP 2.3: Submit detailed info for Retired Members
     */
    async submitRetiredMemberDetailedInfo(memberData) {
        // ========================================================================
        // VALIDATE ESSENTIAL FILES - Must not be null/missing
        // ========================================================================
        const missingFiles = [];
        if (!memberData.national_id_front)
            missingFiles.push('national_id_front');
        if (!memberData.national_id_back)
            missingFiles.push('national_id_back');
        if (!memberData.personal_photo)
            missingFiles.push('personal_photo');
        if (!memberData.medical_report)
            missingFiles.push('medical_report');
        if (missingFiles.length > 0) {
            // DELETE the member record from database since registration is incomplete
            await this.memberRepository.delete({ id: memberData.member_id });
            console.log(`🗑️  Deleted incomplete member ID ${memberData.member_id} due to missing files: ${missingFiles.join(', ')}`);
            throw new Error(`Essential files are missing: ${missingFiles.join(', ')}. Member registration cancelled and deleted.`);
        }
        // Update member with photos and documents
        const updateData = {};
        if (memberData.national_id_front)
            updateData.national_id_front = memberData.national_id_front;
        if (memberData.national_id_back)
            updateData.national_id_back = memberData.national_id_back;
        if (memberData.personal_photo)
            updateData.photo = memberData.personal_photo;
        if (memberData.medical_report)
            updateData.medical_report = memberData.medical_report;
        if (memberData.address)
            updateData.address = memberData.address;
        if (Object.keys(updateData).length > 0) {
            await this.memberRepository.update({ id: memberData.member_id }, updateData);
        }
        // Create retired employee details
        await this.retiredEmployeeDetailRepository.insert({
            member_id: memberData.member_id,
            former_department_en: memberData.former_department_en,
            former_department_ar: memberData.former_department_ar,
            retirement_date: memberData.retirement_date,
            last_salary: memberData.last_salary,
            salary_slip: memberData.salary_slip,
        });
        // Log activity
        await this.activityLogRepository.insert({
            member_id: memberData.member_id,
            action: 'detailed_info_submitted',
            description: 'Submitted detailed information for retired member',
            action_date: new Date(),
        });
        return {
            success: true,
            message: 'Retired member details saved successfully',
        };
    }
    /**
     * STEP 2.4: Submit detailed info for Student Members
     */
    async submitStudentMemberDetailedInfo(memberData) {
        // ========================================================================
        // VALIDATE ESSENTIAL FILES (photo, national IDs, medical) - Must not be null/missing
        // Category-specific files (student_proof) are optional
        // ========================================================================
        const missingFiles = [];
        if (!memberData.national_id_front)
            missingFiles.push('national_id_front');
        if (!memberData.national_id_back)
            missingFiles.push('national_id_back');
        if (!memberData.personal_photo)
            missingFiles.push('personal_photo');
        if (!memberData.medical_report)
            missingFiles.push('medical_report');
        if (missingFiles.length > 0) {
            // DELETE the member record from database since registration is incomplete
            await this.memberRepository.delete({ id: memberData.member_id });
            console.log(`🗑️  Deleted incomplete member ID ${memberData.member_id} due to missing files: ${missingFiles.join(', ')}`);
            throw new Error(`Essential files are missing: ${missingFiles.join(', ')}. Member registration cancelled and deleted.`);
        }
        // Update member with photos and documents
        const updateData = {};
        if (memberData.national_id_front)
            updateData.national_id_front = memberData.national_id_front;
        if (memberData.national_id_back)
            updateData.national_id_back = memberData.national_id_back;
        if (memberData.personal_photo)
            updateData.photo = memberData.personal_photo;
        if (memberData.medical_report)
            updateData.medical_report = memberData.medical_report;
        if (memberData.address)
            updateData.address = memberData.address;
        if (Object.keys(updateData).length > 0) {
            await this.memberRepository.update({ id: memberData.member_id }, updateData);
        }
        // Check if student details already exist (created during registration)
        const existingStudent = await this.universityStudentDetailRepository.findOne({
            where: { member_id: memberData.member_id }
        });
        if (existingStudent) {
            // Update existing record
            const updateStudentData = {};
            if (memberData.faculty_id)
                updateStudentData.faculty_id = memberData.faculty_id;
            if (memberData.graduation_year)
                updateStudentData.graduation_year = memberData.graduation_year;
            if (memberData.enrollment_date)
                updateStudentData.enrollment_date = memberData.enrollment_date;
            if (memberData.student_proof)
                updateStudentData.student_proof = memberData.student_proof;
            await this.universityStudentDetailRepository.update({ member_id: memberData.member_id }, updateStudentData);
        }
        else {
            // Create new record (fallback, shouldn't happen for complete registrations)
            const insertData = {
                member_id: memberData.member_id,
            };
            if (memberData.faculty_id !== null && memberData.faculty_id !== undefined) {
                insertData.faculty_id = memberData.faculty_id;
            }
            if (memberData.graduation_year !== null && memberData.graduation_year !== undefined) {
                insertData.graduation_year = memberData.graduation_year;
            }
            if (memberData.enrollment_date !== null && memberData.enrollment_date !== undefined) {
                insertData.enrollment_date = memberData.enrollment_date;
            }
            if (memberData.student_proof !== null && memberData.student_proof !== undefined) {
                insertData.student_proof = memberData.student_proof;
            }
            await this.universityStudentDetailRepository.insert(insertData);
        }
        // Log activity
        await this.activityLogRepository.insert({
            member_id: memberData.member_id,
            action: 'detailed_info_submitted',
            description: 'Submitted detailed information for student member',
            action_date: new Date(),
        });
        return {
            success: true,
            message: 'Student member details saved successfully',
        };
    }
    /**
     * Get member status and membership info
     */
    async getMemberRegistrationStatus(memberId) {
        const member = await this.memberRepository.findOne({
            where: { id: memberId },
            relations: ['member_type', 'memberships'],
        });
        if (!member) {
            throw new Error('Member not found');
        }
        const outsider = await this.outsiderDetailRepository.findOne({
            where: { member_id: memberId },
            relations: ['branch'],
        });
        const membership = await this.memberMembershipRepository.findOne({
            where: { member_id: memberId },
            order: { created_at: 'DESC' },
            relations: ['membership_plan'],
        });
        return {
            member_id: member.id,
            member_type: member.member_type.code,
            member_type_name: member.member_type.name_en,
            status: member.status,
            membership_active: membership ? true : false,
            membership_plan: membership?.membership_plan.plan_code,
            outsider_details: outsider,
            documents_uploaded: {
                national_id_front: !!member.national_id_front,
                national_id_back: !!member.national_id_back,
                personal_photo: !!member.photo,
                medical_report: !!member.medical_report,
            },
        };
    }
}
exports.DetailedRegistrationService = DetailedRegistrationService;
exports.default = new DetailedRegistrationService();
//# sourceMappingURL=DetailedRegistrationService.js.map