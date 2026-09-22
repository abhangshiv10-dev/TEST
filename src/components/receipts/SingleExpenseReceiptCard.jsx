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
  CheckCircle2,
  Download,
  Share2
} from 'lucide-react';
import { formatINR } from '../../utils/marathiCurrency';
import { getCategoryEnglishLabel } from '../../utils/bilingualSearch';

// Category icon & theme selector
function getCategoryTheme(name = '') {
  const cat = (name || '').toLowerCase();
  if (cat.includes('सिमेंट') || cat.includes('cement')) {
    return { icon: Package, bg: 'bg-[#E0F2FE]', text: 'text-[#0284C7]', badge: 'Material' };
  }
  if (cat.includes('वाळू') || cat.includes('sand')) {
    return { icon: Layers, bg: 'bg-[#FEF3C7]', text: 'text-[#D97706]', badge: 'Material' };
  }
  if (cat.includes('मजुरी') || cat.includes('कामगार') || cat.includes('labour') || cat.includes('labor')) {
    return { icon: HardHat, bg: 'bg-[#FFE4E6]', text: 'text-[#E11D48]', badge: 'Labour' };
  }
  if (cat.includes('स्टील') || cat.includes('steel') || cat.includes('लोखंड')) {
    return { icon: Layers, bg: 'bg-[#EDE9FE]', text: 'text-[#6366F1]', badge: 'Material' };
  }
  if (cat.includes('विट') || cat.includes('brick') || cat.includes('ब्लॉक')) {
    return { icon: Grid, bg: 'bg-[#FFEDD5]', text: 'text-[#EA580C]', badge: 'Material' };
  }
  if (cat.includes('वाहतूक') || cat.includes('transport') || cat.includes('jcb') || cat.includes('जेसीबी')) {
    return { icon: Truck, bg: 'bg-[#CFFAFE]', text: 'text-[#0891B2]', badge: 'Transport' };
  }
  if (cat.includes('पेंट') || cat.includes('रंग') || cat.includes('paint')) {
    return { icon: Palette, bg: 'bg-[#FCE7F3]', text: 'text-[#DB2777]', badge: 'Finishing' };
  }
  if (cat.includes('वीज') || cat.includes('electric')) {
    return { icon: Zap, bg: 'bg-[#FEF9C3]', text: 'text-[#CA8A04]', badge: 'Electrical' };
  }
  if (cat.includes('प्लंबिंग') || cat.includes('plumb')) {
    return { icon: Wrench, bg: 'bg-[#DBEAFE]', text: 'text-[#2563EB]', badge: 'Plumbing' };
  }
  if (cat.includes('दरवाजे') || cat.includes('door')) {
    return { icon: DoorClosed, bg: 'bg-[#D1FAE5]', text: 'text-[#059669]', badge: 'Carpentry' };
  }
  return { icon: Layers, bg: 'bg-[#F1F5F9]', text: 'text-[#475569]', badge: 'General' };
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

export const SingleExpenseReceiptCard = forwardRef(({
  expense = {},
  projectName = 'माझ्या घराचे बांधकाम',
  titleText = 'Expense Added Successfully!',
  subtitleText = 'Your construction expense has been recorded.',
  onExportClick,
  onWhatsAppClick,
  showActionButtons = false
}, ref) => {
  const catTheme = getCategoryTheme(expense.category_name);
  const CatIcon = catTheme.icon;
  const engLabel = getCategoryEnglishLabel(expense.category_name);
  const formattedDate = formatReceiptDate(expense.expense_date || new Date().toISOString().split('T')[0]);
  const formattedAmount = formatINR(expense.amount || 0);
  const descriptionText = expense.description || expense.unit || '-';
  const photoUrl = expense.receipt_url || expense.photo_url || null;
  const isCompleted = (expense.payment_status || 'Paid').toLowerCase() === 'paid' || expense.payment_status === 'पूर्ण';

  return (
    <div
      ref={ref}
      className="receipt-capture-root w-[340px] sm:w-[350px] mx-auto bg-[#F2FBF6] rounded-[28px] overflow-hidden shadow-2xl border border-emerald-100 flex flex-col font-sans text-slate-800"
      style={{
        boxSizing: 'border-box',
        width: '344px',
        backgroundColor: '#F2FBF6',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif'
      }}
    >
      {/* Top Emerald Wave Header */}
      <div 
        className="relative bg-gradient-to-r from-[#059669] via-[#10B981] to-[#0D9488] pt-4 pb-8 px-4 text-white"
        style={{
          borderBottomLeftRadius: '0px',
          borderBottomRightRadius: '50px'
        }}
      >
        <div className="flex items-start justify-between">
          {/* Logo & App Name */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-md shadow-xs">
              <Home className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="leading-tight">
              <h3 className="text-xs font-extrabold tracking-tight text-white drop-shadow-xs">Construction</h3>
              <p className="text-[9px] text-emerald-100 font-medium">Expense Tracker</p>
            </div>
          </div>

          {/* Leaf & Tagline */}
          <div className="text-right flex flex-col items-end">
            <div className="flex items-center gap-1 text-emerald-200">
              <Leaf className="w-3 h-3" />
            </div>
            <p className="text-[9px] italic font-serif text-emerald-50/90 leading-tight">
              Small Expenses<br/>Big Progress
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
          style={{ lineHeight: '1.3' }}
        >
          {titleText}
        </h2>
        <p 
          className="text-[10px] text-slate-500 font-medium mt-0.5"
          style={{ lineHeight: '1.4' }}
        >
          {subtitleText}
        </p>
      </div>

      {/* Main 4 Cards Container */}
      <div className="p-3.5 pt-2.5 space-y-2 pb-3.5" style={{ overflow: 'visible' }}>
        {/* Card 1: खर्चाचा प्रकार (Category) */}
        <div 
          className="bg-white rounded-xl p-2.5 px-3 flex items-center justify-between shadow-2xs border border-emerald-100/60"
          style={{ minHeight: '50px', boxSizing: 'border-box' }}
        >
          <div className="flex items-center gap-2.5 min-w-0" style={{ overflow: 'visible' }}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${catTheme.bg} ${catTheme.text}`}>
              <CatIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0" style={{ overflow: 'visible' }}>
              <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block" style={{ lineHeight: '1.2' }}>
                खर्चाचा प्रकार
              </span>
              <span className="text-xs font-bold text-slate-900 block truncate" style={{ lineHeight: '1.3' }}>
                {expense.category_name || 'इतर'} {engLabel && !expense.category_name?.includes(engLabel) ? `(${engLabel})` : ''}
              </span>
            </div>
          </div>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md shrink-0 ${catTheme.bg} ${catTheme.text}`}>
            {catTheme.badge}
          </span>
        </div>

        {/* Card 2: रक्कम (Amount) */}
        <div 
          className="bg-white rounded-xl p-2.5 px-3 flex items-center justify-between shadow-2xs border border-emerald-100/60"
          style={{ minHeight: '50px', boxSizing: 'border-box' }}
        >
          <div className="flex items-center gap-2.5 min-w-0" style={{ overflow: 'visible' }}>
            <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
              <IndianRupee className="w-4 h-4 font-bold" />
            </div>
            <div className="min-w-0" style={{ overflow: 'visible' }}>
              <span className="text-[9px] text-[#059669] font-semibold uppercase tracking-wider block" style={{ lineHeight: '1.2' }}>
                रक्कम (₹)
              </span>
              <span className="text-sm font-black text-slate-900 block" style={{ lineHeight: '1.3' }}>
                {formattedAmount}
              </span>
            </div>
          </div>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md shrink-0 ${isCompleted ? 'bg-[#DEF7EC] text-[#03543F]' : 'bg-[#FEF08A] text-[#854D0E]'}`}>
            {isCompleted ? '✓ Paid' : '⏳ Pending'}
          </span>
        </div>

        {/* Card 3: दिनांक (Date) */}
        <div 
          className="bg-white rounded-xl p-2.5 px-3 flex items-center justify-between shadow-2xs border border-emerald-100/60"
          style={{ minHeight: '50px', boxSizing: 'border-box' }}
        >
          <div className="flex items-center gap-2.5 min-w-0" style={{ overflow: 'visible' }}>
            <div className="w-8 h-8 rounded-lg bg-[#DBEAFE] text-[#2563EB] flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0" style={{ overflow: 'visible' }}>
              <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block" style={{ lineHeight: '1.2' }}>
                दिनांक
              </span>
              <span className="text-xs font-bold text-slate-900 block" style={{ lineHeight: '1.3' }}>
                {formattedDate}
              </span>
            </div>
          </div>
          <span className="text-[9px] font-medium text-slate-400 shrink-0">
            Recorded
          </span>
        </div>

        {/* Card 4: तपशील (Description / Quantity) */}
        <div 
          className="bg-white rounded-xl p-2.5 px-3 flex items-center justify-between shadow-2xs border border-emerald-100/60"
          style={{ minHeight: '50px', boxSizing: 'border-box' }}
        >
          <div className="flex items-center gap-2.5 min-w-0" style={{ overflow: 'visible' }}>
            <div className="w-8 h-8 rounded-lg bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0" style={{ overflow: 'visible' }}>
              <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block" style={{ lineHeight: '1.2' }}>
                तपशील (संख्या/प्रमाण)
              </span>
              <span className="text-xs font-bold text-slate-900 block truncate" style={{ lineHeight: '1.3' }}>
                {descriptionText}
              </span>
            </div>
          </div>
        </div>

        {/* Photo / Bill Section */}
        {photoUrl ? (
          <div className="pt-1.5" style={{ overflow: 'visible' }}>
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
                <ImageIcon className="w-3 h-3 text-slate-400" />
                <span>पावती / बिल फोटो</span>
              </h4>
              <span className="text-[8px] text-emerald-700 font-semibold bg-emerald-100 px-1.5 py-0.5 rounded">Attached</span>
            </div>
            <div className="w-full max-h-36 rounded-xl overflow-hidden bg-slate-950 border border-emerald-200/60 shadow-sm flex items-center justify-center">
              <img 
                src={photoUrl} 
                alt="Expense Bill" 
                className="w-full max-h-36 object-contain"
                crossOrigin="anonymous"
              />
            </div>
          </div>
        ) : null}

        {/* Subtle Footer */}
        <div className="pt-2 border-t border-emerald-100/80 flex items-center justify-between text-[8px] text-slate-400 font-medium">
          <span>🏛️ {projectName}</span>
          <span>Verified Digital Slip</span>
        </div>
      </div>
    </div>
  );
});

SingleExpenseReceiptCard.displayName = 'SingleExpenseReceiptCard';
