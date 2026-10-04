import React, { forwardRef, useMemo } from 'react';
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
  const calculatedTotal = totalExpenses || expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const calculatedCount = totalEntries || expenses.length;
  
  const totalPaidCount = expenses.filter(e => (e.payment_status || 'Paid').toLowerCase() === 'paid' || e.payment_status === 'पूर्ण').length;
  const totalPendingCount = expenses.length - totalPaidCount;

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  // Chunk expenses into pages of 10 items each
  const PAGE_SIZE = 10;
  const pages = useMemo(() => {
    if (!expenses || expenses.length === 0) return [[]];
    const result = [];
    for (let i = 0; i < expenses.length; i += PAGE_SIZE) {
      result.push(expenses.slice(i, i + PAGE_SIZE));
    }
    return result;
  }, [expenses]);

  const totalPages = pages.length;

  return (
    <div
      ref={ref}
      className="receipt-capture-root w-full flex flex-col items-center gap-6"
      style={{
        boxSizing: 'border-box',
        width: '100%',
        maxWidth: '680px',
        margin: '0 auto',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif'
      }}
    >
      {pages.map((pageExpenses, pageIndex) => {
        const startIdx = pageIndex * PAGE_SIZE;
        const pagePaidCount = pageExpenses.filter(e => (e.payment_status || 'Paid').toLowerCase() === 'paid' || e.payment_status === 'पूर्ण').length;
        const pagePendingCount = pageExpenses.length - pagePaidCount;
        const pageTotal = pageExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

        return (
          <div
            key={`page-${pageIndex}`}
            className="receipt-page w-full bg-white rounded-2xl p-4 sm:p-6 shadow-md border border-slate-300 flex flex-col font-sans text-slate-800 shrink-0"
            style={{
              boxSizing: 'border-box',
              width: '100%',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              position: 'relative'
            }}
          >
            {/* Official Header */}
            <div className="pb-3.5 mb-3.5 border-b-2 border-slate-800 flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                    🏠
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-tight truncate">
                      Home | Expenses
                    </h2>
                    <p className="text-[10.5px] sm:text-[11px] text-slate-500 font-semibold truncate">
                      बांधकाम खर्च पावती अहवाल (Construction Expense Slip)
                    </p>
                  </div>
                </div>
                <div className="text-[11px] text-slate-600 font-medium pt-0.5 truncate">
                  <span className="font-bold text-slate-800">प्रकल्प (Project):</span> {projectName}
                </div>
              </div>

              <div className="text-right space-y-1 shrink-0">
                <svg width="130" height="24" viewBox="0 0 130 24" className="status-badge" style={{ display: 'block', marginLeft: 'auto' }}>
                  <rect x="0.5" y="0.5" width="129" height="23" rx="6" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="1" />
                  <g transform="translate(6, 4.5)">
                    <path d="M6 1L1 3.2V7.5C1 11.2 6 14.5 6 14.5C6 14.5 11 11.2 11 7.5V3.2L6 1Z" fill="#10B981" stroke="#059669" strokeWidth="0.8"/>
                    <path d="M4 7.5L5.5 9L8.5 5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </g>
                  <text x="72" y="12.5" dominantBaseline="central" textAnchor="middle" fill="#065F46" fontSize="9" fontWeight="700" fontFamily="Inter, system-ui, -apple-system, sans-serif">Verified Statement</text>
                </svg>
                
                <div className="flex items-center justify-end gap-1.5 text-[10px] text-slate-500 font-medium pt-0.5">
                  <span>तारीख: <strong className="text-slate-700">{currentDate}</strong></span>
                  {totalPages > 1 && (
                    <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold text-[9.5px]">
                      पृष्ठ {pageIndex + 1}/{totalPages}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Summary Highlight Box */}
            <div className="grid grid-cols-3 gap-2 p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200 mb-3.5 items-center">
              {/* Total Spent */}
              <div className="space-y-0.5 min-w-0">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase text-slate-500 tracking-wider block truncate">
                  एकूण खर्च (Total)
                </span>
                <span className="text-xs sm:text-base font-extrabold text-slate-900 block truncate">
                  {formatINR(calculatedTotal)}
                </span>
              </div>

              {/* Total Entries & Page info */}
              <div className="space-y-0.5 border-x border-slate-200 px-2 min-w-0 text-center sm:text-left">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase text-slate-500 tracking-wider block truncate">
                  {totalPages > 1 ? `नोंदी (${startIdx + 1}-${startIdx + pageExpenses.length})` : 'एकूण नोंदी'}
                </span>
                <span className="text-xs sm:text-base font-extrabold text-slate-900 block truncate">
                  {calculatedCount} नोंदी {totalPages > 1 ? `(P.${pageIndex + 1})` : ''}
                </span>
              </div>

              {/* Status Breakdown */}
              <div className="space-y-0.5 text-right min-w-0">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase text-slate-500 tracking-wider block truncate">
                  पेमेंट स्थिती
                </span>
                <div className="flex items-center justify-end gap-1 pt-0.5 flex-wrap sm:flex-nowrap">
                  <svg width="58" height="19" viewBox="0 0 58 19" className="status-badge" style={{ display: 'block', margin: 0 }}>
                    <rect x="0.5" y="0.5" width="57" height="18" rx="4.5" fill="#D1FAE5" stroke="#A7F3D0" strokeWidth="1" />
                    <text x="29" y="9.5" dominantBaseline="central" textAnchor="middle" fill="#065F46" fontSize="8" fontWeight="700" fontFamily="Inter, system-ui, -apple-system, sans-serif">✓ {totalPaidCount} पूर्ण</text>
                  </svg>
                  {totalPendingCount > 0 && (
                    <svg width="58" height="19" viewBox="0 0 58 19" className="status-badge" style={{ display: 'block', margin: 0 }}>
                      <rect x="0.5" y="0.5" width="57" height="18" rx="4.5" fill="#FEF3C7" stroke="#FDE68A" strokeWidth="1" />
                      <text x="29" y="9.5" dominantBaseline="central" textAnchor="middle" fill="#92400E" fontSize="8" fontWeight="700" fontFamily="Inter, system-ui, -apple-system, sans-serif">⏳ {totalPendingCount} बाकी</text>
                    </svg>
                  )}
                </div>
              </div>
            </div>

            {/* Professional Statement Table */}
            <div className="w-full overflow-x-auto rounded-xl border border-slate-200 mb-3.5">
              <table className="w-full text-left border-collapse min-w-[480px] sm:min-w-full" style={{ width: '100%', boxSizing: 'border-box' }}>
                <thead>
                  <tr className="bg-slate-900 text-white text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider">
                    <th className="py-2 px-2.5 w-8 text-center align-middle" style={{ verticalAlign: 'middle', textAlign: 'center' }}>#</th>
                    <th className="py-2 px-2.5 align-middle" style={{ verticalAlign: 'middle' }}>खर्चाचा तपशील (ITEM DETAILS)</th>
                    <th className="py-2 px-2.5 w-20 sm:w-24 text-center align-middle" style={{ verticalAlign: 'middle', textAlign: 'center' }}>दिनांक</th>
                    <th className="py-2 px-2.5 w-24 sm:w-28 text-right align-middle" style={{ verticalAlign: 'middle', textAlign: 'right' }}>रक्कम (AMOUNT)</th>
                    <th className="py-2 px-2.5 w-16 sm:w-20 text-center align-middle" style={{ verticalAlign: 'middle', textAlign: 'center' }}>स्थिती</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs text-slate-800">
                  {pageExpenses.length > 0 ? (
                    pageExpenses.map((item, idx) => {
                      const globalIdx = startIdx + idx + 1;
                      const engLabel = getCategoryEnglishLabel(item.category_name);
                      const isCompleted = (item.payment_status || 'Paid').toLowerCase() === 'paid' || item.payment_status === 'पूर्ण';
                      const itemDesc = item.description && item.description.trim() !== '-' ? item.description.trim() : null;
                      const isEven = idx % 2 === 0;

                      return (
                        <tr 
                          key={item.id || `${pageIndex}-${idx}`}
                          className={`${isEven ? 'bg-white' : 'bg-slate-50/70'} hover:bg-slate-100/60 transition-colors`}
                        >
                          {/* Sequential Index across all pages */}
                          <td className="py-2 px-2.5 text-center text-[11px] font-semibold text-slate-400 align-middle" style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                            {globalIdx}
                          </td>

                          {/* Category & Description */}
                          <td className="py-2 px-2.5 min-w-0 align-middle" style={{ verticalAlign: 'middle' }}>
                            <div className="font-bold text-slate-900 text-[11.5px] sm:text-xs" style={{ lineHeight: '1.4' }}>
                              {item.category_name} {engLabel && !item.category_name.includes(engLabel) ? `(${engLabel})` : ''}
                            </div>
                            {itemDesc && (
                              <div 
                                className="text-[10.5px] sm:text-[11px] text-slate-500 font-normal mt-0.5"
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
                          <td className="py-2 px-2.5 text-center text-[10.5px] sm:text-[11px] text-slate-600 font-medium whitespace-nowrap align-middle" style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                            {formatReceiptDate(item.expense_date)}
                          </td>

                          {/* Amount */}
                          <td className="py-2 px-2.5 text-right font-extrabold text-slate-900 text-xs sm:text-sm whitespace-nowrap align-middle" style={{ verticalAlign: 'middle', textAlign: 'right' }}>
                            {formatINR(item.amount)}
                          </td>

                          {/* Payment Status */}
                          <td 
                            className="py-2 px-2.5 whitespace-nowrap align-middle" 
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
                                <svg width="50" height="19" viewBox="0 0 50 19" className="status-badge shrink-0" style={{ display: 'block', margin: 0 }}>
                                  <rect x="0.5" y="0.5" width="49" height="18" rx="4.5" fill="#D1FAE5" stroke="#A7F3D0" strokeWidth="1" />
                                  <text x="25" y="9.5" dominantBaseline="central" textAnchor="middle" fill="#065F46" fontSize="8" fontWeight="700" fontFamily="Inter, system-ui, -apple-system, sans-serif">✓ पूर्ण</text>
                                </svg>
                              ) : (
                                <svg width="50" height="19" viewBox="0 0 50 19" className="status-badge shrink-0" style={{ display: 'block', margin: 0 }}>
                                  <rect x="0.5" y="0.5" width="49" height="18" rx="4.5" fill="#FEF3C7" stroke="#FDE68A" strokeWidth="1" />
                                  <text x="25" y="9.5" dominantBaseline="central" textAnchor="middle" fill="#92400E" fontSize="8" fontWeight="700" fontFamily="Inter, system-ui, -apple-system, sans-serif">बाकी</text>
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
              className="grand-total-bar w-full bg-slate-900 text-white rounded-xl mb-3.5 shadow-xs"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 14px',
                margin: '0 0 14px 0'
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
                <Receipt className="w-4 h-4 text-emerald-400 shrink-0" style={{ display: 'block', margin: 0 }} />
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
                  {totalPages > 1 ? `एकूण रक्कम (GRAND TOTAL - ${calculatedCount} नोंदी)` : 'एकूण रक्कम (GRAND TOTAL)'}
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
                  className="text-sm sm:text-base font-extrabold text-emerald-400 tracking-tight"
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
            <div className="pt-2.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[9.5px] sm:text-[10px] text-slate-400 font-medium gap-1">
              <span>✓ हे डिजिटल जनरेट केलेले अधिकृत पावती स्टेटमेंट आहे.</span>
              <span className="font-semibold text-slate-500">
                Home | Expenses • Track & Build {totalPages > 1 ? `• पृष्ठ ${pageIndex + 1} / ${totalPages}` : ''}
              </span>
            </div>
          </div>
        );
      })}

      {/* Optional action buttons */}
      {showActionButtons && (
        <div className="w-full pt-2 flex items-center gap-2">
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

