import React, { useState, useEffect, useMemo } from 'react';
import { useProject } from '../../contexts/ProjectContext';
import { PageHeader } from '../../components/common/PageHeader';
import { DocumentModal } from '../../components/modals/DocumentModal';
import { formatDate } from '../../utils/date';
import { showConfirmDialog, showSuccessToast, showErrorAlert } from '../../utils/validators';
import { DataService } from '../../services/dataService';
import { DOCUMENT_CATEGORIES } from '../../constants/categories';
import { 
  FileText, 
  Plus, 
  Download, 
  Trash2, 
  ExternalLink, 
  Folder,
  FileCheck 
} from 'lucide-react';

export const DocumentsList = () => {
  const { currentProject } = useProject();
  const [documents, setDocuments] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadDocuments = async () => {
    if (!currentProject) return;
    const list = await DataService.getDocuments(currentProject.id);
    setDocuments(list || []);
  };

  useEffect(() => {
    loadDocuments();
  }, [currentProject]);

  const filteredDocs = useMemo(() => {
    if (selectedCategory === 'all') return documents;
    return documents.filter(d => d.category === selectedCategory);
  }, [documents, selectedCategory]);

  const handleDelete = async (doc) => {
    const confirmed = await showConfirmDialog({
      title: 'Delete Document?',
      text: `Are you sure you want to delete "${doc.name}"?`,
      confirmButtonText: 'Yes, delete'
    });

    if (confirmed) {
      try {
        await DataService.deleteDocument(doc.id);
        showSuccessToast('Document deleted');
        await loadDocuments();
      } catch (err) {
        showErrorAlert(err.message);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Project Documents & Plans"
        subtitle="Secure repository for sanctioned blueprints, permits, structural designs, contractor agreements and loan papers"
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs sm:text-sm font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        }
      />

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedCategory === 'all'
              ? 'bg-primary-600 text-white shadow-sm'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
          }`}
        >
          All Documents ({documents.length})
        </button>

        {DOCUMENT_CATEGORIES.map((cat, idx) => {
          const count = documents.filter(d => d.category === cat).length;
          return (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Documents Grid */}
      {filteredDocs.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-400">
          <FileText className="w-12 h-12 mx-auto text-primary-500 mb-3 opacity-70" />
          <h3 className="font-bold text-slate-700 dark:text-slate-200">No documents found</h3>
          <p className="text-xs max-w-sm mx-auto mt-1 mb-4">
            Upload and safeguard architectural blueprints, tax receipts, and municipal approvals.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-primary-600 text-white text-xs font-bold"
          >
            + Upload Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <div key={doc.id} className="glass-card p-5 flex flex-col justify-between hover:border-primary-300 dark:hover:border-primary-700 transition-all">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 truncate max-w-[150px]">
                    {doc.category}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2 mb-1">
                  {doc.name}
                </h4>

                <p className="text-[11px] text-slate-400">
                  Uploaded: {formatDate(doc.uploaded_at || doc.created_at)}
                  {doc.file_size ? ` • ${(doc.file_size / (1024 * 1024)).toFixed(2)} MB` : ''}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                >
                  <span>Open Document</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => handleDelete(doc)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <DocumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={loadDocuments}
      />
    </div>
  );
};
