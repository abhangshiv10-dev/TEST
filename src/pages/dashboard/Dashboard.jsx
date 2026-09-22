import React, { useMemo, useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Package, 
  Users, 
  HardHat, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Eye, 
  ArrowUpRight, 
  Receipt,
  Layers
} from 'lucide-react';
import { useProject } from '../../contexts/ProjectContext';
import { DashboardCard } from '../../components/common/DashboardCard';
import { ProgressBar } from '../../components/common/ProgressBar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { AmountDisplay } from '../../components/common/AmountDisplay';
import { formatCurrency, formatIndianNumber } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { ExpenseModal } from '../../components/modals/ExpenseModal';
import { MaterialModal } from '../../components/modals/MaterialModal';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const { currentProject, summary, expenses, materials, tasks, stages } = useProject();
  const navigate = useNavigate();

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [selectedMaterialForPurchase, setSelectedMaterialForPurchase] = useState(null);
  const [viewReceiptUrl, setViewReceiptUrl] = useState(null);

  // 1. Monthly Spending Aggregation
  const monthlyData = useMemo(() => {
    const monthsMap = {};
    expenses.forEach(exp => {
      if (!exp.expense_date) return;
      const month = formatDate(exp.expense_date, 'MMM yyyy');
      monthsMap[month] = (monthsMap[month] || 0) + Number(exp.amount || 0);
    });

    const list = Object.keys(monthsMap).map(m => ({
      month: m,
      amount: monthsMap[m]
    }));

    return list.length > 0 ? list : [
      { month: 'Jan 2026', amount: 97500 },
      { month: 'Feb 2026', amount: 312050 },
      { month: 'Mar 2026', amount: 264300 }
    ];
  }, [expenses]);

  // 2. Category Breakdown Aggregation
  const categoryData = useMemo(() => {
    const map = {};
    expenses.forEach(exp => {
      const cat = exp.category_id?.replace('cat-', '')?.replace('-', ' ')?.toUpperCase() || 'GENERAL';
      map[cat] = (map[cat] || 0) + Number(exp.amount || 0);
    });

    const colors = ['#0284c7', '#475569', '#d97706', '#dc2626', '#059669', '#2563eb', '#9333ea', '#ca8a04'];
    return Object.keys(map).map((cat, idx) => ({
      name: cat,
      value: map[cat],
      color: colors[idx % colors.length]
    }));
  }, [expenses]);

  // 3. Cost Type Split (Materials vs Labour vs Contractor vs Other)
  const costSplitData = useMemo(() => {
    return [
      { name: 'Materials', value: summary.materialCost || 440900, color: '#0284c7' },
      { name: 'Labour', value: summary.labourCost || 185000, color: '#059669' },
      { name: 'Contractor', value: summary.contractorCost || 150000, color: '#475569' },
      { name: 'Services & Other', value: summary.otherCost || 98300, color: '#d97706' }
    ];
  }, [summary]);

  // 4. Low Stock Items
  const lowStockItems = useMemo(() => {
    return materials.filter(m => Number(m.current_stock) <= Number(m.minimum_stock));
  }, [materials]);

  // 5. Recent 10 Expenses
  const recentExpenses = useMemo(() => {
    return expenses.slice(0, 8);
  }, [expenses]);

  // 6. Upcoming Tasks
  const upcomingTasks = useMemo(() => {
    return tasks.filter(t => t.status !== 'Completed').slice(0, 4);
  }, [tasks]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Welcome & Quick Action Header */}
      <div className="glass-card p-6 sm:p-8 bg-gradient-to-r from-primary-900 via-primary-950 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-primary-500/10 to-transparent pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 text-xs font-semibold mb-3 border border-primary-500/30">
              <HardHat className="w-3.5 h-3.5" />
              <span>{currentProject?.name || 'Home Construction'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Construction Financials & Progress
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
              {currentProject?.address || 'Smart Real-time Tracking & Expense Management'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setExpenseModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary-500 hover:bg-primary-400 text-white font-bold text-xs sm:text-sm shadow-glow transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Expense</span>
            </button>

            <button
              onClick={() => navigate('/reports')}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-colors"
            >
              <span>View Reports</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Current Stage Highlight Bar */}
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <p className="text-slate-400">Current Active Stage</p>
            <p className="text-sm font-bold text-white mt-0.5">
              {summary.currentActiveStage ? `Stage ${summary.currentActiveStage.order_index}: ${summary.currentActiveStage.name}` : 'Stage 8: Slab Casting'}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Stages Completed</p>
            <p className="text-sm font-bold text-white mt-0.5">
              {summary.completedStagesCount} of {summary.totalStagesCount} Stages ({summary.overallProgressPct}%)
            </p>
          </div>
          <div>
            <p className="text-slate-400">Overall Construction Progress</p>
            <div className="mt-1.5 flex items-center gap-2">
              <ProgressBar percentage={summary.overallProgressPct} height="h-2" variant="primary" />
              <span className="font-bold text-primary-300">{summary.overallProgressPct}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 8 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Budget */}
        <DashboardCard
          title="Total Budget"
          amount={summary.totalBudget}
          icon={DollarSign}
          iconBgColor="bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
          subtitle={`Allocated for ${currentProject?.built_up_area || '2500'} sq.ft`}
          variant="primary"
          onClick={() => navigate('/budgets')}
        />

        {/* 2. Total Spent */}
        <DashboardCard
          title="Total Spent"
          amount={summary.totalSpent}
          icon={TrendingUp}
          iconBgColor="bg-primary-50 text-primary-600 dark:bg-primary-950/50 dark:text-primary-400"
          trend={{
            label: `${summary.budgetUsedPct}% of budget used`,
            value: `${summary.budgetUsedPct}%`,
            isPositive: summary.budgetUsedPct < 85
          }}
          variant={summary.budgetUsedPct > 90 ? 'danger' : 'neutral'}
          onClick={() => navigate('/expenses')}
        />

        {/* 3. Remaining Budget */}
        <DashboardCard
          title="Remaining Budget"
          amount={summary.remainingBudget}
          icon={CheckCircle2}
          iconBgColor="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
          subtitle={`${(100 - summary.budgetUsedPct).toFixed(1)}% funds available`}
          variant="positive"
          onClick={() => navigate('/budgets')}
        />

        {/* 4. Pending Payments */}
        <DashboardCard
          title="Pending Dues"
          amount={summary.pendingPayments}
          icon={Clock}
          iconBgColor="bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
          subtitle="Unsettled supplier & labour bills"
          variant={summary.pendingPayments > 0 ? 'warning' : 'neutral'}
          onClick={() => navigate('/payments')}
        />
      </div>

      {/* Split Cards: Material Cost, Labour Cost, Contractor Cost, Low Stock Alerts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard
          title="Material Cost"
          amount={summary.materialCost}
          icon={Package}
          iconBgColor="bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400"
          subtitle="Cement, steel, sand, bricks, tiles"
          onClick={() => navigate('/materials')}
        />

        <DashboardCard
          title="Labour & Wages"
          amount={summary.labourCost}
          icon={Users}
          iconBgColor="bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400"
          subtitle="Mason, helper, carpenter muster roll"
          onClick={() => navigate('/labour')}
        />

        <DashboardCard
          title="Contractor Payments"
          amount={summary.contractorCost}
          icon={HardHat}
          iconBgColor="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
          subtitle="Turnkey milestones & advances"
          onClick={() => navigate('/contractors')}
        />

        <DashboardCard
          title="Low Stock Materials"
          amount={summary.lowStockMaterialsCount}
          isCurrency={false}
          formattedValue={`${summary.lowStockMaterialsCount} Items`}
          icon={AlertTriangle}
          iconBgColor="bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
          subtitle={summary.lowStockMaterialsCount > 0 ? 'Action required: Restock needed' : 'All items well stocked'}
          variant={summary.lowStockMaterialsCount > 0 ? 'warning' : 'positive'}
          onClick={() => navigate('/materials')}
        />
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Expense Trend */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Monthly Spending Trend
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Monthly cash outflow across construction milestones
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              INR (₹)
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="spendingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0c8fe6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0c8fe6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis 
                  tick={{ fontSize: 11 }} 
                  stroke="#94a3b8"
                  tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} 
                />
                <Tooltip 
                  formatter={(val) => [formatCurrency(val), 'Spent']}
                  contentStyle={{ borderRadius: '0.75rem', backgroundColor: '#1e293b', color: '#fff', border: 'none' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#0c8fe6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#spendingGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Type Split */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Cost Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Material vs Labour vs Contractor split
            </p>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={costSplitData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {costSplitData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val) => [formatCurrency(val), 'Cost']}
                    contentStyle={{ borderRadius: '0.75rem', backgroundColor: '#1e293b', color: '#fff', border: 'none' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
            {costSplitData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Critical Alert Banner if Budget > 80% */}
      {summary.budgetUsedPct >= 80 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-3 text-amber-900 dark:text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <p className="font-bold">
              Budget Warning Threshold Reached ({summary.budgetUsedPct}%)
            </p>
            <p className="mt-0.5 text-amber-800 dark:text-amber-300">
              You have utilized {formatCurrency(summary.totalSpent)} out of your {formatCurrency(summary.totalBudget)} budget. Review pending stage estimates to prevent overruns.
            </p>
          </div>
        </div>
      )}

      {/* Bottom Grid: Low Stock Action Cards & Recent Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Actions & Upcoming Tasks (1 col) */}
        <div className="space-y-6">
          {/* Low Stock Widget */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-500" />
                <span>Low Stock Materials</span>
              </h3>
              <button 
                onClick={() => navigate('/materials')} 
                className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
              >
                View Stock
              </button>
            </div>

            {lowStockItems.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">All material stocks are sufficient.</p>
            ) : (
              <div className="space-y-2.5">
                {lowStockItems.map(item => (
                  <div 
                    key={item.id} 
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{item.name}</p>
                      <p className="text-[11px] text-amber-600 dark:text-amber-400">
                        Stock: <strong>{item.current_stock} {item.unit}</strong> (Min: {item.minimum_stock})
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedMaterialForPurchase(item);
                        setMaterialModalOpen(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-bold text-xs shadow-sm transition-all"
                    >
                      + Order
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Tasks Widget */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-500" />
                <span>Site Tasks & Milestones</span>
              </h3>
              <button 
                onClick={() => navigate('/tasks')} 
                className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-2.5">
              {upcomingTasks.map(task => (
                <div 
                  key={task.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/60 flex items-start justify-between gap-2 text-xs"
                >
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{task.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Due: {formatDate(task.due_date)} • {task.assigned_to || 'Assigned'}
                    </p>
                  </div>
                  <StatusBadge status={task.priority} size="sm" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Latest Expenses Table (2 cols) */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Construction Expenses
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest 8 payments and purchase bills
              </p>
            </div>

            <button
              onClick={() => navigate('/expenses')}
              className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
            >
              <span>View All Expenses</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="text-slate-400 uppercase text-[11px] border-b border-slate-100 dark:border-slate-700/60 pb-2">
                  <th className="pb-3 font-semibold">Date</th>
                  <th className="pb-3 font-semibold">Description</th>
                  <th className="pb-3 font-semibold">Paid To</th>
                  <th className="pb-3 font-semibold text-right">Amount</th>
                  <th className="pb-3 font-semibold text-center">Status</th>
                  <th className="pb-3 font-semibold text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {recentExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30">
                    <td className="py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {formatDate(exp.expense_date, 'dd MMM')}
                    </td>
                    <td className="py-3 font-semibold text-slate-800 dark:text-slate-100 max-w-[180px] sm:max-w-[260px] truncate">
                      {exp.description}
                    </td>
                    <td className="py-3 text-slate-600 dark:text-slate-300 max-w-[120px] truncate">
                      {exp.paid_to || '-'}
                    </td>
                    <td className="py-3 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {formatCurrency(exp.amount)}
                    </td>
                    <td className="py-3 text-center">
                      <StatusBadge status={exp.payment_status} size="sm" />
                    </td>
                    <td className="py-3 text-center">
                      {exp.receipt_url ? (
                        <button
                          onClick={() => setViewReceiptUrl(exp.receipt_url)}
                          className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/50"
                          title="View Receipt"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals for Dashboard Operations */}
      <ExpenseModal
        isOpen={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
      />

      {selectedMaterialForPurchase && (
        <MaterialModal
          isOpen={materialModalOpen}
          onClose={() => {
            setMaterialModalOpen(false);
            setSelectedMaterialForPurchase(null);
          }}
          materialToEdit={selectedMaterialForPurchase}
          mode="purchase"
        />
      )}

      {/* Receipt Image Viewer Modal */}
      {viewReceiptUrl && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="fixed inset-0" onClick={() => setViewReceiptUrl(null)} />
          <div className="relative max-w-3xl w-full bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl p-4 z-10">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-sm text-slate-800 dark:text-white">Receipt / Invoice Document</h4>
              <button
                onClick={() => setViewReceiptUrl(null)}
                className="text-xs px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200"
              >
                Close
              </button>
            </div>
            <div className="p-4 flex items-center justify-center max-h-[75vh] overflow-auto">
              <img src={viewReceiptUrl} alt="Receipt" className="max-w-full rounded-xl object-contain shadow-md" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
