import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Loader2 } from 'lucide-react';
import { useAuth, getUserMobile } from '../../contexts/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';

// User profile icon. Click -> logged-in mobile number + Logout button.
//  - default : icon with a dropdown (desktop navbar)
//  - inline  : icon inside the mobile hamburger menu, the details open right below it
export default function ProfileMenu({ inline = false, onDone }) {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const wrapRef = useRef(null);

  const mobile = getUserMobile(user);

  // Close on outside click / Escape (dropdown only)
  useEffect(() => {
    if (!open || inline) return undefined;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, inline]);

  const handleLogout = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await signOut(); // clears the saved session on this device and signs out of Supabase
    } catch (err) {
      console.warn('Logout warning:', err?.message);
    }
    onDone?.();
    navigate('/login', { replace: true });
  };

  const details = (
    <div className={inline ? 'mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-3' : 'p-3 space-y-3'}>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-slate-500">{t('nav.loggedInMobile')}</p>
        <p className="text-sm font-bold text-slate-900 break-all">{mobile ? `+91 ${mobile}` : t('nav.user')}</p>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={busy}
        className="w-full px-3 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-[2px] flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-60"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
        <span>{t('nav.logout')}</span>
      </button>
    </div>
  );

  return (
    <div ref={wrapRef} className={inline ? '' : 'relative'}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title={t('nav.user')}
        aria-label={t('nav.user')}
        aria-expanded={open}
        className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs hover:bg-slate-200 transition-colors"
      >
        <User className="w-4 h-4 text-slate-600" />
      </button>

      {open &&
        (inline ? (
          details
        ) : (
          <div className="absolute right-0 top-full mt-2 w-60 z-50 rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden">
            {details}
          </div>
        ))}
    </div>
  );
}
