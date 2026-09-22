import React from 'react';
import { Calendar } from 'lucide-react';

export const DateFilter = ({
  activeFilter = 'all',
  onChange,
  customStartDate = '',
  customEndDate = '',
  onCustomDateChange
}) => {
  const filterOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'this_week', label: 'This Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'this_year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 overflow-x-auto max-w-full">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeFilter === opt.value
                ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {activeFilter === 'custom' && onCustomDateChange && (
        <div className="flex items-center gap-2 mt-1 sm:mt-0">
          <input
            type="date"
            value={customStartDate}
            onChange={(e) => onCustomDateChange(e.target.value, customEndDate)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-primary-500"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            value={customEndDate}
            onChange={(e) => onCustomDateChange(customStartDate, e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-primary-500"
          />
        </div>
      )}
    </div>
  );
};
