"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNotifications } from "./NotificationProvider";
import type { AppNotification } from "@/lib/notifications/types";

type FilterTab = "all" | "unread" | "read";

function formatTime(iso: string): string {
  const date = new Date(iso);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function NotificationItem({
  notification,
  onRead,
  onNavigate,
}: {
  notification: AppNotification;
  onRead: (id: string) => void;
  onNavigate: () => void;
}) {
  const href = notification.link || "/posts";
  const isUnread = !notification.read;

  return (
    <Link
      href={href}
      onClick={() => {
        if (isUnread) onRead(notification.id);
        onNavigate();
      }}
      className={`group block border-b border-line px-4 py-3 transition-colors hover:bg-surface ${
        isUnread ? "bg-card" : "bg-surface/40"
      }`}
    >
      <div className="flex items-start gap-2.5">
        <span
          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
            isUnread ? "bg-ink" : "bg-line"
          }`}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p
              className={`text-sm leading-snug ${
                isUnread ? "font-semibold text-ink" : "font-medium text-mute"
              }`}
            >
              {notification.title}
            </p>
            <span
              className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                isUnread
                  ? "bg-ink text-paper"
                  : "border border-line bg-paper text-subtle"
              }`}
            >
              {isUnread ? "Unread" : "Read"}
            </span>
          </div>
          <p
            className={`mt-0.5 text-xs line-clamp-2 ${
              isUnread ? "text-body" : "text-subtle"
            }`}
          >
            {notification.body}
          </p>
          <p className="mt-1 text-[10px] text-subtle">{formatTime(notification.createdAt)}</p>
        </div>
      </div>
    </Link>
  );
}

function FilterButton({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
        active
          ? "bg-ink text-paper"
          : "text-mute hover:bg-surface hover:text-ink"
      }`}
    >
      {label}
      {count > 0 && (
        <span className={active ? "text-paper/80" : "text-subtle"}> ({count})</span>
      )}
    </button>
  );
}

export function NotificationBell() {
  const { notifications, unread, ready, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<FilterTab>("all");
  const panelRef = useRef<HTMLDivElement>(null);

  const readCount = useMemo(
    () => notifications.filter((n) => n.read).length,
    [notifications]
  );

  const filtered = useMemo(() => {
    if (filter === "unread") return notifications.filter((n) => !n.read);
    if (filter === "read") return notifications.filter((n) => n.read);
    return notifications;
  }, [notifications, filter]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  if (!ready) return null;

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full p-2 transition-opacity hover:opacity-80"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        aria-expanded={open}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          className="h-5 w-5 text-ink"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-semibold text-paper">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line bg-paper shadow-lg">
          <div className="border-b border-line px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <span className="text-sm font-semibold text-ink">Notifications</span>
                <p className="mt-0.5 text-[11px] text-mute">
                  {unread} unread · {readCount} read
                </p>
              </div>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={() => markAllRead()}
                  className="shrink-0 text-xs text-mute transition-colors hover:text-ink"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-1">
              <FilterButton
                active={filter === "all"}
                label="All"
                count={notifications.length}
                onClick={() => setFilter("all")}
              />
              <FilterButton
                active={filter === "unread"}
                label="Unread"
                count={unread}
                onClick={() => setFilter("unread")}
              />
              <FilterButton
                active={filter === "read"}
                label="Read"
                count={readCount}
                onClick={() => setFilter("read")}
              />
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-mute">
                {filter === "unread"
                  ? "No unread notifications."
                  : filter === "read"
                    ? "No read notifications yet."
                    : "No notifications yet."}
              </p>
            ) : (
              filtered.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onRead={markRead}
                  onNavigate={() => setOpen(false)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
