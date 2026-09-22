/**
 * Formats a number into Indian Rupee format (e.g. ₹25,00,000 or ₹8,450)
 * @param {number|string} amount
 * @param {boolean} includeSymbol - default true
 * @returns {string}
 */
export function formatINR(amount, includeSymbol = true) {
  const num = Number(amount) || 0;
  
  // Format to standard Indian comma system
  const formatted = num.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  });

  return includeSymbol ? `₹${formatted}` : formatted;
}

/**
 * Calculates percentage used with safe division
 * @param {number} spent
 * @param {number} total
 * @returns {number}
 */
export function calculateBudgetPercentage(spent, total) {
  if (!total || total <= 0) return 0;
  const pct = (spent / total) * 100;
  return Number(pct.toFixed(1));
}
