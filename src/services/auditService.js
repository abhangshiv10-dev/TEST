import { supabase, isSupabaseConfigured } from './supabaseClient';

// Tracking log: who added / updated / deleted what, and when.
// Saved in Supabase table `audit_logs` (see supabase_migration_audit_logs.sql).
// A copy is also kept in localStorage so the log still works if the table is not created yet / offline.

const LOCAL_KEY = 'homebuild_marathi_audit_logs';
const LOCAL_LIMIT = 500;

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
    console.warn('Audit local write error:', err.message);
  }
};

// Only keep small, readable values in the log (no base64 photos etc.)
const slim = (obj) => {
  if (!obj || typeof obj !== 'object') return obj ?? null;
  const out = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (k === 'categories' || k === 'updated_at' || k === 'created_at') return;
    if (typeof v === 'string' && v.startsWith('data:')) {
      out[k] = '[photo]';
    } else if (Array.isArray(v)) {
      out[k] = v.map((x) => (typeof x === 'string' && x.startsWith('data:') ? '[photo]' : x));
    } else {
      out[k] = v;
    }
  });
  return out;
};

export const auditService = {
  /**
   * actor   : { id, name, mobile }
   * action  : 'add' | 'update' | 'delete'
   * entity  : 'expense' | 'category' | 'budget' | 'profile'
   * options : { entityId, summary, before, after }
   * Never throws - logging must never break the real action.
   */
  async log(actor, action, entity, { entityId = null, summary = '', before = null, after = null } = {}) {
    const entry = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      created_at: new Date().toISOString(),
      actor_id: actor?.id || null,
      actor_name: actor?.name || null,
      actor_mobile: actor?.mobile || null,
      action,
      entity,
      entity_id: entityId ? String(entityId) : null,
      summary,
      details: { before: slim(before), after: slim(after) }
    };

    writeLocal([entry, ...readLocal()]);

    if (isSupabaseConfigured()) {
      try {
        const { id, ...row } = entry; // let the DB create its own uuid
        const { error } = await supabase.from('audit_logs').insert([row]);
        if (error) console.warn('Audit log insert error (run supabase_migration_audit_logs.sql?):', error.message);
      } catch (err) {
        console.warn('Audit log insert failed:', err.message);
      }
    }
    return entry;
  },

  // Newest first. Merges Supabase rows with the local copy (same entry is not shown twice).
  async getLogs(limit = 1000) {
    const local = readLocal();
    let remote = [];

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);
        if (!error && data) remote = data;
        else if (error) console.warn('Audit logs fetch error:', error.message);
      } catch (err) {
        console.warn('Audit logs fetch failed:', err.message);
      }
    }

    // Drop local copies that are already in the DB (same actor/action/entity within 3 seconds)
    const alreadyInDb = (e) =>
      remote.some(
        (r) =>
          r.actor_id === e.actor_id &&
          r.action === e.action &&
          r.entity === e.entity &&
          r.entity_id === e.entity_id &&
          Math.abs(new Date(r.created_at) - new Date(e.created_at)) < 3000
      );
    const localOnly = remote.length > 0 ? local.filter((e) => !alreadyInDb(e)) : local;

    return [...remote, ...localOnly]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);
  }
};
