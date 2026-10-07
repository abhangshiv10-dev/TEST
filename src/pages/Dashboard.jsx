import React, { useState, useMemo, useRef, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
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
  ShieldCheck,
  BarChart3,
  PieChart as PieChartIcon,
  Clock,
  CheckCircle,
  Percent,
  X
} from 'lucide-react';
import { toast, alertBox, confirmDelete } from '../utils/alerts';
import { useLanguage } from '../i18n/LanguageContext';
import { OTHER_CATEGORY } from '../constants/appDefaults';
import { isPendingStatus } from '../utils/paymentStatus';
import { useBudget } from '../contexts/BudgetContext';
import { useAuth } from '../contexts/AuthContext';
import { formatINR } from '../utils/marathiCurrency';
import { getCategoryIconMeta } from '../utils/categoryIcons';
import ExpenseCard from '../components/common/ExpenseCard';
import ExpenseModal from '../components/modals/ExpenseModal';
import BudgetModal from '../components/modals/BudgetModal';
import PhotoViewerModal from '../components/modals/PhotoViewerModal';
import ExpenseDetailModal from '../components/modals/ExpenseDetailModal';
import { getExpensePhotos } from '../utils/expensePhotos';
import { SingleExpenseReceiptModal, ReportReceiptModal } from '../components/receipts/lazyReceipts';
import { matchesCategory } from '../utils/bilingualSearch';

const MonthlyBarChart = lazy(() =>
  import('../components/common/DashboardCharts').then((m) => ({ default: m.MonthlyBarChart }))
);
const CategoryDonut = lazy(() =>
  import('../components/common/DashboardCharts').then((m) => ({ default: m.CategoryDonut }))
);

const CATEGORY_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', 
  '#ec4899', '#06b6d4', '#f97316', '#6366f1', 
  '#14b8a6', '#64748b'
];

