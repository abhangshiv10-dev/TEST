// html2canvas & jsPDF are heavy (~600KB) — load only when the user actually exports
const loadHtml2Canvas = async () => (await import('html2canvas')).default;
const loadJsPDF = async () => (await import('jspdf')).jsPDF;

/**
 * html2canvas does not reliably reproduce `vertical-align: middle` on table cells
 * or `dominant-baseline` inside inline SVG (it draws SVG as a separate image with
 * different font metrics). The result: text/badges look shifted up/down in the
 * exported image. This runs on html2canvas's *cloned* DOM only (the on-screen
 * preview is untouched) and replaces both with explicit flex centering.
 */
function normalizeForCapture(doc, root) {
  if (!root) return;
  const win = doc.defaultView || window;

  // 1) Inline SVG badges -> plain HTML badges (same text renderer as the rest of the row)
  root.querySelectorAll('svg.status-badge').forEach((svg) => {
    const rect = svg.querySelector('rect');
    const text = svg.querySelector('text');
    if (!rect || !text) return;

    const w = parseFloat(svg.getAttribute('width')) || 54;
    const h = parseFloat(svg.getAttribute('height')) || 20;
    const alignRight = svg.style.marginLeft === 'auto';

    const badge = doc.createElement('div');
    badge.className = 'status-badge-html';
    Object.assign(badge.style, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '4px',
      boxSizing: 'border-box',
      width: `${w}px`,
      height: `${h}px`,
      flexShrink: '0',
      background: rect.getAttribute('fill') || '#fff',
      border: `1px solid ${rect.getAttribute('stroke') || 'transparent'}`,
      borderRadius: `${rect.getAttribute('rx') || 5}px`,
      color: text.getAttribute('fill') || '#000',
      fontSize: `${text.getAttribute('font-size') || 9}px`,
      fontWeight: text.getAttribute('font-weight') || '700',
      fontFamily: 'inherit',
      lineHeight: '1',
      whiteSpace: 'nowrap',
      margin: alignRight ? '0 0 0 auto' : '0',
      padding: '0'
    });

    // Keep the small shield icon of the header badge, if present
    const icon = svg.querySelector('g');
    if (icon) {
      const iconSvg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
      iconSvg.setAttribute('width', '12');
      iconSvg.setAttribute('height', '16');
      iconSvg.setAttribute('viewBox', '0 0 12 16');
      iconSvg.style.display = 'block';
      iconSvg.style.flexShrink = '0';
      iconSvg.innerHTML = icon.innerHTML;
      badge.appendChild(iconSvg);
    }

    const label = doc.createElement('span');
    label.textContent = text.textContent;
    Object.assign(label.style, { display: 'block', lineHeight: '1', margin: '0', padding: '0' });
    badge.appendChild(label);

    svg.replaceWith(badge);
  });

  // 2) Table cells -> fixed-height flex boxes, content centred on the row's height
  const rows = Array.from(root.querySelectorAll('table tr'));
  const measured = rows.map((tr) => tr.getBoundingClientRect().height);

  rows.forEach((tr, i) => {
    const rowHeight = Math.ceil(measured[i]);
    tr.querySelectorAll('td, th').forEach((cell) => {
      const cs = win.getComputedStyle(cell);
      const padL = cs.paddingLeft;
      const padR = cs.paddingRight;
      const ta = cs.textAlign;
      const horizontal =
        ta === 'center' ? 'center' : ta === 'right' || ta === 'end' ? 'flex-end' : 'flex-start';

      const wrap = doc.createElement('div');
      while (cell.firstChild) wrap.appendChild(cell.firstChild);
      Object.assign(wrap.style, {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',   // vertical centre
        alignItems: horizontal,
        textAlign: ta === 'end' ? 'right' : ta === 'start' ? 'left' : ta,
        boxSizing: 'border-box',
        height: `${rowHeight}px`,
        paddingLeft: padL,
        paddingRight: padR,
        paddingTop: '0',
        paddingBottom: '0',
        margin: '0'
      });
      cell.appendChild(wrap);

      Object.assign(cell.style, {
        padding: '0',
        height: `${rowHeight}px`,
        verticalAlign: 'middle'
      });
    });
  });
}

/**
 * Measures where a PDF page may safely be cut (CSS px, relative to the top of `root`):
 *  - between table rows
 *  - between the top-level blocks (summary, grand total, footer ...) – never inside them
 * Also returns the table header range so it can be repeated on following pages.
 */
function measureLayout(root, totalHeight) {
  const top = root.getBoundingClientRect().top;
  const rel = (el) => {
    const r = el.getBoundingClientRect();
    return { top: r.top - top, bottom: r.bottom - top };
  };

  const breaks = new Set([0, totalHeight]);
  Array.from(root.children).forEach((child) => {
    const r = rel(child);
    breaks.add(Math.round(r.top));
    breaks.add(Math.round(r.bottom));
  });

  let head = null;
  let tableBottom = 0;
  const table = root.querySelector('table');
  if (table) {
    const headRow = table.querySelector('thead tr');
    if (headRow) head = rel(headRow);
    const bodyRows = Array.from(table.querySelectorAll('tbody tr'));
    bodyRows.forEach((tr) => {
      const r = rel(tr);
      breaks.add(Math.round(r.top));
      breaks.add(Math.round(r.bottom));
      tableBottom = Math.max(tableBottom, r.bottom);
    });
  }

  return {
    height: totalHeight,
    breaks: Array.from(breaks).sort((a, b) => a - b),
    head,
    tableBottom
  };
}

