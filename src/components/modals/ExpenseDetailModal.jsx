import React, { useEffect, useState } from 'react';
import { FileText, Image as ImageIcon, Calendar, Edit2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { formatINR } from '../../utils/marathiCurrency';
import { getExpensePhotos } from '../../utils/expensePhotos';
import { isPendingStatus } from '../../utils/paymentStatus';
import { useLanguage } from '../../i18n/LanguageContext';

// Popup for ONE expense/transaction. Tabs: Details | Photo (attachment images).
export default function ExpenseDetailModal({ isOpen, expense, onClose, onEdit }) {
  const { t, catLabel, fmtDate } = useLanguage();
  const [tab, setTab] = useState('details');
  const [activeIdx, setActiveIdx] = useState(0);

  // Always start on the Details tab for a newly opened transaction
  useEffect(() => {
    if (isOpen) {
      setTab('details');
      setActiveIdx(0);
    }
  }, [isOpen, expense?.id]);

  if (!isOpen || !expense) return null;

  const categoryName = catLabel(expense.category_name, expense.category_name_en);
  const photos = getExpensePhotos(expense);
  const isPending = isPendingStatus(expense.payment_status);
  const description =
    expense.description && expense.description.trim() !== '-' ? expense.description.trim() : null;
  const current = photos[Math.min(activeIdx, photos.length - 1)];

  const tabClass = (active) =>
    `flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer ${
      active
        ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white'
        : 'border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
    }`;

  const Row = ({ label, children }) => (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-slate-100 dark:border-slate-700/60 last:border-0">
      <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">{label}</span>
      <span className="text-sm font-semibold text-slate-900 dark:text-white text-right break-words min-w-0">
        {children}
      </span>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={categoryName}
      subtitle={fmtDate(expense.expense_date, true)}
      maxWidth="max-w-lg"
    >
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 -mt-2 mb-4" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'details'} onClick={() => setTab('details')} className={tabClass(tab === 'details')}>
          <FileText className="w-4 h-4" />
          {t('expenseDetail.tabDetails')}
        </button>
        <button type="button" role="tab" aria-selected={tab === 'photo'} onClick={() => setTab('photo')} className={tabClass(tab === 'photo')}>
          <ImageIcon className="w-4 h-4" />
          {t('expenseDetail.tabPhoto')}
          {photos.length > 0 && (
            <span className="min-w-4 h-4 px-1 rounded-[2px] bg-slate-900 text-white text-[9px] font-bold flex items-center justify-center">
              {photos.length}
            </span>
          )}
        </button>
      </div>

      {tab === 'details' && (
        <div>
          <div className="text-center py-3 mb-2">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {formatINR(expense.amount)}
            </div>
          </div>
          <Row label={t('expenseModal.category')}>{categoryName}</Row>
          <Row label={t('expenseModal.date')}>
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {fmtDate(expense.expense_date, true)}
            </span>
          </Row>
          <Row label={t('expenseModal.paymentStatus')}>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-[11px] font-bold border ${
                isPending
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isPending ? 'bg-amber-500' : 'bg-emerald-500'}`} />
              {isPending ? t('status.pending') : t('status.paid')}
            </span>
          </Row>
          <Row label={t('expenseDetail.details')}>
            {description || <span className="text-slate-400 font-normal">—</span>}
          </Row>

          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(expense)}
              className="mt-4 w-full inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-[2px] transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              {t('common.edit')}
            </button>
          )}
        </div>
      )}

      {tab === 'photo' && (
        <div>
          {photos.length === 0 ? (
            <div className="py-10 text-center text-slate-400 space-y-2">
              <ImageIcon className="w-8 h-8 mx-auto" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {t('expenseDetail.noPhoto')}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <a href={current.url} target="_blank" rel="noopener noreferrer" className="block">
                <img
                  src={current.url}
                  alt={t('common.receipt')}
                  className="w-full max-h-[55vh] object-contain rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                />
              </a>
              {photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {photos.map((p, i) => (
                    <button
                      key={p.url + i}
                      type="button"
                      onClick={() => setActiveIdx(i)}
                      className={`w-14 h-14 shrink-0 rounded-[2px] overflow-hidden border-2 cursor-pointer ${
                        i === activeIdx ? 'border-slate-900' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={p.url} alt="" loading="lazy" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
