export type MembershipFormData = {
    cost: string;
    formTitle: string;
    name: string;
    dob: string;
    membershipType: string;
    address: string;
    maritalStatus: string;
    profession: string;
    phone: string;
    nationalId: string;
    photoUrl?: string | null;
    declarationDate?: string;
    teamsLine?: string;
};

export const MEMBERSHIP_FORM_FEE = '250';
export const HUC_LOGO_ASSET = '/assets/HUC_logo.jpeg';

export const MEMBERSHIP_DECLARATION_AR =
    'البيانات الواردة في هذه الاستمارة صحيحة على مسؤوليتي الشخصية مع الالتزام بالقانون الرياضي المصري ولائحة النظام الأساسي لأندية الشركات والمصانع والوزارات والمصالح الحكومية ووحدات الإدارة المحلية والهيئات العامة وأجهزة الدولة وسلطاتها واللائحة المالية وتعديلاتها.';

const MARITAL_OPTIONS = ['أعزب', 'متزوج / متزوجة', 'أرمل / أرملة', 'مطلق / مطلقة'] as const;

const escapeHtml = (s: string) =>
    String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

function normalizeMarital(value?: string | null): string {
    if (!value?.trim()) return '';
    const v = value.trim().toLowerCase();
    if (v.includes('married') || v.includes('متزوج')) return 'متزوج / متزوجة';
    if (v.includes('single') || v.includes('أعزب') || v.includes('اعزب')) return 'أعزب';
    if (v.includes('widow') || v.includes('أرمل') || v.includes('ارمل')) return 'أرمل / أرملة';
    if (v.includes('divorc') || v.includes('مطل')) return 'مطلق / مطلقة';
    return value.trim();
}

function buildMaritalRadiosHtml(selected: string): string {
    const normalized = normalizeMarital(selected);
    return MARITAL_OPTIONS.map((opt) => {
        const isSelected = normalized === opt || normalized.replace(/\s/g, '') === opt.replace(/\s/g, '');
        return `<span class="radio-option${isSelected ? ' selected' : ' muted'}"><span class="radio-dot"></span>${escapeHtml(opt)}</span>`;
    }).join('\n              ');
}

function buildFieldRow(label: string, value: string): string {
    return `<div class="form-group">
          <span class="form-value">${escapeHtml(value || '—')}</span>
          <label>${escapeHtml(label)}</label>
        </div>`;
}

