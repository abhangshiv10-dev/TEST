import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useProject } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import { MEASUREMENT_UNITS } from '../../constants/units';
import { DataService } from '../../services/dataService';
import { showSuccessToast, showErrorAlert } from '../../utils/validators';

export const MaterialModal = ({
  isOpen,
  onClose,
  materialToEdit = null,
  mode = 'add', // 'add' | 'purchase' | 'adjust'
  onSaved
}) => {
  const { currentProject, suppliers, refreshProjectData } = useProject();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Cement',
    unit: 'Bags',
    minimum_stock: '10',
    current_stock: '0',
    notes: '',
    // Purchase fields
    supplier_id: '',
    purchase_quantity: '',
    rate: '',
    total_amount: '',
    bill_number: '',
    // Adjust fields
    adjustment_type: 'Usage',
    adjustment_qty: '',
    reason: 'Site masonry work'
  });

  useEffect(() => {
    if (materialToEdit) {
      setFormData({
        name: materialToEdit.name || '',
        category: materialToEdit.category || 'Cement',
        unit: materialToEdit.unit || 'Bags',
        minimum_stock: materialToEdit.minimum_stock ?? '10',
        current_stock: materialToEdit.current_stock ?? '0',
        notes: materialToEdit.notes || '',
        supplier_id: '',
        purchase_quantity: '',
        rate: '',
        total_amount: '',
        bill_number: '',
        adjustment_type: 'Usage',
        adjustment_qty: '',
        reason: 'Site work usage'
      });
    } else {
      setFormData({
        name: '',
        category: 'Cement',
        unit: 'Bags',
        minimum_stock: '10',
        current_stock: '0',
        notes: '',
        supplier_id: '',
        purchase_quantity: '',
        rate: '',
        total_amount: '',
        bill_number: '',
        adjustment_type: 'Usage',
        adjustment_qty: '',
        reason: 'Site masonry work'
      });
    }
  }, [materialToEdit, isOpen, mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (mode === 'add' || mode === 'edit') {
        if (!formData.name.trim()) {
          showErrorAlert('Please enter material name');
          return;
        }

        const payload = {
          name: formData.name,
          category: formData.category,
          unit: formData.unit,
          minimum_stock: Number(formData.minimum_stock) || 0,
          current_stock: Number(formData.current_stock) || 0,
          notes: formData.notes,
          project_id: currentProject?.id
        };

        if (materialToEdit && mode === 'edit') {
          await DataService.updateMaterial(materialToEdit.id, payload);
          showSuccessToast('Material updated');
        } else {
          await DataService.createMaterial(payload, user?.id);
          showSuccessToast('Material added to inventory');
        }
      } else if (mode === 'purchase') {
        const qty = Number(formData.purchase_quantity);
        const rate = Number(formData.rate);
        if (!qty || qty <= 0) {
          showErrorAlert('Please enter purchase quantity');
          return;
        }

        const total = Math.round(qty * rate);

        // 1. Update stock
        await DataService.adjustMaterialStock(materialToEdit.id, qty, `Purchase: Bill #${formData.bill_number || 'N/A'}`, currentProject?.id);

        // 2. Automatically record in expenses as well for 100% financial tracking!
        await DataService.createExpense({
          project_id: currentProject?.id,
          expense_date: new Date().toISOString().split('T')[0],
          description: `Material Purchase: ${materialToEdit.name} (${qty} ${materialToEdit.unit})`,
          category_id: 'cat-cement',
          supplier_id: formData.supplier_id || null,
          quantity: qty,
          unit: materialToEdit.unit,
          rate: rate,
          amount: total,
          paid_to: suppliers.find(s => s.id === formData.supplier_id)?.name || 'Material Supplier',
          payment_method: 'UPI',
          payment_status: 'Paid',
          reference_number: formData.bill_number || ''
        }, user?.id);

        showSuccessToast(`Purchased ${qty} ${materialToEdit.unit} of ${materialToEdit.name} and logged expense of ₹${total}`);
      } else if (mode === 'adjust') {
        const qty = Number(formData.adjustment_qty);
        if (!qty || qty <= 0) {
          showErrorAlert('Please enter adjustment quantity');
          return;
        }

        const delta = formData.adjustment_type === 'Usage' || formData.adjustment_type === 'Wastage' ? -qty : qty;
        await DataService.adjustMaterialStock(materialToEdit.id, delta, `${formData.adjustment_type}: ${formData.reason}`, currentProject?.id);
        showSuccessToast(`Stock adjusted by ${delta > 0 ? '+' : ''}${delta} ${materialToEdit.unit}`);
      }

      await refreshProjectData();
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      showErrorAlert(err.message, 'Operation Failed');
    }
  };

  const getTitle = () => {
    if (mode === 'purchase') return `Purchase Material: ${materialToEdit?.name}`;
    if (mode === 'adjust') return `Adjust Stock: ${materialToEdit?.name}`;
    if (mode === 'edit') return 'Edit Material Details';
    return 'Add New Construction Material';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      subtitle={mode === 'purchase' ? 'Log purchase, increment stock, and add expense' : 'Manage construction inventory'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'purchase' ? (
          <>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300">
              Current Stock: <strong>{materialToEdit?.current_stock} {materialToEdit?.unit}</strong>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Supplier
                </label>
                <select
                  value={formData.supplier_id}
                  onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="">-- Direct / Unknown --</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.business_name})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bill / Invoice No
                </label>
                <input
                  type="text"
                  placeholder="e.g. BILL-9021"
                  value={formData.bill_number}
                  onChange={(e) => setFormData({ ...formData, bill_number: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Quantity ({materialToEdit?.unit}) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.purchase_quantity}
                  onChange={(e) => {
                    const q = e.target.value;
                    setFormData({
                      ...formData,
                      purchase_quantity: q,
                      total_amount: Number(q) && Number(formData.rate) ? Math.round(Number(q) * Number(formData.rate)) : formData.total_amount
                    });
                  }}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Rate per {materialToEdit?.unit} (₹) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.rate}
                  onChange={(e) => {
                    const r = e.target.value;
                    setFormData({
                      ...formData,
                      rate: r,
                      total_amount: Number(formData.purchase_quantity) && Number(r) ? Math.round(Number(formData.purchase_quantity) * Number(r)) : formData.total_amount
                    });
                  }}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-300">Total Purchase Value:</span>
              <span className="font-bold text-lg text-primary-600 dark:text-primary-400">
                ₹{formData.total_amount || 0}
              </span>
            </div>
          </>
        ) : mode === 'adjust' ? (
          <>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
              Current Stock: <strong>{materialToEdit?.current_stock} {materialToEdit?.unit}</strong>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Adjustment Type
                </label>
                <select
                  value={formData.adjustment_type}
                  onChange={(e) => setFormData({ ...formData, adjustment_type: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="Usage">Usage on Site (-)</option>
                  <option value="Wastage">Wastage / Damage (-)</option>
                  <option value="Restock">Manual Restock (+)</option>
                  <option value="Correction">Correction / Audit (+/-)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Quantity ({materialToEdit?.unit}) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.adjustment_qty}
                  onChange={(e) => setFormData({ ...formData, adjustment_qty: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reason / Location of Work
              </label>
              <input
                type="text"
                placeholder="e.g. Consumed for 1st floor masonry"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Material Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. UltraTech Cement 53 Grade"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cement / Steel / Sand"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Unit of Measurement *
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  {MEASUREMENT_UNITS.map(u => (
                    <option key={u.value} value={u.value}>{u.value}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Current Stock
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.current_stock}
                  onChange={(e) => setFormData({ ...formData, current_stock: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Minimum Stock Alert Threshold
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.minimum_stock}
                  onChange={(e) => setFormData({ ...formData, minimum_stock: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Storage Notes / Location
              </label>
              <textarea
                rows="2"
                placeholder="e.g. Stored in site shed on wooden planks"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
          </>
        )}

        <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs sm:text-sm font-bold bg-primary-600 hover:bg-primary-500 text-white rounded-xl shadow-sm transition-all"
          >
            {mode === 'purchase' ? 'Confirm Purchase' : mode === 'adjust' ? 'Apply Adjustment' : 'Save Material'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
