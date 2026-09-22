import React, { useState, useMemo } from 'react';
import { useProject } from '../../contexts/ProjectContext';
import { PageHeader } from '../../components/common/PageHeader';
import { DateFilter } from '../../components/common/DateFilter';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DataTable } from '../../components/common/DataTable';
import { ExpenseModal } from '../../components/modals/ExpenseModal';
import { PaymentModal } from '../../components/modals/PaymentModal';
import { formatCurrency } from '../../utils/currency';
import { formatDate, filterByDateRange } from '../../utils/date';
import { DEFAULT_CATEGORIES, PAYMENT_METHODS, PAYMENT_STATUSES } from '../../constants/categories';
import { exportExpensesToExcel } from '../../services/exportService';
import { showConfirmDialog, showSuccessToast, showErrorAlert } from '../../utils/validators';
import { DataService } from '../../services/dataService';
import { 
  Plus, 
  Download, 
  Edit3, 
  Trash2, 
  Receipt, 
  CreditCard, 
  Filter, 
  X,
  ExternalLink 
} from 'lucide-react';

export const ExpenseList = () => {
  const { currentProject, expenses, suppliers, refreshProjectData } = useProject();

  // Filters state
  const [dateFilter, setDateFilter] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMethod, setSelectedMethod] = useState('all');

  // Modal states
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedExpenseForPayment, setSelectedExpenseForPayment] = useState(null);
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState(null);

  // Filter application
  const filteredExpenses = useMemo(() => {
    let list = filterByDateRange(expenses, 'expense_date', dateFilter, customStart, customEnd);

    if (selectedCategory !== 'all') {
      list = list.filter(e => e.category_id === selectedCategory);
    }
    if (selectedStatus !== 'all') {
      list = list.filter(e => e.payment_status === selectedStatus);
    }
    if (selectedMethod !== 'all') {
      list = list.filter(e => e.payment_method === selectedMethod);
    }

    return list;
  }, [expenses, dateFilter, customStart, customEnd, selectedCategory, selectedStatus, selectedMethod]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [filteredExpenses]);

  const totalFilteredPending = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => {
      const paid = e.payment_status === 'Paid' ? Number(e.amount) : (Number(e.paid_amount) || 0);
      return sum + Math.max(0, Number(e.amount) - paid);
    }, 0);
  }, [filteredExpenses]);

  const handleDelete = async (expense) => {
    const confirmed = await showConfirmDialog({
      title: 'Delete Expense Record?',
      text: `Are you sure you want to delete "${expense.description}" (${formatCurrency(expense.amount)})?`,
      confirmButtonText: 'Yes, delete expense'
    });

    if (confirmed) {
      try {
        await DataService.deleteExpense(expense.id);
        showSuccessToast('Expense deleted successfully');
        await refreshProjectData();
      } catch (err) {
        showErrorAlert(err.message, 'Delete Failed');
      }
    }
  };

  const columns = [
    {
      header: 'Date',
      key: 'expense_date',
      sortable: true,
      render: (row) => (
        <span className="font-medium whitespace-nowrap">
          {formatDate(row.expense_date, 'dd MMM yyyy')}
        </span>
      )
    },
    {
      header: 'Description & Items',
      key: 'description',
      sortable: true,
      render: (row) => (
        <div className="max-w-[240px] sm:max-w-xs">
          <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{row.description}</p>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
            <span>{DEFAULT_CATEGORIES.find(c => c.id === row.category_id)?.name || 'General'}</span>
            {row.quantity && (
              <span>• {row.quantity} {row.unit} @ ₹{row.rate}</span>
            )}
          </div>
        </div>
      )
    },
    {
      header: 'Paid To / Supplier',
      key: 'paid_to',
      sortable: true,
      render: (row) => (
        <span className="text-slate-600 dark:text-slate-300 font-medium">
          {row.paid_to || '-'}
        </span>
      )
    },
    {
      header: 'Payment Method',
      key: 'payment_method',
      render: (row) => (
        <span className="text-xs px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {row.payment_method}
        </span>
      )
    },
    {
      header: 'Amount',
      key: 'amount',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white">
            {formatCurrency(row.amount)}
          </p>
          {row.payment_status === 'Partially Paid' && (
            <p className="text-[10px] text-rose-500 font-medium">
              Due: {formatCurrency(row.amount - (row.paid_amount || 0))}
            </p>
          )}
        </div>
      )
    },
    {
      header: 'Status',
      key: 'payment_status',
      sortable: true,
      render: (row) => <StatusBadge status={row.payment_status} size="sm" />
    },
    {
      header: 'Receipt',
      key: 'receipt_url',
      cellClassName: 'text-center',
      render: (row) => (
        row.receipt_url ? (
          <button
            onClick={() => setReceiptPreviewUrl(row.receipt_url)}
            className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/50"
            title="View Bill Receipt"
          >
            <Receipt className="w-4 h-4 inline" />
          </button>
        ) : (
          <span className="text-slate-300 dark:text-slate-600">-</span>
        )
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      cellClassName: 'text-right whitespace-nowrap',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {row.payment_status !== 'Paid' && (
            <button
              onClick={() => {
                setSelectedExpenseForPayment(row);
                setIsPaymentModalOpen(true);
              }}
              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              title="Pay Outstanding"
            >
              <CreditCard className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => {
              setExpenseToEdit(row);
              setIsExpenseModalOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Edit Expense"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            title="Delete Expense"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Expense Management"
        subtitle="Complete ledger of materials, labour wages, contractor bills and site purchases"
        actions={
          <>
            <button
              onClick={() => exportExpensesToExcel(filteredExpenses, currentProject?.name)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-colors"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export to Excel</span>
            </button>
            <button
              onClick={() => {
                setExpenseToEdit(null);
                setIsExpenseModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Expense</span>
            </button>
          </>
        }
      />

      {/* Filter Toolbar */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center justify-between">
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

          {(selectedCategory !== 'all' || selectedStatus !== 'all' || selectedMethod !== 'all' || dateFilter !== 'all') && (
            <button
              onClick={() => {
                setDateFilter('all');
                setSelectedCategory('all');
                setSelectedStatus('all');
                setSelectedMethod('all');
              }}
              className="text-xs text-rose-500 hover:underline flex items-center gap-1 font-medium"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Secondary Category & Status Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1 uppercase">
              Filter by Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
            >
              <option value="all">All Categories</option>
              {DEFAULT_CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1 uppercase">
              Filter by Payment Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
            >
              <option value="all">All Statuses</option>
              {PAYMENT_STATUSES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1 uppercase">
              Filter by Payment Method
            </label>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100"
            >
              <option value="all">All Methods</option>
              {PAYMENT_METHODS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary KPI Strip for Current Filtered Expenses */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase">Filtered Total</p>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            {formatCurrency(totalFilteredAmount)}
          </p>
          <p className="text-[11px] text-slate-400">{filteredExpenses.length} records</p>
        </div>

        <div className="glass-card p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase">Filtered Outstanding</p>
          <p className={`text-xl font-extrabold mt-1 ${totalFilteredPending > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'}`}>
            {formatCurrency(totalFilteredPending)}
          </p>
          <p className="text-[11px] text-slate-400">Dues to settle</p>
        </div>

        <div className="glass-card p-4 col-span-2 sm:col-span-1">
          <p className="text-xs font-semibold text-slate-400 uppercase">Project Total Budget</p>
          <p className="text-xl font-extrabold text-primary-600 dark:text-primary-400 mt-1">
            {formatCurrency(currentProject?.total_budget || 0)}
          </p>
          <p className="text-[11px] text-slate-400">Total sanctioned</p>
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={filteredExpenses}
        searchField="description"
        searchFields={['description', 'paid_to', 'reference_number']}
        searchPlaceholder="Search expenses by item, payee or reference..."
        onAdd={() => {
          setExpenseToEdit(null);
          setIsExpenseModalOpen(true);
        }}
        addLabel="Add Expense"
      />

      {/* Modals */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setExpenseToEdit(null);
        }}
        expenseToEdit={expenseToEdit}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedExpenseForPayment(null);
        }}
        expense={selectedExpenseForPayment}
      />

      {/* Full-Screen Receipt Preview Modal */}
      {receiptPreviewUrl && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="fixed inset-0" onClick={() => setReceiptPreviewUrl(null)} />
          <div className="relative max-w-3xl w-full bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl p-4 z-10">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-sm text-slate-800 dark:text-white">Receipt / Bill Image</h4>
              <button
                onClick={() => setReceiptPreviewUrl(null)}
                className="text-xs px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200"
              >
                Close
              </button>
            </div>
            <div className="p-4 flex items-center justify-center max-h-[75vh] overflow-auto">
              <img src={receiptPreviewUrl} alt="Bill Receipt" className="max-w-full rounded-xl object-contain shadow-md" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
