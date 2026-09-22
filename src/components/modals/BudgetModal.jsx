import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, IndianRupee, Loader2 } from 'lucide-react';
import { formatINR } from '../../utils/marathiCurrency';

export default function BudgetModal({
  isOpen,
  currentBudget = 0,
  isFirstTime = false,
  onClose,
  onSave
}) {
  const [budget, setBudget] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setBudget(currentBudget > 0 ? String(currentBudget) : '');
      setError('');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, currentBudget]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    const num = Number(budget);
    if (!budget || isNaN(num) || num <= 0) {
      setError('कृपया योग्य बजेट रक्कम टाका');
      return;
    }

    try {
      setSaving(true);
      await onSave(num);
      onClose();
    } catch (err) {
      console.error('Save budget error:', err);
    } finally {
      setSaving(false);
    }
  };

  const parsedNum = Number(budget) || 0;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative max-w-sm w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              {isFirstTime ? 'आपले बांधकाम बजेट सेट करा' : 'बजेट बदला'}
            </h2>
          </div>
          {!isFirstTime && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              एकूण अंदाजित बजेट (₹) <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-slate-400 font-semibold text-lg">₹</span>
              <input
                type="number"
                step="any"
                autoFocus
                value={budget}
                onChange={(e) => {
                  setBudget(e.target.value);
                  setError('');
                }}
                placeholder="उदा. 2500000"
                className={`w-full pl-9 pr-3 py-2.5 bg-white border rounded-xl text-lg font-bold text-slate-900 focus:outline-none ${
                  error ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10'
                }`}
              />
            </div>
            {error ? (
              <p className="mt-1 text-[11px] text-rose-500">{error}</p>
            ) : parsedNum > 0 ? (
              <p className="mt-1.5 text-xs text-slate-600 font-medium">
                अक्षरी: <span className="text-slate-900 font-semibold">{formatINR(parsedNum)}</span>
              </p>
            ) : null}
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-500 space-y-1">
            <p>💡 हे बजेट तुमच्या घराच्या संपूर्ण बांधकामाचा एकूण अंदाजित खर्च आहे.</p>
            <p>तुम्ही हे बजेट नंतर कधीही बदलू शकता.</p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-2">
            {!isFirstTime && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              >
                रद्द करा
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-5 py-2 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>जतन करत आहे...</span>
                </>
              ) : (
                <span>बजेट जतन करा</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
