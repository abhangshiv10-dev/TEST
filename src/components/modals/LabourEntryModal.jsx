import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useProject } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatInputDate } from '../../utils/date';
import { DataService } from '../../services/dataService';
import { showSuccessToast, showErrorAlert } from '../../utils/validators';

export const LabourEntryModal = ({
  isOpen,
  onClose,
  onSaved
}) => {
  const { currentProject, stages, refreshProjectData } = useProject();
  const { user } = useAuth();
  const [workers, setWorkers] = useState([]);

  const [formData, setFormData] = useState({
    entry_date: formatInputDate(new Date()),
    worker_id: '',
    stage_id: '',
    attendance: 'Present',
    hours: '8',
    rate: '800',
    overtime_hours: '0',
    overtime_rate: '100',
    total_amount: '800',
    payment_status: 'Paid',
    notes: ''
  });

  useEffect(() => {
    if (isOpen && currentProject) {
      DataService.getWorkers(currentProject.id).then(list => {
        setWorkers(list || []);
        if (list && list.length > 0) {
          const first = list[0];
          setFormData(prev => ({
            ...prev,
            worker_id: first.id,
            rate: String(first.daily_rate || 800),
            total_amount: String(first.daily_rate || 800),
            stage_id: stages[0]?.id || ''
          }));
        }
      });
    }
  }, [isOpen, currentProject, stages]);

  const handleWorkerChange = (workerId) => {
    const selected = workers.find(w => w.id === workerId);
    const rate = selected ? Number(selected.daily_rate) : 800;
    calculateTotal(formData.attendance, rate, formData.overtime_hours, formData.overtime_rate, workerId);
  };

  const calculateTotal = (attendance, rateVal, otHours, otRate, workerIdVal = formData.worker_id) => {
    let base = 0;
    if (attendance === 'Present') base = Number(rateVal);
    else if (attendance === 'Half Day') base = Number(rateVal) * 0.5;
    else base = 0;

    const ot = Number(otHours) * Number(otRate);
    const total = Math.round(base + ot);

    setFormData(prev => ({
      ...prev,
      worker_id: workerIdVal,
      attendance,
      rate: String(rateVal),
      overtime_hours: String(otHours),
      overtime_rate: String(otRate),
      total_amount: String(total)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.worker_id) {
      showErrorAlert('Please select a worker');
      return;
    }

    try {
      const selectedWorker = workers.find(w => w.id === formData.worker_id);
      const totalNum = Number(formData.total_amount);

      await DataService.createLabourEntry({
        ...formData,
        project_id: currentProject?.id,
        hours: Number(formData.hours),
        rate: Number(formData.rate),
        overtime_hours: Number(formData.overtime_hours),
        overtime_rate: Number(formData.overtime_rate),
        total_amount: totalNum
      }, user?.id);

      // Also record in expenses if marked Paid
      if (formData.payment_status === 'Paid' && totalNum > 0) {
        await DataService.createExpense({
          project_id: currentProject?.id,
          expense_date: formData.entry_date,
          description: `Daily Wage: ${selectedWorker?.name || 'Labour'} (${formData.attendance}${Number(formData.overtime_hours) > 0 ? ` + ${formData.overtime_hours}h OT` : ''})`,
          category_id: 'cat-mason-labour',
          stage_id: formData.stage_id || null,
          quantity: formData.attendance === 'Present' ? 1 : 0.5,
          unit: 'Days',
          rate: Number(formData.rate),
          amount: totalNum,
          paid_to: selectedWorker?.name || 'Worker',
          payment_method: 'Cash',
          payment_status: 'Paid',
          reference_number: `LAB-${formData.entry_date}`
        }, user?.id);
      }

      showSuccessToast('Labour attendance and wage recorded');
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
      title="Record Daily Labour Attendance & Wage"
      subtitle="Track daily muster roll and auto-calculate daily wages & overtime"
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
              <option value="">-- General / Entire Site --</option>
              {stages.map(s => (
                <option key={s.id} value={s.id}>Stage {s.order_index}: {s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Select Worker *
          </label>
          <select
            value={formData.worker_id}
            onChange={(e) => handleWorkerChange(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
          >
            {workers.map(w => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.worker_type}) - ₹{w.daily_rate}/day
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Attendance
            </label>
            <select
              value={formData.attendance}
              onChange={(e) => calculateTotal(e.target.value, formData.rate, formData.overtime_hours, formData.overtime_rate)}
              className="w-full px-2.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <option value="Present">Present (Full Day)</option>
              <option value="Half Day">Half Day (0.5)</option>
              <option value="Absent">Absent (0)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Daily Rate (₹)
            </label>
            <input
              type="number"
              value={formData.rate}
              onChange={(e) => calculateTotal(formData.attendance, e.target.value, formData.overtime_hours, formData.overtime_rate)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Overtime Hours
            </label>
            <input
              type="number"
              step="0.5"
              value={formData.overtime_hours}
              onChange={(e) => calculateTotal(formData.attendance, formData.rate, e.target.value, formData.overtime_rate)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
        </div>

        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
          <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
            Calculated Wage Payable:
          </span>
          <span className="font-extrabold text-lg text-emerald-700 dark:text-emerald-400">
            ₹{formData.total_amount}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Payment Status
            </label>
            <select
              value={formData.payment_status}
              onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              <option value="Paid">Paid in Cash</option>
              <option value="Pending">Pending / Weekly Settle</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Work Remarks
            </label>
            <input
              type="text"
              placeholder="e.g. 1st floor brickwork"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
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
            Save Attendance Entry
          </button>
        </div>
      </form>
    </Modal>
  );
};
