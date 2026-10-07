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
