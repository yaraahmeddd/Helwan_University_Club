/**
 * System Privileges Constants
 *
 * This file contains all privileges defined in the system.
 * Privileges are used for fine-grained access control at the API and frontend levels.
 *
 * Format: PRIVILEGE_CODE: {
 *   code: 'PRIVILEGE_CODE',
 *   name_en: 'English Name',
 *   name_ar: 'Arabic Name',
 *   description_en: 'English Description',
 *   description_ar: 'Arabic Description',
 *   module: 'Module Category'
 * }
 *
 * Generated: 2026-02-21
 * Last Updated: Based on Backend privilege definitions
 */
export declare const PRIVILEGES: {
    readonly CREATE_TEAM: {
        readonly code: "CREATE_TEAM";
        readonly name_en: "Create Team";
        readonly name_ar: "إنشاء فريق";
        readonly description_en: "Permission to create new teams for sports";
        readonly description_ar: "إذن لإنشاء فرق جديدة للرياضات";
        readonly module: "team_management";
    };
    readonly VIEW_TEAMS: {
        readonly code: "VIEW_TEAMS";
        readonly name_en: "View Teams";
        readonly name_ar: "عرض الفرق";
        readonly description_en: "Permission to view all teams and their details";
        readonly description_ar: "إذن لعرض جميع الفرق وتفاصيلها";
        readonly module: "team_management";
    };
    readonly UPDATE_TEAM: {
        readonly code: "UPDATE_TEAM";
        readonly name_en: "Update Team";
        readonly name_ar: "تحديث الفريق";
        readonly description_en: "Permission to update team details and information";
        readonly description_ar: "إذن لتحديث تفاصيل ومعلومات الفريق";
        readonly module: "team_management";
    };
    readonly DELETE_TEAM: {
        readonly code: "DELETE_TEAM";
        readonly name_en: "Delete Team";
        readonly name_ar: "حذف الفريق";
        readonly description_en: "Permission to delete teams from the system";
        readonly description_ar: "إذن لحذف الفرق من النظام";
        readonly module: "team_management";
    };
    readonly MANAGE_TEAM_STATUS: {
        readonly code: "MANAGE_TEAM_STATUS";
        readonly name_en: "Manage Team Status";
        readonly name_ar: "إدارة حالة الفريق";
        readonly description_en: "Permission to change team status (active, inactive, suspended, archived)";
        readonly description_ar: "إذن لتغيير حالة الفريق (نشط، غير نشط، معلق، مؤرشف)";
        readonly module: "team_management";
    };
    readonly VIEW_TEAM_MEMBERS: {
        readonly code: "VIEW_TEAM_MEMBERS";
        readonly name_en: "View Team Members";
        readonly name_ar: "عرض أعضاء الفريق";
        readonly description_en: "Permission to view members in teams";
        readonly description_ar: "إذن لعرض الأعضاء في الفرق";
        readonly module: "team_management";
    };
    readonly MANAGE_TEAM_TRAINING: {
        readonly code: "MANAGE_TEAM_TRAINING";
        readonly name_en: "Manage Team Training";
        readonly name_ar: "إدارة تدريبات الفريق";
        readonly description_en: "Permission to create and manage team training schedules";
        readonly description_ar: "إذن لإنشاء وإدارة جداول تدريب الفريق";
        readonly module: "team_management";
    };
    readonly VIEW_TEAM_TRAINING: {
        readonly code: "VIEW_TEAM_TRAINING";
        readonly name_en: "View Team Training";
        readonly name_ar: "عرض تدريبات الفريق";
        readonly description_en: "Permission to view team training schedules";
        readonly description_ar: "إذن لعرض جداول تدريب الفريق";
        readonly module: "team_management";
    };
    readonly ASSIGN_TEAM_MEMBERS: {
        readonly code: "ASSIGN_TEAM_MEMBERS";
        readonly name_en: "Assign Team Members";
        readonly name_ar: "تعيين أعضاء الفريق";
        readonly description_en: "Permission to assign or remove members from teams";
        readonly description_ar: "إذن لتعيين أو إزالة الأعضاء من الفرق";
        readonly module: "team_management";
    };
    readonly VIEW_AVAILABLE_SLOTS: {
        readonly code: "VIEW_AVAILABLE_SLOTS";
        readonly name_en: "View Available Slots";
        readonly name_ar: "عرض الأماكن المتاحة";
        readonly description_en: "Permission to view available slots in teams";
        readonly description_ar: "إذن لعرض الأماكن المتاحة في الفرق";
        readonly module: "team_management";
    };
    readonly CREATE_FIELD: {
        readonly code: "CREATE_FIELD";
        readonly name_en: "Create Field";
        readonly name_ar: "إنشاء ملعب";
        readonly description_en: "Create new sports fields";
        readonly description_ar: "إنشاء ملاعب رياضية جديدة";
        readonly module: "field_management";
    };
    readonly VIEW_FIELDS: {
        readonly code: "VIEW_FIELDS";
        readonly name_en: "View Fields";
        readonly name_ar: "عرض الملاعب";
        readonly description_en: "View sports fields and their details";
        readonly description_ar: "عرض الملاعب الرياضية وتفاصيلها";
        readonly module: "field_management";
    };
    readonly UPDATE_FIELD: {
        readonly code: "UPDATE_FIELD";
        readonly name_en: "Update Field";
        readonly name_ar: "تحديث ملعب";
        readonly description_en: "Update field information";
        readonly description_ar: "تحديث معلومات الملاعب";
        readonly module: "field_management";
    };
    readonly DELETE_FIELD: {
        readonly code: "DELETE_FIELD";
        readonly name_en: "Delete Field";
        readonly name_ar: "حذف ملعب";
        readonly description_en: "Delete sports fields";
        readonly description_ar: "حذف الملاعب الرياضية";
        readonly module: "field_management";
    };
    readonly VIEW_ALL_BOOKINGS: {
        readonly code: "VIEW_ALL_BOOKINGS";
        readonly name_en: "View All Bookings";
        readonly name_ar: "عرض جميع الحجوزات";
        readonly description_en: "View all field bookings across the system";
        readonly description_ar: "عرض جميع حجوزات الملاعب في النظام";
        readonly module: "bookings";
    };
    readonly MANAGE_FIELD_BOOKINGS: {
        readonly code: "MANAGE_FIELD_BOOKINGS";
        readonly name_en: "Manage Field Bookings";
        readonly name_ar: "إدارة حجوزات الملاعب";
        readonly description_en: "Manage field booking settings and complete bookings";
        readonly description_ar: "إدارة إعدادات حجز الملاعب وإكمال الحجوزات";
        readonly module: "bookings";
    };
    readonly VIEW_MEMBERS: {
        readonly code: "VIEW_MEMBERS";
        readonly name_en: "View Members";
        readonly name_ar: "عرض الأعضاء";
        readonly description_en: "View all club members and their profiles";
        readonly description_ar: "عرض جميع أعضاء النادي وملفاتهم الشخصية";
        readonly module: "member_management";
    };
    readonly CREATE_MEMBER: {
        readonly code: "CREATE_MEMBER";
        readonly name_en: "Create Member";
        readonly name_ar: "إنشاء عضو";
        readonly description_en: "Create new member accounts";
        readonly description_ar: "إنشاء حسابات أعضاء جدد";
        readonly module: "member_management";
    };
    readonly UPDATE_MEMBER: {
        readonly code: "UPDATE_MEMBER";
        readonly name_en: "Update Member";
        readonly name_ar: "تحديث بيانات العضو";
        readonly description_en: "Update member profile information";
        readonly description_ar: "تحديث معلومات ملف العضو الشخصي";
        readonly module: "member_management";
    };
    readonly DELETE_MEMBER: {
        readonly code: "DELETE_MEMBER";
        readonly name_en: "Delete Member";
        readonly name_ar: "حذف عضو";
        readonly description_en: "Delete member accounts from system";
        readonly description_ar: "حذف حسابات الأعضاء من النظام";
        readonly module: "member_management";
    };
    readonly VIEW_SPORTS: {
        readonly code: "VIEW_SPORTS";
        readonly name_en: "View Sports";
        readonly name_ar: "عرض الرياضات";
        readonly description_en: "View all sports offered by the club";
        readonly description_ar: "عرض جميع الرياضات المقدمة من النادي";
        readonly module: "sports_management";
    };
    readonly CREATE_SPORT: {
        readonly code: "CREATE_SPORT";
        readonly name_en: "Create Sport";
        readonly name_ar: "إنشاء رياضة";
        readonly description_en: "Add new sports to the system";
        readonly description_ar: "إضافة رياضات جديدة إلى النظام";
        readonly module: "sports_management";
    };
    readonly UPDATE_SPORT: {
        readonly code: "UPDATE_SPORT";
        readonly name_en: "Update Sport";
        readonly name_ar: "تحديث الرياضة";
        readonly description_en: "Update sport information and settings";
        readonly description_ar: "تحديث معلومات الرياضة والإعدادات";
        readonly module: "sports_management";
    };
    readonly DELETE_SPORT: {
        readonly code: "DELETE_SPORT";
        readonly name_en: "Delete Sport";
        readonly name_ar: "حذف الرياضة";
        readonly description_en: "Delete sports from the system";
        readonly description_ar: "حذف الرياضات من النظام";
        readonly module: "sports_management";
    };
    readonly VIEW_FINANCE: {
        readonly code: "VIEW_FINANCE";
        readonly name_en: "View Finance";
        readonly name_ar: "عرض الشؤون المالية";
        readonly description_en: "View financial reports and transactions";
        readonly description_ar: "عرض التقارير المالية والعمليات";
        readonly module: "finance";
    };
    readonly MANAGE_PAYMENTS: {
        readonly code: "MANAGE_PAYMENTS";
        readonly name_en: "Manage Payments";
        readonly name_ar: "إدارة المدفوعات";
        readonly description_en: "Manage payment processing and reconciliation";
        readonly description_ar: "إدارة معالجة المدفوعات والتسويات";
        readonly module: "finance";
    };
    readonly EXPORT_FINANCIAL_REPORTS: {
        readonly code: "EXPORT_FINANCIAL_REPORTS";
        readonly name_en: "Export Financial Reports";
        readonly name_ar: "تصدير التقارير المالية";
        readonly description_en: "Export financial data and reports";
        readonly description_ar: "تصدير البيانات والتقارير المالية";
        readonly module: "finance";
    };
    readonly STAFF_CREATE: {
        readonly code: "STAFF_CREATE";
        readonly name_en: "Create Staff";
        readonly name_ar: "إنشاء موظف";
        readonly description_en: "Create new staff member accounts";
        readonly description_ar: "إنشاء حسابات موظفي جدد";
        readonly module: "staff_management";
    };
    readonly VIEW_STAFF: {
        readonly code: "VIEW_STAFF";
        readonly name_en: "View Staff";
        readonly name_ar: "عرض الموظفين";
        readonly description_en: "View all staff members and their details";
        readonly description_ar: "عرض جميع الموظفين وتفاصيلهم";
        readonly module: "staff_management";
    };
    readonly UPDATE_STAFF: {
        readonly code: "UPDATE_STAFF";
        readonly name_en: "Update Staff";
        readonly name_ar: "تحديث بيانات الموظف";
        readonly description_en: "Update staff profile and role information";
        readonly description_ar: "تحديث ملف الموظف ومعلومات الدور";
        readonly module: "staff_management";
    };
    readonly DELETE_STAFF: {
        readonly code: "DELETE_STAFF";
        readonly name_en: "Delete Staff";
        readonly name_ar: "حذف موظف";
        readonly description_en: "Remove staff members from system";
        readonly description_ar: "إزالة الموظفين من النظام";
        readonly module: "staff_management";
    };
    readonly MANAGE_PRIVILEGES: {
        readonly code: "MANAGE_PRIVILEGES";
        readonly name_en: "Manage Privileges";
        readonly name_ar: "إدارة الأذونات";
        readonly description_en: "Assign and revoke staff privileges";
        readonly description_ar: "تعيين ورفع أذونات الموظفين";
        readonly module: "staff_management";
    };
    readonly VIEW_PRIVILEGES: {
        readonly code: "VIEW_PRIVILEGES";
        readonly name_en: "View Privileges";
        readonly name_ar: "عرض الأذونات";
        readonly description_en: "View staff privileges and assignments";
        readonly description_ar: "عرض أذونات الموظفين والتعيينات";
        readonly module: "staff_management";
    };
    readonly 'audit.view': {
        readonly code: "audit.view";
        readonly name_en: "View Audit Logs";
        readonly name_ar: "عرض سجلات التدقيق";
        readonly description_en: "View system audit logs and activity history";
        readonly description_ar: "عرض سجلات تدقيق النظام وسجل النشاط";
        readonly module: "audit";
    };
    readonly 'audit.manage': {
        readonly code: "audit.manage";
        readonly name_en: "Manage Audit";
        readonly name_ar: "إدارة التدقيق";
        readonly description_en: "Manage audit settings and retention policies";
        readonly description_ar: "إدارة إعدادات التدقيق وسياسات الاحتفاظ";
        readonly module: "audit";
    };
    readonly 'media.view': {
        readonly code: "media.view";
        readonly name_en: "View Media Gallery";
        readonly name_ar: "عرض معرض الوسائط";
        readonly description_en: "View media gallery and media content";
        readonly description_ar: "عرض معرض الوسائط ومحتوى الوسائط";
        readonly module: "media";
    };
    readonly 'media.create': {
        readonly code: "media.create";
        readonly name_en: "Create Media";
        readonly name_ar: "إنشاء وسائط";
        readonly description_en: "Upload and create media content";
        readonly description_ar: "تحميل وإنشاء محتوى وسائط";
        readonly module: "media";
    };
    readonly 'media.edit': {
        readonly code: "media.edit";
        readonly name_en: "Edit Media";
        readonly name_ar: "تعديل الوسائط";
        readonly description_en: "Edit media information and metadata";
        readonly description_ar: "تعديل معلومات الوسائط والبيانات الوصفية";
        readonly module: "media";
    };
    readonly 'media.delete': {
        readonly code: "media.delete";
        readonly name_en: "Delete Media";
        readonly name_ar: "حذف الوسائط";
        readonly description_en: "Delete media content from gallery";
        readonly description_ar: "حذف محتوى الوسائط من المعرض";
        readonly module: "media";
    };
    readonly VIEW_MEMBERSHIP_PLANS: {
        readonly code: "VIEW_MEMBERSHIP_PLANS";
        readonly name_en: "View Membership Plans";
        readonly name_ar: "عرض خطط العضوية";
        readonly description_en: "View all membership plans offered";
        readonly description_ar: "عرض جميع خطط العضوية المقدمة";
        readonly module: "membership";
    };
    readonly CREATE_MEMBERSHIP_PLAN: {
        readonly code: "CREATE_MEMBERSHIP_PLAN";
        readonly name_en: "Create Membership Plan";
        readonly name_ar: "إنشاء خطة عضوية";
        readonly description_en: "Create new membership plans";
        readonly description_ar: "إنشاء خطط عضوية جديدة";
        readonly module: "membership";
    };
    readonly UPDATE_MEMBERSHIP_PLAN: {
        readonly code: "UPDATE_MEMBERSHIP_PLAN";
        readonly name_en: "Update Membership Plan";
        readonly name_ar: "تحديث خطة العضوية";
        readonly description_en: "Update membership plan details";
        readonly description_ar: "تحديث تفاصيل خطة العضوية";
        readonly module: "membership";
    };
    readonly DELETE_MEMBERSHIP_PLAN: {
        readonly code: "DELETE_MEMBERSHIP_PLAN";
        readonly name_en: "Delete Membership Plan";
        readonly name_ar: "حذف خطة العضوية";
        readonly description_en: "Delete membership plans from system";
        readonly description_ar: "حذف خطط العضوية من النظام";
        readonly module: "membership";
    };
    readonly VIEW_FACULTIES: {
        readonly code: "VIEW_FACULTIES";
        readonly name_en: "View Faculties";
        readonly name_ar: "عرض الكليات";
        readonly description_en: "View all university faculties";
        readonly description_ar: "عرض جميع كليات الجامعة";
        readonly module: "faculties";
    };
    readonly CREATE_FACULTY: {
        readonly code: "CREATE_FACULTY";
        readonly name_en: "Create Faculty";
        readonly name_ar: "إنشاء كلية";
        readonly description_en: "Add new university faculties";
        readonly description_ar: "إضافة كليات جامعة جديدة";
        readonly module: "faculties";
    };
    readonly UPDATE_FACULTY: {
        readonly code: "UPDATE_FACULTY";
        readonly name_en: "Update Faculty";
        readonly name_ar: "تحديث الكلية";
        readonly description_en: "Update faculty information";
        readonly description_ar: "تحديث معلومات الكلية";
        readonly module: "faculties";
    };
    readonly DELETE_FACULTY: {
        readonly code: "DELETE_FACULTY";
        readonly name_en: "Delete Faculty";
        readonly name_ar: "حذف الكلية";
        readonly description_en: "Delete faculties from system";
        readonly description_ar: "حذف الكليات من النظام";
        readonly module: "faculties";
    };
    readonly SYSTEM_ADMIN: {
        readonly code: "SYSTEM_ADMIN";
        readonly name_en: "System Administrator";
        readonly name_ar: "مسؤول النظام";
        readonly description_en: "Full system administration access";
        readonly description_ar: "الوصول الكامل لإدارة النظام";
        readonly module: "system_admin";
    };
    readonly VIEW_SYSTEM_SETTINGS: {
        readonly code: "VIEW_SYSTEM_SETTINGS";
        readonly name_en: "View System Settings";
        readonly name_ar: "عرض إعدادات النظام";
        readonly description_en: "View system configuration and settings";
        readonly description_ar: "عرض إعدادات وتكوين النظام";
        readonly module: "system_admin";
    };
    readonly MANAGE_SYSTEM_SETTINGS: {
        readonly code: "MANAGE_SYSTEM_SETTINGS";
        readonly name_en: "Manage System Settings";
        readonly name_ar: "إدارة إعدادات النظام";
        readonly description_en: "Modify system configuration and settings";
        readonly description_ar: "تعديل إعدادات وتكوين النظام";
        readonly module: "system_admin";
    };
    readonly 'admin.invite': {
        readonly code: "admin.invite";
        readonly name_en: "Invite Admins";
        readonly name_ar: "دعوة المسؤولين";
        readonly description_en: "Send admin invitation links to new administrators";
        readonly description_ar: "إرسال روابط دعوة المسؤول للمسؤولين الجدد";
        readonly module: "admin_management";
    };
    readonly 'admin.manage': {
        readonly code: "admin.manage";
        readonly name_en: "Manage Admins";
        readonly name_ar: "إدارة المسؤولين";
        readonly description_en: "Manage admin accounts and access levels";
        readonly description_ar: "إدارة حسابات المسؤولين ومستويات الوصول";
        readonly module: "admin_management";
    };
};
/**
 * Get all privilege codes as an array
 * Useful for validation and checking if a privilege exists
 */
