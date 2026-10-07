import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AppLayout from '../components/layout/AppLayout';

const Dashboard = lazy(() => import('../pages/Dashboard'));
const Expenses = lazy(() => import('../pages/Expenses'));
const Settings = lazy(() => import('../pages/Settings'));
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));

const PageFallback = () => (
  <div className="min-h-[40vh] flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
  </div>
);

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2 text-slate-500 text-xs">
          <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <span>लोड होत आहे...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Only Route (Redirect to / if logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
    <Routes>
      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />

      {/* Protected App Routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
}
