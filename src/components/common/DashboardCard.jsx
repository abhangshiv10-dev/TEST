import React from 'react';
import { AmountDisplay } from './AmountDisplay';

export const DashboardCard = ({
  title,
  amount,
  isCurrency = true,
  formattedValue = null,
  subtitle,
  icon: Icon,
  iconBgColor = 'bg-primary-50 text-primary-600 dark:bg-primary-950/50 dark:text-primary-400',
  trend = null, // { value: '33.8%', label: 'used', isPositive: true }
  variant = 'neutral',
  onClick = null,
  className = ''
}) => {
  return (
    <div 
      onClick={onClick}
      className={`glass-card p-5 relative overflow-hidden transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-primary-300 dark:hover:border-primary-700 hover:-translate-y-0.5' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            {isCurrency ? (
              <AmountDisplay amount={amount} size="2xl" variant={variant} />
            ) : (
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {formattedValue !== null ? formattedValue : amount}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl ${iconBgColor} flex items-center justify-center shrink-0`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">{trend.label}</span>
          <span className={`font-semibold ${
            trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
          }`}>
            {trend.value}
          </span>
        </div>
      )}
    </div>
  );
};
