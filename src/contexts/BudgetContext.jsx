import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth, getAuditActor } from './AuthContext';
import { marathiDataService, computeSummary } from '../services/marathiDataService';
import { useLanguage } from '../i18n/LanguageContext';
import { categoryLabel } from '../i18n/category';
import { isPendingStatus } from '../utils/paymentStatus';
import { auditService } from '../services/auditService';
import { notificationService } from '../services/notificationService';
import { deleteRequestService } from '../services/deleteRequestService';
import { translate } from '../i18n';
import { getExpensePhotos } from '../utils/expensePhotos';
import { formatINR } from '../utils/marathiCurrency';

const BudgetContext = createContext({});

export const useBudget = () => useContext(BudgetContext);

export const BudgetProvider = ({ children }) => {
  const { user, isSuperAdmin } = useAuth();
  const { lang } = useLanguage();
  const [summary, setSummary] = useState({
    totalBudget: 0,
    totalSpent: 0,
    remainingBalance: 0,
    percentUsed: 0,
    todaySpent: 0,
    thisMonthSpent: 0,
    expenseCount: 0,
    categoryBreakdown: []
  });
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [budgetHistory, setBudgetHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);

  // Load all budget data
  const hasLoadedOnce = useRef(false);

  const refreshData = useCallback(async () => {
    if (!user) return;
    try {
      // Show the full-page loader only on the very first load.
      // Later refreshes (after add/edit/delete) update silently in the background.
      if (!hasLoadedOnce.current) setLoading(true);

      // Each table is fetched exactly once, all in parallel.
      // (Before: expenses + settings were fetched twice because getSummary re-fetched them.)
      const [settings, cats, expList, bHistory] = await Promise.all([
        marathiDataService.getSettings(user.id),
        marathiDataService.getCategories(user.id),
        marathiDataService.getExpenses(user.id),
        marathiDataService.getBudgetHistory(user.id)
      ]);
      // Attach each expense's category English Name (used for the English view and for search)
      const catById = new Map(cats.map((c) => [c.id, c]));
      const expensesWithEnglish = expList.map((e) => ({
        ...e,
        category_name_en: catById.get(e.category_id)?.name_en || ''
      }));
      const sum = computeSummary(settings, expensesWithEnglish);
      hasLoadedOnce.current = true;

      setSummary(sum);
      setCategories(cats);
      setExpenses(expensesWithEnglish);
      setBudgetHistory(bHistory || []);

      // Check if budget is not set yet and hasn't been dismissed by user
      const hasDismissed = localStorage.getItem(`budget_prompt_dismissed_${user.id}`);
      if ((!sum.totalBudget || sum.totalBudget === 0) && !hasDismissed) {
        setIsFirstTime(true);
      } else {
        setIsFirstTime(false);
      }
    } catch (err) {
      console.error('Data load error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      hasLoadedOnce.current = false;
      setSummary({
        totalBudget: 0,
        totalSpent: 0,
        remainingBalance: 0,
        percentUsed: 0,
        todaySpent: 0,
        thisMonthSpent: 0,
        expenseCount: 0,
        categoryBreakdown: []
      });
      setCategories([]);
      setExpenses([]);
      setBudgetHistory([]);
      setLoading(false);
    }
  }, [user, refreshData]);

  // ---------- Tracking log (Super Admin panel) ----------
  // Logging never blocks or breaks the real action (auditService.log never throws).
  const logAction = (action, entity, options) => {
    auditService.log(getAuditActor(user), action, entity, options);
  };

  const categoryNameById = (id) => categories.find((c) => c.id === id)?.name || '';
  const categoryEnById = (id) => categories.find((c) => c.id === id)?.name_en || '';

  // Small readable copy of an expense for the log (shown as before -> after)
  const expenseSnapshot = (e) =>
    e
      ? {
          category: e.category_name || categoryNameById(e.category_id),
          amount: Number(e.amount) || 0,
          date: e.expense_date,
          status: isPendingStatus(e.payment_status) ? 'Pending' : 'Paid',
          description: e.description || '',
          photos: getExpensePhotos(e).length
        }
      : null;

  const expenseSummaryParams = (e) => ({
    category: e?.category_name || categoryNameById(e?.category_id) || '-',
    amount: formatINR(e?.amount || 0)
  });

  // Update budget
  const updateBudget = async (newBudget, changeType = 'set', amountChanged = 0, note = '') => {
    if (!user) return;
    const previousBudget = Number(summary.totalBudget) || 0;
    await marathiDataService.updateBudget(user.id, newBudget, changeType, amountChanged, note);
    logAction(previousBudget === 0 ? 'add' : 'update', 'budget', {
      summary:
        previousBudget === 0
          ? translate('admin.log.budgetSet', { to: formatINR(newBudget) })
          : changeType === 'add'
          ? translate('admin.log.budgetIncreased', { amount: formatINR(amountChanged), to: formatINR(newBudget) })
          : translate('admin.log.budgetChanged', { from: formatINR(previousBudget), to: formatINR(newBudget) }),
      before: { budget: previousBudget },
      after: { budget: Number(newBudget) || 0 }
    });
    await refreshData();
  };

  // Add category
  const addCategory = async (name, nameEn) => {
    if (!user) return null;
    const newCat = await marathiDataService.addCategory(user.id, name, nameEn);
    logAction('add', 'category', {
      entityId: newCat?.id,
      summary: translate('admin.log.categoryAdded', { name: nameEn ? `${name} / ${nameEn}` : name }),
      after: { name, name_en: nameEn || '' }
    });
    const updatedCats = await marathiDataService.getCategories(user.id);
    setCategories(updatedCats);
    return newCat;
  };

  // Update category
  const updateCategory = async (id, name, nameEn) => {
    if (!user) return;
    const before = categories.find((c) => c.id === id);
    await marathiDataService.updateCategory(user.id, id, name, nameEn);
    logAction('update', 'category', {
      entityId: id,
      summary: translate('admin.log.categoryUpdated', { name: nameEn ? `${name} / ${nameEn}` : name }),
      before: before ? { name: before.name, name_en: before.name_en || '' } : null,
      after: { name, name_en: nameEn || '' }
    });
    await refreshData();
  };

  // Delete category
  const deleteCategory = async (id) => {
    if (!user) return;
    const before = categories.find((c) => c.id === id);
    await marathiDataService.deleteCategory(user.id, id);
    logAction('delete', 'category', {
      entityId: id,
      summary: translate('admin.log.categoryDeleted', { name: before?.name || '-' }),
      before: before ? { name: before.name, name_en: before.name_en || '' } : null
    });
    await refreshData();
  };

  // Add expense
  const addExpense = async (data, photoFiles = []) => {
    if (!user) return;
    const added = await marathiDataService.addExpense(user.id, data, photoFiles);
    if (added) {
      logAction('add', 'expense', {
        entityId: added.id,
        summary: translate('admin.log.expenseAdded', expenseSummaryParams(added)),
        after: expenseSnapshot(added)
      });
      notificationService.create({
        type: 'expense_added',
        actor: getAuditActor(user),
        audience: 'all',
        data: {
          entity: 'expense',
          category: added.category_name || categoryNameById(added.category_id),
          category_en: categoryEnById(added.category_id),
          amount: Number(added.amount) || 0,
          date: added.expense_date
        }
      });
    }
    await refreshData();
    return added;
  };

  // Update expense
  const updateExpense = async (id, data, newFiles = [], removedPaths = []) => {
    if (!user) return;
    const before = expenses.find((e) => e.id === id);
    const updated = await marathiDataService.updateExpense(user.id, id, data, newFiles, removedPaths);
    if (updated) {
      logAction('update', 'expense', {
        entityId: id,
        summary: translate('admin.log.expenseUpdated', expenseSummaryParams(updated)),
        before: expenseSnapshot(before),
        after: expenseSnapshot(updated)
      });
    }
    await refreshData();
    return updated;
  };

  // Non-SuperAdmin users cannot delete directly: a delete request goes to the Super Admin instead.
  const requestExpenseDelete = async (expense) => {
    const actor = getAuditActor(user);
    const snapshot = {
      ...expenseSnapshot(expense),
      category_en: expense.category_name_en || categoryEnById(expense.category_id),
      photo_paths: getExpensePhotos(expense).map((ph) => ph.path).filter(Boolean)
    };

    const { request, duplicate } = await deleteRequestService.create({
      entity: 'expense',
      entityId: expense.id,
      requester: actor,
      snapshot
    });
    if (duplicate) return { duplicate: true };

    await notificationService.create({
      type: 'delete_request',
      actor,
      audience: 'super_admin',
      requestId: request.id,
      data: {
        entity: 'expense',
        category: snapshot.category,
        category_en: snapshot.category_en,
        amount: snapshot.amount,
        date: snapshot.date
      }
    });
    return { requested: true };
  };

  // Delete expense
  // Super Admin: deleted right away. Everyone else: a delete request is sent ({ requested: true }).
  const deleteExpense = async (id, photoPaths) => {
    if (!user) return;
    const before = expenses.find((e) => e.id === id);

    if (!isSuperAdmin) {
      if (!before) return { requested: false };
      return requestExpenseDelete(before);
    }

    await marathiDataService.deleteExpense(user.id, id, photoPaths);
    logAction('delete', 'expense', {
      entityId: id,
      summary: translate('admin.log.expenseDeleted', expenseSummaryParams(before)),
      before: expenseSnapshot(before)
    });
    await refreshData();
    return { deleted: true };
  };

  const resolutionData = (request) => ({
    entity: request.entity,
    category: request.snapshot?.category || '',
    category_en: request.snapshot?.category_en || '',
    amount: Number(request.snapshot?.amount) || 0,
    date: request.snapshot?.date || ''
  });

  // Super Admin approves: the record is deleted now.
  // Returns { ok: true } or { alreadyHandled: true }
  const approveDeleteRequest = async (request) => {
    if (!user || !isSuperAdmin) return { ok: false };
    const resolver = getAuditActor(user);

    const resolved = await deleteRequestService.resolve(request.id, 'approved', resolver);
    if (!resolved) return { alreadyHandled: true };

    const target = expenses.find((e) => e.id === request.entity_id);
    if (target) {
      const paths = getExpensePhotos(target).map((ph) => ph.path);
      await marathiDataService.deleteExpense(user.id, request.entity_id, paths);
      logAction('delete', 'expense', {
        entityId: request.entity_id,
        summary: translate('admin.log.expenseDeletedApproved', {
          ...expenseSummaryParams(target),
          requester: request.requester_name || request.requester_mobile || '-'
        }),
        before: expenseSnapshot(target)
      });
    }

    await notificationService.create({
      type: 'delete_approved',
      actor: resolver,
      audience: 'user',
      targetMobile: request.requester_mobile,
      requestId: request.id,
      data: resolutionData(request)
    });
    await refreshData();
    return { ok: true };
  };

  // Super Admin rejects: the record stays, the requester is told.
  const rejectDeleteRequest = async (request) => {
    if (!user || !isSuperAdmin) return { ok: false };
    const resolver = getAuditActor(user);

    const resolved = await deleteRequestService.resolve(request.id, 'rejected', resolver);
    if (!resolved) return { alreadyHandled: true };

    await notificationService.create({
      type: 'delete_rejected',
      actor: resolver,
      audience: 'user',
      targetMobile: request.requester_mobile,
      requestId: request.id,
      data: resolutionData(request)
    });
    return { ok: true };
  };

  // Quick Toggle expense payment status (Paid <-> Pending)
  const toggleExpenseStatus = async (expense) => {
    if (!user || !expense) return;
    const newStatus = isPendingStatus(expense.payment_status) ? 'Paid' : 'Pending';
    
    const updated = await marathiDataService.updateExpense(user.id, expense.id, {
      ...expense,
      payment_status: newStatus
    });
    const afterSnapshot = { ...expenseSnapshot(expense), status: newStatus };
    logAction('update', 'expense', {
      entityId: expense.id,
      summary: translate(newStatus === 'Paid' ? 'admin.log.markedPaid' : 'admin.log.markedPending', expenseSummaryParams(expense)),
      before: expenseSnapshot(expense),
      after: afterSnapshot
    });
    await refreshData();
    return newStatus;
  };

  // Categories sorted alphabetically in the selected language
  const sortedCategories = useMemo(
    () =>
      [...categories].sort((a, b) =>
        categoryLabel(a.name, a.name_en, lang).localeCompare(categoryLabel(b.name, b.name_en, lang), lang)
      ),
    [categories, lang]
  );

  const value = {
    summary,
    categories: sortedCategories,
    expenses,
    budgetHistory,
    loading,
    isFirstTime,
    setIsFirstTime,
    refreshData,
    updateBudget,
    addCategory,
    updateCategory,
    deleteCategory,
    addExpense,
    updateExpense,
    deleteExpense,
    approveDeleteRequest,
    rejectDeleteRequest,
    toggleExpenseStatus
  };

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
};
