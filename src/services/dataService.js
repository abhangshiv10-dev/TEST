import { supabase, isSupabaseConfigured } from './supabaseClient';
import { 
  INITIAL_DEMO_PROJECT, 
  INITIAL_SUPPLIERS, 
  INITIAL_MATERIALS, 
  INITIAL_WORKERS, 
  INITIAL_CONTRACTORS, 
  INITIAL_BUDGETS, 
  INITIAL_EXPENSES, 
  INITIAL_EXPENSE_PAYMENTS, 
  INITIAL_LABOUR_ENTRIES, 
  INITIAL_DAILY_DIARIES, 
  INITIAL_TASKS, 
  INITIAL_PHOTOS, 
  INITIAL_DOCUMENTS, 
  INITIAL_FUNDINGS, 
  INITIAL_LOANS, 
  INITIAL_NOTIFICATIONS 
} from './mockData';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { DEFAULT_STAGES } from '../constants/stages';

const STORAGE_KEYS = {
  PROJECTS: 'hbt_projects',
  ACTIVE_PROJECT_ID: 'hbt_active_project_id',
  CATEGORIES: 'hbt_categories',
  STAGES: 'hbt_stages',
  EXPENSES: 'hbt_expenses',
  EXPENSE_PAYMENTS: 'hbt_expense_payments',
  BUDGETS: 'hbt_budgets',
  MATERIALS: 'hbt_materials',
  MATERIAL_PURCHASES: 'hbt_material_purchases',
  MATERIAL_ADJUSTMENTS: 'hbt_material_adjustments',
  SUPPLIERS: 'hbt_suppliers',
  SUPPLIER_PAYMENTS: 'hbt_supplier_payments',
  WORKERS: 'hbt_workers',
  LABOUR_ENTRIES: 'hbt_labour_entries',
  CONTRACTORS: 'hbt_contractors',
  CONTRACTOR_PAYMENTS: 'hbt_contractor_payments',
  DAILY_DIARIES: 'hbt_daily_diaries',
  PHOTOS: 'hbt_photos',
  DOCUMENTS: 'hbt_documents',
  TASKS: 'hbt_tasks',
  FUNDINGS: 'hbt_fundings',
  LOANS: 'hbt_loans',
  NOTIFICATIONS: 'hbt_notifications',
  USER_SETTINGS: 'hbt_user_settings'
};

// Initialize local storage defaults if empty (clean live mode)
export const initializeLocalStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
  }

  if (!localStorage.getItem(STORAGE_KEYS.STAGES)) {
    localStorage.setItem(STORAGE_KEYS.STAGES, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.SUPPLIERS)) {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MATERIALS)) {
    localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.WORKERS)) {
    localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CONTRACTORS)) {
    localStorage.setItem(STORAGE_KEYS.CONTRACTORS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BUDGETS)) {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.EXPENSES)) {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.EXPENSE_PAYMENTS)) {
    localStorage.setItem(STORAGE_KEYS.EXPENSE_PAYMENTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LABOUR_ENTRIES)) {
    localStorage.setItem(STORAGE_KEYS.LABOUR_ENTRIES, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.DAILY_DIARIES)) {
    localStorage.setItem(STORAGE_KEYS.DAILY_DIARIES, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PHOTOS)) {
    localStorage.setItem(STORAGE_KEYS.PHOTOS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.DOCUMENTS)) {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.FUNDINGS)) {
    localStorage.setItem(STORAGE_KEYS.FUNDINGS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LOANS)) {
    localStorage.setItem(STORAGE_KEYS.LOANS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
  }
};

// Generic LocalStorage CRUD helpers
export const getLocalCollection = (key, projectId = null) => {
  try {
    const raw = localStorage.getItem(key);
    const items = raw ? JSON.parse(raw) : [];
    if (projectId && Array.isArray(items)) {
      return items.filter(item => !item.project_id || item.project_id === projectId);
    }
    return items;
  } catch (e) {
    console.error(`Error reading ${key}:`, e);
    return [];
  }
};

