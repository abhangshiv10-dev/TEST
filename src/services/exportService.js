import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/date';

export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || !data.length) return;
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  XLSX.writeFile(wb, filename);
};

export const exportExpensesToExcel = (expenses, projectName = 'HomeBuild') => {
  if (!expenses || !expenses.length) return;

  const formattedRows = expenses.map((exp, idx) => ({
    'Sr No': idx + 1,
    'Date': formatDate(exp.expense_date),
    'Description': exp.description,
    'Category': exp.category_id || 'General',
    'Paid To / Supplier': exp.paid_to || '-',
    'Quantity': exp.quantity || '-',
    'Unit': exp.unit || '-',
    'Rate (₹)': exp.rate || '-',
    'Total Amount (₹)': exp.amount,
    'Payment Method': exp.payment_method,
    'Payment Status': exp.payment_status,
    'Paid Amount (₹)': exp.paid_amount || exp.amount,
    'Pending (₹)': (exp.amount - (exp.paid_amount || (exp.payment_status === 'Paid' ? exp.amount : 0))),
    'Ref / Bill No': exp.reference_number || '-',
    'Notes': exp.notes || '-'
  }));

  const ws = XLSX.utils.json_to_sheet(formattedRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
  XLSX.writeFile(wb, `${projectName}_Expenses_${formatDate(new Date(), 'yyyyMMdd')}.xlsx`);
};

export const exportPDFReport = ({ project, expenses, budgets, stages, summary }) => {
  const doc = new jsPDF();

  // Title & Header
  doc.setFontSize(18);
  doc.setTextColor(12, 143, 230); // Primary blue
  doc.text('HomeBuild Tracker - Construction Report', 14, 20);

  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85); // Slate
  doc.text(`Project: ${project?.name || 'Home Construction'}`, 14, 28);
  doc.text(`Owner: ${project?.owner_name || '-'} | Location: ${project?.address || '-'}`, 14, 34);
  doc.text(`Generated on: ${formatDate(new Date(), 'dd MMMM yyyy, hh:mm a')}`, 14, 40);

  // Summary Metrics Table
  doc.autoTable({
    startY: 46,
    head: [['Total Budget', 'Total Spent', 'Remaining', 'Budget Used %', 'Pending Dues']],
    body: [[
      formatCurrency(summary.totalBudget),
      formatCurrency(summary.totalSpent),
      formatCurrency(summary.remainingBudget),
      `${summary.budgetUsedPct}%`,
      formatCurrency(summary.pendingPayments)
    ]],
    theme: 'grid',
    headStyles: { fillColor: [12, 143, 230], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { halign: 'center', fontSize: 10 }
  });

  // Recent Expenses
  if (expenses && expenses.length > 0) {
    const expenseRows = expenses.slice(0, 25).map(e => [
      formatDate(e.expense_date, 'dd/MM/yy'),
      e.description?.substring(0, 30) || '-',
      e.paid_to || '-',
      formatCurrency(e.amount),
      e.payment_status || 'Paid'
    ]);

    doc.setFontSize(13);
    doc.setTextColor(15, 23, 42);
    doc.text('Recent Construction Expenses', 14, doc.lastAutoTable.finalY + 12);

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 16,
      head: [['Date', 'Description', 'Paid To', 'Amount (₹)', 'Status']],
      body: expenseRows,
      theme: 'striped',
      headStyles: { fillColor: [71, 85, 105] },
      styles: { fontSize: 8 }
    });
  }

  doc.save(`${project?.name || 'HomeBuild'}_Construction_Report.pdf`);
};
