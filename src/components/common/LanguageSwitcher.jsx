import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { LOCALES, SUPPORTED_LANGS } from '../../i18n';

// मराठी | English toggle. Each language is shown in its own name, so a visitor can
// always find their language even when the page is currently in the other one.
export default function LanguageSwitcher({ className = '' }) {
  const { lang, setLang, t } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t('language.switch')}
      title={t('language.switch')}
      className={`inline-flex items-center gap-0.5 p-0.5 rounded-xl bg-slate-100 border border-slate-200/70 shrink-0 ${className}`}
    >
      <Languages className="w-3.5 h-3.5 text-slate-400 mx-1 hidden sm:block" aria-hidden="true" />
      {SUPPORTED_LANGS.map((code) => {
        const active = code === lang;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLang(code)}
            aria-pressed={active}
            lang={code}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
              active ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
            }`}
          >
            {LOCALES[code].name}
          </button>
        );
      })}
    </div>
  );
}
