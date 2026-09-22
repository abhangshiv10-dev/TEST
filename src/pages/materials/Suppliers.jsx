import React, { useState } from 'react';
import { useProject } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { formatCurrency } from '../../utils/currency';
import { showConfirmDialog, showSuccessToast, showErrorAlert, validateMobile } from '../../utils/validators';
import { DataService } from '../../services/dataService';
import { Truck, Plus, Phone, Mail, MapPin, Edit3, Trash2 } from 'lucide-react';

export const Suppliers = () => {
  const { currentProject, suppliers, expenses, refreshProjectData } = useProject();
  const { user } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    business_name: '',
    mobile: '',
    email: '',
    address: '',
    material_type: 'Cement, Sand & Bricks',
    opening_balance: '0',
    notes: ''
  });

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      business_name: '',
      mobile: '',
      email: '',
      address: '',
      material_type: 'Cement, Sand & Bricks',
      opening_balance: '0',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sup) => {
    setEditingSupplier(sup);
    setFormData({
      name: sup.name || '',
      business_name: sup.business_name || '',
      mobile: sup.mobile || '',
      email: sup.email || '',
      address: sup.address || '',
      material_type: sup.material_type || '',
      opening_balance: String(sup.opening_balance || 0),
      notes: sup.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showErrorAlert('Please enter supplier contact name');
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
        opening_balance: Number(formData.opening_balance) || 0,
        project_id: currentProject?.id
      };

      if (editingSupplier) {
        await DataService.updateSupplier(editingSupplier.id, payload);
        showSuccessToast('Supplier updated');
      } else {
        await DataService.createSupplier(payload, user?.id);
        showSuccessToast('Supplier added');
      }

      await refreshProjectData();
      setIsModalOpen(false);
    } catch (err) {
      showErrorAlert(err.message);
    }
  };

  const handleDelete = async (sup) => {
    const confirmed = await showConfirmDialog({
      title: 'Delete Supplier?',
      text: `Are you sure you want to remove ${sup.name}?`,
      confirmButtonText: 'Yes, delete supplier'
    });

    if (confirmed) {
      try {
        await DataService.deleteSupplier(sup.id);
        showSuccessToast('Supplier removed');
        await refreshProjectData();
      } catch (err) {
        showErrorAlert(err.message);
      }
    }
  };

  const columns = [
    {
      header: 'Supplier & Business',
      key: 'name',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 dark:text-white">{row.name}</p>
          <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">{row.business_name || 'Individual Vendor'}</p>
          <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {row.material_type}
          </span>
        </div>
      )
    },
    {
      header: 'Contact Info',
      key: 'mobile',
      render: (row) => (
        <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
          {row.mobile && (
            <p className="flex items-center gap-1.5 font-medium">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{row.mobile}</span>
            </p>
          )}
          {row.email && (
            <p className="flex items-center gap-1.5 text-slate-400">
              <Mail className="w-3.5 h-3.5" />
              <span>{row.email}</span>
            </p>
          )}
        </div>
      )
    },
    {
      header: 'Address / Yard',
      key: 'address',
      render: (row) => (
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1 max-w-[200px]">
          <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
          <span>{row.address || 'Local site supply'}</span>
        </div>
      )
    },
    {
      header: 'Purchases Total',
      key: 'total_purchases',
      render: (row) => {
        const total = expenses
          .filter(e => e.supplier_id === row.id || (e.paid_to && e.paid_to.toLowerCase().includes(row.name.toLowerCase())))
          .reduce((sum, e) => sum + Number(e.amount || 0), 0);
        return (
          <span className="font-bold text-slate-900 dark:text-white">
            {formatCurrency(total)}
          </span>
        );
      }
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
        title="Supplier Directory"
        subtitle="Manage building material vendors, hardware stores, contact info, and trade history"
        actions={
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs sm:text-sm font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Supplier</span>
          </button>
        }
      />

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={suppliers}
        searchField="name"
        searchFields={['name', 'business_name', 'material_type', 'address']}
        searchPlaceholder="Search suppliers by name or material supplied..."
        onAdd={handleOpenAdd}
        addLabel="Add Supplier"
      />

      {/* Supplier Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? `Edit Supplier: ${editingSupplier.name}` : 'Add New Supplier'}
        subtitle="Record vendor details, material supply categories, and contact info"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contact Person Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Patel"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Business / Agency Name
              </label>
              <input
                type="text"
                placeholder="e.g. Balaji Building Materials"
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                placeholder="e.g. 9822012345"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="vendor@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Material Types Supplied
            </label>
            <input
              type="text"
              placeholder="e.g. Cement, TMT Steel, River Sand & Aggregates"
              value={formData.material_type}
              onChange={(e) => setFormData({ ...formData, material_type: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Shop / Yard Address
            </label>
            <input
              type="text"
              placeholder="e.g. Shop 14, Ring Road Highway, Pune"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Terms & Notes
            </label>
            <textarea
              rows="2"
              placeholder="e.g. Credit period 15 days. Minimum 50 bag cement delivery."
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
              Save Supplier
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
