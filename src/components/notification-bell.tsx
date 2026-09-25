"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { markAllReadAction } from "@/app/dashboard/notifications-actions";
import type { Notification } from "@/lib/notifications";

function NotificationItem({ item }: { item: Notification }) {
  return (
    <span className="block">
      <span className="flex items-center gap-2">
        {item.read ? null : (
          <span className="h-1.5 w-1.5 rounded-full bg-signal-teal" />
        )}
        <span className="text-sm font-medium text-ink">{item.title}</span>
      </span>
      {item.body ? (
        <span className="mt-1 block text-xs text-muted">{item.body}</span>
      ) : null}
      <span className="mt-1 block font-mono text-[10px] uppercase tracking-widest text-muted">
        {new Date(item.createdAt).toISOString().slice(0, 16).replace("T", " ")}
      </span>
    </span>
  );
}

export function NotificationBell({
  initialNotifications,
  initialUnread,
}: {
  initialNotifications: Notification[];
  initialUnread: number;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>(initialNotifications);
  const [unread, setUnread] = useState(initialUnread);
  const [pending, startTransition] = useTransition();

  function handleMarkAllRead(): void {
    startTransition(async () => {
      await markAllReadAction();
      setItems((current) =>
        current.map((item) => ({ ...item, read: true })),
      );
      setUnread(0);
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-md border border-white/20 text-white hover:bg-white/5"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-signal-teal px-1 font-mono text-[10px] font-semibold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-80 rounded-xl border border-hairline bg-white p-2 text-ink shadow-lg">
          <div className="flex items-center justify-between px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">
              Notifications
            </p>
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={pending || unread === 0}
              className="text-xs font-medium text-signal-teal hover:underline disabled:cursor-not-allowed disabled:text-muted disabled:no-underline"
            >
              Mark all read
            </button>
          </div>

          {items.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted">
              No notifications yet.
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {items.map((item) => (
                <li key={item.id}>
                  {item.link ? (
                    <Link
                      href={item.link}
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-3 py-2 hover:bg-cloud"
                    >
                      <NotificationItem item={item} />
                    </Link>
                  ) : (
                    <div className="rounded-lg px-3 py-2">
                      <NotificationItem item={item} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
