import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, Share2, Loader2, Image as ImageIcon } from 'lucide-react';
import { SingleExpenseReceiptCard } from './SingleExpenseReceiptCard';
import { exportElementAsImage, shareToWhatsApp } from '../../utils/receiptExporter';
import Swal from 'sweetalert2';

export function SingleExpenseReceiptModal({
  isOpen,
  onClose,
  expense,
  projectName = 'माझ्या घराचे बांधकाम'
}) {
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

  if (!isOpen || !expense) return null;

  const handleExport = async (format = 'png') => {
    try {
      setExporting(true);
      const fileName = `Expense_Receipt_${expense.category_name || 'Item'}_${expense.expense_date || 'date'}`;
      await exportElementAsImage(receiptRef.current, fileName, format);
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `पावती ${format.toUpperCase()} स्वरूपात डाउनलोड झाली!`,
        showConfirmButton: false,
        timer: 2500
      });
    } catch (err) {
      console.error('Export failed:', err);
      Swal.fire({
        icon: 'error',
        title: 'त्रुटी',
        text: 'पावती डाउनलोड करताना अडचण आली.'
      });
    } finally {
      setExporting(false);
    }
  };

  const handleWhatsAppShare = async () => {
    try {
      setExporting(true);
      const caption = `🏛️ *${projectName} - खर्च पावती*\n\n` +
        `📌 *खर्चाचा प्रकार:* ${expense.category_name || '-'}\n` +
        `💰 *रक्कम:* ₹${expense.amount?.toLocaleString('en-IN') || '0'}\n` +
        `📅 *दिनांक:* ${expense.expense_date || '-'}\n` +
        `📝 *तपशील:* ${expense.description || '-'}\n\n` +
        `_Digital Construction Expense Slip_`;
      
      await shareToWhatsApp(receiptRef.current, caption);
    } catch (err) {
      console.error('WhatsApp share error:', err);
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
              <h3 className="text-sm font-bold text-slate-800">खर्च पावती (Receipt)</h3>
              <p className="text-[11px] text-slate-500 font-medium">PNG / JPG एक्सपोर्ट व शेअर</p>
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
            projectName={projectName}
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
              <span>Export (PNG)</span>
            </button>

            <button
              onClick={() => handleExport('jpg')}
              disabled={exporting}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm hover:shadow transition-all disabled:opacity-50 cursor-pointer"
            >
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>JPG डाउनलोड</span>
            </button>
          </div>

          {/* WhatsApp Share Button */}
          <button
            onClick={handleWhatsAppShare}
            disabled={exporting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#00B074] hover:bg-[#009B66] text-white text-xs font-bold shadow-sm hover:shadow transition-all disabled:opacity-50 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Share on WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
