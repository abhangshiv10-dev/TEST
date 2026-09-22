import React, { useState } from 'react';
import {
  IndianRupee,
  Layers,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Sparkles,
  Loader2,
  Shield,
  Wallet,
  History,
  TrendingUp,
  Clock,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../contexts/AuthContext';
import { useBudget } from '../contexts/BudgetContext';
import { formatINR } from '../utils/marathiCurrency';
import { formatMarathiDateTime } from '../utils/marathiDate';
import { getCategoryIconMeta } from '../utils/categoryIcons';

export default function Settings() {
  const { user } = useAuth();
  const {
    summary,
    categories,
    budgetHistory = [],
    updateBudget,
    addCategory,
    updateCategory,
    deleteCategory
  } = useBudget();

  // Budget editing state
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetMode, setBudgetMode] = useState('add'); // 'add' or 'set'
  const [budgetInput, setBudgetInput] = useState('');
  const [budgetSaving, setBudgetSaving] = useState(false);

  // Category inline add/edit state
  const [newCatName, setNewCatName] = useState('');
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingCatName, setEditingCatName] = useState('');

  // Handle Budget Save
  const handleSaveBudget = async (e) => {
    e.preventDefault();
    const val = Number(budgetInput);
    if (!budgetInput || isNaN(val) || val <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'अवैध रक्कम',
        text: 'कृपया योग्य रक्कम टाका.'
      });
      return;
    }

    const currentBudget = Number(summary.totalBudget) || 0;
    const finalBudget = budgetMode === 'add' ? currentBudget + val : val;

    try {
      setBudgetSaving(true);
      await updateBudget(finalBudget, budgetMode, val);
      setIsEditingBudget(false);
      setBudgetInput('');
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: budgetMode === 'add' 
          ? `बजेटमध्ये ${formatINR(val)} वाढवले! (एकूण: ${formatINR(finalBudget)})` 
          : 'बजेट यशस्वीरित्या बदलले',
        showConfirmButton: false,
        timer: 2200
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'त्रुटी',
        text: 'बजेट जतन करता आले नाही.'
      });
    } finally {
      setBudgetSaving(false);
    }
  };

  // Handle Add Category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) return;

    try {
      await addCategory(trimmed);
      setNewCatName('');
      setIsAddingCat(false);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `"${trimmed}" प्रकार जोडला`,
        showConfirmButton: false,
        timer: 2000
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'त्रुटी',
        text: err.message || 'प्रकार जोडता आला नाही.'
      });
    }
  };

  // Handle Update Category
  const handleUpdateCategory = async (catId) => {
    const trimmed = editingCatName.trim();
    if (!trimmed) return;

    try {
      await updateCategory(catId, trimmed);
      setEditingCatId(null);
      setEditingCatName('');
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'नाव बदलले',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'त्रुटी',
        text: err.message || 'नाव बदलता आले नाही.'
      });
    }
  };

  // Handle Delete Category
  const handleDeleteCategory = async (category) => {
    const result = await Swal.fire({
      title: 'प्रकार हटवायचा आहे?',
      html: `<b>"${category.name}"</b> हा प्रकार कायमचा हटवला जाईल.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0f172a',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'हटवा',
      cancelButtonText: 'रद्द करा'
    });

    if (result.isConfirmed) {
      try {
        await deleteCategory(category.id);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'प्रकार हटवला',
          showConfirmButton: false,
          timer: 1500
        });
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'हटवता आले नाही',
          text: err.message
        });
      }
    }
  };

  return (
    <div className="space-y-6 pb-20 sm:pb-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pt-1">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          सेटिंग्ज आणि व्यवस्थापन
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
          बांधकाम बजेट, खर्चाचे प्रकार आणि वापरकर्ता प्रोफाइल
        </p>
      </div>

      {/* Two-Column Responsive Grid on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Budget & User Profile */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. Budget Settings Card */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs shadow-xs">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    बांधकाम बजेट
                  </h3>
                  <p className="text-[11px] text-slate-500 font-normal">
                    घराच्या बांधकामासाठी निश्चित केलेले बजेट
                  </p>
                </div>
              </div>

              {!isEditingBudget && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setBudgetMode('add');
                      setBudgetInput('');
                      setIsEditingBudget(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-2xs flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>बजेट वाढवा</span>
                  </button>
                  <button
                    onClick={() => {
                      setBudgetMode('set');
                      setBudgetInput(String(summary.totalBudget || ''));
                      setIsEditingBudget(true);
                    }}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-all shadow-2xs"
                  >
                    बदला
                  </button>
                </div>
              )}
            </div>

            {isEditingBudget ? (
              <form onSubmit={handleSaveBudget} className="pt-2 space-y-3 bg-slate-50/80 p-4 rounded-xl border border-slate-200 animate-in fade-in duration-150">
                {/* Mode Selector Tabs */}
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-200/60 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setBudgetMode('add');
                      setBudgetInput('');
                    }}
                    className={`py-1.5 rounded-lg transition-all ${
                      budgetMode === 'add'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    बजेट वाढवा (Add)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBudgetMode('set');
                      setBudgetInput(String(summary.totalBudget || ''));
                    }}
                    className={`py-1.5 rounded-lg transition-all ${
                      budgetMode === 'set'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    थेट बदला (Set Total)
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {budgetMode === 'add' ? 'जोडायची / वाढवायची रक्कम (₹)' : 'नवीन एकूण बजेट (₹)'}
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-slate-400 font-bold text-base pointer-events-none">
                      {budgetMode === 'add' ? '+₹' : '₹'}
                    </span>
                    <input
                      type="number"
                      step="any"
                      autoFocus
                      value={budgetInput}
                      onChange={(e) => setBudgetInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-base font-bold text-slate-900 bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-slate-900"
                      placeholder={budgetMode === 'add' ? 'उदा. 100000' : 'उदा. 2500000'}
                    />
                  </div>
                </div>

                {/* Quick Add Buttons in Add mode */}
                {budgetMode === 'add' && (
                  <div className="grid grid-cols-4 gap-1">
                    {[50000, 100000, 200000, 500000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setBudgetInput(String(amt))}
                        className={`py-1 px-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
                          Number(budgetInput) === amt
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        +{formatINR(amt)}
                      </button>
                    ))}
                  </div>
                )}

                {/* Live Preview of resulting total */}
                {Number(budgetInput) > 0 && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
                    <span className="text-emerald-900 font-medium">
                      {budgetMode === 'add' ? 'एकूण नवीन बजेट होईल:' : 'नवीन निश्चित बजेट:'}
                    </span>
                    <span className="font-bold text-emerald-950 text-sm">
                      {formatINR(
                        budgetMode === 'add'
                          ? (Number(summary.totalBudget) || 0) + Number(budgetInput)
                          : Number(budgetInput)
                      )}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsEditingBudget(false)}
                    className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    रद्द करा
                  </button>
                  <button
                    type="submit"
                    disabled={budgetSaving}
                    className="px-4 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    {budgetSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{budgetMode === 'add' ? 'बजेट वाढवा' : 'जतन करा'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">चालू एकूण बजेट:</span>
                <span className="text-lg font-bold text-slate-900">
                  {formatINR(summary.totalBudget)}
                </span>
              </div>
            )}
          </div>

          {/* 2. Budget Revision & Addition History Card */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center text-xs shadow-xs">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span>बजेट बदल व वाढीचा इतिहास</span>
                    {budgetHistory.length > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {budgetHistory.length}
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-normal">
                    सुरुवातीचे बजेट व त्यानंतर केलेल्या वाढीचा संपूर्ण ट्रॅक
                  </p>
                </div>
              </div>
            </div>

            {/* History Items List */}
            {budgetHistory && budgetHistory.length > 0 ? (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1 divide-y divide-slate-100">
                {budgetHistory.map((item, idx) => {
                  const isInitial = item.change_type === 'initial' || (idx === budgetHistory.length - 1 && Number(item.previous_budget) === 0);
                  const isAdd = item.change_type === 'add';

                  return (
                    <div key={item.id || idx} className="pt-3 first:pt-0 flex items-start justify-between gap-3 text-xs">
                      <div className="flex items-start gap-2.5">
                        {/* Timeline Icon */}
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          isInitial
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isAdd
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}>
                          {isInitial ? (
                            <IndianRupee className="w-3.5 h-3.5" />
                          ) : isAdd ? (
                            <TrendingUp className="w-3.5 h-3.5" />
                          ) : (
                            <RefreshCw className="w-3.5 h-3.5" />
                          )}
                        </div>

                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>
                              {isInitial
                                ? 'सुरुवातीचे बजेट'
                                : isAdd
                                ? `+ ${formatINR(item.amount_changed)} वाढवले`
                                : `बजेट बदलून ${formatINR(item.new_budget)} केले`}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500 font-normal mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{formatMarathiDateTime(item.created_at)}</span>
                          </div>

                          {Number(item.previous_budget) > 0 && isAdd && (
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              (आधीचे: {formatINR(item.previous_budget)} ➔ नवीन एकूण: {formatINR(item.new_budget)})
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-slate-900 block">
                          {formatINR(item.new_budget)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {isInitial ? 'पहिले बजेट' : 'त्यावेळचे बजेट'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500 space-y-1">
                <Clock className="w-5 h-5 text-slate-400 mx-auto" />
                <p className="font-semibold text-slate-700">अजून कोणताही बजेट बदल नोंदवलेला नाही.</p>
                <p className="text-[11px] text-slate-400">तुम्ही बजेट वाढवल्यावर किंवा बदलल्यावर सर्व नोंदी इथे ट्रॅक होतील.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Categories Management */}
        <div className="lg:col-span-7">
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    खर्चाचे प्रकार (Categories)
                  </h3>
                  <p className="text-[11px] text-slate-500 font-normal">
                    नवीन प्रकार जोडा किंवा अस्तित्वात असलेले नाव बदला
                  </p>
                </div>
              </div>

              {!isAddingCat && (
                <button
                  onClick={() => setIsAddingCat(true)}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>नवीन प्रकार</span>
                </button>
              )}
            </div>

            {/* Inline Add Category Form */}
            {isAddingCat && (
              <form onSubmit={handleAddCategory} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 animate-in fade-in duration-150">
                <label className="block text-xs font-semibold text-slate-700">
                  नवीन प्रकाराचे नाव
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    autoFocus
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="उदा. इंटिरिअर डेकोरेशन"
                    className="flex-1 px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCat(false);
                      setNewCatName('');
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 shadow-xs"
                  >
                    जोडा
                  </button>
                </div>
              </form>
            )}

            {/* Categories List */}
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden max-h-[500px] overflow-y-auto">
              {categories.map((cat) => {
                const isEditing = editingCatId === cat.id;
                const { icon: CatIcon, bg: iconBg } = getCategoryIconMeta(cat.name);

                return (
                  <div
                    key={cat.id}
                    className="p-3 flex items-center justify-between hover:bg-slate-50/80 transition-colors text-xs sm:text-sm"
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2 w-full">
                        <input
                          type="text"
                          autoFocus
                          value={editingCatName}
                          onChange={(e) => setEditingCatName(e.target.value)}
                          className="flex-1 px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateCategory(cat.id)}
                          className="p-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
                          title="जतन करा"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCatId(null)}
                          className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-lg"
                          title="रद्द करा"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${iconBg}`}>
                            <CatIcon className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-semibold text-slate-800">{cat.name}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCatId(cat.id);
                              setEditingCatName(cat.name);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="नाव बदला"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="हटवा"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
