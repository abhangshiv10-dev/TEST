import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import ExpenseModal from '../modals/ExpenseModal';
import PhotoViewerModal from '../modals/PhotoViewerModal';

export default function AppLayout() {
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [viewingPhotoUrl, setViewingPhotoUrl] = useState(null);
  const [viewingPhotoTitle, setViewingPhotoTitle] = useState('');

  const handleOpenPhoto = (url, title) => {
    setViewingPhotoUrl(url);
    setViewingPhotoTitle(title);
    setPhotoModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-slate-900 selection:text-white text-slate-800 relative">
      {/* Ambient Background Mesh Orbs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-gradient-to-tr from-blue-400/15 via-indigo-300/10 to-amber-300/10 rounded-full blur-3xl" />
        <div className="absolute top-[20%] -right-40 w-[420px] h-[420px] bg-emerald-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[10%] -left-40 w-[460px] h-[460px] bg-blue-400/8 rounded-full blur-3xl" />
      </div>

      {/* Sticky Header */}
      <Header onOpenAddExpense={() => setExpenseModalOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet context={{ onOpenAddExpense: () => setExpenseModalOpen(true) }} />
      </main>

      {/* Minimal Premium Footer */}
      <footer className="border-t border-slate-200/70 bg-white/60 backdrop-blur-md py-4 text-center text-[12px] text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">माझ्या घराचे बांधकाम</span>
            <span className="text-slate-300">•</span>
            <span>वैयक्तिक घर बांधकाम खर्च व्यवस्थापन</span>
          </div>
          <div className="text-slate-400 text-[11px]">
            सुरक्षित आणि सोपे पर्सनल फायनान्स ट्रॅकर
          </div>
        </div>
      </footer>

      {/* Global Quick Add Expense Modal */}
      <ExpenseModal
        isOpen={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        onViewPhoto={handleOpenPhoto}
      />

      {/* Global Photo Viewer Modal */}
      <PhotoViewerModal
        isOpen={photoModalOpen}
        photoUrl={viewingPhotoUrl}
        title={viewingPhotoTitle}
        onClose={() => {
          setPhotoModalOpen(false);
          setViewingPhotoUrl(null);
        }}
      />
    </div>
  );
}
