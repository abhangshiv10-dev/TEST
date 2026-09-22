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
  MoreHorizontal
} from 'lucide-react';
import { formatINR } from '../../utils/marathiCurrency';

// Category icon selector
function getCategoryIcon(name = '') {
  const cat = (name || '').toLowerCase();
  if (cat.includes('सिमेंट') || cat.includes('cement')) return Package;
  if (cat.includes('वाळू') || cat.includes('sand')) return Layers;
  if (cat.includes('मजुरी') || cat.includes('कामगार') || cat.includes('labour') || cat.includes('labor')) return Users;
  if (cat.includes('स्टील') || cat.includes('steel') || cat.includes('लोखंड')) return SquareAsterisk;
  if (cat.includes('विट') || cat.includes('brick') || cat.includes('ब्लॉक')) return Grid;
  if (cat.includes('वाहतूक') || cat.includes('transport')) return Truck;
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
  subtitleText = 'Your construction expense has been recorded.'
}, ref) => {
  const CatIcon = getCategoryIcon(expense.category_name);
  const formattedDate = formatReceiptDate(expense.expense_date || new Date().toISOString().split('T')[0]);
  const formattedAmount = formatINR(expense.amount || 0);
  const descriptionText = expense.description || expense.unit || '10 pote';
  const photoUrl = expense.receipt_url || expense.photo_url || null;

  return (
    <div
      ref={ref}
      className="w-full max-w-[340px] sm:max-w-[360px] mx-auto bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100 flex flex-col font-sans text-slate-800"
      style={{ minWidth: '320px' }}
    >
      {/* Top Green Banner with Wave / Curve */}
      <div 
        className="relative bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 pt-5 pb-9 px-5 text-white"
        style={{
          borderBottomLeftRadius: '28px',
          borderBottomRightRadius: '28px'
        }}
      >
        <div className="flex items-start justify-between">
          {/* Top Left: Logo & App Title */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <Home className="w-4 h-4 text-white" />
            </div>
            <div className="leading-tight">
              <h3 className="text-[11px] font-bold tracking-tight text-white">Construction</h3>
              <p className="text-[10px] text-emerald-100 font-medium">Expense Tracker</p>
            </div>
          </div>

          {/* Top Right: Leaf & Cursive Tagline */}
          <div className="text-right flex flex-col items-end">
            <div className="flex items-center gap-1 text-emerald-100">
              <Leaf className="w-3.5 h-3.5" />
            </div>
            <p className="text-[10px] italic font-serif text-emerald-100/90 leading-tight">
              Small Expenses<br/>Big Progress
            </p>
          </div>
        </div>
      </div>

      {/* Checkmark Circle (Floating over top banner) */}
      <div className="flex flex-col items-center -mt-6 px-5 text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md border-3 border-white ring-2 ring-emerald-100">
          <Check className="w-6 h-6 stroke-[3]" />
        </div>

        {/* Success / Title Header */}
        <h2 className="mt-3 text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
          {titleText}
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          {subtitleText}
        </p>
      </div>

      {/* Main 4 Info Cards */}
      <div className="p-5 space-y-2.5">
        {/* Card 1: खर्चाचा प्रकार (Category) */}
        <div className="bg-slate-50/80 border border-slate-100/80 rounded-2xl p-3 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
            <CatIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-slate-400 font-medium block">
              खर्चाचा प्रकार
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate">
              {expense.category_name || 'सिमेंट (Cement)'}
            </span>
          </div>
        </div>

        {/* Card 2: रक्कम (Amount) */}
        <div className="bg-emerald-50/60 border border-emerald-100/80 rounded-2xl p-3 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 font-bold text-lg">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-emerald-700 font-medium block">
              रक्कम (₹)
            </span>
            <span className="text-sm sm:text-base font-extrabold text-slate-900 block truncate">
              {formattedAmount}
            </span>
          </div>
        </div>

        {/* Card 3: दिनांक (Date) */}
        <div className="bg-slate-50/80 border border-slate-100/80 rounded-2xl p-3 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-slate-400 font-medium block">
              दिनांक
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 block">
              {formattedDate}
            </span>
          </div>
        </div>

        {/* Card 4: तपशील (Description / Quantity) */}
        <div className="bg-slate-50/80 border border-slate-100/80 rounded-2xl p-3 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] text-slate-400 font-medium block">
              तपशील (संख्या/प्रमाण)
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 block truncate">
              {descriptionText}
            </span>
          </div>
        </div>

        {/* Photo / Receipt Attachment Section */}
        <div className="pt-2">
          <h4 className="text-xs font-bold text-slate-800 mb-2">
            पावती / फोटो
          </h4>
          <div className="w-full h-32 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center relative">
            {photoUrl ? (
              <img 
                src={photoUrl} 
                alt="Expense Bill" 
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-linear-to-br from-slate-100 to-slate-200/60 p-4 text-center">
                <FileText className="w-8 h-8 text-slate-300 mb-1" />
                <span className="text-[11px] font-medium text-slate-500">पावती / बिल फोटो उपलब्ध नाही</span>
              </div>
            )}
          </div>
        </div>

        {/* Project and verification mark footer */}
        <div className="pt-2 text-center text-[10px] text-slate-400 border-t border-slate-100 mt-3">
          <span>🏛️ {projectName} • Verified Digital Expense Slip</span>
        </div>
      </div>
    </div>
  );
});

SingleExpenseReceiptCard.displayName = 'SingleExpenseReceiptCard';
