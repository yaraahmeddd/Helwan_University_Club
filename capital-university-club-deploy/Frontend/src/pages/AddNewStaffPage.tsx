import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Check, Copy, UploadCloud, X, AlertTriangle, User, IdCard, Phone, MapPin, Calendar, Briefcase, ChevronRight, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface InputGroupProps {
  label: string | React.ReactNode;
  error?: any;
  children: React.ReactNode;
  className?: string;
}

const InputGroup = ({ label, error, children, className = "" }: InputGroupProps) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      {children}
      <AnimatePresence>
          {error && (
              <motion.span
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-500 text-xs flex items-center gap-1 font-medium"
              >
                  <AlertTriangle size={12} /> {error.message}
              </motion.span>
          )}
      </AnimatePresence>
  </div>
);

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useStaffFormSchema } from "../hooks/useValidation";
import type { StaffFormValues } from "../lib/validation/schemas";
import { useAdminFieldValidation } from "../hooks/useAdminFieldValidation";
import { StaffService } from "../services/staffService";

import { Button } from "../components/StaffPagesComponents/ui/button";
import { Input } from "../components/StaffPagesComponents/ui/input";
import { Label } from "../components/StaffPagesComponents/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/StaffPagesComponents/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/StaffPagesComponents/ui/dialog";
import { useToast } from "../hooks/use-toast";
import i18n from "../i18n";
import { useTranslation } from "react-i18next";
import { getPrivilegeDisplayName, getPrivilegeModuleLabel, shouldShowPrivilegeCode, compareLocalizedText } from "../lib/privilegeModuleLabels";

type StaffType = {
  id: number;
  code?: string;
  name_ar?: string;
  name_en?: string;
  title_ar?: string;
  title_en?: string;
};

type PrivilegeApiItem = {
  id: number;
  code: string;
  name_en?: string;
  name_ar?: string;
  module?: string;
};

type PackageApiItem = {
  id: number;
  code?: string;
  name_ar?: string;
  name_en?: string;
  description_ar?: string;
  description_en?: string;
};

