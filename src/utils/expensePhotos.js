// Helpers for expenses that can have MORE THAN ONE photo / bill.
//
// DB columns (see supabase_migration_expense_multiple_photos.sql):
//   photo_urls  jsonb  -> ["https://...", "https://..."]
//   photo_paths jsonb  -> ["uid/123_a.jpg", "uid/124_b.jpg"]   (same order as photo_urls)
// The old single-photo columns (photo_url / photo_path) are still kept in sync with the
// FIRST photo, so receipts, exports and old records keep working.

export const MAX_EXPENSE_PHOTOS = 10;

// -> [{ url, path }]  (works for old single-photo expenses too)
export function getExpensePhotos(expense) {
  if (!expense) return [];

  const urls = Array.isArray(expense.photo_urls) ? expense.photo_urls : [];
  if (urls.length > 0) {
    const paths = Array.isArray(expense.photo_paths) ? expense.photo_paths : [];
    return urls
      .map((url, i) => ({ url, path: paths[i] || null }))
      .filter((p) => Boolean(p.url));
  }

  if (expense.photo_url) {
    return [{ url: expense.photo_url, path: expense.photo_path || null }];
  }
  return [];
}

// [{ url, path }] -> DB columns
export function buildPhotoColumns(photos = []) {
  const list = photos.filter((p) => p && p.url);
  return {
    photo_url: list[0]?.url || null,
    photo_path: list[0]?.path || null,
    photo_urls: list.map((p) => p.url),
    photo_paths: list.map((p) => p.path || null)
  };
}
