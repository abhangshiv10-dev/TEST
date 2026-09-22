import React, { useState, useEffect, useMemo } from 'react';
import { useProject } from '../../contexts/ProjectContext';
import { PageHeader } from '../../components/common/PageHeader';
import { PhotoModal } from '../../components/modals/PhotoModal';
import { formatDate } from '../../utils/date';
import { showConfirmDialog, showSuccessToast, showErrorAlert } from '../../utils/validators';
import { DataService } from '../../services/dataService';
import { Camera, Plus, Trash2, Maximize2, Calendar, Layers } from 'lucide-react';

export const PhotosGallery = () => {
  const { currentProject, stages } = useProject();
  const [photos, setPhotos] = useState([]);
  const [selectedStageFilter, setSelectedStageFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);

  const loadPhotos = async () => {
    if (!currentProject) return;
    const list = await DataService.getPhotos(currentProject.id);
    setPhotos(list || []);
  };

  useEffect(() => {
    loadPhotos();
  }, [currentProject]);

  const filteredPhotos = useMemo(() => {
    if (selectedStageFilter === 'all') return photos;
    return photos.filter(p => p.stage_id === selectedStageFilter);
  }, [photos, selectedStageFilter]);

  const handleDelete = async (photo) => {
    const confirmed = await showConfirmDialog({
      title: 'Delete Photo?',
      text: 'Are you sure you want to remove this photo from project gallery?',
      confirmButtonText: 'Yes, delete'
    });

    if (confirmed) {
      try {
        await DataService.deletePhoto(photo.id);
        showSuccessToast('Photo deleted');
        await loadPhotos();
      } catch (err) {
        showErrorAlert(err.message);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Construction Site Photos"
        subtitle="Visual photographic timeline of construction stages, rebar inspections, and finishes"
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs sm:text-sm font-bold shadow-sm transition-all"
          >
            <Camera className="w-4 h-4" />
            <span>Upload Photo</span>
          </button>
        }
      />

      {/* Stage Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedStageFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedStageFilter === 'all'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          All Photos ({photos.length})
        </button>

        {stages.map(stg => {
          const count = photos.filter(p => p.stage_id === stg.id).length;
          if (count === 0) return null;
          return (
            <button
              key={stg.id}
              onClick={() => setSelectedStageFilter(stg.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedStageFilter === stg.id
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              Stage {stg.order_index}: {stg.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Photos Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-400">
          <Camera className="w-12 h-12 mx-auto text-primary-500 mb-3 opacity-70" />
          <h3 className="font-bold text-slate-700 dark:text-slate-200">No photos found</h3>
          <p className="text-xs max-w-sm mx-auto mt-1 mb-4">
            Upload images of ongoing excavation, column casting, roof slabs, and interior styling.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-primary-600 text-white text-xs font-bold"
          >
            + Upload Site Photo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((p) => {
            const stg = stages.find(s => s.id === p.stage_id);

            return (
              <div key={p.id} className="glass-card overflow-hidden group flex flex-col justify-between">
                <div className="relative aspect-video bg-slate-900 overflow-hidden">
                  <img
                    src={p.photo_url}
                    alt={p.caption || 'Site Photo'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={() => setPreviewPhoto(p)}
                      className="p-2.5 rounded-full bg-white/20 hover:bg-white text-white hover:text-slate-900 backdrop-blur-md transition-colors"
                      title="View Full Size"
                    >
                      <Maximize2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      className="p-2.5 rounded-full bg-rose-600/80 hover:bg-rose-600 text-white backdrop-blur-md transition-colors"
                      title="Delete Photo"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {stg && (
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-slate-950/70 backdrop-blur-md text-white text-[10px] font-bold">
                      Stage {stg.order_index}: {stg.name}
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-1">
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 line-clamp-2">
                    {p.caption || p.file_name || 'Construction milestone photo'}
                  </p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(p.taken_at || p.created_at)}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <PhotoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={loadPhotos}
      />

      {/* Lightbox Preview Modal */}
      {previewPhoto && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <div className="fixed inset-0" onClick={() => setPreviewPhoto(null)} />
          <div className="relative max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl z-10">
            <div className="p-4 flex items-center justify-between border-b border-slate-800">
              <div className="text-white text-xs">
                <p className="font-bold text-sm">{previewPhoto.caption || 'Site Photo'}</p>
                <p className="text-slate-400 mt-0.5">{formatDate(previewPhoto.taken_at)}</p>
              </div>
              <button
                onClick={() => setPreviewPhoto(null)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
            <div className="p-4 flex items-center justify-center max-h-[75vh] overflow-hidden">
              <img src={previewPhoto.photo_url} alt="Full Preview" className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
