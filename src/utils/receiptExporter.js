import html2canvas from 'html2canvas';

/**
 * Captures an HTML element and exports as PNG or JPG
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
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });

    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
    const quality = format === 'jpg' ? 0.95 : 1.0;
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
        backgroundColor: '#ffffff'
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
