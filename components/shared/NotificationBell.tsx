// components/shared/NotificationBell.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, X, CheckCheck } from "lucide-react";
import { timeAgo } from "@/lib/utils";

interface Notification {
  id: string; type: string; title: string;
  body: string; isRead: boolean; createdAt: string;
  data?: Record<string, string>;
}

const TYPE_ICON: Record<string, string> = {
  NEW_ORDER:       "🛒",
  ORDER_CONFIRMED: "✅",
  ORDER_READY:     "📦",
  ORDER_ASSIGNED:  "🚗",
  ORDER_PICKED_UP: "🚗",
  ORDER_DELIVERED: "🎉",
  PAYMENT_CONFIRM: "💳",
  NEW_DELIVERY:    "📬",
  SYSTEM:          "ℹ️",
};

export default function NotificationBell() {
  const [open, setOpen]                   = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread]               = useState(0);
  const panelRef                          = useRef<HTMLDivElement>(null);

  async function fetchNotifications() {
    try {
      const res  = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setUnread(data.unread ?? 0);
    } catch {}
  }

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH" });
    setUnread(0);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }

  useEffect(() => {
    fetchNotifications();
    // Poll every 20 seconds
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Play sound on new notifications
  const prevUnread = useRef(0);
  useEffect(() => {
    if (unread > prevUnread.current) {
      try {
        const ctx  = new AudioContext();
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.value = 660;
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3);
      } catch {}
    }
    prevUnread.current = unread;
  }, [unread]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => { setOpen(o => !o); if (!open && unread > 0) markAllRead(); }}
        className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
      >
        <Bell size={18} className="text-white" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-[#1a472a]">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-black/8 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-black/5">
            <h3 className="text-[14px] font-black text-black">Уведомления</h3>
            <div className="flex items-center gap-2">
              {notifications.some(n => !n.isRead) && (
                <button onClick={markAllRead}
                  className="flex items-center gap-1 text-[11px] text-[#1a472a] font-semibold hover:underline">
                  <CheckCheck size={12} /> Прочитать все
                </button>
              )}
              <button onClick={() => setOpen(false)}
                className="w-6 h-6 bg-black/5 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors">
                <X size={12} />
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div className="max-h-96 overflow-y-auto divide-y divide-black/5">
            {notifications.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-[14px] text-black/30">Нет уведомлений</p>
              </div>
            )}
            {notifications.map(n => (
              <div key={n.id} className={`px-4 py-3 hover:bg-black/2 transition-colors ${!n.isRead ? "bg-[#1a472a]/3" : ""}`}>
                <div className="flex items-start gap-3">
                  <span className="text-[18px] mt-0.5 shrink-0" style={{ fontSize: 16 }}>
                    {TYPE_ICON[n.type] ?? "🔔"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-[13px] leading-tight ${!n.isRead ? "font-bold text-black" : "font-semibold text-black/70"}`}>
                        {n.title}
                      </p>
                      {!n.isRead && <div className="w-2 h-2 bg-[#1a472a] rounded-full shrink-0 mt-1" />}
                    </div>
                    <p className="text-[12px] text-black/45 mt-0.5 leading-snug">{n.body}</p>
                    <p className="text-[10px] text-black/25 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
