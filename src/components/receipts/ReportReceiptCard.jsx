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
import AppLogo from '../common/AppLogo';
import { useLanguage } from '../../i18n/LanguageContext';
import { isPaidStatus } from '../../utils/paymentStatus';

// Badge width follows the text length, so longer words (Marathi or English) never get clipped
const badgeWidth = (text, min) => Math.max(min, Math.ceil(String(text).length * 5.4 + 16));

export const ReportReceiptCard = forwardRef(({
  expenses = [],
  totalExpenses = 0,
  totalEntries = 0,
  projectName,
  filterLabel,
  onExportClick,
  onWhatsAppClick,
  showActionButtons = false
}, ref) => {
  const { t, catLabel, fmtShortDate } = useLanguage();
  const formatReceiptDate = (d) => (d ? fmtShortDate(d) : '-');
  const shownProject = projectName || t('app.defaultProject');
  const shownFilter = filterLabel ?? t('receipt.report.allEntries');
  // Show ALL entries in the slip (no row limit)
  const displayExpenses = expenses;
  const calculatedTotal = totalExpenses || displayExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const calculatedCount = totalEntries || expenses.length;
  
  const paidCount = displayExpenses.filter(e => isPaidStatus(e.payment_status)).length;
  const pendingCount = displayExpenses.length - paidCount;

  const currentDate = fmtShortDate(new Date());
  const paidBadgeText = `✓ ${paidCount} ${t('status.paid')}`;
  const pendingBadgeText = `⏳ ${pendingCount} ${t('status.pending')}`;

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
            <AppLogo className="w-9 h-9" rounded="rounded-lg" />
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-tight">
                {t('app.name')}
              </h2>
              <p className="text-[11px] text-slate-500 font-semibold">
                {t('receipt.report.slipTitle')}
              </p>
            </div>
          </div>
          <div className="text-[11px] text-slate-600 font-medium pt-1">
            <span className="font-bold text-slate-800">{t('receipt.report.project')}</span> {shownProject}
          </div>
        </div>

        <div className="text-right space-y-1 shrink-0">
          <svg width="134" height="24" viewBox="0 0 134 24" className="status-badge" style={{ display: 'block', marginLeft: 'auto' }}>
            <rect x="0.5" y="0.5" width="133" height="23" rx="2" fill="#ECFDF5" stroke="#A7F3D0" strokeWidth="1" />
            <g transform="translate(8, 4.5)">
              <path d="M6 1L1 3.2V7.5C1 11.2 6 14.5 6 14.5C6 14.5 11 11.2 11 7.5V3.2L6 1Z" fill="#10B981" stroke="#059669" strokeWidth="0.8"/>
              <path d="M4 7.5L5.5 9L8.5 5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </g>
            <text x="75" y="12.5" dominantBaseline="central" textAnchor="middle" fill="#065F46" fontSize="9.5" fontWeight="700" fontFamily="Inter, system-ui, -apple-system, sans-serif">{t('receipt.report.verifiedStatement')}</text>
          </svg>
          <p className="text-[10px] text-slate-500 font-medium pt-0.5">
            {t('receipt.report.dateLabel')} <span className="font-semibold text-slate-700">{currentDate}</span>
          </p>
        </div>
      </div>

      {/* Summary Highlight Box */}
      <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 mb-4 items-center">
        {/* Total Spent */}
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
            {t('receipt.report.total')}
          </span>
          <span className="text-sm sm:text-base font-extrabold text-slate-900 block truncate">
            {formatINR(calculatedTotal)}
          </span>
        </div>

        {/* Total Entries */}
        <div className="space-y-0.5 border-x border-slate-200 px-2.5">
          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
            {t('receipt.report.totalEntries')}
          </span>
          <span className="text-sm sm:text-base font-extrabold text-slate-900 block">
            {t('common.entries', { count: calculatedCount })}
          </span>
        </div>

        {/* Status Breakdown */}
        <div className="space-y-0.5 text-right">
          <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
            {t('expenseModal.paymentStatus')}
          </span>
          <div className="flex items-center justify-end gap-1.5 pt-0.5">
            <svg width={badgeWidth(paidBadgeText, 64)} height="20" viewBox={`0 0 ${badgeWidth(paidBadgeText, 64)} 20`} className="status-badge" style={{ display: 'block', margin: 0 }}>
              <rect x="0.5" y="0.5" width={badgeWidth(paidBadgeText, 64) - 1} height="19" rx="2" fill="#D1FAE5" stroke="#A7F3D0" strokeWidth="1" />
              <text x={badgeWidth(paidBadgeText, 64) / 2} y="10" dominantBaseline="central" textAnchor="middle" fill="#065F46" fontSize="8.5" fontWeight="700" fontFamily="Inter, system-ui, -apple-system, sans-serif">{paidBadgeText}</text>
            </svg>
            {pendingCount > 0 && (
              <svg width={badgeWidth(pendingBadgeText, 64)} height="20" viewBox={`0 0 ${badgeWidth(pendingBadgeText, 64)} 20`} className="status-badge" style={{ display: 'block', margin: 0 }}>
                <rect x="0.5" y="0.5" width={badgeWidth(pendingBadgeText, 64) - 1} height="19" rx="2" fill="#FEF3C7" stroke="#FDE68A" strokeWidth="1" />
                <text x={badgeWidth(pendingBadgeText, 64) / 2} y="10" dominantBaseline="central" textAnchor="middle" fill="#92400E" fontSize="8.5" fontWeight="700" fontFamily="Inter, system-ui, -apple-system, sans-serif">{pendingBadgeText}</text>
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
              <th className="rr-desktop py-2 px-3 w-8 text-center align-middle" style={{ verticalAlign: 'middle', textAlign: 'center' }}>#</th>
              <th className="py-2 px-3 align-middle" style={{ verticalAlign: 'middle' }}>{t('receipt.report.colItem')}</th>
              {/* Phone only: price + date share one column */}
              <th className="rr-mobile py-2 px-3 text-right align-middle" style={{ verticalAlign: 'middle', textAlign: 'right' }}>{t('receipt.report.colAmountDate')}</th>
              <th className="rr-desktop py-2 px-3 w-24 text-center align-middle" style={{ verticalAlign: 'middle', textAlign: 'center' }}>{t('receipt.report.colDate')}</th>
              <th className="rr-desktop py-2 px-3 w-28 text-right align-middle" style={{ verticalAlign: 'middle', textAlign: 'right' }}>{t('receipt.report.colAmount')}</th>
              <th className="rr-desktop py-2 px-3 w-20 text-center align-middle" style={{ verticalAlign: 'middle', textAlign: 'center' }}>{t('receipt.report.colStatus')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs text-slate-800">
            {displayExpenses.length > 0 ? (
              displayExpenses.map((item, idx) => {
                const isCompleted = isPaidStatus(item.payment_status);
                const doneText = `✓ ${t('status.paid')}`;
                const itemDesc = item.description && item.description.trim() !== '-' ? item.description.trim() : null;
                const isEven = idx % 2 === 0;

                return (
                  <tr 
                    key={item.id || idx}
                    className={`${isEven ? 'bg-white' : 'bg-slate-50/70'} hover:bg-slate-100/60 transition-colors`}
                  >
                    {/* Index */}
                    <td className="rr-desktop py-2.5 px-3 text-center text-[11px] font-semibold text-slate-400 align-middle" style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                      {idx + 1}
                    </td>

                    {/* Category & Description */}
                    <td className="py-2.5 px-3 min-w-0 align-middle" style={{ verticalAlign: 'middle', wordBreak: 'break-word' }}>
                      <div className="font-bold text-slate-900 text-xs" style={{ lineHeight: '1.4' }}>
                        {catLabel(item.category_name, item.category_name_en)}
                      </div>
                      {itemDesc && (
                        <div 
                          className="text-[11px] text-slate-500 font-normal mt-0.5"
                          style={{
                            lineHeight: '1.4',
                            overflow: 'visible',
                            whiteSpace: 'normal',
                            wordBreak: 'break-word'
                          }}
                        >
                          {itemDesc}
                        </div>
                      )}
                    </td>

                    {/* Phone only: amount on top, date below */}
                    <td className="rr-mobile py-2.5 px-3 text-right whitespace-nowrap align-middle" style={{ verticalAlign: 'middle', textAlign: 'right' }}>
                      <div className="font-extrabold text-slate-900 text-xs" style={{ lineHeight: '1.4' }}>
                        {formatINR(item.amount)}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium mt-0.5" style={{ lineHeight: '1.4' }}>
                        {formatReceiptDate(item.expense_date)}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="rr-desktop py-2.5 px-3 text-center text-[11px] text-slate-600 font-medium whitespace-nowrap align-middle" style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                      {formatReceiptDate(item.expense_date)}
                    </td>

                    {/* Amount */}
                    <td className="rr-desktop py-2.5 px-3 text-right font-extrabold text-slate-900 text-xs sm:text-sm whitespace-nowrap align-middle" style={{ verticalAlign: 'middle', textAlign: 'right' }}>
                      {formatINR(item.amount)}
                    </td>

                    {/* Payment Status */}
                    <td 
                      className="rr-desktop py-2.5 px-3 whitespace-nowrap align-middle" 
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
                          <svg width={badgeWidth(doneText, 54)} height="20" viewBox={`0 0 ${badgeWidth(doneText, 54)} 20`} className="status-badge shrink-0" style={{ display: 'block', margin: 0 }}>
                            <rect x="0.5" y="0.5" width={badgeWidth(doneText, 54) - 1} height="19" rx="2" fill="#D1FAE5" stroke="#A7F3D0" strokeWidth="1" />
                            <text x={badgeWidth(doneText, 54) / 2} y="10" dominantBaseline="central" textAnchor="middle" fill="#065F46" fontSize="8.5" fontWeight="700" fontFamily="Inter, system-ui, -apple-system, sans-serif">{doneText}</text>
                          </svg>
                        ) : (
                          <svg width={badgeWidth(t('status.pending'), 54)} height="20" viewBox={`0 0 ${badgeWidth(t('status.pending'), 54)} 20`} className="status-badge shrink-0" style={{ display: 'block', margin: 0 }}>
                            <rect x="0.5" y="0.5" width={badgeWidth(t('status.pending'), 54) - 1} height="19" rx="2" fill="#FEF3C7" stroke="#FDE68A" strokeWidth="1" />
                            <text x={badgeWidth(t('status.pending'), 54) / 2} y="10" dominantBaseline="central" textAnchor="middle" fill="#92400E" fontSize="8.5" fontWeight="700" fontFamily="Inter, system-ui, -apple-system, sans-serif">{t('status.pending')}</text>
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
                  {t('common.noExpenseAvailable')}
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
            {t('receipt.report.grandTotal')}
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

      {/* Dynamic report summary (shown at the bottom of the exported image) */}
      <div
        className="mb-4 rounded-xl border border-slate-200 bg-slate-50"
        style={{ padding: '12px 16px', boxSizing: 'border-box' }}
      >
        <div className="text-xs sm:text-sm font-extrabold text-slate-900" style={{ lineHeight: '1.5', marginBottom: '6px' }}>
          📊 {t('receipt.report.summaryTitle', { project: shownProject })}
        </div>
        <div className="text-[11px] sm:text-xs text-slate-700 font-medium" style={{ lineHeight: '1.8' }}>
          <div>📅 <span className="font-bold">{t('receipt.report.filter')}</span> {shownFilter}</div>
          <div>💰 <span className="font-bold">{t('receipt.report.totalExpense')}</span> {formatINR(calculatedTotal)}</div>
          <div>📝 <span className="font-bold">{t('receipt.report.entryCount')}</span> {calculatedCount}</div>
        </div>
      </div>

      {/* Official Footer Verification */}
      <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 font-medium gap-1">
        <span>{t('receipt.report.officialNote')}</span>
        <span>{t('receipt.report.footerBrand', { name: t('app.name') })}</span>
      </div>

      {/* Optional action buttons */}
      {showActionButtons && (
        <div className="pt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={onExportClick}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-[2px] bg-[#EBF5FE] hover:bg-[#D9EDFE] text-[#2F80ED] text-xs font-bold transition-all border border-[#D0E8FF]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('receipt.exportBtn')}</span>
          </button>

          <button
            type="button"
            onClick={onWhatsAppClick}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-[2px] bg-[#00B074] hover:bg-[#009B66] text-white text-xs font-bold transition-all shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{t('receipt.shareWhatsApp')}</span>
          </button>
        </div>
      )}
    </div>
  );
});

ReportReceiptCard.displayName = 'ReportReceiptCard';