export declare const PRIVILEGE_CODES: Array<keyof typeof PRIVILEGES>;
/**
 * Get all privileges grouped by module
 * Useful for displaying privileges organized by category
 */
export declare function getPrivilegesByModule(module?: string): {
    readonly CREATE_TEAM: {
        readonly code: "CREATE_TEAM";
        readonly name_en: "Create Team";
        readonly name_ar: "إنشاء فريق";
        readonly description_en: "Permission to create new teams for sports";
        readonly description_ar: "إذن لإنشاء فرق جديدة للرياضات";
        readonly module: "team_management";
    };
    readonly VIEW_TEAMS: {
        readonly code: "VIEW_TEAMS";
        readonly name_en: "View Teams";
        readonly name_ar: "عرض الفرق";
        readonly description_en: "Permission to view all teams and their details";
        readonly description_ar: "إذن لعرض جميع الفرق وتفاصيلها";
        readonly module: "team_management";
    };
    readonly UPDATE_TEAM: {
        readonly code: "UPDATE_TEAM";
        readonly name_en: "Update Team";
        readonly name_ar: "تحديث الفريق";
        readonly description_en: "Permission to update team details and information";
        readonly description_ar: "إذن لتحديث تفاصيل ومعلومات الفريق";
        readonly module: "team_management";
    };
    readonly DELETE_TEAM: {
        readonly code: "DELETE_TEAM";
        readonly name_en: "Delete Team";
        readonly name_ar: "حذف الفريق";
        readonly description_en: "Permission to delete teams from the system";
        readonly description_ar: "إذن لحذف الفرق من النظام";
        readonly module: "team_management";
    };
    readonly MANAGE_TEAM_STATUS: {
        readonly code: "MANAGE_TEAM_STATUS";
        readonly name_en: "Manage Team Status";
        readonly name_ar: "إدارة حالة الفريق";
        readonly description_en: "Permission to change team status (active, inactive, suspended, archived)";
        readonly description_ar: "إذن لتغيير حالة الفريق (نشط، غير نشط، معلق، مؤرشف)";
        readonly module: "team_management";
    };
    readonly VIEW_TEAM_MEMBERS: {
        readonly code: "VIEW_TEAM_MEMBERS";
        readonly name_en: "View Team Members";
        readonly name_ar: "عرض أعضاء الفريق";
        readonly description_en: "Permission to view members in teams";
        readonly description_ar: "إذن لعرض الأعضاء في الفرق";
        readonly module: "team_management";
    };
    readonly MANAGE_TEAM_TRAINING: {
        readonly code: "MANAGE_TEAM_TRAINING";
        readonly name_en: "Manage Team Training";
        readonly name_ar: "إدارة تدريبات الفريق";
        readonly description_en: "Permission to create and manage team training schedules";
        readonly description_ar: "إذن لإنشاء وإدارة جداول تدريب الفريق";
        readonly module: "team_management";
    };
    readonly VIEW_TEAM_TRAINING: {
        readonly code: "VIEW_TEAM_TRAINING";
        readonly name_en: "View Team Training";
        readonly name_ar: "عرض تدريبات الفريق";
        readonly description_en: "Permission to view team training schedules";
        readonly description_ar: "إذن لعرض جداول تدريب الفريق";
        readonly module: "team_management";
    };
    readonly ASSIGN_TEAM_MEMBERS: {
        readonly code: "ASSIGN_TEAM_MEMBERS";
        readonly name_en: "Assign Team Members";
        readonly name_ar: "تعيين أعضاء الفريق";
        readonly description_en: "Permission to assign or remove members from teams";
        readonly description_ar: "إذن لتعيين أو إزالة الأعضاء من الفرق";
        readonly module: "team_management";
    };
    readonly VIEW_AVAILABLE_SLOTS: {
        readonly code: "VIEW_AVAILABLE_SLOTS";
        readonly name_en: "View Available Slots";
        readonly name_ar: "عرض الأماكن المتاحة";
        readonly description_en: "Permission to view available slots in teams";
        readonly description_ar: "إذن لعرض الأماكن المتاحة في الفرق";
        readonly module: "team_management";
    };
    readonly CREATE_FIELD: {
        readonly code: "CREATE_FIELD";
        readonly name_en: "Create Field";
        readonly name_ar: "إنشاء ملعب";
        readonly description_en: "Create new sports fields";
        readonly description_ar: "إنشاء ملاعب رياضية جديدة";
        readonly module: "field_management";
    };
    readonly VIEW_FIELDS: {
        readonly code: "VIEW_FIELDS";
        readonly name_en: "View Fields";
        readonly name_ar: "عرض الملاعب";
        readonly description_en: "View sports fields and their details";
        readonly description_ar: "عرض الملاعب الرياضية وتفاصيلها";
        readonly module: "field_management";
    };
    readonly UPDATE_FIELD: {
        readonly code: "UPDATE_FIELD";
        readonly name_en: "Update Field";
        readonly name_ar: "تحديث ملعب";
        readonly description_en: "Update field information";
        readonly description_ar: "تحديث معلومات الملاعب";
        readonly module: "field_management";
    };
    readonly DELETE_FIELD: {
        readonly code: "DELETE_FIELD";
        readonly name_en: "Delete Field";
        readonly name_ar: "حذف ملعب";
        readonly description_en: "Delete sports fields";
        readonly description_ar: "حذف الملاعب الرياضية";
        readonly module: "field_management";
    };
    readonly VIEW_ALL_BOOKINGS: {
        readonly code: "VIEW_ALL_BOOKINGS";
        readonly name_en: "View All Bookings";
        readonly name_ar: "عرض جميع الحجوزات";
        readonly description_en: "View all field bookings across the system";
        readonly description_ar: "عرض جميع حجوزات الملاعب في النظام";
        readonly module: "bookings";
    };
    readonly MANAGE_FIELD_BOOKINGS: {
        readonly code: "MANAGE_FIELD_BOOKINGS";
        readonly name_en: "Manage Field Bookings";
        readonly name_ar: "إدارة حجوزات الملاعب";
        readonly description_en: "Manage field booking settings and complete bookings";
        readonly description_ar: "إدارة إعدادات حجز الملاعب وإكمال الحجوزات";
        readonly module: "bookings";
    };
    readonly VIEW_MEMBERS: {
        readonly code: "VIEW_MEMBERS";
        readonly name_en: "View Members";
        readonly name_ar: "عرض الأعضاء";
        readonly description_en: "View all club members and their profiles";
        readonly description_ar: "عرض جميع أعضاء النادي وملفاتهم الشخصية";
        readonly module: "member_management";
    };
    readonly CREATE_MEMBER: {
        readonly code: "CREATE_MEMBER";
        readonly name_en: "Create Member";
        readonly name_ar: "إنشاء عضو";
        readonly description_en: "Create new member accounts";
        readonly description_ar: "إنشاء حسابات أعضاء جدد";
        readonly module: "member_management";
    };
    readonly UPDATE_MEMBER: {
        readonly code: "UPDATE_MEMBER";
        readonly name_en: "Update Member";
        readonly name_ar: "تحديث بيانات العضو";
        readonly description_en: "Update member profile information";
        readonly description_ar: "تحديث معلومات ملف العضو الشخصي";
        readonly module: "member_management";
    };
    readonly DELETE_MEMBER: {
        readonly code: "DELETE_MEMBER";
        readonly name_en: "Delete Member";
        readonly name_ar: "حذف عضو";
        readonly description_en: "Delete member accounts from system";
        readonly description_ar: "حذف حسابات الأعضاء من النظام";
        readonly module: "member_management";
    };
    readonly VIEW_SPORTS: {
        readonly code: "VIEW_SPORTS";
        readonly name_en: "View Sports";
        readonly name_ar: "عرض الرياضات";
        readonly description_en: "View all sports offered by the club";
        readonly description_ar: "عرض جميع الرياضات المقدمة من النادي";
        readonly module: "sports_management";
    };
    readonly CREATE_SPORT: {
        readonly code: "CREATE_SPORT";
        readonly name_en: "Create Sport";
        readonly name_ar: "إنشاء رياضة";
        readonly description_en: "Add new sports to the system";
        readonly description_ar: "إضافة رياضات جديدة إلى النظام";
        readonly module: "sports_management";
    };
    readonly UPDATE_SPORT: {
        readonly code: "UPDATE_SPORT";
        readonly name_en: "Update Sport";
        readonly name_ar: "تحديث الرياضة";
        readonly description_en: "Update sport information and settings";
        readonly description_ar: "تحديث معلومات الرياضة والإعدادات";
        readonly module: "sports_management";
    };
    readonly DELETE_SPORT: {
        readonly code: "DELETE_SPORT";
        readonly name_en: "Delete Sport";
        readonly name_ar: "حذف الرياضة";
        readonly description_en: "Delete sports from the system";
        readonly description_ar: "حذف الرياضات من النظام";
        readonly module: "sports_management";
    };
    readonly VIEW_FINANCE: {
        readonly code: "VIEW_FINANCE";
        readonly name_en: "View Finance";
        readonly name_ar: "عرض الشؤون المالية";
        readonly description_en: "View financial reports and transactions";
        readonly description_ar: "عرض التقارير المالية والعمليات";
        readonly module: "finance";
    };
    readonly MANAGE_PAYMENTS: {
        readonly code: "MANAGE_PAYMENTS";
        readonly name_en: "Manage Payments";
        readonly name_ar: "إدارة المدفوعات";
        readonly description_en: "Manage payment processing and reconciliation";
        readonly description_ar: "إدارة معالجة المدفوعات والتسويات";
        readonly module: "finance";
    };
    readonly EXPORT_FINANCIAL_REPORTS: {
        readonly code: "EXPORT_FINANCIAL_REPORTS";
        readonly name_en: "Export Financial Reports";
        readonly name_ar: "تصدير التقارير المالية";
        readonly description_en: "Export financial data and reports";
        readonly description_ar: "تصدير البيانات والتقارير المالية";
        readonly module: "finance";
    };
    readonly STAFF_CREATE: {
        readonly code: "STAFF_CREATE";
        readonly name_en: "Create Staff";
        readonly name_ar: "إنشاء موظف";
        readonly description_en: "Create new staff member accounts";
        readonly description_ar: "إنشاء حسابات موظفي جدد";
        readonly module: "staff_management";
    };
    readonly VIEW_STAFF: {
        readonly code: "VIEW_STAFF";
        readonly name_en: "View Staff";
        readonly name_ar: "عرض الموظفين";
        readonly description_en: "View all staff members and their details";
        readonly description_ar: "عرض جميع الموظفين وتفاصيلهم";
        readonly module: "staff_management";
    };
    readonly UPDATE_STAFF: {
        readonly code: "UPDATE_STAFF";
        readonly name_en: "Update Staff";
        readonly name_ar: "تحديث بيانات الموظف";
        readonly description_en: "Update staff profile and role information";
        readonly description_ar: "تحديث ملف الموظف ومعلومات الدور";
        readonly module: "staff_management";
    };
    readonly DELETE_STAFF: {
        readonly code: "DELETE_STAFF";
        readonly name_en: "Delete Staff";
        readonly name_ar: "حذف موظف";
        readonly description_en: "Remove staff members from system";
        readonly description_ar: "إزالة الموظفين من النظام";
        readonly module: "staff_management";
    };
    readonly MANAGE_PRIVILEGES: {
        readonly code: "MANAGE_PRIVILEGES";
        readonly name_en: "Manage Privileges";
        readonly name_ar: "إدارة الأذونات";
        readonly description_en: "Assign and revoke staff privileges";
        readonly description_ar: "تعيين ورفع أذونات الموظفين";
        readonly module: "staff_management";
    };
    readonly VIEW_PRIVILEGES: {
        readonly code: "VIEW_PRIVILEGES";
        readonly name_en: "View Privileges";
        readonly name_ar: "عرض الأذونات";
        readonly description_en: "View staff privileges and assignments";
        readonly description_ar: "عرض أذونات الموظفين والتعيينات";
        readonly module: "staff_management";
    };
    readonly 'audit.view': {
        readonly code: "audit.view";
        readonly name_en: "View Audit Logs";
        readonly name_ar: "عرض سجلات التدقيق";
        readonly description_en: "View system audit logs and activity history";
        readonly description_ar: "عرض سجلات تدقيق النظام وسجل النشاط";
        readonly module: "audit";
    };
    readonly 'audit.manage': {
        readonly code: "audit.manage";
        readonly name_en: "Manage Audit";
        readonly name_ar: "إدارة التدقيق";
        readonly description_en: "Manage audit settings and retention policies";
        readonly description_ar: "إدارة إعدادات التدقيق وسياسات الاحتفاظ";
        readonly module: "audit";
    };
    readonly 'media.view': {
        readonly code: "media.view";
        readonly name_en: "View Media Gallery";
        readonly name_ar: "عرض معرض الوسائط";
        readonly description_en: "View media gallery and media content";
        readonly description_ar: "عرض معرض الوسائط ومحتوى الوسائط";
        readonly module: "media";
    };
    readonly 'media.create': {
        readonly code: "media.create";
        readonly name_en: "Create Media";
        readonly name_ar: "إنشاء وسائط";
        readonly description_en: "Upload and create media content";
        readonly description_ar: "تحميل وإنشاء محتوى وسائط";
        readonly module: "media";
    };
    readonly 'media.edit': {
        readonly code: "media.edit";
        readonly name_en: "Edit Media";
        readonly name_ar: "تعديل الوسائط";
        readonly description_en: "Edit media information and metadata";
        readonly description_ar: "تعديل معلومات الوسائط والبيانات الوصفية";
        readonly module: "media";
    };
    readonly 'media.delete': {
        readonly code: "media.delete";
        readonly name_en: "Delete Media";
        readonly name_ar: "حذف الوسائط";
        readonly description_en: "Delete media content from gallery";
        readonly description_ar: "حذف محتوى الوسائط من المعرض";
        readonly module: "media";
    };
    readonly VIEW_MEMBERSHIP_PLANS: {
        readonly code: "VIEW_MEMBERSHIP_PLANS";
        readonly name_en: "View Membership Plans";
        readonly name_ar: "عرض خطط العضوية";
        readonly description_en: "View all membership plans offered";
        readonly description_ar: "عرض جميع خطط العضوية المقدمة";
        readonly module: "membership";
    };
    readonly CREATE_MEMBERSHIP_PLAN: {
        readonly code: "CREATE_MEMBERSHIP_PLAN";
        readonly name_en: "Create Membership Plan";
        readonly name_ar: "إنشاء خطة عضوية";
        readonly description_en: "Create new membership plans";
        readonly description_ar: "إنشاء خطط عضوية جديدة";
        readonly module: "membership";
    };
    readonly UPDATE_MEMBERSHIP_PLAN: {
        readonly code: "UPDATE_MEMBERSHIP_PLAN";
        readonly name_en: "Update Membership Plan";
        readonly name_ar: "تحديث خطة العضوية";
        readonly description_en: "Update membership plan details";
        readonly description_ar: "تحديث تفاصيل خطة العضوية";
        readonly module: "membership";
    };
    readonly DELETE_MEMBERSHIP_PLAN: {
        readonly code: "DELETE_MEMBERSHIP_PLAN";
        readonly name_en: "Delete Membership Plan";
        readonly name_ar: "حذف خطة العضوية";
        readonly description_en: "Delete membership plans from system";
        readonly description_ar: "حذف خطط العضوية من النظام";
        readonly module: "membership";
    };
    readonly VIEW_FACULTIES: {
        readonly code: "VIEW_FACULTIES";
        readonly name_en: "View Faculties";
        readonly name_ar: "عرض الكليات";
        readonly description_en: "View all university faculties";
        readonly description_ar: "عرض جميع كليات الجامعة";
        readonly module: "faculties";
    };
    readonly CREATE_FACULTY: {
        readonly code: "CREATE_FACULTY";
        readonly name_en: "Create Faculty";
        readonly name_ar: "إنشاء كلية";
        readonly description_en: "Add new university faculties";
        readonly description_ar: "إضافة كليات جامعة جديدة";
        readonly module: "faculties";
    };
    readonly UPDATE_FACULTY: {
        readonly code: "UPDATE_FACULTY";
        readonly name_en: "Update Faculty";
        readonly name_ar: "تحديث الكلية";
        readonly description_en: "Update faculty information";
        readonly description_ar: "تحديث معلومات الكلية";
        readonly module: "faculties";
    };
    readonly DELETE_FACULTY: {
        readonly code: "DELETE_FACULTY";
        readonly name_en: "Delete Faculty";
        readonly name_ar: "حذف الكلية";
        readonly description_en: "Delete faculties from system";
        readonly description_ar: "حذف الكليات من النظام";
        readonly module: "faculties";
    };
    readonly SYSTEM_ADMIN: {
        readonly code: "SYSTEM_ADMIN";
        readonly name_en: "System Administrator";
        readonly name_ar: "مسؤول النظام";
        readonly description_en: "Full system administration access";
        readonly description_ar: "الوصول الكامل لإدارة النظام";
        readonly module: "system_admin";
    };
    readonly VIEW_SYSTEM_SETTINGS: {
        readonly code: "VIEW_SYSTEM_SETTINGS";
        readonly name_en: "View System Settings";
        readonly name_ar: "عرض إعدادات النظام";
        readonly description_en: "View system configuration and settings";
        readonly description_ar: "عرض إعدادات وتكوين النظام";
        readonly module: "system_admin";
    };
    readonly MANAGE_SYSTEM_SETTINGS: {
        readonly code: "MANAGE_SYSTEM_SETTINGS";
        readonly name_en: "Manage System Settings";
        readonly name_ar: "إدارة إعدادات النظام";
        readonly description_en: "Modify system configuration and settings";
        readonly description_ar: "تعديل إعدادات وتكوين النظام";
        readonly module: "system_admin";
    };
    readonly 'admin.invite': {
        readonly code: "admin.invite";
        readonly name_en: "Invite Admins";
        readonly name_ar: "دعوة المسؤولين";
        readonly description_en: "Send admin invitation links to new administrators";
        readonly description_ar: "إرسال روابط دعوة المسؤول للمسؤولين الجدد";
        readonly module: "admin_management";
    };
    readonly 'admin.manage': {
        readonly code: "admin.manage";
        readonly name_en: "Manage Admins";
        readonly name_ar: "إدارة المسؤولين";
        readonly description_en: "Manage admin accounts and access levels";
        readonly description_ar: "إدارة حسابات المسؤولين ومستويات الوصول";
        readonly module: "admin_management";
    };
} | {
    [k: string]: {
        readonly code: "CREATE_TEAM";
        readonly name_en: "Create Team";
        readonly name_ar: "إنشاء فريق";
        readonly description_en: "Permission to create new teams for sports";
        readonly description_ar: "إذن لإنشاء فرق جديدة للرياضات";
        readonly module: "team_management";
    } | {
        readonly code: "VIEW_TEAMS";
        readonly name_en: "View Teams";
        readonly name_ar: "عرض الفرق";
        readonly description_en: "Permission to view all teams and their details";
        readonly description_ar: "إذن لعرض جميع الفرق وتفاصيلها";
        readonly module: "team_management";
    } | {
        readonly code: "UPDATE_TEAM";
        readonly name_en: "Update Team";
        readonly name_ar: "تحديث الفريق";
        readonly description_en: "Permission to update team details and information";
        readonly description_ar: "إذن لتحديث تفاصيل ومعلومات الفريق";
        readonly module: "team_management";
    } | {
        readonly code: "DELETE_TEAM";
        readonly name_en: "Delete Team";
        readonly name_ar: "حذف الفريق";
        readonly description_en: "Permission to delete teams from the system";
        readonly description_ar: "إذن لحذف الفرق من النظام";
        readonly module: "team_management";
    } | {
        readonly code: "MANAGE_TEAM_STATUS";
        readonly name_en: "Manage Team Status";
        readonly name_ar: "إدارة حالة الفريق";
        readonly description_en: "Permission to change team status (active, inactive, suspended, archived)";
        readonly description_ar: "إذن لتغيير حالة الفريق (نشط، غير نشط، معلق، مؤرشف)";
        readonly module: "team_management";
    } | {
        readonly code: "VIEW_TEAM_MEMBERS";
        readonly name_en: "View Team Members";
        readonly name_ar: "عرض أعضاء الفريق";
        readonly description_en: "Permission to view members in teams";
        readonly description_ar: "إذن لعرض الأعضاء في الفرق";
        readonly module: "team_management";
    } | {
        readonly code: "MANAGE_TEAM_TRAINING";
        readonly name_en: "Manage Team Training";
        readonly name_ar: "إدارة تدريبات الفريق";
        readonly description_en: "Permission to create and manage team training schedules";
        readonly description_ar: "إذن لإنشاء وإدارة جداول تدريب الفريق";
        readonly module: "team_management";
    } | {
        readonly code: "VIEW_TEAM_TRAINING";
        readonly name_en: "View Team Training";
        readonly name_ar: "عرض تدريبات الفريق";
        readonly description_en: "Permission to view team training schedules";
        readonly description_ar: "إذن لعرض جداول تدريب الفريق";
        readonly module: "team_management";
    } | {
        readonly code: "ASSIGN_TEAM_MEMBERS";
        readonly name_en: "Assign Team Members";
        readonly name_ar: "تعيين أعضاء الفريق";
        readonly description_en: "Permission to assign or remove members from teams";
        readonly description_ar: "إذن لتعيين أو إزالة الأعضاء من الفرق";
        readonly module: "team_management";
    } | {
        readonly code: "VIEW_AVAILABLE_SLOTS";
        readonly name_en: "View Available Slots";
        readonly name_ar: "عرض الأماكن المتاحة";
        readonly description_en: "Permission to view available slots in teams";
        readonly description_ar: "إذن لعرض الأماكن المتاحة في الفرق";
        readonly module: "team_management";
    } | {
        readonly code: "CREATE_FIELD";
        readonly name_en: "Create Field";
        readonly name_ar: "إنشاء ملعب";
        readonly description_en: "Create new sports fields";
        readonly description_ar: "إنشاء ملاعب رياضية جديدة";
        readonly module: "field_management";
    } | {
        readonly code: "VIEW_FIELDS";
        readonly name_en: "View Fields";
        readonly name_ar: "عرض الملاعب";
        readonly description_en: "View sports fields and their details";
        readonly description_ar: "عرض الملاعب الرياضية وتفاصيلها";
        readonly module: "field_management";
    } | {
        readonly code: "UPDATE_FIELD";
        readonly name_en: "Update Field";
        readonly name_ar: "تحديث ملعب";
        readonly description_en: "Update field information";
        readonly description_ar: "تحديث معلومات الملاعب";
        readonly module: "field_management";
    } | {
        readonly code: "DELETE_FIELD";
        readonly name_en: "Delete Field";
        readonly name_ar: "حذف ملعب";
        readonly description_en: "Delete sports fields";
        readonly description_ar: "حذف الملاعب الرياضية";
        readonly module: "field_management";
    } | {
        readonly code: "VIEW_ALL_BOOKINGS";
        readonly name_en: "View All Bookings";
        readonly name_ar: "عرض جميع الحجوزات";
        readonly description_en: "View all field bookings across the system";
        readonly description_ar: "عرض جميع حجوزات الملاعب في النظام";
        readonly module: "bookings";
    } | {
        readonly code: "MANAGE_FIELD_BOOKINGS";
        readonly name_en: "Manage Field Bookings";
        readonly name_ar: "إدارة حجوزات الملاعب";
        readonly description_en: "Manage field booking settings and complete bookings";
        readonly description_ar: "إدارة إعدادات حجز الملاعب وإكمال الحجوزات";
        readonly module: "bookings";
    } | {
        readonly code: "VIEW_MEMBERS";
        readonly name_en: "View Members";
        readonly name_ar: "عرض الأعضاء";
        readonly description_en: "View all club members and their profiles";
        readonly description_ar: "عرض جميع أعضاء النادي وملفاتهم الشخصية";
        readonly module: "member_management";
    } | {
        readonly code: "CREATE_MEMBER";
        readonly name_en: "Create Member";
        readonly name_ar: "إنشاء عضو";
        readonly description_en: "Create new member accounts";
        readonly description_ar: "إنشاء حسابات أعضاء جدد";
        readonly module: "member_management";
    } | {
        readonly code: "UPDATE_MEMBER";
        readonly name_en: "Update Member";
        readonly name_ar: "تحديث بيانات العضو";
        readonly description_en: "Update member profile information";
        readonly description_ar: "تحديث معلومات ملف العضو الشخصي";
        readonly module: "member_management";
    } | {
        readonly code: "DELETE_MEMBER";
        readonly name_en: "Delete Member";
        readonly name_ar: "حذف عضو";
        readonly description_en: "Delete member accounts from system";
        readonly description_ar: "حذف حسابات الأعضاء من النظام";
        readonly module: "member_management";
    } | {
        readonly code: "VIEW_SPORTS";
        readonly name_en: "View Sports";
        readonly name_ar: "عرض الرياضات";
        readonly description_en: "View all sports offered by the club";
        readonly description_ar: "عرض جميع الرياضات المقدمة من النادي";
        readonly module: "sports_management";
    } | {
        readonly code: "CREATE_SPORT";
        readonly name_en: "Create Sport";
        readonly name_ar: "إنشاء رياضة";
        readonly description_en: "Add new sports to the system";
        readonly description_ar: "إضافة رياضات جديدة إلى النظام";
        readonly module: "sports_management";
    } | {
        readonly code: "UPDATE_SPORT";
        readonly name_en: "Update Sport";
        readonly name_ar: "تحديث الرياضة";
        readonly description_en: "Update sport information and settings";
        readonly description_ar: "تحديث معلومات الرياضة والإعدادات";
        readonly module: "sports_management";
    } | {
        readonly code: "DELETE_SPORT";
        readonly name_en: "Delete Sport";
        readonly name_ar: "حذف الرياضة";
        readonly description_en: "Delete sports from the system";
        readonly description_ar: "حذف الرياضات من النظام";
        readonly module: "sports_management";
    } | {
        readonly code: "VIEW_FINANCE";
        readonly name_en: "View Finance";
        readonly name_ar: "عرض الشؤون المالية";
        readonly description_en: "View financial reports and transactions";
        readonly description_ar: "عرض التقارير المالية والعمليات";
        readonly module: "finance";
    } | {
        readonly code: "MANAGE_PAYMENTS";
        readonly name_en: "Manage Payments";
        readonly name_ar: "إدارة المدفوعات";
        readonly description_en: "Manage payment processing and reconciliation";
        readonly description_ar: "إدارة معالجة المدفوعات والتسويات";
        readonly module: "finance";
    } | {
        readonly code: "EXPORT_FINANCIAL_REPORTS";
        readonly name_en: "Export Financial Reports";
        readonly name_ar: "تصدير التقارير المالية";
        readonly description_en: "Export financial data and reports";
        readonly description_ar: "تصدير البيانات والتقارير المالية";
        readonly module: "finance";
    } | {
        readonly code: "STAFF_CREATE";
        readonly name_en: "Create Staff";
        readonly name_ar: "إنشاء موظف";
        readonly description_en: "Create new staff member accounts";
        readonly description_ar: "إنشاء حسابات موظفي جدد";
        readonly module: "staff_management";
    } | {
        readonly code: "VIEW_STAFF";
        readonly name_en: "View Staff";
        readonly name_ar: "عرض الموظفين";
        readonly description_en: "View all staff members and their details";
        readonly description_ar: "عرض جميع الموظفين وتفاصيلهم";
        readonly module: "staff_management";
    } | {
        readonly code: "UPDATE_STAFF";
        readonly name_en: "Update Staff";
        readonly name_ar: "تحديث بيانات الموظف";
        readonly description_en: "Update staff profile and role information";
        readonly description_ar: "تحديث ملف الموظف ومعلومات الدور";
        readonly module: "staff_management";
    } | {
        readonly code: "DELETE_STAFF";
        readonly name_en: "Delete Staff";
        readonly name_ar: "حذف موظف";
        readonly description_en: "Remove staff members from system";
        readonly description_ar: "إزالة الموظفين من النظام";
        readonly module: "staff_management";
    } | {
        readonly code: "MANAGE_PRIVILEGES";
        readonly name_en: "Manage Privileges";
        readonly name_ar: "إدارة الأذونات";
        readonly description_en: "Assign and revoke staff privileges";
        readonly description_ar: "تعيين ورفع أذونات الموظفين";
        readonly module: "staff_management";
    } | {
        readonly code: "VIEW_PRIVILEGES";
        readonly name_en: "View Privileges";
        readonly name_ar: "عرض الأذونات";
        readonly description_en: "View staff privileges and assignments";
        readonly description_ar: "عرض أذونات الموظفين والتعيينات";
        readonly module: "staff_management";
    } | {
        readonly code: "audit.view";
        readonly name_en: "View Audit Logs";
        readonly name_ar: "عرض سجلات التدقيق";
        readonly description_en: "View system audit logs and activity history";
        readonly description_ar: "عرض سجلات تدقيق النظام وسجل النشاط";
        readonly module: "audit";
    } | {
        readonly code: "audit.manage";
        readonly name_en: "Manage Audit";
        readonly name_ar: "إدارة التدقيق";
        readonly description_en: "Manage audit settings and retention policies";
        readonly description_ar: "إدارة إعدادات التدقيق وسياسات الاحتفاظ";
        readonly module: "audit";
    } | {
        readonly code: "media.view";
        readonly name_en: "View Media Gallery";
        readonly name_ar: "عرض معرض الوسائط";
        readonly description_en: "View media gallery and media content";
        readonly description_ar: "عرض معرض الوسائط ومحتوى الوسائط";
        readonly module: "media";
    } | {
        readonly code: "media.create";
        readonly name_en: "Create Media";
        readonly name_ar: "إنشاء وسائط";
        readonly description_en: "Upload and create media content";
        readonly description_ar: "تحميل وإنشاء محتوى وسائط";
        readonly module: "media";
    } | {
        readonly code: "media.edit";
        readonly name_en: "Edit Media";
        readonly name_ar: "تعديل الوسائط";
        readonly description_en: "Edit media information and metadata";
        readonly description_ar: "تعديل معلومات الوسائط والبيانات الوصفية";
        readonly module: "media";
    } | {
        readonly code: "media.delete";
        readonly name_en: "Delete Media";
        readonly name_ar: "حذف الوسائط";
        readonly description_en: "Delete media content from gallery";
        readonly description_ar: "حذف محتوى الوسائط من المعرض";
        readonly module: "media";
    } | {
        readonly code: "VIEW_MEMBERSHIP_PLANS";
        readonly name_en: "View Membership Plans";
        readonly name_ar: "عرض خطط العضوية";
        readonly description_en: "View all membership plans offered";
        readonly description_ar: "عرض جميع خطط العضوية المقدمة";
        readonly module: "membership";
    } | {
        readonly code: "CREATE_MEMBERSHIP_PLAN";
        readonly name_en: "Create Membership Plan";
        readonly name_ar: "إنشاء خطة عضوية";
        readonly description_en: "Create new membership plans";
        readonly description_ar: "إنشاء خطط عضوية جديدة";
        readonly module: "membership";
    } | {
        readonly code: "UPDATE_MEMBERSHIP_PLAN";
        readonly name_en: "Update Membership Plan";
        readonly name_ar: "تحديث خطة العضوية";
        readonly description_en: "Update membership plan details";
        readonly description_ar: "تحديث تفاصيل خطة العضوية";
        readonly module: "membership";
    } | {
        readonly code: "DELETE_MEMBERSHIP_PLAN";
        readonly name_en: "Delete Membership Plan";
        readonly name_ar: "حذف خطة العضوية";
        readonly description_en: "Delete membership plans from system";
        readonly description_ar: "حذف خطط العضوية من النظام";
        readonly module: "membership";
    } | {
        readonly code: "VIEW_FACULTIES";
        readonly name_en: "View Faculties";
        readonly name_ar: "عرض الكليات";
        readonly description_en: "View all university faculties";
        readonly description_ar: "عرض جميع كليات الجامعة";
        readonly module: "faculties";
    } | {
        readonly code: "CREATE_FACULTY";
        readonly name_en: "Create Faculty";
        readonly name_ar: "إنشاء كلية";
        readonly description_en: "Add new university faculties";
        readonly description_ar: "إضافة كليات جامعة جديدة";
        readonly module: "faculties";
    } | {
        readonly code: "UPDATE_FACULTY";
        readonly name_en: "Update Faculty";
        readonly name_ar: "تحديث الكلية";
        readonly description_en: "Update faculty information";
        readonly description_ar: "تحديث معلومات الكلية";
        readonly module: "faculties";
    } | {
        readonly code: "DELETE_FACULTY";
        readonly name_en: "Delete Faculty";
        readonly name_ar: "حذف الكلية";
        readonly description_en: "Delete faculties from system";
        readonly description_ar: "حذف الكليات من النظام";
        readonly module: "faculties";
    } | {
        readonly code: "SYSTEM_ADMIN";
        readonly name_en: "System Administrator";
        readonly name_ar: "مسؤول النظام";
        readonly description_en: "Full system administration access";
        readonly description_ar: "الوصول الكامل لإدارة النظام";
        readonly module: "system_admin";
    } | {
        readonly code: "VIEW_SYSTEM_SETTINGS";
        readonly name_en: "View System Settings";
        readonly name_ar: "عرض إعدادات النظام";
        readonly description_en: "View system configuration and settings";
        readonly description_ar: "عرض إعدادات وتكوين النظام";
        readonly module: "system_admin";
    } | {
        readonly code: "MANAGE_SYSTEM_SETTINGS";
        readonly name_en: "Manage System Settings";
        readonly name_ar: "إدارة إعدادات النظام";
        readonly description_en: "Modify system configuration and settings";
        readonly description_ar: "تعديل إعدادات وتكوين النظام";
        readonly module: "system_admin";
    } | {
        readonly code: "admin.invite";
        readonly name_en: "Invite Admins";
        readonly name_ar: "دعوة المسؤولين";
        readonly description_en: "Send admin invitation links to new administrators";
        readonly description_ar: "إرسال روابط دعوة المسؤول للمسؤولين الجدد";
        readonly module: "admin_management";
    } | {
        readonly code: "admin.manage";
        readonly name_en: "Manage Admins";
        readonly name_ar: "إدارة المسؤولين";
        readonly description_en: "Manage admin accounts and access levels";
        readonly description_ar: "إدارة حسابات المسؤولين ومستويات الوصول";
        readonly module: "admin_management";
    };
};
/**
 * Get a single privilege by code
 */
