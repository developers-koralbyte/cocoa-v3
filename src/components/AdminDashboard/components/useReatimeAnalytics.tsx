import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  limit,
  orderBy,
  onSnapshot,
  Timestamp,
  DocumentData,
  startAfter,
  getDocs,
  Firestore,
} from 'firebase/firestore';
import { db } from '../../../utils/firebase';

/** ------------------------------------------------------------------ */
/** Firestore document shapes                                          */
/** ------------------------------------------------------------------ */
interface PresenceDoc { state: 'online' | 'offline'; }
interface VendorDoc { /* id comes from doc.id */ }
interface ActivityDoc {
  type:
    | 'user_registered'
    | 'vendor_joined'
    | 'product_added'
    | 'service_added'
    | 'order_placed';
  message: string;
  timestamp: Timestamp;
  userName?: string;
}
interface NotificationDoc {
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Timestamp;
  read?: boolean;
}

/** ------------------------------------------------------------------ */
/** Hook return types                                                  */
/** ------------------------------------------------------------------ */
export interface ActivityItem
  extends Omit<ActivityDoc, 'timestamp'> {
  id: string;
  timestamp: Date;
}
export interface NotificationItem
  extends Omit<NotificationDoc, 'timestamp' | 'read'> {
  id: string;
  timestamp: Date;
  read: boolean;
}
interface RealtimeData {
  onlineUsers: number;
  activeVendors: number;
  recentActivity: ActivityItem[];
  systemHealth: 'healthy' | 'warning' | 'critical';
  notifications: NotificationItem[];
}

/* Helper to convert Timestamp → Date */
const toDate = (t: Timestamp | Date) =>
  t instanceof Date ? t : t.toDate();

/* --------------------------------------------------------------- */
/* Hook                                                            */
/* --------------------------------------------------------------- */
export const useRealtimeAnalytics = () => {
  const [realtimeData, setRealtimeData] = useState<RealtimeData>({
    onlineUsers: 0,
    activeVendors: 0,
    recentActivity: [],
    systemHealth: 'healthy',
    notifications: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* -------- mark notification read & clear helpers -------------- */
  const markNotificationAsRead = useCallback((id: string) => {
    setRealtimeData((p) => ({
      ...p,
      notifications: p.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setRealtimeData((p) => ({ ...p, notifications: [] }));
  }, []);

  /* ------------------- listeners -------------------------------- */
  useEffect(() => {
    try {
      /* Presence: count docs where state=="online" */
      const presenceUnsub = onSnapshot(
        query(collection(db, 'presence'), where('state', '==', 'online')),
        (snap) =>
          setRealtimeData((p) => ({ ...p, onlineUsers: snap.size }))
      );

      /* Vendors: just the count */
      const vendorUnsub = onSnapshot(
        collection(db, 'Vendors'),
        (snap) =>
          setRealtimeData((p) => ({ ...p, activeVendors: snap.size }))
      );

      /* Activity feed – latest 10 docs ordered by timestamp desc */
      const activityUnsub = onSnapshot(
        query(
          collection(db, 'activities'),
          orderBy('timestamp', 'desc'),
          limit(10)
        ),
        (snap) => {
          const recentActivity: ActivityItem[] = snap.docs.map((d) => {
            const data = d.data() as ActivityDoc;
            return {
              id: d.id,
              ...data,
              timestamp: toDate(data.timestamp),
            };
          });
          setRealtimeData((p) => ({ ...p, recentActivity }));
        }
      );

      /* Notifications – latest 5 docs */
      const notifUnsub = onSnapshot(
        query(
          collection(db, 'notifications'),
          orderBy('timestamp', 'desc'),
          limit(5)
        ),
        (snap) => {
          const notifications: NotificationItem[] = snap.docs.map((d) => {
            const data = d.data() as NotificationDoc;
            return {
              id: d.id,
              ...data,
              read: !!data.read,
              timestamp: toDate(data.timestamp),
            };
          });
          setRealtimeData((p) => ({ ...p, notifications }));
        }
      );

      /* System health – optional: listen once every 5 min via Cloud Function push
         For now we mark healthy if errorRate < 0.05 in a stats doc
      */
      const healthUnsub = onSnapshot(
        doc(db, 'system_stats', 'current'),
        (docSnap) => {
          if (!docSnap.exists()) return;
          const { errorRate } = docSnap.data() as { errorRate: number };
          const state =
            errorRate < 0.02
              ? 'healthy'
              : errorRate < 0.05
              ? 'warning'
              : 'critical';
          setRealtimeData((p) => ({ ...p, systemHealth: state }));
        }
      );

      setLoading(false);
      return () => {
        presenceUnsub();
        vendorUnsub();
        activityUnsub();
        notifUnsub();
        healthUnsub();
      };
    } catch (e) {
      console.error(e);
      setError('Failed to establish real-time listeners.');
      setLoading(false);
    }
  }, []);

  return {
    realtimeData,
    loading,
    error,
    markNotificationAsRead,
    clearAllNotifications,
  };
};
function doc(db: Firestore, arg1: string, arg2: string): import("@firebase/firestore").DocumentReference<unknown, DocumentData> {
    throw new Error('Function not implemented.');
}

