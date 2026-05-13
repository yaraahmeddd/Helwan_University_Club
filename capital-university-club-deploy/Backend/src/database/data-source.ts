// // src/database/data_source.ts
// import 'reflect-metadata';
// import { DataSource } from 'typeorm';
// import dotenv from 'dotenv';

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
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import all your entities
import { Account } from '../entities/Account';
import { Member } from '../entities/Member';
import { MemberType } from '../entities/MemberType';
import { MembershipPlan } from '../entities/MembershipPlan';
import { MemberMembership } from '../entities/MemberMembership';
import { Branch } from '../entities/Branch';
import { BranchSport } from '../entities/BranchSport';
import { BranchSportTeam } from '../entities/BranchSportTeam';
import { Faculty } from '../entities/Faculty';
import { Profession } from '../entities/Profession';
import { EmployeeDetail } from '../entities/EmployeeDetail';
import { RetiredEmployeeDetail } from '../entities/RetiredEmployeeDetail';
import { UniversityStudentDetail } from '../entities/UniversityStudentDetail';
import { OutsiderDetail } from '../entities/OutsiderDetail';
import { MemberRelationship } from '../entities/MemberRelationship';
import { ActivityLog } from '../entities/ActivityLog';
import { Staff } from '../entities/Staff';
import { StaffType } from '../entities/StaffType';
import { Privilege } from '../entities/Privilege';
import { PrivilegePackage } from '../entities/PrivilegePackage';
import { StaffPackage } from '../entities/StaffPackage';
import { StaffPrivilegeOverride } from '../entities/StaffPrivilegeOverride';
import { StaffActivityLog } from '../entities/StaffActivityLog';
import { StaffActionApproval } from '../entities/StaffActionApproval';
import { Sport } from '../entities/Sport';
import { Team } from '../entities/Team';
import { TeamTrainingSchedule } from '../entities/TeamTrainingSchedule';
import { Attendance } from '../entities/Attendance';
import { Field } from '../entities/Field';
import { FieldOperatingHours } from '../entities/FieldOperatingHours';
import { TeamMember } from '../entities/TeamMember';
import { TeamMemberTeam } from '../entities/TeamMemberTeam';
import { MemberTeam } from '../entities/MemberTeam';

import { Task } from '../entities/Task';
import { AuditLog } from '../entities/AuditLog';
import { MediaPost } from '../entities/MediaPost';
import { Payment } from '../entities/Payment';
import { Booking } from '../entities/Booking';
import { BookingParticipant } from '../entities/BookingParticipant';
import { MemberTeamSubscription } from '../entities/MemberTeamSubscription';
import { TeamMemberTeamSubscription } from '../entities/TeamMemberTeamSubscription';
import { Announcement } from '../entities/Announcement';

// ✅ PostgreSQL / Supabase TypeORM config
export const AppDataSource = new DataSource({
    type: 'postgres',

    // ✅ Local database — read from env, with sensible local defaults
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '0000',
    database: process.env.DB_NAME || 'Helwan-University-Club',

    synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true', // Auto-create tables only when explicitly enabled
    logging: process.env.TYPEORM_LOGGING === 'true',

    entities: [
        Account,
        Member,
        MemberType,
        MembershipPlan,
        MemberMembership,
        Branch,
        BranchSport,
        BranchSportTeam,
        Faculty,
        Profession,
        EmployeeDetail,
        RetiredEmployeeDetail,
        UniversityStudentDetail,
        OutsiderDetail,
        MemberRelationship,
        ActivityLog,
        Staff,
        StaffType,
        Privilege,
        PrivilegePackage,
        StaffPackage,
        StaffPrivilegeOverride,
        StaffActivityLog,
        StaffActionApproval,
        Sport,
        Team,
        TeamTrainingSchedule,
        Attendance,
        Field,
        FieldOperatingHours,
        TeamMember,
        TeamMemberTeam,
        MemberTeam,
        Task, // New Task Entity
        AuditLog,
        MediaPost,
        Payment, // Central payments table
        Booking,
        BookingParticipant,
        MemberTeamSubscription,
        TeamMemberTeamSubscription,
        Announcement,
    ],
});


// ✅ Helper function to initialize DB connection
export const initializeDatabase = async () => {
    try {
        console.log('🔄 Initializing TypeORM connection...');
        await AppDataSource.initialize();
        console.log('✅ TypeORM Database connection established');
        console.log(`Connected to database: ${AppDataSource.options.database}`);
        return AppDataSource;
    } catch (error) {
        console.error('❌ Error during Data Source initialization:', error);
        throw error;
    }
};