function getPrintStyles(): string {
    return `
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');

@page { size: A4 portrait; margin: 12mm; }

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: "Cairo", "Inter", sans-serif;
  background: #fff;
  color: #333;
}

.membership-form-root .form-container {
  background: #fff;
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
}

.membership-form-root .overlay {
  z-index: 0;
  background-image: url('${HUC_LOGO_ASSET}');
  background-repeat: no-repeat;
  background-position: center;
  width: 100%;
  height: 90%;
  opacity: 0.1;
  position: absolute;
  top: -5%;
  pointer-events: none;
}

.membership-form-root .header-sec-part {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
  margin-bottom: 8px;
}

.membership-form-root .value-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.membership-form-root .header-sec-part img {
  height: 120px;
  width: 120px;
  object-fit: contain;
}

.membership-form-root .text-center { text-align: center; margin-bottom: 28px; position: relative; z-index: 1; }

.membership-form-root .section-title {
  font-size: 1.6rem;
  font-weight: bold;
  border-bottom: 2px solid #000;
  display: inline-block;
  padding-bottom: 4px;
}

.membership-form-root .form-section-main {
  display: flex;
  align-items: flex-start;
  margin-bottom: 24px;
  position: relative;
  z-index: 1;
}

.membership-form-root .photo-box {
  width: 150px;
  height: 180px;
  border: 2px solid #bbb;
  background: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-inline-end: 30px;
  flex-shrink: 0;
  overflow: hidden;
  color: #888;
  font-weight: 700;
}

.membership-form-root .photo-box img { width: 100%; height: 100%; object-fit: cover; }

.membership-form-root .form-inputs-right { flex: 1; }

.membership-form-root .form-group {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 12px;
  gap: 10px;
}

.membership-form-root .form-group label {
  width: 150px;
  text-align: right;
  font-weight: 500;
  color: #555;
  flex-shrink: 0;
}

.membership-form-root .form-value {
  flex: 1;
  text-align: center;
  border-bottom: 1px dashed #999;
  padding-bottom: 4px;
  font-weight: 600;
  min-width: 180px;
}

.membership-form-root .form-group.radio-group {
  flex-wrap: wrap;
  gap: 12px;
}

.membership-form-root .form-group.radio-group label { width: auto; }

.membership-form-root .radio-option {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
}

.membership-form-root .radio-option.muted { color: #94a3b8; }

.membership-form-root .radio-dot {
  width: 11px;
  height: 11px;
  border-radius: 9999px;
  border: 2px solid #64748b;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.membership-form-root .radio-option.selected .radio-dot { border-color: #0b2d5b; }

.membership-form-root .radio-option.selected .radio-dot::after {
  content: '';
  width: 5px;
  height: 5px;
  border-radius: 9999px;
  background: #0b2d5b;
}

.membership-form-root .declaration-section {
  position: relative;
  z-index: 1;
  margin-top: 16px;
}

.membership-form-root .declaration-section h4 {
  text-align: center;
  font-size: 1.2rem;
  margin-bottom: 12px;
}

.membership-form-root .declaration-text {
  line-height: 1.75;
  font-size: 0.92rem;
  margin-bottom: 16px;
}

.membership-form-root .declaration-date-right {
  text-align: right;
  margin-top: 8px;
}

.membership-form-root .signature-area {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 280px;
  margin-top: 12px;
}

.membership-form-root .signature-item {
  display: flex;
  flex-direction: row-reverse;
  align-items: flex-end;
  gap: 8px;
}

.membership-form-root .signature-item label {
  color: #666;
  font-weight: 500;
  white-space: nowrap;
}

.membership-form-root .signature-line {
  flex: 1;
  border-bottom: 1px dashed #999;
  min-height: 22px;
}
`;
}

export function buildMembershipFormHtml(data: MembershipFormData, logoDataUrl?: string | null): string {
    const logoSrc = logoDataUrl ?? HUC_LOGO_ASSET;
    const photoHtml = data.photoUrl
        ? `<img src="${data.photoUrl}" alt="" />`
        : 'صورة';

    const declarationDate = data.declarationDate
        ?? new Date().toLocaleDateString('ar-EG', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const extraTeamRow = data.teamsLine
        ? buildFieldRow(':الفرق', data.teamsLine)
        : '';

    return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(data.formTitle)}</title>
  <style>${getPrintStyles()}</style>
</head>
<body>
  <div class="membership-form-root">
    <div class="form-container">
      <div class="overlay"></div>

      <div class="header-sec-part">
        <div class="value-input-group">
          <span>قيمة الإستمارة</span>
          <strong>${escapeHtml(data.cost)}</strong>
        </div>
        <img src="${logoSrc}" alt="HUC Logo" />
      </div>

      <div class="text-center">
        <h2 class="section-title">${escapeHtml(data.formTitle)}</h2>
      </div>

      <div class="form-section-main">
        <div class="photo-box">${photoHtml}</div>
        <div class="form-inputs-right">
          ${buildFieldRow(':الإسم', data.name)}
          ${buildFieldRow(':تاريخ الميلاد', data.dob)}
          ${buildFieldRow(':النوع', data.membershipType)}
          ${buildFieldRow(':العنوان', data.address)}
          <div class="form-group radio-group">
            ${buildMaritalRadiosHtml(data.maritalStatus)}
            <label>:الحالة الإجتماعية</label>
          </div>
          ${buildFieldRow(':المهنة', data.profession)}
          ${buildFieldRow(':الهاتف واتس اب', data.phone)}
          ${extraTeamRow}
        </div>
      </div>

      <div class="declaration-section">
        <h4>إقرار</h4>
        <div class="declaration-text">
          أقر أنا <strong>${escapeHtml(data.name)}</strong> برقم قومي <strong>${escapeHtml(data.nationalId)}</strong>
          ${MEMBERSHIP_DECLARATION_AR}
          <div class="declaration-date-right">تحريراً في ${escapeHtml(declarationDate)}</div>
        </div>
        <div class="signature-area">
          <div class="signature-item"><div class="signature-line"></div><label>:المقرر بما فيه</label></div>
          <div class="signature-item"><div class="signature-line"></div><label>:الإسم</label></div>
          <div class="signature-item"><div class="signature-line"></div><label>:التوقيع</label></div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

async function loadImageDataUrl(url: string): Promise<string> {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Failed to load image');
    const blob = await resp.blob();
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read image'));
        reader.readAsDataURL(blob);
    });
}

