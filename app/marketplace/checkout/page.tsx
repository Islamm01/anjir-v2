"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, MessageSquare, Loader2, Banknote, QrCode, Smartphone, CheckCircle } from "lucide-react";
import { useCart } from "@/lib/hooks/useCart";
import { placeOrder } from "@/lib/actions/orders";

type PM = "CASH"|"QR"|"TRANSFER";
const DELIVERY_FEE = 10;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, storeId, clearCart, mounted } = useCart();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState<PM>("CASH");
  const [tref, setTref] = useState("");

  const grand = total + DELIVERY_FEE;
  if (!mounted) return null;
  if (items.length === 0) { router.replace("/marketplace"); return null; }

  const opts: {key:PM;label:string;desc:string;icon:React.ReactNode}[] = [
    {key:"CASH",   label:"Наличные",  desc:"Оплата курьеру при доставке",                     icon:<Banknote size={20}/>},
    {key:"QR",     label:"QR-оплата", desc:"Курьер покажет QR — оплатите в банковском приложении", icon:<QrCode size={20}/>},
    {key:"TRANSFER",label:"Перевод",  desc:"Переведите на номер телефона — укажите номер заказа",  icon:<Smartphone size={20}/>},
  ];

  function submit(e:React.FormEvent) {
    e.preventDefault(); setError("");
    if (!address.trim()) { setError("Введите адрес доставки"); return; }
    if (!phone.trim())   { setError("Введите номер телефона"); return; }
    if (payment === "TRANSFER" && !tref.trim()) { setError("Введите референс перевода"); return; }
    startTransition(async () => {
      const result = await placeOrder({
        storeId: storeId!,
        items: items.map(i => ({ productId:i.productId, productName:i.productName, unitPrice:i.price, unit:i.unit, quantity:i.quantity, totalPrice:i.price*i.quantity })),
        subtotal: total, deliveryFee: DELIVERY_FEE,
        deliveryAddress: address.trim(), customerPhone: phone.trim(),
        notes: notes.trim()||undefined, paymentMethod: payment,
        paymentRef: payment === "TRANSFER" ? tref.trim() : undefined,
      });
      if (result.error) { setError(result.error); return; }
      clearCart();
      router.push(`/marketplace/orders/${result.orderNumber}`);
    });
  }

  return (
    <div className="min-h-screen bg-[#f7f5f0]">
      <header className="bg-white border-b border-black/5 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3.5 flex items-center gap-3">
          <Link href="/marketplace/cart" className="w-8 h-8 bg-black/5 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors"><ArrowLeft size={16}/></Link>
          <h1 className="text-[16px] font-black flex-1">Оформление заказа</h1>
        </div>
      </header>

      <form onSubmit={submit} className="max-w-md mx-auto px-4 py-5 space-y-4">
        <div className="bg-white rounded-2xl border border-black/5 px-4 py-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-black/30 mb-3">Ваш заказ</p>
          <div className="space-y-1.5">
            {items.map(item => (<div key={item.productId} className="flex justify-between text-[13px]"><span className="text-black/60 truncate flex-1">{item.productName} × {item.quantity}</span><span className="font-semibold ml-3 shrink-0">{(item.price*item.quantity).toFixed(2)} сом.</span></div>))}
          </div>
          <div className="mt-3 pt-3 border-t border-black/8 space-y-1">
            <div className="flex justify-between text-[12px] text-black/45"><span>Доставка</span><span>{DELIVERY_FEE} сом.</span></div>
            <div className="flex justify-between text-[15px] font-black"><span>Итого</span><span className="text-[#1a472a]">{grand.toFixed(2)} сом.</span></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
          <div className="px-4 py-3 border-b border-black/5"><p className="text-[11px] font-bold uppercase tracking-widest text-black/30">Детали доставки</p></div>
          <div className="divide-y divide-black/5">
            <div className="px-4 py-3.5 flex items-start gap-3"><MapPin size={15} className="text-black/30 mt-0.5 shrink-0"/>
              <div className="flex-1"><label className="text-[10px] font-bold text-black/40 uppercase tracking-wider block mb-1">Адрес доставки *</label>
                <input type="text" value={address} onChange={e=>setAddress(e.target.value)} placeholder="ул. Айни, д. 45, кв. 12" className="w-full text-[14px] text-black placeholder:text-black/25 bg-transparent outline-none"/></div>
            </div>
            <div className="px-4 py-3.5 flex items-start gap-3"><Phone size={15} className="text-black/30 mt-0.5 shrink-0"/>
              <div className="flex-1"><label className="text-[10px] font-bold text-black/40 uppercase tracking-wider block mb-1">Телефон *</label>
                <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+992 93 123 45 67" className="w-full text-[14px] text-black placeholder:text-black/25 bg-transparent outline-none"/></div>
            </div>
            <div className="px-4 py-3.5 flex items-start gap-3"><MessageSquare size={15} className="text-black/30 mt-0.5 shrink-0"/>
              <div className="flex-1"><label className="text-[10px] font-bold text-black/40 uppercase tracking-wider block mb-1">Комментарий <span className="normal-case font-normal">(необязательно)</span></label>
                <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Позвоните за 10 минут..." rows={2} className="w-full text-[14px] text-black placeholder:text-black/25 bg-transparent outline-none resize-none"/></div>
            </div>
          </div>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-black/30 mb-2.5 px-1">Способ оплаты</p>
          <div className="space-y-2">
            {opts.map(opt => (
              <button key={opt.key} type="button" onClick={() => setPayment(opt.key)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all text-left ${payment===opt.key ? "bg-[#1a472a]/5 border-[#1a472a]/40 ring-1 ring-[#1a472a]/20" : "bg-white border-black/8 hover:border-black/20"}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${payment===opt.key ? "bg-[#1a472a] text-white" : "bg-black/5 text-black/40"}`}>{opt.icon}</div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[14px] font-bold ${payment===opt.key ? "text-[#1a472a]" : "text-black"}`}>{opt.label}</p>
                  <p className="text-[11px] text-black/40 mt-0.5 leading-tight">{opt.desc}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${payment===opt.key ? "border-[#1a472a] bg-[#1a472a]" : "border-black/20"}`}>
                  {payment===opt.key && <CheckCircle size={12} className="text-white"/>}
                </div>
              </button>
            ))}
          </div>
          {payment === "TRANSFER" && (
            <div className="mt-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5">
              <p className="text-[12px] font-bold text-amber-800 mb-1">Переведите {grand.toFixed(2)} сом. на номер +992 90 000 0000 (Anjir)</p>
              <input type="text" value={tref} onChange={e=>setTref(e.target.value)} placeholder="Номер транзакции или референс" className="w-full text-[13px] bg-white border border-amber-200 rounded-xl px-3 py-2 outline-none focus:border-amber-400 mt-2"/>
            </div>
          )}
          {payment === "QR" && (
            <div className="mt-3 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3.5">
              <p className="text-[12px] text-blue-700 leading-relaxed">Курьер покажет QR-код при доставке. Отсканируйте и оплатите <strong>{grand.toFixed(2)} сом.</strong></p>
            </div>
          )}
        </div>

        {error && <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-[13px] text-red-700">{error}</div>}

        <button type="submit" disabled={isPending} className="w-full py-4 bg-[#1a472a] text-white text-[15px] font-black rounded-2xl hover:bg-[#0d2e1a] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(26,71,42,0.25)]">
          {isPending && <Loader2 size={18} className="animate-spin"/>}
          {isPending ? "Размещаем заказ…" : `Заказать за ${grand.toFixed(2)} сом.`}
        </button>
      </form>
    </div>
  );
}
