import React, { useRef } from 'react';
import { Camera, Image as ImageIcon, X, RefreshCw, Eye } from 'lucide-react';

export default function PhotoUploader({
  photoUrl,
  selectedFile,
  onFileSelect,
  onRemovePhoto,
  onViewPhoto
}) {
  const fileInputRef = useRef(null);

  const previewUrl = selectedFile ? URL.createObjectURL(selectedFile) : photoUrl;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {previewUrl ? (
        <div className="relative group rounded-xl border border-slate-200 overflow-hidden bg-slate-900/5 aspect-video sm:aspect-[2/1] max-h-48 flex items-center justify-center">
          <img
            src={previewUrl}
            alt="खर्च पावती/फोटो"
            className="w-full h-full object-cover"
          />

          {/* Overlay Action Buttons */}
          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
            {onViewPhoto && (
              <button
                type="button"
                onClick={() => onViewPhoto(previewUrl)}
                className="p-2 bg-white/90 hover:bg-white text-slate-800 rounded-lg text-xs font-medium flex items-center gap-1 shadow-sm transition-transform hover:scale-105"
                title="फोटो पूर्ण पाहा"
              >
                <Eye className="w-4 h-4" />
                <span>पाहा</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 bg-white/90 hover:bg-white text-slate-800 rounded-lg text-xs font-medium flex items-center gap-1 shadow-sm transition-transform hover:scale-105"
              title="फोटो बदला"
            >
              <RefreshCw className="w-4 h-4" />
              <span>बदला</span>
            </button>

            <button
              type="button"
              onClick={onRemovePhoto}
              className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium flex items-center gap-1 shadow-sm transition-transform hover:scale-105"
              title="फोटो हटवा"
            >
              <X className="w-4 h-4" />
              <span>हटवा</span>
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-3 px-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-100/50 transition-colors flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-slate-800"
        >
          <div className="w-7 h-7 rounded-full bg-white shadow-xs border border-slate-200 flex items-center justify-center text-slate-600">
            <Camera className="w-3.5 h-3.5" />
          </div>
          <div className="text-xs font-semibold text-slate-700">
            + फोटो किंवा बिल जोडा
          </div>
          <div className="text-[10px] text-slate-400">
            (कॅमेरा किंवा गॅलरीतून निवडा)
          </div>
        </button>
      )}
    </div>
  );
}
