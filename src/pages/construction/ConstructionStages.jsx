import React, { useState } from 'react';
import { useProject } from '../../contexts/ProjectContext';
import { PageHeader } from '../../components/common/PageHeader';
import { ProgressBar } from '../../components/common/ProgressBar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { STAGE_STATUSES } from '../../constants/stages';
import { showSuccessToast, showErrorAlert } from '../../utils/validators';
import { DataService } from '../../services/dataService';
import { Layers, Edit3, CheckCircle, Clock, Calendar, CheckSquare } from 'lucide-react';
import confetti from 'canvas-confetti';

export const ConstructionStages = () => {
  const { currentProject, stages, expenses, refreshProjectData } = useProject();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    status: 'In Progress',
    progress_percentage: 50,
    budget: '',
    start_date: '',
    expected_end_date: '',
    notes: ''
  });

  const handleEdit = (stg) => {
    setSelectedStage(stg);
    setFormData({
      name: stg.name || '',
      status: stg.status || 'Not Started',
      progress_percentage: stg.progress_percentage ?? 0,
      budget: String(stg.budget || ''),
      start_date: stg.start_date || '',
      expected_end_date: stg.expected_end_date || '',
      notes: stg.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const pct = Number(formData.progress_percentage) || 0;
      let finalStatus = formData.status;
      if (pct === 100) finalStatus = 'Completed';
      else if (pct > 0 && finalStatus === 'Not Started') finalStatus = 'In Progress';

      await DataService.updateStage(selectedStage.id, {
        ...formData,
        progress_percentage: pct,
        status: finalStatus,
        budget: Number(formData.budget) || 0
      });

      if (pct === 100) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        showSuccessToast(`Stage "${selectedStage.name}" marked as 100% completed!`);
      } else {
        showSuccessToast('Stage updated successfully');
      }

      await refreshProjectData();
      setIsModalOpen(false);
    } catch (err) {
      showErrorAlert(err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Construction Stages"
        subtitle="21 standard home construction milestones from excavation to final handover"
      />

      {/* Grid of all stages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stages.map((stg) => {
          // Calculate actual cost logged under this stage
          const stageCost = expenses
            .filter(e => e.stage_id === stg.id)
            .reduce((sum, e) => sum + Number(e.amount || 0), 0);

          return (
            <div 
              key={stg.id} 
              className={`glass-card p-5 relative overflow-hidden flex flex-col justify-between ${
                stg.status === 'Completed' ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/10' : ''
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/60 text-primary-700 dark:text-primary-300 font-bold text-xs flex items-center justify-center shrink-0">
                      {stg.order_index}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-[190px]">
                      {stg.name}
                    </h4>
                  </div>
                  <StatusBadge status={stg.status} size="sm" />
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[32px] mb-3">
                  {stg.description || 'Structural construction milestone.'}
                </p>

                {/* Progress Bar */}
                <div className="my-2">
                  <div className="flex justify-between text-xs mb-1 font-semibold text-slate-600 dark:text-slate-300">
                    <span>Progress:</span>
                    <span>{stg.progress_percentage || 0}%</span>
                  </div>
                  <ProgressBar 
                    percentage={stg.progress_percentage} 
                    height="h-2"
                    variant={stg.status === 'Completed' ? 'success' : 'primary'}
                  />
                </div>

                {/* Dates & Cost */}
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700/60 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400">Actual Realized:</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      {formatCurrency(stageCost, { compact: true })}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Stage Budget:</span>
                    <p className="font-bold text-primary-600 dark:text-primary-400">
                      {stg.budget ? formatCurrency(stg.budget, { compact: true }) : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Edit Stage Button */}
              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  {stg.start_date ? `Start: ${formatDate(stg.start_date, 'dd/MM/yy')}` : 'Date not set'}
                </span>
                <button
                  onClick={() => handleEdit(stg)}
                  className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Update</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Stage Modal */}
      {selectedStage && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Update Stage ${selectedStage.order_index}: ${selectedStage.name}`}
          subtitle="Adjust progress percentage, timeline dates and stage budget"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Progress Percentage ({formData.progress_percentage}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={formData.progress_percentage}
                onChange={(e) => setFormData({ ...formData, progress_percentage: Number(e.target.value) })}
                className="w-full accent-primary-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>0% (Not Started)</span>
                <span>50% (In Progress)</span>
                <span>100% (Completed)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Stage Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  {STAGE_STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Stage Budget (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 150000"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Completion
                </label>
                <input
                  type="date"
                  value={formData.expected_end_date}
                  onChange={(e) => setFormData({ ...formData, expected_end_date: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Stage Notes & Site Instructions
              </label>
              <textarea
                rows="2"
                placeholder="e.g. Ensure minimum 14 days water curing before brickwork"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs sm:text-sm font-bold bg-primary-600 hover:bg-primary-500 text-white rounded-xl shadow-sm"
              >
                Save Progress
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
