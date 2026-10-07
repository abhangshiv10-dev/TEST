import React from 'react';
import { Camera, Edit2, Trash2, Calendar, Receipt as ReceiptIcon } from 'lucide-react';
import { formatINR } from '../../utils/marathiCurrency';
import { getCategoryIconMeta } from '../../utils/categoryIcons';
import { getExpensePhotos } from '../../utils/expensePhotos';
import { isPendingStatus } from '../../utils/paymentStatus';
import { useLanguage } from '../../i18n/LanguageContext';

export default function ExpenseCard({
  expense,
  onEdit,
  onDelete,
  onViewPhoto,
  onViewReceipt,
  onToggleStatus
}) {
  const { t, catLabel, fmtDate } = useLanguage();
  const categoryName = catLabel(expense.category_name, expense.category_name_en);
  const photos = getExpensePhotos(expense);
  const photoUrls = photos.map((p) => p.url);
  const hasPhoto = photos.length > 0;
  const openPhotos = () => onViewPhoto(photoUrls[0], t('expenseCard.photoTitle', { name: categoryName }), photoUrls);
  const { icon: CategoryIcon, bg: iconBg } = getCategoryIconMeta(expense.category_name);
  const isPending = isPendingStatus(expense.payment_status);
  const cleanDescription = expense.description && expense.description.trim() !== '-' ? expense.description.trim() : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-3 sm:p-3.5 hover:border-slate-300 hover:shadow-xs transition-all duration-150 group">
      <div className="flex items-start justify-between gap-3">
        {/* Left: Category Icon / Photo Thumbnail + Details */}
        <div className="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1">
          {/* Icon or Photo */}
          {hasPhoto ? (
            <button
              type="button"
              onClick={openPhotos}
              className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-slate-200 shrink-0 group/thumb transition-transform hover:scale-105 shadow-2xs cursor-pointer"
              title={t('expenseCard.viewPhoto')}
            >
              <img
                src={photoUrls[0]}
                alt={t('common.receipt')}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Camera className="w-3.5 h-3.5" />
              </div>
              {photos.length > 1 && (
                <span className="absolute bottom-0 right-0 px-1 min-w-4 h-4 rounded-tl-md bg-slate-900/80 text-white text-[9px] font-bold flex items-center justify-center">
                  {photos.length}
                </span>
              )}
            </button>
          ) : (
            <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 border border-slate-200/60 shadow-2xs ${iconBg}`}>
              <CategoryIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          )}

          {/* Text Information */}
          <div className="min-w-0 flex-1 space-y-1">
            {/* Category Name & Status Badge */}
            {/* One row: name + status + photo badge (name shortens with ... on narrow phones) */}
            <div className="flex items-center gap-1.5 flex-nowrap min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug truncate min-w-0">
                {categoryName}
              </h4>

              {/* Status Pill (Clickable to Toggle Status) */}
              {onToggleStatus ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStatus(expense);
                  }}
                  className={`inline-flex shrink-0 items-center justify-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border leading-none transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-2xs ${
                    isPending
                      ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  }`}
                  title={isPending ? t('expenseCard.markPaid') : t('expenseCard.markPending')}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isPending ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                  <span>{isPending ? t('status.pending') : t('status.paid')}</span>
                </button>
              ) : isPending ? (
                <span className="inline-flex shrink-0 items-center justify-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200/80 leading-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>{t('status.pending')}</span>
                </span>
              ) : (
                <span className="inline-flex shrink-0 items-center justify-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/70 leading-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{t('status.paid')}</span>
                </span>
              )}

              {hasPhoto && (
                <button
                  type="button"
                  onClick={openPhotos}
                  title={t('expenseCard.viewPhoto')}
                  aria-label={t('expenseCard.viewPhoto')}
                  className="inline-flex shrink-0 items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold border border-blue-200/60 leading-none transition-colors cursor-pointer"
                >
                  <Camera className="w-3 h-3" />
                  {photos.length > 1 && <span>{photos.length}</span>}
                </button>
              )}
            </div>

            {/* Description (if present) */}
            {cleanDescription && (
              <p className="text-[11px] sm:text-xs text-slate-600 font-normal leading-relaxed break-words line-clamp-2">
                {cleanDescription}
              </p>
            )}

            {/* Date */}
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{fmtDate(expense.expense_date, true)}</span>
            </div>
          </div>
        </div>

        {/* Right: Amount & Actions */}
        <div className="flex flex-col items-end justify-between gap-1.5 shrink-0 self-stretch">
          {/* Amount */}
          <div className="text-right">
            <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
              {formatINR(expense.amount)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 pt-0.5">
            {onViewReceipt && (
              <button
                type="button"
                onClick={() => onViewReceipt(expense)}
                className="inline-flex items-center gap-1 px-2 py-1 text-[10px] sm:text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 rounded-lg transition-colors cursor-pointer shadow-2xs"
                title={t('expenseCard.viewReceipt')}
              >
                <ReceiptIcon className="w-3 h-3" />
                <span>{t('common.receipt')}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onEdit(expense)}
              className="p-1 sm:px-2 sm:py-1 text-slate-500 hover:text-slate-800 bg-slate-100/70 hover:bg-slate-200/70 rounded-lg transition-colors cursor-pointer"
              title={t('common.edit')}
            >
              <Edit2 className="w-3 h-3" />
            </button>

            <button
              type="button"
              onClick={() => onDelete(expense)}
              className="p-1 sm:px-2 sm:py-1 text-rose-500 hover:text-rose-700 bg-rose-50/70 hover:bg-rose-100/80 rounded-lg transition-colors cursor-pointer"
              title={t('common.delete')}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

