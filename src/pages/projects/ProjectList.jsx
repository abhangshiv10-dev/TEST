import React, { useState } from 'react';
import { useProject } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Modal } from '../../components/common/Modal';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { showConfirmDialog, showSuccessToast, showErrorAlert } from '../../utils/validators';
import { 
  Building, 
  Plus, 
  MapPin, 
  User, 
  Check, 
  Edit3, 
  Trash2, 
  Calendar, 
  DollarSign, 
  HardHat 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProjectList = () => {
  const { projects, currentProject, switchProject, createProject, updateCurrentProject, deleteCurrentProject } = useProject();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    owner_name: '',
    contractor_name: '',
    engineer_name: '',
    architect_name: '',
    total_budget: '2500000',
    built_up_area: '2500',
    number_of_floors: '2',
    start_date: new Date().toISOString().split('T')[0],
    expected_end_date: '2026-12-31',
    status: 'In Progress',
    description: '',
    notes: ''
  });

  const handleOpenAdd = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      address: '',
      owner_name: '',
      contractor_name: '',
      engineer_name: '',
      architect_name: '',
      total_budget: '2500000',
      built_up_area: '2500',
      number_of_floors: '2',
      start_date: new Date().toISOString().split('T')[0],
      expected_end_date: '2026-12-31',
      status: 'In Progress',
      description: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (proj) => {
    setEditingProject(proj);
    setFormData({
      name: proj.name || '',
      address: proj.address || '',
      owner_name: proj.owner_name || '',
      contractor_name: proj.contractor_name || '',
      engineer_name: proj.engineer_name || '',
      architect_name: proj.architect_name || '',
      total_budget: String(proj.total_budget || ''),
      built_up_area: String(proj.built_up_area || ''),
      number_of_floors: String(proj.number_of_floors || '1'),
      start_date: proj.start_date || '',
      expected_end_date: proj.expected_end_date || '',
      status: proj.status || 'In Progress',
      description: proj.description || '',
      notes: proj.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showErrorAlert('Please enter project name');
      return;
    }

    try {
      const payload = {
        ...formData,
        total_budget: Number(formData.total_budget) || 0,
        built_up_area: Number(formData.built_up_area) || 0,
        number_of_floors: Number(formData.number_of_floors) || 1
      };

      if (editingProject) {
        await updateCurrentProject(payload);
        showSuccessToast('Project updated successfully');
      } else {
        await createProject(payload);
        showSuccessToast('New construction project created!');
      }

      setIsModalOpen(false);
    } catch (err) {
      showErrorAlert(err.message);
    }
  };

  const handleDelete = async (proj) => {
    if (projects.length <= 1) {
      showErrorAlert('You must have at least one active project');
      return;
    }

    const confirmed = await showConfirmDialog({
      title: 'Delete Project?',
      text: `Are you sure you want to permanently delete "${proj.name}" and all its records?`,
      confirmButtonText: 'Yes, delete project'
    });

    if (confirmed) {
      try {
        await deleteCurrentProject(proj.id);
        showSuccessToast('Project deleted');
      } catch (err) {
        showErrorAlert(err.message);
      }
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        title="Construction Projects"
        subtitle="Manage multiple house construction properties, villas, or floor additions"
        actions={
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs sm:text-sm font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create New Project</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((proj) => {
          const isActive = proj.id === currentProject?.id;

          return (
            <div
              key={proj.id}
              className={`glass-card p-6 relative overflow-hidden flex flex-col justify-between transition-all ${
                isActive ? 'border-primary-500 dark:border-primary-500 ring-2 ring-primary-500/20 shadow-soft-lg' : ''
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-lg shrink-0">
                      <Building className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                        {proj.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate max-w-[220px]">{proj.address || 'Address not specified'}</span>
                      </p>
                    </div>
                  </div>

                  <StatusBadge status={proj.status} size="sm" />
                </div>

                {proj.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-4">
                    {proj.description}
                  </p>
                )}

                {/* Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/60 text-xs">
                  <div>
                    <span className="text-slate-400">Total Budget:</span>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                      {formatCurrency(proj.total_budget)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Built-up Area:</span>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                      {proj.built_up_area ? `${proj.built_up_area} sq.ft` : '-'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Floors:</span>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                      {proj.number_of_floors ? `G + ${proj.number_of_floors - 1}` : '1'}
                    </p>
                  </div>
                </div>

                {/* Team Info */}
                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400">
                  <p>Contractor: <strong className="text-slate-700 dark:text-slate-200">{proj.contractor_name || '-'}</strong></p>
                  <p>Architect: <strong className="text-slate-700 dark:text-slate-200">{proj.architect_name || '-'}</strong></p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                {isActive ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-xl">
                    <Check className="w-3.5 h-3.5" />
                    <span>Active Project</span>
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      switchProject(proj.id);
                      showSuccessToast(`Switched to "${proj.name}"`);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-950/50 text-slate-700 dark:text-slate-200 hover:text-primary-600 text-xs font-semibold transition-colors"
                  >
                    Select & Switch
                  </button>
                )}

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(proj)}
                    className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-slate-100 rounded-lg"
                    title="Edit Details"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {projects.length > 1 && (
                    <button
                      onClick={() => handleDelete(proj)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      title="Delete Project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? `Edit Project: ${editingProject.name}` : 'Create New Construction Project'}
        subtitle="Specify project location, sanctioned budget, built-up area and engineering team"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Shree Ganesh Villa"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Owner / Client Name
              </label>
              <input
                type="text"
                placeholder="e.g. Suresh & Priya Sharma"
                value={formData.owner_name}
                onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Site Address / Plot Location
            </label>
            <input
              type="text"
              placeholder="e.g. Plot 42, Green Meadows, Ring Road, Pune"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Total Budget (₹) *
              </label>
              <input
                type="number"
                required
                placeholder="e.g. 2500000"
                value={formData.total_budget}
                onChange={(e) => setFormData({ ...formData, total_budget: e.target.value })}
                className="w-full px-3 py-2 text-sm font-bold text-primary-600 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Built-up Area (Sq.Ft)
              </label>
              <input
                type="number"
                placeholder="e.g. 2450"
                value={formData.built_up_area}
                onChange={(e) => setFormData({ ...formData, built_up_area: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Number of Floors
              </label>
              <input
                type="number"
                value={formData.number_of_floors}
                onChange={(e) => setFormData({ ...formData, number_of_floors: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contractor Name
              </label>
              <input
                type="text"
                placeholder="e.g. Omkar Constructions"
                value={formData.contractor_name}
                onChange={(e) => setFormData({ ...formData, contractor_name: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Architect Name
              </label>
              <input
                type="text"
                placeholder="e.g. Studio Vastu"
                value={formData.architect_name}
                onChange={(e) => setFormData({ ...formData, architect_name: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Structural Engineer
              </label>
              <input
                type="text"
                placeholder="e.g. Er. Rajesh Kulkarni"
                value={formData.engineer_name}
                onChange={(e) => setFormData({ ...formData, engineer_name: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Project Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="Planning">Planning</option>
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Project Description & Specifications
            </label>
            <textarea
              rows="2"
              placeholder="e.g. G+1 modern contemporary villa with 3 BHK and terrace garden"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              Save Project
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
