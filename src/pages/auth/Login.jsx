import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Lock, Loader2, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { toast, alertBox } from '../../utils/alerts';
import { errorMessage } from '../../utils/appError';
import { useLanguage } from '../../i18n/LanguageContext';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import { useAuth, ALLOWED_MOBILES } from '../../contexts/AuthContext';
import loginBg from '../../assets/login-bg.webp';
import AppLogo from '../../components/common/AppLogo';

export default function Login() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signInWithMobile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const cleanMobile = mobile.trim().replace(/\D/g, '').slice(-10);
    
    if (!cleanMobile || cleanMobile.length < 10) {
      alertBox('warning', t('auth.login.mobileRequiredTitle'), t('auth.login.mobileRequiredText'));
      return;
    }

    if (!password) {
      alertBox('warning', t('auth.login.passwordRequiredTitle'), t('auth.login.passwordRequiredText'));
      return;
    }

    try {
      setLoading(true);
      await signInWithMobile(cleanMobile, password);
      
      toast('success', t('auth.login.success'), 1500);
      
      navigate('/');
    } catch (err) {
      alertBox('error', t('auth.login.failedTitle'), errorMessage(err, 'auth.login.failedText'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 selection:bg-slate-900 selection:text-white relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      {/* Subtle backdrop tint overlay for perfect contrast */}
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] pointer-events-none" />

      {/* Language: मराठी | English */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md bg-white/85 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/60 space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <AppLogo className="w-16 h-16 mx-auto shadow-lg ring-4 ring-slate-900/5" rounded="rounded-2xl" />
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t('app.name')}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            {t('app.tagline')}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 pt-2">
          {/* Mobile Number Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {t('auth.login.mobileLabel')}
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3 flex items-center gap-1.5 text-slate-400">
                <Phone className="w-4 h-4" />
                <span className="text-xs font-semibold text-slate-500 border-r border-slate-200 pr-1.5">+91</span>
              </div>
              <input
                type="tel"
                required
                maxLength={10}
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                placeholder={t('auth.login.mobilePlaceholder')}
                className="w-full pl-16 pr-3 py-2.5 bg-white/90 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all shadow-xs"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {t('auth.login.passwordLabel')}
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••"
                className="w-full pl-9 pr-10 py-2.5 bg-white/90 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all shadow-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('auth.login.submitting')}</span>
              </>
            ) : (
              <span>{t('auth.login.submit')}</span>
            )}
          </button>
        </form>

        {/* Security Badge */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t('auth.login.secure')}</span>
        </div>
      </div>
    </div>
  );
}

