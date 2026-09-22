import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  ChevronDown, 
  Plus, 
  LogOut, 
  Building, 
  Check, 
  AlertTriangle,
  User
} from 'lucide-react';
import { useProject } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatDate } from '../../utils/date';
import { useNavigate } from 'react-router-dom';

export const TopHeader = ({ onOpenSidebar, onOpenSearch, onOpenNewProject }) => {
  const { projects, currentProject, switchProject } = useProject();
  const { user, profile, logout, isDemoMode } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const projectRef = useRef(null);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (projectRef.current && !projectRef.current.contains(e.target)) setProjectMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifMenuOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Left side: Hamburger & Project Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Project Selector Dropdown */}
        <div ref={projectRef} className="relative">
          <button
            onClick={() => setProjectMenuOpen(!projectMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs sm:text-sm font-semibold shadow-sm transition-all"
          >
            <Building className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <span className="max-w-[130px] sm:max-w-[220px] truncate">
              {currentProject?.name || 'Select Project'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {projectMenuOpen && (
            <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-soft-lg border border-slate-200 dark:border-slate-700 py-2 z-50 animate-fade-in">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Your Construction Projects
              </div>
              <div className="max-h-56 overflow-y-auto space-y-0.5 px-1.5">
                {projects.map((proj) => {
                  const isCurrent = proj.id === currentProject?.id;
                  return (
                    <button
                      key={proj.id}
                      onClick={() => {
                        switchProject(proj.id);
                        setProjectMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs sm:text-sm transition-colors ${
                        isCurrent
                          ? 'bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 font-bold'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="truncate">
                        <p className="truncate">{proj.name}</p>
                        <p className="text-[10px] text-slate-400 font-normal">
                          {proj.status} • {proj.built_up_area ? `${proj.built_up_area} sq.ft` : ''}
                        </p>
                      </div>
                      {isCurrent && <Check className="w-4 h-4 shrink-0 text-primary-600" />}
                    </button>
                  );
                })}
              </div>
              <div className="pt-2 mt-1 border-t border-slate-100 dark:border-slate-700/60 px-1.5">
                <button
                  onClick={() => {
                    setProjectMenuOpen(false);
                    if (onOpenNewProject) onOpenNewProject();
                    else navigate('/projects');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/40 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Project</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right side: Search, Notifications, Theme, User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search Button */}
        <button
          onClick={onOpenSearch}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-xl hover:text-slate-700 dark:hover:text-slate-200 transition-colors border border-transparent hover:border-slate-300 dark:hover:border-slate-700"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Quick Search...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 shadow-sm">
            ⌘K
          </kbd>
        </button>

        <button
          onClick={onOpenSearch}
          className="sm:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
        </button>

        {/* Notifications Popover */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setNotifMenuOpen(!notifMenuOpen)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {notifMenuOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-soft-lg border border-slate-200 dark:border-slate-700 py-3 z-50 animate-fade-in">
              <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-white">Notifications</h4>
                  <p className="text-[11px] text-slate-400">{unreadCount} unread alert{unreadCount !== 1 ? 's' : ''}</p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No notifications yet. You're all caught up!
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-700/40 cursor-pointer transition-colors ${
                        !notif.is_read ? 'bg-primary-50/40 dark:bg-primary-950/20' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${
                          notif.type === 'budget_warning' ? 'text-rose-500' : 'text-amber-500'
                        }`} />
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                            {notif.title}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                            {notif.message}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {formatDate(notif.created_at, 'dd MMM, hh:mm a')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-xs shadow-sm overflow-hidden">
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                profile?.full_name?.charAt(0) || 'U'
              )}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-soft-lg border border-slate-200 dark:border-slate-700 py-2 z-50 animate-fade-in">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700/60">
                <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                  {profile?.full_name || user?.email || 'Suresh Sharma'}
                </p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {user?.email || 'suresh.sharma@homebuild.in'}
                </p>
                {isDemoMode && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 rounded-md">
                    Demo Mode Active
                  </span>
                )}
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate('/settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Account & Settings</span>
                </button>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
