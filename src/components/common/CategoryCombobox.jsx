import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, ChevronDown, Check, X } from 'lucide-react';
import { matchesCategory } from '../../utils/bilingualSearch';
import { useLanguage } from '../../i18n/LanguageContext';
import { errorMessage } from '../../utils/appError';

const hasDevanagari = (text) => /[\u0900-\u097F]/.test(text);

export default function CategoryCombobox({
  categories = [],
  selectedCategoryId,
  onSelectCategory,
  onAddNewCategory, // (marathiName, englishName) => Promise<category>
  error
}) {
  const { t, tRich, catLabel } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);

  // "New category" mini form (Marathi Name + English Name)
  const [isCreating, setIsCreating] = useState(false);
  const [newMarathiName, setNewMarathiName] = useState('');
  const [newEnglishName, setNewEnglishName] = useState('');
  const [createError, setCreateError] = useState('');

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

  // Focus input when opened, reset when closed
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    } else if (!isOpen) {
      setSearchQuery('');
      setIsCreating(false);
      setCreateError('');
    }
  }, [isOpen]);

  // Bilingual search: Marathi name OR English Name OR built-in keywords
  const filteredCategories = categories.filter(c =>
    matchesCategory(c.name, searchQuery, c.name_en)
  );

  const trimmedQuery = searchQuery.trim();
  const exactMatchExists = categories.some(
    c =>
      c.name.toLowerCase() === trimmedQuery.toLowerCase() ||
      (c.name_en || '').toLowerCase() === trimmedQuery.toLowerCase() ||
      matchesCategory(c.name, trimmedQuery, c.name_en)
  );

  const handleSelect = (category) => {
    onSelectCategory(category.id);
    setIsOpen(false);
  };

  // Open the mini form; pre-fill whichever name the user already typed
  const startCreate = () => {
    if (!trimmedQuery) return;
    const typedMarathi = hasDevanagari(trimmedQuery);
    setNewMarathiName(typedMarathi ? trimmedQuery : '');
    setNewEnglishName(typedMarathi ? '' : trimmedQuery);
    setCreateError('');
    setIsCreating(true);
  };

  const handleCreateNew = async () => {
    const marathi = newMarathiName.trim();
    const english = newEnglishName.trim();

    if (!marathi) {
      setCreateError(t('category.marathiRequired'));
      return;
    }
    if (!english) {
      setCreateError(t('category.englishRequired'));
      return;
    }

    try {
      setIsAddingNew(true);
      setCreateError('');
      const newCat = await onAddNewCategory(marathi, english);
      if (newCat) {
        onSelectCategory(newCat.id);
      }
      setIsCreating(false);
      setIsOpen(false);
    } catch (err) {
      setCreateError(errorMessage(err, 'category.addFailed'));
    } finally {
      setIsAddingNew(false);
    }
  };

  const handleFormKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // we are inside the expense <form>; never submit it from here
      handleCreateNew();
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
          {selectedCategory ? catLabel(selectedCategory.name, selectedCategory.name_en) : t('category.selectPlaceholder')}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-slate-700' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-modal overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {isCreating ? (
            /* ---------- New category: Marathi Name + English Name ---------- */
            <div className="p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900">{t('category.addNewTitle')}</h4>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                  title={t('common.back')}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  {t('category.marathiName')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newMarathiName}
                  onChange={(e) => { setNewMarathiName(e.target.value); setCreateError(''); }}
                  onKeyDown={handleFormKeyDown}
                  placeholder={t('category.marathiPlaceholder')}
                  className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                  autoFocus={!newMarathiName}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  {t('category.englishName')} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newEnglishName}
                  onChange={(e) => { setNewEnglishName(e.target.value); setCreateError(''); }}
                  onKeyDown={handleFormKeyDown}
                  placeholder={t('category.englishPlaceholder')}
                  className="w-full px-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                  autoFocus={Boolean(newMarathiName)}
                />
                <p className="mt-1 text-[10px] text-slate-400">
                  {t('category.englishHint')}
                </p>
              </div>

              {createError && (
                <p className="text-[11px] text-rose-500 font-medium">{createError}</p>
              )}

              <div className="flex items-center justify-end gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="button"
                  disabled={isAddingNew}
                  onClick={handleCreateNew}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-60"
                >
                  {isAddingNew ? t('common.adding') : t('category.addAndSelect')}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Search Bar Input */}
              <div className="p-2 border-b border-slate-100 bg-slate-50/70">
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('category.searchPlaceholder')}
                    className="w-full pl-8 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (filteredCategories.length > 0) {
                          handleSelect(filteredCategories[0]);
                        } else if (trimmedQuery && !exactMatchExists) {
                          startCreate();
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
                          <span className="font-semibold truncate">{catLabel(cat.name, cat.name_en)}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-white shrink-0 ml-2" />}
                      </button>
                    );
                  })
                ) : (
                  <div className="py-2.5 px-3 text-xs text-slate-400 text-center">
                    {t('category.noneFound')}
                  </div>
                )}

                {/* Add a new category (opens Marathi + English name form) */}
                {trimmedQuery && !exactMatchExists && (
                  <div className="p-1 border-t border-slate-100 mt-1 bg-slate-50/50">
                    <button
                      type="button"
                      onClick={startCreate}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs sm:text-sm text-slate-900 font-medium hover:bg-slate-200/80 rounded-lg transition-colors text-left"
                    >
                      <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center">
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                      <span>
                        {tRich('category.addAsNew', { query: <strong>"{trimmedQuery}"</strong> })}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
