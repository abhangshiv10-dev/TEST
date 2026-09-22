import React, { useRef, useState } from 'react';
import { X, Download, Share2, Printer, Loader2, FileSpreadsheet } from 'lucide-react';
import { ReportReceiptCard } from './ReportReceiptCard';
import { exportElementAsImage, shareToWhatsApp } from '../../utils/receiptExporter';
import Swal from 'sweetalert2';

export function ReportReceiptModal({
  isOpen,
  onClose,
  expenses = [],
  totalExpenses = 0,
  totalEntries = 0,
  dateRangeText = '01 Jan 2026 - 30 Sep 2026',
  projectName = 'माझ्या घराचे बांधकाम'
}) {
  const receiptRef = useRef(null);
  const [exporting, setExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async (format = 'png') => {
    try {
      setExporting(true);
      const fileName = `Expense_Report_Receipt_${Date.now()}`;
      await exportElementAsImage(receiptRef.current, fileName, format);
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `अहवाल पावती ${format.toUpperCase()} स्वरूपात डाउनलोड झाली!`,
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
      const totalFormatted = (totalExpenses || expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0)).toLocaleString('en-IN');
      const caption = `📊 *${projectName} - बांधकाम खर्च अहवाल पावती*\n\n` +
        `📅 *कालावधी:* ${dateRangeText}\n` +
        `💰 *एकूण खर्च:* ₹${totalFormatted}\n` +
        `📝 *नोंदींची संख्या:* ${totalEntries || expenses.length}\n\n` +
        `_Generated via Construction Expense Tracker_`;
      
      await shareToWhatsApp(receiptRef.current, caption);
    } catch (err) {
      console.error('WhatsApp share error:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">अहवाल पावती (Report Slip)</h3>
              <p className="text-[11px] text-slate-500 font-medium">जास्तीत जास्त 10 नोंदींसह PNG / JPG पावती</p>
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
          <ReportReceiptCard
            ref={receiptRef}
            expenses={expenses}
            totalExpenses={totalExpenses}
            totalEntries={totalEntries}
            dateRangeText={dateRangeText}
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
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#EBF5FE] hover:bg-[#D9EDFE] text-[#2F80ED] border border-[#D0E8FF] text-xs font-bold shadow-2xs hover:shadow transition-all disabled:opacity-50"
            >
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>Export (PNG)</span>
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
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#00B074] hover:bg-[#009B66] text-white text-xs font-bold shadow-sm hover:shadow transition-all disabled:opacity-50"
          >
            <Share2 className="w-4 h-4" />
            <span>Share on WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
}
