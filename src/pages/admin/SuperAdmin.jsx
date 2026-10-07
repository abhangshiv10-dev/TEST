import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  User,
  History,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  Loader2,
  Clock,
  ChevronDown,
  Save
} from 'lucide-react';
import { useAuth, getUserMobile } from '../../contexts/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { toast, alertBox } from '../../utils/alerts';
import { auditService } from '../../services/auditService';
import { formatINR } from '../../utils/marathiCurrency';
import { formatMarathiDate, formatMarathiDateTime, toInputDate } from '../../utils/marathiDate';

const ACTIONS = {
  add: { labelKey: 'admin.action.add', icon: Plus, badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  update: { labelKey: 'admin.action.update', icon: Edit2, badge: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  delete: { labelKey: 'admin.action.delete', icon: Trash2, badge: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' }
};

const ENTITY_KEYS = ['expense', 'category', 'budget', 'profile'];

const formatValue = (key, value, t) => {
  if (value === null || value === undefined || value === '') return '-';
  if (key === 'amount' || key === 'budget') return formatINR(value);
  if (key === 'date') return formatMarathiDate(value);
  if (key === 'photos') return t('admin.photosCount', { count: value });
  if (key === 'status') return t(String(value).toLowerCase() === 'pending' ? 'status.pending' : 'status.paid');
  return String(value);
};

// Shows what exactly changed (update), what was saved (add) or what was removed (delete)
function LogDetails({ log }) {
  const { t } = useLanguage();
  const before = log.details?.before || {};
  const after = log.details?.after || {};
  const keys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));

  const rows =
    log.action === 'update'
      ? keys.filter((k) => String(before[k] ?? '') !== String(after[k] ?? ''))
      : keys;

  if (rows.length === 0) {
    return <p className="text-[11px] text-slate-400">{log.action === 'update' ? t('admin.noChange') : t('admin.noMoreDetails')}</p>;
  }

  return (
    <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white overflow-hidden">
      {rows.map((k) => (
        <div key={k} className="px-2.5 py-1.5 flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-3 text-[11px]">
          <span className="w-24 shrink-0 font-semibold text-slate-500">{t(`admin.field.${k}`) === `admin.field.${k}` ? k : t(`admin.field.${k}`)}</span>
          {log.action === 'update' ? (
            <span className="text-slate-800 break-words">
              <span className="text-rose-600 line-through decoration-rose-300">{formatValue(k, before[k], t)}</span>
              <span className="mx-1.5 text-slate-400">→</span>
              <span className="text-emerald-700 font-semibold">{formatValue(k, after[k], t)}</span>
            </span>
          ) : (
            <span className="text-slate-800 font-medium break-words">
              {formatValue(k, log.action === 'add' ? after[k] : before[k], t)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function LogRow({ log }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const meta = ACTIONS[log.action] || ACTIONS.update;
  const Icon = meta.icon;

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-colors">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full text-left p-3 flex items-start gap-3"
      >
        <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${meta.badge}`}>
          <Icon className="w-4 h-4" />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`px-1.5 py-0.5 rounded-[2px] border text-[10px] font-bold ${meta.badge}`}>{t(meta.labelKey)}</span>
            <span className="px-1.5 py-0.5 rounded-[2px] bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-600">
              {ENTITY_KEYS.includes(log.entity) ? t(`admin.entity.${log.entity}`) : log.entity}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug break-words">{log.summary || '-'}</p>
          <div className="flex items-center gap-x-3 gap-y-0.5 flex-wrap text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1">
              <User className="w-3 h-3 text-slate-400" />
              <span className="font-medium text-slate-700">{log.actor_name || '-'}</span>
              {log.actor_mobile && <span className="text-slate-400">({log.actor_mobile})</span>}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {formatMarathiDateTime(log.created_at)}
            </span>
          </div>
        </div>

        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 mt-1 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-3 pb-3 pt-0 sm:pl-14">
          <LogDetails log={log} />
        </div>
      )}
    </div>
  );
}

function ProfileTab() {
  const { t } = useLanguage();
  const { user, updateProfile } = useAuth();
  const mobile = getUserMobile(user);
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateProfile({ fullName });
      toast('success', t('admin.profileUpdated'), 1800);
    } catch (err) {
      alertBox('error', t('common.error'), t('admin.profileSaveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-6 max-w-xl space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl font-bold shadow-xs">
          {fullName ? fullName[0].toUpperCase() : <User className="w-6 h-6" />}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-900 truncate">{fullName || t('admin.noName')}</p>
          <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-[2px] bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold">
            <ShieldCheck className="w-3 h-3" /> Super Admin
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">{t('admin.fullName')}</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder={t('admin.fullNamePlaceholder')}
            className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">{t('admin.mobile')}</label>
          <input
            type="text"
            value={mobile}
            disabled
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
          />
          <p className="mt-1 text-[10px] text-slate-400">{t('admin.mobileHint')}</p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-[2px] shadow-xs flex items-center gap-1.5 active:scale-95 transition-all disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{t('admin.saveProfile')}</span>
        </button>
      </form>
    </div>
  );
}

function TrackingLogTab() {
  const { t } = useLanguage();
  const PAGE_SIZE = 30;
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [rangeFilter, setRangeFilter] = useState('all'); // all | today | this_week | this_month | custom
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const load = async () => {
    setLoading(true);
    try {
      setLogs(await auditService.getLogs());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, actionFilter, entityFilter, userFilter, rangeFilter, startDate, endDate]);

  const users = useMemo(() => {
    const map = new Map();
    logs.forEach((l) => {
      const key = l.actor_mobile || l.actor_id || 'unknown';
      if (!map.has(key)) map.set(key, l.actor_name ? `${l.actor_name}${l.actor_mobile ? ` (${l.actor_mobile})` : ''}` : key);
    });
    return Array.from(map.entries());
  }, [logs]);

  const filtered = useMemo(() => {
    const now = new Date();
    const todayStr = toInputDate(now);
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7)); // Monday
    const weekStartStr = toInputDate(weekStart);
    const monthPrefix = todayStr.slice(0, 7);
    const q = search.trim().toLowerCase();

    return logs.filter((l) => {
      if (actionFilter !== 'all' && l.action !== actionFilter) return false;
      if (entityFilter !== 'all' && l.entity !== entityFilter) return false;
      if (userFilter !== 'all' && (l.actor_mobile || l.actor_id || 'unknown') !== userFilter) return false;

      const day = toInputDate(new Date(l.created_at)); // local date
      if (rangeFilter === 'today' && day !== todayStr) return false;
      if (rangeFilter === 'this_week' && (day < weekStartStr || day > todayStr)) return false;
      if (rangeFilter === 'this_month' && !day.startsWith(monthPrefix)) return false;
      if (rangeFilter === 'custom') {
        if (startDate && day < startDate) return false;
        if (endDate && day > endDate) return false;
      }

      if (q) {
        const hay = `${l.summary || ''} ${l.actor_name || ''} ${l.actor_mobile || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [logs, search, actionFilter, entityFilter, userFilter, rangeFilter, startDate, endDate]);

  const counts = useMemo(
    () => ({
      total: filtered.length,
      add: filtered.filter((l) => l.action === 'add').length,
      update: filtered.filter((l) => l.action === 'update').length,
      delete: filtered.filter((l) => l.action === 'delete').length
    }),
    [filtered]
  );

  const pill = (active) =>
    `px-3 py-1.5 rounded-[2px] whitespace-nowrap text-xs font-bold transition-all shadow-2xs ${
      active ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
    }`;

  return (
    <div className="space-y-4">
      {/* Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          { label: t('admin.stat.total'), value: counts.total, cls: 'text-slate-900' },
          { label: t('admin.action.add'), value: counts.add, cls: 'text-emerald-700' },
          { label: t('admin.action.update'), value: counts.update, cls: 'text-blue-700' },
          { label: t('admin.action.delete'), value: counts.delete, cls: 'text-rose-700' }
        ].map((c) => (
          <div key={c.label} className="glass-card rounded-xl p-3">
            <p className="text-[11px] text-slate-500 font-medium">{c.label}</p>
            <p className={`text-xl font-extrabold ${c.cls}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card rounded-2xl p-3 sm:p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('admin.search')}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
            />
          </div>
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
          >
            <option value="all">{t('admin.allUsers')}</option>
            {users.map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-slate-900"
          >
            <option value="all">{t('admin.allEntities')}</option>
            {ENTITY_KEYS.map((k) => (
              <option key={k} value={k}>{t(`admin.entity.${k}`)}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={load}
            className="px-3 py-2 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 rounded-[2px] flex items-center justify-center gap-1.5 text-slate-700"
            title={t('admin.refresh')}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{t('admin.refresh')}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'all', label: t('admin.filter.all') },
            { id: 'add', label: t('admin.action.add') },
            { id: 'update', label: t('admin.action.update') },
            { id: 'delete', label: t('admin.action.delete') }
          ].map((p) => (
            <button key={p.id} onClick={() => setActionFilter(p.id)} className={pill(actionFilter === p.id)}>
              {p.label}
            </button>
          ))}
          <span className="w-px h-5 bg-slate-200 mx-1 shrink-0" />
          {[
            { id: 'all', label: t('admin.range.any') },
            { id: 'today', label: t('admin.range.today') },
            { id: 'this_week', label: t('admin.range.thisWeek') },
            { id: 'this_month', label: t('admin.range.thisMonth') },
            { id: 'custom', label: t('admin.range.pick') }
          ].map((p) => (
            <button key={p.id} onClick={() => setRangeFilter(p.id)} className={pill(rangeFilter === p.id)}>
              {p.label}
            </button>
          ))}
        </div>

        {rangeFilter === 'custom' && (
          <div className="flex items-center gap-2 flex-wrap text-xs bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
            <span className="text-slate-500 font-medium">{t('admin.from')}</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
            />
            <span className="text-slate-500 font-medium">{t('admin.to')}</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
            />
          </div>
        )}
      </div>

      {/* Log list */}
      {loading && logs.length === 0 ? (
        <div className="py-12 flex items-center justify-center text-slate-400 text-xs gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> {t('admin.loading')}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white border border-dashed border-slate-200 text-center text-xs text-slate-500 space-y-1">
          <History className="w-6 h-6 text-slate-300 mx-auto" />
          <p className="font-semibold text-slate-700">{t('admin.empty.title')}</p>
          <p className="text-[11px] text-slate-400">{t('admin.empty.hint')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.slice(0, visibleCount).map((l) => (
            <LogRow key={l.id} log={l} />
          ))}
          {filtered.length > visibleCount && (
            <button
              type="button"
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className="w-full py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-[2px]"
            >
              {t('admin.showMore', { count: filtered.length - visibleCount })}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function SuperAdmin() {
  const { t } = useLanguage();
  const [tab, setTab] = useState('log'); // 'log' | 'profile'

  return (
    <div className="space-y-5 pb-20 sm:pb-8 animate-in fade-in duration-200">
      <div className="pt-1 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{t('admin.title')}</h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
            {t('admin.subtitle')}
          </p>
        </div>
      </div>

      <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/60">
        {[
          { id: 'log', label: t('admin.tab.log'), icon: History },
          { id: 'profile', label: t('admin.tab.profile'), icon: User }
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-[2px] text-xs font-semibold transition-all ${
                tab === t.id ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {tab === 'log' ? <TrackingLogTab /> : <ProfileTab />}
    </div>
  );
}
