"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useProfile } from "@/components/profile/ProfileProvider";
import type { AppNotification } from "@/lib/notifications/types";

interface NotificationContextValue {
  notifications: AppNotification[];
  unread: number;
  ready: boolean;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);
const VAPID_STORAGE_KEY = "lost-found-vapid-key";
const POLL_MS = 15_000;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

function alertForNewNotifications(
  incoming: AppNotification[],
  knownIds: Set<string>
): void {
  for (const notification of incoming) {
    if (knownIds.has(notification.id)) continue;
    knownIds.add(notification.id);
  }
}

async function registerPushSubscription(): Promise<void> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  const keyRes = await fetch("/api/notifications/push");
  const keyData = await keyRes.json();
  if (!keyData.publicKey) return;

  const registration = await navigator.serviceWorker.register("/sw.js", {
    updateViaCache: "none",
  });
  await registration.update();
  await navigator.serviceWorker.ready;

  const previousKey = localStorage.getItem(VAPID_STORAGE_KEY);
  let subscription = await registration.pushManager.getSubscription();

  if (subscription && previousKey && previousKey !== keyData.publicKey) {
    await subscription.unsubscribe();
    subscription = null;
  }

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        keyData.publicKey
      ) as BufferSource,
    });
  }

  localStorage.setItem(VAPID_STORAGE_KEY, keyData.publicKey);

  await fetch("/api/notifications/push", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription: subscription.toJSON() }),
  });
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { profile, ready: profileReady, isProfileComplete } = useProfile();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [ready, setReady] = useState(false);
  const knownIds = useRef(new Set<string>());
  const initialLoadDone = useRef(false);

  const applyNotifications = useCallback(
    (items: AppNotification[], unreadCount: number, alertNew = false) => {
      if (alertNew) {
        alertForNewNotifications(items, knownIds.current);
      } else {
        for (const item of items) {
          knownIds.current.add(item.id);
        }
      }

      setNotifications((prev) => {
        const map = new Map<string, AppNotification>();
        for (const item of prev) map.set(item.id, item);
        for (const item of items) map.set(item.id, item);
        return [...map.values()]
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 50);
      });
      setUnread(unreadCount);
    },
    []
  );

  const refresh = useCallback(async () => {
    if (!profile) {
      knownIds.current.clear();
      initialLoadDone.current = false;
      setNotifications([]);
      setUnread(0);
      return;
    }

    const res = await fetch("/api/notifications");
    if (!res.ok) return;
    const data = await res.json();
    const items = (data.notifications ?? []) as AppNotification[];
    const shouldAlert = initialLoadDone.current;
    applyNotifications(items, data.unread ?? 0, shouldAlert);
    initialLoadDone.current = true;
  }, [profile, applyNotifications]);

  const markRead = useCallback(async (id: string) => {
    const res = await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: id }),
    });
    if (!res.ok) return;
    const data = await res.json();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnread(data.unread ?? 0);
  }, []);

  const markAllRead = useCallback(async () => {
    const res = await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    if (!res.ok) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  }, []);

  useEffect(() => {
    if (!profileReady) return;
    refresh().finally(() => setReady(true));
  }, [profileReady, profile, refresh]);

  useEffect(() => {
    if (!profile || !isProfileComplete) return;

    registerPushSubscription().catch(() => {
      /* retry on next mount / poll */
    });
  }, [profile, isProfileComplete]);

  useEffect(() => {
    if (!profile || !isProfileComplete) return;

    const poll = window.setInterval(() => {
      refresh();
    }, POLL_MS);

    return () => window.clearInterval(poll);
  }, [profile, isProfileComplete, refresh]);

  useEffect(() => {
    if (!profile || !isProfileComplete) return;

    const source = new EventSource("/api/notifications/stream");

    source.addEventListener("notifications", (event) => {
      try {
        const data = JSON.parse(event.data) as {
          notifications: AppNotification[];
          unread: number;
        };
        if (data.notifications?.length) {
          applyNotifications(data.notifications, data.unread ?? 0, true);
        } else if (typeof data.unread === "number") {
          setUnread(data.unread);
        }
      } catch {
        /* ignore parse errors */
      }
    });

    source.onerror = () => {
      source.close();
    };

    return () => source.close();
  }, [profile, isProfileComplete, applyNotifications]);

  return (
    <NotificationContext.Provider
      value={{ notifications, unread, ready, markRead, markAllRead, refresh }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return ctx;
}
