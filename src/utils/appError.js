import { translate } from '../i18n';

// Errors thrown by services carry a short code instead of a hard-coded sentence.
// The screen turns the code into a message in the selected language.
//   throw new AppError('categoryInUse', { count: 3 })
//   Swal text: errorMessage(err)

export class AppError extends Error {
  constructor(appCode, params) {
    super(appCode);
    this.name = 'AppError';
    this.appCode = appCode;
    this.params = params;
  }
}

/**
 * Message in the selected language for an error.
 * Known app errors -> their own message. Anything else (network / server errors, which
 * usually come in English) -> the translated fallback, so no stray English appears.
 */
export function errorMessage(err, fallbackKey = 'errors.generic') {
  if (err && err.appCode) {
    return translate(`errors.${err.appCode}`, err.params);
  }
  return translate(fallbackKey);
}
