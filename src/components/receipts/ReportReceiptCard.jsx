import React, { forwardRef } from 'react';
import { 
  Calendar, 
  Filter, 
  Wallet, 
  FileText, 
  Package, 
  Truck, 
  Users, 
  Layers, 
  Palette, 
  Zap, 
  Wrench, 
  Grid, 
  DoorClosed, 
  SquareAsterisk,
  MoreHorizontal
} from 'lucide-react';
import { formatINR } from '../../utils/marathiCurrency';
import { getCategoryEnglishLabel } from '../../utils/bilingualSearch';

// Helper to get category icon and color for the receipt
function getReceiptCategoryIcon(name = '') {
  const cat = (name || '').toLowerCase();
  if (cat.includes('सिमेंट') || cat.includes('cement')) {
    return { icon: Package, bg: 'bg-sky-100 text-sky-700' };
  }
  if (cat.includes('वाळू') || cat.includes('sand')) {
    return { icon: Layers, bg: 'bg-amber-100 text-amber-700' };
  }
  if (cat.includes('मजुरी') || cat.includes('कामगार') || cat.includes('labour') || cat.includes('labor')) {
    return { icon: Users, bg: 'bg-rose-100 text-rose-700' };
  }
  if (cat.includes('स्टील') || cat.includes('steel') || cat.includes('लोखंड')) {
    return { icon: SquareAsterisk, bg: 'bg-indigo-100 text-indigo-700' };
  }
  if (cat.includes('विट') || cat.includes('brick') || cat.includes('ब्लॉक')) {
    return { icon: Grid, bg: 'bg-orange-100 text-orange-700' };
  }
  if (cat.includes('वाहतूक') || cat.includes('transport')) {
    return { icon: Truck, bg: 'bg-cyan-100 text-cyan-700' };
  }
  if (cat.includes('पेंट') || cat.includes('रंग') || cat.includes('paint')) {
    return { icon: Palette, bg: 'bg-pink-100 text-pink-700' };
  }
  if (cat.includes('वीज') || cat.includes('electric')) {
    return { icon: Zap, bg: 'bg-yellow-100 text-yellow-700' };
  }
  if (cat.includes('प्लंबिंग') || cat.includes('plumb')) {
    return { icon: Wrench, bg: 'bg-blue-100 text-blue-700' };
  }
  if (cat.includes('दरवाजे') || cat.includes('door')) {
    return { icon: DoorClosed, bg: 'bg-emerald-100 text-emerald-700' };
  }
  return { icon: MoreHorizontal, bg: 'bg-slate-100 text-slate-700' };
}

// Format date into '22 Sep 2026'
function formatReceiptDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = String(d.getDate()).padStart(2, '0');
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

export const ReportReceiptCard = forwardRef(({
  expenses = [],
  totalExpenses = 0,
  totalEntries = 0,
  dateRangeText = '01 Jan 2026 - 30 Sep 2026',
  projectName = 'माझ्या घराचे बांधकाम'
}, ref) => {
  // Max 10 entries as requested by user
  const displayExpenses = expenses.slice(0, 10);
  const calculatedTotal = totalExpenses || displayExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const calculatedCount = totalEntries || expenses.length;

  return (
    <div
      ref={ref}
      className="w-full max-w-[380px] sm:max-w-[400px] mx-auto bg-white rounded-3xl p-5 shadow-lg border border-slate-100 flex flex-col space-y-4 font-sans text-slate-800"
      style={{ minWidth: '340px' }}
    >
      {/* Header Info */}
      <div>
        <p className="text-xs text-slate-500 font-medium leading-tight">
          Manage and view all your construction expenses
        </p>
      </div>

      {/* Date Range Selector Pill & Filter */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-2xs">
          <div className="flex items-center gap-2 truncate">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{dateRangeText}</span>
          </div>
          <span className="text-[10px] text-slate-400 ml-1">▼</span>
        </div>
        <div className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-slate-600 shadow-2xs shrink-0">
          <Filter className="w-4 h-4" />
        </div>
      </div>

      {/* Top 2 Metric Cards (Blue & Green) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Metric 1: Total Expenses */}
        <div className="bg-sky-50/90 border border-sky-100 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-xs shrink-0">
            <Wallet className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-sky-800 font-medium block truncate">
              Total Expenses
            </span>
            <span className="text-sm sm:text-base font-extrabold text-slate-900 block truncate">
              {formatINR(calculatedTotal)}
            </span>
          </div>
        </div>

        {/* Metric 2: Total Entries */}
        <div className="bg-emerald-50/90 border border-emerald-100 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-emerald-800 font-medium block truncate">
              Total Entries
            </span>
            <span className="text-sm sm:text-base font-extrabold text-slate-900 block truncate">
              {calculatedCount}
            </span>
          </div>
        </div>
      </div>

      {/* Expense List (Max 10 Entries) */}
      <div className="space-y-2.5 pt-1">
        {displayExpenses.length > 0 ? (
          displayExpenses.map((item, idx) => {
            const { icon: CategoryIcon, bg: iconBg } = getReceiptCategoryIcon(item.category_name);
            const engLabel = getCategoryEnglishLabel(item.category_name);
            const isCompleted = (item.payment_status || 'Paid').toLowerCase() === 'paid' || item.payment_status === 'पूर्ण';

            return (
              <div
                key={item.id || idx}
                className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
              >
                {/* Left: Icon & Category Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${iconBg}`}>
                    <CategoryIcon className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate">
                      {item.category_name} {engLabel && !item.category_name.includes(engLabel) ? `(${engLabel})` : ''}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                      {item.description || '-'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-normal mt-0.5">
                      {formatReceiptDate(item.expense_date)}
                    </p>
                  </div>
                </div>

                {/* Right: Amount & Status Badge */}
                <div className="text-right shrink-0 ml-2">
                  <span className="text-xs sm:text-sm font-extrabold text-slate-900 block">
                    {formatINR(item.amount)}
                  </span>
                  <div className="mt-1">
                    {isCompleted ? (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Completed
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            कोणताही खर्च उपलब्ध नाही
          </div>
        )}
      </div>

      {/* Subtle branding footer */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
        <span>🏠 {projectName}</span>
        <span>Generated Receipt Report</span>
      </div>
    </div>
  );
});

ReportReceiptCard.displayName = 'ReportReceiptCard';
