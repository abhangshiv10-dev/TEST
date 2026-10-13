import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  IndianRupee,
  Settings,
  Menu,
  X,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AppLogo from '../common/AppLogo';
import LanguageSwitcher from '../common/LanguageSwitcher';
import NotificationBell from './NotificationBell';
import ProfileMenu from './ProfileMenu';
import { useLanguage } from '../../i18n/LanguageContext';

export default function Header() {
  const { isSuperAdmin } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { labelKey: 'nav.home', path: '/', icon: Home },
    { labelKey: 'nav.expenses', path: '/expenses', icon: IndianRupee },
    // Settings & management and Admin are only visible to Super Admin users
    ...(isSuperAdmin
      ? [{ labelKey: 'nav.settings', path: '/settings', icon: Settings }, { labelKey: 'nav.admin', path: '/admin', icon: ShieldCheck }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Icon Only */}
          <Link to="/" className="flex items-center group" title={t('app.name')}>
            <AppLogo className="w-10 h-10" rounded="rounded-xl" />
          </Link>

          {/* Center: Desktop Navigation (Pill Style) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    active
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t(link.labelKey)}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Notifications, language, profile */}
          <div className="flex items-center gap-2.5">
            {/* Notifications */}
            <NotificationBell />

            {/* Language: मराठी | English */}
            <LanguageSwitcher />

            {/* Profile icon (desktop): mobile number + Logout */}
            <div className="hidden md:block">
              <ProfileMenu />
            </div>

            {/* Mobile hamburger menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-[2px]"
              aria-label={t('nav.menu')}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-100 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-150">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold ${
                    active ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t(link.labelKey)}</span>
                </Link>
              );
            })}

            {/* Profile icon (mobile): mobile number + Logout open below it */}
            <div className="pt-2 mt-1 border-t border-slate-100 px-1">
              <ProfileMenu inline onDone={() => setMobileMenuOpen(false)} />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
