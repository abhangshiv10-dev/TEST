import { LOCALES, getActiveLang, translate } from '../i18n';

// Date helpers. Month names, AM/PM and "today / yesterday" follow the selected language
// (pass `lang` explicitly, or it defaults to the currently selected language).
// File name kept as marathiDate.js so existing imports keep working.

const localeOf = (lang) => LOCALES[lang] || LOCALES[getActiveLang()];

/**
 * Formats a date string (YYYY-MM-DD or ISO) into text in the selected language
 * Example (mr): '2026-09-22' -> '22 सप्टेंबर 2026'   (en): '22 September 2026'
 * @param {string|Date} dateInput
 * @param {boolean} shortYear - when true the year is left out
 * @param {string} lang
 * @returns {string}
 */
export function formatDate(dateInput, shortYear = false, lang = getActiveLang()) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);

  const day = d.getDate();
  const month = localeOf(lang).months[d.getMonth()];
  const year = d.getFullYear();

  return shortYear ? `${day} ${month}` : `${day} ${month} ${year}`;
}

/**
 * Compact date with short month name, e.g. '22 Sep 2026' / '22 सप्टें 2026'
 * (used on receipts)
 */
export function formatShortDate(dateInput, lang = getActiveLang()) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);

  const day = String(d.getDate()).padStart(2, '0');
  const month = localeOf(lang).monthsShort[d.getMonth()];
  return `${day} ${month} ${d.getFullYear()}`;
}

/**
 * Formats a date & time string into a date + 12-hour time
 * Example (mr): '22 सप्टेंबर 2026, 03:45 म.नं.'   (en): '22 September 2026, 03:45 PM'
 */
export function formatDateTime(dateInput, lang = getActiveLang()) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);

  const datePart = formatDate(d, false, lang);
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const { am, pm } = localeOf(lang);
  const suffix = hours >= 12 ? pm : am;
  hours = hours % 12;
  hours = hours ? hours : 12;
  const timeStr = `${String(hours).padStart(2, '0')}:${minutes} ${suffix}`;

  return `${datePart}, ${timeStr}`;
}

/**
 * Returns a friendly relative label if today or yesterday, otherwise the formatted date
 */
export function formatFriendlyDate(dateInput, lang = getActiveLang()) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const dayMonth = `${d.getDate()} ${localeOf(lang).months[d.getMonth()]}`;
  if (d.toDateString() === today.toDateString()) return `${translate('common.today', undefined, lang)} (${dayMonth})`;
  if (d.toDateString() === yesterday.toDateString()) return `${translate('common.yesterday', undefined, lang)} (${dayMonth})`;

  return formatDate(dateInput, false, lang);
}

// Older names (kept so existing imports keep working)
export const formatMarathiDate = formatDate;
export const formatMarathiDateTime = formatDateTime;
export const formatFriendlyMarathiDate = formatFriendlyDate;

/**
 * Formats date for HTML input type="date" (YYYY-MM-DD)
 * @param {Date} date
 * @returns {string}
 */
export function toInputDate(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
