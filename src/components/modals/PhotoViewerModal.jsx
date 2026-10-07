import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

// Works with a single photo (photoUrl) or many (photos = [url, url, ...]).
export default function PhotoViewerModal({ isOpen, photoUrl, photos = null, title, onClose }) {
  const { t } = useLanguage();
  const list = Array.isArray(photos) && photos.length > 0 ? photos : photoUrl ? [photoUrl] : [];
  const [index, setIndex] = useState(0);

  // Start on the photo that was clicked
  useEffect(() => {
    if (isOpen) {
      const i = list.indexOf(photoUrl);
      setIndex(i >= 0 ? i : 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, photoUrl]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const count = list.length;
  const prev = useCallback(() => setIndex((i) => (i - 1 + count) % count), [count]);
  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);

  // Keyboard: ← → to move, Esc to close
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'ArrowLeft' && count > 1) prev();
      else if (e.key === 'ArrowRight' && count > 1) next();
      else if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, count, prev, next, onClose]);

  if (!isOpen || count === 0) return null;
  const currentUrl = list[Math.min(index, count - 1)];

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative max-w-2xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 text-white">
          <div className="text-xs sm:text-sm font-medium truncate">
            {title || t('photoViewer.title')}
            {count > 1 && <span className="ml-2 text-slate-400">({index + 1}/{count})</span>}
          </div>
          <div className="flex items-center gap-2">
            <a
              href={currentUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={`expense_photo_${index + 1}.jpg`}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title={t('photoViewer.download')}
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title={t('common.close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Photo Container */}
        <div className="relative p-2 sm:p-4 flex items-center justify-center bg-black/40 max-h-[75vh] overflow-auto">
          <img
            src={currentUrl}
            alt={title || t('photoViewer.alt')}
            className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain"
          />
          {count > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white"
                title={t('photoViewer.prev')}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white"
                title={t('photoViewer.next')}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails strip */}
        {count > 1 && (
          <div className="flex gap-2 p-2 overflow-x-auto border-t border-slate-800 bg-slate-900">
            {list.map((u, i) => (
              <button
                key={`${u}-${i}`}
                type="button"
                onClick={() => setIndex(i)}
                className={`w-12 h-12 shrink-0 rounded-lg overflow-hidden border-2 ${
                  i === index ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={u} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
