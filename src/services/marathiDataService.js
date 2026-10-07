import { supabase, isSupabaseConfigured } from './supabaseClient';
import { DEFAULT_MARATHI_CATEGORIES, DEFAULT_CATEGORY_ENGLISH } from '../constants/defaultCategories';
import { compressImage } from '../utils/imageCompress';
import { getExpensePhotos, buildPhotoColumns } from '../utils/expensePhotos';

const STORAGE_KEY_PREFIX = 'homebuild_marathi_';

// Initial local storage defaults if offline or demo
const getLocalData = (key, fallback) => {
  try {
    const data = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
};

const setLocalData = (key, data) => {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(data));
  } catch (err) {
    console.error('LocalStorage write error:', err);
  }
};


// True when the remote DB does not have a column yet (migration not run) — lets us degrade gracefully
const isMissingColumnError = (err, column) =>
  Boolean(err) && (err.code === '42703' || err.code === 'PGRST204' || (err.message && err.message.includes(column)));

// English Name for a category: saved name_en -> locally cached one -> built-in default -> ''
const resolveEnglishName = (cat, localEnMap) =>
  (cat.name_en || '').trim() || localEnMap?.get(cat.id) || DEFAULT_CATEGORY_ENGLISH[cat.name] || '';

// Patch one category inside both local caches (shared + per user)
const patchLocalCategory = (userId, categoryId, patch) => {
  const keys = ['categories_shared', userId ? `categories_${userId}` : null].filter(Boolean);
  keys.forEach((key) => {
    const list = getLocalData(key, []);
    const idx = list.findIndex((c) => c.id === categoryId);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...patch };
      setLocalData(key, list);
    }
  });
};

// Seed defaults if initial local storage is completely empty (clean live state, no dummy records)
const initLocalStorageIfEmpty = (userId = 'user-shared') => {
  const currentSettings = getLocalData(`settings_shared`, getLocalData(`settings_${userId}`, null));
  if (!currentSettings) {
    const defaultSettings = {
      id: `setting-shared`,
      user_id: userId,
      total_budget: 0,
      project_name: 'माझ्या घराचे बांधकाम'
    };
    setLocalData(`settings_shared`, defaultSettings);
    setLocalData(`settings_${userId}`, defaultSettings);
  }

  const currentCats = getLocalData(`categories_shared`, getLocalData(`categories_${userId}`, null));
  if (!currentCats || currentCats.length === 0) {
    const defaultCatObjects = DEFAULT_MARATHI_CATEGORIES.map((name, idx) => ({
      id: `cat-${idx + 1}`,
      name,
      name_en: DEFAULT_CATEGORY_ENGLISH[name] || '',
      created_at: new Date().toISOString()
    }));
    setLocalData(`categories_shared`, defaultCatObjects);
    setLocalData(`categories_${userId}`, defaultCatObjects);
  }

  const currentExp = getLocalData(`expenses_shared`, getLocalData(`expenses_${userId}`, null));
  if (!currentExp) {
    setLocalData(`expenses_shared`, []);
    setLocalData(`expenses_${userId}`, []);
  }
};

// True when Supabase complains that photo_urls / photo_paths columns do not exist yet
function isMissingPhotoColumnError(error) {
  if (!error) return false;
  const msg = error.message || '';
  return (
    (error.code === '42703' || error.code === 'PGRST204') &&
    (msg.includes('photo_urls') || msg.includes('photo_paths'))
  );
}

