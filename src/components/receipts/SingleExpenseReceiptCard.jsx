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
  SquareAsterisk,
  HardHat,
  Download,
  Share2
} from 'lucide-react';
import { formatINR } from '../../utils/marathiCurrency';

// Category icon selector
function getCategoryIcon(name = '') {
  const cat = (name || '').toLowerCase();
  if (cat.includes('सिमेंट') || cat.includes('cement')) return Package;
  if (cat.includes('वाळू') || cat.includes('sand')) return Layers;
  if (cat.includes('मजुरी') || cat.includes('कामगार') || cat.includes('labour') || cat.includes('labor')) return HardHat;
  if (cat.includes('स्टील') || cat.includes('steel') || cat.includes('लोखंड')) return Layers;
  if (cat.includes('विट') || cat.includes('brick') || cat.includes('ब्लॉक')) return Grid;
  if (cat.includes('वाहतूक') || cat.includes('transport') || cat.includes('jcb') || cat.includes('जेसीबी')) return Truck;
  if (cat.includes('पेंट') || cat.includes('रंग') || cat.includes('paint')) return Palette;
  if (cat.includes('वीज') || cat.includes('electric')) return Zap;
  if (cat.includes('प्लंबिंग') || cat.includes('plumb')) return Wrench;
  if (cat.includes('दरवाजे') || cat.includes('door')) return DoorClosed;
  return Layers;
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
  const CatIcon = getCategoryIcon(expense.category_name);
  const formattedDate = formatReceiptDate(expense.expense_date || new Date().toISOString().split('T')[0]);
  const formattedAmount = formatINR(expense.amount || 0);
  const descriptionText = expense.description || expense.unit || '-';
  const photoUrl = expense.receipt_url || expense.photo_url || null;

  return (
    <div
      ref={ref}
      className="receipt-capture-root w-[340px] sm:w-[350px] mx-auto bg-[#EDFAF3] rounded-[32px] overflow-hidden shadow-xl border border-emerald-100/70 flex flex-col font-sans text-slate-800"
      style={{
        boxSizing: 'border-box',
        width: '348px',
        backgroundColor: '#EDFAF3',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans Devanagari", sans-serif'
      }}
    >
      {/* Top Green Banner with diagonal wave shape */}
      <div 
        className="relative bg-[#10B981] pt-4 pb-8 px-4 text-white"
        style={{
          borderBottomLeftRadius: '0px',
          borderBottomRightRadius: '56px'
        }}
      >
        <div className="flex items-start justify-between">
          {/* Top Left: Logo & App Title */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <Home className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="leading-tight">
              <h3 className="text-[11px] font-bold tracking-tight text-white">Construction</h3>
              <p className="text-[9px] text-emerald-100 font-medium">Expense Tracker</p>
            </div>
          </div>

          {/* Top Right: Leaf & Cursive Tagline */}
          <div className="text-right flex flex-col items-end">
            <div className="flex items-center gap-1 text-emerald-100">
              <Leaf className="w-3 h-3" />
            </div>
            <p className="text-[9px] italic font-serif text-emerald-100/90 leading-tight">
              Small Expenses<br/>Big Progress
            </p>
          </div>
        </div>
      </div>

      {/* Floating Checkmark Badge */}
      <div className="flex flex-col items-center -mt-6 px-4 text-center relative z-10" style={{ overflow: 'visible' }}>
        <div className="w-12 h-12 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-md border-3 border-[#EDFAF3]">
          <Check className="w-6 h-6 stroke-[3]" />
        </div>

        {/* Success / Title Header */}
        <h2 
          className="mt-2 text-sm sm:text-base font-extrabold text-[#0F172A] tracking-tight"
          style={{ lineHeight: '1.3' }}
        >
          {titleText}
        </h2>
        <p 
          className="text-[11px] text-slate-500 font-medium mt-0.5"
          style={{ lineHeight: '1.4' }}
        >
          {subtitleText}
        </p>
      </div>

      {/* Main 4 Info Cards (White cards on soft green background) */}
      <div className="p-3.5 pt-2.5 space-y-2 pb-4" style={{ overflow: 'visible' }}>
        {/* Card 1: खर्चाचा प्रकार (Category) */}
        <div 
          className="bg-white rounded-xl p-2.5 flex items-center gap-3 shadow-2xs border border-white/80"
          style={{ minHeight: '52px', boxSizing: 'border-box' }}
        >
          <div className="w-9 h-9 rounded-lg bg-[#E8F4FD] text-[#2980B9] flex items-center justify-center shrink-0">
            <CatIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0" style={{ overflow: 'visible' }}>
            <span 
              className="text-[10px] text-[#94A3B8] font-medium block"
              style={{ lineHeight: '1.3' }}
            >
              खर्चाचा प्रकार
            </span>
            <span 
              className="text-xs font-bold text-slate-900 block"
              style={{ lineHeight: '1.3' }}
            >
              {expense.category_name || 'सिमेंट'}
            </span>
          </div>
        </div>

        {/* Card 2: रक्कम (Amount) */}
        <div 
          className="bg-white rounded-xl p-2.5 flex items-center gap-3 shadow-2xs border border-white/80"
          style={{ minHeight: '52px', boxSizing: 'border-box' }}
        >
          <div className="w-9 h-9 rounded-lg bg-[#E6F8ED] text-[#10B981] flex items-center justify-center shrink-0 font-bold">
            <IndianRupee className="w-4 h-4" />
          </div>
          <div className="min-w-0" style={{ overflow: 'visible' }}>
            <span 
              className="text-[10px] text-[#94A3B8] font-medium block"
              style={{ lineHeight: '1.3' }}
            >
              रक्कम (₹)
            </span>
            <span 
              className="text-sm font-extrabold text-slate-900 block"
              style={{ lineHeight: '1.3' }}
            >
              {formattedAmount}
            </span>
          </div>
        </div>

        {/* Card 3: दिनांक (Date) */}
        <div 
          className="bg-white rounded-xl p-2.5 flex items-center gap-3 shadow-2xs border border-white/80"
          style={{ minHeight: '52px', boxSizing: 'border-box' }}
        >
          <div className="w-9 h-9 rounded-lg bg-[#EBF3FC] text-[#2F80ED] flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="min-w-0" style={{ overflow: 'visible' }}>
            <span 
              className="text-[10px] text-[#94A3B8] font-medium block"
              style={{ lineHeight: '1.3' }}
            >
              दिनांक
            </span>
            <span 
              className="text-xs font-bold text-slate-900 block"
              style={{ lineHeight: '1.3' }}
            >
              {formattedDate}
            </span>
          </div>
        </div>

        {/* Card 4: तपशील (Description / Quantity) */}
        <div 
          className="bg-white rounded-xl p-2.5 flex items-center gap-3 shadow-2xs border border-white/80"
          style={{ minHeight: '52px', boxSizing: 'border-box' }}
        >
          <div className="w-9 h-9 rounded-lg bg-[#EEF2FC] text-[#4F46E5] flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0" style={{ overflow: 'visible' }}>
            <span 
              className="text-[10px] text-[#94A3B8] font-medium block"
              style={{ lineHeight: '1.3' }}
            >
              तपशील (संख्या/प्रमाण)
            </span>
            <span 
              className="text-xs font-bold text-slate-900 block"
              style={{ lineHeight: '1.3' }}
            >
              {descriptionText}
            </span>
          </div>
        </div>

        {/* Photo / Receipt Attachment Section */}
        <div className="pt-1.5">
          <h4 className="text-[11px] font-bold text-slate-800 mb-1.5">
            पावती / फोटो
          </h4>
          <div className="w-full h-28 rounded-xl overflow-hidden bg-white border border-emerald-100 shadow-2xs flex items-center justify-center relative">
            {photoUrl ? (
              <img 
                src={photoUrl} 
                alt="Expense Bill" 
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-linear-to-br from-emerald-50/40 to-slate-100/60 p-3 text-center">
                <FileText className="w-6 h-6 text-emerald-400 mb-1" />
                <span className="text-[10px] font-medium text-slate-500">पावती / बिल फोटो उपलब्ध नाही</span>
              </div>
            )}
          </div>
        </div>

        {/* Optional Action Buttons */}
        {showActionButtons && (
          <div className="pt-2 flex items-center gap-2" style={{ overflow: 'visible' }}>
            <button
              type="button"
              onClick={onExportClick}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#2F80ED] text-[11px] font-bold transition-all border border-[#D0E8FF] shadow-2xs"
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
    </div>
  );
});

SingleExpenseReceiptCard.displayName = 'SingleExpenseReceiptCard';
