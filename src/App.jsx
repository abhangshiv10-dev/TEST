import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { BudgetProvider } from './contexts/BudgetContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AuthProvider>
          <BudgetProvider>
            <NotificationsProvider>
              <AppRoutes />
            </NotificationsProvider>
          </BudgetProvider>
        </AuthProvider>
      </BrowserRouter>
    </LanguageProvider>
  );
}
