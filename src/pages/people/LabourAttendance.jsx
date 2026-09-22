import React, { useState, useEffect, useMemo } from 'react';
import { useProject } from '../../contexts/ProjectContext';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LabourEntryModal } from '../../components/modals/LabourEntryModal';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { showConfirmDialog, showSuccessToast, showErrorAlert } from '../../utils/validators';
import { DataService } from '../../services/dataService';
import { Users, Plus, Clock, Trash2, Calendar } from 'lucide-react';

export const LabourAttendance = () => {
  const { currentProject, refreshProjectData } = useProject();

  const [labourEntries, setLabourEntries] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = async () => {
    if (!currentProject) return;
    const [entries, wrks] = await Promise.all([
      DataService.getLabourEntries(currentProject.id),
      DataService.getWorkers(currentProject.id)
    ]);
    setLabourEntries(entries || []);
    setWorkers(wrks || []);
  };

  useEffect(() => {
    loadData();
  }, [currentProject]);

  const totalLabourCost = useMemo(() => {
    return labourEntries.reduce((sum, e) => sum + Number(e.total_amount || 0), 0);
  }, [labourEntries]);

  const handleDelete = async (entry) => {
    const confirmed = await showConfirmDialog({
      title: 'Delete Labour Entry?',
      text: 'Are you sure you want to remove this attendance record?',
      confirmButtonText: 'Yes, delete'
    });

    if (confirmed) {
      try {
        await DataService.deleteLabourEntry(entry.id);
        showSuccessToast('Labour entry deleted');
        await loadData();
        await refreshProjectData();
      } catch (err) {
        showErrorAlert(err.message);
      }
    }
  };

  const columns = [
    {
      header: 'Date',
      key: 'entry_date',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">
          {formatDate(row.entry_date, 'dd MMM yyyy')}
        </span>
      )
    },
    {
      header: 'Worker Name',
      key: 'worker_id',
      sortable: true,
      render: (row) => {
        const wrk = workers.find(w => w.id === row.worker_id);
        return (
          <div>
            <p className="font-bold text-slate-900 dark:text-white">{wrk?.name || 'Worker'}</p>
            <p className="text-xs text-slate-400">{wrk?.worker_type || 'Labour'}</p>
          </div>
        );
      }
    },
    {
      header: 'Attendance',
      key: 'attendance',
      sortable: true,
      render: (row) => <StatusBadge status={row.attendance} size="sm" />
    },
    {
      header: 'Rate (₹)',
      key: 'rate',
      sortable: true,
      render: (row) => (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          ₹{row.rate}
        </span>
      )
    },
    {
      header: 'Overtime',
      key: 'overtime_hours',
      render: (row) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {Number(row.overtime_hours) > 0 ? `${row.overtime_hours} hrs (@ ₹${row.overtime_rate}/hr)` : '-'}
        </span>
      )
    },
    {
      header: 'Total Wage (₹)',
      key: 'total_amount',
      sortable: true,
      render: (row) => (
        <span className="font-extrabold text-sm text-primary-600 dark:text-primary-400">
          {formatCurrency(row.total_amount)}
        </span>
      )
    },
    {
      header: 'Payment Status',
      key: 'payment_status',
      sortable: true,
      render: (row) => <StatusBadge status={row.payment_status || 'Paid'} size="sm" />
    },
    {
      header: 'Actions',
      key: 'actions',
      cellClassName: 'text-right',
      render: (row) => (
        <button
          onClick={() => handleDelete(row)}
          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
          title="Delete Entry"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Daily Labour Muster Roll"
        subtitle="Track daily site attendance, overtime hours, and automated wage ledger"
        actions={
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs sm:text-sm font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Record Daily Attendance</span>
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase">Total Realized Labour Cost</p>
          <p className="text-2xl font-extrabold text-primary-600 dark:text-primary-400 mt-1">
            {formatCurrency(totalLabourCost)}
          </p>
          <p className="text-xs text-slate-400 mt-1">{labourEntries.length} attendance entries</p>
        </div>

        <div className="glass-card p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase">Active Worker Force</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {workers.filter(w => w.status === 'Active').length} Workers
          </p>
          <p className="text-xs text-slate-400 mt-1">Masons, helpers, carpenters</p>
        </div>

        <div className="glass-card p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase">Avg Daily Labour Outflow</p>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(labourEntries.length > 0 ? Math.round(totalLabourCost / (new Set(labourEntries.map(e => e.entry_date)).size || 1)) : 0)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Per active construction day</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={labourEntries}
        searchField="notes"
        searchPlaceholder="Search labour entries by date, notes..."
        onAdd={() => setIsModalOpen(true)}
        addLabel="Record Attendance"
      />

      <LabourEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={async () => {
          await loadData();
          await refreshProjectData();
        }}
      />
    </div>
  );
};
