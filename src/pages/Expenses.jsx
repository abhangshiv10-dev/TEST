import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  Download,
  FileText,
  Loader2,
  ChevronDown,
  Receipt as ReceiptIcon
} from 'lucide-react';
import { toast, alertBox, confirmDelete, confirmAction } from '../utils/alerts';
import { isPendingStatus } from '../utils/paymentStatus';
import { useLanguage } from '../i18n/LanguageContext';
import { useBudget } from '../contexts/BudgetContext';
import { useAuth } from '../contexts/AuthContext';
import { formatINR } from '../utils/marathiCurrency';
import { formatMarathiDate } from '../utils/marathiDate';
import ExpenseCard from '../components/common/ExpenseCard';
import ExpenseModal from '../components/modals/ExpenseModal';
import PhotoViewerModal from '../components/modals/PhotoViewerModal';
import ExpenseDetailModal from '../components/modals/ExpenseDetailModal';
import { getExpensePhotos } from '../utils/expensePhotos';
import { SingleExpenseReceiptModal, ReportReceiptModal } from '../components/receipts/lazyReceipts';
import { ReportReceiptCard } from '../components/receipts/ReportReceiptCard';
import { matchesCategory } from '../utils/bilingualSearch';

export default function Expenses() {
  const { expenses, categories, summary, deleteExpense, toggleExpenseStatus } = useBudget();
  const { t, catLabel, projectLabel } = useLanguage();
  const { isSuperAdmin } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // all, today, yesterday, this_month, custom
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Render the list in pages of 30 — rendering hundreds of cards (each with a photo) at once is slow on phones
  const PAGE_SIZE = 30;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Modals state
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);

  // Transaction detail popup (opens on title click)
  const [detailExpense, setDetailExpense] = useState(null);

  // Quick export (PDF / PNG) of the currently filtered records
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState(null); // null | 'pdf' | 'png'
  const exportRef = useRef(null);

  // Receipt modals state
  const [singleReceiptExpense, setSingleReceiptExpense] = useState(null);
  const [reportReceiptOpen, setReportReceiptOpen] = useState(false);

  // Photo viewer state
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

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setExpenseModalOpen(true);
  };

  const handleToggleStatus = async (expense) => {
    const toPending = !isPendingStatus(expense.payment_status);
    const ok = await confirmAction({
      title: t('expenses.statusConfirmTitle'),
      html: t('expenses.statusConfirmHtml', {
        amount: formatINR(expense.amount),
        category: catLabel(expense.category_name, expense.category_name_en),
        status: toPending ? t('status.pending') : t('status.paid')
      })
    });
    if (!ok) return;
    return toggleExpenseStatus(expense);
  };

  const handleDelete = async (expense) => {
    const params = {
      amount: formatINR(expense.amount),
      category: catLabel(expense.category_name, expense.category_name_en)
    };

    // Super Admin deletes directly. Everyone else sends a delete request that needs approval.
    const confirmed = isSuperAdmin
      ? await confirmDelete({ title: t('expenses.deleteTitle'), html: t('expenses.deleteHtml', params) })
      : await confirmAction({
          title: t('expenses.requestTitle'),
          html: t('expenses.requestHtml', params),
          confirmText: t('expenses.requestSend')
        });

    if (confirmed) {
      try {
        const result = await deleteExpense(expense.id, getExpensePhotos(expense).map((ph) => ph.path));
        if (result?.duplicate) {
          alertBox('info', t('expenses.requestExistsTitle'), t('expenses.requestExists'));
        } else if (result?.requested) {
          toast('success', t('expenses.requestSent'), 2200);
        } else {
          toast('success', t('expenses.deleteSuccess'), 2000);
        }
      } catch (err) {
        alertBox('error', t('common.error'), isSuperAdmin ? t('expenses.deleteFailed') : t('expenses.requestFailed'));
      }
    }
  };

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery, dateFilter, selectedCategory, customStartDate, customEndDate]);

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
        const categoryMatch = exp.category_name && (exp.category_name.toLowerCase().includes(q) || matchesCategory(exp.category_name, q, exp.category_name_en));
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


  // Runs the export after the hidden slip (with the filtered records) has been rendered
  useEffect(() => {
    if (!exportFormat) return undefined;
    let cancelled = false;
    (async () => {
      try {
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        if (cancelled || !exportRef.current) return;
        const { exportElementAsPDF, exportElementAsImage } = await import('../utils/receiptExporter');
        const fileName = `Expense_Report_${Date.now()}`;
        if (exportFormat === 'pdf') {
          await exportElementAsPDF(exportRef.current, fileName);
          toast('success', t('receipt.pdfCreated'), 2500);
        } else {
          await exportElementAsImage(exportRef.current, fileName, 'png');
          toast('success', t('receipt.downloaded', { format: t('receipt.format.png') }), 2500);
        }
      } catch (err) {
        console.error('Export failed:', err);
        alertBox('error', t('common.error'), exportFormat === 'pdf' ? t('receipt.pdfFailed') : t('receipt.downloadFailed'));
      } finally {
        if (!cancelled) setExportFormat(null);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportFormat]);

  const startExport = (format) => {
    setExportMenuOpen(false);
    if (filteredExpenses.length === 0) {
      alertBox('info', t('common.noExpenseFound'), '');
      return;
    }
    setExportFormat(format);
  };

  // Summary stats
  const stats = useMemo(() => {
    const count = filteredExpenses.length;
    const total = filteredExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const avg = count > 0 ? Math.round(total / count) : 0;
    return { count, total, avg };
  }, [filteredExpenses]);

  const exportFilterLabel = [
    dateFilter === 'today' ? t('common.today')
      : dateFilter === 'yesterday' ? t('common.yesterday')
      : dateFilter === 'this_month' ? t('common.thisMonth')
      : dateFilter === 'custom' && (customStartDate || customEndDate)
        ? `${customStartDate || ''} - ${customEndDate || ''}`.trim()
        : t('receipt.report.allEntries'),
    selectedCategory !== 'all'
      ? (() => { const c = categories.find((x) => x.id === selectedCategory); return c ? catLabel(c.name, c.name_en) : null; })()
      : null
  ].filter(Boolean).join(' • ');

  return (
    <div className="space-y-5 pb-20 sm:pb-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t('expenses.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
            {t('expenses.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            type="button"
            onClick={() => setReportReceiptOpen(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold rounded-[2px] shadow-xs transition-all duration-150 hover:-translate-y-0.5 active:scale-95 shrink-0 cursor-pointer whitespace-nowrap"
            title={t('receiptReport.exportTitle')}
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0" />
            <span>{t('expenses.reportButton', { count: filteredExpenses.length })}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedExpense(null);
              setExpenseModalOpen(true);
            }}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold rounded-[2px] shadow-xs transition-all duration-150 hover:-translate-y-0.5 active:scale-95 shrink-0 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>{t('common.addExpense')}</span>
          </button>
        </div>
      </div>

      {/* 3 Colorful Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Stat 1: Filtered Total */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-cyan-500/10 border border-indigo-200/80 p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block">
              {t('expenses.statSelectedTotal')}
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-indigo-950 mt-1 tracking-tight">
              {formatINR(stats.total)}
            </div>
            <span className="text-[10px] font-semibold text-indigo-700 mt-0.5 block">
              {t('expenses.statSelectedNote')}
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
              {t('expenses.statCount')}
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-amber-950 mt-1 tracking-tight">
              {t('common.transactions', { count: stats.count })}
            </div>
            <span className="text-[10px] font-semibold text-amber-700 mt-0.5 block">
              {t('expenses.statCountNote')}
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
              {t('expenses.statAverage')}
            </span>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-950 mt-1 tracking-tight">
              {formatINR(stats.avg)}
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 mt-0.5 block">
              {t('expenses.statAverageNote')}
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
              placeholder={t('expenses.searchPlaceholder')}
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
              <option value="all">{t('expenses.allCategories')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {catLabel(c.name, c.name_en)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Filter Dropdown + Export (PDF / PNG) */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 focus:bg-white text-slate-800 transition-colors font-medium appearance-none"
            >
              <option value="all">{t('common.all')}</option>
              <option value="today">{t('common.today')}</option>
              <option value="yesterday">{t('common.yesterday')}</option>
              <option value="this_month">{t('common.thisMonth')}</option>
              <option value="custom">{t('expenses.pickDate')}</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setExportMenuOpen((o) => !o)}
              disabled={Boolean(exportFormat)}
              title={t('expenses.exportSelected')}
              aria-label={t('expenses.exportSelected')}
              className="w-9 h-9 sm:w-10 sm:h-10 inline-flex items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xs disabled:opacity-60 cursor-pointer"
            >
              {exportFormat ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            </button>

            {exportMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setExportMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-1.5 z-50 w-44 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => startExport('pdf')}
                    className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-rose-600" />
                    <span>{t('receipt.format.pdf')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => startExport('png')}
                    className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-50 border-t border-slate-100 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-600" />
                    <span>{t('receipt.format.png')}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Custom Date Range Inputs */}
        {dateFilter === 'custom' && (
          <div className="flex items-center gap-2 pt-1 flex-wrap text-xs bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">{t('common.from')}:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">{t('common.to')}:</span>
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
          {filteredExpenses.slice(0, visibleCount).map((exp) => (
            <ExpenseCard
              key={exp.id}
              expense={exp}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              onViewPhoto={handleOpenPhoto}
              onViewDetails={(expense) => setDetailExpense(expense)}
              onViewReceipt={(expense) => setSingleReceiptExpense(expense)}
            />
          ))}
          {filteredExpenses.length > visibleCount && (
            <button
              type="button"
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className="w-full py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-[2px] hover:bg-slate-50 transition-colors"
            >
              {t('expenses.showMore', { count: filteredExpenses.length - visibleCount })}
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 space-y-2 shadow-card">
          <div className="text-3xl">🔍</div>
          <p className="text-sm font-semibold text-slate-700">
            {t('common.noExpenseFound')}
          </p>
          <p className="text-xs text-slate-400">
            {t('expenses.emptyHint')}
          </p>
        </div>
      )}

      {/* Hidden slip used only for the quick PDF / PNG export of the filtered records */}
      {exportFormat && (
        <div aria-hidden="true" style={{ position: 'fixed', left: '-100000px', top: 0, width: 800, pointerEvents: 'none' }}>
          <ReportReceiptCard
            ref={exportRef}
            expenses={filteredExpenses}
            totalExpenses={stats.total}
            totalEntries={stats.count}
            projectName={projectLabel(summary?.projectName)}
            filterLabel={exportFilterLabel}
          />
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

      <ExpenseDetailModal
        isOpen={Boolean(detailExpense)}
        expense={detailExpense}
        onClose={() => setDetailExpense(null)}
        onEdit={(expense) => {
          setDetailExpense(null);
          handleEdit(expense);
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
        expenses={filteredExpenses}
        projectName={projectLabel(summary?.projectName)}
        totalExpenses={filteredExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)}
        totalEntries={filteredExpenses.length}
        dateRangeText={
          dateFilter === 'today'
            ? t('common.today')
            : dateFilter === 'yesterday'
            ? t('common.yesterday')
            : dateFilter === 'this_month'
            ? t('common.thisMonth')
            : dateFilter === 'custom' && (customStartDate || customEndDate)
            ? `${customStartDate || ''} - ${customEndDate || ''}`.trim()
            : ''
        }
        onClose={() => setReportReceiptOpen(false)}
      />
    </div>
  );
}
