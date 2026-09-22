import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useProject } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatInputDate } from '../../utils/date';
import { DataService } from '../../services/dataService';
import { showSuccessToast, showErrorAlert } from '../../utils/validators';

export const TaskModal = ({
  isOpen,
  onClose,
  taskToEdit = null,
  onSaved
}) => {
  const { currentProject, refreshProjectData } = useProject();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: formatInputDate(new Date()),
    priority: 'Medium',
    status: 'Pending',
    assigned_to: '',
    notes: ''
  });

  useEffect(() => {
    if (taskToEdit) {
      setFormData({
        title: taskToEdit.title || '',
        description: taskToEdit.description || '',
        due_date: formatInputDate(taskToEdit.due_date),
        priority: taskToEdit.priority || 'Medium',
        status: taskToEdit.status || 'Pending',
        assigned_to: taskToEdit.assigned_to || '',
        notes: taskToEdit.notes || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        due_date: formatInputDate(new Date()),
        priority: 'Medium',
        status: 'Pending',
        assigned_to: '',
        notes: ''
      });
    }
  }, [taskToEdit, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showErrorAlert('Please enter a task title');
      return;
    }

    try {
      const payload = {
        ...formData,
        project_id: currentProject?.id
      };

      if (taskToEdit) {
        await DataService.updateTask(taskToEdit.id, payload);
        showSuccessToast('Task updated');
      } else {
        await DataService.createTask(payload, user?.id);
        showSuccessToast('Task created');
      }

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
      title={taskToEdit ? 'Edit Construction Task' : 'Add Construction Task'}
      subtitle="Organize site milestones, checklist items, and deadlines"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Task Title *
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Schedule soil compaction test / Order tile adhesive"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Description / Checklist
          </label>
          <textarea
            rows="2"
            placeholder="Details, specifications or notes..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Due Date *
            </label>
            <input
              type="date"
              required
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High (Urgent)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Assigned Person
          </label>
          <input
            type="text"
            placeholder="e.g. Suresh (Owner) / Ramesh (Contractor) / Babu (Helper)"
            value={formData.assigned_to}
            onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
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
            {taskToEdit ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
