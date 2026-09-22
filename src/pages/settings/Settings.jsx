import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useProject } from '../../contexts/ProjectContext';
import { PageHeader } from '../../components/common/PageHeader';
import { DEFAULT_CATEGORIES } from '../../constants/categories';
import { isSupabaseConfigured } from '../../services/supabaseClient';
import { DataService } from '../../services/dataService';
import { showSuccessToast, showConfirmDialog, showErrorAlert } from '../../utils/validators';
import { 
  Settings as SettingsIcon, 
  User, 
  DollarSign, 
  Calendar, 
  Moon, 
  Sun, 
  Database, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Trash2,
  Check
} from 'lucide-react';

export const Settings = () => {
  const { user, profile } = useAuth();
  const { theme, setTheme } = useTheme();
  const { refreshProjectData, loadProjects } = useProject();

  const [fullName, setFullName] = useState(profile?.full_name || 'Suresh Sharma');
  const [email, setEmail] = useState(user?.email || 'suresh.sharma@homebuild.in');
  const [currency, setCurrency] = useState('INR');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [budgetThreshold, setBudgetThreshold] = useState('80');

  const supabaseConnected = isSupabaseConfigured();

  const handleSaveProfile = (e) => {
    e.preventDefault();
    showSuccessToast('Profile settings saved successfully');
  };

  const handleResetDemo = async () => {
    const confirmed = await showConfirmDialog({
      title: 'Reset to Sample Data?',
      text: 'This will reset your construction project to the initial ₹25 Lakhs villa template with full sample expenses, stages, materials and workers.',
      confirmButtonText: 'Yes, reset to demo'
    });

    if (confirmed) {
      DataService.resetDemoData();
      await loadProjects();
      await refreshProjectData();
      showSuccessToast('Sample construction dataset restored!');
    }
  };

  const handleClearAll = async () => {
    const confirmed = await showConfirmDialog({
      title: 'Clear All Local Data?',
      text: 'This will erase all projects, expenses, and records from your browser storage.',
      confirmButtonText: 'Yes, clear all'
    });

    if (confirmed) {
      localStorage.clear();
      DataService.init();
      await loadProjects();
      await refreshProjectData();
      showSuccessToast('All data cleared');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <PageHeader
        title="Application Settings"
        subtitle="Manage user preferences, currency standards, dark mode, categories, and database connections"
      />

      {/* Backend Connection Status Banner */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs sm:text-sm ${
        supabaseConnected 
          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200' 
          : 'bg-primary-50 dark:bg-primary-950/40 border-primary-200 dark:border-primary-800 text-primary-900 dark:text-primary-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            supabaseConnected ? 'bg-emerald-600 text-white' : 'bg-primary-600 text-white'
          }`}>
            <Database className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold">
              {supabaseConnected ? 'Supabase Backend Connected' : 'Demo & Offline Engine Active'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {supabaseConnected 
                ? 'Row-level security, cloud PostgreSQL and Supabase Storage are active.'
                : 'All CRUD operations are fully functional and persisted in your browser.'}
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-block px-3 py-1 rounded-full text-xs font-bold bg-white dark:bg-slate-800 border shadow-sm">
          {supabaseConnected ? 'Cloud Mode' : 'Local Storage'}
        </span>
      </div>

      {/* Profile & Personal Settings */}
      <div className="glass-card p-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-primary-600" />
          <span>Profile Information</span>
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs shadow-sm transition-all"
          >
            Save Profile
          </button>
        </form>
      </div>

      {/* Preferences (Currency, Date format, Theme) */}
      <div className="glass-card p-6 space-y-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-primary-600" />
          <span>Regional & Display Preferences</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Currency */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Default Currency Standard
            </label>
            <select
              value={currency}
              onChange={(e) => {
                setCurrency(e.target.value);
                showSuccessToast(`Currency set to ${e.target.value}`);
              }}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <option value="INR">Indian Rupee (₹ INR)</option>
              <option value="USD">US Dollar ($ USD)</option>
              <option value="EUR">Euro (€ EUR)</option>
              <option value="AED">UAE Dirham (AED)</option>
            </select>
          </div>

          {/* Date Format */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Date Display Format
            </label>
            <select
              value={dateFormat}
              onChange={(e) => {
                setDateFormat(e.target.value);
                showSuccessToast('Date format updated');
              }}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 22/09/2026)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
            </select>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Visual Theme
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                  theme === 'light'
                    ? 'bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                  theme === 'dark'
                    ? 'bg-primary-950 border-primary-500 text-primary-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Moon className="w-4 h-4 text-slate-400" />
                <span>Dark</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Demo & Data Management */}
      <div className="glass-card p-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <Database className="w-5 h-5 text-amber-500" />
          <span>Demo Data & Storage Reset</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Test the entire application flow with our comprehensive ₹25L Indian house construction sample dataset.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleResetDemo}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Reload ₹25 Lakhs Sample Dataset</span>
          </button>

          <button
            onClick={handleClearAll}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold text-xs transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All Local Records</span>
          </button>
        </div>
      </div>
    </div>
  );
};
