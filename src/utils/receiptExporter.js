import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Ensures all fonts and images within element are completely loaded before capturing.
 */
async function prepareElementForCapture(element) {
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch (e) {
      console.warn('Font loading wait skipped:', e);
    }
  }

  const images = Array.from(element.querySelectorAll('img'));
  if (images.length > 0) {
    await Promise.all(
      images.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    );
  }
}

/**
 * Captures an HTML element (or multiple .receipt-page elements inside it) and exports as PNG or JPG.
 * @param {HTMLElement} container 
 * @param {string} fileName 
 * @param {'png'|'jpg'} format 
 */
export async function exportElementAsImage(container, fileName = 'receipt', format = 'png') {
  if (!container) return;
  await prepareElementForCapture(container);

  const pageElements = container.querySelectorAll('.receipt-page');
  const targets = pageElements.length > 0 ? Array.from(pageElements) : [container];
  const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
  const quality = format === 'jpg' ? 0.96 : 1.0;

  const results = [];

  for (let i = 0; i < targets.length; i++) {
    const el = targets[i];
    const canvas = await html2canvas(el, {
      scale: 3, // High DPI for crisp text & Marathi fonts
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0
    });

    const dataUrl = canvas.toDataURL(mimeType, quality);
    const suffix = targets.length > 1 ? `_Page_${i + 1}` : '';
    const fullFileName = `${fileName}${suffix}.${format}`;

    const link = document.createElement('a');
    link.download = fullFileName;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    results.push(dataUrl);

    // Short pause between multiple file downloads so the browser handles each cleanly
    if (targets.length > 1 && i < targets.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 250));
    }
  }

  return results;
}

/**
 * Captures an HTML element (or multiple .receipt-page elements inside it) and exports as a crystal-clear multi-page PDF.
 * @param {HTMLElement} container 
 * @param {string} fileName 
 */
export async function exportElementAsPDF(container, fileName = 'receipt_report') {
  if (!container) return;
  await prepareElementForCapture(container);

  const pageElements = container.querySelectorAll('.receipt-page');
  const targets = pageElements.length > 0 ? Array.from(pageElements) : [container];

  // Standard A4 Executive Statement format with crisp professional margins
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 12; // 12mm clean margin
  const printWidth = pageWidth - (margin * 2);

  for (let i = 0; i < targets.length; i++) {
    const el = targets[i];
    const canvas = await html2canvas(el, {
      scale: 3, // High DPI for crystal clear text & icons
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0
    });

    const imgData = canvas.toDataURL('image/png');
    const printHeight = (canvas.height * printWidth) / canvas.width;

    if (i > 0) {
      pdf.addPage();
    }

    const finalHeight = Math.min(printHeight, pageHeight - (margin * 2));
    pdf.addImage(imgData, 'PNG', margin, margin, printWidth, finalHeight, undefined, 'FAST');
  }

  pdf.save(`${fileName}.pdf`);
  return pdf;
}

/**
 * Shares image(s) of all pages and caption text to WhatsApp using Web Share API Level 2.
 * If there are multiple pages (e.g. 2 pages for >10 entries), both page images are shared together.
 * @param {HTMLElement} container 
 * @param {string} captionText 
 */
export async function shareToWhatsApp(container, captionText = '') {
  const textEncoded = encodeURIComponent(captionText);
  
  if (!container) {
    window.open(`https://api.whatsapp.com/send?text=${textEncoded}`, '_blank');
    return;
  }

  await prepareElementForCapture(container);

  const pageElements = container.querySelectorAll('.receipt-page');
  const targets = pageElements.length > 0 ? Array.from(pageElements) : [container];

  try {
    const files = [];

    for (let i = 0; i < targets.length; i++) {
      const el = targets[i];
      const canvas = await html2canvas(el, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        scrollX: 0,
        scrollY: 0
      });

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (blob) {
        const pageFileName = targets.length > 1 ? `construction_receipt_page_${i + 1}.png` : 'construction_receipt.png';
        files.push(new File([blob], pageFileName, { type: 'image/png' }));
      }
    }

    // Try native multi-file Web Share API Level 2 (supported on modern mobile browsers)
    if (files.length > 0 && navigator.canShare && navigator.canShare({ files })) {
      await navigator.share({
        files,
        title: 'बांधकाम खर्च पावती अहवाल',
        text: captionText
      });
      return true;
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      // User dismissed share dialog
      return;
    }
    console.warn('Web Share API error, attempting fallback:', err);
  }

  // Fallback: If desktop browser doesn't support direct file attachment share,
  // download images so user has all pages and open WhatsApp Web with caption
  try {
    await exportElementAsImage(container, 'Construction_Expense_Receipt', 'png');
  } catch (e) {
    console.warn('Fallback image download failed:', e);
  }

  window.open(`https://api.whatsapp.com/send?text=${textEncoded}`, '_blank');
}
