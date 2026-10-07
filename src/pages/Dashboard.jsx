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
import Swal from 'sweetalert2';
import { useBudget } from '../contexts/BudgetContext';
import { useAuth } from '../contexts/AuthContext';
import { formatINR } from '../utils/marathiCurrency';
import { getCategoryIconMeta } from '../utils/categoryIcons';
import ExpenseCard from '../components/common/ExpenseCard';
import ExpenseModal from '../components/modals/ExpenseModal';
import BudgetModal from '../components/modals/BudgetModal';
import PhotoViewerModal from '../components/modals/PhotoViewerModal';
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
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'पेमेंट पूर्ण (Paid) म्हणून चिन्हांकित केले!',
        showConfirmButton: false,
        timer: 1800
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'त्रुटी',
        text: 'पेमेंट स्थिती बदलता आली नाही.'
      });
    }
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
        await deleteExpense(expense.id, getExpensePhotos(expense).map((ph) => ph.path));
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
          if ((e.category_name || 'इतर') !== selectedCategoryName) return false;
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
    const list = expenses.filter(e => (e.category_name || 'इतर') === selectedCategoryName);
    return {
      count: list.length,
      total: list.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
    };
  }, [expenses, selectedCategoryName]);

  // Pending Expenses List
  const pendingExpensesList = useMemo(() => {
    return expenses.filter(e => (e.payment_status || '').toLowerCase() === 'pending' || e.payment_status === 'बाकी');
  }, [expenses]);

  // Expense trend aggregation for the graph (weekly / monthly / yearly)
  const monthlyExpenseData = useMemo(() => {
    const marathiMonths = [
      'जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून',
      'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'
    ];
    const marathiShortMonths = [
      'जाने', 'फेब्रु', 'मार्च', 'एप्रि', 'मे', 'जून',
      'जुलै', 'ऑग', 'सप्टें', 'ऑक्टो', 'नोव्हें', 'डिसें'
    ];

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
          fullLabel: `वर्ष ${y}`,
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
          map[key] = { key, label: key, fullLabel: `वर्ष ${key}`, amount: 0, count: 0, isCurrent: false };
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
  }, [expenses, trendPeriod]);

  // Titles / labels that change with the selected period
  const trendMeta = {
    weekly:  { title: 'Weekly Expense Trend (साप्ताहिक खर्च कल)', sub: 'गेल्या ८ आठवड्यांचा बांधकाम खर्च', avg: 'साप्ताहिक सरासरी' },
    monthly: { title: 'Monthly Expense Trend (मासिक खर्च कल)',   sub: 'दरमहा झालेल्या बांधकाम खर्चाचा आलेख', avg: 'मासिक सरासरी' },
    yearly:  { title: 'Yearly Expense Trend (वार्षिक खर्च कल)',   sub: 'दरवर्षी झालेल्या बांधकाम खर्चाचा आलेख', avg: 'वार्षिक सरासरी' }
  }[trendPeriod];

  // Category Pie Chart Data
  const categoryPieData = useMemo(() => {
    if (!categoryBreakdown || categoryBreakdown.length === 0) return [];
    return categoryBreakdown.slice(0, 8).map((cat, idx) => ({
      name: cat.name,
      value: cat.amount,
      percentage: cat.percentage,
      color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length]
    }));
  }, [categoryBreakdown]);

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
            Home | Expenses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
            आजपर्यंतच्या बांधकाम खर्चाचा संपूर्ण आढावा
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => setReportReceiptOpen(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all duration-150 hover:-translate-y-0.5 active:scale-95 shrink-0 cursor-pointer whitespace-nowrap"
            title="सर्व नोंदींसह पावती अहवाल PDF/PNG/JPG एक्सपोर्ट करा"
          >
            <Receipt className="w-4 h-4 shrink-0" />
            <span>पावती अहवाल ({expenses.length} नोंदी)</span>
          </button>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={() => {
              setSelectedExpense(null);
              setExpenseModalOpen(true);
            }}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 shrink-0 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>खर्च जोडा</span>
          </button>
        </div>
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

      {/* 3. Four Core Financial Summary Metrics (Total Budget | Total Expenses | Remaining Balance | Budget Used %) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Total Budget (एकूण बजेट) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-cyan-500/10 border border-indigo-200/80 p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider">
              Total Budget
            </span>
            <button
              type="button"
              onClick={() => setBudgetModalOpen(true)}
              className="px-2 py-0.5 text-[10px] font-semibold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-md shadow-2xs flex items-center gap-0.5 whitespace-nowrap shrink-0"
              title="बजेट बदला"
            >
              <Edit3 className="w-2.5 h-2.5 shrink-0" />
              <span>बदला</span>
            </button>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-indigo-950 tracking-tight">
            {formatINR(totalBudget)}
          </div>
          <div className="text-[10px] text-indigo-800/80 font-medium mt-2 pt-1.5 border-t border-indigo-100">
            एकूण ठरवलेले बजेट
          </div>
        </div>

        {/* Metric 2: Total Expenses (एकूण खर्च) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-rose-500/10 border border-amber-200/80 p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
              Total Expenses
            </span>
            <div className="w-6 h-6 rounded-lg bg-amber-500 text-white flex items-center justify-center text-xs">
              <Receipt className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-950 tracking-tight">
            {formatINR(totalSpent)}
          </div>
          <div className="text-[10px] text-amber-800/80 font-medium mt-2 pt-1.5 border-t border-amber-100 flex items-center justify-between">
            <span>{expenses.length} व्यवहार</span>
            {totalPending > 0 && (
              <span className="text-rose-600 font-bold">बाकी: {formatINR(totalPending)}</span>
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
              Remaining Balance
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
            {isOverBudget ? 'ओव्हर बजेट रक्कम' : 'शिल्लक उपलब्ध निधी'}
          </div>
        </div>

        {/* Metric 4: Budget Used % (बजेट वापर %) */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/5 via-slate-900/5 to-slate-950/10 border border-slate-200/90 p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
              Budget Used
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${badgeColor}`}>
              {statusBadgeText}
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {percentUsed}%
          </div>
          <div className="text-[10px] text-slate-600 font-medium mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between">
            <span>या महिन्याचा: {formatINR(thisMonthSpent)}</span>
          </div>
        </div>
      </div>

      {/* 4. Full-Width Budget Utilization Progress Bar */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-2.5 border border-slate-200/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-slate-900">
              Budget Utilization (बजेट वापर प्रमाण)
            </span>
          </div>
          <span className="text-xs sm:text-sm font-extrabold text-slate-900">
            {percentUsed}% खर्च
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
              { id: 'weekly', label: 'आठवडा (Weekly)' },
              { id: 'monthly', label: 'महिना (Monthly)' },
              { id: 'yearly', label: 'वर्ष (Yearly)' }
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTrendPeriod(opt.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
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
                  Expense by Category (प्रकारानुसार खर्च)
                </h3>
                <p className="text-[11px] text-slate-500 font-normal">
                  प्रमुख साहित्यावर झालेला खर्च विभागणी
                </p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full">
              {categoryBreakdown?.length || 0} प्रकार
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
                    title="या प्रकारचे सर्व खर्च पहा"
                    className={`w-full text-left flex items-center justify-between text-xs p-1.5 rounded-lg border transition-colors cursor-pointer ${
                      selectedCategoryName === item.name
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : 'bg-slate-50/80 border-slate-100 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <span className={`font-semibold truncate ${selectedCategoryName === item.name ? 'text-white' : 'text-slate-800'}`}>{item.name}</span>
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
              कोणताही खर्च उपलब्ध नाही
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
                Recent Expenses (अलीकडील खर्च)
              </h3>
              <p className="text-[11px] text-slate-500 font-normal">
                नुकतेच नोंदवलेले सर्व बांधकाम खर्च
              </p>
            </div>
            <Link
              to="/expenses"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:underline shrink-0"
            >
              <span>सर्व पहा</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Selected category banner */}
          {selectedCategoryName !== 'all' && (
            <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="min-w-0">
                <p className="text-xs font-bold text-emerald-900 truncate">{selectedCategoryName}</p>
                <p className="text-[11px] text-emerald-700">
                  {selectedCategoryStats.count} नोंदी • {formatINR(selectedCategoryStats.total)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCategoryName('all')}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
                <span>फिल्टर काढा</span>
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
              placeholder="खर्च किंवा प्रकार शोधा..."
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
                  onViewReceipt={(expense) => setSingleReceiptExpense(expense)}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <div className="text-2xl">📝</div>
              <p className="text-xs font-medium text-slate-600">कोणताही खर्च सापडला नाही</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedExpense(null);
                  setExpenseModalOpen(true);
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-900 underline hover:text-slate-700"
              >
                + खर्च जोडा
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
                  Pending Payments (बाकी देयके)
                </h3>
                <p className="text-[11px] text-slate-500 font-normal">
                  देणे बाकी असलेली बिले व मजुरी
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-amber-700 font-bold block">एकूण बाकी रक्कम</span>
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
                          <span className="text-xs font-bold text-slate-900">{exp.category_name || 'इतर'}</span>
                          <span className="px-1.5 py-0.2 rounded bg-amber-200/80 text-amber-900 text-[10px] font-extrabold">
                            बाकी
                          </span>
                        </div>
                        {exp.description && (
                          <p className="text-[11px] text-slate-600 truncate">{exp.description}</p>
                        )}
                        <span className="text-[10px] text-slate-400 block">{exp.expense_date}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0 space-y-1.5">
                      <div className="text-sm font-extrabold text-slate-950">
                        {formatINR(exp.amount)}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleMarkAsPaid(exp)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold transition-all shadow-2xs cursor-pointer hover:scale-105 active:scale-95"
                        title="पेमेंट पूर्ण झाले म्हणून नोंदवा"
                      >
                        <CheckCircle className="w-3 h-3" />
                        <span>पूर्ण झाले</span>
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
                सर्व देयके व खर्च पूर्ण भरले आहेत!
              </p>
              <p className="text-[11px] text-slate-400">
                कोणतेही पेमेंट बाकी (Pending) नाही.
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
        isOpen={budgetModalOpen}
        currentBudget={totalBudget}
        isFirstTime={false}
        onClose={() => setBudgetModalOpen(false)}
        onSave={async (newBudget, mode = 'set', addAmt = 0) => {
          await updateBudget(newBudget, mode, addAmt);
          setBudgetModalOpen(false);
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
        projectName={summary?.projectName || undefined}
        onClose={() => setSingleReceiptExpense(null)}
      />

      {/* Report Receipt Modal (Template 1 - all entries) */}
      <ReportReceiptModal
        isOpen={reportReceiptOpen}
        expenses={expenses}
        projectName={summary?.projectName || undefined}
        totalExpenses={summary.totalSpent}
        totalEntries={expenses.length}
        dateRangeText=""
        onClose={() => setReportReceiptOpen(false)}
      />
    </div>
  );
}

