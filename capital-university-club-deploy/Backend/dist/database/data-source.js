"use strict";
// // src/database/data_source.ts
// import 'reflect-metadata';
// import { DataSource } from 'typeorm';
// import dotenv from 'dotenv';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = exports.AppDataSource = void 0;
// // Load environment variables
// dotenv.config();
// // Import all your entities
// import { Account } from '../entities/Account';
// import { Member } from '../entities/Member';
// import { MemberType } from '../entities/MemberType';
// import { MembershipPlan } from '../entities/MembershipPlan';
// import { MemberMembership } from '../entities/MemberMembership';
// import { Branch } from '../entities/Branch';
// import { BranchSport } from '../entities/BranchSport';
// import { BranchSportTeam } from '../entities/BranchSportTeam';
// import { Faculty } from '../entities/Faculty';
// import { Profession } from '../entities/Profession';
// import { EmployeeDetail } from '../entities/EmployeeDetail';
// import { RetiredEmployeeDetail } from '../entities/RetiredEmployeeDetail';
// import { UniversityStudentDetail } from '../entities/UniversityStudentDetail';
// import { OutsiderDetail } from '../entities/OutsiderDetail';
// import { MemberRelationship } from '../entities/MemberRelationship';
// import { ActivityLog } from '../entities/ActivityLog';
// import { Staff } from '../entities/Staff';
// import { StaffType } from '../entities/StaffType';
// import { Privilege } from '../entities/Privilege';
// import { PrivilegePackage } from '../entities/PrivilegePackage';
// import { StaffPackage } from '../entities/StaffPackage';
// import { StaffPrivilegeOverride } from '../entities/StaffPrivilegeOverride';
// import { StaffActivityLog } from '../entities/StaffActivityLog';
// import { StaffActionApproval } from '../entities/StaffActionApproval';
// import { Sport } from '../entities/Sport';
// import { Team } from '../entities/Team';
// import { TeamTrainingSchedule } from '../entities/TeamTrainingSchedule';
// import { Attendance } from '../entities/Attendance';
// import { Field } from '../entities/Field';
// import { FieldOperatingHours } from '../entities/FieldOperatingHours';
// import { TeamMember } from '../entities/TeamMember';
// import { TeamMemberTeam } from '../entities/TeamMemberTeam';
// import { MemberTeam } from '../entities/MemberTeam';
// import { Task } from '../entities/Task';
// import { AuditLog } from '../entities/AuditLog';
// import { MediaPost } from '../entities/MediaPost';
// import { Payment } from '../entities/Payment';
// import { Booking } from '../entities/Booking';
// import { BookingParticipant } from '../entities/BookingParticipant';
// import { MemberTeamSubscription } from '../entities/MemberTeamSubscription';
// import { TeamMemberTeamSubscription } from '../entities/TeamMemberTeamSubscription';
// import { Announcement } from '../entities/Announcement';
// // ✅ PostgreSQL / Supabase TypeORM config
// export const AppDataSource = new DataSource({
//   type: 'postgres',
//   url: process.env.DATABASE_URL || 'postgresql://postgres:wxgdY75MzZVWcDSc@db.mnpdqpguszjgnpzvhotr.supabase.co:5432/postgres',
//   synchronize: false, // Always false to prevent schema sync issues
//   logging: process.env.TYPEORM_LOGGING === 'true' ? true : false,
//   ssl: {
//     rejectUnauthorized: false, // Required for Supabase
//   },
//   // ✅ Performance optimizations
//   extra: {
//     // Connection pool settings
//     max: 20, // Maximum number of connections in the pool
//     min: 2,  // Minimum number of connections in the pool
//     idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
//     connectionTimeoutMillis: 15000, // Timeout for acquiring connection
//     // Query performance — increased to handle EU (Frankfurt) latency from Egypt
//     statement_timeout: 120000, // 2 minutes
//     query_timeout: 120000,     // 2 minutes
//     // Enable connection reuse
//     keepAlive: true,
//     keepAliveInitialDelayMillis: 10000,
//   },
//   connectTimeoutMS: 10000, // 10 second timeout
//   // ✅ Enable query result caching (requires cache configuration)
//   cache: {
//     duration: 30000, // Cache results for 30 seconds
//     type: 'database', // Use database-based caching
//   },
//   entities: [
//     Account,
//     Member,
//     MemberType,
//     MembershipPlan,
//     MemberMembership,
//     Branch,
//     BranchSport,
//     BranchSportTeam,
//     Faculty,
//     Profession,
//     EmployeeDetail,
//     RetiredEmployeeDetail,
//     UniversityStudentDetail,
//     OutsiderDetail,
//     MemberRelationship,
//     ActivityLog,
//     Staff,
//     StaffType,
//     Privilege,
//     PrivilegePackage,
//     StaffPackage,
//     StaffPrivilegeOverride,
//     StaffActivityLog,
//     StaffActionApproval,
//     Sport,
//     Team,
//     TeamTrainingSchedule,
//     Attendance,
//     Field,
//     FieldOperatingHours,
//     TeamMember,
//     TeamMemberTeam,
//     MemberTeam,
//     Task, // New Task Entity
//     AuditLog,
//     MediaPost,
//     Payment, // Central payments table
//     Booking,
//     BookingParticipant,
//     MemberTeamSubscription,
//     TeamMemberTeamSubscription,
//     Announcement,
//   ],
// });
// // ✅ Helper function to initialize DB connection
// export const initializeDatabase = async () => {
//   try {
//     console.log('🔄 Initializing TypeORM connection...');
//     await AppDataSource.initialize();
//     console.log('✅ TypeORM Database connection established');
//     console.log(`Connected to database: ${AppDataSource.options.database}`);
//     return AppDataSource;
//   } catch (error) {
//     console.error('❌ Error during Data Source initialization:', error);
//     throw error;
//   }
// };
// src/database/data_source.ts
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Import all your entities
const Account_1 = require("../entities/Account");
const Member_1 = require("../entities/Member");
const MemberType_1 = require("../entities/MemberType");
const MembershipPlan_1 = require("../entities/MembershipPlan");
const MemberMembership_1 = require("../entities/MemberMembership");
const Branch_1 = require("../entities/Branch");
const BranchSport_1 = require("../entities/BranchSport");
const BranchSportTeam_1 = require("../entities/BranchSportTeam");
const Faculty_1 = require("../entities/Faculty");
const Profession_1 = require("../entities/Profession");
const EmployeeDetail_1 = require("../entities/EmployeeDetail");
const RetiredEmployeeDetail_1 = require("../entities/RetiredEmployeeDetail");
const UniversityStudentDetail_1 = require("../entities/UniversityStudentDetail");
const OutsiderDetail_1 = require("../entities/OutsiderDetail");
const MemberRelationship_1 = require("../entities/MemberRelationship");
const ActivityLog_1 = require("../entities/ActivityLog");
const Staff_1 = require("../entities/Staff");
const StaffType_1 = require("../entities/StaffType");
const Privilege_1 = require("../entities/Privilege");
const PrivilegePackage_1 = require("../entities/PrivilegePackage");
const StaffPackage_1 = require("../entities/StaffPackage");
const StaffPrivilegeOverride_1 = require("../entities/StaffPrivilegeOverride");
const StaffActivityLog_1 = require("../entities/StaffActivityLog");
const StaffActionApproval_1 = require("../entities/StaffActionApproval");
const Sport_1 = require("../entities/Sport");
const Team_1 = require("../entities/Team");
const TeamTrainingSchedule_1 = require("../entities/TeamTrainingSchedule");
const Attendance_1 = require("../entities/Attendance");
const Field_1 = require("../entities/Field");
const FieldOperatingHours_1 = require("../entities/FieldOperatingHours");
const TeamMember_1 = require("../entities/TeamMember");
const TeamMemberTeam_1 = require("../entities/TeamMemberTeam");
const MemberTeam_1 = require("../entities/MemberTeam");
const Task_1 = require("../entities/Task");
const AuditLog_1 = require("../entities/AuditLog");
const MediaPost_1 = require("../entities/MediaPost");
const Payment_1 = require("../entities/Payment");
const Booking_1 = require("../entities/Booking");
const BookingParticipant_1 = require("../entities/BookingParticipant");
const MemberTeamSubscription_1 = require("../entities/MemberTeamSubscription");
const TeamMemberTeamSubscription_1 = require("../entities/TeamMemberTeamSubscription");
const Announcement_1 = require("../entities/Announcement");
// ✅ PostgreSQL / Supabase TypeORM config
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    // ✅ Local database — read from env, with sensible local defaults
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '0000',
    database: process.env.DB_NAME || 'Helwan_University_Club',
    synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true', // Auto-create tables only when explicitly enabled
    logging: process.env.TYPEORM_LOGGING === 'true',
    entities: [
        Account_1.Account,
        Member_1.Member,
        MemberType_1.MemberType,
        MembershipPlan_1.MembershipPlan,
        MemberMembership_1.MemberMembership,
        Branch_1.Branch,
        BranchSport_1.BranchSport,
        BranchSportTeam_1.BranchSportTeam,
        Faculty_1.Faculty,
        Profession_1.Profession,
        EmployeeDetail_1.EmployeeDetail,
        RetiredEmployeeDetail_1.RetiredEmployeeDetail,
        UniversityStudentDetail_1.UniversityStudentDetail,
        OutsiderDetail_1.OutsiderDetail,
        MemberRelationship_1.MemberRelationship,
        ActivityLog_1.ActivityLog,
        Staff_1.Staff,
        StaffType_1.StaffType,
        Privilege_1.Privilege,
        PrivilegePackage_1.PrivilegePackage,
        StaffPackage_1.StaffPackage,
        StaffPrivilegeOverride_1.StaffPrivilegeOverride,
        StaffActivityLog_1.StaffActivityLog,
        StaffActionApproval_1.StaffActionApproval,
        Sport_1.Sport,
        Team_1.Team,
        TeamTrainingSchedule_1.TeamTrainingSchedule,
        Attendance_1.Attendance,
        Field_1.Field,
        FieldOperatingHours_1.FieldOperatingHours,
        TeamMember_1.TeamMember,
        TeamMemberTeam_1.TeamMemberTeam,
        MemberTeam_1.MemberTeam,
        Task_1.Task, // New Task Entity
        AuditLog_1.AuditLog,
        MediaPost_1.MediaPost,
        Payment_1.Payment, // Central payments table
        Booking_1.Booking,
        BookingParticipant_1.BookingParticipant,
        MemberTeamSubscription_1.MemberTeamSubscription,
        TeamMemberTeamSubscription_1.TeamMemberTeamSubscription,
        Announcement_1.Announcement,
    ],
});
// ✅ Helper function to initialize DB connection
const initializeDatabase = async () => {
    try {
        console.log('🔄 Initializing TypeORM connection...');
        await exports.AppDataSource.initialize();
        console.log('✅ TypeORM Database connection established');
        console.log(`Connected to database: ${exports.AppDataSource.options.database}`);
        return exports.AppDataSource;
    }
    catch (error) {
        console.error('❌ Error during Data Source initialization:', error);
        throw error;
    }
};
exports.initializeDatabase = initializeDatabase;
//# sourceMappingURL=data-source.js.map