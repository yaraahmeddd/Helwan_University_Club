import { useState, useEffect, useRef } from 'react';
import {
  Briefcase,
  CalendarCheck,
  CalendarX,
  CreditCard,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Trash2,
  User,
  Users,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { RoleGuard } from '../RoleGuard';
import { useToast } from '../../../hooks/use-toast';
import { useLanguage } from '../../../hooks/useLanguage';
import { useLocalizedTranslation } from '../../../hooks/useLocalizedTranslation';
import { buildPersonName, getBilingualFieldPlaceholder } from '../../../lib/localizedDisplay';
import { validateStaffEdit } from '../../../lib/validation';
import { validateAdminStaffContactForm } from '../../../lib/validation/adminForms';
import { useAdminFieldValidation } from '../../../hooks/useAdminFieldValidation';
import { FieldInlineError } from './FieldInlineError';
import { useAdminFormatters } from './adminFormatters';
import { adminDialogStyles } from './adminTableStyles';
import { adminFieldIcons } from './adminRecordFields';
import {
  RecordViewField,
  RecordViewProfileHeader,
  RecordViewSection,
  RecordViewTabs,
} from './RecordViewPrimitives';

export type StaffRow = {
  id: string;
  firstNameEn?: string;
  firstNameAr?: string;
  lastNameEn?: string;
  lastNameAr?: string;
  email?: string;
  nationalId: string;
  phone: string;
  address?: string;
  staffTypeId: number;
  staffTypeLabel: string;
  staffTypeCode?: string;
  status?: string;
  isActive?: boolean;
  employmentStartDate?: string;
  employmentEndDate?: string | null;
};

export type StaffDetailsData = {
  id: number;
  first_name_en?: string;
  first_name_ar?: string;
  last_name_en?: string;
  last_name_ar?: string;
  email?: string;
  national_id?: string;
  phone?: string;
  address?: string;
  staff_type_id?: number | string;
  employment_start_date?: string;
  employment_end_date?: string | null;
  status?: string;
  personal_photo?: string | null;
  national_id_front?: string | null;
  national_id_back?: string | null;
  academic_certificate?: string | null;
  military_service_doc?: string | null;
  criminal_record?: string | null;
  employer_approval_letter?: string | null;
  employment_status_statement?: string | null;
  good_conduct_certificate?: string | null;
  personal_info_form?: string | null;
  experience_certificates?: string | null;
};

export type EditFormData = {
  first_name_ar: string;
  last_name_ar: string;
  first_name_en: string;
  last_name_en: string;
  phone: string;
  address: string;
  staff_type_id: string;
  documentFiles?: Record<string, File>;
};

type StaffDetailPanelProps = {
  row: StaffRow;
  details: StaffDetailsData | null;
  loading: boolean;
  roleName: string;
  onDelete: () => void;
  staffTypeOptions: { id: number; label: string }[];
  onSave: (data: Partial<EditFormData>) => Promise<void>;
  isSaving: boolean;
  defaultEditing?: boolean;
};

const getFileUrl = (f?: string | null): string => {
  if (!f) return '';
  if (f.startsWith('http') || f.startsWith('blob:') || f.startsWith('data:')) return f;
  const base = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || '';
  const url = `${base}/${f.replace(/^\/+/, '')}`;
  return encodeURI(url);
};

function staffIsActive(row: StaffRow, details?: StaffDetailsData | null) {
  const status = (details?.status ?? row.status ?? '').toLowerCase();
  if (status === 'cancelled' || status === 'inactive') return false;
  return row.isActive !== false;
}

export function StaffDetailPanel({
  row,
  details,
  loading,
  roleName,
  onDelete,
  staffTypeOptions,
  onSave,
  isSaving,
  defaultEditing = false,
}: StaffDetailPanelProps) {
  const { t } = useLocalizedTranslation('StaffManagementPage');
  const { t: tVal } = useTranslation('validation');
  const { language, isRTL } = useLanguage();
  const { toast } = useToast();
  const { fmtDate } = useAdminFormatters();
  const { handleArabicChange, handleEnglishChange, handlePhoneChange } = useAdminFieldValidation();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string | undefined>>({});
  const notAvailable = t('common:notAvailable', { defaultValue: '—' });

  const [detailTab, setDetailTab] = useState<'info' | 'photos'>('info');
  const [isEditing, setIsEditing] = useState(defaultEditing);
  const [editFirstNameAr, setEditFirstNameAr] = useState(details?.first_name_ar ?? row.firstNameAr ?? '');
  const [editLastNameAr, setEditLastNameAr] = useState(details?.last_name_ar ?? row.lastNameAr ?? '');
  const [editFirstNameEn, setEditFirstNameEn] = useState(details?.first_name_en ?? row.firstNameEn ?? '');
  const [editLastNameEn, setEditLastNameEn] = useState(details?.last_name_en ?? row.lastNameEn ?? '');
  const [editPhone, setEditPhone] = useState(details?.phone ?? (row.phone === '—' ? '' : row.phone));
  const [editAddress, setEditAddress] = useState(details?.address ?? row.address ?? '');
  const [editStaffTypeId, setEditStaffTypeId] = useState(String((details?.staff_type_id ?? row.staffTypeId) || ''));
  const [documentFiles, setDocumentFiles] = useState<Record<string, File>>({});

  const nameParts = details
    ? {
        firstNameAr: details.first_name_ar,
        lastNameAr: details.last_name_ar,
        firstNameEn: details.first_name_en,
        lastNameEn: details.last_name_en,
      }
    : {
        firstNameAr: row.firstNameAr,
        lastNameAr: row.lastNameAr,
        firstNameEn: row.firstNameEn,
        lastNameEn: row.lastNameEn,
      };
  const { primary: displayName, secondary: subtitleName } = buildPersonName(nameParts, language);
  const isActive = staffIsActive(row, details);

  const hasPopulated = useRef(false);

  useEffect(() => {
    if (isEditing && !loading && !hasPopulated.current) {
      setEditFirstNameAr(details?.first_name_ar ?? row.firstNameAr ?? '');
      setEditLastNameAr(details?.last_name_ar ?? row.lastNameAr ?? '');
      setEditFirstNameEn(details?.first_name_en ?? row.firstNameEn ?? '');
      setEditLastNameEn(details?.last_name_en ?? row.lastNameEn ?? '');
      setEditPhone(details?.phone ?? (row.phone === '—' ? '' : row.phone));
      setEditAddress(details?.address ?? row.address ?? '');
      setEditStaffTypeId(String((details?.staff_type_id ?? row.staffTypeId) || ''));
      hasPopulated.current = true;
    }
  }, [isEditing, loading, details, row]);

  const startEdit = () => {
    hasPopulated.current = false;
    setDocumentFiles({});
    setIsEditing(true);
    setDetailTab('info');
  };

  const handleSave = async () => {
    const validationError = validateStaffEdit(
      {
        first_name_ar: editFirstNameAr,
        last_name_ar: editLastNameAr,
        first_name_en: editFirstNameEn,
        last_name_en: editLastNameEn,
        phone: editPhone,
      },
      tVal,
    );
    const contactErrors = validateAdminStaffContactForm({ phone: editPhone, address: editAddress }, tVal);
    const mergedErrors = { ...(validationError ? { _form: validationError } : {}), ...contactErrors };
    if (Object.keys(mergedErrors).length > 0) {
      if (validationError) {
        toast({ title: t('toasts.dataError.title'), description: validationError, variant: 'destructive' });
      } else {
        setFieldErrors(contactErrors);
        toast({ title: t('toasts.dataError.title'), description: Object.values(contactErrors)[0], variant: 'destructive' });
      }
      return;
    }
    setFieldErrors({});
    try {
      const payload: Partial<EditFormData> = {};
      if (editFirstNameAr !== (details?.first_name_ar ?? row.firstNameAr ?? '')) payload.first_name_ar = editFirstNameAr;
      if (editLastNameAr !== (details?.last_name_ar ?? row.lastNameAr ?? '')) payload.last_name_ar = editLastNameAr;
      if (editFirstNameEn !== (details?.first_name_en ?? row.firstNameEn ?? '')) payload.first_name_en = editFirstNameEn;
      if (editLastNameEn !== (details?.last_name_en ?? row.lastNameEn ?? '')) payload.last_name_en = editLastNameEn;
      if (editPhone !== (details?.phone ?? (row.phone === '—' ? '' : row.phone))) payload.phone = editPhone;
      if (editAddress !== (details?.address ?? row.address ?? '')) payload.address = editAddress;
      if (editStaffTypeId !== String((details?.staff_type_id ?? row.staffTypeId) || '')) payload.staff_type_id = editStaffTypeId;
      if (Object.keys(documentFiles).length > 0) payload.documentFiles = documentFiles;

      if (Object.keys(payload).length > 0) {
        await onSave(payload);
      }
      setIsEditing(false);
    } catch {
      /* stay in edit mode */
    }
  };

  return (
    <div className={adminDialogStyles.panel} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="px-6 pt-5 pb-0 border-b border-border shrink-0">
        <RecordViewProfileHeader
          photoUrl={getFileUrl(details?.personal_photo) || null}
          photoAlt={t('detailPanel.tabs.photos')}
          name={displayName}
          subtitle={subtitleName}
          badges={
            <>
              <span className="text-[11px] bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 font-medium">
                {roleName}
              </span>
              <span
                className={`text-[11px] rounded-full px-2.5 py-0.5 font-medium ${
                  isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}
              >
                {isActive ? t('status.active') : t('status.cancelled')}
              </span>
            </>
          }
        />
        <div className="mt-3">
          <RecordViewTabs
            tabs={[
              { key: 'info', label: t('detailPanel.tabs.info') },
              { key: 'photos', label: t('detailPanel.tabs.photos') },
            ]}
            active={detailTab}
            onChange={setDetailTab}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-2" />
            {t('detailPanel.loading')}
          </div>
        ) : detailTab === 'info' ? (
          <div className="p-5 space-y-4">
            {isEditing ? (
              <>
                <RecordViewSection icon={Users} title={t('detailPanel.sections.name')}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        label: t('detailPanel.fields.firstNameAr'),
                        value: editFirstNameAr,
                        setValue: setEditFirstNameAr,
                        dir: 'rtl' as const,
                        placeholder: getBilingualFieldPlaceholder('ar', 'StaffManagementPage', 'detailPanel.placeholders.firstNameAr'),
                      },
                      {
                        label: t('detailPanel.fields.lastNameAr'),
                        value: editLastNameAr,
                        setValue: setEditLastNameAr,
                        dir: 'rtl' as const,
                        placeholder: getBilingualFieldPlaceholder('ar', 'StaffManagementPage', 'detailPanel.placeholders.lastNameAr'),
                      },
                      {
                        label: t('detailPanel.fields.firstNameEn'),
                        value: editFirstNameEn,
                        setValue: setEditFirstNameEn,
                        dir: 'ltr' as const,
                        placeholder: getBilingualFieldPlaceholder('en', 'StaffManagementPage', 'detailPanel.placeholders.firstNameEn'),
                      },
                      {
                        label: t('detailPanel.fields.lastNameEn'),
                        value: editLastNameEn,
                        setValue: setEditLastNameEn,
                        dir: 'ltr' as const,
                        placeholder: getBilingualFieldPlaceholder('en', 'StaffManagementPage', 'detailPanel.placeholders.lastNameEn'),
                      },
                    ].map(({ label, value, setValue, dir, placeholder }) => (
                      <div key={label} className="space-y-1">
                        <label className="text-[11px] text-muted-foreground">{label}</label>
                        <input
                          value={value}
                          onChange={(e) => {
                            const next = e.target.value;
                            if (dir === 'ltr') {
                              handleEnglishChange(next, setValue, (message) => setFieldErrors((prev) => ({ ...prev, [label]: message })), 'name');
                            } else {
                              handleArabicChange(next, setValue, (message) => setFieldErrors((prev) => ({ ...prev, [label]: message })), 'name');
                            }
                          }}
                          dir={dir}
                          placeholder={placeholder}
                          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                        />
                      </div>
                    ))}
                  </div>
                </RecordViewSection>

                <RecordViewSection icon={Phone} title={t('detailPanel.sections.contact')}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-muted-foreground">{t('detailPanel.fields.phone')}</label>
                      <input
                        value={editPhone}
                        onChange={(e) => {
                          handlePhoneChange(e.target.value, setEditPhone);
                          setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                        }}
                        dir="ltr"
                        type="tel"
                        inputMode="numeric"
                        className={`w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary ${fieldErrors.phone ? 'border-destructive' : 'border-border'}`}
                      />
                      <FieldInlineError message={fieldErrors.phone} />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[11px] text-muted-foreground">{t('detailPanel.fields.address')}</label>
                      <input
                        value={editAddress}
                        onChange={(e) => {
                          setEditAddress(e.target.value);
                          setFieldErrors((prev) => ({ ...prev, address: undefined }));
                        }}
                        placeholder={t('detailPanel.placeholders.address')}
                        className={`w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:border-primary ${fieldErrors.address ? 'border-destructive' : 'border-border'}`}
                      />
                      <FieldInlineError message={fieldErrors.address} />
                    </div>
                  </div>
                </RecordViewSection>

                <RecordViewSection icon={Briefcase} title={t('detailPanel.sections.employment')}>
                  <Select value={editStaffTypeId} onValueChange={setEditStaffTypeId}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder={t('detailPanel.placeholders.selectJob')} />
                    </SelectTrigger>
                    <SelectContent>
                      {staffTypeOptions.map((type) => (
                        <SelectItem key={type.id} value={String(type.id)}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </RecordViewSection>
              </>
            ) : (
              <>
                <RecordViewSection icon={adminFieldIcons.personalSection} title={t('detailPanel.sections.personal')}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <RecordViewField icon={User} label={t('detailPanel.fields.firstNameAr')} value={nameParts.firstNameAr} fallback={notAvailable} />
                    <RecordViewField icon={User} label={t('detailPanel.fields.lastNameAr')} value={nameParts.lastNameAr} fallback={notAvailable} />
                    <RecordViewField icon={User} label={t('detailPanel.fields.firstNameEn')} value={nameParts.firstNameEn} ltr fallback={notAvailable} />
                    <RecordViewField icon={User} label={t('detailPanel.fields.lastNameEn')} value={nameParts.lastNameEn} ltr fallback={notAvailable} />
                    <RecordViewField icon={CreditCard} label={t('detailPanel.fields.nationalId')} value={details?.national_id ?? row.nationalId} ltr alignEnd={isRTL} fallback={notAvailable} />
                  </div>
                </RecordViewSection>

                <RecordViewSection icon={adminFieldIcons.contactSection} title={t('detailPanel.sections.contact')}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <RecordViewField icon={Mail} label={t('detailPanel.fields.email')} value={details?.email ?? row.email} ltr fallback={notAvailable} />
                    <RecordViewField icon={Phone} label={t('detailPanel.fields.phone')} value={details?.phone ?? row.phone} ltr alignEnd={isRTL} fallback={notAvailable} />
                    <RecordViewField icon={MapPin} label={t('detailPanel.fields.address')} value={details?.address ?? row.address} className="sm:col-span-2" fallback={notAvailable} />
                  </div>
                </RecordViewSection>

                <RecordViewSection icon={Briefcase} title={t('detailPanel.sections.employment')}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <RecordViewField icon={Briefcase} label={t('detailPanel.fields.job')} value={roleName} fallback={notAvailable} />
                    <RecordViewField icon={CalendarCheck} label={t('detailPanel.fields.startDate')} value={fmtDate(details?.employment_start_date ?? row.employmentStartDate)} ltr fallback={notAvailable} />
                  </div>
                </RecordViewSection>
              </>
            )}
          </div>
        ) : (
          <div className="p-5 space-y-5">
            <RecordViewSection icon={CreditCard} title={t('detailPanel.photos.documents', { defaultValue: 'Documents' })}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'personal_photo', label: t('detailPanel.photos.personalPhoto', { defaultValue: 'Personal Photo' }), src: details?.personal_photo },
                  { key: 'national_id_front', label: t('detailPanel.photos.idFront', { defaultValue: 'ID Front' }), src: details?.national_id_front },
                  { key: 'national_id_back', label: t('detailPanel.photos.idBack', { defaultValue: 'ID Back' }), src: details?.national_id_back },
                  { key: 'academic_certificate', label: t('detailPanel.photos.academicCert', { defaultValue: 'Academic Certificate' }), src: details?.academic_certificate },
                  { key: 'military_service_doc', label: t('detailPanel.photos.military', { defaultValue: 'Military Service Doc' }), src: details?.military_service_doc },
                  { key: 'criminal_record', label: t('detailPanel.photos.criminal', { defaultValue: 'Criminal Record' }), src: details?.criminal_record },
                  { key: 'employer_approval_letter', label: t('detailPanel.photos.employerApproval', { defaultValue: 'Employer Approval Letter' }), src: details?.employer_approval_letter },
                  { key: 'employment_status_statement', label: t('detailPanel.photos.employmentStatus', { defaultValue: 'Employment Status Statement' }), src: details?.employment_status_statement },
                  { key: 'good_conduct_certificate', label: t('detailPanel.photos.goodConduct', { defaultValue: 'Good Conduct Certificate' }), src: details?.good_conduct_certificate },
                  { key: 'personal_info_form', label: t('detailPanel.photos.personalInfo', { defaultValue: 'Personal Info Form' }), src: details?.personal_info_form },
                  { key: 'experience_certificates', label: t('detailPanel.photos.experienceCert', { defaultValue: 'Experience Certificates' }), src: details?.experience_certificates },
                ]
                  .map((doc) => (
                  <div key={doc.label} className="relative rounded-xl border border-border bg-muted/20 overflow-hidden group">
                    <p className="px-3 py-2 text-xs font-medium border-b border-border bg-muted/40">{doc.label}</p>
                    <div className="h-40 flex items-center justify-center p-2 relative">
                      {documentFiles[doc.key] ? (
                        <div className="text-center">
                          <p className="text-sm font-medium text-primary">New file selected</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[150px]">{documentFiles[doc.key]?.name}</p>
                        </div>
                      ) : getFileUrl(doc.src) ? (
                        <a href={getFileUrl(doc.src)} target="_blank" rel="noreferrer" className="w-full h-full">
                          <img src={getFileUrl(doc.src)} alt={doc.label} className="w-full h-full object-contain" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">{t('detailPanel.photos.notUploaded', { defaultValue: 'Not uploaded' })}</span>
                      )}

                      {isEditing && (
                        <label className="absolute inset-0 bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                          <span className="text-sm font-medium">{t('detailPanel.actions.edit', { defaultValue: 'Change' })}</span>
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setDocumentFiles(prev => ({ ...prev, [doc.key]: file }));
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </RecordViewSection>
          </div>
        )}
      </div>

      <div className="border-t border-border px-5 py-3 flex gap-2 bg-muted/20 shrink-0">
        {isEditing ? (
          <>
            <Button size="sm" className="flex-1 gap-1.5" onClick={() => void handleSave()} disabled={isSaving}>
              {isSaving ? t('detailPanel.actions.saving') : t('detailPanel.actions.saveChanges')}
            </Button>
            <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={() => setIsEditing(false)} disabled={isSaving}>
              <X className="w-3.5 h-3.5" /> {t('detailPanel.actions.cancel')}
            </Button>
          </>
        ) : (
          <>
            <RoleGuard privilege="UPDATE_STAFF">
              <Button size="sm" className="flex-1 gap-1.5" onClick={startEdit}>
                <Pencil className="w-3.5 h-3.5" /> {t('detailPanel.actions.edit')}
              </Button>
            </RoleGuard>
            <RoleGuard privilege="TERMINATE_STAFF">
              <Button size="sm" variant="destructive" className="flex-1 gap-1.5" onClick={onDelete}>
                <Trash2 className="w-3.5 h-3.5" /> {t('detailPanel.actions.deactivate')}
              </Button>
            </RoleGuard>
          </>
        )}
      </div>
    </div>
  );
}
