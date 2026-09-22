import React, { useState, useEffect } from 'react';
import { useProject } from '../../contexts/ProjectContext';
import { PageHeader } from '../../components/common/PageHeader';
import { DiaryModal } from '../../components/modals/DiaryModal';
import { formatDate } from '../../utils/date';
import { formatCurrency } from '../../utils/currency';
import { showConfirmDialog, showSuccessToast, showErrorAlert } from '../../utils/validators';
import { DataService } from '../../services/dataService';
import { 
  BookOpen, 
  Plus, 
  Users, 
  Package, 
  Sun, 
  AlertCircle, 
  Trash2, 
  Calendar 
} from 'lucide-react';

export const DailyDiary = () => {
  const { currentProject, stages } = useProject();
  const [diaries, setDiaries] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadDiaries = async () => {
    if (!currentProject) return;
    const list = await DataService.getDailyDiaries(currentProject.id);
    setDiaries(list || []);
  };

  useEffect(() => {
    loadDiaries();
  }, [currentProject]);

  const handleDelete = async (id) => {
    const confirmed = await showConfirmDialog({
      title: 'Delete Diary Entry?',
      text: 'Are you sure you want to delete this site journal entry?',
      confirmButtonText: 'Yes, delete'
    });

    if (confirmed) {
      try {
        await DataService.deleteDailyDiary(id);
        showSuccessToast('Diary entry deleted');
        await loadDiaries();
      } catch (err) {
        showErrorAlert(err.message);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Daily Site Diary"
        subtitle="Chronological log of day-to-day site operations, work completed, worker count and weather"
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs sm:text-sm font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Diary Log</span>
          </button>
        }
      />

      {diaries.length === 0 ? (
        <div className="glass-card p-12 text-center text-slate-400">
          <BookOpen className="w-12 h-12 mx-auto text-primary-500 mb-3 opacity-70" />
          <h3 className="font-bold text-slate-700 dark:text-slate-200">No site diary logs yet</h3>
          <p className="text-xs max-w-sm mx-auto mt-1 mb-4">
            Record what work was done today, workers present, and materials used.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-primary-600 text-white text-xs font-bold"
          >
            + Create First Entry
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {diaries.map((diary) => {
            const stage = stages.find(s => s.id === diary.stage_id);

            return (
              <div key={diary.id} className="glass-card p-5 sm:p-6 transition-all hover:border-primary-300 dark:hover:border-primary-700">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-700/60">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-0.5 rounded-lg bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300 text-xs font-bold">
                        {formatDate(diary.entry_date, 'dd MMMM yyyy')}
                      </span>
                      {stage && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          • Stage {stage.order_index}: {stage.name}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">
                      {diary.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {diary.weather_condition && (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                        <span>{diary.weather_condition}</span>
                      </span>
                    )}
                    <button
                      onClick={() => handleDelete(diary.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Work Completed */}
                <div className="py-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {diary.work_completed}
                </div>

                {/* Badges / Metrics Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Users className="w-4 h-4 text-primary-500 shrink-0" />
                    <span>Workers on Site: <strong>{diary.workers_present || 0}</strong></span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Package className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="truncate">Materials: <strong>{diary.materials_used || 'None recorded'}</strong></span>
                  </div>

                  {diary.expenses > 0 && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <span>Daily Outflow: <strong className="text-primary-600 dark:text-primary-400">{formatCurrency(diary.expenses)}</strong></span>
                    </div>
                  )}
                </div>

                {diary.problems_faced && (
                  <div className="mt-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span><strong>Problem / Delay:</strong> {diary.problems_faced}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <DiaryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={loadDiaries}
      />
    </div>
  );
};
