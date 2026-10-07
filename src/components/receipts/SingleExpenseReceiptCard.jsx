import React, { forwardRef } from 'react';
import { 
  Home, 
  Leaf, 
  Check, 
  Layers, 
  IndianRupee, 
  Calendar, 
  FileText, 
  Package, 
  Truck, 
  Users, 
  Palette, 
  Zap, 
  Wrench, 
  DoorClosed, 
  Grid, 
  HardHat, 
  Image as ImageIcon,
  Download,
  Share2
} from 'lucide-react';
import { formatINR } from '../../utils/marathiCurrency';
import AppLogo from '../common/AppLogo';
import { useLanguage } from '../../i18n/LanguageContext';
import { isPaidStatus } from '../../utils/paymentStatus';

// Badge width follows the text length, so longer words (Marathi or English) never get clipped
const badgeWidth = (text, min) => Math.max(min, Math.ceil(String(text).length * 5.4 + 16));

// Category icon & theme selector
function getCategoryTheme(name = '') {
  const cat = (name || '').toLowerCase();
  if (cat.includes('सिमेंट') || cat.includes('cement')) {
    return { icon: Package, bg: 'bg-[#E0F2FE]', text: 'text-[#0284C7]', badgeKey: 'receipt.badge.material', fill: '#E0F2FE', stroke: '#BAE6FD', textColor: '#0284C7' };
  }
  if (cat.includes('वाळू') || cat.includes('sand')) {
    return { icon: Layers, bg: 'bg-[#FEF3C7]', text: 'text-[#D97706]', badgeKey: 'receipt.badge.material', fill: '#FEF3C7', stroke: '#FDE68A', textColor: '#D97706' };
  }
  if (cat.includes('मजुरी') || cat.includes('कामगार') || cat.includes('labour') || cat.includes('labor')) {
    return { icon: HardHat, bg: 'bg-[#FFE4E6]', text: 'text-[#E11D48]', badgeKey: 'receipt.badge.labour', fill: '#FFE4E6', stroke: '#FECDD3', textColor: '#E11D48' };
  }
  if (cat.includes('स्टील') || cat.includes('steel') || cat.includes('लोखंड')) {
    return { icon: Layers, bg: 'bg-[#EDE9FE]', text: 'text-[#6366F1]', badgeKey: 'receipt.badge.material', fill: '#EDE9FE', stroke: '#DDD6FE', textColor: '#6366F1' };
  }
  if (cat.includes('विट') || cat.includes('brick') || cat.includes('ब्लॉक')) {
    return { icon: Grid, bg: 'bg-[#FFEDD5]', text: 'text-[#EA580C]', badgeKey: 'receipt.badge.material', fill: '#FFEDD5', stroke: '#FED7AA', textColor: '#EA580C' };
  }
  if (cat.includes('वाहतूक') || cat.includes('transport') || cat.includes('jcb') || cat.includes('जेसीबी')) {
    return { icon: Truck, bg: 'bg-[#CFFAFE]', text: 'text-[#0891B2]', badgeKey: 'receipt.badge.transport', fill: '#CFFAFE', stroke: '#A5F3FC', textColor: '#0891B2' };
  }
  if (cat.includes('पेंट') || cat.includes('रंग') || cat.includes('paint')) {
    return { icon: Palette, bg: 'bg-[#FCE7F3]', text: 'text-[#DB2777]', badgeKey: 'receipt.badge.finishing', fill: '#FCE7F3', stroke: '#FBCFE8', textColor: '#DB2777' };
  }
  if (cat.includes('वीज') || cat.includes('electric')) {
    return { icon: Zap, bg: 'bg-[#FEF9C3]', text: 'text-[#CA8A04]', badgeKey: 'receipt.badge.electrical', fill: '#FEF9C3', stroke: '#FEF08A', textColor: '#CA8A04' };
  }
  if (cat.includes('प्लंबिंग') || cat.includes('plumb')) {
    return { icon: Wrench, bg: 'bg-[#DBEAFE]', text: 'text-[#2563EB]', badgeKey: 'receipt.badge.plumbing', fill: '#DBEAFE', stroke: '#BFDBFE', textColor: '#2563EB' };
  }
  if (cat.includes('दरवाजे') || cat.includes('door')) {
    return { icon: DoorClosed, bg: 'bg-[#D1FAE5]', text: 'text-[#059669]', badgeKey: 'receipt.badge.carpentry', fill: '#D1FAE5', stroke: '#A7F3D0', textColor: '#059669' };
  }
  return { icon: Layers, bg: 'bg-[#F1F5F9]', text: 'text-[#475569]', badgeKey: 'receipt.badge.general', fill: '#F1F5F9', stroke: '#E2E8F0', textColor: '#475569' };
}

