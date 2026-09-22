import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DataService } from '../services/dataService';
import { useProject } from './ProjectContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { currentProject, summary, materials, budgets, expenses, tasks } = useProject();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!currentProject?.id) return;
    const list = await DataService.getNotifications(currentProject.id);
    setNotifications(list || []);
    setUnreadCount((list || []).filter(n => !n.is_read).length);
  }, [currentProject?.id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Dynamically generate realtime warnings for budgets and stock
  useEffect(() => {
    if (!currentProject) return;

    // Check low stock
    materials.forEach(mat => {
      if (Number(mat.current_stock) <= Number(mat.minimum_stock)) {
        const existing = notifications.find(n => n.type === 'low_stock' && n.message.includes(mat.name));
        if (!existing) {
          DataService.createNotification({
            project_id: currentProject.id,
            type: 'low_stock',
            title: `Low Stock: ${mat.name}`,
            message: `${mat.name} is low (${mat.current_stock} ${mat.unit} remaining). Re-order recommended.`,
            is_read: false
          });
        }
      }
    });

    // Check budget thresholds (>80%, >90%, >100%)
    if (summary.totalBudget > 0 && summary.budgetUsedPct >= 80) {
      const existing = notifications.find(n => n.type === 'budget_warning');
      if (!existing && summary.budgetUsedPct >= 90) {
        DataService.createNotification({
          project_id: currentProject.id,
          type: 'budget_warning',
          title: 'Critical Budget Alert (>90%)',
          message: `Your project has utilized ${summary.budgetUsedPct}% of the allocated budget!`,
          is_read: false
        });
      }
    }
  }, [materials, budgets, expenses, summary, currentProject, notifications]);

  const markAsRead = async (id) => {
    await DataService.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    notifications.forEach(n => {
      if (!n.is_read) DataService.markNotificationRead(n.id);
    });
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      refreshNotifications: fetchNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
