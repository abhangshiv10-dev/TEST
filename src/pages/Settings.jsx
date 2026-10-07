import React, { useState } from 'react';
import {
  IndianRupee,
  Layers,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Sparkles,
  Loader2,
  Shield,
  Wallet,
  History,
  TrendingUp,
  Clock,
  ArrowUpRight,
  RefreshCw,
  Receipt,
  FileSpreadsheet,
  Download,
  Share2,
  FileText,
  Eye
} from 'lucide-react';
import { toast, alertBox, confirmDelete } from '../utils/alerts';
import { errorMessage } from '../utils/appError';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useBudget } from '../contexts/BudgetContext';
import { formatINR } from '../utils/marathiCurrency';
import { getCategoryIconMeta } from '../utils/categoryIcons';
import { SingleExpenseReceiptModal, ReportReceiptModal } from '../components/receipts/lazyReceipts';

export default function Settings() {
  const { user } = useAuth();
  const { t, tRich, catLabel, projectLabel, fmtDate, fmtDateTime } = useLanguage();
  const {
    summary,
    categories,
    expenses = [],
    budgetHistory = [],
    updateBudget,
    addCategory,
    updateCategory,
    deleteCategory
  } = useBudget();

  // Budget editing state
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetMode, setBudgetMode] = useState('add'); // 'add' or 'set'
  const [budgetInput, setBudgetInput] = useState('');
  const [budgetSaving, setBudgetSaving] = useState(false);

  // Category inline add/edit state
  const [newCatName, setNewCatName] = useState('');
  const [newCatNameEn, setNewCatNameEn] = useState('');
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingCatName, setEditingCatName] = useState('');
  const [editingCatNameEn, setEditingCatNameEn] = useState('');

  // Receipt export modals state
  const [reportReceiptOpen, setReportReceiptOpen] = useState(false);
  const [singleReceiptOpen, setSingleReceiptOpen] = useState(false);
  const [selectedReceiptExpenseId, setSelectedReceiptExpenseId] = useState('');

  const currentReceiptExpense = expenses.find(e => e.id === selectedReceiptExpenseId) || expenses[0] || null;

  // Handle Budget Save
  const handleSaveBudget = async (e) => {
    e.preventDefault();
    const val = Number(budgetInput);
    if (!budgetInput || isNaN(val) || val <= 0) {
      alertBox('error', t('settings.invalidAmount'), t('settings.invalidAmountText'));
      return;
    }

    const currentBudget = Number(summary.totalBudget) || 0;
    const finalBudget = budgetMode === 'add' ? currentBudget + val : val;

    try {
      setBudgetSaving(true);
      await updateBudget(finalBudget, budgetMode, val);
      setIsEditingBudget(false);
      setBudgetInput('');
      toast(
        'success',
        budgetMode === 'add'
          ? t('settings.budgetAddedToast', { amount: formatINR(val), total: formatINR(finalBudget) })
          : t('settings.budgetChangedToast'),
        2200
      );
    } catch (err) {
      alertBox('error', t('common.error'), t('settings.budgetSaveFailed'));
    } finally {
      setBudgetSaving(false);
    }
  };

  // Handle Add Category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    const trimmedEn = newCatNameEn.trim();
    if (!trimmed || !trimmedEn) {
      alertBox('warning', t('settings.incompleteTitle'), t('settings.incompleteText'));
      return;
    }

    try {
      await addCategory(trimmed, trimmedEn);
      setNewCatName('');
      setNewCatNameEn('');
      setIsAddingCat(false);
      toast('success', t('settings.categoryAdded', { name: catLabel(trimmed, trimmedEn) }), 2000);
    } catch (err) {
      alertBox('error', t('common.error'), errorMessage(err, 'settings.categoryAddFailed'));
    }
  };

  // Handle Update Category
  const handleUpdateCategory = async (catId) => {
    const trimmed = editingCatName.trim();
    const trimmedEn = editingCatNameEn.trim();
    if (!trimmed || !trimmedEn) {
      alertBox('warning', t('settings.incompleteTitle'), t('settings.incompleteText'));
      return;
    }

    try {
      await updateCategory(catId, trimmed, trimmedEn);
      setEditingCatId(null);
      setEditingCatName('');
      setEditingCatNameEn('');
      toast('success', t('settings.renamed'), 1500);
    } catch (err) {
      alertBox('error', t('common.error'), errorMessage(err, 'settings.renameFailed'));
    }
  };

  // Handle Delete Category
  const handleDeleteCategory = async (category) => {
    const confirmed = await confirmDelete({
      title: t('settings.deleteCategoryTitle'),
      html: t('settings.deleteCategoryHtml', { name: catLabel(category.name, category.name_en) })
    });

    if (confirmed) {
      try {
        await deleteCategory(category.id);
        toast('success', t('settings.categoryDeleted'), 1500);
      } catch (err) {
        alertBox('error', t('settings.deleteFailedTitle'), errorMessage(err));
      }
    }
  };

  return (
    <div className="space-y-6 pb-20 sm:pb-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pt-1">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {t('settings.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
          {t('settings.subtitle')}
        </p>
      </div>

      {/* 🧾 पावती व अहवाल एक्सपोर्ट (PNG / JPG Receipt Export) Section */}
      <div className="glass-card rounded-2xl p-5 border border-emerald-200/80 bg-linear-to-br from-emerald-50/50 via-white to-teal-50/40 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>{t('settings.exportTitle')}</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {t('settings.exportBadge')}
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                {t('settings.exportSub')}
              </p>
            </div>
          </div>
        </div>

        {/* 2 Export Options Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option 1: सर्व नोंदींचा अहवाल पावती (Template 1) */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-300 transition-all shadow-2xs flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-blue-700 font-bold text-xs mb-1">
                <FileSpreadsheet className="w-4 h-4" />
                <span>{t('expenses.reportButton', { count: expenses.length })}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('settings.reportDesc')}
              </p>
              <div className="mt-2 text-[11px] text-slate-500">
                {tRich('settings.availableSummary', { count: <strong>{expenses.length}</strong>, total: <strong>{formatINR(summary.totalSpent)}</strong> })}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setReportReceiptOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>{t('settings.viewExportReport')}</span>
            </button>
          </div>

          {/* Option 2: वैयक्तिक खर्च पावती (Template 2) */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 transition-all shadow-2xs flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs mb-1">
                <FileText className="w-4 h-4" />
                <span>{t('settings.singleTitle')}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t('settings.singleDesc')}
              </p>

              {/* Expense Selector */}
              {expenses.length > 0 ? (
                <div className="mt-2.5">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    {t('settings.selectExpense')}
                  </label>
                  <select
                    value={selectedReceiptExpenseId || expenses[0]?.id}
                    onChange={(e) => setSelectedReceiptExpenseId(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-emerald-600"
                  >
                    {expenses.map((exp) => (
                      <option key={exp.id} value={exp.id}>
                        {catLabel(exp.category_name, exp.category_name_en)} - {formatINR(exp.amount)} ({fmtDate(exp.expense_date)})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <p className="mt-2 text-xs text-slate-400 italic">{t('common.noExpenseAvailable')}</p>
              )}
            </div>

            <button
              type="button"
              disabled={expenses.length === 0}
              onClick={() => setSingleReceiptOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer disabled:opacity-50"
            >
              <Eye className="w-4 h-4" />
              <span>{t('settings.viewExportSingle')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Two-Column Responsive Grid on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Budget & User Profile */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. Budget Settings Card */}
          <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs shadow-xs shrink-0">
                  <Wallet className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900">
                    {t('settings.budgetTitle')}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-normal">
                    {t('settings.budgetSub')}
                  </p>
                </div>
              </div>

              {!isEditingBudget && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setBudgetMode('add');
                      setBudgetInput('');
                      setIsEditingBudget(true);
                    }}
                    className="flex-1 sm:flex-none px-3.5 py-2 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-2xs flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5 shrink-0" />
                    <span>{t('settings.addBudget')}</span>
                  </button>
                  <button
                    onClick={() => {
                      setBudgetMode('set');
                      setBudgetInput(String(summary.totalBudget || ''));
                      setIsEditingBudget(true);
                    }}
                    className="px-3.5 py-2 sm:py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-all shadow-2xs whitespace-nowrap cursor-pointer active:scale-95"
                  >
                    {t('common.edit')}
                  </button>
                </div>
              )}
            </div>

            {isEditingBudget ? (
              <form onSubmit={handleSaveBudget} className="pt-2 space-y-3 bg-slate-50/80 p-4 rounded-xl border border-slate-200 animate-in fade-in duration-150">
                {/* Mode Selector Tabs */}
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/60 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setBudgetMode('add');
                      setBudgetInput('');
                    }}
                    className={`py-1.5 rounded-lg transition-all ${
                      budgetMode === 'add'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t('settings.addTab')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBudgetMode('set');
                      setBudgetInput(String(summary.totalBudget || ''));
                    }}
                    className={`py-1.5 rounded-lg transition-all ${
                      budgetMode === 'set'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t('settings.setBudgetTab')}
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {budgetMode === 'add' ? t('settings.addAmountLabel') : t('settings.setAmountLabel')}
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-slate-400 font-bold text-base pointer-events-none">
                      {budgetMode === 'add' ? '+₹' : '₹'}
                    </span>
                    <input
                      type="number"
                      step="any"
                      autoFocus
                      value={budgetInput}
                      onChange={(e) => setBudgetInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-base font-bold text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900"
                      placeholder={budgetMode === 'add' ? t('settings.addPlaceholder') : t('settings.setPlaceholder')}
                    />
                  </div>
                </div>

                {/* Quick Add Buttons in Add mode */}
                {budgetMode === 'add' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {[50000, 100000, 200000, 500000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setBudgetInput(String(amt))}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                          Number(budgetInput) === amt
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        +{formatINR(amt)}
                      </button>
                    ))}
                  </div>
                )}

                {/* Live Preview of resulting total */}
                {Number(budgetInput) > 0 && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
                    <span className="text-emerald-900 font-medium">
                      {budgetMode === 'add' ? t('settings.previewAdd') : t('settings.previewSet')}
                    </span>
                    <span className="font-bold text-emerald-950 text-sm">
                      {formatINR(
                        budgetMode === 'add'
                          ? (Number(summary.totalBudget) || 0) + Number(budgetInput)
                          : Number(budgetInput)
                      )}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsEditingBudget(false)}
                    className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={budgetSaving}
                    className="px-4 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    {budgetSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{budgetMode === 'add' ? t('settings.addBudget') : t('common.save')}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">{t('settings.currentTotal')}</span>
                <span className="text-lg font-bold text-slate-900">
                  {formatINR(summary.totalBudget)}
                </span>
              </div>
            )}
          </div>

          {/* 2. Budget Revision & Addition History Card */}
          <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center text-xs shadow-xs shrink-0">
                  <History className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                    <span>{t('settings.historyTitle')}</span>
                    {budgetHistory.length > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                        {budgetHistory.length}
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-normal truncate">
                    {t('settings.historySub')}
                  </p>
                </div>
              </div>
            </div>

            {/* History Items List (Fully responsive for mobile & desktop) */}
            {budgetHistory && budgetHistory.length > 0 ? (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {budgetHistory.map((item, idx) => {
                  const isInitial = item.change_type === 'initial' || (idx === budgetHistory.length - 1 && Number(item.previous_budget) === 0);
                  const isAdd = item.change_type === 'add';

                  return (
                    <div
                      key={item.id || idx}
                      className="p-3 rounded-2xl bg-slate-50/90 border border-slate-200/70 space-y-2 hover:bg-slate-100/70 transition-colors shadow-2xs"
                    >
                      {/* Top Row: Title / Change Action + Resulting Amount */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isInitial
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : isAdd
                              ? 'bg-blue-100 text-blue-700 border border-blue-200'
                              : 'bg-purple-100 text-purple-700 border border-purple-200'
                          }`}>
                            {isInitial ? (
                              <IndianRupee className="w-3.5 h-3.5" />
                            ) : isAdd ? (
                              <TrendingUp className="w-3.5 h-3.5" />
                            ) : (
                              <RefreshCw className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                            {isInitial
                              ? t('settings.historyInitial')
                              : isAdd
                              ? t('settings.historyAdded', { amount: formatINR(item.amount_changed) })
                              : t('settings.historyChanged', { amount: formatINR(item.new_budget) })}
                          </span>
                        </div>

                        {/* Amount */}
                        <div className="text-right shrink-0">
                          <span className="text-xs sm:text-sm font-extrabold text-slate-900 block">
                            {formatINR(item.new_budget)}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Row: Timestamp and Stage Label */}
                      <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                        <div className="flex items-center gap-1 font-medium text-slate-500">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{fmtDateTime(item.created_at)}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                          {isInitial ? t('settings.historyInitialEntry') : t('settings.historyBudgetThen')}
                        </span>
                      </div>

                      {/* Extra context if add mode */}
                      {Number(item.previous_budget) > 0 && isAdd && (
                        <div className="text-[10px] text-indigo-800 font-medium bg-indigo-50/80 px-2 py-1 rounded-lg border border-indigo-100">
                          {t('settings.historyBefore', { previous: formatINR(item.previous_budget), total: formatINR(item.new_budget) })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500 space-y-1">
                <Clock className="w-5 h-5 text-slate-400 mx-auto" />
                <p className="font-semibold text-slate-700">{t('settings.historyEmpty')}</p>
                <p className="text-[11px] text-slate-400">{t('settings.historyEmptyHint')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Categories Management */}
        <div className="lg:col-span-7">
          <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900">
                    {t('settings.categoriesTitle')}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-normal">
                    {t('settings.categoriesSub')}
                  </p>
                </div>
              </div>

              {!isAddingCat && (
                <button
                  onClick={() => setIsAddingCat(true)}
                  className="self-start sm:self-auto px-3.5 py-2 sm:py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-xs flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 shrink-0" />
                  <span>{t('settings.addCategory')}</span>
                </button>
              )}
            </div>

            {/* Inline Add Category Form (Marathi Name + English Name) */}
            {isAddingCat && (
              <form onSubmit={handleAddCategory} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('category.marathiName')} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      autoFocus
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder={t('category.marathiPlaceholder')}
                      className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                    />
                    <p className="mt-1 text-[10px] text-slate-400">{t('settings.marathiHint')}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('category.englishName')} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newCatNameEn}
                      onChange={(e) => setNewCatNameEn(e.target.value)}
                      placeholder={t('category.englishPlaceholder')}
                      className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                    />
                    <p className="mt-1 text-[10px] text-slate-400">{t('settings.englishHint')}</p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCat(false);
                      setNewCatName('');
                      setNewCatNameEn('');
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-lg"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 shadow-xs"
                  >
                    {t('common.add')}
                  </button>
                </div>
              </form>
            )}

            {/* Categories List */}
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden max-h-[500px] overflow-y-auto">
              {categories.map((cat) => {
                const isEditing = editingCatId === cat.id;
                const { icon: CatIcon, bg: iconBg } = getCategoryIconMeta(cat.name);

                return (
                  <div
                    key={cat.id}
                    className="p-3 flex items-center justify-between hover:bg-slate-50/80 transition-colors text-xs sm:text-sm"
                  >
                    {isEditing ? (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
                        <input
                          type="text"
                          autoFocus
                          value={editingCatName}
                          onChange={(e) => setEditingCatName(e.target.value)}
                          placeholder={t('category.marathiName')}
                          className="flex-1 px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                        />
                        <input
                          type="text"
                          value={editingCatNameEn}
                          onChange={(e) => setEditingCatNameEn(e.target.value)}
                          placeholder={t('category.englishName')}
                          className="flex-1 px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                        />
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => handleUpdateCategory(cat.id)}
                            className="p-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                            title={t('common.save')}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCatId(null)}
                            className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-lg"
                            title={t('common.cancel')}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${iconBg}`}>
                            <CatIcon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-semibold text-slate-800 block leading-tight">{catLabel(cat.name, cat.name_en)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCatId(cat.id);
                              setEditingCatName(cat.name);
                              setEditingCatNameEn(cat.name_en || '');
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title={t('settings.rename')}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title={t('common.delete')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Single Expense Receipt Modal (Template 2) */}
      <SingleExpenseReceiptModal
        isOpen={singleReceiptOpen}
        expense={currentReceiptExpense}
        projectName={projectLabel(summary?.projectName)}
        onClose={() => setSingleReceiptOpen(false)}
      />

      {/* Report Receipt Modal (Template 1 - Max 10 entries) */}
      <ReportReceiptModal
        isOpen={reportReceiptOpen}
        expenses={expenses}
        projectName={projectLabel(summary?.projectName)}
        totalExpenses={summary.totalSpent}
        totalEntries={expenses.length}
        dateRangeText=""
        onClose={() => setReportReceiptOpen(false)}
      />
    </div>
  );
}
