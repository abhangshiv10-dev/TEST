import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { BudgetProvider } from './contexts/BudgetContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AuthProvider>
          <BudgetProvider>
            <AppRoutes />
          </BudgetProvider>
        </AuthProvider>
      </BrowserRouter>
    </LanguageProvider>
  );
}
