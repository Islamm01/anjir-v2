"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, User, Phone, Package, AlertTriangle, Loader2, CheckCircle } from "lucide-react";
import { requestDelivery } from "@/lib/actions/deliveries";

type PM = "CASH"|"QR"|"TRANSFER";
const PRICE = 20;

export default function CourierServicePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [done, setDone]   = useState("");
  const [form, setForm]   = useState({ pickupAddress:"",pickupName:"",pickupPhone:"",dropoffAddress:"",dropoffName:"",dropoffPhone:"",description:"",isFragile:false,paymentMethod:"CASH" as PM });
  const s = (k:string,v:any) => setForm(f=>({...f,[k]:v}));

  function submit(e:React.FormEvent) {
    e.preventDefault(); setError("");
    if (!form.pickupAddress)  { setError("Введите адрес забора"); return; }
    if (!form.dropoffAddress) { setError("Введите адрес доставки"); return; }
    if (!form.dropoffName)    { setError("Введите имя получателя"); return; }
    if (!form.dropoffPhone)   { setError("Введите телефон получателя"); return; }
    startTransition(async () => {
      const r = await requestDelivery(form);
      if (r.error) { setError(r.error); return; }
      setDone(r.deliveryNumber!);
    });
  }

  if (done) return (
    <div className="min-h-screen bg-[#f7f5f0] flex flex-col items-center justify-center px-5 text-center">
      <div className="w-20 h-20 bg-[#854F0B] rounded-full flex items-center justify-center mx-auto mb-5"><CheckCircle size={36} className="text-white"/></div>
      <h1 className="text-[24px] font-black text-black mb-2">Заказ принят!</h1>
      <p className="text-[14px] text-black/50 mb-3">Курьер скоро примет вашу посылку</p>
      <div className="bg-white rounded-2xl border border-black/5 px-6 py-4 mb-6">
        <p className="text-[11px] text-black/30 uppercase tracking-widest mb-1">Номер заказа</p>
        <p className="text-[20px] font-black font-mono text-[#854F0B]">{done}</p>
      </div>
      <Link href="/" className="px-6 py-3 bg-[#854F0B] text-white text-[14px] font-bold rounded-full hover:bg-[#633806] transition-colors">На главную</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      <header className="bg-[#854F0B] text-white px-5 pt-12 pb-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/" className="w-8 h-8 bg-white/15 rounded-full flex items-center justify-center hover:bg-white/25 transition-colors"><ArrowLeft size={16}/></Link>
            <h1 className="text-[20px] font-black">Отправить посылку</h1>
          </div>
          <p className="text-[13px] text-white/60">Фиксированная цена {PRICE} сом. по Худжанду</p>
        </div>
      </header>

      <form onSubmit={submit} className="max-w-md mx-auto px-4 py-5 space-y-4">
        <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-black/5 bg-[#f7f5f0]">
            <div className="flex items-center gap-2"><div className="w-5 h-5 bg-[#1a472a] rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full"/></div><p className="text-[12px] font-black text-black/60 uppercase tracking-wider">Откуда забрать</p></div>
          </div>
          <div className="divide-y divide-black/5">
            <div className="px-4 py-3.5 flex items-start gap-2.5"><MapPin size={14} className="text-black/30 mt-0.5 shrink-0"/>
              <input type="text" value={form.pickupAddress} onChange={e=>s("pickupAddress",e.target.value)} placeholder="Адрес забора *" required className="flex-1 text-[14px] bg-transparent outline-none text-black placeholder:text-black/30"/></div>
            <div className="px-4 py-3.5 flex items-start gap-2.5"><User size={14} className="text-black/30 mt-0.5 shrink-0"/>
              <input type="text" value={form.pickupName} onChange={e=>s("pickupName",e.target.value)} placeholder="Имя отправителя (необязательно)" className="flex-1 text-[14px] bg-transparent outline-none text-black placeholder:text-black/30"/></div>
            <div className="px-4 py-3.5 flex items-start gap-2.5"><Phone size={14} className="text-black/30 mt-0.5 shrink-0"/>
              <input type="tel" value={form.pickupPhone} onChange={e=>s("pickupPhone",e.target.value)} placeholder="Телефон отправителя (необязательно)" className="flex-1 text-[14px] bg-transparent outline-none text-black placeholder:text-black/30"/></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-black/5 bg-[#f7f5f0]">
            <div className="flex items-center gap-2"><div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center"><MapPin size={10} className="text-white"/></div><p className="text-[12px] font-black text-black/60 uppercase tracking-wider">Куда доставить</p></div>
          </div>
          <div className="divide-y divide-black/5">
            <div className="px-4 py-3.5 flex items-start gap-2.5"><MapPin size={14} className="text-black/30 mt-0.5 shrink-0"/>
              <input type="text" value={form.dropoffAddress} onChange={e=>s("dropoffAddress",e.target.value)} placeholder="Адрес доставки *" required className="flex-1 text-[14px] bg-transparent outline-none text-black placeholder:text-black/30"/></div>
            <div className="px-4 py-3.5 flex items-start gap-2.5"><User size={14} className="text-black/30 mt-0.5 shrink-0"/>
              <input type="text" value={form.dropoffName} onChange={e=>s("dropoffName",e.target.value)} placeholder="Имя получателя *" required className="flex-1 text-[14px] bg-transparent outline-none text-black placeholder:text-black/30"/></div>
            <div className="px-4 py-3.5 flex items-start gap-2.5"><Phone size={14} className="text-black/30 mt-0.5 shrink-0"/>
              <input type="tel" value={form.dropoffPhone} onChange={e=>s("dropoffPhone",e.target.value)} placeholder="Телефон получателя *" required className="flex-1 text-[14px] bg-transparent outline-none text-black placeholder:text-black/30"/></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-black/5"><p className="text-[11px] font-bold uppercase tracking-widest text-black/30">О посылке</p></div>
          <div className="divide-y divide-black/5">
            <div className="px-4 py-3.5 flex items-start gap-2.5"><Package size={14} className="text-black/30 mt-0.5 shrink-0"/>
              <input type="text" value={form.description} onChange={e=>s("description",e.target.value)} placeholder="Что в посылке? (необязательно)" className="flex-1 text-[14px] bg-transparent outline-none text-black placeholder:text-black/30"/></div>
            <div className="px-4 py-3.5 flex items-center gap-2.5"><AlertTriangle size={14} className="text-black/30 shrink-0"/>
              <label className="flex items-center gap-2 cursor-pointer flex-1"><input type="checkbox" checked={form.isFragile} onChange={e=>s("isFragile",e.target.checked)} className="w-4 h-4 accent-[#854F0B]"/><span className="text-[14px] text-black">Хрупкая посылка</span></label></div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-widest text-black/30 px-1">Оплата ({PRICE} сом.)</p>
          {(["CASH","QR","TRANSFER"] as PM[]).map(m => (
            <button key={m} type="button" onClick={() => s("paymentMethod",m)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all ${form.paymentMethod===m ? "bg-[#854F0B]/5 border-[#854F0B]/40" : "bg-white border-black/8"}`}>
              <div className={`w-4 h-4 rounded-full border-2 ${form.paymentMethod===m ? "border-[#854F0B] bg-[#854F0B]" : "border-black/25"}`}/>
              <span className="text-[13px] font-semibold">{m==="CASH"?"Наличные курьеру":m==="QR"?"QR-оплата":"Перевод по номеру"}</span>
            </button>
          ))}
        </div>

        {error && <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-[13px] text-red-700">{error}</div>}

        <button type="submit" disabled={isPending} className="w-full py-4 bg-[#854F0B] text-white text-[15px] font-black rounded-2xl hover:bg-[#633806] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
          {isPending && <Loader2 size={18} className="animate-spin"/>}
          {isPending ? "Отправляем…" : `Заказать доставку за ${PRICE} сом.`}
        </button>
      </form>
    </div>
  );
}
