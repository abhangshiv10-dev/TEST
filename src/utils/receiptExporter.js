import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Renders a receipt page element into a high-DPI canvas using an isolated,
 * unconstrained 720px offscreen sandbox. This completely avoids mobile viewport
 * clipping, text truncation, or horizontal scroll squishing.
 * @param {HTMLElement} pageElement 
 * @param {number} scale 
 * @returns {Promise<HTMLCanvasElement>}
 */
async function renderPageToCanvas(pageElement, scale = 2.5) {
  // Ensure fonts are ready
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch (e) {
      console.warn('Font loading wait skipped:', e);
    }
  }

  // Create isolated offscreen wrapper with fixed desktop standard width (720px)
  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.left = '-99999px';
  wrapper.style.top = '0';
  wrapper.style.width = '720px';
  wrapper.style.minWidth = '720px';
  wrapper.style.maxWidth = '720px';
  wrapper.style.backgroundColor = '#ffffff';
  wrapper.style.zIndex = '-99999';
  wrapper.style.boxSizing = 'border-box';
  wrapper.style.overflow = 'visible';
  wrapper.style.opacity = '1';
  wrapper.style.pointerEvents = 'none';

  // Clone page element
  const clone = pageElement.cloneNode(true);
  clone.style.width = '720px';
  clone.style.minWidth = '720px';
  clone.style.maxWidth = '720px';
  clone.style.boxSizing = 'border-box';
  clone.style.overflow = 'visible';
  clone.style.transform = 'none';
  clone.style.margin = '0';

  // Remove any mobile-specific truncation or scrollbars inside clone
  clone.querySelectorAll('*').forEach(node => {
    node.style.overflow = 'visible';
    if (node.classList && node.classList.contains('truncate')) {
      node.classList.remove('truncate');
    }
  });

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  try {
    // Wait for any images inside clone
    const images = Array.from(wrapper.querySelectorAll('img'));
    if (images.length > 0) {
      await Promise.all(
        images.map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise(res => {
            img.onload = res;
            img.onerror = res;
          });
        })
      );
    }

    // Small delay to allow browser to calculate full layout
    await new Promise(resolve => setTimeout(resolve, 50));

    const canvas = await html2canvas(clone, {
      scale: scale, // 2.5x to 3x for ultra-crisp text & Marathi fonts
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: 720,
      windowWidth: 1200,
      scrollX: 0,
      scrollY: 0
    });

    return canvas;
  } finally {
    if (document.body.contains(wrapper)) {
      document.body.removeChild(wrapper);
    }
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

  const pageElements = container.querySelectorAll('.receipt-page');
  const targets = pageElements.length > 0 ? Array.from(pageElements) : [container];
  const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
  const quality = format === 'jpg' ? 0.96 : 1.0;

  const results = [];

  for (let i = 0; i < targets.length; i++) {
    const el = targets[i];
    const canvas = await renderPageToCanvas(el, 3.0); // 3x scale for crystal clear HD images

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
    const canvas = await renderPageToCanvas(el, 3.0);

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

  const pageElements = container.querySelectorAll('.receipt-page');
  const targets = pageElements.length > 0 ? Array.from(pageElements) : [container];

  try {
    const files = [];

    for (let i = 0; i < targets.length; i++) {
      const el = targets[i];
      const canvas = await renderPageToCanvas(el, 2.5);

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
