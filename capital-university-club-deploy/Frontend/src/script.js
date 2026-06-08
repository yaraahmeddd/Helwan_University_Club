const fs = require('fs');

const path = 'c:\\Users\\H\\Helwan_University_Club\\capital-university-club-deploy\\Frontend\\src\\pages\\StaffManagementPage.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add useTranslation import
if (!content.includes('import { useTranslation }')) {
    content = content.replace('import i18n from "../i18n";', 'import i18n from "../i18n";\nimport { useTranslation } from "react-i18next";');
}

// 2. Add useTranslation to StatusBadge
content = content.replace(
    'function StatusBadge({ status, row }: { status?: string; row?: StaffRow }) {',
    'function StatusBadge({ status, row }: { status?: string; row?: StaffRow }) {\n    const { t } = useTranslation("StaffManagementPage");'
);
content = content.replace(
    '{isActive ? "نشط" : "غير نشط"}',
    '{isActive ? t("status.active") : t("status.inactive")}'
);

// 3. Add useTranslation to DetailPanel
content = content.replace(
    'function DetailPanel({ row, details, privileges, loading, roleName, onDelete, staffTypeOptions, onSave, isSaving, defaultEditing = false }: DetailPanelProps) {',
    'function DetailPanel({ row, details, privileges, loading, roleName, onDelete, staffTypeOptions, onSave, isSaving, defaultEditing = false }: DetailPanelProps) {\n    const { t, i18n } = useTranslation("StaffManagementPage");'
);

content = content.replace(
    'toast({ title: "خطأ في البيانات", description: "يجب إدخال الاسم الأول بالعربية أو الإنجليزية", variant: "destructive" });',
    'toast({ title: t("toasts.dataError.title"), description: t("toasts.dataError.desc"), variant: "destructive" });'
);
content = content.replace(
    'toast({ title: "رقم هاتف غير صحيح", description: "يجب أن يبدأ الرقم بـ 010, 011, 012, أو 015", variant: "destructive" });',
    'toast({ title: t("toasts.phoneError.title"), description: t("toasts.phoneError.desc"), variant: "destructive" });'
);

content = content.replace(
    '{isActive ? "نشط" : "غير نشط"}</span',
    '{isActive ? t("status.active") : t("status.inactive")}</span'
);

content = content.replace(
    'جارٍ التحميل...',
    '{t("detailPanel.loading")}'
);

content = content.replace(
    'الاسم</p>',
    '{t("detailPanel.sections.name")}</p>'
);

content = content.replace(
    'label: "الاسم الأول (عربي)"',
    'label: t("detailPanel.fields.firstNameAr")'
);
content = content.replace(
    'label: "اسم العائلة (عربي)"',
    'label: t("detailPanel.fields.lastNameAr")'
);
content = content.replace(
    'label: "First Name (EN)"',
    'label: t("detailPanel.fields.firstNameEn")'
);
content = content.replace(
    'label: "Last Name (EN)"',
    'label: t("detailPanel.fields.lastNameEn")'
);

content = content.replace(
    'بيانات التواصل</p>',
    '{t("detailPanel.sections.contact")}</p>'
);

content = content.replace(
    '>رقم الهاتف</span>',
    '>{t("detailPanel.fields.phone")}</span>'
);
content = content.replace(
    '>العنوان</span>',
    '>{t("detailPanel.fields.address")}</span>'
);

content = content.replace(
    'بيانات التوظيف</p>',
    '{t("detailPanel.sections.employment")}</p>'
);
content = content.replace(
    '>الوظيفة</p>',
    '>{t("detailPanel.fields.job")}</p>'
);
content = content.replace(
    'placeholder="اختر نوع الوظيفة"',
    'placeholder={t("detailPanel.placeholders.selectJob")}'
);

content = content.replace(
    'بيانات التواصل</p>', // second instance
    '{t("detailPanel.sections.contact")}</p>'
);