export const SingleExpenseReceiptCard = forwardRef(({
  expense = {},
  projectName,
  titleText,
  subtitleText,
  onExportClick,
  onWhatsAppClick,
  showActionButtons = false
}, ref) => {
  const { t, catLabel, fmtShortDate } = useLanguage();
  const catTheme = getCategoryTheme(expense.category_name);
  const categoryName = catLabel(expense.category_name, expense.category_name_en);
  const badgeText = t(catTheme.badgeKey);
  const statusText = isPaidStatus(expense.payment_status) ? `✓ ${t('status.paid')}` : t('status.pending');
  const CatIcon = catTheme.icon;
  const formattedDate = fmtShortDate(expense.expense_date || new Date().toISOString().split('T')[0]);
  const formattedAmount = formatINR(expense.amount || 0);
  const descriptionText = expense.description || expense.unit || '-';
  const photoUrl = expense.receipt_url || expense.photo_url || null;
  const isCompleted = isPaidStatus(expense.payment_status);

  return (
    <div
      ref={ref}
      className="receipt-capture-root w-[340px] sm:w-[350px] mx-auto bg-[#F2FBF6] rounded-[32px] overflow-hidden shadow-xl border border-emerald-100 flex flex-col font-sans text-slate-800"
      style={{
        boxSizing: 'border-box',
        width: '344px',
        backgroundColor: '#F2FBF6',
        borderRadius: '32px',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif'
      }}
    >
      {/* Top Emerald Header */}
      <div 
        className="relative bg-gradient-to-r from-[#059669] via-[#10B981] to-[#0D9488] pt-4 pb-8 px-4 text-white"
        style={{
          borderTopLeftRadius: '31px',
          borderTopRightRadius: '31px',
          borderBottomLeftRadius: '0px',
          borderBottomRightRadius: '56px'
        }}
      >
        <div className="flex items-start justify-between">
          {/* Logo & App Name */}
          <div className="flex items-center gap-2">
            <AppLogo className="w-8 h-8" rounded="rounded-lg" />
            <div className="leading-tight">
              <h3 className="text-xs font-extrabold tracking-tight text-white drop-shadow-xs" style={{ lineHeight: '1.4' }}>{t('receipt.single.brandTop')}</h3>
              <p className="text-[9px] text-emerald-100 font-medium" style={{ lineHeight: '1.4' }}>{t('receipt.single.brandBottom')}</p>
            </div>
          </div>

          {/* Leaf & Tagline */}
          <div className="text-right flex flex-col items-end">
            <div className="flex items-center gap-1 text-emerald-200">
              <Leaf className="w-3 h-3" />
            </div>
            <p className="text-[9px] italic font-serif text-emerald-50/90" style={{ lineHeight: '1.3' }}>
              {t('receipt.single.tagline1')}<br/>{t('receipt.single.tagline2')}
            </p>
          </div>
        </div>
      </div>

      {/* Floating Center Checkmark Badge */}
      <div className="flex flex-col items-center -mt-6 px-4 text-center relative z-10" style={{ overflow: 'visible' }}>
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#059669] to-[#10B981] text-white flex items-center justify-center shadow-lg border-3 border-[#F2FBF6]">
          <Check className="w-6 h-6 stroke-[3]" />
        </div>

        {/* Header Title & Subtitle */}
        <h2 
          className="mt-2 text-sm sm:text-base font-black text-slate-900 tracking-tight"
          style={{ lineHeight: '1.6', margin: '6px 0 0 0', padding: '2px 0' }}
        >
          {titleText ?? t('receipt.single.title')}
        </h2>
        <p 
          className="text-[10px] text-slate-500 font-medium"
          style={{ lineHeight: '1.6', margin: 0, padding: '1px 0' }}
        >
          {subtitleText ?? t('receipt.single.subtitle')}
        </p>
      </div>

      {/* Main 4 Cards Container */}
      <div className="p-3.5 pt-2 space-y-2 pb-3.5" style={{ overflow: 'visible' }}>
        {/* Card 1: खर्चाचा प्रकार (Category) */}
        <div 
          className="bg-white rounded-xl p-2.5 px-3 flex items-center justify-between shadow-2xs border border-emerald-100/60"
          style={{ minHeight: '52px', boxSizing: 'border-box' }}
        >
          <div className="flex items-center gap-2.5 min-w-0" style={{ overflow: 'visible' }}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${catTheme.bg} ${catTheme.text}`}>
              <CatIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0" style={{ overflow: 'visible' }}>
              <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block" style={{ lineHeight: '1.5', paddingBottom: '1px' }}>
                {t('receipt.single.category')}
              </span>
              <span className="text-xs font-bold text-slate-900 block" style={{ lineHeight: '1.5', paddingTop: '1px' }}>
                {categoryName}
              </span>
            </div>
          </div>
          {/* Centered SVG Category Badge */}
          <svg width={badgeWidth(badgeText, 58)} height="18" viewBox={`0 0 ${badgeWidth(badgeText, 58)} 18`} className="status-badge shrink-0" style={{ display: 'block' }}>
            <rect x="0.5" y="0.5" width={badgeWidth(badgeText, 58) - 1} height="17" rx="8.5" fill={catTheme.fill} stroke={catTheme.stroke} strokeWidth="1" />
            <text x={badgeWidth(badgeText, 58) / 2} y="9.5" dominantBaseline="central" textAnchor="middle" fill={catTheme.textColor} fontSize="8.5" fontWeight="700" fontFamily="sans-serif">{badgeText}</text>
          </svg>
        </div>

        {/* Card 2: रक्कम (Amount) */}
        <div 
          className="bg-white rounded-xl p-2.5 px-3 flex items-center justify-between shadow-2xs border border-emerald-100/60"
          style={{ minHeight: '52px', boxSizing: 'border-box' }}
        >
          <div className="flex items-center gap-2.5 min-w-0" style={{ overflow: 'visible' }}>
            <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
              <IndianRupee className="w-4 h-4 font-bold" />
            </div>
            <div className="min-w-0" style={{ overflow: 'visible' }}>
              <span className="text-[9px] text-[#059669] font-semibold uppercase tracking-wider block" style={{ lineHeight: '1.5', paddingBottom: '1px' }}>
                {t('receipt.single.amount')}
              </span>
              <span className="text-sm font-black text-slate-900 block" style={{ lineHeight: '1.5', paddingTop: '1px' }}>
                {formattedAmount}
              </span>
            </div>
          </div>
          {/* Centered SVG Payment Status Badge */}
          {isCompleted ? (
            <svg width={badgeWidth(statusText, 50)} height="18" viewBox={`0 0 ${badgeWidth(statusText, 50)} 18`} className="status-badge shrink-0" style={{ display: 'block' }}>
              <rect x="0.5" y="0.5" width={badgeWidth(statusText, 50) - 1} height="17" rx="8.5" fill="#DEF7EC" stroke="#BCF0DA" strokeWidth="1" />
              <text x={badgeWidth(statusText, 50) / 2} y="9.5" dominantBaseline="central" textAnchor="middle" fill="#03543F" fontSize="8.5" fontWeight="700" fontFamily="sans-serif">{statusText}</text>
            </svg>
          ) : (
            <svg width={badgeWidth(statusText, 56)} height="18" viewBox={`0 0 ${badgeWidth(statusText, 56)} 18`} className="status-badge shrink-0" style={{ display: 'block' }}>
              <rect x="0.5" y="0.5" width={badgeWidth(statusText, 56) - 1} height="17" rx="8.5" fill="#FEF08A" stroke="#FDE047" strokeWidth="1" />
              <text x={badgeWidth(statusText, 56) / 2} y="9.5" dominantBaseline="central" textAnchor="middle" fill="#854D0E" fontSize="8.5" fontWeight="700" fontFamily="sans-serif">{statusText}</text>
            </svg>
          )}
        </div>

        {/* Card 3: दिनांक (Date) */}
        <div 
          className="bg-white rounded-xl p-2.5 px-3 flex items-center justify-between shadow-2xs border border-emerald-100/60"
          style={{ minHeight: '52px', boxSizing: 'border-box' }}
        >
          <div className="flex items-center gap-2.5 min-w-0" style={{ overflow: 'visible' }}>
            <div className="w-8 h-8 rounded-lg bg-[#DBEAFE] text-[#2563EB] flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0" style={{ overflow: 'visible' }}>
              <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block" style={{ lineHeight: '1.5', paddingBottom: '1px' }}>
                {t('receipt.single.date')}
              </span>
              <span className="text-xs font-bold text-slate-900 block" style={{ lineHeight: '1.5', paddingTop: '1px' }}>
                {formattedDate}
              </span>
            </div>
          </div>
          <span className="text-[9px] font-medium text-slate-400 shrink-0" style={{ lineHeight: '1.4' }}>
            {t('receipt.single.recorded')}
          </span>
        </div>

        {/* Card 4: तपशील (Description / Quantity) */}
        <div 
          className="bg-white rounded-xl p-2.5 px-3 flex items-center justify-between shadow-2xs border border-emerald-100/60"
          style={{ minHeight: '52px', boxSizing: 'border-box' }}
        >
          <div className="flex items-center gap-2.5 min-w-0" style={{ overflow: 'visible' }}>
            <div className="w-8 h-8 rounded-lg bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0" style={{ overflow: 'visible' }}>
              <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block" style={{ lineHeight: '1.5', paddingBottom: '1px' }}>
                {t('receipt.single.details')}
              </span>
              <span className="text-xs font-bold text-slate-900 block" style={{ lineHeight: '1.5', paddingTop: '1px' }}>
                {descriptionText}
              </span>
            </div>
          </div>
        </div>

        {/* Photo / Bill Section */}
        {photoUrl ? (
          <div className="pt-1.5" style={{ overflow: 'visible' }}>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-[10px] font-bold text-slate-700 flex items-center gap-1" style={{ lineHeight: '1.4' }}>
                <ImageIcon className="w-3 h-3 text-slate-400" />
                <span>{t('receipt.single.photo')}</span>
              </h4>
              <span className="text-[8px] text-emerald-700 font-semibold bg-emerald-100 px-1.5 py-0.5 rounded" style={{ lineHeight: '1.4' }}>{t('receipt.single.attached')}</span>
            </div>
            <div className="w-full max-h-36 rounded-xl overflow-hidden bg-slate-950 border border-emerald-200/60 shadow-sm flex items-center justify-center">
              <img 
                src={photoUrl} 
                alt={t('receipt.single.billAlt')} 
                className="w-full max-h-36 object-contain"
                crossOrigin="anonymous"
              />
            </div>
          </div>
        ) : null}

        {/* Subtle Footer */}
        <div className="pt-2 border-t border-emerald-100/80 flex items-center justify-between text-[8px] text-slate-400 font-medium" style={{ lineHeight: '1.5' }}>
          <span>🏛️ {projectName || t('app.defaultProject')}</span>
          <span>{t('receipt.single.verified')}</span>
        </div>
      </div>
    </div>
  );
});

SingleExpenseReceiptCard.displayName = 'SingleExpenseReceiptCard';
