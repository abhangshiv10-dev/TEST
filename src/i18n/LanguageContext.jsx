import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  LOCALES,
  LANG_STORAGE_KEY,
  readStoredLang,
  setActiveLang,
  translate,
  translateParts
} from './index';
import { categoryLabel, projectLabel } from './category';
import {
  formatDate,
  formatDateTime,
  formatShortDate,
  formatFriendlyDate
} from '../utils/marathiDate';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const initial = readStoredLang();
    setActiveLang(initial);
    return initial;
  });

  const setLang = useCallback((next) => {
    if (!LOCALES[next]) return;
    setActiveLang(next); // keep the module-level copy in sync before the re-render
    setLangState(next);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      /* ignore blocked storage */
    }
  }, []);

  // Keep <html lang>, the tab title and the meta description in step with the language
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = translate('app.name', undefined, lang);
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', translate('app.metaDescription', undefined, lang));
  }, [lang]);

  const value = useMemo(() => {
    const t = (key, params) => translate(key, params, lang);
    return {
      lang,
      setLang,
      locale: LOCALES[lang],
      t,
      // same as t(), but placeholders can be React elements, e.g. tRich('key', { name: <b>Raj</b> })
      tRich: (key, params) => React.Children.toArray(translateParts(key, params, lang)),
      // names / labels
      catLabel: (name, nameEn) => categoryLabel(name, nameEn, lang),
      projectLabel: (rawName) => projectLabel(rawName, t),
      // dates in the selected language
      fmtDate: (d, shortYear = false) => formatDate(d, shortYear, lang),
      fmtShortDate: (d) => formatShortDate(d, lang),
      fmtDateTime: (d) => formatDateTime(d, lang),
      fmtFriendlyDate: (d) => formatFriendlyDate(d, lang)
    };
  }, [lang, setLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return ctx;
}
