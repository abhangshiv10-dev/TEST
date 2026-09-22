import html2canvas from 'html2canvas';

/**
 * Captures an HTML element and exports as PNG or JPG with crystal-clear typography
 * @param {HTMLElement} element 
 * @param {string} fileName 
 * @param {'png'|'jpg'} format 
 */
export async function exportElementAsImage(element, fileName = 'receipt', format = 'png') {
  if (!element) return;

  try {
    const canvas = await html2canvas(element, {
      scale: 3, // High DPI for crystal clear text & icons
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc) => {
        // Find cloned element
        const target = clonedDoc.querySelector('.receipt-capture-root') || clonedDoc.body;
        if (target) {
          target.style.transform = 'none';
          target.style.boxSizing = 'border-box';
          
          // Ensure all text elements have ample line-height and no overflow clipping
          const allText = target.querySelectorAll('*');
          allText.forEach((node) => {
            const computedStyle = window.getComputedStyle(node);
            if (computedStyle.overflow === 'hidden') {
              node.style.overflow = 'visible';
            }
          });
        }
      }
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
 * Shares image and text to WhatsApp
 * @param {HTMLElement} element 
 * @param {string} captionText 
 */
export async function shareToWhatsApp(element, captionText = '') {
  const textEncoded = encodeURIComponent(captionText);
  
  // Try Web Share API with file if supported on mobile
  if (navigator.canShare && element) {
    try {
      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          const target = clonedDoc.querySelector('.receipt-capture-root') || clonedDoc.body;
          if (target) {
            target.style.transform = 'none';
          }
        }
      });

      canvas.toBlob(async (blob) => {
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
        window.open(`https://api.whatsapp.com/send?text=${textEncoded}`, '_blank');
      }, 'image/png');
      return;
    } catch (err) {
      console.warn('Native share failed, fallback to url share:', err);
    }
  }

  // Fallback direct WhatsApp text share
  window.open(`https://api.whatsapp.com/send?text=${textEncoded}`, '_blank');
}
