"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SportService = void 0;
const data_source_1 = require("../database/data-source");
const Sport_1 = require("../entities/Sport");
const Staff_1 = require("../entities/Staff");
const Member_1 = require("../entities/Member");
const TeamMember_1 = require("../entities/TeamMember");
const TeamMemberTeam_1 = require("../entities/TeamMemberTeam");
const Team_1 = require("../entities/Team");
const TeamTrainingSchedule_1 = require("../entities/TeamTrainingSchedule");
const AuditLogService_1 = require("./AuditLogService");
const staffTypeCache_1 = require("../utils/staffTypeCache");
const FINANCIAL_DIRECTOR_CODES = new Set([
    'DIRECTOR_OF_FINANCIAL_AFFAIRS',
    'DIRECTOR_OF_FINANCIALAFFAIRS',
    'DIRECTOR_FINANCIAL_AFFAIRS',
    'FINANCIAL_DIRECTOR',
]);
class SportService {
    constructor() {
        this.sportRepository = data_source_1.AppDataSource.getRepository(Sport_1.Sport);
        this.staffRepository = data_source_1.AppDataSource.getRepository(Staff_1.Staff);
        this.memberRepository = data_source_1.AppDataSource.getRepository(Member_1.Member);
        this.teamMemberRepository = data_source_1.AppDataSource.getRepository(TeamMember_1.TeamMember);
        this.teamMemberTeamRepository = data_source_1.AppDataSource.getRepository(TeamMemberTeam_1.TeamMemberTeam);
        this.teamRepository = data_source_1.AppDataSource.getRepository(Team_1.Team);
        this.teamTrainingScheduleRepository = data_source_1.AppDataSource.getRepository(TeamTrainingSchedule_1.TeamTrainingSchedule);
        this.auditLogService = new AuditLogService_1.AuditLogService();
    }
    /**
     * Create a new sport
     */
    async createSport(sportData, staffId, staffTypeId) {
        const staff = await this.staffRepository.findOne({
            where: { id: staffId },
            relations: ['staff_type'],
        });
        if (!staff) {
            throw new Error('Staff member not found');
        }
        const isSportManager = await this.isStaffSportManager(staffTypeId);
        const isSportSpecialist = await this.isStaffSportSpecialist(staffTypeId);
        const isFinancialDirector = await this.isStaffDirectorOfFinancialAffairs(staffTypeId);
        const isAdmin = await this.isStaffAdmin(staffTypeId);
        if (!isSportManager && !isSportSpecialist && !isFinancialDirector && !isAdmin) {
            throw new Error('Only Sport Activity staff, Director of Financial Affairs, or Admins can create sports');
        }
        if (isSportSpecialist && !isSportManager && !isAdmin && sportData.price) {
            throw new Error('Sport Activity Specialists cannot set prices');
        }
        if (isFinancialDirector && !isAdmin && sportData.price === undefined) {
            throw new Error('Director of Financial Affairs must provide a price when creating a sport');
        }
        const sport = this.sportRepository.create({
            name_en: sportData.name_en,
            name_ar: sportData.name_ar,
            description_en: sportData.description_en || null,
            description_ar: sportData.description_ar || null,
            price: sportData.price || null,
            sport_image: sportData.sport_image || null,
            max_participants: sportData.max_participants || 0,
            created_by_staff_id: staffId,
            status: (isSportManager || isAdmin) ? 'active' : 'pending',
            approved_by_staff_id: (isSportManager || isAdmin) ? staffId : null,
            approved_at: (isSportManager || isAdmin) ? new Date() : null,
            is_active: true,
        });
        const createdSport = await this.sportRepository.save(sport);
        // Audit Log
        const role = staff?.staff_type ? (staff.staff_type.name_en || staff.staff_type.code) : 'Unknown';
        const userName = staff ? `${staff.first_name_en} ${staff.last_name_en}` : 'Unknown';
        await this.auditLogService.createLog({
            userName,
            role,
            action: 'Create',
            module: 'Sports',
            description: `Created sport: ${createdSport.name_en} (${createdSport.name_ar})`,
            status: 'نجح',
            newValue: createdSport,
            dateTime: new Date(),
            ipAddress: '0.0.0.0'
        });
        return createdSport;
    }
    /**
     * Create a new sport with teams (atomic transaction) - DEPRECATED
     * Use createSportWithTeamsAndTraining instead
     */
    async createSportWithTeams(sportData, teamsData, staffId, staffTypeId) {
        // Validate staff permissions (same as createSport)
        const staff = await this.staffRepository.findOne({
            where: { id: staffId },
            relations: ['staff_type'],
        });
        if (!staff) {
            throw new Error('Staff member not found');
        }
        const isSportManager = await this.isStaffSportManager(staffTypeId);
        const isSportSpecialist = await this.isStaffSportSpecialist(staffTypeId);
        const isFinancialDirector = await this.isStaffDirectorOfFinancialAffairs(staffTypeId);
        const isAdmin = await this.isStaffAdmin(staffTypeId);
        if (!isSportManager && !isSportSpecialist && !isFinancialDirector && !isAdmin) {
            throw new Error('Only Sport Activity staff, Director of Financial Affairs, or Admins can create sports');
        }
        if (!isSportManager && !isSportSpecialist && !isFinancialDirector && !isAdmin) {
            throw new Error('Only Sport Activity staff, Director of Financial Affairs, or Admins can create sports');
        }
        // Validate teams array
        if (!teamsData || teamsData.length === 0) {
            throw new Error('At least one team is required to create a sport');
        }
        // Check for duplicate team names within the request
        const teamNames = new Set();
        for (const team of teamsData) {
            const nameLower = team.name.toLowerCase();
            if (teamNames.has(nameLower)) {
                throw new Error(`Duplicate team name: "${team.name}". Each team must have a unique name`);
            }
            teamNames.add(nameLower);
        }
        // Start transaction
        const queryRunner = data_source_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // Create sport
            const sport = queryRunner.manager.create(Sport_1.Sport, {
                name_en: sportData.name_en,
                name_ar: sportData.name_ar,
                description_en: sportData.description_en || null,
                description_ar: sportData.description_ar || null,
                sport_image: sportData.sport_image || null,
                created_by_staff_id: staffId,
                status: (isSportManager || isAdmin) ? 'active' : 'pending',
                approved_by_staff_id: (isSportManager || isAdmin) ? staffId : null,
                approved_at: (isSportManager || isAdmin) ? new Date() : null,
                is_active: true,
            });
            const createdSport = await queryRunner.manager.save(Sport_1.Sport, sport);
            // Create teams for the sport
            const createdTeams = [];
            for (const teamData of teamsData) {
                const team = queryRunner.manager.create(Team_1.Team, {
                    sport_id: createdSport.id,
                    branch_id: teamData.branch_id || null,
                    name_en: teamData.name,
                    name_ar: teamData.name,
                    max_participants: teamData.max_members || 20,
                    status: 'active',
                });
                const createdTeam = await queryRunner.manager.save(Team_1.Team, team);
                createdTeams.push(createdTeam);
            }
            // Commit transaction
            await queryRunner.commitTransaction();
            // Audit Log
            const role = staff?.staff_type ? (staff.staff_type.name_en || staff.staff_type.code) : 'Unknown';
            const userName = staff ? `${staff.first_name_en} ${staff.last_name_en}` : 'Unknown';
            await this.auditLogService.createLog({
                userName,
                role,
                action: 'Create',
                module: 'Sports',
                description: `Created sport: ${createdSport.name_en} (${createdSport.name_ar}) with ${createdTeams.length} teams`,
                status: 'نجح',
                newValue: { sport: createdSport, teams: createdTeams },
                dateTime: new Date(),
                ipAddress: '0.0.0.0'
            });
            return { sport: createdSport, teams: createdTeams };
        }
        catch (error) {
            // Rollback transaction on error
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    /**
     * Create a new sport with teams and training schedules (atomic transaction)
     * Supports bilingual team names and flexible training schedules
     */
    async createSportWithTeamsAndTraining(sportData, teamsData, staffId, staffTypeId) {
        // Validate staff permissions
        const staff = await this.staffRepository.findOne({
            where: { id: staffId },
            relations: ['staff_type'],
        });
        if (!staff) {
            throw new Error('Staff member not found');
        }
        const isSportManager = await this.isStaffSportManager(staffTypeId);
        const isSportSpecialist = await this.isStaffSportSpecialist(staffTypeId);
        const isFinancialDirector = await this.isStaffDirectorOfFinancialAffairs(staffTypeId);
        const isAdmin = await this.isStaffAdmin(staffTypeId);
        if (!isSportManager && !isSportSpecialist && !isFinancialDirector && !isAdmin) {
            throw new Error('Only Sport Activity staff, Director of Financial Affairs, or Admins can create sports');
        }
        // Validate teams array
        if (!teamsData || teamsData.length === 0) {
            throw new Error('At least one team is required to create a sport');
        }
        // Check for duplicate team names within the request
        const teamNames = new Set();
        for (const team of teamsData) {
            const nameLower = team.name_en.toLowerCase();
            if (teamNames.has(nameLower)) {
                throw new Error(`Duplicate team name: "${team.name_en}". Each team must have a unique name`);
            }
            teamNames.add(nameLower);
        }
        // Start transaction
        const queryRunner = data_source_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // Create sport
            const sport = queryRunner.manager.create(Sport_1.Sport, {
                name_en: sportData.name_en,
                name_ar: sportData.name_ar,
                description_en: sportData.description_en || null,
                description_ar: sportData.description_ar || null,
                sport_image: sportData.sport_image || null,
                created_by_staff_id: staffId,
                status: (isSportManager || isAdmin) ? 'active' : 'pending',
                approved_by_staff_id: (isSportManager || isAdmin) ? staffId : null,
                approved_at: (isSportManager || isAdmin) ? new Date() : null,
                is_active: true,
            });
            const createdSport = await queryRunner.manager.save(Sport_1.Sport, sport);
            // Create teams and training schedules for the sport
            const createdTeams = [];
            const createdTrainings = [];
            for (const teamData of teamsData) {
                // Create team
                const team = queryRunner.manager.create(Team_1.Team, {
                    sport_id: createdSport.id,
                    name_en: teamData.name_en,
                    name_ar: teamData.name_ar,
                    max_participants: teamData.max_participants,
                    status: 'active',
                });
                const createdTeam = await queryRunner.manager.save(Team_1.Team, team);
                createdTeams.push(createdTeam);
                // Create training schedule for the team
                const training = queryRunner.manager.create(TeamTrainingSchedule_1.TeamTrainingSchedule, {
                    team_id: createdTeam.id,
                    sport_id: createdSport.id,
                    days_en: teamData.training.days_en,
                    days_ar: teamData.training.days_ar,
                    start_time: teamData.training.start_time,
                    end_time: teamData.training.end_time,
                    field_id: teamData.training.field_id,
                    training_fee: teamData.training.training_fee,
                    status: 'active',
                });
                const createdTraining = await queryRunner.manager.save(TeamTrainingSchedule_1.TeamTrainingSchedule, training);
                createdTrainings.push(createdTraining);
            }
            // Commit transaction
            await queryRunner.commitTransaction();
            // Audit Log
            const role = staff?.staff_type ? (staff.staff_type.name_en || staff.staff_type.code) : 'Unknown';
            const userName = staff ? `${staff.first_name_en} ${staff.last_name_en}` : 'Unknown';
            await this.auditLogService.createLog({
                userName,
                role,
                action: 'Create',
                module: 'Sports',
                description: `Created sport: ${createdSport.name_en} (${createdSport.name_ar}) with ${createdTeams.length} teams and ${createdTrainings.length} training schedules`,
                status: 'نجح',
                newValue: { sport: createdSport, teams: createdTeams, trainings: createdTrainings },
                dateTime: new Date(),
                ipAddress: '0.0.0.0'
            });
            return { sport: createdSport, teams: createdTeams, trainings: createdTrainings };
        }
        catch (error) {
            // Rollback transaction on error
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getAllSports(filters) {
        const queryBuilder = this.sportRepository
            .createQueryBuilder('sport')
            .leftJoinAndSelect('sport.created_by', 'creator')
            .leftJoinAndSelect('sport.approved_by', 'approver')
            .leftJoinAndSelect('sport.training_schedules', 'training_schedules')
            .leftJoinAndSelect('training_schedules.field', 'field')
            // Also load teams + their schedules so the frontend knows hasTeams
            .leftJoinAndSelect('sport.teams', 'teams')
            .leftJoinAndSelect('teams.training_schedules', 'team_schedules')
            .orderBy('sport.created_at', 'DESC');
        if (filters?.status) {
            queryBuilder.andWhere('sport.status = :status', { status: filters.status });
        }
        if (filters?.is_active !== undefined) {
            queryBuilder.andWhere('sport.is_active = :is_active', { is_active: filters.is_active });
        }
        const sports = await queryBuilder.getMany();
        // Count members per sport: sum of member_teams + team_member_teams, excluding declined/cancelled
        const memberCountRows = await data_source_1.AppDataSource.query(`
            SELECT
                t.sport_id::text AS sport_id,
                COUNT(DISTINCT mt.id) + COUNT(DISTINCT tmt.id) AS cnt
            FROM teams t
            LEFT JOIN member_teams      mt  ON mt.team_id  = t.id  AND mt.status  NOT IN ('declined','cancelled')
            LEFT JOIN team_member_teams tmt ON tmt.team_id = t.id  AND tmt.status NOT IN ('declined','cancelled')
            GROUP BY t.sport_id
        `);
        const countBySportId = new Map();
        for (const row of memberCountRows) {
            countBySportId.set(String(row.sport_id), Number(row.cnt) || 0);
        }
        return sports.map((sport) => {
            const membersCount = countBySportId.get(String(sport.id)) ?? 0;
            return Object.assign(sport, { membersCount });
        });
    }
    async getSportById(sportId) {
        return await this.sportRepository.findOne({
            where: { id: sportId },
            relations: ['created_by', 'approved_by'],
        });
    }
    async updateSport(sportId, updateData, staffId, staffTypeId) {
        const sport = await this.sportRepository.findOne({
            where: { id: sportId },
        });
        if (!sport) {
            throw new Error('Sport not found');
        }
        const oldSport = { ...sport };
        const staff = await this.staffRepository.findOne({
            where: { id: staffId },
            relations: ['staff_type'],
        });
        const isSportManager = await this.isStaffSportManager(staffTypeId);
        const isSportSpecialist = await this.isStaffSportSpecialist(staffTypeId);
        const isFinancialDirector = await this.isStaffDirectorOfFinancialAffairs(staffTypeId);
        const isAdmin = await this.isStaffAdmin(staffTypeId);
        if (!isSportManager && !isSportSpecialist && !isFinancialDirector && !isAdmin) {
            throw new Error('Only Sport Activity staff or Director of Financial Affairs using Admins can update sports');
        }
        if (isFinancialDirector && !isAdmin) {
            const nonPriceFieldsProvided = updateData.name_en !== undefined ||
                updateData.name_ar !== undefined ||
                updateData.description_en !== undefined ||
                updateData.description_ar !== undefined ||
                updateData.sport_image !== undefined ||
                updateData.max_participants !== undefined;
            if (nonPriceFieldsProvided) {
                throw new Error('Director of Financial Affairs can only update the price');
            }
            if (updateData.price === undefined) {
                throw new Error('Price is required');
            }
        }
        if (!isSportManager && !isFinancialDirector && !isAdmin && updateData.price !== undefined) {
            throw new Error('Only Sport Activity Manager, Director of Financial Affairs or Admins can update prices');
        }
        if (!isFinancialDirector || isAdmin) {
            if (updateData.name_en)
                sport.name_en = updateData.name_en;
            if (updateData.name_ar)
                sport.name_ar = updateData.name_ar;
            if (updateData.description_en !== undefined)
                sport.description_en = updateData.description_en;
            if (updateData.description_ar !== undefined)
                sport.description_ar = updateData.description_ar;
            if (updateData.sport_image)
                sport.sport_image = updateData.sport_image;
            if (updateData.max_participants !== undefined)
                sport.max_participants = updateData.max_participants;
        }
        if ((isSportManager || isFinancialDirector || isAdmin) && updateData.price !== undefined) {
            sport.price = updateData.price;
        }
        const savedSport = await this.sportRepository.save(sport);
        // Audit Log
        const role = staff?.staff_type ? (staff.staff_type.name_en || staff.staff_type.code) : 'Unknown';
        const userName = staff ? `${staff.first_name_en} ${staff.last_name_en}` : 'Unknown';
        await this.auditLogService.createLog({
            userName,
            role,
            action: 'Update',
            module: 'Sports',
            description: `Updated sport: ${savedSport.name_en}`,
            status: 'نجح',
            oldValue: oldSport,
            newValue: savedSport,
            dateTime: new Date(),
            ipAddress: '0.0.0.0'
        });
        return savedSport;
    }
    async approveSport(sportId, action, staffId, staffTypeId, comments) {
        const isSportManager = await this.isStaffSportManager(staffTypeId);
        const isAdmin = await this.isStaffAdmin(staffTypeId);
        if (!isSportManager && !isAdmin) {
            throw new Error('Only Sport Activity Manager or Admins can approve or reject sports');
        }
        const sport = await this.sportRepository.findOne({
            where: { id: sportId },
        });
        if (!sport) {
            throw new Error('Sport not found');
        }
        if (sport.status !== 'pending') {
            throw new Error('Only pending sports can be approved or rejected');
        }
        sport.status = action === 'approve' ? 'active' : 'rejected';
        sport.approved_by_staff_id = staffId;
        sport.approved_at = new Date();
        sport.approval_comments = comments || null;
        const savedSport = await this.sportRepository.save(sport);
        // Fetch staff for audit log
        const staff = await this.staffRepository.findOne({
            where: { id: staffId },
            relations: ['staff_type']
        });
        // Audit Log
        const role = staff?.staff_type ? (staff.staff_type.name_en || staff.staff_type.code) : 'Unknown';
        const userName = staff ? `${staff.first_name_en} ${staff.last_name_en}` : 'Unknown';
        await this.auditLogService.createLog({
            userName,
            role,
            action: 'Approve/Reject',
            module: 'Sports',
            description: `${action === 'approve' ? 'Approved' : 'Rejected'} sport: ${savedSport.name_en}`,
            status: 'نجح',
            newValue: savedSport,
            dateTime: new Date(),
            ipAddress: '0.0.0.0'
        });
        return savedSport;
    }
    async deleteSport(sportId, staffTypeId, staffId) {
        const isSportManager = await this.isStaffSportManager(staffTypeId);
        const isAdmin = await this.isStaffAdmin(staffTypeId);
        if (!isSportManager && !isAdmin) {
            throw new Error('Only Sport Activity Manager or Admins can delete sports');
        }
        await data_source_1.AppDataSource.transaction(async (manager) => {
            const sport = await manager.findOne(Sport_1.Sport, {
                where: { id: sportId },
            });
            if (!sport) {
                // If it's already gone, we can consider the delete "successful" or at least not fail.
                // This improves UX for users seeing stale lists.
                return;
            }
            // Fetch staff for audit log
            const staff = await manager.findOne(Staff_1.Staff, {
                where: { id: staffId },
                relations: ['staff_type']
            });
            await manager.remove(sport);
            // Audit Log
            const role = staff?.staff_type ? (staff.staff_type.name_en || staff.staff_type.code) : 'Unknown';
            const userName = staff ? `${staff.first_name_en} ${staff.last_name_en}` : 'Unknown';
            // We need to use the service but pass the manager to ensure it uses the same transaction?
            // AuditLogService.createLog does ONE insert. It uses its own repository.
            // Be careful: auditLogService uses `this.auditLogRepository` which is bound to AppDataSource, NOT the transaction manager.
            // So if `manager.remove(sport)` happens, and then we call `createLog`, `createLog` will happen outside the transaction.
            // If `createLog` fails, `manager.remove(sport)` will rollback! This IS what we want.
            // So calling the external service is fine, provided `auditLogService.createLog` doesn't throw if it fails (it might).
            // Actually, to include the log in the SAME transaction (so log appears only if delete succeeds AND delete succeeds only if log succeeds),
            // we should ideally use the transaction manager for the log too.
            // But for now, let's keep it simple. If log fails, transaction rolls back sport deletion.
            await this.auditLogService.createLog({
                userName,
                role,
                action: 'Delete',
                module: 'Sports',
                description: `Deleted sport: ${sport.name_en} (${sport.name_ar})`,
                status: 'نجح',
                oldValue: sport,
                dateTime: new Date(),
                ipAddress: '0.0.0.0'
            }, manager);
        });
    }
    async toggleSportStatus(sportId, staffTypeId, staffId) {
        const isSportManager = await this.isStaffSportManager(staffTypeId);
        const isAdmin = await this.isStaffAdmin(staffTypeId);
        if (!isSportManager && !isAdmin) {
            throw new Error('Only Sport Activity Manager or Admins can toggle sport status');
        }
        const sport = await this.sportRepository.findOne({
            where: { id: sportId },
        });
        if (!sport) {
            throw new Error('Sport not found');
        }
        sport.is_active = !sport.is_active;
        const savedSport = await this.sportRepository.save(sport);
        // Fetch staff for audit log
        const staff = await this.staffRepository.findOne({
            where: { id: staffId },
            relations: ['staff_type']
        });
        // Audit Log
        const role = staff?.staff_type ? (staff.staff_type.name_en || staff.staff_type.code) : 'Unknown';
        const userName = staff ? `${staff.first_name_en} ${staff.last_name_en}` : 'Unknown';
        await this.auditLogService.createLog({
            userName,
            role,
            action: 'Toggle Status',
            module: 'Sports',
            description: `Toggled sport status: ${savedSport.name_en} to ${savedSport.is_active ? 'Active' : 'Inactive'}`,
            status: 'نجح',
            newValue: savedSport,
            dateTime: new Date(),
            ipAddress: '0.0.0.0'
        });
        return savedSport;
    }
    // --- NEW TEAM MEMBER METHODS ---
    /**
     * Get all Team Members
     */
    async getTeamMembers() {
        // Get all team members with their teams
        return await this.teamMemberRepository.find({
            relations: ['account', 'team_member_teams']
        });
    }
    /**
     * Get Team Members by Sport Name
     */
    async getTeamMembersBySport(sportName) {
        // Join with teams table and filter by sport name (case insensitive)
        return await this.teamMemberRepository.createQueryBuilder('teamMember')
            .innerJoin('teamMember.team_member_teams', 'tmt')
            .innerJoin('tmt.team', 'team')
            .innerJoin('team.sport', 'sport')
            .leftJoinAndSelect('teamMember.team_member_teams', 'teams')
            .leftJoinAndSelect('teams.team', 'teamDetails')
            .leftJoinAndSelect('teamDetails.sport', 'sportDetails')
            .leftJoinAndSelect('teamMember.account', 'account')
            .where('LOWER(sport.name_en) = LOWER(:sportName) OR LOWER(sport.name_ar) = LOWER(:sportName)', { sportName })
            .getMany();
    }
    /**
     * Get Single Team Member
     */
    async getTeamMemberById(memberId) {
        return await this.teamMemberRepository.findOne({
            where: { id: memberId },
            relations: ['account', 'team_member_teams']
        });
    }
    /**
     * Update sport with all related fields (teams and trainings)
     * This method handles atomic updates to sport, teams, and training schedules
     */
    async updateSportWithTeamsAndTraining(sportId, updateData, staffId, staffTypeId) {
        // Get the sport
        const sport = await this.sportRepository.findOne({
            where: { id: sportId },
            relations: ['teams', 'teams.training_schedules'],
        });
        if (!sport) {
            throw new Error('Sport not found');
        }
        const oldSport = { ...sport };
        // Validate staff permissions
        const staff = await this.staffRepository.findOne({
            where: { id: staffId },
            relations: ['staff_type'],
        });
        if (!staff) {
            throw new Error('Staff member not found');
        }
        const isSportManager = await this.isStaffSportManager(staffTypeId);
        const isSportSpecialist = await this.isStaffSportSpecialist(staffTypeId);
        const isFinancialDirector = await this.isStaffDirectorOfFinancialAffairs(staffTypeId);
        const isAdmin = await this.isStaffAdmin(staffTypeId);
        if (!isSportManager && !isSportSpecialist && !isFinancialDirector && !isAdmin) {
            throw new Error('Only Sport Activity staff, Director of Financial Affairs, or Admins can update sports');
        }
        // Check Financial Director restrictions
        if (isFinancialDirector && !isAdmin) {
            const nonPriceFieldsProvided = updateData.name_en !== undefined ||
                updateData.name_ar !== undefined ||
                updateData.description_en !== undefined ||
                updateData.description_ar !== undefined ||
                updateData.sport_image !== undefined ||
                updateData.teams !== undefined;
            if (nonPriceFieldsProvided) {
                throw new Error('Director of Financial Affairs can only update the price');
            }
        }
        // Update sport basic fields
        if (updateData.name_en)
            sport.name_en = updateData.name_en;
        if (updateData.name_ar)
            sport.name_ar = updateData.name_ar;
        if (updateData.description_en !== undefined)
            sport.description_en = updateData.description_en;
        if (updateData.description_ar !== undefined)
            sport.description_ar = updateData.description_ar;
        if (updateData.sport_image !== undefined)
            sport.sport_image = updateData.sport_image;
        if ((isSportManager || isFinancialDirector || isAdmin) && updateData.price !== undefined) {
            sport.price = updateData.price;
        }
        // Start transaction for teams and trainings updates
        const queryRunner = data_source_1.AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // Save the updated sport
            const updatedSport = await queryRunner.manager.save(Sport_1.Sport, sport);
            const updatedTeams = [];
            const updatedTrainings = [];
            // Handle team updates
            if (updateData.teams && Array.isArray(updateData.teams)) {
                for (const teamData of updateData.teams) {
                    if (teamData.id) {
                        // Update existing team
                        const existingTeam = await queryRunner.manager.findOne(Team_1.Team, {
                            where: { id: teamData.id },
                            relations: ['training_schedules'],
                        });
                        if (!existingTeam) {
                            throw new Error(`Team with ID ${teamData.id} not found`);
                        }
                        if (teamData.name_en)
                            existingTeam.name_en = teamData.name_en;
                        if (teamData.name_ar)
                            existingTeam.name_ar = teamData.name_ar;
                        if (teamData.max_participants !== undefined)
                            existingTeam.max_participants = teamData.max_participants;
                        const updatedTeam = await queryRunner.manager.save(Team_1.Team, existingTeam);
                        updatedTeams.push(updatedTeam);
                        // Update training schedule if provided
                        if (teamData.training && teamData.training.id) {
                            const existingTraining = await queryRunner.manager.findOne(TeamTrainingSchedule_1.TeamTrainingSchedule, {
                                where: { id: teamData.training.id },
                            });
                            if (!existingTraining) {
                                throw new Error(`Training schedule with ID ${teamData.training.id} not found`);
                            }
                            if (teamData.training.days_en !== undefined)
                                existingTraining.days_en = teamData.training.days_en;
                            if (teamData.training.days_ar !== undefined)
                                existingTraining.days_ar = teamData.training.days_ar;
                            if (teamData.training.start_time !== undefined)
                                existingTraining.start_time = teamData.training.start_time;
                            if (teamData.training.end_time !== undefined)
                                existingTraining.end_time = teamData.training.end_time;
                            if (teamData.training.field_id !== undefined)
                                existingTraining.field_id = teamData.training.field_id;
                            if (teamData.training.training_fee !== undefined)
                                existingTraining.training_fee = teamData.training.training_fee;
                            const updatedTraining = await queryRunner.manager.save(TeamTrainingSchedule_1.TeamTrainingSchedule, existingTraining);
                            updatedTrainings.push(updatedTraining);
                        }
                        else if (teamData.training && !teamData.training.id) {
                            // Create new training schedule for existing team
                            const newTraining = queryRunner.manager.create(TeamTrainingSchedule_1.TeamTrainingSchedule, {
                                team_id: updatedTeam.id,
                                sport_id: updatedSport.id,
                                days_en: teamData.training.days_en,
                                days_ar: teamData.training.days_ar,
                                start_time: teamData.training.start_time,
                                end_time: teamData.training.end_time,
                                field_id: teamData.training.field_id,
                                training_fee: teamData.training.training_fee,
                                status: 'active',
                            });
                            const createdTraining = await queryRunner.manager.save(TeamTrainingSchedule_1.TeamTrainingSchedule, newTraining);
                            updatedTrainings.push(createdTraining);
                        }
                    }
                    else {
                        // Create new team with training
                        const newTeam = queryRunner.manager.create(Team_1.Team, {
                            sport_id: updatedSport.id,
                            name_en: teamData.name_en,
                            name_ar: teamData.name_ar,
                            max_participants: teamData.max_participants,
                            status: 'active',
                        });
                        const createdTeam = await queryRunner.manager.save(Team_1.Team, newTeam);
                        updatedTeams.push(createdTeam);
                        // Create training schedule for new team
                        if (teamData.training) {
                            const newTraining = queryRunner.manager.create(TeamTrainingSchedule_1.TeamTrainingSchedule, {
                                team_id: createdTeam.id,
                                sport_id: updatedSport.id,
                                days_en: teamData.training.days_en,
                                days_ar: teamData.training.days_ar,
                                start_time: teamData.training.start_time,
                                end_time: teamData.training.end_time,
                                field_id: teamData.training.field_id,
                                training_fee: teamData.training.training_fee,
                                status: 'active',
                            });
                            const createdTraining = await queryRunner.manager.save(TeamTrainingSchedule_1.TeamTrainingSchedule, newTraining);
                            updatedTrainings.push(createdTraining);
                        }
                    }
                }
            }
            // Commit transaction
            await queryRunner.commitTransaction();
            // Audit Log
            const role = staff?.staff_type ? (staff.staff_type.name_en || staff.staff_type.code) : 'Unknown';
            const userName = staff ? `${staff.first_name_en} ${staff.last_name_en}` : 'Unknown';
            await this.auditLogService.createLog({
                userName,
                role,
                action: 'Update',
                module: 'Sports',
                description: `Updated sport with teams and trainings: ${updatedSport.name_en}`,
                status: 'نجح',
                oldValue: oldSport,
                newValue: updatedSport,
                dateTime: new Date(),
                ipAddress: '0.0.0.0'
            });
            return {
                sport: updatedSport,
                teams: updatedTeams,
                trainings: updatedTrainings,
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    // --- HELPERS ---
    async isStaffSportManager(staffTypeId) {
        return (await (0, staffTypeCache_1.getStaffTypeCodeById)(staffTypeId)) === 'SPORT_MANAGER';
    }
    async isStaffSportSpecialist(staffTypeId) {
        return (await (0, staffTypeCache_1.getStaffTypeCodeById)(staffTypeId)) === 'SPORT_SPECIALIST';
    }
    async isStaffDirectorOfFinancialAffairs(staffTypeId) {
        const code = await (0, staffTypeCache_1.getStaffTypeCodeById)(staffTypeId);
        return !!code && FINANCIAL_DIRECTOR_CODES.has(code);
    }
    async isStaffAdmin(staffTypeId) {
        return (await (0, staffTypeCache_1.getStaffTypeCodeById)(staffTypeId)) === 'ADMIN';
    }
}
exports.SportService = SportService;
//# sourceMappingURL=SportService.js.map