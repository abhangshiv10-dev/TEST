import React, { useRef, useState } from 'react';
import { X, Download, Share2, Printer, CheckCircle, Loader2, Image as ImageIcon } from 'lucide-react';
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
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
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Receipt Card Container */}
        <div className="p-4 sm:p-6 bg-slate-100/70 max-h-[70vh] overflow-y-auto flex justify-center">
          <SingleExpenseReceiptCard
            ref={receiptRef}
            expense={expense}
            projectName={projectName}
          />
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-100 space-y-2.5">
          {/* Download Buttons Row */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleExport('png')}
              disabled={exporting}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm hover:shadow transition-all disabled:opacity-50"
            >
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>PNG डाउनलोड</span>
            </button>

            <button
              onClick={() => handleExport('jpg')}
              disabled={exporting}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm hover:shadow transition-all disabled:opacity-50"
            >
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>JPG डाउनलोड</span>
            </button>
          </div>

          {/* WhatsApp Share Button */}
          <button
            onClick={handleWhatsAppShare}
            disabled={exporting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm hover:shadow transition-all disabled:opacity-50"
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp वर शेअर करा (Share on WhatsApp)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
