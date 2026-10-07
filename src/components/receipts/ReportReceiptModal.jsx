import React, { useRef, useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Download, 
  Share2, 
  Loader2, 
  FileSpreadsheet, 
  Calendar, 
  Filter,
  FileText,
  Check
} from 'lucide-react';
import { ReportReceiptCard } from './ReportReceiptCard';
import { exportElementAsImage, exportElementAsPDF, shareToWhatsApp, shareFileToWhatsApp } from '../../utils/receiptExporter';
import { useShareImage } from '../../utils/useShareImage';
import { toast, alertBox } from '../../utils/alerts';
import { useLanguage } from '../../i18n/LanguageContext';
import { formatINR } from '../../utils/marathiCurrency';

export function ReportReceiptModal({
  isOpen,
  onClose,
  expenses = [],
  projectName
}) {
  const { t, lang } = useLanguage();
  const shownProject = projectName || t('app.defaultProject');
  const receiptRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  
  // Date filter states
  const [filterPreset, setFilterPreset] = useState('all'); // 'all', 'this_month', 'last_30', 'custom'
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

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

  // Dynamically filter expenses based on chosen date range
  const filteredExpenses = useMemo(() => {
    if (!expenses || expenses.length === 0) return [];

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    if (filterPreset === 'this_month') {
      return expenses.filter(item => {
        if (!item.expense_date) return false;
        const d = new Date(item.expense_date);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      });
    }

    if (filterPreset === 'last_30') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return expenses.filter(item => {
        if (!item.expense_date) return false;
        const d = new Date(item.expense_date);
        return d >= thirtyDaysAgo && d <= now;
      });
    }

    if (filterPreset === 'custom') {
      return expenses.filter(item => {
        if (!item.expense_date) return true;
        const itemDate = item.expense_date;
        if (fromDate && itemDate < fromDate) return false;
        if (toDate && itemDate > toDate) return false;
        return true;
      });
    }

    return expenses;
  }, [expenses, filterPreset, fromDate, toDate]);

  // All filtered entries are shown in the slip and in the exported image/PDF
  const displayExpenses = filteredExpenses;
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalEntries = filteredExpenses.length;

  const dateRangeCaption = filterPreset === 'custom' && (fromDate || toDate)
    ? t('receipt.report.captionRange', { from: fromDate || t('receipt.report.captionStart'), to: toDate || t('common.today') })
    : filterPreset === 'this_month'
    ? t('receipt.report.captionThisMonth')
    : filterPreset === 'last_30'
    ? t('receipt.report.last30')
    : t('receipt.report.allEntries');

  // Image for the WhatsApp button is prepared in the background (instant share on tap)
  const shareImage = useShareImage(receiptRef, {
    enabled: isOpen,
    version: `${filterPreset}|${fromDate}|${toDate}|${totalEntries}|${totalExpenses}|${lang}`,
    fileName: 'Expense_Report_Slip.png'
  });

  if (!isOpen) return null;

  const handleExportImage = async (format = 'png') => {
    try {
      setExporting(true);
      const fileName = `Expense_Report_${Date.now()}`;
      await exportElementAsImage(receiptRef.current, fileName, format);
      
      toast('success', t('receipt.downloaded', { format: t(`receipt.format.${format}`) }), 2500);
    } catch (err) {
      console.error('Image Export failed:', err);
      alertBox('error', t('common.error'), t('receipt.downloadFailed'));
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      const fileName = `Expense_Report_Slip_${Date.now()}`;
      await exportElementAsPDF(receiptRef.current, fileName);
      
      toast('success', t('receipt.pdfCreated'), 2500);
    } catch (err) {
      console.error('PDF Export failed:', err);
      alertBox('error', t('common.error'), t('receipt.pdfFailed'));
    } finally {
      setExporting(false);
    }
  };

  const handleWhatsAppShare = async () => {
    const caption = t('receipt.report.whatsappCaption', {
      project: shownProject,
      filter: dateRangeCaption,
      total: formatINR(totalExpenses),
      count: totalEntries
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
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto animate-in zoom-in-95 duration-150 flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-2xs">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">{t('receipt.report.modalTitle')}</h3>
              <p className="text-[11px] text-slate-500 font-medium">{t('receipt.report.modalSub')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[2px] bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Date Filter Bar */}
        <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-100 space-y-2.5">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => { setFilterPreset('all'); setFromDate(''); setToDate(''); }}
              className={`px-3 py-1.5 rounded-[2px] text-xs font-semibold transition-all cursor-pointer ${
                filterPreset === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
              }`}
            >
              {t('receipt.report.allEntriesCount', { count: expenses.length })}
            </button>

            <button
              type="button"
              onClick={() => setFilterPreset('this_month')}
              className={`px-3 py-1.5 rounded-[2px] text-xs font-semibold transition-all cursor-pointer ${
                filterPreset === 'this_month'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
              }`}
            >
              {t('common.thisMonth')}
            </button>

            <button
              type="button"
              onClick={() => setFilterPreset('last_30')}
              className={`px-3 py-1.5 rounded-[2px] text-xs font-semibold transition-all cursor-pointer ${
                filterPreset === 'last_30'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
              }`}
            >
              {t('receipt.report.last30')}
            </button>

            <button
              type="button"
              onClick={() => setFilterPreset('custom')}
              className={`px-3 py-1.5 rounded-[2px] text-xs font-semibold transition-all cursor-pointer ${
                filterPreset === 'custom'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
              }`}
            >
              {t('receipt.report.custom')}
            </button>
          </div>

          {/* Custom Date Pickers (From Date & To Date) */}
          {filterPreset === 'custom' && (
            <div className="grid grid-cols-2 gap-2 pt-1 animate-in fade-in duration-150">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">
                  {t('receipt.report.fromDate')}
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">
                  {t('receipt.report.toDate')}
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Body: Receipt Card Container */}
        <div className="p-2 sm:p-3 bg-slate-100/70 max-h-[65vh] overflow-y-auto flex justify-center items-start w-full">
          <ReportReceiptCard
            ref={receiptRef}
            expenses={displayExpenses}
            totalExpenses={totalExpenses}
            totalEntries={totalEntries}
            projectName={shownProject}
            filterLabel={dateRangeCaption}
            showActionButtons={false}
          />
        </div>

        {/* Modal Footer Actions: PDF, JPG, PNG & WhatsApp */}
        <div className="p-4 bg-white border-t border-slate-100 space-y-2.5">
          {/* Main 3 Format Buttons: PDF, JPG, PNG */}
          <div className="grid grid-cols-3 gap-2">
            {/* PDF Button */}
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-[2px] bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs hover:shadow transition-all disabled:opacity-50 cursor-pointer"
            >
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
              <span>{t('receipt.report.exportPdf')}</span>
            </button>

            {/* JPG Button */}
            <button
              onClick={() => handleExportImage('jpg')}
              disabled={exporting}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-[2px] bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs hover:shadow transition-all disabled:opacity-50 cursor-pointer"
            >
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>{t('receipt.report.downloadJpg')}</span>
            </button>

            {/* PNG Button */}
            <button
              onClick={() => handleExportImage('png')}
              disabled={exporting}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-[2px] bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-xs hover:shadow transition-all disabled:opacity-50 cursor-pointer"
            >
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>{t('receipt.report.downloadPng')}</span>
            </button>
          </div>

          {/* WhatsApp Share Button */}
          <button
            onClick={handleWhatsAppShare}
            disabled={exporting || shareImage.preparing}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-[2px] bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold shadow-xs hover:shadow transition-all disabled:opacity-60 cursor-pointer"
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
