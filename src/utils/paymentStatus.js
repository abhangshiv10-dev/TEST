// Payment status helpers.
// The database stores 'Paid' / 'Pending' (older rows may contain the Marathi words).
// These values are data, not screen text - the screen text comes from the translations.

export const PAYMENT_STATUS = { PAID: 'Paid', PENDING: 'Pending' };

const LEGACY_PENDING = '\u092C\u093E\u0915\u0940'; // older rows stored the Marathi word for "pending"

export const isPendingStatus = (status) =>
  String(status || '').toLowerCase() === 'pending' || status === LEGACY_PENDING;

export const isPaidStatus = (status) => !isPendingStatus(status);