export const setLocalCollection = (key, items) => {
  localStorage.setItem(key, JSON.stringify(items));
};

export const insertLocalItem = (key, item) => {
  const items = getLocalCollection(key);
  const newItem = {
    ...item,
    id: item.id || `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    created_at: item.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  const updated = [newItem, ...items];
  setLocalCollection(key, updated);
  return newItem;
};

export const updateLocalItem = (key, id, updates) => {
  const items = getLocalCollection(key);
  const updated = items.map(item => item.id === id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item);
  setLocalCollection(key, updated);
  return updated.find(item => item.id === id);
};

export const deleteLocalItem = (key, id) => {
  const items = getLocalCollection(key);
  const updated = items.filter(item => item.id !== id);
  setLocalCollection(key, updated);
  return true;
};

// Unified Data Service Methods
export const DataService = {
  // Initialization
  init: () => {
    initializeLocalStorage();
  },

  // Projects
  getProjects: async (userId) => {
    if (isSupabaseConfigured() && supabase && userId) {
      const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data;
    }
    return getLocalCollection(STORAGE_KEYS.PROJECTS);
  },

  createProject: async (project, userId) => {
    if (isSupabaseConfigured() && supabase && userId) {
      const { data, error } = await supabase.from('projects').insert([{ ...project, user_id: userId }]).select().single();
      if (!error && data) return data;
    }
    return insertLocalItem(STORAGE_KEYS.PROJECTS, project);
  },

  updateProject: async (id, updates) => {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('projects').update(updates).eq('id', id).select().single();
      if (!error && data) return data;
    }
    return updateLocalItem(STORAGE_KEYS.PROJECTS, id, updates);
  },

  deleteProject: async (id) => {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('projects').delete().eq('id', id);
    }
    return deleteLocalItem(STORAGE_KEYS.PROJECTS, id);
  },

  // Expenses
  getExpenses: async (projectId) => {
    if (isSupabaseConfigured() && supabase && projectId) {
      const { data, error } = await supabase.from('expenses').select('*').eq('project_id', projectId).order('expense_date', { ascending: false });
      if (!error && data) return data;
    }
    return getLocalCollection(STORAGE_KEYS.EXPENSES, projectId);
  },

  createExpense: async (expense, userId) => {
    if (isSupabaseConfigured() && supabase && userId) {
      const { data, error } = await supabase.from('expenses').insert([{ ...expense, user_id: userId }]).select().single();
      if (!error && data) return data;
    }
    return insertLocalItem(STORAGE_KEYS.EXPENSES, expense);
  },

  updateExpense: async (id, updates) => {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('expenses').update(updates).eq('id', id).select().single();
      if (!error && data) return data;
    }
    return updateLocalItem(STORAGE_KEYS.EXPENSES, id, updates);
  },

  deleteExpense: async (id) => {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('expenses').delete().eq('id', id);
    }
    return deleteLocalItem(STORAGE_KEYS.EXPENSES, id);
  },

  // Budgets
  getBudgets: async (projectId) => {
    if (isSupabaseConfigured() && supabase && projectId) {
      const { data, error } = await supabase.from('budgets').select('*').eq('project_id', projectId);
      if (!error && data) return data;
    }
    return getLocalCollection(STORAGE_KEYS.BUDGETS, projectId);
  },

  saveBudget: async (budget, userId) => {
    const existing = getLocalCollection(STORAGE_KEYS.BUDGETS, budget.project_id).find(b => b.category_id === budget.category_id);
    if (existing) {
      return updateLocalItem(STORAGE_KEYS.BUDGETS, existing.id, budget);
    } else {
      return insertLocalItem(STORAGE_KEYS.BUDGETS, budget);
    }
  },

  // Materials & Stock
  getMaterials: async (projectId) => {
    if (isSupabaseConfigured() && supabase && projectId) {
      const { data, error } = await supabase.from('materials').select('*').eq('project_id', projectId).order('name');
      if (!error && data) return data;
    }
    return getLocalCollection(STORAGE_KEYS.MATERIALS, projectId);
  },

  createMaterial: async (material, userId) => {
    if (isSupabaseConfigured() && supabase && userId) {
      const { data, error } = await supabase.from('materials').insert([{ ...material, user_id: userId }]).select().single();
      if (!error && data) return data;
    }
    return insertLocalItem(STORAGE_KEYS.MATERIALS, material);
  },

  updateMaterial: async (id, updates) => {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('materials').update(updates).eq('id', id).select().single();
      if (!error && data) return data;
    }
    return updateLocalItem(STORAGE_KEYS.MATERIALS, id, updates);
  },

  deleteMaterial: async (id) => {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('materials').delete().eq('id', id);
    }
    return deleteLocalItem(STORAGE_KEYS.MATERIALS, id);
  },

  adjustMaterialStock: async (materialId, deltaQty, reason = 'Usage', projectId) => {
    const materials = getLocalCollection(STORAGE_KEYS.MATERIALS, projectId);
    const target = materials.find(m => m.id === materialId);
    if (target) {
      const newStock = Math.max(0, Number(target.current_stock) + Number(deltaQty));
      updateLocalItem(STORAGE_KEYS.MATERIALS, materialId, { current_stock: newStock });
      insertLocalItem(STORAGE_KEYS.MATERIAL_ADJUSTMENTS, {
        project_id: projectId,
        material_id: materialId,
        adjustment_date: new Date().toISOString().split('T')[0],
        adjustment_type: deltaQty < 0 ? 'Usage' : 'Restock',
        quantity: deltaQty,
        reason: reason
      });
    }
  },

  // Suppliers
  getSuppliers: async (projectId) => {
    if (isSupabaseConfigured() && supabase && projectId) {
      const { data, error } = await supabase.from('suppliers').select('*').eq('project_id', projectId).order('name');
      if (!error && data) return data;
    }
    return getLocalCollection(STORAGE_KEYS.SUPPLIERS, projectId);
  },

  createSupplier: async (supplier, userId) => {
    if (isSupabaseConfigured() && supabase && userId) {
      const { data, error } = await supabase.from('suppliers').insert([{ ...supplier, user_id: userId }]).select().single();
      if (!error && data) return data;
    }
    return insertLocalItem(STORAGE_KEYS.SUPPLIERS, supplier);
  },

  updateSupplier: async (id, updates) => {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.from('suppliers').update(updates).eq('id', id).select().single();
      if (!error && data) return data;
    }
    return updateLocalItem(STORAGE_KEYS.SUPPLIERS, id, updates);
  },

  deleteSupplier: async (id) => {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('suppliers').delete().eq('id', id);
    }
    return deleteLocalItem(STORAGE_KEYS.SUPPLIERS, id);
  },

  // Workers & Labour
  getWorkers: async (projectId) => {
    if (isSupabaseConfigured() && supabase && projectId) {
      const { data, error } = await supabase.from('workers').select('*').eq('project_id', projectId).order('name');
      if (!error && data) return data;
    }
    return getLocalCollection(STORAGE_KEYS.WORKERS, projectId);
  },

  createWorker: async (worker, userId) => {
    if (isSupabaseConfigured() && supabase && userId) {
      const { data, error } = await supabase.from('workers').insert([{ ...worker, user_id: userId }]).select().single();
      if (!error && data) return data;
    }
    return insertLocalItem(STORAGE_KEYS.WORKERS, worker);
  },

  updateWorker: async (id, updates) => {
    return updateLocalItem(STORAGE_KEYS.WORKERS, id, updates);
  },

  deleteWorker: async (id) => {
    return deleteLocalItem(STORAGE_KEYS.WORKERS, id);
  },

  getLabourEntries: async (projectId) => {
    return getLocalCollection(STORAGE_KEYS.LABOUR_ENTRIES, projectId);
  },

  createLabourEntry: async (entry, userId) => {
    return insertLocalItem(STORAGE_KEYS.LABOUR_ENTRIES, entry);
  },

  deleteLabourEntry: async (id) => {
    return deleteLocalItem(STORAGE_KEYS.LABOUR_ENTRIES, id);
  },

  // Contractors
  getContractors: async (projectId) => {
    return getLocalCollection(STORAGE_KEYS.CONTRACTORS, projectId);
  },

  createContractor: async (contractor, userId) => {
    return insertLocalItem(STORAGE_KEYS.CONTRACTORS, contractor);
  },

  updateContractor: async (id, updates) => {
    return updateLocalItem(STORAGE_KEYS.CONTRACTORS, id, updates);
  },

  deleteContractor: async (id) => {
    return deleteLocalItem(STORAGE_KEYS.CONTRACTORS, id);
  },

  // Construction Stages
  getStages: async (projectId) => {
    return getLocalCollection(STORAGE_KEYS.STAGES, projectId);
  },

  updateStage: async (id, updates) => {
    return updateLocalItem(STORAGE_KEYS.STAGES, id, updates);
  },

  // Daily Diary
  getDailyDiaries: async (projectId) => {
    return getLocalCollection(STORAGE_KEYS.DAILY_DIARIES, projectId);
  },

  createDailyDiary: async (diary, userId) => {
    return insertLocalItem(STORAGE_KEYS.DAILY_DIARIES, diary);
  },

  deleteDailyDiary: async (id) => {
    return deleteLocalItem(STORAGE_KEYS.DAILY_DIARIES, id);
  },

  // Photos
  getPhotos: async (projectId) => {
    return getLocalCollection(STORAGE_KEYS.PHOTOS, projectId);
  },

  createPhoto: async (photo, userId) => {
    return insertLocalItem(STORAGE_KEYS.PHOTOS, photo);
  },

  deletePhoto: async (id) => {
    return deleteLocalItem(STORAGE_KEYS.PHOTOS, id);
  },

  // Documents
  getDocuments: async (projectId) => {
    return getLocalCollection(STORAGE_KEYS.DOCUMENTS, projectId);
  },

  createDocument: async (doc, userId) => {
    return insertLocalItem(STORAGE_KEYS.DOCUMENTS, doc);
  },

  deleteDocument: async (id) => {
    return deleteLocalItem(STORAGE_KEYS.DOCUMENTS, id);
  },

  // Tasks
  getTasks: async (projectId) => {
    return getLocalCollection(STORAGE_KEYS.TASKS, projectId);
  },

  createTask: async (task, userId) => {
    return insertLocalItem(STORAGE_KEYS.TASKS, task);
  },

  updateTask: async (id, updates) => {
    return updateLocalItem(STORAGE_KEYS.TASKS, id, updates);
  },

  deleteTask: async (id) => {
    return deleteLocalItem(STORAGE_KEYS.TASKS, id);
  },

  // Fundings & Loans
  getFundings: async (projectId) => {
    return getLocalCollection(STORAGE_KEYS.FUNDINGS, projectId);
  },

  createFunding: async (funding, userId) => {
    return insertLocalItem(STORAGE_KEYS.FUNDINGS, funding);
  },

  deleteFunding: async (id) => {
    return deleteLocalItem(STORAGE_KEYS.FUNDINGS, id);
  },

  getLoans: async (projectId) => {
    return getLocalCollection(STORAGE_KEYS.LOANS, projectId);
  },

  createLoan: async (loan, userId) => {
    return insertLocalItem(STORAGE_KEYS.LOANS, loan);
  },

  updateLoan: async (id, updates) => {
    return updateLocalItem(STORAGE_KEYS.LOANS, id, updates);
  },

  // Notifications
  getNotifications: async (projectId) => {
    return getLocalCollection(STORAGE_KEYS.NOTIFICATIONS, projectId);
  },

  markNotificationRead: async (id) => {
    return updateLocalItem(STORAGE_KEYS.NOTIFICATIONS, id, { is_read: true });
  },

  createNotification: async (notif) => {
    return insertLocalItem(STORAGE_KEYS.NOTIFICATIONS, notif);
  },

  // Reset or Seed Demo Data
  resetDemoData: () => {
    localStorage.clear();
    initializeLocalStorage();
  }
};
