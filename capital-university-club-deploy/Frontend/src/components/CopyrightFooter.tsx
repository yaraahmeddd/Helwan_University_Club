import { useTranslation } from 'react-i18next';

/**
 * CopyrightFooter — fixed bottom bar shown on every page.
 * Shows the Arabic copyright when the UI language is Arabic,
 * and the English copyright when any other language is active.
 */
export function CopyrightFooter() {
  const { i18n } = useTranslation();
  const isArabic = (i18n.resolvedLanguage ?? i18n.language ?? 'ar').startsWith('ar');

  const enText =
    'All copyrights, intellectual property rights are reserved by FCAI & CITC.';
  const arText =
    'جميع حقوق النشر والملكيه الفكريه محفوظة لكلية الحاسبات والذكاء الاصطناعي ومركز الاتصالات وتكنولوجيا المعلومات';

  return (
    <footer
      className="copyright-footer"
      dir={isArabic ? 'rtl' : 'ltr'}
      aria-label="Copyright notice"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: '#0e1c38',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '7px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '38px',
      }}
    >
      <span
        style={{
          color: 'rgba(255,255,255,0.78)',
          fontSize: '11.5px',
          fontFamily: isArabic
            ? "'Cairo', 'Noto Kufi Arabic', sans-serif"
            : "'Inter', 'Segoe UI', sans-serif",
          fontWeight: 500,
          letterSpacing: '0.01em',
          lineHeight: 1.5,
          textAlign: 'center',
        }}
      >
        {isArabic ? arText : enText}
      </span>
    </footer>
  );
}

export default CopyrightFooter;
