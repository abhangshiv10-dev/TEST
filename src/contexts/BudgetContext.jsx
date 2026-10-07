import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { marathiDataService, computeSummary } from '../services/marathiDataService';

const BudgetContext = createContext({});

export const useBudget = () => useContext(BudgetContext);

export const BudgetProvider = ({ children }) => {
  const { user } = useAuth();
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
      const sum = computeSummary(settings, expList);
      hasLoadedOnce.current = true;

      setSummary(sum);
      setCategories(cats);
      // Attach each expense's category English Name so Marathi/English search finds it
      const catById = new Map(cats.map((c) => [c.id, c]));
      setExpenses(
        expList.map((e) => ({
          ...e,
          category_name_en: catById.get(e.category_id)?.name_en || ''
        }))
      );
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

  // Update budget
  const updateBudget = async (newBudget, changeType = 'set', amountChanged = 0, note = '') => {
    if (!user) return;
    await marathiDataService.updateBudget(user.id, newBudget, changeType, amountChanged, note);
    await refreshData();
  };

  // Add category
  const addCategory = async (name, nameEn) => {
    if (!user) return null;
    const newCat = await marathiDataService.addCategory(user.id, name, nameEn);
    const updatedCats = await marathiDataService.getCategories(user.id);
    setCategories(updatedCats);
    return newCat;
  };

  // Update category
  const updateCategory = async (id, name, nameEn) => {
    if (!user) return;
    await marathiDataService.updateCategory(user.id, id, name, nameEn);
    await refreshData();
  };

  // Delete category
  const deleteCategory = async (id) => {
    if (!user) return;
    await marathiDataService.deleteCategory(user.id, id);
    await refreshData();
  };

  // Add expense
  const addExpense = async (data, photoFiles = []) => {
    if (!user) return;
    const added = await marathiDataService.addExpense(user.id, data, photoFiles);
    await refreshData();
    return added;
  };

  // Update expense
  const updateExpense = async (id, data, newFiles = [], removedPaths = []) => {
    if (!user) return;
    const updated = await marathiDataService.updateExpense(user.id, id, data, newFiles, removedPaths);
    await refreshData();
    return updated;
  };

  // Delete expense
  const deleteExpense = async (id, photoPaths) => {
    if (!user) return;
    await marathiDataService.deleteExpense(user.id, id, photoPaths);
    await refreshData();
  };

  // Quick Toggle expense payment status (Paid <-> Pending)
  const toggleExpenseStatus = async (expense) => {
    if (!user || !expense) return;
    const currentStatus = (expense.payment_status || 'Paid').toLowerCase();
    const newStatus = currentStatus === 'pending' || expense.payment_status === 'बाकी' ? 'Paid' : 'Pending';
    
    const updated = await marathiDataService.updateExpense(user.id, expense.id, {
      ...expense,
      payment_status: newStatus
    });
    await refreshData();
    return newStatus;
  };

  const value = {
    summary,
    categories,
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
    toggleExpenseStatus
  };

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
};
