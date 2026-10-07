// Data keys the app relies on (these are stored values, not screen text).

// Category used when an expense has no category. Its English name comes from DEFAULT_CATEGORY_ENGLISH.
export const OTHER_CATEGORY = '\u0907\u0924\u0930'; // "Other" in Marathi, same as the last default category

// Older installs saved this Marathi sentence as the project name. It is treated as
// "no custom name set", so the project name follows the selected language.
export const LEGACY_DEFAULT_PROJECT_NAME = '\u092E\u093E\u091D\u094D\u092F\u093E \u0918\u0930\u093E\u091A\u0947 \u092C\u093E\u0902\u0927\u0915\u093E\u092E';

// Older sign-ins saved a placeholder name that starts with this Marathi word ("house owner").
// It is ignored when showing the user's name, so it never shows up in English mode.
export const LEGACY_OWNER_NAME_PREFIX = '\u0918\u0930\u092E\u093E\u0932\u0915'; // "gharmalak"