// Fixed width (px) used for every exported image, independent of the device/screen size.
// Prevents the table from being clipped on narrow mobile screens.
const EXPORT_WIDTH = 560;

/**
 * Single place that renders an element to a canvas.
 *
 * The element is cloned into an off-screen container with a fixed width, so the exported
 * image looks the same on phone and desktop (no clipped columns).
 *
 * Primary engine: html-to-image (browser paints the text itself, so vertical alignment
 * matches the preview). Fallback: html2canvas with alignment normalisation.
 */
async function captureElement(element, requestedScale) {
  const host = document.createElement('div');
  host.style.cssText =
    `position:fixed;left:-100000px;top:0;width:${EXPORT_WIDTH}px;pointer-events:none;background:#fff;z-index:-1;`;

  const clone = element.cloneNode(true);
  // Exports always use the full desktop table, even when started from a phone
  clone.setAttribute('data-export', 'true');
  Object.assign(clone.style, {
    width: `${EXPORT_WIDTH}px`,
    minWidth: `${EXPORT_WIDTH}px`,
    maxWidth: 'none',
    margin: '0',
    boxShadow: 'none'
  });
  host.appendChild(clone);
  document.body.appendChild(host);

  try {
    // let the browser lay out the clone
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    const height = Math.max(clone.offsetHeight, 1);
    const layout = measureLayout(clone, height);
    // Very long slips: lower the pixel ratio so the canvas stays within browser limits
    const MAX_CANVAS_HEIGHT = 14000;
    const scale = Math.max(1, Math.min(requestedScale, MAX_CANVAS_HEIGHT / height));

    try {
      const { toCanvas } = await import('html-to-image');
      const options = {
        pixelRatio: scale,
        backgroundColor: '#ffffff',
        cacheBust: true,
        width: EXPORT_WIDTH,
        height
      };
      // First pass warms up fonts/images (needed on Safari/iOS), second is the real one
      await toCanvas(clone, options);
      const out = await toCanvas(clone, options);
      out.layout = layout;
      return out;
    } catch (err) {
      console.warn('html-to-image failed, falling back to html2canvas:', err);
    }

    const html2canvas = await loadHtml2Canvas();
    const fallbackCanvas = await html2canvas(clone, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0,
      windowWidth: EXPORT_WIDTH,
      onclone: (clonedDoc, clonedEl) => normalizeForCapture(clonedDoc, clonedEl)
    });
    fallbackCanvas.layout = layout;
    return fallbackCanvas;
  } finally {
    document.body.removeChild(host);
  }
}

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

    const canvas = await captureElement(element, 3);

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

    const canvas = await captureElement(element, 3);

    const jsPDF = await loadJsPDF();
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 14;
    const printWidth = pageWidth - margin * 2;
    const printableHeight = pageHeight - margin * 2;

    const layout = canvas.layout || null;
    const ratio = layout ? canvas.height / layout.height : 1; // canvas px per CSS px
    const pxPerMm = canvas.width / printWidth;
    const pagePx = Math.floor(printableHeight * pxPerMm);

    // Safe cut positions in canvas pixels
    const breaks = layout ? layout.breaks.map((b) => Math.round(b * ratio)) : [];
    const head = layout && layout.head
      ? { top: Math.round(layout.head.top * ratio), bottom: Math.round(layout.head.bottom * ratio) }
      : null;
    const tableBottom = layout ? Math.round(layout.tableBottom * ratio) : 0;

    let offsetY = 0;
    let pageIndex = 0;
    while (offsetY < canvas.height) {
      // Continuing inside the table body -> repeat the table header on this page
      const repeatHead = !!head && pageIndex > 0 && offsetY >= head.bottom && offsetY < tableBottom;
      const headH = repeatHead ? head.bottom - head.top : 0;
      const room = pagePx - headH;

      let end;
      if (offsetY + room >= canvas.height) {
        end = canvas.height;
      } else {
        // furthest safe break that still fits on this page
        end = 0;
        for (const b of breaks) {
          if (b > offsetY && b <= offsetY + room) end = b;
        }
        if (!end) end = offsetY + room; // a single block taller than a page: hard cut
      }

      const bodyH = end - offsetY;
      const slice = document.createElement('canvas');
      slice.width = canvas.width;
      slice.height = headH + bodyH;
      const ctx = slice.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, slice.width, slice.height);
      if (repeatHead) {
        ctx.drawImage(canvas, 0, head.top, canvas.width, headH, 0, 0, canvas.width, headH);
      }
      ctx.drawImage(canvas, 0, offsetY, canvas.width, bodyH, 0, headH, canvas.width, bodyH);

      if (pageIndex > 0) pdf.addPage();
      pdf.addImage(
        slice.toDataURL('image/png'), 'PNG',
        margin, margin, printWidth, slice.height / pxPerMm,
        undefined, 'FAST'
      );
      offsetY = end;
      pageIndex += 1;
    }

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
    const canvas = await captureElement(element, 2.5);

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