content = content.replace(
    'label: "البريد الإلكتروني"',
    'label: t("detailPanel.fields.email")'
);
content = content.replace(
    'label: "رقم الهاتف"',
    'label: t("detailPanel.fields.phone")'
);
content = content.replace(
    'label: "الرقم القومي"',
    'label: t("detailPanel.fields.nationalId")'
);
content = content.replace(
    'label: "العنوان"',
    'label: t("detailPanel.fields.address")'
);

content = content.replace(
    'بيانات التوظيف</p>', // second instance
    '{t("detailPanel.sections.employment")}</p>'
);
content = content.replace(
    'label: "بداية العمل"',
    'label: t("detailPanel.fields.startDate")'
);
content = content.replace(
    'label: "نهاية العمل"',
    'label: t("detailPanel.fields.endDate")'
);
content = content.replace(
    'label: "الوظيفة"',
    'label: t("detailPanel.fields.job")'
);

content = content.replace(
    'الحزم المخصصة</p>',
    '{t("detailPanel.sections.assignedPackages")}</p>'
);
content = content.replace(
    'لا توجد حزم مخصصة</div>',
    '{t("detailPanel.messages.noPackages")}</div>'
);

content = content.replace(
    'الصلاحيات الفردية',
    '{t("detailPanel.sections.privileges")}'
);
content = content.replace(
    'عرض الصلاحيات',
    '{t("detailPanel.actions.viewPrivileges")}'
);

content = content.replace(
    '{isSaving ? "جارٍ الحفظ..." : <><Pencil className="w-3.5 h-3.5" /> حفظ التغييرات</>}',
    '{isSaving ? t("detailPanel.actions.saving") : <><Pencil className="w-3.5 h-3.5" /> {t("detailPanel.actions.saveChanges")}</>}'
);
content = content.replace(
    '<X className="w-3.5 h-3.5" /> إلغاء',
    '<X className="w-3.5 h-3.5" /> {t("detailPanel.actions.cancel")}'
);
content = content.replace(
    '<Pencil className="w-3.5 h-3.5" /> تعديل',
    '<Pencil className="w-3.5 h-3.5" /> {t("detailPanel.actions.edit")}'
);
content = content.replace(
    '<Trash2 className="w-3.5 h-3.5" /> إلغاء تفعيل',
    '<Trash2 className="w-3.5 h-3.5" /> {t("detailPanel.actions.deactivate")}'
);

// 4. Main Page hook
content = content.replace(
    'export default function StaffManagementPage() {\n    const { toast } = useToast();',
    'export default function StaffManagementPage() {\n    const { t, i18n } = useTranslation("StaffManagementPage");\n    const { toast } = useToast();'
);

content = content.replace(
    'toast({ title: "تعذر تحميل قائمة الموظفين", description: err instanceof Error ? err.message : "", variant: "destructive" });',
    'toast({ title: t("toasts.loadFailed.title"), description: err instanceof Error ? err.message : "", variant: "destructive" });'
);
content = content.replace(
    'toast({ title: "تم التحديث", description: "تم تحديث بيانات الموظف بنجاح" });',
    'toast({ title: t("toasts.updateSuccess.title"), description: t("toasts.updateSuccess.desc") });'
);
content = content.replace(
    'toast({ title: "فشل التحديث", description: err instanceof Error ? err.message : "", variant: "destructive" });',
    'toast({ title: t("toasts.updateFailed.title"), description: err instanceof Error ? err.message : "", variant: "destructive" });'
);
content = content.replace(
    'toast({ title: "تم إلغاء التفعيل", description: "تم إلغاء تفعيل الموظف بنجاح" });',
    'toast({ title: t("toasts.deactivateSuccess.title"), description: t("toasts.deactivateSuccess.desc") });'
);
content = content.replace(
    'toast({ title: "فشل إلغاء التفعيل", description: err instanceof Error ? err.message : "", variant: "destructive" });',
    'toast({ title: t("toasts.deactivateFailed.title"), description: err instanceof Error ? err.message : "", variant: "destructive" });'
);

content = content.replace(
    'dir="rtl"',
    'dir={i18n.language === "ar" ? "rtl" : "ltr"}'
);

