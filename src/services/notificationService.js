import { supabase, isSupabaseConfigured } from './supabaseClient';

// Bell-icon notifications: record added, delete request, request approved / rejected.
// Saved in Supabase table `notifications` (see supabase_migration_delete_requests_notifications.sql).
// A copy is also kept in localStorage so everything still works offline / before the table exists.
//
// Only the last NOTIFICATION_DAYS days are ever shown. Older rows are deleted every time the list is loaded.

export const NOTIFICATION_DAYS = 10;
export const NOTIFICATIONS_CHANGED_EVENT = 'homebuild:notifications-changed';

const LOCAL_KEY = 'homebuild_marathi_notifications';
const LOCAL_LIMIT = 300;
const DAY_MS = 24 * 60 * 60 * 1000;

export const newId = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 3) | 8).toString(16);
  });
};

const cutoffISO = () => new Date(Date.now() - NOTIFICATION_DAYS * DAY_MS).toISOString();

const readLocal = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  } catch {
    return [];
  }
};

const writeLocal = (list) => {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(list.slice(0, LOCAL_LIMIT)));
  } catch (err) {
    console.warn('Notification local write error:', err.message);
  }
};

// Tell the app (same tab) that the list changed so the bell refreshes immediately
const announceChange = () => {
  try {
    window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
  } catch {
    /* not in a browser */
  }
};

export const notificationService = {
  /**
   * type      : 'expense_added' | 'delete_request' | 'delete_approved' | 'delete_rejected'
   * actor     : { id, name, mobile }  - who did it
   * audience  : 'all' | 'super_admin' | 'user' (user = only `targetMobile`)
   * data      : small readable values (category, amount ...) - text is built when it is displayed,
   *             so every person sees it in their own language.
   * Never throws - a notification must never break the real action.
   */
  async create({ type, actor = null, audience = 'all', targetMobile = null, requestId = null, data = {} }) {
    const entry = {
      id: newId(),
      created_at: new Date().toISOString(),
      type,
      audience,
      target_mobile: targetMobile || null,
      actor_id: actor?.id || null,
      actor_name: actor?.name || null,
      actor_mobile: actor?.mobile || null,
      request_id: requestId || null,
      data
    };

    writeLocal([entry, ...readLocal()]);

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('notifications').insert([entry]);
        if (error) {
          console.warn('Notification insert error (run supabase_migration_delete_requests_notifications.sql?):', error.message);
        }
      } catch (err) {
        console.warn('Notification insert failed:', err.message);
      }
    }

    announceChange();
    return entry;
  },

  // Removes everything older than 10 days (local copy + database), then returns the rest, newest first.
  async getRecent() {
    const cutoff = cutoffISO();

    const local = readLocal().filter((n) => n.created_at >= cutoff);
    writeLocal(local);

    let remote = [];
    if (isSupabaseConfigured()) {
      try {
        // Best effort: if the table policy does not allow deleting, the filter below still hides old rows.
        const { error: purgeError } = await supabase.from('notifications').delete().lt('created_at', cutoff);
        if (purgeError) console.warn('Notification purge warning:', purgeError.message);

        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .gte('created_at', cutoff)
          .order('created_at', { ascending: false })
          .limit(300);
        if (!error && data) remote = data;
        else if (error) console.warn('Notification fetch error:', error.message);
      } catch (err) {
        console.warn('Notification fetch failed:', err.message);
      }
    }

    const remoteIds = new Set(remote.map((n) => n.id));
    return [...remote, ...local.filter((n) => !remoteIds.has(n.id))]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
};
