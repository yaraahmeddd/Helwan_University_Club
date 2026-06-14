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
/**
 * Full database wipe + comprehensive sample-data reseed.
 *
 * Run with:
 *   TS_NODE_TRANSPILE_ONLY=true node -r ts-node/register src/scripts/full-reseed.ts
 *
 * Default password for ALL accounts: Password@123
 */
require("reflect-metadata");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const bcrypt = __importStar(require("bcrypt"));
const crypto_1 = require("crypto");
const data_source_1 = require("../database/data-source");
const Account_1 = require("../entities/Account");
const MemberType_1 = require("../entities/MemberType");
const StaffType_1 = require("../entities/StaffType");
const Faculty_1 = require("../entities/Faculty");
const Profession_1 = require("../entities/Profession");
const MembershipPlan_1 = require("../entities/MembershipPlan");
const Privilege_1 = require("../entities/Privilege");
const PrivilegePackage_1 = require("../entities/PrivilegePackage");
const Branch_1 = require("../entities/Branch");
const Sport_1 = require("../entities/Sport");
const BranchSport_1 = require("../entities/BranchSport");
const Field_1 = require("../entities/Field");
const FieldOperatingHours_1 = require("../entities/FieldOperatingHours");
const Team_1 = require("../entities/Team");
const TeamTrainingSchedule_1 = require("../entities/TeamTrainingSchedule");
const Staff_1 = require("../entities/Staff");
const Member_1 = require("../entities/Member");
const UniversityStudentDetail_1 = require("../entities/UniversityStudentDetail");
const EmployeeDetail_1 = require("../entities/EmployeeDetail");
const RetiredEmployeeDetail_1 = require("../entities/RetiredEmployeeDetail");
const OutsiderDetail_1 = require("../entities/OutsiderDetail");
const MemberRelationship_1 = require("../entities/MemberRelationship");
const MemberMembership_1 = require("../entities/MemberMembership");
const TeamMember_1 = require("../entities/TeamMember");
const Booking_1 = require("../entities/Booking");
const Payment_1 = require("../entities/Payment");
const Announcement_1 = require("../entities/Announcement");
const MediaPost_1 = require("../entities/MediaPost");
const Task_1 = require("../entities/Task");
const AuditLog_1 = require("../entities/AuditLog");
const DEFAULT_PASSWORD = 'Password@123';
// Tables to wipe — in reverse-dependency order
const TABLES_IN_DELETION_ORDER = [
    'audit_logs',
    'staff_activity_logs',
    'activity_logs',
    'tasks',
    'attendance',
    'booking_participants',
    'bookings',
    'payments',
    'announcements',
    'media_posts',
    'member_team_subscriptions',
    'team_member_team_subscriptions',
    'member_teams',
    'team_member_teams',
    'team_training_schedules',
    'teams',
    'branch_sport_teams',
    'branch_sports',
    'field_operating_hours',
    'fields',
    'sports',
    'staff_privileges_override',
    'staff_packages',
    'staff_action_approvals',
    'member_memberships',
    'membership_plans',
    'member_relationships',
    'university_student_details',
    'employee_details',
    'retired_employee_details',
    'outsider_details',
    'team_members',
    'members',
    'staff',
    'privileges',
    'packages',
    'staff_types',
    'member_types',
    'faculties',
    'professions',
    'branches',
    'accounts',
];
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const range = (n) => Array.from({ length: n }, (_, i) => i);
const daysAgo = (n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
};
const daysFromNow = (n) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d;
};
const ymd = (d) => d.toISOString().slice(0, 10);
async function main() {
    console.log('Connecting to database...');
    await data_source_1.AppDataSource.initialize();
    // ───────────────────────────── WIPE ─────────────────────────────
    console.log('\n=== Wiping existing data ===');
    for (const t of TABLES_IN_DELETION_ORDER) {
        try {
            await data_source_1.AppDataSource.query(`TRUNCATE TABLE "${t}" RESTART IDENTITY CASCADE;`);
            console.log(`  truncated ${t}`);
        }
        catch (e) {
            console.log(`  skipped ${t} (${e.message?.split('\n')[0] ?? 'unknown'})`);
        }
    }
    const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    // ═══════════════════════════ LOOKUPS ═══════════════════════════
    console.log('\n=== Seeding lookup tables ===');
    const memberTypeRepo = data_source_1.AppDataSource.getRepository(MemberType_1.MemberType);
    const memberTypes = await memberTypeRepo.save([
        { code: 'WORKING', name_en: 'Working Member', name_ar: 'عضو عامل', description_en: 'Active university employee', description_ar: 'موظف نشط بالجامعة' },
        { code: 'STUDENT', name_en: 'University Student', name_ar: 'طالب جامعي', description_en: 'Enrolled student', description_ar: 'طالب مسجل بالجامعة' },
        { code: 'RETIRED', name_en: 'Retired Member', name_ar: 'عضو متقاعد', description_en: 'Retired university staff', description_ar: 'موظف متقاعد' },
        { code: 'DEPENDENT', name_en: 'Family Dependent', name_ar: 'تابع عائلي', description_en: 'Family member (spouse / child)', description_ar: 'فرد من العائلة' },
        { code: 'FOREIGNER', name_en: 'Foreigner', name_ar: 'أجنبي', description_en: 'Non-Egyptian member', description_ar: 'عضو أجنبي' },
        { code: 'SEASONAL', name_en: 'Seasonal Member', name_ar: 'عضو موسمي', description_en: 'Short-term seasonal access', description_ar: 'اشتراك موسمي قصير' },
        { code: 'VISITOR', name_en: 'Visitor', name_ar: 'زائر', description_en: 'Day-pass visitor', description_ar: 'زائر يومي' },
    ]);
    const mt = (code) => memberTypes.find((x) => x.code === code);
    const staffTypeRepo = data_source_1.AppDataSource.getRepository(StaffType_1.StaffType);
    const staffTypes = await staffTypeRepo.save([
        { code: 'ADMIN', name_en: 'Administrator', name_ar: 'مدير النظام', description_en: 'Full admin access', description_ar: 'صلاحيات كاملة' },
        { code: 'SPORT_MANAGER', name_en: 'Sports Manager', name_ar: 'مدير النشاط الرياضي', description_en: 'Manages sports and teams', description_ar: 'إدارة الرياضات والفرق' },
        { code: 'SPORT_SPECIALIST', name_en: 'Sports Specialist', name_ar: 'أخصائي رياضي', description_en: 'Sport-level specialist', description_ar: 'متخصص رياضي' },
        { code: 'FINANCIAL_DIRECTOR', name_en: 'Financial Director', name_ar: 'مدير الشؤون المالية', description_en: 'Financial oversight', description_ar: 'إدارة الشؤون المالية' },
        { code: 'REGISTRATION_STAFF', name_en: 'Registration Staff', name_ar: 'موظف تسجيل', description_en: 'Member registration & approval', description_ar: 'تسجيل وقبول الأعضاء' },
        { code: 'TEAM_MANAGER', name_en: 'Team Manager', name_ar: 'مدير الفريق', description_en: 'Manages a sport team', description_ar: 'إدارة فريق رياضي' },
        { code: 'SUPPORT', name_en: 'Support Staff', name_ar: 'موظف دعم', description_en: 'Customer support', description_ar: 'دعم العملاء' },
        { code: 'AUDITOR', name_en: 'Auditor', name_ar: 'مدقق', description_en: 'Read-only audit access', description_ar: 'صلاحيات مراجعة فقط' },
        { code: 'MEDIA', name_en: 'Media Officer', name_ar: 'مسؤول الإعلام', description_en: 'Manages media posts and announcements', description_ar: 'إدارة المحتوى الإعلامي' },
        { code: 'SECURITY', name_en: 'Security Officer', name_ar: 'مسؤول الأمن', description_en: 'Security dashboard & access control', description_ar: 'لوحة الأمن ومراقبة الدخول' },
    ]);
    const st = (code) => staffTypes.find((x) => x.code === code);
    const facultyRepo = data_source_1.AppDataSource.getRepository(Faculty_1.Faculty);
    const faculties = await facultyRepo.save([
        { code: 'ENG', name_en: 'Engineering', name_ar: 'الهندسة' },
        { code: 'MED', name_en: 'Medicine', name_ar: 'الطب' },
        { code: 'COM', name_en: 'Commerce', name_ar: 'التجارة' },
        { code: 'LAW', name_en: 'Law', name_ar: 'الحقوق' },
        { code: 'ART', name_en: 'Arts', name_ar: 'الآداب' },
        { code: 'SCI', name_en: 'Science', name_ar: 'العلوم' },
        { code: 'CIS', name_en: 'Computers & Information', name_ar: 'الحاسبات والمعلومات' },
        { code: 'PHE', name_en: 'Physical Education', name_ar: 'التربية الرياضية' },
        { code: 'PHA', name_en: 'Pharmacy', name_ar: 'الصيدلة' },
        { code: 'EDU', name_en: 'Education', name_ar: 'التربية' },
        { code: 'AGR', name_en: 'Agriculture', name_ar: 'الزراعة' },
        { code: 'DEN', name_en: 'Dentistry', name_ar: 'طب الأسنان' },
    ]);
    const professionRepo = data_source_1.AppDataSource.getRepository(Profession_1.Profession);
    const professions = await professionRepo.save([
        { code: 'PROF', name_en: 'Professor', name_ar: 'أستاذ' },
        { code: 'AST_PROF', name_en: 'Associate Professor', name_ar: 'أستاذ مساعد' },
        { code: 'LECT', name_en: 'Lecturer', name_ar: 'مدرس' },
        { code: 'TA', name_en: 'Teaching Assistant', name_ar: 'معيد' },
        { code: 'ADMIN_STAFF', name_en: 'Administrative Staff', name_ar: 'موظف إداري' },
        { code: 'ACCT', name_en: 'Accountant', name_ar: 'محاسب' },
        { code: 'ENG_W', name_en: 'Engineer', name_ar: 'مهندس' },
        { code: 'DOC', name_en: 'Doctor', name_ar: 'طبيب' },
        { code: 'TECH', name_en: 'Technician', name_ar: 'فني' },
        { code: 'SEC', name_en: 'Security', name_ar: 'أمن' },
    ]);
    const planRepo = data_source_1.AppDataSource.getRepository(MembershipPlan_1.MembershipPlan);
    // Official prices from "شروط وأسعار العضويات - رؤية الاستدامة 2030"
    // VAT 14% is NOT included in these prices.
    const plans = await planRepo.save([
        // Working — Faculty members
        { member_type_id: mt('WORKING').id, plan_code: 'WRK-FAC', name_en: 'Faculty Member', name_ar: 'عضوية هيئة التدريس', price: 20000, currency: 'EGP', duration_months: 12, renewal_price: 300, is_installable: true, max_installments: 4, is_active: true },
        // Working — Salary brackets (employees, TAs, demonstrators)
        { member_type_id: mt('WORKING').id, plan_code: 'WRK-S1', name_en: 'Employee Salary < 5000', name_ar: 'موظف — راتب أقل من 5000 ج', price: 2000, currency: 'EGP', duration_months: 12, renewal_price: 300, is_installable: true, max_installments: 4, is_active: true },
        { member_type_id: mt('WORKING').id, plan_code: 'WRK-S2', name_en: 'Employee Salary 5000-8000', name_ar: 'موظف — راتب من 5000 حتى 8000 ج', price: 5000, currency: 'EGP', duration_months: 12, renewal_price: 300, is_installable: true, max_installments: 4, is_active: true },
        { member_type_id: mt('WORKING').id, plan_code: 'WRK-S3', name_en: 'Employee Salary 8000-10000', name_ar: 'موظف — راتب من 8000 حتى 10000 ج', price: 8000, currency: 'EGP', duration_months: 12, renewal_price: 300, is_installable: true, max_installments: 4, is_active: true },
        { member_type_id: mt('WORKING').id, plan_code: 'WRK-S4', name_en: 'Employee Salary 10000+', name_ar: 'موظف — راتب 10000 ج فأكثر', price: 10000, currency: 'EGP', duration_months: 12, renewal_price: 300, is_installable: true, max_installments: 4, is_active: true },
        // Student / sports talent
        { member_type_id: mt('STUDENT').id, plan_code: 'STU-Y', name_en: 'Student / Sports Member', name_ar: 'عضوية الطالب أو الرياضي المتميز', price: 1000, currency: 'EGP', duration_months: 12, renewal_price: 1000, is_installable: true, max_installments: 2, is_active: true },
        // Dependent
        { member_type_id: mt('DEPENDENT').id, plan_code: 'DEP-Y', name_en: 'Dependent Member', name_ar: 'عضوية التابع', price: 2000, currency: 'EGP', duration_months: 12, renewal_price: 2000, is_installable: true, max_installments: 2, is_active: true },
        // Visitor
        { member_type_id: mt('VISITOR').id, plan_code: 'VIS-Y', name_en: 'Visitor Member', name_ar: 'عضوية زائر', price: 5000, currency: 'EGP', duration_months: 12, renewal_price: 5000, is_installable: true, max_installments: 2, is_active: true },
        // Seasonal Egyptian
        { member_type_id: mt('SEASONAL').id, plan_code: 'SEAS-6', name_en: 'Seasonal 6 Months', name_ar: 'عضوية موسمية — 6 أشهر', price: 2000, currency: 'EGP', duration_months: 6, renewal_price: 2000, is_installable: false, is_active: true },
        // Foreigner
        { member_type_id: mt('FOREIGNER').id, plan_code: 'FOR-Y-USD', name_en: 'Foreigner Annual', name_ar: 'عضوية موسمية للأجانب — سنة', price: 100, currency: 'USD', duration_months: 12, renewal_price: 100, is_installable: false, is_active: true, is_for_foreigner: true },
        { member_type_id: mt('FOREIGNER').id, plan_code: 'FOR-H-USD', name_en: 'Foreigner 6 Months', name_ar: 'عضوية موسمية للأجانب — 6 أشهر', price: 50, currency: 'USD', duration_months: 6, renewal_price: 50, is_installable: false, is_active: true, is_for_foreigner: true },
        { member_type_id: mt('FOREIGNER').id, plan_code: 'FOR-M-USD', name_en: 'Foreigner Monthly', name_ar: 'عضوية موسمية للأجانب — شهر', price: 10, currency: 'USD', duration_months: 1, renewal_price: 10, is_installable: false, is_active: true, is_for_foreigner: true },
    ]);
    const plan = (code) => plans.find((p) => p.plan_code === code);
    // Privileges & packages (lightweight)
    const privilegeRepo = data_source_1.AppDataSource.getRepository(Privilege_1.Privilege);
    const privileges = await privilegeRepo.save([
        { code: 'MEMBERS_VIEW', name_en: 'View Members', name_ar: 'عرض الأعضاء', category: 'Members', is_active: true },
        { code: 'MEMBERS_EDIT', name_en: 'Edit Members', name_ar: 'تعديل الأعضاء', category: 'Members', is_active: true },
        { code: 'MEMBERS_APPROVE', name_en: 'Approve Members', name_ar: 'اعتماد الأعضاء', category: 'Members', is_active: true },
        { code: 'SPORTS_MANAGE', name_en: 'Manage Sports', name_ar: 'إدارة الرياضات', category: 'Sports', is_active: true },
        { code: 'TEAMS_MANAGE', name_en: 'Manage Teams', name_ar: 'إدارة الفرق', category: 'Sports', is_active: true },
        { code: 'BOOKINGS_VIEW', name_en: 'View Bookings', name_ar: 'عرض الحجوزات', category: 'Bookings', is_active: true },
        { code: 'BOOKINGS_MANAGE', name_en: 'Manage Bookings', name_ar: 'إدارة الحجوزات', category: 'Bookings', is_active: true },
        { code: 'PAYMENTS_VIEW', name_en: 'View Payments', name_ar: 'عرض المدفوعات', category: 'Finance', is_active: true },
        { code: 'PAYMENTS_APPROVE', name_en: 'Approve Payments', name_ar: 'اعتماد المدفوعات', category: 'Finance', is_active: true },
        { code: 'AUDIT_VIEW', name_en: 'View Audit Logs', name_ar: 'عرض سجلات التدقيق', category: 'System', is_active: true },
        { code: 'MEDIA_MANAGE', name_en: 'Manage Media', name_ar: 'إدارة المحتوى الإعلامي', category: 'Media', is_active: true },
    ]);
    const packageRepo = data_source_1.AppDataSource.getRepository(PrivilegePackage_1.PrivilegePackage);
    await packageRepo.save([
        { code: 'PKG_ADMIN', name_en: 'Admin Full Access', name_ar: 'حزمة المدير', is_active: true },
        { code: 'PKG_SPORTS', name_en: 'Sports Management', name_ar: 'حزمة الرياضات', is_active: true },
        { code: 'PKG_FINANCE', name_en: 'Finance Management', name_ar: 'حزمة الشؤون المالية', is_active: true },
        { code: 'PKG_REG', name_en: 'Registration', name_ar: 'حزمة التسجيل', is_active: true },
        { code: 'PKG_MEDIA', name_en: 'Media', name_ar: 'حزمة الإعلام', is_active: true },
    ]);
    // ═══════════════════════════ BRANCHES ═══════════════════════════
    console.log('\n=== Seeding branches ===');
    const branchRepo = data_source_1.AppDataSource.getRepository(Branch_1.Branch);
    const branches = await branchRepo.save([
        { code: 'MAIN', name_en: 'Main Branch - Capital University', name_ar: 'الفرع الرئيسي - جامعة العاصمة', location_en: 'Capital University Campus, New Capital', location_ar: 'حرم جامعة العاصمة، العاصمة الإدارية', phone: '02-29991111', status: 'active' },
        { code: 'HARAM', name_en: 'Haram Branch - Faculty of Sports Science (Boys)', name_ar: 'فرع الهرم - كلية علوم الرياضة للبنين', location_en: 'Faculty of Sports Science for Boys, Haram, Giza', location_ar: 'كلية علوم الرياضة للبنين، الهرم، الجيزة', phone: '02-33881111', status: 'active' },
        { code: 'ZAMALEK', name_en: 'Zamalek Branch - Faculty of Sports Science (Girls)', name_ar: 'فرع الزمالك - كلية علوم الرياضة للبنات', location_en: 'Faculty of Sports Science for Girls, Zamalek, Cairo', location_ar: 'كلية علوم الرياضة للبنات، الزمالك، القاهرة', phone: '02-27351111', status: 'active' },
        { code: 'MATARIA', name_en: 'Mataria Branch - Faculty of Engineering', name_ar: 'فرع المطرية - كلية الهندسة', location_en: 'Faculty of Engineering, Mataria, Cairo', location_ar: 'كلية الهندسة، المطرية، القاهرة', phone: '02-26211111', status: 'active' },
    ]);
    // ═══════════════════════════ STAFF (need ADMIN first to create sports) ═══════════════════════════
    console.log('\n=== Seeding staff accounts ===');
    const accountRepo = data_source_1.AppDataSource.getRepository(Account_1.Account);
    const staffRepo = data_source_1.AppDataSource.getRepository(Staff_1.Staff);
    const staffSeed = [
        { email: 'admin@club.local', code: 'ADMIN', first_en: 'Amr', last_en: 'El Sayed', first_ar: 'عمرو', last_ar: 'السيد', nid: '29001011234001', phone: '01001110001', role: 'admin' },
        { email: 'sport.manager@club.local', code: 'SPORT_MANAGER', first_en: 'Mohamed', last_en: 'Saad', first_ar: 'محمد', last_ar: 'سعد', nid: '28503044322002', phone: '01001110002', role: 'staff' },
        { email: 'sport.specialist@club.local', code: 'SPORT_SPECIALIST', first_en: 'Khaled', last_en: 'Naguib', first_ar: 'خالد', last_ar: 'نجيب', nid: '29007054411003', phone: '01001110003', role: 'staff' },
        { email: 'finance.director@club.local', code: 'FINANCIAL_DIRECTOR', first_en: 'Sara', last_en: 'Mostafa', first_ar: 'سارة', last_ar: 'مصطفى', nid: '28602025566004', phone: '01001110004', role: 'staff' },
        { email: 'registration@club.local', code: 'REGISTRATION_STAFF', first_en: 'Mona', last_en: 'Ibrahim', first_ar: 'منى', last_ar: 'إبراهيم', nid: '29104077788005', phone: '01001110005', role: 'staff' },
        { email: 'team.manager@club.local', code: 'TEAM_MANAGER', first_en: 'Tarek', last_en: 'El-Sayed', first_ar: 'طارق', last_ar: 'السيد', nid: '28709044455006', phone: '01001110006', role: 'staff' },
        { email: 'support@club.local', code: 'SUPPORT', first_en: 'Heba', last_en: 'Adel', first_ar: 'هبة', last_ar: 'عادل', nid: '29002088899007', phone: '01001110007', role: 'staff' },
        { email: 'auditor@club.local', code: 'AUDITOR', first_en: 'Hossam', last_en: 'Fathy', first_ar: 'حسام', last_ar: 'فتحي', nid: '28412033322008', phone: '01001110008', role: 'staff' },
        { email: 'media@club.local', code: 'MEDIA', first_en: 'Nour', last_en: 'Kamal', first_ar: 'نور', last_ar: 'كمال', nid: '29306016677009', phone: '01001110009', role: 'staff' },
        { email: 'security@club.local', code: 'SECURITY', first_en: 'Yasser', last_en: 'Galal', first_ar: 'ياسر', last_ar: 'جلال', nid: '28508099911010', phone: '01001110010', role: 'staff' },
    ];
    const staffById = new Map();
    for (const s of staffSeed) {
        const acc = await accountRepo.save({
            email: s.email, password: passwordHash, role: s.role, status: 'active', is_active: true, last_login: daysAgo(Math.floor(Math.random() * 7)),
        });
        const staff = await staffRepo.save({
            account_id: acc.id, staff_type_id: st(s.code).id,
            first_name_en: s.first_en, last_name_en: s.last_en, first_name_ar: s.first_ar, last_name_ar: s.last_ar,
            national_id: s.nid, phone: s.phone, address: 'القاهرة، مصر',
            employment_start_date: daysAgo(800 + Math.floor(Math.random() * 1000)),
            status: 'active', is_active: true,
        });
        staffById.set(s.code, staff);
        console.log(`  staff: ${s.email} (${s.code})`);
    }
    const adminStaff = staffById.get('ADMIN');
    const sportManager = staffById.get('SPORT_MANAGER');
    // ═══════════════════════════ SPORTS ═══════════════════════════
    console.log('\n=== Seeding sports ===');
    const sportRepo = data_source_1.AppDataSource.getRepository(Sport_1.Sport);
    const sportData = [
        { en: 'Football', ar: 'كرة القدم', price: 150, status: 'active' },
        { en: 'Basketball', ar: 'كرة السلة', price: 120, status: 'active' },
        { en: 'Volleyball', ar: 'الكرة الطائرة', price: 100, status: 'active' },
        { en: 'Tennis', ar: 'التنس', price: 200, status: 'active' },
        { en: 'Swimming', ar: 'السباحة', price: 180, status: 'active' },
        { en: 'Judo', ar: 'الجودو', price: 130, status: 'active' },
        { en: 'Karate', ar: 'الكاراتيه', price: 130, status: 'active' },
        { en: 'Squash', ar: 'الإسكواش', price: 160, status: 'active' },
        { en: 'Snooker', ar: 'السنوكر', price: 80, status: 'active' },
        { en: 'Chess', ar: 'الشطرنج', price: 50, status: 'active' },
        { en: 'Athletics', ar: 'ألعاب القوى', price: 90, status: 'pending' },
        { en: 'Yoga', ar: 'اليوجا', price: 110, status: 'inactive' },
    ];
    const sports = await sportRepo.save(sportData.map((s) => ({
        name_en: s.en, name_ar: s.ar,
        description_en: `${s.en} sport for all members`,
        description_ar: `رياضة ${s.ar} لجميع الأعضاء`,
        price: s.price, status: s.status,
        created_by_staff_id: sportManager.id,
        approved_by_staff_id: s.status === 'active' ? adminStaff.id : null,
        approved_at: s.status === 'active' ? daysAgo(30) : null,
        max_participants: 50, is_active: s.status === 'active',
    })));
    // BranchSport links — every active sport in main 3 branches
    console.log('\n=== Linking sports to branches ===');
    const branchSportRepo = data_source_1.AppDataSource.getRepository(BranchSport_1.BranchSport);
    const branchSportRecords = [];
    for (const branch of branches.slice(0, 3)) {
        for (const sport of sports.filter((s) => s.status === 'active')) {
            branchSportRecords.push({ branch_id: branch.id, sport_id: sport.id, status: 'active' });
        }
    }
    await branchSportRepo.save(branchSportRecords);
    // ═══════════════════════════ FIELDS ═══════════════════════════
    console.log('\n=== Seeding fields ===');
    const fieldRepo = data_source_1.AppDataSource.getRepository(Field_1.Field);
    const fieldOhRepo = data_source_1.AppDataSource.getRepository(FieldOperatingHours_1.FieldOperatingHours);
    const fields = [];
    for (const branch of branches.slice(0, 3)) {
        for (const sport of sports.filter((s) => s.status === 'active').slice(0, 6)) {
            const f = await fieldRepo.save({
                name_en: `${sport.name_en} Court - ${branch.code}`,
                name_ar: `ملعب ${sport.name_ar} - ${branch.name_ar}`,
                description_en: `Standard ${sport.name_en} field at ${branch.name_en}`,
                description_ar: `ملعب ${sport.name_ar} بالـ${branch.name_ar}`,
                sport_id: sport.id,
                branch_id: branch.id,
                capacity: 20,
                hourly_rate: 100 + Math.floor(Math.random() * 200),
            });
            fields.push(f);
            // operating hours: every day 8am-10pm
            for (let day = 0; day < 7; day++) {
                await fieldOhRepo.save({
                    field_id: f.id, day_of_week: day, opening_time: '08:00:00', closing_time: '22:00:00',
                });
            }
        }
    }
    // ═══════════════════════════ TEAMS ═══════════════════════════
    console.log('\n=== Seeding teams + training schedules ===');
    const teamRepo = data_source_1.AppDataSource.getRepository(Team_1.Team);
    const schedRepo = data_source_1.AppDataSource.getRepository(TeamTrainingSchedule_1.TeamTrainingSchedule);
    const teams = [];
    for (const sport of sports.filter((s) => s.status === 'active').slice(0, 8)) {
        for (const branch of branches.slice(0, 2)) {
            const field = fields.find((f) => f.sport_id === sport.id && f.branch_id === branch.id);
            const team = await teamRepo.save({
                sport_id: sport.id,
                branch_id: branch.id,
                field_id: field?.id ?? null,
                name_en: `${sport.name_en} Team - ${branch.code}`,
                name_ar: `فريق ${sport.name_ar} - ${branch.name_ar}`,
                max_participants: 25,
                status: 'active',
                visibility_type: 'BOTH',
            });
            teams.push(team);
            await schedRepo.save({
                team_id: team.id,
                sport_id: sport.id,
                field_id: field?.id ?? null,
                days_en: 'Sunday, Tuesday, Thursday',
                days_ar: 'الأحد، الثلاثاء، الخميس',
                start_time: '18:00:00',
                end_time: '20:00:00',
            });
        }
    }
    // ═══════════════════════════ MEMBERS ═══════════════════════════
    console.log('\n=== Seeding members ===');
    const memberRepo = data_source_1.AppDataSource.getRepository(Member_1.Member);
    const uniRepo = data_source_1.AppDataSource.getRepository(UniversityStudentDetail_1.UniversityStudentDetail);
    const empRepo = data_source_1.AppDataSource.getRepository(EmployeeDetail_1.EmployeeDetail);
    const retRepo = data_source_1.AppDataSource.getRepository(RetiredEmployeeDetail_1.RetiredEmployeeDetail);
    const outRepo = data_source_1.AppDataSource.getRepository(OutsiderDetail_1.OutsiderDetail);
    const memberMembershipRepo = data_source_1.AppDataSource.getRepository(MemberMembership_1.MemberMembership);
    let nidCounter = 30000000000001;
    let phoneCounter = 1100000001;
    const nextNid = () => String(nidCounter++);
    const nextPhone = () => '010' + String(phoneCounter++).slice(-8);
    const allMembers = [];
    const createMember = async (opts) => {
        const acc = await accountRepo.save({
            email: opts.email, password: passwordHash, role: 'member',
            status: opts.statusAccount, is_active: opts.statusAccount === 'active',
            last_login: opts.statusAccount === 'active' ? daysAgo(Math.floor(Math.random() * 30)) : null,
        });
        const birthYear = opts.typeCode === 'STUDENT' ? 2000 + Math.floor(Math.random() * 6)
            : opts.typeCode === 'RETIRED' ? 1955 + Math.floor(Math.random() * 8)
                : 1980 + Math.floor(Math.random() * 20);
        const m = await memberRepo.save({
            account_id: acc.id,
            first_name_en: opts.firstEn, first_name_ar: opts.firstAr,
            last_name_en: opts.lastEn, last_name_ar: opts.lastAr,
            gender: opts.gender,
            phone: nextPhone(),
            nationality: opts.nationality ?? (opts.foreign ? 'Foreign' : 'Egyptian'),
            birthdate: new Date(`${birthYear}-06-15`),
            national_id: nextNid(),
            is_foreign: !!opts.foreign,
            address: 'القاهرة، مصر',
            member_type_id: mt(opts.typeCode).id,
            status: opts.statusMember,
            points_balance: Math.floor(Math.random() * 500),
        });
        allMembers.push(m);
        return m;
    };
    // Students (10) — varied statuses
    const studentNames = [
        ['Omar', 'عمر', 'Adel', 'عادل'], ['Yousef', 'يوسف', 'Naser', 'ناصر'], ['Karim', 'كريم', 'Salah', 'صلاح'],
        ['Aly', 'علي', 'Ibrahim', 'إبراهيم'], ['Mahmoud', 'محمود', 'Refaat', 'رفعت'],
        ['Maryam', 'مريم', 'Hossam', 'حسام'], ['Nour', 'نور', 'Adly', 'عدلي'],
        ['Salma', 'سلمى', 'Magdy', 'مجدي'], ['Reem', 'ريم', 'Ashraf', 'أشرف'], ['Habiba', 'حبيبة', 'Tarek', 'طارق'],
    ];
    for (let i = 0; i < studentNames.length; i++) {
        const [fEn, fAr, lEn, lAr] = studentNames[i];
        const statuses = ['active', 'active', 'active', 'active', 'active', 'active', 'suspended', 'expired', 'pending', 'active'];
        const accStatuses = ['active', 'active', 'active', 'active', 'active', 'active', 'suspended', 'active', 'pending', 'active'];
        const m = await createMember({
            email: `student${i + 1}@uni.local`,
            statusAccount: accStatuses[i],
            statusMember: statuses[i],
            firstEn: fEn, lastEn: lEn, firstAr: fAr, lastAr: lAr,
            typeCode: 'STUDENT',
            gender: i < 5 ? 'male' : 'female',
        });
        await uniRepo.save({
            member_id: m.id,
            faculty_id: faculties[i % faculties.length].id,
            graduation_year: 2026 + Math.floor(Math.random() * 3),
            enrollment_date: daysAgo(400 + Math.floor(Math.random() * 800)),
        });
    }
    // Working employees (8)
    const workingNames = [
        ['Hassan', 'حسن', 'Fawzy', 'فوزي'], ['Ali', 'علي', 'Saber', 'صابر'],
        ['Mohamed', 'محمد', 'Galal', 'جلال'], ['Ibrahim', 'إبراهيم', 'Anwar', 'أنور'],
        ['Dina', 'دينا', 'Hosny', 'حسني'], ['Rania', 'رانيا', 'Magdy', 'مجدي'],
        ['Yasmine', 'ياسمين', 'Khalil', 'خليل'], ['Amani', 'أماني', 'Helmy', 'حلمي'],
    ];
    for (let i = 0; i < workingNames.length; i++) {
        const [fEn, fAr, lEn, lAr] = workingNames[i];
        const statuses = ['active', 'active', 'active', 'active', 'active', 'suspended', 'active', 'expired'];
        const m = await createMember({
            email: `working${i + 1}@uni.local`, statusAccount: statuses[i] === 'suspended' ? 'suspended' : 'active', statusMember: statuses[i],
            firstEn: fEn, lastEn: lEn, firstAr: fAr, lastAr: lAr,
            typeCode: 'WORKING', gender: i < 4 ? 'male' : 'female',
        });
        await empRepo.save({
            member_id: m.id,
            profession_id: pick(professions).id,
            department_en: 'Administration', department_ar: 'الإدارة',
            salary: 8000 + Math.floor(Math.random() * 12000),
            employment_start_date: daysAgo(1000 + Math.floor(Math.random() * 3000)),
        });
    }
    // Retired (6)
    const retiredNames = [
        ['Mostafa', 'مصطفى', 'El-Said', 'السعيد'], ['Adel', 'عادل', 'El-Banna', 'البنا'],
        ['Galal', 'جلال', 'Rashed', 'راشد'], ['Fawzia', 'فوزية', 'Sherif', 'شريف'],
        ['Samia', 'سامية', 'Younis', 'يونس'], ['Hoda', 'هدى', 'Selim', 'سليم'],
    ];
    for (let i = 0; i < retiredNames.length; i++) {
        const [fEn, fAr, lEn, lAr] = retiredNames[i];
        const m = await createMember({
            email: `retired${i + 1}@uni.local`, statusAccount: 'active', statusMember: 'active',
            firstEn: fEn, lastEn: lEn, firstAr: fAr, lastAr: lAr,
            typeCode: 'RETIRED', gender: i < 3 ? 'male' : 'female',
        });
        await retRepo.save({
            member_id: m.id,
            profession_code: ['RETIRED_PROF', 'RETIRED_TA', 'RETIRED_AL', 'RETIRED_STAFF'][i % 4],
            former_department_en: 'Engineering', former_department_ar: 'الهندسة',
            retirement_date: daysAgo(300 + Math.floor(Math.random() * 2000)),
            last_salary: 12000 + Math.floor(Math.random() * 8000),
        });
    }
    // Foreigners (4)
    const foreignerNames = [
        ['John', 'جون', 'Smith', 'سميث', 'American', 'USA'],
        ['Maria', 'ماريا', 'Garcia', 'جارسيا', 'Spanish', 'Spain'],
        ['Hans', 'هانز', 'Mueller', 'مولر', 'German', 'Germany'],
        ['Aiko', 'أيكو', 'Tanaka', 'تاناكا', 'Japanese', 'Japan'],
    ];
    for (let i = 0; i < foreignerNames.length; i++) {
        const [fEn, fAr, lEn, lAr, nat, country] = foreignerNames[i];
        const m = await createMember({
            email: `foreigner${i + 1}@uni.local`, statusAccount: 'active', statusMember: 'active',
            firstEn: fEn, lastEn: lEn, firstAr: fAr, lastAr: lAr,
            typeCode: 'FOREIGNER', gender: i % 2 === 0 ? 'male' : 'female',
            foreign: true, nationality: nat,
        });
        await outRepo.save({
            member_id: m.id,
            job_title_en: 'Researcher', job_title_ar: 'باحث',
            employment_status: 'employed',
            visitor_type: 'visitor',
            passport_number: `P${1000000 + i}`,
            country,
            visa_status: i === 3 ? 'expired' : 'valid',
        });
    }
    // Seasonal (4)
    for (let i = 0; i < 4; i++) {
        const m = await createMember({
            email: `seasonal${i + 1}@uni.local`, statusAccount: 'active', statusMember: i === 3 ? 'expired' : 'active',
            firstEn: `Seasonal${i + 1}`, lastEn: 'Member', firstAr: 'موسمي', lastAr: `عضو ${i + 1}`,
            typeCode: 'SEASONAL', gender: i % 2 === 0 ? 'male' : 'female',
        });
        await outRepo.save({
            member_id: m.id, employment_status: 'employed',
            visitor_type: i % 2 === 0 ? 'seasonal-egy' : 'seasonal-foreigner',
            duration_months: [3, 6, 12, 6][i],
            is_installable: i === 2,
        });
    }
    // Dependents (6) — linked to working members
    const workingMembers = allMembers.filter((m) => m.is_foreign === false).slice(10, 18); // 8 working
    const relRepo = data_source_1.AppDataSource.getRepository(MemberRelationship_1.MemberRelationship);
    for (let i = 0; i < 6; i++) {
        const parent = workingMembers[i % workingMembers.length];
        const dep = await createMember({
            email: `dependent${i + 1}@uni.local`, statusAccount: 'active', statusMember: 'active',
            firstEn: ['Sara', 'Lina', 'Yara', 'Amr', 'Hady', 'Karim'][i],
            firstAr: ['سارة', 'لينا', 'يارا', 'عمرو', 'هادي', 'كريم'][i],
            lastEn: parent.last_name_en, lastAr: parent.last_name_ar,
            typeCode: 'DEPENDENT', gender: i < 3 ? 'female' : 'male',
        });
        await relRepo.save({
            member_id: parent.id, related_member_id: dep.id,
            relationship_type: i % 2 === 0 ? 'child' : 'spouse',
            relationship_name_ar: i % 2 === 0 ? 'ابن/ابنة' : 'الزوج/الزوجة',
            is_dependent: true, age_group: i < 3 ? 'child' : 'adult',
        });
    }
    // Memberships — one active per member where status allows
    console.log('\n=== Creating memberships ===');
    for (const m of allMembers) {
        const memberType = memberTypes.find((t) => t.id === m.member_type_id);
        const planForType = plans.find((p) => p.member_type_id === memberType.id);
        if (!planForType)
            continue;
        if (m.status === 'expired') {
            await memberMembershipRepo.save({
                member_id: m.id, membership_plan_id: planForType.id,
                start_date: daysAgo(400), end_date: daysAgo(30),
                status: 'expired', payment_status: 'paid',
            });
        }
        else if (m.status === 'suspended') {
            await memberMembershipRepo.save({
                member_id: m.id, membership_plan_id: planForType.id,
                start_date: daysAgo(100), end_date: daysFromNow(200),
                status: 'suspended', payment_status: 'paid',
            });
        }
        else if (m.status === 'active') {
            await memberMembershipRepo.save({
                member_id: m.id, membership_plan_id: planForType.id,
                start_date: daysAgo(60), end_date: daysFromNow(305),
                status: 'active', payment_status: 'paid',
            });
        }
        else if (m.status === 'pending') {
            await memberMembershipRepo.save({
                member_id: m.id, membership_plan_id: planForType.id,
                start_date: new Date(), end_date: daysFromNow(365),
                status: 'active', payment_status: 'pending',
            });
        }
    }
    // ═══════════════════════════ TEAM MEMBERS (players/coaches) ═══════════════════════════
    console.log('\n=== Seeding team_members (players & coaches) ===');
    const tmRepo = data_source_1.AppDataSource.getRepository(TeamMember_1.TeamMember);
    const teamMemberNames = [
        ['Player', 'Ahmed', 'أحمد', 'Goalie', 'الحارس'], ['Player', 'Mohamed', 'محمد', 'Striker', 'المهاجم'],
        ['Player', 'Hossam', 'حسام', 'Defender', 'المدافع'], ['Player', 'Karim', 'كريم', 'Mid', 'الوسط'],
        ['Coach', 'Ramzy', 'رمزي', 'Coach', 'المدرب'], ['Coach', 'Hany', 'هاني', 'Coach', 'المدرب'],
        ['Player', 'Mariam', 'مريم', 'Wing', 'الجناح'], ['Player', 'Salma', 'سلمى', 'Captain', 'القائد'],
    ];
    for (let i = 0; i < teamMemberNames.length; i++) {
        const [role, fEn, fAr, lEn, lAr] = teamMemberNames[i];
        const acc = await accountRepo.save({
            email: `${role.toLowerCase()}${i + 1}@team.local`, password: passwordHash,
            role: role === 'Coach' ? 'team_manager' : 'team_member',
            status: 'active', is_active: true,
        });
        await tmRepo.save({
            account_id: acc.id,
            first_name_en: fEn, first_name_ar: fAr, last_name_en: lEn, last_name_ar: lAr,
            gender: i < 6 ? 'male' : 'female',
            phone: nextPhone(),
            nationality: 'Egyptian',
            birthdate: new Date('1995-01-01'),
            national_id: nextNid(),
            member_type_id: mt('WORKING').id,
            status: 'active',
        });
    }
    // ═══════════════════════════ BOOKINGS + PAYMENTS ═══════════════════════════
    console.log('\n=== Seeding bookings + payments ===');
    const bookingRepo = data_source_1.AppDataSource.getRepository(Booking_1.Booking);
    const paymentRepo = data_source_1.AppDataSource.getRepository(Payment_1.Payment);
    const activeMembers = allMembers.filter((m) => m.status === 'active').slice(0, 15);
    for (let i = 0; i < 30; i++) {
        const member = pick(activeMembers);
        const field = pick(fields);
        const start = new Date();
        start.setDate(start.getDate() + (i < 15 ? -i : i - 14));
        start.setHours(10 + (i % 10), 0, 0, 0);
        const end = new Date(start);
        end.setHours(start.getHours() + 1);
        const statusPool = ['confirmed', 'completed', 'pending_payment', 'cancelled'];
        const status = i < 14 ? (i < 7 ? 'completed' : 'confirmed')
            : statusPool[i % statusPool.length];
        const price = 100 + (i * 10) % 200;
        await bookingRepo.save({
            member_id: member.id,
            sport_id: field.sport_id,
            field_id: field.id,
            start_time: start,
            end_time: end,
            duration_minutes: 60,
            price,
            status,
            payment_reference: status !== 'pending_payment' && status !== 'cancelled' ? `BK-${(0, crypto_1.randomBytes)(4).toString('hex')}` : null,
            payment_completed_at: status === 'completed' || status === 'confirmed' ? daysAgo(i) : null,
            share_token: (0, crypto_1.randomBytes)(16).toString('hex'),
            expected_participants: 1 + (i % 3),
            language: 'ar',
            cancelled_at: status === 'cancelled' ? daysAgo(i - 1) : null,
            completed_at: status === 'completed' ? end : null,
        });
    }
    // Payments — various states
    console.log('\n=== Seeding payments ===');
    const paymentStatuses = [
        { status: 'completed', count: 30, method: 'credit_card', type: 'field_booking' },
        { status: 'completed', count: 8, method: 'cash', type: 'membership_fee' },
        { status: 'pending', count: 5, method: 'bank_transfer', type: 'team_subscription' },
        { status: 'failed', count: 4, method: 'credit_card', type: 'field_booking' },
        { status: 'refunded', count: 2, method: 'credit_card', type: 'field_booking' },
        { status: 'processing', count: 3, method: 'wallet', type: 'package_purchase' },
    ];
    let paymentIdx = 0;
    for (const ps of paymentStatuses) {
        for (let i = 0; i < ps.count; i++) {
            paymentIdx++;
            await paymentRepo.save({
                payment_reference: `PAY-${String(paymentIdx).padStart(6, '0')}`,
                transaction_id: ps.status === 'completed' ? `TXN-${(0, crypto_1.randomBytes)(6).toString('hex').toUpperCase()}` : undefined,
                payment_type: ps.type,
                entity_type: 'member',
                entity_id: pick(activeMembers).id,
                amount: 100 + Math.floor(Math.random() * 1500),
                currency: 'EGP',
                payment_method: ps.method,
                status: ps.status,
            });
        }
    }
    // ═══════════════════════════ ANNOUNCEMENTS ═══════════════════════════
    console.log('\n=== Seeding announcements ===');
    const annRepo = data_source_1.AppDataSource.getRepository(Announcement_1.Announcement);
    const activeSports = sports.filter((s) => s.status === 'active');
    const annData = [
        { title_en: 'Football Tournament 2026', title_ar: 'بطولة كرة القدم 2026', status: 'published' },
        { title_en: 'Swimming Open Day', title_ar: 'يوم مفتوح للسباحة', status: 'published' },
        { title_en: 'Tennis Training - New Coach', title_ar: 'تدريب التنس - مدرب جديد', status: 'published' },
        { title_en: 'Basketball League Registration', title_ar: 'تسجيل دوري كرة السلة', status: 'published' },
        { title_en: 'Yoga Sessions - Coming Soon', title_ar: 'جلسات يوجا - قريباً', status: 'scheduled' },
        { title_en: 'Volleyball Tryouts', title_ar: 'اختبارات الكرة الطائرة', status: 'published' },
        { title_en: 'Karate Black Belt Exam', title_ar: 'امتحان الحزام الأسود للكاراتيه', status: 'draft' },
        { title_en: 'Chess Open Championship', title_ar: 'بطولة الشطرنج المفتوحة', status: 'archived' },
    ];
    for (let i = 0; i < annData.length; i++) {
        const d = annData[i];
        const s = activeSports[i % activeSports.length];
        await annRepo.save({
            sport_id: s.id,
            branch_id: i % 2 === 0 ? branches[0].id : null,
            created_by_staff_id: (staffById.get('MEDIA') ?? adminStaff).id,
            title_en: d.title_en, title_ar: d.title_ar,
            description_en: `${d.title_en} — open to all members.`,
            description_ar: `${d.title_ar} — مفتوح لجميع الأعضاء.`,
            status: d.status,
            is_active: d.status === 'published',
            starts_at: daysAgo(i * 2),
            ends_at: daysFromNow(30 - i * 2),
            view_count: Math.floor(Math.random() * 500),
            click_count: Math.floor(Math.random() * 100),
        });
    }
    // ═══════════════════════════ MEDIA POSTS ═══════════════════════════
    console.log('\n=== Seeding media posts ===');
    const mpRepo = data_source_1.AppDataSource.getRepository(MediaPost_1.MediaPost);
    const mediaPostCategories = ['صور', 'فيديو', 'فعاليات'];
    const mediaPostsCount = 6;
    for (let i = 0; i < mediaPostsCount; i++) {
        await mpRepo.save({
            title: i < 3 ? `News Update #${i + 1}` : `خبر جديد #${i + 1}`,
            description: `This is the content of media post number ${i + 1}.`,
            category: mediaPostCategories[i % mediaPostCategories.length],
            images: i < 2 ? [`/uploads/media/image-${i + 1}-1.jpg`, `/uploads/media/image-${i + 1}-2.jpg`] : undefined,
            videoUrl: i === 2 ? 'https://www.youtube.com/embed/example' : undefined,
            videoDuration: i === 2 ? '02:45' : undefined,
            date: daysAgo(i),
        });
    }
    // ═══════════════════════════ TASKS ═══════════════════════════
    console.log('\n=== Seeding tasks ===');
    const taskRepo = data_source_1.AppDataSource.getRepository(Task_1.Task);
    const taskData = [
        { title: 'Review pending member applications', status: 'pending', assignee: 'REGISTRATION_STAFF' },
        { title: 'Approve sport: Athletics', status: 'pending', assignee: 'ADMIN' },
        { title: 'Update sport pricing for Q2', status: 'in_progress', assignee: 'FINANCIAL_DIRECTOR' },
        { title: 'Prepare football tournament schedule', status: 'in_progress', assignee: 'SPORT_MANAGER' },
        { title: 'Complete media gallery for branch 6 October', status: 'completed', assignee: 'MEDIA' },
        { title: 'Audit Q1 financial transactions', status: 'completed', assignee: 'AUDITOR' },
        { title: 'Reset security gate firmware', status: 'pending', assignee: 'SECURITY' },
        { title: 'Renew swimming pool maintenance contract', status: 'overdue', assignee: 'SPORT_MANAGER' },
    ];
    for (const t of taskData) {
        try {
            await taskRepo.save({
                title: t.title,
                description: `Task: ${t.title}`,
                status: t.status,
                assigned_to_staff_id: staffById.get(t.assignee)?.id,
                created_by_staff_id: adminStaff.id,
                due_date: daysFromNow(7 + Math.floor(Math.random() * 14)),
                priority: 'medium',
            });
        }
        catch { /* schema mismatch — skip */ }
    }
    // ═══════════════════════════ AUDIT LOG ═══════════════════════════
    console.log('\n=== Seeding audit logs ===');
    const auditRepo = data_source_1.AppDataSource.getRepository(AuditLog_1.AuditLog);
    const auditEntries = [
        { user: 'Ahmed Hassan', role: 'ADMIN', action: 'Create', module: 'Sports', desc: 'Created sport: Football', status: 'نجح' },
        { user: 'Mohamed Saad', role: 'SPORT_MANAGER', action: 'Update', module: 'Sports', desc: 'Updated price for Tennis', status: 'نجح' },
        { user: 'Sara Mostafa', role: 'FINANCIAL_DIRECTOR', action: 'Approve', module: 'Payments', desc: 'Approved 8 payments totaling 4,500 EGP', status: 'نجح' },
        { user: 'Mona Ibrahim', role: 'REGISTRATION_STAFF', action: 'Approve', module: 'Members', desc: 'Approved member application', status: 'نجح' },
        { user: 'Ahmed Hassan', role: 'ADMIN', action: 'Delete', module: 'Announcements', desc: 'Removed expired announcement', status: 'نجح' },
        { user: 'Khaled Naguib', role: 'SPORT_SPECIALIST', action: 'Create', module: 'Teams', desc: 'Created Senior Basketball team', status: 'نجح' },
        { user: 'Tarek El-Sayed', role: 'TEAM_MANAGER', action: 'Update', module: 'Bookings', desc: 'Rescheduled booking #1234', status: 'نجح' },
        { user: 'Hossam Fathy', role: 'AUDITOR', action: 'View', module: 'Audit', desc: 'Reviewed Q1 audit report', status: 'نجح' },
        { user: 'Yasser Galal', role: 'SECURITY', action: 'Login', module: 'Security', desc: 'Failed login attempt', status: 'فشل' },
        { user: 'Nour Kamal', role: 'MEDIA', action: 'Create', module: 'Media', desc: 'Published 3 photos', status: 'نجح' },
    ];
    for (const e of auditEntries) {
        await auditRepo.save({
            userName: e.user, role: e.role, action: e.action, module: e.module,
            description: e.desc, status: e.status,
            ipAddress: '192.168.1.' + (50 + Math.floor(Math.random() * 200)),
        });
    }
    // Done
    console.log('\n=== Summary ===');
    const counts = await Promise.all([
        accountRepo.count(),
        memberRepo.count(),
        staffRepo.count(),
        sportRepo.count(),
        fieldRepo.count(),
        teamRepo.count(),
        bookingRepo.count(),
        paymentRepo.count(),
        annRepo.count(),
        memberMembershipRepo.count(),
    ]);
    console.log(`  accounts:       ${counts[0]}`);
    console.log(`  members:        ${counts[1]}`);
    console.log(`  staff:          ${counts[2]}`);
    console.log(`  sports:         ${counts[3]}`);
    console.log(`  fields:         ${counts[4]}`);
    console.log(`  teams:          ${counts[5]}`);
    console.log(`  bookings:       ${counts[6]}`);
    console.log(`  payments:       ${counts[7]}`);
    console.log(`  announcements:  ${counts[8]}`);
    console.log(`  memberships:    ${counts[9]}`);
    console.log(`\nAll accounts password: ${DEFAULT_PASSWORD}`);
    console.log('Admin email: admin@club.local');
    await data_source_1.AppDataSource.destroy();
    process.exit(0);
}
main().catch((err) => {
    console.error('\nSeed failed:', err);
    process.exit(1);
});
//# sourceMappingURL=full-reseed.js.map