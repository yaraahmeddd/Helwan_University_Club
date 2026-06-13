import '@/styles/membership-form.css';
import {
    HUC_LOGO_ASSET,
    MEMBERSHIP_DECLARATION_AR,
    type MembershipFormData,
} from '@/utils/membershipFormPrint';

const MARITAL_OPTIONS = ['أعزب', 'متزوج / متزوجة', 'أرمل / أرملة', 'مطلق / مطلقة'] as const;

function normalizeMarital(value?: string | null): string {
    if (!value?.trim()) return '';
    const v = value.trim().toLowerCase();
    if (v.includes('married') || v.includes('متزوج')) return 'متزوج / متزوجة';
    if (v.includes('single') || v.includes('أعزب') || v.includes('اعزب')) return 'أعزب';
    if (v.includes('widow') || v.includes('أرمل') || v.includes('ارمل')) return 'أرمل / أرملة';
    if (v.includes('divorc') || v.includes('مطل')) return 'مطلق / مطلقة';
    return value.trim();
}

type MembershipFormViewProps = {
    data: MembershipFormData;
    className?: string;
};

function FieldRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="form-group">
            <span className="form-value">{value || '—'}</span>
            <label>{label}</label>
        </div>
    );
}

export function MembershipFormView({ data, className }: MembershipFormViewProps) {
    const selectedMarital = normalizeMarital(data.maritalStatus);
    const declarationDate = data.declarationDate
        ?? new Date().toLocaleDateString('ar-EG', { day: '2-digit', month: '2-digit', year: 'numeric' });

    return (
        <div className={`membership-form-root ${className ?? ''}`} dir="rtl">
            <div className="form-container">
                <div className="overlay" aria-hidden />

                <div className="header-sec-part">
                    <div className="value-input-group">
                        <span>قيمة الإستمارة</span>
                        <strong>{data.cost}</strong>
                    </div>
                    <img src={HUC_LOGO_ASSET} alt="HUC Logo" />
                </div>

                <div className="text-center">
                    <h2 className="section-title">{data.formTitle}</h2>
                </div>

                <div className="form-section-main">
                    <div className="photo-box">
                        {data.photoUrl ? (
                            <img src={data.photoUrl} alt="" />
                        ) : (
                            'صورة'
                        )}
                    </div>
                    <div className="form-inputs-right">
                        <FieldRow label=":الإسم" value={data.name} />
                        <FieldRow label=":تاريخ الميلاد" value={data.dob} />
                        <FieldRow label=":النوع" value={data.membershipType} />
                        <FieldRow label=":العنوان" value={data.address} />
                        <div className="form-group radio-group">
                            {MARITAL_OPTIONS.map((opt) => {
                                const selected = selectedMarital === opt
                                    || selectedMarital.replace(/\s/g, '') === opt.replace(/\s/g, '');
                                return (
                                    <span
                                        key={opt}
                                        className={`radio-option${selected ? ' selected' : ' muted'}`}
                                    >
                                        <span className="radio-dot" />
                                        {opt}
                                    </span>
                                );
                            })}
                            <label>:الحالة الإجتماعية</label>
                        </div>
                        <FieldRow label=":المهنة" value={data.profession} />
                        <FieldRow label=":الهاتف واتس اب" value={data.phone} />
                        {data.teamsLine ? (
                            <FieldRow label=":الفرق" value={data.teamsLine} />
                        ) : null}
                    </div>
                </div>

                <div className="declaration-section">
                    <h4>إقرار</h4>
                    <div className="declaration-text">
                        أقر أنا <strong>{data.name}</strong> برقم قومي <strong>{data.nationalId}</strong>
                        {' '}
                        {MEMBERSHIP_DECLARATION_AR}
                        <div className="declaration-date-right">
                            تحريراً في {declarationDate}
                        </div>
                    </div>
                    <div className="signature-area">
                        <div className="signature-item">
                            <div className="signature-line" />
                            <label>:المقرر بما فيه</label>
                        </div>
                        <div className="signature-item">
                            <div className="signature-line" />
                            <label>:الإسم</label>
                        </div>
                        <div className="signature-item">
                            <div className="signature-line" />
                            <label>:التوقيع</label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
