import React, { forwardRef } from 'react';
import { 
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Printer,
  Receipt,
  Scale,
  Share2,
  ShieldCheck
} from 'lucide-react';
import { formatINR } from '../../utils/marathiCurrency';
import { getCategoryEnglishLabel } from '../../utils/bilingualSearch';

// Helper to format receipt dates
function formatReceiptDate(dateStr) {
  if (!dateStr) return '-';
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
  
  const paidCount = displayExpenses.filter(e => (e.payment_status || 'Paid').toLowerCase() === 'paid' || e.payment_status === 'पूर्ण').length;
  const pendingCount = displayExpenses.length - paidCount;

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div
      ref={ref}
      className="receipt-capture-root w-full mx-auto bg-white rounded-2xl p-5 sm:p-7 shadow-lg border border-slate-300 flex flex-col font-sans text-slate-800 h-auto shrink-0"
      style={{
        boxSizing: 'border-box',
        width: '100%',
        height: 'auto',
        minHeight: 'fit-content',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif'
      }}
    >
      {/* Official Header */}
      <div className="pb-4 mb-4 border-b-2 border-slate-800 flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              🏠
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-tight">
                Home | Expenses
              </h2>
              <p className="text-[11px] text-slate-500 font-semibold">
                बांधकाम खर्च पावती अहवाल (Construction Expense Slip)
              </p>
            </div>
          </div>
          <div className="text-[11px] text-slate-600 font-medium pt-1">
            <span className="font-bold text-slate-800">प्रकल्प (Project):</span> {projectName}
          </div>
        </div>

        <div className="text-right space-y-1 shrink-0">
          <svg width="134" height="24" viewBox="0 0 134 24" className="status-badge" style={{ display: 'block', marginLeft: 'auto' }}>
            <rect x="0.5" y="0.5" width="133" height="23" rx="6" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="1" />
            <g transform="translate(8, 4.5)">
              <path d="M6 1L1 3.2V7.5C1 11.2 6 14.5 6 14.5C6 14.5 11 11.2 11 7.5V3.2L6 1Z" fill="#10B981" stroke="#059669" strokeWidth="0.8"/>
              <path d="M4 7.5L5.5 9L8.5 5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </g>
            <text x="75" y="12.5" dominantBaseline="central" textAnchor="middle" fill="#065F46" fontSize="9.5" fontWeight="700" fontFamily="Inter, system-ui, -apple-system, sans-serif">Verified Statement</text>
          </svg>
          <p className="text-[10px] text-slate-500 font-medium pt-0.5">
            तारीख: <span className="font-semibold text-slate-700">{currentDate}</span>
          </p>
        </div>
      </div>

      {/* Summary Highlight Box */}
      <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 mb-4 items-center">
        {/* Total Spent */}
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
            एकूण खर्च (Total)
          </span>
          <span className="text-sm sm:text-base font-extrabold text-slate-900 block truncate">
            {formatINR(calculatedTotal)}
          </span>
        </div>

        {/* Total Entries */}
        <div className="space-y-0.5 border-x border-slate-200 px-2.5">
          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
            एकूण नोंदी (Entries)
          </span>
          <span className="text-sm sm:text-base font-extrabold text-slate-900 block">
            {calculatedCount} नोंदी
          </span>
        </div>

        {/* Status Breakdown */}
        <div className="space-y-0.5 text-right">
          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
            पेमेंट स्थिती
          </span>
          <div className="flex items-center justify-end gap-1.5 pt-0.5">
            <svg width="64" height="20" viewBox="0 0 64 20" className="status-badge" style={{ display: 'block', margin: 0 }}>
              <rect x="0.5" y="0.5" width="63" height="19" rx="5" fill="#D1FAE5" stroke="#A7F3D0" strokeWidth="1" />
              <text x="32" y="10" dominantBaseline="central" textAnchor="middle" fill="#065F46" fontSize="8.5" fontWeight="700" fontFamily="Inter, system-ui, -apple-system, sans-serif">✓ {paidCount} पूर्ण</text>
            </svg>
            {pendingCount > 0 && (
              <svg width="64" height="20" viewBox="0 0 64 20" className="status-badge" style={{ display: 'block', margin: 0 }}>
                <rect x="0.5" y="0.5" width="63" height="19" rx="5" fill="#FEF3C7" stroke="#FDE68A" strokeWidth="1" />
                <text x="32" y="10" dominantBaseline="central" textAnchor="middle" fill="#92400E" fontSize="8.5" fontWeight="700" fontFamily="Inter, system-ui, -apple-system, sans-serif">⏳ {pendingCount} बाकी</text>
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* Professional Statement Table */}
      <div className="w-full overflow-hidden rounded-xl border border-slate-200 mb-4">
        <table className="w-full text-left border-collapse" style={{ width: '100%', boxSizing: 'border-box' }}>
          <thead>
            <tr className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider">
              <th className="py-2 px-3 w-8 text-center align-middle" style={{ verticalAlign: 'middle', textAlign: 'center' }}>#</th>
              <th className="py-2 px-3 align-middle" style={{ verticalAlign: 'middle' }}>खर्चाचा तपशील (ITEM DETAILS)</th>
              <th className="py-2 px-3 w-24 text-center align-middle" style={{ verticalAlign: 'middle', textAlign: 'center' }}>दिनांक</th>
              <th className="py-2 px-3 w-28 text-right align-middle" style={{ verticalAlign: 'middle', textAlign: 'right' }}>रक्कम (AMOUNT)</th>
              <th className="py-2 px-3 w-20 text-center align-middle" style={{ verticalAlign: 'middle', textAlign: 'center' }}>स्थिती</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs text-slate-800">
            {displayExpenses.length > 0 ? (
              displayExpenses.map((item, idx) => {
                const engLabel = getCategoryEnglishLabel(item.category_name);
                const isCompleted = (item.payment_status || 'Paid').toLowerCase() === 'paid' || item.payment_status === 'पूर्ण';
                const itemDesc = item.description && item.description.trim() !== '-' ? item.description.trim() : null;
                const isEven = idx % 2 === 0;

                return (
                  <tr 
                    key={item.id || idx}
                    className={`${isEven ? 'bg-white' : 'bg-slate-50/70'} hover:bg-slate-100/60 transition-colors`}
                  >
                    {/* Index */}
                    <td className="py-2.5 px-3 text-center text-[11px] font-semibold text-slate-400 align-middle" style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                      {idx + 1}
                    </td>

                    {/* Category & Description */}
                    <td className="py-2.5 px-3 min-w-0 align-middle" style={{ verticalAlign: 'middle' }}>
                      <div className="font-bold text-slate-900 text-xs" style={{ lineHeight: '1.4' }}>
                        {item.category_name} {engLabel && !item.category_name.includes(engLabel) ? `(${engLabel})` : ''}
                      </div>
                      {itemDesc && (
                        <div 
                          className="text-[11px] text-slate-500 font-normal mt-0.5"
                          style={{
                            lineHeight: '1.4',
                            overflow: 'visible',
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                            paddingBottom: '2px'
                          }}
                        >
                          {itemDesc}
                        </div>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-2.5 px-3 text-center text-[11px] text-slate-600 font-medium whitespace-nowrap align-middle" style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                      {formatReceiptDate(item.expense_date)}
                    </td>

                    {/* Amount */}
                    <td className="py-2.5 px-3 text-right font-extrabold text-slate-900 text-xs sm:text-sm whitespace-nowrap align-middle" style={{ verticalAlign: 'middle', textAlign: 'right' }}>
                      {formatINR(item.amount)}
                    </td>

                    {/* Payment Status */}
                    <td 
                      className="py-2.5 px-3 whitespace-nowrap align-middle" 
                      style={{ 
                        verticalAlign: 'middle',
                        textAlign: 'center'
                      }}
                    >
                      <div 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '100%',
                          height: '100%'
                        }}
                      >
                        {isCompleted ? (
                          <svg width="54" height="20" viewBox="0 0 54 20" className="status-badge shrink-0" style={{ display: 'block', margin: 0 }}>
                            <rect x="0.5" y="0.5" width="53" height="19" rx="5" fill="#D1FAE5" stroke="#A7F3D0" strokeWidth="1" />
                            <text x="27" y="10" dominantBaseline="central" textAnchor="middle" fill="#065F46" fontSize="8.5" fontWeight="700" fontFamily="Inter, system-ui, -apple-system, sans-serif">✓ पूर्ण</text>
                          </svg>
                        ) : (
                          <svg width="54" height="20" viewBox="0 0 54 20" className="status-badge shrink-0" style={{ display: 'block', margin: 0 }}>
                            <rect x="0.5" y="0.5" width="53" height="19" rx="5" fill="#FEF3C7" stroke="#FDE68A" strokeWidth="1" />
                            <text x="27" y="10" dominantBaseline="central" textAnchor="middle" fill="#92400E" fontSize="8.5" fontWeight="700" fontFamily="Inter, system-ui, -apple-system, sans-serif">बाकी</text>
                          </svg>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="py-8 text-center text-xs text-slate-400 align-middle" style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                  कोणताही खर्च उपलब्ध नाही
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Grand Total Calculation Row */}
      <div 
        className="grand-total-bar w-full bg-slate-900 text-white rounded-xl mb-4 shadow-xs"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          boxSizing: 'border-box',
          padding: '12px 16px',
          margin: '0 0 16px 0'
        }}
      >
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: 0,
            padding: 0
          }}
        >
          <Receipt className="w-4.5 h-4.5 text-emerald-400 shrink-0" style={{ display: 'block', margin: 0 }} />
          <span 
            className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-100"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              lineHeight: '1',
              margin: 0,
              padding: 0
            }}
          >
            एकूण रक्कम (GRAND TOTAL)
          </span>
        </div>

        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            marginLeft: 'auto',
            marginRight: 0,
            padding: 0
          }}
        >
          <span 
            className="text-base sm:text-lg font-extrabold text-emerald-400 tracking-tight"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              lineHeight: '1',
              margin: 0,
              padding: 0
            }}
          >
            {formatINR(calculatedTotal)}
          </span>
        </div>
      </div>

      {/* Official Footer Verification */}
      <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 font-medium gap-1">
        <span>✓ हे डिजिटल जनरेट केलेले अधिकृत पावती स्टेटमेंट आहे.</span>
        <span>Home | Expenses • Track & Build</span>
      </div>

      {/* Optional action buttons */}
      {showActionButtons && (
        <div className="pt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={onExportClick}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#EBF5FE] hover:bg-[#D9EDFE] text-[#2F80ED] text-xs font-bold transition-all border border-[#D0E8FF]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          <button
            type="button"
            onClick={onWhatsAppClick}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#00B074] hover:bg-[#009B66] text-white text-xs font-bold transition-all shadow-xs"
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
