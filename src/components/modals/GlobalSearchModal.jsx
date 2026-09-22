import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Receipt, Package, Users, Briefcase, CheckSquare, FileText } from 'lucide-react';
import { useProject } from '../../contexts/ProjectContext';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { useNavigate } from 'react-router-dom';

export const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const { expenses, materials, suppliers, tasks, documents } = useProject();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  const results = useMemo(() => {
    if (!query.trim() || query.length < 2) return { expenses: [], materials: [], suppliers: [], tasks: [], documents: [] };
    const q = query.toLowerCase();

    return {
      expenses: expenses.filter(e => 
        e.description?.toLowerCase().includes(q) || 
        e.paid_to?.toLowerCase().includes(q) ||
        e.reference_number?.toLowerCase().includes(q)
      ).slice(0, 5),
      materials: materials.filter(m => 
        m.name?.toLowerCase().includes(q) || 
        m.category?.toLowerCase().includes(q)
      ).slice(0, 5),
      suppliers: suppliers.filter(s => 
        s.name?.toLowerCase().includes(q) || 
        s.business_name?.toLowerCase().includes(q) ||
        s.material_type?.toLowerCase().includes(q)
      ).slice(0, 5),
      tasks: tasks.filter(t => 
        t.title?.toLowerCase().includes(q) || 
        t.assigned_to?.toLowerCase().includes(q)
      ).slice(0, 5),
      documents: documents.filter(d => 
        d.name?.toLowerCase().includes(q) || 
        d.category?.toLowerCase().includes(q)
      ).slice(0, 5)
    };
  }, [query, expenses, materials, suppliers, tasks, documents]);

  const totalHits = 
    results.expenses.length + 
    results.materials.length + 
    results.suppliers.length + 
    results.tasks.length + 
    results.documents.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-start justify-center p-4 pt-16 sm:pt-24 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-10">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-700/60">
          <Search className="w-5 h-5 text-primary-500 mr-3 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search expenses, materials, suppliers, tasks, documents..."
            className="w-full bg-transparent text-sm sm:text-base text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {query.trim().length >= 2 && totalHits === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">
              No results found for "{query}"
            </div>
          )}

          {/* Expenses */}
          {results.expenses.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                <Receipt className="w-3.5 h-3.5" />
                <span>Expenses ({results.expenses.length})</span>
              </div>
              <div className="space-y-1">
                {results.expenses.map(exp => (
                  <div
                    key={exp.id}
                    onClick={() => {
                      onClose();
                      navigate('/expenses');
                    }}
                    className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/40 cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{exp.description}</p>
                      <p className="text-slate-400">{formatDate(exp.expense_date)} • Paid to: {exp.paid_to || '-'}</p>
                    </div>
                    <span className="font-bold text-primary-600 dark:text-primary-400">{formatCurrency(exp.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Materials */}
          {results.materials.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                <Package className="w-3.5 h-3.5" />
                <span>Materials ({results.materials.length})</span>
              </div>
              <div className="space-y-1">
                {results.materials.map(mat => (
                  <div
                    key={mat.id}
                    onClick={() => {
                      onClose();
                      navigate('/materials');
                    }}
                    className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/40 cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{mat.name}</p>
                      <p className="text-slate-400">Category: {mat.category}</p>
                    </div>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{mat.current_stock} {mat.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suppliers */}
          {results.suppliers.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                <Users className="w-3.5 h-3.5" />
                <span>Suppliers ({results.suppliers.length})</span>
              </div>
              <div className="space-y-1">
                {results.suppliers.map(sup => (
                  <div
                    key={sup.id}
                    onClick={() => {
                      onClose();
                      navigate('/suppliers');
                    }}
                    className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/40 cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{sup.name}</p>
                      <p className="text-slate-400">{sup.material_type} • {sup.mobile}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tasks */}
          {results.tasks.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Tasks ({results.tasks.length})</span>
              </div>
              <div className="space-y-1">
                {results.tasks.map(tsk => (
                  <div
                    key={tsk.id}
                    onClick={() => {
                      onClose();
                      navigate('/tasks');
                    }}
                    className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/40 cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{tsk.title}</p>
                      <p className="text-slate-400">Due: {formatDate(tsk.due_date)} • {tsk.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {results.documents.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                <FileText className="w-3.5 h-3.5" />
                <span>Documents ({results.documents.length})</span>
              </div>
              <div className="space-y-1">
                {results.documents.map(doc => (
                  <div
                    key={doc.id}
                    onClick={() => {
                      onClose();
                      navigate('/documents');
                    }}
                    className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/40 cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{doc.name}</p>
                      <p className="text-slate-400">{doc.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
