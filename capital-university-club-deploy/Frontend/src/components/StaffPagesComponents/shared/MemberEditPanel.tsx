import {
  Award,
  Calendar,
  Clock,
  CreditCard,
  Globe,
  Hash,
  HeartPulse,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Shield,
  User,
  Users,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { buildPersonName, getBilingualFieldPlaceholder, getEntityName, type DisplayLanguage } from '@/lib/localizedDisplay';
import { formatAdminDate, formatAdminTime } from './adminFormatters';
import { adminFieldIcons } from './adminRecordFields';
import { adminDialogStyles } from './adminTableStyles';
import { FieldInlineError } from './FieldInlineError';
import {
  RecordViewEditableField,
  RecordViewField,
  RecordViewProfileHeader,
  RecordViewSection,
} from './RecordViewPrimitives';

export type MemberEditPanelRow = {
  id: string;
  isTeamPlayer?: boolean;
  memberTypeLabel?: string;
  status: string;
  createdAt?: string;
  email?: string;
};

export type MemberEditPanelDetails = {
  created_at?: string;
  photo?: string | null;
  university_student_detail?: unknown;
  employee_detail?: unknown;
  retired_employee_detail?: unknown;
  outsider_detail?: unknown;
} | null;

export type MemberEditPanelProps = {
  row: MemberEditPanelRow;
  details: MemberEditPanelDetails;
  language: DisplayLanguage;
  isRTL: boolean;
  photoUrl?: string | null;
  fmtDate: (v?: string | null, isRTL?: boolean) => string | undefined;
  statusBadge: React.ReactNode;
  memberTypeBadge: React.ReactNode;
  faculties: Array<{ id: number; name_en?: string; name_ar?: string }>;
  professions: Array<{ id: number; name_en?: string; name_ar?: string }>;
  editSaving: boolean;
  onSave: () => void;
  onCancel: () => void;
  fieldErrors?: Record<string, string | undefined>;
  fields: {
    firstNameAr: string;
    firstNameEn: string;
    lastNameAr: string;
    lastNameEn: string;
    gender: string;
    phone: string;
    birthdate: string;
    nationality: string;
    address: string;
    health: string;
    email: string;
    nationalId: string;
    facultyId: string;
    graduationYear: string;
    professionId: string;
    departmentEn: string;
    departmentAr: string;
    salary: string;
    professionCode: string;
    formerDepartmentEn: string;
    formerDepartmentAr: string;
    retirementDate: string;
    lastSalary: string;
    passportNumber: string;
    country: string;
    visaStatus: string;
    visitorType: string;
    durationMonths: string;
    jobTitleEn: string;
    jobTitleAr: string;
    employmentStatus: string;
  };
  onChange: {
    setFirstNameAr: (v: string) => void;
    setFirstNameEn: (v: string) => void;
    setLastNameAr: (v: string) => void;
    setLastNameEn: (v: string) => void;
    setGender: (v: string) => void;
    setPhone: (v: string) => void;
    setBirthdate: (v: string) => void;
    setNationality: (v: string) => void;
    setAddress: (v: string) => void;
    setHealth: (v: string) => void;
    setEmail: (v: string) => void;
    setNationalId: (v: string) => void;
    setFacultyId: (v: string) => void;
    setGraduationYear: (v: string) => void;
    setProfessionId: (v: string) => void;
    setDepartmentEn: (v: string) => void;
    setDepartmentAr: (v: string) => void;
    setSalary: (v: string) => void;
    setProfessionCode: (v: string) => void;
    setFormerDepartmentEn: (v: string) => void;
    setFormerDepartmentAr: (v: string) => void;
    setRetirementDate: (v: string) => void;
    setLastSalary: (v: string) => void;
    setPassportNumber: (v: string) => void;
    setCountry: (v: string) => void;
    setVisaStatus: (v: string) => void;
    setVisitorType: (v: string) => void;
    setDurationMonths: (v: string) => void;
    setJobTitleEn: (v: string) => void;
    setJobTitleAr: (v: string) => void;
    setEmploymentStatus: (v: string) => void;
  };
};

const fieldInputClass = 'h-10';

function fieldClass(base: string, fieldErrors: Record<string, string | undefined> | undefined, key: string) {
  return fieldErrors?.[key] ? `${base} border-destructive` : base;
}

export function MemberEditPanel({
  row,
  details,
  language,
  isRTL,
  photoUrl,
  fmtDate,
  statusBadge,
  memberTypeBadge,
  faculties,
  professions,
  editSaving,
  onSave,
  onCancel,
  fieldErrors,
  fields: f,
  onChange: set,
}: MemberEditPanelProps) {
  const { t } = useTranslation('MemberManagementPage');
  const notAvailable = t('common.notAvailable', { defaultValue: '—' });
  const showEnFields = language === 'en';

  const { primary: displayName } = buildPersonName(
    {
      firstNameAr: f.firstNameAr,
      lastNameAr: f.lastNameAr,
      firstNameEn: f.firstNameEn,
      lastNameEn: f.lastNameEn,
    },
    language,
  );

  const d = details;
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';
  const createdAt = d?.created_at ?? row.createdAt;

  return (
    <div className={adminDialogStyles.panel} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="px-6 pt-5 pb-4 border-b border-border shrink-0">
        <RecordViewProfileHeader
          photoUrl={photoUrl}
          photoAlt={t('detail.photos.personalPhoto')}
          name={displayName || notAvailable}
          badges={
            <>
              {memberTypeBadge}
              {statusBadge}
            </>
          }
        />
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <RecordViewSection icon={adminFieldIcons.accountSection} title={t('detail.sectionAccount', 'Account Information')}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <RecordViewField
              icon={adminFieldIcons.memberId}
              label={t('detail.fieldMemberId')}
              value={`MEM-${String(row.id).padStart(5, '0')}`}
              ltr
            />
            <RecordViewField
              icon={adminFieldIcons.email}
              label={t('detail.fieldEmail')}
              value={row.email}
              ltr
              fallback={notAvailable}
            />
            <RecordViewField
              icon={adminFieldIcons.registrationDate}
              label={t('detail.fieldRegistrationDate')}
              value={formatAdminDate(createdAt, locale)}
              ltr
              alignEnd={isRTL}
              fallback={notAvailable}
            />
            <RecordViewField
              icon={adminFieldIcons.registrationTime}
              label={t('detail.fieldRegistrationTime')}
              value={formatAdminTime(createdAt, locale)}
              ltr
              alignEnd={isRTL}
              fallback={notAvailable}
            />
            <RecordViewField
              icon={adminFieldIcons.memberType}
              label={t('detail.fieldMemberType')}
              value={row.memberTypeLabel}
              fallback={notAvailable}
            />
          </div>
        </RecordViewSection>

        <RecordViewSection icon={adminFieldIcons.personalSection} title={t('detail.sectionPersonal', 'Personal Information')}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <RecordViewEditableField icon={User} label={t('editModal.fields.firstNameAr')}>
              <Input
                value={f.firstNameAr}
                onChange={(e) => set.setFirstNameAr(e.target.value)}
                className={fieldClass(fieldInputClass, fieldErrors, 'firstNameAr')}
                placeholder={getBilingualFieldPlaceholder('ar', 'MemberManagementPage', 'editModal.placeholders.firstNameAr')}
              />
              <FieldInlineError message={fieldErrors?.firstNameAr} />
            </RecordViewEditableField>
            <RecordViewEditableField icon={User} label={t('editModal.fields.lastNameAr')}>
              <Input
                value={f.lastNameAr}
                onChange={(e) => set.setLastNameAr(e.target.value)}
                className={fieldClass(fieldInputClass, fieldErrors, 'lastNameAr')}
                placeholder={getBilingualFieldPlaceholder('ar', 'MemberManagementPage', 'editModal.placeholders.lastNameAr')}
              />
              <FieldInlineError message={fieldErrors?.lastNameAr} />
            </RecordViewEditableField>
            <RecordViewEditableField
              icon={User}
              label={t('editModal.fields.firstNameEn')}
              hidden={!showEnFields}
            >
              <Input
                value={f.firstNameEn}
                onChange={(e) => set.setFirstNameEn(e.target.value)}
                className={fieldClass(fieldInputClass, fieldErrors, 'firstNameEn')}
                placeholder={getBilingualFieldPlaceholder('en', 'MemberManagementPage', 'editModal.placeholders.firstNameEn')}
                dir="ltr"
              />
              <FieldInlineError message={fieldErrors?.firstNameEn} />
            </RecordViewEditableField>
            <RecordViewEditableField
              icon={User}
              label={t('editModal.fields.lastNameEn')}
              hidden={!showEnFields}
            >
              <Input
                value={f.lastNameEn}
                onChange={(e) => set.setLastNameEn(e.target.value)}
                className={fieldClass(fieldInputClass, fieldErrors, 'lastNameEn')}
                placeholder={getBilingualFieldPlaceholder('en', 'MemberManagementPage', 'editModal.placeholders.lastNameEn')}
                dir="ltr"
              />
              <FieldInlineError message={fieldErrors?.lastNameEn} />
            </RecordViewEditableField>
            <RecordViewEditableField icon={CreditCard} label={t('editModal.fields.nationalId')}>
              <Input
                value={f.nationalId}
                onChange={(e) => set.setNationalId(e.target.value)}
                className={fieldClass(fieldInputClass, fieldErrors, 'nationalId')}
                placeholder={t('editModal.placeholders.nationalId')}
                dir="ltr"
              />
              <FieldInlineError message={fieldErrors?.nationalId} />
            </RecordViewEditableField>
            <RecordViewEditableField icon={User} label={t('editModal.fields.gender')}>
              <Select value={f.gender} onValueChange={set.setGender}>
                <SelectTrigger className={fieldInputClass}>
                  <SelectValue placeholder={t('editModal.placeholders.select')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">{t('gender.male')}</SelectItem>
                  <SelectItem value="female">{t('gender.female')}</SelectItem>
                </SelectContent>
              </Select>
            </RecordViewEditableField>
            <RecordViewEditableField icon={Calendar} label={t('editModal.fields.birthdate')}>
              <Input
                value={f.birthdate}
                onChange={(e) => set.setBirthdate(e.target.value)}
                className={fieldClass(fieldInputClass, fieldErrors, 'birthdate')}
                type="date"
                dir="ltr"
              />
              <FieldInlineError message={fieldErrors?.birthdate} />
            </RecordViewEditableField>
            <RecordViewEditableField icon={Globe} label={t('editModal.fields.nationality')}>
              <Input
                value={f.nationality}
                onChange={(e) => set.setNationality(e.target.value)}
                className={fieldClass(fieldInputClass, fieldErrors, 'nationality')}
                placeholder={t('editModal.placeholders.nationality')}
                dir="ltr"
              />
              <FieldInlineError message={fieldErrors?.nationality} />
            </RecordViewEditableField>
            <RecordViewEditableField
              icon={HeartPulse}
              label={t('editModal.fields.healthStatus')}
              className="sm:col-span-2"
            >
              <Input
                value={f.health}
                onChange={(e) => set.setHealth(e.target.value)}
                className={fieldClass(fieldInputClass, fieldErrors, 'health')}
                placeholder={t('editModal.placeholders.healthStatus')}
              />
              <FieldInlineError message={fieldErrors?.health} />
            </RecordViewEditableField>
          </div>
        </RecordViewSection>

        <RecordViewSection icon={adminFieldIcons.contactSection} title={t('detail.sectionContact', 'Contact Information')}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <RecordViewEditableField icon={adminFieldIcons.email} label={t('editModal.fields.email')}>
              <Input
                value={f.email}
                onChange={(e) => set.setEmail(e.target.value)}
                className={fieldClass(fieldInputClass, fieldErrors, 'email')}
                placeholder={t('editModal.placeholders.email')}
                dir="ltr"
                type="email"
              />
              <FieldInlineError message={fieldErrors?.email} />
            </RecordViewEditableField>
            <RecordViewEditableField icon={adminFieldIcons.phone} label={t('editModal.fields.phone')}>
              <Input
                value={f.phone}
                onChange={(e) => set.setPhone(e.target.value)}
                className={fieldClass(fieldInputClass, fieldErrors, 'phone')}
                placeholder={t('editModal.placeholders.phone')}
                dir="ltr"
                type="tel"
              />
              <FieldInlineError message={fieldErrors?.phone} />
            </RecordViewEditableField>
            <RecordViewEditableField
              icon={adminFieldIcons.address}
              label={t('editModal.fields.address')}
              className="sm:col-span-2"
            >
              <Input
                value={f.address}
                onChange={(e) => set.setAddress(e.target.value)}
                className={fieldClass(fieldInputClass, fieldErrors, 'address')}
                placeholder={t('editModal.placeholders.address')}
              />
              <FieldInlineError message={fieldErrors?.address} />
            </RecordViewEditableField>
          </div>
        </RecordViewSection>

        {(d?.university_student_detail || f.facultyId || f.graduationYear) && (
          <RecordViewSection icon={User} title={t('editModal.sections.student')}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <RecordViewEditableField icon={Award} label={t('editModal.fields.faculty')}>
                <Select value={f.facultyId} onValueChange={set.setFacultyId}>
                  <SelectTrigger className={fieldInputClass}>
                    <SelectValue placeholder={t('editModal.placeholders.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties.map((fac) => (
                      <SelectItem key={fac.id} value={String(fac.id)}>
                        {getEntityName(fac, language)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </RecordViewEditableField>
              <RecordViewEditableField icon={Calendar} label={t('editModal.fields.graduationYear')}>
                <Input
                  value={f.graduationYear}
                  onChange={(e) => set.setGraduationYear(e.target.value)}
                  className={fieldInputClass}
                  dir="ltr"
                  type="number"
                />
              </RecordViewEditableField>
            </div>
          </RecordViewSection>
        )}

        {(d?.employee_detail || f.professionId) && (
          <RecordViewSection icon={User} title={t('editModal.sections.employee')}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <RecordViewEditableField icon={Award} label={t('editModal.fields.profession')}>
                <Select value={f.professionId} onValueChange={set.setProfessionId}>
                  <SelectTrigger className={fieldInputClass}>
                    <SelectValue placeholder={t('editModal.placeholders.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    {professions.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {getEntityName(p, language)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </RecordViewEditableField>
              <RecordViewEditableField icon={CreditCard} label={t('editModal.fields.salary')}>
                <Input
                  value={f.salary}
                  onChange={(e) => set.setSalary(e.target.value)}
                  className={fieldInputClass}
                  dir="ltr"
                  type="number"
                />
              </RecordViewEditableField>
              <RecordViewEditableField
                icon={User}
                label={t('editModal.fields.departmentEn')}
                hidden={!showEnFields}
              >
                <Input
                  value={f.departmentEn}
                  onChange={(e) => set.setDepartmentEn(e.target.value)}
                  className={fieldClass(fieldInputClass, fieldErrors, 'departmentEn')}
                  dir="ltr"
                />
                <FieldInlineError message={fieldErrors?.departmentEn} />
              </RecordViewEditableField>
              <RecordViewEditableField icon={User} label={t('editModal.fields.departmentAr')}>
                <Input
                  value={f.departmentAr}
                  onChange={(e) => set.setDepartmentAr(e.target.value)}
                  className={fieldClass(fieldInputClass, fieldErrors, 'departmentAr')}
                />
                <FieldInlineError message={fieldErrors?.departmentAr} />
              </RecordViewEditableField>
            </div>
          </RecordViewSection>
        )}

        {(d?.retired_employee_detail || f.retirementDate || f.professionCode) && (
          <RecordViewSection icon={User} title={t('editModal.sections.retired')}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <RecordViewEditableField icon={Hash} label={t('editModal.fields.professionCode')}>
                <Input
                  value={f.professionCode}
                  onChange={(e) => set.setProfessionCode(e.target.value)}
                  className={fieldInputClass}
                  dir="ltr"
                />
              </RecordViewEditableField>
              <RecordViewEditableField icon={Calendar} label={t('editModal.fields.retirementDate')}>
                <Input
                  value={f.retirementDate}
                  onChange={(e) => set.setRetirementDate(e.target.value)}
                  className={fieldInputClass}
                  type="date"
                  dir="ltr"
                />
              </RecordViewEditableField>
              <RecordViewEditableField
                icon={User}
                label={t('editModal.fields.formerDepartmentEn')}
                hidden={!showEnFields}
              >
                <Input
                  value={f.formerDepartmentEn}
                  onChange={(e) => set.setFormerDepartmentEn(e.target.value)}
                  className={fieldClass(fieldInputClass, fieldErrors, 'formerDepartmentEn')}
                  dir="ltr"
                />
                <FieldInlineError message={fieldErrors?.formerDepartmentEn} />
              </RecordViewEditableField>
              <RecordViewEditableField icon={User} label={t('editModal.fields.formerDepartmentAr')}>
                <Input
                  value={f.formerDepartmentAr}
                  onChange={(e) => set.setFormerDepartmentAr(e.target.value)}
                  className={fieldClass(fieldInputClass, fieldErrors, 'formerDepartmentAr')}
                />
                <FieldInlineError message={fieldErrors?.formerDepartmentAr} />
              </RecordViewEditableField>
              <RecordViewEditableField icon={CreditCard} label={t('editModal.fields.lastSalary')}>
                <Input
                  value={f.lastSalary}
                  onChange={(e) => set.setLastSalary(e.target.value)}
                  className={fieldInputClass}
                  dir="ltr"
                  type="number"
                />
              </RecordViewEditableField>
            </div>
          </RecordViewSection>
        )}

        {(d?.outsider_detail || f.passportNumber || f.visitorType) && (
          <RecordViewSection icon={Globe} title={t('editModal.sections.visitor')}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <RecordViewEditableField icon={CreditCard} label={t('editModal.fields.passportNumber')}>
                <Input
                  value={f.passportNumber}
                  onChange={(e) => set.setPassportNumber(e.target.value)}
                  className={fieldInputClass}
                  dir="ltr"
                />
              </RecordViewEditableField>
              <RecordViewEditableField icon={Globe} label={t('editModal.fields.country')}>
                <Input
                  value={f.country}
                  onChange={(e) => set.setCountry(e.target.value)}
                  className={fieldInputClass}
                  dir="ltr"
                />
              </RecordViewEditableField>
              <RecordViewEditableField icon={User} label={t('editModal.fields.visitorType')}>
                <Input
                  value={f.visitorType}
                  onChange={(e) => set.setVisitorType(e.target.value)}
                  className={fieldInputClass}
                  dir="ltr"
                />
              </RecordViewEditableField>
              <RecordViewEditableField icon={Shield} label={t('editModal.fields.visaStatus')}>
                <Input
                  value={f.visaStatus}
                  onChange={(e) => set.setVisaStatus(e.target.value)}
                  className={fieldInputClass}
                  dir="ltr"
                />
              </RecordViewEditableField>
              <RecordViewEditableField icon={User} label={t('editModal.fields.employmentStatus')}>
                <Input
                  value={f.employmentStatus}
                  onChange={(e) => set.setEmploymentStatus(e.target.value)}
                  className={fieldInputClass}
                  dir="ltr"
                />
              </RecordViewEditableField>
              <RecordViewEditableField icon={Calendar} label={t('editModal.fields.durationMonths')}>
                <Input
                  value={f.durationMonths}
                  onChange={(e) => set.setDurationMonths(e.target.value)}
                  className={fieldInputClass}
                  dir="ltr"
                  type="number"
                />
              </RecordViewEditableField>
              <RecordViewEditableField
                icon={User}
                label={t('editModal.fields.jobTitleEn')}
                hidden={!showEnFields}
              >
                <Input
                  value={f.jobTitleEn}
                  onChange={(e) => set.setJobTitleEn(e.target.value)}
                  className={fieldClass(fieldInputClass, fieldErrors, 'jobTitleEn')}
                  dir="ltr"
                />
                <FieldInlineError message={fieldErrors?.jobTitleEn} />
              </RecordViewEditableField>
              <RecordViewEditableField icon={User} label={t('editModal.fields.jobTitleAr')}>
                <Input
                  value={f.jobTitleAr}
                  onChange={(e) => set.setJobTitleAr(e.target.value)}
                  className={fieldClass(fieldInputClass, fieldErrors, 'jobTitleAr')}
                />
                <FieldInlineError message={fieldErrors?.jobTitleAr} />
              </RecordViewEditableField>
            </div>
          </RecordViewSection>
        )}
      </div>

      <div className="border-t border-border px-5 py-3 bg-muted/20 shrink-0 flex items-center gap-2">
        <Button variant="outline" onClick={onCancel} disabled={editSaving}>
          {t('editModal.buttons.cancel')}
        </Button>
        <Button className="gap-1.5 ms-auto" onClick={onSave} disabled={editSaving}>
          <Pencil className="w-4 h-4" />
          {editSaving ? t('editModal.buttons.saving') : t('editModal.buttons.save')}
        </Button>
      </div>
    </div>
  );
}
