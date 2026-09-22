import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useProject } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import { DOCUMENT_CATEGORIES } from '../../constants/categories';
import { uploadStorageFile } from '../../services/supabaseClient';
import { DataService } from '../../services/dataService';
import { showSuccessToast, showErrorAlert } from '../../utils/validators';
import { Upload, FileText, X } from 'lucide-react';

export const DocumentModal = ({
  isOpen,
  onClose,
  onSaved
}) => {
  const { currentProject, refreshProjectData } = useProject();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    category: DOCUMENT_CATEGORIES[0],
    file_url: '',
    file_name: '',
    file_type: 'application/pdf',
    file_size: 0
  });
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const path = `${user?.id || 'demo'}/${currentProject?.id || 'proj'}/documents/${Date.now()}_${file.name}`;
      const { data, error } = await uploadStorageFile('construction-documents', path, file);
      if (error) throw error;

      setFormData(prev => ({
        ...prev,
        name: prev.name || file.name,
        file_url: data.publicUrl,
        file_name: file.name,
        file_type: file.type || 'application/pdf',
        file_size: file.size
      }));
      showSuccessToast('File uploaded');
    } catch (err) {
      showErrorAlert(err.message, 'Upload Error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showErrorAlert('Please enter document title');
      return;
    }
    if (!formData.file_url) {
      showErrorAlert('Please select a file to upload');
      return;
    }

    try {
      await DataService.createDocument({
        ...formData,
        project_id: currentProject?.id,
        storage_path: `documents/${formData.file_name}`
      }, user?.id);

      showSuccessToast('Document saved');
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
      title="Upload Construction Document"
      subtitle="Store plans, permits, contractor agreements, and sanction letters"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Document Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          >
            {DOCUMENT_CATEGORIES.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Document Name / Title *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Sanctioned Floor Plan 2026.pdf"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
        </div>

        {/* Upload Box */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Attach Document File (PDF, DOCX, JPG, PNG) *
          </label>
          {formData.file_url ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800 text-xs">
              <div className="flex items-center gap-2 text-primary-800 dark:text-primary-300">
                <FileText className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="font-semibold">{formData.file_name}</p>
                  <p className="text-[10px] text-primary-600 dark:text-primary-400">
                    {(formData.file_size / (1024 * 1024)).toFixed(2)} MB • {formData.file_type}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, file_url: '', file_name: '' })}
                className="p-1 rounded text-rose-500 hover:bg-rose-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl cursor-pointer hover:border-primary-500 bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
              <Upload className="w-6 h-6 text-slate-400 mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {uploading ? 'Uploading file...' : 'Choose PDF, Image or Office Document'}
              </p>
              <input
                type="file"
                disabled={uploading}
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          )}
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
            Save Document
          </button>
        </div>
      </form>
    </Modal>
  );
};
