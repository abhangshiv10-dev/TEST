import React, { useState, useEffect } from 'react';
import { useProject } from '../../contexts/ProjectContext';
import { useAuth } from '../../contexts/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { FUNDING_SOURCES } from '../../constants/categories';
import { showConfirmDialog, showSuccessToast, showErrorAlert } from '../../utils/validators';
import { DataService } from '../../services/dataService';
import { Landmark, Plus, DollarSign, CreditCard, Trash2, Calendar, ShieldCheck } from 'lucide-react';

export const FundingLoans = () => {
  const { currentProject, summary, fundings, refreshProjectData } = useProject();
  const { user } = useAuth();

  const [loans, setLoans] = useState([]);
  const [isFundingModalOpen, setIsFundingModalOpen] = useState(false);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);

  const [fundingForm, setFundingForm] = useState({
    source: 'Personal Savings',
    amount: '',
    received_date: new Date().toISOString().split('T')[0],
    reference: '',
    notes: ''
  });

  const [loanForm, setLoanForm] = useState({
    bank_name: 'HDFC Bank',
    loan_account_number: '',
    total_sanctioned_amount: '2000000',
    interest_rate: '8.55',
    tenure_months: '240',
    emi_amount: '17420',
    start_date: new Date().toISOString().split('T')[0],
    disbursed_amount: '600000',
    notes: ''
  });

  const loadLoans = async () => {
    if (!currentProject) return;
    const list = await DataService.getLoans(currentProject.id);
    setLoans(list || []);
  };

  useEffect(() => {
    loadLoans();
  }, [currentProject]);

  const handleSaveFunding = async (e) => {
    e.preventDefault();
    const amt = Number(fundingForm.amount);
    if (!amt || amt <= 0) {
      showErrorAlert('Please enter valid funding amount');
      return;
    }

    try {
      await DataService.createFunding({
        ...fundingForm,
        amount: amt,
        project_id: currentProject?.id
      }, user?.id);

      showSuccessToast('Funding record added');
      await refreshProjectData();
      setIsFundingModalOpen(false);
      setFundingForm({
        source: 'Personal Savings',
        amount: '',
        received_date: new Date().toISOString().split('T')[0],
        reference: '',
        notes: ''
      });
    } catch (err) {
      showErrorAlert(err.message);
    }
  };

  const handleSaveLoan = async (e) => {
    e.preventDefault();
    const sanctioned = Number(loanForm.total_sanctioned_amount) || 0;
    const disbursed = Number(loanForm.disbursed_amount) || 0;

    try {
      await DataService.createLoan({
        ...loanForm,
        total_sanctioned_amount: sanctioned,
        disbursed_amount: disbursed,
        remaining_amount: Math.max(0, sanctioned - disbursed),
        interest_rate: Number(loanForm.interest_rate) || 0,
        tenure_months: Number(loanForm.tenure_months) || 0,
        emi_amount: Number(loanForm.emi_amount) || 0,
        project_id: currentProject?.id
      }, user?.id);

      showSuccessToast('Home loan record saved');
      await loadLoans();
      setIsLoanModalOpen(false);
    } catch (err) {
      showErrorAlert(err.message);
    }
  };

  const handleDeleteFunding = async (f) => {
    const confirmed = await showConfirmDialog({
      title: 'Delete Funding Record?',
      text: `Remove ${formatCurrency(f.amount)} from ${f.source}?`,
      confirmButtonText: 'Yes, delete'
    });

    if (confirmed) {
      try {
        await DataService.deleteFunding(f.id);
        showSuccessToast('Funding record deleted');
        await refreshProjectData();
      } catch (err) {
        showErrorAlert(err.message);
      }
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <PageHeader
        title="Funding & Home Loans"
        subtitle="Track personal capital deposits, bank loan sanctions, tranche disbursements and available liquidity"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLoanModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 shadow-sm"
            >
              <Landmark className="w-4 h-4 text-primary-600" />
              <span>+ Add Bank Loan</span>
            </button>
            <button
              onClick={() => setIsFundingModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs sm:text-sm font-bold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Record Funding Inflow</span>
            </button>
          </div>
        }
      />

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase">Total Capital Inflow</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {formatCurrency(summary.totalFunding)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Deposited into construction account</p>
        </div>

        <div className="glass-card p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase">Total Settled Payments</p>
          <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
            {formatCurrency(summary.totalPaid)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Direct cash & UPI dispatches</p>
        </div>

        <div className="glass-card p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase">Current Liquidity Buffer</p>
          <p className={`text-2xl font-extrabold mt-1 ${summary.availableFunds >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
            {formatCurrency(summary.availableFunds)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Available in bank for ongoing work</p>
        </div>
      </div>

      {/* Funding Inflows Table */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Capital Deposits & Contributions
            </h3>
            <p className="text-xs text-slate-400">
              Savings transfers, family assistance, and loan tranche credits
            </p>
          </div>
          <button
            onClick={() => setIsFundingModalOpen(true)}
            className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
          >
            + Add Inflow
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700/60 text-slate-400 uppercase text-[11px]">
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Source</th>
                <th className="pb-3 font-semibold">Account / Reference</th>
                <th className="pb-3 font-semibold text-right">Amount (₹)</th>
                <th className="pb-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {fundings.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/30">
                  <td className="py-3 font-medium text-slate-600 dark:text-slate-300">
                    {formatDate(f.received_date)}
                  </td>
                  <td className="py-3 font-bold text-slate-900 dark:text-white">
                    {f.source}
                  </td>
                  <td className="py-3 text-slate-500 dark:text-slate-400">
                    {f.reference || '-'}
                  </td>
                  <td className="py-3 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(f.amount)}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleDeleteFunding(f)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bank Loans Section */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Bank Construction Home Loans
            </h3>
            <p className="text-xs text-slate-400">
              Sanctioned loan accounts, stage disbursements, EMI & interest rate details
            </p>
          </div>
          <button
            onClick={() => setIsLoanModalOpen(true)}
            className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
          >
            + Add Loan Account
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loans.map((loan) => (
            <div key={loan.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{loan.bank_name}</h4>
                  <p className="text-xs text-slate-400">A/C: {loan.loan_account_number || 'Applied'}</p>
                </div>
                <StatusBadge status={loan.status || 'Active'} size="sm" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-slate-400">Sanctioned Limit:</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{formatCurrency(loan.total_sanctioned_amount)}</p>
                </div>
                <div>
                  <span className="text-slate-400">Disbursed So Far:</span>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{formatCurrency(loan.disbursed_amount)}</p>
                </div>
                <div className="mt-2">
                  <span className="text-slate-400">Interest Rate:</span>
                  <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{loan.interest_rate}% p.a.</p>
                </div>
                <div className="mt-2">
                  <span className="text-slate-400">Monthly EMI:</span>
                  <p className="font-bold text-primary-600 dark:text-primary-400 mt-0.5">{formatCurrency(loan.emi_amount)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Funding Modal */}
      <Modal
        isOpen={isFundingModalOpen}
        onClose={() => setIsFundingModalOpen(false)}
        title="Record Capital Funding Deposit"
        subtitle="Log savings transfers, family contributions or loan releases"
      >
        <form onSubmit={handleSaveFunding} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Funding Source *
            </label>
            <select
              value={fundingForm.source}
              onChange={(e) => setFundingForm({ ...fundingForm, source: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            >
              {FUNDING_SOURCES.map((s, idx) => (
                <option key={idx} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Deposit Amount (₹) *
              </label>
              <input
                type="number"
                required
                placeholder="e.g. 500000"
                value={fundingForm.amount}
                onChange={(e) => setFundingForm({ ...fundingForm, amount: e.target.value })}
                className="w-full px-3 py-2 text-sm font-bold text-emerald-600 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date Received
              </label>
              <input
                type="date"
                required
                value={fundingForm.received_date}
                onChange={(e) => setFundingForm({ ...fundingForm, received_date: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Bank Reference / Cheque No
            </label>
            <input
              type="text"
              placeholder="e.g. SBI Savings Account A/C 9012"
              value={fundingForm.reference}
              onChange={(e) => setFundingForm({ ...fundingForm, reference: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsFundingModalOpen(false)}
              className="px-4 py-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-bold bg-primary-600 hover:bg-primary-500 text-white rounded-xl shadow-sm"
            >
              Save Funding
            </button>
          </div>
        </form>
      </Modal>

      {/* Loan Modal */}
      <Modal
        isOpen={isLoanModalOpen}
        onClose={() => setIsLoanModalOpen(false)}
        title="Add Construction Home Loan"
        subtitle="Record bank sanction details and EMI obligation"
      >
        <form onSubmit={handleSaveLoan} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Bank / Lender Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. HDFC Bank Home Loans"
                value={loanForm.bank_name}
                onChange={(e) => setLoanForm({ ...loanForm, bank_name: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Loan Account Number
              </label>
              <input
                type="text"
                placeholder="e.g. HL-882910"
                value={loanForm.loan_account_number}
                onChange={(e) => setLoanForm({ ...loanForm, loan_account_number: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sanctioned Amount (₹) *
              </label>
              <input
                type="number"
                required
                value={loanForm.total_sanctioned_amount}
                onChange={(e) => setLoanForm({ ...loanForm, total_sanctioned_amount: e.target.value })}
                className="w-full px-3 py-2 text-sm font-bold text-primary-600 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Disbursed Tranche (₹)
              </label>
              <input
                type="number"
                value={loanForm.disbursed_amount}
                onChange={(e) => setLoanForm({ ...loanForm, disbursed_amount: e.target.value })}
                className="w-full px-3 py-2 text-sm font-bold text-emerald-600 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Interest Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={loanForm.interest_rate}
                onChange={(e) => setLoanForm({ ...loanForm, interest_rate: e.target.value })}
                className="w-full px-2.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tenure (Months)
              </label>
              <input
                type="number"
                value={loanForm.tenure_months}
                onChange={(e) => setLoanForm({ ...loanForm, tenure_months: e.target.value })}
                className="w-full px-2.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Monthly EMI (₹)
              </label>
              <input
                type="number"
                value={loanForm.emi_amount}
                onChange={(e) => setLoanForm({ ...loanForm, emi_amount: e.target.value })}
                className="w-full px-2.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsLoanModalOpen(false)}
              className="px-4 py-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-bold bg-primary-600 hover:bg-primary-500 text-white rounded-xl shadow-sm"
            >
              Save Loan Account
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
