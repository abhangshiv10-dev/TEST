import mr from './locales/mr';
import en from './locales/en';

/**
 * Tiny i18n core (no external library).
 *
 *  - Two languages: 'mr' (Marathi, default) and 'en' (English).
 *  - All screen text lives in ./locales/mr.js and ./locales/en.js.
 *    Components never hold hard-coded text; they call t('some.key').
 *  - The chosen language is remembered in localStorage.
 */

export const LOCALES = { mr, en };
export const SUPPORTED_LANGS = Object.keys(LOCALES);
export const DEFAULT_LANG = 'mr';
export const LANG_STORAGE_KEY = 'homebuild_lang';

export function readStoredLang() {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved && LOCALES[saved]) return saved;
  } catch {
    /* localStorage can be blocked (private mode) - fall back to default */
  }
  return DEFAULT_LANG;
}

// Module-level copy of the active language, so code that lives outside React
// (alert helpers, data-service error mapping) can translate too.
// React components should use useLanguage() so they re-render on change.
let activeLang = readStoredLang();

export const getActiveLang = () => activeLang;

export function setActiveLang(lang) {
  if (LOCALES[lang]) activeLang = lang;
}

function lookup(lang, key) {
  const messages = LOCALES[lang]?.messages;
  const value = messages ? messages[key] : undefined;
  return typeof value === 'string' ? value : undefined;
}

function interpolate(template, params) {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name) =>
    params[name] === undefined || params[name] === null ? match : String(params[name])
  );
}

function resolveTemplate(key, params, lang) {
  let template;
  if (params && params.count === 1) template = lookup(lang, `${key}_one`);
  if (template === undefined) template = lookup(lang, key);
  if (template === undefined && import.meta.env?.DEV) {
    console.warn(`[i18n] Missing "${lang}" translation for key: ${key}`);
  }
  return template;
}

/**
 * Translate a key.
 *   translate('dashboard.entries', { count: 5 })
 * Plural: if params.count === 1 and "<key>_one" exists it is used.
 * A missing key returns the key itself (visible bug) - it never leaks the other language.
 */
export function translate(key, params, lang = activeLang) {
  const template = resolveTemplate(key, params, lang);
  return template === undefined ? key : interpolate(template, params);
}

/**
 * Like translate(), but placeholders may be replaced by React elements (e.g. <strong>).
 * Returns an array of strings / values to render inside JSX.
 */
export function translateParts(key, params = {}, lang = activeLang) {
  const template = resolveTemplate(key, params, lang);
  if (template === undefined) return [key];
  return template.split(/(\{\w+\})/).map((part) => {
    const match = part.match(/^\{(\w+)\}$/);
    return match && params[match[1]] !== undefined && params[match[1]] !== null ? params[match[1]] : part;
  });
}
