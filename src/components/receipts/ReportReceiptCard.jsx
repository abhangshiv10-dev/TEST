import React, { forwardRef } from 'react';
import { 
  Scale, 
  FileText, 
  Package, 
  Truck, 
  Layers, 
  Palette, 
  Zap, 
  Wrench, 
  DoorClosed, 
  Grid, 
  HardHat, 
  MoreHorizontal,
  Download,
  Share2
} from 'lucide-react';
import { formatINR } from '../../utils/marathiCurrency';
import { getCategoryEnglishLabel } from '../../utils/bilingualSearch';

// Helper to get category icon and color for the report receipt
function getReportCategoryIcon(name = '') {
  const cat = (name || '').toLowerCase();
  if (cat.includes('सिमेंट') || cat.includes('cement')) {
    return { icon: Package, bg: 'bg-[#EBF5FE]', text: 'text-[#2F80ED]' };
  }
  if (cat.includes('वाळू') || cat.includes('sand')) {
    return { icon: Layers, bg: 'bg-[#FFF4EB]', text: 'text-[#F2994A]' };
  }
  if (cat.includes('मजुरी') || cat.includes('कामगार') || cat.includes('labour') || cat.includes('labor')) {
    return { icon: HardHat, bg: 'bg-[#FFEBEF]', text: 'text-[#EB5757]' };
  }
  if (cat.includes('स्टील') || cat.includes('steel') || cat.includes('लोखंड')) {
    return { icon: Layers, bg: 'bg-[#EFEFFA]', text: 'text-[#6C5CE7]' };
  }
  if (cat.includes('विट') || cat.includes('brick') || cat.includes('ब्लॉक')) {
    return { icon: Grid, bg: 'bg-[#FFEFEF]', text: 'text-[#EB5757]' };
  }
  if (cat.includes('वाहतूक') || cat.includes('transport') || cat.includes('jcb') || cat.includes('जेसीबी')) {
    return { icon: Truck, bg: 'bg-[#E8F7FA]', text: 'text-[#2D9CDB]' };
  }
  if (cat.includes('पेंट') || cat.includes('रंग') || cat.includes('paint')) {
    return { icon: Palette, bg: 'bg-[#FCE7F3]', text: 'text-[#DB2777]' };
  }
  if (cat.includes('वीज') || cat.includes('electric')) {
    return { icon: Zap, bg: 'bg-[#FEF9C3]', text: 'text-[#CA8A04]' };
  }
  if (cat.includes('प्लंबिंग') || cat.includes('plumb')) {
    return { icon: Wrench, bg: 'bg-[#DBEAFE]', text: 'text-[#2563EB]' };
  }
  if (cat.includes('दरवाजे') || cat.includes('door')) {
    return { icon: DoorClosed, bg: 'bg-[#D1FAE5]', text: 'text-[#059669]' };
  }
  return { icon: MoreHorizontal, bg: 'bg-[#F0F4F8]', text: 'text-[#5A6E85]' };
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
  projectName = 'माझ्या घराचे बांधकाम',
  onExportClick,
  onWhatsAppClick,
  showActionButtons = false
}, ref) => {
  // Max 10 entries as requested
  const displayExpenses = expenses.slice(0, 10);
  const calculatedTotal = totalExpenses || displayExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const calculatedCount = totalEntries || expenses.length;

  return (
    <div
      ref={ref}
      className="receipt-capture-root w-[340px] sm:w-[350px] mx-auto bg-white rounded-3xl p-4 shadow-xl border border-slate-100 flex flex-col font-sans text-slate-800"
      style={{
        boxSizing: 'border-box',
        width: '348px',
        backgroundColor: '#ffffff',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif'
      }}
    >
      {/* Top 2 Summary Metric Cards (Sky Blue & Mint Green) */}
      <div className="grid grid-cols-2 gap-2.5 mb-3" style={{ overflow: 'visible' }}>
        {/* Metric 1: Total Expenses */}
        <div 
          className="bg-[#E8F4FD] rounded-2xl p-3 flex items-center gap-2.5 border border-[#D0E8FF]/60"
          style={{ minHeight: '64px', boxSizing: 'border-box', overflow: 'visible' }}
        >
          <div className="w-8 h-8 rounded-xl bg-[#2F80ED] text-white flex items-center justify-center shadow-xs shrink-0">
            <Scale className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex flex-col justify-center" style={{ overflow: 'visible' }}>
            <span 
              className="text-[10px] text-[#64748B] font-semibold block whitespace-nowrap"
              style={{ lineHeight: '1.4', marginBottom: '1px' }}
            >
              Total Expenses
            </span>
            <span 
              className="text-sm font-black text-slate-900 block whitespace-nowrap"
              style={{ lineHeight: '1.4' }}
            >
              {formatINR(calculatedTotal)}
            </span>
          </div>
        </div>

        {/* Metric 2: Total Entries */}
        <div 
          className="bg-[#E8F8F0] rounded-2xl p-3 flex items-center gap-2.5 border border-[#C6F6D5]/60"
          style={{ minHeight: '64px', boxSizing: 'border-box', overflow: 'visible' }}
        >
          <div className="w-8 h-8 rounded-xl bg-[#10B981] text-white flex items-center justify-center shadow-xs shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex flex-col justify-center" style={{ overflow: 'visible' }}>
            <span 
              className="text-[10px] text-[#64748B] font-semibold block whitespace-nowrap"
              style={{ lineHeight: '1.4', marginBottom: '1px' }}
            >
              Total Entries
            </span>
            <span 
              className="text-sm font-black text-slate-900 block whitespace-nowrap"
              style={{ lineHeight: '1.4' }}
            >
              {calculatedCount}
            </span>
          </div>
        </div>
      </div>

      {/* Perfect Expense List (Up to 10 items) */}
      <div className="space-y-2 mb-3" style={{ overflow: 'visible' }}>
        {displayExpenses.length > 0 ? (
          displayExpenses.map((item, idx) => {
            const { icon: CategoryIcon, bg: iconBg, text: iconText } = getReportCategoryIcon(item.category_name);
            const engLabel = getCategoryEnglishLabel(item.category_name);
            const isCompleted = (item.payment_status || 'Paid').toLowerCase() === 'paid' || item.payment_status === 'पूर्ण';

            return (
              <div
                key={item.id || idx}
                className="flex items-center justify-between p-2.5 px-3 rounded-2xl bg-white hover:bg-slate-50/80 transition-colors border border-slate-100 shadow-2xs"
                style={{ minHeight: '56px', boxSizing: 'border-box', overflow: 'visible' }}
              >
                {/* Left: Category Icon & Details */}
                <div className="flex items-center gap-3 min-w-0" style={{ overflow: 'visible' }}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${iconBg} ${iconText}`}>
                    <CategoryIcon className="w-4 h-4" />
                  </div>

                  <div className="min-w-0" style={{ overflow: 'visible' }}>
                    <h4 
                      className="text-xs font-bold text-slate-900 block"
                      style={{ lineHeight: '1.4', margin: 0, padding: '1px 0' }}
                    >
                      {item.category_name} {engLabel && !item.category_name.includes(engLabel) ? `(${engLabel})` : ''}
                    </h4>
                    <p 
                      className="text-[10px] text-slate-500 font-medium"
                      style={{ lineHeight: '1.4', margin: 0, padding: 0 }}
                    >
                      {item.description || item.unit || '-'}
                    </p>
                    <p 
                      className="text-[9px] text-slate-400 font-normal"
                      style={{ lineHeight: '1.3', margin: 0, padding: 0 }}
                    >
                      {formatReceiptDate(item.expense_date)}
                    </p>
                  </div>
                </div>

                {/* Right: Amount & Status Badge */}
                <div className="text-right shrink-0 ml-3 flex flex-col items-end" style={{ overflow: 'visible' }}>
                  <span 
                    className="text-xs sm:text-sm font-black text-slate-900 block whitespace-nowrap"
                    style={{ lineHeight: '1.4' }}
                  >
                    {formatINR(item.amount)}
                  </span>
                  <div className="mt-0.5" style={{ overflow: 'visible' }}>
                    {isCompleted ? (
                      <span 
                        className="inline-block px-1.5 py-[1px] rounded-full text-[8px] font-bold bg-[#E6F9EE] text-[#059669] border border-[#A7F3D0]/70"
                        style={{ lineHeight: '1.2' }}
                      >
                        Completed
                      </span>
                    ) : (
                      <span 
                        className="inline-block px-1.5 py-[1px] rounded-full text-[8px] font-bold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]/70"
                        style={{ lineHeight: '1.2' }}
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

      {/* Subtle Footer */}
      <div 
        className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400 font-medium"
        style={{ overflow: 'visible', lineHeight: '1.4' }}
      >
        <span>🏠 {projectName}</span>
        <span>Generated Receipt Report</span>
      </div>

      {/* Optional action buttons */}
      {showActionButtons && (
        <div className="pt-2 flex items-center gap-2" style={{ overflow: 'visible' }}>
          <button
            type="button"
            onClick={onExportClick}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#EBF5FE] hover:bg-[#D9EDFE] text-[#2F80ED] text-[11px] font-bold transition-all border border-[#D0E8FF]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          <button
            type="button"
            onClick={onWhatsAppClick}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#00B074] hover:bg-[#009B66] text-white text-[11px] font-bold transition-all shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share on WhatsApp</span>
          </button>
        </div>
      )}
    </div>
  );
});

ReportReceiptCard.displayName = 'ReportReceiptCard';
