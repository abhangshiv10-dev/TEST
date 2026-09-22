import React, { useState, useRef, useEffect } from 'react';
import { Plus, Receipt, Package, Users, Camera, BookOpen, CheckSquare, X } from 'lucide-react';

export const QuickAddButton = ({
  onAddExpense,
  onAddMaterial,
  onAddLabour,
  onUploadPhoto,
  onAddDiary,
  onAddTask
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const actions = [
    { label: 'Add Expense', icon: Receipt, color: 'bg-emerald-600', onClick: onAddExpense },
    { label: 'Purchase Material', icon: Package, color: 'bg-blue-600', onClick: onAddMaterial },
    { label: 'Labour Attendance', icon: Users, color: 'bg-amber-600', onClick: onAddLabour },
    { label: 'Site Photo', icon: Camera, color: 'bg-purple-600', onClick: onUploadPhoto },
    { label: 'Daily Diary', icon: BookOpen, color: 'bg-indigo-600', onClick: onAddDiary },
    { label: 'New Task', icon: CheckSquare, color: 'bg-slate-700', onClick: onAddTask },
  ];

  return (
    <div ref={menuRef} className="fixed bottom-20 sm:bottom-8 right-5 sm:right-8 z-40 quick-add-btn">
      {/* Speed Dial Menu Items */}
      {isOpen && (
        <div className="mb-3 flex flex-col items-end gap-2 animate-fade-in-up">
          {actions.map((act, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIsOpen(false);
                if (act.onClick) act.onClick();
              }}
              className="flex items-center gap-3 pl-4 pr-3 py-2 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-soft-lg border border-slate-200 dark:border-slate-700 hover:scale-105 active:scale-95 transition-all text-xs sm:text-sm font-semibold group"
            >
              <span>{act.label}</span>
              <div className={`w-8 h-8 rounded-xl ${act.color} text-white flex items-center justify-center shadow-sm group-hover:rotate-12 transition-transform`}>
                <act.icon className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-soft-lg transition-all duration-300 active:scale-90 ${
          isOpen ? 'bg-slate-800 rotate-45' : 'bg-primary-600 hover:bg-primary-500 shadow-glow hover:scale-105'
        }`}
        aria-label="Quick Add"
      >
        <Plus className="w-7 h-7" />
      </button>
    </div>
  );
};
