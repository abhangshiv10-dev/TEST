import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Calendar,
  Filter,
  Camera,
  Edit2,
  Trash2,
  X,
  Layers,
  ArrowUpDown,
  CircleDollarSign,
  FileSpreadsheet,
  Receipt as ReceiptIcon
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useBudget } from '../contexts/BudgetContext';
import { formatINR } from '../utils/marathiCurrency';
import { formatMarathiDate } from '../utils/marathiDate';
import ExpenseCard from '../components/common/ExpenseCard';
import ExpenseModal from '../components/modals/ExpenseModal';
import PhotoViewerModal from '../components/modals/PhotoViewerModal';
import { SingleExpenseReceiptModal } from '../components/receipts/SingleExpenseReceiptModal';
import { ReportReceiptModal } from '../components/receipts/ReportReceiptModal';
import { matchesCategory } from '../utils/bilingualSearch';

export default function Expenses() {
  const { expenses, categories, deleteExpense } = useBudget();

  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // all, today, yesterday, this_month, custom
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Modals state
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  // Receipt modals state
  const [singleReceiptExpense, setSingleReceiptExpense] = useState(null);
  const [reportReceiptOpen, setReportReceiptOpen] = useState(false);

  // Photo viewer state
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [viewingPhotoUrl, setViewingPhotoUrl] = useState(null);
  const [viewingPhotoTitle, setViewingPhotoTitle] = useState('');

  const handleOpenPhoto = (url, title) => {
    setViewingPhotoUrl(url);
    setViewingPhotoTitle(title);
    setPhotoModalOpen(true);
  };

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setExpenseModalOpen(true);
  };

  const handleDelete = async (expense) => {
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

  // Filter logic
  const filteredExpenses = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    return expenses.filter(exp => {
      // 1. Text Search (Bilingual Marathi + English)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const categoryMatch = exp.category_name && (exp.category_name.toLowerCase().includes(q) || matchesCategory(exp.category_name, q));
        const matchesDesc = exp.description && exp.description.toLowerCase().includes(q);
        const matchesAmount = String(exp.amount).includes(q);
        if (!categoryMatch && !matchesDesc && !matchesAmount) return false;
      }

      // 2. Category Filter
      if (selectedCategory !== 'all' && exp.category_id !== selectedCategory) {
        return false;
      }

      // 3. Date Filter
      if (dateFilter === 'today') {
        return exp.expense_date === todayStr;
      } else if (dateFilter === 'yesterday') {
        return exp.expense_date === yesterdayStr;
      } else if (dateFilter === 'this_month') {
        const d = new Date(exp.expense_date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      } else if (dateFilter === 'custom') {
        if (customStartDate && exp.expense_date < customStartDate) return false;
        if (customEndDate && exp.expense_date > customEndDate) return false;
      }

      return true;
    });
  }, [expenses, searchQuery, selectedCategory, dateFilter, customStartDate, customEndDate]);

  // Summary stats
  const stats = useMemo(() => {
    const count = filteredExpenses.length;
    const total = filteredExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const avg = count > 0 ? Math.round(total / count) : 0;
    return { count, total, avg };
  }, [filteredExpenses]);

  return (
    <div className="space-y-5 pb-20 sm:pb-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            खर्चाचे व्यवहार
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
            सर्व बांधकाम खर्चांची यादी, शोध आणि वर्गीकरण
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => setReportReceiptOpen(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all duration-150 hover:-translate-y-0.5 active:scale-95 shrink-0 cursor-pointer whitespace-nowrap"
            title="जास्तीत जास्त 10 नोंदींसह पावती अहवाल PNG/JPG एक्सपोर्ट करा"
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0" />
            <span>अहवाल पावती (10 नोंदी)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedExpense(null);
              setExpenseModalOpen(true);
            }}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all duration-150 hover:-translate-y-0.5 active:scale-95 shrink-0 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>खर्च जोडा</span>
          </button>
        </div>
      </div>

      {/* 3 Colorful Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Stat 1: Filtered Total */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-cyan-500/10 border border-indigo-200/80 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block">
              निवडलेला एकूण खर्च
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-indigo-950 mt-1 tracking-tight">
              {formatINR(stats.total)}
            </div>
            <span className="text-[10px] font-semibold text-indigo-700 mt-0.5 block">
              फिल्टरमधील बेरीज
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center shadow-sm shadow-indigo-200 shrink-0">
            <CircleDollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 2: Total Transactions */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-yellow-500/10 border border-amber-200/80 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block">
              एकूण नोंदी संख्या
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-amber-950 mt-1 tracking-tight">
              {stats.count} व्यवहार
            </div>
            <span className="text-[10px] font-semibold text-amber-700 mt-0.5 block">
              नोंदवलेले रेकॉर्ड्स
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-sm shadow-amber-200 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 3: Average Spend */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-green-500/10 border border-emerald-200/80 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
              सरासरी व्यवहार खर्च
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-950 mt-1 tracking-tight">
              {formatINR(stats.avg)}
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 mt-0.5 block">
              प्रति व्यवहार सरासरी
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-sm shadow-emerald-200 shrink-0">
            <ArrowUpDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Card */}
      <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-3.5 border border-slate-200/80">
        {/* Search and Category Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="खर्च, प्रकार किंवा तपशील शोधा..."
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Dropdown Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white text-slate-800 transition-colors font-medium"
            >
              <option value="all">सर्व प्रकार (All Categories)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'सर्व' },
            { id: 'today', label: 'आज' },
            { id: 'yesterday', label: 'काल' },
            { id: 'this_month', label: 'या महिन्यात' },
            { id: 'custom', label: 'दिनांक निवडा' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setDateFilter(pill.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold transition-all shadow-2xs ${
                dateFilter === pill.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Custom Date Range Inputs */}
        {dateFilter === 'custom' && (
          <div className="flex items-center gap-2 pt-1 flex-wrap text-xs bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">पासून:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">पर्यंत:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>
        )}
      </div>

      {/* Expenses List */}
      {filteredExpenses.length > 0 ? (
        <div className="space-y-2">
          {filteredExpenses.map((exp) => (
            <ExpenseCard
              key={exp.id}
              expense={exp}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewPhoto={handleOpenPhoto}
              onViewReceipt={(expense) => setSingleReceiptExpense(expense)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 space-y-2 shadow-card">
          <div className="text-3xl">🔍</div>
          <p className="text-sm font-semibold text-slate-700">
            कोणताही खर्च सापडला नाही
          </p>
          <p className="text-xs text-slate-400">
            कृपया शोध शब्द किंवा फिल्टर बदलून पुन्हा तपासा.
          </p>
        </div>
      )}

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

      <PhotoViewerModal
        isOpen={photoModalOpen}
        photoUrl={viewingPhotoUrl}
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
        onClose={() => setSingleReceiptExpense(null)}
      />

      {/* Report Receipt Modal (Template 1 - Max 10 entries) */}
      <ReportReceiptModal
        isOpen={reportReceiptOpen}
        expenses={filteredExpenses.slice(0, 10)}
        totalExpenses={filteredExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)}
        totalEntries={filteredExpenses.length}
        dateRangeText={
          dateFilter === 'today'
            ? 'आज (Today)'
            : dateFilter === 'yesterday'
            ? 'काल (Yesterday)'
            : dateFilter === 'this_month'
            ? 'या महिन्यात (This Month)'
            : dateFilter === 'custom' && (customStartDate || customEndDate)
            ? `${customStartDate || ''} - ${customEndDate || ''}`.trim()
            : ''
        }
        onClose={() => setReportReceiptOpen(false)}
      />
    </div>
  );
}
