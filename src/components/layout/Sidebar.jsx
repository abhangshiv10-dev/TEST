import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Layers, 
  TrendingUp, 
  Receipt, 
  CreditCard, 
  PieChart, 
  Landmark, 
  Package, 
  ShoppingCart, 
  Truck, 
  Users, 
  Clock, 
  Briefcase, 
  CheckSquare, 
  BookOpen, 
  Camera, 
  FileText, 
  BarChart3, 
  Settings, 
  X,
  HardHat
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navGroups = [
    {
      label: 'Main',
      items: [
        { name: 'Dashboard', path: '/', icon: Home },
      ]
    },
    {
      label: 'Construction',
      items: [
        { name: 'Project Overview', path: '/projects', icon: HardHat },
        { name: 'Construction Stages', path: '/stages', icon: Layers },
        { name: 'Progress & Timeline', path: '/progress', icon: TrendingUp },
        { name: 'Daily Site Diary', path: '/diary', icon: BookOpen },
      ]
    },
    {
      label: 'Finance',
      items: [
        { name: 'Expenses', path: '/expenses', icon: Receipt },
        { name: 'Payments & Dues', path: '/payments', icon: CreditCard },
        { name: 'Budget Allocations', path: '/budgets', icon: PieChart },
        { name: 'Funding & Loans', path: '/funding', icon: Landmark },
      ]
    },
    {
      label: 'Materials & Stock',
      items: [
        { name: 'Material Inventory', path: '/materials', icon: Package },
        { name: 'Suppliers', path: '/suppliers', icon: Truck },
      ]
    },
    {
      label: 'People & Labour',
      items: [
        { name: 'Workers', path: '/workers', icon: Users },
        { name: 'Labour Muster Roll', path: '/labour', icon: Clock },
        { name: 'Contractors', path: '/contractors', icon: Briefcase },
      ]
    },
    {
      label: 'Planning & Media',
      items: [
        { name: 'Tasks', path: '/tasks', icon: CheckSquare },
        { name: 'Site Photos', path: '/photos', icon: Camera },
        { name: 'Documents & Plans', path: '/documents', icon: FileText },
      ]
    },
    {
      label: 'Analytics & Config',
      items: [
        { name: 'Reports & Export', path: '/reports', icon: BarChart3 },
        { name: 'Settings', path: '/settings', icon: Settings },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center shadow-glow">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-white text-base tracking-tight leading-tight">
                HomeBuild
              </h1>
              <p className="text-[10px] text-primary-400 font-semibold tracking-wider uppercase">
                Tracker Pro
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx}>
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => {
                        if (window.innerWidth < 1024) onClose();
                      }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-primary-600 text-white font-semibold shadow-sm'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                      }`}
                    >
                      <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Tag */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/30 text-center text-[10px] text-slate-400">
          <p>Smart Construction Tracker</p>
          <p className="text-slate-400 mt-0.5">v2.0 • Personal Edition</p>
        </div>
      </aside>
    </>
  );
};
