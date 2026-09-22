import React from 'react';

export const StatusBadge = ({ status, size = 'md' }) => {
  const getStyles = () => {
    switch (status?.toLowerCase()) {
      case 'paid':
      case 'completed':
      case 'active':
      case 'in stock':
      case 'low':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800';

      case 'partially paid':
      case 'in progress':
      case 'warning':
      case 'low stock':
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800';

      case 'pending':
      case 'not started':
      case 'planning':
      case 'out of stock':
      case 'critical':
      case 'over budget':
      case 'high':
      case 'inactive':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800';

      case 'on hold':
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

      default:
        return 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    }
  };

  const sizeStyles = size === 'sm' 
    ? 'px-2 py-0.5 text-xs' 
    : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${getStyles()} ${sizeStyles}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
      {status || 'Unknown'}
    </span>
  );
};
