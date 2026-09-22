import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { marathiDataService } from '../services/marathiDataService';

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
  const [loading, setLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);

  // Load all budget data
  const refreshData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [sum, cats, expList] = await Promise.all([
        marathiDataService.getSummary(user.id),
        marathiDataService.getCategories(user.id),
        marathiDataService.getExpenses(user.id)
      ]);

      setSummary(sum);
      setCategories(cats);
      setExpenses(expList);

      // Check if budget is not set yet
      if (!sum.totalBudget || sum.totalBudget === 0) {
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
      setLoading(false);
    }
  }, [user, refreshData]);

  // Update budget
  const updateBudget = async (newBudget) => {
    if (!user) return;
    await marathiDataService.updateBudget(user.id, newBudget);
    await refreshData();
  };

  // Add category
  const addCategory = async (name) => {
    if (!user) return null;
    const newCat = await marathiDataService.addCategory(user.id, name);
    const updatedCats = await marathiDataService.getCategories(user.id);
    setCategories(updatedCats);
    return newCat;
  };

  // Update category
  const updateCategory = async (id, name) => {
    if (!user) return;
    await marathiDataService.updateCategory(user.id, id, name);
    await refreshData();
  };

  // Delete category
  const deleteCategory = async (id) => {
    if (!user) return;
    await marathiDataService.deleteCategory(user.id, id);
    await refreshData();
  };

  // Add expense
  const addExpense = async (data, photo) => {
    if (!user) return;
    const added = await marathiDataService.addExpense(user.id, data, photo);
    await refreshData();
    return added;
  };

  // Update expense
  const updateExpense = async (id, data, photo, removePhoto) => {
    if (!user) return;
    const updated = await marathiDataService.updateExpense(user.id, id, data, photo, removePhoto);
    await refreshData();
    return updated;
  };

  // Delete expense
  const deleteExpense = async (id, photoPath) => {
    if (!user) return;
    await marathiDataService.deleteExpense(user.id, id, photoPath);
    await refreshData();
  };

  const value = {
    summary,
    categories,
    expenses,
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
    deleteExpense
  };

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
};
