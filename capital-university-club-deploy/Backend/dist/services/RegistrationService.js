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
exports.RegistrationService = void 0;
const data_source_1 = require("../database/data-source");
const Account_1 = require("../entities/Account");
const Member_1 = require("../entities/Member");
const TeamMember_1 = require("../entities/TeamMember");
const MemberType_1 = require("../entities/MemberType");
const EmployeeDetail_1 = require("../entities/EmployeeDetail");
const RetiredEmployeeDetail_1 = require("../entities/RetiredEmployeeDetail");
const UniversityStudentDetail_1 = require("../entities/UniversityStudentDetail");
const MemberMembership_1 = require("../entities/MemberMembership");
const MembershipPlan_1 = require("../entities/MembershipPlan");
const bcrypt = __importStar(require("bcrypt"));
class RegistrationService {
    /**
     * Map member type code to classification (Internal/External)
     */
    static getMemberTypeClassification(memberTypeCode) {
        // Codes for Internal
        const internal = [
            'WORKING', 'STUDENT', 'GRADUATE', 'DEPENDENT_WORKING'
        ];
        // Codes for External
        const external = [
            'FOREIGNER', 'VISITOR', 'DEPENDENT_VISITOR'
        ];
        if (internal.includes(memberTypeCode))
            return 'Internal';
        if (external.includes(memberTypeCode))
            return 'External';
        return 'Unknown';
    }
    /**
     * Map member type code to form schema key (for frontend)
     * You can expand this mapping as needed
     */
    static getFormSchemaKey(memberTypeCode) {
        const mapping = {
            'WORKING': 'working_member_form',
            'STUDENT': 'student_form',
            'GRADUATE': 'graduate_form',
            'DEPENDENT_WORKING': 'dependent_working_form',
            'FOREIGNER': 'foreigner_form',
            'VISITOR': 'visitor_form',
            'DEPENDENT_VISITOR': 'dependent_visitor_form',
        };
        return mapping[memberTypeCode] || 'generic_form';
    }
    /**
     * GET /register/member-types
     * Fetches all member types from DB and enriches with
     * classification (Internal/External) and form schema key.
     * This is Step 0 of the new registration flow.
     */
    static async getMemberTypes() {
        const repo = data_source_1.AppDataSource.getRepository(MemberType_1.MemberType);
        const types = await repo.find({ order: { id: 'ASC' } });
        return types.map((t) => ({
            id: t.id,
            code: t.code,
            name_en: t.name_en,
            name_ar: t.name_ar,
            classification: this.getMemberTypeClassification(t.code),
            form_schema_key: this.getFormSchemaKey(t.code),
        }));
    }
    // دالة للتأكد من وجود الإيميل
    static async emailExists(email) {
        const accountRepository = data_source_1.AppDataSource.getRepository(Account_1.Account);
        const count = await accountRepository.count({ where: { email } });
        return count > 0;
    }
    // دالة للتأكد من وجود الرقم القومي في جدول Member و TeamMember
    static async nationalIdExists(national_id) {
        try {
            const memberRepository = data_source_1.AppDataSource.getRepository(Member_1.Member);
            const teamMemberRepository = data_source_1.AppDataSource.getRepository(TeamMember_1.TeamMember);
            const memberCount = await memberRepository.count({ where: { national_id } });
            // Try to check team_members, but gracefully handle if table doesn't exist yet
            let teamMemberCount = 0;
            try {
                teamMemberCount = await teamMemberRepository.count({ where: { national_id } });
            }
            catch {
                // Table doesn't exist yet, that's OK - just skip this check
                teamMemberCount = 0;
            }
            return memberCount > 0 || teamMemberCount > 0;
        }
        catch {
            // If there's any other error, log it and assume no duplicates (to allow registration)
            return false;
        }
    }
    static async memberExists(id) {
        const memberRepository = data_source_1.AppDataSource.getRepository(Member_1.Member);
        const count = await memberRepository.count({ where: { id } });
        return count > 0;
    }
    // الدالة الأساسية لتسجيل البيانات (Transaction)
    // إذا كان role = 'member': ينشئ في جدول members
    // إذا كان role = 'team_member': ينشئ في جدول team_members
    static async registerBasicInfo(data) {
        console.log('🔴 [registerBasicInfo] RECEIVED REQUEST:', {
            role: data.role,
            email: data.email,
            membership_type_code: data.membership_type_code,
            nationality: data.nationality,
            timestamp: new Date().toISOString()
        });
        return await data_source_1.AppDataSource.manager.transaction(async (transactionalEntityManager) => {
            // 1. إنشاء وحفظ الأكونت
            const newAccount = new Account_1.Account();
            newAccount.email = data.email;
            newAccount.password = await bcrypt.hash(data.password, 10);
            newAccount.role = data.role;
            newAccount.status = 'pending';
            newAccount.is_active = true;
            const savedAccount = await transactionalEntityManager.save(Account_1.Account, newAccount);
            const isForeign = (data.nationality || 'Egyptian').toLowerCase() !== 'egyptian';
            // 2a. إذا كان العضو من نوع member: ينشئ في جدول members
            if (data.role === 'member') {
                const newMember = new Member_1.Member();
                newMember.account = savedAccount;
                newMember.first_name_en = data.first_name_en;
                newMember.first_name_ar = data.first_name_ar;
                newMember.last_name_en = data.last_name_en;
                newMember.last_name_ar = data.last_name_ar;
                newMember.phone = data.phone || '';
                newMember.gender = data.gender || '';
                newMember.nationality = data.nationality || 'Egyptian';
                newMember.birthdate = data.birthdate || null;
                newMember.national_id = data.national_id;
                // NEW: Set member_type_id based on the selected membership type code
                const membershipTypeCode = data.membership_type_code || 'VISITOR'; // Default to VISITOR (ID 4)
                console.log(`📋 registerBasicInfo received:`, {
                    membership_type_code: data.membership_type_code,
                    finalCode: membershipTypeCode,
                    allDataKeys: Object.keys(data)
                });
                newMember.member_type_id = this.getMemberTypeIdForCode(membershipTypeCode);
                console.log(`✅ Setting member_type_id=${newMember.member_type_id} for code="${membershipTypeCode}"`);
                newMember.is_foreign = isForeign;
                newMember.status = 'pending';
                const savedMember = await transactionalEntityManager.save(Member_1.Member, newMember);
                console.log('🟢 [registerBasicInfo] MEMBER SAVED TO DB:', {
                    member_id: savedMember.id,
                    member_type_id_saved: savedMember.member_type_id,
                    membership_type_code_sent: membershipTypeCode,
                    email: savedMember.account?.email,
                    timestamp: new Date().toISOString()
                });
                // NEW: Create membership based on selected type
                await this.createMembershipForNewMember(transactionalEntityManager, savedMember.id, membershipTypeCode);
                return {
                    account_id: savedAccount.id,
                    member_id: savedMember.id,
                    team_member_id: null,
                    is_foreign: savedMember.is_foreign,
                    membership_type_code: membershipTypeCode, // NEW: Return the membership type code
                    role: 'member'
                };
            }
            // 2b. إذا كان العضو من نوع team_member: ينشئ في جدول team_members
            else if (data.role === 'team_member') {
                const newTeamMember = new TeamMember_1.TeamMember();
                newTeamMember.account = savedAccount;
                newTeamMember.first_name_en = data.first_name_en;
                newTeamMember.first_name_ar = data.first_name_ar;
                newTeamMember.last_name_en = data.last_name_en;
                newTeamMember.last_name_ar = data.last_name_ar;
                newTeamMember.phone = data.phone || '';
                newTeamMember.gender = data.gender || '';
                newTeamMember.nationality = data.nationality || 'Egyptian';
                newTeamMember.birthdate = data.birthdate || null;
                newTeamMember.national_id = data.national_id;
                newTeamMember.is_foreign = isForeign;
                newTeamMember.status = 'pending';
                // NEW: Save member_type_id for team members too (drives visibility)
                const membershipTypeCode = data.membership_type_code;
                if (membershipTypeCode) {
                    newTeamMember.member_type_id = this.getMemberTypeIdForCode(membershipTypeCode);
                    console.log(`✅ Setting team_member member_type_id=${newTeamMember.member_type_id} for code="${membershipTypeCode}"`);
                }
                else {
                    // Derive from nationality as fallback
                    newTeamMember.member_type_id = isForeign
                        ? this.getMemberTypeIdForCode('FOREIGNER')
                        : this.getMemberTypeIdForCode('WORKING');
                }
                const savedTeamMember = await transactionalEntityManager.save(TeamMember_1.TeamMember, newTeamMember);
                return {
                    account_id: savedAccount.id,
                    member_id: null,
                    team_member_id: savedTeamMember.id,
                    is_foreign: savedTeamMember.is_foreign,
                    membership_type_code: membershipTypeCode,
                    role: 'team_member'
                };
            }
            throw new Error('Invalid role');
        });
    }
    /**
     * Helper method to create initial membership for a new member
     * Maps membership_type_code to the appropriate membership plan
     */
    static async createMembershipForNewMember(transactionalEntityManager, // eslint-disable-line @typescript-eslint/no-explicit-any
    member_id, membership_type_code) {
        // Map membership type code to membership plan code
        const membershipPlanCode = this.getMembershipPlanForType(membership_type_code);
        const membershipPlanRepository = transactionalEntityManager.getRepository(MembershipPlan_1.MembershipPlan);
        // Get the membership plan from database
        const plan = await membershipPlanRepository.findOne({
            where: { plan_code: membershipPlanCode }
        });
        if (!plan) {
            console.warn(`⚠️  Membership plan ${membershipPlanCode} not found. Skipping membership creation.`);
            return;
        }
        // Calculate end date based on plan duration
        const startDate = new Date();
        const endDate = new Date(startDate);
        if (plan.duration_months) {
            endDate.setMonth(endDate.getMonth() + plan.duration_months);
        }
        // Create the membership
        const membershipRepository = transactionalEntityManager.getRepository(MemberMembership_1.MemberMembership);
        const newMembership = new MemberMembership_1.MemberMembership();
        newMembership.member_id = member_id;
        newMembership.membership_plan_id = plan.id;
        newMembership.status = 'active';
        newMembership.payment_status = 'pending'; // Will be 'paid' after payment
        newMembership.start_date = startDate;
        newMembership.end_date = endDate;
        await membershipRepository.save(newMembership);
        console.log(`✅ Created membership (${membershipPlanCode}) for member ID: ${member_id}`);
    }
    /**
     * Map membership type code to membership plan code
     */
    static getMembershipPlanForType(membershipTypeCode) {
        const mappings = {
            'VISITOR': 'ANNUAL', // Regular/Visitor member -> Annual plan
            'WORKING': 'ANNUAL', // Working member -> Annual plan
            'STUDENT': 'STUDENT', // Student -> Student plan
            'DEPENDENT': 'DEPENDENT', // Dependent -> Dependent plan
            'FOREIGNER': 'SEASONAL', // Foreigner -> Seasonal plan
            'VISITOR_HONORARY': 'ANNUAL', // Visitor Honorary -> Annual plan
            'VISITOR_ATHLETIC': 'ANNUAL', // Visitor Athletic -> Annual plan
            'SEASONAL': 'SEASONAL' // Seasonal -> Seasonal plan
        };
        return mappings[membershipTypeCode] || 'ANNUAL'; // Default to ANNUAL
    }
    /**
     * Map membership type code to member_type_id
     * These IDs correspond to the member_types table in the database
     * Based on the INSERT statements in schema.sql:
     * 1=FOUNDER, 2=WORKING, 3=DEPENDENT, 4=VISITOR, 5=VISITOR_HONORARY,
     * 6=VISITOR_ATHLETIC, 7=VISITOR_BRANCH, 8=BRANCH, 9=SEASONAL, 10=ATHLETE,
     * 11=HONORARY, 12=FOREIGNER, 13=STUDENT, 14=GRADUATE
     */
    static getMemberTypeIdForCode(membershipTypeCode) {
        const mappings = {
            'WORKING': 1, // Working member → WORKING (ID 1)
            'STUDENT': 2, // Student → STUDENT (ID 2)
            'RETIRED': 3, // Retired → RETIRED (ID 3)
            'DEPENDENT': 4, // Dependent → DEPENDENT (ID 4)
            'FOREIGNER': 5, // Foreigner → FOREIGNER (ID 5)
            'SEASONAL': 6, // Seasonal → SEASONAL (ID 6)
            'VISITOR': 7, // Regular/Visitor member → VISITOR (ID 7)
            'REGULAR': 8, // Regular → REGULAR (ID 8)
            // Fallbacks for codes that might be sent but don't exist in DB
            'VISITOR_HONORARY': 7,
            'VISITOR_ATHLETIC': 7,
            'BRANCH': 7,
            'ATHLETE': 7,
            'HONORARY': 7,
            'GRADUATE': 2 // Map graduate to student/working or keep as 2
        };
        const result = mappings[membershipTypeCode] || 7; // Default: VISITOR (ID 7)
        console.log(`🔍 getMemberTypeIdForCode: code="${membershipTypeCode}" → ID=${result}`);
        return result;
    }
    // Additional utility functions
    static async getSalaryBrackets() {
        return [
            { id: 1, range: '1000-5000' },
            { id: 2, range: '5000-10000' }
        ];
    }
    static async getDependentTiers() {
        return [
            { id: 1, name: 'First Degree' },
            { id: 2, name: 'Second Degree' }
        ];
    }
    static async determineMembershipType(data) {
        // منطق تحديد العضوية بناءً على نوع الميمبر
        // Default: VISITOR member (ID 4) - most common case
        let member_type_code = 'VISITOR';
        let member_type_id = 4;
        let membership_plan_code = 'ANNUAL';
        // IDs based on actual DB: 1=WORKING, 2=STUDENT, 3=RETIRED, 4=DEPENDENT, 5=FOREIGNER, 6=SEASONAL, 7=VISITOR, 8=REGULAR
        if (data.is_working) {
            member_type_code = 'WORKING';
            member_type_id = 1;
            membership_plan_code = 'ANNUAL';
        }
        else if (data.is_retired) {
            // Retired employees are treated as RETIRED members (ID 3)
            member_type_code = 'RETIRED';
            member_type_id = 3;
            membership_plan_code = 'ANNUAL';
        }
        else if (data.is_student) {
            member_type_code = 'STUDENT';
            member_type_id = 2;
            membership_plan_code = 'STUDENT';
        }
        else if (data.has_relation && data.relation_member_id) {
            member_type_code = 'DEPENDENT';
            member_type_id = 4;
            membership_plan_code = 'DEPENDENT';
        }
        else if (data.is_foreign) {
            member_type_code = 'FOREIGNER';
            member_type_id = 5;
            membership_plan_code = 'SEASONAL';
        }
        return {
            member_type_code,
            member_type_id,
            membership_plan_code
        };
    }
    static async createMembership(data) {
        // Check if this is a team member (sports player)
        // Team members don't have memberships in the member_memberships table
        const teamMemberRepository = data_source_1.AppDataSource.getRepository(TeamMember_1.TeamMember);
        const isTeamMember = await teamMemberRepository.findOne({
            where: { id: data.member_id }
        });
        if (isTeamMember) {
            // Team members don't need memberships - just return a dummy response
            console.log(`⚠️  Skipping membership creation for team member ID: ${data.member_id}`);
            return {
                id: 0,
                member_id: data.member_id,
                status: 'active',
                payment_status: 'paid',
                start_date: new Date(),
                end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
            };
        }
        const membershipPlanRepository = data_source_1.AppDataSource.getRepository(MembershipPlan_1.MembershipPlan);
        // الحصول على خطة العضوية من قاعدة البيانات
        const plan = await membershipPlanRepository.findOne({
            where: { plan_code: data.membership_plan_code }
        });
        if (!plan) {
            throw new Error(`Membership plan ${data.membership_plan_code} not found`);
        }
        // منطق إنشاء العضوية النهائية
        const membershipRepository = data_source_1.AppDataSource.getRepository(MemberMembership_1.MemberMembership);
        const startDate = data.start_date || new Date();
        // حساب تاريخ الانتهاء بناءً على مدة الخطة
        const endDate = new Date(startDate);
        if (plan.duration_months) {
            endDate.setMonth(endDate.getMonth() + plan.duration_months);
        }
        const newMembership = new MemberMembership_1.MemberMembership();
        newMembership.member_id = data.member_id;
        newMembership.membership_plan_id = plan.id;
        newMembership.status = 'active';
        newMembership.payment_status = 'paid';
        newMembership.start_date = startDate;
        newMembership.end_date = endDate;
        const savedMembership = await membershipRepository.save(newMembership);
        return {
            id: savedMembership.id,
            member_id: savedMembership.member_id,
            status: savedMembership.status,
            payment_status: savedMembership.payment_status,
            start_date: savedMembership.start_date,
            end_date: savedMembership.end_date
        };
    }
    /**
     * Complete Registration Flow for Working Members
     * Registers member in: accounts → members → employee_details → membership
     */
    static async registerWorkingMember(data) {
        return await data_source_1.AppDataSource.manager.transaction(async (transactionalEntityManager) => {
            try {
                // Step 1: Create Account
                const newAccount = new Account_1.Account();
                newAccount.email = data.email;
                newAccount.password = await bcrypt.hash(data.password, 10);
                newAccount.role = 'member';
                newAccount.status = 'active';
                newAccount.is_active = true;
                const savedAccount = await transactionalEntityManager.save(Account_1.Account, newAccount);
                console.log('✅ Account created:', savedAccount.id);
                // Step 2: Create Member
                const newMember = new Member_1.Member();
                newMember.account = savedAccount;
                newMember.first_name_en = data.first_name_en;
                newMember.first_name_ar = data.first_name_ar;
                newMember.last_name_en = data.last_name_en;
                newMember.last_name_ar = data.last_name_ar;
                newMember.phone = data.phone || '';
                newMember.gender = data.gender || '';
                newMember.nationality = data.nationality || 'Egyptian';
                newMember.birthdate = data.birthdate || null;
                newMember.national_id = data.national_id;
                newMember.member_type_id = 1; // Working member type
                newMember.is_foreign = false;
                newMember.status = 'active';
                const savedMember = await transactionalEntityManager.save(Member_1.Member, newMember);
                console.log('✅ Member created:', savedMember.id);
                // Step 3: Create Employee Details
                const employeeDetail = new EmployeeDetail_1.EmployeeDetail();
                employeeDetail.member_id = savedMember.id;
                employeeDetail.profession_id = data.profession_id;
                employeeDetail.department_en = data.department_en || '';
                employeeDetail.department_ar = data.department_ar || '';
                employeeDetail.salary = data.salary;
                employeeDetail.salary_slip = data.salary_slip || '';
                employeeDetail.employment_start_date = data.employment_start_date || new Date();
                const savedEmployeeDetail = await transactionalEntityManager.save(EmployeeDetail_1.EmployeeDetail, employeeDetail);
                console.log('✅ Employee details created:', savedEmployeeDetail.id);
                // Step 4: Create Membership
                const membershipPlan = await transactionalEntityManager.findOne(MembershipPlan_1.MembershipPlan, {
                    where: { id: data.membership_plan_id }
                });
                if (!membershipPlan) {
                    throw new Error('Membership plan not found');
                }
                const membership = new MemberMembership_1.MemberMembership();
                membership.member_id = savedMember.id;
                membership.membership_plan_id = data.membership_plan_id;
                membership.status = 'active';
                membership.start_date = new Date();
                membership.end_date = new Date(Date.now() + (membershipPlan.duration_months * 30 * 24 * 60 * 60 * 1000));
                const savedMembership = await transactionalEntityManager.save(MemberMembership_1.MemberMembership, membership);
                console.log('✅ Membership created:', savedMembership.id);
                return {
                    success: true,
                    message: 'Working member registered successfully',
                    data: {
                        account_id: savedAccount.id,
                        member_id: savedMember.id,
                        employee_detail_id: savedEmployeeDetail.id,
                        membership_id: savedMembership.id,
                        member_type: 'working',
                        status: 'active'
                    }
                };
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error('❌ Error in registration transaction:', errorMessage);
                throw new Error(`Registration failed: ${errorMessage}`);
            }
        });
    }
    /**
     * Complete Registration Flow for Retired Members
     */
    static async registerRetiredMember(data) {
        return await data_source_1.AppDataSource.manager.transaction(async (transactionalEntityManager) => {
            try {
                // Step 1: Create Account
                const newAccount = new Account_1.Account();
                newAccount.email = data.email;
                newAccount.password = await bcrypt.hash(data.password, 10);
                newAccount.role = 'member';
                newAccount.status = 'active';
                newAccount.is_active = true;
                const savedAccount = await transactionalEntityManager.save(Account_1.Account, newAccount);
                console.log('✅ Account created:', savedAccount.id);
                // Step 2: Create Member
                const newMember = new Member_1.Member();
                newMember.account = savedAccount;
                newMember.first_name_en = data.first_name_en;
                newMember.first_name_ar = data.first_name_ar;
                newMember.last_name_en = data.last_name_en;
                newMember.last_name_ar = data.last_name_ar;
                newMember.phone = data.phone || '';
                newMember.gender = data.gender || '';
                newMember.nationality = data.nationality || 'Egyptian';
                newMember.birthdate = data.birthdate || null;
                newMember.national_id = data.national_id;
                newMember.member_type_id = 3; // Retired employee type (RETIRED - ID 3)
                newMember.is_foreign = false;
                newMember.status = 'active';
                const savedMember = await transactionalEntityManager.save(Member_1.Member, newMember);
                console.log('✅ Member created:', savedMember.id);
                // Step 3: Create Retired Employee Details
                const retiredDetail = new RetiredEmployeeDetail_1.RetiredEmployeeDetail();
                retiredDetail.member_id = savedMember.id;
                retiredDetail.profession_code = data.profession_id.toString();
                retiredDetail.former_department_en = data.former_department_en || '';
                retiredDetail.former_department_ar = data.former_department_ar || '';
                retiredDetail.retirement_date = data.retirement_date;
                retiredDetail.last_salary = data.last_salary || null;
                retiredDetail.salary_slip = data.salary_slip || null;
                const savedRetiredDetail = await transactionalEntityManager.save(RetiredEmployeeDetail_1.RetiredEmployeeDetail, retiredDetail);
                console.log('✅ Retired employee details created:', savedRetiredDetail.id);
                // Step 4: Create Membership
                const membershipPlan = await transactionalEntityManager.findOne(MembershipPlan_1.MembershipPlan, {
                    where: { id: data.membership_plan_id }
                });
                if (!membershipPlan) {
                    throw new Error('Membership plan not found');
                }
                const membership = new MemberMembership_1.MemberMembership();
                membership.member_id = savedMember.id;
                membership.membership_plan_id = data.membership_plan_id;
                membership.status = 'active';
                membership.start_date = new Date();
                membership.end_date = new Date(Date.now() + (membershipPlan.duration_months * 30 * 24 * 60 * 60 * 1000));
                const savedMembership = await transactionalEntityManager.save(MemberMembership_1.MemberMembership, membership);
                console.log('✅ Membership created:', savedMembership.id);
                return {
                    success: true,
                    message: 'Retired member registered successfully',
                    data: {
                        account_id: savedAccount.id,
                        member_id: savedMember.id,
                        retired_detail_id: savedRetiredDetail.id,
                        membership_id: savedMembership.id,
                        member_type: 'retired',
                        status: 'active'
                    }
                };
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error('❌ Error in retirement registration:', errorMessage);
                throw new Error(`Registration failed: ${errorMessage}`);
            }
        });
    }
    /**
     * Complete Registration Flow for Student Members
     */
    static async registerStudentMember(data) {
        return await data_source_1.AppDataSource.manager.transaction(async (transactionalEntityManager) => {
            try {
                // Step 1: Create Account
                const newAccount = new Account_1.Account();
                newAccount.email = data.email;
                newAccount.password = await bcrypt.hash(data.password, 10);
                newAccount.role = 'member';
                newAccount.status = 'active';
                newAccount.is_active = true;
                const savedAccount = await transactionalEntityManager.save(Account_1.Account, newAccount);
                console.log('✅ Account created:', savedAccount.id);
                // Step 2: Create Member
                const newMember = new Member_1.Member();
                newMember.account = savedAccount;
                newMember.first_name_en = data.first_name_en;
                newMember.first_name_ar = data.first_name_ar;
                newMember.last_name_en = data.last_name_en;
                newMember.last_name_ar = data.last_name_ar;
                newMember.phone = data.phone || '';
                newMember.gender = data.gender || '';
                newMember.nationality = data.nationality || 'Egyptian';
                newMember.birthdate = data.birthdate || null;
                newMember.national_id = data.national_id;
                newMember.member_type_id = 2; // Student member type (ID 2 from DB)
                newMember.is_foreign = false;
                newMember.status = 'active';
                // Add file paths
                if (data.personal_photo) {
                    newMember.photo = data.personal_photo;
                }
                if (data.national_id_front) {
                    newMember.national_id_front = data.national_id_front;
                }
                if (data.national_id_back) {
                    newMember.national_id_back = data.national_id_back;
                }
                if (data.medical_report) {
                    newMember.medical_report = data.medical_report;
                }
                const savedMember = await transactionalEntityManager.save(Member_1.Member, newMember);
                console.log('✅ Member created:', savedMember.id);
                // Step 3: Create Student Details
                const studentDetail = new UniversityStudentDetail_1.UniversityStudentDetail();
                studentDetail.member_id = savedMember.id;
                if (data.faculty_id) {
                    studentDetail.faculty_id = data.faculty_id;
                }
                studentDetail.enrollment_date = new Date();
                if (data.student_proof) {
                    studentDetail.student_proof = data.student_proof;
                }
                const savedStudentDetail = await transactionalEntityManager.save(UniversityStudentDetail_1.UniversityStudentDetail, studentDetail);
                console.log('✅ Student details created:', savedStudentDetail.id);
                // Step 4: Create Membership
                const membershipPlan = await transactionalEntityManager.findOne(MembershipPlan_1.MembershipPlan, {
                    where: { id: data.membership_plan_id }
                });
                if (!membershipPlan) {
                    throw new Error('Membership plan not found');
                }
                const membership = new MemberMembership_1.MemberMembership();
                membership.member_id = savedMember.id;
                membership.membership_plan_id = data.membership_plan_id;
                membership.status = 'active';
                membership.start_date = new Date();
                membership.end_date = new Date(Date.now() + (membershipPlan.duration_months * 30 * 24 * 60 * 60 * 1000));
                const savedMembership = await transactionalEntityManager.save(MemberMembership_1.MemberMembership, membership);
                console.log('✅ Membership created:', savedMembership.id);
                return {
                    success: true,
                    message: 'Student member registered successfully',
                    data: {
                        account_id: savedAccount.id,
                        member_id: savedMember.id,
                        student_detail_id: savedStudentDetail.id,
                        membership_id: savedMembership.id,
                        member_type: 'student',
                        status: 'active'
                    }
                };
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error('❌ Error in student registration:', errorMessage);
                throw new Error(`Registration failed: ${errorMessage}`);
            }
        });
    }
    /**
     * Rollback a partially-created registration.
     * Deletes the account identified by account_id and all related records
     * (members / team_members and their children) atomically inside a transaction.
     *
     * Called by DELETE /register/rollback/:account_id whenever any step after
     * /register/basic fails on the frontend, so no orphaned rows are left in the DB.
     */
    static async rollbackRegistration(account_id) {
        const accountRepository = data_source_1.AppDataSource.getRepository(Account_1.Account);
        const memberRepository = data_source_1.AppDataSource.getRepository(Member_1.Member);
        const teamMemberRepository = data_source_1.AppDataSource.getRepository(TeamMember_1.TeamMember);
        return await data_source_1.AppDataSource.manager.transaction(async (em) => {
            // Only allow rollback of accounts that are still in 'pending' status
            // (i.e. registration was never completed / approved).
            const account = await em.findOne(Account_1.Account, { where: { id: account_id } });
            if (!account) {
                return { deleted: false };
            }
            if (account.status !== 'pending') {
                throw new Error('Cannot rollback a registration that has already been completed or approved.');
            }
            // Delete related member record (FK: members.account_id → accounts.id)
            const member = await memberRepository.findOne({ where: { account_id } });
            if (member) {
                // Delete child records that don't have DB-level CASCADE
                await em.query('DELETE FROM member_memberships WHERE member_id = $1', [member.id]);
                await em.query('DELETE FROM employee_details WHERE member_id = $1', [member.id]);
                await em.query('DELETE FROM retired_employee_details WHERE member_id = $1', [member.id]);
                await em.query('DELETE FROM university_student_details WHERE member_id = $1', [member.id]);
                await em.query('DELETE FROM outsider_details WHERE member_id = $1', [member.id]);
                await em.query('DELETE FROM member_relationships WHERE member_id = $1 OR related_member_id = $1', [member.id]);
                await em.remove(Member_1.Member, member);
            }
            // Delete related team_member record (FK: team_members.account_id → accounts.id)
            const teamMember = await teamMemberRepository.findOne({ where: { account_id } });
            if (teamMember) {
                await em.query('DELETE FROM team_member_team_subscriptions WHERE team_member_id = $1', [teamMember.id]);
                await em.query('DELETE FROM team_member_teams WHERE team_member_id = $1', [teamMember.id]);
                await em.remove(TeamMember_1.TeamMember, teamMember);
            }
            // Finally delete the account itself
            await em.remove(Account_1.Account, account);
            console.log(`🗑️  Rolled back registration for account_id=${account_id}`);
            return { deleted: true };
        });
    }
}
exports.RegistrationService = RegistrationService;
exports.default = RegistrationService;
//# sourceMappingURL=RegistrationService.js.map