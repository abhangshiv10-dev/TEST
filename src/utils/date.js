import { 
  format, 
  isToday, 
  isYesterday, 
  isThisWeek, 
  isThisMonth, 
  isThisYear, 
  parseISO, 
  isValid,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays
} from 'date-fns';

export const formatDate = (dateString, formatStr = 'dd MMM yyyy') => {
  if (!dateString) return '-';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    if (!isValid(date)) return '-';
    return format(date, formatStr);
  } catch {
    return '-';
  }
};

export const formatInputDate = (date = new Date()) => {
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(isValid(d) ? d : new Date(), 'yyyy-MM-dd');
  } catch {
    return format(new Date(), 'yyyy-MM-dd');
  }
};

export const filterByDateRange = (items, dateField = 'expense_date', filter = 'all', customStart = null, customEnd = null) => {
  if (!items || !Array.isArray(items)) return [];
  if (filter === 'all') return items;

  return items.filter(item => {
    const val = item[dateField];
    if (!val) return false;
    const date = typeof val === 'string' ? parseISO(val) : val;
    if (!isValid(date)) return false;

    switch (filter) {
      case 'today':
        return isToday(date);
      case 'yesterday':
        return isYesterday(date);
      case 'this_week':
        return isThisWeek(date, { weekStartsOn: 1 });
      case 'this_month':
        return isThisMonth(date);
      case 'this_year':
        return isThisYear(date);
      case 'custom':
        if (customStart && date < parseISO(customStart)) return false;
        if (customEnd && date > parseISO(customEnd + 'T23:59:59')) return false;
        return true;
      default:
        return true;
    }
  });
};
