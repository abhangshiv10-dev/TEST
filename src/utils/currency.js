/**
 * Indian Rupee (INR) and Number Formatting Utilities
 */

export const formatCurrency = (amount, options = {}) => {
  const num = Number(amount) || 0;
  const { 
    showSymbol = true, 
    compact = false,
    fractionDigits = 0 
  } = options;

  if (compact && Math.abs(num) >= 10000000) {
    const cr = (num / 10000000).toFixed(2);
    return `${showSymbol ? '₹' : ''}${parseFloat(cr)} Cr`;
  }
  
  if (compact && Math.abs(num) >= 100000) {
    const lk = (num / 100000).toFixed(2);
    return `${showSymbol ? '₹' : ''}${parseFloat(lk)} L`;
  }

  if (compact && Math.abs(num) >= 1000) {
    const k = (num / 1000).toFixed(1);
    return `${showSymbol ? '₹' : ''}${parseFloat(k)}k`;
  }

  const formatted = new Intl.NumberFormat('en-IN', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: 'INR',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(num);

  return formatted;
};

export const formatIndianNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return new Intl.NumberFormat('en-IN').format(num);
};

export const calculatePercentage = (part, total) => {
  if (!total || total === 0) return 0;
  const pct = (Number(part) / Number(total)) * 100;
  return Math.min(Math.max(Number(pct.toFixed(1)), 0), 999);
};
