import React, { useState, useMemo } from 'react';
import { useProject } from '../../contexts/ProjectContext';
import { PageHeader } from '../../components/common/PageHeader';
import { DateFilter } from '../../components/common/DateFilter';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatCurrency } from '../../utils/currency';
import { formatDate, filterByDateRange } from '../../utils/date';
import { DEFAULT_CATEGORIES } from '../../constants/categories';
import { exportExpensesToExcel, exportPDFReport } from '../../services/exportService';
import { 
  BarChart3, 
  Download, 
  Printer, 
  FileText, 
  PieChart, 
  TrendingUp, 
  Layers, 
  Users, 
  Package, 
  Landmark 
} from 'lucide-react';

export const Reports = () => {
  const { currentProject, summary, expenses, budgets, stages, materials, suppliers, fundings } = useProject();

  const [activeReportType, setActiveReportType] = useState('category'); // 'category' | 'monthly' | 'material' | 'labour' | 'pending' | 'budget_variance'
  const [dateFilter, setDateFilter] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const filteredExpenses = useMemo(() => {
    return filterByDateRange(expenses, 'expense_date', dateFilter, customStart, customEnd);
  }, [expenses, dateFilter, customStart, customEnd]);

  // Report: Category Breakdown
  const categoryReport = useMemo(() => {
    return DEFAULT_CATEGORIES.map(cat => {
      const catExpenses = filteredExpenses.filter(e => e.category_id === cat.id);
      const totalAmount = catExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
      const budget = budgets.find(b => b.category_id === cat.id)?.budget_amount || 0;
      return {
        id: cat.id,
        name: cat.name,
        type: cat.type,
        color: cat.color,
        count: catExpenses.length,
        totalAmount,
        budget: Number(budget),
        variance: Number(budget) - totalAmount
      };
    }).filter(c => c.totalAmount > 0 || c.budget > 0);
  }, [filteredExpenses, budgets]);

  // Report: Supplier Breakdown
  const supplierReport = useMemo(() => {
    return suppliers.map(sup => {
      const supExpenses = filteredExpenses.filter(e => e.supplier_id === sup.id || (e.paid_to && e.paid_to.toLowerCase().includes(sup.name.toLowerCase())));
      const total = supExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
      const paid = supExpenses.reduce((sum, e) => e.payment_status === 'Paid' ? sum + Number(e.amount) : sum + (Number(e.paid_amount) || 0), 0);
      return {
        id: sup.id,
        name: sup.name,
        business_name: sup.business_name,
        material_type: sup.material_type,
        count: supExpenses.length,
        total,
        paid,
        pending: Math.max(0, total - paid)
      };
    });
  }, [suppliers, filteredExpenses]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    exportPDFReport({
      project: currentProject,
      expenses: filteredExpenses,
      budgets,
      stages,
      summary
    });
  };

  const reportTabs = [
    { key: 'category', label: 'Category Expense', icon: PieChart },
    { key: 'supplier', label: 'Supplier Ledger', icon: Package },
    { key: 'budget_variance', label: 'Budget vs Actual', icon: TrendingUp },
    { key: 'pending', label: 'Pending Dues Report', icon: FileText }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="no-print">
        <PageHeader
          title="Reports & Analytics"
          subtitle="Generate financial audit reports, category distribution, supplier ledgers, and exportable statements"
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-sm"
              >
                <Printer className="w-4 h-4 text-slate-500" />
                <span>Print View</span>
              </button>
              <button
                onClick={() => exportExpensesToExcel(filteredExpenses, currentProject?.name)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-sm"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Excel (XLSX)</span>
              </button>
              <button
                onClick={handleExportPDF}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs sm:text-sm font-bold shadow-sm transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>Export PDF</span>
              </button>
            </div>
          }
        />

        {/* Date Filter & Tab Switcher */}
        <div className="glass-card p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto">
              {reportTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveReportType(tab.key)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeReportType === tab.key
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <DateFilter
              activeFilter={dateFilter}
              onChange={setDateFilter}
              customStartDate={customStart}
              customEndDate={customEnd}
              onCustomDateChange={(s, e) => {
                setCustomStart(s);
                setCustomEnd(e);
              }}
            />
          </div>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="glass-card p-6 sm:p-8">
        <div className="border-b border-slate-200 dark:border-slate-700 pb-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {currentProject?.name || 'Home Construction Report'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Owner: {currentProject?.owner_name || 'Homeowner'} • Location: {currentProject?.address || 'Site Plot'}
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-400">
            <p>Generated: <strong>{formatDate(new Date(), 'dd MMMM yyyy, hh:mm a')}</strong></p>
            <p className="text-primary-600 dark:text-primary-400 font-bold mt-0.5">HomeBuild Tracker Professional Audit</p>
          </div>
        </div>

        {/* Financial Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/60 text-xs mb-8">
          <div>
            <span className="text-slate-400 uppercase font-semibold text-[10px]">Total Sanctioned Budget</span>
            <p className="text-lg font-black text-slate-900 dark:text-white mt-1">
              {formatCurrency(summary.totalBudget)}
            </p>
          </div>
          <div>
            <span className="text-slate-400 uppercase font-semibold text-[10px]">Total Realized Outflow</span>
            <p className="text-lg font-black text-primary-600 dark:text-primary-400 mt-1">
              {formatCurrency(summary.totalSpent)}
            </p>
          </div>
          <div>
            <span className="text-slate-400 uppercase font-semibold text-[10px]">Remaining Budget Balance</span>
            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {formatCurrency(summary.remainingBudget)}
            </p>
          </div>
          <div>
            <span className="text-slate-400 uppercase font-semibold text-[10px]">Budget Utilization</span>
            <p className="text-lg font-black text-slate-900 dark:text-white mt-1">
              {summary.budgetUsedPct}%
            </p>
          </div>
        </div>

        {/* Dynamic Report Content based on Selected Tab */}
        {activeReportType === 'category' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Category-Wise Spending Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 uppercase text-[11px]">
                    <th className="pb-3 font-semibold">Category Name</th>
                    <th className="pb-3 font-semibold">Type</th>
                    <th className="pb-3 font-semibold text-center">Bills Count</th>
                    <th className="pb-3 font-semibold text-right">Allocated Budget</th>
                    <th className="pb-3 font-semibold text-right">Total Spent (₹)</th>
                    <th className="pb-3 font-semibold text-right">Remaining Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {categoryReport.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30">
                      <td className="py-3 font-bold text-slate-800 dark:text-slate-100">
                        {c.name}
                      </td>
                      <td className="py-3 text-slate-400 text-xs">
                        {c.type}
                      </td>
                      <td className="py-3 text-center text-slate-500">
                        {c.count}
                      </td>
                      <td className="py-3 text-right font-medium text-slate-600 dark:text-slate-300">
                        {c.budget > 0 ? formatCurrency(c.budget) : '-'}
                      </td>
                      <td className="py-3 text-right font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(c.totalAmount)}
                      </td>
                      <td className={`py-3 text-right font-bold ${c.variance < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {c.budget > 0 ? formatCurrency(c.variance) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeReportType === 'supplier' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Supplier Accounts & Dues Ledger
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 uppercase text-[11px]">
                    <th className="pb-3 font-semibold">Supplier Name</th>
                    <th className="pb-3 font-semibold">Material Line</th>
                    <th className="pb-3 font-semibold text-right">Total Supply Value</th>
                    <th className="pb-3 font-semibold text-right">Total Settled</th>
                    <th className="pb-3 font-semibold text-right">Pending Balance (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {supplierReport.map((sup) => (
                    <tr key={sup.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30">
                      <td className="py-3 font-bold text-slate-900 dark:text-white">
                        {sup.name}
                        {sup.business_name && <span className="block text-xs font-normal text-slate-400">{sup.business_name}</span>}
                      </td>
                      <td className="py-3 text-slate-500 text-xs">
                        {sup.material_type}
                      </td>
                      <td className="py-3 text-right font-bold text-slate-900 dark:text-white">
                        {formatCurrency(sup.total)}
                      </td>
                      <td className="py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(sup.paid)}
                      </td>
                      <td className={`py-3 text-right font-extrabold ${sup.pending > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>
                        {formatCurrency(sup.pending)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeReportType === 'budget_variance' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Budget vs Actual Cost Variance
            </h3>
            <div className="space-y-3">
              {categoryReport.map((c) => {
                const pct = c.budget > 0 ? Math.round((c.totalAmount / c.budget) * 100) : 0;
                return (
                  <div key={c.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-bold text-slate-800 dark:text-white">{c.name}</span>
                      <div className="flex items-center gap-4 text-xs">
                        <span>Budget: <strong>{formatCurrency(c.budget)}</strong></span>
                        <span>Spent: <strong className="text-primary-600">{formatCurrency(c.totalAmount)}</strong></span>
                        <span className={`font-bold ${pct >= 100 ? 'text-rose-500' : pct >= 80 ? 'text-amber-500' : 'text-emerald-600'}`}>
                          {pct}% Used
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct >= 100 ? 'bg-rose-600' : pct >= 80 ? 'bg-amber-500' : 'bg-primary-500'
                        }`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeReportType === 'pending' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Pending & Unsettled Payments Statement
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 uppercase text-[11px]">
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold">Bill Item</th>
                    <th className="pb-3 font-semibold">Payee</th>
                    <th className="pb-3 font-semibold text-right">Bill Total (₹)</th>
                    <th className="pb-3 font-semibold text-right">Amount Paid</th>
                    <th className="pb-3 font-semibold text-right">Due Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {expenses.filter(e => e.payment_status !== 'Paid').map((e) => {
                    const paid = e.paid_amount || 0;
                    const due = Number(e.amount) - paid;
                    return (
                      <tr key={e.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30">
                        <td className="py-3 text-slate-500">{formatDate(e.expense_date)}</td>
                        <td className="py-3 font-bold text-slate-900 dark:text-white">{e.description}</td>
                        <td className="py-3 text-slate-600 dark:text-slate-300">{e.paid_to || '-'}</td>
                        <td className="py-3 text-right font-medium">{formatCurrency(e.amount)}</td>
                        <td className="py-3 text-right font-semibold text-emerald-600">{formatCurrency(paid)}</td>
                        <td className="py-3 text-right font-extrabold text-rose-600 dark:text-rose-400">{formatCurrency(due)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
