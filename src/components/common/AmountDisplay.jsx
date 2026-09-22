import React from 'react';
import { formatCurrency } from '../../utils/currency';

export const AmountDisplay = ({ 
  amount, 
  variant = 'neutral', // 'positive' | 'negative' | 'warning' | 'primary' | 'neutral'
  size = 'md',        // 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  compact = false,
  className = '',
  showSymbol = true
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'positive':
        return 'text-emerald-600 dark:text-emerald-400 font-semibold';
      case 'negative':
      case 'danger':
        return 'text-rose-600 dark:text-rose-400 font-semibold';
      case 'warning':
        return 'text-amber-600 dark:text-amber-400 font-semibold';
      case 'primary':
        return 'text-primary-600 dark:text-primary-400 font-bold';
      default:
        return 'text-slate-900 dark:text-slate-100 font-semibold';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm': return 'text-xs';
      case 'md': return 'text-sm';
      case 'lg': return 'text-base sm:text-lg';
      case 'xl': return 'text-xl sm:text-2xl';
      case '2xl': return 'text-2xl sm:text-3xl font-extrabold';
      default: return 'text-sm';
    }
  };

  return (
    <span className={`inline-flex items-center tracking-tight ${getVariantStyles()} ${getSizeStyles()} ${className}`}>
      {formatCurrency(amount, { showSymbol, compact })}
    </span>
  );
};
