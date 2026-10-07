import React, { useRef, useMemo, useEffect } from 'react';
import { Camera, Image as ImageIcon, X, Eye, Plus } from 'lucide-react';
import { MAX_EXPENSE_PHOTOS } from '../../utils/expensePhotos';

// Multiple photo / bill uploader.
//   existingPhotos : [{ url, path }]  -> already saved photos (edit mode)
//   newFiles       : File[]           -> photos picked now, not uploaded yet
export default function PhotoUploader({
  existingPhotos = [],
  newFiles = [],
  onAddFiles,
  onRemoveExisting,
  onRemoveNew,
  onViewPhoto
}) {
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);

  const objectUrls = useMemo(() => newFiles.map((f) => URL.createObjectURL(f)), [newFiles]);
  useEffect(() => () => objectUrls.forEach((u) => URL.revokeObjectURL(u)), [objectUrls]);

  const items = [
    ...existingPhotos.map((p, i) => ({ key: `old-${i}`, url: p.url, kind: 'old', index: i })),
    ...newFiles.map((f, i) => ({ key: `new-${i}`, url: objectUrls[i], kind: 'new', index: i }))
  ];
  const total = items.length;
  const remaining = MAX_EXPENSE_PHOTOS - total;
  const allUrls = items.map((it) => it.url);

  const handleChange = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ''; // allow picking the same file again
    if (files.length === 0) return;
    onAddFiles(files.slice(0, Math.max(remaining, 0)));
  };

  const handleRemove = (it) => {
    if (it.kind === 'old') onRemoveExisting(it.index);
    else onRemoveNew(it.index);
  };

  return (
    <div className="w-full space-y-2">
      {/* Camera = one photo at a time. Gallery = select many at once. */}
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handleChange} className="hidden" />
      <input ref={galleryRef} type="file" accept="image/*" multiple onChange={handleChange} className="hidden" />

      {total > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {items.map((it) => (
            <div
              key={it.key}
              className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100"
            >
              <img
                src={it.url}
                alt="खर्च पावती/फोटो"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {it.kind === 'new' && (
                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-bold leading-none">
                  नवीन
                </span>
              )}
              {onViewPhoto && (
                <button
                  type="button"
                  onClick={() => onViewPhoto(it.url, 'खर्च पावती/फोटो', allUrls)}
                  className="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-950/0 hover:bg-slate-950/30 text-white opacity-0 hover:opacity-100 transition-all"
                  title="फोटो पूर्ण पाहा"
                >
                  <Eye className="w-5 h-5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => handleRemove(it)}
                className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-sm"
                title="फोटो हटवा"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {remaining > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="py-2.5 px-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-100/50 transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-700"
          >
            <Camera className="w-4 h-4" />
            <span>कॅमेरा</span>
          </button>
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            className="py-2.5 px-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-100/50 transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-700"
          >
            {total > 0 ? <Plus className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
            <span>{total > 0 ? 'आणखी फोटो' : 'गॅलरी (अनेक निवडा)'}</span>
          </button>
        </div>
      ) : null}

      <div className="text-[10px] text-slate-400">
        {total > 0 ? `${total} फोटो जोडले` : 'एकापेक्षा जास्त फोटो / बिल जोडता येतात'} (जास्तीत जास्त {MAX_EXPENSE_PHOTOS})
      </div>
    </div>
  );
}
