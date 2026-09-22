import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useProject } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatInputDate } from '../../utils/date';
import { uploadStorageFile } from '../../services/supabaseClient';
import { DataService } from '../../services/dataService';
import { showSuccessToast, showErrorAlert } from '../../utils/validators';
import { Upload, Camera, Image as ImageIcon } from 'lucide-react';

export const PhotoModal = ({
  isOpen,
  onClose,
  onSaved
}) => {
  const { currentProject, stages, refreshProjectData } = useProject();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    stage_id: stages[0]?.id || '',
    caption: '',
    taken_at: formatInputDate(new Date()),
    photo_url: '',
    file_name: ''
  });
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const path = `${user?.id || 'demo'}/${currentProject?.id || 'proj'}/photos/${Date.now()}_${file.name}`;
      const { data, error } = await uploadStorageFile('construction-photos', path, file);
      if (error) throw error;

      setFormData(prev => ({
        ...prev,
        photo_url: data.publicUrl,
        file_name: file.name
      }));
      showSuccessToast('Photo uploaded');
    } catch (err) {
      showErrorAlert(err.message, 'Upload Failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.photo_url) {
      showErrorAlert('Please upload or select a site photo');
      return;
    }

    try {
      await DataService.createPhoto({
        ...formData,
        project_id: currentProject?.id,
        storage_path: `photos/${formData.file_name}`
      }, user?.id);

      showSuccessToast('Site photo added to gallery');
      await refreshProjectData();
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      showErrorAlert(err.message, 'Save Error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Construction Site Photo"
      subtitle="Document physical progress with stage tagging and timestamp"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Photo Preview / Upload Area */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Site Photo *
          </label>
          {formData.photo_url ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 aspect-video max-h-56 bg-slate-900 group">
              <img
                src={formData.photo_url}
                alt="Site Preview"
                className="w-full h-full object-cover"
              />
              <label className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white text-xs font-semibold gap-2">
                <Camera className="w-4 h-4" />
                <span>Change Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl cursor-pointer hover:border-primary-500 bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 flex items-center justify-center mb-2">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {uploading ? 'Uploading image...' : 'Click to select site photo'}
              </p>
              <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG, WEBP</p>
              <input
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Construction Stage
            </label>
            <select
              value={formData.stage_id}
              onChange={(e) => setFormData({ ...formData, stage_id: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <option value="">-- General Site --</option>
              {stages.map(s => (
                <option key={s.id} value={s.id}>Stage {s.order_index}: {s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Date Taken
            </label>
            <input
              type="date"
              value={formData.taken_at}
              onChange={(e) => setFormData({ ...formData, taken_at: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Caption / Milestone Description
          </label>
          <input
            type="text"
            placeholder="e.g. Ground floor roof slab rebar inspection before casting"
            value={formData.caption}
            onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploading}
            className="px-5 py-2 text-xs sm:text-sm font-bold bg-primary-600 hover:bg-primary-500 text-white rounded-xl shadow-sm disabled:opacity-50"
          >
            Save to Photo Gallery
          </button>
        </div>
      </form>
    </Modal>
  );
};