export declare function getPrivilege(code: string): {
    readonly code: "CREATE_TEAM";
    readonly name_en: "Create Team";
    readonly name_ar: "إنشاء فريق";
    readonly description_en: "Permission to create new teams for sports";
    readonly description_ar: "إذن لإنشاء فرق جديدة للرياضات";
    readonly module: "team_management";
} | {
    readonly code: "VIEW_TEAMS";
    readonly name_en: "View Teams";
    readonly name_ar: "عرض الفرق";
    readonly description_en: "Permission to view all teams and their details";
    readonly description_ar: "إذن لعرض جميع الفرق وتفاصيلها";
    readonly module: "team_management";
} | {
    readonly code: "UPDATE_TEAM";
    readonly name_en: "Update Team";
    readonly name_ar: "تحديث الفريق";
    readonly description_en: "Permission to update team details and information";
    readonly description_ar: "إذن لتحديث تفاصيل ومعلومات الفريق";
    readonly module: "team_management";
} | {
    readonly code: "DELETE_TEAM";
    readonly name_en: "Delete Team";
    readonly name_ar: "حذف الفريق";
    readonly description_en: "Permission to delete teams from the system";
    readonly description_ar: "إذن لحذف الفرق من النظام";
    readonly module: "team_management";
} | {
    readonly code: "MANAGE_TEAM_STATUS";
    readonly name_en: "Manage Team Status";
    readonly name_ar: "إدارة حالة الفريق";
    readonly description_en: "Permission to change team status (active, inactive, suspended, archived)";
    readonly description_ar: "إذن لتغيير حالة الفريق (نشط، غير نشط، معلق، مؤرشف)";
    readonly module: "team_management";
} | {
    readonly code: "VIEW_TEAM_MEMBERS";
    readonly name_en: "View Team Members";
    readonly name_ar: "عرض أعضاء الفريق";
    readonly description_en: "Permission to view members in teams";
    readonly description_ar: "إذن لعرض الأعضاء في الفرق";
    readonly module: "team_management";
} | {
    readonly code: "MANAGE_TEAM_TRAINING";
    readonly name_en: "Manage Team Training";
    readonly name_ar: "إدارة تدريبات الفريق";
    readonly description_en: "Permission to create and manage team training schedules";
    readonly description_ar: "إذن لإنشاء وإدارة جداول تدريب الفريق";
    readonly module: "team_management";
} | {
    readonly code: "VIEW_TEAM_TRAINING";
    readonly name_en: "View Team Training";
    readonly name_ar: "عرض تدريبات الفريق";
    readonly description_en: "Permission to view team training schedules";
    readonly description_ar: "إذن لعرض جداول تدريب الفريق";
    readonly module: "team_management";
} | {
    readonly code: "ASSIGN_TEAM_MEMBERS";
    readonly name_en: "Assign Team Members";
    readonly name_ar: "تعيين أعضاء الفريق";
    readonly description_en: "Permission to assign or remove members from teams";
    readonly description_ar: "إذن لتعيين أو إزالة الأعضاء من الفرق";
    readonly module: "team_management";
} | {
    readonly code: "VIEW_AVAILABLE_SLOTS";
    readonly name_en: "View Available Slots";
    readonly name_ar: "عرض الأماكن المتاحة";
    readonly description_en: "Permission to view available slots in teams";
    readonly description_ar: "إذن لعرض الأماكن المتاحة في الفرق";
    readonly module: "team_management";
} | {
    readonly code: "CREATE_FIELD";
    readonly name_en: "Create Field";
    readonly name_ar: "إنشاء ملعب";
    readonly description_en: "Create new sports fields";
    readonly description_ar: "إنشاء ملاعب رياضية جديدة";
    readonly module: "field_management";
} | {
    readonly code: "VIEW_FIELDS";
    readonly name_en: "View Fields";
    readonly name_ar: "عرض الملاعب";
    readonly description_en: "View sports fields and their details";
    readonly description_ar: "عرض الملاعب الرياضية وتفاصيلها";
    readonly module: "field_management";
} | {
    readonly code: "UPDATE_FIELD";
    readonly name_en: "Update Field";
    readonly name_ar: "تحديث ملعب";
    readonly description_en: "Update field information";
    readonly description_ar: "تحديث معلومات الملاعب";
    readonly module: "field_management";
} | {
    readonly code: "DELETE_FIELD";
    readonly name_en: "Delete Field";
    readonly name_ar: "حذف ملعب";
    readonly description_en: "Delete sports fields";
    readonly description_ar: "حذف الملاعب الرياضية";
    readonly module: "field_management";
} | {
    readonly code: "VIEW_ALL_BOOKINGS";
    readonly name_en: "View All Bookings";
    readonly name_ar: "عرض جميع الحجوزات";
    readonly description_en: "View all field bookings across the system";
    readonly description_ar: "عرض جميع حجوزات الملاعب في النظام";
    readonly module: "bookings";
} | {
    readonly code: "MANAGE_FIELD_BOOKINGS";
    readonly name_en: "Manage Field Bookings";
    readonly name_ar: "إدارة حجوزات الملاعب";
    readonly description_en: "Manage field booking settings and complete bookings";
    readonly description_ar: "إدارة إعدادات حجز الملاعب وإكمال الحجوزات";
    readonly module: "bookings";
} | {
    readonly code: "VIEW_MEMBERS";
    readonly name_en: "View Members";
    readonly name_ar: "عرض الأعضاء";
    readonly description_en: "View all club members and their profiles";
    readonly description_ar: "عرض جميع أعضاء النادي وملفاتهم الشخصية";
    readonly module: "member_management";
} | {
    readonly code: "CREATE_MEMBER";
    readonly name_en: "Create Member";
    readonly name_ar: "إنشاء عضو";
    readonly description_en: "Create new member accounts";
    readonly description_ar: "إنشاء حسابات أعضاء جدد";
    readonly module: "member_management";
} | {
    readonly code: "UPDATE_MEMBER";
    readonly name_en: "Update Member";
    readonly name_ar: "تحديث بيانات العضو";
    readonly description_en: "Update member profile information";
    readonly description_ar: "تحديث معلومات ملف العضو الشخصي";
    readonly module: "member_management";
} | {
    readonly code: "DELETE_MEMBER";
    readonly name_en: "Delete Member";
    readonly name_ar: "حذف عضو";
    readonly description_en: "Delete member accounts from system";
    readonly description_ar: "حذف حسابات الأعضاء من النظام";
    readonly module: "member_management";
} | {
    readonly code: "VIEW_SPORTS";
    readonly name_en: "View Sports";
    readonly name_ar: "عرض الرياضات";
    readonly description_en: "View all sports offered by the club";
    readonly description_ar: "عرض جميع الرياضات المقدمة من النادي";
    readonly module: "sports_management";
} | {
    readonly code: "CREATE_SPORT";
    readonly name_en: "Create Sport";
    readonly name_ar: "إنشاء رياضة";
    readonly description_en: "Add new sports to the system";
    readonly description_ar: "إضافة رياضات جديدة إلى النظام";
    readonly module: "sports_management";
} | {
    readonly code: "UPDATE_SPORT";
    readonly name_en: "Update Sport";
    readonly name_ar: "تحديث الرياضة";
    readonly description_en: "Update sport information and settings";
    readonly description_ar: "تحديث معلومات الرياضة والإعدادات";
    readonly module: "sports_management";
} | {
    readonly code: "DELETE_SPORT";
    readonly name_en: "Delete Sport";
    readonly name_ar: "حذف الرياضة";
    readonly description_en: "Delete sports from the system";
    readonly description_ar: "حذف الرياضات من النظام";
    readonly module: "sports_management";
} | {
    readonly code: "VIEW_FINANCE";
    readonly name_en: "View Finance";
    readonly name_ar: "عرض الشؤون المالية";
    readonly description_en: "View financial reports and transactions";
    readonly description_ar: "عرض التقارير المالية والعمليات";
    readonly module: "finance";
} | {
    readonly code: "MANAGE_PAYMENTS";
    readonly name_en: "Manage Payments";
    readonly name_ar: "إدارة المدفوعات";
    readonly description_en: "Manage payment processing and reconciliation";
    readonly description_ar: "إدارة معالجة المدفوعات والتسويات";
    readonly module: "finance";
} | {
    readonly code: "EXPORT_FINANCIAL_REPORTS";
    readonly name_en: "Export Financial Reports";
    readonly name_ar: "تصدير التقارير المالية";
    readonly description_en: "Export financial data and reports";
    readonly description_ar: "تصدير البيانات والتقارير المالية";
    readonly module: "finance";
} | {
    readonly code: "STAFF_CREATE";
    readonly name_en: "Create Staff";
    readonly name_ar: "إنشاء موظف";
    readonly description_en: "Create new staff member accounts";
    readonly description_ar: "إنشاء حسابات موظفي جدد";
    readonly module: "staff_management";
} | {
    readonly code: "VIEW_STAFF";
    readonly name_en: "View Staff";
    readonly name_ar: "عرض الموظفين";
    readonly description_en: "View all staff members and their details";
    readonly description_ar: "عرض جميع الموظفين وتفاصيلهم";
    readonly module: "staff_management";
} | {
    readonly code: "UPDATE_STAFF";
    readonly name_en: "Update Staff";
    readonly name_ar: "تحديث بيانات الموظف";
    readonly description_en: "Update staff profile and role information";
    readonly description_ar: "تحديث ملف الموظف ومعلومات الدور";
    readonly module: "staff_management";
} | {
    readonly code: "DELETE_STAFF";
    readonly name_en: "Delete Staff";
    readonly name_ar: "حذف موظف";
    readonly description_en: "Remove staff members from system";
    readonly description_ar: "إزالة الموظفين من النظام";
    readonly module: "staff_management";
} | {
    readonly code: "MANAGE_PRIVILEGES";
    readonly name_en: "Manage Privileges";
    readonly name_ar: "إدارة الأذونات";
    readonly description_en: "Assign and revoke staff privileges";
    readonly description_ar: "تعيين ورفع أذونات الموظفين";
    readonly module: "staff_management";
} | {
    readonly code: "VIEW_PRIVILEGES";
    readonly name_en: "View Privileges";
    readonly name_ar: "عرض الأذونات";
    readonly description_en: "View staff privileges and assignments";
    readonly description_ar: "عرض أذونات الموظفين والتعيينات";
    readonly module: "staff_management";
} | {
    readonly code: "audit.view";
    readonly name_en: "View Audit Logs";
    readonly name_ar: "عرض سجلات التدقيق";
    readonly description_en: "View system audit logs and activity history";
    readonly description_ar: "عرض سجلات تدقيق النظام وسجل النشاط";
    readonly module: "audit";
} | {
    readonly code: "audit.manage";
    readonly name_en: "Manage Audit";
    readonly name_ar: "إدارة التدقيق";
    readonly description_en: "Manage audit settings and retention policies";
    readonly description_ar: "إدارة إعدادات التدقيق وسياسات الاحتفاظ";
    readonly module: "audit";
} | {
    readonly code: "media.view";
    readonly name_en: "View Media Gallery";
    readonly name_ar: "عرض معرض الوسائط";
    readonly description_en: "View media gallery and media content";
    readonly description_ar: "عرض معرض الوسائط ومحتوى الوسائط";
    readonly module: "media";
} | {
    readonly code: "media.create";
    readonly name_en: "Create Media";
    readonly name_ar: "إنشاء وسائط";
    readonly description_en: "Upload and create media content";
    readonly description_ar: "تحميل وإنشاء محتوى وسائط";
    readonly module: "media";
} | {
    readonly code: "media.edit";
    readonly name_en: "Edit Media";
    readonly name_ar: "تعديل الوسائط";
    readonly description_en: "Edit media information and metadata";
    readonly description_ar: "تعديل معلومات الوسائط والبيانات الوصفية";
    readonly module: "media";
} | {
    readonly code: "media.delete";
    readonly name_en: "Delete Media";
    readonly name_ar: "حذف الوسائط";
    readonly description_en: "Delete media content from gallery";
    readonly description_ar: "حذف محتوى الوسائط من المعرض";
    readonly module: "media";
} | {
    readonly code: "VIEW_MEMBERSHIP_PLANS";
    readonly name_en: "View Membership Plans";
    readonly name_ar: "عرض خطط العضوية";
    readonly description_en: "View all membership plans offered";
    readonly description_ar: "عرض جميع خطط العضوية المقدمة";
    readonly module: "membership";
} | {
    readonly code: "CREATE_MEMBERSHIP_PLAN";
    readonly name_en: "Create Membership Plan";
    readonly name_ar: "إنشاء خطة عضوية";
    readonly description_en: "Create new membership plans";
    readonly description_ar: "إنشاء خطط عضوية جديدة";
    readonly module: "membership";
} | {
    readonly code: "UPDATE_MEMBERSHIP_PLAN";
    readonly name_en: "Update Membership Plan";
    readonly name_ar: "تحديث خطة العضوية";
    readonly description_en: "Update membership plan details";
    readonly description_ar: "تحديث تفاصيل خطة العضوية";
    readonly module: "membership";
} | {
    readonly code: "DELETE_MEMBERSHIP_PLAN";
    readonly name_en: "Delete Membership Plan";
    readonly name_ar: "حذف خطة العضوية";
    readonly description_en: "Delete membership plans from system";
    readonly description_ar: "حذف خطط العضوية من النظام";
    readonly module: "membership";
} | {
    readonly code: "VIEW_FACULTIES";
    readonly name_en: "View Faculties";
    readonly name_ar: "عرض الكليات";
    readonly description_en: "View all university faculties";
    readonly description_ar: "عرض جميع كليات الجامعة";
    readonly module: "faculties";
} | {
    readonly code: "CREATE_FACULTY";
    readonly name_en: "Create Faculty";
    readonly name_ar: "إنشاء كلية";
    readonly description_en: "Add new university faculties";
    readonly description_ar: "إضافة كليات جامعة جديدة";
    readonly module: "faculties";
} | {
    readonly code: "UPDATE_FACULTY";
    readonly name_en: "Update Faculty";
    readonly name_ar: "تحديث الكلية";
    readonly description_en: "Update faculty information";
    readonly description_ar: "تحديث معلومات الكلية";
    readonly module: "faculties";
} | {
    readonly code: "DELETE_FACULTY";
    readonly name_en: "Delete Faculty";
    readonly name_ar: "حذف الكلية";
    readonly description_en: "Delete faculties from system";
    readonly description_ar: "حذف الكليات من النظام";
    readonly module: "faculties";
} | {
    readonly code: "SYSTEM_ADMIN";
    readonly name_en: "System Administrator";
    readonly name_ar: "مسؤول النظام";
    readonly description_en: "Full system administration access";
    readonly description_ar: "الوصول الكامل لإدارة النظام";
    readonly module: "system_admin";
} | {
    readonly code: "VIEW_SYSTEM_SETTINGS";
    readonly name_en: "View System Settings";
    readonly name_ar: "عرض إعدادات النظام";
    readonly description_en: "View system configuration and settings";
    readonly description_ar: "عرض إعدادات وتكوين النظام";
    readonly module: "system_admin";
} | {
    readonly code: "MANAGE_SYSTEM_SETTINGS";
    readonly name_en: "Manage System Settings";
    readonly name_ar: "إدارة إعدادات النظام";
    readonly description_en: "Modify system configuration and settings";
    readonly description_ar: "تعديل إعدادات وتكوين النظام";
    readonly module: "system_admin";
} | {
    readonly code: "admin.invite";
    readonly name_en: "Invite Admins";
    readonly name_ar: "دعوة المسؤولين";
    readonly description_en: "Send admin invitation links to new administrators";
    readonly description_ar: "إرسال روابط دعوة المسؤول للمسؤولين الجدد";
    readonly module: "admin_management";
} | {
    readonly code: "admin.manage";
    readonly name_en: "Manage Admins";
    readonly name_ar: "إدارة المسؤولين";
    readonly description_en: "Manage admin accounts and access levels";
    readonly description_ar: "إدارة حسابات المسؤولين ومستويات الوصول";
    readonly module: "admin_management";
};
/**
 * Check if a privilege exists
 */
export declare function hasPrivilege(code: string): code is keyof typeof PRIVILEGES;
/**
 * Get all modules used in the system
 */
export declare function getAllModules(): string[];
/**
 * Export summary statistics
 */
export declare const PRIVILEGES_SUMMARY: {
    readonly total_privileges: number;
    readonly modules: string[];
    readonly modules_count: number;
    readonly by_module: {
        [k: string]: number;
    };
};
//# sourceMappingURL=Privileges.d.ts.map