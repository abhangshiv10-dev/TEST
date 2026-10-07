/**
 * Shrinks a photo before upload.
 * Phone cameras produce 3-8 MB images; for receipts/site photos 1600px @ 80% JPEG
 * (~150-300 KB) is more than enough and uploads/loads 10-20x faster.
 * Falls back to the original file if anything goes wrong.
 */
export async function compressImage(file, { maxDim = 1600, quality = 0.8, skipBelowBytes = 250 * 1024 } = {}) {
  try {
    if (!file || !file.type || !file.type.startsWith('image/')) return file;
    if (file.type === 'image/gif' || file.type === 'image/svg+xml') return file;
    if (file.size <= skipBelowBytes) return file;

    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff'; // PNG transparency -> white for JPEG
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob || blob.size >= file.size) return file; // not smaller -> keep original

    const baseName = (file.name || 'photo').replace(/\.[^.]+$/, '');
    return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
  } catch (err) {
    console.warn('Image compression skipped:', err?.message);
    return file;
  }
}