export const marathiDataService = {
  // ==========================================
  // 1. SETTINGS & BUDGET
  // ==========================================
  async getSettings(userId) {
    if (isSupabaseConfigured()) {
      try {
        // Query shared construction project settings
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          setLocalData('settings_shared', data);
          if (userId) setLocalData(`settings_${userId}`, data);
          return data;
        }

        if (userId && !data) {
          const { data: newRow, error: insertError } = await supabase
            .from('settings')
            .insert([{ user_id: userId, total_budget: 0, project_name: 'माझ्या घराचे बांधकाम' }])
            .select()
            .single();

          if (!insertError && newRow) {
            setLocalData('settings_shared', newRow);
            setLocalData(`settings_${userId}`, newRow);
            return newRow;
          }
        }
      } catch (err) {
        console.warn('Supabase getSettings fallback to local:', err.message);
      }
    }

    initLocalStorageIfEmpty(userId);
    return getLocalData('settings_shared', getLocalData(`settings_${userId}`, {
      user_id: userId,
      total_budget: 0,
      project_name: 'माझ्या घराचे बांधकाम'
    }));
  },

  async updateBudget(userId, totalBudget, changeType = 'set', amountChanged = 0, note = '') {
    const budgetNum = Math.max(0, Number(totalBudget) || 0);
    const settings = await this.getSettings(userId);
    const prevBudget = Number(settings?.total_budget) || 0;

    let delta = Number(amountChanged) || 0;
    if (delta === 0 && changeType === 'add') {
      delta = budgetNum - prevBudget;
    } else if (delta === 0 && prevBudget === 0) {
      delta = budgetNum;
      changeType = 'initial';
    }

    let finalChangeType = changeType;
    if (prevBudget === 0) {
      finalChangeType = 'initial';
    }

    let updatedData = null;

    if (isSupabaseConfigured() && userId) {
      try {
        // First check existing settings row
        const { data: existing } = await supabase.from('settings').select('id, user_id').limit(1).maybeSingle();

        if (existing) {
          const { data, error } = await supabase
            .from('settings')
            .update({ total_budget: budgetNum, updated_at: new Date().toISOString() })
            .eq('id', existing.id)
            .select()
            .single();
          if (!error && data) updatedData = data;
        } else {
          const { data, error } = await supabase
            .from('settings')
            .insert([{ user_id: userId, total_budget: budgetNum, project_name: 'माझ्या घराचे बांधकाम' }])
            .select()
            .single();
          if (!error && data) updatedData = data;
        }

        if (updatedData) {
          setLocalData('settings_shared', updatedData);
          if (userId) setLocalData(`settings_${userId}`, updatedData);
        }
      } catch (err) {
        console.warn('Supabase updateBudget fallback to local:', err.message);
      }
    }

    if (!updatedData) {
      const current = getLocalData('settings_shared', getLocalData(`settings_${userId}`, { user_id: userId, project_name: 'माझ्या घराचे बांधकाम' }));
      updatedData = { ...current, total_budget: budgetNum, updated_at: new Date().toISOString() };
      setLocalData('settings_shared', updatedData);
      if (userId) setLocalData(`settings_${userId}`, updatedData);
    }

    // Record Budget History Entry
    const historyEntry = {
      id: `bh-${Date.now()}`,
      user_id: userId || 'user-shared',
      change_type: finalChangeType,
      amount_changed: delta > 0 ? delta : budgetNum,
      previous_budget: prevBudget,
      new_budget: budgetNum,
      note: note || (finalChangeType === 'initial' ? 'सुरुवातीचे निश्चित केलेले बजेट' : finalChangeType === 'add' ? `बजेटमध्ये वाढ केली` : 'एकूण बजेट बदलले'),
      created_at: new Date().toISOString()
    };

    // Save to local storage history array
    const historyList = getLocalData('budget_history_shared', []);
    setLocalData('budget_history_shared', [historyEntry, ...historyList]);
    if (userId) setLocalData(`budget_history_${userId}`, [historyEntry, ...historyList]);

    // Save to Supabase budget_history table if available
    if (isSupabaseConfigured()) {
      try {
        const { data: inserted, error: insertError } = await supabase.from('budget_history').insert([{
          user_id: userId || 'user-shared',
          change_type: historyEntry.change_type,
          amount_changed: Number(historyEntry.amount_changed) || 0,
          previous_budget: Number(historyEntry.previous_budget) || 0,
          new_budget: Number(historyEntry.new_budget) || 0,
          note: historyEntry.note,
          created_at: historyEntry.created_at
        }]).select();

        if (!insertError && inserted && inserted.length > 0) {
          const cloudEntry = inserted[0];
          const updatedHistory = [cloudEntry, ...historyList.filter(h => h.id !== historyEntry.id)];
          setLocalData('budget_history_shared', updatedHistory);
          if (userId) setLocalData(`budget_history_${userId}`, updatedHistory);
        } else if (insertError) {
          console.warn('Supabase budget_history insert error:', insertError.message);
        }
      } catch (err) {
        console.warn('Supabase budget_history insert fallback:', err.message);
      }
    }

    return updatedData;
  },

  async getBudgetHistory(userId) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('budget_history')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          setLocalData('budget_history_shared', data);
          if (userId) setLocalData(`budget_history_${userId}`, data);
          return data;
        } else if (error) {
          console.warn('Supabase getBudgetHistory error (table might need to be created):', error.message);
        }
      } catch (err) {
        console.warn('Supabase getBudgetHistory fallback to local:', err.message);
      }
    }

    const localList = getLocalData('budget_history_shared', getLocalData(`budget_history_${userId}`, []));
    if (localList.length > 0) {
      return localList;
    }

    // If history is currently empty but total_budget > 0, generate the initial record baseline
    const settings = await this.getSettings(userId);
    const budget = Number(settings?.total_budget) || 0;
    if (budget > 0) {
      const initialEntry = {
        id: 'bh-initial-baseline',
        user_id: userId || 'user-shared',
        change_type: 'initial',
        amount_changed: budget,
        previous_budget: 0,
        new_budget: budget,
        note: 'सुरुवातीचे निश्चित केलेले बजेट',
        created_at: settings.created_at || new Date().toISOString()
      };
      setLocalData('budget_history_shared', [initialEntry]);
      return [initialEntry];
    }

    return [];
  },

  // ==========================================
  // 2. CATEGORIES
  // ==========================================
  async getCategories(userId) {
    const cached = getLocalData('categories_shared', []);
    const localEnMap = new Map(cached.filter((c) => c.name_en).map((c) => [c.id, c.name_en]));
    const normalize = (list) =>
      list
        .map((c) => ({ ...c, name_en: resolveEnglishName(c, localEnMap) }))
        .sort((a, b) => a.name.localeCompare(b.name, 'mr'));

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true });

        if (!error && data && data.length > 0) {
          const sorted = normalize(data);
          setLocalData('categories_shared', sorted);
          return sorted;
        }

        // If categories empty in DB, auto seed default categories (with English names)
        if (userId && (!data || data.length === 0)) {
          const seeds = DEFAULT_MARATHI_CATEGORIES.map((name) => ({
            user_id: userId,
            name,
            name_en: DEFAULT_CATEGORY_ENGLISH[name] || null
          }));
          let seedRes = await supabase.from('categories').insert(seeds).select();
          if (seedRes.error && isMissingColumnError(seedRes.error, 'name_en')) {
            seedRes = await supabase
              .from('categories')
              .insert(seeds.map(({ name_en, ...rest }) => rest))
              .select();
          }

          if (!seedRes.error && seedRes.data) {
            const sorted = normalize(seedRes.data);
            setLocalData('categories_shared', sorted);
            return sorted;
          }
        }
      } catch (err) {
        console.warn('Supabase getCategories fallback to local:', err.message);
      }
    }

    initLocalStorageIfEmpty(userId);
    const local = getLocalData('categories_shared', getLocalData(`categories_${userId}`, []));
    return normalize(local);
  },

  // name   = Marathi Name  (shown to the user everywhere)
  // nameEn = English Name  (used so the category can also be found by searching in English)
  async addCategory(userId, name, nameEn = '') {
    const trimmed = (name || '').trim();
    const trimmedEn = (nameEn || '').trim();
    if (!trimmed) throw new Error('प्रकाराचे मराठी नाव (Marathi Name) आवश्यक आहे.');
    if (!trimmedEn) throw new Error('प्रकाराचे इंग्रजी नाव (English Name) आवश्यक आहे.');

    const known = getLocalData('categories_shared', []);
    const duplicate = known.find(
      (c) =>
        (c.name || '').toLowerCase() === trimmed.toLowerCase() ||
        (c.name_en || '').toLowerCase() === trimmedEn.toLowerCase()
    );
    if (duplicate) {
      throw new Error(`"${duplicate.name}${duplicate.name_en ? ` / ${duplicate.name_en}` : ''}" हा प्रकार आधीच अस्तित्वात आहे.`);
    }

    if (isSupabaseConfigured() && userId && !userId.startsWith('demo-')) {
      try {
        let res = await supabase
          .from('categories')
          .insert([{ user_id: userId, name: trimmed, name_en: trimmedEn }])
          .select()
          .single();

        // name_en column not created yet on the remote DB -> save without it (kept in local cache)
        if (res.error && isMissingColumnError(res.error, 'name_en')) {
          console.warn('Column name_en missing in DB — run supabase_migration_category_english_name.sql');
          res = await supabase
            .from('categories')
            .insert([{ user_id: userId, name: trimmed }])
            .select()
            .single();
        }

        if (res.error) throw res.error;

        const created = { ...res.data, name_en: trimmedEn };
        setLocalData('categories_shared', [...getLocalData('categories_shared', []), created]);
        return created;
      } catch (err) {
        console.warn('Supabase addCategory fallback to local:', err.message);
      }
    }

    const newCat = {
      id: `cat-${Date.now()}`,
      user_id: userId,
      name: trimmed,
      name_en: trimmedEn,
      created_at: new Date().toISOString()
    };
    const shared = getLocalData('categories_shared', getLocalData(`categories_${userId}`, []));
    setLocalData('categories_shared', [...shared, newCat]);
    if (userId) setLocalData(`categories_${userId}`, [...shared, newCat]);
    return newCat;
  },

  async updateCategory(userId, categoryId, newName, newNameEn = '') {
    const trimmed = (newName || '').trim();
    const trimmedEn = (newNameEn || '').trim();
    if (!trimmed) throw new Error('प्रकाराचे मराठी नाव (Marathi Name) आवश्यक आहे.');
    if (!trimmedEn) throw new Error('प्रकाराचे इंग्रजी नाव (English Name) आवश्यक आहे.');

    const known = getLocalData('categories_shared', []);
    const duplicate = known.find(
      (c) =>
        c.id !== categoryId &&
        ((c.name || '').toLowerCase() === trimmed.toLowerCase() ||
          (c.name_en || '').toLowerCase() === trimmedEn.toLowerCase())
    );
    if (duplicate) {
      throw new Error(`"${duplicate.name}${duplicate.name_en ? ` / ${duplicate.name_en}` : ''}" हा प्रकार आधीच अस्तित्वात आहे.`);
    }

    if (isSupabaseConfigured()) {
      try {
        const now = new Date().toISOString();
        let res = await supabase
          .from('categories')
          .update({ name: trimmed, name_en: trimmedEn, updated_at: now })
          .eq('id', categoryId)
          .select()
          .single();

        if (res.error && isMissingColumnError(res.error, 'name_en')) {
          console.warn('Column name_en missing in DB — run supabase_migration_category_english_name.sql');
          res = await supabase
            .from('categories')
            .update({ name: trimmed, updated_at: now })
            .eq('id', categoryId)
            .select()
            .single();
        }

        if (res.error) throw res.error;

        const updated = { ...res.data, name_en: trimmedEn };
        patchLocalCategory(userId, categoryId, { name: trimmed, name_en: trimmedEn });
        return updated;
      } catch (err) {
        console.warn('Supabase updateCategory fallback to local:', err.message);
      }
    }

    patchLocalCategory(userId, categoryId, { name: trimmed, name_en: trimmedEn });
    return { id: categoryId, name: trimmed, name_en: trimmedEn };
  },

  async deleteCategory(userId, categoryId) {
    // Check if any expense uses this category
    const expenses = await this.getExpenses(userId);
    const count = expenses.filter(e => e.category_id === categoryId).length;
    if (count > 0) {
      throw new Error(`या प्रकारात ${count} खर्च नोंदवलेले आहेत. आधी ते खर्च बदला किंवा हटवा.`);
    }

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', categoryId);

        if (error) throw error;
        return true;
      } catch (err) {
        console.warn('Supabase deleteCategory fallback to local:', err.message);
      }
    }

    const categories = getLocalData(`categories_shared`, getLocalData(`categories_${userId}`, []));
    const filtered = categories.filter(c => c.id !== categoryId);
    setLocalData(`categories_shared`, filtered);
    if (userId) setLocalData(`categories_${userId}`, filtered);
    return true;
  },

  // ==========================================
  // 3. PHOTO UPLOAD (Supabase Storage)
  // ==========================================
  // Uploads many files (one after another, so a slow phone connection is not overloaded).
  // Returns [{ url, path }] - files that failed to upload are skipped.
  async uploadPhotos(userId, files = []) {
    const list = Array.from(files || []).filter(Boolean);
    const results = [];
    for (const file of list) {
      try {
        const res = await this.uploadPhoto(userId, file);
        if (res?.photo_url) results.push({ url: res.photo_url, path: res.photo_path || null });
      } catch (err) {
        console.warn('Photo upload failed:', err.message);
      }
    }
    return results;
  },

  async uploadPhoto(userId, originalFile) {
    if (!originalFile) return null;
    // Compress first: much faster upload + much faster loading of the list afterwards
    const file = await compressImage(originalFile);

    if (isSupabaseConfigured() && userId && !userId.startsWith('demo-')) {
      try {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('expense-photos')
          .upload(fileName, file, {
            cacheControl: '31536000', // file names are unique, so it is safe to cache for a year
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('expense-photos')
          .getPublicUrl(fileName);

        return { photo_path: fileName, photo_url: publicUrl };
      } catch (err) {
        console.warn('Storage upload fallback to base64 data URL:', err.message);
      }
    }

    // Fallback: convert to base64 Data URL for local storage demo
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({
          photo_path: `local_${Date.now()}`,
          photo_url: reader.result
        });
      };
      reader.readAsDataURL(file);
    });
  },

  // ==========================================
  // 4. EXPENSES (CRUD)
  // ==========================================
  async getExpenses(userId) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('expenses')
          .select(`
            *,
            categories (
              id,
              name
            )
          `)
          .order('expense_date', { ascending: false })
          .order('created_at', { ascending: false });

        if (!error && data) {
          const localStored = getLocalData('expenses_shared', []);
          const localStatusMap = new Map(localStored.map(item => [item.id, item.payment_status]));

          const mapped = data.map(item => ({
            ...item,
            payment_status: item.payment_status || localStatusMap.get(item.id) || 'Paid',
            category_name: item.categories?.name || 'इतर'
          }));
          setLocalData('expenses_shared', mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Supabase getExpenses fallback to local:', err.message);
      }
    }

    initLocalStorageIfEmpty(userId);
    const local = getLocalData('expenses_shared', getLocalData(`expenses_${userId}`, []));
    return local
      .map(item => ({ ...item, payment_status: item.payment_status || 'Paid' }))
      .sort((a, b) => new Date(b.expense_date) - new Date(a.expense_date));
  },

  async addExpense(userId, expenseData, photoFiles = []) {
    const files = Array.isArray(photoFiles) ? photoFiles : (photoFiles ? [photoFiles] : []);
    const uploaded = await this.uploadPhotos(userId, files);

    const payload = {
      user_id: userId || 'user-shared',
      category_id: expenseData.category_id || null,
      amount: Number(expenseData.amount) || 0,
      expense_date: expenseData.expense_date || new Date().toISOString().split('T')[0],
      payment_status: expenseData.payment_status || 'Paid',
      description: (expenseData.description || '').trim(),
      ...buildPhotoColumns(uploaded)
    };

    if (isSupabaseConfigured() && userId) {
      try {
        let insertRes = await supabase
          .from('expenses')
          .insert([payload])
          .select(`
            *,
            categories (
              id,
              name
            )
          `)
          .single();

        // If payment_status column doesn't exist yet on remote DB (PGRST204 or 42703), retry without payment_status
        if (insertRes.error && (insertRes.error.code === '42703' || insertRes.error.code === 'PGRST204' || (insertRes.error.message && insertRes.error.message.includes('payment_status')))) {
          console.warn('Column payment_status not yet in DB schema, falling back to inserting without it:', insertRes.error.message);
          const { payment_status, ...safePayload } = payload;
          insertRes = await supabase
            .from('expenses')
            .insert([safePayload])
            .select(`
              *,
              categories (
                id,
                name
              )
            `)
            .single();
        }

        // photo_urls / photo_paths columns not created yet (migration not run) -> save first photo only
        if (insertRes.error && isMissingPhotoColumnError(insertRes.error)) {
          console.warn('photo_urls column missing in DB. Run supabase_migration_expense_multiple_photos.sql');
          const { photo_urls, photo_paths, ...safePayload } = payload;
          insertRes = await supabase
            .from('expenses')
            .insert([safePayload])
            .select(`*, categories ( id, name )`)
            .single();
        }

        if (!insertRes.error && insertRes.data) {
          const newExp = {
            ...insertRes.data,
            payment_status: payload.payment_status || insertRes.data.payment_status || 'Paid',
            category_name: insertRes.data.categories?.name || 'इतर'
          };
          const expenses = getLocalData('expenses_shared', []);
          setLocalData('expenses_shared', [newExp, ...expenses]);
          return newExp;
        }
      } catch (err) {
        console.warn('Supabase addExpense fallback to local:', err.message);
      }
    }

    const expenses = getLocalData('expenses_shared', getLocalData(`expenses_${userId}`, []));
    const categories = getLocalData('categories_shared', getLocalData(`categories_${userId}`, []));
    const matchedCat = categories.find(c => c.id === payload.category_id);

    const newExpense = {
      ...payload,
      id: `exp-${Date.now()}`,
      category_name: matchedCat?.name || 'इतर',
      created_at: new Date().toISOString()
    };

    expenses.unshift(newExpense);
    setLocalData('expenses_shared', expenses);
    if (userId) setLocalData(`expenses_${userId}`, expenses);
    return newExpense;
  },

  // expenseData already contains the photos that are KEPT (photo_url/photo_urls/...).
  // newFiles are uploaded and appended; removedPaths are deleted from storage.
  async updateExpense(userId, expenseId, expenseData, newFiles = [], removedPaths = []) {
    const files = Array.isArray(newFiles) ? newFiles : (newFiles ? [newFiles] : []);

    // Keep what the caller sent; if it sent nothing about photos (e.g. status toggle) keep the old ones
    const hasPhotoInfo = 'photo_urls' in expenseData || 'photo_url' in expenseData;
    const keptPhotos = hasPhotoInfo ? getExpensePhotos(expenseData) : [];
    const uploaded = await this.uploadPhotos(userId, files);
    const finalPhotos = [...keptPhotos, ...uploaded];

    if (removedPaths?.length && isSupabaseConfigured()) {
      try {
        await supabase.storage.from('expense-photos').remove(removedPaths.filter((x) => x && !x.startsWith('local_')));
      } catch (err) {
        console.warn('Storage delete warning:', err.message);
      }
    }

    const payload = {
      category_id: expenseData.category_id || null,
      amount: Number(expenseData.amount) || 0,
      expense_date: expenseData.expense_date,
      payment_status: expenseData.payment_status || 'Paid',
      description: (expenseData.description || '').trim(),
      updated_at: new Date().toISOString()
    };
    // only touch photo columns when the caller is actually editing photos
    if (hasPhotoInfo || uploaded.length > 0 || removedPaths?.length) {
      Object.assign(payload, buildPhotoColumns(finalPhotos));
    }

    if (isSupabaseConfigured()) {
      try {
        let updateRes = await supabase
          .from('expenses')
          .update(payload)
          .eq('id', expenseId)
          .select(`
            *,
            categories (
              id,
              name
            )
          `)
          .single();

        if (updateRes.error && (updateRes.error.code === '42703' || updateRes.error.code === 'PGRST204' || (updateRes.error.message && updateRes.error.message.includes('payment_status')))) {
          console.warn('Column payment_status not yet in DB schema on update, falling back:', updateRes.error.message);
          const { payment_status, ...safePayload } = payload;
          updateRes = await supabase
            .from('expenses')
            .update(safePayload)
            .eq('id', expenseId)
            .select(`
              *,
              categories (
                id,
                name
              )
            `)
            .single();
        }

        if (updateRes.error && isMissingPhotoColumnError(updateRes.error)) {
          console.warn('photo_urls column missing in DB. Run supabase_migration_expense_multiple_photos.sql');
          const { photo_urls, photo_paths, ...safePayload } = payload;
          updateRes = await supabase
            .from('expenses')
            .update(safePayload)
            .eq('id', expenseId)
            .select(`*, categories ( id, name )`)
            .single();
        }

        if (!updateRes.error && updateRes.data) {
          const updated = {
            ...updateRes.data,
            payment_status: payload.payment_status || updateRes.data.payment_status || 'Paid',
            category_name: updateRes.data.categories?.name || 'इतर'
          };
          const expenses = getLocalData('expenses_shared', []);
          const idx = expenses.findIndex(e => e.id === expenseId);
          if (idx !== -1) {
            expenses[idx] = updated;
            setLocalData('expenses_shared', expenses);
          }
          return updated;
        }
      } catch (err) {
        console.warn('Supabase updateExpense fallback to local:', err.message);
      }
    }

    const expenses = getLocalData('expenses_shared', getLocalData(`expenses_${userId}`, []));
    const categories = getLocalData('categories_shared', getLocalData(`categories_${userId}`, []));
    const idx = expenses.findIndex(e => e.id === expenseId);
    if (idx !== -1) {
      const matchedCat = categories.find(c => c.id === payload.category_id);
      expenses[idx] = {
        ...expenses[idx],
        ...payload,
        category_name: matchedCat?.name || 'इतर'
      };
      setLocalData('expenses_shared', expenses);
      if (userId) setLocalData(`expenses_${userId}`, expenses);
    }
    return expenses[idx];
  },

  async deleteExpense(userId, expenseId, photoPaths = null) {
    const paths = (Array.isArray(photoPaths) ? photoPaths : [photoPaths])
      .filter((x) => x && !String(x).startsWith('local_'));
    if (paths.length > 0 && isSupabaseConfigured()) {
      try {
        await supabase.storage.from('expense-photos').remove(paths);
      } catch (err) {
        console.warn('Storage delete warning:', err.message);
      }
    }

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('expenses')
          .delete()
          .eq('id', expenseId);
      } catch (err) {
        console.warn('Supabase deleteExpense fallback to local:', err.message);
      }
    }

    const expenses = getLocalData('expenses_shared', getLocalData(`expenses_${userId}`, []));
    const filtered = expenses.filter(e => e.id !== expenseId);
    setLocalData('expenses_shared', filtered);
    if (userId) setLocalData(`expenses_${userId}`, filtered);
    return true;
  },

  // ==========================================
  // 5. FINANCIAL & CATEGORY SUMMARIES
  // ==========================================
  // Fetches again only if the caller did not already load settings/expenses.
  async getSummary(userId, preloaded = {}) {
    const [settings, expenses] = await Promise.all([
      preloaded.settings ?? this.getSettings(userId),
      preloaded.expenses ?? this.getExpenses(userId)
    ]);
    return computeSummary(settings, expenses);
  }
};

