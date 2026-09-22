import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Download } from 'lucide-react';

export default function PhotoViewerModal({ isOpen, photoUrl, title, onClose }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !photoUrl) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative max-w-2xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 text-white">
          <div className="text-xs sm:text-sm font-medium truncate">
            {title || 'खर्च पावती/फोटो'}
          </div>
          <div className="flex items-center gap-2">
            <a
              href={photoUrl}
              target="_blank"
              rel="noopener noreferrer"
              download="expense_photo.jpg"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="फोटो डाउनलोड करा"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="बंद करा"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Photo Container */}
        <div className="p-2 sm:p-4 flex items-center justify-center bg-black/40 max-h-[75vh] overflow-auto">
          <img
            src={photoUrl}
            alt={title || 'Expense Photo'}
            className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain"
          />
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
