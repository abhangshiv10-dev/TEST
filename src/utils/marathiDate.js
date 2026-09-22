const MARATHI_MONTHS = [
  'जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून',
  'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'
];

/**
 * Formats a date string (YYYY-MM-DD or ISO) into natural Marathi text
 * Example: '2026-09-22' -> '22 सप्टेंबर 2026'
 * @param {string|Date} dateInput
 * @param {boolean} shortYear
 * @returns {string}
 */
export function formatMarathiDate(dateInput, shortYear = false) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);

  const day = d.getDate();
  const month = MARATHI_MONTHS[d.getMonth()];
  const year = d.getFullYear();

  return shortYear ? `${day} ${month}` : `${day} ${month} ${year}`;
}

/**
 * Returns a friendly relative label if today or yesterday, otherwise formatted date
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatFriendlyMarathiDate(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isToday = d.toDateString() === today.toDateString();
  const isYesterday = d.toDateString() === yesterday.toDateString();

  if (isToday) return `आज (${d.getDate()} ${MARATHI_MONTHS[d.getMonth()]})`;
  if (isYesterday) return `काल (${d.getDate()} ${MARATHI_MONTHS[d.getMonth()]})`;

  return formatMarathiDate(dateInput);
}

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
