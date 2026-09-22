import html2canvas from 'html2canvas';

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

  // Clone the element into an isolated off-screen container
  const clone = element.cloneNode(true);
  
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.zIndex = '-9999';
  container.style.width = 'max-content';
  container.style.height = 'max-content';
  container.style.overflow = 'visible';
  container.style.backgroundColor = 'transparent';
  container.style.pointerEvents = 'none';
  
  clone.style.margin = '0';
  clone.style.maxHeight = 'none';
  clone.style.height = 'auto';
  clone.style.overflow = 'visible';
  clone.style.transform = 'none';
  
  // Anti-clipping rule application on all cloned text nodes
  const allNodes = clone.querySelectorAll('*');
  allNodes.forEach((node) => {
    node.style.overflow = 'visible';
    node.style.textOverflow = 'clip';
    
    // Apply ample line-height for ascenders and descenders in Marathi & English
    if (node.classList && node.classList.contains('status-badge')) {
      node.style.display = 'inline-block';
      node.style.textAlign = 'center';
      node.style.verticalAlign = 'middle';
      node.style.lineHeight = '16px';
      node.style.height = '16px';
      node.style.padding = '0 7px';
      node.style.boxSizing = 'border-box';
    } else if (node.tagName === 'SPAN' || node.tagName === 'P' || node.tagName === 'H1' || node.tagName === 'H2' || node.tagName === 'H3' || node.tagName === 'H4') {
      node.style.lineHeight = '1.6';
      node.style.letterSpacing = 'normal';
      node.style.paddingTop = '1px';
      node.style.paddingBottom = '2px';
    }
  });

  container.appendChild(clone);
  document.body.appendChild(container);

  try {
    // Wait for any images inside clone to be loaded
    const images = Array.from(clone.querySelectorAll('img'));
    await Promise.all(images.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    }));

    // Measure untruncated dimensions
    const fullWidth = clone.offsetWidth || 350;
    const fullHeight = clone.scrollHeight || clone.offsetHeight || 600;

    const canvas = await html2canvas(clone, {
      scale: 3, // High DPI for crystal clear text & icons
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
      width: fullWidth,
      height: fullHeight,
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
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}

/**
 * Shares image and text to WhatsApp using isolated off-screen capture
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

  // Clone into isolated off-screen container
  const clone = element.cloneNode(true);
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.zIndex = '-9999';
  container.style.width = 'max-content';
  container.style.height = 'max-content';
  container.style.overflow = 'visible';
  container.style.backgroundColor = 'transparent';
  container.style.pointerEvents = 'none';

  clone.style.margin = '0';
  clone.style.maxHeight = 'none';
  clone.style.height = 'auto';
  clone.style.overflow = 'visible';
  clone.style.transform = 'none';

  const allNodes = clone.querySelectorAll('*');
  allNodes.forEach((node) => {
    node.style.overflow = 'visible';
    node.style.textOverflow = 'clip';
    if (node.classList && node.classList.contains('status-badge')) {
      node.style.display = 'inline-block';
      node.style.textAlign = 'center';
      node.style.verticalAlign = 'middle';
      node.style.lineHeight = '16px';
      node.style.height = '16px';
      node.style.padding = '0 7px';
      node.style.boxSizing = 'border-box';
    } else if (node.tagName === 'SPAN' || node.tagName === 'P' || node.tagName === 'H1' || node.tagName === 'H2' || node.tagName === 'H3' || node.tagName === 'H4') {
      node.style.lineHeight = '1.6';
      node.style.letterSpacing = 'normal';
      node.style.paddingTop = '1px';
      node.style.paddingBottom = '2px';
    }
  });

  container.appendChild(clone);
  document.body.appendChild(container);

  try {
    const fullWidth = clone.offsetWidth || 350;
    const fullHeight = clone.scrollHeight || clone.offsetHeight || 600;

    const canvas = await html2canvas(clone, {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
      width: fullWidth,
      height: fullHeight,
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
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }

  // Fallback direct WhatsApp text share
  window.open(`https://api.whatsapp.com/send?text=${textEncoded}`, '_blank');
}
