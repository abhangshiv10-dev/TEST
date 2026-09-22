import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useProject } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatInputDate } from '../../utils/date';
import { DataService } from '../../services/dataService';
import { showSuccessToast, showErrorAlert } from '../../utils/validators';

export const DiaryModal = ({
  isOpen,
  onClose,
  onSaved
}) => {
  const { currentProject, stages, refreshProjectData } = useProject();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    entry_date: formatInputDate(new Date()),
    stage_id: stages[0]?.id || '',
    title: '',
    work_completed: '',
    workers_present: '6',
    materials_used: '',
    expenses: '0',
    weather_condition: 'Sunny (32°C)',
    problems_faced: '',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showErrorAlert('Please enter a diary title / heading');
      return;
    }

    try {
      await DataService.createDailyDiary({
        ...formData,
        project_id: currentProject?.id,
        workers_present: Number(formData.workers_present) || 0,
        expenses: Number(formData.expenses) || 0
      }, user?.id);

      showSuccessToast('Daily site diary recorded');
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
      title="Daily Construction Site Diary"
      subtitle="Log today's site activity, worker count, material consumption, and hurdles"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Date *
            </label>
            <input
              type="date"
              required
              value={formData.entry_date}
              onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Construction Stage
            </label>
            <select
              value={formData.stage_id}
              onChange={(e) => setFormData({ ...formData, stage_id: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              {stages.map(s => (
                <option key={s.id} value={s.id}>Stage {s.order_index}: {s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Summary / Title *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Ground floor columns concrete pour and electrical conduit laying"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Work Completed Today
          </label>
          <textarea
            rows="3"
            placeholder="Describe what work was finished, inspections passed, measurements taken..."
            value={formData.work_completed}
            onChange={(e) => setFormData({ ...formData, work_completed: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Workers Present
            </label>
            <input
              type="number"
              value={formData.workers_present}
              onChange={(e) => setFormData({ ...formData, workers_present: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Weather Condition
            </label>
            <input
              type="text"
              placeholder="e.g. Sunny / Rain delay"
              value={formData.weather_condition}
              onChange={(e) => setFormData({ ...formData, weather_condition: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Daily Site Expense (₹)
            </label>
            <input
              type="number"
              value={formData.expenses}
              onChange={(e) => setFormData({ ...formData, expenses: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Materials Used / Consumed
          </label>
          <input
            type="text"
            placeholder="e.g. Cement: 40 bags, Sand: 1 brass, Steel: 200 kg"
            value={formData.materials_used}
            onChange={(e) => setFormData({ ...formData, materials_used: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Problems / Issues / Delays (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Heavy rain delayed casting by 3 hours; extra water pump used"
            value={formData.problems_faced}
            onChange={(e) => setFormData({ ...formData, problems_faced: e.target.value })}
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
            className="px-5 py-2 text-xs sm:text-sm font-bold bg-primary-600 hover:bg-primary-500 text-white rounded-xl shadow-sm"
          >
            Save Diary Entry
          </button>
        </div>
      </form>
    </Modal>
  );
};
