"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentMemberService = void 0;
const typeorm_1 = require("typeorm");
const Member_1 = require("../entities/Member");
const MemberMembership_1 = require("../entities/MemberMembership");
const MemberRelationship_1 = require("../entities/MemberRelationship");
class StudentMemberService {
    /**
     * Get student/graduate status options
     */
    static getStudentStatusOptions() {
        return [
            { code: 'STUDENT', label_en: 'Current Student', label_ar: 'طالب حالي' },
            { code: 'GRADUATE', label_en: 'Graduate', label_ar: 'خريج' },
        ];
    }
    /**
     * Calculate if user is graduate or student based on graduation year
     * If graduation_year < current year: Graduate
     * If graduation_year >= current year: Student
     */
    static calculateStudentStatus(graduation_year) {
        const current_year = new Date().getFullYear();
        const years_since = current_year - graduation_year;
        if (graduation_year <= current_year) {
            return { status: 'GRADUATE', years_since };
        }
        return { status: 'STUDENT', years_since: -years_since }; // Negative if future graduation
    }
    /**
     * Get student/graduate membership pricing
     * Fixed pricing for both student and graduate members
     */
    static getStudentMembershipPrice(student_status) {
        // Fixed pricing: Students and Graduates pay the same
        const price = 3000; // Fixed price for student/graduate membership
        return {
            price,
            status: student_status,
        };
    }
    /**
     * Get list of active members (working, retired, or other members) for dependent selection
     */
    static async getActiveMembers() {
        const memberRepository = (0, typeorm_1.getRepository)(Member_1.Member);
        const members = await memberRepository
            .createQueryBuilder('m')
            .leftJoinAndSelect('m.account', 'a')
            .leftJoinAndSelect('m.memberships', 'mm')
            .leftJoinAndSelect('mm.membership_plan', 'mp')
            .where('m.member_type_id IN (:...typeIds)', { typeIds: [2, 3] }) // WORKING_MEMBER, RETIRED_MEMBER
            .andWhere('a.status = :status', { status: 'active' })
            .andWhere('mm.status = :mStatus', { mStatus: 'active' })
            .select([
            'm.id',
            'm.first_name_en',
            'm.first_name_ar',
            'm.last_name_en',
            'm.last_name_ar',
            'a.email',
            'mm.id',
            'mm.status',
            'mp.price',
            'mp.name_en',
            'm.member_type_id',
        ])
            .orderBy('m.first_name_en', 'ASC')
            .getMany();
        return members.map((m) => ({
            member_id: m.id,
            member_type: m.member_type_id === 2 ? 'WORKING_MEMBER' : 'RETIRED_MEMBER',
            name_en: `${m.first_name_en} ${m.last_name_en}`,
            name_ar: `${m.first_name_ar} ${m.last_name_ar}`,
            email: m.account?.email,
            active_membership: m.memberships?.[0]?.id || null,
            highest_plan_price: m.memberships?.[0]?.membership_plan?.price || 0,
        }));
    }
    /**
     * Get relationship types for dependent members
     */
    static getRelationshipTypes() {
        return [
            { code: 'spouse', label_en: 'Spouse', label_ar: 'الزوج/الزوجة' },
            { code: 'child', label_en: 'Child', label_ar: 'الابن/الابنة' },
            { code: 'parent', label_en: 'Parent', label_ar: 'الوالد/الوالدة' },
            { code: 'orphan', label_en: 'Orphan', label_ar: 'يتيم' },
        ];
    }
    /**
     * Submit student member details
     */
    static async submitStudentMemberDetails(studentData) {
        const memberRepository = (0, typeorm_1.getRepository)(Member_1.Member);
        // Calculate student status
        const { status: student_status, years_since } = this.calculateStudentStatus(studentData.graduation_year);
        // Update member type and status
        const member = await memberRepository.findOne({
            where: { id: studentData.member_id },
        });
        if (!member) {
            throw new Error('Member not found');
        }
        // Set member type based on status
        member.member_type_id = student_status === 'STUDENT' ? 5 : 6; // 5 = STUDENT_MEMBER, 6 = GRADUATE_MEMBER
        await memberRepository.save(member);
        return {
            member_id: studentData.member_id,
            university_id: studentData.university_id,
            graduation_year: studentData.graduation_year,
            student_status,
            years_since,
            status_proof: studentData.status_proof,
        };
    }
    /**
     * Calculate student/graduate membership pricing
     */
    static calculateMembershipPrice(student_status) {
        return this.getStudentMembershipPrice(student_status);
    }
    /**
     * Calculate dependent membership price (40% discount on related member's price)
     */
    static async calculateDependentMembershipPrice(memberData) {
        const memberRepository = (0, typeorm_1.getRepository)(Member_1.Member);
        const relatedMember = await memberRepository
            .createQueryBuilder('m')
            .leftJoinAndSelect('m.memberships', 'mm')
            .leftJoinAndSelect('mm.membership_plan', 'mp')
            .where('m.id = :id', { id: memberData.related_member_id })
            .andWhere('mm.status = :status', { status: 'active' })
            .orderBy('mp.price', 'DESC')
            .getOne();
        if (!relatedMember) {
            throw new Error('Related member not found or has no active membership');
        }
        const relatedPrice = relatedMember.memberships?.[0]?.membership_plan?.price || 0;
        // 40% discount on related member's price
        const discountAmount = relatedPrice * 0.4;
        const finalPrice = relatedPrice - discountAmount;
        return {
            is_dependent: true,
            related_member_price: relatedPrice,
            discount_percentage: 40,
            discount_amount: discountAmount,
            final_price: finalPrice,
        };
    }
    /**
     * Create student/graduate membership
     */
    static async createStudentMembership(memberData) {
        const pricingDetails = this.calculateMembershipPrice(memberData.student_status);
        const membershipRepository = (0, typeorm_1.getRepository)(MemberMembership_1.MemberMembership);
        const today = new Date();
        const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
        const membership = membershipRepository.create({
            member_id: memberData.member_id,
            membership_plan_id: 1, // Default plan
            start_date: today,
            end_date: nextYear,
            status: 'active',
            payment_status: 'pending',
        });
        await membershipRepository.save(membership);
        return {
            membership,
            pricing: pricingDetails,
        };
    }
    /**
     * Create student/graduate dependent member
     */
    static async createStudentDependentMembership(memberData) {
        // Calculate dependent pricing
        const pricingDetails = await this.calculateDependentMembershipPrice({
            related_member_id: memberData.related_member_id,
        });
        // Create membership
        const membershipRepository = (0, typeorm_1.getRepository)(MemberMembership_1.MemberMembership);
        const today = new Date();
        const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
        const membership = membershipRepository.create({
            member_id: memberData.member_id,
            membership_plan_id: 1, // Default plan
            start_date: today,
            end_date: nextYear,
            status: 'active',
            payment_status: 'pending',
        });
        await membershipRepository.save(membership);
        // Create relationship
        const relationshipRepository = (0, typeorm_1.getRepository)(MemberRelationship_1.MemberRelationship);
        const relationship = relationshipRepository.create({
            member_id: memberData.member_id,
            related_member_id: memberData.related_member_id,
            relationship_type: memberData.relationship_type,
            is_dependent: true,
        });
        await relationshipRepository.save(relationship);
        return {
            membership,
            relationship,
            pricing: pricingDetails,
        };
    }
    /**
     * Get student member complete status and details
     */
    static async getStudentMemberStatus(member_id) {
        const memberRepository = (0, typeorm_1.getRepository)(Member_1.Member);
        const relationshipRepository = (0, typeorm_1.getRepository)(MemberRelationship_1.MemberRelationship);
        const member = await memberRepository
            .createQueryBuilder('m')
            .leftJoinAndSelect('m.account', 'a')
            .leftJoinAndSelect('m.memberships', 'mm')
            .leftJoinAndSelect('mm.membership_plan', 'mp')
            .where('m.id = :id', { id: member_id })
            .getOne();
        const relationships = await relationshipRepository
            .createQueryBuilder('mr')
            .leftJoinAndSelect('mr.related_member', 'rm')
            .where('mr.member_id = :id', { id: member_id })
            .getMany();
        if (!member) {
            throw new Error('Member not found');
        }
        return {
            member: {
                id: member.id,
                name_en: `${member.first_name_en} ${member.last_name_en}`,
                name_ar: `${member.first_name_ar} ${member.last_name_ar}`,
                email: member.account?.email,
                status: member.status,
                phone: member.phone,
                national_id: member.national_id,
                birthdate: member.birthdate,
                health_status: member.health_status,
                photo: member.photo,
                member_type_id: member.member_type_id,
            },
            active_membership: member.memberships?.[0] || null,
            relationships: relationships.map((r) => ({
                id: r.id,
                relationship_type: r.relationship_type,
                is_dependent: r.is_dependent,
                related_member: {
                    id: r.related_member?.id,
                    name_en: `${r.related_member?.first_name_en} ${r.related_member?.last_name_en}`,
                    name_ar: `${r.related_member?.first_name_ar} ${r.related_member?.last_name_ar}`,
                    member_type_id: r.related_member?.member_type_id,
                },
            })),
        };
    }
}
exports.StudentMemberService = StudentMemberService;
//# sourceMappingURL=StudentMemberService.js.map