content = content.replace(
    'إدارة الموظفين\n                    </h1>',
    '{t("page.title")}\n                    </h1>'
);
content = content.replace(
    'إجمالي الموظفين: <strong>{total}</strong>',
    '{t("page.totalStaff")}: <strong>{total}</strong>'
);
content = content.replace(
    'موظف جديد',
    '{t("page.newStaff")}'
);

content = content.replace(
    'aria-label="الصفحة السابقة"',
    'aria-label={t("list.prevPage")}'
);
content = content.replace(
    '<ChevronRight className="w-4 h-4" />',
    '<ChevronRight className="w-4 h-4" style={{ transform: i18n.language === "ar" ? "none" : "rotate(180deg)" }} />'
);
content = content.replace(
    'aria-label="الصفحة التالية"',
    'aria-label={t("list.nextPage")}'
);
content = content.replace(
    '<ChevronLeft className="w-4 h-4" />',
    '<ChevronLeft className="w-4 h-4" style={{ transform: i18n.language === "ar" ? "none" : "rotate(180deg)" }} />'
);

content = content.replace(
    '<Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />',
    '<Search className={`absolute ${i18n.language === "ar" ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground`} />'
);
content = content.replace(
    'placeholder="بحث بالاسم..."',
    'placeholder={t("list.searchPlaceholder")}'
);
content = content.replace(
    'className="pr-9 h-9 text-sm"',
    'className={`h-9 text-sm ${i18n.language === "ar" ? "pr-9" : "pl-9"}`}'
);

// Tables
content = content.replace(
    'className="text-right px-4 py-3 font-semibold text-xs text-muted-foreground whitespace-nowrap align-middle w-10">#</TableHead>',
    'className={`text-${i18n.language === "ar" ? "right" : "left"} px-4 py-3 font-semibold text-xs text-muted-foreground whitespace-nowrap align-middle w-10`}>{t("table.headers.number")}</TableHead>'
);
content = content.replace(
    'className="text-right pr-4 pl-4 py-3 font-semibold text-xs text-muted-foreground whitespace-nowrap align-middle">الموظف</TableHead>',
    'className={`text-${i18n.language === "ar" ? "right" : "left"} pr-4 pl-4 py-3 font-semibold text-xs text-muted-foreground whitespace-nowrap align-middle`}>{t("table.headers.staff")}</TableHead>'
);
content = content.replace(
    'className="text-right px-4 py-3 font-semibold text-xs text-muted-foreground whitespace-nowrap align-middle">الوظيفة</TableHead>',
    'className={`text-${i18n.language === "ar" ? "right" : "left"} px-4 py-3 font-semibold text-xs text-muted-foreground whitespace-nowrap align-middle`}>{t("table.headers.job")}</TableHead>'
);
content = content.replace(
    'className="text-right px-4 py-3 font-semibold text-xs text-muted-foreground whitespace-nowrap align-middle">بداية العمل</TableHead>',
    'className={`text-${i18n.language === "ar" ? "right" : "left"} px-4 py-3 font-semibold text-xs text-muted-foreground whitespace-nowrap align-middle`}>{t("table.headers.startDate")}</TableHead>'
);
content = content.replace(
    'className="text-center px-4 py-3 font-semibold text-xs text-muted-foreground whitespace-nowrap align-middle">الحالة</TableHead>',
    'className="text-center px-4 py-3 font-semibold text-xs text-muted-foreground whitespace-nowrap align-middle">{t("table.headers.status")}</TableHead>'
);
content = content.replace(
    'className="text-center px-4 py-3 font-semibold text-xs text-muted-foreground whitespace-nowrap align-middle">الإجراءات</TableHead>',
    'className="text-center px-4 py-3 font-semibold text-xs text-muted-foreground whitespace-nowrap align-middle">{t("table.headers.actions")}</TableHead>'
);

content = content.replace(
    'لم يتم العثور على موظفين</p>',
    '{t("table.states.noStaff")}</p>'
);
content = content.replace(
    'إضافة الموظف الأول',
    '{t("table.states.addFirstStaff")}'
);

fs.writeFileSync(path, content, 'utf8');
console.log('done');
