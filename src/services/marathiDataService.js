import { supabase, isSupabaseConfigured } from './supabaseClient';
import { DEFAULT_MARATHI_CATEGORIES } from '../constants/defaultCategories';

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

  async updateBudget(userId, totalBudget) {
    const budgetNum = Math.max(0, Number(totalBudget) || 0);

    if (isSupabaseConfigured() && userId) {
      try {
        // First check existing settings row
        const { data: existing } = await supabase.from('settings').select('id, user_id').limit(1).maybeSingle();

        let updatedData = null;
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
          return updatedData;
        }
      } catch (err) {
        console.warn('Supabase updateBudget fallback to local:', err.message);
      }
    }

    const current = getLocalData('settings_shared', getLocalData(`settings_${userId}`, { user_id: userId, project_name: 'माझ्या घराचे बांधकाम' }));
    const updated = { ...current, total_budget: budgetNum, updated_at: new Date().toISOString() };
    setLocalData('settings_shared', updated);
    if (userId) setLocalData(`settings_${userId}`, updated);
    return updated;
  },

  // ==========================================
  // 2. CATEGORIES
  // ==========================================
  async getCategories(userId) {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true });

        if (!error && data && data.length > 0) {
          const sorted = data.sort((a, b) => a.name.localeCompare(b.name, 'mr'));
          setLocalData('categories_shared', sorted);
          return sorted;
        }

        // If categories empty in DB, auto seed default categories
        if (userId && (!data || data.length === 0)) {
          const seeds = DEFAULT_MARATHI_CATEGORIES.map(name => ({
            user_id: userId,
            name
          }));
          const { data: inserted, error: seedError } = await supabase
            .from('categories')
            .insert(seeds)
            .select();

          if (!seedError && inserted) {
            const sorted = inserted.sort((a, b) => a.name.localeCompare(b.name, 'mr'));
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
    return local.sort((a, b) => a.name.localeCompare(b.name, 'mr'));
  },

  async addCategory(userId, name) {
    const trimmed = (name || '').trim();
    if (!trimmed) throw new Error('प्रकाराचे नाव आवश्यक आहे.');

    if (isSupabaseConfigured() && userId && !userId.startsWith('demo-')) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .insert([{ user_id: userId, name: trimmed }])
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Supabase addCategory fallback to local:', err.message);
      }
    }

    const categories = getLocalData(`categories_${userId}`, []);
    const exists = categories.find(c => c.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) return exists;

    const newCat = {
      id: `cat-${Date.now()}`,
      user_id: userId,
      name: trimmed,
      created_at: new Date().toISOString()
    };
    categories.push(newCat);
    setLocalData(`categories_${userId}`, categories);
    return newCat;
  },

  async updateCategory(userId, categoryId, newName) {
    const trimmed = (newName || '').trim();
    if (!trimmed) throw new Error('प्रकाराचे नाव आवश्यक आहे.');

    if (isSupabaseConfigured() && userId && !userId.startsWith('demo-')) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .update({ name: trimmed, updated_at: new Date().toISOString() })
          .eq('id', categoryId)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Supabase updateCategory fallback to local:', err.message);
      }
    }

    const categories = getLocalData(`categories_${userId}`, []);
    const idx = categories.findIndex(c => c.id === categoryId);
    if (idx !== -1) {
      categories[idx].name = trimmed;
      setLocalData(`categories_${userId}`, categories);
    }
    return { id: categoryId, name: trimmed };
  },

  async deleteCategory(userId, categoryId) {
    // Check if any expense uses this category
    const expenses = await this.getExpenses(userId);
    const count = expenses.filter(e => e.category_id === categoryId).length;
    if (count > 0) {
      throw new Error(`या प्रकारात ${count} खर्च नोंदवलेले आहेत. आधी ते खर्च बदला किंवा हटवा.`);
    }

    if (isSupabaseConfigured() && userId && !userId.startsWith('demo-')) {
      try {
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', categoryId)
          .eq('user_id', userId);

        if (error) throw error;
        return true;
      } catch (err) {
        console.warn('Supabase deleteCategory fallback to local:', err.message);
      }
    }

    const categories = getLocalData(`categories_${userId}`, []);
    const filtered = categories.filter(c => c.id !== categoryId);
    setLocalData(`categories_${userId}`, filtered);
    return true;
  },

  // ==========================================
  // 3. PHOTO UPLOAD (Supabase Storage)
  // ==========================================
  async uploadPhoto(userId, file) {
    if (!file) return null;

    if (isSupabaseConfigured() && userId && !userId.startsWith('demo-')) {
      try {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('expense-photos')
          .upload(fileName, file, {
            cacheControl: '3600',
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
          const mapped = data.map(item => ({
            ...item,
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
    return local.sort((a, b) => new Date(b.expense_date) - new Date(a.expense_date));
  },

  async addExpense(userId, expenseData, photoFile = null) {
    let photoResult = null;
    if (photoFile) {
      photoResult = await this.uploadPhoto(userId, photoFile);
    }

    const payload = {
      user_id: userId || 'user-shared',
      category_id: expenseData.category_id || null,
      amount: Number(expenseData.amount) || 0,
      expense_date: expenseData.expense_date || new Date().toISOString().split('T')[0],
      description: (expenseData.description || '').trim(),
      photo_path: photoResult?.photo_path || null,
      photo_url: photoResult?.photo_url || null
    };

    if (isSupabaseConfigured() && userId) {
      try {
        const { data, error } = await supabase
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

        if (!error && data) {
          const newExp = {
            ...data,
            category_name: data.categories?.name || 'इतर'
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

  async updateExpense(userId, expenseId, expenseData, photoFile = null, removePhoto = false) {
    let photoPath = expenseData.photo_path || null;
    let photoUrl = expenseData.photo_url || null;

    if (removePhoto) {
      photoPath = null;
      photoUrl = null;
    } else if (photoFile) {
      const uploadRes = await this.uploadPhoto(userId, photoFile);
      if (uploadRes) {
        photoPath = uploadRes.photo_path;
        photoUrl = uploadRes.photo_url;
      }
    }

    const payload = {
      category_id: expenseData.category_id || null,
      amount: Number(expenseData.amount) || 0,
      expense_date: expenseData.expense_date,
      description: (expenseData.description || '').trim(),
      photo_path: photoPath,
      photo_url: photoUrl,
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
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

        if (!error && data) {
          const updated = {
            ...data,
            category_name: data.categories?.name || 'इतर'
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

  async deleteExpense(userId, expenseId, photoPath = null) {
    if (photoPath && isSupabaseConfigured()) {
      try {
        await supabase.storage.from('expense-photos').remove([photoPath]);
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
  async getSummary(userId) {
    const [settings, expenses] = await Promise.all([
      this.getSettings(userId),
      this.getExpenses(userId)
    ]);

    const totalBudget = Number(settings?.total_budget) || 0;
    
    // Calculate total spent
    let totalSpent = 0;
    let todaySpent = 0;
    let thisMonthSpent = 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const categoryMap = {};

    expenses.forEach(exp => {
      const amt = Number(exp.amount) || 0;
      totalSpent += amt;

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
      totalBudget,
      totalSpent,
      remainingBalance,
      percentUsed,
      todaySpent,
      thisMonthSpent,
      expenseCount: expenses.length,
      categoryBreakdown
    };
  }
};
