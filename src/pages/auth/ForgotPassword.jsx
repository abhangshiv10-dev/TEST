import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { alertBox } from '../../utils/alerts';
import { errorMessage } from '../../utils/appError';
import { useLanguage } from '../../i18n/LanguageContext';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import { supabase, isSupabaseConfigured } from '../../services/supabaseClient';

export default function ForgotPassword() {
  const { t, tRich } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
      }
      setSent(true);
    } catch (err) {
      alertBox('error', t('common.error'), errorMessage(err, 'auth.forgot.failedText'));
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
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white mx-auto flex items-center justify-center text-xl shadow-md">
            🔐
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            {t('auth.forgot.title')}
          </h1>
          <p className="text-xs text-slate-500">
            {t('auth.forgot.subtitle')}
          </p>
        </div>

        {sent ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 text-emerald-800 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <p className="font-semibold text-sm">{t('auth.forgot.sentTitle')}</p>
            <p className="text-emerald-700">
              {tRich('auth.forgot.sentText', { email: <strong>{email}</strong> })}
            </p>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1 font-bold text-slate-900 hover:underline text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('auth.forgot.backToLogin')}</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t('auth.forgot.email')}
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.forgot.emailPlaceholder')}
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-[2px] text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('auth.forgot.submitting')}</span>
                </>
              ) : (
                <span>{t('auth.forgot.submit')}</span>
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('auth.forgot.backToLogin')}</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
