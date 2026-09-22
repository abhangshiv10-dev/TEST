import React, { useState } from 'react';
import { useProject } from '../../contexts/ProjectContext';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { MaterialModal } from '../../components/modals/MaterialModal';
import { showConfirmDialog, showSuccessToast, showErrorAlert } from '../../utils/validators';
import { DataService } from '../../services/dataService';
import { 
  Package, 
  Plus, 
  ShoppingCart, 
  SlidersHorizontal, 
  Edit3, 
  Trash2, 
  AlertTriangle 
} from 'lucide-react';

export const MaterialStock = () => {
  const { currentProject, materials, refreshProjectData } = useProject();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit' | 'purchase' | 'adjust'
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const handleDelete = async (material) => {
    const confirmed = await showConfirmDialog({
      title: 'Delete Material?',
      text: `Are you sure you want to remove "${material.name}" from inventory?`,
      confirmButtonText: 'Yes, delete'
    });

    if (confirmed) {
      try {
        await DataService.deleteMaterial(material.id);
        showSuccessToast('Material deleted');
        await refreshProjectData();
      } catch (err) {
        showErrorAlert(err.message);
      }
    }
  };

  const columns = [
    {
      header: 'Material Name',
      key: 'name',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-bold text-slate-800 dark:text-slate-100">{row.name}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Category: {row.category || 'General'}</p>
        </div>
      )
    },
    {
      header: 'Current Stock',
      key: 'current_stock',
      sortable: true,
      render: (row) => (
        <span className="font-extrabold text-base text-slate-900 dark:text-white">
          {row.current_stock} <span className="text-xs font-normal text-slate-400">{row.unit}</span>
        </span>
      )
    },
    {
      header: 'Min Threshold',
      key: 'minimum_stock',
      sortable: true,
      render: (row) => (
        <span className="text-slate-500 dark:text-slate-400 text-xs">
          {row.minimum_stock} {row.unit}
        </span>
      )
    },
    {
      header: 'Stock Status',
      key: 'status',
      sortable: true,
      render: (row) => {
        const cur = Number(row.current_stock);
        const min = Number(row.minimum_stock);
        let status = 'In Stock';
        if (cur <= 0) status = 'Out of Stock';
        else if (cur <= min) status = 'Low Stock';
        return <StatusBadge status={status} size="sm" />;
      }
    },
    {
      header: 'Storage Location / Notes',
      key: 'notes',
      render: (row) => (
        <span className="text-xs text-slate-500 dark:text-slate-400 max-w-[200px] truncate block">
          {row.notes || '-'}
        </span>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      cellClassName: 'text-right whitespace-nowrap',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => {
              setSelectedMaterial(row);
              setModalMode('purchase');
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold shadow-sm transition-all"
            title="Log Material Purchase"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>+ Purchase</span>
          </button>

          <button
            onClick={() => {
              setSelectedMaterial(row);
              setModalMode('adjust');
              setModalOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Adjust Stock (Usage/Wastage)"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setSelectedMaterial(row);
              setModalMode('edit');
              setModalOpen(true);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Edit Material"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleDelete(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
            title="Delete Material"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const lowStockCount = materials.filter(m => Number(m.current_stock) <= Number(m.minimum_stock)).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Material Inventory & Stock"
        subtitle="Live tracking of site raw materials, stock levels, and consumption"
        actions={
          <button
            onClick={() => {
              setSelectedMaterial(null);
              setModalMode('add');
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs sm:text-sm font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Material</span>
          </button>
        }
      />

      {/* Warning banner if items are low */}
      {lowStockCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between text-xs sm:text-sm text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>{lowStockCount} item{lowStockCount > 1 ? 's' : ''}</strong> running low on stock. Please place re-order to prevent site work stoppages.
            </span>
          </div>
        </div>
      )}

      {/* Main Material Table */}
      <DataTable
        columns={columns}
        data={materials}
        searchField="name"
        searchFields={['name', 'category', 'notes']}
        searchPlaceholder="Search materials by name or category..."
        onAdd={() => {
          setSelectedMaterial(null);
          setModalMode('add');
          setModalOpen(true);
        }}
        addLabel="Add Material"
      />

      {/* Material Modal */}
      <MaterialModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedMaterial(null);
        }}
        materialToEdit={selectedMaterial}
        mode={modalMode}
        onSaved={refreshProjectData}
      />
    </div>
  );
};
