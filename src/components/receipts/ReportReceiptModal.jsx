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
  Check,
  Layers
} from 'lucide-react';
import { ReportReceiptCard } from './ReportReceiptCard';
import { exportElementAsImage, exportElementAsPDF, shareToWhatsApp } from '../../utils/receiptExporter';
import Swal from 'sweetalert2';

export function ReportReceiptModal({
  isOpen,
  onClose,
  expenses = [],
  projectName = 'माझ्या घराचे बांधकाम'
}) {
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

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalEntries = filteredExpenses.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / 10));

  if (!isOpen) return null;

  const handleExportImage = async (format = 'png') => {
    try {
      setExporting(true);
      const fileName = `Expense_Report_${Date.now()}`;
      await exportElementAsImage(receiptRef.current, fileName, format);
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: totalPages > 1 
          ? `सर्व ${totalPages} पृष्ठे ${format.toUpperCase()} स्वरूपात डाउनलोड झाली!`
          : `पावती ${format.toUpperCase()} स्वरूपात डाउनलोड झाली!`,
        showConfirmButton: false,
        timer: 2500
      });
    } catch (err) {
      console.error('Image Export failed:', err);
      Swal.fire({
        icon: 'error',
        title: 'त्रुटी',
        text: 'पावती डाउनलोड करताना अडचण आली.'
      });
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExporting(true);
      const fileName = `Expense_Report_Slip_${Date.now()}`;
      await exportElementAsPDF(receiptRef.current, fileName);
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: totalPages > 1
          ? `सर्व ${totalPages} पृष्ठांची PDF तयार झाली!`
          : `पावती PDF स्वरूपात तयार झाली!`,
        showConfirmButton: false,
        timer: 2500
      });
    } catch (err) {
      console.error('PDF Export failed:', err);
      Swal.fire({
        icon: 'error',
        title: 'त्रुटी',
        text: 'PDF तयार करताना अडचण आली.'
      });
    } finally {
      setExporting(false);
    }
  };

  const handleWhatsAppShare = async () => {
    try {
      setExporting(true);
      const totalFormatted = totalExpenses.toLocaleString('en-IN');
      const dateRangeCaption = filterPreset === 'custom' && (fromDate || toDate)
        ? `${fromDate || 'सुरुवात'} ते ${toDate || 'आज'}`
        : filterPreset === 'this_month'
        ? 'चालू महिना'
        : 'सर्व नोंदी';

      const caption = `📊 *${projectName} - बांधकाम खर्च अहवाल पावती*\n\n` +
        `📅 *फिल्टर:* ${dateRangeCaption}\n` +
        `💰 *एकूण खर्च:* ₹${totalFormatted}\n` +
        `📝 *नोंदींची संख्या:* ${totalEntries}` + (totalPages > 1 ? ` (${totalPages} पृष्ठे)\n` : '\n') +
        `\n_Generated via Construction Expense Tracker_`;
      
      await shareToWhatsApp(receiptRef.current, caption);
    } catch (err) {
      console.error('WhatsApp share error:', err);
    } finally {
      setExporting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl lg:max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto animate-in zoom-in-95 duration-150 flex flex-col max-h-[95vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-2xs shrink-0">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  पावती अहवाल (Report Slip)
                </h3>
                {totalPages > 1 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    <Layers className="w-3 h-3" />
                    {totalEntries} नोंदी • {totalPages} पृष्ठे (प्रति पृष्ठ १०)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium truncate">
                तारीख फिल्टर करा व PDF / JPG / PNG / WhatsApp वर शेअर करा
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Date Filter Bar */}
        <div className="px-4 sm:px-5 py-2.5 bg-slate-50/80 border-b border-slate-100 space-y-2 shrink-0">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => { setFilterPreset('all'); setFromDate(''); setToDate(''); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterPreset === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
              }`}
            >
              सर्व नोंदी ({expenses.length})
            </button>

            <button
              type="button"
              onClick={() => setFilterPreset('this_month')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterPreset === 'this_month'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
              }`}
            >
              या महिन्यात
            </button>

            <button
              type="button"
              onClick={() => setFilterPreset('last_30')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterPreset === 'last_30'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
              }`}
            >
              मागील ३० दिवस
            </button>

            <button
              type="button"
              onClick={() => setFilterPreset('custom')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filterPreset === 'custom'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
              }`}
            >
              कस्टम तारीख
            </button>
          </div>

          {/* Custom Date Pickers (From Date & To Date) */}
          {filterPreset === 'custom' && (
            <div className="grid grid-cols-2 gap-2 pt-1 animate-in fade-in duration-150">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">
                  पासून (From Date)
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
                  पर्यंत (To Date)
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

        {/* Modal Body: Receipt Card Container with smooth vertical scroll for multi-pages */}
        <div className="p-2 sm:p-4 bg-slate-100/80 overflow-y-auto flex justify-center items-start w-full flex-1">
          <ReportReceiptCard
            ref={receiptRef}
            expenses={filteredExpenses}
            totalExpenses={totalExpenses}
            totalEntries={totalEntries}
            projectName={projectName}
            showActionButtons={false}
          />
        </div>

        {/* Modal Footer Actions: PDF, JPG, PNG & WhatsApp */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-slate-100 space-y-2 shrink-0">
          {/* Main 3 Format Buttons: PDF, JPG, PNG */}
          <div className="grid grid-cols-3 gap-2">
            {/* PDF Button */}
            <button
              onClick={handleExportPDF}
              disabled={exporting}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs hover:shadow transition-all disabled:opacity-50 cursor-pointer"
            >
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
              <span>PDF ({totalPages > 1 ? `${totalPages} पृष्ठे` : 'Export'})</span>
            </button>

            {/* JPG Button */}
            <button
              onClick={() => handleExportImage('jpg')}
              disabled={exporting}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs hover:shadow transition-all disabled:opacity-50 cursor-pointer"
            >
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>JPG डाऊनलोड</span>
            </button>

            {/* PNG Button */}
            <button
              onClick={() => handleExportImage('png')}
              disabled={exporting}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-xs hover:shadow transition-all disabled:opacity-50 cursor-pointer"
            >
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>PNG डाऊनलोड</span>
            </button>
          </div>

          {/* WhatsApp Share Button */}
          <button
            onClick={handleWhatsAppShare}
            disabled={exporting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold shadow-xs hover:shadow transition-all disabled:opacity-50 cursor-pointer"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
            <span>WhatsApp वर शेअर करा {totalPages > 1 ? `(सर्व ${totalPages} पृष्ठे)` : ''}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
