import React from 'react';
import AppLogo from './AppLogo';
import { useLanguage } from '../../i18n/LanguageContext';

// Loading screen: the app logo with a spinning ring around it.
// fullScreen = covers the whole screen, centered both vertically and horizontally (desktop and mobile);
// otherwise it fills the content area.
export default function Preloader({ fullScreen = false, text }) {
  const { t } = useLanguage();

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-4 ${
        fullScreen ? 'fixed inset-0 z-50 bg-slate-50' : 'min-h-[60vh]'
      }`}
    >
      <div className="pl-wrap flex flex-col items-center gap-4">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <span className="pl-track absolute inset-0" />
          <span className="pl-ring absolute inset-0" />
          <span className="pl-logo block">
            <AppLogo className="w-16 h-16 shadow-md" rounded="rounded-2xl" />
          </span>
        </div>
        <p className="pl-text text-xs font-semibold text-slate-500">{text ?? t('app.loading')}</p>
      </div>
    </div>
  );
}
