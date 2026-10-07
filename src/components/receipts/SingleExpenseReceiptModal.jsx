import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, Share2, Loader2, Image as ImageIcon } from 'lucide-react';
import { SingleExpenseReceiptCard } from './SingleExpenseReceiptCard';
import { exportElementAsImage, shareToWhatsApp, shareFileToWhatsApp } from '../../utils/receiptExporter';
import { useShareImage } from '../../utils/useShareImage';
import { toast, alertBox } from '../../utils/alerts';
import { useLanguage } from '../../i18n/LanguageContext';
import { formatINR } from '../../utils/marathiCurrency';

export function SingleExpenseReceiptModal({
  isOpen,
  onClose,
  expense,
  projectName
}) {
  const { t, lang, catLabel, fmtShortDate, projectLabel } = useLanguage();
  const shownProject = projectName || projectLabel('');
  const receiptRef = useRef(null);
  const [exporting, setExporting] = useState(false);

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

  // Image for the WhatsApp button is prepared in the background (instant share on tap)
  const shareImage = useShareImage(receiptRef, {
    enabled: Boolean(isOpen && expense),
    version: `${expense?.id}|${expense?.amount}|${expense?.expense_date}|${expense?.payment_status}|${expense?.description}|${expense?.category_name}|${lang}`,
    fileName: 'Expense_Receipt.png'
  });

  if (!isOpen || !expense) return null;

  const handleExport = async (format = 'png') => {
    try {
      setExporting(true);
      const fileName = `Expense_Receipt_${expense.category_name || 'Item'}_${expense.expense_date || 'date'}`;
      await exportElementAsImage(receiptRef.current, fileName, format);
      
      toast('success', t('receipt.downloaded', { format: t(`receipt.format.${format}`) }), 2500);
    } catch (err) {
      console.error('Export failed:', err);
      alertBox('error', t('common.error'), t('receipt.downloadFailed'));
    } finally {
      setExporting(false);
    }
  };

  const handleWhatsAppShare = async () => {
    const caption = t('receipt.single.whatsappCaption', {
      project: shownProject,
      category: catLabel(expense.category_name, expense.category_name_en) || '-',
      amount: formatINR(expense.amount),
      date: expense.expense_date ? fmtShortDate(expense.expense_date) : '-',
      details: expense.description || '-'
    });

    // Fast path: image is ready -> share immediately (must happen right inside the tap)
    if (shareImage.file) {
      try {
        const result = await shareFileToWhatsApp(shareImage.file, caption);
        if (result === 'fallback') toast('info', t('receipt.shareFallback'), 4500);
      } catch (err) {
        console.error('WhatsApp share error:', err);
        alertBox('error', t('common.error'), t('receipt.shareFailed'));
      }
      return;
    }

    // Slow path: image could not be prepared in advance
    try {
      setExporting(true);
      await shareToWhatsApp(receiptRef.current, caption);
    } catch (err) {
      console.error('WhatsApp share error:', err);
      alertBox('error', t('common.error'), t('receipt.shareFailed'));
    } finally {
      setExporting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto animate-in zoom-in-95 duration-150 flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">{t('receipt.single.modalTitle')}</h3>
              <p className="text-[11px] text-slate-500 font-medium">{t('receipt.single.modalSub')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Receipt Card Container */}
        <div className="p-4 sm:p-6 bg-slate-100/80 max-h-[65vh] overflow-y-auto flex justify-center items-start w-full">
          <SingleExpenseReceiptCard
            ref={receiptRef}
            expense={expense}
            projectName={shownProject}
            onExportClick={() => handleExport('png')}
            onWhatsAppClick={handleWhatsAppShare}
            showActionButtons={false}
          />
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-100 space-y-2.5">
          {/* Download Buttons Row */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleExport('png')}
              disabled={exporting}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#EBF5FE] hover:bg-[#D9EDFE] text-[#2F80ED] border border-[#D0E8FF] text-xs font-bold shadow-2xs hover:shadow transition-all disabled:opacity-50 cursor-pointer"
            >
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>{t('receipt.single.exportPng')}</span>
            </button>

            <button
              onClick={() => handleExport('jpg')}
              disabled={exporting}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm hover:shadow transition-all disabled:opacity-50 cursor-pointer"
            >
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>{t('receipt.single.downloadJpg')}</span>
            </button>
          </div>

          {/* WhatsApp Share Button */}
          <button
            onClick={handleWhatsAppShare}
            disabled={exporting || shareImage.preparing}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#00B074] hover:bg-[#009B66] text-white text-xs font-bold shadow-sm hover:shadow transition-all disabled:opacity-60 cursor-pointer"
          >
            {exporting || shareImage.preparing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
            <span>{shareImage.preparing ? t('receipt.preparingShare') : t('receipt.shareWhatsApp')}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
