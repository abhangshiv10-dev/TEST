import React, { useState } from 'react';
import { useProject } from '../../contexts/ProjectContext';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { TaskModal } from '../../components/modals/TaskModal';
import { formatDate } from '../../utils/date';
import { showConfirmDialog, showSuccessToast, showErrorAlert } from '../../utils/validators';
import { DataService } from '../../services/dataService';
import { 
  CheckSquare, 
  Plus, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Trash2, 
  Edit3, 
  User 
} from 'lucide-react';

export const Tasks = () => {
  const { currentProject, tasks, refreshProjectData } = useProject();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const handleToggleComplete = async (task) => {
    try {
      const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
      await DataService.updateTask(task.id, { status: nextStatus });
      showSuccessToast(`Task marked as ${nextStatus}`);
      await refreshProjectData();
    } catch (err) {
      showErrorAlert(err.message);
    }
  };

  const handleDelete = async (task) => {
    const confirmed = await showConfirmDialog({
      title: 'Delete Task?',
      text: `Are you sure you want to delete "${task.title}"?`,
      confirmButtonText: 'Yes, delete'
    });

    if (confirmed) {
      try {
        await DataService.deleteTask(task.id);
        showSuccessToast('Task deleted');
        await refreshProjectData();
      } catch (err) {
        showErrorAlert(err.message);
      }
    }
  };

  const pendingTasks = tasks.filter(t => t.status === 'Pending');
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress');
  const completedTasks = tasks.filter(t => t.status === 'Completed');

  const renderTaskCard = (task) => {
    const isOverdue = task.status !== 'Completed' && task.due_date && new Date(task.due_date) < new Date();

    return (
      <div 
        key={task.id} 
        className={`glass-card p-4 space-y-3 transition-all ${
          isOverdue ? 'border-rose-300 dark:border-rose-900 bg-rose-50/20' : ''
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <button
            onClick={() => handleToggleComplete(task)}
            className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 mt-0.5 ${
              task.status === 'Completed'
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'border-slate-300 dark:border-slate-600 hover:border-primary-500'
            }`}
          >
            {task.status === 'Completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
          </button>

          <div className="flex-1 min-w-0">
            <h4 className={`text-xs sm:text-sm font-bold text-slate-900 dark:text-white ${
              task.status === 'Completed' ? 'line-through opacity-60' : ''
            }`}>
              {task.title}
            </h4>
            {task.description && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>

          <StatusBadge status={task.priority} size="sm" />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-400">
          <span className={`flex items-center gap-1 font-medium ${isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : ''}`}>
            <Clock className="w-3.5 h-3.5" />
            {isOverdue ? 'Overdue: ' : 'Due: '}{formatDate(task.due_date, 'dd MMM')}
          </span>

          <div className="flex items-center gap-1.5">
            {task.assigned_to && (
              <span className="text-slate-600 dark:text-slate-300 truncate max-w-[100px] flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" />
                {task.assigned_to}
              </span>
            )}
            <button
              onClick={() => {
                setTaskToEdit(task);
                setIsModalOpen(true);
              }}
              className="p-1 text-slate-400 hover:text-primary-600"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleDelete(task)}
              className="p-1 text-slate-400 hover:text-rose-600"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Construction Tasks & Milestones"
        subtitle="Manage site checklist items, material ordering deadlines, and architect inspections"
        actions={
          <button
            onClick={() => {
              setTaskToEdit(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs sm:text-sm font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        }
      />

      {/* Kanban Column View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Column */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span>Pending ({pendingTasks.length})</span>
            </span>
          </div>
          <div className="space-y-3">
            {pendingTasks.map(renderTaskCard)}
            {pendingTasks.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-8">No pending tasks</p>
            )}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>In Progress ({inProgressTasks.length})</span>
            </span>
          </div>
          <div className="space-y-3">
            {inProgressTasks.map(renderTaskCard)}
            {inProgressTasks.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-8">No tasks in progress</p>
            )}
          </div>
        </div>

        {/* Completed Column */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Completed ({completedTasks.length})</span>
            </span>
          </div>
          <div className="space-y-3">
            {completedTasks.map(renderTaskCard)}
            {completedTasks.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-8">No completed tasks yet</p>
            )}
          </div>
        </div>
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTaskToEdit(null);
        }}
        taskToEdit={taskToEdit}
      />
    </div>
  );
};
