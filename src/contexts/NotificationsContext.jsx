import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth, getUserMobile } from './AuthContext';
import { useBudget } from './BudgetContext';
import { useLanguage } from '../i18n/LanguageContext';
import { notificationService, NOTIFICATIONS_CHANGED_EVENT } from '../services/notificationService';
import { deleteRequestService } from '../services/deleteRequestService';
import { toast, alertBox, confirmAction } from '../utils/alerts';
import { formatINR } from '../utils/marathiCurrency';

// Bell-icon notifications + the Super Admin's delete-request actions.
// (The older NotificationContext.jsx belongs to an unused module and is left untouched.)

const NotificationsContext = createContext({
  notifications: [],
  requests: [],
  unreadCount: 0,
  pendingRequestCount: 0
});

export const useNotifications = () => useContext(NotificationsContext);

const POLL_MS = 30000;
const seenKey = (mobile) => `homebuild_notif_seen_${mobile}`;

export const NotificationsProvider = ({ children }) => {
  const { user, isSuperAdmin } = useAuth();
  const { approveDeleteRequest, rejectDeleteRequest } = useBudget();
  const { t, catLabel } = useLanguage();
  const mobile = getUserMobile(user);

  const [notifications, setNotifications] = useState([]);
  const [requests, setRequests] = useState([]);
  const [lastSeen, setLastSeen] = useState('');
  const [busyId, setBusyId] = useState(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Last time THIS person opened the bell (kept on this device)
  useEffect(() => {
    if (!mobile) {
      setLastSeen('');
      return;
    }
    try {
      setLastSeen(localStorage.getItem(seenKey(mobile)) || '');
    } catch {
      setLastSeen('');
    }
  }, [mobile]);

  const refresh = useCallback(async () => {
    if (!user) return;
    const list = await notificationService.getRecent();
    const mine = list.filter(
      (n) =>
        n.audience === 'all' ||
        (n.audience === 'super_admin' && isSuperAdmin) ||
        (n.audience === 'user' && n.target_mobile && n.target_mobile === mobile)
    );
    const reqs = isSuperAdmin ? await deleteRequestService.getAll() : [];
    if (!mounted.current) return;
    setNotifications(mine);
    setRequests(reqs);
  }, [user, isSuperAdmin, mobile]);

  // Load now, then keep checking (other users add records from their own phones)
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setRequests([]);
      return undefined;
    }
    refresh();
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') refresh();
    }, POLL_MS);
    const onWake = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    window.addEventListener('focus', onWake);
    document.addEventListener('visibilitychange', onWake);
    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onWake);
      document.removeEventListener('visibilitychange', onWake);
      window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, refresh);
    };
  }, [user, refresh]);

  const requestById = useMemo(() => new Map(requests.map((r) => [r.id, r])), [requests]);

  const isPendingRequest = useCallback(
    (n) => n.type === 'delete_request' && requestById.get(n.request_id)?.status === 'pending',
    [requestById]
  );

  // "New" = arrived after the bell was last opened, and not caused by me
  const isNewSince = useCallback(
    (n, since) => n.actor_mobile !== mobile && (!since || n.created_at > since),
    [mobile]
  );

  // Badge: new notifications + (Super Admin) delete requests that still wait for a decision
  const unreadCount = useMemo(
    () => notifications.filter((n) => isNewSince(n, lastSeen) || (isSuperAdmin && isPendingRequest(n))).length,
    [notifications, lastSeen, isNewSince, isSuperAdmin, isPendingRequest]
  );

  const pendingRequestCount = useMemo(
    () => requests.filter((r) => r.status === 'pending').length,
    [requests]
  );

  const markSeen = useCallback(() => {
    if (!mobile) return;
    const newest = notifications.reduce((max, n) => (n.created_at > max ? n.created_at : max), '');
    const now = new Date().toISOString();
    const value = newest > now ? newest : now; // protects against a phone clock that is ahead
    setLastSeen(value);
    try {
      localStorage.setItem(seenKey(mobile), value);
    } catch {
      /* ignore blocked storage */
    }
  }, [mobile, notifications]);

  const describe = (request) => ({
    amount: formatINR(request.snapshot?.amount || 0),
    category: catLabel(request.snapshot?.category, request.snapshot?.category_en),
    name: request.requester_name || request.requester_mobile || t('notif.someone')
  });

  const handleApprove = async (request) => {
    const ok = await confirmAction({
      title: t('delreq.approveTitle'),
      html: t('delreq.approveHtml', describe(request)),
      confirmText: t('notif.approve')
    });
    if (!ok) return;
    setBusyId(request.id);
    try {
      const res = await approveDeleteRequest(request);
      if (res?.alreadyHandled) alertBox('info', t('delreq.alreadyHandledTitle'), t('delreq.alreadyHandled'));
      else toast('success', t('delreq.approved'), 2000);
    } catch (err) {
      alertBox('error', t('common.error'), t('delreq.actionFailed'));
    } finally {
      setBusyId(null);
      refresh();
    }
  };

  const handleReject = async (request) => {
    setBusyId(request.id);
    try {
      const res = await rejectDeleteRequest(request);
      if (res?.alreadyHandled) alertBox('info', t('delreq.alreadyHandledTitle'), t('delreq.alreadyHandled'));
      else toast('success', t('delreq.rejected'), 1800);
    } catch (err) {
      alertBox('error', t('common.error'), t('delreq.actionFailed'));
    } finally {
      setBusyId(null);
      refresh();
    }
  };

  const value = {
    notifications,
    requests,
    requestById,
    unreadCount,
    pendingRequestCount,
    lastSeen,
    isNewSince,
    markSeen,
    refresh,
    busyId,
    handleApprove,
    handleReject
  };

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};
