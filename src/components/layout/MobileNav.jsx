import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Receipt, Layers, Package, Menu } from 'lucide-react';

export const MobileNav = ({ onOpenSidebar }) => {
  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Expenses', path: '/expenses', icon: Receipt },
    { name: 'Stages', path: '/stages', icon: Layers },
    { name: 'Materials', path: '/materials', icon: Package },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 px-4 flex items-center justify-around mobile-nav">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => `flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            isActive
              ? 'text-primary-600 dark:text-primary-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <item.icon className="w-5 h-5" />
          <span className="text-[10px]">{item.name}</span>
        </NavLink>
      ))}

      <button
        onClick={onOpenSidebar}
        className="flex flex-col items-center gap-1 py-1 px-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
      >
        <Menu className="w-5 h-5" />
        <span className="text-[10px]">More</span>
      </button>
    </nav>
  );
};
