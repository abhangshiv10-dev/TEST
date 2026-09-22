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
  RefreshCw,
  Receipt,
  FileSpreadsheet,
  Download,
  Share2,
  FileText,
  Eye
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../contexts/AuthContext';
import { useBudget } from '../contexts/BudgetContext';
import { formatINR } from '../utils/marathiCurrency';
import { formatMarathiDateTime } from '../utils/marathiDate';
import { getCategoryIconMeta } from '../utils/categoryIcons';
import { SingleExpenseReceiptModal } from '../components/receipts/SingleExpenseReceiptModal';
import { ReportReceiptModal } from '../components/receipts/ReportReceiptModal';

export default function Settings() {
  const { user } = useAuth();
  const {
    summary,
    categories,
    expenses = [],
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

  // Receipt export modals state
  const [reportReceiptOpen, setReportReceiptOpen] = useState(false);
  const [singleReceiptOpen, setSingleReceiptOpen] = useState(false);
  const [selectedReceiptExpenseId, setSelectedReceiptExpenseId] = useState('');

  const currentReceiptExpense = expenses.find(e => e.id === selectedReceiptExpenseId) || expenses[0] || null;

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
          बांधकाम बजेट, खर्चाचे प्रकार, अहवाल पावती व वापरकर्ता प्रोफाइल
        </p>
      </div>

      {/* 🧾 पावती व अहवाल एक्सपोर्ट (PNG / JPG Receipt Export) Section */}
      <div className="glass-card rounded-2xl p-5 border border-emerald-200/80 bg-linear-to-br from-emerald-50/50 via-white to-teal-50/40 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>पावती व अहवाल एक्सपोर्ट (PNG, JPG & WhatsApp)</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  नवीन
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                खर्चाचा पावती अहवाल (जास्तीत जास्त 10 नोंदी) व वैयक्तिक खर्च पावती इमेज स्वरूपात डाऊनलोड करा
              </p>
            </div>
          </div>
        </div>

        {/* 2 Export Options Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option 1: 10 नोंदींचा अहवाल पावती (Template 1) */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 hover:border-blue-300 transition-all shadow-2xs flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-blue-700 font-bold text-xs mb-1">
                <FileSpreadsheet className="w-4 h-4" />
                <span>अहवाल पावती (Report Slip - 10 नोंदी)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                तारीख, एकूण खर्च, नोंदींची संख्या आणि पहिल्या 10 नोंदींसह आकर्षक पावती तयार करा.
              </p>
              <div className="mt-2 text-[11px] text-slate-500">
                उपलब्ध नोंदी: <strong>{expenses.length}</strong> • एकूण: <strong>{formatINR(summary.totalSpent)}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setReportReceiptOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>अहवाल पावती पाहा व एक्सपोर्ट करा</span>
            </button>
          </div>

          {/* Option 2: वैयक्तिक खर्च पावती (Template 2) */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 transition-all shadow-2xs flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs mb-1">
                <FileText className="w-4 h-4" />
                <span>वैयक्तिक खर्च पावती (Single Expense Receipt)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                कोणत्याही एका खर्चाची तपशीलवार डिजिटल पावती (प्रकार, रक्कम, तारीख, तपशील व फोटो) तयार करा.
              </p>

              {/* Expense Selector */}
              {expenses.length > 0 ? (
                <div className="mt-2.5">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    खर्च निवडा:
                  </label>
                  <select
                    value={selectedReceiptExpenseId || expenses[0]?.id}
                    onChange={(e) => setSelectedReceiptExpenseId(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-emerald-600"
                  >
                    {expenses.map((exp) => (
                      <option key={exp.id} value={exp.id}>
                        {exp.category_name} - {formatINR(exp.amount)} ({exp.expense_date})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <p className="mt-2 text-xs text-slate-400 italic">कोणताही खर्च उपलब्ध नाही</p>
              )}
            </div>

            <button
              type="button"
              disabled={expenses.length === 0}
              onClick={() => setSingleReceiptOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs hover:shadow transition-all cursor-pointer disabled:opacity-50"
            >
              <Eye className="w-4 h-4" />
              <span>खर्च पावती पाहा व एक्सपोर्ट करा</span>
            </button>
          </div>
        </div>
      </div>

      {/* Two-Column Responsive Grid on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Budget & User Profile */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. Budget Settings Card */}
          <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs shadow-xs shrink-0">
                  <Wallet className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900">
                    बांधकाम बजेट
                  </h3>
                  <p className="text-[11px] text-slate-500 font-normal">
                    घराच्या बांधकामासाठी निश्चित केलेले बजेट
                  </p>
                </div>
              </div>

              {!isEditingBudget && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setBudgetMode('add');
                      setBudgetInput('');
                      setIsEditingBudget(true);
                    }}
                    className="flex-1 sm:flex-none px-3.5 py-2 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-2xs flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5 shrink-0" />
                    <span>बजेट वाढवा</span>
                  </button>
                  <button
                    onClick={() => {
                      setBudgetMode('set');
                      setBudgetInput(String(summary.totalBudget || ''));
                      setIsEditingBudget(true);
                    }}
                    className="px-3.5 py-2 sm:py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-all shadow-2xs whitespace-nowrap cursor-pointer active:scale-95"
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
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                    {[50000, 100000, 200000, 500000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setBudgetInput(String(amt))}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
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
                    className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
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
          <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center text-xs shadow-xs shrink-0">
                  <History className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                    <span>बजेट बदल व वाढीचा इतिहास</span>
                    {budgetHistory.length > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                        {budgetHistory.length}
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-normal truncate">
                    सुरुवातीचे बजेट व त्यानंतर केलेल्या वाढीचा संपूर्ण ट्रॅक
                  </p>
                </div>
              </div>
            </div>

            {/* History Items List (Fully responsive for mobile & desktop) */}
            {budgetHistory && budgetHistory.length > 0 ? (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {budgetHistory.map((item, idx) => {
                  const isInitial = item.change_type === 'initial' || (idx === budgetHistory.length - 1 && Number(item.previous_budget) === 0);
                  const isAdd = item.change_type === 'add';

                  return (
                    <div
                      key={item.id || idx}
                      className="p-3 rounded-2xl bg-slate-50/90 border border-slate-200/70 space-y-2 hover:bg-slate-100/70 transition-colors shadow-2xs"
                    >
                      {/* Top Row: Title / Change Action + Resulting Amount */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isInitial
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : isAdd
                              ? 'bg-blue-100 text-blue-700 border border-blue-200'
                              : 'bg-purple-100 text-purple-700 border border-purple-200'
                          }`}>
                            {isInitial ? (
                              <IndianRupee className="w-3.5 h-3.5" />
                            ) : isAdd ? (
                              <TrendingUp className="w-3.5 h-3.5" />
                            ) : (
                              <RefreshCw className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                            {isInitial
                              ? 'सुरुवातीचे बजेट'
                              : isAdd
                              ? `+ ${formatINR(item.amount_changed)} वाढवले`
                              : `बजेट बदलून ${formatINR(item.new_budget)} केले`}
                          </span>
                        </div>

                        {/* Amount */}
                        <div className="text-right shrink-0">
                          <span className="text-xs sm:text-sm font-extrabold text-slate-900 block">
                            {formatINR(item.new_budget)}
                          </span>
                        </div>
                      </div>

                      {/* Bottom Row: Timestamp and Stage Label */}
                      <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                        <div className="flex items-center gap-1 font-medium text-slate-500">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{formatMarathiDateTime(item.created_at)}</span>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                          {isInitial ? 'सुरुवातीची नोंद' : 'त्यावेळचे बजेट'}
                        </span>
                      </div>

                      {/* Extra context if add mode */}
                      {Number(item.previous_budget) > 0 && isAdd && (
                        <div className="text-[10px] text-indigo-800 font-medium bg-indigo-50/80 px-2 py-1 rounded-lg border border-indigo-100">
                          आधीचे: {formatINR(item.previous_budget)} ➔ नवीन एकूण: {formatINR(item.new_budget)}
                        </div>
                      )}
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
          <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div className="min-w-0">
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
                  className="self-start sm:self-auto px-3.5 py-2 sm:py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-xs flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 shrink-0" />
                  <span>नवीन प्रकार जोडा</span>
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

      {/* Single Expense Receipt Modal (Template 2) */}
      <SingleExpenseReceiptModal
        isOpen={singleReceiptOpen}
        expense={currentReceiptExpense}
        onClose={() => setSingleReceiptOpen(false)}
      />

      {/* Report Receipt Modal (Template 1 - Max 10 entries) */}
      <ReportReceiptModal
        isOpen={reportReceiptOpen}
        expenses={expenses.slice(0, 10)}
        totalExpenses={summary.totalSpent}
        totalEntries={expenses.length}
        dateRangeText="01 Jan 2026 - 30 Sep 2026"
        onClose={() => setReportReceiptOpen(false)}
      />
    </div>
  );
}
