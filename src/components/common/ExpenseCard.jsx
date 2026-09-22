import React from 'react';
import { Camera, Edit2, Trash2, Calendar, FileText, Receipt as ReceiptIcon } from 'lucide-react';
import { formatINR } from '../../utils/marathiCurrency';
import { formatMarathiDate } from '../../utils/marathiDate';
import { getCategoryIconMeta } from '../../utils/categoryIcons';

export default function ExpenseCard({
  expense,
  onEdit,
  onDelete,
  onViewPhoto,
  onViewReceipt
}) {
  const hasPhoto = Boolean(expense.photo_url);
  const { icon: CategoryIcon, bg: iconBg } = getCategoryIconMeta(expense.category_name);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 hover:border-slate-300 hover:shadow-subtle transition-all duration-150 group">
      {/* Responsive layout: On mobile, full stacked view; on sm+, spacious responsive flex */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        {/* Left / Main Details */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {/* Category Icon or Photo Thumbnail */}
          {hasPhoto ? (
            <button
              type="button"
              onClick={() => onViewPhoto(expense.photo_url, `${expense.category_name} - पावती`)}
              className="relative w-11 h-11 rounded-xl overflow-hidden border border-slate-200 shrink-0 group/thumb transition-transform hover:scale-105 shadow-2xs"
              title="फोटो / पावती पूर्ण आकारात पाहा"
            >
              <img
                src={expense.photo_url}
                alt="पावती"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Camera className="w-4 h-4" />
              </div>
            </button>
          ) : (
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs ${iconBg}`}>
              <CategoryIcon className="w-5 h-5" />
            </div>
          )}

          {/* Text Information */}
          <div className="min-w-0 flex-1 space-y-1.5">
            {/* Header: Category + Status Badge + Photo Badge + (On mobile: Amount inline) */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  {expense.category_name || 'इतर'}
                </h4>
                {/* Payment Status Pill */}
                {expense.payment_status === 'Pending' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100/90 text-amber-900 text-[10px] font-bold border border-amber-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                    <span>बाकी (Pending)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>पूर्ण (Completed)</span>
                  </span>
                )}
                {hasPhoto && (
                  <button
                    type="button"
                    onClick={() => onViewPhoto(expense.photo_url, `${expense.category_name} - पावती`)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-medium border border-blue-200/60 transition-colors"
                  >
                    <Camera className="w-3 h-3" />
                    <span>पावती फोटो</span>
                  </button>
                )}
              </div>

              {/* Mobile-only prominent Amount */}
              <div className="sm:hidden text-right">
                <span className="text-base font-bold text-slate-900 tracking-tight">
                  {formatINR(expense.amount)}
                </span>
              </div>
            </div>

            {/* Complete Description - Full View without cut off / truncation */}
            {expense.description ? (
              <p className="text-xs sm:text-sm text-slate-700 font-normal leading-relaxed break-words whitespace-pre-line">
                {expense.description}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">
                कोणताही तपशील जोडलेला नाही
              </p>
            )}

            {/* Date Badge */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{formatMarathiDate(expense.expense_date, true)}</span>
            </div>
          </div>
        </div>

        {/* Right Section: Desktop Amount & Action Buttons */}
        <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-start gap-2 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
          {/* Desktop Amount */}
          <div className="hidden sm:block text-right">
            <div className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {formatINR(expense.amount)}
            </div>
          </div>

          {/* Action Buttons: Receipt, Edit & Delete */}
          <div className="flex items-center gap-1.5">
            {onViewReceipt && (
              <button
                type="button"
                onClick={() => onViewReceipt(expense)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
                title="खर्च पावती (Receipt PNG/JPG)"
              >
                <ReceiptIcon className="w-3.5 h-3.5" />
                <span className="text-[11px]">पावती</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onEdit(expense)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100/80 hover:bg-slate-200/80 rounded-lg transition-colors"
              title="बदला / संपादित करा"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span className="sm:hidden text-[11px]">बदला</span>
            </button>

            <button
              type="button"
              onClick={() => onDelete(expense)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 rounded-lg transition-colors"
              title="खर्च हटवा"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="sm:hidden text-[11px]">हटवा</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
