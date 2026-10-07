import { DEFAULT_CATEGORY_ENGLISH } from '../constants/defaultCategories';
import { OTHER_CATEGORY, LEGACY_DEFAULT_PROJECT_NAME } from '../constants/appDefaults';

/**
 * Name of a category in the selected language.
 * Categories are stored with a Marathi name (`name`, also used as the stable key)
 * and an English name (`name_en`).
 */
export function categoryLabel(name, nameEn, lang) {
  const marathi = (name || '').trim() || OTHER_CATEGORY;
  if (lang === 'en') {
    return (nameEn || '').trim() || DEFAULT_CATEGORY_ENGLISH[marathi] || marathi;
  }
  return marathi;
}

/**
 * Project name for display. Empty (or the old built-in Marathi default) means
 * "no custom name" -> use the translated default for the selected language.
 */
export function projectLabel(rawName, t) {
  const value = (rawName || '').trim();
  if (!value || value === LEGACY_DEFAULT_PROJECT_NAME) return t('app.defaultProject');
  return value;
}
