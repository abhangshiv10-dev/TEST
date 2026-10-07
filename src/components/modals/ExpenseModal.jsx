import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, IndianRupee, Calendar, FileText, Loader2 } from 'lucide-react';
import CategoryCombobox from '../common/CategoryCombobox';
import PhotoUploader from '../common/PhotoUploader';
import { toInputDate } from '../../utils/marathiDate';
import { useBudget } from '../../contexts/BudgetContext';
import { getExpensePhotos, buildPhotoColumns } from '../../utils/expensePhotos';
import { useLanguage } from '../../i18n/LanguageContext';

export default function ExpenseModal({
  isOpen,
  onClose,
  expenseToEdit = null,
  onViewPhoto
}) {
  const { categories, addCategory, addExpense, updateExpense } = useBudget();
  const { t } = useLanguage();

  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(toInputDate());
  const [paymentStatus, setPaymentStatus] = useState('Paid');
  const [description, setDescription] = useState('');
  const [newFiles, setNewFiles] = useState([]);          // photos picked now (File[])
  const [existingPhotos, setExistingPhotos] = useState([]); // already saved [{url, path}]
  const [removedPaths, setRemovedPaths] = useState([]);   // saved photos to delete from storage
  
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (expenseToEdit) {
      setCategoryId(expenseToEdit.category_id || '');
      setAmount(expenseToEdit.amount || '');
      setExpenseDate(expenseToEdit.expense_date || toInputDate());
      setPaymentStatus(expenseToEdit.payment_status || 'Paid');
      setDescription(expenseToEdit.description || '');
      setExistingPhotos(getExpensePhotos(expenseToEdit));
      setNewFiles([]);
      setRemovedPaths([]);
    } else {
      setCategoryId('');
      setAmount('');
      setExpenseDate(toInputDate());
      setPaymentStatus('Paid');
      setDescription('');
      setExistingPhotos([]);
      setNewFiles([]);
      setRemovedPaths([]);
    }
    setErrors({});
  }, [expenseToEdit, isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!categoryId) errs.category = t('expenseModal.errCategory');
    if (!amount || Number(amount) <= 0) errs.amount = t('expenseModal.errAmount');
    if (!expenseDate) errs.date = t('expenseModal.errDate');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSaving(true);
      const data = {
        category_id: categoryId,
        amount: Number(amount),
        expense_date: expenseDate,
        payment_status: paymentStatus,
        description: description.trim(),
        // photos that are kept (new ones are uploaded by the service and appended)
        ...buildPhotoColumns(existingPhotos)
      };

      if (expenseToEdit) {
        await updateExpense(expenseToEdit.id, data, newFiles, removedPaths);
      } else {
        await addExpense(data, newFiles);
      }

      onClose();
    } catch (err) {
      console.error('Error saving expense:', err);
    } finally {
      setSaving(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative max-w-lg w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Fixed Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-100 bg-white shrink-0">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
              {expenseToEdit ? t('expenseModal.titleEdit') : t('expenseModal.titleNew')}
            </h2>
            <p className="text-[11px] text-slate-500 font-normal mt-0.5">
              {t('expenseModal.subtitle')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} id="expense-modal-form" className="p-3.5 sm:p-5 overflow-y-auto overscroll-contain flex-1 space-y-3 sm:space-y-4">
          {/* 1. Category Searchable Combobox */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('expenseModal.category')} <span className="text-rose-500">*</span>
            </label>
            <CategoryCombobox
              categories={categories}
              selectedCategoryId={categoryId}
              onSelectCategory={(id) => {
                setCategoryId(id);
                setErrors((prev) => ({ ...prev, category: null }));
              }}
              onAddNewCategory={async (name, nameEn) => {
                const newCat = await addCategory(name, nameEn);
                return newCat;
              }}
              error={errors.category}
            />
            {errors.category && (
              <p className="mt-1 text-[11px] text-rose-500 font-medium">{errors.category}</p>
            )}
          </div>

          {/* 2. Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('expenseModal.amount')} <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-slate-400 font-bold text-base pointer-events-none">₹</span>
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setErrors((prev) => ({ ...prev, amount: null }));
                }}
                placeholder={t('expenseModal.amountPlaceholder')}
                className={`w-full pl-8 pr-3.5 py-2 sm:py-2.5 bg-white border rounded-xl text-sm sm:text-base font-bold text-slate-900 focus:outline-none transition-colors ${
                  errors.amount ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10'
                }`}
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-[11px] text-rose-500 font-medium">{errors.amount}</p>
            )}
          </div>

          {/* 3. Payment Status (पूर्ण / बाकी) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('expenseModal.paymentStatus')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentStatus('Paid')}
                className={`py-2 px-2 sm:px-3 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[38px] ${
                  paymentStatus === 'Paid'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate">{t('status.paid')}</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentStatus('Pending')}
                className={`py-2 px-2 sm:px-3 rounded-xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[38px] ${
                  paymentStatus === 'Pending'
                    ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                <span className="truncate">{t('status.pending')}</span>
              </button>
            </div>
          </div>

          {/* 4. Date Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('expenseModal.date')} <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="date"
                value={expenseDate}
                onChange={(e) => {
                  setExpenseDate(e.target.value);
                  setErrors((prev) => ({ ...prev, date: null }));
                }}
                className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-slate-900 cursor-pointer min-h-[38px]"
              />
            </div>
            {errors.date && (
              <p className="mt-1 text-[11px] text-rose-500 font-medium">{errors.date}</p>
            )}
          </div>

          {/* 5. Description Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('expenseModal.details')}
            </label>
            <div className="relative flex items-start">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('expenseModal.detailsPlaceholder')}
                className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-slate-900 resize-none min-h-[52px]"
              />
            </div>
          </div>

          {/* 6. Photo Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('expenseModal.photos')}
            </label>
            <PhotoUploader
              existingPhotos={existingPhotos}
              newFiles={newFiles}
              onAddFiles={(files) => setNewFiles((prev) => [...prev, ...files])}
              onRemoveExisting={(index) => {
                const removed = existingPhotos[index];
                if (removed?.path) setRemovedPaths((prev) => [...prev, removed.path]);
                setExistingPhotos((prev) => prev.filter((_, i) => i !== index));
              }}
              onRemoveNew={(index) => setNewFiles((prev) => prev.filter((_, i) => i !== index))}
              onViewPhoto={onViewPhoto}
            />
          </div>
        </form>

        {/* Fixed Sticky Footer */}
        <div className="flex items-center justify-end gap-2.5 px-3.5 py-3 sm:px-5 sm:py-3.5 border-t border-slate-100 bg-slate-50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/70 rounded-xl transition-colors text-center border border-slate-200 sm:border-transparent"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            form="expense-modal-form"
            disabled={saving}
            className="flex-1 sm:flex-none px-5 py-2 text-xs sm:text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 whitespace-nowrap"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>{t('common.saving')}</span>
              </>
            ) : (
              <span>{t('expenseModal.save')}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
