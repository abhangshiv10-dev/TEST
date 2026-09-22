import React, { useState, useMemo } from 'react';
import { useProject } from '../../contexts/ProjectContext';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PaymentModal } from '../../components/modals/PaymentModal';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { CreditCard, Clock, CheckCircle2, DollarSign, Plus } from 'lucide-react';

export const PaymentList = () => {
  const { currentProject, expenses, refreshProjectData } = useProject();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const pendingExpenses = useMemo(() => {
    return expenses.filter(e => e.payment_status === 'Pending' || e.payment_status === 'Partially Paid');
  }, [expenses]);

  const filteredList = useMemo(() => {
    if (statusFilter === 'all') return expenses;
    return expenses.filter(e => e.payment_status === statusFilter);
  }, [expenses, statusFilter]);

  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }, [expenses]);

  const totalPaid = useMemo(() => {
    return expenses.reduce((sum, e) => {
      if (e.payment_status === 'Paid') return sum + Number(e.amount || 0);
      if (e.payment_status === 'Partially Paid') return sum + Number(e.paid_amount || 0);
      return sum;
    }, 0);
  }, [expenses]);

  const totalPending = totalSpent - totalPaid;

  const columns = [
    {
      header: 'Expense / Bill Details',
      key: 'description',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-100">{row.description}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Date: {formatDate(row.expense_date)} • Ref: {row.reference_number || '-'}
          </p>
        </div>
      )
    },
    {
      header: 'Payee / Supplier',
      key: 'paid_to',
      sortable: true,
      render: (row) => (
        <span className="font-medium text-slate-700 dark:text-slate-300">
          {row.paid_to || '-'}
        </span>
      )
    },
    {
      header: 'Total Bill (₹)',
      key: 'amount',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-slate-900 dark:text-white">
          {formatCurrency(row.amount)}
        </span>
      )
    },
    {
      header: 'Amount Paid (₹)',
      key: 'paid_amount',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
          {formatCurrency(row.payment_status === 'Paid' ? row.amount : (row.paid_amount || 0))}
        </span>
      )
    },
    {
      header: 'Outstanding Dues (₹)',
      key: 'pending',
      sortable: true,
      render: (row) => {
        const paid = row.payment_status === 'Paid' ? Number(row.amount) : (Number(row.paid_amount) || 0);
        const due = Math.max(0, Number(row.amount) - paid);
        return (
          <span className={`font-bold ${due > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>
            {formatCurrency(due)}
          </span>
        );
      }
    },
    {
      header: 'Status',
      key: 'payment_status',
      sortable: true,
      render: (row) => <StatusBadge status={row.payment_status} size="sm" />
    },
    {
      header: 'Action',
      key: 'action',
      cellClassName: 'text-right',
      render: (row) => (
        row.payment_status !== 'Paid' ? (
          <button
            onClick={() => {
              setSelectedExpense(row);
              setIsPaymentModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Pay Due</span>
          </button>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Settled</span>
          </span>
        )
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Payment & Dues Tracking"
        subtitle="Manage pending supplier bills, partial installments, and vendor clearances"
      />

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase">Total Realized Invoices</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {formatCurrency(totalSpent)}
          </p>
          <p className="text-xs text-slate-400 mt-1">{expenses.length} bills recorded</p>
        </div>

        <div className="glass-card p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase">Total Settled / Paid</p>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(totalPaid)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {((totalPaid / (totalSpent || 1)) * 100).toFixed(1)}% of total invoices paid
          </p>
        </div>

        <div className="glass-card p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase">Total Pending Dues</p>
          <p className={`text-2xl font-extrabold mt-1 ${totalPending > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'}`}>
            {formatCurrency(totalPending)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {pendingExpenses.length} pending / partial bills
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            statusFilter === 'all'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          All Bills ({expenses.length})
        </button>
        <button
          onClick={() => setStatusFilter('Pending')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            statusFilter === 'Pending'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          Unpaid / Pending ({expenses.filter(e => e.payment_status === 'Pending').length})
        </button>
        <button
          onClick={() => setStatusFilter('Partially Paid')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            statusFilter === 'Partially Paid'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          Partially Paid ({expenses.filter(e => e.payment_status === 'Partially Paid').length})
        </button>
        <button
          onClick={() => setStatusFilter('Paid')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all ${
            statusFilter === 'Paid'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          Fully Settled ({expenses.filter(e => e.payment_status === 'Paid').length})
        </button>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredList}
        searchField="description"
        searchFields={['description', 'paid_to', 'reference_number']}
        searchPlaceholder="Search payments by bill or payee..."
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedExpense(null);
        }}
        expense={selectedExpense}
        onSaved={refreshProjectData}
      />
    </div>
  );
};
