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
exports.TeamMemberService = void 0;
const data_source_1 = require("../database/data-source");
const TeamMember_1 = require("../entities/TeamMember");
const TeamMemberTeam_1 = require("../entities/TeamMemberTeam");
const ActivityLog_1 = require("../entities/ActivityLog");
const Sport_1 = require("../entities/Sport");
const Account_1 = require("../entities/Account");
const TeamEnums_1 = require("../constants/TeamEnums");
class TeamMemberService {
    constructor() {
        this.teamMemberRepo = data_source_1.AppDataSource.getRepository(TeamMember_1.TeamMember);
        this.teamRepo = data_source_1.AppDataSource.getRepository(TeamMemberTeam_1.TeamMemberTeam);
        this.logRepo = data_source_1.AppDataSource.getRepository(ActivityLog_1.ActivityLog);
        this.sportRepo = data_source_1.AppDataSource.getRepository(Sport_1.Sport);
        this.accountRepo = data_source_1.AppDataSource.getRepository(Account_1.Account);
    }
    /**
     * Submit team member details (photo, medical report, address, national ID photos, proof)
     * Saves to team_members table
     */
    async submitDetails(teamMemberId, photoPath, medicalReportPath, address, nationalIdFrontPath, nationalIdBackPath, proofPath) {
        const teamMember = await this.teamMemberRepo.findOne({ where: { id: teamMemberId } });
        if (!teamMember) {
            throw new Error('Team member not found');
        }
        // Update TeamMember with files and address
        if (photoPath) {
            teamMember.photo = photoPath;
        }
        if (medicalReportPath) {
            teamMember.medical_report = medicalReportPath;
        }
        if (address) {
            teamMember.address = address;
        }
        if (nationalIdFrontPath) {
            teamMember.national_id_front = nationalIdFrontPath;
        }
        if (nationalIdBackPath) {
            teamMember.national_id_back = nationalIdBackPath;
        }
        if (proofPath) {
            teamMember.proof = proofPath;
        }
        await this.teamMemberRepo.save(teamMember);
        return {
            id: teamMember.id,
            team_member_id: teamMember.id,
            status: teamMember.status,
        };
    }
    /**
     * Select teams for a team member
     */
    async selectTeams(teamMemberId, teams, startDateStr, endDateStr) {
        // Validation
        if (!teams || teams.length === 0) {
            throw new Error('At least one team must be selected');
        }
        if (teams.length > 4) {
            throw new Error('Maximum 4 teams allowed');
        }
        // Check TeamMember existence
        const teamMember = await this.teamMemberRepo.findOne({ where: { id: teamMemberId } });
        if (!teamMember)
            throw new Error('Team member not found');
        // Normalize input teams to avoid duplicates in input (Case insensitive?)
        const uniqueTeams = [...new Set(teams)];
        // Fetch existing teams
        const existingTeams = await this.teamRepo.find({
            where: { team_member_id: teamMemberId },
            relations: ['team']
        });
        // Case-insensitive check using team_id
        const existingTeamIds = existingTeams.map(t => t.team_id);
        const newTeams = uniqueTeams.filter(t => !existingTeamIds.includes(t));
        if (newTeams.length === 0 && existingTeams.length > 0) {
            return { count: 0, message: 'Team member already joined these teams' };
        }
        // Check total limit
        if (existingTeams.length + newTeams.length > 4) {
            throw new Error(`Cannot add ${newTeams.length} teams. Team member already has ${existingTeams.length} teams. Max is 4.`);
        }
        // Insert new teams with details
        const Team = (await Promise.resolve().then(() => __importStar(require('../entities/Team')))).Team;
        const teamRepository = data_source_1.AppDataSource.getRepository(Team);
        const teamEntities = [];
        for (const teamId of newTeams) {
            // Validate team exists
            const team = await teamRepository.findOne({
                where: { id: teamId },
                relations: ['sport']
            });
            if (!team) {
                console.warn(`Team with ID ${teamId} not found, skipping`);
                continue;
            }
            const startDate = startDateStr ? new Date(startDateStr) : new Date();
            const endDate = endDateStr ? new Date(endDateStr) : (() => {
                const d = new Date(startDate);
                d.setFullYear(d.getFullYear() + 1);
                return d;
            })();
            const teamEntity = this.teamRepo.create({
                team_member_id: teamMemberId,
                team_id: teamId,
                start_date: startDate,
                end_date: endDate,
                price: team.sport?.price ? Number(team.sport.price) : 0,
                status: 'pending'
            });
            teamEntities.push(teamEntity);
        }
        if (teamEntities.length > 0) {
            await this.teamRepo.save(teamEntities);
        }
        return { count: teamEntities.length, added: newTeams };
    }
    /**
     * Get status of a team member
     */
    async getStatus(teamMemberId) {
        const teamMember = await this.teamMemberRepo.findOne({
            where: { id: teamMemberId },
            relations: ['team_member_teams', 'team_member_teams.team']
        });
        if (!teamMember)
            throw new Error('Team member not found');
        return {
            team_member_info: {
                id: teamMember.id,
                name_en: `${teamMember.first_name_en} ${teamMember.last_name_en}`,
                name_ar: `${teamMember.first_name_ar} ${teamMember.last_name_ar}`,
                status: teamMember.status,
            },
            type: 'TEAM_MEMBER',
            selected_teams: teamMember.team_member_teams ? teamMember.team_member_teams.map(t => ({
                name: t.team?.name_en || t.team_id,
                teamId: t.team_id,
                startDate: t.start_date,
                endDate: t.end_date,
                status: t.status,
                price: t.price
            })) : [],
            documents_uploaded: {
                personal_photo: !!teamMember.photo,
                medical_report: !!teamMember.medical_report
            }
        };
    }
    /**
     * Get all team members with optional status filter and pagination
     */
    async getAllTeamMembers(status, limit, page) {
        const query = this.teamMemberRepo.createQueryBuilder('team_member')
            .leftJoinAndSelect('team_member.team_member_teams', 'teams')
            .leftJoinAndSelect('teams.team', 'team')
            .leftJoinAndSelect('team.sport', 'sport');
        // Filter by status if provided
        if (status) {
            query.where('team_member.status = :status', { status });
        }
        query.orderBy('team_member.created_at', 'DESC');
        // Apply pagination if provided
        let total = 0;
        let pageNum = 1;
        let limitNum = 0;
        if (limit && page) {
            limitNum = limit;
            pageNum = page;
            const skip = (page - 1) * limit;
            // Get total count
            total = await query.getCount();
            // Apply pagination
            query.skip(skip).take(limit);
        }
        const teamMembers = await query.getMany();
        const result = teamMembers.map(teamMember => {
            const sportsArray = teamMember.team_member_teams?.map(t => ({
                id: t.team?.sport?.id || null,
                name: t.team?.sport?.name_ar || t.team?.sport?.name_en || t.team?.name_en || t.team_id,
                teamId: t.team_id,
                startDate: t.start_date,
                endDate: t.end_date,
                status: t.status,
                price: t.price
            })) || [];
            console.log(`Team member ${teamMember.id} (${teamMember.first_name_en}): ${teamMember.team_member_teams?.length || 0} teams`);
            return {
                id: teamMember.id,
                firstNameEn: teamMember.first_name_en,
                lastNameEn: teamMember.last_name_en,
                firstNameAr: teamMember.first_name_ar,
                lastNameAr: teamMember.last_name_ar,
                name_en: `${teamMember.first_name_en} ${teamMember.last_name_en}`,
                name_ar: `${teamMember.first_name_ar} ${teamMember.last_name_ar}`,
                national_id: teamMember.national_id,
                phone: teamMember.phone,
                status: teamMember.status,
                membershipStatus: teamMember.status,
                created_at: teamMember.created_at,
                photo: teamMember.photo || null,
                medical_report: teamMember.medical_report || null,
                national_id_front: teamMember.national_id_front || null,
                national_id_back: teamMember.national_id_back || null,
                proof: teamMember.proof || null,
                sports: sportsArray,
                teams: teamMember.team_member_teams?.map(t => ({
                    name: t.team?.name_en || t.team_id,
                    teamId: t.team_id,
                    startDate: t.start_date,
                    endDate: t.end_date,
                    status: t.status,
                    price: t.price
                })) || []
            };
        });
        console.log(`getAllTeamMembers returning ${result.length} team members`);
        // Return with pagination info if applicable
        if (limit && page) {
            return {
                data: result,
                total,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum)
                }
            };
        }
        return { data: result, total: result.length };
    }
    /**
     * Get team member full details
     */
    async getTeamMemberDetails(teamMemberId) {
        const teamMember = await this.teamMemberRepo.findOne({
            where: { id: teamMemberId },
            relations: ['team_member_teams'],
        });
        if (!teamMember)
            throw new Error('Team member not found');
        const cleanPath = (p) => p ? `/uploads/${String(p).replace(/^(uploads[\\/])/, '').replace(/\\/g, '/')}` : null;
        const birthdate = teamMember.birthdate
            ? (() => {
                const dt = teamMember.birthdate instanceof Date ? teamMember.birthdate : new Date(teamMember.birthdate);
                return Number.isNaN(dt.getTime()) ? null : dt.toISOString().slice(0, 10);
            })()
            : null;
        const result = {
            id: teamMember.id,
            firstNameEn: teamMember.first_name_en,
            lastNameEn: teamMember.last_name_en,
            firstNameAr: teamMember.first_name_ar,
            lastNameAr: teamMember.last_name_ar,
            name_en: `${teamMember.first_name_en} ${teamMember.last_name_en}`,
            name_ar: `${teamMember.first_name_ar} ${teamMember.last_name_ar}`,
            national_id: teamMember.national_id,
            phone: teamMember.phone,
            gender: teamMember.gender,
            nationality: teamMember.nationality,
            birthdate, // This is the formatted string YYYY-MM-DD
            address: teamMember.address,
            status: teamMember.status,
            type: 'TEAM_MEMBER',
            created_at: teamMember.created_at ? teamMember.created_at.toISOString() : null,
            createdAt: teamMember.created_at ? teamMember.created_at.toISOString() : null,
            join_date: teamMember.created_at ? teamMember.created_at.toISOString() : null,
            // Add root level fallbacks for photos
            personal_photo_url: cleanPath(teamMember.photo),
            medical_report_url: cleanPath(teamMember.medical_report),
            national_id_front_url: cleanPath(teamMember.national_id_front),
            national_id_back_url: cleanPath(teamMember.national_id_back),
            proof_url: cleanPath(teamMember.proof),
            photo: cleanPath(teamMember.photo), // Root level photo fallback
            teams: teamMember.team_member_teams?.map(t => ({
                id: t.id,
                name: t.team?.name_en || t.team_id,
                teamId: t.team_id,
                startDate: t.start_date ? (t.start_date instanceof Date ? t.start_date.toISOString().split('T')[0] : String(t.start_date)) : null,
                endDate: t.end_date ? (t.end_date instanceof Date ? t.end_date.toISOString().split('T')[0] : String(t.end_date)) : null,
                status: t.status,
                price: t.price ? Number(t.price) : 0
            })) || [],
            documents: {
                personal_photo_url: teamMember.photo || null,
                medical_report_url: teamMember.medical_report || null,
                national_id_front_url: teamMember.national_id_front || null,
                national_id_back_url: teamMember.national_id_back || null,
                proof_url: teamMember.proof || null,
            },
        };
        console.log('📦 [TeamMemberService] Returning details for member:', teamMemberId, 'Documents:', result.documents);
        return result;
    }
    /**
     * Update team member profile
     */
    async updateProfile(teamMemberId, data) {
        const teamMember = await this.teamMemberRepo.findOne({ where: { id: teamMemberId } });
        if (!teamMember)
            throw new Error('Team member not found');
        // Update basic info
        if (data.first_name_ar)
            teamMember.first_name_ar = data.first_name_ar;
        if (data.last_name_ar)
            teamMember.last_name_ar = data.last_name_ar;
        if (data.first_name_en)
            teamMember.first_name_en = data.first_name_en;
        if (data.last_name_en)
            teamMember.last_name_en = data.last_name_en;
        if (data.phone)
            teamMember.phone = data.phone;
        if (data.address)
            teamMember.address = data.address;
        if (data.birthdate)
            teamMember.birthdate = new Date(data.birthdate);
        if (data.gender)
            teamMember.gender = data.gender;
        if (data.nationality)
            teamMember.nationality = data.nationality;
        if (data.national_id)
            teamMember.national_id = data.national_id;
        // Update files if provided
        if (data.photo)
            teamMember.photo = data.photo;
        if (data.medical_report)
            teamMember.medical_report = data.medical_report;
        if (data.national_id_front)
            teamMember.national_id_front = data.national_id_front;
        if (data.national_id_back)
            teamMember.national_id_back = data.national_id_back;
        if (data.proof)
            teamMember.proof = data.proof;
        await this.teamMemberRepo.save(teamMember);
        return teamMember;
    }
    /**
     * Create a new team member with account and sports
     */
    async createTeamMember(email, password, firstNameEn, firstNameAr, lastNameEn, lastNameAr, nationalId, phone, gender, nationality, birthdate, address, isForeign, sportIds, photoPath, nationalIdFrontPath, nationalIdBackPath, medicalReportPath, proofPath) {
        // Check if email already exists
        const existingAccount = await this.accountRepo.findOne({ where: { email } });
        if (existingAccount) {
            throw new Error('Email already registered');
        }
        // Check if national_id already exists
        const existingTeamMember = await this.teamMemberRepo.findOne({ where: { national_id: nationalId } });
        if (existingTeamMember) {
            throw new Error('National ID already registered');
        }
        // Create account
        const savedAccount = await this.accountRepo.save({
            email,
            password, // Should be hashed before calling this method
            role: 'team_member',
            status: 'active',
            is_active: true
        });
        // Create team member with file paths
        const savedTeamMember = await this.teamMemberRepo.save({
            account_id: savedAccount.id,
            first_name_en: firstNameEn,
            first_name_ar: firstNameAr,
            last_name_en: lastNameEn,
            last_name_ar: lastNameAr,
            national_id: nationalId,
            phone: phone,
            gender: gender,
            nationality: nationality,
            birthdate: birthdate,
            address: address,
            is_foreign: isForeign || false,
            status: 'pending',
            photo: photoPath,
            national_id_front: nationalIdFrontPath,
            national_id_back: nationalIdBackPath,
            medical_report: medicalReportPath,
            proof: proofPath
        });
        // Add sports if provided
        if (sportIds && sportIds.length > 0) {
            await this.addTeamSports(savedTeamMember.id, sportIds);
        }
        return {
            id: savedTeamMember.id,
            account_id: savedAccount.id,
            name_en: `${firstNameEn} ${lastNameEn}`,
            name_ar: `${firstNameAr} ${lastNameAr}`,
            email,
            status: 'pending'
        };
    }
    /**
     * Update team member with sports
     */
    async updateTeamMemberWithSports(teamMemberId, data) {
        const teamMember = await this.teamMemberRepo.findOne({ where: { id: teamMemberId } });
        if (!teamMember) {
            throw new Error('Team member not found');
        }
        // Update basic info
        if (data.first_name_en)
            teamMember.first_name_en = data.first_name_en;
        if (data.first_name_ar)
            teamMember.first_name_ar = data.first_name_ar;
        if (data.last_name_en)
            teamMember.last_name_en = data.last_name_en;
        if (data.last_name_ar)
            teamMember.last_name_ar = data.last_name_ar;
        if (data.phone)
            teamMember.phone = data.phone;
        if (data.address)
            teamMember.address = data.address;
        if (data.gender)
            teamMember.gender = data.gender;
        if (data.nationality)
            teamMember.nationality = data.nationality;
        if (data.birthdate)
            teamMember.birthdate = new Date(data.birthdate);
        await this.teamMemberRepo.save(teamMember);
        // Update sports if provided
        if (data.sport_ids && Array.isArray(data.sport_ids)) {
            // Remove existing sports
            await this.teamRepo.delete({ team_member_id: teamMemberId });
            // Add new sports
            if (data.sport_ids.length > 0) {
                await this.addTeamSports(teamMemberId, data.sport_ids);
            }
        }
        return {
            id: teamMember.id,
            name_en: `${teamMember.first_name_en} ${teamMember.last_name_en}`,
            name_ar: `${teamMember.first_name_ar} ${teamMember.last_name_ar}`,
            status: teamMember.status
        };
    }
    /**
     * Add sports to a team member
     * Note: This creates team subscriptions for teams belonging to the given sports
     */
    async addTeamSports(teamMemberId, sportIds) {
        const Team = (await Promise.resolve().then(() => __importStar(require('../entities/Team')))).Team;
        const teamRepository = data_source_1.AppDataSource.getRepository(Team);
        const teamEntities = [];
        for (const sportId of sportIds) {
            const sport = await this.sportRepo.findOne({ where: { id: sportId } });
            if (!sport) {
                throw new Error(`Sport with ID ${sportId} not found`);
            }
            // Find teams for this sport
            const teams = await teamRepository.find({
                where: { sport_id: sportId, status: TeamEnums_1.TeamStatus.ACTIVE },
                take: 1 // Take first active team for this sport
            });
            if (teams.length === 0) {
                console.warn(`No active teams found for sport ${sportId}, skipping`);
                continue;
            }
            const team = teams[0];
            const startDate = new Date();
            const endDate = new Date();
            endDate.setFullYear(endDate.getFullYear() + 1);
            const teamEntity = this.teamRepo.create({
                team_member_id: teamMemberId,
                team_id: team.id,
                start_date: startDate,
                end_date: endDate,
                price: sport.price ? Number(sport.price) : 0,
                status: 'pending'
            });
            teamEntities.push(teamEntity);
        }
        if (teamEntities.length > 0) {
            await this.teamRepo.save(teamEntities);
        }
    }
    /**
     * Get single team member by ID
     */
    async getTeamMemberById(teamMemberId) {
        console.log('TeamMemberService.getTeamMemberById called with ID:', teamMemberId, 'Type:', typeof teamMemberId);
        const teamMember = await this.teamMemberRepo.findOne({
            where: { id: teamMemberId },
            relations: ['team_member_teams', 'team_member_teams.team', 'team_member_teams.team.sport', 'account']
        });
        console.log('Query result:', teamMember ? `Found ID ${teamMember.id}` : 'NOT FOUND');
        if (teamMember) {
            console.log('Team member teams relation:', teamMember.team_member_teams?.length || 0, 'teams');
            console.log('Team member teams data:', teamMember.team_member_teams);
        }
        if (!teamMember) {
            throw new Error('Team member not found');
        }
        // Format birthdate safely
        const birthdate = teamMember.birthdate
            ? (() => {
                const dt = teamMember.birthdate instanceof Date
                    ? teamMember.birthdate
                    : new Date(teamMember.birthdate);
                return Number.isNaN(dt.getTime()) ? null : dt.toISOString().slice(0, 10);
            })()
            : null;
        const result = {
            id: teamMember.id,
            account_id: teamMember.account_id,
            name_en: `${teamMember.first_name_en} ${teamMember.last_name_en}`,
            name_ar: `${teamMember.first_name_ar} ${teamMember.last_name_ar}`,
            first_name_en: teamMember.first_name_en,
            first_name_ar: teamMember.first_name_ar,
            last_name_en: teamMember.last_name_en,
            last_name_ar: teamMember.last_name_ar,
            email: teamMember.account?.email,
            phone: teamMember.phone,
            gender: teamMember.gender,
            nationality: teamMember.nationality,
            birthdate,
            national_id: teamMember.national_id,
            address: teamMember.address,
            is_foreign: teamMember.is_foreign,
            status: teamMember.status,
            created_at: teamMember.created_at,
            updated_at: teamMember.updated_at,
            photo: teamMember.photo || null,
            medical_report: teamMember.medical_report || null,
            national_id_front: teamMember.national_id_front || null,
            national_id_back: teamMember.national_id_back || null,
            proof: teamMember.proof || null,
            sports: teamMember.team_member_teams?.map(t => ({
                id: t.id,
                name: t.team?.sport?.name_ar || t.team?.sport?.name_en || t.team?.name_en || t.team_id,
                teamId: t.team_id,
                start_date: t.start_date,
                end_date: t.end_date,
                price: t.price,
                status: t.status
            })) || []
        };
        console.log(`Returning team member ${teamMemberId} with ${result.sports.length} sports:`, result.sports);
        return result;
    }
    /**
     * Deactivate a team member account (soft delete)
     */
    async deactivateTeamMember(teamMemberId) {
        const teamMember = await this.teamMemberRepo.findOne({
            where: { id: teamMemberId },
            relations: ['account']
        });
        if (!teamMember) {
            throw new Error('Team member not found');
        }
        // Deactivate the account
        const account = teamMember.account;
        account.is_active = false;
        account.status = 'suspended';
        await this.accountRepo.save(account);
        // Deactivate the team member
        teamMember.status = 'suspended';
        await this.teamMemberRepo.save(teamMember);
        return {
            id: teamMember.id,
            status: 'deactivated',
            message: 'Team member account has been deactivated'
        };
    }
    /**
     * Delete a team member permanently (including account)
     */
    async deleteTeamMember(teamMemberId) {
        const teamMember = await this.teamMemberRepo.findOne({
            where: { id: teamMemberId },
            relations: ['team_member_teams', 'account']
        });
        if (!teamMember) {
            throw new Error('Team member not found');
        }
        const accountId = teamMember.account_id;
        // Delete team sports
        await this.teamRepo.delete({ team_member_id: teamMemberId });
        // Delete team member
        await this.teamMemberRepo.delete({ id: teamMemberId });
        // Delete account
        if (accountId) {
            await this.accountRepo.delete({ id: accountId });
        }
        return {
            id: teamMemberId,
            message: 'Team member and associated account permanently deleted'
        };
    }
    /**
     * Get all pending team members (status = 'pending')
     */
    async getPendingTeamMembers() {
        const teamMembers = await this.teamMemberRepo.createQueryBuilder('team_member')
            .leftJoinAndSelect('team_member.team_member_teams', 'teams')
            .leftJoinAndSelect('team_member.account', 'account')
            .where('team_member.status = :status', { status: 'pending' })
            .orderBy('team_member.created_at', 'DESC')
            .getMany();
        return teamMembers.map(tm => ({
            id: tm.id,
            first_name_ar: tm.first_name_ar,
            last_name_ar: tm.last_name_ar,
            first_name_en: tm.first_name_en,
            last_name_en: tm.last_name_en,
            phone: tm.phone,
            national_id: tm.national_id,
            birth_date: tm.birthdate ? (tm.birthdate instanceof Date ? tm.birthdate.toISOString().split('T')[0] : String(tm.birthdate)) : '',
            gender: tm.gender || 'male',
            address: tm.address || '',
            social_status: '',
            status: tm.status,
            created_at: tm.created_at ? tm.created_at.toISOString() : new Date().toISOString(),
            photo: tm.photo || undefined,
            national_id_front: tm.national_id_front || undefined,
            national_id_back: tm.national_id_back || undefined,
            medical_report: tm.medical_report || undefined,
            memberType: 'team_member',
            teams: tm.team_member_teams?.map(t => t.team?.name_en || t.team_id) || [],
        }));
    }
    /**
     * Approve a pending team member
     */
    async approveTeamMember(teamMemberId) {
        const teamMember = await this.teamMemberRepo.findOne({
            where: { id: teamMemberId },
            relations: ['account']
        });
        if (!teamMember)
            throw new Error('Team member not found');
        teamMember.status = 'active';
        await this.teamMemberRepo.save(teamMember);
        if (teamMember.account) {
            teamMember.account.status = 'active';
            teamMember.account.is_active = true;
            await this.accountRepo.save(teamMember.account);
        }
        return { id: teamMemberId, status: 'active' };
    }
    /**
     * Assign sports to a team member
     * Replaces all existing sports with the provided list
     */
    async assignSportsToTeamMember(teamMemberId, sportIds) {
        console.log(`TeamMemberService.assignSportsToTeamMember called with ID: ${teamMemberId}, sportIds:`, sportIds);
        // Find the team member
        const teamMember = await this.teamMemberRepo.findOne({
            where: { id: teamMemberId },
            relations: ['team_member_teams']
        });
        if (!teamMember) {
            throw new Error(`Team member with ID ${teamMemberId} not found`);
        }
        // Import Team entity
        const Team = (await Promise.resolve().then(() => __importStar(require('../entities/Team')))).Team;
        const teamRepository = data_source_1.AppDataSource.getRepository(Team);
        // Delete existing team_member_teams for this team member
        await this.teamRepo.delete({ team_member_id: teamMemberId });
        // Create new team_member_teams entries
        const newTeamMemberTeams = [];
        for (const sportId of sportIds) {
            // Find first active team for this sport
            const teams = await teamRepository.find({
                where: { sport_id: sportId, status: TeamEnums_1.TeamStatus.ACTIVE },
                take: 1
            });
            if (teams.length === 0) {
                console.warn(`No active teams found for sport ${sportId}, skipping`);
                continue;
            }
            const tmt = new TeamMemberTeam_1.TeamMemberTeam();
            tmt.team_member_id = teamMemberId;
            tmt.team_id = teams[0].id;
            tmt.status = 'pending';
            tmt.price = 0;
            newTeamMemberTeams.push(tmt);
        }
        await this.teamRepo.save(newTeamMemberTeams);
        console.log(`Saved ${newTeamMemberTeams.length} team subscriptions for team member ${teamMemberId}`);
        return {
            team_member_id: teamMemberId,
            sports_assigned: sportIds.length,
            sport_ids: sportIds,
            message: 'Sports assigned successfully'
        };
    }
    async getTeamMemberBookings(teamMemberId) {
        try {
            // Find the team member
            const teamMember = await this.teamMemberRepo.findOne({
                where: { id: teamMemberId }
            });
            if (!teamMember) {
                throw new Error(`Team member with ID ${teamMemberId} not found`);
            }
            // Import Booking entity
            const Booking = (await Promise.resolve().then(() => __importStar(require('../entities/Booking')))).Booking;
            const bookingRepository = data_source_1.AppDataSource.getRepository(Booking);
            // Get all bookings for this team member
            const bookings = await bookingRepository.find({
                where: { team_member_id: teamMemberId },
                relations: ['sport'],
                order: { start_time: 'ASC' }
            });
            return bookings;
        }
        catch (error) {
            console.error(`Error getting bookings for team member ${teamMemberId}:`, error);
            throw error;
        }
    }
}
exports.TeamMemberService = TeamMemberService;
//# sourceMappingURL=TeamMemberService.js.map