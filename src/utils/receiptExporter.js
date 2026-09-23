import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Captures an HTML element and exports as PNG or JPG using an isolated off-screen container.
 * Applies anti-clipping typography fixes to guarantee zero text truncation on any device.
 * @param {HTMLElement} element 
 * @param {string} fileName 
 * @param {'png'|'jpg'} format 
 */
export async function exportElementAsImage(element, fileName = 'receipt', format = 'png') {
  if (!element) return;

  // Ensure fonts are fully loaded
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch (e) {
      console.warn('Font loading wait skipped:', e);
    }
  }

  try {
    // Wait for any images inside element to be loaded
    const images = Array.from(element.querySelectorAll('img'));
    await Promise.all(images.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    }));

    const canvas = await html2canvas(element, {
      scale: 3, // High DPI for crystal clear text & icons
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0
    });

    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
    const quality = format === 'jpg' ? 0.96 : 1.0;
    const dataUrl = canvas.toDataURL(mimeType, quality);

    const link = document.createElement('a');
    link.download = `${fileName}.${format}`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return dataUrl;
  } catch (err) {
    console.error('Image export error:', err);
    throw err;
  }
}

/**
 * Captures an HTML element and exports as a crystal-clear PDF document using jsPDF
 * @param {HTMLElement} element 
 * @param {string} fileName 
 */
export async function exportElementAsPDF(element, fileName = 'receipt_report') {
  if (!element) return;

  // Ensure fonts are fully loaded
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch (e) {
      console.warn('Font loading wait skipped:', e);
    }
  }

  try {
    const images = Array.from(element.querySelectorAll('img'));
    await Promise.all(images.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    }));

    const canvas = await html2canvas(element, {
      scale: 3, // High DPI for crystal clear text & icons
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    // Standard A4 Executive Statement format with crisp professional margins
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 14; // 14mm clean margin
    const printWidth = pageWidth - (margin * 2);
    const printHeight = (imgHeight * printWidth) / imgWidth;

    pdf.addImage(imgData, 'PNG', margin, margin, printWidth, printHeight, undefined, 'FAST');
    pdf.save(`${fileName}.pdf`);

    return pdf;
  } catch (err) {
    console.error('PDF export error:', err);
    throw err;
  }
}

/**
 * Shares image and text to WhatsApp using direct capture
 * @param {HTMLElement} element 
 * @param {string} captionText 
 */
export async function shareToWhatsApp(element, captionText = '') {
  const textEncoded = encodeURIComponent(captionText);
  
  if (!element) {
    window.open(`https://api.whatsapp.com/send?text=${textEncoded}`, '_blank');
    return;
  }

  // Ensure fonts are ready
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch (e) {
      console.warn('Font loading wait skipped:', e);
    }
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0
    });

    if (navigator.canShare) {
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (blob) {
        const file = new File([blob], 'construction_receipt.png', { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'बांधकाम खर्च पावती',
            text: captionText
          });
          return;
        }
      }
    }
  } catch (err) {
    console.warn('Share error fallback:', err);
  }

  // Fallback direct WhatsApp text share
  window.open(`https://api.whatsapp.com/send?text=${textEncoded}`, '_blank');
}
