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
 * Formats a date & time string into Marathi date with 12-hour time
 * Example: '2026-09-22T10:15:00Z' -> '22 सप्टेंबर 2026, 03:45 PM'
 */
export function formatMarathiDateTime(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);

  const datePart = formatMarathiDate(d);
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const timeStr = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;

  return `${datePart}, ${timeStr}`;
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
