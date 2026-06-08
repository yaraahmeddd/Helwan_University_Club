import { useCallback, useEffect, useMemo, useState } from "react";
import { StaffService } from "../services/staffService";
import { getLocalizedText, type DisplayLanguage } from "./localizedDisplay";

export type StaffTypeRecord = {
    id: number;
    code?: string;
    name_ar?: string;
    name_en?: string;
    title_ar?: string;
    title_en?: string;
};

export const STATIC_STAFF_TYPES: StaffTypeRecord[] = [
    { id: 1, code: "ADMIN", name_ar: "المسئول", name_en: "Admin" },
    { id: 2, code: "CEO", name_ar: "المدير التنفيذى", name_en: "Executive Director" },
    { id: 3, code: "DEPUTY_CEO", name_ar: "نائب المدير التنفيذى", name_en: "Deputy Executive Director" },
    { id: 4, code: "EVENTS_MANAGER", name_ar: "مدير الفاعليات والاحداث", name_en: "Events Manager" },
    { id: 5, code: "EXEC_SECRETARY_MANAGER", name_ar: "مدير السكرتارية التنفيذىة", name_en: "Executive Secretariat Manager" },
    { id: 6, code: "MEDIA_CENTER_MANAGER", name_ar: "مدير المركز الاعلامى", name_en: "Media Center Manager" },
    { id: 7, code: "SPORT_ACTIVITY_SPECIALIST", name_ar: "اخصائى النشاط الرياضى", name_en: "Sports Activity Specialist" },
    { id: 8, code: "FINANCE_MANAGER", name_ar: "مدير الشئون المالية", name_en: "Finance Manager" },
    { id: 9, code: "HR_MEMBERSHIP_MANAGER", name_ar: "مدير الموارد البشرية وشئون العضوية", name_en: "HR Manager" },
    { id: 10, code: "CONTRACTS_MANAGER", name_ar: "مدير التعاقدات", name_en: "Contracts Manager" },
    { id: 11, code: "MAINTENANCE_MANAGER", name_ar: "مدير الصيانة", name_en: "Maintenance Manager" },
    { id: 12, code: "SPORT_ACTIVITY_MANAGER", name_ar: "مدير النشاط الرياضى", name_en: "Sports Activity Manager" },
    { id: 13, code: "SOCIAL_ACTIVITY_MANAGER", name_ar: "مدير النشاط الاجتماعى", name_en: "Social Activity Manager" },
    { id: 14, code: "PR_MANAGER", name_ar: "مدير العلاقات العامة", name_en: "PR Manager" },
    { id: 15, code: "MEDIA_CENTER_SPECIALIST", name_ar: "اخصائى المركز الاعلامى", name_en: "Media Center Specialist" },
    { id: 16, code: "MAINTENANCE_OFFICER", name_ar: "مسئول الصيانة", name_en: "Maintenance Officer" },
    { id: 17, code: "ADMIN_OFFICER", name_ar: "مسئول الشئون الادارية", name_en: "Admin Affairs Officer" },
    { id: 18, code: "SUPPORT_SERVICES", name_ar: "خدمات معاونة", name_en: "Support Services" },
    { id: 19, code: "SPORT_MANAGER", name_ar: "مدير الأنشطة الرياضية", name_en: "Sport Activity Manager" },
    { id: 20, code: "SPORT_SPECIALIST", name_ar: "أخصائي الأنشطة الرياضية", name_en: "Sport Activity Specialist" },
];

export type StaffJobLabelInput = {
    staffTypeId?: number;
    staffTypeNameAr?: string;
    staffTypeNameEn?: string;
    staffTypeCode?: string;
};

export function resolveStaffJobLabel(
    input: StaffJobLabelInput,
    language: DisplayLanguage,
    staffTypes: StaffTypeRecord[] = STATIC_STAFF_TYPES,
): string {
    const typeId = Number(input.staffTypeId) || 0;

    if (typeId > 0) {
        const byId = staffTypes.find((st) => st.id === typeId);
        if (byId) {
            const label = getLocalizedText(byId.name_ar || byId.title_ar, byId.name_en || byId.title_en, language);
            if (label) return label;
            if (byId.code) return byId.code;
        }
    }

    if (input.staffTypeCode) {
        const byCode = staffTypes.find(
            (st) => st.code?.toUpperCase() === input.staffTypeCode?.toUpperCase(),
        );
        if (byCode) {
            const label = getLocalizedText(byCode.name_ar || byCode.title_ar, byCode.name_en || byCode.title_en, language);
            if (label) return label;
        }
    }

    const direct = getLocalizedText(input.staffTypeNameAr, input.staffTypeNameEn, language);
    if (direct) return direct;

    if (input.staffTypeNameAr) {
        const byAr = staffTypes.find(
            (st) => (st.name_ar || st.title_ar) === input.staffTypeNameAr,
        );
        if (byAr) {
            return getLocalizedText(byAr.name_ar || byAr.title_ar, byAr.name_en || byAr.title_en, language)
                || input.staffTypeNameAr;
        }
    }

    return input.staffTypeCode || input.staffTypeNameAr || input.staffTypeNameEn || "—";
}

export function useStaffJobLabels(language: DisplayLanguage) {
    const [staffTypes, setStaffTypes] = useState<StaffTypeRecord[]>(STATIC_STAFF_TYPES);

    useEffect(() => {
        StaffService.getStaffTypes()
            .then((res) => {
                if (res.success && Array.isArray(res.data)) {
                    setStaffTypes(res.data as StaffTypeRecord[]);
                }
            })
            .catch(() => undefined);
    }, []);

    const labelById = useMemo(() => {
        const map = new Map<number, string>();
        staffTypes.forEach((st) => {
            map.set(
                st.id,
                getLocalizedText(st.name_ar || st.title_ar, st.name_en || st.title_en, language)
                    || st.code
                    || `#${st.id}`,
            );
        });
        return map;
    }, [staffTypes, language]);

    const resolveJobLabel = useCallback(
        (input: StaffJobLabelInput) => resolveStaffJobLabel(input, language, staffTypes),
        [language, staffTypes],
    );

    return { staffTypes, labelById, resolveJobLabel };
}
