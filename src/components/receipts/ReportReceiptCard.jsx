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
  MoreHorizontal,
  HardHat,
  Scale,
  Download,
  Share2
} from 'lucide-react';
import { formatINR } from '../../utils/marathiCurrency';
import { getCategoryEnglishLabel } from '../../utils/bilingualSearch';

// Category icon selector matching reference Image 1
function getReportCategoryIcon(name = '') {
  const cat = (name || '').toLowerCase();
  if (cat.includes('सिमेंट') || cat.includes('cement')) {
    return { icon: Package, bg: 'bg-[#EBF5FE] text-[#2F80ED]' };
  }
  if (cat.includes('वाळू') || cat.includes('sand')) {
    return { icon: Layers, bg: 'bg-[#FFF4EB] text-[#F2994A]' };
  }
  if (cat.includes('मजुरी') || cat.includes('कामगार') || cat.includes('labour') || cat.includes('labor')) {
    return { icon: HardHat, bg: 'bg-[#FFEBEF] text-[#EB5757]' };
  }
  if (cat.includes('स्टील') || cat.includes('steel') || cat.includes('लोखंड')) {
    return { icon: Layers, bg: 'bg-[#EFEFFA] text-[#6C5CE7]' };
  }
  if (cat.includes('विट') || cat.includes('brick') || cat.includes('ब्लॉक')) {
    return { icon: Grid, bg: 'bg-[#FFEFEF] text-[#EB5757]' };
  }
  if (cat.includes('वाहतूक') || cat.includes('transport')) {
    return { icon: Truck, bg: 'bg-[#E8F7FA] text-[#2D9CDB]' };
  }
  if (cat.includes('पेंट') || cat.includes('रंग') || cat.includes('paint')) {
    return { icon: Palette, bg: 'bg-[#FCE7F3] text-[#DB2777]' };
  }
  if (cat.includes('वीज') || cat.includes('electric')) {
    return { icon: Zap, bg: 'bg-[#FEF9C3] text-[#CA8A04]' };
  }
  if (cat.includes('प्लंबिंग') || cat.includes('plumb')) {
    return { icon: Wrench, bg: 'bg-[#DBEAFE] text-[#2563EB]' };
  }
  if (cat.includes('दरवाजे') || cat.includes('door')) {
    return { icon: DoorClosed, bg: 'bg-[#D1FAE5] text-[#059669]' };
  }
  return { icon: MoreHorizontal, bg: 'bg-[#F0F4F8] text-[#5A6E85]' };
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
  projectName = 'माझ्या घराचे बांधकाम',
  onExportClick,
  onWhatsAppClick,
  showActionButtons = true
}, ref) => {
  // Max 10 entries as requested
  const displayExpenses = expenses.slice(0, 10);
  const calculatedTotal = totalExpenses || displayExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const calculatedCount = totalEntries || expenses.length;

  return (
    <div
      ref={ref}
      className="receipt-capture-root w-[370px] sm:w-[390px] mx-auto bg-white rounded-[28px] p-5 shadow-xl border border-slate-100/80 flex flex-col font-sans text-slate-800"
      style={{
        boxSizing: 'border-box',
        width: '380px',
        backgroundColor: '#ffffff',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif'
      }}
    >
      {/* Top Header Text */}
      <div className="pb-3" style={{ overflow: 'visible' }}>
        <p 
          className="text-xs text-slate-500 font-medium"
          style={{ lineHeight: '1.5', margin: 0, padding: 0 }}
        >
          Manage and view all your construction expenses
        </p>
      </div>

      {/* Date Range Selector Pill & Filter Icon */}
      <div className="flex items-center gap-2.5 mb-3.5" style={{ overflow: 'visible' }}>
        <div 
          className="flex-1 flex items-center justify-between px-3.5 py-2.5 rounded-2xl border border-slate-200/90 bg-white text-xs font-semibold text-slate-700 shadow-2xs"
          style={{ minHeight: '44px', boxSizing: 'border-box' }}
        >
          <div className="flex items-center gap-2.5" style={{ overflow: 'visible' }}>
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span 
              className="text-slate-800 font-semibold text-xs whitespace-nowrap"
              style={{ lineHeight: '1.5', display: 'inline-block' }}
            >
              {dateRangeText}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 ml-1.5 shrink-0">▼</span>
        </div>

        <div 
          className="w-11 h-11 rounded-2xl border border-slate-200/90 bg-[#F8FAFC] flex items-center justify-center text-slate-600 shadow-2xs shrink-0"
          style={{ boxSizing: 'border-box' }}
        >
          <Filter className="w-4 h-4" />
        </div>
      </div>

      {/* Top 2 Metric Cards (Sky Blue & Mint Green) */}
      <div className="grid grid-cols-2 gap-3 mb-3.5" style={{ overflow: 'visible' }}>
        {/* Metric 1: Total Expenses */}
        <div 
          className="bg-[#E8F4FD] rounded-2xl p-3.5 flex items-center gap-3"
          style={{ minHeight: '74px', boxSizing: 'border-box', overflow: 'visible' }}
        >
          <div className="w-10 h-10 rounded-xl bg-[#2F80ED] text-white flex items-center justify-center shadow-xs shrink-0">
            <Scale className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex flex-col justify-center" style={{ overflow: 'visible' }}>
            <span 
              className="text-[11px] text-[#64748B] font-medium block whitespace-nowrap"
              style={{ lineHeight: '1.4', marginBottom: '2px' }}
            >
              Total Expenses
            </span>
            <span 
              className="text-base font-black text-slate-900 block whitespace-nowrap"
              style={{ lineHeight: '1.4' }}
            >
              {formatINR(calculatedTotal)}
            </span>
          </div>
        </div>

        {/* Metric 2: Total Entries */}
        <div 
          className="bg-[#E8F8F0] rounded-2xl p-3.5 flex items-center gap-3"
          style={{ minHeight: '74px', boxSizing: 'border-box', overflow: 'visible' }}
        >
          <div className="w-10 h-10 rounded-xl bg-[#10B981] text-white flex items-center justify-center shadow-xs shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex flex-col justify-center" style={{ overflow: 'visible' }}>
            <span 
              className="text-[11px] text-[#64748B] font-medium block whitespace-nowrap"
              style={{ lineHeight: '1.4', marginBottom: '2px' }}
            >
              Total Entries
            </span>
            <span 
              className="text-base font-black text-slate-900 block whitespace-nowrap"
              style={{ lineHeight: '1.4' }}
            >
              {calculatedCount}
            </span>
          </div>
        </div>
      </div>

      {/* Expense List (Max 10 Entries) */}
      <div className="space-y-2 mb-4" style={{ overflow: 'visible' }}>
        {displayExpenses.length > 0 ? (
          displayExpenses.map((item, idx) => {
            const { icon: CategoryIcon, bg: iconBg } = getReportCategoryIcon(item.category_name);
            const engLabel = getCategoryEnglishLabel(item.category_name);
            const isCompleted = (item.payment_status || 'Paid').toLowerCase() === 'paid' || item.payment_status === 'पूर्ण';

            return (
              <div
                key={item.id || idx}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-white hover:bg-slate-50/80 transition-colors"
                style={{ minHeight: '60px', boxSizing: 'border-box', overflow: 'visible' }}
              >
                {/* Left: Icon & Category Details */}
                <div className="flex items-center gap-3 min-w-0" style={{ overflow: 'visible' }}>
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${iconBg}`}>
                    <CategoryIcon className="w-5 h-5" />
                  </div>

                  <div className="min-w-0" style={{ overflow: 'visible' }}>
                    <h4 
                      className="text-xs font-bold text-slate-900 block"
                      style={{ lineHeight: '1.4', margin: 0, padding: 0 }}
                    >
                      {item.category_name} {engLabel && !item.category_name.includes(engLabel) ? `(${engLabel})` : ''}
                    </h4>
                    <p 
                      className="text-[11px] text-slate-500 font-medium mt-0.5"
                      style={{ lineHeight: '1.4', margin: 0, padding: 0 }}
                    >
                      {item.description || item.unit || '-'}
                    </p>
                    <p 
                      className="text-[10px] text-slate-400 font-normal mt-0.5"
                      style={{ lineHeight: '1.3', margin: 0, padding: 0 }}
                    >
                      {formatReceiptDate(item.expense_date)}
                    </p>
                  </div>
                </div>

                {/* Right: Amount & Status Badge */}
                <div className="text-right shrink-0 ml-3 flex flex-col items-end" style={{ overflow: 'visible' }}>
                  <span 
                    className="text-sm font-extrabold text-slate-900 block whitespace-nowrap"
                    style={{ lineHeight: '1.4' }}
                  >
                    {formatINR(item.amount)}
                  </span>
                  <div className="mt-1" style={{ overflow: 'visible' }}>
                    {isCompleted ? (
                      <span 
                        className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D1FAE5] text-[#059669]"
                        style={{ lineHeight: '1.4' }}
                      >
                        Completed
                      </span>
                    ) : (
                      <span 
                        className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF3C7] text-[#D97706]"
                        style={{ lineHeight: '1.4' }}
                      >
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

      {/* Bottom Action Buttons matching Image 1 */}
      {showActionButtons && (
        <div className="pt-2 flex items-center gap-2.5" style={{ overflow: 'visible' }}>
          <button
            type="button"
            onClick={onExportClick}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#EBF5FE] hover:bg-[#D9EDFE] text-[#2F80ED] text-xs font-bold transition-all border border-[#D0E8FF]"
            style={{ boxSizing: 'border-box' }}
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>

          <button
            type="button"
            onClick={onWhatsAppClick}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#00B074] hover:bg-[#009B66] text-white text-xs font-bold transition-all shadow-xs"
            style={{ boxSizing: 'border-box' }}
          >
            <Share2 className="w-4 h-4" />
            <span>Share on WhatsApp</span>
          </button>
        </div>
      )}
    </div>
  );
});

ReportReceiptCard.displayName = 'ReportReceiptCard';
