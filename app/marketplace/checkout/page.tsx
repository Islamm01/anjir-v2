// app/marketplace/checkout/page.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, MapPin, Phone, MessageSquare, Loader2,
  Banknote, QrCode, Smartphone, CheckCircle, Zap, User,
} from "lucide-react";
import { useCart }         from "@/lib/hooks/useCart";
import { placeOrder }      from "@/lib/actions/orders";
import { placeGuestOrder } from "@/lib/actions/orders";
import { useLang }         from "@/components/providers/LangProvider";
import { t, l }            from "@/lib/i18n";

type PM   = "CASH" | "QR" | "TRANSFER";
type Mode = "choose" | "guest" | "login";

const DELIVERY_FEE = 10;

export default function CheckoutPage() {
  const router                       = useRouter();
  const { lang }                     = useLang();
  const { items, total, storeId, clearCart, mounted } = useCart();
  const [mode, setMode]              = useState<Mode>("choose");
  const [isPending, startTransition] = useTransition();
  const [error, setError]            = useState("");

  // Guest form state
  const [gName,    setGName]    = useState("");
  const [gPhone,   setGPhone]   = useState("");
  const [gAddress, setGAddress] = useState("");
  const [gNotes,   setGNotes]   = useState("");
  const [payment,  setPayment]  = useState<PM>("CASH");
  const [tRef,     setTRef]     = useState("");

  const grand = total + DELIVERY_FEE;

  if (!mounted) return null;
  if (items.length === 0) { router.replace("/marketplace"); return null; }

  // ── Payment options ───────────────────────────────────────────────────────
  const payOpts: { key: PM; label: string; desc: string; icon: React.ReactNode }[] = [
    { key: "CASH",     icon: <Banknote size={20} />,   label: l(t.checkout.pay_cash, lang),     desc: l(t.checkout.pay_cash_desc, lang)     },
    { key: "QR",       icon: <QrCode size={20} />,     label: l(t.checkout.pay_qr, lang),       desc: l(t.checkout.pay_qr_desc, lang)       },
    { key: "TRANSFER", icon: <Smartphone size={20} />, label: l(t.checkout.pay_transfer, lang), desc: l(t.checkout.pay_transfer_desc, lang) },
  ];

  // ── Cart summary (shared) ─────────────────────────────────────────────────
  const CartSummary = () => (
    <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
      <div className="px-4 py-3 border-b border-black/5">
        <p className="text-[11px] font-bold uppercase tracking-widest text-black/30">
          {l(t.checkout.order_summary, lang)}
        </p>
      </div>
      <div className="px-4 py-3 space-y-1.5">
        {items.map(item => (
          <div key={item.productId} className="flex justify-between text-[13px]">
            <span className="text-black/60 truncate flex-1">{item.productName} × {item.quantity}</span>
            <span className="font-semibold ml-3 shrink-0">
              {(item.price * item.quantity).toFixed(2)} {l(t.common.som, lang)}
            </span>
          </div>
        ))}
      </div>
      <div className="px-4 py-3 bg-[#f7f5f0] border-t border-black/5 space-y-1">
        <div className="flex justify-between text-[12px] text-black/45">
          <span>{l(t.cart.delivery, lang)}</span>
          <span>{DELIVERY_FEE} {l(t.common.som, lang)}</span>
        </div>
        <div className="flex justify-between text-[15px] font-black">
          <span>{l(t.checkout.total_label, lang)}</span>
          <span className="text-[#1a472a]">{grand.toFixed(2)} {l(t.common.som, lang)}</span>
        </div>
      </div>
    </div>
  );

  // ── Payment selector (shared) ─────────────────────────────────────────────
  const PaymentSelector = () => (
    <div className="space-y-2">
      <p className="text-[11px] font-bold uppercase tracking-widest text-black/30 px-1">
        {l(t.checkout.payment, lang)}
      </p>
      {payOpts.map(opt => (
        <button key={opt.key} type="button" onClick={() => setPayment(opt.key)}
          className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-left transition-all ${
            payment === opt.key
              ? "bg-[#1a472a]/5 border-[#1a472a]/40 ring-1 ring-[#1a472a]/20"
              : "bg-white border-black/8 hover:border-black/20"
          }`}>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            payment === opt.key ? "bg-[#1a472a] text-white" : "bg-black/5 text-black/40"
          }`}>{opt.icon}</div>
          <div className="flex-1 min-w-0">
            <p className={`text-[14px] font-bold ${payment === opt.key ? "text-[#1a472a]" : "text-black"}`}>
              {opt.label}
            </p>
            <p className="text-[11px] text-black/40 mt-0.5 leading-tight">{opt.desc}</p>
          </div>
          <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
            payment === opt.key ? "border-[#1a472a] bg-[#1a472a]" : "border-black/20"
          }`}>
            {payment === opt.key && <CheckCircle size={12} className="text-white" />}
          </div>
        </button>
      ))}
      {payment === "TRANSFER" && (
        <div className="mt-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3.5">
          <p className="text-[12px] font-bold text-amber-800 mb-2">
            {lang === "tj"
              ? `${grand.toFixed(2)} сом. рақами +992 90 000 0000 ба Anjir тарҳвиз кунед`
              : `Переведите ${grand.toFixed(2)} сом. на +992 90 000 0000 (Anjir)`}
          </p>
          <input type="text" value={tRef} onChange={e => setTRef(e.target.value)}
            placeholder={l(t.checkout.transfer_ref, lang)}
            className="w-full text-[13px] bg-white border border-amber-200 rounded-xl px-3 py-2 outline-none focus:border-amber-400" />
        </div>
      )}
      {payment === "QR" && (
        <div className="mt-2 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
          <p className="text-[12px] text-blue-700 leading-relaxed">
            {lang === "tj"
              ? `Курьер QR нишон медиҳад. ${grand.toFixed(2)} сом. тавассути барномаи бонкӣ пардохт кунед.`
              : `Курьер покажет QR-код при доставке. Оплатите ${grand.toFixed(2)} сом. в банковском приложении.`}
          </p>
        </div>
      )}
    </div>
  );

  // ── STEP 1: Choose mode ───────────────────────────────────────────────────
  if (mode === "choose") return (
    <div className="min-h-screen bg-[#f7f5f0]">
      <header className="bg-white border-b border-black/5 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3.5 flex items-center gap-3">
          <Link href="/marketplace/cart"
            className="w-8 h-8 bg-black/5 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <h1 className="text-[16px] font-black flex-1">{l(t.checkout.title, lang)}</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-5 space-y-4">
        <CartSummary />

        <div className="space-y-3 pt-2">
          {/* Quick order — recommended */}
          <button onClick={() => setMode("guest")}
            className="w-full bg-[#1a472a] rounded-2xl p-5 text-left hover:bg-[#0d2e1a] transition-colors group">
            <div className="flex items-start justify-between mb-2">
              <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                <Zap size={20} className="text-white" />
              </div>
              <span className="text-[10px] font-black bg-white/20 text-white px-2 py-1 rounded-full uppercase tracking-wider">
                {l(t.checkout.recommended, lang)}
              </span>
            </div>
            <h3 className="text-[17px] font-black text-white mb-1">{l(t.checkout.quick_title, lang)}</h3>
            <p className="text-[12px] text-white/60">{l(t.checkout.quick_desc, lang)}</p>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-black/10" />
            <span className="text-[12px] text-black/30">{l(t.checkout.or, lang)}</span>
            <div className="flex-1 h-px bg-black/10" />
          </div>

          {/* Login option */}
          <button onClick={() => router.push("/auth")}
            className="w-full bg-white rounded-2xl p-5 text-left border border-black/8 hover:border-black/20 hover:shadow-sm transition-all">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-black/5 rounded-xl flex items-center justify-center shrink-0">
                <User size={20} className="text-black/50" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-black mb-1">{l(t.checkout.login_title, lang)}</h3>
                <p className="text-[12px] text-black/45">{l(t.checkout.login_desc, lang)}</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  // ── STEP 2: Guest form ────────────────────────────────────────────────────
  if (mode === "guest") {
    function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      setError("");
      if (!gName.trim())    { setError(l(t.checkout.err_name,    lang)); return; }
      if (!gPhone.trim())   { setError(l(t.checkout.err_phone,   lang)); return; }
      if (!gAddress.trim()) { setError(l(t.checkout.err_address, lang)); return; }
      if (payment === "TRANSFER" && !tRef.trim()) {
        setError(l(t.checkout.err_ref, lang)); return;
      }
      startTransition(async () => {
        const result = await placeGuestOrder({
          customerName:    gName.trim(),
          customerPhone:   gPhone.trim(),
          deliveryAddress: gAddress.trim(),
          notes:           gNotes.trim() || undefined,
          storeId:         storeId!,
          items:           items.map(i => ({
            productId:   i.productId,
            productName: i.productName,
            unitPrice:   i.price,
            unit:        i.unit,
            quantity:    i.quantity,
            totalPrice:  i.price * i.quantity,
          })),
          subtotal:      total,
          deliveryFee:   DELIVERY_FEE,
          paymentMethod: payment,
          paymentRef:    payment === "TRANSFER" ? tRef.trim() : undefined,
        });
        if (result.error) { setError(result.error); return; }
        clearCart();
        router.push(`/order-success?number=${result.orderNumber}`);
      });
    }

    return (
      <div className="min-h-screen bg-[#f7f5f0]">
        <header className="bg-white border-b border-black/5 sticky top-0 z-10">
          <div className="max-w-md mx-auto px-4 py-3.5 flex items-center gap-3">
            <button onClick={() => setMode("choose")}
              className="w-8 h-8 bg-black/5 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors">
              <ArrowLeft size={16} />
            </button>
            <h1 className="text-[16px] font-black flex-1">{l(t.checkout.quick_title, lang)}</h1>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto px-4 py-5 space-y-4">
          <CartSummary />

          {/* Guest contact fields */}
          <div className="bg-white rounded-2xl border border-black/5 overflow-hidden divide-y divide-black/5">
            {[
              { icon: <User size={15} className="text-black/30 mt-0.5 shrink-0" />,
                label: l(t.checkout.name, lang), required: true,
                value: gName, onChange: setGName, type: "text", placeholder: "Акбар Рахимов" },
              { icon: <Phone size={15} className="text-black/30 mt-0.5 shrink-0" />,
                label: l(t.checkout.phone, lang), required: true,
                value: gPhone, onChange: setGPhone, type: "tel", placeholder: "+992 93 123 45 67" },
              { icon: <MapPin size={15} className="text-black/30 mt-0.5 shrink-0" />,
                label: l(t.checkout.address, lang), required: true,
                value: gAddress, onChange: setGAddress, type: "text", placeholder: "ул. Айни, д. 45" },
            ].map(field => (
              <div key={field.label} className="px-4 py-3.5 flex items-start gap-3">
                {field.icon}
                <div className="flex-1">
                  <label className="text-[10px] font-bold text-black/40 uppercase tracking-wider block mb-1">
                    {field.label} {field.required && <span className="text-red-400">*</span>}
                  </label>
                  <input type={field.type} value={field.value}
                    onChange={e => field.onChange(e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full text-[14px] text-black placeholder:text-black/25 bg-transparent outline-none" />
                </div>
              </div>
            ))}
            <div className="px-4 py-3.5 flex items-start gap-3">
              <MessageSquare size={15} className="text-black/30 mt-0.5 shrink-0" />
              <div className="flex-1">
                <label className="text-[10px] font-bold text-black/40 uppercase tracking-wider block mb-1">
                  {l(t.checkout.comment, lang)}{" "}
                  <span className="normal-case text-[10px] font-normal">({l(t.checkout.optional, lang)})</span>
                </label>
                <textarea value={gNotes} onChange={e => setGNotes(e.target.value)}
                  placeholder={l(t.checkout.comment_ph, lang)} rows={2}
                  className="w-full text-[14px] text-black placeholder:text-black/25 bg-transparent outline-none resize-none" />
              </div>
            </div>
          </div>

          <PaymentSelector />

          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-[13px] text-red-700">
              {error}
            </div>
          )}

          <button type="submit" disabled={isPending}
            className="w-full py-4 bg-[#1a472a] text-white text-[15px] font-black rounded-2xl hover:bg-[#0d2e1a] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(26,71,42,0.25)]">
            {isPending && <Loader2 size={18} className="animate-spin" />}
            {isPending ? l(t.checkout.submitting, lang) : `${l(t.checkout.submit, lang)} — ${grand.toFixed(2)} ${l(t.common.som, lang)}`}
          </button>
        </form>
      </div>
    );
  }

  return null;
}