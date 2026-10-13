import React, { useState, useMemo } from 'react';
import { Trash2, Check, X, Loader2, User, Clock, RefreshCw } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationsContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { formatINR } from '../../utils/marathiCurrency';

const STATUS_CLS = {
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-slate-100 text-slate-600 border-slate-200'
};

export default function DeleteRequestsTab() {
  const { t, catLabel, fmtDate, fmtDateTime } = useLanguage();
  const { requests, busyId, handleApprove, handleReject, refresh } = useNotifications();
  const [filter, setFilter] = useState('pending'); // pending | approved | rejected | all

  const list = useMemo(
    () => (filter === 'all' ? requests : requests.filter((r) => r.status === filter)),
    [requests, filter]
  );

  const pill = (active) =>
    `px-3 py-1.5 rounded-[2px] whitespace-nowrap text-xs font-bold transition-all shadow-2xs ${
      active ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
    }`;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {['pending', 'approved', 'rejected', 'all'].map((f) => (
          <button key={f} type="button" onClick={() => setFilter(f)} className={pill(filter === f)}>
            {t(`delreq.filter.${f}`)}
          </button>
        ))}
        <button
          type="button"
          onClick={refresh}
          title={t('admin.refresh')}
          className="ml-auto px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 rounded-[2px] flex items-center gap-1.5 text-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{t('admin.refresh')}</span>
        </button>
      </div>

      {list.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white border border-dashed border-slate-200 text-center text-xs text-slate-500 space-y-1">
          <Trash2 className="w-6 h-6 text-slate-300 mx-auto" />
          <p className="font-semibold text-slate-700">{t('delreq.empty')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((r) => {
            const busy = busyId === r.id;
            const s = r.snapshot || {};
            return (
              <div key={r.id} className="rounded-xl border border-slate-200/80 bg-white p-3 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-sm font-semibold text-slate-900 break-words">
                      {catLabel(s.category, s.category_en)} - {formatINR(s.amount || 0)}
                    </p>
                    {s.date && (
                      <p className="text-[11px] text-slate-500">
                        {t('delreq.expenseDate')}: {fmtDate(s.date)}
                      </p>
                    )}
                    {s.description && <p className="text-[11px] text-slate-500 break-words">{s.description}</p>}
                  </div>
                  <span className={`px-1.5 py-0.5 rounded-[2px] border text-[10px] font-bold shrink-0 ${STATUS_CLS[r.status]}`}>
                    {t(`notif.status.${r.status}`)}
                  </span>
                </div>

                <div className="flex items-center gap-x-3 gap-y-0.5 flex-wrap text-[11px] text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    <span className="font-medium text-slate-700">{r.requester_name || '-'}</span>
                    {r.requester_mobile && <span className="text-slate-400">({r.requester_mobile})</span>}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {fmtDateTime(r.created_at)}
                  </span>
                </div>

                {r.status !== 'pending' && r.resolved_at && (
                  <p className="text-[11px] text-slate-500">
                    {t('notif.resolvedBy', { name: r.resolved_by_name || r.resolved_by_mobile || '-' })} · {fmtDateTime(r.resolved_at)}
                  </p>
                )}

                {r.status === 'pending' && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleApprove(r)}
                      className="px-3 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-[2px] flex items-center gap-1.5 disabled:opacity-60"
                    >
                      {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      {t('notif.approve')}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleReject(r)}
                      className="px-3 py-1.5 text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-[2px] flex items-center gap-1.5 disabled:opacity-60"
                    >
                      <X className="w-3.5 h-3.5" />
                      {t('notif.reject')}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
