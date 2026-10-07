import React, { Suspense, lazy } from 'react';

// Receipt modals pull in html2canvas / jsPDF-related code. Load them only the
// first time a receipt is actually opened, so the main bundle stays small.
const SingleLazy = lazy(() =>
  import('./SingleExpenseReceiptModal').then((m) => ({ default: m.SingleExpenseReceiptModal }))
);
const ReportLazy = lazy(() =>
  import('./ReportReceiptModal').then((m) => ({ default: m.ReportReceiptModal }))
);

export function SingleExpenseReceiptModal(props) {
  if (!props.isOpen) return null;
  return (
    <Suspense fallback={null}>
      <SingleLazy {...props} />
    </Suspense>
  );
}

export function ReportReceiptModal(props) {
  if (!props.isOpen) return null;
  return (
    <Suspense fallback={null}>
      <ReportLazy {...props} />
    </Suspense>
  );
}
