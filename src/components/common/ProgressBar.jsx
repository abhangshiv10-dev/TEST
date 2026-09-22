import React from 'react';

export const ProgressBar = ({
  percentage = 0,
  showLabel = false,
  label = null,
  height = 'h-2.5',
  variant = 'auto', // 'auto' | 'primary' | 'success' | 'warning' | 'danger'
  className = ''
}) => {
  const safePct = Math.min(Math.max(Number(percentage) || 0, 0), 100);

  const getBarColor = () => {
    if (variant !== 'auto') {
      switch (variant) {
        case 'primary': return 'bg-primary-500';
        case 'success': return 'bg-emerald-500';
        case 'warning': return 'bg-amber-500';
        case 'danger': return 'bg-rose-500';
        default: return 'bg-primary-500';
      }
    }

    if (percentage > 100) return 'bg-rose-600';
    if (percentage >= 90) return 'bg-rose-500';
    if (percentage >= 80) return 'bg-amber-500';
    return 'bg-primary-500';
  };

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || label) && (
        <div className="flex justify-between text-xs mb-1.5 font-medium text-slate-600 dark:text-slate-300">
          <span>{label || 'Progress'}</span>
          <span className="font-bold">{safePct}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-200/80 dark:bg-slate-700/80 rounded-full overflow-hidden ${height}`}>
        <div
          className={`${height} ${getBarColor()} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${safePct}%` }}
        />
      </div>
    </div>
  );
};
