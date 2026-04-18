"use client";
import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw, Volume2, VolumeX, CheckCircle, XCircle, Package, Truck } from "lucide-react";
import { storeConfirmOrder, storeRejectOrder, storeMarkPreparing, storeMarkReady } from "@/lib/actions/orders";
import { formatTJS, PAYMENT_METHOD_LABEL } from "@/lib/utils";

const COLS = [
  {key:"NEW_ORDER",       label:"Новые",           bg:"bg-amber-50",  ring:"ring-amber-200", text:"text-amber-800",  dot:"bg-amber-500",   pulse:true},
  {key:"STORE_CONFIRMED", label:"Принятые",         bg:"bg-blue-50",   ring:"ring-blue-200",  text:"text-blue-800",   dot:"bg-blue-500",    pulse:false},
  {key:"PREPARING",       label:"Готовятся",        bg:"bg-violet-50", ring:"ring-violet-200",text:"text-violet-800", dot:"bg-violet-500",  pulse:false},
  {key:"READY_FOR_PICKUP",label:"Готовы к выдаче",  bg:"bg-green-50",  ring:"ring-green-200", text:"text-green-800",  dot:"bg-green-500",   pulse:false},
];

export default function StoreOrderBoard({ orders: init, storeName, todayOrders, todayRevenue }: any) {
  const router = useRouter();
  const [sound, setSound] = useState(true);
  const [rejectId, setRejectId] = useState<string|null>(null);
  const [reason, setReason]     = useState("");
  const [isPending, start]      = useTransition();
  const prevIds = useRef(new Set(init.map((o:any)=>o.id)));

  useEffect(() => { const t = setInterval(()=>router.refresh(),15000); return ()=>clearInterval(t); },[router]);

  function playAlert() {
    try {
      const ctx=new AudioContext(), osc=ctx.createOscillator(), g=ctx.createGain();
      osc.connect(g); g.connect(ctx.destination);
      osc.frequency.setValueAtTime(880,ctx.currentTime); osc.frequency.setValueAtTime(1100,ctx.currentTime+0.1);
      g.gain.setValueAtTime(0.25,ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.5);
      osc.start(); osc.stop(ctx.currentTime+0.5);
    } catch {}
  }

  useEffect(()=>{
    const newIds = init.map((o:any)=>o.id);
    if(sound && newIds.some((id:string)=>!prevIds.current.has(id))) playAlert();
    prevIds.current = new Set(newIds);
  },[init,sound]);

  function act(fn:()=>Promise<any>) {
    start(async()=>{ const r=await fn(); if(r?.error) alert(r.error); else router.refresh(); });
  }

  const by = (k:string) => init.filter((o:any)=>o.status===k);

  return (
    <div className="min-h-screen bg-[#f4f2ed]">
      <header className="bg-[#1a472a] text-white px-5 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div><h1 className="text-[18px] font-black">{storeName}</h1><p className="text-[12px] text-white/50">Панель магазина</p></div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4 text-[12px] text-white/60 mr-2">
              <span><strong className="text-white">{todayOrders}</strong> заказов сегодня</span>
              <span><strong className="text-white">{formatTJS(todayRevenue)}</strong></span>
            </div>
            <button onClick={()=>setSound(s=>!s)} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
              {sound ? <Volume2 size={15}/> : <VolumeX size={15}/>}
            </button>
            <button onClick={()=>router.refresh()} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
              <RefreshCw size={15} className={isPending?"animate-spin":""}/>
            </button>
          </div>
        </div>
      </header>

      {rejectId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm">
            <h3 className="text-[16px] font-black mb-3">Причина отклонения</h3>
            <textarea value={reason} onChange={e=>setReason(e.target.value)} placeholder="Нет товара, закрыто..." rows={3} className="w-full border border-black/15 rounded-xl px-3 py-2.5 text-[14px] outline-none resize-none mb-4"/>
            <div className="flex gap-2">
              <button onClick={()=>{setRejectId(null);setReason("");}} className="flex-1 py-2.5 border border-black/15 rounded-xl text-[13px] hover:bg-black/4 transition-colors">Отмена</button>
              <button onClick={()=>{act(()=>storeRejectOrder(rejectId,reason));setRejectId(null);}} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-[13px] font-black hover:bg-red-700 transition-colors">Отклонить</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-5">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {COLS.map(col => {
            const orders = by(col.key);
            return (
              <div key={col.key}>
                <div className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border mb-3 ${col.bg} ring-1 ${col.ring}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${col.dot} ${col.pulse&&orders.length>0?"animate-pulse":""}`}/>
                    <span className={`text-[13px] font-black ${col.text}`}>{col.label}</span>
                  </div>
                  <span className={`text-[13px] font-black ${col.text}`}>{orders.length}</span>
                </div>
                <div className="space-y-3">
                  {orders.map((order:any) => {
                    const elapsed = Math.floor((Date.now()-new Date(order.createdAt).getTime())/60000);
                    const urgent  = elapsed>10 && order.status==="NEW_ORDER";
                    return (
                      <div key={order.id} className={`bg-white rounded-2xl border overflow-hidden hover:shadow-md transition-shadow ${urgent?"border-amber-300 ring-2 ring-amber-100":"border-black/5"}`}>
                        <div className="flex items-center justify-between px-4 py-3 border-b border-black/5">
                          <span className="text-[13px] font-black font-mono">{order.orderNumber}</span>
                          <span className={`text-[11px] font-bold ${urgent?"text-amber-600":"text-black/35"}`}>{elapsed} мин</span>
                        </div>
                        <div className="px-4 py-3 border-b border-black/5 space-y-0.5">
                          {order.items.map((item:any)=>(<div key={item.id} className="flex justify-between text-[12px]"><span className="text-black/60 truncate flex-1">{item.productName}</span><span className="text-black/40 ml-2 shrink-0">×{Number(item.quantity)}{item.unit}</span></div>))}
                        </div>
                        <div className="px-4 py-3 space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-[15px] font-black text-[#1a472a]">{formatTJS(Number(order.totalAmount))}</span>
                            <span className="text-[10px] font-bold bg-black/5 text-black/50 px-2 py-0.5 rounded-full">{(PAYMENT_METHOD_LABEL as any)[order.paymentMethod]}</span>
                          </div>
                          <p className="text-[11px] text-black/40 truncate">{order.deliveryAddress}</p>
                          {order.notes&&<p className="text-[11px] text-amber-700 bg-amber-50 px-2 py-1 rounded-lg truncate">💬 {order.notes}</p>}
                        </div>
                        <div className="px-3 pb-3 flex gap-2">
                          {order.status==="NEW_ORDER"&&(<>
                            <button onClick={()=>{setRejectId(order.id);setReason("");}} disabled={isPending} className="flex-1 py-2 border border-red-200 text-red-600 text-[12px] font-bold rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50">Отклонить</button>
                            <button onClick={()=>act(()=>storeConfirmOrder(order.id))} disabled={isPending} className="flex-1 py-2 bg-[#1a472a] text-white text-[12px] font-black rounded-xl hover:bg-[#0d2e1a] transition-colors disabled:opacity-50 flex items-center justify-center gap-1">
                              {isPending?<Loader2 size={11} className="animate-spin"/>:<CheckCircle size={12}/>}Принять
                            </button>
                          </>)}
                          {order.status==="STORE_CONFIRMED"&&(
                            <button onClick={()=>act(()=>storeMarkPreparing(order.id))} disabled={isPending} className="flex-1 py-2 bg-blue-600 text-white text-[12px] font-black rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1">
                              {isPending?<Loader2 size={11} className="animate-spin"/>:<Package size={12}/>}Начать сборку
                            </button>
                          )}
                          {order.status==="PREPARING"&&(
                            <button onClick={()=>act(()=>storeMarkReady(order.id))} disabled={isPending} className="flex-1 py-2 bg-orange-500 text-white text-[12px] font-black rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1">
                              {isPending?<Loader2 size={11} className="animate-spin"/>:<Truck size={12}/>}Готов к выдаче
                            </button>
                          )}
                          {order.status==="READY_FOR_PICKUP"&&(
                            <div className="flex-1 py-2 text-center text-[11px] text-green-700 bg-green-50 rounded-xl font-semibold">Ждём курьера…</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {orders.length===0&&(<div className="bg-white/50 rounded-xl border border-dashed border-black/10 py-8 text-center"><p className="text-[12px] text-black/25">Пусто</p></div>)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
