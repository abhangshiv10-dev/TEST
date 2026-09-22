import React, { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  Plus,
  ArrowRight,
  Wallet,
  Receipt,
  PiggyBank,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  Edit3,
  Search,
  Sparkles,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useBudget } from '../contexts/BudgetContext';
import { formatINR } from '../utils/marathiCurrency';
import { getCategoryIconMeta } from '../utils/categoryIcons';
import ExpenseCard from '../components/common/ExpenseCard';
import ExpenseModal from '../components/modals/ExpenseModal';
import BudgetModal from '../components/modals/BudgetModal';
import PhotoViewerModal from '../components/modals/PhotoViewerModal';

export default function Dashboard() {
  const {
    summary,
    expenses,
    loading,
    isFirstTime,
    updateBudget,
    deleteExpense
  } = useBudget();

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryName, setSelectedCategoryName] = useState('all');

  // Photo Lightbox state
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [viewingPhotoUrl, setViewingPhotoUrl] = useState(null);
  const [viewingPhotoTitle, setViewingPhotoTitle] = useState('');

  const handleOpenPhoto = (url, title) => {
    setViewingPhotoUrl(url);
    setViewingPhotoTitle(title);
    setPhotoModalOpen(true);
  };

  const handleEditExpense = (expense) => {
    setSelectedExpense(expense);
    setExpenseModalOpen(true);
  };

  const handleDeleteExpense = async (expense) => {
    const result = await Swal.fire({
      title: 'खर्च हटवायचा आहे?',
      html: `<b>${formatINR(expense.amount)}</b> चा हा खर्च (${expense.category_name || 'इतर'}) कायमचा हटवला जाईल.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0f172a',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'हटवा',
      cancelButtonText: 'रद्द करा'
    });

    if (result.isConfirmed) {
      try {
        await deleteExpense(expense.id, expense.photo_path);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'खर्च यशस्वीरित्या हटवला',
          showConfirmButton: false,
          timer: 2000
        });
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'त्रुटी',
          text: 'खर्च हटवता आला नाही.'
        });
      }
    }
  };

  const {
    totalBudget,
    totalSpent,
    remainingBalance,
    percentUsed,
    todaySpent,
    thisMonthSpent,
    categoryBreakdown
  } = summary;

  // Filter recent expenses based on query and selected category from left column
  const filteredRecentExpenses = expenses
    .filter(e => {
      // 1. Category Filter from Left Column
      if (selectedCategoryName && selectedCategoryName !== 'all') {
        if (e.category_name !== selectedCategoryName) return false;
      }

      // 2. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          (e.category_name && e.category_name.toLowerCase().includes(q)) ||
          (e.description && e.description.toLowerCase().includes(q)) ||
          String(e.amount).includes(q)
        );
      }
      return true;
    })
    .slice(0, selectedCategoryName !== 'all' ? 50 : 8); // Show all matching when category filtered, or latest 8 by default

  // Determine budget progress bar color & warning state
  let progressColor = 'bg-slate-900';
  let isOverBudget = remainingBalance < 0;
  let statusBadgeText = 'योग्य स्थिती';
  let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';

  if (percentUsed >= 100 || isOverBudget) {
    progressColor = 'bg-rose-600';
    statusBadgeText = 'बजेट संपले';
    badgeColor = 'bg-rose-50 text-rose-700 border-rose-200/80';
  } else if (percentUsed >= 90) {
    progressColor = 'bg-rose-500';
    statusBadgeText = 'धोका पातळी (90%+)';
    badgeColor = 'bg-rose-50 text-rose-700 border-rose-200/80';
  } else if (percentUsed >= 70) {
    progressColor = 'bg-amber-500';
    statusBadgeText = 'लक्ष द्या (70%+)';
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200/80';
  }

  return (
    <div className="space-y-6 pb-20 sm:pb-8 animate-in fade-in duration-200">
      {/* 1. Page Hero Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            माझ्या घराचे बांधकाम
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
            आजपर्यंतच्या बांधकाम खर्चाचा संपूर्ण आढावा
          </p>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={() => {
            setSelectedExpense(null);
            setExpenseModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>खर्च जोडा</span>
        </button>
      </div>

      {/* 2. Over-Budget Alert Banner if applicable */}
      {isOverBudget && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-50/90 border border-rose-200 flex items-start gap-3 text-rose-900 text-xs sm:text-sm shadow-subtle animate-in fade-in">
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">महत्त्वाची सूचना: </span>
            तुमचा एकूण खर्च ठरवलेल्या बजेटपेक्षा <span className="font-bold underline">{formatINR(Math.abs(remainingBalance))}</span> ने जास्त झाला आहे. कृपया नवीन खर्चांचे पुनरावलोकन करा.
          </div>
        </div>
      )}

      {/* 3. Three Core Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Budget (एकूण बजेट) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-cyan-500/10 border border-indigo-200/80 p-4 sm:p-5 shadow-sm hover:shadow-md hover:shadow-indigo-100/50 hover:border-indigo-300 transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                एकूण बजेट
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setBudgetModalOpen(true)}
                  className="px-2 py-1 text-[11px] font-semibold text-indigo-700 bg-white/90 hover:bg-white border border-indigo-200/80 rounded-lg shadow-2xs transition-all hover:scale-105 active:scale-95 flex items-center gap-1"
                  title="बजेट बदला"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>बदला</span>
                </button>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center shadow-sm shadow-indigo-200 shrink-0">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-950 tracking-tight">
              {formatINR(totalBudget)}
            </div>
          </div>

          <div className="text-[11px] text-indigo-800/80 font-semibold mt-3 pt-2.5 border-t border-indigo-100/80 flex items-center justify-between">
            <span>नियोजित बांधकाम बजेट</span>
            <span className="px-2 py-0.5 rounded-md bg-indigo-100/70 text-indigo-800 text-[10px] font-bold">
              लक्ष्य
            </span>
          </div>
        </div>

        {/* Card 2: Total Spent (एकूण खर्च) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-rose-500/10 border border-amber-200/80 p-4 sm:p-5 shadow-sm hover:shadow-md hover:shadow-amber-100/50 hover:border-amber-300 transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                एकूण खर्च
              </span>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-sm shadow-amber-200 shrink-0">
                <Receipt className="w-4 h-4" />
              </div>
            </div>

            <div className="text-2xl sm:text-3xl font-extrabold text-amber-950 tracking-tight">
              {formatINR(totalSpent)}
            </div>
          </div>

          <div className="text-[11px] text-amber-800/80 font-semibold mt-3 pt-2.5 border-t border-amber-100/80 flex items-center justify-between">
            <span>आतापर्यंत झालेला खर्च</span>
            <span className="px-2 py-0.5 rounded-md bg-amber-100/80 text-amber-900 text-[10px] font-bold">
              {expenses.length} व्यवहार
            </span>
          </div>
        </div>

        {/* Card 3: Remaining Balance (शिल्लक रक्कम) */}
        <div className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between border ${
          isOverBudget
            ? 'bg-gradient-to-br from-rose-500/15 via-red-500/8 to-pink-500/5 border-rose-300 hover:shadow-rose-100/50 hover:border-rose-400'
            : 'bg-gradient-to-br from-emerald-500/15 via-teal-500/8 to-emerald-500/5 border-emerald-300/90 hover:shadow-emerald-100/50 hover:border-emerald-400'
        }`}>
          <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-xl pointer-events-none ${
            isOverBudget ? 'bg-rose-500/10' : 'bg-emerald-500/10'
          }`} />

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-bold uppercase tracking-wider ${
                isOverBudget ? 'text-rose-900' : 'text-emerald-900'
              }`}>
                शिल्लक रक्कम
              </span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm shrink-0 ${
                isOverBudget
                  ? 'bg-gradient-to-br from-rose-600 to-red-600 text-white shadow-rose-200'
                  : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-200'
              }`}>
                <PiggyBank className="w-4 h-4" />
              </div>
            </div>

            <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isOverBudget ? 'text-rose-950' : 'text-emerald-950'
            }`}>
              {formatINR(remainingBalance)}
            </div>
          </div>

          <div className={`text-[11px] font-semibold mt-3 pt-2.5 border-t flex items-center justify-between ${
            isOverBudget
              ? 'text-rose-800 border-rose-100'
              : 'text-emerald-800 border-emerald-100/80'
          }`}>
            <span>{isOverBudget ? 'अतिरिक्त झालेला खर्च' : 'बांधकामासाठी उपलब्ध'}</span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
              isOverBudget
                ? 'bg-rose-100 text-rose-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}>
              {isOverBudget ? 'ओव्हर बजेट' : 'सुरक्षित'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Budget Progress & Daily/Monthly Spend Colorful Cards */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-4 border border-slate-200/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-slate-900">
              बजेट वापर प्रमाण
            </span>
            <span className="text-xs sm:text-sm font-extrabold px-2 py-0.5 bg-slate-900 text-white rounded-lg shadow-2xs">
              {percentUsed}%
            </span>
          </div>
          <span className={`text-[11px] px-3 py-1 rounded-full font-bold border shadow-2xs ${badgeColor}`}>
            {statusBadgeText}
          </span>
        </div>

        {/* Sleek progress bar */}
        <div className="w-full bg-slate-100/80 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-200/60 shadow-inner">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              percentUsed >= 90
                ? 'bg-gradient-to-r from-rose-500 to-red-600'
                : percentUsed >= 70
                ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-teal-500'
            }`}
            style={{ width: `${Math.min(percentUsed, 100)}%` }}
          />
        </div>

        {/* 2 Colorful Stat Mini Cards: Today & This Month */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Mini Card 1: Today's Spend */}
          <div className="bg-gradient-to-br from-cyan-50/90 via-sky-50/50 to-blue-50/80 border border-cyan-200/80 rounded-xl p-3 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-xs">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-cyan-950 block">आजचा खर्च</span>
                <span className="text-xs text-cyan-700 font-medium">Daily Spend</span>
              </div>
            </div>
            <span className="text-sm sm:text-base font-extrabold text-cyan-950">
              {formatINR(todaySpent)}
            </span>
          </div>

          {/* Mini Card 2: This Month's Spend */}
          <div className="bg-gradient-to-br from-purple-50/90 via-indigo-50/50 to-violet-50/80 border border-purple-200/80 rounded-xl p-3 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-purple-950 block">या महिन्याचा खर्च</span>
                <span className="text-xs text-purple-700 font-medium">Monthly Total</span>
              </div>
            </div>
            <span className="text-sm sm:text-base font-extrabold text-purple-950">
              {formatINR(thisMonthSpent)}
            </span>
          </div>
        </div>
      </div>

      {/* 5. Two-Column Desktop Section (Left: खर्चाचे प्रकार | Right: अलीकडील खर्च) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: खर्चाचे प्रकार (Categories Breakdown) */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-4 sm:p-5 space-y-3.5">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                खर्चाचे प्रकार
              </h3>
              <p className="text-[11px] text-slate-500 font-normal">
                फिल्टर करण्यासाठी प्रकारावर क्लिक करा
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {selectedCategoryName !== 'all' && (
                <button
                  type="button"
                  onClick={() => setSelectedCategoryName('all')}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 text-white font-semibold shadow-2xs transition-transform hover:scale-105"
                  title="फिल्टर काढा"
                >
                  सर्व दाखवा ✕
                </button>
              )}
              <span className="text-xs font-bold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                {categoryBreakdown.length} प्रकार
              </span>
            </div>
          </div>

          {categoryBreakdown.length > 0 ? (
            <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
              {categoryBreakdown.map((cat) => {
                const {
                  icon: CatIcon,
                  iconGradient,
                  barColor,
                  borderAccent,
                  cardBg,
                  badgeBg
                } = getCategoryIconMeta(cat.name);
                const isSelected = selectedCategoryName === cat.name;

                return (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() => setSelectedCategoryName((prev) => (prev === cat.name ? 'all' : cat.name))}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-150 space-y-2 border shadow-2xs ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900/30 shadow-md scale-[1.01]'
                        : `bg-white/90 border-slate-200/80 hover:border-slate-300 ${cardBg}`
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-xs ${
                          isSelected ? 'bg-white/20 text-white' : iconGradient
                        }`}>
                          <CatIcon className="w-4 h-4" />
                        </div>
                        <span className={`text-xs font-bold truncate ${
                          isSelected ? 'text-white' : 'text-slate-900'
                        }`}>
                          {cat.name}
                        </span>
                        {isSelected && (
                          <span className="px-1.5 py-0.2 rounded bg-white text-slate-900 text-[10px] font-extrabold shrink-0">
                            निवडलेले ✓
                          </span>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-xs font-bold ${
                          isSelected ? 'text-white' : 'text-slate-950'
                        }`}>
                          {formatINR(cat.amount)}
                        </span>
                      </div>
                    </div>

                    {/* Progress indicator */}
                    <div className="flex items-center gap-2">
                      <div className={`flex-1 rounded-full h-2 overflow-hidden ${
                        isSelected ? 'bg-white/20' : 'bg-slate-100'
                      }`}>
                        <div
                          className={`h-full rounded-full ${isSelected ? 'bg-white' : barColor}`}
                          style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                        />
                      </div>
                      <span className={`text-[11px] font-bold shrink-0 w-10 text-right ${
                        isSelected ? 'text-white/90' : 'text-slate-600'
                      }`}>
                        {cat.percentage}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              कोणताही खर्च प्रकार उपलब्ध नाही
            </div>
          )}
        </div>

        {/* Right Column: अलीकडील खर्च (Recent Expenses with active category filter support) */}
        <div className="lg:col-span-7 glass-card rounded-2xl p-4 sm:p-5 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-1 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-slate-900">
                  {selectedCategoryName !== 'all' ? `"${selectedCategoryName}" चे व्यवहार` : 'अलीकडील खर्च'}
                </h3>
                {selectedCategoryName !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900 text-white text-[11px] font-semibold">
                    <span>{selectedCategoryName}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedCategoryName('all')}
                      className="hover:text-rose-300 font-bold ml-0.5"
                      title="फिल्टर काढा"
                    >
                      ✕
                    </button>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-normal">
                {selectedCategoryName !== 'all'
                  ? `दाखवत आहे: ${filteredRecentExpenses.length} व्यवहार`
                  : 'नुकतेच नोंदवलेले व्यवहार'}
              </p>
            </div>

            <Link
              to="/expenses"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:underline shrink-0"
            >
              <span>सर्व खर्च पहा</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Clean Quick Search Field */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="खर्च शोधा..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-colors"
            />
          </div>

          {/* Recent Expenses List */}
          {filteredRecentExpenses.length > 0 ? (
            <div className="space-y-2">
              {filteredRecentExpenses.map((exp) => (
                <ExpenseCard
                  key={exp.id}
                  expense={exp}
                  onEdit={handleEditExpense}
                  onDelete={handleDeleteExpense}
                  onViewPhoto={handleOpenPhoto}
                />
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-slate-400 space-y-2">
              <div className="text-2xl">📝</div>
              <p className="text-xs font-medium text-slate-600">
                {selectedCategoryName !== 'all'
                  ? `"${selectedCategoryName}" प्रकारात कोणताही खर्च सापडला नाही`
                  : 'कोणताही खर्च नोंदवलेला नाही'}
              </p>
              {selectedCategoryName !== 'all' ? (
                <button
                  type="button"
                  onClick={() => setSelectedCategoryName('all')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 underline hover:text-slate-700"
                >
                  सर्व प्रकार दाखवा
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedExpense(null);
                    setExpenseModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 underline hover:text-slate-700"
                >
                  + पहिला खर्च जोडा
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button (Mobile view only) */}
      <button
        type="button"
        onClick={() => {
          setSelectedExpense(null);
          setExpenseModalOpen(true);
        }}
        className="sm:hidden fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full bg-slate-900 text-white shadow-modal flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-transform"
        title="नवीन खर्च जोडा"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modals */}
      <ExpenseModal
        isOpen={expenseModalOpen}
        expenseToEdit={selectedExpense}
        onClose={() => {
          setExpenseModalOpen(false);
          setSelectedExpense(null);
        }}
        onViewPhoto={handleOpenPhoto}
      />

      <BudgetModal
        isOpen={budgetModalOpen || isFirstTime}
        currentBudget={totalBudget}
        isFirstTime={isFirstTime}
        onClose={() => setBudgetModalOpen(false)}
        onSave={updateBudget}
      />

      <PhotoViewerModal
        isOpen={photoModalOpen}
        photoUrl={viewingPhotoUrl}
        title={viewingPhotoTitle}
        onClose={() => {
          setPhotoModalOpen(false);
          setViewingPhotoUrl(null);
        }}
      />
    </div>
  );
}
