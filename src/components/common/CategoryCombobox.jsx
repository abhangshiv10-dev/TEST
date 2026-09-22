import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, ChevronDown, Check } from 'lucide-react';
import { matchesCategory, getCategoryEnglishLabel } from '../../utils/bilingualSearch';

export default function CategoryCombobox({
  categories = [],
  selectedCategoryId,
  onSelectCategory,
  onAddNewCategory,
  error
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    } else if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Bilingual / English / Marathi search filter
  const filteredCategories = categories.filter(c =>
    matchesCategory(c.name, searchQuery)
  );

  const trimmedQuery = searchQuery.trim();
  const exactMatchExists = categories.some(
    c => c.name.toLowerCase() === trimmedQuery.toLowerCase() || matchesCategory(c.name, trimmedQuery)
  );

  const handleSelect = (category) => {
    onSelectCategory(category.id);
    setIsOpen(false);
  };

  const handleCreateNew = async () => {
    if (!trimmedQuery) return;
    try {
      setIsAddingNew(true);
      const newCat = await onAddNewCategory(trimmedQuery);
      if (newCat) {
        onSelectCategory(newCat.id);
      }
      setIsOpen(false);
    } catch (err) {
      console.error('Error adding category:', err);
    } finally {
      setIsAddingNew(false);
    }
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Combobox Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left bg-white rounded-xl border text-sm transition-colors ${
          error ? 'border-rose-400 bg-rose-50/20' : isOpen ? 'border-slate-800 ring-2 ring-slate-800/10' : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <span className={selectedCategory ? 'text-slate-900 font-medium' : 'text-slate-400'}>
          {selectedCategory ? selectedCategory.name : 'खर्चाचा प्रकार निवडा'}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-slate-700' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-modal overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Search Bar Input */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/70">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="शोधा..."
                className="w-full pl-8 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (filteredCategories.length > 0) {
                      handleSelect(filteredCategories[0]);
                    } else if (trimmedQuery && !exactMatchExists) {
                      handleCreateNew();
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Categories Options List */}
          <div className="max-h-56 overflow-y-auto p-1 divide-y divide-slate-50">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((cat) => {
                const isSelected = cat.id === selectedCategoryId;
                const engLabel = getCategoryEnglishLabel(cat.name);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelect(cat)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-xs sm:text-sm rounded-lg text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white font-medium shadow-xs'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-semibold">{cat.name}</span>
                      {engLabel && (
                        <span className={`text-[11px] font-normal truncate ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                          ({engLabel})
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-white shrink-0 ml-2" />}
                  </button>
                );
              })
            ) : (
              <div className="py-2.5 px-3 text-xs text-slate-400 text-center">
                कोणताही प्रकार सापडला नाही
              </div>
            )}

            {/* Quick Add Custom Category Option if query doesn't exist */}
            {trimmedQuery && !exactMatchExists && (
              <div className="p-1 border-t border-slate-100 mt-1 bg-slate-50/50">
                <button
                  type="button"
                  disabled={isAddingNew}
                  onClick={handleCreateNew}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs sm:text-sm text-slate-900 font-medium hover:bg-slate-200/80 rounded-lg transition-colors text-left"
                >
                  <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  <span>
                    <strong>"{trimmedQuery}"</strong> नवीन प्रकार म्हणून जोडा
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