export default function Dashboard() {
  const { user } = useAuth();
  const { t, tRich, locale, catLabel, projectLabel, fmtDate } = useLanguage();
  const {
    summary,
    expenses,
    loading,
    updateBudget,
    updateExpense,
    deleteExpense,
    toggleExpenseStatus
  } = useBudget();

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryName, setSelectedCategoryName] = useState('all');
  // Trend chart period: 'weekly' | 'monthly' | 'yearly'
  const [trendPeriod, setTrendPeriod] = useState('monthly');
  const recentExpensesRef = useRef(null);

  // Chart/legend var click kelyavar tya category che sarva expenses khali dakhva (parat click kelyavar clear)
  const handleCategoryClick = (name) => {
    if (!name) return;
    if (selectedCategoryName === name) {
      setSelectedCategoryName('all');
      return;
    }
    setSelectedCategoryName(name);
    setSearchQuery('');
    setTimeout(() => {
      recentExpensesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  // Receipt modals state
  const [singleReceiptExpense, setSingleReceiptExpense] = useState(null);
  const [reportReceiptOpen, setReportReceiptOpen] = useState(false);

  // Transaction detail popup (opens on title click)
  const [detailExpense, setDetailExpense] = useState(null);

  // Photo Lightbox state
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [viewingPhotoUrl, setViewingPhotoUrl] = useState(null);
  const [viewingPhotoTitle, setViewingPhotoTitle] = useState('');
  const [viewingPhotoList, setViewingPhotoList] = useState(null);

  const handleOpenPhoto = (url, title, allUrls = null) => {
    setViewingPhotoUrl(url);
    setViewingPhotoList(allUrls);
    setViewingPhotoTitle(title);
    setPhotoModalOpen(true);
  };

  const handleEditExpense = (expense) => {
    setSelectedExpense(expense);
    setExpenseModalOpen(true);
  };

  const handleMarkAsPaid = async (expense) => {
    try {
      await updateExpense(expense.id, {
        ...expense,
        payment_status: 'Paid'
      });
      toast('success', t('dashboard.markPaidToast'), 1800);
    } catch (err) {
      alertBox('error', t('common.error'), t('dashboard.markPaidFailed'));
    }
  };

  const handleDeleteExpense = async (expense) => {
    const confirmed = await confirmDelete({
      title: t('expenses.deleteTitle'),
      html: t('expenses.deleteHtml', {
        amount: formatINR(expense.amount),
        category: catLabel(expense.category_name, expense.category_name_en)
      })
    });

    if (confirmed) {
      try {
        await deleteExpense(expense.id, getExpensePhotos(expense).map((ph) => ph.path));
        toast('success', t('expenses.deleteSuccess'), 2000);
      } catch (err) {
        alertBox('error', t('common.error'), t('expenses.deleteFailed'));
      }
    }
  };

  const {
    totalBudget,
    totalSpent,
    totalPaid = 0,
    totalPending = 0,
    pendingCount = 0,
    remainingBalance,
    percentUsed,
    todaySpent,
    thisMonthSpent,
    categoryBreakdown
  } = summary;

  // Filter recent expenses based on query and selected category from left column
  const filteredRecentExpenses = useMemo(() => {
    return expenses
      .filter(e => {
        if (selectedCategoryName && selectedCategoryName !== 'all') {
          if ((e.category_name || OTHER_CATEGORY) !== selectedCategoryName) return false;
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const categoryMatch = e.category_name && (e.category_name.toLowerCase().includes(q) || matchesCategory(e.category_name, q, e.category_name_en));
          const descMatch = e.description && e.description.toLowerCase().includes(q);
          const amountMatch = String(e.amount).includes(q);
          return categoryMatch || descMatch || amountMatch;
        }
        return true;
      })
      .slice(0, selectedCategoryName !== 'all' ? undefined : 8);
  }, [expenses, selectedCategoryName, searchQuery]);

  // Selected category cha total (count + amount)
  const selectedCategoryStats = useMemo(() => {
    if (selectedCategoryName === 'all') return { count: 0, total: 0 };
    const list = expenses.filter(e => (e.category_name || OTHER_CATEGORY) === selectedCategoryName);
    return {
      count: list.length,
      total: list.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
    };
  }, [expenses, selectedCategoryName]);

  // Pending Expenses List
  const pendingExpensesList = useMemo(() => {
    return expenses.filter(e => isPendingStatus(e.payment_status));
  }, [expenses]);

  // Expense trend aggregation for the graph (weekly / monthly / yearly)
  const monthlyExpenseData = useMemo(() => {
    const marathiMonths = locale.months;
    const marathiShortMonths = locale.monthsShort;

    const pad = (n) => String(n).padStart(2, '0');
    const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    // Parse 'YYYY-MM-DD' as a LOCAL date (avoids timezone day-shift)
    const parseDate = (value) => {
      if (!value) return null;
      const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
      const d = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(value);
      return isNaN(d.getTime()) ? null : d;
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const map = {};

    // ---------- WEEKLY: last 8 weeks (Monday - Sunday) ----------
    if (trendPeriod === 'weekly') {
      const weekStart = (d) => {
        const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const diff = (x.getDay() + 6) % 7; // Monday = 0
        x.setDate(x.getDate() - diff);
        return x;
      };
      const currentWeek = weekStart(today);
      const fmt = (d) => `${pad(d.getDate())} ${marathiShortMonths[d.getMonth()]}`;

      for (let i = 7; i >= 0; i--) {
        const start = new Date(currentWeek);
        start.setDate(start.getDate() - i * 7);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        const key = ymd(start);
        map[key] = {
          key,
          label: fmt(start),
          fullLabel: `${fmt(start)} - ${fmt(end)} ${end.getFullYear()}`,
          amount: 0,
          count: 0,
          isCurrent: i === 0
        };
      }

      expenses.forEach((exp) => {
        const d = parseDate(exp.expense_date);
        if (!d) return;
        const key = ymd(weekStart(d));
        if (!map[key]) return; // outside the 8-week window
        map[key].amount += Number(exp.amount) || 0;
        map[key].count += 1;
      });

    // ---------- YEARLY: last 5 years (plus any older year that has data) ----------
    } else if (trendPeriod === 'yearly') {
      const thisYear = now.getFullYear();
      for (let y = thisYear - 4; y <= thisYear; y++) {
        map[String(y)] = {
          key: String(y),
          label: String(y),
          fullLabel: t('dashboard.yearLabel', { year: y }),
          amount: 0,
          count: 0,
          isCurrent: y === thisYear
        };
      }
      expenses.forEach((exp) => {
        const d = parseDate(exp.expense_date);
        if (!d) return;
        const key = String(d.getFullYear());
        if (!map[key]) {
          map[key] = { key, label: key, fullLabel: t('dashboard.yearLabel', { year: key }), amount: 0, count: 0, isCurrent: false };
        }
        map[key].amount += Number(exp.amount) || 0;
        map[key].count += 1;
      });

    // ---------- MONTHLY: last 6 months (plus any other month that has data) ----------
    } else {
      const nowKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
      const makeMonth = (d) => {
        const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
        return {
          key,
          label: `${marathiShortMonths[d.getMonth()]} '${String(d.getFullYear()).slice(-2)}`,
          fullLabel: `${marathiMonths[d.getMonth()]} ${d.getFullYear()}`,
          amount: 0,
          count: 0,
          isCurrent: key === nowKey
        };
      };
      for (let i = 5; i >= 0; i--) {
        const m = makeMonth(new Date(now.getFullYear(), now.getMonth() - i, 1));
        map[m.key] = m;
      }
      expenses.forEach((exp) => {
        const d = parseDate(exp.expense_date);
        if (!d) return;
        const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
        if (!map[key]) map[key] = makeMonth(new Date(d.getFullYear(), d.getMonth(), 1));
        map[key].amount += Number(exp.amount) || 0;
        map[key].count += 1;
      });
    }

    return Object.values(map).sort((a, b) => a.key.localeCompare(b.key));
  }, [expenses, trendPeriod, locale, t]);

  // Titles / labels that change with the selected period
  const trendMeta = {
    weekly:  { title: t('dashboard.weeklyTitle'),  sub: t('dashboard.weeklySub'),  avg: t('dashboard.weeklyAvg') },
    monthly: { title: t('dashboard.monthlyTitle'), sub: t('dashboard.monthlySub'), avg: t('dashboard.monthlyAvg') },
    yearly:  { title: t('dashboard.yearlyTitle'),  sub: t('dashboard.yearlySub'),  avg: t('dashboard.yearlyAvg') }
  }[trendPeriod];

  // Category Pie Chart Data
  const categoryPieData = useMemo(() => {
    if (!categoryBreakdown || categoryBreakdown.length === 0) return [];
    return categoryBreakdown.slice(0, 8).map((cat, idx) => ({
      name: cat.name,
      label: catLabel(cat.name, cat.nameEn),
      value: cat.amount,
      percentage: cat.percentage,
      color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length]
    }));
  }, [categoryBreakdown, catLabel]);

  // Name (in the selected language) of the category picked from the chart
  const selectedCategoryLabel = useMemo(() => {
    if (selectedCategoryName === 'all') return '';
    const match = expenses.find((e) => (e.category_name || OTHER_CATEGORY) === selectedCategoryName);
    return catLabel(selectedCategoryName, match?.category_name_en);
  }, [expenses, selectedCategoryName, catLabel]);

  const { monthlyAverage, highestMonth } = useMemo(() => {
    const activeMonths = monthlyExpenseData.filter(m => m.amount > 0);
    const total = activeMonths.reduce((sum, m) => sum + m.amount, 0);
    const avg = activeMonths.length > 0 ? Math.round(total / activeMonths.length) : 0;
    
    let highest = null;
    monthlyExpenseData.forEach(m => {
      if (!highest || m.amount > highest.amount) {
        highest = m;
      }
    });

    return {
      monthlyAverage: avg,
      highestMonth: highest
    };
  }, [monthlyExpenseData]);

  // Determine budget progress bar color & warning state
  let progressColor = 'bg-slate-900';
  let isOverBudget = remainingBalance < 0;
  let statusBadgeText = t('dashboard.badgeOk');
  let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';

  if (percentUsed >= 100 || isOverBudget) {
    progressColor = 'bg-rose-600';
    statusBadgeText = t('dashboard.badgeExhausted');
    badgeColor = 'bg-rose-50 text-rose-700 border-rose-200/80';
  } else if (percentUsed >= 90) {
    progressColor = 'bg-rose-500';
    statusBadgeText = t('dashboard.badgeDanger');
    badgeColor = 'bg-rose-50 text-rose-700 border-rose-200/80';
  } else if (percentUsed >= 70) {
    progressColor = 'bg-amber-500';
    statusBadgeText = t('dashboard.badgeWarning');
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200/80';
  }

  return (
    <div className="space-y-6 pb-20 sm:pb-8 animate-in fade-in duration-200">
      {/* 1. Page Hero Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t('app.name')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
            {t('dashboard.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => setReportReceiptOpen(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-[2px] shadow-xs transition-all duration-150 hover:-translate-y-0.5 active:scale-95 shrink-0 cursor-pointer whitespace-nowrap"
            title={t('receiptReport.exportTitle')}
          >
            <Receipt className="w-4 h-4 shrink-0" />
            <span>{t('dashboard.reportButton', { count: expenses.length })}</span>
          </button>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={() => {
              setSelectedExpense(null);
              setExpenseModalOpen(true);
            }}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-[2px] shadow-xs transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 shrink-0 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>{t('common.addExpense')}</span>
          </button>
        </div>
      </div>

      {/* 2. Over-Budget Alert Banner if applicable */}
      {isOverBudget && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-50/90 border border-rose-200 flex items-start gap-3 text-rose-900 text-xs sm:text-sm shadow-subtle animate-in fade-in">
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">{t('dashboard.overBudgetLabel')} </span>
            {tRich('dashboard.overBudgetText', { amount: <span className="font-bold underline">{formatINR(Math.abs(remainingBalance))}</span> })}
          </div>
        </div>
      )}

      {/* 3. Four Core Financial Summary Metrics (Total Budget | Total Expenses | Remaining Balance | Budget Used %) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Total Budget (एकूण बजेट) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-cyan-500/10 border border-indigo-200/80 p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider">
              {t('dashboard.totalBudget')}
            </span>
            <button
              type="button"
              onClick={() => setBudgetModalOpen(true)}
              className="px-2 py-0.5 text-[10px] font-semibold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-[2px] shadow-2xs flex items-center gap-0.5 whitespace-nowrap shrink-0"
              title={t('budget.change')}
            >
              <Edit3 className="w-2.5 h-2.5 shrink-0" />
              <span>{t('common.edit')}</span>
            </button>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-indigo-950 tracking-tight">
            {formatINR(totalBudget)}
          </div>
          <div className="text-[10px] text-indigo-800/80 font-medium mt-2 pt-1.5 border-t border-indigo-100">
            {t('dashboard.totalBudgetNote')}
          </div>
        </div>

        {/* Metric 2: Total Expenses (एकूण खर्च) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-rose-500/10 border border-amber-200/80 p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
              {t('dashboard.totalExpenses')}
            </span>
            <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center text-xs">
              <Receipt className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-950 tracking-tight">
            {formatINR(totalSpent)}
          </div>
          <div className="text-[10px] text-amber-800/80 font-medium mt-2 pt-1.5 border-t border-amber-100 flex items-center justify-between">
            <span>{t('common.transactions', { count: expenses.length })}</span>
            {totalPending > 0 && (
              <span className="text-rose-600 font-bold">{t('dashboard.pendingAmount', { amount: formatINR(totalPending) })}</span>
            )}
          </div>
        </div>

        {/* Metric 3: Remaining Balance (शिल्लक रक्कम) */}
        <div className={`relative overflow-hidden rounded-2xl p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between border ${
          isOverBudget
            ? 'bg-gradient-to-br from-rose-500/15 via-red-500/8 to-pink-500/5 border-rose-300'
            : 'bg-gradient-to-br from-emerald-500/15 via-teal-500/8 to-emerald-500/5 border-emerald-300/90'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${
              isOverBudget ? 'text-rose-900' : 'text-emerald-900'
            }`}>
              {t('dashboard.remainingBalance')}
            </span>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs ${
              isOverBudget ? 'bg-rose-600' : 'bg-emerald-600'
            }`}>
              <PiggyBank className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className={`text-xl sm:text-2xl font-extrabold tracking-tight ${
            isOverBudget ? 'text-rose-950' : 'text-emerald-950'
          }`}>
            {formatINR(remainingBalance)}
          </div>
          <div className={`text-[10px] font-medium mt-2 pt-1.5 border-t ${
            isOverBudget ? 'text-rose-800 border-rose-100' : 'text-emerald-800 border-emerald-100'
          }`}>
            {isOverBudget ? t('dashboard.overBudgetAmount') : t('dashboard.fundsRemaining')}
          </div>
        </div>

        {/* Metric 4: Budget Used % (बजेट वापर %) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/5 via-slate-900/5 to-slate-950/10 border border-slate-200/90 p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
              {t('dashboard.budgetUsed')}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-[2px] font-bold border ${badgeColor}`}>
              {statusBadgeText}
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {percentUsed}%
          </div>
          <div className="text-[10px] text-slate-600 font-medium mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between">
            <span>{t('dashboard.thisMonthSpent', { amount: formatINR(thisMonthSpent) })}</span>
          </div>
        </div>
      </div>

      {/* 4. Full-Width Budget Utilization Progress Bar */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-2.5 border border-slate-200/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-slate-900">
              {t('dashboard.utilization')}
            </span>
          </div>
          <span className="text-xs sm:text-sm font-extrabold text-slate-900">
            {t('dashboard.percentSpent', { percent: percentUsed })}
          </span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/80 shadow-inner">
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
      </div>

      {/* 5. Two Side-by-Side Charts (Left: Monthly Expense Trend | Right: Expense by Category) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Chart: Monthly Expense Trend */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-3.5 border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center shadow-xs">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {trendMeta.title}
                </h3>
                <p className="text-[11px] text-slate-500 font-normal">
                  {trendMeta.sub}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">{trendMeta.avg}</span>
              <span className="text-xs font-bold text-slate-900">{formatINR(monthlyAverage)}</span>
            </div>
          </div>

          {/* Period filter: Weekly / Monthly / Yearly */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 w-fit">
            {[
              { id: 'weekly', label: t('dashboard.periodWeekly') },
              { id: 'monthly', label: t('dashboard.periodMonthly') },
              { id: 'yearly', label: t('dashboard.periodYearly') }
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTrendPeriod(opt.id)}
                className={`px-2.5 py-1 rounded-[2px] text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  trendPeriod === opt.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="h-56 sm:h-64 w-full pt-1">
            <Suspense fallback={<div className="w-full h-full animate-pulse bg-slate-100 rounded-xl" />}>
              <MonthlyBarChart monthlyExpenseData={monthlyExpenseData} />
            </Suspense>
          </div>
        </div>

        {/* Right Chart: Expense by Category */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-3.5 border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs">
                <PieChartIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {t('dashboard.byCategory')}
                </h3>
                <p className="text-[11px] text-slate-500 font-normal">
                  {t('dashboard.byCategorySub')}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-[2px]">
              {t('dashboard.categoryCount', { count: categoryBreakdown?.length || 0 })}
            </span>
          </div>

          {categoryPieData.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              {/* Donut Pie Chart */}
              <div className="sm:col-span-5 h-48 w-full">
                <Suspense fallback={<div className="w-full h-full animate-pulse bg-slate-100 rounded-xl" />}>
                  <CategoryDonut
                    categoryPieData={categoryPieData}
                    selectedCategoryName={selectedCategoryName}
                    handleCategoryClick={handleCategoryClick}
                  />
                </Suspense>
              </div>

              {/* Category Legend List */}
              <div className="sm:col-span-7 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {categoryPieData.map((item) => (
                  <button
                    type="button"
                    key={item.name}
                    onClick={() => handleCategoryClick(item.name)}
                    title={t('dashboard.viewCategoryExpenses')}
                    className={`w-full text-left flex items-center justify-between text-xs p-1.5 rounded-[2px] border transition-colors cursor-pointer ${
                      selectedCategoryName === item.name
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : 'bg-slate-50/80 border-slate-100 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className={`font-semibold truncate ${selectedCategoryName === item.name ? 'text-white' : 'text-slate-800'}`}>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`font-bold ${selectedCategoryName === item.name ? 'text-white' : 'text-slate-900'}`}>{formatINR(item.value)}</span>
                      <span className={`text-[10px] font-medium w-8 text-right ${selectedCategoryName === item.name ? 'text-slate-300' : 'text-slate-500'}`}>({item.percentage}%)</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              {t('common.noExpenseAvailable')}
            </div>
          )}
        </div>
      </div>

      {/* 6. Two Bottom Sections Side-by-Side (Left: Recent Expenses | Right: Pending Payments) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* Left Column: Recent Expenses (अलीकडील खर्च) */}
        <div ref={recentExpensesRef} className="glass-card rounded-2xl p-4 sm:p-5 space-y-3.5 border border-slate-200/80 scroll-mt-20">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {t('dashboard.recent')}
              </h3>
              <p className="text-[11px] text-slate-500 font-normal">
                {t('dashboard.recentSub')}
              </p>
            </div>
            <Link
              to="/expenses"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:underline shrink-0"
            >
              <span>{t('common.viewAll')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Selected category banner */}
          {selectedCategoryName !== 'all' && (
            <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="min-w-0">
                <p className="text-xs font-bold text-emerald-900 truncate">{selectedCategoryLabel}</p>
                <p className="text-[11px] text-emerald-700">
                  {t('common.entries', { count: selectedCategoryStats.count })} • {formatINR(selectedCategoryStats.total)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCategoryName('all')}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
                <span>{t('dashboard.clearFilter')}</span>
              </button>
            </div>
          )}

          {/* Quick Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('dashboard.searchPlaceholder')}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-colors"
            />
          </div>

          {/* Recent Expenses List */}
          {filteredRecentExpenses.length > 0 ? (
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {filteredRecentExpenses.map((exp) => (
                <ExpenseCard
                  key={exp.id}
                  expense={exp}
                  onEdit={handleEditExpense}
                  onDelete={handleDeleteExpense}
                  onToggleStatus={toggleExpenseStatus}
                  onViewPhoto={handleOpenPhoto}
                  onViewDetails={(expense) => setDetailExpense(expense)}
                  onViewReceipt={(expense) => setSingleReceiptExpense(expense)}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <div className="text-2xl">📝</div>
              <p className="text-xs font-medium text-slate-600">{t('common.noExpenseFound')}</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedExpense(null);
                  setExpenseModalOpen(true);
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 underline hover:text-slate-700"
              >
                + {t('common.addExpense')}
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Pending Payments (थकीत / बाकी देयके) */}
        <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-3.5 border border-slate-200/80">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-xs">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {t('dashboard.pendingTitle')}
                </h3>
                <p className="text-[11px] text-slate-500 font-normal">
                  {t('dashboard.pendingSub')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-amber-700 font-bold block">{t('dashboard.pendingTotal')}</span>
              <span className="text-sm font-extrabold text-amber-950">{formatINR(totalPending)}</span>
            </div>
          </div>

          {/* Pending Bills List */}
          {pendingExpensesList.length > 0 ? (
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {pendingExpensesList.map((exp) => {
                const { icon: CatIcon, iconGradient } = getCategoryIconMeta(exp.category_name);
                return (
                  <div
                    key={exp.id}
                    className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl flex items-start justify-between gap-3 shadow-2xs hover:border-amber-300 transition-colors"
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-xs ${iconGradient}`}>
                        <CatIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{catLabel(exp.category_name, exp.category_name_en)}</span>
                          <span className="px-1.5 py-0.2 rounded bg-amber-200/80 text-amber-900 text-[10px] font-extrabold">
                            {t('status.pending')}
                          </span>
                        </div>
                        {exp.description && (
                          <p className="text-[11px] text-slate-600 truncate">{exp.description}</p>
                        )}
                        <span className="text-[10px] text-slate-400 block">{fmtDate(exp.expense_date)}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 space-y-1.5">
                      <div className="text-sm font-extrabold text-slate-950">
                        {formatINR(exp.amount)}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleMarkAsPaid(exp)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[2px] text-[11px] font-semibold transition-all shadow-2xs cursor-pointer hover:scale-105 active:scale-95"
                        title={t('dashboard.markPaidTitle')}
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>{t('dashboard.markPaidButton')}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-xl">
                ✓
              </div>
              <p className="text-xs font-bold text-emerald-800">
                {t('dashboard.allPaid')}
              </p>
              <p className="text-[11px] text-slate-400">
                {t('dashboard.nonePending')}
              </p>
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
        className="sm:hidden fixed bottom-5 right-5 z-40 w-12 h-12 rounded-[2px] bg-slate-900 text-white shadow-modal flex items-center justify-center hover:bg-slate-800 active:scale-95 transition-transform"
        title={t('dashboard.fabTitle')}
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
        isOpen={budgetModalOpen}
        currentBudget={totalBudget}
        isFirstTime={false}
        onClose={() => setBudgetModalOpen(false)}
        onSave={async (newBudget, mode = 'set', addAmt = 0) => {
          await updateBudget(newBudget, mode, addAmt);
          setBudgetModalOpen(false);
        }}
      />

      <ExpenseDetailModal
        isOpen={Boolean(detailExpense)}
        expense={detailExpense}
        onClose={() => setDetailExpense(null)}
        onEdit={(expense) => {
          setDetailExpense(null);
          handleEditExpense(expense);
        }}
      />

      <PhotoViewerModal
        isOpen={photoModalOpen}
        photoUrl={viewingPhotoUrl}
        photos={viewingPhotoList}
        title={viewingPhotoTitle}
        onClose={() => {
          setPhotoModalOpen(false);
          setViewingPhotoUrl(null);
        }}
      />

      {/* Single Expense Receipt Modal (Template 2) */}
      <SingleExpenseReceiptModal
        isOpen={Boolean(singleReceiptExpense)}
        expense={singleReceiptExpense}
        projectName={projectLabel(summary?.projectName)}
        onClose={() => setSingleReceiptExpense(null)}
      />

      {/* Report Receipt Modal (Template 1 - all entries) */}
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

