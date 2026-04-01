'use client';
import { useLanguage } from '@/lib/LanguageContext';
import type { Locale } from '@/lib/i18n';

const localeOrder: Locale[] = ['en', 'de', 'fr', 'es'];

export default function LanguageToggle() {
  const { locale, setLocale } = useLanguage();

  const cycle = () => {
    const idx = localeOrder.indexOf(locale);
    const next = localeOrder[(idx + 1) % localeOrder.length];
    setLocale(next);
  };

  return (
    <button
      onClick={cycle}
      aria-label={`Language: ${locale.toUpperCase()}. Click to switch.`}
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 50,
        width: 36,
        height: 36,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15, 15, 35, 0.9)',
        border: '1px solid rgba(212, 175, 55, 0.5)',
        borderRadius: 8,
        color: '#d4af37',
        fontFamily: 'monospace',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.05em',
        cursor: 'pointer',
        backdropFilter: 'blur(8px)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.9)';
        e.currentTarget.style.boxShadow = '0 0 12px rgba(212, 175, 55, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.5)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {locale.toUpperCase()}
    </button>
  );
}
