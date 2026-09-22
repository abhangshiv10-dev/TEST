import React, { useState, useEffect } from 'react';
import { useProject } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { WORKER_TYPES } from '../../constants/categories';
import { showConfirmDialog, showSuccessToast, showErrorAlert, validateMobile } from '../../utils/validators';
import { DataService } from '../../services/dataService';
import { Users, Plus, Phone, Edit3, Trash2, Calendar } from 'lucide-react';

export const Workers = () => {
  const { currentProject } = useProject();
  const { user } = useAuth();

  const [workers, setWorkers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    worker_type: 'Mason',
    daily_rate: '800',
    joining_date: new Date().toISOString().split('T')[0],
    status: 'Active',
    notes: ''
  });

  const loadWorkers = async () => {
    if (!currentProject) return;
    const list = await DataService.getWorkers(currentProject.id);
    setWorkers(list || []);
  };

  useEffect(() => {
    loadWorkers();
  }, [currentProject]);

  const handleOpenAdd = () => {
    setEditingWorker(null);
    setFormData({
      name: '',
      mobile: '',
      worker_type: 'Mason',
      daily_rate: '800',
      joining_date: new Date().toISOString().split('T')[0],
      status: 'Active',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (w) => {
    setEditingWorker(w);
    setFormData({
      name: w.name || '',
      mobile: w.mobile || '',
      worker_type: w.worker_type || 'Mason',
      daily_rate: String(w.daily_rate || 800),
      joining_date: w.joining_date || new Date().toISOString().split('T')[0],
      status: w.status || 'Active',
      notes: w.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showErrorAlert('Please enter worker name');
      return;
    }

    const mobileErr = validateMobile(formData.mobile);
    if (mobileErr) {
      showErrorAlert(mobileErr);
      return;
    }

    try {
      const payload = {
        ...formData,
        daily_rate: Number(formData.daily_rate) || 0,
        project_id: currentProject?.id
      };

      if (editingWorker) {
        await DataService.updateWorker(editingWorker.id, payload);
        showSuccessToast('Worker updated');
      } else {
        await DataService.createWorker(payload, user?.id);
        showSuccessToast('Worker added to roster');
      }

      await loadWorkers();
      setIsModalOpen(false);
    } catch (err) {
      showErrorAlert(err.message);
    }
  };

  const handleDelete = async (w) => {
    const confirmed = await showConfirmDialog({
      title: 'Remove Worker?',
      text: `Are you sure you want to remove ${w.name}?`,
      confirmButtonText: 'Yes, remove'
    });

    if (confirmed) {
      try {
        await DataService.deleteWorker(w.id);
        showSuccessToast('Worker removed');
        await loadWorkers();
      } catch (err) {
        showErrorAlert(err.message);
      }
    }
  };

  const columns = [
    {
      header: 'Worker Name',
      key: 'name',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{row.name}</p>
          <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold">{row.worker_type}</p>
        </div>
      )
    },
    {
      header: 'Daily Wage Rate',
      key: 'daily_rate',
      sortable: true,
      render: (row) => (
        <span className="font-extrabold text-sm text-slate-900 dark:text-white">
          {formatCurrency(row.daily_rate)} <span className="text-[11px] font-normal text-slate-400">/ day</span>
        </span>
      )
    },
    {
      header: 'Contact Mobile',
      key: 'mobile',
      render: (row) => (
        <span className="text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-slate-400" />
          {row.mobile || '-'}
        </span>
      )
    },
    {
      header: 'Joining Date',
      key: 'joining_date',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {formatDate(row.joining_date)}
        </span>
      )
    },
    {
      header: 'Status',
      key: 'status',
      sortable: true,
      render: (row) => <StatusBadge status={row.status} size="sm" />
    },
    {
      header: 'Actions',
      key: 'actions',
      cellClassName: 'text-right whitespace-nowrap',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-slate-100 rounded-lg"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Construction Workers"
        subtitle="Manage site masons, carpenters, helpers, electricians, and daily wage standards"
        actions={
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs sm:text-sm font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Worker</span>
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={workers}
        searchField="name"
        searchFields={['name', 'worker_type', 'mobile', 'notes']}
        searchPlaceholder="Search workers by name or craft..."
        onAdd={handleOpenAdd}
        addLabel="Add Worker"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingWorker ? `Edit Worker: ${editingWorker.name}` : 'Add Construction Worker'}
        subtitle="Record worker contact details, skill specialization, and agreed daily wage"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Worker Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramu Mistri"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Worker Skill Type *
              </label>
              <select
                value={formData.worker_type}
                onChange={(e) => setFormData({ ...formData, worker_type: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                {WORKER_TYPES.map((t, idx) => (
                  <option key={idx} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Daily Wage Rate (₹) *
              </label>
              <input
                type="number"
                required
                placeholder="e.g. 800"
                value={formData.daily_rate}
                onChange={(e) => setFormData({ ...formData, daily_rate: e.target.value })}
                className="w-full px-3 py-2 text-sm font-bold text-primary-600 dark:text-primary-400 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                placeholder="e.g. 9822114455"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Joining Date
              </label>
              <input
                type="date"
                value={formData.joining_date}
                onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
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
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes / Experience
            </label>
            <textarea
              rows="2"
              placeholder="e.g. Head mistri for centering and brickwork"
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
              Save Worker
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
