import { useEffect, useRef, useState } from 'react';
import { renderElementToFile } from './receiptExporter';

/**
 * Builds the receipt image in the background while a receipt popup is open,
 * so the WhatsApp button can share it instantly (see receiptExporter.js for why).
 *
 *   enabled : true while the popup is open
 *   version : any string - when it changes (filter, language, data) the image is rebuilt
 *
 * Returns { file, preparing }.
 */
export function useShareImage(elementRef, { enabled, version, fileName = 'construction_receipt.png' }) {
  const [file, setFile] = useState(null);
  const [preparing, setPreparing] = useState(false);
  const runId = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setFile(null);
      setPreparing(false);
      return undefined;
    }

    const id = ++runId.current;
    setFile(null);
    setPreparing(true);

    // small delay: let the popup finish rendering, and skip work while the user is still typing dates
    const timer = setTimeout(async () => {
      try {
        const result = await renderElementToFile(elementRef.current, fileName, 4);
        if (runId.current === id) setFile(result);
      } catch (err) {
        console.warn('Could not prepare the share image:', err);
      } finally {
        if (runId.current === id) setPreparing(false);
      }
    }, 600);

    return () => {
      clearTimeout(timer);
      runId.current++; // ignore a result that arrives after the inputs changed
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, version, fileName]);

  return { file, preparing };
}

/** Renders every `.receipt-capture-root` inside `container` into its own PNG (in order). */
export async function renderPageFiles(container, fileBase = 'Expense_Report', scale = 4) {
  if (!container) return [];
  const pages = Array.from(container.querySelectorAll('.receipt-capture-root'));
  const files = [];
  for (let i = 0; i < pages.length; i++) {
    const name = pages.length > 1 ? `${fileBase}_${i + 1}_of_${pages.length}.png` : `${fileBase}.png`;
    // one at a time keeps memory low on phones; the short pause lets the screen repaint in between
    if (i > 0) await new Promise((r) => setTimeout(r, 120));
    files.push(await renderElementToFile(pages[i], name, scale));
  }
  return files;
}

/**
 * Same idea as useShareImage, but for a hidden container holding SEVERAL slips
 * (e.g. 15 records per image). Returns { files, preparing } - files is [] until ready.
 */
export function useShareImages(containerRef, { enabled, version, fileBase = 'Expense_Report' }) {
  const [files, setFiles] = useState([]);
  const [preparing, setPreparing] = useState(false);
  const runId = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setFiles([]);
      setPreparing(false);
      return undefined;
    }

    const id = ++runId.current;
    setFiles([]);
    setPreparing(true);

    // Wait until the user stops tapping filters, then start only when the browser is idle,
    // so the heavy drawing never freezes the buttons on the screen.
    let idleHandle = null;
    const run = async () => {
      try {
        const result = await renderPageFiles(containerRef.current, fileBase, 3);
        if (runId.current === id) setFiles(result);
      } catch (err) {
        console.warn('Could not prepare the share images:', err);
      } finally {
        if (runId.current === id) setPreparing(false);
      }
    };
    const timer = setTimeout(() => {
      if (typeof window.requestIdleCallback === 'function') {
        idleHandle = window.requestIdleCallback(run, { timeout: 3000 });
      } else {
        run();
      }
    }, 1200);

    return () => {
      clearTimeout(timer);
      if (idleHandle !== null && typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idleHandle);
      runId.current++;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, version, fileBase]);

  return { files, preparing };
}