// Pure function: builds dashboard totals from already-loaded data (no network).
export function computeSummary(settings, expenses) {
    const totalBudget = Number(settings?.total_budget) || 0;
    
    // Calculate total spent
    let totalSpent = 0;
    let todaySpent = 0;
    let thisMonthSpent = 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const categoryMap = {};

    let totalPaid = 0;
    let totalPending = 0;
    let pendingCount = 0;

    expenses.forEach(exp => {
      const amt = Number(exp.amount) || 0;
      totalSpent += amt;

      const isPending = (exp.payment_status || '').toLowerCase() === 'pending' || exp.payment_status === 'बाकी';
      if (isPending) {
        totalPending += amt;
        pendingCount += 1;
      } else {
        totalPaid += amt;
      }

      // Check today
      if (exp.expense_date === todayStr) {
        todaySpent += amt;
      }

      // Check current month
      const expDate = new Date(exp.expense_date);
      if (expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear) {
        thisMonthSpent += amt;
      }

      // Category breakdown
      const catName = exp.category_name || 'इतर';
      categoryMap[catName] = (categoryMap[catName] || 0) + amt;
    });

    const remainingBalance = totalBudget - totalSpent;
    const percentUsed = totalBudget > 0 ? Number(((totalSpent / totalBudget) * 100).toFixed(1)) : 0;

    // Convert category map to sorted array
    const categoryBreakdown = Object.entries(categoryMap)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalSpent > 0 ? Number(((amount / totalSpent) * 100).toFixed(1)) : 0
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      projectName: settings?.project_name || '',
      totalBudget,
      totalSpent,
      totalPaid,
      totalPending,
      pendingCount,
      remainingBalance,
      percentUsed,
      todaySpent,
      thisMonthSpent,
      expenseCount: expenses.length,
      categoryBreakdown
    };
}