async function resolveAssetDataUrl(assetPath: string): Promise<string | null> {
    const absolute = assetPath.startsWith('http')
        ? assetPath
        : `${window.location.origin}${assetPath.startsWith('/') ? '' : '/'}${assetPath}`;
    try {
        return await loadImageDataUrl(absolute);
    } catch {
        return null;
    }
}

async function waitForPrintReady(win: Window): Promise<void> {
    const doc = win.document;
    if (doc.readyState === 'loading') {
        await new Promise<void>((res) => {
            doc.addEventListener('DOMContentLoaded', () => res(), { once: true });
        });
    }
    const images = Array.from(doc.images || []);
    await Promise.all(
        images.map((img) => {
            if (img.complete && img.naturalWidth !== 0) {
                return img.decode?.().catch(() => undefined) ?? Promise.resolve();
            }
            return new Promise<void>((resolve) => {
                const done = () => resolve();
                img.addEventListener('load', done, { once: true });
                img.addEventListener('error', done, { once: true });
            });
        }),
    );
    if (doc.fonts?.ready?.then) {
        try { await doc.fonts.ready; } catch { /* ignore */ }
    }
    await new Promise((r) => setTimeout(r, 50));
}

export async function printMembershipForm(data: MembershipFormData): Promise<void> {
    const logoDataUrl = await resolveAssetDataUrl(HUC_LOGO_ASSET);
    let photoDataUrl: string | null = null;
    if (data.photoUrl) {
        try {
            photoDataUrl = data.photoUrl.startsWith('data:')
                ? data.photoUrl
                : await loadImageDataUrl(data.photoUrl.startsWith('http') ? data.photoUrl : `${window.location.origin}${data.photoUrl}`);
        } catch {
            photoDataUrl = data.photoUrl;
        }
    }

    const html = buildMembershipFormHtml(
        { ...data, photoUrl: photoDataUrl ?? data.photoUrl },
        logoDataUrl,
    );

    const iframe = document.createElement('iframe');
    Object.assign(iframe.style, {
        position: 'fixed',
        right: '0',
        bottom: '0',
        width: '0',
        height: '0',
        border: '0',
    });
    document.body.appendChild(iframe);

    const win = iframe.contentWindow!;
    const doc = win.document;
    doc.open();
    doc.write(html);
    doc.close();

    await waitForPrintReady(win);
    win.focus();
    win.print();

    win.onafterprint = () => {
        setTimeout(() => {
            if (document.body.contains(iframe)) document.body.removeChild(iframe);
        }, 50);
    };
    setTimeout(() => {
        if (document.body.contains(iframe)) document.body.removeChild(iframe);
    }, 5000);
}

export function formatMembershipFormDate(value?: string | Date | null): string {
    if (!value) return '—';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}
