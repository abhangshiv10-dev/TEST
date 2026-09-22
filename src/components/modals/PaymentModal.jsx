import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useProject } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import { PAYMENT_METHODS } from '../../constants/categories';
import { formatInputDate } from '../../utils/date';
import { DataService } from '../../services/dataService';
import { showSuccessToast, showErrorAlert } from '../../utils/validators';
import { formatCurrency } from '../../utils/currency';

export const PaymentModal = ({
  isOpen,
  onClose,
  expense = null,
  onSaved
}) => {
  const { currentProject, refreshProjectData } = useProject();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    amount: '',
    payment_date: formatInputDate(new Date()),
    payment_method: 'UPI',
    reference_number: '',
    notes: ''
  });

  const pendingAmount = expense 
    ? Math.max(0, Number(expense.amount) - Number(expense.paid_amount || 0))
    : 0;

  useEffect(() => {
    if (expense) {
      setFormData({
        amount: String(pendingAmount),
        payment_date: formatInputDate(new Date()),
        payment_method: 'UPI',
        reference_number: '',
        notes: `Payment for ${expense.description?.substring(0, 30)}`
      });
    }
  }, [expense, pendingAmount, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payAmt = Number(formData.amount);
    if (!payAmt || payAmt <= 0) {
      showErrorAlert('Please enter a valid payment amount');
      return;
    }

    try {
      // 1. Record installment payment
      await DataService.insertItem?.('hbt_expense_payments', {
        project_id: currentProject?.id,
        expense_id: expense.id,
        paid_to: expense.paid_to,
        amount: payAmt,
        payment_date: formData.payment_date,
        payment_method: formData.payment_method,
        reference_number: formData.reference_number,
        notes: formData.notes
      });

      // 2. Update parent expense paid amount and status
      const newPaidTotal = Number(expense.paid_amount || 0) + payAmt;
      const newStatus = newPaidTotal >= Number(expense.amount) ? 'Paid' : 'Partially Paid';
      await DataService.updateExpense(expense.id, {
        paid_amount: newPaidTotal,
        payment_status: newStatus
      });

      showSuccessToast(`Recorded payment of ${formatCurrency(payAmt)}`);
      await refreshProjectData();
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      showErrorAlert(err.message, 'Payment Error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Payment / Installment"
      subtitle={expense ? `Bill: ${expense.description}` : 'Log cashflow payment'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {expense && (
          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Total Bill:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(expense.amount)}</span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Already Paid:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(expense.paid_amount || 0)}</span>
            </div>
            <div className="flex justify-between text-slate-700 dark:text-slate-300 font-bold pt-1 border-t border-slate-200 dark:border-slate-700">
              <span>Outstanding Dues:</span>
              <span className="text-rose-600 dark:text-rose-400 font-extrabold">{formatCurrency(pendingAmount)}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Payment Date *
            </label>
            <input
              type="date"
              required
              value={formData.payment_date}
              onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Amount to Pay (₹) *
            </label>
            <input
              type="number"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 text-sm font-bold text-primary-600 dark:text-primary-400 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Payment Method
            </label>
            <select
              value={formData.payment_method}
              onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              {PAYMENT_METHODS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Ref / Cheque / UTR No
            </label>
            <input
              type="text"
              placeholder="e.g. UPI/504938"
              value={formData.reference_number}
              onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Payment Notes
          </label>
          <input
            type="text"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs sm:text-sm font-bold bg-primary-600 hover:bg-primary-500 text-white rounded-xl shadow-sm"
          >
            Confirm Payment
          </button>
        </div>
      </form>
    </Modal>
  );
};
