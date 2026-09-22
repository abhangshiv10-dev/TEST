import React, { useState, useMemo } from 'react';
import { useProject } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { ProgressBar } from '../../components/common/ProgressBar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { formatCurrency, calculatePercentage } from '../../utils/currency';
import { DEFAULT_CATEGORIES } from '../../constants/categories';
import { DataService } from '../../services/dataService';
import { showSuccessToast, showErrorAlert } from '../../utils/validators';
import { 
  PieChart, 
  TrendingUp, 
  AlertTriangle, 
  Edit3, 
  Plus, 
  Layers, 
  ShieldCheck 
} from 'lucide-react';

export const BudgetManagement = () => {
  const { currentProject, budgets, expenses, summary, refreshProjectData } = useProject();
  const { user } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [budgetForm, setBudgetForm] = useState({
    category_id: DEFAULT_CATEGORIES[0].id,
    budget_amount: '',
    period: 'Entire Project',
    notes: ''
  });

  // Calculate spent per category
  const categoryBudgetData = useMemo(() => {
    return DEFAULT_CATEGORIES.map(cat => {
      const budgetRecord = budgets.find(b => b.category_id === cat.id);
      const allocated = budgetRecord ? Number(budgetRecord.budget_amount) : 0;

      const spent = expenses
        .filter(e => e.category_id === cat.id)
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);

      const remaining = allocated - spent;
      const usedPct = allocated > 0 ? Number(((spent / allocated) * 100).toFixed(1)) : 0;

      let status = 'Normal';
      if (usedPct >= 100) status = 'Over Budget';
      else if (usedPct >= 90) status = 'Critical';
      else if (usedPct >= 80) status = 'Warning';

      return {
        category: cat,
        budgetId: budgetRecord?.id || null,
        allocated,
        spent,
        remaining,
        usedPct,
        status,
        notes: budgetRecord?.notes || ''
      };
    });
  }, [budgets, expenses]);

  const totalAllocatedBudget = useMemo(() => {
    return categoryBudgetData.reduce((sum, c) => sum + c.allocated, 0);
  }, [categoryBudgetData]);

  const handleEditBudget = (item) => {
    setEditingBudget(item);
    setBudgetForm({
      category_id: item.category.id,
      budget_amount: String(item.allocated || ''),
      period: 'Entire Project',
      notes: item.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    const amt = Number(budgetForm.budget_amount);
    if (isNaN(amt) || amt < 0) {
      showErrorAlert('Please enter a valid budget amount');
      return;
    }

    try {
      await DataService.saveBudget({
        project_id: currentProject?.id,
        category_id: budgetForm.category_id,
        budget_amount: amt,
        period: budgetForm.period,
        notes: budgetForm.notes
      }, user?.id);

      showSuccessToast('Budget updated successfully');
      await refreshProjectData();
      setIsModalOpen(false);
    } catch (err) {
      showErrorAlert(err.message, 'Save Failed');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Budget Management"
        subtitle="Define, monitor, and control category-wise expenditure limits"
        actions={
          <button
            onClick={() => {
              setEditingBudget(null);
              setBudgetForm({
                category_id: DEFAULT_CATEGORIES[0].id,
                budget_amount: '',
                period: 'Entire Project',
                notes: ''
              });
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs sm:text-sm font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Set Category Budget</span>
          </button>
        }
      />

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase">Sanctioned Project Budget</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {formatCurrency(currentProject?.total_budget || 0)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Allocated across categories: {formatCurrency(totalAllocatedBudget)}
          </p>
        </div>

        <div className="glass-card p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase">Total Realized Expenses</p>
          <p className="text-2xl font-extrabold text-primary-600 dark:text-primary-400 mt-1">
            {formatCurrency(summary.totalSpent)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {summary.budgetUsedPct}% of sanctioned budget spent
          </p>
        </div>

        <div className="glass-card p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase">Unallocated Cushion</p>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(Math.max(0, (currentProject?.total_budget || 0) - totalAllocatedBudget))}
          </p>
          <p className="text-xs text-slate-400 mt-1">Contingency reserve fund</p>
        </div>
      </div>

      {/* Category Budget Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryBudgetData.map((item) => (
          <div key={item.category.id} className="glass-card p-5 relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0"
                    style={{ backgroundColor: item.category.color }}
                  >
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {item.category.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {item.category.type}
                    </span>
                  </div>
                </div>

                <StatusBadge status={item.status} size="sm" />
              </div>

              {/* Progress Bar & Percent */}
              <div className="my-3">
                <div className="flex justify-between text-xs mb-1.5 font-semibold">
                  <span className="text-slate-500 dark:text-slate-400">Budget Utilized:</span>
                  <span className={item.usedPct >= 90 ? 'text-rose-500 font-bold' : item.usedPct >= 80 ? 'text-amber-500' : 'text-slate-700 dark:text-slate-300'}>
                    {item.usedPct}%
                  </span>
                </div>
                <ProgressBar percentage={item.usedPct} height="h-2.5" />
              </div>

              {/* Financial Metrics */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-center text-xs">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Budget</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {formatCurrency(item.allocated, { compact: true })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Spent</p>
                  <p className="font-bold text-primary-600 dark:text-primary-400 mt-0.5">
                    {formatCurrency(item.spent, { compact: true })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Remaining</p>
                  <p className={`font-bold mt-0.5 ${item.remaining < 0 ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {formatCurrency(item.remaining, { compact: true })}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 truncate max-w-[180px]">
                {item.notes || 'No notes set'}
              </span>
              <button
                onClick={() => handleEditBudget(item)}
                className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Edit Budget"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Set / Edit Budget Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBudget ? `Edit Budget: ${editingBudget.category.name}` : 'Set Category Budget'}
        subtitle="Allocate financial budget for construction materials, labour or services"
      >
        <form onSubmit={handleSaveBudget} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Category *
            </label>
            <select
              value={budgetForm.category_id}
              onChange={(e) => setBudgetForm({ ...budgetForm, category_id: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              {DEFAULT_CATEGORIES.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Allocated Budget Amount (₹) *
            </label>
            <input
              type="number"
              required
              placeholder="e.g. 350000"
              value={budgetForm.budget_amount}
              onChange={(e) => setBudgetForm({ ...budgetForm, budget_amount: e.target.value })}
              className="w-full px-3 py-2 text-sm font-bold text-primary-600 dark:text-primary-400 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Budget Notes / Estimation Basis
            </label>
            <input
              type="text"
              placeholder="e.g. Estimated 800 cement bags @ ₹400/bag"
              value={budgetForm.notes}
              onChange={(e) => setBudgetForm({ ...budgetForm, notes: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-bold bg-primary-600 hover:bg-primary-500 text-white rounded-xl shadow-sm"
            >
              Save Budget
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
