import { notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getOrderDetail } from "@/lib/actions/orders";
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR, PAYMENT_METHOD_LABEL, formatTJS, formatTime } from "@/lib/utils";
import { CheckCircle, Clock, Package, Truck, MapPin, Phone, Store } from "lucide-react";
import { OrderItem, OrderStatusLog } from "@prisma/client";

export const dynamic = "force-dynamic";

const STEPS = ["NEW_ORDER","STORE_CONFIRMED","PREPARING","READY_FOR_PICKUP","COURIER_ASSIGNED","PICKED_UP","DELIVERED"];
const STEP_LABEL = ["Принят","Магазин принял","Готовится","Ждёт курьера","Курьер едет","Забрал","Доставлен"];

export default async function OrderPage({ params }: { params: { orderNumber: string } }) {
  const session = await getSession();
  if (!session) return notFound();
  const order = await getOrderDetail(params.orderNumber);
  if (!order) return notFound();

  const step = STEPS.indexOf(order.status);
  const done = ["DELIVERED","COMPLETED"].includes(order.status);
  const cancelled = ["CANCELLED","REJECTED"].includes(order.status);

  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      <div className={`${done ? "bg-[#1a472a]" : cancelled ? "bg-red-700" : "bg-[#1a472a]"} text-white px-5 pt-12 pb-8`}>
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-white/15 rounded-full flex items-center justify-center mx-auto mb-4">
            {done ? <CheckCircle size={32}/> : cancelled ? <span className="text-3xl font-black">✕</span> : <Clock size={32}/>}
          </div>
          <h1 className="text-[22px] font-black">{ORDER_STATUS_LABEL[order.status]}</h1>
          <p className="text-[13px] text-white/60 mt-1">{order.orderNumber}</p>
          {!cancelled && (
            <div className="mt-5 relative">
              <div className="flex justify-between mb-1.5">
                {STEPS.slice(0,7).map((_,i) => (
                  <div key={i} className={`w-2.5 h-2.5 rounded-full border-2 transition-all ${i<=step ? "bg-white border-white" : "bg-white/20 border-white/30"}`}/>
                ))}
              </div>
              <div className="h-1 bg-white/20 rounded-full -mt-2 relative">
                <div className="h-full bg-white rounded-full transition-all" style={{width:`${Math.max(0,Math.min(100,(step/6)*100))}%`}}/>
              </div>
              <div className="flex justify-between mt-1.5">
                {STEP_LABEL.map((l,i) => <span key={i} className={`text-[8px] ${i<=step?"text-white/80":"text-white/30"}`}>{l}</span>)}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-5 space-y-4">
        <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
          <div className="px-4 py-3.5 flex items-center gap-3 border-b border-black/5">
            <div className="w-10 h-10 bg-[#1a472a]/8 rounded-xl flex items-center justify-center"><Store size={18} className="text-[#1a472a]"/></div>
            <div className="flex-1"><p className="text-[13px] font-bold">{order.store.name}</p><p className="text-[11px] text-black/40">{order.store.address}</p></div>
            {order.store.phone && <a href={`tel:${order.store.phone}`} className="w-8 h-8 bg-[#1a472a]/8 rounded-full flex items-center justify-center"><Phone size={14} className="text-[#1a472a]"/></a>}
          </div>
          {order.courier && (
            <div className="px-4 py-3.5 flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center"><Truck size={18} className="text-amber-700"/></div>
              <div className="flex-1"><p className="text-[13px] font-bold">{order.courier.user.name ?? "Курьер"}</p><p className="text-[11px] text-black/40">Ваш курьер</p></div>
              {order.courier.user.phone && <a href={`tel:${order.courier.user.phone}`} className="w-8 h-8 bg-amber-50 rounded-full flex items-center justify-center"><Phone size={14} className="text-amber-700"/></a>}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-black/5 px-4 py-3.5">
          <div className="flex items-start gap-3"><MapPin size={16} className="text-black/30 mt-0.5 shrink-0"/><div><p className="text-[11px] font-bold text-black/30 uppercase tracking-wider mb-0.5">Адрес доставки</p><p className="text-[14px] font-semibold">{order.deliveryAddress}</p></div></div>
        </div>

        <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-black/5"><p className="text-[11px] font-bold uppercase tracking-widest text-black/30">Состав заказа</p></div>
          <div className="divide-y divide-black/5">
            {order.items.map((item: OrderItem) => (<div key={item.id} className="px-4 py-3 flex justify-between text-[13px]"><span className="text-black/70">{item.productName} × {Number(item.quantity)} {item.unit}</span><span className="font-semibold ml-3 shrink-0">{formatTJS(Number(item.totalPrice))}</span></div>))}
          </div>
          <div className="px-4 py-3 bg-[#f7f5f0] border-t border-black/5">
            <div className="flex justify-between text-[12px] text-black/45 mb-1"><span>Доставка</span><span>{formatTJS(Number(order.deliveryFee))}</span></div>
            <div className="flex justify-between text-[15px] font-black"><span>Итого</span><span className="text-[#1a472a]">{formatTJS(Number(order.totalAmount))}</span></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-black/5 px-4 py-3.5 flex justify-between items-center">
          <div><p className="text-[11px] font-bold text-black/30 uppercase tracking-wider mb-0.5">Оплата</p><p className="text-[13px] font-semibold">{PAYMENT_METHOD_LABEL[order.paymentMethod]}</p></div>
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${order.paymentStatus==="CONFIRMED"?"bg-green-50 text-green-800":"bg-amber-50 text-amber-800"}`}>{order.paymentStatus==="CONFIRMED"?"Оплачено":"Ожидает"}</span>
        </div>

        <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-black/5"><p className="text-[11px] font-bold uppercase tracking-widest text-black/30">История</p></div>
          <div className="divide-y divide-black/5">
            {order.statusLogs.map((log: OrderStatusLog, i: number) => (
              <div key={log.id} className="px-4 py-3 flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${i===order.statusLogs.length-1?"bg-[#1a472a]":"bg-black/15"}`}/>
                <div className="flex-1"><p className="text-[13px] font-semibold">{ORDER_STATUS_LABEL[log.status]??log.status}</p>{log.note&&<p className="text-[11px] text-black/40 mt-0.5">{log.note}</p>}</div>
                <p className="text-[11px] text-black/35 shrink-0">{formatTime(log.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>

        <Link href="/" className="block text-center text-[13px] text-[#1a472a] font-semibold py-3 hover:underline">На главную</Link>
      </div>
    </div>
  );
}
