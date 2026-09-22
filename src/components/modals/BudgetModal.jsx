import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, IndianRupee, Loader2, Plus, ArrowRight, RefreshCw } from 'lucide-react';
import { formatINR } from '../../utils/marathiCurrency';

export default function BudgetModal({
  isOpen,
  currentBudget = 0,
  isFirstTime = false,
  onClose,
  onSave
}) {
  const [mode, setMode] = useState('add'); // 'add' (वाढवा) or 'set' (थेट बदला)
  const [addAmount, setAddAmount] = useState('');
  const [setAmount, setSetAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (currentBudget > 0 && !isFirstTime) {
        setMode('add');
        setAddAmount('');
        setSetAmount(String(currentBudget));
      } else {
        setMode('set');
        setAddAmount('');
        setSetAmount('');
      }
      setError('');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, currentBudget, isFirstTime]);

  if (!isOpen) return null;

  const currentNum = Number(currentBudget) || 0;
  const addNum = Number(addAmount) || 0;
  const setNum = Number(setAmount) || 0;

  // Calculate final target budget
  const finalBudget = mode === 'add' ? currentNum + addNum : setNum;

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'add') {
      if (!addAmount || isNaN(addNum) || addNum <= 0) {
        setError('कृपया वाढवायची योग्य रक्कम टाका.');
        return;
      }
    } else {
      if (!setAmount || isNaN(setNum) || setNum <= 0) {
        setError('कृपया योग्य एकूण बजेट रक्कम टाका.');
        return;
      }
    }

    try {
      setSaving(true);
      await onSave(finalBudget);
      onClose();
    } catch (err) {
      console.error('Save budget error:', err);
      setError('बजेट जतन करताना त्रुटी आली.');
    } finally {
      setSaving(false);
    }
  };

  const QUICK_ADD_AMOUNTS = [50000, 100000, 200000, 500000];

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                {isFirstTime ? 'आपले बांधकाम बजेट निश्चित करा' : 'बांधकाम बजेट व्यवस्थापन'}
              </h2>
              <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                {isFirstTime ? 'घरासाठी अंदाजित एकूण रक्कम टाका' : 'बजेट वाढवा किंवा थेट बदला'}
              </p>
            </div>
          </div>
          {!isFirstTime && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Mode Selector Tabs (only if not first time and currentBudget > 0) */}
        {!isFirstTime && currentNum > 0 && (
          <div className="p-3 bg-slate-50/80 border-b border-slate-100 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setMode('add');
                setError('');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === 'add'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200 ring-2 ring-slate-900/10'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>+ बजेट वाढवा (Add)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('set');
                setError('');
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === 'set'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200 ring-2 ring-slate-900/10'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              <span>थेट बदला (Set Total)</span>
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-4 sm:p-5 space-y-4">
          {mode === 'add' && currentNum > 0 ? (
            /* Mode 1: Add to existing budget */
            <div className="space-y-3.5">
              {/* Current Budget Info banner */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">सध्याचे चालू बजेट:</span>
                <span className="text-sm font-bold text-slate-900">{formatINR(currentNum)}</span>
              </div>

              {/* Input for amount to add */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  जोडायची / वाढवायची रक्कम (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-slate-400 font-bold text-base pointer-events-none">+₹</span>
                  <input
                    type="number"
                    step="any"
                    autoFocus
                    value={addAmount}
                    onChange={(e) => {
                      setAddAmount(e.target.value);
                      setError('');
                    }}
                    placeholder="उदा. 100000"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 rounded-xl text-base font-bold text-slate-900 transition-colors"
                  />
                </div>
                {error && <p className="mt-1 text-[11px] text-rose-500 font-medium">{error}</p>}
              </div>

              {/* Quick Add Preset Buttons */}
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                  जलद पर्याय:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {QUICK_ADD_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setAddAmount(String(amt));
                        setError('');
                      }}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        addNum === amt
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      +{formatINR(amt)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Total Calculation Result Card */}
              {addNum > 0 && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1.5 animate-in fade-in">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>चालू बजेट:</span>
                    <span className="font-semibold text-slate-800">{formatINR(currentNum)}</span>
                  </div>
                  <div className="flex items-center justify-between text-emerald-700 font-semibold">
                    <span>+ नवीन वाढवलेली रक्कम:</span>
                    <span>+{formatINR(addNum)}</span>
                  </div>
                  <div className="pt-1.5 border-t border-emerald-200 flex items-center justify-between text-emerald-950 font-bold text-sm">
                    <span>एकूण नवीन बजेट होईल:</span>
                    <span className="text-base font-extrabold">{formatINR(finalBudget)}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Mode 2: Set/Replace Total Budget */
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isFirstTime ? 'एकूण अंदाजित बजेट (₹)' : 'एकूण नवीन बजेट (₹)'} <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-slate-400 font-bold text-base pointer-events-none">₹</span>
                  <input
                    type="number"
                    step="any"
                    autoFocus
                    value={setAmount}
                    onChange={(e) => {
                      setSetAmount(e.target.value);
                      setError('');
                    }}
                    placeholder="उदा. 2500000"
                    className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-slate-200 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 rounded-xl text-base font-bold text-slate-900 transition-colors"
                  />
                </div>
                {error ? (
                  <p className="mt-1 text-[11px] text-rose-500 font-medium">{error}</p>
                ) : setNum > 0 ? (
                  <p className="mt-1 text-xs text-slate-600 font-medium">
                    अक्षरी: <span className="text-slate-900 font-bold">{formatINR(setNum)}</span>
                  </p>
                ) : null}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500 space-y-1">
                <p>💡 हे बजेट तुमच्या घराच्या संपूर्ण बांधकामाचा एकूण निश्चित केलेला खर्च आहे.</p>
                <p>तुम्ही हे बजेट गरजेनुसार नंतर कधीही वाढवू किंवा बदलू शकता.</p>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            {!isFirstTime && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors text-center border border-slate-200 sm:border-transparent"
              >
                रद्द करा
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="flex-1 sm:flex-none px-5 py-2.5 text-xs sm:text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-95"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>जतन करत आहे...</span>
                </>
              ) : (
                <span>
                  {mode === 'add' && currentNum > 0
                    ? `+ ${addNum > 0 ? formatINR(addNum) : ''} बजेटमध्ये जोडा`
                    : 'बजेट जतन करा'}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
