import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Loader2 } from 'lucide-react';
import { alertBox } from '../../utils/alerts';
import { errorMessage } from '../../utils/appError';
import { useLanguage } from '../../i18n/LanguageContext';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import { useAuth } from '../../contexts/AuthContext';
import AppLogo from '../../components/common/AppLogo';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      alertBox('warning', t('auth.register.incompleteTitle'), t('auth.register.incompleteText'));
      return;
    }

    if (password !== confirmPassword) {
      alertBox('error', t('auth.register.mismatchTitle'), t('auth.register.mismatchText'));
      return;
    }

    try {
      setLoading(true);
      await signUp(email, password, fullName);
      alertBox('success', t('auth.register.successTitle'), t('auth.register.successText'), { confirmButtonColor: '#0f172a' });
      navigate('/');
    } catch (err) {
      alertBox('error', t('auth.register.failedTitle'), errorMessage(err, 'auth.register.failedText'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 selection:bg-slate-900 selection:text-white relative">
      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-card space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <AppLogo className="w-14 h-14 mx-auto shadow-md" rounded="rounded-2xl" />
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            {t('auth.register.title')}
          </h1>
          <p className="text-xs text-slate-500">
            {t('auth.register.subtitle')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('auth.register.fullName')}
            </label>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-slate-400 absolute left-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t('auth.register.fullNamePlaceholder')}
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('auth.register.email')}
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.register.emailPlaceholder')}
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('auth.register.password')}
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.register.passwordPlaceholder')}
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('auth.register.confirmPassword')}
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('auth.register.submitting')}</span>
              </>
            ) : (
              <span>{t('auth.register.submit')}</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500">
          {t('auth.register.haveAccount')}{' '}
          <Link to="/login" className="font-bold text-slate-900 hover:underline">
            {t('auth.register.loginLink')}
          </Link>
        </div>
      </div>
    </div>
  );
}
