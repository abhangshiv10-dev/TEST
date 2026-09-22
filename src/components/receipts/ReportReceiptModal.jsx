import React, { useRef, useState, useMemo } from 'react';
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

  // Max 10 entries for the slip
  const displayExpenses = filteredExpenses.slice(0, 10);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalEntries = filteredExpenses.length;

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
        title: `पावती ${format.toUpperCase()} स्वरूपात डाउनलोड झाली!`,
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
        title: `पावती PDF स्वरूपात तयार झाली!`,
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
        `📝 *नोंदींची संख्या:* ${totalEntries}\n\n` +
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
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-2xs">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">पावती अहवाल (Report Slip)</h3>
              <p className="text-[11px] text-slate-500 font-medium">तारीख फिल्टर करा व PDF / JPG / PNG डाउनलोड करा</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Date Filter Bar */}
        <div className="px-5 py-3 bg-white border-b border-slate-100 space-y-2.5">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => { setFilterPreset('all'); setFromDate(''); setToDate(''); }}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                filterPreset === 'all'
                  ? 'bg-[#059669] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              सर्व नोंदी ({expenses.length})
            </button>

            <button
              type="button"
              onClick={() => setFilterPreset('this_month')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                filterPreset === 'this_month'
                  ? 'bg-[#059669] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              या महिन्यात
            </button>

            <button
              type="button"
              onClick={() => setFilterPreset('last_30')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                filterPreset === 'last_30'
                  ? 'bg-[#059669] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              मागील ३० दिवस
            </button>

            <button
              type="button"
              onClick={() => setFilterPreset('custom')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                filterPreset === 'custom'
                  ? 'bg-[#059669] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
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
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Body: Receipt Card Container */}
        <div className="p-4 sm:p-5 bg-slate-100/70 max-h-[60vh] overflow-y-auto flex justify-center">
          <ReportReceiptCard
            ref={receiptRef}
            expenses={displayExpenses}
            totalExpenses={totalExpenses}
            totalEntries={totalEntries}
            projectName={projectName}
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
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs hover:shadow transition-all disabled:opacity-50"
            >
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
              <span>PDF Export</span>
            </button>

            {/* JPG Button */}
            <button
              onClick={() => handleExportImage('jpg')}
              disabled={exporting}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs hover:shadow transition-all disabled:opacity-50"
            >
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>JPG डाऊनलोड</span>
            </button>

            {/* PNG Button */}
            <button
              onClick={() => handleExportImage('png')}
              disabled={exporting}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold shadow-xs hover:shadow transition-all disabled:opacity-50"
            >
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>PNG डाऊनलोड</span>
            </button>
          </div>

          {/* WhatsApp Share Button */}
          <button
            onClick={handleWhatsAppShare}
            disabled={exporting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold shadow-xs hover:shadow transition-all disabled:opacity-50"
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp वर शेअर करा (Share on WhatsApp)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
