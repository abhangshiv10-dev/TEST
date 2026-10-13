import { supabase, isSupabaseConfigured } from './supabaseClient';
import { newId } from './notificationService';

// Delete requests: a normal user asks, the Super Admin approves / rejects.
// Saved in Supabase table `delete_requests` (see supabase_migration_delete_requests_notifications.sql),
// with a localStorage copy as a fallback when the table is not available.
//
// Status: 'pending' -> 'approved' | 'rejected'

const LOCAL_KEY = 'homebuild_marathi_delete_requests';
const LOCAL_LIMIT = 300;

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
    console.warn('Delete request local write error:', err.message);
  }
};

export const deleteRequestService = {
  // Is there already a pending request for this record?
  // When the database answers, only its answer is trusted (a stale local copy must not block a new request).
  async findPending(entity, entityId) {
    const id = String(entityId);

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('delete_requests')
          .select('*')
          .eq('entity', entity)
          .eq('entity_id', id)
          .eq('status', 'pending')
          .limit(1);
        if (!error) return data?.[0] || null;
        console.warn('Delete request lookup error:', error.message);
      } catch (err) {
        console.warn('Delete request lookup failed:', err.message);
      }
    }

    return readLocal().find((r) => r.entity === entity && r.entity_id === id && r.status === 'pending') || null;
  },

  /**
   * requester : { id, name, mobile }
   * snapshot  : readable copy of the record (category, amount, date, description, photo_paths ...)
   * Returns { request } or { duplicate: true, request } when one is already waiting.
   */
  async create({ entity = 'expense', entityId, requester, snapshot = {} }) {
    const existing = await this.findPending(entity, entityId);
    if (existing) return { duplicate: true, request: existing };

    const request = {
      id: newId(),
      created_at: new Date().toISOString(),
      entity,
      entity_id: String(entityId),
      status: 'pending',
      requester_id: requester?.id || null,
      requester_name: requester?.name || null,
      requester_mobile: requester?.mobile || null,
      snapshot,
      resolved_at: null,
      resolved_by_name: null,
      resolved_by_mobile: null
    };

    writeLocal([request, ...readLocal()]);

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from('delete_requests').insert([request]);
        if (error) console.warn('Delete request insert error (run supabase_migration_delete_requests_notifications.sql?):', error.message);
      } catch (err) {
        console.warn('Delete request insert failed:', err.message);
      }
    }

    return { request };
  },

  // All requests, newest first. The database copy wins over the local copy for the same id.
  async getAll() {
    const local = readLocal();
    let remote = [];

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('delete_requests')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(500);
        if (!error && data) remote = data;
        else if (error) console.warn('Delete requests fetch error:', error.message);
      } catch (err) {
        console.warn('Delete requests fetch failed:', err.message);
      }
    }

    const remoteIds = new Set(remote.map((r) => r.id));
    return [...remote, ...local.filter((r) => !remoteIds.has(r.id))]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  /**
   * Approve / reject. Only a request that is still pending can be resolved, so when two Super Admins
   * act at the same time only the first one wins.
   * Returns the updated request, or null when it was already handled / not found.
   */
  async resolve(id, status, resolver) {
    const patch = {
      status,
      resolved_at: new Date().toISOString(),
      resolved_by_name: resolver?.name || null,
      resolved_by_mobile: resolver?.mobile || null
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('delete_requests')
          .update(patch)
          .eq('id', id)
          .eq('status', 'pending')
          .select();

        if (!error) {
          if (!data || data.length === 0) return null; // already handled by someone else
          const updated = data[0];
          writeLocal(readLocal().map((r) => (r.id === id ? { ...r, ...updated } : r)));
          return updated;
        }
        console.warn('Delete request update error:', error.message);
      } catch (err) {
        console.warn('Delete request update failed:', err.message);
      }
    }

    const list = readLocal();
    const idx = list.findIndex((r) => r.id === id && r.status === 'pending');
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...patch };
    writeLocal(list);
    return list[idx];
  }
};
