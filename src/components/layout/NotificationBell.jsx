import React, { useState, useRef, useEffect } from 'react';
import { Bell, Plus, Trash2, CheckCircle2, XCircle, Check, X, Loader2 } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationsContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatINR } from '../../utils/marathiCurrency';

const TYPE_META = {
  expense_added: { icon: Plus, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  delete_request: { icon: Trash2, cls: 'bg-rose-50 text-rose-700 border-rose-200' },
  delete_approved: { icon: CheckCircle2, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  delete_rejected: { icon: XCircle, cls: 'bg-amber-50 text-amber-700 border-amber-200' }
};

const STATUS_CLS = {
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-slate-100 text-slate-600 border-slate-200'
};

export default function NotificationBell() {
  const { t, catLabel, fmtDateTime } = useLanguage();
  const { isSuperAdmin } = useAuth();
  const {
    notifications,
    unreadCount,
    lastSeen,
    isNewSince,
    markSeen,
    refresh,
    requestById,
    busyId,
    handleApprove,
    handleReject
  } = useNotifications();

  const [open, setOpen] = useState(false);
  const [highlightSince, setHighlightSince] = useState('');
  const wrapRef = useRef(null);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = () => {
    if (!open) {
      setHighlightSince(lastSeen); // keep showing which ones were new, even though the badge clears now
      refresh();
      markSeen();
    }
    setOpen((o) => !o);
  };

  const textFor = (n) => {
    const params = {
      actor: n.actor_name || n.actor_mobile || t('notif.someone'),
      category: catLabel(n.data?.category, n.data?.category_en),
      amount: formatINR(n.data?.amount || 0)
    };
    return t(`notif.${n.type}`, params);
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        title={t('notif.title')}
        aria-label={t('notif.title')}
        aria-expanded={open}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-[2px] transition-colors"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed left-3 right-3 top-[68px] sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[26rem] z-50 rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <p className="text-sm font-bold text-slate-900">{t('notif.title')}</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-[2px]"
              aria-label={t('common.cancel')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-[65vh] overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-500 space-y-1">
                <Bell className="w-6 h-6 text-slate-300 mx-auto" />
                <p className="font-semibold text-slate-700">{t('notif.empty')}</p>
              </div>
            ) : (
              notifications.map((n) => {
                const meta = TYPE_META[n.type] || TYPE_META.expense_added;
                const Icon = meta.icon;
                const fresh = isNewSince(n, highlightSince);
                const request = n.type === 'delete_request' ? requestById.get(n.request_id) : null;
                const status = request?.status;
                const busy = request && busyId === request.id;

                return (
                  <div key={n.id} className={`px-4 py-3 flex gap-3 ${fresh ? 'bg-amber-50/60' : ''}`}>
                    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${meta.cls}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-xs font-semibold text-slate-900 leading-snug break-words">{textFor(n)}</p>
                      <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500">
                        <span>{fmtDateTime(n.created_at)}</span>
                        {fresh && (
                          <span className="px-1.5 py-0.5 rounded-[2px] bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold">
                            {t('notif.new')}
                          </span>
                        )}
                        {isSuperAdmin && status && status !== 'pending' && (
                          <span className={`px-1.5 py-0.5 rounded-[2px] border text-[10px] font-bold ${STATUS_CLS[status]}`}>
                            {t(`notif.status.${status}`)}
                            {request.resolved_by_name ? ` · ${request.resolved_by_name}` : ''}
                          </span>
                        )}
                      </div>

                      {isSuperAdmin && status === 'pending' && (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleApprove(request)}
                            className="px-3 py-1.5 text-[11px] font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-[2px] flex items-center gap-1 disabled:opacity-60"
                          >
                            {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                            {t('notif.approve')}
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleReject(request)}
                            className="px-3 py-1.5 text-[11px] font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-[2px] flex items-center gap-1 disabled:opacity-60"
                          >
                            <X className="w-3 h-3" />
                            {t('notif.reject')}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <p className="px-4 py-2 border-t border-slate-100 bg-slate-50/70 text-[10px] text-slate-400">
            {t('notif.footer')}
          </p>
        </div>
      )}
    </div>
  );
}
