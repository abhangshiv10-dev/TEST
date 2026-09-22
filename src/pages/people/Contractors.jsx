import React, { useState, useEffect } from 'react';
import { useProject } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { showConfirmDialog, showSuccessToast, showErrorAlert, validateMobile } from '../../utils/validators';
import { DataService } from '../../services/dataService';
import { Briefcase, Plus, Phone, CreditCard, Edit3, Trash2 } from 'lucide-react';

export const Contractors = () => {
  const { currentProject, refreshProjectData } = useProject();
  const { user } = useAuth();

  const [contractors, setContractors] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    mobile: '',
    work_type: 'Civil Structure & Labour Contract',
    contract_amount: '',
    advance_amount: '0',
    paid_amount: '0',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    status: 'Active',
    notes: ''
  });

  const loadContractors = async () => {
    if (!currentProject) return;
    const list = await DataService.getContractors(currentProject.id);
    setContractors(list || []);
  };

  useEffect(() => {
    loadContractors();
  }, [currentProject]);

  const handleOpenAdd = () => {
    setSelectedContractor(null);
    setFormData({
      name: '',
      company: '',
      mobile: '',
      work_type: 'Civil Structure & Labour Contract',
      contract_amount: '',
      advance_amount: '0',
      paid_amount: '0',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      status: 'Active',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setSelectedContractor(c);
    setFormData({
      name: c.name || '',
      company: c.company || '',
      mobile: c.mobile || '',
      work_type: c.work_type || 'Civil Structure',
      contract_amount: String(c.contract_amount || ''),
      advance_amount: String(c.advance_amount || '0'),
      paid_amount: String(c.paid_amount || '0'),
      start_date: c.start_date || '',
      end_date: c.end_date || '',
      status: c.status || 'Active',
      notes: c.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showErrorAlert('Please enter contractor name');
      return;
    }

    const mobileErr = validateMobile(formData.mobile);
    if (mobileErr) {
      showErrorAlert(mobileErr);
      return;
    }

    const cAmt = Number(formData.contract_amount) || 0;
    const pAmt = Number(formData.paid_amount) || 0;
    const adv = Number(formData.advance_amount) || 0;

    try {
      const payload = {
        ...formData,
        contract_amount: cAmt,
        advance_amount: adv,
        paid_amount: pAmt,
        pending_amount: Math.max(0, cAmt - pAmt),
        project_id: currentProject?.id
      };

      if (selectedContractor) {
        await DataService.updateContractor(selectedContractor.id, payload);
        showSuccessToast('Contractor details updated');
      } else {
        await DataService.createContractor(payload, user?.id);
        showSuccessToast('Contractor added');
      }

      await loadContractors();
      setIsModalOpen(false);
    } catch (err) {
      showErrorAlert(err.message);
    }
  };

  const handlePayContractor = async (e) => {
    e.preventDefault();
    const amt = Number(paymentAmount);
    if (!amt || amt <= 0) {
      showErrorAlert('Please enter a valid payment amount');
      return;
    }

    try {
      const newPaid = Number(selectedContractor.paid_amount || 0) + amt;
      const newPending = Math.max(0, Number(selectedContractor.contract_amount) - newPaid);

      // 1. Update contractor record
      await DataService.updateContractor(selectedContractor.id, {
        paid_amount: newPaid,
        pending_amount: newPending
      });

      // 2. Automatically log in expenses for full financial integrity
      await DataService.createExpense({
        project_id: currentProject?.id,
        expense_date: new Date().toISOString().split('T')[0],
        description: `Contractor Payment: ${selectedContractor.name} (${selectedContractor.work_type})`,
        category_id: 'cat-contractor',
        amount: amt,
        paid_to: selectedContractor.name,
        payment_method: 'Bank Transfer',
        payment_status: 'Paid',
        notes: paymentNotes || 'Milestone payment installment'
      }, user?.id);

      showSuccessToast(`Paid ${formatCurrency(amt)} to ${selectedContractor.name}`);
      await loadContractors();
      await refreshProjectData();
      setIsPaymentModalOpen(false);
      setPaymentAmount('');
      setPaymentNotes('');
    } catch (err) {
      showErrorAlert(err.message);
    }
  };

  const handleDelete = async (c) => {
    const confirmed = await showConfirmDialog({
      title: 'Remove Contractor?',
      text: `Are you sure you want to remove ${c.name}?`,
      confirmButtonText: 'Yes, delete'
    });

    if (confirmed) {
      try {
        await DataService.deleteContractor(c.id);
        showSuccessToast('Contractor removed');
        await loadContractors();
      } catch (err) {
        showErrorAlert(err.message);
      }
    }
  };

  const columns = [
    {
      header: 'Contractor & Company',
      key: 'name',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{row.name}</p>
          <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">{row.company || 'Direct Contractor'}</p>
          <span className="text-[11px] text-slate-400">{row.work_type}</span>
        </div>
      )
    },
    {
      header: 'Contract Value',
      key: 'contract_amount',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-slate-900 dark:text-white text-sm">
          {formatCurrency(row.contract_amount)}
        </span>
      )
    },
    {
      header: 'Amount Paid',
      key: 'paid_amount',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm">
          {formatCurrency(row.paid_amount)}
        </span>
      )
    },
    {
      header: 'Pending Balance',
      key: 'pending_amount',
      sortable: true,
      render: (row) => {
        const pending = Math.max(0, Number(row.contract_amount) - Number(row.paid_amount || 0));
        return (
          <span className={`font-extrabold text-sm ${pending > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>
            {formatCurrency(pending)}
          </span>
        );
      }
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
            onClick={() => {
              setSelectedContractor(row);
              setPaymentAmount('');
              setIsPaymentModalOpen(true);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all"
            title="Make Contractor Payment"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Pay</span>
          </button>
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
        title="Contractors & Sub-contractors"
        subtitle="Manage turnkey contracts, milestone schedules, advances, and payment clearances"
        actions={
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs sm:text-sm font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Contractor</span>
          </button>
        }
      />

      <DataTable
        columns={columns}
        data={contractors}
        searchField="name"
        searchFields={['name', 'company', 'work_type', 'notes']}
        searchPlaceholder="Search contractors..."
        onAdd={handleOpenAdd}
        addLabel="Add Contractor"
      />

      {/* Contractor Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedContractor ? `Edit Contractor: ${selectedContractor.name}` : 'Add Contractor Contract'}
        subtitle="Record work terms, contract value and progress dates"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contractor Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Patil"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Company Name
              </label>
              <input
                type="text"
                placeholder="e.g. Omkar Infra Constructions"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Work Scope / Contract Type *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Civil Structure, Centering & Labour Contract"
                value={formData.work_type}
                onChange={(e) => setFormData({ ...formData, work_type: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                placeholder="e.g. 9822998811"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contract Value (₹) *
              </label>
              <input
                type="number"
                required
                placeholder="e.g. 850000"
                value={formData.contract_amount}
                onChange={(e) => setFormData({ ...formData, contract_amount: e.target.value })}
                className="w-full px-3 py-2 text-sm font-bold text-primary-600 dark:text-primary-400 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Advance Paid (₹)
              </label>
              <input
                type="number"
                value={formData.advance_amount}
                onChange={(e) => setFormData({ ...formData, advance_amount: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Total Paid So Far (₹)
              </label>
              <input
                type="number"
                value={formData.paid_amount}
                onChange={(e) => setFormData({ ...formData, paid_amount: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
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
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Payment Terms & Schedule
            </label>
            <textarea
              rows="2"
              placeholder="e.g. Stage wise: 15% plinth, 25% slab, 20% brickwork, 20% plaster, 20% handover"
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
              Save Contractor
            </button>
          </div>
        </form>
      </Modal>

      {/* Pay Contractor Installment Modal */}
      {selectedContractor && (
        <Modal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          title={`Pay Contractor: ${selectedContractor.name}`}
          subtitle={`Total Contract: ${formatCurrency(selectedContractor.contract_amount)} • Paid: ${formatCurrency(selectedContractor.paid_amount)}`}
        >
          <form onSubmit={handlePayContractor} className="space-y-4">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Contract Value:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(selectedContractor.contract_amount)}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Total Paid So Far:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(selectedContractor.paid_amount)}</span>
              </div>
              <div className="flex justify-between text-slate-700 dark:text-slate-200 font-bold pt-1.5 border-t border-slate-200 dark:border-slate-700">
                <span>Remaining Contract Balance:</span>
                <span className="text-rose-600 dark:text-rose-400 font-extrabold">
                  {formatCurrency(Math.max(0, Number(selectedContractor.contract_amount) - Number(selectedContractor.paid_amount || 0)))}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Installment Amount to Pay (₹) *
              </label>
              <input
                type="number"
                required
                placeholder="e.g. 50000"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full px-3 py-2 text-sm font-bold text-primary-600 dark:text-primary-400 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Milestone Remark / Cheque Reference
              </label>
              <input
                type="text"
                placeholder="e.g. Ground floor slab casting milestone payment"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-4 py-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-sm"
              >
                Confirm Payment
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
