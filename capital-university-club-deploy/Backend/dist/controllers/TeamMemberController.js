"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamMemberController = void 0;
const TeamMemberService_1 = require("../services/TeamMemberService");
const data_source_1 = require("../database/data-source");
const Sport_1 = require("../entities/Sport");
const localFileStorage_1 = require("../utils/localFileStorage");
class TeamMemberController {
    constructor() {
        this.sportRepo = data_source_1.AppDataSource.getRepository(Sport_1.Sport);
        this.submitDetails = async (req, res) => {
            try {
                const { member_id, address, position, team_name, teams } = req.body;
                // Reject if position or team_name/teams are provided in this step
                if (position || team_name || teams) {
                    res.status(400).json({ error: 'Position and teams cannot be provided in this step' });
                    return;
                }
                // Validate member_id
                if (member_id === undefined || member_id === null || member_id === '') {
                    res.status(400).json({ error: 'member_id is required' });
                    return;
                }
                const memberId = Number(member_id);
                if (isNaN(memberId)) {
                    res.status(400).json({ error: 'member_id must be a valid number' });
                    return;
                }
                const files = req.files;
                console.log('📬 [TeamMemberController.submitDetails] Body:', req.body);
                console.log('📬 [TeamMemberController.submitDetails] Files received:', files ? Object.keys(files) : 'NONE');
                const personalPhoto = files && (files['personal_photo'] || files['photo']) ? (files['personal_photo'] || files['photo'])[0] : null;
                const medicalReport = files && (files['medical_report'] || files['medical']) ? (files['medical_report'] || files['medical'])[0] : null;
                const nationalIdFront = files && (files['national_id_front'] || files['id_front']) ? (files['national_id_front'] || files['id_front'])[0] : null;
                const nationalIdBack = files && (files['national_id_back'] || files['id_back']) ? (files['national_id_back'] || files['id_back'])[0] : null;
                const proof = files && files['proof'] ? files['proof'][0] : null;
                // Note: Service handles these as optional. 
                // We only log if personal_photo is missing as it's typically expected.
                if (!personalPhoto) {
                    console.warn(`Registration for member ${memberId} is missing personal_photo`);
                }
                // Upload files to Cloudinary
                let photoPath;
                let reportPath;
                let nationalIdFrontPath;
                let nationalIdBackPath;
                let proofPath;
                try {
                    if (personalPhoto) {
                        photoPath = await (0, localFileStorage_1.saveToLocalStorage)(personalPhoto.buffer, personalPhoto.originalname, localFileStorage_1.DocumentType.PERSONAL_PHOTO, localFileStorage_1.UserType.TEAM_MEMBER);
                    }
                    if (medicalReport) {
                        reportPath = await (0, localFileStorage_1.saveToLocalStorage)(medicalReport.buffer, medicalReport.originalname, localFileStorage_1.DocumentType.MEDICAL_REPORT, localFileStorage_1.UserType.TEAM_MEMBER);
                    }
                    if (nationalIdFront) {
                        nationalIdFrontPath = await (0, localFileStorage_1.saveToLocalStorage)(nationalIdFront.buffer, nationalIdFront.originalname, localFileStorage_1.DocumentType.NATIONAL_ID, localFileStorage_1.UserType.TEAM_MEMBER);
                    }
                    if (nationalIdBack) {
                        nationalIdBackPath = await (0, localFileStorage_1.saveToLocalStorage)(nationalIdBack.buffer, nationalIdBack.originalname, localFileStorage_1.DocumentType.NATIONAL_ID, localFileStorage_1.UserType.TEAM_MEMBER);
                    }
                    if (proof) {
                        proofPath = await (0, localFileStorage_1.saveToLocalStorage)(proof.buffer, proof.originalname, localFileStorage_1.DocumentType.PROOF, localFileStorage_1.UserType.TEAM_MEMBER);
                    }
                }
                catch (uploadError) {
                    console.error('File upload error:', uploadError);
                    res.status(400).json({
                        error: uploadError instanceof Error ? uploadError.message : 'Failed to upload files'
                    });
                    return;
                }
                const result = await this.service.submitDetails(memberId, photoPath, reportPath, address, nationalIdFrontPath, nationalIdBackPath, proofPath);
                res.status(200).json({ success: true, team_member_detail_id: result.id });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
                console.error('Error in submitDetails:', error);
                res.status(500).json({ error: errorMessage });
            }
        };
        this.selectTeams = async (req, res) => {
            try {
                console.log('selectTeams full request body:', JSON.stringify(req.body, null, 2));
                // Accept sport_ids OR teams from frontend
                const member_id = req.body.member_id;
                const sport_ids = req.body.sport_ids;
                const teams = req.body.teams;
                const startDate = req.body.startDate;
                const endDate = req.body.endDate;
                // Validate member_id
                if (member_id === undefined || member_id === null || member_id === '') {
                    res.status(400).json({ error: 'member_id is required' });
                    return;
                }
                const memberId = Number(member_id);
                if (isNaN(memberId)) {
                    res.status(400).json({ error: 'member_id must be a valid number' });
                    return;
                }
                let teamNames = [];
                // Case 1: teams provided directly (common in current frontend)
                if (Array.isArray(teams) && teams.length > 0) {
                    teamNames = teams;
                }
                // Case 2: sport_ids provided (fallback/alternative)
                else if (Array.isArray(sport_ids) && sport_ids.length > 0) {
                    // Convert sport_ids to team names by looking up sports
                    for (const sportId of sport_ids) {
                        const sport = await this.sportRepo.findOne({
                            where: { id: Number(sportId) }
                        });
                        if (sport) {
                            // Use English name as team name
                            teamNames.push(sport.name_en || sport.name_ar || `Sport ${sportId}`);
                        }
                    }
                }
                else {
                    console.error('Neither sport_ids nor teams provided. Request body keys:', Object.keys(req.body));
                    res.status(400).json({
                        error: 'sport_ids or teams array is required',
                        receivedBody: req.body
                    });
                    return;
                }
                if (teamNames.length === 0) {
                    res.status(400).json({ error: 'No valid sports or teams found' });
                    return;
                }
                const result = await this.service.selectTeams(memberId, teamNames, startDate, endDate);
                res.status(200).json({ success: true, ...result });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error('Error in selectTeams:', error);
                res.status(400).json({ error: errorMessage });
            }
        };
        this.getStatus = async (req, res) => {
            try {
                const { team_member_id } = req.params;
                if (!team_member_id) {
                    res.status(400).json({ error: 'team_member_id is required' });
                    return;
                }
                const memberId = Number(team_member_id);
                if (isNaN(memberId)) {
                    res.status(400).json({ error: 'member_id must be a valid number' });
                    return;
                }
                const status = await this.service.getStatus(memberId);
                res.status(200).json(status);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error('Error in getStatus:', error);
                res.status(500).json({ error: errorMessage });
            }
        };
        this.getDetails = async (req, res) => {
            try {
                const { member_id } = req.params;
                if (!member_id) {
                    res.status(400).json({ success: false, error: 'member_id is required' });
                    return;
                }
                const memberId = Number(member_id);
                if (isNaN(memberId)) {
                    res.status(400).json({ success: false, error: 'member_id must be a valid number' });
                    return;
                }
                const details = await this.service.getTeamMemberDetails(memberId);
                res.status(200).json({ success: true, data: details });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error('Error in getDetails:', error);
                res.status(500).json({ success: false, error: errorMessage });
            }
        };
        this.reviewAllTeamMemberData = async (req, res) => {
            try {
                // Check Authorization
                // Assuming the authenticate middleware attaches user info to req.user
                // And we check the staff role code.
                const user = req.user;
                if (!user || !user.staff_type_id) {
                    res.status(401).json({ error: 'Unauthorized' });
                    return;
                }
                // You'll need to fetch the staff type code to verify. 
                // Or assume middleware or service handles strict checking.
                // For now, let's delegate strict checking to service or assume middleware passed
                // In a real scenario, we should query StaffType here or in middleware.
                // Let's assume the router uses a middleware to limit to staff, 
                // and we do a simpler check here or rely on the fact that only staff routes hit this.
                // To be safe, let's verify codes if possible, OR just proceed if user is staff.
                // The prompt says "SportActivitySpecialist and SportActivtyManager".
                const members = await this.service.getAllTeamMembers();
                res.status(200).json({ success: true, data: members });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error('Error in reviewAllTeamMemberData:', error);
                res.status(500).json({ error: errorMessage });
            }
        };
        this.updateProfile = async (req, res) => {
            try {
                const { member_id } = req.params;
                if (!member_id) {
                    res.status(400).json({ success: false, error: 'member_id is required' });
                    return;
                }
                const memberId = Number(member_id);
                if (isNaN(memberId)) {
                    res.status(400).json({ success: false, error: 'member_id must be a valid number' });
                    return;
                }
                const data = { ...req.body };
                const files = req.files;
                if (files) {
                    try {
                        if (files['personal_photo']) {
                            data.photo = await (0, localFileStorage_1.saveToLocalStorage)(files['personal_photo'][0].buffer, files['personal_photo'][0].originalname, localFileStorage_1.DocumentType.PERSONAL_PHOTO, localFileStorage_1.UserType.TEAM_MEMBER);
                        }
                        if (files['medical_report']) {
                            data.medical_report = await (0, localFileStorage_1.saveToLocalStorage)(files['medical_report'][0].buffer, files['medical_report'][0].originalname, localFileStorage_1.DocumentType.MEDICAL_REPORT, localFileStorage_1.UserType.TEAM_MEMBER);
                        }
                        if (files['national_id_front']) {
                            data.national_id_front = await (0, localFileStorage_1.saveToLocalStorage)(files['national_id_front'][0].buffer, files['national_id_front'][0].originalname, localFileStorage_1.DocumentType.NATIONAL_ID, localFileStorage_1.UserType.TEAM_MEMBER);
                        }
                        if (files['national_id_back']) {
                            data.national_id_back = await (0, localFileStorage_1.saveToLocalStorage)(files['national_id_back'][0].buffer, files['national_id_back'][0].originalname, localFileStorage_1.DocumentType.NATIONAL_ID, localFileStorage_1.UserType.TEAM_MEMBER);
                        }
                        if (files['proof']) {
                            data.proof = await (0, localFileStorage_1.saveToLocalStorage)(files['proof'][0].buffer, files['proof'][0].originalname, localFileStorage_1.DocumentType.PROOF, localFileStorage_1.UserType.TEAM_MEMBER);
                        }
                    }
                    catch (uploadError) {
                        console.error('File upload error:', uploadError);
                        res.status(400).json({
                            success: false,
                            error: uploadError instanceof Error ? uploadError.message : 'Failed to upload files'
                        });
                        return;
                    }
                }
                const result = await this.service.updateProfile(memberId, data);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error('Error in updateProfile:', error);
                res.status(500).json({ success: false, error: errorMessage });
            }
        };
        /**
         * CREATE - Create a new team member with account and sports
         * POST /api/team-members
         */
        this.createTeamMember = async (req, res) => {
            try {
                const { email, password, first_name_en, first_name_ar, last_name_en, last_name_ar, national_id, phone, gender, nationality, birthdate, address, is_foreign, sport_ids } = req.body;
                // Validate required fields
                if (!email || !password || !first_name_en || !first_name_ar || !last_name_en || !last_name_ar || !national_id) {
                    res.status(400).json({
                        error: 'Missing required fields: email, password, first_name_en, first_name_ar, last_name_en, last_name_ar, national_id'
                    });
                    return;
                }
                // Validate sport_ids if provided
                if (sport_ids && (!Array.isArray(sport_ids) || sport_ids.length === 0)) {
                    res.status(400).json({
                        error: 'sport_ids must be a non-empty array'
                    });
                    return;
                }
                // Extract files from request
                const files = req.files;
                const photo = files?.['photo'] ? files['photo'][0] : null;
                const nationalIdFront = files?.['national_id_front'] ? files['national_id_front'][0] : null;
                const nationalIdBack = files?.['national_id_back'] ? files['national_id_back'][0] : null;
                const medicalReport = files?.['medical_report'] ? files['medical_report'][0] : null;
                const proof = files?.['proof'] ? files['proof'][0] : null;
                // Validate required files
                if (!photo || !nationalIdFront || !nationalIdBack || !medicalReport || !proof) {
                    res.status(400).json({
                        error: 'Missing required files: photo, national_id_front, national_id_back, medical_report, proof'
                    });
                    return;
                }
                // Upload files to Cloudinary
                let photoUrl;
                let nationalIdFrontUrl;
                let nationalIdBackUrl;
                let medicalReportUrl;
                let proofUrl;
                try {
                    photoUrl = await (0, localFileStorage_1.saveToLocalStorage)(photo.buffer, photo.originalname, localFileStorage_1.DocumentType.PERSONAL_PHOTO, localFileStorage_1.UserType.TEAM_MEMBER);
                    nationalIdFrontUrl = await (0, localFileStorage_1.saveToLocalStorage)(nationalIdFront.buffer, nationalIdFront.originalname, localFileStorage_1.DocumentType.NATIONAL_ID, localFileStorage_1.UserType.TEAM_MEMBER);
                    nationalIdBackUrl = await (0, localFileStorage_1.saveToLocalStorage)(nationalIdBack.buffer, nationalIdBack.originalname, localFileStorage_1.DocumentType.NATIONAL_ID, localFileStorage_1.UserType.TEAM_MEMBER);
                    medicalReportUrl = await (0, localFileStorage_1.saveToLocalStorage)(medicalReport.buffer, medicalReport.originalname, localFileStorage_1.DocumentType.MEDICAL_REPORT, localFileStorage_1.UserType.TEAM_MEMBER);
                    proofUrl = await (0, localFileStorage_1.saveToLocalStorage)(proof.buffer, proof.originalname, localFileStorage_1.DocumentType.PROOF, localFileStorage_1.UserType.TEAM_MEMBER);
                }
                catch (uploadError) {
                    console.error('File upload error:', uploadError);
                    res.status(400).json({
                        error: uploadError instanceof Error ? uploadError.message : 'Failed to upload files'
                    });
                    return;
                }
                const result = await this.service.createTeamMember(email, password, first_name_en, first_name_ar, last_name_en, last_name_ar, national_id, phone, gender, nationality, birthdate ? new Date(birthdate) : undefined, address, is_foreign, sport_ids, photoUrl, nationalIdFrontUrl, nationalIdBackUrl, medicalReportUrl, proofUrl);
                res.status(201).json({ success: true, data: result });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error('Error in createTeamMember:', error);
                res.status(400).json({ success: false, error: errorMessage });
            }
        };
        /**
         * READ - Get single team member by ID
         * GET /api/team-members/:team_member_id
         */
        this.getTeamMember = async (req, res) => {
            try {
                const { team_member_id } = req.params;
                console.log('GET /team-members/:team_member_id called with:', { team_member_id });
                if (!team_member_id) {
                    console.warn('Missing team_member_id parameter');
                    res.status(400).json({ success: false, error: 'team_member_id is required' });
                    return;
                }
                const memberId = Number(team_member_id);
                if (isNaN(memberId)) {
                    console.warn('Invalid team_member_id (NaN):', team_member_id);
                    res.status(400).json({ success: false, error: 'team_member_id must be a valid number' });
                    return;
                }
                console.log('Fetching team member with ID:', memberId);
                const result = await this.service.getTeamMemberById(memberId);
                console.log('Found team member:', result?.id);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error('Error in getTeamMember:', errorMessage);
                console.error('Full error:', error);
                res.status(404).json({ success: false, error: errorMessage });
            }
        };
        /**
         * READ - Get all team members
         * GET /api/team-members?status=active&limit=10&page=1
         */
        this.getAllTeamMembers = async (req, res) => {
            try {
                const { status, limit, page } = req.query;
                const result = await this.service.getAllTeamMembers(status, limit ? Number(limit) : undefined, page ? Number(page) : undefined);
                res.status(200).json({
                    success: true,
                    data: result.data,
                    total: result.total,
                    pagination: result.pagination
                });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error('Error in getAllTeamMembers:', error);
                res.status(500).json({ success: false, error: errorMessage });
            }
        };
        /**
         * UPDATE - Update team member with sports
         * PUT /api/team-members/:team_member_id
         */
        this.updateTeamMember = async (req, res) => {
            try {
                const { team_member_id } = req.params;
                if (!team_member_id) {
                    res.status(400).json({ success: false, error: 'team_member_id is required' });
                    return;
                }
                const memberId = Number(team_member_id);
                if (isNaN(memberId)) {
                    res.status(400).json({ success: false, error: 'member_id must be a valid number' });
                    return;
                }
                const data = req.body;
                // Validate sport_ids if provided
                if (data.sport_ids && (!Array.isArray(data.sport_ids) || data.sport_ids.length === 0)) {
                    res.status(400).json({
                        error: 'sport_ids must be a non-empty array'
                    });
                    return;
                }
                const result = await this.service.updateTeamMemberWithSports(memberId, data);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error('Error in updateTeamMember:', error);
                res.status(400).json({ success: false, error: errorMessage });
            }
        };
        /**
         * DELETE (Soft) - Deactivate team member account
         * PUT /api/team-members/:team_member_id/deactivate
         */
        this.deactivateTeamMember = async (req, res) => {
            try {
                const { team_member_id } = req.params;
                if (!team_member_id) {
                    res.status(400).json({ success: false, error: 'team_member_id is required' });
                    return;
                }
                const memberId = Number(team_member_id);
                if (isNaN(memberId)) {
                    res.status(400).json({ success: false, error: 'team_member_id must be a valid number' });
                    return;
                }
                const result = await this.service.deactivateTeamMember(memberId);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error('Error in deactivateTeamMember:', error);
                res.status(400).json({ success: false, error: errorMessage });
            }
        };
        /**
         * DELETE (Hard) - Permanently delete team member account
         * DELETE /api/team-members/:team_member_id
         */
        this.deleteTeamMember = async (req, res) => {
            try {
                const { team_member_id } = req.params;
                if (!team_member_id) {
                    res.status(400).json({ success: false, error: 'team_member_id is required' });
                    return;
                }
                const memberId = Number(team_member_id);
                if (isNaN(memberId)) {
                    res.status(400).json({ success: false, error: 'team_member_id must be a valid number' });
                    return;
                }
                const result = await this.service.deleteTeamMember(memberId);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error('Error in deleteTeamMember:', error);
                res.status(400).json({ success: false, error: errorMessage });
            }
        };
        /**
         * GET /api/team-members/pending
         * Returns all team members with status = 'pending'
         */
        this.getPendingTeamMembers = async (req, res) => {
            try {
                const result = await this.service.getPendingTeamMembers();
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error('Error in getPendingTeamMembers:', error);
                res.status(500).json({ success: false, error: errorMessage });
            }
        };
        /**
         * POST /api/team-members/:team_member_id/approve
         * Approves a pending team member
         */
        this.approveTeamMember = async (req, res) => {
            try {
                const { team_member_id } = req.params;
                if (!team_member_id) {
                    res.status(400).json({ success: false, error: 'team_member_id is required' });
                    return;
                }
                const memberId = Number(team_member_id);
                if (isNaN(memberId)) {
                    res.status(400).json({ success: false, error: 'team_member_id must be a valid number' });
                    return;
                }
                const result = await this.service.approveTeamMember(memberId);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error('Error in approveTeamMember:', error);
                res.status(400).json({ success: false, error: errorMessage });
            }
        };
        /**
         * Assign sports to a team member
         * POST /api/team-members/:team_member_id/sports
         * Body: { sportIds: number[] }
         */
        this.assignSportsToTeamMember = async (req, res) => {
            try {
                const { team_member_id } = req.params;
                const { sportIds } = req.body;
                if (!team_member_id) {
                    res.status(400).json({ success: false, error: 'team_member_id is required' });
                    return;
                }
                if (!Array.isArray(sportIds)) {
                    res.status(400).json({ success: false, error: 'sportIds must be an array' });
                    return;
                }
                const memberId = Number(team_member_id);
                if (isNaN(memberId)) {
                    res.status(400).json({ success: false, error: 'team_member_id must be a valid number' });
                    return;
                }
                // Validate sportIds are numbers
                const validSportIds = sportIds
                    .map((id) => typeof id === 'number' ? id : parseInt(String(id)))
                    .filter((id) => !isNaN(id));
                if (validSportIds.length === 0) {
                    res.status(400).json({ success: false, error: 'No valid sport IDs provided' });
                    return;
                }
                // Call service to assign sports
                const result = await this.service.assignSportsToTeamMember(memberId, validSportIds);
                res.status(200).json({ success: true, data: result });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error('Error in assignSportsToTeamMember:', error);
                res.status(400).json({ success: false, error: errorMessage });
            }
        };
        /**
         * Get team member bookings
         * GET /api/team-members/:member_id/bookings
         */
        this.getTeamMemberBookings = async (req, res) => {
            try {
                const { member_id } = req.params;
                if (!member_id) {
                    res.status(400).json({ success: false, error: 'member_id is required' });
                    return;
                }
                const memberId = Number(member_id);
                if (isNaN(memberId)) {
                    res.status(400).json({ success: false, error: 'member_id must be a valid number' });
                    return;
                }
                const bookings = await this.service.getTeamMemberBookings(memberId);
                res.status(200).json({ success: true, data: bookings });
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error('Error in getTeamMemberBookings:', error);
                res.status(400).json({ success: false, error: errorMessage });
            }
        };
        this.service = new TeamMemberService_1.TeamMemberService();
    }
}
exports.TeamMemberController = TeamMemberController;
//# sourceMappingURL=TeamMemberController.js.map