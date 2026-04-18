"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Phone, Package, Store, Loader2, RefreshCw, ToggleLeft, ToggleRight, CheckCircle, Truck } from "lucide-react";
import { courierAcceptOrder, courierPickedUp, courierDelivered } from "@/lib/actions/orders";
import { courierAcceptDelivery, courierDeliveryPickedUp, courierDeliveryDone } from "@/lib/actions/deliveries";
import { toggleCourierOnline } from "@/lib/actions/courier";
import { formatTJS } from "@/lib/utils";

export default function CourierDashboard({ courierId, isOnline, courierName, availableOrders, availableDeliveries, activeOrder, activeDelivery, todayCount }: any) {
  const router = useRouter();
  const [online, setOnline] = useState(isOnline);
  const [isPending, start]  = useTransition();

  function act(fn:()=>Promise<any>) {
    start(async()=>{ const r=await fn(); if(r?.error) alert(r.error); else router.refresh(); });
  }

  function toggleOnline() {
    const next = !online; setOnline(next);
    act(()=>toggleCourierOnline(next));
  }

  const hasActive = activeOrder || activeDelivery;

  return (
    <div className="min-h-screen bg-[#f4f2ed]">
      <header className="bg-[#1a472a] text-white px-5 pt-10 pb-5">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div><h1 className="text-[20px] font-black">{courierName}</h1><p className="text-[12px] text-white/50">Доставлено сегодня: {todayCount}</p></div>
            <button onClick={()=>router.refresh()} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"><RefreshCw size={14} className={isPending?"animate-spin":""}/></button>
          </div>
          <button onClick={toggleOnline} className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border transition-all ${online?"bg-green-500/20 border-green-400/40":"bg-white/10 border-white/20"}`}>
            <div className="flex items-center gap-2.5">
              <div className={`w-3 h-3 rounded-full ${online?"bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]":"bg-white/30"}`}/>
              <span className="text-[14px] font-bold">{online?"Онлайн — принимаю заказы":"Оффлайн"}</span>
            </div>
            {online?<ToggleRight size={24} className="text-green-400"/>:<ToggleLeft size={24} className="text-white/40"/>}
          </button>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-5 space-y-5">
        {/* Active marketplace order */}
        {activeOrder && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-black/30 mb-2.5">Текущий заказ</p>
            <div className="bg-white rounded-2xl border-2 border-orange-300 ring-2 ring-orange-100 overflow-hidden">
              <div className="bg-orange-50 px-4 py-2.5 border-b border-orange-100"><p className="text-[11px] font-black text-orange-700 uppercase tracking-wider">Активная доставка</p></div>
              <div className="px-4 py-3 border-b border-black/5 flex justify-between"><span className="text-[13px] font-black font-mono">{activeOrder.orderNumber}</span><span className="text-[13px] font-black text-[#1a472a]">{formatTJS(Number(activeOrder.totalAmount))}</span></div>
              <div className="px-4 py-3 border-b border-black/5">
                <div className="flex items-start gap-2.5"><div className="w-6 h-6 bg-[#1a472a] rounded-full flex items-center justify-center shrink-0 mt-0.5"><Store size={12} className="text-white"/></div>
                  <div><p className="text-[10px] font-bold text-black/30 uppercase tracking-wider">Забрать из магазина</p><p className="text-[13px] font-bold">{activeOrder.store.name}</p><p className="text-[11px] text-black/45">{activeOrder.store.address}</p></div>
                </div>
              </div>
              <div className="px-4 py-3 border-b border-black/5">
                <div className="flex items-start gap-2.5"><div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shrink-0 mt-0.5"><MapPin size={12} className="text-white"/></div>
                  <div><p className="text-[10px] font-bold text-black/30 uppercase tracking-wider">Доставить клиенту</p><p className="text-[13px] font-bold">{activeOrder.deliveryAddress}</p></div>
                </div>
              </div>
              <div className="px-4 py-3 border-b border-black/5"><p className="text-[12px] text-black/50">Оплата: <strong className="text-black">{activeOrder.paymentMethod==="CASH"?"Наличными при доставке":activeOrder.paymentMethod==="QR"?"QR-код (покажите клиенту)":"Перевод (уже оплачен)"}</strong></p></div>
              <div className="px-4 py-3">
                {activeOrder.status==="COURIER_ASSIGNED"&&(
                  <button onClick={()=>act(()=>courierPickedUp(activeOrder.id))} disabled={isPending} className="w-full py-3 bg-orange-500 text-white text-[14px] font-black rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                    {isPending?<Loader2 size={15} className="animate-spin"/>:<Package size={16}/>}Забрал из магазина
                  </button>
                )}
                {activeOrder.status==="PICKED_UP"&&(
                  <button onClick={()=>act(()=>courierDelivered(activeOrder.id))} disabled={isPending} className="w-full py-3 bg-green-600 text-white text-[14px] font-black rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                    {isPending?<Loader2 size={15} className="animate-spin"/>:<CheckCircle size={16}/>}Доставил клиенту
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Active package delivery */}
        {activeDelivery && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-black/30 mb-2.5">Текущая посылка</p>
            <div className="bg-white rounded-2xl border-2 border-amber-300 overflow-hidden">
              <div className="bg-amber-50 px-4 py-2.5 border-b border-amber-100"><p className="text-[11px] font-black text-amber-700 uppercase tracking-wider">Активная посылка</p></div>
              <div className="px-4 py-3 space-y-2.5">
                <div><p className="text-[10px] text-black/30 font-bold uppercase tracking-wider mb-1">Забрать</p><p className="text-[13px] font-bold">{activeDelivery.pickupAddress}</p>{activeDelivery.pickupName&&<p className="text-[11px] text-black/45">{activeDelivery.pickupName} · {activeDelivery.pickupPhone}</p>}</div>
                <div><p className="text-[10px] text-black/30 font-bold uppercase tracking-wider mb-1">Доставить</p><p className="text-[13px] font-bold">{activeDelivery.dropoffAddress}</p><p className="text-[11px] text-black/45">{activeDelivery.dropoffName} · <a href={"tel:"+activeDelivery.dropoffPhone} className="text-[#1a472a]">{activeDelivery.dropoffPhone}</a></p></div>
                {activeDelivery.description&&<p className="text-[11px] text-black/40 bg-black/4 px-3 py-2 rounded-lg">{activeDelivery.description}</p>}
              </div>
              <div className="px-4 pb-4">
                {activeDelivery.status==="ACCEPTED"&&(
                  <button onClick={()=>act(()=>courierDeliveryPickedUp(activeDelivery.id))} disabled={isPending} className="w-full py-3 bg-amber-500 text-white text-[14px] font-black rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                    {isPending?<Loader2 size={15} className="animate-spin"/>:<Package size={16}/>}Забрал посылку
                  </button>
                )}
                {activeDelivery.status==="PICKED_UP"&&(
                  <button onClick={()=>act(()=>courierDeliveryDone(activeDelivery.id))} disabled={isPending} className="w-full py-3 bg-green-600 text-white text-[14px] font-black rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                    {isPending?<Loader2 size={15} className="animate-spin"/>:<CheckCircle size={16}/>}Доставил
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Available orders */}
        {!hasActive && online && (availableOrders.length > 0 || availableDeliveries.length > 0) && (
          <div className="space-y-4">
            {availableOrders.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-black/30 mb-2.5">Доступные заказы ({availableOrders.length})</p>
                <div className="space-y-3">
                  {availableOrders.map((order:any) => (
                    <div key={order.id} className="bg-white rounded-2xl border border-black/5 overflow-hidden hover:shadow-md transition-shadow">
                      <div className="px-4 py-3 border-b border-black/5 flex justify-between"><span className="text-[13px] font-black font-mono">{order.orderNumber}</span><span className="text-[13px] font-black text-[#1a472a]">{formatTJS(Number(order.totalAmount))}</span></div>
                      <div className="px-4 py-3 space-y-1.5 border-b border-black/5 text-[12px]">
                        <div className="flex items-center gap-2"><Store size={12} className="text-black/30"/><span className="font-semibold">{order.store.name}</span><span className="text-black/35">— {order.store.address}</span></div>
                        <div className="flex items-center gap-2"><MapPin size={12} className="text-black/30"/><span className="text-black/60 truncate">{order.deliveryAddress}</span></div>
                        <p className="text-black/40">{order.items.map((i:any)=>`${i.productName}×${Number(i.quantity)}`).join(", ")}</p>
                      </div>
                      <div className="px-4 py-3"><button onClick={()=>act(()=>courierAcceptOrder(order.id))} disabled={isPending} className="w-full py-2.5 bg-[#1a472a] text-white text-[13px] font-black rounded-xl hover:bg-[#0d2e1a] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">{isPending?<Loader2 size={13} className="animate-spin"/>:<Truck size={14}/>}Принять доставку</button></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {availableDeliveries.length > 0 && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-black/30 mb-2.5">Посылки ({availableDeliveries.length})</p>
                <div className="space-y-3">
                  {availableDeliveries.map((d:any) => (
                    <div key={d.id} className="bg-white rounded-2xl border border-black/5 overflow-hidden">
                      <div className="px-4 py-3 border-b border-black/5 flex justify-between"><span className="text-[13px] font-black font-mono">{d.deliveryNumber}</span><span className="text-[13px] font-black text-amber-700">{formatTJS(Number(d.price))}</span></div>
                      <div className="px-4 py-3 space-y-1 border-b border-black/5 text-[12px]">
                        <p><span className="text-black/40">Откуда:</span> <strong>{d.pickupAddress}</strong></p>
                        <p><span className="text-black/40">Куда:</span> <strong>{d.dropoffAddress}</strong></p>
                        <p className="text-black/40">{d.dropoffName} · {d.dropoffPhone}</p>
                        {d.description&&<p className="text-black/40 italic">{d.description}</p>}
                        {d.isFragile&&<p className="text-amber-700 font-bold">⚠️ Хрупкая</p>}
                      </div>
                      <div className="px-4 py-3"><button onClick={()=>act(()=>courierAcceptDelivery(d.id))} disabled={isPending} className="w-full py-2.5 bg-amber-600 text-white text-[13px] font-black rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">{isPending?<Loader2 size={13} className="animate-spin"/>:<Package size={14}/>}Принять посылку</button></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!hasActive && online && availableOrders.length===0 && availableDeliveries.length===0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-black/5 rounded-3xl flex items-center justify-center mx-auto mb-4"><Truck size={28} className="text-black/20"/></div>
            <p className="text-[15px] font-semibold text-black/30">Нет доступных заказов</p>
            <p className="text-[13px] text-black/20 mt-1">Страница обновляется каждые 15 сек</p>
          </div>
        )}
        {!online && <div className="text-center py-12"><p className="text-[15px] text-black/30">Вы оффлайн</p><p className="text-[13px] text-black/20 mt-1">Включите переключатель чтобы начать</p></div>}
      </div>
    </div>
  );
}
