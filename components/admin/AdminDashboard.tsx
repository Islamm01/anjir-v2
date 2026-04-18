// components/admin/AdminDashboard.tsx
"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw, CheckCircle, XCircle, Loader2, UserCheck,
  LayoutDashboard, Package, Truck, CreditCard, Clock,
} from "lucide-react";
import { adminConfirmPayment, adminCancelOrder, adminAssignCourier } from "@/lib/actions/orders";
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR, formatTJS, timeAgo, PAYMENT_METHOD_LABEL } from "@/lib/utils";

type Tab = "orders" | "payments" | "couriers";

const KANBAN_COLS = [
  { key: "NEW_ORDER",        label: "Новые",            urgentAfterMins: 5  },
  { key: "STORE_CONFIRMED",  label: "Подтверждены",     urgentAfterMins: 20 },
  { key: "PREPARING",        label: "Готовятся",        urgentAfterMins: 30 },
  { key: "READY_FOR_PICKUP", label: "Ждут курьера",     urgentAfterMins: 10 },
  { key: "COURIER_ASSIGNED", label: "Курьер едет",      urgentAfterMins: 25 },
  { key: "PICKED_UP",        label: "В пути",           urgentAfterMins: 40 },
];

export default function AdminDashboard({
  activeOrders, pendingPayments, onlineCouriers,
  todayOrders, todayRevenue, totalCouriers, onlineCourierCount, activeDeliveries,
}: any) {
  const router                          = useRouter();
  const [tab, setTab]                   = useState<Tab>("orders");
  const [isPending, startTransition]    = useTransition();
  const [assigningOrderId, setAssigning] = useState<string | null>(null);
  const [cancelId, setCancelId]         = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [now, setNow]                   = useState(Date.now());

  // Tick every 30s so elapsed times update + auto-refresh data
  useEffect(() => {
    const tick = setInterval(() => {
      setNow(Date.now());
      router.refresh();
    }, 30000);
    return () => clearInterval(tick);
  }, [router]);

  function act(fn: () => Promise<any>, onDone?: () => void) {
    startTransition(async () => {
      const result = await fn();
      if (result?.error) alert(result.error);
      else { router.refresh(); onDone?.(); }
    });
  }

  function elapsedMins(createdAt: string) {
    return Math.floor((now - new Date(createdAt).getTime()) / 60000);
  }

  const byStatus = (status: string) => activeOrders.filter((o: any) => o.status === status);

  // ── Metric bar ──────────────────────────────────────────────────────────
  const metrics = [
    { label: "Заказов сегодня",  value: todayOrders,             icon: LayoutDashboard },
    { label: "Выручка",          value: formatTJS(todayRevenue),  icon: CreditCard      },
    { label: "Курьеры онлайн",   value: `${onlineCourierCount}/${totalCouriers}`, icon: Truck },
    { label: "Ждут оплаты",      value: pendingPayments.length,  icon: CreditCard, urgent: pendingPayments.length > 0 },
  ];

  return (
    <div className="min-h-screen bg-[#f0ede8] flex flex-col">

      {/* ── Header ── */}
      <header className="bg-[#0d2e1a] text-white px-5 py-3.5 shrink-0">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-[17px] font-black tracking-tight">anjir — Оператор</h1>
            <p className="text-[11px] text-white/40">Центр управления доставкой · Худжанд</p>
          </div>

          {/* Metric pills */}
          <div className="hidden lg:flex items-center gap-3">
            {metrics.map(m => (
              <div key={m.label} className={`px-3 py-1.5 rounded-xl text-[12px] ${
                m.urgent ? "bg-amber-500 text-white" : "bg-white/10 text-white"
              }`}>
                <span className="opacity-60 mr-1">{m.label}:</span>
                <span className="font-black">{m.value}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {pendingPayments.length > 0 && (
              <button onClick={() => setTab("payments")}
                className="px-3 py-1.5 bg-amber-500 text-white text-[12px] font-black rounded-xl animate-pulse hover:bg-amber-600 transition-colors">
                {pendingPayments.length} оплат ждут
              </button>
            )}
            <button onClick={() => router.refresh()}
              className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
              <RefreshCw size={14} className={isPending ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Tab bar ── */}
      <div className="bg-white border-b border-black/8 px-5 shrink-0">
        <div className="max-w-[1400px] mx-auto flex gap-1">
          {([
            { key: "orders",   label: "Заказы",     count: activeOrders.length },
            { key: "payments", label: "Оплаты",     count: pendingPayments.length, urgent: pendingPayments.length > 0 },
            { key: "couriers", label: "Курьеры",    count: onlineCourierCount },
          ] as { key: Tab; label: string; count: number; urgent?: boolean }[]).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-3 text-[13px] font-bold border-b-2 transition-colors ${
                tab === t.key
                  ? "border-[#1a472a] text-[#1a472a]"
                  : "border-transparent text-black/40 hover:text-black"
              }`}>
              {t.label}
              {t.count > 0 && (
                <span className={`ml-1.5 text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  t.urgent ? "bg-amber-500 text-white" : "bg-black/8 text-black/50"
                }`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Cancel modal ── */}
      {cancelId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-2xl">
            <h3 className="text-[16px] font-black mb-3">Отменить заказ</h3>
            <textarea value={cancelReason} onChange={e => setCancelReason(e.target.value)}
              placeholder="Причина отмены..." rows={3}
              className="w-full border border-black/15 rounded-xl px-3 py-2.5 text-[14px] outline-none resize-none mb-4 focus:border-red-300"
            />
            <div className="flex gap-2">
              <button onClick={() => { setCancelId(null); setCancelReason(""); }}
                className="flex-1 py-2.5 border border-black/15 rounded-xl text-[13px] hover:bg-black/4 transition-colors">
                Закрыть
              </button>
              <button
                onClick={() => act(() => adminCancelOrder(cancelId, cancelReason || "Отменено оператором"), () => { setCancelId(null); setCancelReason(""); })}
                disabled={isPending}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-[13px] font-black hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5">
                {isPending && <Loader2 size={12} className="animate-spin" />}
                Отменить заказ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Assign courier modal ── */}
      {assigningOrderId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-2xl">
            <h3 className="text-[16px] font-black mb-1">Назначить курьера</h3>
            <p className="text-[12px] text-black/40 mb-4">Выберите доступного курьера</p>
            <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
              {onlineCouriers.length === 0 && (
                <p className="text-[13px] text-black/40 text-center py-6">Нет онлайн-курьеров</p>
              )}
              {onlineCouriers.map((c: any) => (
                <button key={c.id}
                  onClick={() => act(() => adminAssignCourier(assigningOrderId, c.id), () => setAssigning(null))}
                  disabled={isPending}
                  className="w-full flex items-center gap-3 px-3 py-2.5 border border-black/10 rounded-xl hover:bg-[#1a472a]/5 hover:border-[#1a472a]/30 transition-all text-left disabled:opacity-50">
                  <div className="w-9 h-9 bg-[#1a472a] rounded-full flex items-center justify-center shrink-0">
                    <span className="text-white text-[13px] font-black">{(c.user.name ?? "К")[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold truncate">{c.user.name ?? "Курьер"}</p>
                    <p className="text-[11px] text-black/40">{c.user.phone}</p>
                  </div>
                  <span className="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-bold">онлайн</span>
                </button>
              ))}
            </div>
            <button onClick={() => setAssigning(null)}
              className="w-full py-2.5 border border-black/15 rounded-xl text-[13px] hover:bg-black/4 transition-colors">
              Отмена
            </button>
          </div>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-[1400px] mx-auto p-4">

          {/* ORDERS TAB — kanban board */}
          {tab === "orders" && (
            <div className="flex gap-3 overflow-x-auto pb-4 min-h-[500px]">
              {KANBAN_COLS.map(col => {
                const colOrders = byStatus(col.key);
                const colors    = ORDER_STATUS_COLOR[col.key] ?? { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" };
                return (
                  <div key={col.key} className="w-64 shrink-0 flex flex-col">
                    {/* Column header */}
                    <div className={`flex items-center justify-between px-3 py-2 rounded-xl border mb-2.5 ${colors.bg} ${colors.border}`}>
                      <span className={`text-[11px] font-black uppercase tracking-wider ${colors.text}`}>{col.label}</span>
                      <span className={`text-[12px] font-black ${colors.text}`}>{colOrders.length}</span>
                    </div>

                    {/* Cards */}
                    <div className="space-y-2 flex-1">
                      {colOrders.map((order: any) => {
                        const elapsed = elapsedMins(order.createdAt);
                        const urgent  = elapsed >= col.urgentAfterMins;
                        return (
                          <div key={order.id} className={`bg-white rounded-xl border overflow-hidden transition-shadow hover:shadow-md ${
                            urgent ? "border-red-200 ring-1 ring-red-100" : "border-black/6"
                          }`}>
                            {/* Card header */}
                            <div className="px-3 py-2 border-b border-black/5 flex items-center justify-between">
                              <span className="text-[11px] font-black font-mono text-black">{order.orderNumber}</span>
                              <span className={`text-[10px] font-bold ${urgent ? "text-red-600" : "text-black/30"}`}>
                                {elapsed}м
                              </span>
                            </div>

                            {/* Info */}
                            <div className="px-3 py-2 border-b border-black/5 space-y-0.5">
                              <p className="text-[11px] font-bold text-black/70 truncate">{order.store?.name}</p>
                              <p className="text-[10px] text-black/40 truncate">{order.deliveryAddress}</p>
                              <p className="text-[10px] text-black/35 truncate">
                                {order.items?.slice(0, 2).map((i: any) => i.productName).join(", ")}
                                {(order.items?.length ?? 0) > 2 ? ` +${order.items.length - 2}` : ""}
                              </p>
                              {order.courier?.user && (
                                <p className="text-[10px] text-[#1a472a] font-semibold">
                                  🚗 {order.courier.user.name}
                                </p>
                              )}
                            </div>

                            {/* Footer */}
                            <div className="px-3 py-2 flex items-center justify-between gap-1.5">
                              <span className="text-[12px] font-black text-[#1a472a]">{formatTJS(Number(order.totalAmount))}</span>
                              <div className="flex items-center gap-1">
                                {col.key === "READY_FOR_PICKUP" && (
                                  <button onClick={() => setAssigning(order.id)}
                                    className="flex items-center gap-0.5 px-2 py-1 bg-[#1a472a]/10 text-[#1a472a] text-[10px] font-black rounded-lg hover:bg-[#1a472a]/20 transition-colors">
                                    <UserCheck size={10} /> Курьер
                                  </button>
                                )}
                                {!["PICKED_UP"].includes(col.key) && (
                                  <button onClick={() => { setCancelId(order.id); setCancelReason(""); }}
                                    className="p-1 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors">
                                    <XCircle size={12} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {colOrders.length === 0 && (
                        <div className="border-2 border-dashed border-black/8 rounded-xl py-8 text-center">
                          <p className="text-[11px] text-black/20">Пусто</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* PAYMENTS TAB */}
          {tab === "payments" && (
            <div className="max-w-2xl">
              <p className="text-[12px] text-black/40 mb-4">
                QR и переводы требуют ручного подтверждения. Проверьте платёж в банковском приложении и подтвердите.
              </p>

              {pendingPayments.length === 0 && (
                <div className="bg-white rounded-2xl border border-black/5 py-16 text-center">
                  <CheckCircle size={32} className="mx-auto text-green-500 mb-3" />
                  <p className="text-[15px] text-black/40">Все платежи подтверждены</p>
                </div>
              )}

              <div className="space-y-3">
                {pendingPayments.map((p: any) => {
                  const isOrder    = !!p.order;
                  const ref        = isOrder ? p.order.orderNumber : p.delivery?.deliveryNumber;
                  const amount     = isOrder ? Number(p.order.totalAmount) : Number(p.delivery?.price ?? 0);
                  const targetId   = p.order?.id;
                  return (
                    <div key={p.id} className="bg-white rounded-2xl border border-amber-200 ring-1 ring-amber-100 overflow-hidden">
                      <div className="flex items-center justify-between px-5 py-3 border-b border-black/5">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-black font-mono">{ref}</span>
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                            {PAYMENT_METHOD_LABEL[p.method]}
                          </span>
                        </div>
                        <span className="text-[15px] font-black text-[#1a472a]">{formatTJS(amount)}</span>
                      </div>
                      {p.reference && (
                        <div className="px-5 py-2.5 border-b border-black/5">
                          <p className="text-[11px] text-black/40">Референс перевода:</p>
                          <p className="text-[13px] font-mono font-bold">{p.reference}</p>
                        </div>
                      )}
                      <div className="px-5 py-3 flex gap-2.5">
                        <button
                          onClick={() => targetId && act(() => adminConfirmPayment(targetId))}
                          disabled={isPending || !targetId}
                          className="flex-1 py-2.5 bg-green-600 text-white text-[13px] font-black rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5">
                          {isPending ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={14} />}
                          Подтвердить оплату
                        </button>
                        <button
                          onClick={() => { setCancelId(targetId ?? ""); }}
                          className="px-4 py-2.5 border border-red-200 text-red-600 text-[13px] font-bold rounded-xl hover:bg-red-50 transition-colors">
                          Отклонить
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* COURIERS TAB */}
          {tab === "couriers" && (
            <div className="max-w-2xl">
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-white rounded-2xl border border-black/5 p-4 text-center">
                  <p className="text-[28px] font-black text-green-600">{onlineCourierCount}</p>
                  <p className="text-[12px] text-black/40">Онлайн сейчас</p>
                </div>
                <div className="bg-white rounded-2xl border border-black/5 p-4 text-center">
                  <p className="text-[28px] font-black text-black">{totalCouriers}</p>
                  <p className="text-[12px] text-black/40">Всего курьеров</p>
                </div>
              </div>

              <div className="space-y-2.5">
                {onlineCouriers.map((c: any) => (
                  <div key={c.id} className="bg-white rounded-xl border border-black/5 px-4 py-3.5 flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-black truncate">{c.user.name}</p>
                      <p className="text-[12px] text-black/40">{c.user.phone}</p>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 bg-green-50 text-green-800 rounded-full">
                      Онлайн
                    </span>
                  </div>
                ))}
                {onlineCouriers.length === 0 && (
                  <div className="bg-white rounded-2xl border border-black/5 py-12 text-center">
                    <Truck size={28} className="mx-auto text-black/15 mb-3" />
                    <p className="text-[14px] text-black/30">Нет онлайн-курьеров</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
