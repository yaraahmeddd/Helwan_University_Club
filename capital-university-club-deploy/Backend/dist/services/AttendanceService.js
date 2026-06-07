"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceService = void 0;
const data_source_1 = require("../database/data-source");
const Attendance_1 = require("../entities/Attendance");
const MemberTeam_1 = require("../entities/MemberTeam");
const Member_1 = require("../entities/Member");
const TeamMember_1 = require("../entities/TeamMember");
const TeamMemberTeam_1 = require("../entities/TeamMemberTeam");
const Team_1 = require("../entities/Team");
const TeamTrainingSchedule_1 = require("../entities/TeamTrainingSchedule");
class AttendanceService {
    constructor() {
        this.attendanceRepository = data_source_1.AppDataSource.getRepository(Attendance_1.Attendance);
        this.memberRepository = data_source_1.AppDataSource.getRepository(Member_1.Member);
        this.teamMemberRepository = data_source_1.AppDataSource.getRepository(TeamMember_1.TeamMember);
        this.teamRepository = data_source_1.AppDataSource.getRepository(Team_1.Team);
        this.scheduleRepository = data_source_1.AppDataSource.getRepository(TeamTrainingSchedule_1.TeamTrainingSchedule);
        this.memberTeamRepository = data_source_1.AppDataSource.getRepository(MemberTeam_1.MemberTeam);
        this.teamMemberTeamRepository = data_source_1.AppDataSource.getRepository(TeamMemberTeam_1.TeamMemberTeam);
    }
    /**
     * Record attendance for a member or team member
     */
    async recordAttendance(request) {
        const { member_id, team_member_id, team_id, training_schedule_id, attendance_date, attended, notes } = request;
        if (!member_id && !team_member_id) {
            throw new Error('Either member_id or team_member_id must be provided');
        }
        // Validate team exists
        const team = await this.teamRepository.findOne({ where: { id: team_id } });
        if (!team)
            throw new Error(`Team with ID ${team_id} not found`);
        // Validate training schedule
        const schedule = await this.scheduleRepository.findOne({ where: { id: training_schedule_id } });
        if (!schedule)
            throw new Error(`Training schedule with ID ${training_schedule_id} not found`);
        const dateStr = attendance_date.toISOString().split('T')[0];
        // Check if attendance already recorded
        const where = {
            team_id,
            training_schedule_id,
            attendance_date: dateStr,
        };
        if (member_id)
            where.member_id = member_id;
        else
            where.team_member_id = team_member_id;
        let attendance = await this.attendanceRepository.findOne({ where });
        if (attendance) {
            attendance.attended = attended;
            attendance.notes = notes || attendance.notes;
        }
        else {
            attendance = this.attendanceRepository.create({
                member_id: member_id || null,
                team_member_id: team_member_id || null,
                team_id,
                training_schedule_id,
                attendance_date: dateStr,
                attended,
                notes,
            });
        }
        return await this.attendanceRepository.save(attendance);
    }
    /**
     * Get attendance stats for a member or team member
     */
    async getEntityOverallStats(id, type) {
        const where = type === 'member' ? { member_id: id } : { team_member_id: id };
        const records = await this.attendanceRepository.find({ where });
        const attended = records.filter(r => r.attended).length;
        const missed = records.filter(r => !r.attended).length;
        const total = records.length;
        const rate = total > 0 ? (attended / total) * 100 : 0;
        return {
            total_sessions: total,
            attended_sessions: attended,
            missed_sessions: missed,
            attendance_rate: Math.round(rate * 100) / 100,
        };
    }
    /**
     * Get member sports (teams they are joined in)
     */
    async getJoinedSports(id, type) {
        if (type === 'member') {
            const joined = await this.memberTeamRepository
                .createQueryBuilder('mt')
                .leftJoinAndSelect('mt.team', 'team')
                .leftJoinAndSelect('team.sport', 'sport')
                .leftJoinAndSelect('team.training_schedules', 'schedule')
                .leftJoinAndSelect('schedule.field', 'field')
                .addSelect(['mt.start_date', 'mt.end_date', 'mt.subscription_status'])
                .where('mt.member_id = :memberId', { memberId: id })
                .andWhere('mt.team_id IS NOT NULL')
                .andWhere("COALESCE(mt.subscription_status, 'pending_admin_approval') <> :pendingPayment", {
                pendingPayment: 'pending_payment',
            })
                .andWhere('mt.status NOT IN (:...excludedStatuses)', { excludedStatuses: ['cancelled', 'declined'] })
                .orderBy('mt.created_at', 'DESC')
                .getMany();
            return joined.map(j => ({
                id: j.team.id,
                name: j.team.name_en,
                name_ar: j.team.name_ar,
                sport_name: j.team.sport?.name_en,
                sport_name_ar: j.team.sport?.name_ar,
                sport_image: j.team.sport?.sport_image ?? null,
                status: j.status,
                start_date: j.start_date,
                end_date: j.end_date,
                schedules: j.team.training_schedules,
            }));
        }
        else {
            const joined = await this.teamMemberTeamRepository
                .createQueryBuilder('tmt')
                .leftJoinAndSelect('tmt.team', 'team')
                .leftJoinAndSelect('team.sport', 'sport')
                .leftJoinAndSelect('team.training_schedules', 'schedule')
                .leftJoinAndSelect('schedule.field', 'field')
                .addSelect(['tmt.start_date', 'tmt.end_date'])
                .where('tmt.team_member_id = :teamMemberId', { teamMemberId: id })
                .andWhere('tmt.team_id IS NOT NULL')
                .andWhere("COALESCE(tmt.subscription_status, 'pending_admin_approval') <> :pendingPayment", {
                pendingPayment: 'pending_payment',
            })
                .andWhere('tmt.status NOT IN (:...excludedStatuses)', { excludedStatuses: ['cancelled', 'declined'] })
                .orderBy('tmt.created_at', 'DESC')
                .getMany();
            return joined
                .filter((j) => !!j.team)
                .map((j) => ({
                id: j.team.id,
                name: j.team.name_en,
                name_ar: j.team.name_ar,
                sport_name: j.team.sport?.name_en,
                sport_name_ar: j.team.sport?.name_ar,
                sport_image: j.team.sport?.sport_image ?? null,
                status: j.status,
                start_date: j.start_date,
                end_date: j.end_date,
                schedules: j.team.training_schedules,
            }));
        }
    }
    /**
     * Get complete dashboard summary for a team member
     */
    async getTeamMemberDashboardStats(teamMemberId) {
        const overall = await this.getEntityOverallStats(teamMemberId, 'team_member');
        const sports = await this.getJoinedSports(teamMemberId, 'team_member');
        // Get stats per sport
        const sportStats = await Promise.all(sports.map(async (s) => {
            const records = await this.attendanceRepository.find({
                where: { team_member_id: teamMemberId, team_id: s.id }
            });
            const attended = records.filter(r => r.attended).length;
            const absent = records.filter(r => !r.attended).length;
            const total = records.length;
            return {
                ...s,
                stats: {
                    attended,
                    absent,
                    total,
                    rate: total > 0 ? Math.round((attended / total) * 100) : 0,
                    records: records.map(r => ({
                        date: r.attendance_date,
                        attended: r.attended
                    }))
                }
            };
        }));
        return {
            overall,
            sports: sportStats
        };
    }
    /**
     * Get complete dashboard summary for a member
     */
    async getMemberDashboardStats(memberId) {
        const overall = await this.getEntityOverallStats(memberId, 'member');
        const sports = await this.getJoinedSports(memberId, 'member');
        // Get stats per sport
        const sportStats = await Promise.all(sports.map(async (s) => {
            const records = await this.attendanceRepository.find({
                where: { member_id: memberId, team_id: s.id }
            });
            const attended = records.filter(r => r.attended).length;
            const absent = records.filter(r => !r.attended).length;
            const total = records.length;
            return {
                ...s,
                stats: {
                    attended,
                    absent,
                    total,
                    rate: total > 0 ? Math.round((attended / total) * 100) : 0,
                    records: records.map(r => ({
                        date: r.attendance_date,
                        attended: r.attended
                    }))
                }
            };
        }));
        return {
            overall,
            sports: sportStats
        };
    }
}
exports.AttendanceService = AttendanceService;
//# sourceMappingURL=AttendanceService.js.map