type PackageOption = {
  key: string;
  backendId: number;
  code: string;
  name: string;
  description?: string;
  privilegeCodes: string[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const normalizePrivilegesResponse = (response: unknown): PrivilegeApiItem[] => {
  if (!isRecord(response)) return [];
  const payload = response.data;

  if (Array.isArray(payload)) {
    const privileges: PrivilegeApiItem[] = [];
    payload.forEach((item) => {
      if (!isRecord(item)) return;
      const id = Number(item.id);
      const code = String(item.code ?? "").trim();
      if (!Number.isFinite(id) || !code) return;
      privileges.push({
        id,
        code,
        name_en: String(item.name_en ?? ""),
        name_ar: String(item.name_ar ?? ""),
        module: String(item.module ?? "General"),
      });
    });
    return privileges;
  }

  if (!isRecord(payload)) return [];

  const privileges: PrivilegeApiItem[] = [];
  Object.entries(payload).forEach(([moduleName, list]) => {
    if (!Array.isArray(list)) return;

    list.forEach((item) => {
      if (!isRecord(item)) return;
      const id = Number(item.id);
      const code = String(item.code ?? "").trim();
      if (!Number.isFinite(id) || !code) return;

      privileges.push({
        id,
        code,
        name_en: String(item.name_en ?? ""),
        name_ar: String(item.name_ar ?? ""),
        module: String((item.module ?? moduleName) || "General"),
      });
    });
  });

  return privileges;
};

const normalizePackagePrivilegeCodes = (response: unknown): string[] => {
  const rawList = isRecord(response) && Array.isArray(response.data)
    ? response.data
    : Array.isArray(response)
      ? response
      : [];

  return Array.from(
    new Set(
      rawList
        .map((item) => {
          if (!isRecord(item)) return "";
          return String(item.code ?? "").trim();
        })
        .filter(Boolean),
    ),
  );
};



const STATIC_STAFF_TYPES: StaffType[] = [
  { id: 1, code: "ADMIN", name_en: "Admin", name_ar: "المسئول" },
  { id: 2, code: "CEO", name_en: "Executive Director", name_ar: "المدير التنفيذى" },
  { id: 3, code: "DEPUTY_CEO", name_en: "Deputy Executive Director", name_ar: "نائب المدير التنفيذى" },
  { id: 4, code: "EVENTS_MANAGER", name_en: "Events and Activities Manager", name_ar: "مدير الفاعليات والاحداث" },
  { id: 5, code: "EXEC_SECRETARY_MANAGER", name_en: "Executive Secretariat Manager", name_ar: "مدير السكرتارية التنفيذىة" },
  { id: 6, code: "MEDIA_CENTER_MANAGER", name_en: "Media Center Manager", name_ar: "مدير المركز الاعلامى" },
  { id: 7, code: "SPORT_ACTIVITY_SPECIALIST", name_en: "Sports Activity Specialist", name_ar: "اخصائى النشاط الرياضى" },
  { id: 8, code: "FINANCE_MANAGER", name_en: "Finance Manager", name_ar: "مدير الشئون المالية" },
  { id: 9, code: "HR_MEMBERSHIP_MANAGER", name_en: "HR and Membership Affairs Manager", name_ar: "مدير الموارد البشرية وشئون العضوية" },
  { id: 10, code: "CONTRACTS_MANAGER", name_en: "Contracts Manager", name_ar: "مدير التعاقدات" },
  { id: 11, code: "MAINTENANCE_MANAGER", name_en: "Maintenance Manager", name_ar: "مدير الصيانة" },
  { id: 12, code: "SPORT_ACTIVITY_MANAGER", name_en: "Sports Activity Manager", name_ar: "مدير النشاط الرياضى" },
  { id: 13, code: "SOCIAL_ACTIVITY_MANAGER", name_en: "Social Activity Manager", name_ar: "مدير النشاط الاجتماعى" },
  { id: 14, code: "PR_MANAGER", name_en: "Public Relations Manager", name_ar: "مدير العلاقات العامة" },
  { id: 15, code: "MEDIA_CENTER_SPECIALIST", name_en: "Media Center Specialist", name_ar: "اخصائى المركز الاعلامى" },
  { id: 16, code: "MAINTENANCE_OFFICER", name_en: "Maintenance Officer", name_ar: "مسئول الصيانة" },
  { id: 17, code: "ADMIN_OFFICER", name_en: "Administrative Affairs Officer", name_ar: "مسئول الشئون الادارية" },
  { id: 18, code: "SUPPORT_SERVICES", name_en: "Support Services", name_ar: "خدمات معاونة" },
  { id: 19, code: "SPORT_MANAGER", name_en: "Sport Activity Manager", name_ar: "مدير الأنشطة الرياضية" },
  { id: 20, code: "SPORT_SPECIALIST", name_en: "Sport Activity Specialist", name_ar: "أخصائي الأنشطة الرياضية" },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf", "image/webp", "image/bmp", "image/heic"];

interface DocumentUploadCardProps {
  id: string;
  label: string;
  badgeType: "required" | "optional" | "conditional";
  badgeText?: string;
  warningText?: string;
  file: File | null;
  onFileChange: (id: string, file: File | null) => void;
  error?: string | null;
  highlightError?: boolean;
}

function DocumentUploadCard({
  id, label, badgeType, badgeText, warningText, file, onFileChange, error, highlightError
}: DocumentUploadCardProps) {
  const { t } = useTranslation("AddNewStaffPage");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (f: File) => {
    setLocalError(null);
    if (f.size > MAX_FILE_SIZE) {
      setLocalError(t("documents.maxSize"));
      return;
    }
    if (!ALLOWED_TYPES.includes(f.type)) {
      setLocalError(t("documents.unsupportedType"));
      return;
    }
    onFileChange(id, f);
  };

  const badgeColors = {
    required: "bg-red-100 text-red-700 border-red-200",
    optional: "bg-gray-100 text-gray-700 border-gray-200",
    conditional: "bg-amber-100 text-amber-700 border-amber-200",
  };

  const defaultBadgeText = {
    required: t("documents.required"),
    optional: t("documents.optional"),
    conditional: t("documents.conditional"),
  };

  const finalBadgeText = badgeText || defaultBadgeText[badgeType];

  const ringClass = highlightError ? "ring-2 ring-red-500 ring-offset-2 bg-red-50/10 rounded-xl p-1" : "";

  return (
    <div
        id={`doc-card-${id}`}
        onClick={() => !file && fileInputRef.current?.click()}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
            relative border-2 border-dashed p-6 rounded-2xl cursor-pointer transition-all duration-300 group
            flex flex-col items-center justify-center text-center h-full
            ${file ? 'border-primary-500 bg-primary-50/50' : 'border-gray-200 bg-gray-50 hover:border-primary-300 hover:bg-white'}
            ${(error || localError) ? "border-red-400 bg-red-50/50" : ""}
            ${ringClass}
        `}
    >
        <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".jpg,.jpeg,.png,.pdf,.webp,.bmp,.heic"
            onChange={handleChange}
        />
        
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${badgeColors[badgeType]}`}>
                {finalBadgeText}
            </span>
            {file && (
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0 h-6 w-6 rounded-full"
                onClick={(e) => { e.stopPropagation(); onFileChange(id, null); }}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
        </div>

        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 mt-6 transition-colors
             ${file ? 'bg-primary-100 text-primary-600' : 'bg-gray-200 text-gray-500 group-hover:bg-primary-100 group-hover:text-primary-600'}`}>
            {file ? <Check size={28} /> : <UploadCloud size={28} />}
        </div>

        <p className={`font-bold text-base ${file ? 'text-primary-900' : 'text-gray-600'}`}>{label}</p>

        <p className="text-sm text-gray-400 mt-2 max-w-[200px] truncate" dir="ltr">
            {file ? file.name : t("documents.uploadPrompt")}
        </p>

        {warningText && (
            <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2 py-1 mt-3 rounded text-[10px] border border-amber-200">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                <p>{warningText}</p>
            </div>
        )}
        
        {(error || localError) && (
            <p className="text-xs text-red-500 font-medium mt-2">{error || localError}</p>
        )}
    </div>
  );
}

// Module labels handled via getPrivilegeModuleLabel()

/** Wider, responsive grid for package & privilege pickers */
const PICKER_GRID_CLASS =
  "grid w-full grid-cols-1 min-[520px]:grid-cols-2 xl:grid-cols-3 gap-3 auto-rows-fr";

const PICKER_CARD_BASE =
  "flex h-full w-full items-start gap-3 rounded-lg border px-4 py-3 text-start transition-all min-h-[58px]";

const PICKER_CHECKBOX_BASE =
  "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors";

const hiddenHorizontalScrollbar =
  "overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]";

export default function AddNewStaffPage() {
  const { t, i18n } = useTranslation("AddNewStaffPage");
  const { toast } = useToast();
  const navigate = useNavigate();

  const staffFormSchema = useStaffFormSchema();

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
    trigger,
  } = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      first_name_en: "",
      first_name_ar: "",
      last_name_en: "",
      last_name_ar: "",
      national_id: "",
      phone: "",
      address: "",
      staff_type_id: "",
      employment_start_date: "",
    },
  });

  const {
    handleArabicChange,
    handleEnglishChange,
    handleDigitsChange,
    handlePhoneChange,
  } = useAdminFieldValidation();

  const staffTypeId = watch("staff_type_id");
  const firstNameAr = watch("first_name_ar");
  const lastNameAr = watch("last_name_ar");
  const firstNameEn = watch("first_name_en");
  const lastNameEn = watch("last_name_en");
  const nationalId = watch("national_id");
  const phone = watch("phone");
  const address = watch("address");

  const firstNameArField = register("first_name_ar");
  const lastNameArField = register("last_name_ar");
  const firstNameEnField = register("first_name_en");
  const lastNameEnField = register("last_name_en");
  const nationalIdField = register("national_id");
  const phoneField = register("phone");
  const addressField = register("address");
  const uiLanguage = (i18n.language === 'ar' ? 'ar' : 'en') as 'ar' | 'en';
  const inputClasses = "w-full px-4 py-3 rounded-xl border border-border bg-muted/30 focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 outline-none placeholder:text-muted-foreground text-foreground";

  // Stepper & Gender State
  const [step, setStep] = useState(1);
  const [gender, setGender] = useState("ذكر");

  const [documentFiles, setDocumentFiles] = useState<Record<string, File | null>>({
    academic_certificate: null,
    national_id_front: null,
    military_service_doc: null,
    criminal_record: null,
    employer_approval_letter: null,
    employment_status_statement: null,
    good_conduct_certificate: null,
    personal_photo: null,
    personal_info_form: null,
    experience_certificates: null,
  });

  const handleFileChange = useCallback((id: string, file: File | null) => {
    setDocumentFiles((prev) => ({ ...prev, [id]: file }));
  }, []);

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [softValidationPending, setSoftValidationPending] = useState(false);
  const [pendingSubmitData, setPendingSubmitData] = useState<StaffFormValues | null>(null);
  const [isManualSubmitting, setIsManualSubmitting] = useState(false);

  const handleNextStep = async () => {
    const isValid = await trigger();
    if (isValid) {
      setStep(2);
    }
  };

  // Package & Privilege State
  const [backendPackages, setBackendPackages] = useState<PackageApiItem[]>([]);
  const [selectedPackageKeys, setSelectedPackageKeys] = useState<string[]>([]);
  const [allPrivileges, setAllPrivileges] = useState<PrivilegeApiItem[]>([]);
  const [selectedExtraPrivilegeIds, setSelectedExtraPrivilegeIds] = useState<number[]>([]);
  const [excludedPackagePrivilegeIds, setExcludedPackagePrivilegeIds] = useState<number[]>([]);
  const [packagePrivilegeCodesByKey, setPackagePrivilegeCodesByKey] = useState<Record<string, string[]>>({});
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [loadingPrivileges, setLoadingPrivileges] = useState(false);
  // #8 — error states for all three async fetches
  const [staffTypesError, setStaffTypesError] = useState(false);
  const [packagesError, setPackagesError] = useState(false);
  const [privilegesError, setPrivilegesError] = useState(false);

  // #7 — ref to track which backend package keys are already being fetched
  //       prevents the package-privilege effect from firing twice for the same package
  const fetchingPackageKeys = useRef(new Set<string>());

  // Credentials Dialog State
  const [createdCredentials, setCreatedCredentials] = useState<{ national_id: string } | null>(null);
  const [copiedNationalId, setCopiedNationalId] = useState(false);
  const [activePrivilegeTab, setActivePrivilegeTab] = useState<string | null>(null);
  const privilegeModuleTabsRef = useRef<HTMLDivElement>(null);
  const isRTL = i18n.language === 'ar';

  const scrollPrivilegeModuleTabs = useCallback((direction: "back" | "forward") => {
    const el = privilegeModuleTabsRef.current;
    if (!el) return;
    const amount = Math.max(220, Math.floor(el.clientWidth * 0.55));
    const delta = direction === "back"
      ? (isRTL ? amount : -amount)
      : (isRTL ? -amount : amount);
    el.scrollBy({ left: delta, behavior: "smooth" });
  }, [isRTL]);

  // Dynamic Staff Types State — starts with static fallback, replaced by API on mount
  const [staffTypes, setStaffTypes] = useState<StaffType[]>(STATIC_STAFF_TYPES);
  const [staffTypesFromApi, setStaffTypesFromApi] = useState(false);

  // #5 — expose a retry so the UI can prompt the user when using fallback data
  const loadStaffTypes = useCallback(async () => {
    setStaffTypesError(false);
    try {
      const res = await StaffService.getStaffTypes();
      if (res.success && Array.isArray(res.data)) {
        setStaffTypes(res.data);
        setStaffTypesFromApi(true);
      } else {
        // API succeeded but returned unexpected shape — keep fallback, flag stale
        setStaffTypesError(true);
      }
    } catch (error) {
      console.error("Failed to load staff types", error);
      setStaffTypesError(true);
    }
  }, []);

  useEffect(() => { void loadStaffTypes(); }, [loadStaffTypes]);

  const staffTypeOptions = useMemo(
    () =>
      staffTypes.map((type) => ({
        id: type.id,
        label: (i18n.language === 'ar' ? (type.name_ar || type.title_ar || type.name_en || type.title_en) : (type.name_en || type.title_en || type.name_ar || type.title_ar)) || `#${type.id}`,
      })),
    [staffTypes, i18n.language],
  );

  const packageOptions = useMemo<PackageOption[]>(() => {
    return backendPackages.map((pkg) => {
      const key = `backend:${pkg.id}`;
      return {
        key,
        backendId: pkg.id,
        code: pkg.code || `PKG_${pkg.id}`,
        name: (i18n.language === 'ar' ? (pkg.name_ar || pkg.name_en) : (pkg.name_en || pkg.name_ar)) || pkg.code || `Package #${pkg.id}`,
        description: pkg.description_ar || pkg.description_en,
        privilegeCodes: packagePrivilegeCodesByKey[key] || [],
      };
    });
  }, [backendPackages, packagePrivilegeCodesByKey]);

  const selectedPackages = useMemo(
    () => packageOptions.filter((pkg) => selectedPackageKeys.includes(pkg.key)),
    [packageOptions, selectedPackageKeys],
  );




  const selectedPackagePrivilegeCodes = useMemo(() => {
    const codeSet = new Set<string>();
    selectedPackages.forEach((pkg) => {
      pkg.privilegeCodes.forEach((code) => codeSet.add(code));
    });
    return codeSet;
  }, [selectedPackages]);

  const groupedPrivileges = useMemo(() => {
    const groupMap = new Map<string, PrivilegeApiItem[]>();

    allPrivileges.forEach((privilege) => {
      const moduleName = privilege.module || "General";
      const current = groupMap.get(moduleName) || [];
      current.push(privilege);
      groupMap.set(moduleName, current);
    });

    return Array.from(groupMap.entries())
      .map(([module, items]) => ({
        module,
        items: [...items].sort((a, b) =>
          compareLocalizedText(
            getPrivilegeDisplayName(a.name_ar, a.name_en, a.code, uiLanguage),
            getPrivilegeDisplayName(b.name_ar, b.name_en, b.code, uiLanguage),
            uiLanguage,
          ),
        ),
      }))
      .sort((a, b) =>
        compareLocalizedText(
          getPrivilegeModuleLabel(a.module, uiLanguage),
          getPrivilegeModuleLabel(b.module, uiLanguage),
          uiLanguage,
        ),
      );
  }, [allPrivileges, uiLanguage]);

  // #8 — packages load with error state + retry
  const loadPackages = useCallback(async () => {
    setLoadingPackages(true);
    setPackagesError(false);
    try {
      const response = await StaffService.getPackages();
      setBackendPackages(response?.data ?? []);
    } catch (error) {
      console.error("Failed to load backend packages", error);
      setBackendPackages([]);
      setPackagesError(true);
    } finally {
      setLoadingPackages(false);
    }
  }, []);

  useEffect(() => { void loadPackages(); }, [loadPackages]);

  // #8 — privileges load with error state + retry
  const loadPrivileges = useCallback(async () => {
    setLoadingPrivileges(true);
    setPrivilegesError(false);
    try {
      const response = await StaffService.getAllPrivileges();
      const normalized = normalizePrivilegesResponse(response);
      setAllPrivileges(normalized);
    } catch (error) {
      console.error("Failed to load privileges", error);
      setAllPrivileges([]);
      setPrivilegesError(true);
    } finally {
      setLoadingPrivileges(false);
    }
  }, []);

  useEffect(() => { void loadPrivileges(); }, [loadPrivileges]);

  useEffect(() => {
    const validPackageKeys = new Set(packageOptions.map((pkg) => pkg.key));

    setSelectedPackageKeys((prev) => {
      const filtered = prev.filter((key) => validPackageKeys.has(key));
      return filtered.length === prev.length ? prev : filtered;
    });
  }, [packageOptions]);

  // Eagerly pre-fetch privilege counts for ALL packages as soon as they load
  // so the count badge is visible on the card before the user clicks anything.
  useEffect(() => {
    const unloaded = packageOptions.filter(
      (pkg) =>
        pkg.backendId !== null &&
        !packagePrivilegeCodesByKey[pkg.key] &&
        !fetchingPackageKeys.current.has(pkg.key),
    );

    if (unloaded.length === 0) return;

    unloaded.forEach((pkg) => fetchingPackageKeys.current.add(pkg.key));

    const prefetch = async () => {
      await Promise.all(
        unloaded.map(async (pkg) => {
          try {
            const response = await StaffService.getPackagePrivileges(pkg.backendId);
            const codes = normalizePackagePrivilegeCodes(response);
            setPackagePrivilegeCodesByKey((prev) => ({ ...prev, [pkg.key]: codes }));
          } catch {
            fetchingPackageKeys.current.delete(pkg.key);
          }
        }),
      );
    };

    void prefetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packageOptions]); // runs whenever the package list changes

  // #7 — fetch privileges for newly selected backend packages
  //       Guards against re-fetching with a ref so packagePrivilegeCodesByKey
  //       is NOT in the dependency array (that combination was the loop risk).
  useEffect(() => {
    const missingBackendPackages = selectedPackages.filter(
      (pkg) =>
        pkg.backendId !== null &&
        !packagePrivilegeCodesByKey[pkg.key] &&
        !fetchingPackageKeys.current.has(pkg.key),
    );

    if (missingBackendPackages.length === 0) return;

    // Mark as in-flight immediately to prevent duplicate fetches
    missingBackendPackages.forEach((pkg) => fetchingPackageKeys.current.add(pkg.key));

    const loadPackagePrivileges = async () => {
      const promises = missingBackendPackages.map(async (pkg) => {
        if (pkg.backendId === null) return;
        try {
          const response = await StaffService.getPackagePrivileges(pkg.backendId);
          const codes = normalizePackagePrivilegeCodes(response);
          setPackagePrivilegeCodesByKey((prev) => ({ ...prev, [pkg.key]: codes }));
        } catch (error) {
          console.error(`Failed to load privileges for package ${pkg.key}`, error);
          // Remove from ref so a manual retry can re-trigger the fetch
          fetchingPackageKeys.current.delete(pkg.key);
        }
      });

      await Promise.all(promises);
    };

    void loadPackagePrivileges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPackages]); // intentionally excludes packagePrivilegeCodesByKey to prevent a feedback loop

  // Clean up excluded privileges when packages change
  useEffect(() => {
    if (excludedPackagePrivilegeIds.length === 0) return;

    // Get all current package privilege IDs
    const currentPackagePrivilegeIds = new Set<number>();
    selectedPackagePrivilegeCodes.forEach((code) => {
      const priv = allPrivileges.find((p) => p.code === code);
      if (priv) currentPackagePrivilegeIds.add(priv.id);
    });

    // Remove excluded privileges that are no longer in any selected package
    setExcludedPackagePrivilegeIds((prev) =>
      prev.filter((id) => currentPackagePrivilegeIds.has(id))
    );
  }, [selectedPackagePrivilegeCodes, allPrivileges]);

  const togglePackage = useCallback((pkgKey: string) => {
    setSelectedPackageKeys((prev) => {
      const isSelected = prev.includes(pkgKey);
      return isSelected ? prev.filter((k) => k !== pkgKey) : [...prev, pkgKey];
    });
  }, []);

  const togglePrivilege = useCallback((privilegeId: number, isInPackage: boolean) => {
    if (isInPackage) {
      // Toggle in excluded privileges
      setExcludedPackagePrivilegeIds((prev) => {
        const isExcluded = prev.includes(privilegeId);
        return isExcluded ? prev.filter((id) => id !== privilegeId) : [...prev, privilegeId];
      });
    } else {
      // Toggle in extra privileges
      setSelectedExtraPrivilegeIds((prev) => {
        const isSelected = prev.includes(privilegeId);
        return isSelected ? prev.filter((id) => id !== privilegeId) : [...prev, privilegeId];
      });
    }
  }, []);


  const onSubmit = async (data: StaffFormValues) => {
      // PART A: Validation
      const hardRequiredDocs = [
        "academic_certificate", "national_id_front", "national_id_back", "personal_photo",
        "personal_info_form", "employer_approval_letter"
      ];
      if (gender === "ذكر") hardRequiredDocs.push("military_service_doc");

    const softRequiredDocs = [
      "criminal_record", "employment_status_statement", "good_conduct_certificate"
    ];

    const missingHardDocs = hardRequiredDocs.filter(id => !documentFiles[id]);
    const missingSoftDocs = softRequiredDocs.filter(id => !documentFiles[id]);

    if (missingHardDocs.length > 0) {
      setValidationErrors(missingHardDocs);
      const firstMissing = document.getElementById(`doc-card-${missingHardDocs[0]}`);
      if (firstMissing) {
        firstMissing.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      toast({
        title: t("dialogs.missingDocsTitle"),
        description: t("dialogs.missingDocsDesc"),
        variant: "destructive",
      });
      return;
    }

    setValidationErrors([]); // Clear errors if any

    if (missingSoftDocs.length > 0) {
      setPendingSubmitData(data);
      setSoftValidationPending(true);
      return;
    }

    await executeSubmit(data);
  };

  const executeSubmit = async (data: StaffFormValues) => {
    setIsManualSubmitting(true);
    try {
      setSoftValidationPending(false);

      const selectedBackendPackageIds = selectedPackages
        .filter((pkg) => pkg.backendId !== null)
        .map((pkg) => pkg.backendId!);

      const extraPrivileges = selectedExtraPrivilegeIds;

      // PART B: Switch to FormData
      const formData = new FormData();
      const token = localStorage.getItem("token") || localStorage.getItem("accessToken") || "";

      // text fields from react-hook-form:
      Object.entries(data).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          formData.append(key, String(val));
        }
      });

      // files:
      Object.entries(documentFiles).forEach(([field, file]) => {
        if (file) formData.append(field, file);
      });

      const res = await fetch("/api/staff/register", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
        // NO Content-Type header — browser sets it automatically with boundary
      });

      if (!res.ok) {
        throw new Error("Network response was not ok");
      }

      const response = await res.json();
      const newStaffId = response?.staff_id;

      if (!newStaffId) {
        throw new Error("Failed to get staff ID from response");
      }

      // Assign backend packages
      if (selectedBackendPackageIds.length > 0) {
        await StaffService.assignPackages(newStaffId, selectedBackendPackageIds);
      }

      // Grant individual extra privileges (outside of packages)
      if (extraPrivileges.length > 0) {
        await StaffService.grantPrivileges(
          newStaffId,
          extraPrivileges,
          "Assigned during staff creation"
        );
      }

      // Revoke excluded package privileges (create overrides with is_granted=false)
      if (excludedPackagePrivilegeIds.length > 0) {
        await StaffService.revokePrivileges(
          newStaffId,
          excludedPackagePrivilegeIds,
          "Excluded from package during staff creation"
        );
      }

      // Show Credentials Dialog
      setCreatedCredentials({
        national_id: data.national_id,
      });

      toast({
        title: t("dialogs.successTitle"),
        description: t("dialogs.successDesc"),
      });

      // Clear Form
      reset();
      setStep(1);
      setGender("ذكر");
      setDocumentFiles({
        academic_certificate: null,
        national_id_front: null,
        military_service_doc: null,
        criminal_record: null,
        employer_approval_letter: null,
        employment_status_statement: null,
        good_conduct_certificate: null,
        personal_photo: null,
        personal_info_form: null,
        experience_certificates: null,
      });
      setSelectedPackageKeys([]);
      setSelectedExtraPrivilegeIds([]);
      setExcludedPackagePrivilegeIds([]);
    } catch (error) {
      console.error("Failed to register staff", error);
      toast({
        title: t("dialogs.failTitle"),
        description: t("dialogs.failDesc"),
        variant: "destructive",
      });
    } finally {
      setIsManualSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 py-12 ${i18n.language === 'ar' ? 'text-right' : 'text-left'}`} dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 max-w-6xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">{t("pageTitle")}</h1>
        <p className="text-muted-foreground mt-1">{t("pageDescription")}</p>
      </motion.div>

      <div className="w-full max-w-3xl mx-auto mb-12 relative z-0 mt-8">
        <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-200 -z-10 rounded-full" />
        <motion.div
            className={`absolute top-1/2 ${i18n.language === 'ar' ? 'right-0' : 'left-0'} h-2 bg-primary-600 -z-10 rounded-full`}
            initial={{ width: "0%" }}
            animate={{ width: step === 1 ? "0%" : "100%" }}
            transition={{ duration: 0.5, ease: "circOut" }}
        />
        <div className="flex justify-between items-center px-12">
          <div className="flex flex-col items-center bg-transparent">
              <motion.div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-4 transition-colors duration-300 bg-white
                      ${step >= 1 ? 'border-primary-600 text-primary-600' : 'border-gray-300 text-gray-300'}`}
                  animate={{ scale: step === 1 ? 1.2 : 1, borderColor: step >= 1 ? '#4f46e5' : '#d1d5db' }}
              >
                  {step > 1 ? <Check size={24} strokeWidth={3} /> : "1"}
              </motion.div>
              <span className={`mt-3 text-sm font-bold transition-colors ${step >= 1 ? 'text-primary-900' : 'text-gray-400'}`}>
                  {t("stepper.step1")}
              </span>
          </div>

          <div className="flex flex-col items-center bg-transparent">
              <motion.div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border-4 transition-colors duration-300 bg-white
                      ${step >= 2 ? 'border-primary-600 text-primary-600' : 'border-gray-300 text-gray-300'}`}
                  animate={{ scale: step === 2 ? 1.2 : 1, borderColor: step >= 2 ? '#4f46e5' : '#d1d5db' }}
              >
                  2
              </motion.div>
              <span className={`mt-3 text-sm font-bold transition-colors ${step >= 2 ? 'text-primary-900' : 'text-gray-400'}`}>
                  {t("stepper.step2")}
              </span>
          </div>
        </div>
      </div>

          <form onSubmit={hookFormSubmit(onSubmit)} className="space-y-6">
            <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} key="step1" className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-white/50 backdrop-blur-sm space-y-8">
                <h3 className="text-2xl font-bold text-primary-900 mb-8 flex items-center gap-3">
                  <div className="p-2 bg-primary-100 rounded-lg"><IdCard className="text-primary-600" /></div>
                  {t("stepper.step1")}
                </h3>
                
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <InputGroup label={t("form.firstNameEn")} error={errors.first_name_en}>
                    <input
                      name={firstNameEnField.name}
                      ref={firstNameEnField.ref}
                      onBlur={firstNameEnField.onBlur}
                      value={firstNameEn ?? ""}
                      onChange={(e) => handleEnglishChange(
                        e.target.value,
                        (v) => setValue("first_name_en", v, { shouldValidate: true, shouldDirty: true }),
                        () => {},
                        'name',
                      )}
                      dir="ltr"
                      className={`${inputClasses} text-left`}
                      maxLength={20}
                    />
                  </InputGroup>

                  <InputGroup label={t("form.firstNameAr")} error={errors.first_name_ar}>
                    <input
                      name={firstNameArField.name}
                      ref={firstNameArField.ref}
                      onBlur={firstNameArField.onBlur}
                      value={firstNameAr ?? ""}
                      onChange={(e) => handleArabicChange(
                        e.target.value,
                        (v) => setValue("first_name_ar", v, { shouldValidate: true, shouldDirty: true }),
                        () => {},
                        'name',
                      )}
                      className={inputClasses}
                      maxLength={20}
                      dir="rtl"
                    />
                  </InputGroup>

                  <InputGroup label={t("form.lastNameEn")} error={errors.last_name_en}>
                    <input
                      name={lastNameEnField.name}
                      ref={lastNameEnField.ref}
                      onBlur={lastNameEnField.onBlur}
                      value={lastNameEn ?? ""}
                      onChange={(e) => handleEnglishChange(
                        e.target.value,
                        (v) => setValue("last_name_en", v, { shouldValidate: true, shouldDirty: true }),
                        () => {},
                        'name',
                      )}
                      dir="ltr"
                      className={`${inputClasses} text-left`}
                      maxLength={20}
                    />
                  </InputGroup>

                  <InputGroup label={t("form.lastNameAr")} error={errors.last_name_ar}>
                    <input
                      name={lastNameArField.name}
                      ref={lastNameArField.ref}
                      onBlur={lastNameArField.onBlur}
                      value={lastNameAr ?? ""}
                      onChange={(e) => handleArabicChange(
                        e.target.value,
                        (v) => setValue("last_name_ar", v, { shouldValidate: true, shouldDirty: true }),
                        () => {},
                        'name',
                      )}
                      className={inputClasses}
                      maxLength={20}
                      dir="rtl"
                    />
                  </InputGroup>
                  
                  <div className="md:col-span-2 h-px bg-gray-100 my-2" />

                  <InputGroup label={t("form.nationalId")} className="md:col-span-2" error={errors.national_id}>
                    <input
                      name={nationalIdField.name}
                      ref={nationalIdField.ref}
                      onBlur={nationalIdField.onBlur}
                      value={nationalId ?? ""}
                      onChange={(e) => handleDigitsChange(
                        e.target.value,
                        (v) => setValue("national_id", v, { shouldValidate: true, shouldDirty: true }),
                        14,
                      )}
                      type="text"
                      dir="ltr"
                      className={`${inputClasses} font-mono tracking-widest text-lg text-left`}
                      maxLength={14}
                      inputMode="numeric"
                    />
                  </InputGroup>

                  <InputGroup label={t("form.gender")}>
                    <select value={gender} onChange={(e) => setGender(e.target.value)} className={inputClasses}>
                      <option value="ذكر">{t("form.male")}</option>
                      <option value="أنثى">{t("form.female")}</option>
                    </select>
                  </InputGroup>

                  <InputGroup label={t("form.phone")} error={errors.phone}>
                    <input
                      name={phoneField.name}
                      ref={phoneField.ref}
                      onBlur={phoneField.onBlur}
                      value={phone ?? ""}
                      onChange={(e) => handlePhoneChange(
                        e.target.value,
                        (v) => setValue("phone", v, { shouldValidate: true, shouldDirty: true }),
                      )}
                      type="tel"
                      dir="ltr"
                      className={`${inputClasses} text-left font-mono`}
                      maxLength={11}
                      inputMode="numeric"
                    />
                  </InputGroup>

                  <div className="md:col-span-2 h-px bg-gray-100 my-2" />

                  <InputGroup label={t("form.address")} className="md:col-span-2" error={errors.address}>
                    <input
                      name={addressField.name}
                      ref={addressField.ref}
                      onBlur={addressField.onBlur}
                      value={address ?? ""}
                      onChange={(e) => setValue(
                        "address",
                        e.target.value.slice(0, 200),
                        { shouldValidate: true, shouldDirty: true },
                      )}
                      className={inputClasses}
                      maxLength={200}
                    />
                  </InputGroup>

                  <InputGroup label={t("form.staffType")} error={errors.staff_type_id}>
                    <select {...register("staff_type_id")} className={inputClasses} required>
                      <option value="" disabled>{t("form.staffTypeSelect")}</option>
                      {staffTypeOptions.map((type) => (
                        <option key={type.id} value={String(type.id)}>{type.label}</option>
                      ))}
                    </select>
                    {staffTypesError && !staffTypesFromApi && (
                        <div className="flex items-center justify-between mt-1 px-2 py-1.5 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                          <span>{t("dialogs.staffTypesError")}</span>
                          <button type="button" onClick={() => void loadStaffTypes()} className={`underline font-medium ${i18n.language === 'ar' ? 'mr-2' : 'ml-2'}`}>{t("packages.retry")}</button>
                        </div>
                    )}
                  </InputGroup>

                  <InputGroup label={t("form.employmentDate")} error={errors.employment_start_date}>
                    <input type="date" {...register("employment_start_date")} dir="ltr" className={`${inputClasses} text-left`} />
                  </InputGroup>
                </div>

            {/* Package Selection Section */}
            <div className="pt-6 mt-2 border-t border-border space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <Label className="text-base font-semibold block text-primary">
                  {t("packages.title")}
                </Label>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
                  <span className="text-xs text-muted-foreground sm:whitespace-nowrap">
                    {t("packages.selectedCount", { count: selectedPackageKeys.length })}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-full sm:w-auto shrink-0 whitespace-nowrap"
                    onClick={() => navigate("/staff/dashboard/admin/staff/assign-privileges")}
                  >
                    {t("packages.assignBtn")}
                  </Button>
                </div>
              </div>

              {loadingPackages && packageOptions.length === 0 ? (
                <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg border border-dashed text-center">
                  {t("packages.loading")}
                </div>
              ) : packagesError && packageOptions.length === 0 ? (
                /* #8 — packages fetch failed, show retry */
                <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <span>{t("packages.error")}</span>
                  <button type="button" onClick={() => void loadPackages()} className="underline font-medium">{t("packages.retry")}</button>
                </div>
              ) : packageOptions.length === 0 ? (
                <div className="text-sm text-muted-foreground bg-muted/30 p-6 rounded-lg text-center border border-dashed flex flex-col items-center gap-2">
                  <span className="text-muted-foreground/50">⚠️</span>
                  <span>{t("packages.empty")}</span>
                </div>
              ) : (
                <div className={PICKER_GRID_CLASS}>
                  {packageOptions.map((pkg) => {
                    const isSelected = selectedPackageKeys.includes(pkg.key);
                    return (
                      <button
                        key={pkg.key}
                        type="button"
                        onClick={() => togglePackage(pkg.key)}
                        className={`
                          ${PICKER_CARD_BASE}
                          ${isSelected
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "border-border bg-card hover:border-primary/30 hover:bg-muted/40"
                          }
                        `}
                      >
                        <span
                          className={`
                            ${PICKER_CHECKBOX_BASE}
                            ${isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/50 bg-background"}
                          `}
                        >
                          {isSelected && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                        </span>
                        <div className="min-w-0 flex-1 space-y-1">
                          <p className="text-sm font-semibold leading-snug line-clamp-2">{pkg.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {t("packages.privilegeCount", { count: pkg.privilegeCodes.length })}
                          </p>
                          {pkg.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {pkg.description}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ── Extra Privileges ─ Tabbed Module Picker ── */}
              <div className="rounded-xl border border-border bg-card shadow-sm">

                {/* Header */}
                <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border bg-muted/30">
                  <div>
                    <p className="text-sm font-semibold">{t("privileges.title")}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t("privileges.subtitle")}</p>
                  </div>
                  {selectedExtraPrivilegeIds.length > 0 && (
                    <span className="text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                      {t('privileges.selected', { count: selectedExtraPrivilegeIds.length })}
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="p-4">
                  {loadingPrivileges ? (
                    <div className="flex items-center gap-2 py-6 justify-center text-sm text-muted-foreground">
                      <span className="animate-spin">⏳</span> {t("privileges.loading")}
                    </div>
                  ) : privilegesError ? (
                    <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      <span>{t("privileges.error")}</span>
                      <button type="button" onClick={() => void loadPrivileges()} className="underline font-medium">{t("packages.retry")}</button>
                    </div>
                  ) : allPrivileges.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">{t("privileges.empty")}</p>
                  ) : (() => {
                    // Determine the active tab — default to first group
                    const currentTab = activePrivilegeTab && groupedPrivileges.some(g => g.module === activePrivilegeTab)
                      ? activePrivilegeTab
                      : groupedPrivileges[0]?.module ?? null;
                    const activeGroup = groupedPrivileges.find(g => g.module === currentTab);

                    return (
                      <div className="space-y-3">

                        {/* Tab bar */}
                        <div className="flex items-center gap-2 border-b border-border pb-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => scrollPrivilegeModuleTabs("back")}
                            aria-label={t("privileges.scrollPrev")}
                          >
                            {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                          </Button>
                          <div
                            ref={privilegeModuleTabsRef}
                            className={`flex flex-1 min-w-0 gap-1.5 pb-1 ${hiddenHorizontalScrollbar}`}
                          >
                          {groupedPrivileges.map((group) => {
                            const extraCount = group.items.filter(
                              (p) => selectedExtraPrivilegeIds.includes(p.id)
                            ).length;
                            const isActive = group.module === currentTab;
                            return (
                              <button
                                key={group.module}
                                type="button"
                                onClick={() => setActivePrivilegeTab(group.module)}
                                className={`
                                  relative flex shrink-0 items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium
                                  transition-all duration-150 whitespace-nowrap
                                  ${isActive
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                                  }
                                `}
                              >
                                {getPrivilegeModuleLabel(group.module, uiLanguage)}
                                {extraCount > 0 && (
                                  <span className={`
                                    text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none
                                    ${isActive ? "bg-white/20 text-white" : "bg-primary/15 text-primary"}
                                  `}>
                                    {extraCount}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => scrollPrivilegeModuleTabs("forward")}
                            aria-label={t("privileges.scrollNext")}
                          >
                            {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </Button>
                        </div>

                        {/* Active tab content */}
                        {activeGroup && (
                          <div className={PICKER_GRID_CLASS}>
                            {activeGroup.items.map((privilege) => {
                              const inPackage = selectedPackagePrivilegeCodes.has(privilege.code);
                              const isExtra = selectedExtraPrivilegeIds.includes(privilege.id);
                              const isExcluded = excludedPackagePrivilegeIds.includes(privilege.id);
                              const isSelected = inPackage && !isExcluded;

                              const checkboxClass = isSelected
                                ? "border-emerald-500 bg-emerald-500 text-white"
                                : isExcluded
                                  ? "border-red-400 bg-white text-red-500"
                                  : isExtra
                                    ? "border-primary bg-primary text-white"
                                    : "border-muted-foreground/50 bg-background group-hover:border-primary/60";

                              return (
                                <button
                                  key={privilege.id}
                                  type="button"
                                  onClick={() => togglePrivilege(privilege.id, inPackage)}
                                  className={`
                                    group ${PICKER_CARD_BASE}
                                    ${isSelected
                                      ? "border-emerald-200 bg-emerald-50/70"
                                      : isExcluded
                                        ? "border-red-200 bg-red-50/70"
                                        : isExtra
                                          ? "border-primary/40 bg-primary/5"
                                          : "border-border bg-card hover:border-primary/30 hover:bg-muted/40"
                                    }
                                  `}
                                >
                                  <span className={`${PICKER_CHECKBOX_BASE} ${checkboxClass}`}>
                                    {isSelected && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                                    {isExcluded && !isSelected && (
                                      <span className="block h-0.5 w-2 rounded-full bg-red-400" />
                                    )}
                                    {isExtra && !isSelected && !isExcluded && (
                                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                                    )}
                                  </span>

                                  <div className="min-w-0 flex-1 text-start">
                                    <p className={`text-sm font-medium leading-snug line-clamp-2 ${isSelected ? "text-emerald-800" : isExcluded ? "text-red-800" : "text-foreground"
                                      }`}>
                                      {getPrivilegeDisplayName(privilege.name_ar, privilege.name_en, privilege.code, uiLanguage) || "—"}
                                    </p>
                                    {shouldShowPrivilegeCode(uiLanguage) && (
                                    <p className="text-xs font-mono text-muted-foreground truncate mt-1">
                                      {privilege.code}
                                    </p>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Footer legend */}
                        <div className="flex flex-wrap items-center gap-4 pt-2 text-[10px] text-muted-foreground border-t border-border">
                          <span className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded border-2 border-emerald-400 bg-emerald-400 inline-flex items-center justify-center">
                              <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </span>
                            {t("privileges.legendIncluded")}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded border-2 border-red-400 bg-white inline-flex items-center justify-center">
                              <svg className="w-2 h-2 text-red-400" fill="none" viewBox="0 0 12 12"><line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                            </span>
                            {t("privileges.legendExcluded")}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded border-2 border-primary bg-primary inline-flex items-center justify-center">
                              <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </span>
                            {t("privileges.legendExtra")}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded border-2 border-muted-foreground/50 inline-block" />
                            {t("privileges.legendNone")}
                          </span>
                        </div>

                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

                <div className="flex flex-col-reverse gap-3 mt-12 pt-6 border-t border-gray-100 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => navigate("/staff/dashboard/admin/staff/list")}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    {isRTL ? <ChevronRight size={20} aria-hidden /> : <ChevronLeft size={20} aria-hidden />}
                    <span>{t("actions.cancel")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>{t("actions.next")}</span>
                    {isRTL ? <ChevronLeft size={20} aria-hidden /> : <ChevronRight size={20} aria-hidden />}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (() => {
              const docsConfig = [
                { id: "academic_certificate", labelAr: t("docsConfig.academicCertificate"), required: true, badgeType: "required" as const },
                { id: "national_id_front", labelAr: t("docsConfig.nationalIdFront"), required: true, badgeType: "required" as const },
                { id: "national_id_back", labelAr: t("docsConfig.nationalIdBack", "National ID - Back"), required: true, badgeType: "required" as const },
                { id: "military_service_doc", labelAr: t("docsConfig.militaryService"), required: true, badgeType: "required" as const },
                { id: "criminal_record", labelAr: t("docsConfig.criminalRecord"), required: false, badgeText: t("docsConfig.badgeNonUni"), badgeType: "conditional" as const },
                { id: "employer_approval_letter", labelAr: t("docsConfig.employerApproval"), required: true, badgeType: "required" as const },
                { id: "employment_status_statement", labelAr: t("docsConfig.employmentStatus"), required: false, badgeText: t("docsConfig.badgeOtherEntities"), badgeType: "conditional" as const },
                { id: "good_conduct_certificate", labelAr: t("docsConfig.goodConduct"), required: false, badgeText: t("docsConfig.badgeNonOtherEntities"), badgeType: "conditional" as const },
                { id: "personal_photo", labelAr: t("docsConfig.personalPhoto"), required: true, badgeType: "required" as const, warningText: t("docsConfig.badgeWarning") },
                { id: "personal_info_form", labelAr: t("docsConfig.personalInfo"), required: true, badgeType: "required" as const },
                { id: "experience_certificates", labelAr: t("docsConfig.experienceCerts"), required: false, badgeText: t("docsConfig.badgeOptional"), badgeType: "optional" as const },
              ];

              const visibleDocs = docsConfig.filter(doc => {
                if (doc.id === 'military_service_doc' && gender !== 'ذكر') return false;
                return true;
              });

              const requiredDocs = visibleDocs.filter(doc => doc.required);
              const uploadedRequiredDocsCount = requiredDocs.filter(doc => documentFiles[doc.id]).length;
              const progressPercentage = requiredDocs.length > 0 ? (uploadedRequiredDocsCount / requiredDocs.length) * 100 : 0;

              return (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-white/50 backdrop-blur-sm space-y-6"
                >
                  {/* Progress Bar */}
                  <div className="bg-muted/10 p-5 rounded-lg border space-y-3">
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span>{t("documents.progressTitle")}</span>
                      <span className={uploadedRequiredDocsCount === requiredDocs.length ? "text-emerald-600" : "text-muted-foreground"}>
                        {t("documents.progressCount", { uploaded: uploadedRequiredDocsCount, total: requiredDocs.length })}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ease-out ${uploadedRequiredDocsCount === requiredDocs.length ? 'bg-emerald-500' : 'bg-primary'}`}
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Documents Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {visibleDocs.map(doc => (
                      <DocumentUploadCard
                        key={doc.id}
                        id={doc.id}
                        label={doc.labelAr}
                        badgeType={doc.badgeType}
                        badgeText={doc.badgeText}
                        warningText={doc.warningText}
                        file={documentFiles[doc.id]}
                        onFileChange={handleFileChange}
                        highlightError={validationErrors.includes(doc.id)}
                      />
                    ))}
                  </div>

                  <div className="flex flex-col-reverse md:flex-row justify-between mt-12 pt-6 border-t border-gray-100 gap-4">
                    <button type="button" onClick={() => setStep(1)} className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold transition-colors flex items-center justify-center gap-2">
                      {isRTL ? <ChevronRight size={20} aria-hidden /> : <ChevronLeft size={20} aria-hidden />}
                      <span>{t("actions.previous")}</span>
                    </button>
                    <button type="submit" disabled={isSubmitting || isManualSubmitting} className="w-full sm:w-auto sm:flex-none px-10 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-md transition-all flex items-center justify-center gap-3">
                      {isSubmitting || isManualSubmitting ? <span className="animate-spin text-xl">⏳</span> : <Check size={24} />}
                      {isSubmitting || isManualSubmitting ? t("actions.saving") : t("actions.save")}
                    </button>
                  </div>
                </motion.div>
              );
            })()}
            </AnimatePresence>
          </form>

      {/* Soft Validation Dialog */}
      <Dialog open={softValidationPending} onOpenChange={setSoftValidationPending}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              {t("dialogs.softWarningTitle")}
            </DialogTitle>
            <DialogDescription className="text-base pt-2 text-foreground">
              {t("dialogs.softWarningDesc")}
              <ul className={`list-disc list-inside mt-3 text-sm text-muted-foreground space-y-1 text-${i18n.language === 'ar' ? 'right' : 'left'}`}>
                {pendingSubmitData && [
                  { id: "criminal_record", label: t("docsConfig.criminalRecord") },
                  { id: "employment_status_statement", label: t("docsConfig.employmentStatus") },
                  { id: "good_conduct_certificate", label: t("docsConfig.goodConduct") }
                ].filter(d => !documentFiles[d.id]).map(d => (
                  <li key={d.id}>{d.label}</li>
                ))}
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button type="button" variant="outline" onClick={() => setSoftValidationPending(false)}>
              {t("dialogs.back")}
            </Button>
            <Button 
              type="button"
              onClick={() => pendingSubmitData && executeSubmit(pendingSubmitData)}
              disabled={isManualSubmitting}
            >
              {isManualSubmitting ? t("actions.saving") : t("dialogs.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credentials Display Dialog */}
      <Dialog open={!!createdCredentials} onOpenChange={(open) => !open && setCreatedCredentials(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <Check className="w-5 h-5" />
              {t("dialogs.accountCreated")}
            </DialogTitle>
            <DialogDescription>
              {t("dialogs.accountCreatedDesc")}
            </DialogDescription>
          </DialogHeader>

          {createdCredentials && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-lg border">
                <Label className="text-xs text-muted-foreground">{t("dialogs.initialPassword")}</Label>
                <div className="flex items-center justify-between bg-background p-2 rounded border mt-1">
                  <code className="text-sm font-mono tracking-widest">{createdCredentials.national_id}</code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      navigator.clipboard.writeText(createdCredentials.national_id);
                      setCopiedNationalId(true);
                      setTimeout(() => setCopiedNationalId(false), 1500);
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        transition: "transform 0.15s ease, color 0.15s ease",
                        transform: copiedNationalId ? "scale(0.7)" : "scale(1)",
                        color: copiedNationalId ? "#16a34a" : undefined,
                      }}
                    >
                      {copiedNationalId ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </span>
                  </Button>
                </div>
              </div>

              <div className="text-xs bg-yellow-50 text-yellow-800 p-3 rounded border border-yellow-200">
                {t("dialogs.passwordWarning")}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setCreatedCredentials(null)} className="w-full">
              {t("dialogs.done")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}